<?php
header("Content-Type: text/html;charset=utf-8");
set_time_limit(0);
class ComputermonitorAction extends Action {

	
	/**
	 *
	 * @param unknown $url
	 * @return unknown
	 */
	public function getTextFromURL($url) {
		$ch = curl_init ();
		curl_setopt ( $ch, CURLOPT_URL, $url );
		curl_setopt ( $ch, CURLOPT_RETURNTRANSFER, 1 );
		curl_setopt ( $ch, CURLOPT_HEADER, 0 );
		// 执行并获取HTML文档内容
		$output = curl_exec ( $ch );
		// 释放curl句柄
		curl_close ( $ch );
		// 打印获得的数据
		return $output;
	}
	
	/**
	 * 
	 * @return 反馈所有公司物理机
	 */
	public function getAllLocalComputer(){
		$getcomputerUrl = 'http://10.139.17.40/Computer/getComputer';
	    $allComputers = $this->getTextFromURL($getcomputerUrl);
	    
	    $arrComputers = json_decode($allComputers,true);
	    foreach ($arrComputers as $key=>$value){
	    	if(!strstr($value['ip'],'168')){
	    		$result[] = $value;
	    	}
	    }
	    return $result;
	}
	
	/**
	 * 获取所有itemId
	 */
    public function getZabbixHostInfoInterface(){
    	set_time_limit(0);
    	$bdHosts = $this->getAllLocalComputer();
    	//通过interface 获取hostid
    	$interface =M('interface','',C('DB_CONFIG2'));
    	foreach($bdHosts as $key=>$value){
    		$oneInerface = $interface->query('select * from interface where ip="'.$value['ip'].'"');
            if($oneInerface){
            	$oneInerface[0]['userEmail'] = $value['userEmail'];
            	$allInterface[] =$oneInerface; 
            }
    	}
       return $allInterface ;
    }
    
    /**
     * 获取所有itemId API
     */
    public function getZabbixHostInfo(){
    	set_time_limit(0);
    	$bdHosts = $this->getAllLocalComputer();
    	//通过interface 获取hostid
    	$interface =M('pmo_interface','',C('DB_CONFIG1'));
    	foreach($bdHosts as $key=>$value){
    		$oneInerface = $interface->query('select * from pmo_interface where ip="'.$value['ip'].'"');
    		if($oneInerface){
    			$oneInerface[0]['userEmail'] = $value['userEmail'];
    			$oneInerface[0]['userName'] = $value['userName'];
    			$allInterface[] =$oneInerface[0];
    		}
    	}
    	echo json_encode($allInterface,true) ;
    }
    
    
    /**
     * 导出cpu均值利用率
     */
    public function getCpuExcl(){
    	$allInterface = $this->getZabbixHostInfoInterface();
    	//通过hostid 和key_=system.cpu.util[,idle]获取itemsids
    	$items = M('items','',C('DB_CONFIG2'));
    	foreach($allInterface as $key=>$value){
    		$sql = 'select itemid,hostid from items where hostid="'.$value[0]['hostid'].'" and key_="system.cpu.util[,idle]"';
    		$oneCpuItem = $items->query($sql);
    		$oneCpuItem[0]['ip'] = $value[0]['ip'];
    		$oneCpuItem[0]['userEmail'] = $value[0]['userEmail'];
    		$allCpuItems[] = $oneCpuItem[0];
    	}
    	//获取key_=mem-usage在配置时间段平均峰值利用率
    	$getAllCpuData = $this->getItemDurationAvg($allCpuItems);
    }
    
    
    /**
     * 导出内存/cpu峰值平均利用率表
     */
   public function getMonitorExcl(){
   	    $type = $_REQUEST['type'];
   	    $setDay =setDay();
   	    if($type == 'cpu'){
   	    	$key_='system.cpu.util[,idle]';
   	    	$xlsName = '过去'.$setDay['dayCount'].'天cpu-idle平均利用率';
   	    	$xlsCell = array (
   	    			array (
   	    					'itemid',
   	    					'itemid'
   	    			),
   	    			array (
   	    					'hostid',
   	    					'hostid'
   	    			),
   	    			array (
   	    					'userEmail',
   	    					'用户邮箱'
   	    			),
   	    			array (
   	    					'ip',
   	    					'ip'
   	    			),
   	    			array (
   	    					'avg-cpu-idle',
   	    					'内存峰值利用率'
   	    			)
   	    	
   	    	);
   	    }else{
   	    	$key_='mem-usage';
   	    	$xlsName = '过去'.$setDay['dayCount'].'天内存峰值平均利用率';
   	    	$xlsCell = array (
   	    			array (
   	    					'itemid',
   	    					'itemid'
   	    			),
   	    			array (
   	    					'hostid',
   	    					'hostid'
   	    			),
   	    			array (
   	    					'userEmail',
   	    					'用户邮箱'
   	    			),
   	    			array (
   	    					'ip',
   	    					'ip'
   	    			),
   	    			array (
   	    					'avgSummit',
   	    					'内存峰值利用率'
   	    			)
   	    		  
   	    	);
   	    }
   		$allInterface = $this->getZabbixHostInfoInterface();
	   	//通过hostid 和key_=mem-usage获取itemsids
	   	$items = M('pmo_items','',C('DB_CONFIG1'));
	   	foreach($allInterface as $key=>$value){
	   		$sql = 'select itemid,hostid from pmo_items where hostid="'.$value[0]['hostid'].'" and key_="'.$key_.'"';
	   		$oneMemItem = $items->query($sql);
	   		$oneMemItem[0]['ip'] = $value[0]['ip'];
	   		$oneMemItem[0]['userEmail'] = $value[0]['userEmail'];
	   		$allMemoryItems[] = $oneMemItem[0];
	   	}

	   	//获取key_=mem-usage在配置时间段平均峰值利用率
	   	$getAllMemData = $this->getItemDurationAvg($allMemoryItems);
 	
	   	exportExcel($xlsName,$xlsCell,$getAllMemData);
   }
    
    
   
   
    
