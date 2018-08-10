import Ember from 'ember';
import {request} from '../utils/http-helpers';
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
  deleteUserInfo:{},
  errorInfo:'',
  addTeam:{},



  beginShowItem:Ember.computed('currentPage','pageSizeValue',{
    get(){
      return this.get('currentPage')*this.get('pageSizeValue');
    }
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

      this.send('doLoadUsers');


    },
    //展示删除用户弹框
    deleteUser:function (userInfo) {
      this.set('deleteUserInfo',userInfo);
      Ember.$('#deleteUser').modal('show');
    },
    //执行删除用户操作
    userDelete:function () {
      var data = this.get('deleteUserInfo');
      request({
        name: 'delete.team.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#deleteUser').modal('hide');
        }else{
          self.set('errorInfo','删除失败，删除结果异常');
        }
      })
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
        if(user['teamName'].toString().toLowerCase().indexOf(searchWord)>=0||
          user['teamLeader'].toString().toLowerCase().indexOf(searchWord)>=0||
          user['bigTeamLeader'].toString().toLowerCase().indexOf(searchWord)>=0
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
    doLoadUsers:function () {
      request({
        name: 'get.team.api',
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
        name: 'edit.team.api',
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

    addTeam:function(){
      this.set('addTeam',{});
      Ember.$('#addTeamForm').modal('show');
    },


    doAddTeam:function () {
      var self = this;
      self.set('errorInfo','');
      var addTeam = self.get('addTeam');
      request({
        name: 'add.team.api',
        type: 'post',
        data:addTeam,
      }).then((data) => {
        if(data){
          Ember.$('#addTeamForm').modal('hide');
        }else{
          self.set('errorInfo','添加失败，添加小组异常！');
        }
      })
    }
  }

});
