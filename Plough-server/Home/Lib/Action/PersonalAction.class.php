<?php

class PersonalAction extends Action
{
    /**
     * 个人主页
     */
    public function showPersonal()
    {

    }

    /**
     * 个人可以参加的项目
     */
    public function joinProject()
    {
        //在所有已有的项目中 找到个人可以参与的项目
        $userName = session('userName');
        $where['projectPeople'] = array('like', '%' . $userName . '%');
        $joinProjects = M('projects')->field('id,projectName,projectId')->where($where)->select();
        $allProjects = M('projects')->field('id,projectName,projectId')->where('isDelete=1 and leadDepartment is not null')->select();
        $returnArr = array();
        foreach($allProjects as $key => $allproject){
            $flag = 1;
            foreach($joinProjects as $k => $joinProject){
                if($joinProject['projectName'] == $allproject['projectName']){
                    $flag = 0;
                    break;
                }
            }
            if($flag == 1){
                $returnArr[] = $allproject;
            }
        }
        echo json_encode($returnArr);
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

    /**
     * 添加需要参与的项目
     */
    public function addProject()
    {
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        $project = M('projects');
        $flag = 1;
        $error = '';
        foreach($data as $key => $value){
            $where['projectName'] = $value;
            $res = $project->where($where)->find();
            //判断是否已经参与该项目
            $projectPeople = explode(',', $res['projectPeople']);
            if(in_array(session('userName'), $projectPeople)){
                //说明已经参与了该项目
                $logs = M ( 'logs_info' );
                $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '重复参与项目' . $value . ', 不处理';
                $logs->add ( $logsData );
                continue;
            }
            $project->projectPeople .= ',' . session('userName');
            if($project->save()){
                $logs = M ( 'logs_info' );
                $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '新参与了项目' . $value;
                $logs->add ( $logsData );
            }else{
                $logs = M ( 'logs_info' );
                $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '参与项目' . $value . '失败,原因: ' . $project->getError();
                $logs->add ( $logsData );
                $flag = 0;
                $error .= $project->getError() . '!';
            }
        }
        if($flag == 1){
            $back_info = array('status' => 1, 'info' => '成功参与了'. count($data) .'个项目');
            echo json_encode($back_info);
        }else{
            $back_info = array('status' => 0, 'info' => '参与项目失败,原因:' . $error);
            echo json_encode($back_info);
        }
    }
}
