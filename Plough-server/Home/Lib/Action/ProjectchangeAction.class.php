<?php
class ProjectchangeAction extends Action{
	
	public function addChange(){
		$_rexp = array (
				'reportRule'=>'/^[\s\S]{0,1000}$/',
				'sceneDirector'=>'/^[\s\S]{0,100}$/',
				'currentStatus'=>'/^[\s\S]{0,100}$/',
				'operationTime'=>'/^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/',
				'haveScheme'=>'/^[\s\S]{0,30}$/',
				'operationType'=>'/^[\s\S]{0,30}$/',
				'changeTeam'=>'/^[\s\S]{0,30}$/',
				'level'=>'/^[\s\S]{0,30}$/',
				'production'=>'/^[\s\S]{0,1000}$/',
				'productionVersion'=>'/^[\s\S]{0,100}$/',
				'haveJira'=>'/^[\s\S]{0,100}$/',
				'remarks'=>'/^[\s\S]{0,1000}$/',
		);
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		foreach($_rexp as $key => $value){
			if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }
        // 验证通过
        //根据项目名称查询id
        $where['projectName'] = $data['projectName'];
        $where['isDelete'] = 1;
        $projects = M('projects');
        $result = $projects->where($where)->select();
        $data['relatedId'] = $result[0]['id'];
        //获取添加期数
        if($data['monday']){
        	$date = explode('.',$data['monday']);
        }
        $data['createTime'] = '2018-'.$date[0].'-'.$date[1];
        
        $projectChangeHistory = M('project_change_history');
        if($projectChangeHistory->add($data)){
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) .'添加项目（'. $data['projectName'].'）更改成功' ;
            $logs->add ( $logsData );
            $this->ajaxReturn(array(), '添加成功', 1);
        }else{
            $this->ajaxReturn(array(), '添加失败', 0);
        }
    }
    
    //编辑变更历史
    public function editChange(){
        $_rexp = array (
            'id'=>'/^[0-9]+$/',
            'relatedId'=>'/^[0-9]+$/',
            'reportRule'=>'/^[\s\S]{0,1000}$/',
            'sceneDirector'=>'/^[\s\S]{0,100}$/',
            'currentStatus'=>'/^[\s\S]{0,100}$/',
            'haveScheme'=>'/^[\s\S]{0,30}$/',
            'operationType'=>'/^[\s\S]{0,30}$/',
            'changeTeam'=>'/^[\s\S]{0,30}$/',
            'level'=>'/^[\s\S]{0,30}$/',
            'production'=>'/^[\s\S]{0,1000}$/',
            'productionVersion'=>'/^[\s\S]{0,100}$/',
            'haveJira'=>'/^[\s\S]{0,100}$/',
            'remarks'=>'/^[\s\S]{0,1000}$/',
        );
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }

        // 验证通过
        //根据项目名称查询id
        $where['projectName'] = $data['projectName'];
        $where['isDelete'] = 1;
        $projects = M('projects');
        $result = $projects->where($where)->select();
        $data['relatedId'] = $result[0]['id'];
        
        $projectChangeHistory = M('project_change_history');
        if($projectChangeHistory->save($data)){
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) .'修改项目（'. $data['projectName'].'）变更历史成功' ;
            $logs->add ( $logsData );
            $this->ajaxReturn(array(),'修改成功',1);
        }else{
            $this->ajaxReturn(array(),'修改失败',0);
        }
    }
    
    //删除变更历史
    public function deleteChange(){
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        if($data['id']) {
            $projectChangeHistory = M('project_change_history');
            $data['isDelete'] = 2;
            $where['id'] = $data['id'];

            if ($projectChangeHistory->where($where)->save($data)) {
                $logs = M('logs_info');
                $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '删除项目（' . $data['projectName'] . '）变更历史成功';
                $logs->add($logsData);
                $this->ajaxReturn(array(), '删除成功', 1);
            } else {
                $this->ajaxReturn(array(), '删除失败', 0);
            }
        }

    }
    /**
     * 获取变更信息
     */
    public function getChangeItem(){
    	$postData = file_get_contents ( "php://input" );
    	$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
    	$t1 =str_replace('.','-','2018.'.$data['monday']);
    	$t2 = str_replace('.','-','2018.'.$data['sunday']);
        $where = 'createTime >= "'.$t1.'"'.' and createTime <= "'.$t2.'"and pmo_project_change_history.isDelete=1';
        $project_change_history = M('project_change_history');
        $result = $project_change_history
            ->where($where)
            ->field('pmo_projects.projectName, pmo_project_change_history.*')
            ->join('pmo_projects ON pmo_projects.id = pmo_project_change_history.relatedId')
            ->select();
        foreach ($result as $key=>$value){
        	$result[$key]['operationTime'] = substr($value['operationTime'],0,10);
        	$result[$key]['createTime'] = substr($value['createTime'],0,10);
        	
        }

        if($data !== false){
            $this->ajaxReturn($result ? $result : null,'获取列表成功', 1);
        }else{
            $this->ajaxReturn(array(),'获取列表失败', 0);
        }
    }
    /**
     * 获取历史期数
     */
    public function getAllTeam(){
    	$project_change_history = M('project_change_history');
    	$projectHistory = $project_change_history
    	->order('createTime')
    	->limit(1)
    	->select();
    	//若无历史变更记录，以当前时间作为第一期
    	if(!$projectHistory[0]['createTime']){
    		$result[0]['monday'] = date('m.d',$this->this_monday());
    		$result[0]['sunday'] = date('m.d',$this->this_sunday());
    		$result[0]['id'] = 'mondy-1';
    		$result[0]['teamCount'] = 1;
    		$result[0]['isAddChange'] = true;
    	}else{
    		//若有历史记录，筛选出
    		$startTime = $this->this_monday(strtotime($projectHistory[0]['createTime']),true);
    		//循环次数
    		$count = floor((time()-$startTime)/86400/7);
    		for($i=-1;$i<$count;$i++){
    			if($i==$count-1||$i==$count-2){
    				$date['isAddChange']=true;
    			}else{
    				$date['isAddChange']=false;
    			}
    			$date['monday'] = date('m.d',$this->this_monday($startTime));
    			$date['sunday'] = date('m.d',$this->this_sunday($startTime));
    			$date['teamCount'] = $i+2; 
    			$date['id'] = $i+1;
    			$startTime += 86400*7;
    			$result[] = $date;
    		}
    	}
    	
    	
    	echo json_encode(array_reverse($result));
    }
    
    /**
     * 	获取任意时间点当周周一
     *  @$timestamp ，某个星期的某一个时间戳，默认为当前时间
     *  @is_return_timestamp ,是否返回时间戳，否则返回时间格式
	 */

	public function this_monday($timestamp=0,$is_return_timestamp=true){
		static $cache ;
		$id = $timestamp.$is_return_timestamp;
		if(!isset($cache[$id])){
			if(!$timestamp) $timestamp = time();
			$monday_date = date('Y-m-d', $timestamp-86400*date('w',$timestamp)+(date('w',$timestamp)>0?86400:-/*6*86400*/518400));
			if($is_return_timestamp){
				$cache[$id] = strtotime($monday_date);
			}else{
				$cache[$id] = $monday_date;
			}
		}
		return $cache[$id];
	
	}
	
	/**
	 * 	获取任意时间点当周周日
	 *  @$timestamp ，某个星期的某一个时间戳，默认为当前时间
     *  @is_return_timestamp ,是否返回时间戳，否则返回时间格式
	 */

	public function this_sunday($timestamp=0,$is_return_timestamp=true){
		static $cache ;
		$id = $timestamp.$is_return_timestamp;
		if(!isset($cache[$id])){
			if(!$timestamp) $timestamp = time();
			$sunday = $this->this_monday($timestamp) + /*6*86400*/518400;
			if($is_return_timestamp){
				$cache[$id] = $sunday;
			}else{
				$cache[$id] = date('Y-m-d',$sunday);
			}
		}
		return $cache[$id];
	}
	
	
	/**
	 * 获取项目变更历史记录
	 */
	public function getChangehistory(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$project_change_history = M('project_change_history');
		if($data['id']){
			
			$where['relatedId'] = $data['id'];
			$where['isDelete'] = 1;
			$projectHistory = $project_change_history
					       ->where($where)
					       ->order('createTime')
					       ->select();
			foreach ($projectHistory as $key=>$value){
				$projectHistory[$key]['operationTime'] = substr($value['operationTime'],0,10);
			}
			echo json_encode($projectHistory);
		}
	}
	
	
}