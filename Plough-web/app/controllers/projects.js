import Ember from 'ember';
import {request} from '../utils/http-helpers';

export default Ember.Controller.extend({

  session: Ember.inject.service('session'),

  loadProject:[],

  searchItem:[],
  searchWordInput:'',
  editProject:{},

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


  showData:Ember.computed('endShowItem','beginShowItem', 'loadProject','searchWordInput','searchItem',{
    get(){
      if(this.get('searchWordInput')!=''){
        return this.get('searchItem').slice(this.get('beginShowItem'),this.get('endShowItem'));
      }else{
        return this.get('loadProject').slice(this.get('beginShowItem'),this.get('endShowItem'));
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
    categoryChanged:function(value, event){
      this.set('editProject.projectType',value);
   },

    showAddProjectForm:function(){
      Ember.$('#addProjectForm').modal('show');
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
     /* var data =[{"id":"431","contractId":"01-2017-046","projectId":"C201785-018","projectName":"\u5728\u7ebf2017\u5e74hadoop\u7ef4\u4fdd\u9879\u76ee","salesmaneEmail":"wuhui@cmss.chinamobile.com","projectManagerEmail":"huanghaibo@cmss.chinamobile.com","developerEmail":"zhangyongxi@cmss.chinamobile.com","projectType":"\u652f\u6491\u670d\u52a1\u7c7b","projectPrice":"1200000.00","getMoney":null,"leftMoney":null,"customer":null,"leadDepartment":"\u5927\u6570\u636e\u4ea7\u54c1\u90e8","areaBelong":"\u897f\u90e8","projectStage":null,"businessStatus":"","usedProduct":null,"nodeCount":null,"province":"\u5728\u7ebf\u516c\u53f8","assistDepartment":"","spitStatus":"\u5df2\u62c6\u5206"},{"id":"432","contractId":"01-2017-045","projectId":"C201785-151","projectName":"\u8fbd\u5b81\u7701\u91d1\u6c1f\u9f99\u73af\u4fdd\u65b0\u6750\u6599\u6709\u9650\u516c\u53f8\u5546\u60c5\u901a\u8bd5\u7528\u9879\u76ee","salesmaneEmail":"wuhui@cmss.chinamobile.com","projectManagerEmail":"huanghaibo@cmss.chinamobile.com","developerEmail":"zhangyongxi@cmss.chinamobile.com","projectType":"\u4ea7\u54c1\u9500\u552e\u7c7b","projectPrice":"1200.00","getMoney":null,"leftMoney":null,"customer":null,"leadDepartment":"\u5927\u6570\u636e\u4ea7\u54c1\u90e8","areaBelong":"\u5317\u90e8","projectStage":null,"businessStatus":"","usedProduct":null,"nodeCount":null,"province":"\u8fbd\u5b81","assistDepartment":"","spitStatus":"\u5df2\u62c6\u5206"}];

      this.set('loadProject',data);
      this.set('loadProjectLength',data.length);*/

      this.send('doLoadProjects');
    },
    searchedItemFromWord:function () {
      var searchResult = [];
      var loadProject = this.get('loadProject');
      var searchWord = this.get('searchWordInput').toString().toLowerCase();
      this.set('currentPage',0);
      loadProject.forEach(function (project) {
        if(project['contractId'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['projectId'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['projectName'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['projectManagerEmail'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['projectType'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['areaBelong'].toString().toLowerCase().indexOf(searchWord)>=0||
      //    project['projectStage'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['province'].toString().toLowerCase().indexOf(searchWord)>=0){
          searchResult.pushObject(project);
        }
      })
      this.set('searchItem',searchResult);
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
        name: 'get.project.api',
        type: 'get',
        data:{},
      }).then((data) => {
        this.set('loadProject',data);
        this.set('loadProjectLength',data.length);
      })
    },

    editProjectForm:function (data) {
      this.set('editProject',data);
      Ember.$('#editProjectForm').modal('show');
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

    }



  }
});
