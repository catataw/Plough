<?php

/**
 * Created by PhpStorm.
 * User: dhj
 * Date: 2018/6/7
 * Time: 10:35
 * Description: 项目里程碑
 */
class ProjectMailstoneProgressAction extends Action
{
    /**
     * 添加项目里程碑
     */
    public function addMailStone(){
        $_rexp = array (
            'relatedId'=>'/^[0-9]+$/',
            'weight'=>'/^((100$|^(\d|[1-9]\d))?)?$/',
            'planFinishedTime'=>'/^(([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/',
            'actualFinishedTime'=>'/^(([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/'
        );
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }
        // 验证通过
        $mailstone = M('project_mailstone_progress');
        if($mailstone->add($data)) {
            $projects = M('projects');
            $latest = $mailstone->where('relatedId='.$data['relatedId'])->order('id desc')->limit(1)->select();
            $tempData = array(
                'mailstoneName' => $latest[0]['mailstoneName'],
                'planFinishedTime' => $latest[0]['planFinishedTime'],
            );
            $result = $projects->where('id=' . $data['relatedId'])->save($tempData);
            if ($result){
                $projectName = $projects->where('id=' . $data['relatedId'])->field('projectName')->select();
                $logs = M('logs_info');
                $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '添加项目(' . $projectName[0]['projectName'] . ")里程碑信息";
                $logs->add($logsData);
            }
            $this->ajaxReturn(array(), '添加成功', 1);
        }else{
            $this->ajaxReturn(array(), '添加失败', 0);
        }
    }

    /**
     * 编辑项目里程碑
     */
    public function editMailStone(){
        $_rexp = array (
            'relatedId'=>'/^[0-9]+$/',
            'weight'=>'/^((100$|^(\d|[1-9]\d))?)?$/',
            'planFinishedTime'=>'/^(([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/',
            'actualFinishedTime'=>'/^(([1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]))?)?$/'
        );
        $postData = file_get_contents ( "php://input" );
        $data = json_decode ( htmlspecialchars_decode ( $postData ), TRUE );
        foreach($_rexp as $key => $value){
            if(!preg_match($value, $data[$key])){
                $this->ajaxReturn(array(),$key.'参数错误' , 0);
            }
        }
        // 验证通过
        $mailstone = M('project_mailstone_progress');
        $where ['relatedId'] = $data['relatedId'];
        $where ['id'] = $data['id'];
        if($mailstone->where($where)->save($data)){
            $projects = M('projects');
            $latest = $mailstone->where('relatedId='.$data['relatedId'])->order('id desc')->limit(1)->select();
            $tempData = array(
                'mailstoneName' => $latest[0]['mailstoneName'],
                'planFinishedTime' => $latest[0]['planFinishedTime'],
            );
            $result = $projects->where('id=' . $data['relatedId'])->save($tempData);
            if ($result){
                $projectName = $projects->where('id=' . $data['relatedId'])->field('projectName')->select();
                $logs = M('logs_info');
                $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '修改项目(' . $projectName[0]['projectName'] . ")里程碑信息";
                $logs->add($logsData);
            }
            $this->ajaxReturn(array(),'修改成功',1);
        }else{
            $this->ajaxReturn(array(),'修改失败',0);
        }
    }

    /**
     * 删除项目里程碑
     */
    public function deleteMailStone($id){
        $mailstone = M('project_mailstone_progress');
        $relatedId = $mailstone->where('id='.$id)->field("relatedId")->select();
        if($mailstone->where('id='.$id)->delete()){
            //子表同步至主表
            $latestMailStone = $mailstone->where('relatedId='.$relatedId[0]['relatedId'])->order('id desc')->limit(1)->select();
            $LatestMailData = array(
                'mailstoneName' => $latestMailStone[0]['mailstoneName'],
                'planFinishedTime' => $latestMailStone[0]['planFinishedTime'],
            );
            $projects = M('projects');
            $projects->where('id='.$latestMailStone[0]['relatedId'])->save($LatestMailData);
            //保存日志
            $projectName = $projects->where('id=' . $id)->field('projectName')->select();
            $logs = M('logs_info');
            $logsData ['logDetail'] = date('Y-m-d H:i:s') . ':' . session('userName') . '删除项目(' . $projectName[0]['projectName'] . ")里程碑信息";
            $logs->add($logsData);
            $this->ajaxReturn(array(),'删除成功', 1);
        }else{
            $this->ajaxReturn(array(),'删除失败', 0);
        }
    }

    /**
     * 获取项目里程碑
     */
    public function getMailStone($id){
        $mailstone = M('project_mailstone_progress');
        $data = $mailstone->where('relatedId='.$id)->order('planFinishedTime')->select();
        if($data !== false){
            $this->ajaxReturn($data,'获取成功', 1);
        }else{
            $this->ajaxReturn(array(),'获取失败', 0);
        }
    }
    
    /**
     * 同步里程碑excel
     */
    public function addMailStoneExcel() {
        if (! empty ( $_FILES )) {
            import ( "ORG.Util.PHPExcel" );
            // 上传excl
            $uploadPath = './Public/upload/userInfo/';
            $file_name = $_FILES ["file"] ["name"];
            $file_info = explode ( '.', $file_name );
            $exts = $file_info [1];
            if(!is_dir($uploadPath)){
                mkdir($uploadPath,755,true);
            }
            $move_file_name = $uploadPath . time () . '.' . $exts;
            move_uploaded_file ( $_FILES ["file"] ["tmp_name"], $move_file_name );
            // 创建PHPExcel对象
            $PHPExcel = new PHPExcel ();
            // 如果excel文件后缀名为.xls，导入这个类
            if ($exts == 'xls' || $exts == 'XLS') {
                import ( "ORG.Util.PHPExcel.Reader.Excel5" );
                $PHPReader = new \PHPExcel_Reader_Excel5 ();
            } else if ($exts == 'xlsx'|| $exts == 'XLSX') {
                import ( "ORG.Util.PHPExcel.Reader.Excel2007" );
                $PHPReader = new \PHPExcel_Reader_Excel2007 ();
            } else {
                echo "文件格式有误";
                exit ();
            }
            // 载入文件
            $PHPExcel = $PHPReader->load ( $move_file_name );
            // 获取表中的第一个工作表，如果要获取第二个，把0改为1，依次类推
            $currentSheet = $PHPExcel->getSheet ( 0 );
            // 获取总列数
            $allColumn = $currentSheet->getHighestColumn ();
            // 获取总行数
            $allRow = $currentSheet->getHighestRow ();
            // 循环获取表中的数据，$currentRow表示当前行，从哪行开始读取数据，索引值从0开始
            for($currentRow = 2; $currentRow <= $allRow; $currentRow ++) {
                // 从哪列开始，A表示第一列
                for($currentColumn = 'A'; $currentColumn <= $allColumn; $currentColumn ++) {
                    // 数据坐标
                    $address = $currentColumn . $currentRow;
                    // 读取到的数据，保存到数组$arr中
                    $data [$currentRow] [$currentColumn] = $currentSheet->getCell ( $address )->getValue ();
                }
            }
            $mailstone = M('project_mailstone_progress');
            $projects = M('projects');
            //插入新数据时先清空原表数据，没有这个需要可以注释下面步骤
            //M('mobile')->where('1=1')->delete();

            foreach ($data as $k => $v) {
                $whereT['projectId'] = $v['A'];
                $whereT['isNew'] = '1';
                $temp = $projects->where($whereT)->field('id')->select();
                $info['relatedId'] = $temp[0]['id'];
                $info['mailstoneName'] = $v['B'];
                $info['weight'] = $v['C'];
                $info['planFinishedTime'] = $v['D'];
                $info['deliverable'] = $v['E'];
                $info['status'] = $v['F'];
                $info['arrivalConfirmation'] = $v['G'];
                $info['actualFinishedTime'] = $v['H'];

                $where['relatedId'] = $temp[0]['id'];
                $where['mailstoneName'] = $v['B'];
                if($mailstone->where($where)->select())
                {
                    //若大表中找到相关数据则进行修改
                    if($mailstone->where($where)->save($info))
                    {
                        $latest = $mailstone->where('relatedId='.$info['relatedId'])->order('id desc')->limit(1)->select();
                        $tempData = array(
                            'mailstoneName' => $latest[0]['mailstoneName'],
                            'planFinishedTime' => $latest[0]['planFinishedTime'],
                        );
                        $projects->where('id=' . $info['relatedId'])->save($tempData);
                    }
                }
                else
                {
                    //若大表中找不到相关数据则进行添加
                    if($mailstone->add($info))
                    {
                        $latest = $mailstone->where('relatedId='.$info['relatedId'])->order('id desc')->limit(1)->select();
                        $tempData = array(
                            'mailstoneName' => $latest[0]['mailstoneName'],
                            'planFinishedTime' => $latest[0]['planFinishedTime'],
                        );
                        $projects->where('id=' . $info['relatedId'])->save($tempData);
                    }
                }
            }
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '导入项目里程碑信息';
            $logs->add ( $logsData );
            $res = array('status'=>1,'info'=>'项目里程碑信息导入完成');
            echo json_encode($res);
            exit;
        } else {
            $logs = M ( 'logs_info' );
            $logsData ['logDetail'] = date ( 'Y-m-d H:i:s' ) . ':' . session ( 'userName' ) . '导入项目里程碑信息失败，原因:未获取到上传文件';
            $logs->add ( $logsData );
            $this->error ( "请选择上传的文件" );
            $res = array('status'=>0,'info'=>'未获取到上传文件');
            echo json_encode($res);
        }
    }
}
