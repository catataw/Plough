<?php
class TenantAction extends Action {
	/**
	 * 添加租户配额
	 */
	
	public function addTenant(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$tenant = M ( 'tenant' );
		$record = $tenant->where ( 'tenantName="' . $data ['tenantName'] . '"' )->find ();
		if (! $record) {
			$res = $tenant->add ( $data );
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '添加租户配额' . $data ['tenantName'];
			$logs->add ( $logsData );
			echo $res;
			exit ();
		} else {
			exit ();
		}
	}
	
	
	/*
	 * 获取所有租户配额
	 */
	public function getTenant(){
		$tenant = M('tenant');
		$result = $tenant->field('pmo_user_info.userTeam,pmo_tenant.*,pmo_teams.teamName,pmo_teams.teamLeader,pmo_teams.bigTeamLeader')
		->join('left join pmo_user_info on pmo_user_info.userName=pmo_tenant.officerName')
		->join('left join pmo_teams on pmo_user_info.userTeam=pmo_teams.teamName')
		->select();	
		echo json_encode($result);
	}

	/*
	 * 修改租户配额
	 */
	public function editTenant(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$tenant = M('tenant');
		$where['id'] = $data['id'];
		$result = $tenant->where($where)->save($data);
		if($result){
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '修改租户信息' . $data ['tenantName'];
			$logs->add ( $logsData );
			echo $result;
		}
	}


	/*
	 * 删除租户配额
	 */
	public function delTenant(){
		$postData = file_get_contents ( "php://input" );
		$data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
		$tenant = M('tenant');
		$where['id'] = $data['id'];
		$result = $tenant->where($where)->delete();
		if($result){
			$logs = M ( 'logs_info' );
			$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '删除租户配额' . $data ['tenantName'];
			$logs->add ( $logsData );
			echo json_encode($result);
		}

	}
	
	/*
	 * 批量导入租户配额
	 */
	public function importTenant(){
		header("Content-type:text/html;charset=utf8");
		if (! empty ( $_FILES )) {
			import ( "ORG.Util.PHPExcel" );
			// 上传excl
			$uploadPath = './Public/upload/';
			$file_name = $_FILES ["file"] ["name"];
			$file_info = explode ( '.', $file_name );
			$exts = $file_info [1];
			$move_file_name = $uploadPath . time () . '.' . $exts;
			move_uploaded_file ( $_FILES ["file"] ["tmp_name"], $move_file_name );
			// 创建PHPExcel对象
			$PHPExcel = new PHPExcel ();
			// 如果excel文件后缀名为.xls，导入这个类
			if ($exts == 'xls') {
				import ( "ORG.Util.PHPExcel.Reader.Excel5" );
				$PHPReader = new \PHPExcel_Reader_Excel5 ();
			} else if ($exts == 'xlsx') {
				import ( "ORG.Util.PHPExcel.Reader.Excel2007" );
				$PHPReader = new \PHPExcel_Reader_Excel2007 ();
			} else {
				echo '9';exit;
			}
			// 载入文件
			$PHPExcel = $PHPReader->load ( $move_file_name );
			// 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
			$currentSheet = $PHPExcel->getSheet ( 0 );
			$allColumn = $currentSheet->getHighestColumn();
            // 获取总行数
            $allRow = $currentSheet->getHighestRow();
			// 循环获取表中的数据，$currentRow表示当前行，从哪行开始读取数据，索引值从0开始
			$num = 0;$upt = 0;
			for( $currentRow = 2; $currentRow <= $allRow; $currentRow++ ) {
                $arr = array();
                $arr['area'] = (string)($currentSheet->getCell( 'A' . $currentRow )->getValue());
                $arr['tenantName'] = (string)($currentSheet->getCell( 'B' . $currentRow )->getValue());
                $arr['officerName'] = (string)($currentSheet->getCell( 'C' . $currentRow )->getValue());
                $id = M("tenant")->where($arr)->getField("id");
                if(!$id){
                	$add = M("tenant")->add($arr);
                	if($add){
                		$num++;
                	}
                }
            }

            if($num>0 || $upt>0){
            	$back_info = array('status'=>1,'msg'=>"成功添加".$num."条数据,更新".$upt."条数据");
            }else{
            	$back_info = array('status'=>0,'msg'=>'添加失败');
            }
           echo json_encode($back_info);
		} else {
			$back_info = array('status'=>0,'msg'=>'文件上传失败');
			echo json_encode($back_info);
		}
	}



