<?php
// 本类由系统自动生成，仅供测试用途
class LogAction extends Action {
	public function index() {
		$this->display ();
	}
	
	public function loadLogs(){
		$computer = M ( 'logs_info' );
		$result = $computer->query ( 'SELECT * FROM pmo_logs_info order by id DESC;' );
		echo json_encode ( $result );
		exit ();
	}
	

}