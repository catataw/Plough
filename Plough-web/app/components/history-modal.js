import Ember from 'ember';

import {request} from '../utils/http-helpers';

export default Ember.Component.extend({
  /* heightControl:"", */
  modalId:'',
  relatedId:'',
  sumTax:'',
  statusList:[],
  projectProgressList:[],
  gatheringPlanList:[],
  mailStoneList:[],
  gatheringConfirmList:[],
  init(){
    this._super();
    /* let height = document.body.clientHeight;
    let maxHeight=height-120-85;
    let heightCOntrol="max-height:"+maxHeight+"px !important";
    this.set('heightControl', Ember.String.htmlSafe(heightCOntrol)); */
  },
  tabSwitch:{
    itemStatus:true,
    itemProgress:false,
    repayment:false,
  },
  relatedIdChange:Ember.observer('relatedId',function(){
    this.send('refreshStatus');
  }),
  didInsertElement(){
    
  },
  actions:{

         //切换项目历史tab
    switch(name){
      let obj = this.get('tabSwitch');
      for(var i in obj){
        if(i == name){
          this.set(`tabSwitch.${i}`,true);
        }else{
          this.set(`tabSwitch.${i}`,false);
        }
      }
/* 项目状态 */
  //获取列表    
      if(name==='itemStatus'){
        this.send('refreshStatus');
      }
/* 项目进展 */
  //获取列表
      else if(name === 'itemProgress'){
        this.send('refreshProgress');
      }
/* 里程与回款  */
  //收款计划-获取列表
  //里程碑-获取列表
  //收入确认-获取列表
      else if(name==='repayment'){
        this.send('refreshGatheringPlan');
        this.send('refreshMailStone');
        this.send('refreshGatheringConfirm');
      }
    },   
    closeAndReset(){
      this.set('tabSwitch.itemStatus',true);
      this.set('tabSwitch.itemProgress',false);
      this.set('tabSwitch.repayment',false);
      this.sendAction('hClose');
    },

  /* 项目状态 */
    //获取列表    
    refreshStatus(){
      request({
        name: 'get.ProjectStatus.getStatus.api',
        type: 'get',
        data:{},
      },{relatedId:this.get('relatedId')}).then((result) => {  
        if(result){
          console.log(result.info);
          if(result.status=='1'){
            this.set('statusList',result.data);
            if(result.data){
              result.data.forEach(function(item){
              item.updateTime=item.updateTime.substr(0,10); 
            });
          }
          }
        }else{
          
        }
      })
    },
/* 项目进展 */
  //获取列表
    refreshProgress(){
      request({
        name: 'get.ProjectProcess.getProcess.api',
        type: 'get',
        data:{}, 
      },{relatedId:this.get('relatedId')}).then((result) => {       //////////参数如何添加？？？？？
        if(result){
          console.log(result.info);
          if(result.status=='1'){
            this.set('projectProgressList',result.data);
            if(result.data){
              result.data.forEach(function(item){
              item.updateTime=item.updateTime.substr(0,10); 
               });
          }
          }
        }else{
          
        }
      })
    },
   /* 里程与回款  */
  //收款计划-获取列表
  refreshGatheringPlan(){
    request({
      name: 'get.ProjectGatheringPlan.getPlan.api',
      type: 'get',
      data:{},  
    },{relatedId:this.get('relatedId')}).then((result) => {       //////////参数如何添加？？？？？
      if(result){
        console.log(result.info);
        if(result.status=='1'){
          this.set('gatheringPlanList',result.data);
          this.set('sumTax',result.sumTax);
          if(result.data){
            result.data.forEach(function(item){
            item.gatheringTime=item.gatheringTime.substr(0,10); 
            if(item.updateTime=="0000-00-00"){
              item.updateTime=null;
            }
          });
        }
        }
      }
    })

  },
  
  //里程碑-获取列表
  
    refreshMailStone(){
      request({
        name: 'get.ProjectHistory.getMailStone.api',
        type: 'get',
        data:{},
      },{relatedId:this.get('relatedId')}).then((result) => {       //////////参数如何添加？？？？？
        if(result){
         
          console.log(result.info);
          if(result.status=='1'){
            this.set('mailStoneList',result.data);
            if(result.data){
              result.data.forEach(function(item){
               item.planFinishedTime=item.planFinishedTime.substr(0,10); 
               
               item.actualFinishedTime=item.actualFinishedTime.substr(0,10); 

               if(item.planFinishedTime=="0000-00-00"){
                item.planFinishedTime=null;
              }
              if(item.actualFinishedTime=="0000-00-00"){
                item.actualFinishedTime=null;
              }
             });
           }
          }
        }else{
          
        }
      })
    },
    
  //收入确认-获取列表
    refreshGatheringConfirm(){
      request({
        name: 'get.ProjectGatheringConfirm.getGatheringConfirm.api',
        type: 'get',
        data:{},
      },{relatedId:this.get('relatedId')}).then((result) => {       //////////参数如何添加？？？？？
        if(result){
          console.log(result.info);
          if(result.status=='1'){
            this.set('gatheringConfirmList',result.data);
            if(result.data){
              result.data.forEach(function(item){
              item.confirmProgressTime=item.confirmProgressTime.substr(0,10); 
              if(item.confirmProgressTime=="0000-00-00"){
                item.confirmProgressTime=null;
              }
            });
          }
          }
        }else{
          
        }
      })
    }
  }
});
