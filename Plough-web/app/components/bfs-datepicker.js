//import Component from '@ember/component';
import Ember from 'ember';
// import Mock from 'npm:mockjs';
export default Ember.Component.extend({
  _id: '12345', //设置id
  Value: '',
  Format:'yyyy-mm-dd',
  EndDate:'',
  StartDate:'',
  MinView:2,
  Readonly: true,
  Disabled: false,
  Class: '',
  didInsertElement(){
    Ember.$('#' + this.get('_id')).datetimepicker({
      format: this.get('Format'),
      language: 'cn',
      weekStart: 1,
      autoclose: 1,
      startView: 2,
      minView: this.get('MinView'),
      forceParse: 0,
      endDate:this.get('EndDate'),
      startDate:this.get('StartDate')
    });

  },
  init(){
    this._super.apply(this, arguments);
    this.set('_id', Math.random().toString(36).substr(2));
    
   // this.set('StartDate',new Date());
  }
});
