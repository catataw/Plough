<?php
class ProjectAction extends Action {


	
	public $maxMoney = 0;
	
	
	//更新总工时接口，凌晨3点自动运行
	public function calculateWorkTime(){
		$jobtime = M("job_time");
		$projects = M ( 'projects' );
		$data = $projects
			->where('risk !=""')
			->select();
		foreach ($data as $key=>$value){
			$whereLW['projectId'] = $value['projectId'];
			$whereLW['projectName'] = $value['projectName'];
			$value['totalWorkTime'] = $jobtime
			      ->where($whereLW)
			      ->sum("workTime");
			if($value['totalWorkTime']){
				$projects->where($whereLW)->save($value);
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' .'同步项目工时(' . $value ['projectName'] . ")";
				$logs->add ( $logsData );
			}
		}	
	}
	
	
	
	
	
	public function excelTime($date, $time = false) {
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
	 * 添加和修改项目评分信息
	 */
	public function changeProjectScore() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		if ($data ['id'] != '') {
			$score = M ( 'projects' );
			$result = $score->where ( 'id=' . $data ['id'] )->save ( $data );
			if ($result) {
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '修改项目(' . $data ['projectId'] . ")评分信息";
				$logs->add ( $logsData );
			}
			echo 200;
			exit ();
		}
	}


	/**
	 * 添加关注
	 */
	public function addConcernPeople(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$userEmail = $data['userEmail'];
		
		if($data['userEmail']&&$data['id']){
			$where['id'] = $data['id'];
			$Project = M( 'projects' )
			                 ->where($where)
			                 ->select();
			
			if($Project){
				$concernPeople['concernPeople']= str_replace($userEmail.",",'',$Project[0]['concernPeople']).$userEmail.",";
				$concernPeople['id'] = $data['id'];
				
				if(M( 'projects' )->where($where)->save($concernPeople)){
					$this->ajaxReturn(array(),'关注成功',1);
				}else{
					$this->ajaxReturn(array(),'关注失败',0);
				}
				
			}else{
					$this->ajaxReturn(array(),'项目编号错误',2);
				}
		}

	}
	
	/*
	 * 取消关注
	 * 
	 */
	public function cancelConcernPeople(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$userEmail = $data['userEmail'];
		if($data['userEmail']&&$data['id']){
			$where['id'] = $data['id'];
			$Project = M( 'projects' )
			->where($where)
			->select();
				
			if($Project){
				$concernPeople['concernPeople']= str_replace($userEmail.',','',$Project[0]['concernPeople']);
				$concernPeople['id'] = $data['id'];
		
				if(M( 'projects' )->where($where)->save($concernPeople)){
					$this->ajaxReturn(array(),'取关成功',1);
				}else{
					$this->ajaxReturn(array(),'取关失败',0);
				}
		
			}else{
				$this->ajaxReturn(array(),'项目编号错误',2);
			}
		}
		
	}
	
	

	/**
	 *	获取方案组项目信息
	 */
	public function getAllSolProject() {
		$userType = session('userType');
		$userTeam = session('userTeam');
		$userName = session('userName');
		$userEmail = session('userEmail');
		
		//判断是否有自定义
		$whereF['userEmail'] = $userEmail;
        $customFeild = M('project_custom_field')
                       ->where($whereF)
                       ->select(); 
        if($customFeild){
        	$fieldSql = $customFeild[0]['customField'].',id';
        }

        $fieldSql?$fieldArr = explode(',',$fieldSql):null;
        //过滤出上周进展字段
        $arrProcess=array('process','risk','lastWeekProgress','recentPlan','responseMeasures');
        
        if($fieldArr){
        	foreach ($arrProcess as $value){
        		$key = array_search($value,$fieldArr);
        		if($key>=0&&$fieldArr[$key]){
        			$processFieldArr[] = $fieldArr[$key];
        			unset($fieldArr[$key]);
        		}
        		$currentKey = array_search('currentProgress',$fieldArr);
        		if($currentKey>=0&&$fieldArr[$currentKey]){
        			$currentField[0] = $fieldArr[$currentKey];
        			unset($fieldArr[$currentKey]);
        		}
        	}
        }else{
        	$processFieldArr = $arrProcess;
        	$currentField[0] = 'currentProgress';
        }

        //主表自定义字段
        $projectField = implode(',',$fieldArr);

        //获取主表数据
		/*
		if(session('userEmail')!='zhangyujing@wx.bigcloudsys.com'&&session('userEmail')!='luoying321@139.com'){
			if($userType==3||$userType==2||$userType==5||$userName=='赵欣'){
				if($projectField){
					$data = M ( 'projects' )
					->field($projectField)
					->where('risk !=""')
					->select();
				}else{
					$data = M ( 'projects' )
					->where('risk !=""')
					->select();
				}
			}else{
				if($projectField){
					$data = M ( 'projects' )
						->field($projectField)
						->where('risk !="" and projectManagerId="'.$userName.'"')
						->select();
				}else{
					$data = M ( 'projects' )
						->where('risk !="" and projectManagerId="'.$userName.'"')
						->select();
				}
			}
		}*/
        if($projectField){
        	$data = M ('projects' )
        	->field($projectField)
        	->where('risk !=""')
        	->select();
        }else{
        	$data = M ('projects' )
        	->where('risk !=""')
        	->select();
        }


		foreach($data as $v){
			$where['relatedId'] = $value['id'];
			$oneProjectProcess =  M('project_process')
					->where($where)
					->order('id desc')
					->limit(2)
					->select();

			if($processFieldArr){
                foreach ($processFieldArr as $key=>$value){
                	$lastProcess[$value] = $oneProjectProcess[1][$value];
                }
                if(in_array('lastWeekProgress',lastWeekProgress)){
                	$lastProcess['lastWeekProgress'] = $oneProjectProcess[1]['lastWeekProgress'];
                }
			}
			if($currentField){
				$currentProgress['currentProgress'] =$oneProjectProcess[0]['currentProgress'];
			}
			

			$productTypeCount = M("project_product")->where($where)->Count();
			
			if($v['planFinishedTime']){
				if($v['planFinishedTime']>date('Y-m-t')){
					$v['isOverdue'] = '是';
				}else{
					$v['isOverdue'] = '否';
				}
			}else{
				$v['isOverdue'] = '';
			}

			$v['nodeCount'] = $v['nodeCount']?$v['nodeCount']:"0";
			$v['productTypeCount'] = $productTypeCount?$productTypeCount:"0";;
			$v['startTime']=$v['startTime']?substr($v['startTime'],0,10):'';
			$v['planFinishedTime']=$v['planFinishedTime']?substr($v['planFinishedTime'],0,10):'';
			$v['signContractTime']=$v['signContractTime']?substr($v['signContractTime'],0,10):'';
			$v['onlineTime']=$v['onlineTime']?substr($v['onlineTime'],0,10):'';
			$result[] = array_merge($v,$currentProgress?$currentProgress:array(),$lastProcess?$lastProcess:array());
		}

		if($result){
			$this->ajaxReturn($result,'获取列表成功', 1);
		}else{
			$this->ajaxReturn(array(),'获取列表失败', 0);
		}

	}
	

	
	
	/**
	 * 所有可添加变更的项目
	 */
	public function getAllChangeProject()
	{
		//在所有已有的项目中 找到个人可以参与的项目
		$allProjects = M('projects')->field('id,projectName,projectId')
						->where('risk !="" and isDelete="1"')
						->select();
		
		foreach ($allProjects as $key=>$value){
			if($value['projectName']!=''){
				$result[] = $value;
			}
		}
		echo json_encode($result);
	}
	
	
	/**
	 * 获取项目经理项目列表
	 */
	public function addSolProject(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$projectsM = M ( 'projects' );
		if($data['projectName']){
			$where['projectName'] = $data['projectName'];
			$isExist = $projectsM->where($where)->select();
			if(!$isExist){
				$result = $projectsM->add($data);
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加项目' . $data['projectNameIn'];
				$logs->add ( $logsData );
				echo 200;
				exit ();
			}
		}
	}
	
	

	
	
	/**
	 *	获取报工项目信息
	 */
	public function getAllProject() {
		$projects = M ( 'projects' );	    
		$data = $projects->where('isDelete=1 and leadDepartment is not null')->select();
		echo json_encode ( $data );
		exit ();

	}

	/**
	 * 修改项目信息
	 *
	 */
	public function editProject(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		if($data ['id'] != ''){

			$projects = M ( 'projects' );
			$result = $projects->where ( 'id=' . $data ['id'] )->save ( $data );
			if($result){
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '修改项目(' . $data ['projectId'].")";
				$logs->add ( $logsData );
				if($result){
						$this->ajaxReturn(array(),'修改成功',1);
					}else{
						$this->ajaxReturn(array(),'修改失败',0);
				}
			}
		}
	}
	
	public function addProject(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$projectsM = M('projects');
		$data['risk'] = '未知';
		//如果有项目编号，验证编号唯一性
		if($data['projectId']){
			$where['projectId'] = $data['projectId'];
			$isExist = $projectsM->where($where)->select();
			if($isExist){
				$result = $projectsM->where($where)->save($data);
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加项目' . $data['projectId'];
				$logs->add ( $logsData );
				echo $result;
				exit ();
			}else{
				$result = $projectsM->add($data);
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加项目' . $data['projectNameIn'];
				$logs->add ( $logsData );
				echo $result;
				exit ();
			}
		}else{
			if($data['projectAlias']){
				$result = $projectsM->add($data);
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加项目' . $data['projectNameIn'];
				$logs->add ( $logsData );
				echo $result;
				exit ();
			}
		}
	}
	

	/**
	 * 添加新项目 如果项目编号已经存在则不添加并返回1
	 */
	public function addProjectNew(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		// $data = array(
		// 	'projectId' => 'R2019982928',
		// 	'projectName' => '测试项目',
		// 	'projectManagerId' => '全兵、蒋忠强'
		// );
		$projects = M ( 'projects' );
		$res = $projects->where("projectId='{$data['projectId']}'")->find();
		if(! $res){
			$result = $projects->add ( $data );
			if($result){
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加项目(' . $data ['projectId'].")";
				$logs->add ( $logsData );
			}
			echo $result;
			exit ();
		}else{
			echo 0;
			exit;
		}
	}

	/**
	 * 删除项目
	 */
	public function deleteProjectNew(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		// $data = array(
		// 	'projectId' => 'R201685732',
		// );
		if($data ['projectId'] != ''){
			$projects = M ( 'projects' );
			$result = $projects->where("projectId='{$data ['projectId']}'")->setField ( "isDelete", 2);
			if($result){
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '删除项目(' . $data ['projectId'].")";
				$logs->add ( $logsData );
			}
			echo $result;
			exit ();
		}else{
			echo 0;
			exit;
		}
	}


	/**
	 * 项目导入
	 */
	public function addProjectExcl() {
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
			
            $PHPExcel = $PHPReader->load( $move_file_name );
            $currentSheet = $PHPExcel->getSheet( 0 );
            $allColumn = $currentSheet->getHighestColumn();
            $allRow = $currentSheet->getHighestRow();
            for( $currentRow = 2; $currentRow <= $allRow; $currentRow++ ) {
                $data['projectId'] = $currentSheet->getCell( 'A' . $currentRow )->getValue();
                $data['contractNo'] = $currentSheet->getCell( 'B' . $currentRow )->getValue();
                $data['signContractTime'] = $this->excelTime( $currentSheet->getCell( 'C' . $currentRow )->getValue() );
                $data['purchaseType'] = $currentSheet->getCell( 'D' . $currentRow )->getValue();
                $data['onlineTime'] = $this->excelTime($currentSheet->getCell( 'E' . $currentRow )->getValue());
                $data['projectNameIn'] = $currentSheet->getCell( 'F' . $currentRow )->getValue();
                $data['projectAlias'] = $currentSheet->getCell( 'G' . $currentRow )->getValue();
                $data['projectType'] = $currentSheet->getCell( 'H' . $currentRow )->getValue();
                $data['startTime'] = $this->excelTime($currentSheet->getCell( 'I' . $currentRow )->getValue());
                $data['projectPrice'] = $currentSheet->getCell( 'J' . $currentRow )->getValue();
				$data['projectLevel'] = $currentSheet->getCell( 'K' . $currentRow )->getValue();
                $data['projectClassify'] = $currentSheet->getCell( 'L' . $currentRow )->getValue();
                $data['nodeCount'] = $currentSheet->getCell( 'M' . $currentRow )->getValue();
                $data['customerName'] = $currentSheet->getCell( 'N' . $currentRow )->getValue();
                $data['customerDepartmentName'] = $currentSheet->getCell( 'O' . $currentRow )->getValue();
                $data['lever2Manager'] = $currentSheet->getCell( 'P' . $currentRow )->getValue();
                $data['lever3Manager'] = $currentSheet->getCell( 'Q' . $currentRow )->getValue();
                $data['customerStaffName'] = $currentSheet->getCell( 'R' . $currentRow )->getValue();
                $data['customerPrimaryContact'] = $currentSheet->getCell( 'S' . $currentRow )->getValue();
                $data['teams'] = $currentSheet->getCell( 'T' . $currentRow )->getValue();



                $data['involvedRegion'] =  $currentSheet->getCell( 'U' . $currentRow )->getValue() ;
                $data['saleManager'] = $currentSheet->getCell( 'V' . $currentRow )->getValue();
                $data['areaProjectManager'] = $currentSheet->getCell( 'W' . $currentRow )->getValue();
                $data['regionalSolManager'] = $currentSheet->getCell( 'X' . $currentRow )->getValue();

                $data['projectManagerId'] = $currentSheet->getCell( 'Y' . $currentRow )->getValue();
                $data['implementManager'] = $currentSheet->getCell( 'Z' . $currentRow )->getValue();


                $data['developManager'] = $currentSheet->getCell( 'AA' . $currentRow )->getValue();
                $data['testManager'] = $currentSheet->getCell( 'AB' . $currentRow )->getValue();
                $data['serviceManager'] = $currentSheet->getCell( 'AC' . $currentRow )->getValue();

                $data['commerceStatus'] = $currentSheet->getCell( 'AD' . $currentRow )->getValue();
                $data['implementBases'] = $currentSheet->getCell( 'AE' . $currentRow )->getValue();
                $data['implementStatus'] = $currentSheet->getCell( 'AF' . $currentRow )->getValue();
                $data['developStatus'] = $currentSheet->getCell( 'AG' . $currentRow )->getValue();
                $data['onlineStatus'] = $currentSheet->getCell( 'AH' . $currentRow )->getValue();
                $data['operateStatus'] = $currentSheet->getCell( 'AI' . $currentRow )->getValue();
 				$data['pressure'] = $currentSheet->getCell( 'AJ' . $currentRow )->getValue();

                $data['currentProgress'] = $currentSheet->getCell( 'AK' . $currentRow )->getValue();
                $data['recentPlan'] = $currentSheet->getCell( 'AL' . $currentRow )->getValue();
                $data['progress'] = $currentSheet->getCell( 'AM' . $currentRow )->getValue();

                $data['risk'] = $currentSheet->getCell( 'AN' . $currentRow )->getValue();
                $data['countermeasures'] = $currentSheet->getCell( 'AO' . $currentRow )->getValue();
                $data['leadDepartMent'] = $currentSheet->getCell( 'AP' . $currentRow )->getValue();
                $data['assistDepartment'] = $currentSheet->getCell( 'AQ' . $currentRow )->getValue();
                $data['projectPeople'] = $currentSheet->getCell( 'AR' . $currentRow )->getValue();
                $f_where['projectId'] = $data['projectId'];
                if( M( 'projects' )->where( $f_where )->find() ) {
                    $res = M( 'projects' )->where( $f_where )->save( $data );
                }else {
                    $res = M( 'projects' )->add( $data );
                }
            }
            $logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '批量上传了excl'.$move_file_name;
			$logs->add ( $logsData );
			echo $res;
			exit ();
        }else {
            //上传文件不存在
            echo 0;
            exit;
        }
	}
	
	
	/**
	 * 项目导入
	 */
	public function addProjectNewExcl() {
		header("Content-type:text/html;charset=utf8");
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
				
			$PHPExcel = $PHPReader->load( $move_file_name );
			$currentSheet = $PHPExcel->getSheet( 0 );
			$allColumn = $currentSheet->getHighestColumn();
			$allRow = $currentSheet->getHighestRow();
			for( $currentRow = 5; $currentRow <= $allRow; $currentRow++ ) {
				$data['projectAlias'] = $currentSheet->getCell( 'A' . $currentRow )->getValue();
				$data['projectId'] = $currentSheet->getCell( 'B' . $currentRow )->getValue();
				$data['contractNo'] = $currentSheet->getCell( 'C' . $currentRow )->getValue();
				$data['signContractTime'] = $this->excelTime( $currentSheet->getCell( 'D' . $currentRow )->getValue() );
				$data['purchaseType'] = $currentSheet->getCell( 'E' . $currentRow )->getValue();
				$data['onlineTime'] = $this->excelTime($currentSheet->getCell( 'F' . $currentRow )->getValue());
				$data['projectNameIn'] = $currentSheet->getCell( 'G' . $currentRow )->getValue();
				$data['projectType'] = $currentSheet->getCell( 'H' . $currentRow )->getValue();
				$data['startTime'] = $this->excelTime($currentSheet->getCell( 'I' . $currentRow )->getValue());
				$data['projectPrice'] = $currentSheet->getCell( 'J' . $currentRow )->getValue();
	
				$data['projectLevel'] = $currentSheet->getCell( 'K' . $currentRow )->getValue();
				$data['projectClassify'] = $this->excelTime($currentSheet->getCell( 'L' . $currentRow )->getValue());
				$data['nodeCount'] = $currentSheet->getCell( 'M' . $currentRow )->getValue();
				
				
				
				$data['customerName'] = $currentSheet->getCell( 'N' . $currentRow )->getValue();
				$data['customerDepartmentName'] = $currentSheet->getCell( 'O' . $currentRow )->getValue();
				$data['lever2Manager'] = $currentSheet->getCell( 'P' . $currentRow )->getValue();
				$data['lever3Manager'] = $currentSheet->getCell( 'Q' . $currentRow )->getValue();
				$data['customerStaffName'] = $currentSheet->getCell( 'R' . $currentRow )->getValue();
				$data['customerPrimaryContact'] = $currentSheet->getCell( 'S' . $currentRow )->getValue();
				$data['teams'] = $currentSheet->getCell( 'T' . $currentRow )->getValue();
				$data['involvedRegion'] =  $currentSheet->getCell( 'U' . $currentRow )->getValue() ;
				$data['saleManager'] = $currentSheet->getCell( 'V' . $currentRow )->getValue();
				$data['areaProjectManager'] = $currentSheet->getCell( 'W' . $currentRow )->getValue();
				$data['regionalSolManager'] = $currentSheet->getCell( 'X' . $currentRow )->getValue();
				$data['projectManagerId'] = $currentSheet->getCell( 'Y' . $currentRow )->getValue();
				$data['implementManager'] = $currentSheet->getCell( 'Z' . $currentRow )->getValue();
				$data['developManager'] = $currentSheet->getCell( 'AA' . $currentRow )->getValue();
				$data['testManager'] = $currentSheet->getCell( 'AB' . $currentRow )->getValue();
				$data['serviceManager'] = $currentSheet->getCell( 'AC' . $currentRow )->getValue();
				$data['commerceStatus'] = $currentSheet->getCell( 'AD' . $currentRow )->getValue();
				$data['implementBases'] = $currentSheet->getCell( 'AE' . $currentRow )->getValue();
				$data['implementStatus'] = $currentSheet->getCell( 'AF' . $currentRow )->getValue();
				$data['developStatus'] = $currentSheet->getCell( 'AG' . $currentRow )->getValue();
				$data['onlineStatus'] = $currentSheet->getCell( 'AH' . $currentRow )->getValue();
				$data['operateStatus'] = $currentSheet->getCell( 'AI' . $currentRow )->getValue();
				$data['pressure'] = $currentSheet->getCell( 'AJ' . $currentRow )->getValue();
				$data['currentProgress'] = $currentSheet->getCell( 'AK' . $currentRow )->getValue();
				$data['recentPlan'] = $currentSheet->getCell( 'AL' . $currentRow )->getValue();
				$data['progress'] = $currentSheet->getCell( 'AM' . $currentRow )->getValue();
				$data['risk'] = $currentSheet->getCell( 'AN' . $currentRow )->getValue();
				$data['countermeasures'] = $currentSheet->getCell( 'AO' . $currentRow )->getValue();
				//var_dump($data);exit;
				$f_where['projectId'] = $data['projectId'];
				//分隔项目编号
				$projectIdStr = str_replace('-','',$data['projectId']);
				$startStr = substr($data['projectId'],0,7);
				$endStr = substr($data['projectId'],8);
				$one_where['projectId'] = $startStr.'-'.$endStr;				
				$two_where['projectId'] = $startStr.$endStr;

				if( M( 'projects' )->where( $f_where )->find() ) {
					$res = M( 'projects' )->where( $f_where )->save( $data );
				}else if( M( 'projects' )->where( $one_where )->find()){

					unset($data['projectId']);
					$res = M( 'projects' )->where( $one_where )->save( $data );
				}else if( M( 'projects' )->where( $two_where )->find()){

					unset($data['projectId']);
					$res = M( 'projects' )->where( $two_where )->save( $data );
				}else {
					$res = M( 'projects' )->add( $data );
				}
			}
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '批量上传了excl'.$move_file_name;
			$logs->add ( $logsData );
			echo $res;
			exit ();
		}else {
			//上传文件不存在
			echo 0;
			exit;
		}
	}
	

