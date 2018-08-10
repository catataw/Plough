import Ember from 'ember';
import {request} from '../utils/http-helpers';
import {numberUtils} from '../utils/number_utils';
import{dateUtils} from '../utils/date';
import ENV from '../config/environment';

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

  deleteProject:{},

  loadProjectLength:0,

  searchItemLength:0,

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

    showDeleteProject:function (deleteProject) {
      this.set('deleteProject',deleteProject);
      Ember.$('#deleteProject').modal('show');
    },
    showDeletSomeProjectForm:function () {
      Ember.$('#deleteSomeProjectForm').modal('show');
    },


    doDeleteProject:function () {
      var self = this;
      self.set('errorInfo','');
      var data = this.get('deleteProject');
      request({
        name: 'delete.project.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data == 1){
          Ember.$('#deleteProject').modal('hide');
        }else{
          self.set('errorInfo','删除失败，删除异常');
        }
      })
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
        if(project['projectManagerId'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['projectName'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['projectId'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['projectPeople'].toString().toLowerCase().indexOf(searchWord)>=0
         ){
          searchResult.pushObject(project);
        }
      })
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
        name: 'get.newProject.api',
        type: 'get',
        data:{},
      }).then((data) => {
        this.set('loadProject',data);
        this.set('searchItemLength',data.length);
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
        name: 'edit.newProject.api',
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
