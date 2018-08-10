import Ember from 'ember';
import {request} from '../utils/http-helpers';
import {numberUtils} from '../utils/number_utils';
import{dateUtils} from '../utils/date';
import ENV from '../config/environment';

export default Ember.Controller.extend({

  session: Ember.inject.service('session'),


//添加个人的项目列表
  projects: [],
  destination:'',
  selectedProjectsItem:[],
  selectedProjects:[],
  loadProject:[],

  searchItem:[],
  searchWordInput:'',
  editProject:{},
  searchItemLength:0,
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
      if(this.get('loadProject')){
        if(this.get('searchWordInput')!=''){
          return this.get('searchItem').slice(this.get('beginShowItem'),this.get('endShowItem'));
        }else{
          return this.get('loadProject').slice(this.get('beginShowItem'),this.get('endShowItem'));
        }
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
    closeAddProject:function () {
      var self = this;
      self.set('selectedProjects',[]);
      self.set('projects',[]);
      $('#divbg').addClass('hide');
      $('#diveditcontent').addClass('hide');
      $('body').removeClass('no-scroll');
    },
    chooseDestination(city) {
      this.set('destination', city);
    },

    doAddProjects:function () {
      var destination = this.get('destination');
      var selectedProjects = this.get('selectedProjects');
      var tag = 1;
      if(selectedProjects.length>0){
        selectedProjects.forEach(function (item) {
          if(item == destination){
            tag = 2;
          }
        })
        if(tag == 1){
          selectedProjects.pushObject(destination);
        }
      }else{
        selectedProjects.pushObject(destination);
      }

      console.log(selectedProjects);
    },

    deleteRecord:function(project){
      var selectedProjects = this.get('selectedProjects');
      var newSelectedProjects = [];
      selectedProjects.forEach(function (item,index) {
        if(item.name != project.name){
          newSelectedProjects.pushObject(item);
        }
      })
      this.set('selectedProjects',newSelectedProjects);
    },



    //添加个人项目
    submitAddProject:function () {
      var data = this.get('selectedProjects');
      var self = this;
      request({
        name: 'post.addProject.api',
        type: 'post',
        data:data,
      }).then((data) => {
        self.set('selectedProjects',[]);
        $('#divbg').addClass('hide');
        $('#diveditcontent').addClass('hide');
        $('body').removeClass('no-scroll');
        this.send('doLoadProjects');
      })
    },

    //显示个人可添加项目
    doAddWorkerProject:function () {
      var data = {};
      var projects = [];
      var self =this;
      request({
        name: 'get.joinProject.api',
        type: 'get',
        data:data,
      }).then((data) => {
        var destination = data[0]['projectName'];
        self.set('destination',destination);
        data.forEach(function (item) {
          projects.push(item.projectName);
        })
        self.set('projects',projects);
        $('body').addClass('no-scroll');
        $('#divbg').removeClass('hide');
        $('#diveditcontent').removeClass('hide');
      })

    },
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
        if(project['projectManagerId'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['projectName'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['projectType'].toString().toLowerCase().indexOf(searchWord)>=0||
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
      this.set('loadProject',[]);
      this.set('loadProjectLength',0);
      request({
        name: 'get.person.projects',
        type: 'get',
        data:{},
      }).then((data) => {
        if(data){
          this.set('searchItemLength',data.length);
          this.set('loadProject',data);
          this.set('loadProjectLength',data.length);
        }
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
