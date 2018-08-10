import Ember from 'ember';
import {request} from '../../utils/http-helpers';

export default Ember.Controller.extend({
  relatedId:'',
  showChangeList:[],
  projectName:'',
  currentTeam:'',
  showLength:Ember.computed('showChangeList',{
    get(){
      var showChangeList = this.get('showChangeList');
      if(showChangeList){
        return showChangeList.length;
      }else{
        return 0;
      }
    }
  }),

  actions:{
    loadStep(){
      var self = this;
      var data = {};
      data['id'] = this.get('relatedId');
      request({
        name:  'get.project.change.item',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          self.set('showChangeList',data);
        }
      })
    }
  }

});
