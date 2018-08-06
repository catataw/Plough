<?php
class VirtualAction extends Action {

	
	/**
	 * 获取某个接口人虚拟机列表
	 */
	public function getPersonMachine($tanant,$date){
		$where['date'] = $date;
		$where['tenantName'] = $tanant;
		$virtual_machine = M ( 'virtual_machine' );
		$result = $virtual_machine->where($where)->select();
		if($result){
			return $result;
		}else{
			return false;
		}
	}
	
	
	
	/*
	 * 获取虚拟机列表
	 */
	public function getVirtualComputer() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$date = substr(str_replace('-','',$data['date']),0,6);
		$where['date'] = $date;
		$virtual_machine = M ( 'virtual_machine' );
		$searchMachines = $virtual_machine->where($where)->select();
		foreach ($searchMachines as $value){
			$whereT['tenantName'] = $value['tenant'];
			$oneVirtualMan = M('tenant')->where($whereT)->select();
			if($oneVirtualMan){
				$value['officerName'] = $oneVirtualMan[0]['officerName'];
			}
			$result[] = $value;
		}
		echo json_encode ( $result );
		exit ();
	}

	/*
	 * 编辑虚拟机
	 */
	public function editVirtualComputer(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$virtualMachine = M('virtual_machine');
		$where['id']=$data['id'];
		$res = $virtualMachine->where($where)->save( $data );
		if($res){
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '更新虚拟机ip' . $data ['ip'].'项目为:'.$data['projectName'];
			$logs->add ( $logsData );
			echo $res;
		}
	}
	
	/*
	 * 导入虚拟机
	*/
	public function importVirtualMachine1(){
		if( !empty ( $_FILES ) && $_FILES['file']['size']>0 ) {
			// 上传excl
			$uploadPath = './Public/upload/virtual/';
			if( !is_dir( $uploadPath ) ) {
				mkdir( $uploadPath, 755, true );
			}
			$file_name = $_FILES ["file"] ["name"];
			$file_info = explode( '.', $file_name );
			$exts = $file_info [1];
			$move_file_name = $uploadPath . time() . '.' . $exts;
			move_uploaded_file( $_FILES ["file"] ["tmp_name"], $move_file_name );
			// 创建PHPExcel对象
			import( "ORG.Util.PHPExcel" );
			$PHPExcel = new PHPExcel ();
			// 如果excel文件后缀名为.xls，导入这个类
			if( $exts == 'xls' ) {
				import( "ORG.Util.PHPExcel.Reader.Excel5" );
				$PHPReader = new \PHPExcel_Reader_Excel5 ();
			}else if( $exts == 'xlsx' ) {
				import( "ORG.Util.PHPExcel.Reader.Excel2007" );
				$PHPReader = new \PHPExcel_Reader_Excel2007 ();
			}else {
				$this->ajaxReturn(array('code'=>2,'msg'=>"文件格式不正确!"));
			}
			// 载入文件
			$PHPExcel = $PHPReader->load( $move_file_name );
			// 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
			$currentSheet = $PHPExcel->getSheet( 0 );
			// 获取总列数
			$allColumn = $currentSheet->getHighestColumn();
			$machine = M("virtual_machine");
			// 获取总行数
			$allRow = $currentSheet->getHighestRow();
			for( $currentRow = 2; $currentRow <= $allRow; $currentRow++ ) {
				$data['location'] = (string)($currentSheet->getCell( 'A' . $currentRow )->getValue());//项目编号
				$data['poolType'] = (string)($currentSheet->getCell( 'B' . $currentRow )->getValue());//项目编号
				$data['tenant'] = (string)($currentSheet->getCell( 'C' . $currentRow )->getValue());//客户名称
				$data['machineName'] = (string)($currentSheet->getCell( 'D' . $currentRow )->getValue());//项目名称
				$data['ip'] = (string)($currentSheet->getCell( 'E' . $currentRow )->getValue());//牵头部门
				$data['machineId'] = (string)($currentSheet->getCell( 'F' . $currentRow )->getValue());//省份
				$data['cpu'] = (string)($currentSheet->getCell( 'G' . $currentRow )->getValue());//项目经理
				$data['memory'] = (string)($currentSheet->getCell( 'H' . $currentRow )->getValue());//项目经理
				$data['disk'] = (string)($currentSheet->getCell( 'I' . $currentRow )->getValue());//项目经理
				$data['projectName'] = (string)($currentSheet->getCell( 'J' . $currentRow )->getValue());//项目经理
				$data['projectId'] = (string)($currentSheet->getCell( 'K' . $currentRow )->getValue());//项目经理
				$data['useDetail'] = (string)($currentSheet->getCell( 'L' . $currentRow )->getValue());//项目经理
				$data['date'] = (string)($currentSheet->getCell( 'M' . $currentRow )->getValue());//日期
				//判断是否存在 存在更新 不存在添加
				$f_where['machineId'] = $data['machineId'];
				$f_where['IP'] = $data['IP'];
				//$f_where['teamLeader'] = $data['teamLeader'];
				if( $machine->where( $f_where )->find() ) {
					$res = $machine->where( $f_where )->save( $data );
				}else {

					$res = $machine->add( $data );
				}
			}
			$this->ajaxReturn(array('code'=>0,'msg'=>"上传成功!"));
		}else {
			$this->ajaxReturn(array('code'=>2,'msg'=>"文件不能为空!"));
		}
	}
	
	
	/*
	 *
	** 原始虚拟机导出
	*/
	public function exportVirtual1(){
		$model = M();
		$machine = M("virtual_machine");
		set_time_limit(0);
		import ( "ORG.Util.PHPExcel" );
		$objPHPExcel = new PHPExcel();
		$objPHPExcel->getProperties()->setSubject('报表');
		$objPHPExcel->setActiveSheetIndex(0);
		$objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
		$objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
		$objPHPExcel->getActiveSheet()->setCellValue('A1', '位置');
		$objPHPExcel->getActiveSheet()->setCellValue('B1', '资源池');
		$objPHPExcel->getActiveSheet()->setCellValue('C1', '租户');
		$objPHPExcel->getActiveSheet()->setCellValue('D1', '机器名称');
		$objPHPExcel->getActiveSheet()->setCellValue('E1', 'IP');
		$objPHPExcel->getActiveSheet()->setCellValue('F1', 'machineId');
		$objPHPExcel->getActiveSheet()->setCellValue('G1', 'CPU');
		$objPHPExcel->getActiveSheet()->setCellValue('H1', '内存');
		$objPHPExcel->getActiveSheet()->setCellValue('I1', 'disk');
		$objPHPExcel->getActiveSheet()->setCellValue('J1', 'projectName');
		$objPHPExcel->getActiveSheet()->setCellValue('K1', 'projectId');
		$objPHPExcel->getActiveSheet()->setCellValue('L1', 'useDetail');
		$objPHPExcel->getActiveSheet()->setCellValue('M1', 'userName');
		$where['date'] = substr(str_replace('-','',$_REQUEST['exportTime']),0,6);
		$list = $machine->where($where)->select();
		//遍历填充日期
		$i = 2;
		foreach($list as $key => $project){
			$objPHPExcel->getActiveSheet()->setCellValue('A'.($i), $project['location']);
			$objPHPExcel->getActiveSheet()->setCellValue('B'.($i), $project['poolType']);
			$objPHPExcel->getActiveSheet()->setCellValue('C'.($i), $project['tenant']);
			$objPHPExcel->getActiveSheet()->setCellValue('D'.($i), $project['machineName']);
			$objPHPExcel->getActiveSheet()->setCellValue('E'.($i), $project['ip']);
			$objPHPExcel->getActiveSheet()->setCellValue('F'.($i), $project['machineId']);
			$objPHPExcel->getActiveSheet()->setCellValue('G'.($i), $project['cpu']);
			$objPHPExcel->getActiveSheet()->setCellValue('H'.($i), $project['memory']);
			$objPHPExcel->getActiveSheet()->setCellValue('I'.($i), $project['disk']);
			$objPHPExcel->getActiveSheet()->setCellValue('J'.($i), $project['projectName']);
			$objPHPExcel->getActiveSheet()->setCellValue('K'.($i), $project['projectId']);
			$objPHPExcel->getActiveSheet()->setCellValue('L'.($i), $project['useDetail']);
			$objPHPExcel->getActiveSheet()->setCellValue('M'.($i), $project['userName']);
			$i++;
		}
	
		header ( 'pragma:public' );
		header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="虚拟机数据excel.xls"');
		header ( 'Content-Disposition:attachment;filename="虚拟机数据excel.xls"' ); // attachment新窗口打印inline本窗口打印
		$objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
		$objWriter->save ( 'php://output' );
	}
	
	/**
	 * 导出大组虚拟机列表
	 * @param $_REQUEST['exportTime'] 日期
	 */
	public function exportBigTeamVirtualMachine(){
		header("Content-type:text/html;charset=utf8");
		set_time_limit(0);
		import ( "ORG.Util.PHPExcel" );
		$objPHPExcel = new PHPExcel();
		$teams = getBigTeams();
		$bigTeams = getBigTeams();
		if($_REQUEST['exportTime']){
			$date = substr(str_replace('-','',$_REQUEST['exportTime']),0,6);
		}
		//导出大组总虚拟机成本
		
		$objPHPExcel->setActiveSheetIndex(0);
		$objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
		$objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
		$objPHPExcel->getActiveSheet()->setCellValue('A1', '组名');
		$objPHPExcel->getActiveSheet()->setCellValue('B1', 'CPU');
		$objPHPExcel->getActiveSheet()->setCellValue('C1', '内存');
		$objPHPExcel->getActiveSheet()->setCellValue('D1', '硬盘');
		$objPHPExcel->getActiveSheet()->setTitle('虚机机成本汇总');
		$bigTeams = getBigTeams();
		$userInfo = M("user_info");
		$data = array();
		$i = 2;
		foreach($bigTeams as $key=>$value){
			$con = array(); $where = array();
			$usernames = $userInfo->where("userTeam like '%{$value}%'")->getField("userName" , true);
			$con['officerName'] = array('in', $usernames);
			$tenantNames = M("tenant")->where($con)->getField("tenantName",true);
			$data[$key]['bigTeamName'] = $value;
			$where['tenant'] = array('in', $tenantNames);
			$where['date'] = $date;
			$data[$key]['num'] = M("virtual_machine")->where($where)->count();
			$data[$key]['cpu'] = M("virtual_machine")->where($where)->sum("cpu");
			$data[$key]['memory'] = M("virtual_machine")->where($where)->sum("memory");
			$data[$key]['disk'] = M("virtual_machine")->where($where)->sum("disk");
			$objPHPExcel->getActiveSheet()->setCellValue('A'.($i), $value);
			$objPHPExcel->getActiveSheet()->setCellValue('B'.($i), $data[$key]['cpu']);
			$objPHPExcel->getActiveSheet()->setCellValue('C'.($i), $data[$key]['memory']);
			$objPHPExcel->getActiveSheet()->setCellValue('D'.($i), $data[$key]['disk']);
			$i++;
		}
		
		//导出各个大组虚拟机详情
		$index = 0;
		foreach($teams as $key=>$value){
			$machines = $this->getBigTeamVirtual($value,$date);
			if($machines){
				$index ++;
				$i=2;
				$objPHPExcel->createSheet ();
				$objPHPExcel->setActiveSheetIndex($index);
				$objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
				$objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
				$objPHPExcel->getActiveSheet()->setCellValue('A1', '位置');
				$objPHPExcel->getActiveSheet()->setCellValue('B1', '资源池');
				$objPHPExcel->getActiveSheet()->setCellValue('C1', '租户');
				$objPHPExcel->getActiveSheet()->setCellValue('D1', '机器名称');
				$objPHPExcel->getActiveSheet()->setCellValue('E1', 'IP');
				$objPHPExcel->getActiveSheet()->setCellValue('F1', 'machineId');
				$objPHPExcel->getActiveSheet()->setCellValue('G1', 'CPU');
				$objPHPExcel->getActiveSheet()->setCellValue('H1', '内存');
				$objPHPExcel->getActiveSheet()->setCellValue('I1', '硬盘');
				$objPHPExcel->getActiveSheet()->setCellValue('J1', '项目名称');
				$objPHPExcel->getActiveSheet()->setCellValue('K1', '项目编号');
				$objPHPExcel->getActiveSheet()->setCellValue('L1', '使用详情');
				$objPHPExcel->getActiveSheet()->setCellValue('M1', '租户姓名');
				$objPHPExcel->getActiveSheet()->setCellValue('N1', '日期');
				// $objPHPExcel->getProperties()->setSubject($value.'-虚拟机使用情况总汇');
				$objPHPExcel->getActiveSheet()->setTitle($value);
				foreach($machines as $k=>$project){
					$objPHPExcel->getActiveSheet()->setCellValue('A'.($i), $project['location']);
					$objPHPExcel->getActiveSheet()->setCellValue('B'.($i), $project['poolType']);
					$objPHPExcel->getActiveSheet()->setCellValue('C'.($i), $project['tenant']);
					$objPHPExcel->getActiveSheet()->setCellValue('D'.($i), $project['machineName']);
					$objPHPExcel->getActiveSheet()->setCellValue('E'.($i), $project['ip']);
					$objPHPExcel->getActiveSheet()->setCellValue('F'.($i), $project['machineId']);
					$objPHPExcel->getActiveSheet()->setCellValue('G'.($i), $project['cpu']);
					$objPHPExcel->getActiveSheet()->setCellValue('H'.($i), $project['memory']);
					$objPHPExcel->getActiveSheet()->setCellValue('I'.($i), $project['disk']);
					$objPHPExcel->getActiveSheet()->setCellValue('J'.($i), $project['projectName']);
					$objPHPExcel->getActiveSheet()->setCellValue('K'.($i), $project['projectId']);
					$objPHPExcel->getActiveSheet()->setCellValue('L'.($i), $project['useDetail']);
					$objPHPExcel->getActiveSheet()->setCellValue('M'.($i), $project['officerName']);
					$objPHPExcel->getActiveSheet()->setCellValue('N'.($i), $project['date']);
					$i++;
				}
			}
		}
		header ( 'pragma:public' );
		header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="'.$date.'各大组虚拟机数据excel.xls"');
		header ( 'Content-Disposition:attachment;filename="'.$date.'虚拟机数据excel.xls"' ); // attachment新窗口打印inline本窗口打印
		$objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
		$objWriter->save ( 'php://output' );
	}
	
	/**
	 * 获取大组虚拟机列表
	 * @param $teamName 大组名称
	 * @param $date 日期
	 */
	function getBigTeamVirtual($teamName,$date){
		$userInfo = M("user_info");
		$usernames = $userInfo->where("userTeam like '%{$teamName}%'")->getField("userName" , true);
		$bigTeamLeader = M("teams")->where("teamName like '%{$teamName}%'")->getField("bigTeamLeader");
		$teamLeader = M("teams")->where("teamName like '%{$teamName}%'")->getField("teamLeader");
		if(!in_array($teamLeader, $usernames)){
			$usernames[] = $teamLeader;
		}
		if(!in_array($bigTeamLeader, $usernames)){
			$usernames[] = $bigTeamLeader;
		}
		$con['officerName'] = array('in', $usernames);
		$tenantNames = M("tenant")->where($con)->getField("tenantName",true);
		$data[$key]['bigTeamName'] = $value;
		$where['tenant'] = array('in', $tenantNames);
		$where['date'] = $date;
		$data = M("virtual_machine")->field('pmo_virtual_machine.*,pmo_tenant.officerName')
		->join('left join pmo_tenant on pmo_tenant.tenantName=pmo_virtual_machine.tenant')
		->where($where)
		->select();
		return $data;
	}
	
	/*
	 * 导入虚拟机
	*/
	public function importStandardVirtualMachine(){
		if( !empty ( $_FILES ) && $_FILES['file']['size']>0 ) {
			// 上传excl
			$uploadPath = './Public/upload/virtual/';
			if( !is_dir( $uploadPath ) ) {
				mkdir( $uploadPath, 755, true );
			}
			$file_name = $_FILES ["file"] ["name"];
			$file_info = explode( '.', $file_name );
			$exts = $file_info [1];
			$move_file_name = $uploadPath . time() . '.' . $exts;
			move_uploaded_file( $_FILES ["file"] ["tmp_name"], $move_file_name );
			// 创建PHPExcel对象
			import( "ORG.Util.PHPExcel" );
			$PHPExcel = new PHPExcel ();
			// 如果excel文件后缀名为.xls，导入这个类
			if( $exts == 'xls' ) {
				import( "ORG.Util.PHPExcel.Reader.Excel5" );
				$PHPReader = new \PHPExcel_Reader_Excel5 ();
			}else if( $exts == 'xlsx' ) {
				import( "ORG.Util.PHPExcel.Reader.Excel2007" );
				$PHPReader = new \PHPExcel_Reader_Excel2007 ();
			}else {
				$this->ajaxReturn(array('code'=>2,'msg'=>"文件格式不正确!"));
			}
			// 载入文件
			$PHPExcel = $PHPReader->load( $move_file_name );
			// 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
			$currentSheet = $PHPExcel->getSheet( 0 );
			// 获取总列数
			$allColumn = $currentSheet->getHighestColumn();
			$machine = M("virtual_machine");
			// 获取总行数
			$allRow = $currentSheet->getHighestRow();
			for( $currentRow = 2; $currentRow <= $allRow; $currentRow++ ) {
				$data['location'] = (string)($currentSheet->getCell( 'A' . $currentRow )->getValue());//位置
				$data['poolType'] = (string)($currentSheet->getCell( 'B' . $currentRow )->getValue());//资源池
				$data['tenant'] = (string)($currentSheet->getCell( 'C' . $currentRow )->getValue());//租户
				$data['machineName'] = (string)($currentSheet->getCell( 'D' . $currentRow )->getValue());//机器名称
				$data['ip'] = (string)($currentSheet->getCell( 'E' . $currentRow )->getValue());//IP
				$data['machineId'] = (string)($currentSheet->getCell( 'F' . $currentRow )->getValue());//machineId
				$data['cpu'] = (string)($currentSheet->getCell( 'G' . $currentRow )->getValue());//CPU
				$data['memory'] = (string)($currentSheet->getCell( 'H' . $currentRow )->getValue());//内存
				$data['disk'] = (string)($currentSheet->getCell( 'I' . $currentRow )->getValue());//disk
				$data['projectName'] = (string)($currentSheet->getCell( 'J' . $currentRow )->getValue());
				$data['projectId'] = (string)($currentSheet->getCell( 'K' . $currentRow )->getValue());
				$data['useDetail'] = (string)($currentSheet->getCell( 'L' . $currentRow )->getValue());
				$data['userName'] = (string)($currentSheet->getCell( 'M' . $currentRow )->getValue());
				$data['date'] = (string)($currentSheet->getCell( 'N' . $currentRow )->getValue());
				//判断是否存在 存在更新 不存在添加
				$f_where['machineId'] = $data['machineId'];
				$f_where['IP'] = $data['IP'];
				$f_where['date'] = $data['date'];
				//$f_where['teamLeader'] = $data['teamLeader'];
				if( $machine->where( $f_where )->find() ) {
					$res = $machine->where( $f_where )->save( $data );
				}else {
					//add
					$res = $machine->add( $data );
				}
				//print_r($data);
			}
			$this->ajaxReturn(array('code'=>0,'msg'=>"上传成功!"));
		}else {
			$this->ajaxReturn(array('code'=>2,'msg'=>"文件不能为空!"));
		}
	}
	
	/*
	 * 导入虚拟机/新方法
	*/
	public function importVirtualMachine(){
		if( !empty ( $_FILES ) && $_FILES['file']['size']>0 ) {
			// 上传excl
			$uploadPath = './Public/upload/virtual/';
			if( !is_dir( $uploadPath ) ) {
				mkdir( $uploadPath, 755, true );
			}
			$file_name = $_FILES ["file"] ["name"];
			$file_info = explode( '.', $file_name );
			$exts = $file_info [1];
			$move_file_name = $uploadPath . time() . '.' . $exts;
			move_uploaded_file( $_FILES ["file"] ["tmp_name"], $move_file_name );
			// 创建PHPExcel对象
			import( "ORG.Util.PHPExcel" );
			$PHPExcel = new PHPExcel ();
			// 如果excel文件后缀名为.xls，导入这个类
			if( $exts == 'xls' ) {
				import( "ORG.Util.PHPExcel.Reader.Excel5" );
				$PHPReader = new \PHPExcel_Reader_Excel5 ();
			}else if( $exts == 'xlsx' ) {
				import( "ORG.Util.PHPExcel.Reader.Excel2007" );
				$PHPReader = new \PHPExcel_Reader_Excel2007 ();
			}else {
				$this->ajaxReturn(array('code'=>2,'msg'=>"文件格式不正确!"));
			}
			// 载入文件
			$PHPExcel = $PHPReader->load( $move_file_name );
			// 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
			$currentSheet = $PHPExcel->getSheet( 0 );
			// 获取总列数
			$allColumn = $currentSheet->getHighestColumn();
			$machine = M("virtual_machine");
			// 获取总行数
			$allRow = $currentSheet->getHighestRow();
			for( $currentRow = 3; $currentRow <= $allRow; $currentRow++ ) {
				$data = array();
				$data['location'] = (string)($currentSheet->getCell( 'B' . $currentRow )->getValue());//位置
				$data['poolType'] = (string)($currentSheet->getCell( 'C' . $currentRow )->getValue());//资源池
				$data['team'] = (string)($currentSheet->getCell( 'D' . $currentRow )->getValue());//资源池
				$data['tenant'] = (string)($currentSheet->getCell( 'E' . $currentRow )->getValue());//租户
				$data['machineName'] = (string)($currentSheet->getCell( 'F' . $currentRow )->getValue());//machineId
				$data['ip'] = (string)($currentSheet->getCell( 'G' . $currentRow )->getValue());//IP
				$data['machineId'] = (string)($currentSheet->getCell( 'H' . $currentRow )->getValue());//IP
				$data['cpu'] = (string)($currentSheet->getCell( 'I' . $currentRow )->getValue());//CPU
				$data['memory'] = (string)($currentSheet->getCell( 'J' . $currentRow )->getValue());//内存
				$data['disk'] = (string)($currentSheet->getCell( 'K' . $currentRow )->getValue());//disk
				$p = (string)($currentSheet->getCell( 'P' . $currentRow )->getValue());
				$q = (string)($currentSheet->getCell( 'Q' . $currentRow )->getValue());
				$r = (string)($currentSheet->getCell( 'R' . $currentRow )->getValue());
				$s = (string)($currentSheet->getCell( 'S' . $currentRow )->getValue());
				$t = (string)($currentSheet->getCell( 'T' . $currentRow )->getValue());
				if($p ){
					$data['projectId'] = $p;
				}else if($r){
					$data['projectId'] = $r;
				}else{
					$data['projectId'] = 0;
				}
	
				if($q){
					$data['projectName'] = $q;
				}else if($s){
					$data['projectName'] = $s;
				}else if($t){
					$data['projectName'] = $t;
				}else{
					$data['projectName'] = 0;
				}
				$data['useDetail'] = (string)($currentSheet->getCell( 'V' . $currentRow )->getValue());
				$data['date'] = (string)($currentSheet->getCell( 'X' . $currentRow )->getValue());
				$f_where['machineId'] = $data['machineId'];
				$f_where['ip'] = $data['ip'];
				$f_where['date'] = $data['date'];
				if( $machine->where( $f_where )->find() ) {
					$res = $machine->where( $f_where )->save( $data );
				}else {
					$res = $machine->add( $data );
				}
			}
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '批量上传了excl'.$move_file_name;
			$logs->add ( $logsData );
			echo $res; exit;
		}else {
			$this->error ( "请选择上传的文件" );
		}
	}
	
	/** 
	 * 虚拟机成本导出
	 */
	public function exportVirtual(){
		header("Content-type:text/html;charset=utf8");
		set_time_limit(0);
		if($_REQUEST['exportTime']){
			$date = substr(str_replace('-','',$_REQUEST['exportTime']),0,6);
		}else{
			echo "时间不能为空";exit;
		}
		$bigTeams = getBigTeams();
		$sheetsName = array_merge(array("大组虚拟机成本汇总","小组成本汇总","项目成本表"),$bigTeams);
		$xlsName = "资源池成本导出";
		$expTableData = array();
		$xlsCell = array();
		foreach($sheetsName as $key=>$value){
			$list = array();
			if($value == "大组虚拟机成本汇总"){
				$xlsCell[] = array (
	                array ('teamName','组名' ),
	                array ('cpus','CPU' ),
	                array ('memorys','内存' ),
	                array ('disks','硬盘' ),
	                array ('totalfees','费用(元)' )
	            );
				foreach($bigTeams as $bk=>$bv){
					$list [$bk] = $this->getTeamVirtualInfo($bv, $date,'like');
				}
			}else if( $value == "小组成本汇总" ){
				$xlsCell[] = array (
	                array ('teamName','组名' ),
	                array ('cpus','CPU' ),
	                array ('memorys','内存' ),
	                array ('disks','硬盘' ),
	                array ('totalfees','费用(元)' )
	            );
				$teams = M("teams")->getField("teamName",true);
				foreach($bigTeams as $bk){
					$oneBigTeam = "大数据产品部/".$bk;
					if(!in_array($oneBigTeam ,$teams )){
						$teams[] = $oneBigTeam;
					}
				}
				foreach($teams as $tk=>$tv){
					$list [$tk] = $this->getTeamVirtualInfo($tv, $date,'eq');
				}
			}else if( $value == "项目成本表" ){
				$xlsCell[] = array (
					array ('projectId','项目编号' ),
	                array ('projectName','项目名称' ),
	                array ('cpus','CPU' ),
	                array ('memorys','内存' ),
	                array ('disks','硬盘' ),
	                array ('totalfees','费用(元)' )
	            );
				$projects = M("virtual_machine")->where("date = '" . $date ."'")->distinct(true)->field("projectName")->select();
				foreach($projects as $k => $v){
					$list[$k]['projectId'] = M("projects")->where("projectName = '". $v['projectName'] ."'")->getField("projectId") ;
					$list[$k]['projectName'] = $v['projectName'] ;
					$list[$k]['cpus'] = $cpus = M("virtual_machine")->where("date = '" . $date ."' and projectName = '". $v['projectName'] . "'")->sum("cpu") ;
					$list[$k]['memorys'] = $memorys = M("virtual_machine")->where("date = '" . $date ."' and projectName = '". $v['projectName'] . "'")->sum("memory") ;
					$list[$k]['disks'] = $disks = M("virtual_machine")->where("date = '" . $date ."' and projectName = '". $v['projectName'] . "'")->sum("disk") ;
					$list[$k]['totalfees'] = getVirtualCost($cpus,$memorys,$disks);
				}
			}else{
				$xlsCell[] = array (
					array ('location','位置' ),
	                array ('poolType','资源池' ),
	                array ('tenant','租户' ),
	                array ('machineName','机器名称' ),
	                array ('ip','IP' ),
	                array ('machineId','machineId' ),
	                array ('cpu','CPU' ),
	                array ('memory','内存' ),
	                array ('disk','硬盘' ),
	                array ('projectName','项目名称' ),
	                array ('projectId','项目编号' ),
	                array ('detail','使用详情' ),
	                array ('tenantName','租户姓名' ),
	                array ('date','日期' )
	            );
				$users = M("user_info")->where("userTeam like '%". $value ."%'")->getField("userName",true);//获取组内成员
				$where ['officerName'] = array( "in" ,$users ) ;
				$tenantNames =  M("tenant")->where($where)->getField("tenantName",true);
				$where ['date'] = $date ;
				$where ['tenant'] = array( "in" ,$tenantNames );
				$list = M("virtual_machine")->where($where)->select();
				foreach($list as $k => $v){
					$list[$k]['tenantName'] = M("tenant")->where("officerName = '" . $v['tenant'] ."'")->getField("tenantName");
				}
			}
			$expTableData [$key] = $list;
		}
		$logs = M ( 'logs_info' );
        $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '导出工时汇总';
        $logs->add ( $logsData );
        exportMultiSheetExcel ( $xlsName, $sheetsName, '', $xlsCell, $expTableData );
	}

	/**
	 * 获取小组/大组虚拟机使用情况
	 * @param teamName 大组/小组名称
	 * @param date 日期
	 */
	public function getTeamVirtualInfo($teamName, $date,$type){
		$virtual = array();
		if($type == "eq"){
			$sql = "userTeam = '". $teamName ."'";
		}else{
			$sql = "userTeam like '%". $teamName ."%'";
		}
		$users = M("user_info")->where($sql)->getField("userName",true);//获取组内成员
		$where ['officerName'] = array( "in" ,$users ) ;
		$tenantNames =  M("tenant")->where($where)->getField("tenantName",true);
		$where ['date'] = $date ;
		$where ['tenant'] = array( "in" ,$tenantNames );
		$virtual ['teamName'] = $teamName;
		$virtual ['cpus'] = M("virtual_machine")->where($where)->sum("cpu");
		$virtual ['memorys'] = M("virtual_machine")->where($where)->sum("memory");
		$virtual ['disks'] = M("virtual_machine")->where($where)->sum("disk");
		$virtual ['totalfees'] = getVirtualCost($virtual ['cpus'],$virtual ['memorys'],$virtual ['disks']);
		return $virtual;
	}
}
	