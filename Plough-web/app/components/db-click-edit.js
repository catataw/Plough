import Ember from 'ember';

export default Ember.Component.extend({
    Value:'',
    switchStatus:false,
    init(){
        this._super();
    },
    click(){
        this.set('switchStatus',true);
        Ember.run.later(this,function(){
            $(this.get('element')).find('input').focus();
        },10);
    },
    actions:{
        blur(){
            this.set('switchStatus',false);
        },
   
    }




});




        
   
