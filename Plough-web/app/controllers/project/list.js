import Ember from 'ember';
import {request} from '../../utils/http-helpers';


export default Ember.Controller.extend({

  session: Ember.inject.service('session'),
  names: ['Stefan', 'Miguel', 'Tomster', 'Pluto'],
  loadProject:[],

  userInfo:{},
  all:true,
  basic:false,
  customer:false,
  suyan:false,
  status:false,
  process:false,
  searchItemLength:0,
  searchItem:[],
  searchWordInput:'',
  editProject:{},
  addProject:{},
  projectScore:{},
  addedProduction:[],
  production:{},
  risk:'',

  errorInfo:'',
  pageSizeSelect:[10,50,100],
  pageSizeValue:10,
  currentPage:0,

  loadProjectLength:0,

  searchItemLength:Ember.computed('searchItem',{
    get(){
      return this.get('searchItem').length;
    }
  }),

  beginShowItem:Ember.computed('currentPage','pageSizeValue',{
    get(){
      return this.get('currentPage')*this.get('pageSizeValue');
    }
  }),

  showDataLength:Ember.computed('showData', {
    get(){
      return (this.get('showData').length);
    }
  }),
  endShowItem:Ember.computed('currentPage','pageSizeValue','loadProjectLength', {
    get(){
      if((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadProjectLength'))
      {
        return this.get('loadProjectLength');
      }
      return (this.get('currentPage') + 1) * this.get('pageSizeValue');
    }
  }),


  showData:Ember.computed('risk,','endShowItem','beginShowItem', 'loadProject','searchWordInput','searchItem',{
    get(){
      if(this.get('searchWordInput')!=''||this.get('risk')!=''){
        return this.get('searchItem').slice(this.get('beginShowItem'),this.get('endShowItem'));
      }else{
        return this.get('loadProject');
      }
    }
  }),


  paginationLeftClass: Ember.computed('currentPage', {
    get(){
      if(this.get("currentPage") > 0)
      {
        return "paginate_previous";
      }
      return "paginate_disabled_previous";
    }
  }),

  actions:{
    //编辑框下拉选择处理
    purchaseTypeChanged:function(value, event){
      this.set('editProject.purchaseType',value);
    },
    projectTypeChanged:function(value, event){
      this.set('editProject.projectType',value);
    },
    projectLevelChanged:function(value, event){
      this.set('editProject.projectLevel',value);
    },
    projectClassifyChanged:function(value, event){
      this.set('editProject.projectClassify',value);
    },
    commerceStatusChanged:function(value, event){
      this.set('editProject.commerceStatus',value);
    },
    implementBasesChanged:function(value, event){
      this.set('editProject.implementBases',value);
    },
    implementStatusChanged:function(value, event){
      this.set('editProject.implementStatus',value);
    },
    developStatusChanged:function(value, event){
      this.set('editProject.developStatus',value);
    },
    onlineStatusChanged:function(value, event){
      this.set('editProject.onlineStatus',value);
    },
    operateStatusChanged:function(value, event){
      this.set('editProject.operateStatus',value);
    },
    pressureChanged:function(value, event){
      this.set('editProject.pressure',value);
    },
    eRiskChanged:function(value, event){
      this.set('editProject.risk',value);
    },
    businessOpportunityChanged:function(value, event){
      this.set('projectScore.businessOpportunity',value);
    },
    productionNameChanged:function(value, event){
      this.set('production.productName',value);
    },

    showDateFieldChanged:function (value, event) {
        if(value == 'all'){
           this.set('all',true);
          this.set('basic',false);
          this.set('customer',false);
          this.set('suyan',false);
          this.set('status',false);
          this.set('process',false);
          this.set('important',false);
        }else if(value == 'customer'){
          this.set('all',false);
          this.set('basic',false);
          this.set('customer',true);
          this.set('suyan',false);
          this.set('status',false);
          this.set('process',false);
          this.set('important',false);
        }else if(value == 'suyan'){
          this.set('all',false);
          this.set('basic',false);
          this.set('customer',false);
          this.set('suyan',true);
          this.set('status',false);
          this.set('process',false);
          this.set('important',false);
        }else if(value == 'status'){
          this.set('all',false);
          this.set('basic',false);
          this.set('customer',false);
          this.set('suyan',false);
          this.set('status',true);
          this.set('process',false);
          this.set('important',false);
        }else if(value == 'process'){
          this.set('all',false);
          this.set('basic',false);
          this.set('customer',false);
          this.set('suyan',false);
          this.set('status',false);
          this.set('process',true);
          this.set('important',false);
        }else if(value == 'basic'){
          this.set('all',false);
          this.set('basic',true);
          this.set('customer',false);
          this.set('suyan',false);
          this.set('status',false);
          this.set('process',false);
          this.set('important',false);
        }else if(value=='important'){
          this.set('all',false);
          this.set('basic',false);
          this.set('customer',false);
          this.set('suyan',false);
          this.set('status',false);
          this.set('process',false);
          this.set('important',true);
        }
    },


    riskChanged:function(value, event){
      this.set('risk',value);
      this.send('searchedItemFromWord');
    },



    refreshPageSize:function(){
      this.set('pageSizeValue',$('#list-status').val());
    },
    submitExclData:function () {
      Ember.$('#addSomeProjectForm').modal('hide');
    },

    showAddSomeProjectForm:function () {
      Ember.$('#addSomeProjectForm').modal('show');
    },

    loadStep:function () {

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
    searchedItemFromWord:function () {
      var searchResult = [];
      var Result = [];
      var loadProject = this.get('loadProject');
      var searchWord = this.get('searchWordInput').toString().toLowerCase();
      this.set('currentPage',0);
      //过滤出关键字数据
      loadProject.forEach(function (project) {
        if(project['projectId']){
          if(project['projectId'].toString().toLowerCase().indexOf(searchWord)>=0||
            project['projectNameIn'].toString().toLowerCase().indexOf(searchWord)>=0||
            project['projectManagerId'].toString().toLowerCase().indexOf(searchWord)>=0){
            Result.pushObject(project);
          }
        }else{
          if(project['projectNameIn'].toString().toLowerCase().indexOf(searchWord)>=0||
            project['projectManagerId'].toString().toLowerCase().indexOf(searchWord)>=0){
            Result.pushObject(project);
          }
        }
      })
      //按照风险高低过滤
      var risk = this.get('risk');

      if(Result){
        if(Result&&risk){
          Result.forEach(function (project) {
            if(project.risk == risk){
              searchResult.pushObject(project);
            }
          })
        }else{
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


      if(searchResult){
        this.set('searchItemLength',searchResult.length);
        this.set('searchItem',searchResult);
      }
    },

    pageUp:function(){
      var page = this.get('currentPage')+1;
      if(page*this.get('pageSizeValue')<this.get('loadProjectLength')){
        this.set('currentPage',page);
      }
    },
    pageDown:function(){
      if(this.get('currentPage')>0){
        var page = this.get('currentPage')-1;
        this.set('currentPage',page);
      }
    },
    doLoadProjects:function () {
      request({
        name: 'get.allSolProject.api',
        type: 'get',
        data:{},
      }).then((data) => {
        this.set('searchItemLength',data.length);
        this.set('loadProject',data);
        this.set('loadProjectLength',data.length);
      })
    },

    showAddProjectForm:function () {
      this.set('addProject',{});
      this.set('addProject.risk','高');
      Ember.$('#addProjectForm').modal('show');
    },

    editProjectForm:function (data) {
      this.set('editProject',data);
      Ember.$('#editProjectForm').modal('show');
    },

    scoreProjectForm:function (project) {
      var self = this;
      var projectId = project.projectId;
      this.set('projectScore',{});
      this.set('editProject',project);
      if(project){
        request({
          name: 'get.score.project.api',
          type: 'post',
          data:project,
        }).then((data) => {
            console.log(data);
            if(data){
              self.set('projectScore',data);
              self.set('projectScore.projectId',projectId);
              Ember.$('#scoreProjectFormId').modal('show');
            }else{
              self.set('projectScore.projectId',projectId);
              Ember.$('#scoreProjectFormId').modal('show');
            }
        })
      }
    },

    doScoreProject:function () {
        var projectScore = this.get('projectScore');
        request({
          name: 'score.project.api',
          type: 'post',
          data:projectScore,
        }).then((data) => {
          if(data){
            Ember.$('#scoreProjectFormId').modal('hide');
          }
        })
    },

    //影藏添加产品表单
    closeProjectProductionForm:function () {
      $('#addProjectProduction').addClass('hide');
      $('#divbg').addClass('hide');
    },


    //显示添加产品表单
    projectProductForm:function (data) {
      this.set('editProject',data);
      this.set('addedProduction',[]);
      var self = this;
      request({
        name: 'get.project.production.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          self.set('addedProduction',data);
        }
        $('#addProjectProduction').removeClass('hide');
        $('#divbg').removeClass('hide');
      })
    },

    //提交产品记录
    doSubmitProductionForm:function () {
       var addedProduction = this.get('addedProduction');
       var project = this.get('editProject');
       var data = {};
       data['projectId'] = project['projectId'];
       var self = this;
       if(addedProduction.length>0){
          request({
            name: 'record.project.production.api',
            type: 'post',
            data:addedProduction,
          }).then((data) => {
            if(data){
              $('#addProjectProduction').addClass('hide');
              $('#divbg').addClass('hide');
            }
          })
      }else{
         request({
           name: 'record.project.production.api',
           type: 'post',
           data:data,
         }).then((data) => {
           if(data){
             $('#addProjectProduction').addClass('hide');
             $('#divbg').addClass('hide');
           }
         })
       }
    },

    addOneProduct:function () {
      var oneProduct = this.get('production');
      var project = this.get('editProject');
      var addedProduction = this.get('addedProduction');
      var tmp = {};
      for(var key in oneProduct){
        tmp[key] = oneProduct[key];
      }
      if(addedProduction){
        addedProduction.forEach(function (item,index) {
          if(item.productName == tmp.productName) {
            delete addedProduction[index];
          }
        })
      }
      if(project){
        tmp['projectId'] = project['projectId'];
        tmp['projectNameIn'] = project['projectNameIn'];
        addedProduction.unshiftObject(tmp);
        this.set('addedProduction',addedProduction);
      }
    },

    doEditProject:function () {
      var data = this.get('editProject');
      request({
        name: 'edit.project.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#editProjectForm').modal('hide');
        }
      })
    },

    doAddProject:function () {
      var projectManagerId = this.get('userInfo.userName');
      this.set('addProject.projectManagerId',projectManagerId)
      var data = this.get('addProject');

      request({
        name: 'add.project.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#addProjectForm').modal('hide');
        }
      })
    },

    deleteProductionRec:function (deleteRe) {
      var addedProduction = this.get('addedProduction');
      var newAddedProduction = [];
      addedProduction.forEach(function (item) {
        if(deleteRe.productName != item.productName){
          newAddedProduction.pushObject(item);
        }
      })
      this.set('addedProduction',newAddedProduction);
    },

    setCurrentRe:function (setCurrentRe) {
      this.set('production',setCurrentRe);
    },


  }
});
