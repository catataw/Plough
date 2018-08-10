import Ember from 'ember';

export default Ember.Component.extend({
    tagName:'',
    
    progressInfo:'',
    mockId:'',
    didRender(){
        let id = this.get('mockId');
        var tableHeight = Ember.$(`#table-content${id}`).height();
        var setHeight = tableHeight+14;
       /*  svgParam.id = id; */
        
        /* svgParam.width = 40;
        svgParam.height = setHeight; */
        let cy = setHeight/2;
        let y1 = 0;
        if(id == 0){
          y1 = setHeight/2+10
        }
       let y2 = setHeight+20
    
       let svgParam={
            'width':40,
            'height':setHeight,
            'cy':cy,
            'y1':y1,
            'y2':y2
          };
        this.sendAction('toDrawSvg',svgParam);
      },



    actions:{
        
    }
});
