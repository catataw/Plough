import Ember from 'ember';

export default Ember.Component.extend({

  editor:null,

  init(){
    // 实例化editor编辑器

    this.editor = UE.getEditor('editor');

    // console.log(this.editor.setContent("1223"))
  },
  methods: {
    gettext() {
      // 获取editor中的文本
      console.log(this.editor.getContent())
    }
  }

})
