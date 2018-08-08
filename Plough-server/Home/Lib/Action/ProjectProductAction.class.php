<?php
// 本类由系统自动生成，仅供测试用途
class ProjectProductAction extends Action {
	
	/**
	 * 获取项目节点信息
	 */
	public function getProjectProducts() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		if ($data ['id']) {
			$where ['relatedId'] = $data ['id'];
			$product = M ( 'project_product' )->where ( $where )->select ();
			echo json_encode ( $product );
			exit ();
		}
	}
	
	/**
	 * 编辑和添加项目产品
	 */
	public function changeProjectProduct() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$product = M ( 'project_product' );
		
		if ($data[0]['relatedId']) {
			$sql = 'delete from pmo_project_product where relatedId="' . $data [0]['relatedId'] . '"';
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . "执行sql:" . $sql;
			$logs->add ( $logsData );
			$result = $product->query ( $sql );
			foreach ( $data as $key => $value ) {
				if ($value) {
					$result = $product->add ( $value );
					if ($result) {
						$logs = M ( 'logs_info' );
						$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加项目(' . $data ['projectId'] . ")的版本信息";
						$logs->add ( $logsData );
					}
				}
			}
			if ($result) {
				echo 200;
			}
		}
	}
	
	/**
	 * 项目导入
	 */
	public function addProductExcl() {
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
				$data ['version'] = $currentSheet->getCell ( 'B' . $currentRow )->getValue ();
				$data ['productName'] = $currentSheet->getCell ( 'C' . $currentRow )->getValue ();
				$data ['productNode'] = $currentSheet->getCell ( 'D' . $currentRow )->getValue ();
				$f_where ['projectId'] = $data ['projectId'];
				if (M ( 'project_product' )->where ( $f_where )->find ()) {
					$res = M ( 'project_product' )->where ( $f_where )->save ( $data );
				} else {
					$res = M ( 'project_product' )->add ( $data );
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
	 * 导出项目数据
	 */
	public function exportProducts() {
		header ( "Content-type:text/html;charset=utf8" );
		$product = M ( 'project_product' );
		$data = $product->select ();
		set_time_limit ( 0 );
		import ( "ORG.Util.PHPExcel" );
		$objPHPExcel = new PHPExcel ();
		$objPHPExcel->getProperties ()->setSubject ( '项目产品信息' );
		$objPHPExcel->setActiveSheetIndex ( 0 );
		$objPHPExcel->getDefaultStyle ()->getAlignment ()->setHorizontal ( PHPExcel_Style_Alignment::HORIZONTAL_LEFT );
		$objPHPExcel->getDefaultStyle ()->getFont ()->setName ( '等线' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'A1', '项目编号' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'B1', '版本号' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'C1', '产品名称' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'D1', '产品节点数' );
		// 遍历填充日期
		$i = 2;
		foreach ( $data as $key => $project ) {
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'A' . ($i), $project ['projectId'] );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'B' . ($i), $project ['version'] );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'C' . ($i), $project ['productName'] );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'D' . ($i), $project ['productNode'] );
			$i ++;
		}
		$logs = M ( 'logs_info' );
		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '导出产品项目版本信息';
		$logs->add ( $logsData );
		header ( 'pragma:public' );
		header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="项目版本信息汇总excel.xls"' );
		header ( 'Content-Disposition:attachment;filename="项目版本信息汇总excel.xls"' );
		$objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
		$objWriter->save ( 'php://output' );
	}
}