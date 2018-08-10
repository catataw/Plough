import Ember from 'ember';

export default Ember.Component.extend({
    classNames:['project-mana-tab-set'],
    tagName:'ul',
    _tabs:[{
        name:'基本信息',
        startLine:1,
    },{
        name:'客户侧',
        startLine:2,
    },{
        name:'苏研侧',
        startLine:3,
    },{
        name:'状态',
        startLine:4,
    },{
        name:'进展',
        startLine:5,
    },
    // {
    //     name:'工时投入',
    //     startLine:6
    // },
    {
        name:'里程与回款',
        startLine:7
    },
    // {
    //     name:'评分',
    //     startLine:8
    // }
],
    activeTab:1,
    actions:{
        setTable(range){
            this.sendAction('SetShowRange',range);
        }
    }
});
