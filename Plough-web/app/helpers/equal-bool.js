import Ember from 'ember';

export function equalBool([param1,param2]) {
  return param1 == param2;
}

export default Ember.Helper.helper(equalBool);