    /**
     * 获取某个item在一个时间段内峰值平均值
     */
	public function  getItemDurationAvg($items){
		$everyDate = $this->getEveryDate();
		$setDay =setDay();
        $trends = M('pmo_trends','',C('DB_CONFIG1'));
		foreach ($items as $value){
			$itemid = $value['itemid'];
			//获取时间段峰值和
			$totalDaySummit = 0;
			foreach ($everyDate as $v){
				$startTime = $v;
				$endTime = $v + 60*60*24;
				$sql = 'select MAX(valueMax) from pmo_trends where clock>"'.$startTime.'" and clock<"'.$endTime.'" and itemid="'.$itemid.'"';
				$oneDaySummit = $trends->query($sql);
				$totalDaySummit =$totalDaySummit + intval($oneDaySummit[0]['MAX(valueMax)']);
			}
            //求时间段峰值平均
            $value['avgSummit'] = $totalDaySummit/$setDay['dayCount'];
            $result[] = $value;
		}		
		return $result;
	}
    
	/**
	 * 获取一段时间的日期
	 */
	public function getEveryDate(){
		$date = setDay();
		$year = $date['year'];
		$month = $date['month'];
		$startDay = $date['startDay'];
		$dayCount = $date['dayCount'];
		$startTimeStamp = strtotime($year.'-'.$month.'-'.$startDay.' 00:00:00');
		$result[] = $startTimeStamp;
		for ($i=0;$i<$dayCount;$i++ ){
			$startTimeStamp += 60*60*24;
			$result[] = $startTimeStamp;
		}
		return $result;
	}
	
	/**
	 * 获取前7天日期
	 */
	public function getWeekBefore(){
		$sDayBefore = date('Y-m-d',strtotime('-8 day'));
		$startTimeStamp = strtotime($sDayBefore);
		$result[] = $startTimeStamp;
		for ($i=0;$i<7;$i++ ){
			$startTimeStamp += 60*60*24;
			$result[] = $startTimeStamp;
		}
		return $result;
	}
	
	
	
	
	/**
	 * 获取当前日期前7天内存利用率
	 */
	public function getLSM(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$items = M('pmo_items','',C('DB_CONFIG1'));
		$sql = 'select itemid,hostid from pmo_items where hostid="'.$data['hostid'].'" and key_="mem-usage"';
		$oneMemItem = $items->query($sql);

		$everyDate = $this->getWeekBefore();
		$trends = M('pmo_trends','',C('DB_CONFIG1'));
		$itemid = $oneMemItem[0]['itemid'];

		//获取时间段峰值和
		$totalDaySummit = 0;
		foreach ($everyDate as $v){
			$startTime = $v;
			$endTime = $v + 60*60*24;
			$sql = 'select valueMax from pmo_trends where clock>"'.$startTime.'" and clock<"'.$endTime.'" and itemid="'.$itemid.'" order by valueMax limit 1;';
			$oneDaySummit = $trends->query($sql);
			$oneDaydata['date'] =  date('m-d',$startTime);;
			$oneDaydata['memUsage'] = round($oneDaySummit[0]['valueMax']);

			$result[] = $oneDaydata;
		}	
        echo json_encode($result);
	}
	
	/**
	 * 获取当前日期前7天CPU利用率
	 */
	
