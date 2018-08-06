<?php

class MailAction extends Action
{
	
    /**
     *通报上周工时未填满
     */
    public function sendMailToNoFill()
    {
        set_time_limit(0);
        $date = time();
        $Odate = date('Y-m-d', $date - 72 * 3600);
        //获取那周
        $weekly = new WeeklyAction();
        $week = $weekly->personalWeekly($Odate);
        $where['userTeam'] = array('like', '大数据产品部%');
        $users = M('user_info')->where($where)->select();
        
        //遍历每个人 将那周的填报情况统计
        import("ORG.Util.PHPMailer.phpmailer");
        $whiteArr = getWhiteName();
        $blackArr = array();
        foreach ($users as $key => $user) {
            if (in_array($user['userName'], $whiteArr)) {
                continue;
            }
            $j_where['workerName'] = $user['userName'];
            $j_where['date'] = array('between', array($week[1], $week[5]));
            $res = M('job_time')->where($j_where)->select();
            //结算那周的工时
            $totalTime = 0;
            foreach ($res as $k => $jobTime) {
                if ($jobTime['workTime'] > 8) {
                    $jobTime['workTime'] = 8;
                }
                $totalTime += $jobTime['workTime'];
            }
            $per = floor($totalTime / 40) * 100 . '%';

            $averTime = floor($totalTime / 5);
            if ($averTime < 8) {
                //未填满 发送邮件提醒
                $content = '';
                $str = "<h1>Dear {$user['userName']}:</h1><br>您{$week[1]}~{$week[5]}的报工未填满,请您登陆部门自助报工系统填写工作记录"
                ."<h5>注意，工时需按周填报并导入战计部系统，看到此邮件后请尽快完成填报。</h5>";		
                $content .= $str . '  登陆内网，点击<a href="http://10.139.17.40/" target="_blank">此链接</a>前往。';
                $blackArr[$user['id']]['user'] = $user['userName'];
                $blackArr[$user['id']]['per'] = $per;
               // var_dump($content);exit;
                $result = SM($user['userEmail'], 'PMO报工管理系统报工提醒', $content);
            }
        }
        //一周情况
        $cont = '<table>';
        foreach ($blackArr as $key => $black) {
            $cont .= '<tr><td>' . $black['user'] . '</td><td>' . $black['per'] . '</td></tr>';
        }
        $cont .= '</table>';
        SM(C('ADMIN_USER_EMAIL'), $week[1] . '~' . $week[5] . '一周报工未满情况统计', $cont);
        $logs = M('logs_info');
        $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':一周报工未满情况统计'. $cont;
        $logs->add($logsData);

    }

    /**
     * 物理机到期提醒
     * 近期待归还(两周内)
     * @param type=1 近期待归还
     * @param type=2 已逾期
     *
     */
    public function sendMailToComputerExpired(){
        header("content-type:text/html;charset=utf-8"); 
        $copyto= array('wuhui@cmss.chinamobile.com');//抄送
        $nowdate = date("Y-m-d 00:00:00");
        if( $_GET['type'] == 1) {
            $beforeDays = date("Y-m-d",strtotime("+2 week"));
            $where = "endTime<'{$beforeDays}' and endTime>'{$nowdate}'";
        }else{
            $where = "endTime<'{$nowdate}'";
        }
        $sql = "select a.*,b.userName from pmo_computer_info a left join pmo_user_info b on a.userEmail=b.userEmail where ".$where." and a.isDelete=1 group by a.userEmail";
        $data = M()->query($sql);
        if(!empty($data)){
            foreach($data as $key=>$value){
                $to = $value['userEmail'];
                $computers = M("computer_info")->where($where." and isDelete=1 and userEmail='{$value['userEmail']}'")->select();
                $message = "<table style='width:900;border: 1px solid #666;border-collapse:collapse;'>".
                                "<tr style='text-align:center;'>".
                                    "<th style='width:10%;border: 1px solid #666;'>ip</th>".
                                    "<th style='width:10%;border: 1px solid #666;'>管理口IP</th>".
                                    "<th style='width:10%;border: 1px solid #666;'>申请时间</th>".
                                    "<th style='width:10%;border: 1px solid #666;'>约定归还时间</th>".
                                    "<th style='width:5%;border: 1px solid #666;'>用途说明</th>".
                                "</tr>";
                foreach($computers as $k=>$v){
                    $message.=  "<tr style='text-align:center;'>".
                                    "<td style='width:10%;border: 1px solid #666;'>".$v['ip']."</td>".
                                    "<td style='width:15%;border: 1px solid #666;'>".$v['mIp']."</td>".
                                    "<td style='width:10%;border: 1px solid #666;'>".$v['startTime']."</td>".
                                    "<td style='width:10%;border: 1px solid #666;'>".$v['endTime']."</td>".
                                    "<td style='width:20%;border: 1px solid #666;'>".$v['useDetail']."</td>".
                                "</tr>";
                }
                $message .= "</table>";
                if($_GET['type'] == 1){
                    $content = "<div style='width:900; border:1px solid red;padding:10px;'>dear".$value['userName'].":<br/><br/>".
                        "&nbsp;&nbsp;&nbsp;&nbsp;您租借的物理机即将到期,请注意归还,如需续用请提交续用申请,如有疑问请联系吴辉（18896724614）。<br/><br/>";
                    $content .= $message.'</div>';
                }else{
                    $content = "<div style='width:900; border:1px solid red;padding:10px;'>dear".$value['userName'].":<br/><br/>".
                        "&nbsp;&nbsp;&nbsp;&nbsp;您租借的物理机已经过期,请尽快归还,如需续用请提交续用申请,如有疑问请联系吴辉（18896724614）。<br/><br/>";
                    $content .= $message.'</div>';
                }
                import("ORG.Util.PHPMailer.phpmailer");
                $result = newSM($to, $copyto,'物理机到期提醒', $content);
            }
        }
    }

}