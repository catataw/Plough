<?php

/**
 * Created by PhpStorm.
 * User: Xu
 * Date: 2018/7/31
 * Time: 10:16
 */
class CustomfieldAction extends Action
{
    //添加用户关注表
    public function addCustomField(){
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        $project_fields = M("projects")->getDbFields();
        $process_fields = M("project_process")->getDbFields();
        $allFields = array_merge($project_fields,$process_fields);
        $tempFields = explode(',',$data['customField']);
        foreach ($tempFields as $value){
            if(!in_array($value,$allFields)){
                $this->ajaxReturn(array(),'失败，请重新确认所给字段',0);
            }
        }
        $customField = M('project_custom_field');
        if($customField->add($data)){
            $this->ajaxReturn(array(),'添加成功',1);
        }else{
            $this->ajaxReturn(array(),'添加失败',0);
        }
    }

    //获取用户关注表
    public function getCustomField($userEmail){
        $customField = M('project_custom_field');
        $where ['userEmail'] = $userEmail;
        $data = $customField->where($where)->field('id',true)->select();
        if($data !== false){
            $this->ajaxReturn($data, '获取成功', 1);
        }
        else{
            $this->ajaxReturn(array(), '获取失败', 0);
        }
    }

    //编辑用户关注表
    public function editCustomField(){
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        $project_fields = M("projects")->getDbFields();
        $process_fields = M("project_process")->getDbFields();
        $allFields = array_merge($project_fields,$process_fields);
        $tempFields = explode(',',$data['customField']);
        foreach ($tempFields as $value){
            if(!in_array($value,$allFields)){
                $this->ajaxReturn(array(),'失败，请重新确认所给字段',0);
            }
        }
        $customField = M('project_custom_field');
        $where ['userEmail'] = $data ['userEmail'];
        if($customField->where($where)->save($data)){
            $this->ajaxReturn(array(),'修改成功',1);
        }else{
            $this->ajaxReturn(array(),'修改失败',0);
        }
    }

    //删除用户关注表
    public function deleteCustomField($userEmail){
        $customField = M('project_custom_field');
        $where ['userEmail'] = $userEmail;
        if($customField->where($where)->delete()){
            $this->ajaxReturn(array(), '删除成功', 1);
        }else {
            $this->ajaxReturn(array(), '删除失败', 0);
        }
    }

    //添加、修改用户关注表
    public function addAndDeleteCustomField()
    {
        header("Access-Control-Allow-Origin:*");
        header("Access-Control-Allow-Headers:content-type");
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        $project_fields = M("projects")->getDbFields();
        $process_fields = M("project_process")->getDbFields();
        $allFields = array_merge($project_fields,$process_fields);
        $tempFields = explode(',',$data['customField']);
        foreach ($tempFields as $value){
            if(!in_array($value,$allFields)){
                $this->ajaxReturn(array(),'失败，请重新确认所给字段',0);
            }
        }
        $customField = M('project_custom_field');
        $where['userEmail'] = $data['userEmail'];
        //如果数据库里已有该用户则修改
        if($customField->where($where)->select())
        {
            if($customField->where($where)->save($data)){
                $this->ajaxReturn(array(),'修改成功',1);
            }else{
                $this->ajaxReturn(array(),'修改失败',0);
            }
        }
        //不存在则添加
        else
        {
            if($customField->add($data)){
                $this->ajaxReturn(array(),'添加成功',1);
            }else{
                $this->ajaxReturn(array(),'添加失败',0);
            }
        }
    }
}
