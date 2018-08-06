<?php
/*
 * 外协数据导入导出
 */
class ExportAction extends CommonAction {

	/**
	 * 外协人员考核导出
	 */
	public function exportEmployeeAttendance(){

		$this->exportlackNewExcel($newData);
	}
	/*
	 * 数据导出之外协的考勤
	 */
	public function exportlackNewExcel($projects)
    {
        set_time_limit(0);
        import ( "ORG.Util.PHPExcel" );
        $objPHPExcel = new PHPExcel();

        $objPHPExcel->getProperties()->setSubject('报表');
        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
        $objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
        $objPHPExcel->getActiveSheet()->setCellValue('A1', '姓名');
        $objPHPExcel->getActiveSheet()->setCellValue('B1', '邮箱');
        $objPHPExcel->getActiveSheet()->setCellValue('C1', '组名');
        $objPHPExcel->getActiveSheet()->setCellValue('D1', '电话');
        $objPHPExcel->getActiveSheet()->setCellValue('E1', '工时');
        $objPHPExcel->getActiveSheet()->setCellValue('F1', '缺少工时');
        // $objPHPExcel->getActiveSheet()->setCellValue('G1', '工作类型');
        //遍历填充日期
        $i = 2;
        foreach($projects as $key => $project){

            if(!($project['userName'] == null))
            {
                $objPHPExcel->getActiveSheet()->setCellValue('A'.($i), $project['userName']);
                $objPHPExcel->getActiveSheet()->setCellValue('B'.($i), $project['userEmail']);
                $objPHPExcel->getActiveSheet()->setCellValue('C'.($i), $project['userTeam']);
                $objPHPExcel->getActiveSheet()->setCellValue('D'.($i), $project['telphone']);
                if($project['workTime'] > 8){
                    $objPHPExcel->getActiveSheet()->setCellValue('E'.($i), 8);
                }else{
                    $objPHPExcel->getActiveSheet()->setCellValue('E'.($i), $project['workTime']);
                }
                $objPHPExcel->getActiveSheet()->setCellValue('F'.($i), $project['lack']);
            }else{
                continue;
            }
            $i++;
        }

        header ( 'pragma:public' );
        header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="报工excel.xls"');
        header ( 'Content-Disposition:attachment;filename="报工excel.xls"' ); // attachment新窗口打印inline本窗口打印
        $objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
        $objWriter->save ( 'php://output' );
    }

    /*
     * 获取大组成员
     */
    public function getBigTeamUser($bigTeams ){
        $userInfo = M("user_info");
        $array = array();
        foreach($bigTeams as $v){
            $array[] = $userInfo->where("userTeam like '%".$v."%'")->getField("userName",true);
        }
        return $array;
    }

