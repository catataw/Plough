import Ember from 'ember';
import {request} from '../utils/http-helpers';
export default Ember.Component.extend({
    _gatheringPlanList:[],
    _mailStoneList:[],
    _gatheringConfirmList:[],
    lastDate:null,
    test:'测试',
    StartDate:'',
    relatedId:'',
    sumTax:'',
   /*  totalTax:Ember.computed('_gatheringPlanList',{
        get(){
            //map方法返回计算结果形成的数组
            let taxList=this.get('_gatheringPlanList').map(function(item){
                return parseFloat(item.tax);    
            });
            let totalTax= taxList.reduce(function(prev,cur){
               return prev+cur;
            });
            return totalTax.toString();
        }
    }), */
    /* 计算每个li的颜色 */
    colorList:Ember.computed('_mailStoneList.@each.status',{
      get(){
        let statustoCol=this.get('_mailStoneList').map(function(item){
          
          if(item.status == '已完成'){
            return 'gray';
          }   
          else if(item.status == '进行中'){
            return 'green';
          } 
          else if(item.status == '未开始'){
            return 'red';
          } 
          });
          return statustoCol;
      }
    }),


    init(){
        this._super();
      },
    actions:{
   
        addGatheringPlan:function(value,event){
            if(Ember.isEmpty(this.get('_gatheringPlanList'))){
              this.set('_gatheringPlanList',Ember.A());
            }
            var newGatheringPlan={
              "relatedId":this.get('relatedId'),
              "gatheringCondition":'',
              "gatheringTime":'',
              "tax":'',
              "noTax":'',
              "gatheringRate":'',
            };
            this.get('_gatheringPlanList').addObject(newGatheringPlan);

        },

        addMailStone:function(){
          if(Ember.isEmpty(this.get('_mailStoneList'))){
            this.set('_mailStoneList',Ember.A());
          }
            var newMailStone = {
              "relatedId":this.get('relatedId'),
              "mailstoneName": "",
              "weight":0,
              "planFinishedTime": "",
              "deliverable": "",
              "status": "已完成",
              "arrivalConfirmation": "",
              "actualFinishedTime": ""
            };
            this.get('_mailStoneList').addObject(newMailStone);
        },

        addGatheringConfirm:function(){
          if(Ember.isEmpty(this.get('_gatheringConfirmList'))){
            this.set('_gatheringConfirmList',Ember.A());
          }
            var newGatheringConfirm = {
              "relatedId": this.get('relatedId'),
              "confirmProgressTime": "",
              "confirmTax": "",
              "confirmNoTax": "",
              "textRate":"",
              "confirmedProgress": ""
            };
            this.get('_gatheringConfirmList').addObject(newGatheringConfirm);
        },
        
        modifyGatheringPlan:function(item){
          self=this;
          /* self.set("erroInfo",""); */
          request({
            name: 'post.editGatheringPlan.api',
            type: 'post',
            data:item, 
          }).then((result) => {       
            if(result.status=='1'){
              alert(result.info);
            }else{
              if(result.info=="tax参数错误"||result.info=="gatheringRate参数错误"||result.info=="noTax参数错误"){
                alert("数据提交失败，收款含税金额、收款不含税金额必须为大于0且最多含两位小数的数字，收款比例必须是0-100的整数，请正确编辑后重新提交！");
              }
              else if(result.info=="修改失败"){
                alert("未做修改");
              }
              else{
              alert('数据提交失败，请完整填写所有字段后重新提交！');
            }
              /* self.set("erroInfo","未做修改"); */
            }
          })
        },
        uploadGatheringPlan:function(item){
          request({
            name: 'post.addGatheringPlan.api',
            type: 'post',
            data:item, 
          }).then((result) => { 
            if(result.status=='0'){
              if(result.info=="tax参数错误"||result.info=="gatheringRate参数错误"||result.info=="noTax参数错误"){
                alert("数据提交失败，收款含税金额、收款不含税金额必须为大于0且最多含两位小数的数字，收款比例必须是0-100的整数，请正确编辑后重新提交！");
              }
              else if(result.info=="修改失败"){
                alert("未做修改");
              }
              else{
              alert('数据提交失败，请完整填写所有字段后重新提交！');
            }
            }     
            else if(result.status == '1'){ 
            alert(result.info);
            //新数据添加成功后刷新数据
            this.sendAction('toRefreshGatheringPlan'); 
             }
          })
        
        },
        deleteGatheringPlan:function(item){
          if(item.id){
          request({
            name: 'delete.ProjectGatheringPlan.deletePlan.api',
            type: 'delete',
            data:{}, 
          },{id:item.id}).then(
            (result) => {       
            if(result){
              alert(result.info);
            }else{
            }
          })
          this.sendAction('toRefreshGatheringPlan'); 
         }
          else{
            this.set('_gatheringPlanList',this.get('_gatheringPlanList').without(item));
          }
        },

        modifyMailStone:function(item){
          request({
            name: 'post.editMailStone.api',
            type: 'post',
            data:item, 
          }).then((result) => {  
            if(result.status=='1'){
              alert(result.info);
            }else{
              if(result.info=="weight参数错误"){
                alert("数据提交失败，权重必须是0-100的整数，请正确编辑后重新提交！");
              }
              else if(result.info=="修改失败"){
                alert("未做修改");
              }
              else{
              alert('数据提交失败，请完整填写所有字段后重新提交！');
            }
            }     
          })
        },
        uploadMailStone:function(item){
          request({
            name: 'post.addMailStone.api',
            type: 'post',
            data:item, 
          }).then((result) => {   
            if(result.status=='0'){
              if(result.info=="weight参数错误"){
                alert("数据提交失败，权重必须是0-100的整数，请正确编辑后重新提交！");
              }
              else if(result.info=="修改失败"){
                alert("未做修改");
              }
              else{
              alert('数据提交失败，请完整填写所有字段后重新提交！');
            }
            }     
            else if(result.status == '1'){ 
            alert(result.info);
             //新数据添加成功则刷新页面
              this.sendAction('torefreshMailStone');
            }
          })
        },
        deleteMailStone:function(item){
          //如果不是新增数据，则发送删除请求并刷新
           if(item.id){
           request({
             name: 'delete.deleteMailStone.api',
             type: 'delete',
             data:{}, 
           },{id:item.id}).then((result) => {       
             if(result){
               alert(result.info);
             }else{
               
             }
           })
           this.sendAction('torefreshMailStone');
         }
          //如果是新增数据，则直接在显示列表中去除该项
         else{
          this.set('_mailStoneList',this.get('_mailStoneList').without(item));
        }
         },
        
        modifyConfirm:function(item){
          request({
            name: 'post.editGatheringConfirm.api',
            type: 'post',
            data:item, 
          }).then((result) => {       
            if(result.status=='1'){
              alert(result.info);
            }else{
              if(result.status=='0'){
                if(result.info=="confirmTax参数错误"||result.info=="confirmNoTax参数错误"||result.info=="confirmedProgress参数错误"||result.info=="textRate参数错误"){
                  alert("数据提交失败，确认含税金额、确认不含税金额必须为大于0且最多含两位小数的数字，税率、已确认项目进度必须是0-100的整数，请正确编辑后重新提交！");
                }
                else if(result.info=="修改失败"){
                  alert("未做修改");
                }
                else{
                alert('数据提交失败，请完整填写所有字段后重新提交！');}
              }
            }
          })
        },
        uploadConfirm:function(item){
          request({
            name: 'post.addGatheringConfirm.api',
            type: 'post',
            data:item, 
          }).then((result) => {       
              if(result.status=='0'){
                if(result.info=="confirmTax参数错误"||result.info=="confirmNoTax参数错误"||result.info=="confirmedProgress参数错误"||result.info=="textRate参数错误"){
                  alert("数据提交失败，确认含税金额、确认不含税金额必须为大于0且最多含两位小数的数字，税率、已确认项目进度必须是0-100的整数，请正确编辑后重新提交！");
                }
                else if(result.info=="修改失败"){
                  alert("未做修改");
                }
                else{
                alert('数据提交失败，请完整填写所有字段后重新提交！');}
            }     
            else if(result.status == '1'){ 
            alert(result.info);

            //新数据添加成功则刷新页面
            this.sendAction('torefreshGatheringConfirm');
            }
          })
        },
        deleteConfirm:function(item){
         /* 如果不是新增数据，则发送删除请求并刷新 */
          if(item.id){
          request({
            name: 'delete.deleteGatheringConfirm.api',
            type: 'delete',
            data:{}, 
          },{id:item.id}).then((result) => {       
            if(result){
              alert(result.info);
            }else{
              
            }
          })
          this.sendAction('torefreshGatheringConfirm');
        }
        else{
          //如果是新增数据，则直接在显示列表中去除该项
          this.set('_gatheringConfirmList',this.get('_gatheringConfirmList').without(item));
        }
        },
    }
  });
