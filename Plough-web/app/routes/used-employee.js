import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(transition) {
    let controller = this.controllerFor('used-employee');
    controller.send('loadStep');
  }
});
