import Ember from 'ember';
import {request} from '../utils/http-helpers';

export default Ember.Component.extend({
  employeeId:null,
  writeTime:null,
  employeeName:null,
  attendance:[],
  weeks:[],
  attendance:[],
  errorInfo:'',

  didInsertElement(){
    this.loadStep();

  },

  workDayCount:Ember.computed('attendance',{
    get(){
      var attendance = this.get('attendance');
      var workDayCount = 0;
      attendance.forEach(function (item) {
        if(item['week'] !='星期六'&&item['week'] !='星期日'){
          workDayCount ++;
        }
      })
      return workDayCount;
    }
  }),

  averageWorkTime:Ember.computed('attendance','realWorkDayCount',{
    get(){
      var attendance = this.get('attendance');
      var realWorkDayCount = this.get('realWorkDayCount');
      var workTime = 0;
      attendance.forEach(function (item) {
        workTime += item['workTime'];
      })
      if(realWorkDayCount == 0){
        return 0;
      }else{
        return Number(workTime/Number(realWorkDayCount)).toFixed(1);
      }
    }
  }),


  realWorkDayCount:Ember.computed('attendance',{
    get(){
      var attendance = this.get('attendance');
      var workDayCount = 0;
      attendance.forEach(function (item) {
        if(item['workTime'] >5){
          workDayCount ++;
        }
      })
      return workDayCount;

    }
  }),

  attendanceRate:Ember.computed('realWorkDayCount','workDayCount',{
    get(){
      var realWorkDayCount = this.get('realWorkDayCount');
      var workDayCount = this.get('workDayCount');
      return Number(Number(realWorkDayCount)/Number(workDayCount)).toFixed(2)*100 + '%';
    }
  }),


  month:Ember.computed('writeTime',{
    get(){
      var writeTime = this.get('writeTime');
      var date = new Date(writeTime);
      var year = date.getFullYear();
      var month = date.getMonth()+1;
      return year+'年'+month+'月';
    }
  }),

  writeTimeChange:Ember.observer('month',function () {
    this.loadStep();
  }),

    loadStep () {
      var self = this;
      this.set('editDate',[]);
      this.set('errorInfo','');
      this.getAttendTime();
    },
    //显示当月报工日期
    getAttendTime() {
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
  init() {
    this._super.apply(this, arguments);
    this.errors = [];
  },

  didUpdateAttrs() {
    this._super.apply(this, arguments);
    this.set('errors', []);
  },

});
