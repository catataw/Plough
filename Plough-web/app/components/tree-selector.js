import Ember from 'ember';
import Mock from 'npm:mockjs';
import InboundActions from 'ember-component-inbound-actions/inbound-actions';
export default Ember.Component.extend(InboundActions, {
  Height: '600px',
  fixHeight: true, //是否自适应高度
  treeSize: Ember.computed('Height', {
    get() {
      const height = this.get('Height');
      return Ember.String.htmlSafe(`max-height: ${height}; overflow:auto;`);
    }
  }),
  Placeholder: '按菜单名称搜索',
  searchValue: '',
  searchNodes: Ember.A(),
  useCheck: false,
  //是否需要拖拽
  canDrag: false,
  //是否显示图标
  showIcon: false,
  //是否默认仅能在本级组织拖拽
  isOnlyDragInThisLevel: true,
  searchValueChanged: Ember.observer('searchValue', function () {
    Ember.run.debounce(this, this.search, 800);
  }),
  AllNodes: '',
  settings: null,
  // 限制（按层次）树的节点选中，默认不限制
  limitSelectLevel: -1,
  // 默认展开第一个子节点
  manualExpandFirstNode: false,
  checkSettings: {
    check: {
      enable: true,
      autoCheckTrigger: false,
      chkStyle: 'checkbox',
      chkboxType: {
        "Y": "",
        "N": ""
      },
      nocheckInherit: false,
      chkDisabledInherit: false,
      ridioType: 'level'
    }
  },
  //拖拽的设置
  dragSettings: {
    edit: {
      enable: true,
      showRemoveBtn: false,
      showRenameBtn: false,
      drag: {
        isMove: true,
        inner: false,
        prev: true,
        next: true
      }
    }
  },
  zNodes: Ember.A(),
  zNodesChanged: Ember.observer('zNodes', function () {
    this.createTree();
  }),
  didInsertElement(e) {
    this.createTree();
    let _self = this;
    let _wrapId = this.get("_wrapId");
    $(`#${_wrapId}`).on("click", () => {
      if (e && e.stopPropagation) {
        e.stopPropagation();      
      } else {
        window.event.cancelBubble = true;    
      }
    })
    // _self.resetScreen();
    // Ember.$(window).resize(function () {
    //   _self.resetScreen();
    // });
  },
  createTree() {
    let treeObject = this._setupJsTree();
    this._setupEventHandlers(treeObject);
    this.set('treeObject', treeObject);
    if (!Ember.isBlank(treeObject.getNodes())) {
      let toChoiceFirstNode = this._choiceFirstNode(treeObject);
      if (this.get('manualExpandFirstNode')) {
        this.sendAction('onExpand', toChoiceFirstNode);
      } else {
        this.sendAction('toAct', toChoiceFirstNode);
      }
    }
  },
  //选择根节点
  _choiceFirstNode(treeObject) {
    let shouldChoiced = treeObject.getNodes()[0];
    if (!Ember.isNone(shouldChoiced)) {
      while (shouldChoiced.isParent && !Ember.isEmpty(shouldChoiced.children)) {
        shouldChoiced = shouldChoiced.children[0];
      }
      treeObject.selectNode(shouldChoiced);
    } else {
      shouldChoiced = {
        id: -1
      }
    }
    return shouldChoiced;
  },
  _setupEventHandlers(treeObject) {
    treeObject.setting.callback.onClick = function (event, treeId, treeNode, clickFlag) {
      this.sendAction('toAct', treeNode);
    }.bind(this);
    if (this.get('isOnlyDragInThisLevel')) {
      /**
       * 开启拖拽时，并不能跨父组织拖拽
       * @type {function(this:_setupEventHandlers)}
       */
      treeObject.setting.callback.beforeDrop = function (treeId, treeNodes, targetNode, moveType, isCopy) {
        return Ember.isEqual(treeNodes[0].pId, targetNode.pId);
      };
      treeObject.setting.callback.onDrop = function (event, treeId, treeNodes, targetNode, moveType) {
        this.sendAction('toDrop', targetNode);
      }.bind(this);
    }
    treeObject.setting.callback.onCheck = function (event, treeId, treeNode) {
      this.sendAction('toChecked', treeNode);
    }.bind(this);
    treeObject.setting.callback.onExpand = function (event, treeId, treeNode) {
      // 展开集群节点时，若无孩子节点，则向后台发请求，请求后标记isLoaded=true
      if (this.get('manualExpandFirstNode') && (!treeNode.isLoaded && treeNode.level > this.get('limitSelectLevel'))) {
        if (treeNode.type && Ember.isEqual('cmh-hadoop', treeNode.type)) {
          this.sendAction('onExpand', treeNode);
          treeNode.isLoaded = true;
        }
      }
    }.bind(this);
    treeObject.setting.callback.beforeClick = function (treeId, treeNode, clickFlag) {
      let flag = false;
      if (treeNode.level > this.get('limitSelectLevel')) {
        /** 
        if(treeNode.type){
          flag = !Ember.isEqual('cmh-hadoop', treeNode.type)
        }else{
          flag = true;
        } */
        flag = true;
      }
      return flag;
    }.bind(this);
  },
  _setupJsTree() {
    Ember.merge(this.get('settings.view'), {
      showIcon: this.get('showIcon')
    });
    let _settings = this.get('canDrag') ? Ember.merge(this.get('settings'), this.get('dragSettings')) : this.get('settings');
    _settings = this.get('useCheck') ? Ember.merge(this.get('settings'), this.get('checkSettings')) : this.get('settings');
    return Ember.$.fn.zTree.init(Ember.$(`#${this.get('_wrapId')}`), _settings, this.get('zNodes'));
  },
  search() {
    var _clearNodes = function () {
      let _tree = this.get('treeObject');
      let _selected = this.get('searchNodes');
      _selected.forEach(_val => {
        _val.highlight = false;
        _tree.updateNode(_val);
        _tree.expandNode(_val.getParentNode(), false, true, null, false);
      });
      _selected.clear();
      //  _tree.expandAll(false);
    }.bind(this);
    if (!Ember.isBlank(this.get('searchValue'))) {
      _clearNodes();
      this.get('treeObject').getNodesByParamFuzzy('name', this.get('searchValue')).forEach(val => {
        val.highlight = true;
        if (!val.isParent) {
          this.get('treeObject').expandNode(val.getParentNode(), true, null, null, false);
        }
        this.get('searchNodes').addObject(val);
        this.get('treeObject').updateNode(val);
      })
    } else {
      _clearNodes();
    }
  },
  actions: {
    getAllNodes() {
      this.set('AllNodes', this.get('treeObject').getNodes());
    },
    removeNodeById(id) {
      let _nodeChoiced = this.get('treeObject').getNodeByParam('id', id);
      if (!!_nodeChoiced) {
        this.get('treeObject').removeNode(_nodeChoiced);
        this.sendAction('toAct', this._choiceFirstNode(this.get('treeObject')));
      }
    },
    reselectNode(node) {
      this.get('treeObject').selectNode(node);
      this.get('treeObject.setting.callback')
        .onClick(null, this.get('treeObject.setting.treeId'), obj, 1);
    }
  },
  init() {
    this._super.apply(this, arguments);
    this.set('_wrapId', Mock.Random.guid());
    this.set('settings', {
      view: {
        //showIcon: false,  // 图标样式，可以自定义图片，通过样式覆盖实现图标更替
        fontCss: function (treeId, treeNode) {
          return (!!treeNode.highlight) ? {
            color: "#A60000",
            "font-weight": "bold"
          } : {
            "font-weight": "normal",
            color: '#343440'
          };
        }
      },
      data: {
        keep: {
          parent: true
        },
        simpleData: {
          enable: true
        }
      }
    });
  },
  resetScreen: function () {
    let screenHeight = Ember.$(window).height();
    let toTop = Ember.$('.cluster-service-catalog-list').offset().top;
    if (this.get('fixHeight')) {
      Ember.$(`#${this.get('_wrapId')}`).css({
        'height': screenHeight - toTop - 5,
        'max-height': screenHeight - toTop - 5,
        'overflow': 'auto'
      });
    }
  }
});
