/**
 *Created by wuhui on 2017/6/9.
 *
 */
import Ember from 'ember';
import {destory,getObject,isExists} from '../utils/cookie-helpers';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';
export default BaseAuthenticator.extend({
  cookieName: 'user',
  restore: function(data) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!Ember.isEmpty(data.token)) {
        resolve(data);
      } else {
        reject();
      }
    });
  },
  authenticate: function(options) {
    return new Ember.RSVP.Promise((resolve, reject) => {
      Ember.$.ajax({
        url: this.tokenEndpoint,
        type: 'POST',
        data: JSON.stringify({
          username: options.email,
          password: options.password
        }),
        contentType: 'application/json;charset=utf-8',
        dataType: 'json'
      }).then(function(response) {
        Ember.run(function() {
          resolve({
            token: response.id_token
          });
        });
      }, function(xhr, status, error) {
        var response = xhr.responseText;
        Ember.run(function() {
          reject(response);
        });
      });
    });
  },
  invalidate: function() {
    console.log('invalidate...');
    return Ember.RSVP.resolve();
  }
});
