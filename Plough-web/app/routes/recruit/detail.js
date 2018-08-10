import Ember from 'ember';

export default Ember.Route.extend({

  beforeModel(transition) {

    var recruitCode = transition.queryParams.recruitCode;
    alert(recruitCode);
  }
});
