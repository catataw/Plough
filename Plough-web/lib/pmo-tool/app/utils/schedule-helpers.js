import Ember from 'ember';
/**
 * 获取shchedule对象
 * @returns {boolean}
 */
export default function scheduleHelpers() {
  return true;
}
function getSchedule() {
  return Ember.Object.create({
    _interval: 5000,
    setTime(times){ //set 'interval' time
      this.set('_interval', times);
    },
    // Schedules the function `f` to be executed every `interval` time.
    schedule: function (f) {
      return Ember.run.later(this, function () {
        f.apply(this);
        this.set('timer', this.schedule(f));
      }, this.get('_interval'));
    },
    // Stops the pollster
    stop: function () {
      Ember.run.cancel(this.get('timer'));
    }
  });
}
export{
  getSchedule
}
