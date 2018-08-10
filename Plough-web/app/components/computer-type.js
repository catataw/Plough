import Ember from 'ember';

export default Ember.Component.extend({

  type:"1",

  isLong:Ember.computed('type', {
    get(){
      return this.get('type') === '1';
    }
  }),
  isShort:Ember.computed('type', {
    get(){
      return this.get('type') === '2';
    }
  })
});