	/**
	 * 导出项目数据
	 */
	public function downloadProject(){
		header("Content-type:text/html;charset=utf8");
        $project = M("projects");
        $data = $project->where("isDelete=1")->select();
        set_time_limit(0);
        import ( "ORG.Util.PHPExcel" );
        $objPHPExcel = new PHPExcel();
        $objPHPExcel->getProperties()->setSubject('外协信息');
        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
        $objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
        $objPHPExcel->getActiveSheet()->setCellValue('A1', '商机编号/项目编号');
        $objPHPExcel->getActiveSheet()->setCellValue('B1', '合同编号');
        $objPHPExcel->getActiveSheet()->setCellValue('C1', '合同签订时间');
        $objPHPExcel->getActiveSheet()->setCellValue('D1', '采购方式');
        $objPHPExcel->getActiveSheet()->setCellValue('E1', '工期要求');
        $objPHPExcel->getActiveSheet()->setCellValue('F1', '项目名称');
        $objPHPExcel->getActiveSheet()->setCellValue('G1', '通称');
        $objPHPExcel->getActiveSheet()->setCellValue('H1', '项目类型');
        $objPHPExcel->getActiveSheet()->setCellValue('I1', '项目启动会时间');
        $objPHPExcel->getActiveSheet()->setCellValue('J1', '项目金额（元）');


		$objPHPExcel->getActiveSheet()->setCellValue('K1', '项目级别');
        $objPHPExcel->getActiveSheet()->setCellValue('L1', '项目分类');
        $objPHPExcel->getActiveSheet()->setCellValue('M1', '总节点数');



        $objPHPExcel->getActiveSheet()->setCellValue('N1', '公司名称（客户）');
        $objPHPExcel->getActiveSheet()->setCellValue('O1', '部门名称（客户）');
        $objPHPExcel->getActiveSheet()->setCellValue('P1', '二级经理（客户）');
        $objPHPExcel->getActiveSheet()->setCellValue('Q1', '三级经理（客户）');
        $objPHPExcel->getActiveSheet()->setCellValue('R1', '员工（客户）');
        $objPHPExcel->getActiveSheet()->setCellValue('S1', '主要联系人');
        $objPHPExcel->getActiveSheet()->setCellValue('T1', '涉及小组');
        $objPHPExcel->getActiveSheet()->setCellValue('U1', '涉及区域');
        $objPHPExcel->getActiveSheet()->setCellValue('V1', '销售经理');
        $objPHPExcel->getActiveSheet()->setCellValue('W1', '区域大项目经理');
        $objPHPExcel->getActiveSheet()->setCellValue('X1', '区域解决方案经理');
        $objPHPExcel->getActiveSheet()->setCellValue('Y1', '产品部项目经理');
        $objPHPExcel->getActiveSheet()->setCellValue('Z1', '实施经理');
        $objPHPExcel->getActiveSheet()->setCellValue('AA1', '研发经理');
        $objPHPExcel->getActiveSheet()->setCellValue('AB1', '测试经理');
        $objPHPExcel->getActiveSheet()->setCellValue('AC1', '服务经理');
        $objPHPExcel->getActiveSheet()->setCellValue('AD1', '商务状态');
        $objPHPExcel->getActiveSheet()->setCellValue('AE1', '实施依据');;
        $objPHPExcel->getActiveSheet()->setCellValue('AF1', '实施状态');
        $objPHPExcel->getActiveSheet()->setCellValue('AG1', '研发状态');
        $objPHPExcel->getActiveSheet()->setCellValue('AH1', '上线状态');
        $objPHPExcel->getActiveSheet()->setCellValue('AI1', '交维状态');
        $objPHPExcel->getActiveSheet()->setCellValue('AJ1', '当前压力度');
        $objPHPExcel->getActiveSheet()->setCellValue('AK1', '当前进展');
        $objPHPExcel->getActiveSheet()->setCellValue('L1', '近期计划');
        $objPHPExcel->getActiveSheet()->setCellValue('M1', '进度（%）');
        $objPHPExcel->getActiveSheet()->setCellValue('N1', '当前风险度');
        $objPHPExcel->getActiveSheet()->setCellValue('O1', '当前风险及应对措施');
        $objPHPExcel->getActiveSheet()->setCellValue('P1', '牵头部门');
        $objPHPExcel->getActiveSheet()->setCellValue('Q1', '协助部门');
        $objPHPExcel->getActiveSheet()->setCellValue('R1', '项目干系人');
        //遍历填充日期
        $i = 2;
        foreach($data as $key => $project){
            $objPHPExcel->getActiveSheet()->setCellValue('A'.($i), $project['projectId']);
            $objPHPExcel->getActiveSheet()->setCellValue('B'.($i), $project['contractNo']);
            if($project['signContractTime']){
            	$objPHPExcel->getActiveSheet()->setCellValue('C'.($i), date("Y/m/d",strtotime($project['signContractTime'])));
            }
            $objPHPExcel->getActiveSheet()->setCellValue('D'.($i), $project['purchaseType']);
            if($project['onlineTime']){
            	$objPHPExcel->getActiveSheet()->setCellValue('E'.($i), date("Y/m/d",strtotime($project['onlineTime'])));
            }
            $objPHPExcel->getActiveSheet()->setCellValue('F'.($i), $project['projectNameIn']);
            $objPHPExcel->getActiveSheet()->setCellValue('G'.($i), $project['projectAlias']);
            $objPHPExcel->getActiveSheet()->setCellValue('H'.($i), $project['projectType']);
            if($project['startTime']){
            	$objPHPExcel->getActiveSheet()->setCellValue('I'.($i), date("Y/m/d",strtotime($project['startTime'])));
            }
            $objPHPExcel->getActiveSheet()->setCellValue('J'.($i), $project['projectPrice']);
            $objPHPExcel->getActiveSheet()->setCellValue('K'.($i), $project['projectLevel']);
            $objPHPExcel->getActiveSheet()->setCellValue('L'.($i), $project['projectClassify']);
            $objPHPExcel->getActiveSheet()->setCellValue('M'.($i), $project['nodeCount']);

            $objPHPExcel->getActiveSheet()->setCellValue('N'.($i), $project['customerName']);
            $objPHPExcel->getActiveSheet()->setCellValue('O'.($i), $project['customerDepartmentName']);
            $objPHPExcel->getActiveSheet()->setCellValue('P'.($i), $project['lever2Manager']);
            $objPHPExcel->getActiveSheet()->setCellValue('Q'.($i), $project['customerStaffName']);
            $objPHPExcel->getActiveSheet()->setCellValue('R'.($i), $project['customerStaffName']);
			$objPHPExcel->getActiveSheet()->setCellValue('S'.($i), $project['customerPrimaryContact']);
			$objPHPExcel->getActiveSheet()->setCellValue('T'.($i), $project['teams']);

            $objPHPExcel->getActiveSheet()->setCellValue('U'.($i), $project['involvedRegion']);
            $objPHPExcel->getActiveSheet()->setCellValue('V'.($i), $project['saleManager']);
            $objPHPExcel->getActiveSheet()->setCellValue('W'.($i), $project['areaProjectManager']);
            $objPHPExcel->getActiveSheet()->setCellValue('X'.($i), $project['regionalSolManager']);
            $objPHPExcel->getActiveSheet()->setCellValue('Y'.($i), $project['projectManagerId']);
            $objPHPExcel->getActiveSheet()->setCellValue('Z'.($i), $project['implementManager']);
            $objPHPExcel->getActiveSheet()->setCellValue('AA'.($i), $project['developManager']);
            $objPHPExcel->getActiveSheet()->setCellValue('AB'.($i), $project['testManager']);
			$objPHPExcel->getActiveSheet()->setCellValue('AC'.($i), $project['serviceManager']);
			$objPHPExcel->getActiveSheet()->setCellValue('AD'.($i), $project['commerceStatus']);
			$objPHPExcel->getActiveSheet()->setCellValue('AE'.($i), $project['implementBases']);
			$objPHPExcel->getActiveSheet()->setCellValue('AF'.($i), $project['implementStatus']);
            $objPHPExcel->getActiveSheet()->setCellValue('AG'.($i), $project['developStatus']);
            $objPHPExcel->getActiveSheet()->setCellValue('AH'.($i), $project['onlineStatus']." ");
            $objPHPExcel->getActiveSheet()->setCellValue('AI'.($i), $project['operateStatus']);
            $objPHPExcel->getActiveSheet()->setCellValue('AJ'.($i), $project['pressure']);
            $objPHPExcel->getActiveSheet()->setCellValue('AK'.($i), $project['currentProgress']);
            $objPHPExcel->getActiveSheet()->setCellValue('AL'.($i), $project['recentPlan']);
            $objPHPExcel->getActiveSheet()->setCellValue('AM'.($i), $project['progress']);
            $objPHPExcel->getActiveSheet()->setCellValue('AN'.($i), $project['risk']);
            $objPHPExcel->getActiveSheet()->setCellValue('AO'.($i), $project['countermeasures']);
            $objPHPExcel->getActiveSheet()->setCellValue('AP'.($i), $project['leadDepartMent']);
            $objPHPExcel->getActiveSheet()->setCellValue('AQ'.($i), $project['assistDepartment']);
            $objPHPExcel->getActiveSheet()->setCellValue('AR'.($i), $project['projectPeople']);

            $i++;
        }
        $logs = M( 'logs_info' );
        $logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '导出项目信息';
        $logs->add( $logsData );
        header ( 'pragma:public' );
        header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="项目信息汇总excel.xls"');
        header ( 'Content-Disposition:attachment;filename="项目信息汇总excel.xls"' ); 
        $objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
        $objWriter->save ( 'php://output' );
	}
	