	/*
	 * 导出租户配额
	 */
	public function exportTentent() {
		$tenant = M ( 'tenant' );
		$allTenant = $tenant->select();
		
		$user = M('user_info');
		if($allTenant){
			foreach ($allTenant as $value){
				$where['userName'] = $value['officerName'];
				$oneTenant = $user->where($where)->select();
				$value['userEmail'] = $oneTenant[0]['userEmail'];
				$allTenantInfo[] =$value;
			}
		}
		
		set_time_limit(0);
        import ( "ORG.Util.PHPExcel" );
        $objPHPExcel = new PHPExcel();

        $objPHPExcel->getProperties()->setSubject('组合配额');
        $objPHPExcel->setActiveSheetIndex(0);
        $objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
        $objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
        $objPHPExcel->getActiveSheet()->setCellValue('A1', '区域');
        $objPHPExcel->getActiveSheet()->setCellValue('B1', '租户');
        $objPHPExcel->getActiveSheet()->setCellValue('C1', '使用人');
        $objPHPExcel->getActiveSheet()->setCellValue('D1', '邮箱');
        $objPHPExcel->getActiveSheet()->setCellValue('E1', '详情');
        //遍历填充日期
        $i = 2;
        foreach($allTenantInfo as $key => $project){
            $objPHPExcel->getActiveSheet()->setCellValue('A'.($i), $project['area']);
            $objPHPExcel->getActiveSheet()->setCellValue('B'.($i), $project['tenantName']);
            $objPHPExcel->getActiveSheet()->setCellValue('C'.($i), $project['officerName']);
            $objPHPExcel->getActiveSheet()->setCellValue('D'.($i), $project['userEmail']);
            $objPHPExcel->getActiveSheet()->setCellValue('E'.($i), $project['detail']);
            $i++;
        }

        header ( 'pragma:public' );
        header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="租户配额导出.xls"');
        header ( 'Content-Disposition:attachment;filename="租户配额导出.xls"' ); // attachment新窗口打印inline本窗口打印
        $objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
        $objWriter->save ( 'php://output' );
	}
	
