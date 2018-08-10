import Ember from 'ember';

export function showTime(time) {
  if(time[0]!==null){
    var _time = time[0].split(' ')[0];
    return _time;
  } else {
    return
  }
}

export default Ember.Helper.helper(showTime);
