<?php
/**
 * 获取15天前日期
 * @return multitype:number unknown
 */

function setDay(){
	$year = date('Y', strtotime('-15 days'));
	$month = date('m', strtotime('-15 days'));
	$day = date('d', strtotime('-15 days'));
	return array(
			'year'=>$year,
			'month'=>$month,
			'startDay' => $day, //SMTP HOST
			'dayCount' => 15, //SMTP username
	);

}

/**
 * excel表格列名
 * @return array
 */
function get_excel_cell()
{
    return array(
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        'AA',
        'AB',
        'AC',
        'AD',
        'AE',
        'AF',
        'AG',
        'AH',
        'AI',
        'AJ',
        'AK',
        'AL',
        'AM',
        'AN',
        'AO',
        'AP',
        'AQ',
        'AR',
        'AS',
        'AT',
        'AU',
        'AV',
        'AW',
        'AX',
        'AY',
        'AZ',
    );
}

/**
 * 邮件抄送
 */
function getCopyTo(){
	return array(
		'wuhui@cmss.chinamobile.com'
	);
}


/**
 * 项目信息对照表
 */

function getRealName($id,$name){
	$prjects = array(
			'Y2017DP011'=>'ETL数据处理系统',	
			'Y2017DP006'=>'大云日志管理系统',
			'Y2017DP003'=>'大云流计算系统',
			'Y2017TP999'=>'大数据产品部部门工时',
			'Y2017DP004'=>'大数据套件',
			'Y2017DP015'=>'大数据平台',
			'Y2017DM001'=>'大数据情报分析商业报告服务',
			'Y2017DP019'=>'大数据服务开放平台',
			'Y2017DP009'=>'大数据运维平台',
			'Y2017DP005'=>'大数据运营管理中心',
			'Y2017DP018'=>'安全漏洞扫描平台',
			'Y2017DP001'=>'并行数据库系统',
			'Y2017DP014'=>'并行数据挖掘系统',
			'Y2017DP012'=>'弹性大数据',
			'Y2017DP013'=>'情报分析系统',
			'Y2017DP002'=>'搜索引擎',
			'Y2017DP010'=>'数据可视化平台',
			'Y2017DP008'=>'数据采集系统',
			'Y2017DP007'=>'深度学习',
			'Y2017DP017'=>'知识管理平台',
			'Y2017DM002'=>'移动大数据分析算法模型库和挖掘服务',
			'Y2017DP016'=>'运维问答助手',
			'C201785-004'=>'咪咕互娱2017年异常用户行为支撑项目',
			'C201785-039'=>'互联网公司能力部大数据运营管理平台'
	);
	if($prjects[$id]){
		return $prjects[$id];
	}else{
		return $name;
	}
	
	
}



/**
 * 格式化的目前时间
 * @return false|string
 */
function get_time2file()
{
    return date( 'YmdHis', time() );
}

/**
 * 工时excel填充列名
 * @return array
 */
