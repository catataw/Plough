<?php


class ProjectDetailAction extends Action
{
    public function getProjectDetail($id)
    {
        $projects = M('projects');
        $data = $projects->where('id=' . $id)->select();
        if ($data !== false) {
            $this->ajaxReturn($data, '获取成功', 1);
        } else {
            $this->ajaxReturn(array(), '获取失败', 0);
        }
    }
}