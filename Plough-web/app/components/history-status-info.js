import Ember from 'ember';
import{dateUtils} from '../utils/date';
import {request} from '../utils/http-helpers';
export default Ember.Component.extend({
  relatedId:'',
  currentDate: dateUtils.formatDate(new Date),
  newStatus:null,
  _statusList:[],
  addItem:false,
  init(){
    this._super();
    this.set('addItem',false);
    
  },
  /* reset(){
    let myChart = echarts.init(document.getElementById("history-status"));
    let option = {
      backgroundColor: '#F4F4F4',  

      title: {
        text: 'Step Line'
    },
    tooltip: {
        trigger: 'axis'
    },
    legend: {
        data:['Step Start']
    },
    grid: {
        
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    toolbox: {

    },
    xAxis: {
        axisLabel:{
          rotate:30,
          interval:0
        },
        type: 'category',
        boundaryGap:false,   //折线图从x轴零刻度开始
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    },
    yAxis: {
        type: 'value'
    },
    series: [
        {
            name:'Step Start',
            type:'line',
            step: 'middle',
            symbol:'none',
            data:[10, 20, 30, 50, 90, 30, 10]
        }
    ]
    };

    myChart.setOption(option);
  },

  didInsertElement(){
    this.reset();
  },
 */
  
  actions:{

    addNew(){
      this.toggleProperty('addItem');
      this.set('newStatus',{
        "relatedId": this.get('relatedId'),
        "commerceStatus": "商机中",
        "implementBases": "无",
        "developStatus": "未开发",
        "onlineStatus": "未上线",
        "operateStatus": "未交维",
        "implementStatus": "未实施",
        "updateTime":  this.get('currentDate')
        });
      },

    confirmAddNew(){
      this.toggleProperty('addItem');
      let newStatus= this.get('newStatus');
        request({
          name: 'post.addStatus.api',
          type: 'post',
          data:newStatus, 
        }).then((result) => {       
          if(result.status=='0'){
            alert("添加失败，请重新编辑");
          }
          else {
            alert(result.info);
            this.sendAction("toRefreshStatus");
          }
    })
  },
  cancelAddNew(){
    this.set('addItem',false);
    this.set('newStatus',null);
  },
  confirmModify(item){
    //let data = delete item.relatedId;
    request({
      name: 'post.editStatus.api',
      type: 'post',
      data:item, 
    }).then((result) => { 
      if(result.status=='0'){
        alert("修改失败，请重新修改");
      }
      else {
        alert(result.info);
        this.sendAction("toRefreshStatus");
      }      
})
},
  cancleMOdify(item){
      
}
  }

});
