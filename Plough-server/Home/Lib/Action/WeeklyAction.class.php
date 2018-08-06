<?php

class WeeklyAction extends Action
{
    /**
     * 生成个人的周报
     * 需要传一个日期
     */
    public function personalWeekly($date)
    {
//        $date = '2017-9-6';
        $day = date('w',strtotime($date)); //该周的第几天
        $numWeek = date('W', strtotime($date)); //一年中的第几周
        $weekArr = $this->getWeekDate($day, strtotime($date));
        return $weekArr;
//        var_dump($weekArr);
    }

    protected function getWeekDate($day, $Unixdate)
    {
        $weekArr = array();
        switch($day){
            case 0:
                //星期天
                $weekArr[7] = date('Y-m-d', $Unixdate);
                $times = 1;
                for($i = 6; $i >= 1; --$i){
                    $weekArr[$i] = date('Y-m-d', $Unixdate - (24 * 3600) * $times);
                    $times++;
                }
                $weekArr = array_reverse($weekArr,true);
                break;
            case 1:
                $weekArr[7] = date('Y-m-d', $Unixdate + (24 * 3600) * 6);
                for($i = 1; $i <= 6; ++$i){
                    $weekArr[$i] = date('Y-m-d', $Unixdate + (24 * 3600) * ($i - 1 ));
                }
                break;
            case 2:
                $weekArr[2] = date('Y-m-d', $Unixdate);
                $weekArr[1] = date('Y-m-d', $Unixdate - 24 * 3600);
                $weekArr[7] = date('Y-m-d', $Unixdate + 24 * 3600 * 5);
                for($i = 3; $i <= 6; ++$i){
                    $weekArr[$i] = date('Y-m-d', $Unixdate + 24 * 3600 * ($i - 2));
                }
                break;
            case 3:
                $weekArr[1] = date('Y-m-d', $Unixdate - 24 * 3600 * 2);
                $weekArr[2] = date('Y-m-d', $Unixdate - 24 * 3600 * 1);
                $weekArr[3] = date('Y-m-d', $Unixdate );
                $weekArr[4] = date('Y-m-d', $Unixdate + 24 * 3600);
                $weekArr[5] = date('Y-m-d', $Unixdate + 24 * 3600 * 2);
                $weekArr[6] = date('Y-m-d', $Unixdate + 24 * 3600 * 3);
                $weekArr[7] = date('Y-m-d', $Unixdate + 24 * 3600 * 4);
                break;
            case 4:
                $weekArr[4] = date('Y-m-d', $Unixdate);
                for($i = 1; $i < 4; ++$i) {
                    $weekArr[$i] = date('Y-m-d', $Unixdate - 24 * 3600 * (4 - $i));
                }
                for($j = 5; $j <=6; ++$j){
                    $weekArr[$j] = date('Y-m-d', $Unixdate + 24 * 3600 * ($j - 4));
                }
                $weekArr[7] = date('Y-m-d', $Unixdate + 24 * 3600 * 3);
                break;
            case 5:
                $weekArr[5] = date('Y-m-d', $Unixdate);
                for($i = 1; $i <=4; ++$i){
                    $weekArr[$i] = date('Y-m-d', $Unixdate - 24 * 3600 * (5 - $i));
                }
                $weekArr[6] = date('Y-m-d', $Unixdate + 24 * 3600);
                $weekArr[7] = date('Y-m-d', $Unixdate + 24 * 3600 * 2);
                break;
            case 6:
                $weekArr[6] = date('Y-m-d', $Unixdate);
                for($i = 1; $i <= 5; ++$i){
                    $weekArr[$i] = date('Y-m-d', $Unixdate - 24 * 3600 * (6 - $i));
                }
                $weekArr[7] = date('Y-m-d', $Unixdate + 24 * 3600);
                break;
        }
        return $weekArr;
    }

    /**
     * 获取个人一周的填报情况
     */
    public function getWeekly()
    {
        $left_time = '2017-9-4';
        $right_time = '2017-9-10';
        $userName = session('userName');
        $where['date'] = array('between',array($left_time, $right_time));
        $where['workerName'] = $userName;
        $jobTime = M('job_time')->where($where)->select();
        $weeklyTime = array();
        foreach($jobTime as $key => $record){
            $flag = 1;
            foreach($weeklyTime as $k => &$item){
                if($item['projectName'] == $record['projectName'] && $item['workType'] == $record['workType']){
                    //说明是同项目同工作类型 判断工作内容
                    if(!($item['workDetail'] == $record['workDetail'])){
                        $item['workDetail'] .= ',' . $record['workDetail'];
                    }
                    $item['workTime'] += $record['workTime'];
                    $flag = 0;
                    break;
                }
            }
            unset($item);
            if($flag){
               //该项目种类还不存在weeklyTime
                unset($record['id']);
                unset($record['date']);
                unset($record['isAudit']);
                $weeklyTime[] = $record;
            }
        }
//        echo json_encode($weeklyTime);
        return $weeklyTime;
    }
}