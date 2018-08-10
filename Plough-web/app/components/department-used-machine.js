import Ember from 'ember';
import {request} from '../utils/http-helpers';

export default Ember.Component.extend({

  'Title': '公司机器分布',
  _chartId: '',
  Datas: '',
  '_Datas': '',

  reset(){
    let _id = this.get('_chartId');
    let myChart = echarts.init(document.getElementById(_id));
    let __title = this.get('Title');
    let _datas = this.get('_Datas');
    let option = {
      title : {
        text: '公司机器分布',
        subtext: '部门分配',
        x:'right'
      },
      tooltip : {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      legend: {
        orient: 'vertical',
       // left: 'left',
        x:'left',
        data: ['大数据','云计算','IT支撑','运支']
      },
      series : [
        {

          name: '访问来源',
          type: 'pie',
          radius : '55%',
          center: ['50%', '60%'],
          data:[
            {value:105, name:'大数据'},
            {value:122, name:'云计算'},
            {value:64, name:'IT支撑'},
            {value:29, name:'运支'}
          ],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };

    myChart.setOption(option);
  },
  didInsertElement(){
    var data = [
      {
        "name": "usage",
        "value": 20,
        "type": "space"
      },
      {
        "name": "left",
        "value": 30,
        "type": "space"
      },
    ];

    this.set('_Datas',data);
    this.reset();
  },
  init(){
    this._super.apply(this, arguments);
    this.set('_chartId', 80);
  }
});
