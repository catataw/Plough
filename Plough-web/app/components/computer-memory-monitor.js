import Ember from 'ember';
import {request} from '../utils/http-helpers';

export default Ember.Component.extend({
  computerInfo:{},
  'Title': '过去一周内存峰值监控',
  _chartId: '',
  day:[],
  mData:[],

  reset(){
    let _id = this.get('_chartId');
    let myChart = echarts.init(document.getElementById(_id));
    let mData = this.get('mData');
    let day = this.get('day');
    let option = {
      color:['green'],
      title : {
        text: '过去一周内存利用率',
      },
      tooltip : {
        trigger: 'axis'
      },
      legend: {
        data:['used-memory',]
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
          name:'used-memory',
          type:'line',
          data:mData,
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
      name: 'host.memory.usage',
      type: 'post',
      data:data
    }).then((data) => {

      if(data){
        var day = self.get('day');
        var mData = self.get('mData');
        data.forEach(function (item) {
          day.push(item.date);
          mData.push(item.memUsage);
        })
      }
      this.set('day',day);
      this.set('mData',mData);

      console.log(this.get('day'));
      console.log(this.get('mData'));
      this.reset();
    })

  },
  init(){
    this.set('_chartId','');
    this.set('day',[]);
    this.set('mData',[]);
    this._super.apply(this, arguments);
    var computerInfo = this.get('computerInfo');
    var _chartId = 'M'+computerInfo['hostid'];
    this.set('_chartId', _chartId);
  }
});
