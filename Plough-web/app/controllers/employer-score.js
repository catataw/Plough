import Ember from 'ember';
import {request} from '../utils/http-helpers';
import {validator} from '../utils/validator';
import{dateUtils} from '../utils/date';
import ENV from '../config/environment';

export default Ember.Controller.extend({
  session: Ember.inject.service('session'),
  i18n :Ember.inject.service(),
  writeTime:'',

  weeks:[],
  attendance:[],
  editDate:[],
  errorInfo:'',

  employeeId:null,
  employeeName:null,


  writeTimeChange: Ember.observer('writeTime', function() {
    this.send('getAttendTime');
  }),



  actions:{


    loadStep:function () {
      var self = this;
      this.set('editDate',[]);
      this.set('errorInfo','');
      this.send('getAttendTime');
    },
    //显示当月报工日期
   getAttendTime:function () {
      var self = this;
      var data = {};
      var writeTime = this.get('writeTime');
      data['writeTime'] = writeTime;
      data['employeeId'] = this.get('employeeId');
      request({
        name: 'get.attendance.api',
        type: 'post',
        data:data,
      }).then((data) => {
        self.set('attendance',data);
        var workArr = data;
        var weeks = [];
        var tmpWeek = [];
        var i = 0;
        var j =0;
        workArr.forEach(function (item) {
          //处理本月第一周
          if(item.week == '星期一'&&i>0 ){
            if(weeks.length ==0){
              if(tmpWeek.length<7&&tmpWeek.length!=0){
                var tmLen = 7 - tmpWeek.length;
                for(var k =0;k<tmLen;k++){
                  var tmp = {};
                  tmpWeek.unshiftObject(tmp);
                }
              }
            }
            if(tmpWeek.length>0){
              weeks[j] = tmpWeek;
            }
            tmpWeek = [];
            j++;
          }
            tmpWeek.pushObject(item);
          i++;
        })
        if(tmpWeek){
          if(tmpWeek.length<7){
            console.log(tmpWeek);
            var tmLenL = 7 - tmpWeek.length;
            for(var k =0;k<tmLenL;k++){
              var tmp = {};
              tmpWeek.pushObject(tmp);
            }
          }
          if(tmpWeek.length>0) {
            weeks[j] = tmpWeek;
          }
        }
        self.set('weeks',weeks);
      })
    },




  }

});
