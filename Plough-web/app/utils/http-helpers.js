import Ember from 'ember';
import ENV from '../config/environment';
export default function httpHelpers() {
  return true;
}
/**
 *
 * @param args  设置参数
 * @returns {Test.Promise|*|RSVP.Promise}
 */
function request(args, params) {

  var url = urls[args.name]['real'];

  if(params){
      for(var key in params){
        url = url.replace("{"+key+"}",params[key]);
      }
   }

  args.url = ['http://' + window.location.host, url].join('/');
  if (Ember.isNone(args['contentType'])) {
    args['contentType'] = 'application/json'; //需要指定contentType，若无指定，则默认为此
  }
  var Type = 'type';
  if (Ember.isNone(args[Type])) {
    Type = 'method'; //判断method这种特殊的写法
  }
  if (!Ember.isNone(args['data']) && !Ember.isEqual('get', args[Type].toLowerCase())) {
    args['data'] = JSON.stringify(args['data']);
  }
  let _headers = {};

  args['dataType'] = 'json';
  return $.ajax(Ember.merge(args, {
    headers: _headers
  })).error(
    (xhr, status, err) => {}
  );
}

var urls = {
  /* 项目状态 */
  //获取列表
  "get.ProjectStatus.getStatus.api": {
    real: "ProjectStatus/getStatus/id/{relatedId}",
    mock: ""
  },
  //提交列表
  "post.addStatus.api": {
    real: "ProjectStatus/addStatus",
    mock: ""
  },
  //修改列表
  "post.editStatus.api": {
    real: "ProjectStatus/editStatus",
    mock: ""
  },
  /* 项目进展 */
  //获取列表
  "get.ProjectProcess.getProcess.api": {
    real: "ProjectProcess/getProcess/id/{relatedId}",
    mock: ""
  },
  //修改列表
  'post.editProcess.api': {
    real: 'ProjectProcess/editProcess',
    mock: ''
  },

  /* 里程与回款  */
  //收款计划-获取列表
  "get.ProjectGatheringPlan.getPlan.api": {
    real: "ProjectGatheringPlan/getPlan/id/{relatedId}",
    mock: ""
  },
  //收款计划-删除列表
  "delete.ProjectGatheringPlan.deletePlan.api": {
    real: "ProjectGatheringPlan/deletePlan/id/{id}",
    mock: ""
  },
  //收款计划-增加列表
  "post.addGatheringPlan.api": {
    real: "ProjectGatheringPlan/addPlan",
    mock: ""
  },
  //收款计划-修改列表
  "post.editGatheringPlan.api": {
    real: "ProjectGatheringPlan/editPlan",
    mock: ""
  },


  //里程碑-获取列表
  "get.ProjectHistory.getMailStone.api": {
    real: "ProjectMailstoneProgress/getMailStone/id/{relatedId}",
    mock: ""
  },
  //里程碑-删除列表
  "delete.deleteMailStone.api": {
    real: "ProjectMailstoneProgress/deleteMailStone/id/{id}",
    mock: ""
  },
  //里程碑-增加列表
  "post.addMailStone.api": {
    real: "ProjectMailstoneProgress/addMailStone",
    mock: ""
  },
  //里程碑-修改列表
  "post.editMailStone.api": {
    real: "ProjectMailstoneProgress/editMailStone",
    mock: ""
  },


  //收入确认-获取列表
  "get.ProjectGatheringConfirm.getGatheringConfirm.api": {
    real: "ProjectGatheringConfirm/getGatheringConfirm/id/{relatedId}",
    mock: ""
  },
  //收入确认-删除列表
  "delete.deleteGatheringConfirm.api": {
    real: "ProjectGatheringConfirm/getGatheringConfirm/id/{id}",
    mock: ""
  },
  //收入确认-增加列表
  "post.addGatheringConfirm.api": {
    real: "ProjectGatheringConfirm/addGatheringConfirm",
    mock: ""
  },
  //收入确认-修改列表
  "post.editGatheringConfirm.api": {
    real: "ProjectGatheringConfirm/editGatheringConfirm",
    mock: ""
  },

  'edit.change.item': {
    'real': 'Projectchange/editChange',
    'mock': ''
  },
  'get.solProject.api': {
    'real': 'Project/getAllChangeProject',
    'mock': ''
  },
  'get.project.change.item': {
    'real': 'Projectchange/getChangehistory',
    'mock': ''
  },

  'delete.change.item': {
    'real': 'Projectchange/deleteChange',
    'mock': ''
  },
  'add.change.item': {
    'real': 'Projectchange/addChange',
    'mock': ''
  },
  'get.change.item': {
    'real': 'Projectchange/getChangeItem',
    'mock': ''
  },
  'get.change.team': {
    'real': 'Projectchange/getAllTeam',
    'mock': ''
  },

  'get.allSolProject.api': {
    'real': 'Project/getAllSolProject',
    'mock': ''
  },

  'get.project.production.api': {
    real: 'ProjectProduct/getProjectProducts',
    mock: ''
  },

  'change.projet.production.api': {
    'real': 'ProjectProduct/changeProjectProduct',
    'mock': ''
  },

  'record.project.production.api': {
    'real': 'ProjectProduct/addProduct',
    'mock': ''
  },

  'get.score.project.api': {
    'real': 'ProjectScore/getProjectScore',
    'mock': ''
  },

  'score.project.api': {
    'real': 'ProjectScore/addProjectScore',
    'mock': ''
  },
  'get.recruit.demands.api': {
    'real': 'Recruit/getRecruitDemands',
    'mock': ''
  },
  'get.tenant.api': {
    'real': 'Tenant/getTenant',
    'mock': ''
  },
  'delete.tenant.api': {
    'real': 'Tenant/delTenant',
    'mock': ''
  },

  'edit.tenant.api': {
    'real': 'Tenant/editTenant',
    'mock': ''
  },
  'add.tenant.api': {
    'real': 'Tenant/addTenant',
    'mock': ''
  },

  'delete.team.api': {
    'real': 'Team/deleteTeams',
    'mock': ''
  },

  'add.team.api': {
    'real': 'Team/addTeam',
    'mock': ''
  },

  'edit.team.api': {
    'real': 'Team/editTeams',
    'mock': ''
  },

  'get.team.api': {
    'real': 'Team/loadTeams',
    'mock': ''
  },
  'add.employee.apply.api': {
    'real': 'Team/addEmployeeApply',
    'mock': ''
  },
  'add.teamBudget.api': {
    'real': 'Team/addTeamBudget',
    'mock': ''
  },
  'get.teamsBudget.api': {
    'real': 'Team/getTeamsBudget',
    'mock': ''
  },
  'add.employee.api': {
    'real': 'Employee/addEmployee',
    'mock': ''
  },
  'get.employee.api': {
    'real': 'Employee/allEmployee',
    'mock': ''
  },
  'edit.employee.api': {
    'real': 'Employee/updateEmployee',
    'mock': ''
  },
  'get.people.process': {
    'real': 'User/getOnePeopleProcess',
    'mock': ''
  },
  'get.person.week.projects': {
    'real': 'Newproject/weekProjectTime',
    'mock': ''
  },
  'get.person.projects': {
    'real': 'Newproject/alreadyJoinProject',
    'mock': ''
  },
  'post.addProject.api': {
    'real': 'Personal/addProject',
    'mock': ''
  },
  'get.joinProject.api': {
    'real': 'Personal/joinProject',
    'mock': ''
  },
  'get.replaceWeeklyJobTime.api': {
    'real': 'Jobtime/replaceWeeklyJobTime',
    'mock': ''
  },
  'get.replaceJobTime.api': {
    'real': 'Jobtime/replaceJobTime',
    'mock': ''
  },
  'get.getFillJobTime.api': {
    'real': 'Jobtime/getFillJobTime',
    'mock': ''
  },
  'get.attendance.api': {
    'real': 'Employee/getAttendance',
    'mock': ''
  },
  'post.scoreEmployees.api': {
    'real': 'Employee/scoreEmployees',
    'mock': ''
  },
  'get.SomeEmployeeScore.api': {
    'real': 'Employee/SomeEmployeeScore',
    'mock': ''
  },

  'get.getZabbixHostInfo.api': {
    'real': 'Computermonitor/getZabbixHostInfo',
    'mock': ''
  },
  'host.memory.usage': {
    'real': 'Computermonitor/getLSM',
    'mock': ''
  },

  'host.cpu.usage': {
    'real': 'Computermonitor/getLSC',
    'mock': ''
  },

  'get.workTimeList.api': {
    'real': 'Jobtime/getWorkTime',
    'mock': ''
  },
  'get.newProject.api': {
    'real': 'Newproject/getAllProject',
    'mock': ''
  },
  'edit.newProject.api': {
    'real': 'Newproject/updateProject',
    'mock': ''
  },

  'delete.project.api': {
    'real': 'Newproject/deleteProject',
    'mock': ''
  },

  'delete.complain.api': {
    'real': 'Complain/deleteComplain',
    'mock': ''
  },
  'edit.complain.api': {
    'real': 'Complain/editComplain',
    'mock': ''
  },
  'get.allComplain.api': {
    'real': 'Complain/getAllComplain',
    'mock': ''
  },
  'add.complain.api': {
    'real': 'Complain/addComplain',
    'mock': ''
  },
  'edit.user.api': {
    'real': 'User/editUsers',
    'mock': ''
  },
  'delete.user.api': {
    'real': 'User/deleteUser',
    'mock': ''
  },
  'add.user.api': {
    'real': 'User/addOneUser',
    'mock': ''
  },
  'get.project.api': {
    'real': 'Project/getAllProject',
    'mock': ''
  },
  'edit.project.api': {
    real: 'Project/editProject',
    mock: ''
  },
  'add.project.api': {
    'real': 'Project/addProject',
    'mock': ''
  },

  'get.users.api': {
    'real': 'User/getAllUsers',
    'mock': ''
  },
  'get.getAllUserInfo.api': {
    'real': 'User/getAllUserInfo',
    'mock': ''
  },
  'get.logs.api': {
    'real': 'Log/loadLogs',
    'mock': ''
  },
  'user.logout.api': {
    'real': 'User/logout',
    'mock': ''
  },
  'user.login.api': {
    'real': 'User/login',
    'mock': ''
  },

  'return.computers.api': {
    'real': 'Computer/returnComputers',
    'mock': ''
  },

  'edit.computers.api': {
    'real': 'Computer/editComputers',
    'mock': ''
  },

  'get.leftComputer.api': {
    'real': 'Computer/getLeftComputer',
    'mock': ''
  },
  'distribute.computer.api': {
    'real': 'Computer/distributeComputer',
    'mock': ''
  },
  'export.computer.api': {
    'real': 'Computer/exportComputers',
    'mock': ''
  },
  'computer.type.count': {
    'real': 'Computer/getTmpCCount',
    'mock': ''
  },
  'person.computer.count': {
    'real': 'Computer/getPersonCCount',
    'mock': ''
  },
  'dashbord.computer.survey': {
    'real': 'Computer/computeDashboard',
    'mock': ''
  },
  'return.computer.api': {
    'real': 'Computer/returnComputer',
    'mock': ''
  },
  'edit.computer.api': {
    'real': 'Computer/editComputer',
    'mock': ''
  },
  'delete.computer.api': {
    'real': 'Computer/deleteComputer',
    'mock': ''
  },
  'get.computer.api': {
    'real': 'Computer/getComputer',
    'mock': ''
  },
  'add.computer.api': {
    'real': 'Computer/addComputer',
    'mock': ''
  },
  'upload.computer.excl': {
    'real': 'Computer/addComputerExcl',
    'mock': ''
  },
  'get.virtual.api': {
    'real': 'Virtual/getVirtualComputer',
    'mock': ''
  },
  'edit.virtual.api': {
    'real': 'Virtual/editVirtualComputer',
    'mock': ''
  }
}





export {
  request
};
