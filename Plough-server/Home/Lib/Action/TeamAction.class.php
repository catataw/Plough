<?php
// 本类由系统自动生成，仅供测试用途
class TeamAction extends Action {
	/**
	 * 申请外协
	 */
	
	public function addEmployeeApply(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		unset($data['id']);
		$employeeApply = M ( 'employee_apply' );
		$pro_where['position'] = $data['position'];
		$pro_where['teamName'] = $data['teamName'];
		$pro_where['level'] = $data['level'];
		$pro_where['serviceType'] = $data['serviceType'];
		$pro_where['location'] = $data['location'];
		$pro_where['status'] = $data['status'];
		$record = $employeeApply->where($pro_where)->find();
		if($record){
			//更新
			$res = $employeeApply->where($pro_where)->save( $data );
				
		}else{
			$res = $employeeApply->add ( $data );
		}
		echo $res;
		
	}
	/*
	 * 导出项目预算列表
	 */
	public function exportTeamBudget() {
		$budget_info = M ( 'budget_info' );
		$data = $budget_info->query ( 'SELECT * FROM pmo_team_budget' );
		$xlsName = "大数据产品部外协预算";
		$xlsCell = array (
				array (
						'teamName',
						'项目小组'
				),
				array (
						'teamLeader',
						'小组长'
				),
				array (
						'budget',
						'项目外协预算'
				),
				array (
						'usedBudget',
						'已用预算'
				),
				array (
						'beginTime',
						'预算开始时间'
				),
				array (
						'endTime',
						'预算截止时间'
				),
		);
		$logs = M ( 'logs_info' );
		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '导出外协预算机信息表';
		$logs->add ( $logsData );
		$computer = new ComputerAction();
		exportExcel ( $xlsName, $xlsCell, $data );
	}
	
	
	/*
	 * 获取每个小组的预算
	 */
	public function getTeamsBudget(){
		$teamBudget = M('team_budget');
		$teamsBudget = $teamBudget->query('select * from pmo_team_budget');
		foreach ($teamsBudget as $k=>$v){
			$tmp = $v;
			$tmp['leftBudget'] = $v['budget'] - $v['usedBudget'];
			$result[] = $tmp;
		}
		echo json_encode($result);
	}
	
	/*
	 * 添加小组预算
	 */
	public function addTeamBudget(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$teamBudgetInfo = $data;
		$team_budget = M ( 'team_budget' );
		$pro_where['teamName'] = $teamBudgetInfo['teamName'];
		$record = $team_budget->where($pro_where)->find();
		if($teamBudgetInfo['teamName']&&teamLeader&&budget){
			if($record){
				//更新
				$res = $team_budget->where($pro_where)->save( $teamBudgetInfo );
			
			}else{
				$res = $team_budget->add ( $teamBudgetInfo );
			}
			echo $res;
		}else{
			echo 0;
		}
	}
	
	/*
	 * 批量导入小组预算
	 */
	public function addTeamBudgetExcl(){
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
				echo '9';exit;
			}
			// 载入文件
			$PHPExcel = $PHPReader->load ( $move_file_name );
			// 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
			$currentSheet = $PHPExcel->getSheet ( 0 );
			// 获取总列数
			$allColumn = $currentSheet->getHighestColumn ();
			// 获取总行数
			$allRow = $currentSheet->getHighestRow ();
			// 循环获取表中的数据，$currentRow表示当前行，从哪行开始读取数据，索引值从0开始
			for($currentRow = 2; $currentRow <= $allRow; $currentRow ++){
				// 从哪列开始，A表示第一列
				for($currentColumn = 'A'; $currentColumn <= $allColumn; $currentColumn ++) {
					// 数据坐标
					$address = $currentColumn . $currentRow;
					// 读取到的数据，保存到数组$arr中
					$data [$currentRow] [$currentColumn] = $currentSheet->getCell ( $address )->getValue ();
				}
			}
			foreach ( $data as $k => $v ) {
				foreach ( $v as $key => $value ) {
					$key == 'A' ? $result ['teamName'] = $value : '';
					$key == 'B' ? $result ['teamLeader'] = $value : '';
					$key == 'C' ? $result ['budget'] = $value : '';
					$key == 'E' ? $result ['usedBudget'] = $value : '';
					$key == 'F' ? $result ['beginTime'] = $value : '';
					$key == 'F' ? $result ['endTime'] = $value : '';

				}
				$team_budget = M ( 'team_budget' );
				$pro_where['projectName'] = $result['teamName'];
				$record = $team_budget->where($pro_where)->find();
				if($record){
					//更新
					$team_budget->where($pro_where)->save( $result );
				}else{
					$team_budget->add ( $result );
				}
			}
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '上传更新项目外协预算信息 ' . $move_file_name;
			$logs->add ( $logsData );
			$back_info = array('status' => 1, 'info' => '上传更新外协预算成功');
			echo json_encode($back_info);exit ();
		} else {
			$this->error ( "请选择上传的文件" );
		}
	}
	
	
	/**
	 * 获取所有小组信息
	 */
	public function loadTeams(){
		$teams = M('teams');
		$teamsData = $teams->query('select * from pmo_teams');
		
		echo json_encode($teamsData);
	}
	
	/**
	 * 删除小组
	 */
	 public function deleteTeams(){
	 	$postData = file_get_contents ( "php://input" );
	 	$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
	 	$teams = M('teams');
	 	$result = $teams->where('id="'.$data['id'].'"')->delete();
	 	$logs = M ( 'logs_info' );
	 	$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '删除' . $data ['teamName'] . '小组信息';
	 	$logs->add ( $logsData );
	 	echo $result;
	 	exit ();
	 }
	 
	 /**
	  * 编辑小组
	  */
	public function editTeams(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		if($data){
	 		$teams = M('teams');
			$result = $teams->where ( 'id="' . $data['id'].'"' )->save ( $data );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '编辑小组信息' . $data ['teamName'];
			$logs->add ( $logsData );

			echo $result;
			exit ();
		}
		
	}
	/**
	 * 添加小组
	 */
	public function addTeam(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
	 	$teams = M('teams');
		$record = $teams->where ( 'teamName="' . $data ['teamName'] . '"' )->find ();
		if (! $record) {
			$res = $teams->add ( $data );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加小组' . $data ['teamName'];
			$logs->add ( $logsData );
			echo $res;
			exit ();
		} else {
			exit ();
		}
	}
	
	
	/**
	 * 获取平台组员工接口
	 */
	public function getPlatformUser(){
		$teams = M('teams');
		$platFormTeams = $teams->query('select * from pmo_teams where bigTeamLeader = "王宝晗"');
		$user = M('user_info');
		if($platFormTeams){
			foreach ($platFormTeams as $key=>$value){
				$where['userTeam'] = $value['teamName'];
				$oneTeam = $user->where($where)->select();
				$result[] = $oneTeam;
			}
		}
		echo json_encode($result);
	}
	
	
	/**
	 * 获取所有平台小组
	 */
	public function getPlatformTeams(){
		$teams = M('teams');
		$platFormTeams = $teams->query('select * from pmo_teams where teamName like "大数据产品部/平台组%"');
		if($platFormTeams){
			$this->ajaxReturn($platFormTeams,'获取成功' , 200);
		}
	}
	
}
