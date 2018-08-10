import Ember from 'ember';

export default Ember.Component.extend({
    tagName:'',
    weight:'',
    _colorList:[],
    index:0, 
    content:'',

    addClass:Ember.computed('index','_colorList.@each',{
        get(){
          let index = this.get('index');
          let className=this.get('_colorList')[index];
          return Ember.String.htmlSafe(className+'Color');
    }
    }),     
    addStyle:Ember.computed('index','weight',{
        get(){
          let weight=this.get('weight');
          let index = this.get('index');
          if(!Ember.isEmpty(weight) && weight!= 0){
                let styleStr = index === 0 ? `width: ${weight}%` : `width: calc(${weight}% - 1px)`;
                return Ember.String.htmlSafe(styleStr);
          }

         /*  let styleStr = 'width:'+this.get('weight')+'%';
          return Ember.String.htmlSafe(styleStr); */
        }
    })

});
