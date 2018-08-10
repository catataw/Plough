import Ember from 'ember';

export default Ember.Component.extend({

  statusValue:'',

  isOrigin:Ember.computed('statusValue', {
    get(){
      return this.get('statusValue') == 1;
    }
  }),
  isAdmin:Ember.computed('statusValue', {
    get(){
      return this.get('statusValue') == 3;
    }
  }),
  isSuper:Ember.computed('statusValue', {
    get(){
      return this.get('statusValue') == 2;
    }
  }),
  isTeamLeader:Ember.computed('statusValue', {
    get(){
      return this.get('statusValue') == 4;
    }
  }),
  isBigTeamLeader:Ember.computed('statusValue', {
    get(){
      return this.get('statusValue') == 5;
    }
  })

});
