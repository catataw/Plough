<?php

class EmployeeAction extends Action {
    /**
     * 导入外协人员信息
     */
    public function inportExcel() {
        if( !empty ( $_FILES ) ) {
            // 上传excl
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
            // 如果excel文件后缀名为.xls，导入这个类
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
            // 载入文件
            $PHPExcel = $PHPReader->load( $move_file_name );
            // 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
            $currentSheet = $PHPExcel->getSheet( 0 );
            // 获取总列数
            $allColumn = $currentSheet->getHighestColumn();
            // 获取总行数
            $allRow = $currentSheet->getHighestRow();
            for( $currentRow = 2; $currentRow <= $allRow; $currentRow++ ) {

                $data['employeeId'] = $currentSheet->getCell( 'A' . $currentRow )->getValue();
                $data['employeeName'] = $currentSheet->getCell( 'B' . $currentRow )->getValue();
                $data['employeeCompany'] = $currentSheet->getCell( 'C' . $currentRow )->getValue();
                $data['getInTime'] = $this->excelTime( $currentSheet->getCell( 'D' . $currentRow )->getValue() );
                $data['level'] = $currentSheet->getCell( 'E' . $currentRow )->getValue();
                $data['workType'] = $currentSheet->getCell( 'F' . $currentRow )->getValue();
                $data['location'] = $currentSheet->getCell( 'G' . $currentRow )->getValue();
                $data['phoneNum'] = $currentSheet->getCell( 'H' . $currentRow )->getValue();
                $data['locatedTeam'] = $currentSheet->getCell( 'I' . $currentRow )->getValue();
                $data['teamLeader'] = $currentSheet->getCell( 'J' . $currentRow )->getValue();
                $data['bigTeamLeader'] = $currentSheet->getCell( 'K' . $currentRow )->getValue();
                $data['email'] = $currentSheet->getCell( 'L' . $currentRow )->getValue();
                $data['detail'] = $currentSheet->getCell( 'M' . $currentRow )->getValue();
                //判断是否存在 存在更新 不存在添加
                $f_where['employeeName'] = $data['employeeName'];
                $f_where['employeeId'] = $data['employeeId'];
                if( M( 'employee' )->where( $f_where )->find() ) {
                    //save
                    $res = M( 'employee' )->where( $f_where )->save( $data );
                    if( $res === false ) {
                        $logs = M( 'logs_info' );
                        $logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '上传更新外协人员失败,原因:' . M( 'employee' )->getError();
                        $logs->add( $logsData );
                    }else {
                        $logs = M( 'logs_info' );
                        $logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '上传更新了外协人员';
                        $logs->add( $logsData );
                    }

                }else {
                    //add
                    $res = M( 'employee' )->add( $data );
                    if( $res === false ) {
                        $logs = M( 'logs_info' );
                        $logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '增加外协人员失败,原因:' . M( 'employee' )->getError();
                        $logs->add( $logsData );
                    }else {
                        $logs = M( 'logs_info' );
                        $logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '上传增加了外协人员';
                        $logs->add( $logsData );
                    }
                }
            }
            $result['status'] = 1;
            echo json_encode($result);
        }else {
            //上传文件不存在
            echo 0;
            exit;
        }
    }

    /*
     * 导入外协考勤
     */
    public function inportAtendance(){
    	if( !empty ( $_FILES ) ) {
    		// 上传excl
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
    		// 如果excel文件后缀名为.xls，导入这个类
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
    		// 载入文件
    		$PHPExcel = $PHPReader->load( $move_file_name );
    		// 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
    		$currentSheet = $PHPExcel->getSheet( 0 );
    		// 获取总列数
    		$allColumn = $currentSheet->getHighestColumn();
    		// 获取总行数
    		$allRow = $currentSheet->getHighestRow();
    		for( $currentRow = 2; $currentRow <= $allRow; $currentRow++ ) {
    			$data['date'] = $this->excelTime($currentSheet->getCell( 'A' . $currentRow )->getValue());
    			$data['employeeId'] = $currentSheet->getCell( 'B' . $currentRow )->getValue();
    			$startTime = $currentSheet->getCell( 'C' . $currentRow )->getValue();
    			$data['startTime'] = $this->excelTime($currentSheet->getCell( 'A' . $currentRow )->getValue()).' '.$startTime;;
    			$tEndTime = $currentSheet->getCell( 'D' . $currentRow )->getValue();
    			$data['endTime']  = $this->excelTime($currentSheet->getCell( 'A' . $currentRow )->getValue()).' '.$tEndTime;
    			$f_where['employeeId'] = $data['employeeId'];
    			$f_where['date'] = $data['date'];
    			if( M( 'employee_attendance' )->where( $f_where )->find() ) {
    				//save
    				$res = M( 'employee_attendance' )->where( $f_where )->save( $data );
    			}else {
    				//add
    				$res = M( 'employee_attendance' )->add( $data );
    			}
    		}
    		$logs = M( 'logs_info' );
    		$logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '上传增加了外协人员'.$move_file_name;
    		$logs->add( $logsData );
    		$result = array();
    		$result['status'] = 1;
    		echo json_encode($result);
    		exit;
    	}else {
    		//上传文件不存在
    		echo 0;
    		exit;
    	}
    }
    