	public function getLSC(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		
		
		$items = M('pmo_items','',C('DB_CONFIG1'));
		$sql = 'select itemid,hostid from pmo_items where hostid="'.$data['hostid'].'" and key_="system.cpu.util[,idle]"';
		$oneMemItem = $items->query($sql);
		
		$everyDate = $this->getWeekBefore();
		$trends = M('pmo_trends','',C('DB_CONFIG1'));
		$itemid = $oneMemItem[0]['itemid'];
		
		//获取时间段峰值和
		$totalDaySummit = 0;
		foreach ($everyDate as $v){
			$startTime = $v;
			$endTime = $v + 60*60*24;
			$sql = 'select valueMax from pmo_trends where clock>"'.$startTime.'" and clock<"'.$endTime.'" and itemid="'.$itemid.'" order by valueMax limit 1;';
			$oneDaySummit = $trends->query($sql);
			$oneDaydata['date'] =  date('m-d',$startTime);;
			$oneDaydata['memUsage'] = round($oneDaySummit[0]['valueMax']);
			$result[] = $oneDaydata;
		}
		echo json_encode($result);
	}
	
	/**
	 * 将zabbix相关数据导入
	 */
	public function getInportZabbixTrends(){
		set_time_limit(0);
		//获取所有主机的interface信息
		$allInterface = $this->getZabbixHostInfoInterface();
		//通过hostid 和key_=mem-usage获取itemsids
		$items = M('items','',C('DB_CONFIG2'));
		$trends = M('trends','',C('DB_CONFIG2'));
		$pmo_trends = M('pmo_trends','',C('DB_CONFIG1'));
		$pmo_interface=M('pmo_interface','',C('DB_CONFIG1'));
		$pmo_items=M('pmo_items','',C('DB_CONFIG1'));
		
		
		//同步trends 信息
		foreach($allInterface as $key=>$value){
			$sql = 'select itemid from items where hostid="'.$value[0]['hostid'].'" and key_="mem-usage"';
			$oneMemItem = $items->query($sql);
			$sqlTrends = 'select itemid,clock,value_max from trends where clock>1511107200 and itemid='.$oneMemItem[0]['itemid'];
			$trendsMem = $trends->query($sqlTrends);
            foreach ($trendsMem as $value){
            	$existSql = 'select itemid from pmo_trends where clock="'.$value['clock'].'" and itemid="'.$value['itemid'].'";';
            	$isExist = $pmo_trends->query($existSql);
            	if(!$isExist){
            		$insertData['clock'] = $value['clock'];
            		$insertData['itemid'] = intval($value['itemid']);
            		$insertData['valueMax'] = $value['value_max'];
            		$sql = 'INSERT INTO `pmo_trends`(`itemid`, `clock`, `valueMax`) VALUES ('.$insertData['itemid'].',"'.$insertData['clock'].'","'.$insertData['valueMax'].'");';
            		$pmo_trends->query($sql);
            	}
            }			
		}
		foreach($allInterface as $key=>$value){
			$sql = 'select itemid from items where hostid="'.$value[0]['hostid'].'" and key_="system.cpu.util[,idle]"';
			$oneCpuItem = $items->query($sql);
			$sqlTrends = 'select itemid,clock,value_max from trends where clock>1511107200 and itemid='.$oneCpuItem[0]['itemid'];
			$trendsMem = $trends->query($sqlTrends);
			foreach ($trendsMem as $value){
			$existSql = 'select itemid from pmo_trends where clock="'.$value['clock'].'" and itemid="'.$value['itemid'].'";';
            	$isExist = $pmo_trends->query($existSql);
            	if(!$isExist){
            		$insertData['clock'] = $value['clock'];
            		$insertData['itemid'] = intval($value['itemid']);
            		$insertData['valueMax'] = $value['value_max'];
            		$sql = 'INSERT INTO `pmo_trends`(`itemid`, `clock`, `valueMax`) VALUES ('.$insertData['itemid'].',"'.$insertData['clock'].'","'.$insertData['valueMax'].'");';
            		$pmo_trends->query($sql);
            	}
			}
		}

		//同步hostid 和 ip
		foreach ($allInterface as $value){
			$isExistSql = 'select ip from pmo_interface where ip="'.$value[0]['ip'].'" and hostid="'.$value[0]['hostid'].'";';
			$isExist = $pmo_interface->query($isExistSql);
			if(!$isExist){
				$sql = 'INSERT INTO `pmo_interface`(`ip`, `hostid`) VALUES ("'.$value[0]['ip'].'","'.$value[0]['hostid'].'");';
				$pmo_interface->query($sql);
			}
		}
		//同步itemid
		$getItemsSql = 'select itemid,hostid,key_ from items where key_="mem-usage" or key_="system.cpu.util[,idle]"';
		$itemsData = $items->query($getItemsSql);
		foreach ($itemsData as $value){
			$isExistSql = 'select itemid from pmo_items where itemid="'.$value['itemid'].'";';
			$isExist = $pmo_items->query($isExistSql);
			if(!$isExist){
				$insertItemSql = 'INSERT INTO `pmo_items`(`itemid`, `hostid`, `key_`) VALUES ("'.$value['itemid'].'","'.$value['hostid'].'","'.$value['key_'].'")';
				$pmo_items->query($insertItemSql);
			}
		}	
		echo 'success';
	}
	

}