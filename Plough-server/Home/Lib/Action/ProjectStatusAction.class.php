
<?php
/**
 * Created by PhpStorm.
 * User: dhj
 * Date: 2018/6/6
 * Time: 15:52
 * Description: 项目状态
 */

class ProjectStatusAction extends Action {
    /**
     *添加项目状态
     */
    public function addStatus(){
        //header("Content-type:text/html;charset=utf-8");//让网页可以显示中文
        $_rexp = array (
            'relatedId'=>'/^[0-9]+$/',//正则表达式
            'commerceStatus'=>'/^商机中|已立项|已谈判|已签约|已结项$/',
            'implementBases'=>'/^无|POC|合同|POC+合同$/',
            'developStatus'=>'/^未开发|开发中|已完成$/',
            'operateStatus'=>'/^未交维|自运维|已交维$/',
            'implementStatus'=>'/^未实施|实施中|已完成$/',
            'onlineStatus'=>'/^未上线|预上线|正式上线$/',
            'updateTime'=>'/^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/',
            //年-月-日
        );
        $postData = file_get_contents ( "php://input" );//前端给id
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){//正则匹配reg_match，前面的是规则，后面的是具体输入的字符串，/ni/ /nijingyi/，会出来ni，这是匹配到的
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }
        // 验证通过
        //添加项目状态同步到主表
        $Status = M('project_status');
        if($Status->add($data)){
            $projects = M('projects');
            $latest = $Status->where('relatedId='.$data['relatedId'])->order('id desc')->limit(1)->select();


            //$LateststatusData 是最新的数据状态
            $LatestStatusData = array(
                'commerceStatus' => $latest[0] ['commerceStatus'],
                'implementBases' => $latest[0]['implementBases'],
                'developStatus' => $latest[0]['developStatus'],
                'operateStatus' => $latest[0]['operateStatus'],
                'implementStatus' =>$latest[0]['implementStatus'],
                'onlineStatus' => $latest[0]['onlineStatus']
            );
            $result = $projects -> where('id='.$data['relatedId']) -> save($LatestStatusData );
            $projectname = $projects -> where('id='.$data['relatedId']) -> field('ProjectName') -> select();
            //判断总表是否更新添加成功，更新日志
            if ($result) {
                $logs = M ( 'logs_info' );
                $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) .  '成功删除添加项目状态'.'编号为：'.$data ['relatedId'] .'，项目名称为：'.$projectname[0]['ProjectName']   ;
                $logs->add ( $logsData );
            }
            $this->ajaxReturn(array(),'添加成功',1);
        }else{
            $this->ajaxReturn(array(),'添加失败',0);
        }
    }

    /**
     *修改项目状态
     */
    public function editStatus(){
        $_rexp = array (
            'id'=>'/^[0-9]+$/',
            'commerceStatus'=>'/^(商机中|已立项|已谈判|已签约|已结项)?$/',
             'implementBases'=>'/^无|POC|合同|POC+合同$/',
            'developStatus'=>'/^(未开发|开发中|已完成)?$/',
            'operateStatus'=>'/^(未交维|自运维|已交维)?$/',
            'implementStatus'=>'/^(未实施|实施中|已完成)?$/',
            'onlineStatus'=>'/^(未上线|预上线|正式上线)?$/',
            'updateTime'=>'/^([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?$/',
        );
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }

        $Status = M('project_status');
        // 验证通过
        //修改项目状态同步到主表
        $where ['relatedId'] = $data['relatedId'];
        $where ['id'] = $data['id'];
        if($Status->where($where)->save($data)){
            //  $latestStatus是最新id的项目状态
            $latestStatus = $Status->where('relatedId='.$data['relatedId'])->order('id desc')->limit(1)->select();
            $statusData = array(
                'commerceStatus' =>$latestStatus[0]['commerceStatus'],
                'implementBases' => $latestStatus[0]['implementBases'],
                'developStatus' => $latestStatus[0]['developStatus'],
                'operateStatus' => $latestStatus[0]['operateStatus'],
                'implementStatus' => $latestStatus[0]['implementStatus'],
                'onlineStatus' => $latestStatus[0]['onlineStatus']
            );
            $projects = M('projects');
            $result = $projects -> where('id='.$data['relatedId']) -> save($statusData);
            $projectname = $projects -> where('id='.$data['relatedId']) -> field('ProjectName') -> select();
            //判断总表是否更新修改成功
            if ($result) {
                $logs = M ( 'logs_info' );
                $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) .  '成功删除添加项目状态'.'编号为：'.$data ['projectId'] .'，项目名称为：'.$projectname[0]['ProjectName']   ;
                $logs->add ( $logsData );
            }

            $this->ajaxReturn(array(),'修改成功',1);

        }else{
            $this->ajaxReturn(array(),'修改失败',0);
        }
    }

    /**
     *获取项目状态列表
     */
    public function getStatus($id){
        $status = M('project_status');
        $data = $status->where('relatedId='.$id)->order('updateTime desc')->select();
       // $projects = M('projects');
       // $projectname = $projects -> where('id='.$data['relatedId']) -> field('ProjectName') -> select();
        if($data !== false){
            $this->ajaxReturn($data,'获取列表成功', 1);
        }else{
            $this->ajaxReturn(array(),'获取列表失败', 0);
        }
    }

    /**
     * 删除项目状态
     */
     public function deleteStatus($id){
         $status = M('project_status');
         $relatedId = $status->where('id='.$id)->field("relatedId")->select();
          if( $status->where('id='.$id)->delete()){
              $latestStatus = $status->where('relatedId='.$relatedId[0]['relatedId'])->order('id desc')->limit(1)->select();
              $LatestStatusData = array(
                  'commerceStatus' => $latestStatus[0] ['commerceStatus'],
                  'implementBases' => $latestStatus[0]['implementBases'],
                  'developStatus' => $latestStatus[0]['developStatus'],
                  'operateStatus' => $latestStatus[0]['operateStatus'],
                  'implementStatus' =>$latestStatus[0]['implementStatus'],
                  'onlineStatus' => $latestStatus[0]['onlineStatus']
              );
              $project = M('projects');
              $project->where('id='.$latestStatus[0]['relatedId'])->save( $LatestStatusData);
              //删除项目状态列表，更新日志
              $logs = M ( 'logs_info' );
              $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '删除编号为：'.$id.'的项目状态' ;
              $logs->add ( $logsData );
              $this->ajaxReturn(array(),'删除成功', 1);
          }else{
              $this->ajaxReturn(array(),'删除失败', 0);
            }
      }

}

