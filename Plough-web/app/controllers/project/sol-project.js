import Ember from 'ember';

export default Ember.Controller.extend({

  userInfo:{},


  solUrl:Ember.computed('userInfo',{
    get(){
      var baseUrl = 'http://10.154.5.146:4214/#/project/list';
      var userInfo = this.get('userInfo')
      var userEmail = userInfo['userEmail'];
      var userPassword = userInfo['userPassword'];
     // console.log(baseUrl+'?userEmail='+userEmail+'&userPassword='+userPassword);
      return baseUrl+'?userEmail='+userEmail+'&userPassword='+userPassword;
    }
  }),

});
