<?php
return array(
	//'配置项'=>'配置值'
	'URL_PATHINFO_DEPR'=>'/',
    
		
	'TMPL_L_DELIM'=>'<{',
	'TMPL_R_DELIM'=>'}>',
	
		
	'DB_NAME'=>'pmo_manager',
	'DB_TYPE'=>'mysql',
	'DB_USER'=>'root',
	'DB_PWD'=>'qwe123',
	'DB_HOST'=>'localhost',
	'DB_PORT'=>'3306',
	'DB_PREFIX'=>'pmo_',

	'DB_CONFIG2'=>array(
	/* 数据库设置 */
		'DB_NAME'=>'zabbix',
		'DB_TYPE'=>'mysql',
		'DB_USER'=>'bd',
		'DB_PWD'=>'bd123!@#',
		//'DB_HOST'=>'10.254.10.114',
		'DB_HOST'=>'10.142.20.114',
			
		'DB_PORT'=>'3306',
	),
	'DB_CONFIG1'=>array(
			'DB_NAME'=>'pmo_manager',
			'DB_TYPE'=>'mysql',
			'DB_USER'=>'root',
			'DB_PWD'=>'qwe123',
			'DB_HOST'=>'localhost',
			'DB_PORT'=>'3306',
			'DB_PREFIX'=>'pmo_',
	),
	
		
		
	'SHOW_PAGE_TRACE'=>true,
		
	'URL_CASE_INSENSTIVE'=>true,
	'URL_HTML_SUFFIX'=>'html|tpl',

	'URL_ROUTER_ON'=>true,
	'URL_ROUTE_RULES'=>Array(
	'/^dashbord\-machine$/'=>'Index/index',
	'/^used\-machine$/'=>'Index/index',
	'/^left\-machine$/'=>'Index/index',
	'/^login$/'=>'Index/index',
	'/^operate\-logs$/'=>'Index/index',		
	'/^puser\-manage$/'=>'Index/index',
	'/^pbug\-eperate$/'=>'Index/index',
	'/^projects$/'=>'Index/index',
	'/^complain$/'=>'Index/index',
	'/^new\-project$/'=>'Index/index',
	'/^jobtime\-write$/'=>'Index/index',
	'/^person\-info$/'=>'Index/index',
	'/^job\-time\-weekday$/'=>'Index/index',
	'/^worktime\-check$/'=>'Index/index',
	'/^used\-employee$/'=>'Index/index',
	'/^employer\-score$/'=>'Index/index',
	'/^employee\-dashboard$/'=>'Index/index',
	'/^employee\-apply$/'=>'Index/index',
	'/^left\-employee$/'=>'Index/index',
	'/^computer\-monitor$/'=>'Index/index',
	'/^pteam\-manage$/'=>'Index/index',
	'/^virtual\-machine\/used\-vitual$/'=>'Index/index',
	'/^virtual\-machine\/user$/'=>'Index/index',	
	'/^project\/more$/'=>'Index/index',
	'/^project\/add$/'=>'Index/index',
	'/^recruit\/demand\-list$/'=>'Index/index',	
	'/^project\/change\-history$/'=>'Index/index',
	'/^project\/project\-change\-history$/'=>'Index/index',
			
	),
	'LOAD_EXT_CONFIG' => 'mail',
);
?>