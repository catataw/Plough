<?php
// 本类由系统自动生成，仅供测试用途
class RecruitAction extends Action {
	/**
	 * 用户登录
	 */
	public function getRecruitDemands()
	{		
		$result = M()->query('select a.*,b.userTeam from pmo_recruit a left join pmo_user_info b on a.demandMan=b.userName where a.deletestatus=0');
		echo json_encode ( $result );
    }
}