<?php
// 本类由系统自动生成，仅供测试用途
class BugAction extends Action {
	public function index() {
		$this->display ();
	}
	function callInterfaceCommon($URL, $type, $params, $headers) {
		$ch = curl_init ();
		$timeout = 5;
		curl_setopt ( $ch, CURLOPT_URL, $URL ); // 发贴地址
		if ($headers != "") {
			curl_setopt ( $ch, CURLOPT_HTTPHEADER, $headers );
		} else {
			curl_setopt ( $ch, CURLOPT_HTTPHEADER, array (
					'Content-type:application/x-www-form-urlencoded',
					'Authorization:Basic YWRtaW46YWRtaW4=',
					'X-Requested-By:HControl',
					// 'Connection:keep-alive',
					'Host: 10.133.17.26:8080' 
			) );
		}
		curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, 1 );
		curl_setopt ( $ch, CURLOPT_CONNECTTIMEOUT, $timeout );
		switch ($type) {
			case "GET" :
				curl_setopt ( $ch, CURLOPT_HTTPGET, true );
				break;
			case "POST" :
				curl_setopt ( $ch, CURLOPT_POST, true );
				curl_setopt ( $ch, CURLOPT_POSTFIELDS, $params );
				break;
			case "PUT" :
				curl_setopt ( $ch, CURLOPT_CUSTOMREQUEST, "PUT" );
				curl_setopt ( $ch, CURLOPT_POSTFIELDS, $params );
				break;
			case "DELETE" :
				curl_setopt ( $ch, CURLOPT_CUSTOMREQUEST, "DELETE" );
				curl_setopt ( $ch, CURLOPT_POSTFIELDS, $params );
				break;
		}
		$file_contents = curl_exec ( $ch ); // 获得返回值
		$return_code = curl_getinfo ( $ch, CURLINFO_HTTP_CODE );
		
