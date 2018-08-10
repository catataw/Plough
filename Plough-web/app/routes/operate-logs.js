import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(transition) {
    let controller = this.controllerFor('operate-logs');
    controller.send('loadStep');
  }
});
