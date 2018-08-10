import Ember from 'ember';
import {request} from '../utils/http-helpers';



export default Ember.Component.extend({

  workInfo:{},
  startTime:'',
  endTime:'',
  workTimeProcss:0,
  process:Ember.computed('workTimeProcss', {
    get(){
      var workTimeProcss =this.get('workTimeProcss');
      return workTimeProcss +'%';
    }
  }),
  isHealthy:Ember.computed('workTimeProcss', {
    get(){
      return this.get('workTimeProcss') >= 100;
    }
  }),
  isWarning:Ember.computed('workTimeProcss', {
    get(){
      return this.get('workTimeProcss') >=50 &&this.get('workTimeProcss') <100;
    }
  }),
  isUnhealthy:Ember.computed('workTimeProcss', {
    get(){
      return this.get('workTimeProcss') < 50;
    }
  }),

  writeTimeChange:Ember.observer('endTime','startTime',function () {
    var endTime = this.get('endTime');
    var startTime = this.get('startTime');
    if(startTime&&endTime){
      this.reset();
    }
  }),

  reset(){
    var workInfo = this.get('workInfo');
    var self = this;
    workInfo['startTime'] = this.get('startTime');
    workInfo['endTime'] = this.get('endTime');
    request({
      name: 'get.people.process',
      type: 'post',
      data:workInfo
    }).then((data) => {
      console.log(data);
      self.set('workTimeProcss',data);
    })
  },

  init() {
    this._super.apply(this, arguments);
    this.reset();
  },




});
