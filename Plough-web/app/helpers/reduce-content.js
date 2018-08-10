import Ember from 'ember';

export function reduceContent([values,maxLength]) {
  if(values.length>maxLength){
    return values.substr(0,maxLength)+"...";
  }
  else {
    return values;
  }
  
}

export default Ember.Helper.helper(reduceContent);