	/**
	 * 导出项目数据
	 */
	public function exportProjectDetail(){
		header("Content-type:text/html;charset=utf8");
		$sql = "select a.*,b.outProjectPrice,b.strategic,b.resource_rationality,b.attension,b.score,b.businessOpportunity,b.note from pmo_projects a left join pmo_project_score b on a.projectId=b.projectId where a.isDelete=1 and (b.isDelete=1 or b.isDelete is null)";
		$data = M()->query($sql);
		set_time_limit(0);
		import ( "ORG.Util.PHPExcel" );
		$objPHPExcel = new PHPExcel();
		$objPHPExcel->getProperties()->setSubject('项目信息汇总');
		$objPHPExcel->setActiveSheetIndex(0);
		$objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
		$objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
		$objPHPExcel->getActiveSheet()->setCellValue('A1', '通称（别名）');
		$objPHPExcel->getActiveSheet()->setCellValue('B1', '商机编号/项目编号');
		$objPHPExcel->getActiveSheet()->setCellValue('C1', '合同编号');
		$objPHPExcel->getActiveSheet()->setCellValue('D1', '合同签订时间');
		$objPHPExcel->getActiveSheet()->setCellValue('E1', '采购方式');
		$objPHPExcel->getActiveSheet()->setCellValue('F1', '工期要求（上线）');
		$objPHPExcel->getActiveSheet()->setCellValue('G1', '项目名称（以合同为准）');
		$objPHPExcel->getActiveSheet()->setCellValue('H1', '项目类型');
		$objPHPExcel->getActiveSheet()->setCellValue('I1', '项目启动会时间');
		$objPHPExcel->getActiveSheet()->setCellValue('J1', '项目金额（元）');
		$objPHPExcel->getActiveSheet()->setCellValue('K1', '项目级别');
		$objPHPExcel->getActiveSheet()->setCellValue('L1', '项目分类');
		$objPHPExcel->getActiveSheet()->setCellValue('M1', '总节点数');
		$objPHPExcel->getActiveSheet()->setCellValue('N1', '项目金额（外部项目金额*5）');
		$objPHPExcel->getActiveSheet()->setCellValue('O1', '战略意义');
		$objPHPExcel->getActiveSheet()->setCellValue('P1', '资源投入合理性');
		$objPHPExcel->getActiveSheet()->setCellValue('Q1', '领导关注度');
		$objPHPExcel->getActiveSheet()->setCellValue('R1', '项目评分');
		$objPHPExcel->getActiveSheet()->setCellValue('S1', '商机确定性');
		$objPHPExcel->getActiveSheet()->setCellValue('T1', '备注');
		$objPHPExcel->getActiveSheet()->setCellValue('U1', '公司名称（客户）');
		$objPHPExcel->getActiveSheet()->setCellValue('V1', '部门名称（客户）');
		$objPHPExcel->getActiveSheet()->setCellValue('W1', '二级经理（客户）');
		$objPHPExcel->getActiveSheet()->setCellValue('X1', '三级经理（客户）');
		$objPHPExcel->getActiveSheet()->setCellValue('Y1', '员工（客户）');
		$objPHPExcel->getActiveSheet()->setCellValue('Z1', '主要联系人');
		$objPHPExcel->getActiveSheet()->setCellValue('AA1', '涉及小组');
		$objPHPExcel->getActiveSheet()->setCellValue('AB1', '涉及区域');
		$objPHPExcel->getActiveSheet()->setCellValue('AC1', '销售经理');
		$objPHPExcel->getActiveSheet()->setCellValue('AD1', '区域大项目经理');
		$objPHPExcel->getActiveSheet()->setCellValue('AE1', '区域解决方案经理');;
		$objPHPExcel->getActiveSheet()->setCellValue('AF1', '产品部项目经理');
		$objPHPExcel->getActiveSheet()->setCellValue('AG1', '实施经理');
		$objPHPExcel->getActiveSheet()->setCellValue('AH1', '研发经理');
		$objPHPExcel->getActiveSheet()->setCellValue('AI1', '测试经理');
		$objPHPExcel->getActiveSheet()->setCellValue('AJ1', '服务经理');
		$objPHPExcel->getActiveSheet()->setCellValue('AK1', '涉及产品');
		// $objPHPExcel->getActiveSheet()->setCellValue('AL1', 'hadoop节点数');
		// $objPHPExcel->getActiveSheet()->setCellValue('AM1', 'MPP节点数');
		// $objPHPExcel->getActiveSheet()->setCellValue('AN1', 'BC-ETL套数');
		// $objPHPExcel->getActiveSheet()->setCellValue('AO1', '。。。');
		// $objPHPExcel->getActiveSheet()->setCellValue('AP1', '定制化（包括服务、运营等）');
		$objPHPExcel->getActiveSheet()->setCellValue('AL1', '商务状态');
		$objPHPExcel->getActiveSheet()->setCellValue('AM1', '实施依据');
		$objPHPExcel->getActiveSheet()->setCellValue('AN1', '实施状态');
		$objPHPExcel->getActiveSheet()->setCellValue('AO1', '涉及产品');
		$objPHPExcel->getActiveSheet()->setCellValue('AP1', '上线状态');
		$objPHPExcel->getActiveSheet()->setCellValue('AQ1', '交维状态');
		$objPHPExcel->getActiveSheet()->setCellValue('AR1', '当前压力度');
		$objPHPExcel->getActiveSheet()->setCellValue('AS1', '当前进展');
		$objPHPExcel->getActiveSheet()->setCellValue('AT1', '近期计划');
		$objPHPExcel->getActiveSheet()->setCellValue('AU1', '进度（%）');
		$objPHPExcel->getActiveSheet()->setCellValue('AV1', '当前风险度');
		$objPHPExcel->getActiveSheet()->setCellValue('AW1', '当前风险及应对措施（如有）');
		$i = 2;
		foreach($data as $key => $project){
			$objPHPExcel->getActiveSheet()->setCellValue('A'.($i), $project['projectAlias']);
			$objPHPExcel->getActiveSheet()->setCellValue('B'.($i), $project['projectId']);
			$objPHPExcel->getActiveSheet()->setCellValue('C'.($i), $project['contractNo']);
			if($project['signContractTime']){
				$objPHPExcel->getActiveSheet()->setCellValue('D'.($i), date("Y/m/d",strtotime($project['signContractTime'])));
			}
			$objPHPExcel->getActiveSheet()->setCellValue('E'.($i), $project['purchaseType']);
			if($project['onlineTime']){
				$objPHPExcel->getActiveSheet()->setCellValue('F'.($i), date("Y/m/d",strtotime($project['onlineTime'])));
			}
			$objPHPExcel->getActiveSheet()->setCellValue('G'.($i), $project['projectNameIn']);
			$objPHPExcel->getActiveSheet()->setCellValue('H'.($i), $project['projectType']);
			if($project['startTime']){
				$objPHPExcel->getActiveSheet()->setCellValue('I'.($i), date("Y/m/d",strtotime($project['startTime'])));
			}
			$objPHPExcel->getActiveSheet()->setCellValue('J'.($i), $project['projectPrice']);
			$objPHPExcel->getActiveSheet()->setCellValue('K'.($i), $project['projectLevel']);
			$objPHPExcel->getActiveSheet()->setCellValue('L'.($i), $project['projectClassify']);
			$objPHPExcel->getActiveSheet()->setCellValue('M'.($i), $project['nodeCount']);
			$objPHPExcel->getActiveSheet()->setCellValue('N'.($i), $project['outProjectPrice']);
			$objPHPExcel->getActiveSheet()->setCellValue('O'.($i), $project['strategic']);
			$objPHPExcel->getActiveSheet()->setCellValue('P'.($i), $project['resource_rationality']);
			$objPHPExcel->getActiveSheet()->setCellValue('Q'.($i), $project['attension']);
			$objPHPExcel->getActiveSheet()->setCellValue('R'.($i), $project['score']);
			$objPHPExcel->getActiveSheet()->setCellValue('S'.($i), $project['businessOpportunity']);
			$objPHPExcel->getActiveSheet()->setCellValue('T'.($i), $project['note']);
			$objPHPExcel->getActiveSheet()->setCellValue('U'.($i), $project['customerName']);
			$objPHPExcel->getActiveSheet()->setCellValue('V'.($i), $project['customerDepartmentName']);
			$objPHPExcel->getActiveSheet()->setCellValue('W'.($i), $project['lever2Manager']);
			$objPHPExcel->getActiveSheet()->setCellValue('X'.($i), $project['lever3Manager']);
			$objPHPExcel->getActiveSheet()->setCellValue('Y'.($i), $project['customerStaffName']);
			$objPHPExcel->getActiveSheet()->setCellValue('Z'.($i), $project['customerPrimaryContact']);
			$objPHPExcel->getActiveSheet()->setCellValue('AA'.($i), $project['teams']);
			$objPHPExcel->getActiveSheet()->setCellValue('AB'.($i), $project['involvedRegion']);
			$objPHPExcel->getActiveSheet()->setCellValue('AC'.($i), $project['saleManager']);
			$objPHPExcel->getActiveSheet()->setCellValue('AD'.($i), $project['areaProjectManager']);
			$objPHPExcel->getActiveSheet()->setCellValue('AE'.($i), $project['regionalSolManager']);
			$objPHPExcel->getActiveSheet()->setCellValue('AF'.($i), $project['projectManagerId']);
			$objPHPExcel->getActiveSheet()->setCellValue('AG'.($i), $project['implementManager']);
			$objPHPExcel->getActiveSheet()->setCellValue('AH'.($i), $project['developManager']." ");
			$objPHPExcel->getActiveSheet()->setCellValue('AI'.($i), $project['testManager']);
			$objPHPExcel->getActiveSheet()->setCellValue('AJ'.($i), $project['serviceManager']);
			$products = M("project_product")->where("projectId='{$project['projectId']}'")->getField("productName",true);
			if($products){
				$objPHPExcel->getActiveSheet()->setCellValue('AK'.($i), implode("、",$products));
			}
			$objPHPExcel->getActiveSheet()->setCellValue('AL'.($i), $project['commerceStatus']);
			$objPHPExcel->getActiveSheet()->setCellValue('AM'.($i), $project['implementBases']);
			$objPHPExcel->getActiveSheet()->setCellValue('AN'.($i), $project['implementStatus']);
			$objPHPExcel->getActiveSheet()->setCellValue('AO'.($i), $project['developStatus']);
			$objPHPExcel->getActiveSheet()->setCellValue('AP'.($i), $project['onlineStatus']);
			$objPHPExcel->getActiveSheet()->setCellValue('AQ'.($i), $project['operateStatus']);
			$objPHPExcel->getActiveSheet()->setCellValue('AR'.($i), $project['pressure']);
			$objPHPExcel->getActiveSheet()->setCellValue('AS'.($i), $project['currentProgress']);
			$objPHPExcel->getActiveSheet()->setCellValue('AT'.($i), $project['recentPlan']);
			$objPHPExcel->getActiveSheet()->setCellValue('AU'.($i), $project['progress']);
			$objPHPExcel->getActiveSheet()->setCellValue('AV'.($i), $project['risk']);
			$objPHPExcel->getActiveSheet()->setCellValue('AW'.($i), $project['countermeasures']);
			$i++;
		}
		$logs = M( 'logs_info' );
		$logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '导出项目信息';
		$logs->add( $logsData );
		header ( 'pragma:public' );
		header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="项目信息汇总excel.xls"');
		header ( 'Content-Disposition:attachment;filename="项目信息汇总excel.xls"' );
		$objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
		$objWriter->save ( 'php://output' );
	}
	
