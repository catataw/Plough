import Ember from 'ember';
import {request} from '../utils/http-helpers';


export default Ember.Controller.extend({

  dsahboardTime:'',
  survey:{},

  currentTime:'',

  actions:{
    loadStep:function(){
      var self = this;
      var date = new Date();
      self.set('currentTime',date.getTime());
      this.send('loadSurvey');
      setInterval(function(){
        var date = new Date();
        self.set('currentTime',date.getTime());
      },1000);

    },

    addAttendance:function(){
      Ember.$('#addSomeAttendanceForm').modal('show');
    },

    loadSurvey:function () {
      var self =this;
      request({
        name: 'dashbord.computer.survey',
        type: 'get',
        data:{},
      }).then((data) => {
        self.set('survey',data);
      })
    },

  }




});