    /*项目工时导出*/
    public function worktimeExport(){
        header("Content-type:text/html;charset=utf8");
        // $sql = "select distinct(a.projectName),sum(b.workTime) as worktimes from pmo_job_time a left join pmo_job_time b on b.projectName=a.projectName where( a.date<'2017-12-31 23:59:59' and a.date>'2017-12-01' and a.date<'2017-12-31 23:59:59' and a.date>'2017-12-01')";
        // $data = $model->query($sql);
        // print_r($data);
        $fromTime = $_GET['startTime'];
        $endTime = $_GET['endTime'];
        if(!$fromTime){
            echo "开始时间不能为空";exit;
        }
        if(!$endTime){
            echo "结束时间不能为空";exit;
        }
        $jobtime = M("job_time");
        //$data = $test_data->Distinct(true)->field('descriprion')->order('description desc')->select();
        $data = $jobtime->distinct(true)->field('projectName,projectId')->where("date<'{$endTime}' and date>'{$fromTime}' and projectName is not null")->select();

        foreach($data as $key=>$value){
        	
        	
            $data[$key]['totaltimes'] = $jobtime->where("projectName='{$value['projectName']}' and date<'{$endTime}' and date>'{$fromTime}'")->sum("workTime");
        }

        set_time_limit(0);
        import ( "ORG.Util.PHPExcel" );
        $objPHPExcel = new PHPExcel();

        $objPHPExcel->getProperties()->setSubject('报表');
        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
        $objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
        $objPHPExcel->getActiveSheet()->setCellValue('A1', '项目名称');
        $objPHPExcel->getActiveSheet()->setCellValue('C1', '项目编号');
        $objPHPExcel->getActiveSheet()->setCellValue('B1', '工时(小时)');
        // $objPHPExcel->getActiveSheet()->setCellValue('G1', '工作类型');
        //遍历填充日期
        $i = 2;
        foreach($data as $key => $project){
            $objPHPExcel->getActiveSheet()->setCellValue('A'.($i), $project['projectName']);
            $objPHPExcel->getActiveSheet()->setCellValue('B'.($i), $project['totaltimes']);
            $objPHPExcel->getActiveSheet()->setCellValue('C'.($i), $project['projectId']);
            $i++;
        }

        header ( 'pragma:public' );
        header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="项目12月工时总汇excel.xls"');
        header ( 'Content-Disposition:attachment;filename="项目工时总汇excel.xls"' ); // attachment新窗口打印inline本窗口打印
        $objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
        $objWriter->save ( 'php://output' );
    }

    public function exportdiffWorkType(){
        $fromTime = $_GET['startTime'];
        $endTime = $_GET['endTime'];
        $job = M('job_time');
        if(!$fromTime){
            echo "开始时间不能为空";exit;
        }
        if(!$endTime){
            echo "结束时间不能为空";exit;
        }
        $data = array();
        $arr = array(
        		1=>'项目管理',
        		2=>'售前',
        		3=>'售前支撑',
        		4=>'需求调研',
        		5=>'UIUE',
        		6=>'开发',
        		7=>'测试',
        		8=>'实施、部署',
        		9=>'售后服务',
        		10=>'售后服务支撑',
        		11=>'CICD',
        		12=>'综合管理',
        		13=>' 培训与文档',
        		14=>'请假',
        		15=>'产品设计',
        		16=>'需求分析'
        );
        
        foreach($arr as $key=>$value){
            $sql = "date<='{$endTime}' and date>='{$fromTime}' and projectName is not null and workType=".$key;
            $data[$key]['type'] = $value;
            $data[$key]['totaltimes'] = $job->where($sql)->sum("workTime");
            
        }
        set_time_limit(0);
        import ( "ORG.Util.PHPExcel" );
        $objPHPExcel = new PHPExcel();

        $objPHPExcel->getProperties()->setSubject('报表');
        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
        $objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
        $objPHPExcel->getActiveSheet()->setCellValue('A1', '工作类型');
        $objPHPExcel->getActiveSheet()->setCellValue('B1', '工时(小时)');
        //遍历填充日期
        $i = 2;
        foreach($data as $key => $project){
            $objPHPExcel->getActiveSheet()->setCellValue('A'.($i), $project['type']);
            $objPHPExcel->getActiveSheet()->setCellValue('B'.($i), $project['totaltimes']);
            $i++;
        }

        header ( 'pragma:public' );
        header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="new12月项目工时类型总汇excel.xls"');
        header ( 'Content-Disposition:attachment;filename="项目工时类型总汇excel.xls"' ); // attachment新窗口打印inline本窗口打印
        $objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
        $objWriter->save ( 'php://output' );
        //print_r($data);
    }

