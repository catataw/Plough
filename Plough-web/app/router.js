import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('dashboard');
  this.route('projects');
  this.route('employer');
  this.route('used-machine');
  this.route('left-machine');
  this.route('dashbord-machine');
  this.route('login');
  this.route('operate-logs');
  this.route('puser-manage');
  this.route('pbug-eperate');
  this.route('complain');
  this.route('new-project');
  this.route('jobtime-write');
  this.route('person-info');
  this.route('job-time-weekday');
  this.route('worktime-check');
  this.route('employee-apply');
  this.route('used-employee');
  this.route('left-employee');
  this.route('employer-score');
  this.route('employee-dashboard');
  this.route('computer-monitor');
  this.route('pteam-manage');

  this.route('project', function() {
    this.route('add');
    this.route('more');
    this.route('list');
    this.route('detail');
    this.route('project-detail');
    this.route('change-history');
    this.route('project-change-history');
    this.route('sol-project');
  });

  this.route('virtual-machine', function() {
    this.route('used-vitual');
    this.route('user');
  });

  this.route('recruit', function() {
    this.route('demand-list');
    this.route('detail');
  });

});

export default Router;
