<?php

class NewprojectAction extends Action
{
    /**
     * 上传excel更新添加报工项目
     */
    public function addnewProjectExcl() {
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
                    $key == 'F' ? $result ['leadDepartMent'] = $value : '';
                    $key == 'H' ? $result ['projectManagerId'] = $value : '';
                    $key == 'H' ? $result ['projectPeople'] = $value : '';
                    
                }
                $project = M ( 'projects' );
                $pro_where['projectName'] = $result['projectName'];
                $record = $project->where($pro_where)->find();
                if($result['projectId']){
                	if($record){
                		$project->where($pro_where)->save( $result );
                	}else{
                		$project->add ( $result );
                	}
                }
            }
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '上传更新了项目信息文件 ' . $move_file_name;
            $logs->add ( $logsData );
            $back_info = array('status' => 1, 'info' => '上传更新项目成功');
            echo json_encode($back_info);exit ();
        } else {
            $this->error ( "请选择上传的文件" );
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
     * 编辑报工项目
     */
    public function editProject()
    {
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        $where['projectName'] = $data['projectName'];
        $where['isDelete'] = 1;
        $project = M('projects')->where($where)->find();
        foreach($project as $key => &$value){
            if($key == 'projectType'){
                $value == 1 ? $value = '研发类' : $value = '市场类';
            }
        }
        echo json_encode($project);
    }

    /**
     * 删除项目
     */
    public function deleteProject(){
    	$postData = file_get_contents ( "php://input" );
    	$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
    	$id = $data['id'];
    	if($id){
            $sql = 'update pmo_projects set isDelete=2 where id="'.$id.'"';
            $result = M('projects')->query($sql);
    		$logs = M ( 'logs_info' );
    		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '删除报工项目:' . $sql;
    		$logs->add ( $logsData );
    		echo 1;
    	}
    }

    
    /**
     * 更新报工项目
     */
    public function updateProject()
    {
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        $projects = M('projects');
        $oldProjectNameArr = $projects->query('select projectName from pmo_projects where id="'.$data['id'].'"');
        $oldProjectName = $oldProjectNameArr[0]['projectName'];  
        
        if($projects->save($data)){
        	//更新工时表里面项目名称
        	if($data['projectName']&&$data['projectName']!=$oldProjectName){
        		$sql = 'update pmo_job_time set projectName="'.$data['projectName'].'" where projectName="'.$oldProjectName.'"';
        		M('job_time')->query($sql);
        		$logs = M ( 'logs_info' );
        		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '更新报工表项目名称:' . $sql;
        		$logs->add ( $logsData );
        	}
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '更新了报工项目:' . $data['projectName'];
            $logs->add ( $logsData );
            $back_info = array('status' => 1, 'info' => '项目更新成功');
            echo json_encode($back_info);exit;
        }else{
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '更新报工项目 ' . $data['projectName'] . '失败,原因:' . $projects->getError();
            $logs->add ( $logsData );
            $back_info = array('status' => 0, 'info' => '更新失败 ' . $projects->getError());
            echo json_encode($back_info);exit;
        }
    }

    /**
     * 添加报工项目 （暂无该需求）
     */
    public function addProject()
    {
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        $projects = M('projects');
        if($projects->add($data)){
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加了报工项目:' . $data['projectName'];
            $logs->add ( $logsData );
            $back_info = array('status' => 1, 'info' => '项目添加成功');
            echo json_encode($back_info);exit;
        }else{
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加报工项目:' . $data['projectName'] . '失败,原因:' . $projects->getError();
            $logs->add ( $logsData );
            $back_info = array('status' => 0, 'info' => '添加失败,原因:' . $projects->getError());
            echo json_encode($back_info);exit;
        }
    }

    /**
     * 下载所有的报工项目
     */
    public function downloadProject()
    {
    	$where['isDelete']=1;
        $projects = M('projects')->where($where)->field('projectName,projectId,leadDepartment,projectType,projectManagerId,projectPeople')->select();
        foreach ($projects as $key=>$value){
        	if($value['projectType'] == 1){
        		$projects[$key]['projectType'] = '研发类';
        	}else{
        		$projects[$key]['projectType'] = '市场类';
        	}
        }
        $xlsName = '大数据报工项目基本信息汇总';
        $xlsCell = array(
            array (
                'projectName',
                '项目名称'
            ),
            array (
                'projectId',
                '项目编号'
            ),
            array (
                'leadDepartment',
                '牵头部门'
            ),
            array (
                'projectType',
                '项目类型'
            ),
            array (
                'projectManagerId',
                '项目经理'
            ),
            array (
                'projectPeople',
                '项目成员'
            ),
        );
        $logs = M ( 'logs_info' );
        $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '下载报工项目总单';
        $logs->add( $logsData );
        exportExcel( $xlsName, $xlsCell, $projects );
    }

    /**
     * 个人已经参与的项目
     */
   public function alreadyJoinProject()
    {
        $userName = session('userName');
        $where['projectPeople'] = array('like', '%' . $userName . '%');
        $where['isDelete'] = 1;
        $alreadJoinProjects = M('projects')
               ->where($where)
               ->select();

        foreach($alreadJoinProjects as $key => &$project) {
            if($project['leadDepartMent']){
            	foreach($project as $k => &$v) {
            		if($k == 'projectType'){
            			$v == 1 ? $v = '研发类' : $v = '市场类';
            		}
            	}
            	$realReprtProjects[]=$project;
            }

        }
        echo json_encode($realReprtProjects);
    }
    
    public function weekProjectTime()
    {
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        $data = $data['editTime'];
        if(count($data) == 1){
            $left_time = $right_time = $data[0];
        }else{
            $left_time = $data[0];
            $right_time = $data[count($data) - 1];
        }
        $userName = session ( 'userName' );
        $where['date'] = array('between',array($left_time, $right_time));
        $where['workerName'] = $userName;
        $jobTime = M('job_time')->where($where)->select();
        $weeklyTime = array();
        foreach($jobTime as $key => $record){
            $flag = 1;
            foreach($weeklyTime as $k => &$item){
                if($item['projectName'] == $record['projectName'] && $item['workType'] == $record['workType']){
                    //说明是同项目同工作类型 判断工作内容
                    if(!($item['workDetail'] == $record['workDetail'])){
                        $item['workDetail'] .= ',' . $record['workDetail'];
                    }
                    $item['workTime'] += $record['workTime'];
                    $flag = 0;
                    break;
                }
            }
            unset($item);
            if($flag){
                //该项目种类还不存在weeklyTime
                unset($record['id']);
                unset($record['date']);
                unset($record['isAudit']);
                $weeklyTime[] = $record;
            }
        }
        echo json_encode($weeklyTime);
    }
    
    /**
     * 上传excel更新项目
     */
    public function updateProjectByExcel()
    {
    	if (! empty ( $_FILES )) {
    		import("ORG.Util.PHPExcel");
    		// 上传excl
    		$uploadPath = './Public/upload/';
    		$file_name = $_FILES ["file"] ["name"];
    		$file_info = explode('.', $file_name);
    		$exts = $file_info [1];
    		$move_file_name = $uploadPath . time() . '.' . $exts;
    		move_uploaded_file($_FILES ["file"] ["tmp_name"], $move_file_name);
    		// 创建PHPExcel对象
    		$PHPExcel = new PHPExcel ();
    		// 如果excel文件后缀名为.xls，导入这个类
    		if ($exts == 'xls') {
    			import("ORG.Util.PHPExcel.Reader.Excel5");
    			$PHPReader = new \PHPExcel_Reader_Excel5 ();
    		} else if ($exts == 'xlsx') {
    			import("ORG.Util.PHPExcel.Reader.Excel2007");
    			$PHPReader = new \PHPExcel_Reader_Excel2007 ();
    		} else {
    			echo '9';
    			exit;
    		}
    		// 载入文件
    		$PHPExcel = $PHPReader->load($move_file_name);
    		// 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
    		$currentSheet = $PHPExcel->getSheet(0);
    		// 获取总列数
    		$allColumn = $currentSheet->getHighestColumn();
    		// 获取总行数
    		$allRow = $currentSheet->getHighestRow();
    		// 循环获取表中的数据，$currentRow表示当前行，从哪行开始读取数据，索引值从0开始
    		for ($currentRow = 2; $currentRow <= $allRow; $currentRow++) {
    			$projectName = $currentSheet->getCell('A' . $currentRow)->getValue();
    			$where['projectName'] = $projectName;
    			$where['isDelete'] = 1;
    			$project = M('Projects')->where($where)->find();
    			if ($project) {
    				//更新
    				$newPeople = $currentSheet->getCell('F' . $currentRow)->getValue();
    				$newPeopleArr = explode('，', $newPeople);
    				$alreadyPeopleArr = explode(',', $project['projectPeople']);
    				foreach($newPeopleArr as $newOne){
    					if(!in_array($newOne, $alreadyPeopleArr)){
    						$project['projectPeople'] .= ',' . $newOne;
    					}
    				}
    				$res = M('Projects')->save($project);
    				var_dump($res);
    			} else {
    				//不存在该项目 新增
    				$newProject['projectName'] = $currentSheet->getCell('A' . $currentRow)->getValue();
    				$newProject['projectId'] = $currentSheet->getCell('B' . $currentRow)->getValue();
    				$newProject['leadDepartment'] = $currentSheet->getCell('C' . $currentRow)->getValue();
    				$newProject['projectStage'] = $currentSheet->getCell('D' . $currentRow)->getValue() == 1 ? '研发类' : '市场类';
    				$newProject['projectManagerId'] = $currentSheet->getCell('E' . $currentRow)->getValue();
    				$Person = $currentSheet->getCell('F' . $currentRow)->getValue();
    				$personArr = explode('，', $Person);
    				$Person = implode(',', $personArr);
    				$newProject['projectPeople'] = $Person;
    				if($newProject){
    					M('Projects')->add($newProject);
    				}

    			}
    		}
    	}
    }
    /**
     * 是否为已存在项目
     */
    public function isExistProject($projectId){
    	$projects = M('Projects');
    	$where['projectId'] = $projectId;
    	$where['isDelete'] = 1;
    	$projectInfo = $projects->where($where)->select();
    	if($projectInfo){
    		return true;
    	}else{
    		return false;
    	}
    	
    }
    
    /**
     * 批量导入删除项目
     */
    public function deleteNewProjectExcl(){
    	if (! empty ( $_FILES )) {
    		import("ORG.Util.PHPExcel");
    		// 上传excl
    		$uploadPath = './Public/upload/';
    		$file_name = $_FILES ["file"] ["name"];
    		$file_info = explode('.', $file_name);
    		$exts = $file_info [1];
    		$move_file_name = $uploadPath . time() . '.' . $exts;
    		move_uploaded_file($_FILES ["file"] ["tmp_name"], $move_file_name);
    		// 创建PHPExcel对象
    		$PHPExcel = new PHPExcel ();
    		// 如果excel文件后缀名为.xls，导入这个类
    		if ($exts == 'xls') {
    			import("ORG.Util.PHPExcel.Reader.Excel5");
    			$PHPReader = new \PHPExcel_Reader_Excel5 ();
    		} else if ($exts == 'xlsx') {
    			import("ORG.Util.PHPExcel.Reader.Excel2007");
    			$PHPReader = new \PHPExcel_Reader_Excel2007 ();
    		} else {
    			echo '9';
    			exit;
    		}
    		// 载入文件
    		$PHPExcel = $PHPReader->load($move_file_name);
    		// 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
    		$currentSheet = $PHPExcel->getSheet(0);
    		// 获取总列数
    		$allColumn = $currentSheet->getHighestColumn();
    		// 获取总行数
    		$allRow = $currentSheet->getHighestRow();
    		// 循环获取表中的数据，$currentRow表示当前行，从哪行开始读取数据，索引值从0开始
    		$i=0;
    		for ($currentRow = 2; $currentRow <= $allRow; $currentRow++) {
    			$projectId = $currentSheet->getCell('A' . $currentRow)->getValue();
    			$where['projectId'] = $projectId;
    			$where['isDelete'] = 1;
    			//var_dump($where);exit;
    			$project = M('Projects')->where($where)->find();
    			if ($project) {
    				//更新
    				$i++;
    				$project['isDelete'] = 2;
    				$res = M('Projects')->save($project);
    			}
    		}
    		$logs = M ( 'logs_info' );
    		$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '批量删除' . $i.'个项目';
    		$logs->add ( $logsData );
    		$back_info = array('status'=>1,'msg'=>"成功添加".$i."个项目");
    		echo json_encode($back_info);
    	}
    }
    
    
    
    
}