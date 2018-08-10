/**
 * 用来处理cookie的方法
 */
import Ember from 'ember';
export default function cookieHelpers() {
  return true;
}
function get(name) {
  return Ember.$.cookie(name);
}
function set(name, value) {
  Ember.$.cookie(name, value, {path: "/"});
}
function getObject(name) {
  var str = get(name);
  return JSON.parse(str);
}
function setObject(name, value) {
  var str = JSON.stringify(value);
  Ember.$.cookie(name, str);
}
function destory(name) {
  set(name, null);
}
function isExists(name) {
  if (get(name) == undefined || 'null' == get(name)) {
    return false;
  } else {
    return true;
  }
}
export{
  get as getCookie,
  set as setCookie,
  getObject,
  setObject,
  destory,
  isExists
}
