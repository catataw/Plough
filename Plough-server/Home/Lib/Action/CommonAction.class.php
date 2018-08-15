<?php
// 本类由系统自动生成，仅供测试用途
class CommonAction extends Action {
	public function __construct(){
        header("Content-type:text/html;charset=utf8");
		parent::__construct();
		if (session ( 'id' ) &&
			session ( 'userName' ) &&
			session ( 'userType' ) &&
			session ( 'userEmail' )) {
			//return true;
		}else{
			$this->redirect('Login/login','',0,"您还没有登录,跳转中!");  
			exit;
		}
        //$pdata = $this->getTeams();
        $pdata = $this->getColleage();
        $userName = session('userName');
        if(in_array($userName, $this->getBigLeader()) && !session("member")){
            $tdata = $this->getTeams();
            $teamNames = array();
            $member = array();
            foreach($tdata as $tk=>$tv){
                if($tv['bigTeamLeader'] == $userName){
                    $teamNames[] = $tv['teamName'];
                }
            }
            foreach($pdata as $pk=>$pv){
                if( in_array( $pv['userTeam'], $teamNames ) ){
                    $member[] = $pv['userName'];
                }
            }
            //print_r($member);
            session("member",$member);
        }
        //print_r(session("member"));
        if( in_array($userName,$this->getPMO()) || in_array($userName,$this->getFugle()) || session('userType')==2 ){
            $this->assign('href','__ROOT__/EmployeeNew/main');
        }else{
            $this->assign('href','#');
        }

        $this->getMenu();
	}

	public function sqlLog($sql,$code,$detail){
		$arr['sql'] = $sql;
		$arr['date'] = date("Y-m-d H:i:s");
		$arr['userName'] = session('userName');
		$arr['result'] = $code;
		$arr['detail'] = $detail;
		$add = M("sql_log")->add($arr);
		if($add){
			return true;
		}else{
			return false;
		}
	}

    /*
     * 获取待我审批外协申请数
     */
    public function getNum(){
        $userName = session('userName');
        $sql = "select id from pmo_employee_apply where id in (select distinct(applyId) from pmo_apply_log where nextPerson='{$userName}' order by id desc) and deleteStatus=0 and ";
        if(in_array($userName, $this->getPMO())){
            $sql.= 'status in (1,3)';
        }else if(in_array($userName, $this->getBigLeader())){
            $sql.='status=0';
        }else if(in_array($userName, $this->getFugle())){
            $sql.='status=2';
        }

        $model = M();
        $myaudit = $model->query($sql);
        $num = 0;
        //$applyLog = M("apply_log");
        foreach($myaudit as $keyaudit){
            $sqlaudit = "select nextPerson from pmo_apply_log where applyId='{$keyaudit['id']}' order by id desc limit 1";
            $daudit = $model->query($sqlaudit);
            if($daudit[0]['nextPerson'] == $userName){
                $num++;
            }
        }
        //$num = count($model->query($sql));
        $this->assign('num',$num);
    }

    /*
     * 获取菜单
     */
    public function getMenu(){
        $arr = array(
            array(
            'name'=>'外协信息',
            'href'=>'EmployeeNew/index',
            'icon'=>'icon-dashboard'
            ),
            array(
             'name'=>'外协预算',
             'href'=>'EmployeeApply/budget',
             'icon'=>'icon-list-alt'
            ),
            array(
             'name'=>'申请列表',
             'href'=>'EmployeeApply/index',
             'icon'=>'icon-list-alt'
            )
        );
        $userType = session('userType');
        $userName = session('userName');
        if( in_array($userName, $this->getFugle()) ||in_array($userName, $this->getPMO())){
            array_unshift($arr, array(
             'name'=>'外协总览',
             'href'=>'EmployeeNew/main',
             'icon'=>'icon-bar-chart'
            ), array(
             'name'=>'外协审批',
             'href'=>'EmployeeApply/toAudit',
             'icon'=>'icon-envelope-alt'
            ));
        }else if(in_array($userName, $this->getBigLeader())){
            array_unshift($arr, array(
             'name'=>'外协审批',
             'href'=>'EmployeeApply/toAudit',
             'icon'=>'icon-list-alt'
            ));
        }
        $this->assign('menu',$arr);
        $this->getNum();
        //$this->getapplyNum();
    }
    /*
     * 返回所有大组长
     */
    public function getBigLeader(){
        return array(
            '全兵',
            '刘超1',
            '高天铎',
            '李斌',
            '李光瑞',
            '沈国栋',
            '王振亚',
            '王远志',
        	'罗志成',
        	'支敏慧',
        	'吴文昊'
        );
    }

    /*
     * 返回所有大领导
     */
    public function getFugle(){
        return array(
            '庞哲翀',
            '齐骥',
            '王宝晗',
            '孙小霞',
        	'齐骥'	
        );
    }

    /*
    *
    */
    public function getPMO(){
        return array(
            '王振亚',
            '张红',
            '于娴',
            '吴辉'
        );
    }

    /*
     * 超级管理员
     */
    public function getAdmin(){
        return array(
            '吴辉'
        );
    }

