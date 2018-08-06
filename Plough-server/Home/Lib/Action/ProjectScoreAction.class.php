<?php
// 本类由系统自动生成，仅供测试用途
class ProjectScoreAction extends Action {
	
	/**
	 * 获取项目评分信息
	 */
	public function getAllProjectScores() {
		$score = M ( 'project_score' );
		$where ['isDelete'] = 1;
		$data = $score->where ( $where )->select ();
		echo json_encode ( $data );
		exit ();
	}
	
	/**
	 * 获取项目评分
	 */
	public function getProjectScore(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$projectId = $data['projectId'];
		//$projectId = 'Y2017DP011';
		if($projectId){
			$where['projectId'] = $projectId;
			$score = M ( 'project_score' );
			$result = $score->where($where)->select();
			echo json_encode ( $result[0] );
			exit ();
		}
	}
	
	/**
	 * 修改项目评分信息
	 */
	public function editProjectScore() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		// $data = array(
		// 'id' => 1023,
		// 'projectId' => 'Y2017DP011',
		// 'outProjectPrice' => '328790',
		// 'strategic' => '88',
		// 'resource_rationality' => '88',
		// 'attension' => '80',
		// 'score' => '90',
		// 'businessOpportunity' => '高',
		// 'note' => '灌灌灌灌'
		// );
		if ($data ['projectId'] != '' && $data ['id'] != '') {
			$score = M ( 'project_score' );
			$result = $score->where ( 'id=' . $data ['id'] )->save ( $data );
			if ($result) {
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '修改项目(' . $data ['projectId'] . ")评分信息";
				$logs->add ( $logsData );
			}
			echo $result;
			exit ();
		}
	}
	
	/**
	 * 添加和修改项目评分
	 */
	public function addProjectScore() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		//var_dump($data);exit;
		$score = M ( 'project_score' );
		$res = $score->where ( "projectId='{$data['projectId']}'" )->find ();
		if (! $res) {
			$result = $score->add ( $data );
			if ($result) {
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加项目(' . $data ['projectId'] . ")评分";
				$logs->add ( $logsData );
			}
			echo $result;
			exit ();
		} else {
			if ($data ['projectId'] != '') {
				$score = M ( 'project_score' );
				$result = $score->where ("projectId='{$data['projectId']}'" )->save ( $data );
				if ($result) {
					$logs = M ( 'logs_info' );
					$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '修改项目(' . $data ['projectId'] . ")评分信息";
					$logs->add ( $logsData );
				}
				echo $result;
				exit ();
			}
		}
	}
	
	/**
	 * 删除项目评分
	 */
	public function deleteProjectScore() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$data = array (
				'projectId' => 'R201685732' 
		);
		if ($data ['projectId'] != '') {
			$score = M ( 'project_score' );
			$result = $score->where ( "projectId='{$data ['projectId']}'" )->setField ( "isDelete", 2 );
			if ($result) {
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '删除项目(' . $data ['projectId'] . ")评分";
				$logs->add ( $logsData );
			}
			echo $result;
			exit ();
		} else {
			echo 0;
			exit ();
		}
	}
	
	/**
	 * 项目评分导入
	 */
	public function addProjectScoreExcel() {
		if (! empty ( $_FILES )) {
			import ( "ORG.Util.PHPExcel" );
			// 上传excl
			$uploadPath = './Public/upload/';
			$file_name = $_FILES ["file"] ["name"];
			$file_info = explode ( '.', $file_name );
			$exts = $file_info [1];
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
			
			$PHPExcel = $PHPReader->load ( $move_file_name );
			$currentSheet = $PHPExcel->getSheet ( 0 );
			$allColumn = $currentSheet->getHighestColumn ();
			$allRow = $currentSheet->getHighestRow ();
			for($currentRow = 2; $currentRow <= $allRow; $currentRow ++) {
				$data ['projectId'] = $currentSheet->getCell ( 'A' . $currentRow )->getValue ();
				$data ['outProjectPrice'] = $currentSheet->getCell ( 'B' . $currentRow )->getValue ();
				$data ['strategic'] = $currentSheet->getCell ( 'C' . $currentRow )->getValue ();
				$data ['resource_rationality'] = $currentSheet->getCell ( 'D' . $currentRow )->getValue ();
				$data ['attension'] = $currentSheet->getCell ( 'E' . $currentRow )->getValue ();
				$data ['score'] = $currentSheet->getCell ( 'F' . $currentRow )->getValue ();
				$data ['businessOpportunity'] = $currentSheet->getCell ( 'G' . $currentRow )->getValue ();
				$data ['note'] = $currentSheet->getCell ( 'H' . $currentRow )->getValue ();
				$f_where ['projectId'] = $data ['projectId'];
				if (M ( 'project_score' )->where ( $f_where )->find ()) {
					$res = M ( 'project_score' )->where ( $f_where )->save ( $data );
				} else {
					$res = M ( 'project_score' )->add ( $data );
				}
			}
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '批量上传了excl' . $move_file_name;
			$logs->add ( $logsData );
			echo $res;
			exit ();
		} else {
			// 上传文件不存在
			echo 0;
			exit ();
		}
	}
	
	/**
	 * 导出项目评分数据
	 */
	public function exportProjectScore() {
		header ( "Content-type:text/html;charset=utf8" );
		$score = M ( "project_score" );
		$data = $score->where ( "isDelete=1" )->select ();
		set_time_limit ( 0 );
		import ( "ORG.Util.PHPExcel" );
		$objPHPExcel = new PHPExcel ();
		$objPHPExcel->getProperties ()->setSubject ( '项目评分' );
		$objPHPExcel->setActiveSheetIndex ( 0 );
		$objPHPExcel->getDefaultStyle ()->getAlignment ()->setHorizontal ( PHPExcel_Style_Alignment::HORIZONTAL_LEFT );
		$objPHPExcel->getDefaultStyle ()->getFont ()->setName ( '等线' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'A1', '项目编号' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'B1', '项目金额(元)' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'C1', '战略意义' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'D1', '资源合理性' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'E1', '领导关注度' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'F1', '项目评分' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'G1', '商机确定性' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'H1', '备注' );
		// 遍历填充日期
		$i = 2;
		foreach ( $data as $key => $project ) {
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'A' . ($i), $project ['projectId'] );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'B' . ($i), $project ['outProjectPrice'] );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'C' . ($i), $project ['strategic'] );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'D' . ($i), $project ['resource_rationality'] );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'E' . ($i), $project ['attension'] );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'F' . ($i), $project ['score'] );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'G' . ($i), $project ['businessOpportunity'] );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'H' . ($i), $project ['note'] );
			$i ++;
		}
		$logs = M ( 'logs_info' );
		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '导出项目评分';
		$logs->add ( $logsData );
		header ( 'pragma:public' );
		header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="项目评分汇总excel.xls"' );
		header ( 'Content-Disposition:attachment;filename="项目评分汇总excel.xls"' );
		$objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
		$objWriter->save ( 'php://output' );
	}
}