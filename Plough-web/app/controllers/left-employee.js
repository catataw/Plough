import Ember from 'ember';
import {request} from '../utils/http-helpers';
import {numberUtils} from '../utils/number_utils';
import{dateUtils} from '../utils/date';
import ENV from '../config/environment';

export default Ember.Controller.extend({

  session: Ember.inject.service('session'),

  loadProject:[],

  applyTeam:{},
  searchItem:[],
  searchWordInput:'',
  editProject:{},
  addProject:{'beginTime':'2017-01-01','endTime':'2017-12-31'},
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

      this.send('doLoadProjects');
    },
    searchedItemFromWord:function () {
      var searchResult = [];
      var loadProject = this.get('loadProject');
      var searchWord = this.get('searchWordInput').toString().toLowerCase();
      this.set('currentPage',0);
      loadProject.forEach(function (project) {
        console.log(project);
        if(project['teamName'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['teamLeader'].toString().toLowerCase().indexOf(searchWord)>=0
        ){
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


    //加载各小组外协预算
    doLoadProjects:function () {
      request({
        name: 'get.teamsBudget.api',
        type: 'get',
        data:{},
      }).then((data) => {
        this.set('loadProject',data);
        this.set('loadProjectLength',data.length);
      })
    },

    //添加外协预算
    doAddProject:function () {
      var self = this;
      var data = this.get('addProject');
      request({
        name: 'add.teamBudget.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#addProjectForm').modal('hide');
          self.send('loadStep');
        }
      })
    },

    //显示申请外协弹框
    applyEmployee:function(teamInfo){
      console.log(teamInfo);
      this.set('applyTeam',teamInfo);
      this.set('applyTeam.position','文档工程师');
      this.set('applyTeam.level','初级');
      this.set('applyTeam.serviceType','外地驻场');
      this.set('applyTeam.time','1');
      this.set('applyTeam.manCount','1');

      var date=new Date();
      var year = date.getFullYear();
      var month = date.getMonth();
      var day = date.getUTCDate()+7;
      var newDate =  new Date(year, month, day);
      this.set('applyTeam.arriveTime',dateUtils.formatDate(newDate));
      Ember.$('#applyEmployeeForm').modal('show');
    },

    //外协申请
    submitEmployeeApply:function () {

      var applyTeam = this.get('applyTeam');
      request({
        name: 'add.employee.apply.api',
        type: 'post',
        data:applyTeam,
      }).then((data) => {
        if(data){
          Ember.$('#applyEmployeeForm').modal('hide');
        }
      })
    },

    positionChanged:function(value, event){
      this.set('applyTeam.position',value);
    },
    levelChanged:function(value, event){
      this.set('applyTeam.level',value);
    },
    serviceTypeChanged:function(value, event){
      this.set('applyTeam.serviceType',value);
    },
    timeChanged:function(value, event){
      this.set('applyTeam.time',value);
    },

  }
});
