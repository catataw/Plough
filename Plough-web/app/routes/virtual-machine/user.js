import Ember from 'ember';

export default Ember.Route.extend({

  beforeModel() {
    let controller = this.controllerFor('virtual-machine/user');
    controller.send('loadStep');
  }
});
