import Ember from 'ember';
import {request} from '../utils/http-helpers';


export default Ember.Route.extend({
  session: Ember.inject.service('session'),
  email:'',
  password:'',
  actions:{
    authenticate() {
      var self = this;
      var controller = this.controllerFor('login');
      var appController = this.controllerFor('application');
      var jobtimeWriteController = this.controllerFor('jobtime-write');
      var jobtimeWeekdayController = this.controllerFor('job-time-weekday');
      var data = {};
      data['userEmail'] = controller.get('userEmail');
      data['userPassword'] = controller.get('userPassword');
      request({
        name: 'user.login.api',
        type: 'post',
        data:data,
      }).then((result) => {
        if(result.userEmail){
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
          appController.set('userInfo',result);
          jobtimeWriteController.set('userInfo',result);
          jobtimeWeekdayController.set('userInfo',result);
          this.transitionTo('dashbord-machine');
        }else{
          controller.set('errorInfo','登录异常，请检查账号密码是否正确,重置密码请联系罗颖（微信：luoying3993，手机：17693563539）。');
        }
      })




      /*this.get('session').authenticate('authenticator:pmo-auth', user).catch((reason) => {
       var test = reason;
       self.set('errorMessage', reason.error || reason);
       });*/
    }
  }
});
