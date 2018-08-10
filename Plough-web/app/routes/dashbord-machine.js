import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(transition) {
    let controller = this.controllerFor('dashbord-machine');
    controller.send('loadStep');
  }

});
