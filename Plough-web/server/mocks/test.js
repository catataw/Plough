module.exports = function(app) {
    var express = require('express');
    var MetaMyDataRouter = express.Router();
    var DataStandardRouter = express.Router();
    var DataAssertRouter = express.Router();
    var Mock = require('mockjs');


    /**
     * 元数据审核列表
     */
    MetaMyDataRouter.get('/approvals', function(req, res) {
        res.send(
            Mock.mock({
                'modelData|5-10':[
                    {
                        'id':function(){
                            return  Mock.Random.integer(1,10000);
                        },
                        'tableId':function(){
                            return  Mock.Random.integer(1,10000);
                        },
                        'applicationId':function(){
                            return  Mock.Random.integer(1,10000);
                        },
                        'tableName':function(){
                            return Mock.Random.word(3, 5);
                        },
                        'chineseName':function(){
                            return Mock.Random.cname();
                        },
                        'serialNumber':function(){
                            return Mock.Random.integer(1,10000);
                        },
                        'applicationType|1':['create','modify','publish','unpublish'],
                        'version':function(){
                            return Mock.Random.integer(1,10000);
                        },
                        'status|1':['approving', 'approved', 'rejected','revoke'],
                        'lastUpdateTime':function(){
                            return Number(Mock.Random.date('T'));
                        },
                        'refusedReason':function(){
                            return Mock.Random.word(3, 4);
                        },
                        'revokeReason':function(){
                            return Mock.Random.word(6, 7);
                        },
                        'applicantName':function(){
                            return Mock.Random.word(3, 5);
                        }
                    }],
                'meta':{
                    'offset':parseInt(req.query.offset),
                    'limit':15,
                    'totalPage':'@INT(5,12)'
                }
            })
        );
    });

    /**
     * 元数据审核页面，元数据详情
     */
    MetaMyDataRouter.get('/approvals/:applicationId/details', function(req, res) {
        res.send(
            Mock.mock({
                'modelData':
                {
                    'id':function(){
                        return  Mock.Random.integer(1,10000);
                    },
                    'tableName':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'status|1':['approving', 'approved', 'rejected','revoke'],
                    'applicationType|1':['create','modify','publish','unpublish'],
                    'reason':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'applyTime':function(){
                        return Number(Mock.Random.date('T'));
                    },

                    'lastUpdateTime':function(){
                        return Number(Mock.Random.date('T'));
                    },
                    'operations|1':['approve', 'reject'],
                    'privileges':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'refusedReason':function(){
                        return Mock.Random.word(3, 4);
                    },
                    'revokeReason':function(){
                        return Mock.Random.word(6, 7);
                    },
                    'applicantName':function(){
                        return Mock.Random.word(3, 5);
                    }
                },
                'meta':{
                    'offset':parseInt(req.query.offset),
                    'limit':15,
                    'totalPage':'@INT(5,12)'
                }
            })
        );
    });
    /**
     * 元数据审批拒绝
     */
    MetaMyDataRouter.put('/approvals/:applicationId', function(req, res) {
        res.status(201).end();
    });
    /**
     * 数据标准审批
     */
    DataStandardRouter.put('/dataStandards/standards/approvals/:id/:groupId', function(req, res) {
        res.status(201).end();
    });
    /**
     * 数据资产审批
     */
    DataAssertRouter.put('/dataAssets/auth/approvals/:applyId', function(req, res) {
        res.status(201).end();
    });
    // /assets/{userId}/dataAssets/auth/approvals/{applyId}?op=2&rejectReason=No
    /**
     * 数据标准
     */
    DataStandardRouter.get('/dataStandards/standards/getApplyList', function(req, res) {
        res.send(
            Mock.mock({
                'modelData|5-10':[
                    {
                        'id':function(){
                            return  Mock.Random.integer(1,10000);
                        },
                        'groupId':function(){
                            return  Mock.Random.integer(1,10000);
                        },
                        'groupName':function(){
                            return Mock.Random.word(3, 5);
                        },
                        'userId':function(){
                            return Mock.Random.integer(1,10000);
                        },
                        'userName':function(){
                            return Mock.Random.word(3, 5);
                        },
                        'applyTime':function(){
                            return Number(Mock.Random.date('T'));
                        },
                        'applyReason':function(){
                            return Mock.Random.word(3, 5);
                        },
                        'rejectReason':function(){
                            return Mock.Random.word(3, 4);
                        },
                        'revokeReason':function(){
                            return Mock.Random.word(6, 8);
                        },
                        'status|1':[0, 1, 2, 3],
                        'updateTime':function(){
                            return Number(Mock.Random.date('T'));
                        }
                    }],
                'meta':{
                    'offset':parseInt(req.query.offset),
                    'limit':15,
                    'totalPage':'@INT(5,12)'
                }
            })
        );
    });
    /**
     * 数据标准详情
     */
    DataStandardRouter.get('/dataStandards/standards/getApplyDetail/:id/:applicant', function(req, res) {
        res.send(
            Mock.mock({
                'modelData':
                {
                    'id':function(){
                        return  Mock.Random.integer(1,10000);
                    },
                    'groupId':function(){
                        return  Mock.Random.integer(1,10000);
                    },
                    'groupName':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'userId':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'userName':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'applyTime':function(){
                        return Number(Mock.Random.date('T'));
                    },
                    'applyReason':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'rejectReason':function(){
                        return Mock.Random.word(3, 4);
                    },
                    'revokeReason':function(){
                        return Mock.Random.word(6, 8);
                    },
                    'status|1':[0, 1, 2, 3],
                    'updateTime':function(){
                        return Number(Mock.Random.date('T'));
                    },
                    'data':[{
                        "id":1,
                        "chineseName":"统计时间",
                        "fieldName":"STAT_DATE",
                        "databaseType":"hive",
                        "dataType":"char",
                        "dataLength":"20",
                        "emptyJudge":1,//前端转义
                        "status":1,//前端转义
                        "remark":"描述啊啊啊啊啊啊啊啊啊",
                        "version":1
                    },
                        {
                            "id":2,
                            "chineseName":"统计时间",
                            "fieldName":"STAT_DATE",
                            "databaseType":"hive",
                            "dataType":"char",
                            "dataLength":"20",
                            "emptyJudge":1,//前端转义
                            "status":1,//前端转义
                            "remark":"描述啊啊啊啊啊啊啊啊啊",
                            "version":1
                        }]

                },
                'meta':{
                    'offset':parseInt(req.query.offset),
                    'limit':15,
                    'totalPage':'@INT(5,12)'
                }
            })
        );
    });

    //数据资产列表
    DataAssertRouter.get('/dataAssets/auth/approvals', function(req, res) {
        res.send(
            Mock.mock({
                'modelData|5-10':[{
                    'id':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'identity':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'status|1':[-1, 0, 1, 2],
                    'chineseName':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'tableName':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'dataAssetsIdentity':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'applyAuth':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'applicantId':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'applicantName':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'rejectReason':function(){
                        return Mock.Random.word(3, 4);
                    },
                    'revokeReason':function(){
                        return Mock.Random.word(6, 8);
                    },
                    'lastUpdatedTime':function(){
                        return Number(Mock.Random.date('T'));
                    }
                }],
                'meta':{
                    'offset':parseInt(req.query.offset),
                    'limit':15,
                    'totalPage':'@INT(5,12)'
                }
            })
        );
    });
    //数据资产详情
    DataAssertRouter.get('/dataAssets/auth/:dataAssetsId', function(req, res) {
        res.send(
            Mock.mock({
                'modelData':{
                    'id':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'applyAuth':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'status|1':[-1, 0, 1, 2],
                    'applyType':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'expiredDate':function(){
                        return Mock.Random.integer(1,10000);
                    },

                    'dataAssetsIdentity':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'ownerId':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'ownerName':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'applyReason':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'rejectReason':function(){
                        return Mock.Random.word(3, 4);
                    },
                    'revokeReason':function(){
                        return Mock.Random.word(6, 8);
                    },
                    'applyTime':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'lastUpdatedTime':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'dataAssetsApplyColumns':[
                        {"chineseName":"中文名","columnName":"字段名"},
                        {"chineseName":"中文名2","columnName":"字段名2"}
                    ]
                },
                'meta':{
                    'offset':parseInt(req.query.offset),
                    'limit':15,
                    'totalPage':'@INT(5,12)'
                }
            })
        );
    });

    MetaMyDataRouter.get('/applications', function(req, res) {
        res.send(
            Mock.mock({
                'modelData|8-15':[{
                    'id':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'tableId':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'applicationId':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'chineseName':function(){
                        return Mock.Random.cname();
                    },
                    'tableName':function(){
                        return Mock.Random.word(3, 5);
                    },
                    'serialNumber':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'applicationType|1':['create', 'unpublish', 'publish', 'modify'],
                    'version':function(){
                        return Mock.Random.integer(1,10000);
                    },
                    'status|1':['revoke', 'approving', 'approved', 'rejected'],
                    'lastUpdateTime':function(){
                        return Mock.Random.integer(1,10000);
                    }
                }],
                'meta':{
                    'offset':parseInt(req.query.offset),
                    'limit':15,
                    'totalPage':'@INT(5,12)'
                }
            })
        );
    });

    app.use('/api/dm/v1/assets/:userId', DataAssertRouter);
    app.use('/api/dm/v1/metaData/:userId', MetaMyDataRouter);
    app.use('/api/dm/v1/standard/:userId', DataStandardRouter);
};
