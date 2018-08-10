import Ember from 'ember';
import {request} from '../../utils/http-helpers';

export default Ember.Controller.extend({
 //获取项目列表
  projectNames: [],
  destination:'',
  selectedProjectsItem:[],
  selectedProjects:[],
  loadProject:[],
  changeProject:[],
  //历史变更期数
   historyChangeTeam:[],
  //变更列表
  changeList:[],
  //当前选中期
  currentTeam:{},
  //添加变更的记录
  addChangeRecord:{},
  //需删除变更记录
  deleteItem:{},

  //编辑中的变更记录
  editItem:{},

  //显示变更
  showChangeList:Ember.computed('changeList',{
    get(){
      var changeList = this.get('changeList');
      var showDate = [];
      if(changeList){
        changeList.forEach(function (item) {
          var date = new Date(item.createTime).getTime();
          var now = new Date().getTime();
          var distance = now - date;
          if(distance<1209600000){
            item['isEdit'] = true;
          }
          showDate.pushObject(item);
        })
      }
      console.log(showDate);
      return showDate;
    }
  }),


  //是否可添加变更
  isAddChange:Ember.computed('currentTeam',{
    get(){
      var currentTeam = this.get('currentTeam');
      return currentTeam.isAddChange;
    }
  }),

  showLength:0,


  actions:{
    chooseDestination(city) {
      this.set('addChangeRecord.projectName', city);
    },

    chooseEditDestination(city){
      this.set('editItem.projectName', city);
    },
    changeHaveJira:function (value, event) {
      this.set('addChangeRecord.haveJira',value);
    },
    changeEditHaveJira:function (value, event) {
      this.set('editItem.haveJira',value);
    },
    changeLevel:function (value, event) {
      this.set('addChangeRecord.level',value);
    },
    changeEditLevel:function (value, event) {
      this.set('editItem.level',value);
    },
    changeHaveScheme:function (value, event) {
      this.set('addChangeRecord.haveScheme',value);
    },
    changeEditHaveScheme:function (value, event) {
      this.set('editItem.haveScheme',value);
    },
    closeEditChangeHistory:function () {
      $('#divbg').addClass('hide');
      $('#editChangeHistory').addClass('hide');
    },


    editChangeRecord(item){
      this.set('editItem',item);
      var data = {};
      var projectNames = [];
      var self =this;
      request({
        name: 'get.solProject.api',
        type: 'get',
        data:data,
      }).then((data) => {
        data.forEach(function (item) {
          projectNames.push(item.projectName);
        })
        self.set('projectNames',projectNames);
        $('body').addClass('no-scroll');
        $('#divbg').removeClass('hide');
        $('#editChangeHistory').removeClass('hide');
      })
    },


    doAddChangeHistory() {
      var data = {};
      var projectNames = [];
      var self =this;
      request({
        name: 'get.solProject.api',
        type: 'get',
        data:data,
      }).then((data) => {
        var destination = data[0]['projectName'];
        self.set('addChangeRecord.projectName',destination);
        data.forEach(function (item) {
          projectNames.push(item.projectName);
        })
        self.set('projectNames',projectNames);
        console.log(projectNames)
        $('body').addClass('no-scroll');
        $('#divbg').removeClass('hide');
        $('#addChangeHistory').removeClass('hide');
      })
    },

    loadStep(){
      this.send('doLoadChangeTeam');
    },

    //获取变更期数
    doLoadChangeTeam(){

      var self = this;
      self.set('changeList',0);
      self.set('changeList',[]);
      request({
        name: 'get.change.team',
        type: 'get',
        data:{},
      }).then((data) => {
        if(data){
          //显示
          self.set('historyChangeTeam',data);
          var currentTeam = data[0];
          self.set('currentTeam',currentTeam);
          request({
            name: 'get.change.item',
            type: 'post',
            data:currentTeam,
          }).then((data) => {
            if(data.data){
              self.set('changeList',data.data);
              self.set('showLength',data.data.length)
            }
          })
        }
      })
    },


    //获取选中期变更信息
    loadCurrentTeam:function (treeValue) {
      var self = this;
      self.set('changeList',0);
      self.set('changeList',[]);
      self.set('currentTeam',treeValue);
      self.set('changeList',[]);
      var id = treeValue.id;
      $('.team-row').removeClass('chose-row');

      $('#'+id).addClass('chose-row');

      if(treeValue){
        request({
          name: 'get.change.item',
          type: 'post',
          data:treeValue,
        }).then((data) => {
          if(data.data){
            self.set('changeList',data.data);
            self.set('showLength',data.data.length)
          }
        })
      }
    },

    //刷新选中变更信息
    freshCurrentTeam:function () {
      var self = this;
      var treeValue = self.get('currentTeam');
      self.set('changeList',[]);
      if(treeValue){
        request({
          name: 'get.change.item',
          type: 'post',
          data:treeValue,
        }).then((data) => {
          if(data.data){
            self.set('changeList',data.data);
          }
        })
      }
    },


    //显示删除变更信息
    showDeleteChangeRecord(item){
      this.set('deleteItem',item);
      Ember.$('#deleteChangeRecordForm').modal('show');
    },
    //执行删除操作
    doDeleteChangeRecord(){
      var self = this;
      var deleteItem = this.get('deleteItem');
      if(deleteItem){
        request({
          name: 'delete.change.item',
          type: 'post',
          data:deleteItem,
        }).then((data) => {
          if(data){
            Ember.$('#deleteChangeRecordForm').modal('hide');
            self.send('freshCurrentTeam');
          }
        })
      }
    },


    //影藏添加变更表单
    closeAddChangeHistory(){
      $('#divbg').addClass('hide');
      $('#addChangeHistory').addClass('hide');
    },


    //新增变更
    submitAddChangeHistory(){
      var self = this;
      var addChangeRecord = this.get('addChangeRecord');
      var currentTeam = this.get('currentTeam');
      addChangeRecord['monday'] = currentTeam['monday'];
      if(addChangeRecord){
        request({
          name: 'add.change.item',
          type: 'post',
          data:addChangeRecord,
        }).then((data) => {
          if(data.status==1){
            $('#divbg').addClass('hide');
            $('#addChangeHistory').addClass('hide');
            self.send('freshCurrentTeam');
          }
        })
      }
    },
    //提交变更记录
    submitEditChangeHistory(){
      var self = this;
      var editItem = this.get('editItem');
      console.log(editItem);
      if(editItem){
        request({
          name: 'edit.change.item',
          type: 'post',
          data:editItem,
        }).then((data) => {
          if(data.status==1){
            $('#divbg').addClass('hide');
            $('#editChangeHistory').addClass('hide');
          }
        })
      }
    },
  }
});