    public function exportWorkTye(){
        $fromTime = $_GET['fromTime'];
        $endTime = $_GET['endTime'];
        if(!$fromTime){
            echo "开始时间不能为空";exit;
        }
        if(!$endTime){
            echo "结束时间不能为空";exit;
        }
        $data = M('job_time')
        ->field('projectName,sum(workTime) as totaltimes,workType')
        ->group('projectName,workType')
        ->where("date<'{$endTime}' and date>'{$fromTime}' and projectName is not null")
        ->select();
        foreach($data as $key=>$value){
            $data[$key]['workType'] = getWorkType($data[$key]['workType']);
        }
        $newData = array();
        foreach($data as $key=>$value){
            $newData[$key]['projectName'] = $value['projectName'];
            $newData[$key]['workType'] = $value['workType'];
            //$newData[$key]['totaltimes'] = $value['totaltimes'];
        }
        $new1Data = array();
        foreach($newData as $k1=>$v1){
            if(!empty($new1Data)){
                $i = 0;
                foreach($new1Data as $kk1=>$vv1){
                    if($vv1==$v1){
                        $i++;
                        break;
                    }
                }
                if($i == 0){
                    $new1Data[] = $v1;
                }
            }else{
                $new1Data[] = $v1;
            }
        }

        foreach($new1Data as $k2=>$v2){
            $new1Data[$k2]['totaltimes'] = 0;
            foreach($data as $p=>$q){
                if($q['workType'] == $v2['workType'] && $q['projectName'] == $v2['projectName']){
                    $new1Data[$k2]['totaltimes']+=$q['totaltimes'];
                }
            }
            //echo $new1Data[$k1]['totaltimes'];
        }


        set_time_limit(0);
        import ( "ORG.Util.PHPExcel" );
        $objPHPExcel = new PHPExcel();

        $objPHPExcel->getProperties()->setSubject('报表');
        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
        $objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
        $objPHPExcel->getActiveSheet()->setCellValue('A1', '项目名称');
        $objPHPExcel->getActiveSheet()->setCellValue('B1', '工时(小时)');
        $objPHPExcel->getActiveSheet()->setCellValue('C1', '工作类型');
        //遍历填充日期
        $i = 2;
        foreach($new1Data as $key => $project){
            $objPHPExcel->getActiveSheet()->setCellValue('A'.($i), $project['projectName']);
            $objPHPExcel->getActiveSheet()->setCellValue('B'.($i), $project['totaltimes']);
            $objPHPExcel->getActiveSheet()->setCellValue('C'.($i), $project['workType']);
            $i++;
        }

        header ( 'pragma:public' );
        header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="new12月项目工时类型总汇excel.xls"');
        header ( 'Content-Disposition:attachment;filename="项目工时类型总汇excel.xls"' ); // attachment新窗口打印inline本窗口打印
        $objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
        $objWriter->save ( 'php://output' );
    }

