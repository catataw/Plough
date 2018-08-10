import Ember from 'ember';

export function addStyle([weight, index]) {
  if(!Ember.isEmpty(weight) && weight!= 0){
  let styleStr = index === 0 ? `width: ${weight}%` : `width: calc(${weight}% - 1px)`;
  return Ember.String.htmlSafe(styleStr);
  }
  
}

export default Ember.Helper.helper(addStyle);
