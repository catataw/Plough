<?php
class JobtimeAction extends Action {
	/**
	 * 导出部门工时
	 */
	public function exportJobtime() {
		set_time_limit ( 0 );
		$isLinux = 0;
		if (PHP_OS == 'Linux') {
			setlocale ( LC_ALL, 'zh_CN' );
			$isLinux = 1;
		}
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		// $team = $data['team']; //需要导出该部门下所有员工的工时
		$date = $data ['date']; // 需要导出哪段时间的工时
		$date = date ( 'Y-m-d', strtotime ( $date ) );
		$data ['left_time'] = '2017-09-01';
		$data ['right_time'] = '2017-09-30';
		$time ['left_time'] = $data ['left_time'];
		$time ['right_time'] = $data ['right_time'];
		// 连接工时数据库 找到该部门下员工每个项目的该阶段的填报情况
		$team = '大数据产品部';
		// 查询到部门下的小组
		$d_where ['userTeam'] = array (
				'like',
				$team . '%' 
		);
		$eachTeam = M ( 'user_info' )->distinct ( true )->where ( $d_where )->field ( 'userTeam' )->select ();
		$fileName = time ();
		$name = 'department' . $fileName . '.zip';
		$path = './departmentReport/' . $fileName . '/';
		if (! is_dir ( $path )) {
			if ($isLinux) {
				$order = "mkdir -p " . $path;
				exec ( $order );
			} else {
				mkdir ( $path, 755, true );
			}
		}
		$this->exportEachExcel ( $eachTeam, $time, $team, $path, $isLinux );
		// 打包下载 following
		$this->addFileToZip ( $path, $isLinux, $name );
	}
	
	/**
	 *
	 * @param $path 文件路径        	
	 */
	protected function addFileToZip($path, $isLinux = 1, $name = '') {
		if ($isLinux) {
			$linux = "sudo zip -r " . $name . " " . $path . '*';
			exec ( $linux, $res );
		} else {
			$zip = new ZipArchive ();
			if ($zip->open ( $name, ZipArchive::OVERWRITE ) === TRUE) {
				$this->readyZip ( $path, $zip, $name ); // 调用方法，对要打包的根目录进行操作，并将ZipArchive的对象传递给方法
				$zip->close (); // 关闭处理的zip文件
			}
		}
		// 下载
		$zipname = $name;
		header ( "Cache-Control: public" );
		header ( 'Content-Type: application/zip' );
		header ( "Content-Transfer-Encoding: binary" );
		header ( 'Content-disposition: attachment; filename=' . $zipname );
		header ( 'Content-Length: ' . filesize ( $zipname ) );
		readfile ( $zipname );
		unlink ( $zipname );
		deep_rmdir ( './departmentReport/' );
	}
	protected function readyZip($path, $zip, $name) {
		$handler = opendir ( $path ); // 打开当前文件夹由$path指定
		while ( ($filename = readdir ( $handler )) !== false ) {
			if ($filename != "." && $filename != "..") { // 文件夹文件名字为'.'和‘..’，不要对他们进行操作
				if (is_dir ( $path . $filename )) { // 如果读取的某个对象是文件夹，则递归
					$this->addFileToZip ( $path . $filename, '', $name );
				} else { // 将文件加入zip对象
					$zip->addFile ( $path . $filename );
				}
			}
		}
		closedir ( $path );
	}
	
	/**
	 * 导出每个小组的员工信息
	 * 
	 * @param
	 *        	$eachTeam
	 * @param
	 *        	$date
	 */
	protected function exportEachExcel($eachTeam, $time, $teamName, $path, $isLinux) {
		$monthArr = $this->getMonthArr ( $time, false );
		foreach ( $eachTeam as $key => $team ) {
			$nameArr = explode ( '/', $team ['userTeam'] );
			$name = $nameArr [1];
			$xlsName = ($name == '' ? '大数据产品部' : $name) . date ( 'Ym', strtotime ( $time ['left_time'] ) ) . '工时表';
			$where ['userTeam'] = $team ['userTeam'];
			$users = M ( 'user_info' )->field ( 'userName,userEmail,userType,userTeam,id,workId' )->where ( $where )->select (); // 该部门小组下所有的员工
			$needProject = M ( 'projects' )->field ( 'id,projectId,projectName,projectType,projectStage' )->where ( array (
					'projectId' => 'SJ20170001' 
			) )->find ();
			// 去工时表中查询出该人的填报情况
			foreach ( $users as $key => &$user ) {
				// 查询该人参与的项目
				$pro_where ['projectPeople'] = array (
						'like',
						'%' . $user ['userName'] . '%' 
				);
				// 找到该人参与的项目
				$projects = M ( 'Projects' )->field ( 'id,projectId,projectName,projectType,projectStage' )->where ( $pro_where )->select ();
				// $year = date('Y', strtotime($date));
				// $month = date('m', strtotime($date));
				// $totalDays = $this->getTotalDays($month, $year);
				$d_where ['date'] = array (
						array (
								'EGT',
								$time ['left_time'] 
						),
						array (
								'ELT',
								$time ['right_time'] 
						) 
				);
				$d_where ['workerName'] = $user ['userName'];
				$hasProjects = M ( 'job_time' )->distinct ( true )->field ( 'projectName' )->where ( $d_where )->select ();
				$realProjects = array ();
				foreach ( $hasProjects as $key => $hasProject ) {
					foreach ( $projects as $k => $project ) {
						if ($hasProject ['projectName'] == $project ['projectName']) {
							$realProjects [] = $project;
						}
					}
				}
				$projects = $realProjects;
				// 确保商机项目存在
				$flag = 0;
				foreach ( $projects as $project ) {
					if ($project ['projectId'] == 'SJ20170001') {
						$flag = 1;
					}
				}
				if ($flag == 0) {
					$projects [] = $needProject;
				}
				// 将这个阶段每个项目的工时导入
				$jobProjects = $this->addJobTime ( $projects, $time, $user ['userName'] );
				// 开始生成excel表格并导出 该projects应该是该员工该阶段参与的项目
				$user ['projects'] = $jobProjects;
			}
			unset ( $user );
			$realUsers = $this->dealRealTime ( $users );
			$this->exportExcel ( $realUsers, $xlsName, $monthArr, $path, $isLinux );
		}
		// 导出一张总表
		$this->exportDepartmentMsg ( $path, $time, $teamName, $isLinux );
	}
	
