import Ember from 'ember';

export default Ember.Route.extend({



  beforeModel(transition) {

    var relatedId = transition.queryParams.relatedId;
    var projectName = transition.queryParams.projectName;

    var monday = transition.queryParams.monday;
    var sunday = transition.queryParams.sunday;
    var teamCount = transition.queryParams.teamCount;

    var currentTeam = '第'+teamCount+'周 '+monday+'～'+sunday;

    var controller = this.controllerFor('project/project-change-history');
    controller.set('relatedId',relatedId);
    controller.set('projectName',projectName);
    controller.set('currentTeam',currentTeam);
    controller.send('loadStep');
  }

});