	/*
	 * 向租户发送邮件更新租户虚机项目
	 */
	public function sendMailToTenats(){
		set_time_limit(0);
		if($_REQUEST['exportTime']){
			$date= substr(str_replace('-','',$_REQUEST['exportTime']),0,6);
		}else{
			return;
		}
		$tenant = M('tenant');
		//获取唯一的租户和租户所有者
		$allTenantName = $tenant->query('SELECT DISTINCT tenantName,officerName FROM  `pmo_tenant`');
		//获取租户邮箱信息
		$user = M('user_info');
		if($allTenantName){
			foreach ($allTenantName as $value){
				$where['userName'] = $value['officerName'];
				$oneTenant = $user->where($where)->select();
				$value['userEmail'] = $oneTenant[0]['userEmail'];
				$allTenantInfo[] =$value;
			}
		}
        //给租户所有者发送邮件，通知更新名下虚机信息
		if($allTenantInfo){
			foreach ($allTenantInfo as $value){
				if($value['userEmail']){
					$this->sendMail($value,$date);
					$logs = M ( 'logs_info' );
					$logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':系统发送虚机占用提醒邮件给' . $value ['tenantName'];
					$logs->add ( $logsData );
				}
				 
			}
		}
		echo '发送完毕';exit;
	}
	
	
	
	
	/**
	 * 租户邮件发送
	 * @param $tenant 租户 $copyto array('hmshenf@isoftstone.com','JiraAdmin@No-Reply.com')
	 */
	public function sendMail($info,$date){
		header("content-type:text/html;charset=utf-8");	
		//$copyto = getCopyTo();
		$copyto= array();
		$tenant = $info['tenantName'];
		$virTualMachine = M('virtual_machine');
		$sql = 'select * from pmo_virtual_machine where tenant="'.$info['tenantName'].'" and date="'.$date.'"';
		$data = $virTualMachine->query($sql);
		
		if($data){
			$to = $info['userEmail'];
			$message = "<table style='width:900;border: 1px solid #666;border-collapse:collapse;'>".
					"<tr style='text-align:center;'>".
					"<th style='width:10%;border: 1px solid #666;'>项目id</th>".
					"<th style='width:15%;border: 1px solid #666;'>项目名称</th>".
					"<th style='width:10%;border: 1px solid #666;'>ip</th>".
					"<th style='width:10%;border: 1px solid #666;'>租户名</th>".
					"<th style='width:10%;border: 1px solid #666;'>区域</th>".
					"<th style='width:5%;border: 1px solid #666;'>cpu</th>".
					"<th style='width:5%;border: 1px solid #666;'>硬盘</th>".
					"<th style='width:5%;border: 1px solid #666;'>内存</th></tr>";
			foreach($data as $k=>$v){
				$message.="<tr style='text-align:center;'>".
						"<td style='width:10%;border: 1px solid #666;'>".trim($v['projectId'])."</td>".
						"<td style='width:15%;border: 1px solid #666;'>".trim($v['projectName'])."</td>".
						"<td style='width:10%;border: 1px solid #666;'>".trim($v['ip'])."</td>".
						"<td style='width:10%;border: 1px solid #666;'>".$tenant."</td>".
						"<td style='width:10%;border: 1px solid #666;'>".trim($v['poolType'])."</td>".
						"<td style='width:5%;border: 1px solid #666;'>".trim($v['cpu'])."</td>".
						"<td style='width:5%;border: 1px solid #666;'>".trim($v['disk'])."</td>".
						"<td style='width:5%;border: 1px solid #666;'>".trim($v['memory'])."</td></tr>";
			}
			$message .="</table>";
			$where['date'] = $date;
			$where['tenant'] = $tenant;

			$totalcpu = M("virtual_machine")->where($where)->sum("cpu");
			if(!$totalcpu){
				$totalcpu = 0;
			}
			$totalmemory = M("virtual_machine")->where($where)->sum("memory");
			if(!$totalmemory){
				$totalmemory = 0;
			}
			$totaldisk = M("virtual_machine")->where($where)->sum("disk");
			if(!$totaldisk){
				$totaldisk = 0;
			}
			$content = "<div style='width:900; border:1px solid red;padding:10px;'>dear".$info['officerName'].":<br/><br/>".
					"&nbsp;&nbsp;&nbsp;&nbsp;3月份您的租户".$tenant."，总计占用cpu<font style='color:red;font-weight:bold;'>".$totalcpu."</font>cores，内存<font style='color:red;font-weight:bold;'>".$totalmemory."</font>GB，磁盘<font style='color:red;font-weight:bold;'>".$totaldisk."</font>GB，对于不再使用的虚拟机请删除以免空占成本，历史占用项目如邮件列表所示，若有变动请登录<a href='10.139.7.217'>PMO系统：</a>".
			         "机器管理->在用虚拟机，选择时间为3月份，更新3月使用机器的项目名称和项目ID（项目名称同报工系统），请在4月10日18:00前完成3月份虚机所在项目自助更新，否则3月资源成本将算入当前所示项目，如有疑问请联系吴辉（18896724614）。<br/><br/>";
			$content.=$message.'</div>';
			import("ORG.Util.PHPMailer.phpmailer");
			$result = newSM($to, $copyto,'虚拟机使用提醒', $content);
		}
	}
	
}
