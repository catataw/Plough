<?php

/**
 * Created by PhpStorm.
 * User: dhj
 * Date: 2018/6/7
 * Time: 10:35
 * Description: 项目里程碑
 */
class ProjectMailstoneProgressAction extends Action
{
    /**
     * 添加项目里程碑
     */
    public function addMailStone(){
        $_rexp = array (
            'relatedId'=>'/^[0-9]+$/',
            'weight'=>'/^((100$|^(\d|[1-9]\d))?)?$/',
            'planFinishedTime'=>'/^(([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/',
            'actualFinishedTime'=>'/^(([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/'
        );
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }
        // 验证通过
        $mailstone = M('project_mailstone_progress');
        if($mailstone->add($data)) {
            $projects = M('projects');
            $latest = $mailstone->where('relatedId='.$data['relatedId'])->order('id desc')->limit(1)->select();
            $tempData = array(
                'mailstoneName' => $latest[0]['mailstoneName'],
                'planFinishedTime' => $latest[0]['planFinishedTime'],
            );
            $result = $projects->where('id=' . $data['relatedId'])->save($tempData);
            if ($result){
                $projectName = $projects->where('id=' . $data['relatedId'])->field('projectName')->select();
                $logs = M('logs_info');
                $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '添加项目(' . $projectName[0]['projectName'] . ")里程碑信息";
                $logs->add($logsData);
            }
            $this->ajaxReturn(array(), '添加成功', 1);
        }else{
            $this->ajaxReturn(array(), '添加失败', 0);
        }
    }

    /**
     * 编辑项目里程碑
     */
    public function editMailStone(){
        $_rexp = array (
            'relatedId'=>'/^[0-9]+$/',
            'weight'=>'/^((100$|^(\d|[1-9]\d))?)?$/',
            'planFinishedTime'=>'/^(([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/',
            'actualFinishedTime'=>'/^(([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/'
        );
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }
        // 验证通过
        $mailstone = M('project_mailstone_progress');
        $where ['relatedId'] = $data['relatedId'];
        $where ['id'] = $data['id'];
        if($mailstone->where($where)->save($data)){
            $projects = M('projects');
            $latest = $mailstone->where('relatedId='.$data['relatedId'])->order('id desc')->limit(1)->select();
            $tempData = array(
                'mailstoneName' => $latest[0]['mailstoneName'],
                'planFinishedTime' => $latest[0]['planFinishedTime'],
            );
            $result = $projects->where('id=' . $data['relatedId'])->save($tempData);
            if ($result){
                $projectName = $projects->where('id=' . $data['relatedId'])->field('projectName')->select();
                $logs = M('logs_info');
                $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '修改项目(' . $projectName[0]['projectName'] . ")里程碑信息";
                $logs->add($logsData);
            }
            $this->ajaxReturn(array(),'修改成功',1);
        }else{
            $this->ajaxReturn(array(),'修改失败',0);
        }
    }

    /**
     * 删除项目里程碑
     */
    public function deleteMailStone($id){
        $mailstone = M('project_mailstone_progress');
        $relatedId = $mailstone->where('id='.$id)->field("relatedId")->select();
        if($mailstone->where('id='.$id)->delete()){
            //子表同步至主表
            $latestMailStone = $mailstone->where('relatedId='.$relatedId[0]['relatedId'])->order('id desc')->limit(1)->select();
            $LatestMailData = array(
                'mailstoneName' => $latestMailStone[0]['mailstoneName'],
                'planFinishedTime' => $latestMailStone[0]['planFinishedTime'],
            );
            $projects = M('projects');
            $projects->where('id='.$latestMailStone[0]['relatedId'])->save($LatestMailData);
            //保存日志
            $projectName = $projects->where('id=' . $id)->field('projectName')->select();
            $logs = M('logs_info');
            $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '删除项目(' . $projectName[0]['projectName'] . ")里程碑信息";
            $logs->add($logsData);
            $this->ajaxReturn(array(),'删除成功', 1);
        }else{
            $this->ajaxReturn(array(),'删除失败', 0);
        }
    }

    /**
     * 获取项目里程碑
     */
    public function getMailStone($id){
        $mailstone = M('project_mailstone_progress');
        $data = $mailstone->where('relatedId='.$id)->order('planFinishedTime')->select();
        if($data !== false){
            $this->ajaxReturn($data,'获取成功', 1);
        }else{
            $this->ajaxReturn(array(),'获取失败', 0);
        }
    }
}