    /*外协数据导出*/
    public function employeeExport(){
        header("Content-type:text/html;charset=utf8");
        $employee = M("employee");
        $pdata = $this->getColleage();
        $data = $employee->order("employeeId asc")->select();

        foreach($data as $key=>$value){
            $teamLeader = trim($value['teamLeader']);
            $data[$key]['teamName'] = $this->getTheteam($pdata,$teamLeader);
            //$data[$key]['teamName'] = $user_info->where("userName='{$teamLeader}'")->getField("userTeam");
        }

        set_time_limit(0);
        import ( "ORG.Util.PHPExcel" );
        $objPHPExcel = new PHPExcel();
        $objPHPExcel->getProperties()->setSubject('外协信息');
        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
        $objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
        $objPHPExcel->getActiveSheet()->setCellValue('A1', '编号');
        $objPHPExcel->getActiveSheet()->setCellValue('B1', '姓名');
        $objPHPExcel->getActiveSheet()->setCellValue('C1', '身份证号码');
        $objPHPExcel->getActiveSheet()->setCellValue('D1', '厂商');
        $objPHPExcel->getActiveSheet()->setCellValue('E1', '入职时间');
        $objPHPExcel->getActiveSheet()->setCellValue('F1', '入职级别');
        $objPHPExcel->getActiveSheet()->setCellValue('G1', '岗位类型');
        $objPHPExcel->getActiveSheet()->setCellValue('H1', '驻地');
        $objPHPExcel->getActiveSheet()->setCellValue('I1', '联系电话');
        $objPHPExcel->getActiveSheet()->setCellValue('J1', '所在项目组组名');
        $objPHPExcel->getActiveSheet()->setCellValue('K1', '参与项目或产品名称');
        $objPHPExcel->getActiveSheet()->setCellValue('L1', '组长');
        $objPHPExcel->getActiveSheet()->setCellValue('M1', '大组组长');
        $objPHPExcel->getActiveSheet()->setCellValue('N1', '邮箱');
        $objPHPExcel->getActiveSheet()->setCellValue('O1', '离职时间');
        //遍历填充日期
        $i = 2;
        foreach($data as $key => $project){
            $objPHPExcel->getActiveSheet()->setCellValue('A'.($i), $project['employeeId']);
            $objPHPExcel->getActiveSheet()->setCellValue('B'.($i), $project['employeeName']);
            $objPHPExcel->getActiveSheet()->setCellValue('C'.($i), $project['idCard']." ");
            $objPHPExcel->getActiveSheet()->setCellValue('D'.($i), $project['employeeCompany']);
            $objPHPExcel->getActiveSheet()->setCellValue('E'.($i), $project['getInTime']);
            $objPHPExcel->getActiveSheet()->setCellValue('F'.($i), $project['level']);
            $objPHPExcel->getActiveSheet()->setCellValue('G'.($i), $project['workType']);
            $objPHPExcel->getActiveSheet()->setCellValue('H'.($i), $project['location']);
            $objPHPExcel->getActiveSheet()->setCellValue('I'.($i), $project['phoneNum']);
            $objPHPExcel->getActiveSheet()->setCellValue('J'.($i), $project['teamName']);
            $objPHPExcel->getActiveSheet()->setCellValue('K'.($i), $project['locatedTeam']);
            $objPHPExcel->getActiveSheet()->setCellValue('L'.($i), $project['teamLeader']);
            $objPHPExcel->getActiveSheet()->setCellValue('M'.($i), $project['bigTeamLeader']);
            $objPHPExcel->getActiveSheet()->setCellValue('N'.($i), $project['email']);
            $objPHPExcel->getActiveSheet()->setCellValue('O'.($i), $project['leaveTime']);
            $i++;
        }
        $logs = M( 'logs_info' );
        $logsData ['logDetail'] = date( 'Y-m-d H:i:s' ) . ':' . session( 'userName' ) . '导出外协信息';
        $logs->add( $logsData );
        header ( 'pragma:public' );
        header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="外协信息汇总excel.xls"');
        header ( 'Content-Disposition:attachment;filename="外协信息汇总excel.xls"' ); // attachment新窗口打印inline本窗口打印
        $objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
        $objWriter->save ( 'php://output' );
    }
    

    

    /**
     * 方法一: 获取指定日期段内每一天的日期
     * @date 2017-02-23 14:50:29
     *
     * @param $startdate
     * @param $enddate
     *
     * @return array
     */
    function getDateRange($date) {
        $stime = strtotime($date['left_time']);
        $etime = strtotime($date['right_time']);
        while ($stime <= $etime) {
            $theDay = date('Ymd', $stime);
            if(in_array($theDay,get_special_workday()) || (( date("w",$stime) == 1 || date("w",$stime) == 2 || date("w",$stime) == 3 || date("w",$stime) == 4 || date("w",$stime) == 5) && !in_array( $theDay, get_holiady()))){
                $datearr[] = date('Y-m-d', $stime);
            }
            $stime = $stime + 86400;
        }
        return $datearr;
    }



