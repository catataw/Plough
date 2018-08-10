import Ember from 'ember';

export function isLast([index,arr]) {
  if(index == 0){
    return true;
  }else if(index<arr.length-1){
    return true;
  }else{
    return false;
  }
}

export default Ember.Helper.helper(isLast);
