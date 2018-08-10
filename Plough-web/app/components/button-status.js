import Ember from 'ember';

export default Ember.Component.extend({
  statusValue:'',
  value:'',

  isHealthy:Ember.computed('statusValue', {
    get(){
      return this.get('statusValue') === 1;
    }
  }),
  isUnhealthy:Ember.computed('statusValue', {
    get(){
      return this.get('statusValue') === 3;
    }
  }),
  isWarning:Ember.computed('statusValue', {
    get(){
      return this.get('statusValue') === 2;
    }
  })


});
