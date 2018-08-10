import Ember from 'ember';

export default Ember.Component.extend({
    tagName:'',
    status:'',
    initialStatus:'',
    index:'',
    modified:true,
    readyChange:false,
    statusList0:[],
    init(){
        this._super();
        this.set('addItem',false);
        this.set('modified',true);
      },

    itemColor:Ember.computed('index','statusList0.@each' ,{
      
      get(){
        let index = this.get('index');
        let statusList = this.get('statusList0');
        let length = statusList.length;
        if(index==(length-1)){
          return null;
        }
        else{
          let beforeItem = statusList[index+1];
          let currentItem = statusList[index];
          let color={};
          if(beforeItem.commerceStatus!=currentItem.commerceStatus){
            color.commerceStatus="red";
          }
          if(beforeItem.implementBases!=currentItem.implementBases){
            color.implementBases="red";
          }
          if(beforeItem.implementStatus!=currentItem.implementStatus){
            color.implementStatus="red";
          }
          if(beforeItem.developStatus!=currentItem.developStatus){
            color.developStatus="red";
          }
          if(beforeItem.onlineStatus!=currentItem.onlineStatus){
            color.onlineStatus="red";
          }
          if(beforeItem.operateStatus!=currentItem.operateStatus){
            color.operateStatus="red";
          }
          return color;
        }
      }

     }),
    actions:{
      modify(){
        this.toggleProperty('modified');
        //点击修改，保存原始的status
        this.set('initialStatus',Ember.copy(this.get('status'))); 
      },
      //确认修改数据
      confirm(){
        this.toggleProperty('modified');
        this.toggleProperty('addItem');
        this.toggleProperty('readyChange');
        this.sendAction('toConfirmModify',this.get('status'));
      },
      //取消修改数据
      cancel(){
        this.toggleProperty('modified');
        this.set('addItem',false);
        this.toggleProperty('readyChange');
        //点击取消，将原始的status放回去
        let _initialStatus = this.get('initialStatus');
        this.set('status',_initialStatus); 
      },
      readyTochange(e){
        if(e.type == "mouseover"){
          this.set('readyChange',true);
        }else if(e.type == "mouseleave"){
          this.set('readyChange',false);
        }
      }
    }
});
