import Ember from 'ember';
import {request} from '../utils/http-helpers';
export default Ember.Component.extend({
 relatedId:'',
  _projectProgressList:[],
  firstWeekInfo:Ember.computed('_projectProgressList.@each.id',function(){
    return this.get('_projectProgressList')[0];
  }),
  secondWeekInfo:Ember.computed('_projectProgressList.@each.id',function(){
    return this.get('_projectProgressList')[1];
  }),
  beforeWeekInfo:Ember.computed('_projectProgressList.@each.id',function(){
 
    return this.get('_projectProgressList').slice(2);
  }),
  modified0:false,
  modified1:false,
  upload:false,
  modified0Change:Ember.observer('firstWeekInfo',function(){
        let item = this.get('firstWeekInfo');
        if(item.process=="0" && item.risk=="高" && Ember.isEmpty(item.responseMeasures)&& Ember.isEmpty(item.currentProgress)&&Ember.isEmpty(item.recentPlan)){
          this.set('modified0',true);

          this.set('upload',true);
        }
        else{
          this.set('upload',false);
        }
      }),
       
    actions:{
        modify0(){
          this.toggleProperty('modified0');
        },
        modify1(){
          this.toggleProperty('modified1');
        },
        uploadData(obj){
          //发送数据到后台，采用request请求
          request({
            name: 'post.editProcess.api',
            type: 'post',
            data:obj, 
          }).then((result) => {
            
            if(result.status=='0'){
              alert('未做修改');
            }     
            else if(result.status == '1'){ 
            alert(result.info);
            }})}
          }

});
