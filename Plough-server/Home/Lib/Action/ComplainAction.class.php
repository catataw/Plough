<?php
class ComplainAction extends Action {
	

	/**
	 * 上传投诉资料
	 * @return json 成功:状态1 文件路径 失败:状态0 错误信息
	 */
	public function addComplainEvidence()
	{
		//防止乱码
		header('Content-Type:text/html;charset=utf8');
		$back_info = array();
		$logs = M ( 'logs_info' );
		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '上传投诉文件';
		$logs->add ( $logsData );
		if(IS_POST) {
			if (empty($_FILES)) {
				
				//文件上传为空 返回false
				$back_info['status'] = 0;
				$back_info['error_msg'] = '文件上传为空';
				echo json_encode($back_info);
			} else {
				import('ORG.Net.UploadFile');
				$upload = new UploadFile();
				$upload->maxSize = 10485760;
				//设置上传的子路径
				$base_path = C('ROOT_PATH') . 'Public/Uploads/';
				$first_child_path = date('Y', time()) . '/';
				$second_child_path = date('m', time()) . '/';
				$last_child_path = time() . '/';
				
				
				$savePath = $base_path . $first_child_path . $second_child_path . $last_child_path;
				//                $upload->uploadReplace = true; //同名覆盖
				//                $upload->saveRule = '';
				if (!is_dir($savePath)) {
					mkdir($savePath, 755, true);
				}
				$upload->savePath = $savePath;
	
				if (!$upload->upload()) {
					// 上传错误提示错误信息
					$error_msg = $this->error($upload->getErrorMsg());
					$back_info['status'] = 0;
					$back_info['error_msg'] = $error_msg;
					echo json_encode($back_info);
				} else {
					// 上传成功 获取上传文件信息(单文件上传)
					$info = $upload->getUploadFileInfo();
					$info = $info[0];
					
					//返回路径
					$path = $info['savepath'] . $info['savename'];
					$back_info['status'] = 1;
					$back_info['path'] = $path;
					//将对应信息存入 对照表中
					echo json_encode($back_info);
				}
			}
		}else
		{
			$back_info['status'] = 0;
			$back_info['error_msg'] = '上传方式不正确,请联系开发人员';
			echo json_encode($back_info);
		}
	}
	

    /**
     * 下载投诉的文件
     * @return string 如果文件不存在 返回错误状态0
     */
    public function getComplainMsg()
    {
        if($_GET) {
        	$file_path = $_GET['urlPath'];
            $file_path = C('ROOT_PATH') . $file_path;
            $file_arr = explode('/',$file_path);
            $count_num = count($file_arr);
            $filename = $file_arr[$count_num - 1];
            if (file_exists($file_path)) {
                $file = fopen($file_path, "r");
                header('Content-Type: application/octet-stream;charset=utf-8;');
                header('Content-Disposition: attachment; filename=' . $filename);
                header ( 'Content-Transfer-Encoding: bytes' );
                header('Expires: 0');
                header('Cache-Control: must-revalidate, post-check=0,pre-check=0');
                header("Cache-Control: public");
                header('Pragma: public');
                header('Content-Length: ' . filesize($file_path));
                $buffer=1024;
                while(!feof($file)){
                    $file_data=fread($file,$buffer);
                    echo $file_data; }
                fclose($file);
                $logs = M ( 'logs_info' );
                $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '下载投诉资料';
                $logs->add ( $logsData );
                exit;
            } else {
                $info = array('error_msg' => '该文件不存在!', 'status' => 0);
                echo json_encode($info);
                $logs = M ( 'logs_info' );
                $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '下载投诉资料';
                $logs->add ( $logsData );
                exit;

            }
        }
    }

    /**
     * 下载所有的投诉单
     */
    public function exportComplain() {
        $computer = M ( 'complain' );
        $data = $computer->field('projectId,projectName,complainant,complaintLevel,complaintWay,respondent,status,complainTime,complaintCompany,complaintContent,urlPath')->select();
        $xlsName = '投诉总单';
        $xlsCell = array (
            array (
                'projectId',
                '项目编号'
            ),
            array (
                'projectName',
                '项目名称'
            ),
            array (
                'complainant',
                '投诉人'
            ),
            array (
                'complaintLevel',
                '投诉级别'
            ),
            array (
                'complaintWay',
                '投诉方式'
            ),
            array (
                'respondent',
                '反馈人'
            ),
            array (
                'status',
                '状态'
            ),
            array (
                'complainTime',
                '投诉时间'
            ),
            array (
                'complaintCompany',
                '投诉公司'
            ),
            array (
                'complaintContent',
                '投诉内容'
            ),
            array (
                'urlPath',
                '链接地址'
            ),
        );
        $logs = M ( 'logs_info' );
        $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '下载投诉总单';
        $logs->add ( $logsData );
        exportExcel ( $xlsName, $xlsCell, $data );
    }
    
	/*
	 * 获取所有投诉
	 * 
	 */
	
	public function getAllComplain(){
		$complain = M ( 'complain' );
		$result = $complain->query ( 'SELECT * FROM pmo_complain where isDelete=1');
		foreach ($result as $k=>$v){
			$result[$k]['urlPath'] = 'Complain/getComplainMsg?urlPath='.$v['urlPath'];
		}
		echo json_encode ( $result );
		exit ();
	}
	
	/*
	 * 添加投诉信息
	 */
	public function addComplain(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$complain = M ( 'complain' );
		$record = $complain->where ( 'complaintContent="' . $data ['complaintContent'] . '"' )->find ();
		if (! $record) {
			$res = $complain->add ( $data );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加' . $data ['projectName'].'投诉';
			$logs->add ( $logsData );
			echo $res;
			exit ();
		} else {
			exit ();
		}
	}
	
	/*
	 * 编辑投诉
	 * 
	 */
	public function editComplain(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		if ($data ['id'] != '') {
			$computer = M ( 'complain' );
			$result = $computer->where ( 'id=' . $data ['id'] )->save ( $data );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '修改投诉' . $data ['complaintContent'];
			$logs->add ( $logsData );
			echo $result;
			exit ();
		}
		
	}
	
	/*
	 * 删除投诉
	 */
	public function deleteComplain(){
	    $postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		if ($data ['id'] != '') {
			$computer = M ( "complain" ); // 实例化User对象
			$data['isDelete'] = 2;
			$result = $computer->where ( 'id=' . $data ['id'] )->save ($data);
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '删除投诉' . $data ['id'];
			$logs->add ( $logsData );
			echo $result;
			exit ();
		}
	}
}