function jobtime_map()
{
    return array( 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AV', 'AW', 'AX', 'AY', 'AZ' );
}

/**
 * 语义化一周
 * @return array
 */
function week_array()
{
    return array( "日", "一", "二", "三", "四", "五", "六" );
}

/**
 * 比大小
 * @param $a
 * @param $b
 * @return int
 */
function num_check( $a, $b )
{
    if( $a['day'] == $b['day'] ) {
        return 0;
    }

    return ( $a['day'] < $b['day'] ) ? -1 : 1;
}

/**
 * 日期标准
 * @return array
 */
function key_day()
{
    return array( '1' => '01', '2' => '02', '3' => '03', '4' => '04', '5' => '05', '6' => '06', '7' => '07', '8' => '08', '9' => '09' );
}

/**
 * 递归删除文件夹
 * @param $path
 * @return bool
 */
function deep_rmdir( $path )
{
    $handle = opendir( $path );
    while( false !== ( $filename = readdir( $handle ) ) ) {
        if( '.' == $filename || '..' == $filename ) continue;

        if( is_dir( $path . $filename ) ) {
            deep_rmdir( $path . $filename . '/' );
        }else {
            unlink( $path . $filename );
        }
    }
    closedir( $handle );

    return rmdir( $path );
}

/**
 * 发送邮件
 * @param        $to
 * @param string $subject
 * @param string $body
 * @param array  $attachment
 * @return string
 */
function SM( $to, $subject = '', $body = '', $attachment = array() )
{
    $mail = new PHPMailer;
    $mail->IsSMTP();// 采用SMTP

    // 邮件服务器信息
//    $mail->Host = "mail.wx.bigcloudsys.com";// SMTP 服务器主机
    $mail->Host = C( 'SMTP_HOST' );// SMTP 服务器主机
    $mail->SMTPAuth = true;           // turn on SMTP authentication
//    $mail->Username = 'sybigdatapmo@wx.bigcloudsys.com';     // SMTP username，普通邮件认证不需要加 @域名
    $mail->Username = C( 'SMTP_NAME' );     // SMTP username，普通邮件认证不需要加 @域名
//    $mail->Password = 'Qwer@1234'; // SMTP 授权码
    $mail->Password = C( 'SMTP_PSSWD' ); // SMTP 授权码
    // 发件人信息，登录邮件服务器的账号保持一致。
//    $mail->From = 'sybigdatapmo@wx.bigcloudsys.com';      // 发件人邮箱
    $mail->From = C( 'SMTP_USER' );      // 发件人邮箱
    $mail->FromName = 'pmo';  // 发件人

    // 收件人的信息，收件人可以存在多个
    $mail->AddAddress( $to, '' );  // 收件人邮箱和姓名

    // 回复地址
    //$mail->AddReplyTo("yourmail@yourdomain.com","yourdomain.com"); // 回复地址

    // 邮件信息
    $mail->CharSet = "UTF-8";
    // $mail->Encoding = "base64";
    $mail->IsHTML( true );  // send as HTML
    $mail->Subject = $subject;   //邮件主题
    // 邮件内容
    $mail->Body = $body;
    foreach( $attachment as $key => $value ) {
        $mail->AddAttachment( $value ); // attachment 附件
    }
    // 发送邮件
    $result = $mail->send();
    $mail->SmtpClose();
    if( $result ) {
        return '邮件发送成功';
    }else {
        return '邮件发送失败' . $mail->ErrorInfo;
    }
}

/**
 * 邮件白名单
 * @return array
 */
function getWhiteName()
{
    return array(
        '庞哲翀',
        '齐骥',
        '赵立芬',
    	'方云',
    	'张红',
    	'陈佳瑜',
    	'孙维亚',
    	'朱明明',
    	'石在辉'	
    );
}

/**
 * 判断是否为白名单
 */
function isWhitePeople($userName){
	$whitePeople = array(
        '庞哲翀',
        '齐骥',
        '赵立芬',
    	'方云',
    	'张红',
    	'陈佳瑜',
		'孙维亚',
		'朱明明',
		'石在辉'
    );
	if(in_array($userName,$whitePeople)){
		return true;
	}else{
		return false;
	}
}


/**
 * 获取所在大组
 */
function getBigTeamLeader($userName){
	if($userName){
		//获取所在小组
		$user = M ( 'user_info' );
		$where['userName'] = $userName;
		$userInfo = $user->where($where)->select();
		$whereTeam['teamName'] = $userInfo[0]['userTeam'];
		//获取所在大组
		$teams = M('teams');
		$teamInfo = $teams->where($whereTeam)->select();
		return $teamInfo[0]['bigTeamLeader'];
	}else{
		return false;
	}	
}

/**
 * 是否为平台组
 */
function isPlatformUser($userName){
	$bigTeamLeader = getBigTeamLeader($userName);
	if($bigTeamLeader){
		if($bigTeamLeader == '王宝晗'){
			return true;
		}else{
			return false;
		}
	}
}



/**
 * 获取工作类型
 */
function getWorkType($workType){
	if($workType == '1'){
		return '项目管理';
	}elseif($workType == '2'){
		return '售前(方案)';
	}elseif($workType =='3'){
		return '售前(方案)';
	}elseif($workType == '4'||$workType == '5'||$workType == '6'||$workType =='15'){
		return '开发';
	}elseif($workType=='7'){
		return '测试';
	}elseif($workType=='8'){
		return '部署交付(实施)';
	}elseif($workType=='9'){
		return '售后(运维)';
	}elseif($workType =='14'){
		return '请假';
	}else{
		return '售后(运维)';
	}
	
	
}


/**
 * 雇员数据库字段对照表
 * @return array
 */
function get_employee_map()
{
     return array (
        array (
            'employeeId',
            '序号'
        ),
        array (
            'employeeName',
            '姓名'
        ),
        array (
            'employeeCompany',
            '厂商'
        ),
        array (
            'getInTime',
            '入职时间'
        ),
        array (
            'level',
            '入职级别'
        ),
        array (
            'workType',
            '岗位类型'
        ),
        array (
            'location',
            '驻地'
        ),
        array (
            'phoneNum',
            '联系电话'
        ),
        array (
            'locatedTeam',
            '所在项目组组名'
        ),
        array (
            'teamLeader',
            '组长'
        ),
        array (
            'bigTeamLeader',
            '大组长'
        ),
        array (
            'email',
            '邮箱'
        ),
        array (
            'detail',
            '备注'
        ),
    );
}

/**
 * 获取节假日
 */
function get_holiady()
{
    return array(
        '20170101', //元旦
        '20170102',
        '20170127', //春节
        '20170128',
        '20170129',
        '20170130',
        '20170131',
        '20170201',
        '20170202',
        '20170403', //清明
        '20170404',
        '20170501', //劳动
        '20170529', //端午
        '20170530',
        '20171001', //国庆
        '20171002',
        '20171003',
        '20171004',
        '20171005',
        '20171006',
        '20171007',
        
        '20180101', //元旦
        '20180215', //春节
        '20180216',
        '20180217',
        '20180218',
        '20180219',
        '20180220',
        '20180221',
        '20180405', //清明
        '20180406',
        '20180430', //劳动
        '20180501', 
        '20180618', //端午
        '20180924', //中秋
        '20181001', //国庆
        '20181002',
        '20181003',
        '20181004',
        '20181005',
        '20181006',
        '20181007',
    );
}

/**
 * 
 * @param string 导出excl名称
 * @param array 导出excl表头
 * @param array  导出excl表体内容
 */
function exportExcel($expTitle, $expCellName, $expTableData) {
	import ( "ORG.Util.PHPExcel" );
	$xlsTitle = iconv ( 'utf-8', 'gb2312', $expTitle ); // 文件名称
	$cellNum = count ( $expCellName );
	$dataNum = count ( $expTableData );
	$objPHPExcel = new PHPExcel ();
	$cellName = array (
			'A',
			'B',
			'C',
			'D',
			'E',
			'F',
			'G',
			'H',
			'I',
			'J',
			'K',
			'L',
			'M',
			'N',
			'O',
			'P',
			'Q',
			'R',
			'S',
			'T',
			'U',
			'V',
			'W',
			'X',
			'Y',
			'Z',
			'AA',
			'AB',
			'AC',
			'AD',
			'AE',
			'AF',
			'AG',
			'AH',
			'AI',
			'AJ',
			'AK',
			'AL',
			'AM',
			'AN',
			'AO',
			'AP',
			'AQ',
			'AR',
			'AS',
			'AT',
			'AU',
			'AV',
			'AW',
			'AX',
			'AY',
			'AZ'
	);
	$fillColor = array('A' => '0066D9FF', 'B' => '008ED0A9', 'C' => '0084B0F4', 'D' => '00DCBA95', 'E' => '00CCCCCC', 'F' => '00EDEDED', 'G' => '001159C6', 'H' => '00D6E4FC');
	$styleArray = array(
			'borders' => array(
					'allborders' => array(
							'style' => PHPExcel_Style_Border::BORDER_THIN,//细边框
					),
			),
	);
	$objPHPExcel->getDefaultStyle()->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_LEFT);
	$objPHPExcel->getActiveSheet ( 0 )->mergeCells ( 'A1:' . $cellName [$cellNum - 1] . '1' ); // 合并单元格
	$objPHPExcel->getActiveSheet()->getStyle('A1')->getAlignment()->setHorizontal(PHPExcel_Style_Alignment::HORIZONTAL_CENTER);
	$objPHPExcel->setActiveSheetIndex(0)->setCellValue('A1', $expTitle.' Export time:'.date('Y-m-d H:i:s'));
	$objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
	$objPHPExcel->getDefaultStyle()->getFont()->setSize(9);
	for($i = 0; $i < $cellNum; $i ++) {
		$objPHPExcel->setActiveSheetIndex ( 0 )->setCellValue ( $cellName [$i] . '2', $expCellName [$i] [1] );
		if($cellName[$i] == 'A'){
			$objPHPExcel->getActiveSheet()->getColumnDimension($cellName [$i])->setWidth(10);
		}elseif($cellName[$i] == 'D'){
			$objPHPExcel->getActiveSheet()->getColumnDimension($cellName [$i])->setWidth(15);
		}elseif($cellName[$i] == 'G'){
			$objPHPExcel->getActiveSheet()->getStyle($cellName[$i])->getAlignment()->setWrapText(true);
			$objPHPExcel->getActiveSheet()->getColumnDimension($cellName [$i])->setWidth(30);
		}else{
			$objPHPExcel->getActiveSheet()->getColumnDimension($cellName [$i])->setWidth(20);
		}
		$objPHPExcel->getActiveSheet()->getStyle($cellName [$i] . '2')->getFill()->setFillType(PHPExcel_Style_Fill::FILL_SOLID);
		$objPHPExcel->getActiveSheet()->getStyle($cellName [$i] . '2')->getFill()->getStartColor()->setARGB('0066D9FF');
	}
	for($i = 0; $i < $dataNum; $i ++) {
		for($j = 0; $j < $cellNum; $j ++) {
			$objPHPExcel->getActiveSheet ( 0 )->setCellValue ( $cellName [$j] . ($i + 3), $expTableData [$i] [$expCellName [$j] [0]] );
		}
	}
	$objPHPExcel->getActiveSheet()->getStyle( 'A2:' . $cellName [$j-1] . ($i + 2))->applyFromArray($styleArray);
	header ( 'pragma:public' );
	header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="' . $xlsTitle . '.xls"' );
	header ( 'Content-Disposition:attachment;filename="'. $xlsTitle .'.xls"' ); // attachment新窗口打印inline本窗口打印
	$objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
	$objWriter->save ( 'php://output' );
	exit ();
}

