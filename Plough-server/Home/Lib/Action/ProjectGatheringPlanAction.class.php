<?php

/**
 * Created by PhpStorm.
 * User: dhj
 * Date: 2018/6/6
 * Time: 17:40
 * Description: 项目收款计划
 */
class ProjectGatheringPlanAction extends Action
{
    /**
     * 获取收款计划列表
     */
    public function getPlan($id){
        $plan = M('project_gathering_plan');
        $data = $plan->where('relatedId='.$id)->order('gatheringTime')->select();
        $sumTax = $plan->where('relatedId='.$id)->sum('tax');
        if($data !== false){
            $result['data'] = $data;
            $result['sumTax'] = $sumTax;
            $result['status'] = 1;
            $result['info'] = '获取列表成功';
            $this->ajaxReturn($result,'JSON');
        }else{
            $this->ajaxReturn(array(),'获取列表失败', 0);
        }
    }
    /**
     * 删除收款计划列表
     */
    public function deletePlan($id){
        $plan = M('project_gathering_plan');
        if($plan->where('id='.$id)->delete()){
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '成功删除项目计划列表，编号为：'.  $id ;
           $logs->add ( $logsData );
            $this->ajaxReturn(array(),'删除成功', 1);
        }else{
            $this->ajaxReturn(array(),'删除失败', 0);
        }
    }
    /**
     * 添加收款计划列表
     */
    public function addPlan(){
        $_rexp = array (
            'relatedId'=>'/^[0-9]+$/',
            'gatheringCondition'=>'/\S/',
            'gatheringTime'=>'/^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/',
            'tax'=>'/^[1-9]{1}\d*(\.\d{1,2})?$/',
            'noTax'=>'/^[1-9]{1}\d*(\.\d{1,2})?$/',
            'gatheringRate'=>'/^100$|^(\d|[1-9]\d)$/',
        );
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }

        // 验证通过
        $Plan = M('project_gathering_plan');
      $projects = M('projects');
       $projectname = $projects -> where('id='.$_rexp['relatedId']) -> field('ProjectName') -> select();
        if($Plan->add($data)){
            //更新日志njy
               $logs = M ( 'logs_info' );
                $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '成功添加收款计划列表，项目名为：'. $projectname[0]['ProjectName'] ;
              $logs->add ( $logsData );

            $this->ajaxReturn(array(),'添加成功',1);
        }else{
            $this->ajaxReturn(array(),'添加失败',0);
        }
    }

    /**
     * 修改收款计划列表
     */
    public function editPlan(){
        $_rexp = array (
            'id'=>'/^[0-9]+$/',
            'gatheringTime'=>'/^([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?$/',
            'tax'=>'/^([1-9]{1}\d*(\.\d{1,2})?)?$/',
            'noTax'=>'/^([1-9]{1}\d*(\.\d{1,2})?)?$/',
            'gatheringRate'=>'/^(100$|^(\d|[1-9]\d))?$/',
        );
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }
        //var_dump($data);
        // exit();
        // 验证通过
        $Process = M('project_gathering_plan');
        //$projects = M('projects');
      //  $projectname = $projects -> where('id='.$_rexp['relatedId']) -> field('ProjectName') -> select();

        if($Process->save($data)){
            //更新日志njy
            $logs = M ( 'logs_info' );
            //$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '成功修改'. $projectname[0]['ProjectName'].'的收款计划列表' ;
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '成功修改项目计划列表，编号为：'. $_rexp['id'] ;
            $logs->add ( $logsData );
            $this->ajaxReturn(array(),'修改成功',1);
        }else{
            $this->ajaxReturn(array(),'修改失败',0);
        }
    }
}