import Ember from 'ember';
import {request} from '../utils/http-helpers';
import {numberUtils} from '../utils/number_utils';
import{dateUtils} from '../utils/date';
import ENV from '../config/environment';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  loadComplain:[],
  urlPath:'',
  searchItem:[],
  searchWordInput:'',
  editComplain:{},
  addComplain:{},
  deleteId:'',
  errorInfo:'',
  pageSizeSelect:[10,50,100],
  pageSizeValue:10,
  currentPage:0,

  loadComplainLength:0,

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
  endShowItem:Ember.computed('currentPage','pageSizeValue','loadComplainLength', {
    get(){
      if((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadComplainLength'))
      {
        return this.get('loadComplainLength');
      }
      return (this.get('currentPage') + 1) * this.get('pageSizeValue');
    }
  }),


  showData:Ember.computed('endShowItem','beginShowItem', 'loadComplain','searchWordInput','searchItem',{
    get(){
      if(this.get('searchWordInput')!=''){
        return this.get('searchItem').slice(this.get('beginShowItem'),this.get('endShowItem'));
      }else{
        return this.get('loadComplain').slice(this.get('beginShowItem'),this.get('endShowItem'));
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
    downloadUrlPath:function(urlPath){
      request({
        name: 'get.urlPath.api',
        type: 'post',
        data:{'urlPath':urlPath},
      }).then((data) => {
          alert("ffff");

      })

    },

    loadStep: function () {
     this.send('loadComplain');

     //var data = [{"id":"1","projectId":"dddd","projectName":"ddd","complainant":"ddd","complaintLevel":"2","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"dd","urlPath":"string(31) \".\/Public\/upload\/1502875994.xlsx\"\n"},{"id":"2","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddgg","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"3","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggd","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"4","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdf","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"5","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdff","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"6","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdfff","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"7","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdfffd","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"8","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdfffda","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"9","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdfffdag","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"10","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdfffdags","urlPath":".\/Public\/upload\/1502876104.xls"}];

    //  var data = [{"ip":"10.254.9.78","mIp":"10.255.9.78","cpu":"32","memory":"256","disk":"4*3T\/2*900G","area":"2015\u5e74IDC\u6269\u5bb9\u5de5\u7a0b"},{"ip":"10.254.9.63","mIp":"10.255.9.63","cpu":"32","memory":"256","disk":"4*3T\/2*900G","area":"2015\u5e74IDC\u6269\u5bb9\u5de5\u7a0b"}];
     // this.set('loadComplainLength',data.length);
     // this.set('loadComplain',data);
    },
    loadComplain:function () {
      request({
        name: 'get.allComplain.api',
        type: 'get',
        data:{},
      }).then((data) => {
        console.log(data);
        this.set('loadComplain',data);
        this.set('loadComplainLength',data.length);
      })
    },

    showAddComplainForm:function () {
        Ember.$('#addComplainForm').modal('show');
    },
    doAddComplainForm:function () {
      var addComplain = this.get('addComplain');
      addComplain.urlPath = this.get('urlPath');
      console.log(addComplain);
      request({
        name: 'add.complain.api',
        type: 'post',
        data:addComplain,
      }).then((data) => {
        if(data){
          Ember.$('#addComplainForm').modal('hide');
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
      var loadComplain = this.get('loadComplain');
      var searchWord = this.get('searchWordInput').toString().toLowerCase();
      this.set('currentPage', 0);
      loadComplain.forEach(function (complain) {
        if (complain['projectName'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
          complain['complainant'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
          complain['complaintWay'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
          complain['respondent'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
          complain['status'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
          complain['complaintLevel'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
          complain['complaintCompany'].toString().toLowerCase().indexOf(searchWord) >= 0) {
          searchResult.pushObject(complain);
        }
      })
      this.set('searchItem', searchResult);
    },

    pageUp: function () {
      var page = this.get('currentPage') + 1;
      if (page * this.get('pageSizeValue') < this.get('loadComplainLength')) {
        this.set('currentPage', page);
      }
    },

    categoryChanged:function(value, event){
      this.set('addComplain.status',value);
    },

    levelChanged:function (value, event) {
      this.set('addComplain.complaintLevel',value);
    },

    showEditComplainForm:function (complain) {
     this.set('editComplain',complain);
      Ember.$('#editComplainForm').modal('show');
    },
    doEditComplain:function () {
      var self =this;
      var editComplain = this.get('editComplain');
      request({
        name: 'edit.complain.api',
        type: 'post',
        data:editComplain,
      }).then((data) => {
        if(data){
          Ember.$('#editComplainForm').modal('hide');
        }else{
          self.set('errorInfo','投诉修改失败，服务器异常');
        }
      })
    },
    showFeleteComplainForm:function (deleteId) {
       this.set('deleteId',deleteId);
      Ember.$('#deleteComplainForm').modal('show');
    },

    doComplainDelete:function () {
      var self = this;
      self.set('errorInfo','');
      var data = {};
      data['id'] = this.get('deleteId');
      request({
        name: 'delete.complain.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data == 1){
          Ember.$('#deleteComplainForm').modal('hide');
        }else{
          self.set('errorInfo','删除失败，删除异常');
        }
      })
    }


  }

});