/**
 * 获取特殊工作日
 */
function get_special_workday()
{
    return array(
        '20170122',
        '20170204',
        '20170401',
        '20170527',
        '20170930',
        '20180211',
        '20180224',
        '20180408',
        '20180428',
        '20180929',
        '20180930',
    );
}

function curl_post($url,$data=null){
	$curl = curl_init();
	curl_setopt($curl, CURLOPT_URL, $url);
	curl_setopt($curl, CURLOPT_HEADER, 0);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($curl, CURLOPT_POST, 1);
	curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
	$pdata = curl_exec($curl);
	curl_close($curl);
	$arr = json_decode($pdata,true);
	return $arr;
}

/**
 * 发送邮件
 * @param        $to
 * @param string $subject
 * @param string $body
 * @param array  $attachment
 * @return string
 */
function newSM( $to, $copyto = '', $subject = '', $body = '', $attachment = array() )
{
	$mail = new PHPMailer;
	$mail->IsSMTP();// 采用SMTP
	$mail->Host = C( 'SMTP_HOST' );// SMTP 服务器主机
	$mail->SMTPAuth = true;           // turn on SMTP authentication
	//    $mail->Username = 'sybigdatapmo@wx.bigcloudsys.com';     // SMTP username，普通邮件认证不需要加 @域名
	$mail->Username = C( 'SMTP_NAME' );     // SMTP username，普通邮件认证不需要加 @域名
	//    $mail->Password = 'Qwer@1234'; // SMTP 授权码
	$mail->Password = C( 'SMTP_PSSWD' ); // SMTP 授权码
	$mail->From = C( 'SMTP_USER' );      // 发件人邮箱
	$mail->FromName = 'pmo';  // 发件人
	$mail->AddAddress( $to, '' );  // 收件人邮箱和姓名
	//$mail->addCC('hmshenf@isoftstone.com');
	if($copyto){
		foreach($copyto as $value){
			$mail->addCC($value);   //添加抄送人
		}
	}

	// 邮件信息
	$mail->CharSet = "UTF-8";
    $mail->Encoding = "base64";
	$mail->IsHTML( true );  // send as HTML
	$mail->Subject = $subject;   //邮件主题
	// 邮件内容
	$mail->Body = $body;
	foreach( $attachment as $key => $value ) {
		$mail->AddAttachment( $value ); // attachment 附件
	}
	// 发送邮件
	$result = $mail->send();
	$mail->SmtpClose();
	if( $result ) {
		return '邮件发送成功';
	}else {
		return '邮件发送失败' . $mail->ErrorInfo;
	}
}

