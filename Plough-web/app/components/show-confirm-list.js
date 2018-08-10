import Ember from 'ember';

export default Ember.Component.extend({
  deleteStatus:false,
  tagName:'',
  showItem:'',
  initialItem:'',
  StartDate:'',
  isStatic:true,
  actions:{
  edit:function(){
    this.set('isStatic',false);
    this.set('initialItem',Ember.copy(this.get('showItem'))); 
    },
  delete:function(){
    this.set('deleteStatus',true);
  },
  doDelete:function(){
    this.set('deleteStatus',false);
    this.sendAction("todeleteConfirm",this.get("showItem"));
  },
  cancleDelete:function(){
    this.set('deleteStatus',false);
  },
  
  confirm:function(){
    this.set('isStatic',true);
    if(this.get('showItem').id){
      this.sendAction("tomodifyConfirm",this.get("showItem"));
    }
    else{
      this.sendAction("touploadConfirm",this.get("showItem"));
    }
  },
  cancle:function(){
    this.set('isStatic',true);
    this.set('showItem',this.get('initialItem')); 
  },
}
});
