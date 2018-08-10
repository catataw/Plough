import Ember from 'ember';

export default Ember.Component.extend({
  ableToModify0:false,
  ableToModify1:false,
  progressInfo:'',
  mockId:'',
  firstWeek:Ember.computed('mockId',function(){
    let id = this.get('mockId');
    if(id == 0){
      return true;
    }
    else{
      return false;
    }
  }),

  before:Ember.computed('mockId',function(){
    let id = this.get('mockId');
    if(id > 1){
      return true;
    }
    else{
      return false;
    }
  }),

  svgParam:{},
  /* svgParams:Ember.A(), */
  
  
  actions:{
    drawSvg(svgParam){
      this.set('svgParam',svgParam);
    },
    change0(){
      this.sendAction('toModify0');
    },
    change1(){
      this.sendAction('toModify1');
    },
  },
  init(){
    this._super(...arguments);
   /*  debugger;
    this.set('svgParams', Ember.A()); */
  }
});
