import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(transition) {
    let controller = this.controllerFor('employee-apply');
    controller.send('loadStep');
  }
});