    public function exportWorkTimeSummary(){
    	set_time_limit(0);
        header("Content-type:text/html;charset=utf8");
        $bigTeams = array('方案组','UDS','白金组','平台组','数据智能','PMO','大数据产品部');
        $users = $this->getBigTeamUser($bigTeams );

        $workTypes = getNewWorkType();
        $fromTime = $_GET['startTime'];
        $endTime = $_GET['endTime'];
        $workDays = count($this->getDateRange(array('left_time'=>$fromTime,'right_time'=>$endTime)));
        if(!$fromTime){
            echo "开始时间不能为空";exit;
        }
        if(!$endTime){
            echo "结束时间不能为空";exit;
        }
        $jobtime = M("job_time");
        $xlsName = "大组工时汇总";
        
        $expTableData = array();
        $summary= array();
        $expCellNames = array();
        $xlsCell = array();
        $cellName = array (
                array ('projectName','项目名称' ),
                array ('projectId','项目编号' ),
                array ('totalTimes','项目总工时' ),
                array ('type1','售前管理工时' ),
                array ('type2','售前工时' ),
                array ('type3','售前支撑工时' ),
                array ('type4','需求调研工时' ),
                array ('type5','UIUE工时' ),
                array ('type6','开发工时' ),
                array ('type7','测试工时' ),
                array ('type8','实施、部署工时' ),
                array ('type9','售后服务工时' ),
                array ('type10','售后服务支撑工时' ),
                array ('type11','CICD工时' ),
                array ('type12','综合管理工时' ),
                array ('type13','培训与文档工时' ),
                array ('type14','请假工时' ),
                array ('type15','产品设计工时' ),
                array ('type16','需求分析工时' ),
            );
        foreach($users as $k=>$v){
            $xlsCell[] = $cellName;
            $where['date'] = array('betWeen',array($fromTime,$endTime));
            $where['projectName'] = array('EXP','IS NOT NULL');
            $where['workerName'] = array('in',$v);
            $data = $jobtime->distinct(true)->field('projectName,projectId')->where($where)->select();
            $totalWorkTimes = $jobtime->where($where)->sum("workTime");//总工时
            //大组研发工时 Y201
            $whereDevelop = $where;
            $whereDevelop['projectId'] = array(array('neq','Y2017TP999'),array('like',"Y201%"));
            $developTime = $jobtime->where($whereDevelop)->sum("workTime");//大组研发工时
            $whereDepartment = $where;
            $whereDepartment['projectId'] = 'Y2017TP999';
            $departmentTime = $jobtime->where($whereDepartment)->sum("workTime");//部门工时
            $whereBusness = $where;
            $whereBusness['projectId'] = array("like","SJ%");
            $businessTime = $jobtime->where($whereBusness)->sum("workTime");//未录入拓展商机
            $marketTime = $totalWorkTimes - $developTime -$departmentTime - $businessTime;//市场类项目工时
            $ratio = ceil($totalWorkTimes/$workDays/count($users[$k])/8*100);//填报比例
            $summary[] = "总工时:".$totalWorkTimes.",大组研发工时：".$developTime.",市场类项目工时：".$marketTime.",部门工时：".$departmentTime.",未录入拓展商机工时：".$businessTime.",填报比例：".$ratio."%";

            //$expTableData[] = $data;
            foreach($data as $key=>$value){
                $newcon = array();
                $newcon['date'] = array('betWeen',array($fromTime,$endTime));
                $newcon['projectName'] = $value['projectName'];
                $newcon['projectId'] = $value['projectId'];
                $newcon['workerName'] = array('in',$v);
                $data[$key]['totalTimes'] = $jobtime->where($newcon)->sum("workTime");

                $records = $jobtime->where($newcon)->field("workType,workTime")->select();
                for($workType = 1;$workType < count($cellName)-2 ;$workType++){
                    $data[$key]['type'.$workType] = 0;
                    foreach($records as $kv){
                        if($kv['workType'] == $workType){
                            $data[$key]['type'.$workType] += $kv['workTime'];
                        }
                    }
                }
            }
            $expTableData[] = $data;
        }
        $logs = M ( 'logs_info' );
        $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '导出工时汇总';
        $logs->add ( $logsData );
        exportMultiSheetExcel ( $xlsName, $bigTeams, $summary, $xlsCell, $expTableData );
    }

}
