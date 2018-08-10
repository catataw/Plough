import Ember from 'ember';
import {request} from '../../utils/http-helpers';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),

  loadComputer:[],
  editComputer:{},
  searchItem:[],
  searchWordInput:'',
  date:'',
  errorInfo:'',

  pageSizeSelect:[10,50,100],
  pageSizeValue:10,
  currentPage:0,
  searchItemLength:0,
  loadDataLength:0,
  recruitCode:'',

  dateChange: Ember.observer('date', function() {
    this.send('doLoadDemand');
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
  endShowItem:Ember.computed('currentPage','pageSizeValue','loadDataLength', {
    get(){
      if((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadDataLength'))
      {
        return this.get('loadDataLength');
      }
      return (this.get('currentPage') + 1) * this.get('pageSizeValue');
    }
  }),


  showData:Ember.computed('endShowItem','beginShowItem', 'loadComputer','searchWordInput','searchItem',{
    get(){
      if(this.get('searchWordInput')!=''){
        return this.get('searchItem').slice(this.get('beginShowItem'),this.get('endShowItem'));
      }else{
        if(this.get('loadDataLength')>0){
          return this.get('loadComputer').slice(this.get('beginShowItem'),this.get('endShowItem'));
        }else{
          return [];
        }

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



    searchedItemFromWord:function () {
      var searchResult = [];
      var loadComputer = this.get('loadComputer');
      var searchWord = this.get('searchWordInput').toString().toLowerCase();
      this.set('currentPage',0);
      loadComputer.forEach(function (computer) {
        console.log(computer);
        if(computer['tenant'].toString().toLowerCase().indexOf(searchWord)>=0||
          computer['officerName'].toString().toLowerCase().indexOf(searchWord)>=0||
          computer['ip'].toString().toLowerCase().indexOf(searchWord)>=0){
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

    addSomeComputersForm:function () {
      Ember.$('#addSomeComputersForm').modal('show');
    },

    loadStep:function(){
      this.send('doLoadDemand');

    },

    submitExclData:function () {
      Ember.$('#addSomeComputersForm').modal('hide');
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



    doLoadDemand:function () {
      var data = {};
      request({
        name: 'get.recruit.demands.api',
        type: 'get',
        data:data,
      }).then((data) => {
        if(data){
          this.set('searchItemLength',data.length);
          this.set('loadComputer',data);
          this.set('loadDataLength',data.length);
          if(this.get('searchWordInput')){
            this.send('searchedItemFromWord');
          }
        }else{
          this.set('searchItemLength',);
          this.set('loadComputer',[]);
          this.set('loadDataLength',0);
        }
      })
    },




    deleteComputer:function (deleteId) {
      this.set('deleteId',deleteId);
      Ember.$('#deleteComputer').modal('show');
    },



    editComputerForm:function (editComputer) {
      this.set('editComputer',editComputer);
      console.log(editComputer);
      Ember.$('#editComputerForm').modal('show');
    },
    virtualEdit:function () {
      var self = this;
      self.set('errorInfo','');
      var data = this.get('editComputer');
      request({
        name: 'edit.virtual.api',
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


  }



});