		curl_close ( $ch );
		return array (
				$return_code,
				$file_contents 
		);
	}

	function getBugs() {
		$url = "http://www.confluence.cn/pages/viewpage.action?pageId=6722677";
		
		$ch = curl_init ();
		curl_setopt ( $ch, CURLOPT_URL, $url );
		
		curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, true );
		
		curl_setopt ( $ch, CURLOPT_SSL_VERIFYPEER, false );
		
		curl_setopt ( $ch, CURLOPT_SSL_VERIFYHOST, false );
		
		curl_setopt ( $ch, CURLOPT_HTTPHEADER, false );
		
		// curl_setopt ( $ch, CURLOPT_CUSTOMREQUEST, "GET" );
		
		// curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
		
		// curl_setopt ( $ch, CURLOPT_USERPWD, "$username:$password" );
		
		$result = curl_exec ( $ch );
		$ch_error = curl_error ( $ch );
		
		if ($ch_error) {
			echo "cURL Error: $ch_error";
		} else {
			// $phpData = json_decode ( $result );
			// echo "fff";
			var_dump ( $phpData );
		}
		curl_close ( $ch );
	}
	
	/**
	 * 导出Excel
	 */
	function expBug($data) { // 导出Excel
		$xlsName = "BugInfo";
		$xlsCell = array (
				array (
						'product',
						'产品名称' 
				),
				array (
						'newBug',
						'新增缺陷' 
				),
				array (
						'openBug',
						'未解决缺陷' 
				),
				array (
						'resolveBug',
						'已处理缺陷' 
				),
				array (
						'dupBug',
						'重复缺陷' 
				),
				array (
						'notBug',
						'误报缺陷' 
				),
				array (
						'noseeBug',
						'无法复现缺陷' 
				),
				array (
						'closeBug',
						'关闭缺陷' 
				) 
		);
		exportExcel ( $xlsName, $xlsCell, $data );
	}
	
	// 导出缺陷
	public function getBugInfo() {
		$bug = M ( 'bug_info' );
		$res = $bug->query ( 'select keywords from pmo_bug_info where 1;' );
		$product = array ();
		$result = array ();
		foreach ( $res as $k => $v ) {
			$productName = explode ( '-', $v ['keywords'] );
			if (! in_array ( $productName [0], $product )) {
				array_push ( $product, $productName [0] );
			}
		}
		$bugSituation = array (
				// 1、未解决的bug包括状态open、inProgress以及reopen的缺陷
				// 2、开发解决了，但是测试未确认的缺陷，包括Cannot Reproduce、Done、Duplicate、Fixed、Won't Do、Won't Fixd等情况
				// 3、关闭的bug包括无法复现、重复缺陷、解决了的缺陷以及误报缺陷
				'Closed' => array (
						'Cannot Reproduce',
						'Done',
						'Duplicate',
						'Fixed',
						'Won\'t Do',
						'Won\'t Fix',
						'no change required' ,
						'重复',
						'不能重现',
						'已完成'
				) 
		);
		$deal_result = array (
				'Cannot Reproduce',
				'Done',
				'Duplicate',
				'Fixed',
				'Won\'t Do',
				'Won\'t Fix' ,
				'重复',
				'不能重现',
				'no change required'
		);
		foreach ( $product as $key => $value ) {
			
			//var_dump($value);exit;
			// 获取总缺陷个数
			$res_tatal = $bug->query ( 'select count(*) from pmo_bug_info where issueType="Bug" and keywords like "' . $value . '%";' );
			$res_open = $bug->query ( 'select count(*) from pmo_bug_info where issueType="Bug" and result="未解决" and keywords like "' . $value . '%";' );
			$res_resolve = $bug->query ( 'select count(*) from pmo_bug_info where issueType="Bug" and status="Resolved" and keywords like "' . $value . '%";' );
			foreach ( $bugSituation as $k => $v ) {
				if ($k == 'Closed') {
					foreach ( $v as $ke => $val ) {
						$count = 0;
						$sql = 'select count(*) from pmo_bug_info where issueType="Bug" and
                                          status = "' . $k . '"and result ="' . $val . '"
					                      and keywords like "' . $value . '%";';
						// echo $sql;
						$tmp = $bug->query ( $sql );
						
						$count = $tmp [0] ['count(*)'];
						if ($val == 'Cannot Reproduce') {
							$result [$key] ['noseeBug'] = $count;
						} else if ($val == 'Done' || $val == 'Fixed'||$val=='已完成') {
							$result [$key] ['closeBug'] += $count;
						} else if ($val == 'Duplicate'||$val == '重复'||$val == '不能重现') {
							$result [$key] ['dupBug'] += $count;
						} else {
							$result [$key] ['notBug'] += $count;
						}
					}
				}
			}
			$result [$key] ['product'] = $value;
			$result [$key] ['openBug'] = $res_open [0] ['count(*)'];
			$result [$key] ['newBug'] = $res_tatal [0] ['count(*)'];
			$result [$key] ['resolveBug'] = $res_resolve [0] ['count(*)'];
			/*if($value=='BCSE'){
				var_dump($result);exit;
			}*/

		}
		$this->expBug ( $result );
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
	
	
	//导入缺陷接口
	
	public function addBugExcl() {
		if (! empty ( $_FILES )) {
			import ( "Org.Util.PHPExcel" );
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
				import ( "Org.Util.PHPExcel.Reader.Excel5" );
				$PHPReader = new \PHPExcel_Reader_Excel5 ();
			} else if ($exts == 'xlsx') {
				import ( "Org.Util.PHPExcel.Reader.Excel2007" );
				$PHPReader = new \PHPExcel_Reader_Excel2007 ();
			} else {
				echo '9';
				exit ();
			}
			
			$PHPReader = new \PHPExcel_Reader_Excel2007 ();
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

			foreach ( $data as $k => $v ) {
				foreach ( $v as $key => $value ) {
					$key == 'A' ? $result ['issueType'] = $value : '';
					$key == 'B' ? $result ['keywords'] = $value : '';
					$key == 'C' ? $result ['theme'] = $value : '';
					$key == 'D' ? $result ['operater'] = $value : '';
					$key == 'E' ? $result ['reporter'] = $value : '';
					$key == 'F' ? $result ['priority'] = $value : '';
					$key == 'G' ? $result ['status'] = $value : '';
					$key == 'H' ? $result ['result'] = $value : '';
					$key == 'I' ? $result ['startTime'] = $this->excelTime ( $value ) : '';
					$key == 'J' ? $result ['endTime'] = $this->excelTime ( $value ) : '';
				}
				$bug = M ( 'bug_info' );
				$res = $bug->add ( $result );
			}
			echo $res;
			exit ();
		} else {
			$this->error ( "请选择上传的文件" );
		}
	}
	
	
	//导入各个项目组工时投入接口
	public function addBugExcl2() {
		if (! empty ( $_FILES )) {
			import ( "Org.Util.PHPExcel" );
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
				import ( "Org.Util.PHPExcel.Reader.Excel5" );
				$PHPReader = new \PHPExcel_Reader_Excel5 ();
			} else if ($exts == 'xlsx') {
				import ( "Org.Util.PHPExcel.Reader.Excel2007" );
				$PHPReader = new \PHPExcel_Reader_Excel2007 ();
			} else {
				echo '9';
				exit ();
			}
				
			$PHPReader = new \PHPExcel_Reader_Excel2007 ();
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
			foreach ( $data as $k => $v ) {
				foreach ( $v as $key => $value ) {   
						$key == 'A' ? $result ['projectId'] = $value : '';
						$key == 'B' ? $result ['projectName'] = $value : '';
						$key == 'C' ? $result ['projectManager'] = $value : '';
						$key == 'F' ? $result ['time'] = explode("：",$value)[1] : '';
						$key == 'F' ? $result ['team'] =  explode("：",$value)[0] : '';
				}
				if($result['time']){
					$bug = M ( 'project_team_time' );
					$res = $bug->add ( $result );
				}
			}
			echo $res;
			exit ();
		} else {
			$this->error ( "请选择上传的文件" );
		}
	}
	
	//导出项目工时
    public function exportProjectTime(){
    	$xlsName = '项目工作量统计';
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
    					'projectManager',
    					'项目经理'
    			),
    			array (
    					'time',
    					'所用工时'
    			)
    	 );
    	
    	$projectTime = M('project_team_time');
    	$allProjectId = $projectTime->query('select distinct projectId from pmo_project_team_time');
        foreach ($allProjectId as $id){
            
        	$prject = $projectTime->where($id)->select();
        	//var_dump($prject);exit;
        	$time = 0;
        	foreach ($prject as $k=>$v){
        		$tmp['projectId'] = $v['projectId'];
        		$tmp['projectName'] = $v['projectName'];
        		$tmp['projectManager'] = $v['projectManager'];
        		$time += $v['time'];
        	}
        	$tmp['time'] = $time;
        	$result[] = $tmp;
        }    	
    	exportExcel ( $xlsName, $xlsCell, $result );
    }
    
    
    //导出项目工作量表
    public function addBugExcl1(){
    	if (! empty ( $_FILES )) {
    		import ( "Org.Util.PHPExcel" );
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
    			import ( "Org.Util.PHPExcel.Reader.Excel5" );
    			$PHPReader = new \PHPExcel_Reader_Excel5 ();
    		} else if ($exts == 'xlsx') {
    			import ( "Org.Util.PHPExcel.Reader.Excel2007" );
    			$PHPReader = new \PHPExcel_Reader_Excel2007 ();
    		} else {
    			echo '9';
    			exit ();
    		}
    	
    		$PHPReader = new \PHPExcel_Reader_Excel2007 ();
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
    		foreach ( $data as $k => $v ) {
    			foreach ( $v as $key => $value ) {
    				
    				if($key =='A'){
    					$result ['projectId'] = $value;
    					$result ['projectManagerTime'] = $this->getProjectTime($value);
    				}
    				$key == 'B' ? $result ['projectName'] = $value : '';
    				$key == 'C' ? $result ['projectManager'] = $value : '';
    				$key == 'D' ? $result ['projectType'] = $value : '';
    				$key == 'E' ? $result ['contractTime'] =  $value : '';
    				$key == 'G' ? $result ['time'] = $value : '';
    				$key == 'I' ? $result ['toltalTime'] = $value : '';
    				$key == 'H' ? $result ['employeeTime'] =  $value : '';
    				$key == 'J' ? $result ['rate'] = $value : '';
    				$key == 'K' ? $result ['process'] = $value : '';
    				$key == 'L' ? $result ['detail'] =  $value : '';
    				
    			}
    			$bug = M ( 'project_team_export' );
    			$res = $bug->add ( $result );
    			if(!$res){
    				var_dump($result);
    			}
    		}
    		

    	} else {
    		$this->error ( "请选择上传的文件" );
    	}
    }
    
    
    //导出项目人月数
    
    public function exportProjectime(){
    	$xlsName = '项目工作量统计表';
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
    					'projectManager',
    					'项目经理'
    			),
    			array (
    					'projectType',
    					'项目类型'
    			),
    			array (
    					'contractTime',
    					'合同人月数'
    			),
    			array (
    					'projectManagerTime',
    					'1-8月项目经理确认'
    			),
    			array (
    					'time',
    					'1-8月工时（人月）'
    			),
    			array (
    					'toltalTime',
    					'总人月'
    			),
    			array (
    					'employeeTime',
    					'外协工时（人月）'
    			),
    			array (
    					'rate',
    					'总人月/合同人月'
    			),
    			array (
    					'process',
    					'截止8月项目进度百分比'
    			),
    			array (
    					'detail',
    					'备注'
    			)
    	);
    	$projectTime = M('project_team_export');
    	$data = $projectTime->query('select * from pmo_project_team_export');
    	 
    	exportExcel ( $xlsName, $xlsCell, $data );
    }
    
    //获取项目经理确认的项目时间
    
    public function getProjectTime($Id){
    	$projectId['projectId'] = $Id;
    	$projectTime = M('project_team_time');
    	$prject = $projectTime->where($projectId)->select();

    	$time = 0;
    	foreach ($prject as $k=>$v){
    		$time += $v['time'];
    	}
    	return $time;
    }
    
	
	
}