function getBigTeams(){
	return array(
			'PMO',
			'平台组',
			'白金组',
			'UDS',
			'数据智能',
			'方案1组',
			'方案2组',
			'方案3组',
			'方案4组',
			'方案5组'
	);
}

/**
 *
 * @param string 导出excl名称
 * @param array 导出excl表头
 * @param array  导出excl表体内容
 */
function exportMultiSheetExcel($expTitle, $sheetNames, $summery='', $expCellNames, $expTableData) {
	set_time_limit(0);
	import ( "ORG.Util.PHPExcel" );
	$xlsTitle = iconv ( 'utf-8', 'gb2312', $expTitle ); // 文件名称
	$objPHPExcel = new PHPExcel ();
	$cellName = get_excel_cell();
	$fillColor = array('A' => '0066D9FF', 'B' => '008ED0A9', 'C' => '0084B0F4', 'D' => '00DCBA95', 'E' => '00CCCCCC', 'F' => '00EDEDED', 'G' => '001159C6', 'H' => '00D6E4FC');
	$styleArray = array(
			'borders' => array(
					'allborders' => array(
							'style' => PHPExcel_Style_Border::BORDER_THIN,//细边框
					),
			),
	);
	foreach($expTableData as $key=>$value){
		$objPHPExcel->createSheet();
		$objPHPExcel->setActiveSheetIndex($key);
		$objPHPExcel->getActiveSheet()->setTitle($sheetNames[$key]);
		$objPHPExcel->getDefaultStyle()->getFont()->setName('等线');
		$objPHPExcel->getDefaultStyle()->getFont()->setSize(9);
		if($summery){
			$objPHPExcel->getActiveSheet()->setCellValue("A1", $summery[$key]);
		}
		$cellNum = count ( $expCellNames[$key] );
		$dataNum = count ( $expTableData[$key] );

		for($i = 0; $i < $cellNum; $i ++) {
			$objPHPExcel->setActiveSheetIndex ( $key )->setCellValue ( $cellName [$i] . '2', $expCellNames[$key] [$i] [1] );
			if($cellName[$i] == 'A'){
				$objPHPExcel->getActiveSheet()->getColumnDimension($cellName [$i])->setWidth(40);
			}elseif($cellName[$i] == 'D'){
				$objPHPExcel->getActiveSheet()->getColumnDimension($cellName [$i])->setWidth(15);
			}elseif($cellName[$i] == 'G'){
				$objPHPExcel->getActiveSheet()->getStyle($cellName[$i])->getAlignment()->setWrapText(true);
				$objPHPExcel->getActiveSheet()->getColumnDimension($cellName [$i])->setWidth(30);
			}else{
				$objPHPExcel->getActiveSheet()->getColumnDimension($cellName [$i])->setWidth(20);
			}
			$objPHPExcel->getActiveSheet()->getStyle($cellName [$i] . '2')->getFill()->setFillType(PHPExcel_Style_Fill::FILL_SOLID);
			$objPHPExcel->getActiveSheet()->getStyle($cellName [$i] . '2')->getFill()->getStartColor()->setARGB('0066D9FF');
		}
		for($i = 0; $i < $dataNum; $i ++) {
			for($j = 0; $j < $cellNum; $j ++) {
				$objPHPExcel->getActiveSheet ( $key )->setCellValue ( $cellName [$j] . ($i + 3), $expTableData[$key] [$i] [$expCellNames[$key] [$j] [0]] );
			}
		}
		$objPHPExcel->getActiveSheet()->getStyle( 'A2:' . $cellName [$j-1] . ($i + 2))->applyFromArray($styleArray);
	}
	header ( 'pragma:public' );
	header ( 'Content-type:application/vnd.ms-excel;charset=utf-8;name="' . $xlsTitle . '.xls"' );
	header ( 'Content-Disposition:attachment;filename="'. $xlsTitle .'.xls"' ); // attachment新窗口打印inline本窗口打印
	$objWriter = PHPExcel_IOFactory::createWriter ( $objPHPExcel, 'Excel5' );
	$objWriter->save ( 'php://output' );
	exit ();
}

function getNewWorkType(){
	return array(
			'项目管理',
			'售前',
			'售前支撑',
			'需求调研',
			'UIUE',
			'开发',
			'测试',
			'实施、部署',
			'售后服务',
			'售后服务支撑',
			'CICD',
			'综合管理',
			'培训与文档',
			'请假',
			'产品设计',
			'需求分析'
	);
}
/**
 * 虚拟机成本计算
 * @param $cpus cpu
 * @param $memorys 内存
 * @param $disks 硬盘数
 */
function getVirtualCost( $cpus, $memorys ,$disks){
	$cpuPrice  = 26.89;
	$memorysPrice  = 10.27;
	$diskPrice  = 0.02;
	return $cpus * $cpuPrice + $memorysPrice * $memorys + $diskPrice * $disks;
}

function getComputerCost($standardNum ,$p40Num ){
	if(is_numeric($standardNum) && is_numeric($p40Num)){
		$standardPrice = 2302.98;
		$p40NumPrice = 6151.29;
		return $standardPrice * $standardNum + $p40Num * $p40NumPrice;
	}else{
		return "数据类型有误";
	}
}