    /*
     * 返回所有工作类型
     */
    public function getWorkType(){
        return array(
            'Android开发工程师',
            'C++开发工程师',
            'Hadoop开发工程师',
            'IOS开发工程师',
            'java开发工程师',
            'PHP开发工程师',
            'Python开发工程师',
            'UIUE交互设计师',
            '安全开发工程师',
            '测试工程师',
            '测试开发工程师',
            '产品运营',
            '大数据运维工程师',
            '方案经理',
            '模块配置工程师',
            '前端开发工程师',
            '市场销售',
            '数据标注',
            '数据核查',
            '数据引入',
            '文档工程师',
            '长沙产品运营',
            '综合事务'
        );
    }

    /**
     * 外协申请审核添加日志
     * @param $[sql] [审核sql语句]
     * @param $[code] [审核结果0-成功 1-失败]
     * @param $note [审核批注]
     * @param   $[status] [外协申请状态]
     */
    public function applyLog($appleId,$code,$note=null,$status,$nextPerson=null){
        //$arr['date'] = date("Y-m-d H:i:s");
        $arr['applyId'] = $appleId;
        $arr['result'] = $code;
        $arr['status'] = $status;
        $arr['userName'] = session('userName');
        $arr['nextPerson'] = $nextPerson;
        $arr['time'] = date("Y-m-d H:i:s");
        $arr['note'] = $note;
        $arr['detail'] = $detail;
        $add = M("apply_log")->add($arr);
        return true;
    }

	/*
	 * 获取每个月的工作日时间
	 */
	public function getMonthWorkDate($date){
    	$monthArr = $this->getMonthArr($date, false);
    	//$monthDate = [];
    	foreach ($monthArr as $k=>$v){
    		$yarn = substr($v,0,4);
    		$month = substr($v,4,2);
    		$day = substr($v,6,2);
    		$date = $yarn.'-'.$month.'-'.$day;
    		$monthDate[] = $date;
    	}
    	return $monthDate;
    }

    /**
     * 獲取一個時間段的有效工作日
     * @param $date 查询的日期
     */
    public function getMonthArr($time, $hasWeek = true)
    {
        $left_time_unix = strtotime($time['left_time']);
        $start = (int) date('d', strtotime($time['left_time']));
        $left_month = date('m', strtotime($time['left_time']));
        $left_year = date('Y', strtotime($time['left_time']));
        $right_month = date('m', strtotime($time['right_time']));
        $right_year = date('Y', strtotime($time['right_time']));
        $right_days = '';
        if($left_month == $right_month){
            //同一个月份
            $days = date('d', strtotime($time['right_time']));
        }else{
            //不同月份
            $days = $this->getTotalDays($left_month, $left_year);
            //上限月
            $right_days = date('d', strtotime($time['right_time']));
        }
        $right_time_unix = strtotime($time['right_time']);
        //总天数
        $total_days = strtotime($right_time_unix - $left_time_unix) / 3600 / 24;
        $keyDay = key_day();
        $monthArr = array();
        $holiday = get_holiady();
        $special_workday = get_special_workday();
        for($start; $start <= $days; ++$start){
            //判断是否是节假日 特殊工作日
            $sureDate = $left_year . $left_month . ($start < 10 ? $keyDay[$start] : $start);
            if(in_array($sureDate, $holiday)){
                //是节假日 不记录
                continue;
            }
            if($hasWeek == false){
                //不需要包含周末, 验证是否是特殊工作日
                $formDate = $left_year . '-' . $left_month . '-' . $start;
                $week = date('w', strtotime($formDate));
                if($week == 0 || $week == 6){
                    //是否是特殊工作日
                    if(!in_array($sureDate, $special_workday)){
                        continue;
                    }
                }
            }
            $monthArr[] = $sureDate;
        }
        if($right_days != ''){
            for($i = 1; $i <= $right_days; ++$i){
                //判断是否是节假日 特殊工作日
                $sureDate = $right_year . $right_month . ($i < 10 ? $keyDay[$i] : $i);
                if(in_array($sureDate, $holiday)){
                    //是节假日 不记录
                    continue;
                }

                if($hasWeek == false){
                    //不需要包含周末, 验证是否是特殊工作日
                    $formDate = $right_year . '-' . $right_month . '-' . $i;
                    $week = date('w', strtotime($formDate));
                    if($week == 0 || $week == 6){
                        //是否是特殊工作日
                        if(!in_array($sureDate, $special_workday)){
                            continue;
                        }
                    }
                }
                $monthArr[] = $sureDate;
            }
        }
        return $monthArr;
    }

    public function oauth(){
    	$userType = session('userType');
    	/**
    	 * @param $userType 角色标识
    	 * 超级管理员 PMO 领导拥有添加和修改的权限
    	 * 其他用户则不可增删
    	 */
    	if($userType!=2 && $userType!=3 && $userType!=6){
    		//return false;
    		exit;
    		//跳转无权限提示页面
    	}else{
    		return true;
    	}
    }

    /**
     * 配置技能标签
     */
    public function returnTags(){
        $arr = array('php大神','js大神','java大神','服务器大神','架构师');
        return $arr;
    }


    /*
     * 获取组
     */
    public function getTeams(){
        $url = "http://10.139.7.217/Team/loadTeams";
        $colleage = curl_post($url,$data=null);
        return $colleage;
    }

    /*
     * 获取大数据员工
     */
    public function getColleage(){
        $url = "http://10.139.7.217/User/GetAllColleage";
        $colleage = curl_post($url,$data=null);
        return $colleage;
    }

    /**
     * 获取用户所属小组
     * @param username
     */
    public function getTheteam($data,$username){
        foreach($data as $key=>$value){
            if($username == $value['userName']){
                return $value['userTeam'];
            }
        }
    }

}