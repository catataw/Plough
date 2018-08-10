import Ember from 'ember';

export default Ember.Component.extend({
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
  upload:false,
  progressInfo:'',
  initialProgressInfo:'',
  didInsertElement(){
   this.set('initialProgressInfo',Ember.copy(this.get('progressInfo')));
  },
  
  actions:{
    uploadData(){
      this.sendAction('toModify0');
      this.sendAction('toUploadData',this.get('progressInfo'));
    },
    confirm0(){
      this.sendAction('toModify0');
      this.sendAction('toUploadData',this.get('progressInfo'));
    },
    //放弃修改
    cancle0(){
      this.sendAction('toModify0');
      this.set('progressInfo',this.get('initialProgressInfo'));
    },
    confirm1(){
      this.sendAction('toModify1');
      this.sendAction('toUploadData',this.get('progressInfo'));
    },
    //放弃修改
    cancle1(){
      this.sendAction('toModify1');
      this.set('progressInfo',this.get('initialProgressInfo'));
    },
    updateSaturation(val){
      this.set('progressInfo.process', val);
    }
  }
});