	public function exportProjects(){
		$projects = M("projects")->field('*')->select();
		$xlsName = '大数据项目基本信息汇总';
		$xlsCell = array(
				array (
						'projectAlias',
						'通称'
				),
				array (
						'projectId',
						'商机编号/项目编号'
				),
				array (
						'contractNo',
						'合同编号'
				),
				
				array(
						'signContractTime',
						'合同签订时间'
		        ),
				array(
				        'purchaseType',
						'采购方式'		
		        ),
				array (
						'onlineTime',
						'工期要求'
				),
				array (
						'projectNameIn',
						'项目名称'
				),
				array (
						'projectType',
						'项目类型'
				),
				array(
						'startTime',
						'项目启动会时间'
		 		),
				array (
						'projectPrice',
						'项目金额（元）'
				),
				array(
						'projectLevel',
						'项目级别'
				),
				
				array (
						'projectClassify',
						'项目分类'
				),
				array(
			            'nodeCount',
						'总节点数'			
				),
				array (
						'customerName',
						'公司名称（客户）'
				),
				array (
						'customerDepartmentName',
						'部门名称（客户）'
				),
				array (
						'lever2Manager',
						'二级经理（客户）'
				),

				array (
						'lever3Manager',
						'三级经理（客户）'
				),

				array (
						'customerStaffName',
						'员工（客户）'
				),

				array (
						'customerPrimaryContact',
						'主要联系人'
				),
				array (
						'teams',
						'涉及小组'
				),
				array (
						'involvedRegion',
						'涉及区域'
				),
				array(
						'saleManager',
						'销售经理'
		 		),
				array (
						'areaProjectManager',
						'区域大项目经理'
				),
				array(
						'regionalSolManager',
						'区域解决方案经理'
				),
				
				array (
						'projectManagerId',
						'产品部项目经理'
				),
				array(
			            'implementManager',
						'实施经理'			
				),
				array (
						'developManager',
						'研发经理'
				),
				array (
						'testManager',
						'测试经理'
				),
				array (
						'serviceManager',
						'服务经理'
				),

				array (
						'commerceStatus',
						'商务状态'
				),

				array (
						'implementBases',
						'实施依据'
				),
				array (
						'implementStatus',
						'实施状态'
				),
				array (
						'developStatus',
						'研发状态'
				),
				array (
						'onlineStatus',
						'上线状态'
				),
				array(
						'operateStatus',
						'交维状态'
		 		),
				array (
						'pressure',
						'当前压力度'
				),
				array(
						'currentProgress',
						'当前进展'
				),
				
				array (
						'recentPlan',
						'近期计划'
				),
				array(
			            'progress',
						'进度（%）'			
				),
				array (
						'risk',
						'当前风险度'
				),
				array (
						'countermeasures',
						'当前风险及应对措施'
				)
		);
		$logs = M ( 'logs_info' );
		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '下载项目总单:'.$xlsName;
		$logs->add( $logsData );
		exportExcel( $xlsName, $xlsCell, $projects );
	}
	
	
	/*
	 * 导出未更新的项目
	 */
	public function getNotUpdateProject(){
		$data = M ( 'projects' )
		->where('risk !=""')
		->select();
		if($data){
			foreach($data as $key=>$value){
				$where['relatedId'] = $value['id'];
				//关联项目状态
				$oneProjectStatus = M('project_status')
				->where($where)
				->order('id desc')
				->limit(1)
				->select();
				//关联项目进度
				$oneProjectProcess =  M('project_process')
				->where($where)
				->order('id desc')
				->limit(1)
				->select();
				
				$oneProject = array_merge($value,$oneProjectStatus[0],$oneProjectProcess[0]);
				if($oneProject){
					$projects[] = $oneProject;
				}
			}
		}
		
		$xlsName = '大数据项目基本信息汇总';
		$xlsCell = array(
				array (
						'projectId',
						'项目编号'
				),
				array (
						'projectName',
						'项目名称'
				),
				array (
						'projectAlias',
						'项目通称'
				),
				array (
						'projectManagerId',
						'项目经理'
				),
														
				array(
						'involvedRegion',
						'涉及区域'
				),
				array (
						'onlineTime',
						'工期要求'
				),
				array (
						'contractNo',
						'合同编号'
				),
				array (
						'signContractTime',
						'合同签订日期'
				),
				
				array (
						'projectType',
						'项目类型'
				),
				array (
						'projectPrice',
						'项目金额'
				),
				array (
						'implementStatus',
						'实施状态'
				),
				
				array (
						'developStatus',
						'研发状态'
				),
				array (
						'onlineStatus',
						'上线状态'
				),
				array (
						'currentProgress',
						'当前进展'
				),
				
				array (
						'process',
						'进度（%）0-100'
				),
				array (
						'risk',
						'当前风险度'
				),
				array (
						'responseMeasures',
						'当前风险及应对措施'
				)
			);
		exportExcel( $xlsName, $xlsCell, $projects );
	}
	
}