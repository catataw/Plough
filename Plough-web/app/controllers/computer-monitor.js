import Ember from 'ember';
import {request} from '../utils/http-helpers';

export default Ember.Controller.extend({

  loadComputer:[],
  loadDataLength:0,
  pageSizeSelect:[5,10,20],
  pageSizeValue:5,
  currentPage:0,
  searchItem:[],
  searchWordInput:'',

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
        return this.get('loadComputer').slice(this.get('beginShowItem'),this.get('endShowItem'));
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
    searchedItemFromWord:function () {
      var searchResult = [];
      var loadComputer = this.get('loadComputer');
      var searchWordInput =  this.get('searchWordInput');
      if(searchWordInput){
        var searchWord = this.get('searchWordInput').toString().toLowerCase();
        this.set('currentPage',0);
        loadComputer.forEach(function (computer) {
          if(computer['userName'].toString().toLowerCase().indexOf(searchWord)>=0||
            computer['userEmail'].toString().toLowerCase().indexOf(searchWord)>=0||
            computer['ip'].toString().toLowerCase().indexOf(searchWord)>=0){
            searchResult.pushObject(computer);
          }
        })
        this.set('searchItem',searchResult);
      }else{
        this.set('searchItem',loadComputer);
      }


    },
    refreshPageSize:function(){
      this.set('pageSizeValue',$('#list-status').val());
    },
    pageUp:function(){
      var page = this.get('currentPage')+1;
      if(page*this.get('pageSizeValue')<this.get('searchItemLength')){
        this.set('currentPage',page);
      }
    },
    pageDown:function(){
      if(this.get('currentPage')>0){
        var page = this.get('currentPage')-1;
        this.set('currentPage',page);
      }
    },
    loadStep:function () {
      this.send('doLoadComputer');
    },

    doLoadComputer:function () {
      request({
        name: 'get.getZabbixHostInfo.api',
        type: 'get',
        data:{},
      }).then((data) => {

        this.set('loadComputer',data);
        this.set('loadDataLength',data.length);
        this.set('searchItem',data);
      })
    },
  }
});
