<?php

class ProductAction extends Action {
	
	/**
	 * 获取涉及收入切分小组
	 */
	
	public function getAllTeam(){
		$result = M('product_team')
			  ->distinct(true)
			  ->field('team,bigTeam')
			  ->select();
		$this->ajaxReturn($result, '获取成功', 1);
	}
	
	/**
	 * 获取小组中产品
	 */
	public function getTeamProduct(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
	//	$data['team'] ='SE组';
		if($data['team']){
			$where['team'] = $data['team'];
			$result = M('product_team')
			   ->where($where)
			   ->select();
		}
		if($result){
			$this->ajaxReturn($result, '获取成功', 200);
		}else{
			$this->ajaxReturn(array(), '获取失败', 0);
		}
		
	}
	
	
	/**
	 * 导入产品和小组
	 */

	public function addUserExcl(){
		if (! empty ( $_FILES )) {
			import ( "ORG.Util.PHPExcel" );
			// 上传excl
			$uploadPath = './Public/upload/userInfo/';
			$file_name = $_FILES ["file"] ["name"];
			$file_info = explode ( '.', $file_name );
			$exts = $file_info [1];
			if(!is_dir($uploadPath)){
				mkdir($uploadPath,755,true);
			}
			$move_file_name = $uploadPath . time () . '.' . $exts;
			move_uploaded_file ( $_FILES ["file"] ["tmp_name"], $move_file_name );
			// 创建PHPExcel对象
			$PHPExcel = new PHPExcel ();
			// 如果excel文件后缀名为.xls，导入这个类
			if ($exts == 'xls') {
				import ( "ORG.Util.PHPExcel.Reader.Excel5" );
				$PHPReader = new \PHPExcel_Reader_Excel5 ();
			} else if ($exts == 'xlsx') {
				import ( "ORG.Util.PHPExcel.Reader.Excel2007" );
				$PHPReader = new \PHPExcel_Reader_Excel2007 ();
			} else {
				echo '9';
				exit ();
			}
			//var_dump($move_file_name);exit;
			// 载入文件
			$PHPExcel = $PHPReader->load ( $move_file_name );
			// 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
			$currentSheet = $PHPExcel->getSheet ( 0 );
			// 获取总列数
			$allColumn = $currentSheet->getHighestColumn ();
			// 获取总行数
			$allRow = $currentSheet->getHighestRow ();
			// 循环获取表中的数据，$currentRow表示当前行，从哪行开始读取数据，索引值从0开始
			for($currentRow = 2; $currentRow <= $allRow; $currentRow ++) {
				// 从哪列开始，A表示第一列
				for($currentColumn = 'A'; $currentColumn <= $allColumn; $currentColumn ++) {
					// 数据坐标
					$address = $currentColumn . $currentRow;
					// 读取到的数据，保存到数组$arr中
					$data [$currentRow] [$currentColumn] = $currentSheet->getCell ( $address )->getValue ();
				}
			}

			
			foreach ($data as $key=>$value){

				$project['projectId'] = $value['A'];
				$project['projectName'] = $value['B'];
				$project['shortName'] = $value['C'];
				$project['bigTeam'] = $value['D'];
				$project['team'] = $value['E'];

				
				M('product_team')->add($project);
			}
            
			$res = array('status'=>1,'info'=>'员工导入完成');
			echo json_encode($res);
			exit;
		}
	}
}