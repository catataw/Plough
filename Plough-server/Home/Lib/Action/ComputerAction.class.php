<?php
class ComputerAction extends Action {
	
	/*
	 * 可启动docker 主机
	 */
	
	public function getDockerMachine(){
		$computer = M('computer_info');
		
		$result = $computer->query('select * from pmo_computer_info where dockerTime != ""  and isDelete=1;');

		echo json_encode ( $result );
	}
	
	
	/*
	 * 添加一个主机信息
	 */
	public function addComputer() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$computer = M ( 'computer_info' );
		$record = $computer->where ( 'mIp="' . $data ['mIp'] . '"' )->find ();
		if (! $record) {
			$res = $computer->add ( $data );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加主机' . $data ['mIp'];
			$logs->add ( $logsData );
			echo $res;
			exit ();
		} else {
			exit ();
		}
	}
	public function returnComputer() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$data ['userEmail'] = '';
		$data ['useDetail'] = '';
		if ($data ['computerId'] != '') {
			$computer = M ( 'computer_info' );
			$result = $computer->where ( 'computerId=' . $data ['computerId'] )->save ( $data );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '归还主机' . $data ['computerId'];
			$logs->add ( $logsData );
			echo $result;
			exit ();
		}
	}
	public function returnComputers() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( $postData, TRUE );
		$ips = str_replace ( '"', '', $postData );
		$backInfo ['userEmail'] = '';
		$backInfo ['useDetail'] = '';
		if ($ips != '') {
			$computer = M ( 'computer_info' );
			$result = $computer->where ( array (
					'mIp' => array (
							'in',
							$ips 
					) 
			) )->save ( $backInfo );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '归还主机' . $ips;
			$logs->add ( $logsData );
			
			echo $result;
			exit ();
		}
	}

	public function getComputer() {
		$computer = M ( 'computer_info' );
		$result = $computer->query ( 'SELECT * FROM pmo_user_info JOIN pmo_computer_info ON pmo_user_info.userEmail = pmo_computer_info.userEmail where pmo_computer_info.isDelete=1;' );
		foreach($result as $k=>$v){
			if(strtotime($v['endTime'])<time()){
				$result[$k]['statusValue'] = 3;
			}else if(strtotime($v['endTime'])>=time() && strtotime($v['endTime'])<=time()+3600*24*30){
				$result[$k]['statusValue'] = 2;
			}else{
				$result[$k]['statusValue'] = 1;
			}
		};
		echo json_encode ( $result );
		exit ();
	}
	
	public function getComputerUse(){
		$computer = M ( 'computer_info' );
		$result = $computer->query ( 'SELECT distinct useDetail from pmo_computer_info where isDelete=1;' );
		 
		
		
		foreach($result as $val){
			$where['useDetail'] = $val['useDetail'];
			$count = $computer->where($where)->count();
			$return['useDetail'] = $val['useDetail'];
			$return['count'] = $count;
			$returns[] = $return;
		}
		
		$xlsName = "物理机占用项目";
		$xlsCell = array (
				array (
						'useDetail',
						'用途'
				),
				array (
						'count',
						'台数'
				)
				
		);
		exportExcel ( $xlsName, $xlsCell, $returns );
		
	}
	
	
	public function deleteComputer() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		if ($data ['computerId'] != '') {
			$computer = M ( "computer_info" ); // 实例化User对象
			$data['isDelete'] = 2;
			$result = $computer->where ( 'computerId=' . $data ['computerId'] )->save ($data);
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '删除主机' . $data ['computerId'];
			$logs->add ( $logsData );
			echo $result;
			exit ();
		}
	}
	public function editComputer() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		if ($data ['computerId'] != '') {
			$computer = M ( 'computer_info' );
			$result = $computer->where ( 'computerId=' . $data ['computerId'] )->save ( $data );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '编辑主机' . $data ['mIp'];
			$logs->add ( $logsData );
			echo $result;
			exit ();
		}
	}
	
	public function editComputers(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$ips = $data['ips'];
		unset($data['ips']);
		if($ips){
			$computer = M ( 'computer_info' );
			$result = $computer->where ( array (
					'mIp' => array (
							'in',
							$ips
					)
			) )->save ( $data );
			if($result){
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '批量编辑了主机' . $ips;
				$logs->add ( $logsData );
				echo $result;
				exit ();
			}else{
				echo 0;
				exit ();
			}
		}
	}
	public function computeDashboard() {
		$date = date ( "Y-m-d H:i", time () + 3600 * 24 * 30 );
		$Model = M ();
		$totalComputerCount = $Model->query ( 'select count(*) from pmo_computer_info where isDelete = 1;' );
		$leftComputerCount = $Model->query ( "select count(*) from pmo_computer_info where userEmail='' and  isDelete = 1" );
		$tmpComputerCount = $Model->query ( "select count(*) from pmo_computer_info where computerType ='2' and userEmail!='' and isDelete = 1" );
		$longComputerCount = $Model->query ( "select count(*) from pmo_computer_info where computerType ='1' and userEmail!='' and isDelete = 1" );
		$backInMonthCount = $Model->query ( "select count(*) from pmo_computer_info where endTime <'" . $date . "' and userEmail!='' and isDelete = 1" );
		$result ['totalComputerCount'] = $totalComputerCount [0] ['count(*)'];
		$result ['leftComputerCount'] = $leftComputerCount [0] ['count(*)'];
		$result ['tmpComputerCount'] = $tmpComputerCount [0] ['count(*)'];
		$result ['longComputerCount'] = $longComputerCount [0] ['count(*)'];
		$result ['backInMonthCount'] = $backInMonthCount [0] ['count(*)'];
		echo json_encode ( $result );
		exit ();
	}
	// 获取每个组机器使用数量
	public function getPersonCCount() {
		$Model = M ();
		$teams = $Model->query ( 'SELECT DISTINCT pmo_user_info.userTeam
									FROM pmo_user_info
									JOIN pmo_computer_info ON pmo_user_info.userEmail = pmo_computer_info.userEmail
									WHERE pmo_computer_info.userEmail !=  "" and pmo_computer_info.isDelete=1' );
		if ($teams) {
			foreach ( $teams as $k => $v ) {
				$teamNameArr = explode('-',$v ['userTeam']);
				$result ['name'] = $teamNameArr[count($teamNameArr)-1];
				$countArr = $Model->query ( 'SELECT count(*)
											FROM pmo_user_info
											JOIN pmo_computer_info ON pmo_user_info.userEmail = pmo_computer_info.userEmail
											WHERE pmo_user_info.userTeam =  "' . $v ['userTeam'] . '" and pmo_computer_info.isDelete=1' );
				
				if (strlen ( $result ['name'] ) <= 9) {
					$result ['name'] = substr ( $result ['name'], 0, 9 );
				}
				$result ['value'] = $countArr [0] ['count(*)'];
				$result ['type'] = 'space';
				$res [$k] = $result;
			}
		}
		echo json_encode ( $res );
		exit ();
	}
	// 获取每个人机器使用数量
	public function getPersonCCount1() {
		$Model = M ();
		$persons = $Model->query ( 'SELECT DISTINCT userEmail FROM  `pmo_computer_info` where userEmail!="" and isDelete = 1;' );
		if ($persons) {
			foreach ( $persons as $k => $v ) {
				$userTeamArr = $Model->query ( 'SELECT userName FROM  `pmo_user_info` where userEmail="' . $v ['userEmail'] . '";' );
				
				$result ['name'] = $userTeamArr [0] ['userName'];
				$countArr = $Model->query ( 'SELECT count(*) FROM  `pmo_computer_info` where userEmail="' . $v ['userEmail'] . '" and isDelete=1;' );
				$result ['value'] = $countArr [0] ['count(*)'];
				$result ['type'] = 'space';
				$res [$k] = $result;
			}
		}
		echo json_encode ( $res );
		exit ();
	}
	// 获取临时以及长期用机数量
	public function getTmpCCount() {
		$Model = M ();
		$tmp = $Model->query ( 'select count(*) FROM  `pmo_computer_info` where computerType=2 and isDelete=1' );
		$long = $Model->query ( 'select count(*) FROM  `pmo_computer_info` where computerType=1 and isDelete=1' );
		$tmpArr ['name'] = '临时用机';
		$tmpArr ['value'] = $tmp [0] ['count(*)'];
		$tmpArr ['type'] = 'space';
		$res [0] = $tmpArr;
		$longArr ['name'] = '长期持有';
		$longArr ['value'] = $long [0] ['count(*)'];
		$longArr ['type'] = 'space';
		$res [1] = $longArr;
		echo json_encode ( $res );
		exit ();
	}
	// 获取剩余机器
	public function getLeftComputer() {
		$Model = M ();
		$result = $Model->query ( 'select 
                ip,mIp,cpu,memory,disk,area   
				FROM  `pmo_computer_info` where userEmail="" and isDelete=1' );
		echo json_encode ( $result );
		exit ();
	}
	// 批量分配机器
	public function distributeComputer() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$ips = $data ['mIp'];
    
		if ($ips) {
			$index = array_search ( $data, 'mIp' );
			array_splice ( $data, $index, 1 );
			$computer = M ( 'computer_info' );
			$result = $computer->where ( array (
					'mIp' => array (
							'in',
							$ips 
					) 
			) )->save ( $data );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '分配了主机' . $ips;
			$logs->add ( $logsData );
			echo $result;
			exit ();
		} else {
			echo 0;
			exit ();
		}
	}
	//导出机器列表
	public function exportComputers() {
		$computer = M ( 'computer_info' );
		$data = $computer->query ( 'SELECT userName,pmo_computer_info.userEmail, userTeam, mIp,ip, startTime, endTime, useDetail, computerType,rootPassword,hostName,os
									FROM pmo_user_info
									JOIN pmo_computer_info ON pmo_user_info.userEmail = pmo_computer_info.userEmail and pmo_computer_info.isDelete=1
				                    ' );
		$xlsName = "computerInfo";
		foreach ( $data as $k => $v ) {
			if ($v ['computerType'] == '1') {
				$data [$k] ['computerType'] = '长期用机';
			} else {
				$data [$k] ['computerType'] = '临时用机';
			}
		}
		$xlsCell = array (
				array (
						'userName',
						'使用员工' 
				),
				array (
						'userEmail',
						'员工邮箱'
				),
				array (
						'userTeam',
						'员工所在小组' 
				),
				array (
						'mIp',
						'管理口IP' 
				),
				array (
						'ip',
						'IP'
				),
				array (
						'startTime',
						'申请时间' 
				),
				array (
						'endTime',
						'约定归还时间' 
				),
				array (
						'useDetail',
						'用途说明' 
				),
				array (
						'computerType',
						'机器类型' 
				),
				array (
						'rootPassword',
						'root密码'
				),
				array (
						'hostName',
						'主机名称'
				),
				array (
						'os',
						'操作系统'
				)
		);
		$logs = M ( 'logs_info' );
		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '导出物理机信息表';
		$logs->add ( $logsData );
		exportExcel ( $xlsName, $xlsCell, $data );
	}

	
	public function addComputerExcl() {
		if (! empty ( $_FILES )) {
			import ( "ORG.Util.PHPExcel" ); // 上传excl
			$uploadPath = './Public/upload/';
			$file_name = $_FILES ["file"] ["name"];
			$file_info = explode ( '.', $file_name );
			$exts = $file_info [1];
			$move_file_name = $uploadPath . time () . '.' . $exts;
			move_uploaded_file ( $_FILES ["file"] ["tmp_name"], $move_file_name ); // 创建PHPExcel对象
			$PHPExcel = new PHPExcel (); // 如果excel文件后缀名为.xls，导入这个类
			if ($exts == 'xls') { import ( "ORG.Util.PHPExcel.Reader.Excel5" );
			$PHPReader = new \PHPExcel_Reader_Excel5 ();
			} else if ($exts == 'xlsx') {
				import ( "ORG.Util.PHPExcel.Reader.Excel2007" );
				$PHPReader = new \PHPExcel_Reader_Excel2007 ();
			}else{ echo '9'; exit; }
			$PHPReader = new \PHPExcel_Reader_Excel2007 (); // 载入文件
			$PHPExcel = $PHPReader->load ( $move_file_name ); // 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
			$currentSheet = $PHPExcel->getSheet ( 0 ); // 获取总列数
			$allColumn = $currentSheet->getHighestColumn (); // 获取总行数
			$allRow = $currentSheet->getHighestRow (); // 循环获取表中的数据，$currentRow表示当前行，从哪行开始读取数据，索引值从0开始
			for($currentRow = 2; $currentRow <= $allRow; $currentRow ++)
			{ // 从哪列开始，A表示第一列
				for($currentColumn = 'A'; $currentColumn <= $allColumn; $currentColumn ++) {
				// 数据坐标
				$address = $currentColumn . $currentRow;
				// 读取到的数据，保存到数组$arr中
				$data [$currentRow] [$currentColumn] = $currentSheet->getCell ( $address )->getValue (); } }
				foreach($data as $k=>$v){
				foreach ($v as $key=>$value){
					if($value == ''){
					  echo '10'; exit;
					}
					$key=='A'?$result['ip']=$value:'';
					$key=='B'?$result['mIp']=$value:'';
					$key=='C'?$result['startTime']=$this->excelTime($value):'';
					$key=='D'?$result['endTime']=$this->excelTime($value):'';
					$key=='E'?$result['useDetail']=$value:'';
					$key=='F'?$result['os']=$value:'';
					$key=='G'?$result['cpu']=$value:'';
					$key=='H'?$result['memory']=$value:'';
					$key=='I'?$result['disk']=$value:'';
					$key=='J'?$result['userEmail']=$value:'';
					$key=='k'?$result['isShared']=$value:'';
					$key=='L'?$result['computerType']=$value:'';
					$key=='M'?$result['isSafe']=$value:'';
					$key=='N'?$result['area']=$value:''; 
				}
				$computer = M ( 'computer_info' );		
				$res = $computer->add ( $result ); 
			  }
			  $logs = M ( 'logs_info' );
			  $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '批量上传了excl'.$move_file_name;
			  $logs->add ( $logsData );
			 echo $res; exit;
            }
	    else { $this->error ( "请选择上传的文件" );
	   }
	}
	
	function excelTime($date, $time = false) {
		if (function_exists ( 'GregorianToJD' )) {
			if (is_numeric ( $date )) {
				$jd = GregorianToJD ( 1, 1, 1970 );
				$gregorian = JDToGregorian ( $jd + intval ( $date ) - 25569 );
				$date = explode ( '/', $gregorian );
				$date_str = str_pad ( $date [2], 4, '0', STR_PAD_LEFT ) . "-" . str_pad ( $date [0], 2, '0', STR_PAD_LEFT ) . "-" . str_pad ( $date [1], 2, '0', STR_PAD_LEFT ) . ($time ? " 00:00:00" : '');
				return $date_str;
			}
		} else {
			$date = $date > 25568 ? $date + 1 : 25569;
			/* There was a bug if Converting date before 1-1-1970 (tstamp 0) */
			$ofs = (70 * 365 + 17 + 2) * 86400;
			$date = date ( "Y-m-d", ($date * 86400) - $ofs ) . ($time ? " 00:00:00" : '');
		}
		return $date;
	}

	/**
	 * 物理机费用导出
	 */
	public function exportComputersCosts(){
		header("Content-type:text/html;charset=utf8");
		set_time_limit(0);
		$bigTeams = getBigTeams();
		$sheetsName = array_merge(array("大组物理机成本汇总","小组物理机成本汇总"),$bigTeams);
		$xlsName = "物理机导出";
		$expTableData = array();
		$summery = array();
		$xlsCell = array();
		foreach($sheetsName as $key=>$value){
			$list = array();
			if($value == "大组物理机成本汇总"){
				//$summery[] = "大组汇总 Export time".date("Y-m-d H:i:s");
				$xlsCell[] = array (
	                array ('teamName','组名' ),
	                array ('standardNum','标准物理机数' ),
	                array ('p40Num','4GPU物理机数' ),
	                array ('totalfees','费用(元)' )
	            );
				foreach($bigTeams as $bk => $bv){
					$list[$bk] = $this->calculateCosts($bv , "like");
				}
			}else if( $value == "小组物理机成本汇总" ){
				//$summery[] = "小组汇总 Export time".date("Y-m-d H:i:s");
				$xlsCell[] = array (
	                array ('teamName','组名' ),
	                array ('standardNum','标准物理机数' ),
	                array ('p40Num','4GPU物理机数' ),
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
					$list [$tk] = $this->calculateCosts($tv, 'eq');
				}
			}else if ( $value == "项目信息物理机汇总" ){
				$xlsCell[] = array (
	                array ('useDetail','项目信息' ),
	                array ('standardNum','标准物理机数' ),
	                array ('p40Num','4GPU物理机数' ),
	                array ('totalfees','费用(元)' ),
	                array ('userTeam','组名' )
	            );
				$sql = "select a.useDetail,a.cpu,b.userTeam from pmo_computer_info a left join pmo_user_info b on a.userEmail=b.userEmail where a.isDelete=1";
				$data = M()->query($sql);
				foreach($data as $dk => $dv){
					if(empty($list)){
						if(strpos($value['cpu'],'4×P40')===false){
							$dv['standardNum'] = 1;
							$dv['p40Num'] = 0;
						}else{
							$dv['standardNum'] = 0;
							$dv['p40Num'] = 1;
						}
						$list[] = $dv;
					}else{
						$have = 0;
						foreach($list as $nk => $nv){
							if( $nv['userTeam'] == $dv['userTeam'] && $nv['useDetail'] == $dv['useDetail'] ){
								if( strpos($dv['cpu'],'4×P40')===false ){
									$list[$nk]['standardNum'] = $list[$nk]['standardNum']+1;
								}else{
									$list[$nk]['p40Num'] = $list[$nk]['p40Num']+1;
								}
								$have++;
							}
						}
						if($have==0){
							if(strpos($dv['cpu'],'4×P40')===false){
								$dv['standardNum'] = 1;
								$dv['p40Num'] = 0;
							}else{
								$dv['standardNum'] = 0;
								$dv['p40Num'] = 1;
							}
							$list[] = $dv;
						}
					}
				}

				foreach($list as $lk =>$lv){
					$list[$lk]['totalfees'] = getComputerCost($lv['standardNum'] ,$lv['p40Num'] );
				}

			}else{
				$xlsCell[] = array (
	                array ('userName','使用员工' ),
	                array ('userEmail','员工邮箱' ),
	                array ('userTeam','员工所在小组' ),
	                array ('mIp','管理口IP' ),
	                array ('ip','IP' ),
	                array ('startTime','申请时间' ),
	                array ('endTime','约定归还时间' ),
	                array ('useDetail','用途说明' ),
	                array ('computerType','机器类型' )
	            );
	            $userEmails = M("user_info")->where("userTeam like '%" . $value . "%'")->getField("userEmail",true);
	            $con['userEmail'] = implode('","', $userEmails);
				$computer = M ( 'computer_info' );
				$list = $computer->query ( 'SELECT userName,pmo_computer_info.userEmail, userTeam, mIp,ip, startTime, endTime, useDetail, computerType
											FROM pmo_user_info
											JOIN pmo_computer_info ON pmo_user_info.userEmail = pmo_computer_info.userEmail and pmo_computer_info.isDelete=1 and
											pmo_computer_info.userEmail in ("'.$con["userEmail"] . '")');
				foreach ( $list as $k => $v ) {
					$list [$k] ['computerType'] = $v ['computerType'] == '1' ? '长期用机' : '临时用机' ;
				}
			}
			$expTableData [$key] = $list;
		}
		//print_r($expTableData);exit;
		$logs = M ( 'logs_info' );
        $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '导出物理机汇总';
        $logs->add ( $logsData );
        exportMultiSheetExcel ( $xlsName, $sheetsName, $summery, $xlsCell, $expTableData );
	}

	function calculateCosts($teamName , $type){
		if($type == "eq"){
			$where = "userTeam = '" . $teamName . "'";
		}else{
			$where = "userTeam like '%" . $teamName . "%'";
		}			
		$emails = M("user_info")->where($where)->getField("userEmail",true);
		$newWhere['userEmail'] = array( "in" ,$emails );
		$newWhere['isDelete'] = 1;
		$data = M("computer_info")->where($newWhere)->select();
		$standardNum = 0; $p40Num = 0;
		foreach($data as $key => $value ){
			if(strpos($value['cpu'],'4×P40')===false){
				$standardNum++;
			}else{
				$p40Num++;
			}
		}
		$res ['teamName'] = $teamName;
		$res ['standardNum'] = $standardNum;
		$res ['p40Num'] = $p40Num;
		$res ['totalfees'] = getComputerCost($standardNum ,$p40Num );
		return $res;
	}
	/**
	 * 更新物理机信息
	 */
	public function addComputerExcl1(){
		if( !empty ( $_FILES ) ) {
            $uploadPath = './Public/upload/';
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
            if( $exts == 'xls' ) {
                import( "ORG.Util.PHPExcel.Reader.Excel5" );
                $PHPReader = new \PHPExcel_Reader_Excel5 ();
            }else if( $exts == 'xlsx' ) {
                import( "ORG.Util.PHPExcel.Reader.Excel2007" );
                $PHPReader = new \PHPExcel_Reader_Excel2007 ();
            }else {
                echo '9';
                exit;
            }
            $PHPExcel = $PHPReader->load( $move_file_name );
            $currentSheet = $PHPExcel->getSheet( 0 );
            $allColumn = $currentSheet->getHighestColumn();
            $allRow = $currentSheet->getHighestRow();
            for( $currentRow = 2; $currentRow <= $allRow; $currentRow++ ) {
            	$data['hostName'] = $currentSheet->getCell( 'E' . $currentRow )->getValue();
            	$data['ip'] = $currentSheet->getCell( 'H' . $currentRow )->getValue();
            	$data['os'] = $currentSheet->getCell( 'J' . $currentRow )->getValue();
            	$data['rootPassword'] = $currentSheet->getCell( 'O' . $currentRow )->getValue();
            	$where['ip'] = $data['ip'];
            	$where['isDelete'] = 1;
            	$info = M("computer_info")->where($where)->find();
            	if(!empty($info)){
            		$res = M("computer_info")->where($where)->save($data);
            	}
            }
            $logs = M ( 'logs_info' );
	     	$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '更新物理机信息';
	     	$logs->add( $logsData );
    		echo $res;
    		exit;
        }else{
        	//上传文件不存在
    		echo 0;
    		exit;
        }
	}

}