    protected function excelTime( $date, $time = false ) {
        if( function_exists( 'GregorianToJD' ) ) {
            if( is_numeric( $date ) ) {
                $jd = GregorianToJD( 1, 1, 1970 );
                $gregorian = JDToGregorian( $jd + intval( $date ) - 25569 );
                $date = explode( '/', $gregorian );
                $date_str = str_pad( $date [2], 4, '0', STR_PAD_LEFT ) . "-" . str_pad( $date [0], 2, '0', STR_PAD_LEFT ) . "-" . str_pad( $date [1], 2, '0', STR_PAD_LEFT ) . ( $time ? " 00:00:00" : '' );

                return $date_str;
            }
        }else {
            $date = $date > 25568 ? $date + 1 : 25569;
            $ofs = ( 70 * 365 + 17 + 2 ) * 86400;
            $date = date( "Y-m-d", ( $date * 86400 ) - $ofs ) . ( $time ? " 00:00:00" : '' );
        }

        return $date;
    }
    
    
    /**
     * 导出外协信息
     */
     public function exportEmployee(){
     	$projects = M('employee')->select();
     	$xlsName = '大数据外协信息汇总';
     	$xlsCell = array(
     			array (
     					'employeeId',
     					'外协编号'
     			),
     			array (
     					'employeeName',
     					'外协姓名'
     			),
     			array (
     					'employeeCompany',
     					'厂商'
     			),
     			array (
     					'getInTime',
     					'入职时间'
     			),
     			array (
     					'leaveTime',
     					'离职时间'
     			),
     			array (
     					'level',
     					'级别'
     			),
     			array (
     					'workType',
     					'职位'
     			),
     			array (
     					'location',
     					'所在地'
     			),
     			array (
     					'locatedTeam',
     					'所在团队'
     			),
     			array (
     					'teamLeader',
     					'小组长'
     			),
     			array (
     					'bigTeamLeader',
     					'大组长'
     			),
     			array (
     					'email',
     					'邮箱'
     			),
     			array (
     					'detail',
     					'备注'
     			),
     			array (
     					'phoneNum',
     					'手机号码'
     			),
     	);
     	$logs = M ( 'logs_info' );
     	$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '下载外协总单';
     	$logs->add( $logsData );
     	exportExcel( $xlsName, $xlsCell, $projects );
     }
    
    /**
     * 所有雇员信息
     */
    public function allEmployee() {
    	$userName = session('userName');
    	$employee = M( 'employee' );
    	$user_where['userName'] = $userName;
    	$userInfo = M('user_info')->where($user_where)->select();
    	$userType = $userInfo[0]['userType'];
    	if($userType == '2'||$userType == '3'){
    		$employee = $employee->select();
    	}else if($userType == '4'||$userType == '1'){
    		$teamLeader['teamLeader'] = $userName;
    		$employee = $employee->where($teamLeader)->select();
    	}
        foreach($employee as $k=>$v){
        	if(strlen($v['employeeId']) == 1){
        		$employee[$k]['employeeId'] = '00'.$v['employeeId'];
        	}else if(strlen($v['employeeId']) == 2){
        		$employee[$k]['employeeId'] = '0'.$v['employeeId'];
        	}else{
        		$employee[$k]['employeeId'] = $v['employeeId'];
        	}
        }
        echo json_encode( $employee );
    }
    
    /**
     * 获取组长的雇员
     * 
     */
    public function getTeamEmployee(){
    	$userName = session('userName');
    	$employee = M( 'employee' );
    	$user_where['userName'] = $userName;  
    	$userInfo = M('user_info')->where($user_where)->select();
    	$userType = $userInfo[0]['userType'];
        if($userType == '2'||$userType == '3'){
        	$employee = $employee->select();
        }else if($userType == '4'||$userType == '1'){
        	$teamLeader['teamLeader'] = $userName;
        	$employee = $employee->where($teamLeader)->select();
        }
        
        return $employee;
    }
    