	/**
	 *
	 * @param $users 查询到的每个人的工时信息        	
	 */
	protected function dealRealTime($users) {
		foreach ( $users as $key => &$user ) {
			// 该月每天目前的总工时
			$timeArr = array ();
			foreach ( $user ['projects'] as $k => $project ) {
				// 排除商机项目
				// if($project['projectId'] == 'SJ20170001'){
				// continue;
				// }
				foreach ( $project ['jobTime'] as $day => $workTime ) {
					$timeArr [$day] += $workTime;
				}
			}
			// 判断每天的一个工时情况
			foreach ( $timeArr as $day => $workTime ) {
				if ($workTime > 8) {
					// 遍历每个项目那天的工时情况进行处理
					$sureSize = 0;
					foreach ( $user ['projects'] as $k => &$project ) {
						// //排除商机项目
						// if($project['projectId'] == 'SJ20170001'){
						// continue;
						// }
						// 对有值的数据进行缩放
						if ($project ['jobTime'] [$day] != '' || $project ['jobTime'] [$day] != 0) {
							$showTime = round ( 8 / $workTime * $project ['jobTime'] [$day] );
							// 控制不超过8h
							while ( ($sureSize + $showTime) > 8 ) {
								$showTime --;
							}
							if ($showTime == 0) {
								$project ['jobTime'] [$day] = '';
							} else {
								$project ['jobTime'] [$day] = $showTime;
							}
							$sureSize += $showTime;
						}
					}
					unset ( $project );
					if ($sureSize < 8) {
						foreach ( $user ['projects'] as $k => &$project ) {
							if ($project ['projectId'] == 'SJ20170001') {
								$project ['jobTime'] [$day] += 8 - $sureSize;
								break;
							}
						}
					}
					unset ( $project );
				} elseif ($workTime < 8) {
					$needTime = 8 - $workTime;
					// 在该人该天的商机项目下添加不足工时
					foreach ( $user ['projects'] as $k => &$project ) {
						if ($project ['projectId'] == 'SJ20170001') {
							$project ['jobTime'] [$day] += $needTime;
							break;
						}
					}
					unset ( $project );
				}
			}
		}
		unset ( $user );
		// var_dump($users);exit;
		return $users;
	}
	
