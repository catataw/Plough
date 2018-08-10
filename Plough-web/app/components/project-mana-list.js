import Ember from 'ember';

export default Ember.Component.extend({
    classNames: ['project-mana-list'],
    _showRange: 1,
    tableRanges: [{
        num: 1,
        startLine: 0
    }, {
        num: 2,
        startLine: 1705
    }, {
        num: 3,
        startLine: 2390
    }, {
        num: 4,
        startLine: 3525
    }, {
        num: 5,
        startLine: 4005
    }, {
        num: 6,
        startLine: 4460
    }, {
        num: 7,
        startLine: 4700
    }, {
        num: 8,
        startLine: 4790
    }],
    _projectTypes: [{
        name: '市场类（外部）',
        key: 'projectType',
        th: '项目类型'
    }, {
        name: '市场类（内部）',
        key: 'projectType',
        th: '项目类型'
    }, {
        name: '集团产品研发类',
        key: 'projectType',
        th: '项目类型'
    }, {
        name: '集团委托应用研发类',
        key: 'projectType',
        th: '项目类型'
    }],
    _projectLevel:[{
        name:'重大',
        key:'projectLevel',
        th:'项目级别'
    }, {
        name:'重点',
        key:'projectLevel',
        th:'项目级别'
    }, {
        name:'一般',
        key:'projectLevel',
        th:'项目级别'
    }],
    _projectClassify:[{
        name:'平台类',
        key:'projectClassify',
        th:'项目分类'
    },{
        name:'应用类',
        key:'projectClassify',
        th:'项目分类'
    },{
        name:'运营类',
        key:'projectClassify',
        th:'项目分类'
    },{
        name:'咨询类',
        key:'projectClassify',
        th:'项目分类'
    },{
        name:'分析类',
        key:'projectClassify',
        th:'项目分类'
    }],
    _stricts: [{
        name: '北支',
        key: 'involvedRegion',
        th: '涉及区域'
    }, {
        name: '上支',
        key: 'involvedRegion',
        th: '涉及区域'
    }, {
        name: '成支',
        key: 'involvedRegion',
        th: '涉及区域'
    }, {
        name: '广支',
        key: 'involvedRegion',
        th: '涉及区域'
    }],
    _businessTypes: [{
        name: '商机中',
        key: 'commerceStatus',
        th: '商务状态'
    }, {
        name: '已立项',
        key: 'commerceStatus',
        th: '商务状态'
    }, {
        name: '已谈判',
        key: 'commerceStatus',
        th: '商务状态'
    }, {
        name: '已签约',
        key: 'commerceStatus',
        th: '商务状态'
    }, {
        name: '已结项',
        key: 'commerceStatus',
        th: '商务状态'
    }],
    _implementBases: [{
        name: 'POC',
        key: 'implementBases',
        th: '实施依据'
    }, {
        name: '合同',
        key: 'implementBases',
        th: '实施依据'
    }, {
        name: 'POC+合同',
        key: 'implementBases',
        th: '实施依据'
    }],
    _implementStatus: [{
        name: '未实施',
        key: 'implementStatus',
        th: '实施状态'
    }, {
        name: '实施中',
        key: 'implementStatus',
        th: '实施状态'
    }, {
        name: '已完成',
        key: 'implementStatus',
        th: '实施状态'
    }],
    _developStatus: [{
        name: '未开发',
        key: 'developStatus',
        th: '研发状态'
    }, {
        name: '开发中',
        key: 'developStatus',
        th: '研发状态'
    }, {
        name: '已完成',
        key: 'developStatus',
        th: '研发状态'
    }],
    _onlineStatus: [{
        name: '未上线',
        key: 'onlineStatus',
        th: '上线状态'
    }, {
        name: '预上线',
        key: 'onlineStatus',
        th: '上线状态'
    }, {
        name: '正式上线',
        key: 'onlineStatus',
        th: '上线状态'
    }],
    _operateStatus: [{
        name: '已交维',
        key: 'operateStatus',
        th: '交维状态'
    }, {
        name: '未交维',
        key: 'operateStatus',
        th: '交维状态'
    }, {
        name: '自运维',
        key: 'operateStatus',
        th: '交维状态'
    }],
    _risk: [{
        name: '高',
        key: 'risk',
        th: '当前风险度'
    }, {
        name: '中',
        key: 'risk',
        th: '当前风险度'
    }, {
        name: '低',
        key: 'risk',
        th: '当前风险度'
    }],
    
    filterByTeam: [
        '方案1组',
        '方案2组',
        '方案3组',
        '方案4组',
        '方案5组',
        '白金产品组',
        'BI套件组',
        '移动业务大数据组',
        '行业应用大数据组',
        '移动网络大数据组',
        '平台产品组',
        'DM组',
        'OP组',
        '套件组',
        '前端组',
        'HC组',
        'RDB组',
        '安全组',
        '数据智能产品组',
        'SE组',
        'I3组',
        'AI组',
        'BDP组',
        'UIUE组',
        '分析组',
        'CICD组',
        'i-deliver组',
        'p-deliver组',
        'pms-deliver组',
        's-deliver组',
        '服务组',
        'PMO组',
    ],
    filterLists:[],
    sortAttrs: [],
    sortTrigger: false,
    filterData:[],
    _isEmptyOrNot: true,
    minDatas:false,
    /**
     * 排序或者筛选，
     * 先排序 后筛选
     */
    _Datas: Ember.computed('Datas.@each', 'filterLists.@each', 'sortTrigger', {
        get() {
            if (!Ember.isEmpty(this.get('sortAttrs'))) {
                return this._sorting();
            } else if (0 == this.get('filterLists')) {
                this.set('filterData',this.get('Datas'));
                return this.get('Datas');
            } else {
                return this.filting();
            }
        }
    }),
    _minDatas:Ember.observer('_Datas.[]',function(){
            if(this.get('_Datas')){
                if(this.get('_Datas.length')>4){
                    this.set('minDatas',false);
                }else{
                    this.set('minDatas',true);
                }
            }else{
                this.set('minDatas',false);
            }
    }),
    isDataEmpty: Ember.observer('_Datas.[]',function(){
        let isEmptyOrNot = Ember.isEmpty(this.filting())? false : true ;
        this.set('_isEmptyOrNot',isEmptyOrNot);
    }),
    _filterByTeam: Ember.computed('filterByTeam',{
        get(){
            let filterTeamsName = []
            this.get('filterByTeam').forEach((val,index)=>{
                filterTeamsName.push({
                    name:val,
                    key:'teams',
                    th:'涉及小组'
                })
            })
            return filterTeamsName;
        }
    }),
    
    actions: {
        editProjectForm(obj) {
            this.sendAction('EditProjectForm', obj);
        },
        history(relatedId) {
            this.sendAction("toShowHistory",relatedId);
        },
        grade() {

        },
        lookDetails(obj) {
            this.sendAction('LookDetails', obj);
        },
        setShowRange(line) {
            this.set('_showRange', line);
            let _obj = this.get('tableRanges').findBy('num', line);
            $(".fixed-table_body-wraper").scrollLeft(_obj['startLine']);
        },
        choosing(obj) {
            if (this.get('filterLists').findBy('th', obj.th)) {
                if(obj.th == "项目分类" || obj.th == "涉及小组"){
                    if(this.get('filterLists').findBy('name', obj.name)){
                        return 
                    }else{       
                        let index = this.get('filterLists').indexOf(this.get('filterLists').findBy('th', obj.th));
                        if(index != -1){
                            this.get('filterLists').insertAt(index, obj);
                        }else{
                            this.get('filterLists').addObject(obj); 
                        }
                    }   
                }else{
                    this.get('filterLists').removeObject(this.get('filterLists').findBy('th', obj.th));
                    this.get('filterLists').unshiftObject(obj);
                }
            }else{
                if(obj.th == "项目分类" || obj.th == "涉及小组"){
                    this.get('filterLists').addObject(obj); 
                }else{
                    this.get('filterLists').unshiftObject(obj);
                }
            }   
        },
        sorting(attr) {
            this.get('sortAttrs').addObject(attr);
            this.toggleProperty('sortTrigger');
        }
    },
    didRender() {
        $(".fixed-table-box").fixedTable();
    },
    _sorting() {
        let sortData = this.get('filterData.length') == 0 ? this.get('Datas') : this.get('filterData');
        let __datas = this.get('sortAttrs').reduce((_lists, val) => {
            return _lists.sortBy(val);
        }, sortData);
        this.get('sortAttrs').clear();
        return __datas;
    },
    filting() {
        let _result = [];
        let _singleFilter = [];
        let _checkType = '';
        let lists = this.get('Datas');
        return this.get('filterLists').reduce((_lists, val, index) => { 
            if(index > 0){
                if(val.key == "teams" || val.key == "projectClassify"){
                    if(_checkType) {
                        if(_checkType == val.key){
                            lists =  _singleFilter;
                        }else{
                            lists =  _result;
                            _result = [];
                        }
                    }else{
                        _checkType = val.key;
                        _singleFilter = _result;
                        lists =  _singleFilter;
                        _result = [];
                    }
                }else{
                    lists =  _result;
                    // _singleFilter = _result;
                    _result = [];
                }
            }
            lists.forEach(_val => {
                if (Ember.isNone(_val[val.key])) {
                    return;
                }
                //先判断是否为时间类型的
                if (val.type && 'date-range' == val.type) {
                    let ranges = val.name.split('~');
                    if (moment(_val[val.key]).isBefore(ranges[1].trim()) && moment(_val[val.key]).isAfter(ranges[0].trim())) {
                        _result.push(_val);
                    }
                }else if(val.key == "teams") {
                    if(_val[val.key].indexOf(val.name)!=-1){
                        _result.push(_val);
                    }
                }else if(val.key == "projectClassify"){
                    if(_val[val.key] == val.name)
                    _result.push(_val);
                }else if(_val[val.key] == val.name) {
                    _result.push(_val);
                }
            });
            if(this.get('filterLists.length') -1 == index){
                this.set('filterData',_result);//拿到筛选后的数据
                return _result;
            }
        },this.get('Datas'))
    },
    init() {
        this._super();
        //点击框外面会关闭筛选框功能
        Ember.run.scheduleOnce('afterRender', this, function () {
            $('body').delegate("div", "click", function () {
                if (!($(this).parents('.active-parent-pane').length != 0 || $(this).hasClass('active-parent-pane'))) {
                    $('.active-pane').removeClass('active');
                }
            });
        });
    },
});
