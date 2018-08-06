<?php
header("Content-Type: text/html;charset=utf-8");
set_time_limit(0);
class SpiderAction extends Action {
 	
 	public $userPassword = "wuhui:123456";
 	
 	public $baseUrl = "http://223.105.0.132:8090/pages/viewpage.action";
 	
 	public $pageId = array();
 	
 	public $weekReportAncestorUrl = "http://223.105.0.132:8090/plugins/pagetree/naturalchildren.action?decorator=none&excerpt=false&sort=position&reverse=false&disableLinks=false&expandCurrent=true&hasRoot=true&pageId=20391713&treeId=0&startDepth=0&mobile=false&ancestors=23533568&ancestors=20391980&ancestors=24988050&ancestors=20391713&treePageId=27663545&";
 	
 	public $basePageId = '27663545';
 	
 	//通过url 获取文本信息接口
 	public function getTextFromURL($url) {
 		$userPassword = $this->userPassword;
 		$ch = curl_init ();
 		curl_setopt ( $ch, CURLOPT_USERPWD,  $userPassword);
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
 	
 	//获取BigTeamPageid
 	public function getPageBigTeamPageids(){
 		
 		$basePageId = $this->basePageId;
 		$url = $this->weekReportAncestorUrl;
 		$pageContent = $this->getTextFromURL($url);

 		preg_match_all ('/<ul class="plugin_pagetree_children_list" id="child_ul'.$basePageId.'-0">[\w\W]+?<\/ul>/', $pageContent, $m);
 		
        $big_team_content = $m[0][0];
        preg_match_all('/(?<=<a href="\/pages\/viewpage.action\?pageId=)[\d]+/',$big_team_content,$data);
        return $data[0];
 	}
 	//遍历所有pageId 获取周报内容
 	public function getPerReportContent(){
 		//$pageIds = $this->getAllTreePageId();
 		$tmpUrl = 'http://223.105.0.132:8090/pages/viewpage.action?pageId=29836537';
 		
 		$content = $this->getTextFromURL($tmpUrl);
 		//获取小组和时间
 		preg_match_all('/(?<=<a href="\/pages\/viewpage.action\?pageId=29836537">)[^<]+/',$content,$data);
 		

 		$title = $data[0][0];
 		preg_match_all('/[\d]+[\D]*[\d]+/',$title,$date);
 		$weeklyData['date'] = $date[0][0];
 		preg_match_all('/[\w\W]+(?='.$date[0][0].')/',$title,$team);
 		$weeklyData['team'] = $team[0][0];
 		preg_match_all('/<tr><td(.*?)<\/tr>/',$content,$jobs);
 		
 		$str = json_encode($jobs);
 		$test = json_decode($str);
 		var_dump($test);exit;
 		/*
 		foreach ($pageIds as $key=>$value){
 			foreach ($value as $k=>$v){
 				$tmpUrl = 'http://223.105.0.132:8090/pages/viewpage.action?pageId='.$v;
 				echo '正在获取'.$tmpUrl;
 				ob_flush();
 				flush();
 				sleep(1);
 			}
 		}
 		*/
 	}
 	
 	
 	
 	//遍历获取根目录下的pageId
 	public function getAllTreePageId(){
 		//获取大组pageId
 		$bigTeamPageId = $this->getPageBigTeamPageids();
 		//获取每个大组每个季度的pageId
 		$seasonPageId = array();
 		$pageId = array();
 		foreach ($bigTeamPageId as $key=>$value){
 			//拼接每个大组url
 			$weekReportAncestorUrl = $this->weekReportAncestorUrl;
 			$tmpUrl = str_replace('treePageId','ancestors',$weekReportAncestorUrl);
 			$bigTeamUrl = $tmpUrl.'treePageId='.$value;
 			//获取大组每个季度pageId
            $treeData = $this->getTreePageId($value,$bigTeamUrl);
            
            $seasonPageId[$value] = $treeData;
 		}

 		
 		//获取每个季度，每个小组的pageId
 		foreach ($seasonPageId as $key=>$value){
 			//拼接每个季度，每个小组url
 			foreach ($value as $k=>$v){
 				//拼接每个大组每个季度的url
 				$weekReportAncestorUrl = $this->weekReportAncestorUrl;
 				$tmpUrl = str_replace('treePageId','ancestors',$weekReportAncestorUrl);
 				$prepareSmallTeamUrl = str_replace('mobile=false&','mobile=false&ancestors='.$v.'&ancestors='.$key.'&ancestors='.$this->basePageId.'&',$tmpUrl);
 				$tmpUrl = $tmpUrl.'treePageId='.$v;
 				$bigTeamSeasonUrl = str_replace('mobile=false&','mobile=false&ancestors='.$key.'&ancestors='.$this->basePageId.'&',$tmpUrl);
                //获取各个季度各个小组pageId

 				$treeData = $this->getTreePageId($v,$bigTeamSeasonUrl);
                $seasonSmallTeamId[$prepareSmallTeamUrl] = $treeData;
 			}
 		}
 		
 		//获取各个小组的page周报的pageId
 		foreach($seasonSmallTeamId as $prepareSmallTeamUrl=>$smallTeamIds){
 			foreach($smallTeamIds as $k=>$v){
 				//拼接各小组周报目录url
 				$smallTeamUrl = $prepareSmallTeamUrl.'treePageId='.$v;
 				//echo $smallTeamUrl;
 				//echo "</br>".$v;exit;
 				//获取各个小组周报pageId
 				$treeData = $this->getTreePageId($v,$smallTeamUrl);
 				//var_dump($treeData);exit;
 				$pageId[$v] = $treeData;
 				var_dump('访问'.$smallTeamUrl.',正在抓取小组周报id');
 				ob_flush();
 				flush();
 			}
 			
 		}
 	   return $pageId;
 	}
 	
 	
 	//获取treePage 下所有pageId
 	public function getTreePageId($treePageId,$url){
 		$pageContent = $this->getTextFromURL($url);
 	
         
 		preg_match_all ('/<ul class="plugin_pagetree_children_list" id="child_ul'.$treePageId.'-0">[\w\W]+?<\/ul>/', $pageContent, $m);
 			
 		$big_team_content = $m[0][0];
 		//preg_match_all('/(?<=<a href="\/pages\/viewpage.action\?pageId=)[\d]+/',$big_team_content,$data);
 		//var_dump($data[0]);exit;
 		//if(count($data[0])==0){
 		  preg_match_all('/(?<=<span class="plugin_pagetree_children_span" id="childrenspan)[\d]+/',$big_team_content,$data);
 		//}
 		return $data[0];

 	}
 	
 	
 	
 }