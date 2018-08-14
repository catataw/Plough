<?php

/**
 * Created by PhpStorm.
 * User: dhj
 * Date: 2018/6/7
 * Time: 14:08
 */
class ProjectGatheringConfirmAction extends Action
{
    /**
     * 添加项目收入确认
     */
    public function addGatheringConfirm(){
        $_rexp = array (
            'relatedId'=>'/^[0-9]+$/',
            'confirmProgressTime'=>'/^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/',
            'confirmTax'=>'/^[1-9]{1}\d*(\.\d{1,2})?$/',
            'confirmNoTax'=>'/^[1-9]{1}\d*(\.\d{1,2})?$/',
            'confirmedProgress'=>'/^100$|^(\d|[1-9]\d)$/',
            'textRate'=>'/^100$|^(\d|[1-9]\d)$/'
        );
        $postData = file_get_contents("php://input");
        $data = json_decode(htmlspecialchars_decode($postData), TRUE);
        foreach ($_rexp as $key => $value) {
            if (!preg_match($value, $data[$key])) {
                $this->ajaxReturn(array(), $key . '参数错误', 0);
            }
        }
        //验证通过
        $gathering = M('project_gathering_confirm');
        if ($gathering->add($data)) {
            $projects = M('projects');
            $latest = $gathering->where('relatedId='.$data['relatedId'])->order('id desc')->limit(1)->select();
            $tempData['confirmedProgress'] = $latest[0]['confirmedProgress'];
            $result = $projects->where('id=' . $data['relatedId'])->save($tempData);
            if ($result) {
                $projectName = $projects->where('id=' . $data['relatedId'])->field('projectName')->select();
                $logs = M('logs_info');
                $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '添加项目(' . $projectName[0]['projectName'] . ")收入确认信息";
                $logs->add($logsData);
            }
            $this->ajaxReturn(array(), '添加成功', 1);

        } else {
            $this->ajaxReturn(array(), '添加失败', 0);
        }
    }

    //编辑项目收入确认
    public function editGatheringConfirm()
    {
        $_rexp = array(
            'relatedId' => '/^[0-9]+$/',
            'confirmProgressTime' => '/^([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?$/',
            'confirmTax' => '/^([1-9]{1}\d*(\.\d{1,2})?)?$/',
            'confirmNoTax' => '/^([1-9]{1}\d*(\.\d{1,2})?)?$/',
            'confirmedProgress' => '/^(100$|^(\d|[1-9]\d))?$/',
            'textRate' => '/^100$|^(\d|[1-9]\d)$/'
        );
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }

        // 验证通过
        $gathering = M('project_gathering_confirm');
        $where ['relatedId'] = $data['relatedId'];
        $where ['id'] = $data['id'];
        if ($gathering->where($where)->save($data)) {
            $projects = M('projects');
            $latest = $gathering->where('relatedId='.$data['relatedId'])->order('id desc')->limit(1)->select();
            $tempData['confirmedProgress'] = $latest[0]['confirmedProgress'];
            $result = $projects->where('id=' . $data['relatedId'])->save($tempData);
            if ($result) {
                $projectName = $projects->where('id=' . $data['relatedId'])->field('projectName')->select();
                $logs = M('logs_info');
                $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '修改项目(' . $projectName[0]['projectName'] . ")收入确认信息";
                $logs->add($logsData);
            }
            $this->ajaxReturn(array(), '修改成功', 1);
        } else {
            $this->ajaxReturn(array(), '修改失败', 0);
        }
    }

    //获取项目收入确认列表
    public function getGatheringConfirm($id)
    {
        $gathering = M('project_gathering_confirm');
        $data = $gathering->where('relatedId=' . $id)->order('confirmProgressTime')->select();
        if ($data !== false) {
            $this->ajaxReturn($data, '获取成功', 1);
        } else {
            $this->ajaxReturn(array(), '获取失败', 0);
        }
    }

    //删除项目收入确认
    public function deleteGatheringConfirm($id)
    {
        $gathering = M('project_gathering_confirm');
        $relatedId = $gathering->where('id='.$id)->field("relatedId")->select();
        if ($gathering->where('id=' . $id)->delete()) {
            //子表同步至主表
            $latestGathering = $gathering->where('relatedId='.$relatedId[0]['relatedId'])->order('id desc')->limit(1)->select();
            $LatestGatheringData = array(
                'confirmedProgress' => $latestGathering[0]['confirmedProgress'],
            );
            $projects = M('projects');
            $projects->where('id='.$latestGathering[0]['relatedId'])->save($LatestGatheringData);
            //保存日志
            $projectName = $projects->where('id=' . $id)->field('projectName')->select();
            $logs = M('logs_info');
            $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '删除项目(' . $projectName[0]['projectName'] . ")收入确认信息";
            $logs->add($logsData);
            $this->ajaxReturn(array(), '删除成功', 1);
        } else {
            $this->ajaxReturn(array(), '删除失败', 0);
        }
    }
}
