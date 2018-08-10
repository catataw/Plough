import Ember from 'ember';

export default Ember.Route.extend({

  afterModel(transition) {
    let controller = this.controllerFor('complain');
    controller.send('loadStep');
  }
});