    /*
     *  获取雇员得分
     */
    public function SomeEmployeeScore() {
    	$postData = file_get_contents( 'php://input' );
    	$data = json_decode( htmlspecialchars_decode( $postData ), TRUE );
    	$date = $data['date'];
    	$employees = $this->getTeamEmployee();
    	
    	$employeesScore = array();
    	foreach($employees as $k=>$v){
    		if(strlen($v['employeeId']) == 1){
    			$employeeId = '00'.$v['employeeId'];
    		}else if(strlen($v['employeeId']) == 2){
    			$employeeId = '0'.$v['employeeId'];
    		}else{
    			$employeeId = $v['employeeId'];
    		}
    		$oneScoreInfo = $this->getEmployeeScore($date,$employeeId);
    		$oneScoreInfo[0]['employeeName'] = $v['employeeName'];
    		array_push($employeesScore,$oneScoreInfo[0]);
    	}
    	echo json_encode($employeesScore);
    }
    
    /**
     * 添加雇员信息
     */
    public function addEmployee(){
    	$postData = file_get_contents( 'php://input' );
    	$data = json_decode( htmlspecialchars_decode( $postData ), TRUE );
    	if($data){
    		$employee =M('employee');
    		$employee->add ( $data );
    		$logs = M( 'logs_info' );
    		$logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '添加了编号为'.$data['employeeId'].'的外协人员';
    		$logs->add( $logsData );
    		echo 1;
    	}else{
    		echo 0;
    	}
    }
    
    
    /**
     * 更新雇员信息
     */
    public function updateEmployee() {
        $postData = file_get_contents( 'php://input' );
        $data = json_decode( htmlspecialchars_decode( $postData ), TRUE );

        $res = M( 'employee' )->save( $data );
        if($res === false){
            $logs = M( 'logs_info' );
            $logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '更新外协人员'. $data['employeeName'] .'的信息失败，原因:' . M('employee')->getError();
            $logs->add( $logsData );
        }else{
        	echo "1";
            $logs = M( 'logs_info' );
            $logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '更新了外协人员'. $data['employeeName'] .'的信息';
            $logs->add( $logsData );
        }
    }
    
    
    /**
     * 雇员打分
     */
    public function scoreEmployee($scoreInfo){
    	$date = $scoreInfo['date'];
    	$timeStr = strtotime($date);
    	$month = date('m', $timeStr);
    	$year = date('Y', $timeStr);
    	$days = $this->getTotalDays($month, $year);
    	$left_date = $year . '-' . $month . '-' . 1;
    	$right_date = $year . '-' . $month . '-' . $days;
    	$where['employeeId'] = $scoreInfo['employeeId'];
    	$where['date'] = array('between',array($left_date, $right_date));
    	$employee_date = M('employee_date')->where($where)->select();
    	if($employee_date){
    		$res =  M('employee_date')->where( $where )->save( $scoreInfo );
    	}else{
    		$res =  M('employee_date')->add( $scoreInfo );
    		
    	}
    	$logs = M( 'logs_info' );
    	$logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '为'. $scoreInfo['employeeId'] .'打分';
    	$logs->add( $logsData );
    	return 1;
    }
    
    
    public function scoreEmployees(){
    	$postData = file_get_contents ( "php://input" );
    	$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        if($data['score']){
        	foreach ($data['score'] as $k=>$v){
        		$res = $this->scoreEmployee($v);
        	}
        }
        if($res){
        	echo 1;exit;
        }
    }

    /**
     * @param 一个月份的任意日期
     */
    public function getAttendance()
    {
    	$postData = file_get_contents ( "php://input" );
    	$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
    	$date = $data['writeTime'];
    	$timeStr = strtotime($date);
    	$month = date('m', $timeStr);
    	$year = date('Y', $timeStr);
    	$days = $this->getTotalDays($month, $year);
    	$left_date = $year . '-' . $month . '-' . 1;
    	$right_date = $year . '-' . $month . '-' . $days;
    	$where['employeeId'] = $data['employeeId'];
    	$where['date'] = array('between',array($left_date, $right_date));
    	$infos = M('employee_attendance')->where($where)->select();
    	
    	//找到该员工对应月份所有的工时记录
    	$realArr = $this->employeeWorkTime($infos, $month, $date);    	
    	echo json_encode($realArr);
    }
    
