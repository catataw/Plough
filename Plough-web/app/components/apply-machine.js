import Ember from 'ember';
import {request} from '../utils/http-helpers';

export default Ember.Component.extend({

  'Title': '公司机器分布',
  _chartId: '',
  Datas: '',
  '_Datas': '',
  types:Ember.computed('_Datas',{
    get(){
      let array = this.get('_Datas');
      let types = [];
      if (Ember.isArray(array) && !Ember.isBlank(array)) {
        array.forEach((val, i)=> {
          types.push(val.name);

        });
      }
      return types;
    }
  }),
  reset(){
    let _id = this.get('_chartId');
    let myChart = echarts.init(document.getElementById(_id));
    let __datas = this.get('_Datas');
    let __types = this.get('types');
    let option = {
      title : {
        text: '机器分类',
        subtext: '分类占比',
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
        data: __types
      },
      series : [
        {
          name: '访问来源',
          type: 'pie',
          radius : '55%',
          center: ['50%', '60%'],
          data:__datas,
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
    request({
      name: 'computer.type.count',
      type: 'get',
      data:{}
    }).then((data) => {
      this.set('_Datas',data);
      this.reset();
    })
  },
  init(){
    this._super.apply(this, arguments);
    this.set('_chartId', 81);
  }
});
