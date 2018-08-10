import Ember from 'ember';
import {request} from '../utils/http-helpers';
import {numberUtils} from '../utils/number_utils';
import {validator} from '../utils/validator';
import{dateUtils} from '../utils/date';
import ENV from '../config/environment';

export default Ember.Controller.extend({

  session: Ember.inject.service('session'),
  i18n :Ember.inject.service(),
  loadProject:[],
  addProject:{},
  searchItem:[],
  searchWordInput:'',
  editProject:{},


  employeeScore:[],

  errorInfo:'',
  pageSizeSelect:[10,50,100],
  pageSizeValue:10,
  currentPage:0,

  isShow:false,

  writeTime:null,

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



  writeTimeChage:Ember.observer('writeTime',function () {
    var self = this;
    if(this.get('isShow')){
      setTimeout(function () {
        var writeTime = self.get('writeTime');
        if(typeof writeTime=='string'&&writeTime.constructor==String){
          self.send('refreshEScore');
        }
      },100);
    }
  }),


  actions:{

    /*writeTimeChage(){
      if(this.get('isShow')){
        this.send('refreshEScore');
      }
    },*/

    //显示添加外协弹框
    showAddProjectForm:function(){
      Ember.$('#addProjectForm').modal('show');
    },

    refreshEScore:function () {
      var self = this;
      var data ={};
      data['date'] = this.get('writeTime');
      request({
        name: 'get.SomeEmployeeScore.api',
        type: 'post',
        data:data,
      }).then((data) => {
        self.set('employeeScore',data);
      })
    },


    //展现雇员打分列表
    addScore:function () {
      var self = this;
      var data ={};
      data['date'] = this.get('writeTime');
      Ember.$('#employeeScoreForm').modal('show');
      request({
        name: 'get.SomeEmployeeScore.api',
        type: 'post',
        data:data,
      }).then((data) => {
        console.log(data);
        self.set('employeeScore',data);
        this.set('isShow',true);
      })
    },

    //刷新视图
    doCloseScoreEmployee:function () {
      this.transitionToRoute('used-employee');
    },

    //给雇员打分
    doScoreEmployee:function(){
      var self = this;
      var employeeScore = this.get('employeeScore');
      if(employeeScore){
        employeeScore.forEach(function (item) {
          if(!validator.isValidFloat(item.score)){
            this.set('errorInfo',this.get('i18n').t('score.format.error'))
            return;
          }
        })
      }

      var data = {};
      data['score'] = employeeScore;
      request({
        name: 'post.scoreEmployees.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#employeeScoreForm').modal('hide');
          this.set('isShow',false);
        }else{
          self.set('errorInfo',this.get('i18n').t('score.format.error'));
        }
      })



    },

    categoryChanged:function(value, event){
      this.set('editProject.projectType',value);
    },



    refreshPageSize:function(){
      this.set('pageSizeValue',$('#list-status').val());
    },
    submitExclData:function () {
      Ember.$('#addSomeProjectForm').modal('hide');
    },

    //显示批量添加外协弹框
    showAddSomeProjectForm:function () {
      Ember.$('#addSomeProjectForm').modal('show');
    },

    loadStep:function () {
/*      var promise = new Promise(function (resolve,reject) {
        if(true){
          resolve();
        }else{
          reject();
        }
      })

      promise.then(function () {
        alert('sucess');
      },function () {
        alert('fail');
      })

      */

      this.set('isShow',false);
      this.set('loadProject',[]);
      this.set('editProject',[]);
      this.set('employeeScore',[]);


      var date=new Date();
      this.set('addProject.getInTime',dateUtils.formatDate(date));
      this.send('doLoadProjects');
    },
    searchedItemFromWord:function () {
      var searchResult = [];
      var loadProject = this.get('loadProject');
      var searchWord = this.get('searchWordInput').toString().toLowerCase();
      this.set('currentPage',0);
      loadProject.forEach(function (project) {
        if(project['employeeName'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['employeeCompany'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['workType'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['locatedTeam'].toString().toLowerCase().indexOf(searchWord)>=0
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
    ///获取外协列表
    doLoadProjects:function () {
      request({
        name: 'get.employee.api',
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
        name: 'edit.employee.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#editProjectForm').modal('hide');
        }
      })

    },
    doAddProject:function () {
      var data = this.get('addProject');
      request({
        name: 'add.employee.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#addProjectForm').modal('hide');
        }
      })
    }



  }
});
