import Ember from "ember";

export default Ember.Route.extend({
  //  controllerName:'project/list',
  beforeModel(transition) {
    let controller = this.controllerFor("project/more");
    controller.send("loadStep");
  }
});
