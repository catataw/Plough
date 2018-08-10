import Ember from 'ember';

export default Ember.Component.extend({

  jobTime:'',

  process:Ember.computed('jobTime', {
    get(){
      if(Number(this.get('jobTime'))>=8){
        return '100%';
      }else{
        return (this.get('jobTime')/8).toFixed(2)*100+'%';
      }
    }
  }),

  isHealthy:Ember.computed('jobTime', {
    get(){
      return this.get('jobTime') >= 8;
    }
  }),
  isWarning:Ember.computed('jobTime', {
    get(){
      return this.get('jobTime') >=4 &&this.get('jobTime') <8;
    }
  }),
  isUnhealthy:Ember.computed('jobTime', {
    get(){
      return this.get('jobTime') < 4;
    }
  })


});
