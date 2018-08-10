import Ember from 'ember';
import {request} from '../utils/http-helpers';

export default Ember.Component.extend({

  'Title': '部门机器分布',
  _chartId: '',
  Datas: '',
  '_Datas': '',
  team:Ember.computed('_Datas',{
    get(){
      let array = this.get('_Datas');
      let team = [];
      var j = 0;
      if (Ember.isArray(array) && !Ember.isBlank(array)) {
        array.forEach((val, i)=> {
          j++;
          if(j%2>0){

            team.push('\n'+val.name);
          }else{
            team.push(val.name);
          }
        });
      }
      return team;
    }
  }),
  data:Ember.computed('_Datas',{
    get(){
      let array = this.get('_Datas');
      let data = [];
      if (Ember.isArray(array) && !Ember.isBlank(array)) {
        array.forEach((val, i)=> {
          data.push(val.value);

        });
      }
      return data;
    }
  }),

  reset(){
    let _id = this.get('_chartId');
    let myChart = echarts.init(document.getElementById(_id));
    let __title = this.get('Title');
    let _datas = this.get('data');
    let __team = this.get('team');


    let option = {
      title : {
        text: '小组机器占用',
        subtext: '占用概况',
        x:'left'
      },
      tooltip : {
        trigger: 'axis'
      },
      legend: {
        orient: 'vertical',
        data: ['机器数量']
      },
      toolbox: {
        show : true,
        feature : {
          mark : {show: true},
          dataView : {show: true, readOnly: false},
          magicType : {show: true, type: ['line', 'bar']},
          restore : {show: true},
          saveAsImage : {show: true}
        }
      },

      calculable : true,
      xAxis : [
        {
          'type':'category',
          'axisLabel':{'interval':0},
          data : __team
        }
      ],
      yAxis : [
        {
          type : 'value'
        }
      ],
      series : [

        {
          name:'机器台数',
          type:'bar',
          data:_datas,
          itemStyle : { normal: {label : {show: true, position: 'inside'}}},
          /*markPoint : {
            data : [
              {name : '年最高', value : 182.2, xAxis: 7, yAxis: 183, symbolSize:18},
              {name : '年最低', value : 2.3, xAxis: 11, yAxis: 3}
            ]
          },*/
          markLine : {
            data : [
              {type : 'average', name : '平均值'}
            ]
          }
        }
      ]
    };

    myChart.setOption(option);
  },
  didInsertElement(){

    request({
      name: 'person.computer.count',
      type: 'get',
      data:{}
    }).then((data) => {
      this.set('_Datas',data);
      this.reset();
    })

  },
  init(){
    this._super.apply(this, arguments);
    this.set('_chartId', 82);
  }
});
