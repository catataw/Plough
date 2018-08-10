import Ember from 'ember';
import {request} from '../utils/http-helpers';
export default Ember.Controller.extend({

  loadLogs:[],
  searchWordInput:'',
  searchItem:[],
  pageSizeSelect:[10,50,100],
  pageSizeValue:10,
  currentPage:0,
  loadDataLength:0,

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
  showData:Ember.computed('endShowItem','beginShowItem', 'loadLogs','searchWordInput','searchItem',{
    get(){
      if(this.get('searchWordInput')!=''){
        return this.get('searchItem').slice(this.get('beginShowItem'),this.get('endShowItem'));
      }else{
        return this.get('loadLogs').slice(this.get('beginShowItem'),this.get('endShowItem'));
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

      this.send('doLoadLogs');


    },
    pageDown:function(){
      if(this.get('currentPage')>0){
        var page = this.get('currentPage')-1;
        this.set('currentPage',page);
      }
    },
    searchedItemFromWord:function () {
      var searchResult = [];
      var loadLogs = this.get('loadLogs');
      var searchWord = this.get('searchWordInput').toString().toLowerCase();
      this.set('currentPage',0);
      loadLogs.forEach(function (log) {
        if(log['logDetail'].toString().toLowerCase().indexOf(searchWord)>=0){
          searchResult.pushObject(log);
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
    doLoadLogs:function () {
      request({
        name: 'get.logs.api',
        type: 'get',
        data:{},
      }).then((data) => {
        this.set('loadLogs',data);
        this.set('loadDataLength',data.length);
      })
    },

  }

});
