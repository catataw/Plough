import Ember from 'ember';

export default Ember.Route.extend({

  beforeModel() {
    let controller = this.controllerFor('recruit/demand-list');
    controller.send('loadStep');
  }
});
