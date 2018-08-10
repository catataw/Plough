import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel(transition) {
    let controller = this.controllerFor('job-time-weekday');
    controller.send('loadStep');
  }
});