    /**
     * @param $infos 查询到的工时记录
     * @param $needMonth 需要查询的月份
     * @param $days 该月的总天数
     * @param $date 该月份的任意一个日期
     * @return array
     */
    protected function employeeWorkTime($infos, $needMonth, $date)
    {
    	$weekarray = week_array();
    	$dealInfo = array();
    	foreach($infos as $key => $info){
    		$timeStr = strtotime($info['date']);
    		$month = date('m', $timeStr);
    		if($month == $needMonth){
    			//说明该条记录是在时间范围内 添加星期记录
    			$week = '星期' . $weekarray[date('w', $timeStr)];
    			$info['week'] = $week;
    			//获取第几天
    			$info['day'] = date('d', $timeStr);
    			$info['date'] = date('Y-m-d',$timeStr);
    			$dealInfo[] = $info;
    		}
    	}

    	//对满足日期的工时记录按每天来统计
    	$realArr = $this->dealWorkTime($dealInfo, $date);
    	return $realArr;
    }
    /**
     * 获取雇员分数
     */
    public function getEmployeeScore($date,$employeeId){
    	if(!$date||!$employeeId){
    		return;
    	}
    	$timeStr = strtotime($date);
    	$month = date('m', $timeStr);
    	$year = date('Y', $timeStr);
    	$days = $this->getTotalDays($month, $year);
    	$left_date = $year . '-' . $month . '-' . 1;
    	$right_date = $year . '-' . $month . '-' . $days;
    	$where['employeeId'] = $employeeId;
    	$where['date'] = array('between',array($left_date, $right_date));
    	$employee_date= M('employee_date');
    	$scoreInfo = $employee_date->where($where)->select();
    	if(!$scoreInfo){
    		$scoreInfo[0]['employeeId'] = $employeeId;
    		$scoreInfo[0]['date'] = $date;
    		$scoreInfo[0]['score'] = 0;
    	}
    	return $scoreInfo;
    }
    
    
    
    /**
     * @param $dealInfo 满足对应员工时间段的工时信息
     * @param $date 某个月份的任意日期
     */
    protected function dealWorkTime($dealInfo, $date)
    {
    	$requestArr = array();

    	foreach($dealInfo as $key => $info){
    		if($info){
    			$dealInfo[$key]['workTime'] =floor ((strtotime($info['endTime'])-strtotime($info['startTime']) )/3600);
    			 
    		}
    	}
    	$realArr = $this->splitArr($dealInfo, $date);
    	return $realArr;
    }
    
    /**
     * @param $month 月份
     * @param $year 年份
     * @return int 该月的天数
     */
    protected function getTotalDays($month, $year)
    {
    	if( in_array($month , array( 1 , 3 , 5 , 7 , 8 , 01 , 03 , 05 , 07 , '08' , 10 , 12))) {
    		return 31;
    	} elseif( $month == 02 || $month == 2)
    	{
    		//判断是否是闰年
    		if ( $year%400 == 0 || ($year%4 == 0 && $year%100 !== 0) ) {
    			return 29;
    		} else {
    			return 28;
    		}
    	} else {
    		return 30;
    	}
    }
    
    
    /**
     * @param $requestArr 需要拆分的数组
     * @param $date 某个月份的任意日期
     */
    protected function splitArr($requestArr, $date)
    {
    	//小于总天数 将数据填充
    	$dayArr = array();
    	$timeStr = strtotime($date);
    	$year = date('Y', $timeStr);
    	$month = date('m', $timeStr);
    	//根据月份获取该月的总天数
    	$days = $this->getTotalDays($month, $year);
    	foreach($requestArr as $v){
    		array_push($dayArr,$v['day']);
    	}
    	if(count($requestArr) < $days){
    		for($i = 1; $i <= $days; ++$i){
    			if(!in_array($i,$dayArr)){
    				//需要填充
    				$time = $year . '-' . $month . '-' . $i;
    				$str = strtotime($time);
    				$data['date'] = $time;
    				$data['workTime'] = 0;
    				$weekarray = week_array();
    				$week = '星期' . $weekarray[date('w', $str)];
    				$data['week'] = $week;
    				$data['day'] = $i;
    				$requestArr[] = $data;
    			}
    		}
    	}
    	usort($requestArr, 'num_check');
    	return $requestArr;
    }
    
}