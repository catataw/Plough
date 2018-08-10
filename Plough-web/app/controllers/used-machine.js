import Ember from 'ember';
import {request} from '../utils/http-helpers';
import {numberUtils} from '../utils/number_utils';
import{dateUtils} from '../utils/date';
import ENV from '../config/environment';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  os:'',
  ip:'',
  mIp:'',
  gIp:'',
  cpu:'',
  memory:'',
  disk:'',
  startTime:'',
  endTime:'',
  userEmail:'',
  useDetail:'',
  computerType:'',
  loadComputer:[],
  editComputer:{},
  searchItem:[],
  searchWordInput:'',
  deleteId:'',
  returnId:'',
  dockerTime:'',
  searchItemLength:0,

  errorInfo:'',

  pageSizeSelect:[10,50,100],
  pageSizeValue:10,
  currentPage:0,

  loadDataLength:0,

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
  endShowItem:Ember.computed('currentPage','pageSizeValue','loadDataLength', {
    get(){
      if((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadDataLength'))
      {
        return this.get('loadDataLength');
      }
      return (this.get('currentPage') + 1) * this.get('pageSizeValue');
    }
  }),
  returnComputerIps:Ember.computed('searchItem',{
    get(){
      var searchItem = this.get('searchItem');
      var ips = "";
      searchItem.forEach(function (item) {
        ips = ips +','+ item.mIp;
      })
      ips = ips.substr(1,ips.length);
      return ips;
    }
  }),

  showData:Ember.computed('endShowItem','beginShowItem', 'loadComputer','searchWordInput','searchItem',{
    get(){
      if(this.get('searchWordInput')!=''){
        return this.get('searchItem').slice(this.get('beginShowItem'),this.get('endShowItem'));
      }else{
        return this.get('loadComputer').slice(this.get('beginShowItem'),this.get('endShowItem'));
      }
    }
  }),
  editComputers:Ember.computed('searchItem',{
    get(){
      var searchItem = this.get('searchItem');
      var computers = {};
      var times={};
      searchItem.forEach(function (item) {
        computers = item;
      })
      times['endTime'] = computers['endTime'];
      times['startTime'] = computers['startTime'];
      return times;
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
    pageDown:function(){
      if(this.get('currentPage')>0){
        var page = this.get('currentPage')-1;
        this.set('currentPage',page);
      }
    },
    editActionComputers:function () {
      this.set('dockerTime','');
      Ember.$('#editComputersForm').modal('show');
    },
    doComputersEdit:function () {
      var self =this;
      var data = this.get('returnComputerIps');
      var editComputers = this.get('editComputers');
      editComputers['ips'] = data;
      editComputers['dockerTime'] = this.get('dockerTime');
      request({
        name: 'edit.computers.api',
        type: 'post',
        data:editComputers,
      }).then((data) => {
        if(data){
          Ember.$('#editComputersForm').modal('hide');
        }else{
          self.set('errorInfo','归还失败，服务器异常');
        }
      })
    },

    returnComputers:function () {
      Ember.$('#returnComputers').modal('show');
    },
    doReturnComputers:function(){
      var self =this;
      var data = this.get('returnComputerIps');
      request({
        name: 'return.computers.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#returnComputers').modal('hide');
        }else{
          self.set('errorInfo','归还失败，服务器异常');
        }
      })
   },
    searchedItemFromWord:function () {
       var searchResult = [];
       var loadComputer = this.get('loadComputer');
       var searchWord = this.get('searchWordInput').toString().toLowerCase();
       this.set('currentPage',0);
       loadComputer.forEach(function (computer) {
       if(
         computer['disk'].toString().toLowerCase().indexOf(searchWord)>=0||
         computer['userName'].toString().toLowerCase().indexOf(searchWord)>=0||
         computer['userEmail'].toString().toLowerCase().indexOf(searchWord)>=0||
         computer['useDetail'].toString().toLowerCase().indexOf(searchWord)>=0||
         computer['cpu'].toString().toLowerCase().indexOf(searchWord)>=0||
         computer['ip'].toString().toLowerCase().indexOf(searchWord)>=0||
         computer['mIp'].toString().toLowerCase().indexOf(searchWord)>=0||
         computer['cpu'].toString().toLowerCase().indexOf(searchWord)>=0||
         computer['memory'].toString().toLowerCase().indexOf(searchWord)>=0
     ){
       searchResult.pushObject(computer);
       }
       })
      if(searchResult){
        this.set('searchItemLength',searchResult.length);
        this.set('searchItem',searchResult);
      }
    },

    pageUp:function(){
      var page = this.get('currentPage')+1;
      if(page*this.get('pageSizeValue')<this.get('loadDataLength')){
        this.set('currentPage',page);
      }
    },
    sharedChanged:function (value, event) {
        this.set('editComputer.isShared',value);
    },
    safeChanged:function (value, event) {
      this.set('editComputer.isSafe',value);
    },
    areaChanged:function (value, event) {
      this.set('editComputer.area',value);
    },
    typeChanged:function (value, event) {
      this.set('editComputer.computerType',value);
    },


    loadStep:function(){
     this.send('doLoadComputer');


    },

    submitComputerAdd:function () {
      var self = this;
      self.set('errorInfo','');
      var data = {};
      data['os'] = this.get('os');
      data['ip'] = this.get('ip');
      data['mIp'] = this.get('mIp');
      data['gIp'] = this.get('gIp');
      data['cpu'] = this.get('cpu');
      data['memory'] = this.get('memory');
      data['disk'] = this.get('disk');
      data['startTime'] = this.get('startTime');
      data['endTime'] = this.get('endTime');
      data['userEmail'] = this.get('userEmail');
      data['useDetail'] = this.get('useDetail');
      data['computerType'] = $('#computerType').val();
      data['isShared'] = $('#isShared').val();
      data['isSafe'] = $('#isSafe').val();
      data['area'] = $('#area').val();
      data['dockerTime'] = this.get('dockerTime');

      request({
        name: 'add.computer.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#addComputerForm').modal('hide');
        }else{
          self.set('errorInfo','添加失败，添加机器异常！');
        }

      })
    },
    downLoadExcl:function(){
      request({
        name: 'export.computer.api',
        type: 'get',
      }).then((data) => {
         alert(data);
      })
    },

    computerEdit:function () {
      var self = this;
      self.set('errorInfo','');
      var data = this.get('editComputer');
      request({
        name: 'edit.computer.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#editComputerForm').modal('hide');
        }else{
          self.set('errorInfo','编辑失败，编辑结果异常');
        }
      })
    },

    doLoadComputer:function () {
      request({
        name: 'get.computer.api',
        type: 'get',
        data:{},
      }).then((data) => {
        if(data){
          this.set('searchItemLength',data.length);
          this.set('loadComputer',data);
          this.set('loadDataLength',data.length);
        }
      })
    },

    submitExclData:function () {
      var formData = new FormData($( "#uploadComputerExcl" )[0]);
      request({
        name: 'upload.computer.excl',
        type: 'post',
        data:formData,
      }).then((data) => {
        console.log(data);
        Ember.$('#addSomeComputersForm').modal('hide');
      })

    },

    computerDelete:function () {
      var self = this;
      self.set('errorInfo','');
      var data = {};
      data['computerId'] = this.get('deleteId');
      request({
        name: 'delete.computer.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data == 1){
          Ember.$('#deleteComputer').modal('hide');
        }else{
          self.set('errorInfo','删除失败，删除异常');
        }
      })
    },


    computerReturn:function(){
      var self=this;
      var data = {};
      data['computerId'] = this.get('returnId');
      request({
        name: 'return.computer.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data == 1){
          Ember.$('#returnComputer').modal('hide');
        }else{
          self.set('errorInfo','归还异常，归还机器失败');
        }
      })

   },
    addComputerForm:function(){
      this.set('dockerTime','');
      Ember.$('#addComputerForm').modal('show');
    },
    addSomeComputersForm:function () {
      Ember.$('#addSomeComputersForm').modal('show');
    },

    deleteComputer:function (deleteId) {
      this.set('deleteId',deleteId);
      Ember.$('#deleteComputer').modal('show');
    },


    returnComputer:function (returnId) {
      this.set('returnId',returnId);
      Ember.$('#returnComputer').modal('show');
    },


    editComputerForm:function (editComputer) {
      this.set('dockerTime','');
      this.set('editComputer',editComputer);
      Ember.$('#editComputerForm').modal('show');
    },



  }



});
