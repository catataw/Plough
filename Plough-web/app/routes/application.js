import Ember from 'ember';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import {request} from '../utils/http-helpers';
import {all_list} from '../utils/nav_config'

export default Ember.Route.extend(ApplicationRouteMixin,{
  i18n :Ember.inject.service(),
  session: Ember.inject.service('session'),
  beforeModel(transition) {

    this.get('i18n').set('defaultLocale','zh');
    this.get('i18n').set('locale','zh');
    var controller = this.controllerFor('login');
    var appController = this.controllerFor('application');
    appController.set('all_list',all_list);
    var jobTimeController = this.controllerFor('jobtime-write');
    var jobtimeWeekday = this.controllerFor('job-time-weekday');
    var usedVitual = this.controllerFor('virtual-machine/used-vitual');
    var project = this.controllerFor('project/list');

    var solProject =this.controllerFor('project/sol-project');


    var data = {};
    request({
      name: 'user.login.api',
      type: 'post',
      data:data,
    }).then((data) => {
      if(data){
        this.get('session').set('isAuthenticated', true);
        if(data.userType==2){
          this.get('session').set('isSuper', true);
          this.get('session').set('isAdmin', false);
          this.get('session').set('isOrigin', false);
          this.get('session').set('isTeamLeader', false);
          this.get('session').set('isBigTeamLeader', false);
        }else if(data.userType==3){
          this.get('session').set('isAdmin', true);
          this.get('session').set('isOrigin', false);
          this.get('session').set('isSuper', false);
          this.get('session').set('isTeamLeader', false);
        }else if(data.userType==4){
          this.get('session').set('isOrigin', false);
          this.get('session').set('isSuper', false);
          this.get('session').set('isAdmin', false);
          this.get('session').set('isTeamLeader', true);
          this.get('session').set('isBigTeamLeader', false);
        } else if(data.userType==1){
          this.get('session').set('isOrigin', true);
          this.get('session').set('isSuper', false);
          this.get('session').set('isAdmin', false);
          this.get('session').set('isTeamLeader', false);
          this.get('session').set('isBigTeamLeader', false);
        }else{
          this.get('session').set('isOrigin', false);
          this.get('session').set('isSuper', false);
          this.get('session').set('isAdmin', false);
          this.get('session').set('isTeamLeader', false);
          this.get('session').set('isBigTeamLeader', true);
        }
        appController.set('userInfo',data);
        jobTimeController.set('userInfo',data);
        jobtimeWeekday.set('userInfo',data);
        project.set('userInfo',data);
        usedVitual.set('searchWordInput',data.userName);
        solProject.set('userInfo',data);
       // this.transitionTo('dashbord-machine');
      }else{
        this.transitionTo('login');
      }
    })
  },

  actions: {
    invalidateSession: function() {
      var data ={};
      request({
        name: 'user.logout.api',
        type: 'post',
        data:data,
      }).then((data) => {
        this.get('session').set('isAuthenticated', false);
        this.transitionTo('login');

      })

    }
  }

});
