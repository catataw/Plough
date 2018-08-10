import Ember from 'ember';

export default Ember.Route.extend({

  beforeModel() {
    let controller = this.controllerFor('virtual-machine/used-vitual');
    controller.send('loadStep');
  }

});
