import Ember from 'ember';

export default Ember.Controller.extend({
  //返回每个月日期已经对应天数
  /*
   dayDates:Ember.computed('writeTime',{
   get(){

   var dayDates = [];
   //获取当前月有多少天
   var writeTime = this.get('writeTime');
   var date = new Date(writeTime);
   var year = date.getFullYear();
   var month = date.getMonth()+1;
   var dayCount =  new Date(year, month-1, 0).getDate();
   //获取第一天的星期
   var firtDate = new Date(year,month-1,1);
   var day = firtDate.getDay();
   //获取本月所有天的星期
   for(var i =1;i<dayCount;i++){
   var dayDate = {};
   var time= '';
   if(dayCount < 10){
   time = year +'-'+ month + '-0'+ i;
   }else{
   time = year +'-'+ month + '-'+ i;
   }
   dayDate['day'] = day;
   dayDate['time'] = time;
   dayDates.pushObject(dayDate);
   if(day<6){
   day ++;
   }else{
   day = 0;
   }
   }
   return dayDates;
   }
   }),
   */
});