	/**
	 * 部门汇总表
	 * 
	 * @param $path 保存的路径        	
	 * @param $date 日期        	
	 * @param $teamName 部门        	
	 */
	protected function exportDepartmentMsg($path = '', $time = array(), $teamName = '大数据产品部', $isLinux = 1) {
		$titleDate = date ( 'Ym', strtotime ( $time ['left_time'] ) );
		$xlsName = $teamName . $titleDate . '汇总表';
		$teamName = $teamName . '%';
		$sql = 'SELECT userTeam, count( userName ) AS numPeople
FROM `pmo_user_info`WHERE userTeam LIKE' . "'" . $teamName . "'" . 'GROUP BY userTeam';
		$res = M ( 'user_info' )->query ( $sql );
		// 根据查询结果导表
		import ( "ORG.Util.PHPExcel" );
		$objPHPExcel = new PHPExcel ();
		$count = count ( $res );
		if ($isLinux) {
			$xlsTitle = $xlsName;
		} else {
			$xlsTitle = iconv ( 'utf-8', 'gb2312', $xlsName );
		}
		$objPHPExcel->getProperties ()->setSubject ( $xlsTitle );
		$objPHPExcel->getActiveSheet ()->setTitle ( '汇总' );
		$objPHPExcel->getDefaultStyle ()->getAlignment ()->setHorizontal ( PHPExcel_Style_Alignment::HORIZONTAL_LEFT );
		$objPHPExcel->getDefaultStyle ()->getFont ()->setName ( '等线' );
		$objPHPExcel->getActiveSheet ()->getColumnDimension ( 'A' )->setWidth ( 30 );
		$objPHPExcel->getActiveSheet ()->getColumnDimension ( 'B' )->setWidth ( 10 );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'A1', '部门' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'B1', '人数' );
		$num = 0;
		for($i = 2; $i <= $count + 1; ++ $i) {
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'A' . $i, $res [$i - 2] ['userTeam'] );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'B' . $i, $res [$i - 2] ['numPeople'] );
			$num += $res [$i - 2] ['numPeople'];
		}
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'A' . ($count + 2), '总计' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'B' . ($count + 2), $num );
		// 保存文件
		$obwrite = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel2007' );
		// echo $xlsTitle;exit;
		$obwrite->save ( $path . $xlsTitle . '.xlsx' );
	}
	
	/**
	 * 獲取一個月的有效工作日
	 * 
	 * @param $date 查询的日期        	
	 */
	protected function getMonth($date, $hasWeek = true) {
		$month = date ( 'm', strtotime ( $date ) );
		$year = date ( 'Y', strtotime ( $date ) );
		$days = $this->getTotalDays ( $month, $year );
		$keyDay = key_day ();
		$monthArr = array ();
		$holiday = get_holiady ();
		$special_workday = get_special_workday ();
		for($i = 1; $i <= $days; ++ $i) {
			// 判断是否是节假日 特殊工作日
			$sureDate = $year . $month . ($i < 10 ? $keyDay [$i] : $i);
			if (in_array ( $sureDate, $holiday )) {
				// 是节假日 不记录
				continue;
			}
			
			if ($hasWeek == false) {
				// 不需要包含周末, 验证是否是特殊工作日
				$formDate = $year . '-' . $month . '-' . $i;
				$week = date ( 'w', strtotime ( $formDate ) );
				if ($week == 0 || $week == 6) {
					// 是否是特殊工作日
					if (! in_array ( $sureDate, $special_workday )) {
						continue;
					}
				}
			}
			$monthArr [] = $sureDate;
		}
		return $monthArr;
	}
	
	/**
	 * 獲取一個時間段的有效工作日
	 * 
	 * @param $date 查询的日期        	
	 */
	public function getMonthArr($time, $hasWeek = true) {
		$left_time_unix = strtotime ( $time ['left_time'] );
		$start = ( int ) date ( 'd', strtotime ( $time ['left_time'] ) );
		$left_month = date ( 'm', strtotime ( $time ['left_time'] ) );
		$left_year = date ( 'Y', strtotime ( $time ['left_time'] ) );
		$right_month = date ( 'm', strtotime ( $time ['right_time'] ) );
		$right_year = date ( 'Y', strtotime ( $time ['right_time'] ) );
		$right_days = '';
		if ($left_month == $right_month) {
			// 同一个月份
			$days = date ( 'd', strtotime ( $time ['right_time'] ) );
		} else {
			// 不同月份
			$days = $this->getTotalDays ( $left_month, $left_year );
			// 上限月
			$right_days = date ( 'd', strtotime ( $time ['right_time'] ) );
		}
		$right_time_unix = strtotime ( $time ['right_time'] );
		// 总天数
		$total_days = strtotime ( $right_time_unix - $left_time_unix ) / 3600 / 24;
		$keyDay = key_day ();
		$monthArr = array ();
		$holiday = get_holiady ();
		$special_workday = get_special_workday ();
		for($start; $start <= $days; ++ $start) {
			// 判断是否是节假日 特殊工作日
			$sureDate = $left_year . $left_month . ($start < 10 ? $keyDay [$start] : $start);
			if (in_array ( $sureDate, $holiday )) {
				// 是节假日 不记录
				continue;
			}
			if ($hasWeek == false) {
				// 不需要包含周末, 验证是否是特殊工作日
				$formDate = $left_year . '-' . $left_month . '-' . $start;
				$week = date ( 'w', strtotime ( $formDate ) );
				if ($week == 0 || $week == 6) {
					// 是否是特殊工作日
					if (! in_array ( $sureDate, $special_workday )) {
						continue;
					}
				}
			}
			$monthArr [] = $sureDate;
		}
		if ($right_days != '') {
			for($i = 1; $i <= $right_days; ++ $i) {
				// 判断是否是节假日 特殊工作日
				$sureDate = $right_year . $right_month . ($i < 10 ? $keyDay [$i] : $i);
				if (in_array ( $sureDate, $holiday )) {
					// 是节假日 不记录
					continue;
				}
				
				if ($hasWeek == false) {
					// 不需要包含周末, 验证是否是特殊工作日
					$formDate = $right_year . '-' . $right_month . '-' . $i;
					$week = date ( 'w', strtotime ( $formDate ) );
					if ($week == 0 || $week == 6) {
						// 是否是特殊工作日
						if (! in_array ( $sureDate, $special_workday )) {
							continue;
						}
					}
				}
				$monthArr [] = $sureDate;
			}
		}
		return $monthArr;
	}
	
	/**
	 *
	 * @param $projects 项目        	
	 * @param $date 查询月份的某个日期        	
	 * @param $userName 某个员工        	
	 */
	protected function addJobTime($projects, $time, $userName) {
		// $year = date('Y', strtotime($date));
		// $month = date('m', strtotime($date));
		// $days = $this->getTotalDays($month, $year);
		// $left_time = $year . '-' . $month . '-' . 1;
		// $right_time = $year . '-' . $month . '-' . $days;
		// 在job_time表中将userName 某个月份的工时记录拉取
		$where ['workerName'] = $userName;
		$where ['date'] = array (
				array (
						'EGT',
						$time ['left_time'] 
				),
				array (
						'ELT',
						$time ['right_time'] 
				) 
		);
		$jobTimes = M ( 'job_time' )->where ( $where )->select ();
		foreach ( $projects as $key => &$project ) {
			$recordProject = array ();
			foreach ( $jobTimes as $key => $jobTime ) {
				if ($project ['projectName'] == $jobTime ['projectName']) {
					// 说明该项目该月有工时记录
					$recordProject [] = $jobTime;
				}
			}
			// 对已填工时进行对号入座排序
			$sortJobTime = $this->sortJobTime ( $recordProject, $time );
			$project ['jobTime'] = $sortJobTime;
		}
		unset ( $project );
		$newProjects = array ();
		$dealProject = array ();
		foreach ( $projects as $k => &$project ) {
			if (in_array ( $project ['projectId'], $dealProject )) {
				continue;
			}
			// 相同的项目id为同一个项目
			foreach ( $projects as $one => $pro ) {
				if ($project ['id'] == $pro ['id']) {
					continue; // 排除自身
				}
				if ($pro ['projectId'] == $project ['projectId']) {
					// 合并工时记录
					$mergeProject = $this->mergeJobTime ( $project, $pro );
					$project = $mergeProject;
				}
			}
			unset ( $project ['projectName'] );
			unset ( $project ['id'] );
			$newProjects [] = $project;
			$dealProject [] = $project ['projectId'];
		}
		// echo '<pre>';
		// var_dump($newProjects);exit;
		return $newProjects;
	}
	
	/**
	 * 处理相同项目id的情况
	 * 
	 * @param
	 *        	$project
	 * @param
	 *        	$pro
	 */
	protected function mergeJobTime($project, $pro) {
		foreach ( $project ['jobTime'] as $day => &$jobtime ) {
			$jobtime += $pro ['jobTime'] [$day];
		}
		return $project;
	}
	protected function sortJobTime($recordProject, $time) {
		$jobTime = array ();
		$existTime = array ();
		$keyDay = key_day ();
		$holiday = get_holiady ();
		$special_workday = get_special_workday ();
		foreach ( $recordProject as $key => $record ) {
			// 判断该天是否是周末,节假日,特殊工作日
			$sureDate = date ( 'Ymd', strtotime ( $record ['date'] ) );
			if (in_array ( $sureDate, $holiday )) {
				// 是假期 跳出
				continue;
			}
			
			$week = date ( 'w', strtotime ( $record ['date'] ) );
			if ($week == 0 || $week == 6) {
				if (! in_array ( $sureDate, $special_workday )) {
					continue;
				}
			}
			$workTime = $record ['workTime'];
			$jobTime [$sureDate] += $workTime;
			$existTime [] = $sureDate;
		}
		$left_time_unix = strtotime ( $time ['left_time'] );
		$right_time_unix = strtotime ( $time ['right_time'] );
		for($left_time_unix; $left_time_unix <= $right_time_unix; $left_time_unix += 3600 * 24) {
			$oneDate = date ( 'Ymd', $left_time_unix );
			
			// 判断是否是周末,周末不记录
			if (in_array ( $oneDate, $holiday )) {
				// 是假期 跳出
				continue;
			}
			$week = date ( 'w', $left_time_unix );
			if ($week == 0 || $week == 6) {
				if (! in_array ( $oneDate, $special_workday )) {
					continue;
				}
			}
			if (in_array ( $oneDate, $existTime )) {
				continue;
			}
			$jobTime [$oneDate] = ''; // 未填写工时时的填充值
		}
		// 排序
		ksort ( $jobTime );
		return $jobTime;
	}
	
	/**
	 *
	 * @param $users 一个部门某个时间段每个员工参与项目的工时填报情况        	
	 * @param $xlsName 生成excel表的表名        	
	 * @param $date 查询的时间        	
	 */
	protected function exportExcel($users, $xlsName, $monthArr, $path, $isLinux) {
		header ( 'Content-type:text/html;charset=gb2312' );
		import ( "ORG.Util.PHPExcel" );
		$objPHPExcel = new PHPExcel ();
		$count = count ( $users );
		if ($isLinux) {
			$xlsTitle = $xlsName;
		} else {
			$xlsTitle = iconv ( 'utf-8', 'gb2312', $xlsName );
		}
		$objPHPExcel->getProperties ()->setSubject ( $xlsTitle );
		foreach ( $users as $key => $user ) {
			if ($key < $count - 1) {
				$objPHPExcel->createSheet ();
			}
			$objPHPExcel->setActiveSheetIndex ( $key );
			$objPHPExcel->getActiveSheet ()->setTitle ( $user ['workId'] );
			$objPHPExcel->getDefaultStyle ()->getAlignment ()->setHorizontal ( PHPExcel_Style_Alignment::HORIZONTAL_LEFT );
			$objPHPExcel->getDefaultStyle ()->getFont ()->setName ( '等线' );
			$objPHPExcel->getActiveSheet ()->getColumnDimension ( 'A' )->setWidth ( 20 );
			$objPHPExcel->getActiveSheet ()->setCellValue ( 'A1', '日期' );
			// 遍历填充日期
			for($i = 2; $i <= count ( $monthArr ) + 1; ++ $i) {
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'A' . $i, $monthArr [$i - 2] );
			}
			$location_map = jobtime_map ();
			
			foreach ( $user ['projects'] as $key => $project ) {
				// $go = 0;
				// foreach($project['jobTime'] as $day => $time){
				// if($time != ''){
				// $go = 1;
				// }
				// }
				// if($go == 0){
				// continue;
				// }
				$objPHPExcel->getActiveSheet ()->getColumnDimension ( $location_map [$key] )->setWidth ( 20 );
				$objPHPExcel->getActiveSheet ()->setCellValue ( $location_map [$key] . '1', $project ['projectId'] );
				// 填该月的工时
				$workTimeArr = array ();
				foreach ( $project ['jobTime'] as $k => $eachTime ) {
					$workTimeArr [] = $eachTime;
					// $objPHPExcel->getActiveSheet()->setCellValue($location_map[$key] . ($k + 1), $eachTime);
				}
				for($i = 2; $i <= count ( $workTimeArr ) + 1; ++ $i) {
					$objPHPExcel->getActiveSheet ()->setCellValue ( $location_map [$key] . $i, $workTimeArr [$i - 2] );
				}
			}
		}
		// 保存在文件夹中
		$obwrite = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel2007' );
		// echo $xlsTitle;exit;
		$obwrite->save ( $path . $xlsTitle . '.xlsx' );
		// header ( 'pragma:public' );
		// header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="' . $xlsTitle . '.xls"' );
		// header ( 'Content-Disposition:attachment;filename="'. $xlsTitle .'.xls"' ); // attachment新窗口打印inline本窗口打印
		// $objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
		// $objWriter->save ( 'php://output' );
		// exit ();
	}
	
	/**
	 *
	 * @param
	 *        	一个月份的任意日期
	 */
	public function getWorkTime() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$workerName = session ( 'userName' );
		$date = $data ['writeTime'];
		$timeStr = strtotime ( $date );
		$month = date ( 'm', $timeStr );
		$year = date ( 'Y', $timeStr );
		$days = $this->getTotalDays ( $month, $year );
		$left_date = $year . '-' . $month . '-' . 1;
		$right_date = $year . '-' . $month . '-' . $days;
		$where ['workerName'] = $workerName;
		$where ['date'] = array (
				'between',
				array (
						$left_date,
						$right_date 
				) 
		);
		$infos = M ( 'job_time' )->where ( $where )->select ();
		
		// 找到该员工对应月份所有的工时记录
		$realArr = $this->userWorkTime ( $infos, $month, $date );
		echo json_encode ( $realArr );
	}
	
	/**
	 *
	 * @param $infos 查询到的工时记录        	
	 * @param $needMonth 需要查询的月份        	
	 * @param $days 该月的总天数        	
	 * @param $date 该月份的任意一个日期        	
	 * @return array
	 */
	protected function userWorkTime($infos, $needMonth, $date) {
		$weekarray = week_array ();
		$dealInfo = array ();
		foreach ( $infos as $key => $info ) {
			$timeStr = strtotime ( $info ['date'] );
			$month = date ( 'm', $timeStr );
			if ($month == $needMonth) {
				// 说明该条记录是在时间范围内 添加星期记录
				$week = '星期' . $weekarray [date ( 'w', $timeStr )];
				$info ['week'] = $week;
				// 获取第几天
				$info ['day'] = date ( 'd', $timeStr );
				$dealInfo [] = $info;
			}
		}
		// var_dump($dealInfo);exit;
		// 对满足日期的工时记录按每天来统计
		$realArr = $this->dealWorkTime ( $dealInfo, $date );
		return $realArr;
	}
	
	/**
	 *
	 * @param $dealInfo 满足对应员工时间段的工时信息        	
	 * @param $date 某个月份的任意日期        	
	 */
	protected function dealWorkTime($dealInfo, $date) {
		$requestArr = array ();
		$recordId = array ();
		foreach ( $dealInfo as $key => $info ) {
			$flag = 0;
			$workTime = 0;
			$now = $info ['day'];
			foreach ( $dealInfo as $k => $v ) {
				if ($v ['day'] == $now) {
					if (! in_array ( $v ['id'], $recordId )) {
						// 说明是同一天并且没有记录的
						$workTime += $v ['workTime'];
						$recordId [] = $v ['id'];
						$flag = 1;
					}
				}
			}
			if ($flag == 1) {
				unset ( $info ['id'] );
				unset ( $info ['projectName'] );
				unset ( $info ['workType'] );
				unset ( $info ['workDetail'] );
				unset ( $info ['isAudit'] );
				unset ( $info ['workerName'] );
				$info ['workTime'] = $workTime;
				$getTime = strtotime ( $info ['date'] );
				$info ['date'] = date ( 'Y-m-d', $getTime );
				$requestArr [] = $info;
			}
		}
		$realArr = $this->splitArr ( $requestArr, $date );
		return $realArr;
	}
	
	/**
	 *
	 * @param $requestArr 需要拆分的数组        	
	 * @param $date 某个月份的任意日期        	
	 */
	protected function splitArr($requestArr, $date) {
		
		// 小于总天数 将数据填充
		$dayArr = array ();
		$timeStr = strtotime ( $date );
		$year = date ( 'Y', $timeStr );
		$month = date ( 'm', $timeStr );
		// 根据月份获取该月的总天数
		$days = $this->getTotalDays ( $month, $year );
		
		foreach ( $requestArr as $v ) {
			array_push ( $dayArr, $v ['day'] );
		}
		if (count ( $requestArr ) < $days) {
			for($i = 1; $i <= $days; ++ $i) {
				if (! in_array ( $i, $dayArr )) {
					// 需要填充
					$time = $i > 9 ? $year . '-' . $month . '-' . $i : $year . '-' . $month . '-0' . $i;
					$str = strtotime ( $time );
					$data ['date'] = $time;
					$data ['workTime'] = 0;
					$weekarray = week_array ();
					$week = '星期' . $weekarray [date ( 'w', $str )];
					$data ['week'] = $week;
					$data ['day'] = $i;
					$requestArr [] = $data;
				}
			}
		}
		usort ( $requestArr, 'num_check' );
		$firstArr = array ();
		$num = count ( $requestArr );
		$first = floor ( $num / 2 );
		for($i = 0; $i < $first; ++ $i) {
			$firstArr [] = array_shift ( $requestArr );
		}
		$returnArr [] = $this->getHolidayTag ( $firstArr );
		$returnArr [] = $this->getHolidayTag ( $requestArr );
		return $returnArr;
	}
	
	/*
	 * 给日期加上节假日标签
	 */
	public function getHolidayTag($days) {
		if ($days) {
			$holiday = get_holiady ();
			foreach ( $holiday as $v ) {
				$yarn = substr ( $v, 0, 4 );
				$month = substr ( $v, 4, 2 );
				$day = substr ( $v, 6, 2 );
				$date = $yarn . '-' . $month . '-' . $day;
				$formatHolidays [] = $date;
			}
			
			foreach ( $days as $key => $val ) {
				if (in_array ( $val ['date'], $formatHolidays )) {
					$days [$key] ['isHoliday'] = true;
				}
			}
		}
		
		return $days;
	}
	
	/**
	 *
	 * @param $month 月份        	
	 * @param $year 年份        	
	 * @return int 该月的天数
	 */
	protected function getTotalDays($month, $year) {
		if (in_array ( $month, array (
				1,
				3,
				5,
				7,
				8,
				01,
				03,
				05,
				07,
				'08',
				10,
				12 
		) )) {
			return 31;
		} elseif ($month == 02 || $month == 2) {
			// 判断是否是闰年
			if ($year % 400 == 0 || ($year % 4 == 0 && $year % 100 !== 0)) {
				return 29;
			} else {
				return 28;
			}
		} else {
			return 30;
		}
	}
	
	/**
	 * 获取某天已经填写的工时记录
	 */
	public function getFillJobTime() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$userName = session ( 'userName' );
		$date = $data ['editDate'];
		$where ['workerName'] = $userName;
		$where ['date'] = $date;
		// 该员工所参与的项目(目前为该员工所参与的所有项目)
		$projects = M ( 'job_time' )->where ( $where )->select ();
		echo json_encode ( $projects );
	}
	
	/**
	 * 平台组添加和更新报工记录
	 */
	public function writePlatformJobTime(){
		/*$data['writeWorkTime'][0]["workType"] = 1;
		$data['writeWorkTime'][0]['projectId'] = 'B201785-074';
		$data['writeWorkTime'][0]['workTime'] = 8;
		$data['writeWorkTime'][0]['workDetail'] = '完成XX西页面开发';

		$data['writeWorkTime'][1]["workType"] = 1;
		$data['writeWorkTime'][1]['projectId'] = 'B201785-074';
		$data['writeWorkTime'][1]['workTime'] = 8;
		$data['writeWorkTime'][1]['workDetail'] = '完成XX西页面开发';
		$data['date'] = "2018-03-11";
		$data['userName'] = '陈熹伟';*/

		$postData = file_get_contents ( "php://input" );
		
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		//var_dump($data);exit;
		//验证数据合法性
		$newprojectClass = new NewprojectAction();
		$isPlatform = isPlatformUser($data['userName']);
		$totalTime = 0;
		if($isPlatform){
			foreach ($data['writeWorkTime'] as $key=>$value){
				//判断项目是否非法
				$islegal = $newprojectClass->isExistProject($value['projectId']);
				if(!$islegal){
					$result['status'] = 1;
					$result['message'] = '报工项目id:，'.$value['projectId'].'非法，请确认';
					echo json_encode($result);
					return;
				}
				//判断报工时间是否小于24小时
				$totalTime += $value['workTime'];
			}
			if($totalTime>24){
				$result['status'] = 0;
				$result['message'] = '报工人员:'.$data['userName'].$data['date'].'报工超24小时，请确认';
				echo json_encode($result);
				return;
			}
		}else{
			$result['status'] = 2;
			$result['message'] = '报工人员，'.$data['userName'].'非平台组人员，请确认';
			echo json_encode($result);
			return;
		}
        //删除新增日期数据
		$jobTime = M ( 'job_time' );
		$projects = M('projects');
		$sql = 'delete from pmo_job_time where workerName="' . $data['userName'] . '" and date = "' . $data['date'] . '"';
		$jobTime->query ( $sql );
		$logs = M ( 'logs_info' );
		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . $sql;
		$logs->add ( $logsData );
		//添加报工数据
		foreach ( $data['writeWorkTime'] as $key => $record ) {
			//获取项目编号
			$where['isDelete'] = 1;
			$where['projectId'] = $record['projectId'];
			$projectInfo = $projects->where($where)->select();
			if($projectInfo){
				$record['projectName'] = $projectInfo[0]['projectName'];
			}
			$record['date'] = $data['date'];
			$record ['workerName'] = $data['userName'];
			if($record['projectId']){
				$jobTime->add ( $record );
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . $data['userName'] . '通过接口批量添加了' . $record ['date'] . $record ['projectName'] . '的工时记录';
				$logs->add ( $logsData );
			}
		}
		$result['status'] = 200;
		$result['message'] = 'ok';
		echo json_encode($result);
		
	}
	
	
	/**
	 * 更新添加报工记录
	 */
	public function replaceJobTime() {
		$postData = file_get_contents ( "php://input" );
		//var_dump($postData);exit;
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		
		$userName = $data ['userName'];
		$date = $data ['date'];
		$writeWorkTime = $data ['writeWorkTime'];
		$jobTime = M ( 'job_time' );
		$projects = M('projects');
		$sql = 'delete from pmo_job_time where workerName="' . $userName . '" and date = "' . $date . '"';
		
		$jobTime->query ( $sql );
		$logs = M ( 'logs_info' );
		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . $sql;
		$logs->add ( $logsData );
		foreach ( $writeWorkTime as $key => $record ) {
			//获取项目编号
			$where['projectName'] = $record['projectName'];
			$projectInfo = $projects->where($where)->select();
			if($projectInfo){
				$record['projectId'] = $projectInfo[0]['projectId']; 
			}			
			$record ['workerName'] = $userName;
			if($record['projectId']){
				M ( 'job_time' )->add ( $record );
				$logs = M ( 'logs_info' );
				$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . $userName . '添加了' . $record ['date'] . $record ['projectName'] . '的工时记录';
				$logs->add ( $logsData );
			}

		}
		echo 1;
		exit ();
	}
	
	/**
	 * 更新一周的报工情况
	 */
	public function replaceWeeklyJobTime() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$userName = $data ['userName'];
		$week = $data ['workTime'];
		$data = $data ['workItem'];
		
		foreach ( $data as $key => &$record ) {
			$record ['workerName'] = $userName;
		}
		unset ( $record );
		$workDays = count ( $week ); // 统计工作日
		if (count ( $week ) == 1) {
			$left_time = $right_time = $week [0];
		} else {
			$left_time = $week [0];
			$right_time = $week [count ( $week ) - 1];
		}
		$totalWorkTime = 0; // 一周总工时
		foreach ( $data as $k => $item ) {
			$totalWorkTime += $item ['workTime'];
		}
		if ($totalWorkTime >= $workDays * 8) {
			$baseTime = floor ( $totalWorkTime / $workDays );
		} else {
			$baseTime = 8;
		}
		$standardTime = $baseTime;
		$dealJobTime = array ();
		$leftStatus = array ();
		
		// 一天一处理
		for($i = 1; $i <= $workDays; ++ $i) {
			$hasTime = 0; // 是否有被剩余填充的时间
			              // 复原baseTime
			$baseTime = $standardTime;
			// 是否有剩余
			if (! empty ( $leftStatus )) {
				// 先将剩余的补充到该天
				if ($leftStatus ['workTime'] >= $baseTime) {
					// 剩余时间可以补足该天
					$leftTime = $leftStatus ['workTime'] - $baseTime;
					$leftStatus ['workTime'] = $baseTime;
					$leftStatus ['date'] = $week [$i - 1];
					$dealJobTime [] = $leftStatus;
					if ($leftTime != 0) {
						$leftStatus ['workTime'] = $leftTime;
						unset ( $leftStatus ['date'] );
					} else {
						unset ( $leftStatus );
					}
					continue;
				} else {
					// 剩余时间不可以补足该天
					$leftStatus ['date'] = $week [$i - 1];
					$dealJobTime [] = $leftStatus;
					$hasTime = $leftStatus ['workTime'];
					unset ( $leftStatus );
				}
			}
			$baseTime = $baseTime - $hasTime;
			if (! empty ( $data )) {
				$record = array_shift ( $data );
				if ($record ['workTime'] >= $baseTime) {
					// 将该天填充满
					$leftTime = $record ['workTime'] - $baseTime;
					$record ['workTime'] = $baseTime;
					$record ['date'] = $week [$i - 1];
					$dealJobTime [] = $record;
					if ($leftTime == 0) {
						unset ( $leftStatus );
						continue;
					}
					$record ['workTime'] = $leftTime;
					unset ( $record ['date'] );
					$leftStatus = $record;
				} else {
					// 小于baseTime 不能将该天填满
					$record ['date'] = $week [$i - 1];
					$needTime = $baseTime - $record ['workTime'];
					$dealJobTime [] = $record;
					do {
						if (empty ( $data )) {
							// 已经填完
							break 2;
						}
						$newRecord = array_shift ( $data );
						if ($newRecord ['workTime'] < $needTime) {
							// 不能补足
							$needTime = $needTime - $newRecord ['workTime'];
							$newRecord ['date'] = $week [$i - 1];
							$dealJobTime [] = $newRecord;
							$enough = 1;
						} else {
							// 可以补足
							$leftTime = $newRecord ['workTime'] - $needTime;
							$newRecord ['date'] = $week [$i - 1];
							$newRecord ['workTime'] = $needTime;
							$dealJobTime [] = $newRecord;
							if ($leftTime == 0) {
								unset ( $leftStatus );
								break;
							}
							$enough = 0;
							// 剩余情况
							unset ( $newRecord ['date'] );
							$newRecord ['workTime'] = $leftTime;
							$leftStatus = $newRecord;
						}
					} while ( $enough );
				}
			} else {
				// 入库数据处理完毕
				break;
			}
		}
		// 入库
		$this->addWeeklyJobTime ( $dealJobTime, $left_time, $right_time, $userName );
	}
	protected function addWeeklyJobTime($dealJobTime, $left_time, $right_time, $userName) {
		$logs = M ( 'logs_info' );
		$projects = M('projects');
		// 先清空该段时间的工时记录
		// $where['date'] = array('between',array($left_time, $right_time));
		// $where['workerName'] = session('userName');
		$jobTime = M ( 'job_time' );
		$sql = 'delete from pmo_job_time where workerName="' . $userName . '" and date between "' . $left_time . '" and "' . $right_time . '"';
		$jobTime->query ( 'delete from pmo_job_time where workerName="' . $userName . '" and date between "' . $left_time . '" and "' . $right_time . '"' );
		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . $sql;
		$logs->add ( $logsData );
		// $jobTime->where($where)->delete();
		// 将按周填处理完的工时记录入库
		foreach ( $dealJobTime as $key => $record ) {
			if ($record ['workTime'] == '' || $record ['projectName'] == '' || $record ['workType'] == '') {
				continue;
			}
			//获取项目编号
			$where['projectName'] = $record['projectName'];
			$projectInfo = $projects->where($where)->select();
			if($projectInfo){
				$record['projectId'] = $projectInfo[0]['projectId'];
			}
			if($record['projectId']){
				$jobTime->add ( $record );
			}
		}
		$logs = M ( 'logs_info' );
		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '更新了' . $left_time . '至' . $right_time . '的工时记录';
		$logs->add ( $logsData );
		echo 1;
		exit ();
	}
	
	/**
	 * 导出一个月一天都没有填的人
	 */
	public function exportNoFill() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$date = $data ['date'];
		$date = '2017-8-3';
		$month = date ( 'm', strtotime ( $date ) );
		$year = date ( 'Y', strtotime ( $date ) );
		$days = $this->getTotalDays ( $month, $year );
		$left_time = $year . '-' . $month . '-' . 1;
		$right_time = $year . '-' . $month . '-' . $days;
		$where ['date'] = array (
				'between',
				array (
						$left_time,
						$right_time 
				) 
		);
		$res = M ( 'job_time' )->distinct ( true )->field ( 'workerName' )->where ( $where )->select ();
		$hasUser = array ();
		foreach ( $res as $k => $u ) {
			$hasUser [] = $u ['workerName'];
		}
		$u_where ['userTeam'] = array (
				'like',
				'大数据产品部%' 
		);
		$users = M ( 'user_info' )->where ( $u_where )->select ();
		$noFillUser = array ();
		foreach ( $users as $key => $user ) {
			if (! in_array ( $user ['userName'], $hasUser )) {
				$noFillUser [] = $user;
			}
		}
		echo json_encode ( $noFillUser );
	}
	
	/**
	 * 获取每个月的工作日时间
	 */
	public function getMonthWorkDate($date) {
		$monthArr = $this->getMonthArr ( $date, false );
		// $monthDate = [];
		foreach ( $monthArr as $k => $v ) {
			$yarn = substr ( $v, 0, 4 );
			$month = substr ( $v, 4, 2 );
			$day = substr ( $v, 6, 2 );
			$date = $yarn . '-' . $month . '-' . $day;
			$monthDate [] = $date;
		}
		return $monthDate;
	}
	
	/*
	 * 获取大数据产品部所有在职员工信息
	 */
	public function getDepartMentUsers() {
		if (session ( 'userType' == 1 )) {
			echo 0;
			exit ();
		}
		$team = '大数据产品部';
		// 获取该部门的所有成员
		if (session ( 'userType' ) == 2 || session ( 'userType' ) == 3) {
			//$users = M ( 'user_info' )->query ( 'select * from pmo_user_info where isDelete = 1 and userName="胡小克"' );
			$users = M ( 'user_info' )->query ( 'select * from pmo_user_info where isDelete = 1 and userTeam like "大数据产品部%"' );
		} else if (session ( 'userType' ) == 5) {
			// 获取所有小组
			$allTeamSql = 'select teamName from pmo_teams where bigTeamLeader="' . session ( 'userName' ) . '"';
			$teamsInfo = M ( 'teams' )->query ( $allTeamSql );
			foreach ( $teamsInfo as $val ) {
				$teams [] = $val ['teamName'];
			}
			$where ['userTeam'] = array (
					'in',
					$teams 
			);
			$users = M ( 'user_info' )->where ( $where )->select ();
		} else {
			//如果是平台组，陈熹伟可以看全部
			if(session('userName')=='陈熹伟'){
				$users = M('user_info')
				->query('select * from pmo_user_info where isDelete = 1 and userTeam like "大数据产品部/平台组%"');
			}else{
				$users = M('user_info')
				->query('select * from pmo_user_info where isDelete = 1 and userTeam ="'.session('userTeam').'"');
			}
		}
		return $users;
	}
	
	/**
	 * 导出员工的工作日期
	 */
	public function exportPeopleJobTime() {
		set_time_limit ( 0 );
		$users = $this->getDepartMentUsers ();
		
		
		$date ['left_time'] = $_REQUEST ['startTime'];
		$date ['right_time'] = $_REQUEST ['endTime'];
		$workDate = $this->getMonthWorkDate ( $date );

		forEach ( $workDate as $date ) {
			foreach ( $users as $user ) {
				$oneDayWork = $this->getOnePeopleJobtime ( $user, $date );

				foreach ( $oneDayWork as $v ) {
					$result [] = $v;
				}
			}
		}

		$this->exportNewExcel ( $result );
	}
	/*
	 * 导出实际填报工时
	 */
	public function exportRealPeopleJobTime() {
		set_time_limit ( 0 );
		$date ['left_time'] = $_REQUEST ['startTime'];
		$date ['right_time'] = $_REQUEST ['endTime'];
		$workDate = $this->getMonthWorkDate ( $date );
		$users = $this->getDepartMentUsers ();
		
		forEach ( $workDate as $date ) {
			foreach ( $users as $user ) {
				$oneDayWork = $this->getOnePeopleRealJobtime ( $user, $date );
				if (count ( $oneDayWork ) > 0) {
					foreach ( $oneDayWork as $v ) {
						$result [] = $v;
					}
				}
			}
		}
		$this->exportNewExcel ( $result );
	}
	
	/**
	 * 获取员工每天工时
	 */
	public function getOnePeopleRealJobtime($user, $date) {
		$jobTimeWhere ['workerName'] = $user ['userName'];
		$jobTimeWhere ['date'] = $date;
		$dateJobInfo = M ( 'Job_time' )->where ( $jobTimeWhere )->select ();
		foreach ( $dateJobInfo as $k => $v ) {
			$projects = M ( 'projects' )->query ( 'select projectId from pmo_projects where projectName="' . $v ['projectName'] . '" and isDelete =1' );
			$result [] = array (
					'workerName' => $user ['userName'],
					'date' => $date,
					'workTime' => $v ['workTime'],
					'projectName' => getRealName ( $projects [0] ['projectId'], $v ['projectName'] ),
					'workId' => $user ['workId'],
					'projectId' => $projects [0] ['projectId'],
					'workType' => getWorkType ( $v ['workType'] )
			);
		}
		return $result;
	}
	
	/**
	 * 生成员工，每天工时
	 */
	public function getOnePeopleJobtime($user, $date) {
		$jobTimeWhere ['workerName'] = $user ['userName'];
		$jobTimeWhere ['date'] = $date;
		$dateJobInfo = M ( 'Job_time' )->where ( $jobTimeWhere )->select ();
		
		if (count ( $dateJobInfo ) > 0) {
			$workTime = 0;
			foreach ( $dateJobInfo as $k => $v ) {
				if (trim ( $v ['projectName'] ) != '') {
					$workTime += $v ['workTime'];
				}
			}
			$Rate = round ( $workTime / 8, 2 );
			foreach ( $dateJobInfo as $k => $v ) {
				if (trim ( $v ['projectName'] ) != '') {
					// 获取项目Id
					$projects = M ( 'projects' )->query ( 'select projectId from pmo_projects where projectName="' . $v ['projectName'] . '" and isDelete=1' );
					//若为商机项目则填写为产品类项目
					if ($projects [0] ['projectId'] == 'SJ20170001') {
						$project = $this->getProductProject($user ['userName']);
						$result [] = array (
								'workerName' => $user ['userName'],
								'date' => $date,
								'workTime' => round ( $v ['workTime'] / $Rate ),
								'projectName' => getRealName ( $project['projectId'], $project['projectName'] ),
								'workId' => $user ['workId'],
								'projectId' => $project['projectId'],
								'workType' => getWorkType ( $v ['workType'] ) 
						);
					} else {
						$isDeleteProject = $this->isDeleteProject($projects [0] ['projectId']);
						if($isDeleteProject){
							//若为已删除项目则填写为产品类项目
							$project = $this->getProductProject($user ['userName']);
							$result [] = array (
									'workerName' => $user ['userName'],
									'date' => $date,
									'workTime' => round ( $v ['workTime'] / $Rate ),
									'projectName' => getRealName ( $project['projectId'], $project['projectName'] ),
									'workId' => $user ['workId'],
									'projectId' => $project['projectId'],
									'workType' => getWorkType ( $v ['workType'] )
							);
						}else{

							$result [] = array (
									'workerName' => $user ['userName'],
									'date' => $date,
									'workTime' => round ( $v ['workTime'] / $Rate ),
									'projectName' => getRealName ( $projects [0] ['projectId'], $v ['projectName'] ),
									'workId' => $user ['workId'],
									'projectId' => $projects [0] ['projectId'],
									'workType' => getWorkType ( $v ['workType'] )
							);
						}

					}
				}
			}
		} else {
			//若无数据，填写为产品类项目
			$project = $this->getProductProject($user ['userName']);
			$result [] = array (
					'workerName' => $user ['userName'],
					'date' => $date,
					'workTime' => 8,
					'projectName' => getRealName ( $project['projectId'], $project['projectName'] ),
					'workId' => $user ['workId'],
					'projectId' => $project['projectId'],
					'workType' => '项目管理' 
			);
		}
		return $result;
	}
	
	
	/**
	 * 判断项目是否已经删除
	 */
	public function isDeleteProject($projectId){
		$where['projectId'] = $projectId;
		$where['isDelete'] = 1;
		$projects = M('projects')->where($where)->select();
		if($projects){
			return false;
		}else{
			return true;
		}
		
	}
	
	
	
	/**
	 * 获取员工产品类项目
	 */
	public function getProductProject($workerName){
		$projects = M('projects');
		$sql = 'select * from pmo_projects where projectPeople LIKE"%'.$workerName.'%" AND projectId LIKE "%Y201%" AND projectId != "Y2017TP999" AND isDelete=1';
		$joinedProductProject = $projects->query($sql);
        if($joinedProductProject){
        	return $joinedProductProject[0];
        }else{
        	$sql = 'select * from pmo_projects where projectPeople LIKE"%'.$workerName.'%" AND projectId != "Y2017TP999" AND projectId != "SJ20170001" AND isDelete=1';
        	$joinMarketProject = $projects->query($sql);
        	if($joinMarketProject){
        		return $joinMarketProject[0];
        	}else{
        		$project['projectName'] = '大数据产品部部门工时';
        		$project['projectId'] = 'Y2017TP999';
        		return $project;
        	}
        }
	}
	
	
	
	/**
	 * 导出新的excel工时
	 */
	public function exportNewJobTime() {
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		
		$left_time = $data ['left_time'];
		$right_time = $data ['right_time'];
		$left_time = '2017-09-01';
		$right_time = '2017-09-30';
		
		$where ['date'] = array (
				'between',
				array (
						$left_time,
						$right_time 
				) 
		);
		$projects = M ( 'job_time' )->alias ( 'job' )->field ( 'job.*, ui.workId, p.projectId' )->join ( 'LEFT JOIN __USER_INFO__ AS ui on job.workerName = ui.userName' )->join ( 'LEFT JOIN __PROJECTS__ AS p on job.projectName = p.projectName' )->where ( $where )->select ();
		// 先验证工时
		$projects = $this->checkJobTime ( $projects, $left_time );
		// 开始导出至excel
		var_dump ( $projects );
		exit ();
		// $this->exportNewExcel($projects);
	}
	
	/**
	 * 导出
	 * 
	 * @param
	 *        	$projects
	 */
	public function exportNewExcel($projects) {
		set_time_limit ( 0 );
		import ( "ORG.Util.PHPExcel" );
		$objPHPExcel = new PHPExcel ();
		
		$objPHPExcel->getProperties ()->setSubject ( '报表' );
		$objPHPExcel->setActiveSheetIndex ( 0 );
		$objPHPExcel->getDefaultStyle ()->getAlignment ()->setHorizontal ( PHPExcel_Style_Alignment::HORIZONTAL_LEFT );
		$objPHPExcel->getDefaultStyle ()->getFont ()->setName ( '等线' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'A1', '项目名称' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'B1', '员工编号(OA工号)' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'C1', '员工名称' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'D1', '报工日期' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'E1', '工时' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'F1', '项目编号' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'G1', '工作类型' );
		// 遍历填充日期
		$i = 2;
		foreach ( $projects as $key => $project ) {
			
			if (! ($project ['projectName'] == null)) {
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'A' . ($i), $project ['projectName'] );
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'B' . ($i), $project ['workId'] );
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'C' . ($i), $project ['workerName'] );
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'D' . ($i), $project ['date'] );
				if ($project ['workTime'] > 8) {
					$objPHPExcel->getActiveSheet ()->setCellValue ( 'E' . ($i), 8 );
				} else {
					$objPHPExcel->getActiveSheet ()->setCellValue ( 'E' . ($i), $project ['workTime'] );
				}
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'F' . ($i), $project ['projectId'] );
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'G' . ($i), $project ['workType'] );
			} else {
				continue;
			}
			$i ++;
		}
		
		header ( 'pragma:public' );
		header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="报工excel.xls"' );
		header ( 'Content-Disposition:attachment;filename="报工excel.xls"' ); // attachment新窗口打印inline本窗口打印
		$objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
		$objWriter->save ( 'php://output' );
	}
	public function checkJobTime($projects, $left_time) {
		$year = date ( 'Y', strtotime ( $left_time ) );
		$month = date ( 'm', strtotime ( $left_time ) );
		$days = $this->getTotalDays ( $month, $year );
		$key_day = key_day ();
		$day_arr = array ();
		$has_day = array ();
		for($i = 1; $i <= $days; ++ $i) {
			$i = ($i < 10) ? $key_day [$i] : $i;
			$get = $year . '-' . $month . '-' . $i;
			$day_arr [] = strtotime ( $get );
		}
		// 获得人员名单
		$users = M ( 'user_info' )->field ( 'userName, workId' )->select ();
		foreach ( $users as $user ) {
			foreach ( $projects as $project ) {
				if ($project ['workerName'] == $user ['userName']) {
					if (in_array ( strtotime ( $project ['date'] ), $has_day )) {
						continue;
					}
					$has_day [] = strtotime ( $project ['date'] );
				}
			}
			foreach ( $day_arr as $day ) {
				if (! in_array ( $day, $has_day )) {
					// 该天没有工时
					$projects [] = array (
							'workerName' => $user ['userName'],
							'date' => date ( 'Y-m-d H:i:s', $day ),
							'workTime' => 8,
							'projectName' => '大数据商机项目',
							'workId' => $user ['workId'],
							'projectId' => 'SJ20170001' 
					);
				}
			}
		}
		return $projects;
	}
	
	/**
	 * 导出缺少工时员工信息
	 */
	public function exportNoJobTime() {
		header ( "Content-Type:text/html;charset=utf-8" );
		set_time_limit ( 0 );
		$date ['left_time'] = $_REQUEST ['startTime'];
		$date ['right_time'] = $_REQUEST ['endTime'];
		// $date = array('left_time'=>'2017-08-01','right_time'=>'2017-08-31');
		$workDate = $this->getMonthWorkDate ( $date );
		$users = $this->getRemainDepartMentUsers ();
		$jobtime = M ( "job_time" );
		$newData = array ();
		forEach ( $users as $key => $value ) {
			$times = $jobtime->where ( "workerName='{$value['userName']}' and date>='{$date['left_time']}' and date<='{$date['right_time']}'" )->getField ( "workTime", true );
			$users [$key] ['workTime'] = 0;
			foreach ( $times as $v ) {
				if ($v > 8) {
					$v = 8;
				} else if (empty ( $v )) {
					$v = 0;
				}
				$users [$key] ['workTime'] += $v;
			}
			// 如果总的工时数小于应有工时则记录
			if (count ( $workDate ) * 8 >= $users [$key] ['workTime']) {
				$users [$key] ['lack'] = count ( $workDate ) * 8 - $users [$key] ['workTime']; // 缺少工时
				$newData [] = $users [$key];
			}
		}
		
		$this->exportlackNewExcel ( $newData );
	}
	
	/*
	 * 过滤白名单后大数据产品部职员工信息
	 */
	public function getRemainDepartMentUsers() {
		if (session ( 'userType' == 1 )) {
			echo 0;
			exit ();
		}
		$team = '大数据产品部';
		// 获取该部门的所有成员
		if (session ( 'userType' ) == 2 || session ( 'userType' ) == 3) {
			$where ['userTeam'] = array (
					'like',
					$team . '%' 
			);
			$where ['isDelele'] = 1;
			$where ['userName'] = array (
					'not in',
					getWhiteName () 
			);
		} else {
			$where ['isDelele'] = 1;
			$where ['userTeam'] = session ( 'userTeam' );
			$where ['userName'] = array (
					'not in',
					getWhiteName () 
			);
		}
		
		$users = M ( 'user_info' )->where ( $where )->select ();
		return $users;
	}
	public function exportlackNewExcel($projects) {
		set_time_limit ( 0 );
		import ( "ORG.Util.PHPExcel" );
		$objPHPExcel = new PHPExcel ();
		
		$objPHPExcel->getProperties ()->setSubject ( '报表' );
		$objPHPExcel->setActiveSheetIndex ( 0 );
		$objPHPExcel->getDefaultStyle ()->getAlignment ()->setHorizontal ( PHPExcel_Style_Alignment::HORIZONTAL_LEFT );
		$objPHPExcel->getDefaultStyle ()->getFont ()->setName ( '等线' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'A1', '姓名' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'B1', '邮箱' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'C1', '组名' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'D1', '电话' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'E1', '工时' );
		$objPHPExcel->getActiveSheet ()->setCellValue ( 'F1', '缺少工时' );
		// $objPHPExcel->getActiveSheet()->setCellValue('G1', '工作类型');
		// 遍历填充日期
		$i = 2;
		foreach ( $projects as $key => $project ) {
			
			if (! ($project ['userName'] == null)) {
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'A' . ($i), $project ['userName'] );
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'B' . ($i), $project ['userEmail'] );
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'C' . ($i), $project ['userTeam'] );
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'D' . ($i), $project ['telphone'] );
				if ($project ['workTime'] > 8) {
					$objPHPExcel->getActiveSheet ()->setCellValue ( 'E' . ($i), 8 );
				} else {
					$objPHPExcel->getActiveSheet ()->setCellValue ( 'E' . ($i), $project ['workTime'] );
				}
				$objPHPExcel->getActiveSheet ()->setCellValue ( 'F' . ($i), $project ['lack'] );
				// $objPHPExcel->getActiveSheet()->setCellValue('G'.($i), $project['workType']);
			} else {
				continue;
			}
			$i ++;
		}
		
		header ( 'pragma:public' );
		header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="报工excel.xls"' );
		header ( 'Content-Disposition:attachment;filename="报工excel.xls"' ); // attachment新窗口打印inline本窗口打印
		$objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
		$objWriter->save ( 'php://output' );
	}
	
	/**
	 * 对job_time表进行数据清理
	 */
	public function cleanJobtimeTable(){
		set_time_limit ( 0 );
		$jobtime = M ( "job_time" );
		$projects = M("projects");
		if( session('userType') == 2){
			//清理无项目名称报工记录
			$jobtime->query('delete from pmo_job_time where projectName is null');
			//更新job time 表
			$projectName = $jobtime->query('SELECT distinct projectName FROM pmo_job_time');
			if($projectName){
				foreach ($projectName as $key=>$value){
					//获取项目编号
					$where['projectName'] = $value['projectName'];
					$projectInfo = $projects->where($where)->select();
					if($projectInfo){
						//如果项目存在，更新报工信息
						$sql = 'update pmo_job_time set projectId="'.$projectInfo[0]['projectId'].'" where projectName ="'.$value['projectName'].'"';
						//echo $sql;exit;
					    $jobtime->query($sql);
					}
				}
			}
		}
		
		echo "success";
	}
	
    /**
     * 获取个人某个月份的工时填报情况
     * @param $date array
     * @param $userName string
     */
    public function getProcess($date,$userName)
    {

        $week = $this->getMonthArr($date, false); //该月份的工作日
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
        return $percent*100;
    }
	
	
	/**
	 * 获取平台组报工情况
	 */
	public function getPlatformProcess(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$date['left_time'] = $data['startTime'];
		$date['right_time'] = $data['endTime'];
		
		$allPlatformUsers = getPlatformUser();
		if($allPlatformUsers){
			foreach ($allPlatformUsers as $value){
				$prcess = $this->getProcess($date,$value['userName']);
				$value['process'] = $prcess;
				$result[] = $value; 
			}
		}
		echo json_encode($result);
	}
	
}