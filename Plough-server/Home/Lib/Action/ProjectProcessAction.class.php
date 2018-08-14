<?php


class ProjectProcessAction extends Action
{
    /**
     *   编辑项目进展
     */
    public function editProcess(){
        $_rexp = array (
            'relatedId'=>'/^[0-9]+$/',
            'process'=>'/^100$|^(\d|[1-9]\d)$/',
            'risk'=>'/^(高|中|低)$/',
        );
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }
        // 验证通过
        $Process = M('project_process');
        $where ['relatedId'] = $data['relatedId'];
        $where ['id'] = $data['id'];
        if($Process->where($where)->save($data)){
            $projects = M('projects');
//            $latest = $Process->where('relatedId='.$data['relatedId'])->order('id desc')->limit(1)->select();
//            $tempData = array(
//                'risk' => $latest[0]['risk'],
//                'responseMeasures' => $latest[0]['responseMeasures'],
//                'currentProgress' => $latest[0]['currentProgress'],
//            );
//            $result = $projects->where('id='.$data['relatedId'])->save($tempData);
//            if ($result){
                $projectName = $projects->where('id=' . $data['relatedId'])->field('projectName')->select();
                $logs = M('logs_info');
                $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '修改项目(' . $projectName[0]['projectName'] . ")进展信息";
                $logs->add($logsData);
//            }
            $this->ajaxReturn(array(),'修改成功',1);
        }else{
            $this->ajaxReturn(array(),'修改失败',0);
        }
    }

    /**
     *   获取项目进展列表
     */
    public function getProcess($id){
        $process = M('project_process');
//        $result = $process->where('relatedId='.$id)->order('updateTime desc')->find();
//        if(!$result || strtotime('last sunday') - strtotime(substr($result[updateTime], 0, 10))> 0){
//            $row['relatedId'] = $id;
//            $row['process'] = 0;
//            $row['risk'] = '高';
//            $process->add($row);
//        }
        $data = $process->where('relatedId='.$id)->order('updateTime desc')->select();
        foreach($data as $key => $value)
        {
            $gdate = substr($data[$key]['updateTime'],0,10);
            $weekStart = 1;
            $w = date ( "w", strtotime ( $gdate ) ); //取得一周的第几天,星期天开始0-6
            $dn = $w ? $w - $weekStart : 6; //要减去的天数
            $st = date ( "Y-m-d", strtotime ( "$gdate  - " . $dn . "  days " ) );
            $en = date ( "Y-m-d", strtotime ( "$st  +6  days " ) );
            $start = substr(str_replace('-','.',$st),5,8);
            $end = substr(str_replace('-','.',$en),5,8);
            $data[$key]['dateRange'] = $start.'-'.$end;
        }
        if($data !== false){
            $this->ajaxReturn($data,'获取成功', 1);
        }else{
            $this->ajaxReturn(array(),'获取失败', 0);
        }
    }

    /**
     *  添加项目进展
     */
    public function addProcess(){
        $_rexp = array (
            'relatedId'=>'/^[0-9]+$/',
            'process'=>'/^100$|^(\d|[1-9]\d)$/',
            'risk'=>'/^(高|中|低)$/',
        );
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }
        // 验证通过
        $process = M('project_process');
        if($process->add($data)){
            $projects = M('projects');
            $latest = $process->where('relatedId='.$data['relatedId'])->order('id desc')->limit(1)->select();
            $tempData = array(
                'risk' => $latest[0]['risk'],
                'responseMeasures' => $latest[0]['responseMeasures'],
                'currentProgress' => $latest[0]['currentProgress'],
            );
            $result = $projects->where('id='.$data['relatedId'])->save($tempData);
            if ($result){
                $projectName = $projects->where('id=' . $data['relatedId'])->field('projectName')->select();
                $logs = M('logs_info');
                $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '添加项目(' . $projectName[0]['projectName'] . ")进展信息";
                $logs->add($logsData);
            }
            $this->ajaxReturn(array(), '添加成功', 1);
        }else{
            $this->ajaxReturn(array(), '添加失败', 0);
        }
    }

    /**
     *  删除项目进展
     */
    public function deleteProcess($id){
        $process = M('project_process');
        $relatedId = $process->where('id='.$id)->field("relatedId")->select();
        if($process->where('id='.$id)->delete()){
            //子表同步至主表
            $latestProcess = $process->where('relatedId='.$relatedId[0]['relatedId'])->order('id desc')->limit(1)->select();
            $LatestProcessData = array(
                'risk' => $latestProcess[0]['risk'],
                'responseMeasures' => $latestProcess[0]['responseMeasures'],
                'currentProgress' => $latestProcess[0]['currentProgress']
            );
            $projects = M('projects');
            $projects->where('id='.$latestProcess[0]['relatedId'])->save( $LatestProcessData);
            //保存日志
            $projects = M('projects');
            $projectName = $projects->where('id=' . $id)->field('projectName')->select();
            $logs = M('logs_info');
            $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '删除项目(' . $projectName[0]['projectName'] . ")进展信息";
            $logs->add($logsData);
            $this->ajaxReturn(array(),'删除成功', 1);
        }else{
            $this->ajaxReturn(array(),'删除失败', 0);
        }
    }

    public function autoAdd(){
        $currentTime['updateTime'] = date('Y-m-d H:i:s');
//        $start = date('Y-m-d H:i:s', strtotime('last monday'));
//        $end = date('Y-m-d H:i:s', strtotime('this tuesday') + 7 * 24 * 60 * 60);
        $start = date('Y-m-d',(time()-((date('w')==0?7:date('w'))-1)*24*3600));//本周一
        $end = date('Y-m-d',(time()+(7-(date('w')==0?7:date('w'))+1)*24*3600));//下周一
        $projects = M('projects');
        $result = $projects->where('risk!=""')->field('id,risk')->order('id asc')->select();
        $process = M('project_process');
        foreach($result as $key => $value)
        {
            $tempData['relatedId'] = $value['id'];
            $tempData['risk'] = $value['risk'];
            $data = array_merge($tempData,$currentTime);
            //如果本周已经存在某项目，则不添加
            $where['relatedId'] = $value['id'];
            $where['updateTime'] = array('between',array($start,$end));
            if(!$process->where($where)->select()) {
                $process->add($data);
                $projectName = $projects->where('id=' . $value['id'])->field('projectName')->select();
                $logs = M('logs_info');
                $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':'  . '系统自动添加项目(' . $projectName[0]['projectName'] . ")进展信息";
                $logs->add($logsData);
            }
        }
    }
}
