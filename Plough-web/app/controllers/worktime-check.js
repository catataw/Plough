import Ember from 'ember';
import {request} from '../utils/http-helpers';
import{dateUtils} from '../utils/date';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  loadUsers:[],
  searchWordInput:'',
  searchItem:[],
  pageSizeSelect:[10,50,100],
  pageSizeValue:10,
  currentPage:0,
  loadDataLength:0,
  editUser:{},
  errorInfo:'',

  startTime:'',
  endTime:'',


  beginShowItem:Ember.computed('currentPage','pageSizeValue',{
    get(){
      return this.get('currentPage')*this.get('pageSizeValue');
    }
  }),
  writeTimeChange:Ember.observer('startTime','endTime',function(){

    //this.send('doLoadUsers');
  }),

  endShowItem:Ember.computed('currentPage','pageSizeValue','loadDataLength', {
    get(){
      if((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadDataLength'))
      {
        return this.get('loadDataLength');
      }
      return (this.get('currentPage') + 1) * this.get('pageSizeValue');
    }
  }),
  showData:Ember.computed('endShowItem','beginShowItem', 'loadUsers','searchWordInput','searchItem',{
    get(){
      if(this.get('searchWordInput')!=''){
        return this.get('searchItem').slice(this.get('beginShowItem'),this.get('endShowItem'));
      }else{
        return this.get('loadUsers').slice(this.get('beginShowItem'),this.get('endShowItem'));
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
    refreshPageSize:function(){
      this.set('pageSizeValue',$('#list-status').val());
    },
    loadStep:function(){
       var endTime = this.get('endTime');
       var date=new Date();
       var year = date.getFullYear();
       var month = date.getMonth();
       var date =  new Date(year, month, 1);
       var localTime = dateUtils.formatDate(date);
       this.set('startTime',localTime);
       this.send('doLoadUsers');
    },

    pageDown:function(){
      if(this.get('currentPage')>0){
        var page = this.get('currentPage')-1;
        this.set('currentPage',page);
      }
    },
    searchedItemFromWord:function () {
      var searchResult = [];
      var loadUsers = this.get('loadUsers');
      var searchWord = this.get('searchWordInput').toString().toLowerCase();
      this.set('currentPage',0);
      loadUsers.forEach(function (user) {
        if(user['userName'].toString().toLowerCase().indexOf(searchWord)>=0||
          user['userEmail'].toString().toLowerCase().indexOf(searchWord)>=0||
          user['userTeam'].toString().toLowerCase().indexOf(searchWord)>=0
        ){
          searchResult.pushObject(user);
        }
      })
      this.set('searchItem',searchResult);
    },

    pageUp:function(){
      var page = this.get('currentPage')+1;
      if(page*this.get('pageSizeValue')<this.get('loadDataLength')){
        this.set('currentPage',page);
      }
    },
    //获取展现工时的 员工列表
    doLoadUsers:function () {
      request({
        name: 'get.getAllUserInfo.api',
        type: 'get',
        data:{},
      }).then((data) => {
        this.set('loadUsers',data);
        this.set('loadDataLength',data.length);
      })
    },

    editUserForm:function (editUser) {
      this.set('editUser',editUser);
      Ember.$('#editUserForm').modal('show');
    },

    typeChanged:function (value, event) {
      this.set('editUser.userType',value);
    },

    userEdit:function () {
      var self = this;
      self.set('errorInfo','');
      var data = this.get('editUser');
      request({
        name: 'edit.user.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#editUserForm').modal('hide');
        }else{
          self.set('errorInfo','编辑失败，编辑结果异常');
        }
      })
    },

  }

});
