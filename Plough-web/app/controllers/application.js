import Ember from 'ember';
import {request} from '../utils/http-helpers';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  userInfo:{},
  errorInfo:'',
  all_list:[],
  actions: {
    appEditUserForm:function () {
      var all_list = this.get('all_list')
      console.log(all_list);
      Ember.$('#appEditUserForm').modal('show');
    },

    appUserEdit:function () {
      var self = this;
      self.set('errorInfo','');
      var data = this.get('userInfo');
      request({
        name: 'edit.user.api',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          Ember.$('#appEditUserForm').modal('hide');
        }else{
          self.set('errorInfo','编辑失败，编辑结果异常');
        }
      })
    },
    // 触发模态框 生产调度-历史
    /*  triggerModal(){
      Ember.$("#history-info").modal('show');
    }  */
  }
});
