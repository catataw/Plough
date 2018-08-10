import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(transition) {
    let controller = this.controllerFor('worktime-check');
    controller.send('loadStep');
  }
});
