import Ember from 'ember';
import {request} from '../utils/http-helpers';

export default Ember.Component.extend({
  computerInfo:{},
  'Title': '过去一周内存峰值监控',
  _chartId: '',
  day:[],
  cData:[],

  reset(){
    let _id = this.get('_chartId');
    let myChart = echarts.init(document.getElementById(_id));
    let cData = this.get('cData');
    let day = this.get('day');
    let option = {
      title : {
        text: '过去一周cpu利用率',
      },
      tooltip : {
        trigger: 'axis'
      },
      legend: {
        data:['cpu-idle',]
      },
      toolbox: {
        show : true,

      },
      calculable : true,
      xAxis : [
        {
          type : 'category',
          boundaryGap : false,
          data : day
        }
      ],
      yAxis : [
        {
          type : 'value',
          axisLabel : {
            formatter: '{value} %'
          }
        }
      ],
      series : [
        {
          name:'cpu-idle',
          type:'line',
          data:cData,
          markPoint : {
            data : [
              {type : 'max', name: '最大值'},
              {type : 'min', name: '最小值'}
            ]
          },
          markLine : {
            data : [
              {type : 'average', name: '平均值'}
            ]
          }
        },

      ]
    };

    myChart.setOption(option);
  },
  didInsertElement(){
    var self = this;
    var data = this.get('computerInfo');
    request({
      name: 'host.cpu.usage',
      type: 'post',
      data:data
    }).then((data) => {

      if(data){
        var day = self.get('day');
        var cData = self.get('cData');
        data.forEach(function (item) {
          day.push(item.date);
          cData.push(item.memUsage);
        })
      }
      this.set('day',day);
      this.set('cData',cData);

      console.log(this.get('day'));
      console.log(this.get('cData'));
      this.reset();
    })

  },
  init(){
    this.set('_chartId','');
    this.set('day',[]);
    this.set('cData',[]);
    this._super.apply(this, arguments);
    var computerInfo = this.get('computerInfo');
    var _chartId = 'C'+computerInfo['hostid'];
    this.set('_chartId', _chartId);
  }
});
