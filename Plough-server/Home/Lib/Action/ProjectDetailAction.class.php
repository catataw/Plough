<?php


class ProjectDetailAction extends Action
{
    public function getProjectDetail($id)
    {
    	if(!$id){
    		$this->ajaxReturn(array(), 'id错误，获取失败', 0);
    	}
    	$arrProcess=array('process','risk','lastWeekProgress','recentPlan','responseMeasures');
        $projects = M('projects');
        $data = $projects->where('id=' . $id)->select();
        //项目进展数据获取
        $where['relatedId'] = $id;
        $oneProjectProcess =  M('project_process')
		        ->where($where)
		        ->order('id desc')
		        ->limit(2)
		        ->select();
        //上周进展
        foreach ($arrProcess as $key=>$value){
        	$lastProcess[$value] = $oneProjectProcess[1][$value];
        }
       
        //本周进展
        $currentProgress['currentProgress'] =$oneProjectProcess[0]['currentProgress'];
  
        $productTypeCount = M("project_product")->where($where)->Count();
        if($data[0]['planFinishedTime']){
        	if($data[0]['planFinishedTime']>date('Y-m-t')){
        		$data[0]['isOverdue'] = '是';
        	}else{
        		$data[0]['isOverdue'] = '否';
        	}
        }else{
        	$data[0]['isOverdue'] = '';
        }
        
        $data[0]['nodeCount'] = $data[0]['nodeCount']?$data[0]['nodeCount']:"0";
        $data[0]['productTypeCount'] = $productTypeCount?$productTypeCount:"0";
        $result = array_merge($data[0],$currentProgress,$lastProcess);
        if ($data) {
            $this->ajaxReturn($result, '获取成功', 1);
        } else {
            $this->ajaxReturn(array(), '获取失败', 0);
        }
    }
}