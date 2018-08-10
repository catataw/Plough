import Ember from 'ember';
import {request} from '../utils/http-helpers';
import {numberUtils} from '../utils/number_utils';
import{dateUtils} from '../utils/date';
import ENV from '../config/environment';


export default Ember.Controller.extend({
  session: Ember.inject.service('session'),

  actions:{
    addSomeBugsForm:function () {
      Ember.$('#addSomeBugsForm').modal('show');
    },

    submitExclData:function () {
      Ember.$('#addSomeBugsForm').modal('hide');
    },

  }

});
