<?php

/**
 * Created by PhpStorm.
 * User: dhj
 * Date: 2018/6/6
 * Time: 15:52
 * Description: 项目进度
 */
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
            $latest = $Process->where('relatedId='.$data['relatedId'])->order('id desc')->limit(1)->select();
            $tempData = array(
                'risk' => $latest[0]['risk'],
                'responseMeasures' => $latest[0]['responseMeasures'],
                'currentProgress' => $latest[0]['currentProgress'],
            );
            $result = $projects->where('id='.$data['relatedId'])->save($tempData);
            if ($result){
                $projectName = $projects->where('id=' . $data['relatedId'])->field('projectName')->select();
                $logs = M('logs_info');
                $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '修改项目(' . $projectName[0]['projectName'] . ")进展信息";
                $logs->add($logsData);
            }
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
        $result = $process->where('relatedId='.$id)->order('updateTime desc')->find();
        if(!$result || strtotime('last sunday') - strtotime(substr($result[updateTime], 0, 10))> 0){
            $row['relatedId'] = $id;
            $row['process'] = 0;
            $row['risk'] = '高';
            $process->add($row);
        }
        $data = $process->where('relatedId='.$id)->order('updateTime desc')->select();
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
        if($process->where('relatedId='.$id)->delete()){
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
}