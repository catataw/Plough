/**
 * 包装的modal窗口
 */
import Ember from 'ember';

export default Ember.Component.extend({
  modalId:'default',
  errorInfo:'',

  actions:{
    sureAct(){ //确定时触发的事件
      this.sendAction('hEvent');
    },

    closeAct(){ //取消是出发
      this.sendAction('hClose');
    }
  }


});
