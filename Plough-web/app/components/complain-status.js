import Ember from 'ember';

export default Ember.Component.extend({

  type:"1",

  isGet:Ember.computed('type', {
    get(){
      return this.get('type') === '1';
    }
  }),
  isDeal:Ember.computed('type', {
    get(){
      return this.get('type') === '2';
    }
  }),
  isFeedback:Ember.computed('type', {
    get(){
      return this.get('type') === '3';
    }
  }),
  isClose:Ember.computed('type', {
    get(){
      return this.get('type') === '4';
    }
  })
});
