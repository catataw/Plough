import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['project-mana-filter-select','active-parent-pane'],
    Lists: [{
        name: '单一来源',
        key:'purchaseType',
        th:'采购方式'
    }, {
        name: '公开招标',
        key:'purchaseType',
        th:'采购方式'
    }, {
        name: '比选',
        key:'purchaseType',
        th:'采购方式'
    },{
        name:'框架协议',
        key:'purchaseType',
        th:'采购方式'
    }],
    actions: {
        chooseLi(obj) {
             this.sendAction('Choosing',obj);
        },
        toActive() {
        }
    },
    click() {
        this._switch();
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
