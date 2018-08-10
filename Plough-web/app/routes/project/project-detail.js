import Ember from 'ember';

export default Ember.Route.extend({

  beforeModel(transition) {

    var projectId = transition.queryParams.projectId;
    alert(projectId);
  }
});
