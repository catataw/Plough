import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(transition) {
    let controller = this.controllerFor('employer-score');
    controller.set('employeeId',transition.queryParams.employeeId);
    controller.set('employeeName',transition.queryParams.employeeName);
    controller.set('writeTime',transition.queryParams.writeTime);
    controller.send('loadStep');
  }
});
