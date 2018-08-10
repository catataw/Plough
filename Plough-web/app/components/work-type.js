import Ember from 'ember';

export default Ember.Component.extend({
  type:'',

  isA:Ember.computed('type', {
    get(){
      return this.get('type') == 1;
    }
  }),
  isB:Ember.computed('type', {
    get(){
      return this.get('type') == 2;
    }
  }),
  isC:Ember.computed('type', {
    get(){
      return this.get('type') == 3;
    }
  }),
  isD:Ember.computed('type', {
    get(){
      return this.get('type') == 4;
    }
  }),
  isE:Ember.computed('type', {
    get(){
      return this.get('type') == 5;
    }
  }),
  isF:Ember.computed('type', {
    get(){
      return this.get('type') == 6;
    }
  }),
  isG:Ember.computed('type', {
    get(){
      return this.get('type') == 7;
    }
  }),
  isH:Ember.computed('type', {
    get(){
      return this.get('type') == 8;
    }
  }),
  isI:Ember.computed('type', {
    get(){
      return this.get('type') == 9;
    }
  }),
  isJ:Ember.computed('type', {
    get(){
      return this.get('type') == 10;
    }
  }),
  isK:Ember.computed('type', {
    get(){
      return this.get('type') == 11;
    }
  }),
  isL:Ember.computed('type', {
    get(){
      return this.get('type') == 12;
    }
  }),
  isM:Ember.computed('type', {
    get(){
      return this.get('type') == 13;
    }
  }),
  isO:Ember.computed('type', {
    get(){
      return this.get('type') == 14;
    }
  }),
  isP:Ember.computed('type', {
    get(){
      return this.get('type') == 15;
    }
  }),
  isQ:Ember.computed('type', {
    get(){
      return this.get('type') == 16;
    }
  })

});
