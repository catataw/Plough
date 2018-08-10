import Ember from 'ember';
import {request} from '../utils/http-helpers';
import {numberUtils} from '../utils/number_utils';
import{dateUtils} from '../utils/date';
import ENV from '../config/environment';
export default Ember.Controller.extend({

  session: Ember.inject.service('session'),
  startTime:'',
  endTime:'',
  userEmail:'',
  useDetail:'',
  computerType:'',
  loadComputer:[],
  searchItem:[],
  searchWordInput:'',

  errorInfo:'',

  pageSizeSelect:[10,50,100],
  pageSizeValue:10,
  currentPage:0,

  loadDataLength:0,

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
        return this.get('loadComputer').slice(this.get('beginShowItem'),this.get('endShowItem'));
      }
    }
  }),
  dsComputerIps:Ember.computed('searchItem',{
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
  paginationLeftClass: Ember.computed('currentPage', {
    get(){
      if(this.get("currentPage") > 0)
      {
        return "paginate_previous";
      }
      return "paginate_disabled_previous";
    }
  }),
  actions: {

    distributeComputer:function () {
      Ember.$('#distributeComputerForm').modal('show');
    },
    distributeComputerSubmit(){
      var self = this;
      self.set('errorInfo','');
      var data = {};
      data['mIp'] = this.get('dsComputerIps');
      data['startTime'] = this.get('startTime');
      data['endTime'] = this.get('endTime');
      data['userEmail'] = this.get('userEmail');
      data['useDetail'] = this.get('useDetail');
      data['computerType'] = $('#computerType').val();
      data['isShared'] = $('#isShared').val();
      data['isSafe'] = $('#isSafe').val();
      data['area'] = $('#area').val();

      request({
        name: 'distribute.computer.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#distributeComputerForm').modal('hide');
        }else{
          self.set('errorInfo','分配异常，分配机器失败！');
        }

      })
    },
    refreshPageSize: function () {
      this.set('pageSizeValue', $('#list-status').val());
    },
    pageDown: function () {
      if (this.get('currentPage') > 0) {
        var page = this.get('currentPage') - 1;
        this.set('currentPage', page);
      }
    },

    searchedItemFromWord: function () {
      var searchResult = [];
      var loadComputer = this.get('loadComputer');
      var searchWord = this.get('searchWordInput').toString().toLowerCase();
      this.set('currentPage', 0);
      loadComputer.forEach(function (computer) {
        if (computer['ip'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
          computer['mIp'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
          computer['cpu'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
          computer['memory'].toString().toLowerCase().indexOf(searchWord) >= 0) {
          searchResult.pushObject(computer);
        }
      })
      this.set('searchItem', searchResult);
    },

    pageUp: function () {
      var page = this.get('currentPage') + 1;
      if (page * this.get('pageSizeValue') < this.get('loadDataLength')) {
        this.set('currentPage', page);
      }
    },
    sharedChanged: function (value, event) {
      this.set('editComputer.isShared', value);
    },
    safeChanged: function (value, event) {
      this.set('editComputer.isSafe', value);
    },
    areaChanged: function (value, event) {
      this.set('editComputer.area', value);
    },
    typeChanged: function (value, event) {
      this.set('editComputer.computerType', value);
    },


    loadStep: function () {
      this.send('loadComputer');
     // var data = [];
    //  data = [{"ip":"10.254.9.78","mIp":"10.255.9.78","cpu":"32","memory":"256","disk":"4*3T\/2*900G","area":"2015\u5e74IDC\u6269\u5bb9\u5de5\u7a0b"},{"ip":"10.254.9.63","mIp":"10.255.9.63","cpu":"32","memory":"256","disk":"4*3T\/2*900G","area":"2015\u5e74IDC\u6269\u5bb9\u5de5\u7a0b"}];
     // this.set('loadDataLength',data.length);
      //this.set('loadComputer',data);
    },
    loadComputer:function () {
      request({
        name: 'get.leftComputer.api',
        type: 'get',
        data:{},
      }).then((data) => {
        this.set('loadComputer',data);
        this.set('loadDataLength',data.length);
      })
    },
  }
});
