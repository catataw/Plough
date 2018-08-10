import Ember from 'ember';
import {request} from '../../utils/http-helpers';


export default Ember.Controller.extend({

  session: Ember.inject.service('session'),
  names: ['Stefan', 'Miguel', 'Tomster', 'Pluto'],
  loadProject: [],

  userInfo: {},
  all: true,
  basic: false,
  customer: false,
  suyan: false,
  status: false,
  process: false,
  searchItemLength: 0,
  searchItem: [],
  searchWordInput: '',
  editProject: {},
  addProject: {},
  projectScore: {},
  addedProduction: [],
  production: {},
  risk: '',

  errorInfo: '',
  pageSizeSelect: [10, 50, 100],
  pageSizeValue: 10,
  currentPage: 1,

  loadProjectLength: 0,

  firstPage: true,
  secondPage: false,
  // thirdPage: false,
  // fourthPage: false,
  // lastPage: false,

  // history-modal
  modalId: '',
  relatedId: '125',
  statusList: [],
  projectProgressList: [],
  gatheringPlanList: [],
  mailStoneList: [],
  gatheringConfirmList: [],

  _mailStoneList:[
    {
      "id": "3",
      "relatedId": "512",
      "mailstoneName": "上线",
      "weight": "60",
      "planFinishedTime": "2018-08-01",
      "deliverable": "ddd",
      "status": "已完成",
      "arrivalConfirmation": "fff",
      "actualFinishedTime": "2018-08-02"
    },
    {
      "id": "3",
      "relatedId": "512",
      "mailstoneName": "初验",
      "weight": "20",
      "planFinishedTime": "2018-08-01",
      "deliverable": "ddd",
      "status": "进行中",
      "arrivalConfirmation": "fff",
      "actualFinishedTime": "2018-08-02"
    },
    {
      "id": "4",
      "relatedId": "512",
      "mailstoneName": "终验",
      "weight": "20",
      "planFinishedTime": "2018-08-01",
      "deliverable": "eee",
      "status": "未开始",
      "arrivalConfirmation": "fff",
      "actualFinishedTime": "2018-08-02"
    }
  ],
  /* 计算每个li的颜色 */
  colorList:Ember.computed('_mailStoneList.@each.status',{
    get(){
      let statustoCol=this.get('_mailStoneList').map(function(item){

        if(item.status == '已完成'){
          return 'gray';
        }
        else if(item.status == '进行中'){
          return 'green';
        }
        else if(item.status == '未开始'){
          return 'red';
        }
      });
      return statustoCol;
    }
  }),
  setProcessPage: function (page) {
    if (page == 1) {
      this.set('firstPage', true);
    } else {
      this.set('firstPage', false);
    }
    if (page == 2) {
      this.set('secondPage', true);
    } else {
      this.set('secondPage', false);
    }
    // if (page == 3) {
    //   this.set('thirdPage', true);
    // } else {
    //   this.set('thirdPage', false);
    // }
    // if (page == 4) {
    //   this.set('fourthPage', true);
    // } else {
    //   this.set('fourthPage', false);
    // }
    // if (page == 5) {
    //   this.set('lastPage', true);
    // } else {
    //   this.set('lastPage', false);
    // }
  },

  searchItemLength: Ember.computed('searchItem', {
    get() {
      return this.get('searchItem').length;
    }
  }),

  beginShowItem: Ember.computed('currentPage', 'pageSizeValue', {
    get() {
      return this.get('currentPage') * this.get('pageSizeValue');
    }
  }),

  showDataLength: Ember.computed('showData', {
    get() {
      return (this.get('showData').length);
    }
  }),
  endShowItem: Ember.computed('currentPage', 'pageSizeValue', 'loadProjectLength', {
    get() {
      if ((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadProjectLength')) {
        return this.get('loadProjectLength');
      }
      return (this.get('currentPage') + 1) * this.get('pageSizeValue');
    }
  }),


  showData: Ember.computed('risk,', 'endShowItem', 'beginShowItem', 'loadProject', 'searchWordInput', 'searchItem', {
    get() {
      if (this.get('searchWordInput') != '' || this.get('risk') != '') {
        return this.get('searchItem').slice(this.get('beginShowItem'), this.get('endShowItem'));
      } else {
        return this.get('loadProject');
      }
    }
  }),


  paginationLeftClass: Ember.computed('currentPage', {
    get() {
      if (this.get("currentPage") > 0) {
        return "paginate_previous";
      }
      return "paginate_disabled_previous";
    }
  }),

  actions: {
    //编辑框下拉选择处理
    purchaseTypeChanged: function (value, event) {
      this.set('addProject.purchaseType', value);
    },
    projectTypeChanged: function (value, event) {
      this.set('addProject.projectType', value);
    },
    projectLevelChanged: function (value, event) {
      this.set('addProject.projectLevel', value);
    },
    projectClassifyChanged: function (value, event) {
      this.set('addProject.projectClassify', value);
    },
    commerceStatusChanged: function (value, event) {
      this.set('addProject.commerceStatus', value);
    },
    implementBasesChanged: function (value, event) {
      this.set('addProject.implementBases', value);
    },
    implementStatusChanged: function (value, event) {
      this.set('addProject.implementStatus', value);
    },
    developStatusChanged: function (value, event) {
      this.set('addProject.developStatus', value);
    },
    onlineStatusChanged: function (value, event) {
      this.set('addProject.onlineStatus', value);
    },
    operateStatusChanged: function (value, event) {
      this.set('addProject.operateStatus', value);
    },
    pressureChanged: function (value, event) {
      this.set('addProject.pressure', value);
    },
    eRiskChanged: function (value, event) {
      this.set('addProject.risk', value);
    },
    businessOpportunityChanged: function (value, event) {
      this.set('projectScore.businessOpportunity', value);
    },
    productionNameChanged: function (value, event) {
      this.set('production.productName', value);
    },

    showDateFieldChanged: function (value, event) {
      if (value == 'all') {
        this.set('all', true);
        this.set('basic', false);
        this.set('customer', false);
        this.set('suyan', false);
        this.set('status', false);
        this.set('process', false);
        this.set('important', false);
      } else if (value == 'customer') {
        this.set('all', false);
        this.set('basic', false);
        this.set('customer', true);
        this.set('suyan', false);
        this.set('status', false);
        this.set('process', false);
        this.set('important', false);
      } else if (value == 'suyan') {
        this.set('all', false);
        this.set('basic', false);
        this.set('customer', false);
        this.set('suyan', true);
        this.set('status', false);
        this.set('process', false);
        this.set('important', false);
      } else if (value == 'status') {
        this.set('all', false);
        this.set('basic', false);
        this.set('customer', false);
        this.set('suyan', false);
        this.set('status', true);
        this.set('process', false);
        this.set('important', false);
      } else if (value == 'process') {
        this.set('all', false);
        this.set('basic', false);
        this.set('customer', false);
        this.set('suyan', false);
        this.set('status', false);
        this.set('process', true);
        this.set('important', false);
      } else if (value == 'basic') {
        this.set('all', false);
        this.set('basic', true);
        this.set('customer', false);
        this.set('suyan', false);
        this.set('status', false);
        this.set('process', false);
        this.set('important', false);
      } else if (value == 'important') {
        this.set('all', false);
        this.set('basic', false);
        this.set('customer', false);
        this.set('suyan', false);
        this.set('status', false);
        this.set('process', false);
        this.set('important', true);
      }
    },


    riskChanged: function (value, event) {
      this.set('risk', value);
      this.send('searchedItemFromWord');
    },


    refreshPageSize: function () {
      this.set('pageSizeValue', $('#list-status').val());
    },
    submitExclData: function () {
      Ember.$('#addSomeProjectForm').modal('hide');
    },

    showAddSomeProjectForm: function () {
      Ember.$('#addSomeProjectForm').modal('show');
    },

    loadStep: function () {

      /*
      var data=[{
        "id": "512",
        "projectId": "Y2017DP011",
        "leadDepartMent": "大数据产品部",
        "assistDepartment": "",
        "projectPeople": "胡国靖,罗志成,李光瑞,周慧玲,李运田,涂敬伟,李艳芳,初颖俊,邵明路,韩伟森,汪远航,王均,谈海宇,邸望春,钱岭,吕世忠,刘杰,王亚平,孟威",
        "contractNo": "test",
        "signContractTime": "2018-04-04 00:00:00",
        "purchaseType": "单一来源",
        "onlineTime": "2018-04-18 00:00:00",
        "projectName": "BC-ETL",
        "projectAlias": "test",
        "projectType": "集团委托应用研类",
        "startTime": "2018-04-20 00:00:00",
        "projectPrice": "1100.00",
        "customerName": "苏州移动",
        "customerDepartmentName": "客户",
        "lever2Manager": "二级",
        "lever3Manager": "三级",
        "customerStaffName": "员工",
        "customerPrimaryContact": "神明阿发",
        "involvedRegion": "上支",
        "saleManager": "踩雷",
        "regionalSolManager": "王振亚",
        "projectManagerId": "胡国靖",
        "implementManager": "李斌",
        "developManager": "王杰",
        "testManager": "孙小霞",
        "serviceManager": "叶尧罡",
        "commerceStatus": "已立项",
        "implementBases": "POC",
        "implementStatus": "实施中",
        "developStatus": "开发中",
        "onlineStatus": "预上线",
        "operateStatus": "自运维",
        "currentProgress": "已完成一些开发",
        "recentPlan": "很牛逼",
        "progress": "10",
        "risk": "高",
        "countermeasures": "机器为到位",
        "isDelete": "1",
        "projectLevel": "重点",
        "projectClassify": "应用类",
        "nodeCount": "1222",
        "pressure": "中",
        "areaProjectManager": "王振亚",
        "teams": "hc"
      }];
      this.set('loadProject',data);
      this.set('loadProjectLength',data.length);*/
      this.send('doLoadProjects');
    },
    searchedItemFromWord: function () {
      var searchResult = [];
      var Result = [];
      var loadProject = this.get('loadProject');
      var searchWord = this.get('searchWordInput').toString().toLowerCase();
      this.set('currentPage', 0);
      //过滤出关键字数据
      loadProject.forEach(function (project) {
        if (project['projectId']) {
          if (project['projectId'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
            project['projectNameIn'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
            project['projectManagerId'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            Result.pushObject(project);
          }
        } else {
          if (project['projectNameIn'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
            project['projectManagerId'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            Result.pushObject(project);
          }
        }
      })
      //按照风险高低过滤
      var risk = this.get('risk');

      if (Result) {
        if (Result && risk) {
          Result.forEach(function (project) {
            if (project.risk == risk) {
              searchResult.pushObject(project);
            }
          })
        } else {
          searchResult = Result;
        }
      }
      /*else{
        if(loadProject&&risk){
          loadProject.forEach(function (project) {
            if(project.risk == risk){
              searchResult.pushObject(project);
            }
          })
        }else{
          searchResult = loadProject;
        }
      }*/


      if (searchResult) {
        this.set('searchItemLength', searchResult.length);
        this.set('searchItem', searchResult);
      }
    },

    pageUp: function () {
      var page = this.get('currentPage') + 1;
      if (page * this.get('pageSizeValue') < this.get('loadProjectLength')) {
        this.set('currentPage', page);
      }
    },
    pageDown: function () {
      if (this.get('currentPage') > 0) {
        var page = this.get('currentPage') - 1;
        this.set('currentPage', page);
      }
    },
    doLoadProjects: function () {
      request({
        name: 'get.allSolProject.api',
        type: 'get',
        data: {},
      }).then((data) => {
        this.set('searchItemLength', data.length);
        this.set('loadProject', data);
        this.set('loadProjectLength', data.length);
      })
    },

    showAddProjectForm: function () {
      this.set('addProject', {});
      this.set('addProject.risk', '高');
      Ember.$('#addProjectForm').modal('show');
    },

    editProjectForm: function (data) {
      this.set('editProject', data);
      Ember.$('#editProjectForm').modal('show');
    },

    scoreProjectForm: function (project) {
      var self = this;
      var projectId = project.projectId;
      this.set('projectScore', {});
      this.set('editProject', project);
      if (project) {
        request({
          name: 'get.score.project.api',
          type: 'post',
          data: project,
        }).then((data) => {
          console.log(data);
          if (data) {
            self.set('projectScore', data);
            self.set('projectScore.projectId', projectId);
            Ember.$('#scoreProjectFormId').modal('show');
          } else {
            self.set('projectScore.projectId', projectId);
            Ember.$('#scoreProjectFormId').modal('show');
          }
        })
      }
    },

    doScoreProject: function () {
      var projectScore = this.get('projectScore');
      request({
        name: 'score.project.api',
        type: 'post',
        data: projectScore,
      }).then((data) => {
        if (data) {
          Ember.$('#scoreProjectFormId').modal('hide');
        }
      })
    },

    //影藏添加产品表单
    closeProjectProductionForm: function () {
      $('#addProjectProduction').addClass('hide');
      $('#divbg').addClass('hide');
    },


    //显示添加产品表单
    projectProductForm: function (data) {
      this.set('editProject', data);
      this.set('addedProduction', []);
      var self = this;
      request({
        name: 'get.project.production.api',
        type: 'post',
        data: data,
      }).then((data) => {
        if (data) {
          self.set('addedProduction', data);
        }
        $('#addProjectProduction').removeClass('hide');
        $('#divbg').removeClass('hide');
      })
    },

    //提交产品记录
    doSubmitProductionForm: function () {
      var addedProduction = this.get('addedProduction');
      var project = this.get('editProject');
      var data = {};
      data['projectId'] = project['projectId'];
      var self = this;
      if (addedProduction.length > 0) {
        request({
          name: 'record.project.production.api',
          type: 'post',
          data: addedProduction,
        }).then((data) => {
          if (data) {
            $('#addProjectProduction').addClass('hide');
            $('#divbg').addClass('hide');
          }
        })
      } else {
        request({
          name: 'record.project.production.api',
          type: 'post',
          data: data,
        }).then((data) => {
          if (data) {
            $('#addProjectProduction').addClass('hide');
            $('#divbg').addClass('hide');
          }
        })
      }
    },

    addOneProduct: function () {
      var oneProduct = this.get('production');
      var project = this.get('addProject');
      var addedProduction = this.get('addedProduction');
      var tmp = {};
      for (var key in oneProduct) {
        tmp[key] = oneProduct[key];
      }
      if (addedProduction) {
        addedProduction.forEach(function (item, index) {
          if (item.productName == tmp.productName) {
            // delete addedProduction[index];
            // delete 方法不会改变数组长度，被删除的元素变成undefined，会使得已添加的节点存在多余空值。
            addedProduction.splice(index,1);
          }
        })
      }
      if (project) {
        tmp['projectId'] = project['projectId'];
        tmp['projectNameIn'] = project['projectName'];
        addedProduction.unshiftObject(tmp);
        this.set('addedProduction', addedProduction);
      }
    },

    doEditProject: function () {
      var data = this.get('editProject');
      request({
        name: 'edit.project.api',
        type: 'post',
        data: data,
      }).then((data) => {
        if (data) {
          Ember.$('#editProjectForm').modal('hide');
        }
      })
    },

    doAddProject: function () {
      var projectManagerId = this.get('userInfo.userName');
      this.set('addProject.projectManagerId', projectManagerId)
      var data = this.get('addProject');

      request({
        name: 'add.project.api',
        type: 'post',
        data: data,
      }).then((data) => {
        if (data) {
          Ember.$('#addProjectForm').modal('hide');
        }
      })
    },

    deleteProductionRec: function (deleteRe) {
      var addedProduction = this.get('addedProduction');
      var newAddedProduction = [];
      addedProduction.forEach(function (item) {
        if (deleteRe.productName != item.productName) {
          newAddedProduction.pushObject(item);
        }
      })
      this.set('addedProduction', newAddedProduction);
    },

    setCurrentRe: function (setCurrentRe) {
      this.set('production', setCurrentRe);
    },

    // 下一步
    pageNext: function () {
      if (this.get('currentPage') < 2) {
        var page = this.get('currentPage') + 1;
        // console.log('pageNext: ' + page);
        this.set('currentPage', page);
        this.setProcessPage(page);
        console.log('addProject: ' + this.addProject);
      }
    },
    // 上一步
    pagePre: function () {
      if (this.get('currentPage') > 0) {
        var page = this.get('currentPage') - 1;
        // console.log('pagePre: ' + page);
        this.set('currentPage', page);
        this.setProcessPage(page);
      }
    },
    switch(name){
      let obj = this.get('tabSwitch');
      for(var i in obj){
        if(i == name){
          this.set(`tabSwitch.${i}`,true);
        }else{
          this.set(`tabSwitch.${i}`,false);
        }
      }

      /* 项目状态 */
      //获取列表
      if(name==='itemStatus'){
        request({
          name: 'get.ProjectStatus.getStatus.api',
          type: 'get',
          data:{},
          // },'relatedId').then((data) => {
        }).then((result) => {       //////////参数如何添加？？？？？
          if(result){
            this.set('statusList',result.data);
            console.log(result.info);
          }else{

          }
        })
      }
      /* 项目进展 */
      //获取列表
      else if(name === 'itemProgress'){
        request({
          name: 'get.ProjectProcess.getProcess.api',
          type: 'get',
          data:{},
        },{relatedId:this.get('relatedId')}).then((result) => {       //////////参数如何添加？？？？？
          if(result){
            this.set('projectProgressList',result.data);
            console.log(result.info);
          }else{

          }
        })
      }
      /* 里程与回款  */
      //收款计划-获取列表
      else if(name==='repayment'){
        request({
          name: 'get.ProjectGatheringPlan.getPlan.api',
          type: 'get',
          data:{},
        },{relatedId:this.get('relatedId')}).then((result) => {       //////////参数如何添加？？？？？
          if(result){
            //  this.set('gatheringPlanList',result.data);
            console.log(result.info);
          }else{

          }
        })
//里程碑-获取列表
        request({
          name: 'get.ProjectHistory.getMailStone.api',
          type: 'get',
          data:{},
        }).then((result) => {       //////////参数如何添加？？？？？
          if(result){
            this.set('mailStoneList',result.data);
            console.log(result.info);
          }else{

          }
        })
//收入确认-获取列表
        request({
          name: 'get.ProjectGatheringConfirm.getGatheringConfirm.api',
          type: 'get',
          data:{},
        }).then((result) => {       //////////参数如何添加？？？？？
          if(result){
            this.set('gatheringConfirmList',result.data);
            console.log(result.info);
          }else{

          }
        })



      }


    },
    closeAndReset(){
      this.set('tabSwitch.itemStatus',true);
      this.set('tabSwitch.itemProgress',false);
      this.set('tabSwitch.repayment',false);
    },
    addGatheringPlan:function(value,event){
      var newGatheringPlan={
        "relatedI":this.get('relatedId'),
        "gatheringCondition":'',
        "gatheringTime":'',
        "tax":'',
        "noTax":'',
        "gatheringRate":'',
      };
      this.get('_gatheringPlanList').addObject(newGatheringPlan);

    },

    addMailStone:function(){
      var newMailStone = {
        "relatedId":this.get('relatedId'),
        "mailstoneName": "",
        "weight":0,
        "planFinishedTime": "",
        "deliverable": "",
        "status": "",
        "arrivalConfirmation": "",
        "actualFinishedTime": ""
      };
      this.get('_mailStoneList').addObject(newMailStone);
    },

    addGatheringConfirm:function(){
      var newGatheringConfirm = {
        "relatedId": this.get('relatedId'),
        "confirmProgressTime": "",
        "confirmTax": 0,
        "confirmNoTax": "",
        "confirmedProgress": 0
      };
      this.get('_gatheringConfirmList').addObject(newGatheringConfirm);
    },

    doAddProject:function () {
      // var projectManagerId = this.get('userInfo.userName');
      // this.set('addProject.projectManagerId',projectManagerId)
      var data = this.get('addProject');
      console.log('data: ' + data);
      request({
        name: 'add.project.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#addProjectForm').modal('hide');
        }
      })
    }
  },

})
