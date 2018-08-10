import Ember from 'ember';

export function realIndex([index]) {
  //debugger;
  return (Number(index)+2);
}

export default Ember.Helper.helper(realIndex);
