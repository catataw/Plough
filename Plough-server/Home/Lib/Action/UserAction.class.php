<?php
// 本类由系统自动生成，仅供测试用途
class UserAction extends Action {
	/**
	 * 用户登录
	 */
	public function login()
	{		
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		if ($data) {
			$user = M ( 'user_info' );
			// 组合查询条件
			$where = array ();
			$where ['isDelete'] = 1;
			$where ['userEmail'] = $data ['userEmail'];
			$where ['userPassword'] = md5 ( $data ['userPassword'] );
			$result = $user->where ( $where )->field ( 'id,userName,userType,userEmail,userTeam,userPassword' )->find ();
			$whereM['isDelete'] =1;
			$whereM['userEmail'] =$data ['userEmail'];
			$whereM['userPassword'] =$data ['userPassword'];
			$resultM = $user->where ( $whereM )->field ( 'id,userName,userType,userEmail,userTeam,userPassword' )->find ();
			$result?'':$result=$resultM;
			// 验证用户名 对比 密码
			if ($result || $resultM) {
				// 存储session
				session ( 'id', $result ['id'] ); // 当前用户id
				session ( 'userName', $result ['userName'] ); // 当前用户昵称
				session ( 'userType', $result ['userType'] ); // 当前用户名
				session ( 'userEmail', $result ['userEmail'] );
				session('userTeam', $result['userTeam']);
				session('userPassword', $result['userPassword']);
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '登录系统';
				$logsData [logType] = 2;
				$logs->add ( $logsData );
				echo json_encode ( $result );
				exit ();
			} else {
				echo 0;
				exit ();
			}
		} else {
			if (session ( 'id' ) && 			// 当前用户id
			session ( 'userName' ) && 			// 当前用户昵称
			session ( 'userType' ) && 			// 当前用户名
			session ( 'userEmail' )) {
				$result ['id'] = session ( 'id' );
				$result ['userName'] = session ( 'userName' );
				$result ['userType'] = session ( 'userType' );
				$result ['userEmail'] = session ( 'userEmail' );
				$result ['userTeam'] = session ( 'userTeam' );
				$result ['userPassword'] = session ( 'userPassword' );
				echo json_encode ( $result );
				exit ();
			} else {
				echo 0;
				exit ();
			}
		}
	}
	// 获取所有用户信息
	public function getAllUsers() {
		
		$user = M ( 'user_info' );
		$result = $user->query ( 'SELECT * FROM pmo_user_info where isDelete = 1 and workId like "%0392%" order by workId asc;' );
		echo json_encode ( $result );
		exit ();
	}
	// 编辑用户信息
	public function editUsers() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$user = M ( 'user_info' );
		$where ['userPassword'] = $data ['userPassword'];
		$where ['id'] = $data ['id'];
		$isChangePassword = $user->where ( $where )->field ( 'id,userName,userType,userEmail' )->find ();
		// 验证用户名 对比 密码
		if ($isChangePassword) {
			$result = $user->where ( 'id=' . $data ['id'] )->save ( $data );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '修改' . $data ['userName'] . '用户信息';
			$logs->add ( $logsData );
			echo $result;
			exit ();
		} else {
			$data ['userPassword'] = md5 ( $data ['userPassword'] );
			$result = $user->where ( 'id=' . $data ['id'] )->save ( $data );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '修改' . $data ['userName'] . '用户信息';
			$logs->add ( $logsData );
			echo $result;
			exit ();
		}
	}
	

	
	/**
	 * 导入添加更新员工信息
	 */
	public function addUserExcl() {
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
				for($currentColumn = 'B'; $currentColumn <= $allColumn; $currentColumn ++) {
					// 数据坐标
					$address = $currentColumn . $currentRow;
					// 读取到的数据，保存到数组$arr中
					$data [$currentRow] [$currentColumn] = $currentSheet->getCell ( $address )->getValue ();
				}
			}
            $this->addUser($data);
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '导入员工信息';
            $logs->add ( $logsData );
            $res = array('status'=>1,'info'=>'员工导入完成');
			echo json_encode($res);
			exit;
		} else {
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '导入员工信息失败，原因:未获取到上传文件';
            $logs->add ( $logsData );
			$this->error ( "请选择上传的文件" );
			$res = array('status'=>0,'info'=>'未获取到上传文件');
			echo json_encode($res);
		}
	}
	
	/**
	 *
	 * @param $data excel读取到的员工的信息数组        	
	 */
	protected function addUser($data) {		
		$first_team ['userTeam'] = $data [2] ['D'] . '-' . $data [2] ['E'];
		$first_team ['flag'] = 0;
		foreach ( $data as $k => $v ) {
			unset ( $result );
			foreach ( $v as $key => $value ) {
				$key == 'B' ? $result ['userName'] = trim ( $value ) : '';
				$key == 'C' ? $result ['workId'] = $value : '';
				$key == 'D' ? $result ['userTeam'] = ($v ['E'] == '' ? $value : $value . '-' . $v ['E']) : '';
				$key == 'F' ? $result ['telphone'] = $value : '';
				$key == 'G' ? $result ['shortNum'] = $value : '';
				$key == 'H' ? $result ['userEmail'] = $value : '';
			}
			$user = M ( 'user_info' );
			$where ['userEmail'] = $result ['userEmail'];
			$result['userType'] = 1;
			$record = $user->where ( $where )->find ();
			// 不存在用户，添加
			if (! $record) {
				$result ['userPassword'] = md5 ( '123456' ); // 初始默认密码
				$user->add ( $result );
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '批量添加'.$result ['userName'];
			}else{
				unset($result['userType']);
				$user->where($where)->save($result);
				
			}
              
			
		}
	}
    /**
     * 查询员工的所在项目
     */
    public function findUserProject()
    {
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        $userName = $data['userName'];
    }
	/**
	 * 用户注销
	 */
	public function logout()
	{
		// 清除所有session
		$logs = M ( 'logs_info' );
		$logsData[logType] = 2;
		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '登出系统';
		$logs->add ( $logsData );
		session(null);
		echo "1";exit;
	}

    /**
     * 获取所有大数据产品部的人员信息
     */
    public function getAllperson()
    {
        $where['userTeam'] = array('like', '大数据产品部%');
        $where['isDelele'] = 1;
        $users = M('user_info')->where($where)->select();
        $allPerson = '';
        foreach($users as $key => $user){
            if($allPerson == ''){
                $allPerson .= $user['userName'];
            }else{
                $allPerson .= ',' . $user['userName'];
            }
        }
        echo $allPerson;
    }
    
    
    
    /**
     * 提供外协系统，获取所有大数据员工信息
     */

    public function getAllColleage(){
    	$where['userTeam'] = array('like', '大数据产品部%');
    	$where['isDelele'] = 1;
    	$users = M('user_info')->where($where)->select();
    	echo json_encode($users);
    }
    
    /**
     *获取成员的信息(工时填报情况)
     */
    public function getAllUserInfo()
    {
        $team = '大数据产品部';
        //获取该部门的所有成员
        if( session('userType') == 2 || session('userType') == 3 ) {
        	
        	$users = M('user_info')->query('select * from pmo_user_info where isDelete = 1 and userTeam like "大数据产品部%"');
            
        }else if( session('userType') == 5){
        	//获取所有小组
        	$allTeamSql = 'select teamName from pmo_teams where bigTeamLeader="'.session('userName').'"';
        	$teamsInfo = M('teams')->query($allTeamSql);
        	foreach ($teamsInfo as $val){
        		$teams[] = $val['teamName'];
        	}

        	$where['userTeam'] = array('in',$teams);
        	$users = M('user_info')->where($where)->select();

        	//$users = M('user_info')->query('select * from pmo_user_info where isDelete = 1 and userTeam like "大数据产品部%"');
        }
        else {
        	//如果是平台组，陈熹伟可以看全部
        	if(session('userName')=='陈熹伟'||session('userName')=='范亚琼'){
        		$users = M('user_info')
        		->query('select * from pmo_user_info where isDelete = 1 and userTeam like "大数据产品部/平台组%"');
        	}else{
        		$users = M('user_info')
        				->query('select * from pmo_user_info where isDelete = 1 and userTeam ="'.session('userTeam').'"');
        	}
        }
        //去组长表查询组长名
        foreach($users as $key => &$user){
            $where['teamName'] = $user['userTeam'];
            $res = M('teams')->where($where)->find();
            $user['teamLeader'] = $res['teamLeader'];
        }
        echo json_encode($users);
    }

    /**
     * 获取个人某个月份的工时填报情况
     */
    public function getOnePeopleProcess()
    {
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        $userName = $data['userName'];
        $date['left_time'] = $data['startTime'];
        $date['right_time'] = $data['endTime'];

        $jobtime = new JobtimeAction();
        $week = $jobtime->getMonthArr($date, false); //该月份的工作日
        $totalHours = count($week) * 8; //该月需要的总时间
        $left_time = $week[0];
        $right_time = $week[count($week) - 1];
        $where['date'] = array(array('EGT', $left_time),array('ELT', $right_time));
        $where['workerName'] = $userName;
        $jobRecords = M('job_time')->where($where)->select();
        //每天的工作总工时
        $everyDayTime = array();
        foreach($week as $k => $day){
            $everyDayTime[$day] = 0;
        }
        foreach($jobRecords as $record){
            foreach($everyDayTime as $key => &$every){
                if(strtotime($key) == strtotime($record['date'])){
                    $every += $record['workTime'];
                }
            }
        }
        unset($every);
        //处理时间 >8 为 8  <8 不处理
        $recordTime = 0;
        foreach($everyDayTime as $key => &$every){
            if($every > 8){
                $every = 8;
            }
            $recordTime += $every;
        }
        $percent = round($recordTime / $totalHours, 2);
        echo $percent*100;
    }
    
    
    /*
     * 删除员工
     */
    public function deleteUser(){
    	$postData = file_get_contents ( "php://input" );
    	$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
    	$user = M('user_info');
    	$data['isDelete'] = 2;
    	$result = $user->where ( 'id=' . $data ['id'] )->save ( $data );
    	$logs = M ( 'logs_info' );
    	$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '删除' . $data ['userName'] . '用户信息';
    	$logs->add ( $logsData );
    	echo $result;
    	
    }
    
    /**
     * 添加单个员工
     */
    public function addOneUser(){
    	$postData = file_get_contents ( "php://input" );
    	$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
    	$user = M('user_info');
    	$where['workId'] = $data['workId'];
        $record = $user->where($where)->select();
        if(!$record&&$data['userName']&&$data['userPassword']&&$data['userEmail']&&$data['userTeam']&&$data['telphone']){
        	$data['userPassword'] = md5(trim($data['userPassword']));
        	$data['userName'] = trim($data['userName']);
        	$data['userEmail'] = trim($data['userEmail']);
        	$data['userTeam'] = trim($data['userTeam']);
        	$data['telphone'] = trim($data['telphone']);
        	$data['workId'] = trim($data['workId']);
        	
        	$result = $user->add($data);
        	$logs = M ( 'logs_info' );
        	$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加了' . $data ['userName'] . '用户信息';
        	$logs->add ( $logsData );
        	echo $result;
        }else{
        	echo 0;
        }
    }
    
    /**
     * 添加平台组员工
     */
    public function addPlatformUser(){
    	$postData = file_get_contents ( "php://input" );
    	$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
    	/*$data['userName']='平台组添加-吴辉';
    	$data['userEmail']='dongjun@cmss.chinamobile.com';
    	$data['userTeam']='大数据产品部/平台组/安全组';
    	$data['telphone']='18896724181';
    	$data['workId']='03920217';
    	echo json_encode($data);exit;*/
    	//验证数据
    	$_rexp = array (
    			'userName'=>'/^平台组添加\-\S+$/',
    			'userEmail'=>'/^\w+\@cmss\.chinamobile\.com$/',
    			'userTeam'=>'/^大数据产品部\/平台组\/\S+$/',
    			'telphone'=>'/^1[34578]\d{9}$/',
    			'workId'=>'/^0392\d{4}$/',
    	);
    	foreach($_rexp as $key => $value){
    		if(!preg_match($value, $data[$key])){
    			$this->ajaxReturn(array(),$key.'参数错误' , 0);
    		}
    	}
    	$user = M('user_info');
    	$where['workId'] = $data['workId'];
    	$record = $user->where($where)->select();
    	if(!$record){
    		$data['userPassword'] = md5('123456');
    		$data['userName'] = trim($data['userName']);
    		$data['userEmail'] = trim($data['userEmail']);
    		$data['userTeam'] = trim($data['userTeam']);
    		$data['telphone'] = trim($data['telphone']);
    		$data['workId'] = trim($data['workId']);
    		 
    		$result = $user->add($data);
    		$logs = M ( 'logs_info' );
    		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':'  . '平台组通过接口添加了' . $data ['userName'] . '用户信息';
    		$logs->add ( $logsData );
    		$this->ajaxReturn(array(),'成功添加'.$data['userName'] , 200);
    	}else{
    		$this->ajaxReturn(array(),'添加失败,重复用户'.$data['userName'] , 0);
    	}
    }
}