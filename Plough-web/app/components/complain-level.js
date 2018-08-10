import Ember from 'ember';

export default Ember.Component.extend({

  type:"1",

  isUsual:Ember.computed('type', {
    get(){
      return this.get('type') === '1';
    }
  }),
  isSerious:Ember.computed('type', {
    get(){
      return this.get('type') === '2';
    }
  }),
  isImportant:Ember.computed('type', {
    get(){
      return this.get('type') === '3';
    }
  })
});
