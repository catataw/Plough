import Ember from 'ember';

export function getStrFromArr(status) {
  if(!Ember.isEmpty(status)){
    if(status == '已完成'){
      return Ember.String.htmlSafe('grayColor');;
    }
    else if(status == '进行中'){
      return Ember.String.htmlSafe('greenColor');
    }
    else if(status == '未开始'){
      return Ember.String.htmlSafe('redColor'); 
    }
  }
}

export default Ember.Helper.helper(getStrFromArr);
