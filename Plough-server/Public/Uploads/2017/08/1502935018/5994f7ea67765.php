<?php
class ComplainAction extends Action {
	
	public function addComplainEvidence() {

			// 上传文件
			$uploadPath = './Public/upload/';
			$file_name = $_FILES ["file"] ["name"];
			$file_info = explode ( '.', $file_name );
			$exts = $file_info [1];
			$move_file_name = $uploadPath . time () . '.' . $exts;
			move_uploaded_file ( $_FILES ["file"] ["tmp_name"], $move_file_name );
			var_dump($move_file_name);	
			exit;
		
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '批量上传了excl'.$move_file_name;
			$logs->add ( $logsData );

			exit ();
	}

    /**
     * 上传投诉资料
     * @return json 成功:状态1 文件路径 失败:状态0 错误信息
     */
    public function defineUpload()
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
                return json_encode($back_info);
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
                    return json_encode($back_info);
                } else {
                    // 上传成功 获取上传文件信息(单文件上传)
                    $info = $upload->getUploadFileInfo();
                    $info = $info[0];
                    //返回路径
                    $path = $info['savepath'] . $info['savename'];
                    $back_info['status'] = 1;
                    $back_info['path'] = $path;
                    //将对应信息存入 对照表中
                    return json_encode($back_info);
                }
            }
        }else
        {
            $back_info['status'] = 0;
            $back_info['error_msg'] = '上传方式不正确,请联系开发人员';
            return json_encode($back_info);
        }
    }

    /**
     * 下载投诉的文件
     * @return string 如果文件不存在 返回错误状态0
     */
    public function getComplainMsg()
    {
        $logs = M ( 'logs_info' );
        $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '下载投诉资料';
        $logs->add ( $logsData );
        if(IS_POST) {
            $file_path = $this->_param('file_path');
            $file_path = C('ROOT_PATH') . $file_path;
            $file_arr = explode('/',$file_path);
            $count_num = count($file_arr);
            $filename = $file_arr[$count_num - 1];
//            var_dump($filename);exit;
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
                exit;
            } else {
                $info = array('error_msg' => '该文件不存在!', 'status' => 0);
                return json_encode($info);
            }
        }else
        {
            $this->display();
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
        $this->exportExcel ( $xlsName, $xlsCell, $data );
    }

    /**
     * 定制投诉单excel表格
     * @param $expTitle
     * @param $expCellName
     * @param $expTableData
     */
    public function exportExcel($expTitle, $expCellName, $expTableData) {
        import ( "ORG.Util.PHPExcel" );
        $xlsTitle = iconv ( 'utf-8', 'gb2312', $expTitle ); // 文件名称

        $cellNum = count ( $expCellName );
        $dataNum = count ( $expTableData );
        $objPHPExcel = new PHPExcel ();
        $cellName = get_excel_cell();
        $objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
        $objPHPExcel->getActiveSheet ( 0 )->mergeCells ( 'A1:' . $cellName [$cellNum * 2 - 1] . '1' ); // 合并单元格
        $objPHPExcel->setActiveSheetIndex(0)->setCellValue('A1', $expTitle.' Export time:'.date('Y-m-d H:i:s'));
        //将所有的剩余单元格合并成两格
        $mergeNum = 2 * $cellNum;
        for($k = 2; $k <= $dataNum+2; ++$k)
        {
            for($j = 0; $j <= $mergeNum; $j++)
            {

                $str = $cellName[$j]. $k .':' . $cellName[$j+1] . $k;
                $objPHPExcel->getActiveSheet ( 0 )->mergeCells ( $str ); // 合并单元格
                $j++;
            }
        }
        //填字段
        for($i = 0; $i < $mergeNum; $i++) {
            $objPHPExcel->setActiveSheetIndex ( 0 )->setCellValue ( $cellName [$i] . '2', $expCellName [$i/2] [1] );
            $i++;
        }
        //填内容
        // Miscellaneous glyphs, UTF-8
        for($i = 0; $i < $dataNum; $i ++) {
            for($j = 0; $j < $mergeNum; $j++) {
                $objPHPExcel->getActiveSheet ( 0 )->setCellValue ( $cellName [$j] . ($i + 3), $expTableData [$i] [$expCellName [$j/2] [0]] );
                $j++;
            }
        }
        header ( 'pragma:public' );
        header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="' . $xlsTitle . '.xls"' );
        header ( 'Content-Disposition:attachment;filename="'. $xlsTitle .'.xls"' ); // attachment新窗口打印inline本窗口打印
        $objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
        $objWriter->save ( 'php://output' );
        exit ();
    }
}