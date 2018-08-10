import Ember from 'ember';

export default Ember.Component.extend({
    classNames:['active-parent-pane','project-mana-date-picker'],
    val:'',
    _Id:'',
    th:'合同签订时间',
    key:'signContractTime',
    _obj:[{
        name:'',
        th:'合同签订时间',
        idName:'sign-contractTime',
        key:'signContractTime',
        type:'date-range'
    },{
        name:'',
        th:'工期要求',
        idName:'online-time',
        key:'onlineTime',
        type:'date-range'
    },{
        name:'',
        th:'项目启动会时间',
        idName:'start-time',
        key:'startTime',
        type:'date-range'
    }],
    timeObject:'',
    valChanged:Ember.observer('val',function(){
        if(''!=this.get('val')){
        Ember.set(this.get('timeObject'),'name',this.get('val'));
        this.sendAction('Choosing',this.get('timeObject'));
        }
    }),
    actions:{
       toActive(e){
     //      this._switch();
            if(e.target.classList[1] == this.get("_Id")){
                $(`#${this.get('_Id')}`).trigger('click');
                if(this.get('_obj').findBy('idName',this.get("_Id"))){
                    this.set('timeObject',this.get('_obj').findBy('idName',this.get("_Id")))
                }
            }      
       }
    },
    click() {
        return false;
    },
    _switch() {
        if (Ember.$(this.get('element')).find('.active-pane').hasClass('active')) {
            Ember.$(this.get('element')).find('.active-pane').removeClass('active');
        } else {
            Ember.$(this.get('element')).find('.active-pane').addClass('active');
        }
    }
});
