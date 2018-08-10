import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(transition) {
    let controller = this.controllerFor('person-info');
    controller.send('loadStep');
  }
});
