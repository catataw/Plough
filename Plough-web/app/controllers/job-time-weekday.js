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
  editDate:[],
  //已经填报了的工时
  writeWorkTime:[],
//  workDetail:'',
  userInfo:{},
  errorInfo:'',

//个人已经参加的项目列表
  participateProject:[],
//每次添加的单项工时
  addOneJobTime:{},
  addedWorkTime:0,

  writeTimeChange: Ember.observer('writeTime', function() {
       this.send('writeJobTime');
  }),

  workDay:Ember.computed('editDate',{
    get(){
      var editDate = this.get('editDate');
      return editDate.length;
    }
  }),


  addTitle:Ember.computed('addOneJobTime',{
    get(){
       var addOneJobTime = this.get('addOneJobTime');
       return addOneJobTime.projectName;
    }
  }),

  actions:{

    transitonToAddProject:function () {
      Ember.$('#transitonToAddProjectId').modal('hide');
      this.transitionToRoute('person-info');
    },

    doAddOneJobTime:function () {
      var addOneJobTime = this.get('addOneJobTime');
      var writeWorkTime = this.get('writeWorkTime');
      var workDay = this.get('workDay');
      var tmp = {};
      var workTime = 0;
      var self = this;
      //验证添加工时是否合规
      if(!validator.isValidNaturaNumbers(addOneJobTime.workTime)){
        self.set('errorInfo',self.get('i18n').t('job.time.add.nature.format.error'));
        return;
      }else{
        if(addOneJobTime.workTime>workDay*24){
          self.set('errorInfo',self.get('i18n').t('job.add.time.format.error'));
          return;
          //数据格式合格
        }else if(addOneJobTime.workTime>0){
          //添加报工列表
          for(var key in addOneJobTime){
            tmp[key] = addOneJobTime[key];
          }
          if(writeWorkTime){
            writeWorkTime.forEach(function (item,index) {
              if(item.projectName == tmp.projectName&&item.workType == tmp.workType) {
                delete writeWorkTime[index];
              }
            })
          }
          writeWorkTime.unshiftObject(tmp);
          //更新报工列表工作时长
          writeWorkTime.forEach(function (item) {
            workTime = workTime + Number(item.workTime);
          })
          this.set('writeWorkTime',writeWorkTime);
          this.set('addedWorkTime',workTime);
        }
      }
    },

    chooseDestination:function (destinationProject) {
      this.set('addOneJobTime.projectName',destinationProject)
    },


    deleteWorkRec:function (deleteRe) {
      var writeWorkTime = this.get('writeWorkTime');
      var newWriteWorkTime = [];
      var workTime = 0;
      writeWorkTime.forEach(function (item) {
        if(deleteRe.projectName != item.projectName||deleteRe.workType !=item.workType ){
          newWriteWorkTime.pushObject(item);
        }
      })
      newWriteWorkTime.forEach(function (item) {
        workTime = workTime + Number(item.workTime);
      })
      this.set('addedWorkTime',workTime);

      this.set('writeWorkTime',newWriteWorkTime);
    },
    setCurrentRe:function (setCurrentRe) {
      this.set('addOneJobTime',setCurrentRe);
    },



    loadStep:function () {
      var self = this;

      this.set('addOneJobTime',{});
      this.set('writeWorkTime',[]);
      this.set('weeks',[]);
      this.set('participateProject',[]);
      this.set('editDate',[]);
      this.set('errorInfo','');
      var date=new Date();
      this.set('writeTime',dateUtils.formatDate(date));

       /*var data = [[{"date":"2017-08-1","workTime":8,"week":"\u661f\u671f\u4e8c","day":1},{"date":"2017-08-2","workTime":6,"week":"\u661f\u671f\u4e09","day":2},{"date":"2017-08-3","workTime":0,"week":"\u661f\u671f\u56db","day":3},{"date":"2017-08-4","workTime":0,"week":"\u661f\u671f\u4e94","day":4},{"date":"2017-08-5","workTime":0,"week":"\u661f\u671f\u516d","day":5},{"date":"2017-08-6","workTime":0,"week":"\u661f\u671f\u65e5","day":6},{"date":"2017-08-7","workTime":0,"week":"\u661f\u671f\u4e00","day":7},{"date":"2017-08-8","workTime":0,"week":"\u661f\u671f\u4e8c","day":8},{"date":"2017-08-9","workTime":0,"week":"\u661f\u671f\u4e09","day":9},{"date":"2017-08-10","workTime":0,"week":"\u661f\u671f\u56db","day":10},{"date":"2017-08-11","workTime":0,"week":"\u661f\u671f\u4e94","day":11},{"date":"2017-08-12","workTime":0,"week":"\u661f\u671f\u516d","day":12},{"date":"2017-08-13","workTime":0,"week":"\u661f\u671f\u65e5","day":13},{"date":"2017-08-14","workTime":0,"week":"\u661f\u671f\u4e00","day":14},{"date":"2017-08-15","workTime":0,"week":"\u661f\u671f\u4e8c","day":15}],[{"date":"2017-08-16","workTime":0,"week":"\u661f\u671f\u4e09","day":16},{"date":"2017-08-17","workTime":0,"week":"\u661f\u671f\u56db","day":17},{"date":"2017-08-18","workTime":0,"week":"\u661f\u671f\u4e94","day":18},{"date":"2017-08-19","workTime":0,"week":"\u661f\u671f\u516d","day":19},{"date":"2017-08-20","workTime":0,"week":"\u661f\u671f\u65e5","day":20},{"date":"2017-08-21","workTime":0,"week":"\u661f\u671f\u4e00","day":21},{"date":"2017-08-22","workTime":0,"week":"\u661f\u671f\u4e8c","day":22},{"date":"2017-08-23","workTime":0,"week":"\u661f\u671f\u4e09","day":23},{"date":"2017-08-24","workTime":0,"week":"\u661f\u671f\u56db","day":24},{"date":"2017-08-25","workTime":0,"week":"\u661f\u671f\u4e94","day":25},{"date":"2017-08-26","workTime":0,"week":"\u661f\u671f\u516d","day":26},{"date":"2017-08-27","workTime":0,"week":"\u661f\u671f\u65e5","day":27},{"date":"2017-08-28","workTime":0,"week":"\u661f\u671f\u4e00","day":28},{"date":"2017-08-29","workTime":0,"week":"\u661f\u671f\u4e8c","day":29},{"date":"2017-08-30","workTime":0,"week":"\u661f\u671f\u4e09","day":30},{"date":"2017-08-31","workTime":0,"week":"\u661f\u671f\u56db","day":31}]];
      var workArr = data[0].concat(data[1]);
      var weeks = [];
      var tmpWeek = [];
      var i = 0;
      var j =0;
      workArr.forEach(function (item) {
        if(item.week == '星期一'&&i>0 ){
          if(weeks.length ==0){
            if(tmpWeek.length<7){
              console.log(tmpWeek);
              var tmLen = 7 - tmpWeek.length;
              for(var k =0;k<tmLen;k++){
                var tmp = {};
                tmpWeek.unshiftObject(tmp);
                console.log(tmpWeek.length);
              }
            }
          }
          weeks[j] = tmpWeek;
          tmpWeek = [];
          j++;
        }
        tmpWeek.pushObject(item);
        i++;
      })
      if(tmpWeek){
        weeks[j] = tmpWeek;
      }
      self.set('weeks',weeks);*/
      this.send('writeJobTime');
    },
    //显示当月报工日期
    writeJobTime:function () {
      var self = this;
      var data = {};
      var writeTime = this.get('writeTime');
      data['writeTime'] = writeTime;
      request({
        name: 'get.workTimeList.api',
        type: 'post',
        data:data,
      }).then((data) => {
        var workArr = data[0].concat(data[1]);
        var weeks = [];
        var tmpWeek = [];
        var i = 0;
        var j =0;
        workArr.forEach(function (item) {
          //处理本月第一周
          if(item.week == '星期一'&&i>0 ){
            if(weeks.length ==0){
              if(tmpWeek.length<5&&tmpWeek.length!=0){
                var tmLen = 5 - tmpWeek.length;
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
          //添加每周的工作日
          if(item.week !='星期六'&&item.week !='星期日'){
            tmpWeek.pushObject(item);
          }
          i++;
        })
        if(tmpWeek){
          if(tmpWeek.length<5){
            console.log(tmpWeek);
            var tmLenL = 5 - tmpWeek.length;
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
    //显示报工表单
    writeTimeForm:function (date) {
      var self =this;
      this.set('errorInfo','');
      var data = {};
      var eDate = [];
      date.forEach(function (item) {
        if(item.date&&!item.isHoliday){
          eDate.push(item.date);
        }
      })
      self.set('editDate',eDate);
      request({
        name: 'get.person.projects',
        type: 'post',
        data:data,
      }).then((data) => {
        if(data){
          var participateProject = [];
          data.forEach(function (item) {
            participateProject.push(item.projectName);
          })

          self.set('participateProject',participateProject);
          var timeData = {};
          var addedWorkTime = 0;
          timeData['editTime'] = self.get('editDate');
          request({
            name: 'get.person.week.projects',
            type: 'post',
            data:timeData,
          }).then((data) => {
            var writeWorkTime = [];
            if(data){
              data.forEach(function (item) {
                if(Number(item.workTime)>0){
                  writeWorkTime.push(item);
                  addedWorkTime = addedWorkTime + Number(item.workTime);
                }
              })
            }
            this.set('addedWorkTime',addedWorkTime);

            self.set('writeWorkTime',writeWorkTime);
            $('#addWorkTimeDiv').removeClass('hide');
            $('#divbg').removeClass('hide');
          })
        }else{
          Ember.$('#transitonToAddProjectId').modal('show');
        }
      })
    },

    typeChanged(value,workId,event) {
      this.set('addOneJobTime.workType',value);
    },
    //提交报工表单
    doWriteTimeForm:function () {
      this.set('errorInfo','');
      var self = this;
      var editDate = this.get('editDate');
      var data = {}
      data['workItem'] = this.get('writeWorkTime');
      data['workTime'] = this.get('editDate');
      data['userName'] = this.get('userInfo')['userName'];
      var workDay = Number(editDate.length);
      //验证格式
      var workTotalTime = 0;
      data['workItem'].forEach(function (item) {
        if(!validator.isValidNaturaNumbers(item.workTime)){
          self.set('errorInfo',self.get('i18n').t('job.time.format.error'));
          return;
        }else{
          if(item.workTime>workDay*24){
            self.set('errorInfo',self.get('i18n').t('job.time.format.error'));
            return;
          }
           else if(item.workTime>0){
            workTotalTime = workTotalTime + Number(item.workTime);
           }
        }
      })
      if(workTotalTime>workDay*24){
        self.set('errorInfo',self.get('i18n').t('job.time.format.error'));
        return;
      }
      /*if(workTotalTime<workDay*8){
        self.set('errorInfo',self.get('i18n').t('job.week.time.format.error'));
        return;
      }*/

      //提交数据
      if(!self.get('errorInfo')){
        request({
          name: 'get.replaceWeeklyJobTime.api',
          type: 'post',
          data:data,
        }).then((data) => {
          if(data){
            $('#addWorkTimeDiv').addClass('hide');
            $('#divbg').addClass('hide');
            self.send('writeJobTime');
          }
        })
      }
    },
    closeWriteTimeForm:function () {
      $('#addWorkTimeDiv').addClass('hide');
      $('#divbg').addClass('hide');
    },
    showTextArea:function () {
      $('#workDetailTextareaBg').removeClass('hide');
      $('#workDetailTextarea').removeClass('hide');
    },
    addWorkdetail:function () {
      //var workDetail = this.get('workDetail');
      //this.set('addOneJobTime.workDetail',workDetail);
      $('#workDetailTextareaBg').addClass('hide');
      $('#workDetailTextarea').addClass('hide');
    },
    closeWorkDetailTextarea:function () {
      $('#workDetailTextareaBg').addClass('hide');
      $('#workDetailTextarea').addClass('hide');
    }


  }

});
