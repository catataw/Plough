"use strict";

/* jshint ignore:start */



/* jshint ignore:end */

define('pmo-web/app', ['exports', 'ember', 'pmo-web/resolver', 'ember-load-initializers', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebResolver, _emberLoadInitializers, _pmoWebConfigEnvironment) {

  var App = undefined;

  _ember['default'].MODEL_FACTORY_INJECTIONS = true;

  App = _ember['default'].Application.extend({
    modulePrefix: _pmoWebConfigEnvironment['default'].modulePrefix,
    podModulePrefix: _pmoWebConfigEnvironment['default'].podModulePrefix,
    Resolver: _pmoWebResolver['default']
  });

  (0, _emberLoadInitializers['default'])(App, _pmoWebConfigEnvironment['default'].modulePrefix);

  exports['default'] = App;
});
define('pmo-web/authenticators/pmo-auth', ['exports', 'ember', 'pmo-web/utils/cookie-helpers', 'ember-simple-auth/authenticators/base'], function (exports, _ember, _pmoWebUtilsCookieHelpers, _emberSimpleAuthAuthenticatorsBase) {
  exports['default'] = _emberSimpleAuthAuthenticatorsBase['default'].extend({
    cookieName: 'user',
    restore: function restore(data) {
      return new _ember['default'].RSVP.Promise(function (resolve, reject) {
        if (!_ember['default'].isEmpty(data.token)) {
          resolve(data);
        } else {
          reject();
        }
      });
    },
    authenticate: function authenticate(options) {
      var _this = this;

      return new _ember['default'].RSVP.Promise(function (resolve, reject) {
        _ember['default'].$.ajax({
          url: _this.tokenEndpoint,
          type: 'POST',
          data: JSON.stringify({
            username: options.email,
            password: options.password
          }),
          contentType: 'application/json;charset=utf-8',
          dataType: 'json'
        }).then(function (response) {
          _ember['default'].run(function () {
            resolve({
              token: response.id_token
            });
          });
        }, function (xhr, status, error) {
          var response = xhr.responseText;
          _ember['default'].run(function () {
            reject(response);
          });
        });
      });
    },
    invalidate: function invalidate() {
      console.log('invalidate...');
      return _ember['default'].RSVP.resolve();
    }
  });
});
/**
 *Created by wuhui on 2017/6/9.
 *
 */
define('pmo-web/authorizers/pmo-auth-bearer', ['exports', 'ember-simple-auth/authorizers/base', 'ember', 'pmo-web/config/environment', 'pmo-web/utils/sha1-helpers'], function (exports, _emberSimpleAuthAuthorizersBase, _ember, _pmoWebConfigEnvironment, _pmoWebUtilsSha1Helpers) {
  exports['default'] = _emberSimpleAuthAuthorizersBase['default'].extend({
    authorize: function authorize(data, block) {
      var accessKeyId = data['accessKeyId'];
      var body = block.requestBody;
      var time = new Date().getTime();
      var URL = body.url;
      /*if (URL.indexOf(ENV.API.Host) != -1) {
        URL = URL.split(ENV.API.Host)[1];
      }*/
      URL = URL.substring(URL.indexOf("/bdoc/v1"));
      if (URL.indexOf('?') != -1) {
        URL = URL.split('?')[0];
      }
      if (body.contentType.indexOf('x-www-form-urlencoded') != -1) {
        body.contentType = "application/json;charset=utf-8";
      }
      var Type;
      if (_ember['default'].isNone(body['type'])) {
        //判断method这种特殊的写法
        Type = body.method;
      } else {
        Type = body.type;
      }
      var stringToSign = [Type.toLowerCase(), '', body.contentType.toLowerCase(), time, URL].join('\n');
      //  console.info(stringToSign);
      var key = data['secretAccessKey'];
      var Signature = (0, _pmoWebUtilsSha1Helpers.encrypt)(key, stringToSign);
      if (!_ember['default'].isEmpty(accessKeyId)) {
        block.setHeader([{ 'Authorization': ['BDOC', ' ', '' + accessKeyId, ':', '' + Signature].join('') }, { 'BDOC-Date': time }, { 'Content-Type': body.contentType.toLowerCase() }]);
      }
    }
  });
});
/**
 * Created by Administrator on 2015/11/12.
 * 用于设置验证的header头格式
 */
define('pmo-web/components/apply-machine', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Component.extend({

    'Title': '公司机器分布',
    _chartId: '',
    Datas: '',
    '_Datas': '',
    types: _ember['default'].computed('_Datas', {
      get: function get() {
        var array = this.get('_Datas');
        var types = [];
        if (_ember['default'].isArray(array) && !_ember['default'].isBlank(array)) {
          array.forEach(function (val, i) {
            types.push(val.name);
          });
        }
        return types;
      }
    }),
    reset: function reset() {
      var _id = this.get('_chartId');
      var myChart = echarts.init(document.getElementById(_id));
      var __datas = this.get('_Datas');
      var __types = this.get('types');
      var option = {
        title: {
          text: '机器分类',
          subtext: '分类占比',
          x: 'right'
        },
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          orient: 'vertical',
          // left: 'left',
          x: 'left',
          data: __types
        },
        series: [{
          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: __datas,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };

      myChart.setOption(option);
    },
    didInsertElement: function didInsertElement() {
      var _this = this;

      (0, _pmoWebUtilsHttpHelpers.request)({
        name: 'computer.type.count',
        type: 'get',
        data: {}
      }).then(function (data) {
        _this.set('_Datas', data);
        _this.reset();
      });
    },
    init: function init() {
      this._super.apply(this, arguments);
      this.set('_chartId', 81);
    }
  });
});
define('pmo-web/components/basic-dropdown', ['exports', 'ember-basic-dropdown/components/basic-dropdown'], function (exports, _emberBasicDropdownComponentsBasicDropdown) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberBasicDropdownComponentsBasicDropdown['default'];
    }
  });
});
define('pmo-web/components/basic-dropdown/content-element', ['exports', 'ember-basic-dropdown/components/basic-dropdown/content-element'], function (exports, _emberBasicDropdownComponentsBasicDropdownContentElement) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberBasicDropdownComponentsBasicDropdownContentElement['default'];
    }
  });
});
define('pmo-web/components/basic-dropdown/content', ['exports', 'ember-basic-dropdown/components/basic-dropdown/content'], function (exports, _emberBasicDropdownComponentsBasicDropdownContent) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberBasicDropdownComponentsBasicDropdownContent['default'];
    }
  });
});
define('pmo-web/components/basic-dropdown/trigger', ['exports', 'ember-basic-dropdown/components/basic-dropdown/trigger'], function (exports, _emberBasicDropdownComponentsBasicDropdownTrigger) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberBasicDropdownComponentsBasicDropdownTrigger['default'];
    }
  });
});
define('pmo-web/components/bs-datetimepicker', ['exports', 'ember-cli-bootstrap-datetimepicker/components/bs-datetimepicker', 'pmo-web/config/environment'], function (exports, _emberCliBootstrapDatetimepickerComponentsBsDatetimepicker, _pmoWebConfigEnvironment) {
  exports['default'] = _emberCliBootstrapDatetimepickerComponentsBsDatetimepicker['default'].extend({
    config: _pmoWebConfigEnvironment['default']['ember-cli-bootstrap-datetimepicker']
  });
});
define('pmo-web/components/button-status', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    statusValue: '',
    value: '',

    isHealthy: _ember['default'].computed('statusValue', {
      get: function get() {
        return this.get('statusValue') === 1;
      }
    }),
    isUnhealthy: _ember['default'].computed('statusValue', {
      get: function get() {
        return this.get('statusValue') === 3;
      }
    }),
    isWarning: _ember['default'].computed('statusValue', {
      get: function get() {
        return this.get('statusValue') === 2;
      }
    })

  });
});
define('pmo-web/components/complain-level', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({

    type: "1",

    isUsual: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') === '1';
      }
    }),
    isSerious: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') === '2';
      }
    }),
    isImportant: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') === '3';
      }
    })
  });
});
define('pmo-web/components/complain-status', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({

    type: "1",

    isGet: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') === '1';
      }
    }),
    isDeal: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') === '2';
      }
    }),
    isFeedback: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') === '3';
      }
    }),
    isClose: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') === '4';
      }
    })
  });
});
define('pmo-web/components/computer-type', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({

    type: "1",

    isLong: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') === '1';
      }
    }),
    isShort: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') === '2';
      }
    })
  });
});
define('pmo-web/components/date-picker', ['exports', 'ember', 'ember-cli-datepicker/components/date-picker'], function (exports, _ember, _emberCliDatepickerComponentsDatePicker) {
  exports['default'] = _emberCliDatepickerComponentsDatePicker['default'];
});
define('pmo-web/components/department-used-machine', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Component.extend({

    'Title': '公司机器分布',
    _chartId: '',
    Datas: '',
    '_Datas': '',

    reset: function reset() {
      var _id = this.get('_chartId');
      var myChart = echarts.init(document.getElementById(_id));
      var __title = this.get('Title');
      var _datas = this.get('_Datas');
      var option = {
        title: {
          text: '公司机器分布',
          subtext: '部门分配',
          x: 'right'
        },
        tooltip: {
          trigger: 'item',
          formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        legend: {
          orient: 'vertical',
          // left: 'left',
          x: 'left',
          data: ['大数据', '云计算', 'IT支撑', '运支']
        },
        series: [{

          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: [{ value: 105, name: '大数据' }, { value: 122, name: '云计算' }, { value: 64, name: 'IT支撑' }, { value: 29, name: '运支' }],
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }]
      };

      myChart.setOption(option);
    },
    didInsertElement: function didInsertElement() {
      var data = [{
        "name": "usage",
        "value": 20,
        "type": "space"
      }, {
        "name": "left",
        "value": 30,
        "type": "space"
      }];

      this.set('_Datas', data);
      this.reset();
    },
    init: function init() {
      this._super.apply(this, arguments);
      this.set('_chartId', 80);
    }
  });
});
define('pmo-web/components/ember-select-dropdown', ['exports', 'ember-select-guru/components/ember-select-dropdown'], function (exports, _emberSelectGuruComponentsEmberSelectDropdown) {
  exports['default'] = _emberSelectGuruComponentsEmberSelectDropdown['default'];
});
define('pmo-web/components/ember-select-guru', ['exports', 'ember-select-guru/components/ember-select-guru'], function (exports, _emberSelectGuruComponentsEmberSelectGuru) {
  exports['default'] = _emberSelectGuruComponentsEmberSelectGuru['default'];
});
define('pmo-web/components/ember-selectize', ['exports', 'ember-cli-selectize/components/ember-selectize'], function (exports, _emberCliSelectizeComponentsEmberSelectize) {
  exports['default'] = _emberCliSelectizeComponentsEmberSelectize['default'];
});
define('pmo-web/components/ember-wormhole', ['exports', 'ember-wormhole/components/ember-wormhole'], function (exports, _emberWormholeComponentsEmberWormhole) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberWormholeComponentsEmberWormhole['default'];
    }
  });
});
define('pmo-web/components/file-field', ['exports', 'ember-uploader/components/file-field'], function (exports, _emberUploaderComponentsFileField) {
  exports['default'] = _emberUploaderComponentsFileField['default'];
});
define('pmo-web/components/file-upload', ['exports', 'ember-uploader'], function (exports, _emberUploader) {
  exports['default'] = _emberUploader['default'].FileField.extend({

    urlPath: '',
    filesDidChange: function filesDidChange(files) {
      var self = this;
      var uploader = _emberUploader['default'].Uploader.create({
        multiple: true,
        url: this.get('url')
      });
      uploader.on('didUpload', function (response) {
        // S3 will return XML with url
        //let uploadedUrl = $(response).find('Location')[0].textContent;
        // http://yourbucket.s3.amazonaws.com/file.png
        var resp = JSON.parse(response);
        console.log(resp);
        if (resp.status == 1) {
          alert('文件上传成功');
          self.set('urlPath', resp.path);
        }

        //alert(uploadedUrl);
        // uploadedUrl = decodeURIComponent(uploadedUrl);
      });

      if (!Ember.isEmpty(files)) {
        // this second argument is optional and can to be sent as extra data with the upload
        uploader.upload(files[0], {});
      }
    }

  });
});
define('pmo-web/components/file-uploader', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    didInsertElement: function didInsertElement() {
      $("#file").pekeUpload({
        url: '?m=Complain&a=addComplainEvidence',
        bootstrap: true,
        onSubmit: true,
        showErrorAlerts: true
      });
    }

  });
});
define('pmo-web/components/jobtime-bar', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({

    jobTime: '',

    process: _ember['default'].computed('jobTime', {
      get: function get() {
        if (Number(this.get('jobTime')) >= 8) {
          return '100%';
        } else {
          return (this.get('jobTime') / 8).toFixed(2) * 100 + '%';
        }
      }
    }),

    isHealthy: _ember['default'].computed('jobTime', {
      get: function get() {
        return this.get('jobTime') >= 8;
      }
    }),
    isWarning: _ember['default'].computed('jobTime', {
      get: function get() {
        return this.get('jobTime') >= 4 && this.get('jobTime') < 8;
      }
    }),
    isUnhealthy: _ember['default'].computed('jobTime', {
      get: function get() {
        return this.get('jobTime') < 4;
      }
    })

  });
});
define('pmo-web/components/keyboard-select-picker', ['exports', 'ember', 'pmo-web/components/select-picker', 'ember-cli-select-picker/mixins/item-cursor'], function (exports, _ember, _pmoWebComponentsSelectPicker, _emberCliSelectPickerMixinsItemCursor) {

  var KEY_ENTER = 13;
  var KEY_ESC = 27;
  var KEY_UP = 38;
  var KEY_DOWN = 40;

  exports['default'] = _pmoWebComponentsSelectPicker['default'].extend(_emberCliSelectPickerMixinsItemCursor['default'], {
    layoutName: 'components/select-picker',
    classNames: ['select-picker', 'keyboard-select-picker'],

    didInsertElement: function didInsertElement() {
      this.$().on('keydown.' + this.get('elementId'), _ember['default'].run.bind(this, 'handleKeyPress'));
    },

    willDestroyElement: function willDestroyElement() {
      this.$().off('keydown.' + this.get('elementId'));
    },

    focusActiveItem: function focusActiveItem() {
      this.$('[data-itemid=' + this.get('activeItem.itemId') + ']').focus();
    },

    handleKeyPress: function handleKeyPress(e) {
      var _this = this;

      var actionName = (function () {
        switch (e.which) {
          case KEY_DOWN:
            return 'activeNext';
          case KEY_UP:
            return 'activePrev';
          case KEY_ESC:
            return 'closeDropdown';
          case KEY_ENTER:
            return _this.get('showDropdown') ? 'selectActiveItem' : 'openDropdown';
          default:
            return null;
        }
      })();

      if (actionName) {
        e.preventDefault();
        _ember['default'].run(function () {
          _this.send(actionName);
        });
        this.focusActiveItem();
        return false;
      }

      return true;
    }
  });
});
define('pmo-web/components/list-picker', ['exports', 'ember', 'ember-cli-select-picker/mixins/select-picker'], function (exports, _ember, _emberCliSelectPickerMixinsSelectPicker) {

  var I18nProps = _ember['default'].I18n && _ember['default'].I18n.TranslateableProperties || {};

  exports['default'] = _ember['default'].Component.extend(_emberCliSelectPickerMixinsSelectPicker['default'], I18nProps, {
    classNames: ['select-picker', 'list-picker'],
    selectAllLabel: 'Select All',
    selectNoneLabel: 'Select None',
    nativeMobile: false
  });
});
define('pmo-web/components/multi-value-component', ['exports', 'ember-select-guru/components/multi-value-component'], function (exports, _emberSelectGuruComponentsMultiValueComponent) {
  exports['default'] = _emberSelectGuruComponentsMultiValueComponent['default'];
});
define('pmo-web/components/one-employee-attendance', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Component.extend({
    employeeId: null,
    writeTime: null,
    employeeName: null,
    attendance: [],
    weeks: [],
    attendance: [],
    errorInfo: '',

    didInsertElement: function didInsertElement() {
      this.loadStep();
    },
    workDayCount: _ember['default'].computed('attendance', {
      get: function get() {
        var attendance = this.get('attendance');
        var workDayCount = 0;
        attendance.forEach(function (item) {
          if (item['week'] != '星期六' && item['week'] != '星期日') {
            workDayCount++;
          }
        });
        return workDayCount;
      }
    }),

    averageWorkTime: _ember['default'].computed('attendance', 'realWorkDayCount', {
      get: function get() {
        var attendance = this.get('attendance');
        var realWorkDayCount = this.get('realWorkDayCount');
        var workTime = 0;
        attendance.forEach(function (item) {
          workTime += item['workTime'];
        });
        if (realWorkDayCount == 0) {
          return 0;
        } else {
          return Number(workTime / Number(realWorkDayCount)).toFixed(1);
        }
      }
    }),

    realWorkDayCount: _ember['default'].computed('attendance', {
      get: function get() {
        var attendance = this.get('attendance');
        var workDayCount = 0;
        attendance.forEach(function (item) {
          if (item['workTime'] > 5) {
            workDayCount++;
          }
        });
        return workDayCount;
      }
    }),

    attendanceRate: _ember['default'].computed('realWorkDayCount', 'workDayCount', {
      get: function get() {
        var realWorkDayCount = this.get('realWorkDayCount');
        var workDayCount = this.get('workDayCount');
        return Number(Number(realWorkDayCount) / Number(workDayCount)).toFixed(2) * 100 + '%';
      }
    }),

    month: _ember['default'].computed('writeTime', {
      get: function get() {
        var writeTime = this.get('writeTime');
        var date = new Date(writeTime);
        var year = date.getFullYear();
        var month = date.getMonth() + 1;
        return year + '年' + month + '月';
      }
    }),

    writeTimeChange: _ember['default'].observer('month', function () {
      this.loadStep();
    }),

    loadStep: function loadStep() {
      var self = this;
      this.set('editDate', []);
      this.set('errorInfo', '');
      this.getAttendTime();
    },
    //显示当月报工日期
    getAttendTime: function getAttendTime() {
      var self = this;
      var data = {};
      var writeTime = this.get('writeTime');
      data['writeTime'] = writeTime;
      data['employeeId'] = this.get('employeeId');
      console.log(data);
      (0, _pmoWebUtilsHttpHelpers.request)({
        name: 'get.attendance.api',
        type: 'post',
        data: data
      }).then(function (data) {
        self.set('attendance', data);
        var workArr = data;
        var weeks = [];
        var tmpWeek = [];
        var i = 0;
        var j = 0;
        workArr.forEach(function (item) {
          //处理本月第一周
          if (item.week == '星期一' && i > 0) {
            if (weeks.length == 0) {
              if (tmpWeek.length < 7 && tmpWeek.length != 0) {
                var tmLen = 7 - tmpWeek.length;
                for (var k = 0; k < tmLen; k++) {
                  var tmp = {};
                  tmpWeek.unshiftObject(tmp);
                }
              }
            }
            if (tmpWeek.length > 0) {
              weeks[j] = tmpWeek;
            }
            tmpWeek = [];
            j++;
          }
          tmpWeek.pushObject(item);
          i++;
        });
        if (tmpWeek) {
          if (tmpWeek.length < 7) {
            var tmLenL = 7 - tmpWeek.length;
            for (var k = 0; k < tmLenL; k++) {
              var tmp = {};
              tmpWeek.pushObject(tmp);
            }
          }
          if (tmpWeek.length > 0) {
            weeks[j] = tmpWeek;
          }
        }
        self.set('weeks', weeks);
      });
    },
    init: function init() {
      this._super.apply(this, arguments);
    }

  });
});
define('pmo-web/components/option-component', ['exports', 'ember-select-guru/components/option-component'], function (exports, _emberSelectGuruComponentsOptionComponent) {
  exports['default'] = _emberSelectGuruComponentsOptionComponent['default'];
});
define('pmo-web/components/person-monthtime-bar', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Component.extend({

    workInfo: {},
    writeTime: '',
    workTimeProcss: 0,
    process: _ember['default'].computed('workTimeProcss', {
      get: function get() {
        var workTimeProcss = this.get('workTimeProcss');
        return workTimeProcss + '%';
      }
    }),
    isHealthy: _ember['default'].computed('workTimeProcss', {
      get: function get() {
        return this.get('workTimeProcss') >= 100;
      }
    }),
    isWarning: _ember['default'].computed('workTimeProcss', {
      get: function get() {
        return this.get('workTimeProcss') >= 50 && this.get('workTimeProcss') < 100;
      }
    }),
    isUnhealthy: _ember['default'].computed('workTimeProcss', {
      get: function get() {
        return this.get('workTimeProcss') < 50;
      }
    }),

    writeTimeChange: _ember['default'].observer('writeTime', function () {
      this.reset();
    }),

    didInsertElement: function didInsertElement() {
      this.reset();
    },
    reset: function reset() {
      var _this = this;

      var workInfo = this.get('workInfo');
      workInfo['writeTime'] = this.get('writeTime');
      (0, _pmoWebUtilsHttpHelpers.request)({
        name: 'get.people.process',
        type: 'post',
        data: workInfo
      }).then(function (data) {
        _this.set('workTimeProcss', data);
      });
    }

  });
});
define('pmo-web/components/pmo-modal', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    modalId: 'default',
    errorInfo: '',

    actions: {
      sureAct: function sureAct() {
        //确定时触发的事件
        this.sendAction('hEvent');
      }
    }
  });
});
/**
 * 包装的modal窗口
 */
define('pmo-web/components/power-select-multiple', ['exports', 'ember-power-select/components/power-select-multiple'], function (exports, _emberPowerSelectComponentsPowerSelectMultiple) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectMultiple['default'];
    }
  });
});
define('pmo-web/components/power-select-multiple/trigger', ['exports', 'ember-power-select/components/power-select-multiple/trigger'], function (exports, _emberPowerSelectComponentsPowerSelectMultipleTrigger) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectMultipleTrigger['default'];
    }
  });
});
define('pmo-web/components/power-select', ['exports', 'ember-power-select/components/power-select'], function (exports, _emberPowerSelectComponentsPowerSelect) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelect['default'];
    }
  });
});
define('pmo-web/components/power-select/before-options', ['exports', 'ember-power-select/components/power-select/before-options'], function (exports, _emberPowerSelectComponentsPowerSelectBeforeOptions) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectBeforeOptions['default'];
    }
  });
});
define('pmo-web/components/power-select/options', ['exports', 'ember-power-select/components/power-select/options'], function (exports, _emberPowerSelectComponentsPowerSelectOptions) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectOptions['default'];
    }
  });
});
define('pmo-web/components/power-select/placeholder', ['exports', 'ember-power-select/components/power-select/placeholder'], function (exports, _emberPowerSelectComponentsPowerSelectPlaceholder) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectPlaceholder['default'];
    }
  });
});
define('pmo-web/components/power-select/power-select-group', ['exports', 'ember-power-select/components/power-select/power-select-group'], function (exports, _emberPowerSelectComponentsPowerSelectPowerSelectGroup) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectPowerSelectGroup['default'];
    }
  });
});
define('pmo-web/components/power-select/search-message', ['exports', 'ember-power-select/components/power-select/search-message'], function (exports, _emberPowerSelectComponentsPowerSelectSearchMessage) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectSearchMessage['default'];
    }
  });
});
define('pmo-web/components/power-select/trigger', ['exports', 'ember-power-select/components/power-select/trigger'], function (exports, _emberPowerSelectComponentsPowerSelectTrigger) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectComponentsPowerSelectTrigger['default'];
    }
  });
});
define('pmo-web/components/select-picker', ['exports', 'ember', 'ember-cli-select-picker/mixins/select-picker'], function (exports, _ember, _emberCliSelectPickerMixinsSelectPicker) {

  var I18nProps = _ember['default'].I18n && _ember['default'].I18n.TranslateableProperties || {};

  exports['default'] = _ember['default'].Component.extend(_emberCliSelectPickerMixinsSelectPicker['default'], I18nProps, {

    nothingSelectedMessage: 'Nothing Selected',
    multipleSelectedMessage: '%@ items selected',
    selectAllLabel: 'All',
    selectNoneLabel: 'None',

    nativeMobile: true,

    classNames: ['select-picker', 'btn-group'],
    buttonClass: 'btn-default',

    badgeEnabled: _ember['default'].computed.and('showBadge', 'multiple'),

    selectionBadge: _ember['default'].computed('selection.length', 'badgeEnabled', function () {
      var enabled = this.get('badgeEnabled');
      var selected = this.get('selection.length');
      return enabled && selected && selected !== 0 ? selected : '';
    }),

    setupDom: _ember['default'].on('didInsertElement', function () {
      var id = this.get('elementId');
      _ember['default'].run.scheduleOnce('afterRender', this, this.updateDropUp);
      $(document).on('click.' + id, _ember['default'].run.bind(this, this.hideDropdownMenu)).on('touchstart.' + id, _ember['default'].run.bind(this, this.hideDropdownMenu)).on('scroll.' + id, _ember['default'].run.bind(this, this.updateDropUp)).on('resize.' + id, _ember['default'].run.bind(this, this.updateDropUp));
    }),

    hideDropdownMenu: function hideDropdownMenu(evt) {
      if (this.get('keepDropdownOpen')) {
        this.set('keepDropdownOpen', false);
        return;
      }
      if (this.element && !$.contains(this.element, evt.target)) {
        this.send('closeDropdown');
      }
    },

    updateDropUp: function updateDropUp() {
      var windowHeight = $(window).height();
      var scrollTop = $(window).scrollTop();
      var buttonOffset = this.$().offset().top;
      var buttonHeight = this.$().height();
      var menuHeight = this.$('.dropdown-menu').height();
      var viewportOffset = buttonOffset - scrollTop;
      var menuBottom = viewportOffset + buttonHeight + menuHeight;
      this.set('isDropUp', menuBottom > windowHeight);
    },

    teardownDom: _ember['default'].on('willDestroyElement', function () {
      $(document).off('.' + this.get('elementId'));
    }),

    actions: {
      showHide: function showHide() {
        this.toggleProperty('showDropdown');
      },

      openDropdown: function openDropdown() {
        this.set('showDropdown', true);
      },

      closeDropdown: function closeDropdown() {
        this.set('showDropdown', false);
      }
    }
  });
});
define('pmo-web/components/team-used-machine', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Component.extend({

    'Title': '部门机器分布',
    _chartId: '',
    Datas: '',
    '_Datas': '',
    team: _ember['default'].computed('_Datas', {
      get: function get() {
        var array = this.get('_Datas');
        var team = [];
        var j = 0;
        if (_ember['default'].isArray(array) && !_ember['default'].isBlank(array)) {
          array.forEach(function (val, i) {
            j++;
            if (j % 2 > 0) {

              team.push('\n' + val.name);
            } else {
              team.push(val.name);
            }
          });
        }
        return team;
      }
    }),
    data: _ember['default'].computed('_Datas', {
      get: function get() {
        var array = this.get('_Datas');
        var data = [];
        if (_ember['default'].isArray(array) && !_ember['default'].isBlank(array)) {
          array.forEach(function (val, i) {
            data.push(val.value);
          });
        }
        return data;
      }
    }),

    reset: function reset() {
      var _id = this.get('_chartId');
      var myChart = echarts.init(document.getElementById(_id));
      var __title = this.get('Title');
      var _datas = this.get('data');
      var __team = this.get('team');

      var option = {
        title: {
          text: '小组机器占用',
          subtext: '占用概况',
          x: 'left'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          orient: 'vertical',
          data: ['机器数量']
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            magicType: { show: true, type: ['line', 'bar'] },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },

        calculable: true,
        xAxis: [{
          'type': 'category',
          'axisLabel': { 'interval': 0 },
          data: __team
        }],
        yAxis: [{
          type: 'value'
        }],
        series: [{
          name: '机器台数',
          type: 'bar',
          data: _datas,
          itemStyle: { normal: { label: { show: true, position: 'inside' } } },
          /*markPoint : {
            data : [
              {name : '年最高', value : 182.2, xAxis: 7, yAxis: 183, symbolSize:18},
              {name : '年最低', value : 2.3, xAxis: 11, yAxis: 3}
            ]
          },*/
          markLine: {
            data: [{ type: 'average', name: '平均值' }]
          }
        }]
      };

      myChart.setOption(option);
    },
    didInsertElement: function didInsertElement() {
      var _this = this;

      (0, _pmoWebUtilsHttpHelpers.request)({
        name: 'person.computer.count',
        type: 'get',
        data: {}
      }).then(function (data) {
        _this.set('_Datas', data);
        _this.reset();
      });
    },
    init: function init() {
      this._super.apply(this, arguments);
      this.set('_chartId', 82);
    }
  });
});
define('pmo-web/components/user-type', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({

    statusValue: '',

    isOrigin: _ember['default'].computed('statusValue', {
      get: function get() {
        return this.get('statusValue') == 1;
      }
    }),
    isAdmin: _ember['default'].computed('statusValue', {
      get: function get() {
        return this.get('statusValue') == 3;
      }
    }),
    isSuper: _ember['default'].computed('statusValue', {
      get: function get() {
        return this.get('statusValue') == 2;
      }
    }),
    isTeamLeader: _ember['default'].computed('statusValue', {
      get: function get() {
        return this.get('statusValue') == 4;
      }
    })

  });
});
define('pmo-web/components/work-type', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Component.extend({
    type: '',

    isA: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 1;
      }
    }),
    isB: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 2;
      }
    }),
    isC: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 3;
      }
    }),
    isD: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 4;
      }
    }),
    isE: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 5;
      }
    }),
    isF: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 6;
      }
    }),
    isG: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 7;
      }
    }),
    isH: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 8;
      }
    }),
    isI: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 9;
      }
    }),
    isJ: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 10;
      }
    }),
    isK: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 11;
      }
    }),
    isL: _ember['default'].computed('type', {
      get: function get() {
        return this.get('type') == 12;
      }
    })
  });
});
define('pmo-web/components/x-option', ['exports', 'emberx-select/components/x-option'], function (exports, _emberxSelectComponentsXOption) {
  exports['default'] = _emberxSelectComponentsXOption['default'];
});
define('pmo-web/components/x-select', ['exports', 'emberx-select/components/x-select'], function (exports, _emberxSelectComponentsXSelect) {
  exports['default'] = _emberxSelectComponentsXSelect['default'];
});
define('pmo-web/controllers/application', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Controller.extend({
    session: _ember['default'].inject.service('session'),
    userInfo: {},
    errorInfo: '',
    actions: {

      appEditUserForm: function appEditUserForm() {
        var tset = this.get('userInfo');
        _ember['default'].$('#appEditUserForm').modal('show');
      },

      appUserEdit: function appUserEdit() {
        var self = this;
        self.set('errorInfo', '');
        var data = this.get('userInfo');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'edit.user.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#appEditUserForm').modal('hide');
          } else {
            self.set('errorInfo', '编辑失败，编辑结果异常');
          }
        });
      }

    }
  });
});
define('pmo-web/controllers/complain', ['exports', 'ember', 'pmo-web/utils/http-helpers', 'pmo-web/utils/number_utils', 'pmo-web/utils/date', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebUtilsHttpHelpers, _pmoWebUtilsNumber_utils, _pmoWebUtilsDate, _pmoWebConfigEnvironment) {
  exports['default'] = _ember['default'].Controller.extend({
    session: _ember['default'].inject.service('session'),
    loadComplain: [],
    urlPath: '',
    searchItem: [],
    searchWordInput: '',
    editComplain: {},
    addComplain: {},
    deleteId: '',
    errorInfo: '',
    pageSizeSelect: [10, 50, 100],
    pageSizeValue: 10,
    currentPage: 0,

    loadComplainLength: 0,

    searchItemLength: _ember['default'].computed('searchItem', {
      get: function get() {
        return this.get('searchItem').length;
      }
    }),

    beginShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', {
      get: function get() {
        return this.get('currentPage') * this.get('pageSizeValue');
      }
    }),

    showDataLength: _ember['default'].computed('showData', {
      get: function get() {
        return this.get('showData').length;
      }
    }),
    endShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', 'loadComplainLength', {
      get: function get() {
        if ((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadComplainLength')) {
          return this.get('loadComplainLength');
        }
        return (this.get('currentPage') + 1) * this.get('pageSizeValue');
      }
    }),

    showData: _ember['default'].computed('endShowItem', 'beginShowItem', 'loadComplain', 'searchWordInput', 'searchItem', {
      get: function get() {
        if (this.get('searchWordInput') != '') {
          return this.get('searchItem').slice(this.get('beginShowItem'), this.get('endShowItem'));
        } else {
          return this.get('loadComplain').slice(this.get('beginShowItem'), this.get('endShowItem'));
        }
      }
    }),

    paginationLeftClass: _ember['default'].computed('currentPage', {
      get: function get() {
        if (this.get("currentPage") > 0) {
          return "paginate_previous";
        }
        return "paginate_disabled_previous";
      }
    }),

    actions: {
      downloadUrlPath: function downloadUrlPath(urlPath) {
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.urlPath.api',
          type: 'post',
          data: { 'urlPath': urlPath }
        }).then(function (data) {
          alert("ffff");
        });
      },

      loadStep: function loadStep() {
        this.send('loadComplain');

        //var data = [{"id":"1","projectId":"dddd","projectName":"ddd","complainant":"ddd","complaintLevel":"2","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"dd","urlPath":"string(31) \".\/Public\/upload\/1502875994.xlsx\"\n"},{"id":"2","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddgg","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"3","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggd","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"4","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdf","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"5","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdff","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"6","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdfff","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"7","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdfffd","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"8","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdfffda","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"9","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdfffdag","urlPath":".\/Public\/upload\/1502876104.xls"},{"id":"10","projectId":"dddddd","projectName":"ddddd","complainant":"ddd","complaintLevel":"1","complaintWay":"dd","respondent":"dd","status":"1","complainTime":"2017-08-16 00:00:00","complaintCompany":"ddd","complaintContent":"ddggdfffdags","urlPath":".\/Public\/upload\/1502876104.xls"}];

        //  var data = [{"ip":"10.254.9.78","mIp":"10.255.9.78","cpu":"32","memory":"256","disk":"4*3T\/2*900G","area":"2015\u5e74IDC\u6269\u5bb9\u5de5\u7a0b"},{"ip":"10.254.9.63","mIp":"10.255.9.63","cpu":"32","memory":"256","disk":"4*3T\/2*900G","area":"2015\u5e74IDC\u6269\u5bb9\u5de5\u7a0b"}];
        // this.set('loadComplainLength',data.length);
        // this.set('loadComplain',data);
      },
      loadComplain: function loadComplain() {
        var _this = this;

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.allComplain.api',
          type: 'get',
          data: {}
        }).then(function (data) {
          console.log(data);
          _this.set('loadComplain', data);
          _this.set('loadComplainLength', data.length);
        });
      },

      showAddComplainForm: function showAddComplainForm() {
        _ember['default'].$('#addComplainForm').modal('show');
      },
      doAddComplainForm: function doAddComplainForm() {
        var addComplain = this.get('addComplain');
        addComplain.urlPath = this.get('urlPath');
        console.log(addComplain);
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'add.complain.api',
          type: 'post',
          data: addComplain
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#addComplainForm').modal('hide');
          } else {
            self.set('errorInfo', '分配异常，分配机器失败！');
          }
        });
      },

      refreshPageSize: function refreshPageSize() {
        this.set('pageSizeValue', $('#list-status').val());
      },
      pageDown: function pageDown() {
        if (this.get('currentPage') > 0) {
          var page = this.get('currentPage') - 1;
          this.set('currentPage', page);
        }
      },

      searchedItemFromWord: function searchedItemFromWord() {
        var searchResult = [];
        var loadComplain = this.get('loadComplain');
        var searchWord = this.get('searchWordInput').toString().toLowerCase();
        this.set('currentPage', 0);
        loadComplain.forEach(function (complain) {
          if (complain['projectName'].toString().toLowerCase().indexOf(searchWord) >= 0 || complain['complainant'].toString().toLowerCase().indexOf(searchWord) >= 0 || complain['complaintWay'].toString().toLowerCase().indexOf(searchWord) >= 0 || complain['respondent'].toString().toLowerCase().indexOf(searchWord) >= 0 || complain['status'].toString().toLowerCase().indexOf(searchWord) >= 0 || complain['complaintLevel'].toString().toLowerCase().indexOf(searchWord) >= 0 || complain['complaintCompany'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            searchResult.pushObject(complain);
          }
        });
        this.set('searchItem', searchResult);
      },

      pageUp: function pageUp() {
        var page = this.get('currentPage') + 1;
        if (page * this.get('pageSizeValue') < this.get('loadComplainLength')) {
          this.set('currentPage', page);
        }
      },

      categoryChanged: function categoryChanged(value, event) {
        this.set('addComplain.status', value);
      },

      levelChanged: function levelChanged(value, event) {
        this.set('addComplain.complaintLevel', value);
      },

      showEditComplainForm: function showEditComplainForm(complain) {
        this.set('editComplain', complain);
        _ember['default'].$('#editComplainForm').modal('show');
      },
      doEditComplain: function doEditComplain() {
        var self = this;
        var editComplain = this.get('editComplain');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'edit.complain.api',
          type: 'post',
          data: editComplain
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#editComplainForm').modal('hide');
          } else {
            self.set('errorInfo', '投诉修改失败，服务器异常');
          }
        });
      },
      showFeleteComplainForm: function showFeleteComplainForm(deleteId) {
        this.set('deleteId', deleteId);
        _ember['default'].$('#deleteComplainForm').modal('show');
      },

      doComplainDelete: function doComplainDelete() {
        var self = this;
        self.set('errorInfo', '');
        var data = {};
        data['id'] = this.get('deleteId');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'delete.complain.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data == 1) {
            _ember['default'].$('#deleteComplainForm').modal('hide');
          } else {
            self.set('errorInfo', '删除失败，删除异常');
          }
        });
      }

    }

  });
});
define('pmo-web/controllers/dashboard', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({});
});
define('pmo-web/controllers/dashbord-machine', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Controller.extend({

    survey: {},

    currentTime: '',

    actions: {
      loadStep: function loadStep() {
        var self = this;
        var date = new Date();
        self.set('currentTime', date.getTime());
        this.send('loadSurvey');
        setInterval(function () {
          var date = new Date();
          self.set('currentTime', date.getTime());
        }, 1000);
      },

      downLoadExcl: function downLoadExcl() {},

      loadSurvey: function loadSurvey() {
        var self = this;
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'dashbord.computer.survey',
          type: 'get',
          data: {}
        }).then(function (data) {
          self.set('survey', data);
        });
      }

    }

  });
});
define('pmo-web/controllers/employee-apply', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({});
});
define('pmo-web/controllers/employee-dashboard', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Controller.extend({

    dsahboardTime: '',
    survey: {},

    currentTime: '',

    actions: {
      loadStep: function loadStep() {
        var self = this;
        var date = new Date();
        self.set('currentTime', date.getTime());
        this.send('loadSurvey');
        setInterval(function () {
          var date = new Date();
          self.set('currentTime', date.getTime());
        }, 1000);
      },

      addAttendance: function addAttendance() {
        _ember['default'].$('#addSomeAttendanceForm').modal('show');
      },

      loadSurvey: function loadSurvey() {
        var self = this;
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'dashbord.computer.survey',
          type: 'get',
          data: {}
        }).then(function (data) {
          self.set('survey', data);
        });
      }

    }

  });
});
define('pmo-web/controllers/employer-score', ['exports', 'ember', 'pmo-web/utils/http-helpers', 'pmo-web/utils/validator', 'pmo-web/utils/date', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebUtilsHttpHelpers, _pmoWebUtilsValidator, _pmoWebUtilsDate, _pmoWebConfigEnvironment) {
  exports['default'] = _ember['default'].Controller.extend({
    session: _ember['default'].inject.service('session'),
    i18n: _ember['default'].inject.service(),
    writeTime: '',

    weeks: [],
    attendance: [],
    editDate: [],
    errorInfo: '',

    employeeId: null,
    employeeName: null,

    writeTimeChange: _ember['default'].observer('writeTime', function () {
      this.send('getAttendTime');
    }),

    actions: {

      loadStep: function loadStep() {
        var self = this;
        this.set('editDate', []);
        this.set('errorInfo', '');
        var date = new Date();
        this.set('writeTime', _pmoWebUtilsDate.dateUtils.formatDate(date));
        this.send('getAttendTime');
      },
      //显示当月报工日期
      getAttendTime: function getAttendTime() {
        var self = this;
        var data = {};
        var writeTime = this.get('writeTime');
        data['writeTime'] = writeTime;
        data['employeeId'] = this.get('employeeId');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.attendance.api',
          type: 'post',
          data: data
        }).then(function (data) {
          self.set('attendance', data);
          var workArr = data;
          var weeks = [];
          var tmpWeek = [];
          var i = 0;
          var j = 0;
          workArr.forEach(function (item) {
            //处理本月第一周
            if (item.week == '星期一' && i > 0) {
              if (weeks.length == 0) {
                if (tmpWeek.length < 7 && tmpWeek.length != 0) {
                  var tmLen = 7 - tmpWeek.length;
                  for (var k = 0; k < tmLen; k++) {
                    var tmp = {};
                    tmpWeek.unshiftObject(tmp);
                  }
                }
              }
              if (tmpWeek.length > 0) {
                weeks[j] = tmpWeek;
              }
              tmpWeek = [];
              j++;
            }
            tmpWeek.pushObject(item);
            i++;
          });
          if (tmpWeek) {
            if (tmpWeek.length < 7) {
              console.log(tmpWeek);
              var tmLenL = 7 - tmpWeek.length;
              for (var k = 0; k < tmLenL; k++) {
                var tmp = {};
                tmpWeek.pushObject(tmp);
              }
            }
            if (tmpWeek.length > 0) {
              weeks[j] = tmpWeek;
            }
          }
          self.set('weeks', weeks);
        });
      }

    }

  });
});
define('pmo-web/controllers/employer', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({
    //返回每个月日期已经对应天数
    /*
     dayDates:Ember.computed('writeTime',{
     get(){
      var dayDates = [];
     //获取当前月有多少天
     var writeTime = this.get('writeTime');
     var date = new Date(writeTime);
     var year = date.getFullYear();
     var month = date.getMonth()+1;
     var dayCount =  new Date(year, month-1, 0).getDate();
     //获取第一天的星期
     var firtDate = new Date(year,month-1,1);
     var day = firtDate.getDay();
     //获取本月所有天的星期
     for(var i =1;i<dayCount;i++){
     var dayDate = {};
     var time= '';
     if(dayCount < 10){
     time = year +'-'+ month + '-0'+ i;
     }else{
     time = year +'-'+ month + '-'+ i;
     }
     dayDate['day'] = day;
     dayDate['time'] = time;
     dayDates.pushObject(dayDate);
     if(day<6){
     day ++;
     }else{
     day = 0;
     }
     }
     return dayDates;
     }
     }),
     */
  });
});
define('pmo-web/controllers/job-time-weekday', ['exports', 'ember', 'pmo-web/utils/http-helpers', 'pmo-web/utils/validator', 'pmo-web/utils/date', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebUtilsHttpHelpers, _pmoWebUtilsValidator, _pmoWebUtilsDate, _pmoWebConfigEnvironment) {
  exports['default'] = _ember['default'].Controller.extend({
    session: _ember['default'].inject.service('session'),
    i18n: _ember['default'].inject.service(),
    writeTime: '',
    weeks: [],
    editDate: [],
    //已经填报了的工时
    writeWorkTime: [],
    //  workDetail:'',
    userInfo: {},
    errorInfo: '',

    //个人已经参加的项目列表
    participateProject: [],
    //每次添加的单项工时
    addOneJobTime: {},
    addedWorkTime: 0,

    writeTimeChange: _ember['default'].observer('writeTime', function () {
      this.send('writeJobTime');
    }),

    workDay: _ember['default'].computed('editDate', {
      get: function get() {
        var editDate = this.get('editDate');
        return editDate.length;
      }
    }),

    addTitle: _ember['default'].computed('addOneJobTime', {
      get: function get() {
        var addOneJobTime = this.get('addOneJobTime');
        return addOneJobTime.projectName;
      }
    }),

    actions: {

      doAddOneJobTime: function doAddOneJobTime() {
        var addOneJobTime = this.get('addOneJobTime');
        var writeWorkTime = this.get('writeWorkTime');
        var workDay = this.get('workDay');
        var tmp = {};
        var workTime = 0;
        //验证添加工时是否合规
        if (!_pmoWebUtilsValidator.validator.isValidNaturaNumbers(addOneJobTime.workTime)) {
          self.set('errorInfo', self.get('i18n').t('job.add.time.format.error'));
          return;
        } else {
          if (addOneJobTime.workTime > workDay * 24) {
            self.set('errorInfo', self.get('i18n').t('job.add.time.format.error'));
            return;
            //数据格式合格
          } else if (addOneJobTime.workTime > 0) {
              //添加报工列表
              for (var key in addOneJobTime) {
                tmp[key] = addOneJobTime[key];
              }
              if (writeWorkTime) {
                writeWorkTime.forEach(function (item, index) {
                  if (item.projectName == tmp.projectName && item.workType == tmp.workType) {
                    delete writeWorkTime[index];
                  }
                });
              }
              writeWorkTime.unshiftObject(tmp);
              //更新报工列表工作时长
              writeWorkTime.forEach(function (item) {
                workTime = workTime + Number(item.workTime);
              });
              this.set('writeWorkTime', writeWorkTime);
              this.set('addedWorkTime', workTime);
            }
        }
      },

      chooseDestination: function chooseDestination(destinationProject) {
        this.set('addOneJobTime.projectName', destinationProject);
      },

      deleteWorkRec: function deleteWorkRec(deleteRe) {
        var writeWorkTime = this.get('writeWorkTime');
        var newWriteWorkTime = [];
        var workTime = 0;
        writeWorkTime.forEach(function (item) {
          if (deleteRe.projectName != item.projectName || deleteRe.workType != item.workType) {
            newWriteWorkTime.pushObject(item);
          }
        });
        newWriteWorkTime.forEach(function (item) {
          workTime = workTime + Number(item.workTime);
        });
        this.set('addedWorkTime', workTime);

        this.set('writeWorkTime', newWriteWorkTime);
      },
      setCurrentRe: function setCurrentRe(_setCurrentRe) {
        this.set('addOneJobTime', _setCurrentRe);
      },

      loadStep: function loadStep() {
        var self = this;

        this.set('addOneJobTime', {});
        this.set('writeWorkTime', []);
        this.set('weeks', []);
        this.set('participateProject', []);
        this.set('editDate', []);
        this.set('errorInfo', '');
        var date = new Date();
        this.set('writeTime', _pmoWebUtilsDate.dateUtils.formatDate(date));

        /*var data = [[{"date":"2017-08-1","workTime":8,"week":"\u661f\u671f\u4e8c","day":1},{"date":"2017-08-2","workTime":6,"week":"\u661f\u671f\u4e09","day":2},{"date":"2017-08-3","workTime":0,"week":"\u661f\u671f\u56db","day":3},{"date":"2017-08-4","workTime":0,"week":"\u661f\u671f\u4e94","day":4},{"date":"2017-08-5","workTime":0,"week":"\u661f\u671f\u516d","day":5},{"date":"2017-08-6","workTime":0,"week":"\u661f\u671f\u65e5","day":6},{"date":"2017-08-7","workTime":0,"week":"\u661f\u671f\u4e00","day":7},{"date":"2017-08-8","workTime":0,"week":"\u661f\u671f\u4e8c","day":8},{"date":"2017-08-9","workTime":0,"week":"\u661f\u671f\u4e09","day":9},{"date":"2017-08-10","workTime":0,"week":"\u661f\u671f\u56db","day":10},{"date":"2017-08-11","workTime":0,"week":"\u661f\u671f\u4e94","day":11},{"date":"2017-08-12","workTime":0,"week":"\u661f\u671f\u516d","day":12},{"date":"2017-08-13","workTime":0,"week":"\u661f\u671f\u65e5","day":13},{"date":"2017-08-14","workTime":0,"week":"\u661f\u671f\u4e00","day":14},{"date":"2017-08-15","workTime":0,"week":"\u661f\u671f\u4e8c","day":15}],[{"date":"2017-08-16","workTime":0,"week":"\u661f\u671f\u4e09","day":16},{"date":"2017-08-17","workTime":0,"week":"\u661f\u671f\u56db","day":17},{"date":"2017-08-18","workTime":0,"week":"\u661f\u671f\u4e94","day":18},{"date":"2017-08-19","workTime":0,"week":"\u661f\u671f\u516d","day":19},{"date":"2017-08-20","workTime":0,"week":"\u661f\u671f\u65e5","day":20},{"date":"2017-08-21","workTime":0,"week":"\u661f\u671f\u4e00","day":21},{"date":"2017-08-22","workTime":0,"week":"\u661f\u671f\u4e8c","day":22},{"date":"2017-08-23","workTime":0,"week":"\u661f\u671f\u4e09","day":23},{"date":"2017-08-24","workTime":0,"week":"\u661f\u671f\u56db","day":24},{"date":"2017-08-25","workTime":0,"week":"\u661f\u671f\u4e94","day":25},{"date":"2017-08-26","workTime":0,"week":"\u661f\u671f\u516d","day":26},{"date":"2017-08-27","workTime":0,"week":"\u661f\u671f\u65e5","day":27},{"date":"2017-08-28","workTime":0,"week":"\u661f\u671f\u4e00","day":28},{"date":"2017-08-29","workTime":0,"week":"\u661f\u671f\u4e8c","day":29},{"date":"2017-08-30","workTime":0,"week":"\u661f\u671f\u4e09","day":30},{"date":"2017-08-31","workTime":0,"week":"\u661f\u671f\u56db","day":31}]];
        var workArr = data[0].concat(data[1]);
        var weeks = [];
        var tmpWeek = [];
        var i = 0;
        var j =0;
        workArr.forEach(function (item) {
         if(item.week == '星期一'&&i>0 ){
           if(weeks.length ==0){
             if(tmpWeek.length<7){
               console.log(tmpWeek);
               var tmLen = 7 - tmpWeek.length;
               for(var k =0;k<tmLen;k++){
                 var tmp = {};
                 tmpWeek.unshiftObject(tmp);
                 console.log(tmpWeek.length);
               }
             }
           }
           weeks[j] = tmpWeek;
           tmpWeek = [];
           j++;
         }
         tmpWeek.pushObject(item);
         i++;
        })
        if(tmpWeek){
         weeks[j] = tmpWeek;
        }
        self.set('weeks',weeks);*/
        this.send('writeJobTime');
      },
      //显示当月报工日期
      writeJobTime: function writeJobTime() {
        var self = this;
        var data = {};
        var writeTime = this.get('writeTime');
        data['writeTime'] = writeTime;
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.workTimeList.api',
          type: 'post',
          data: data
        }).then(function (data) {
          var workArr = data[0].concat(data[1]);
          var weeks = [];
          var tmpWeek = [];
          var i = 0;
          var j = 0;
          workArr.forEach(function (item) {
            //处理本月第一周
            if (item.week == '星期一' && i > 0) {
              if (weeks.length == 0) {
                if (tmpWeek.length < 5 && tmpWeek.length != 0) {
                  var tmLen = 5 - tmpWeek.length;
                  for (var k = 0; k < tmLen; k++) {
                    var tmp = {};
                    tmpWeek.unshiftObject(tmp);
                  }
                }
              }
              if (tmpWeek.length > 0) {
                weeks[j] = tmpWeek;
              }
              tmpWeek = [];
              j++;
            }
            //添加每周的工作日
            if (item.week != '星期六' && item.week != '星期日') {
              tmpWeek.pushObject(item);
            }
            i++;
          });
          if (tmpWeek) {
            if (tmpWeek.length < 5) {
              console.log(tmpWeek);
              var tmLenL = 5 - tmpWeek.length;
              for (var k = 0; k < tmLenL; k++) {
                var tmp = {};
                tmpWeek.pushObject(tmp);
              }
            }
            if (tmpWeek.length > 0) {
              weeks[j] = tmpWeek;
            }
          }
          self.set('weeks', weeks);
        });
      },
      //显示报工表单
      writeTimeForm: function writeTimeForm(date) {
        var self = this;
        this.set('errorInfo', '');
        var data = {};
        var eDate = [];
        date.forEach(function (item) {
          if (item.date) {
            eDate.push(item.date);
          }
        });
        self.set('editDate', eDate);
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.person.projects',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            var participateProject = [];
            data.forEach(function (item) {
              participateProject.push(item.projectName);
            });

            self.set('participateProject', participateProject);
            var timeData = {};
            timeData['editTime'] = self.get('editDate');
            (0, _pmoWebUtilsHttpHelpers.request)({
              name: 'get.person.week.projects',
              type: 'post',
              data: timeData
            }).then(function (data) {
              var writeWorkTime = [];
              if (data) {
                data.forEach(function (item) {
                  if (Number(item.workTime) > 0) {
                    writeWorkTime.push(item);
                  }
                });
              }
              self.set('writeWorkTime', writeWorkTime);
              $('#addWorkTimeDiv').removeClass('hide');
              $('#divbg').removeClass('hide');
            });
          } else {
            self.set('errorInfo', '添加失败，添加机器异常！');
          }
        });
      },

      typeChanged: function typeChanged(value, workId, event) {
        this.set('addOneJobTime.workType', value);
      },
      //提交报工表单
      doWriteTimeForm: function doWriteTimeForm() {
        this.set('errorInfo', '');
        var self = this;
        var editDate = this.get('editDate');
        var data = {};
        data['workItem'] = this.get('writeWorkTime');
        data['workTime'] = this.get('editDate');
        data['userName'] = this.get('userInfo')['userName'];
        var workDay = Number(editDate.length);
        //验证格式
        var workTotalTime = 0;
        data['workItem'].forEach(function (item) {
          if (!_pmoWebUtilsValidator.validator.isValidNaturaNumbers(item.workTime)) {
            self.set('errorInfo', self.get('i18n').t('job.time.format.error'));
            return;
          } else {
            if (item.workTime > workDay * 24) {
              self.set('errorInfo', self.get('i18n').t('job.time.format.error'));
              return;
            } else if (item.workTime > 0) {
              workTotalTime = workTotalTime + Number(item.workTime);
            }
          }
        });
        if (workTotalTime > workDay * 24) {
          self.set('errorInfo', self.get('i18n').t('job.time.format.error'));
          return;
        }
        if (workTotalTime < workDay * 8) {
          self.set('errorInfo', self.get('i18n').t('job.week.time.format.error'));
          return;
        }

        //提交数据
        if (!self.get('errorInfo')) {
          (0, _pmoWebUtilsHttpHelpers.request)({
            name: 'get.replaceWeeklyJobTime.api',
            type: 'post',
            data: data
          }).then(function (data) {
            if (data) {
              $('#addWorkTimeDiv').addClass('hide');
              $('#divbg').addClass('hide');
              self.send('writeJobTime');
            }
          });
        }
      },
      closeWriteTimeForm: function closeWriteTimeForm() {
        $('#addWorkTimeDiv').addClass('hide');
        $('#divbg').addClass('hide');
      },
      showTextArea: function showTextArea() {
        $('#workDetailTextareaBg').removeClass('hide');
        $('#workDetailTextarea').removeClass('hide');
      },
      addWorkdetail: function addWorkdetail() {
        //var workDetail = this.get('workDetail');
        //this.set('addOneJobTime.workDetail',workDetail);
        $('#workDetailTextareaBg').addClass('hide');
        $('#workDetailTextarea').addClass('hide');
      },
      closeWorkDetailTextarea: function closeWorkDetailTextarea() {
        $('#workDetailTextareaBg').addClass('hide');
        $('#workDetailTextarea').addClass('hide');
      }

    }

  });
});
define('pmo-web/controllers/jobtime-write', ['exports', 'ember', 'pmo-web/utils/http-helpers', 'pmo-web/utils/validator', 'pmo-web/utils/date', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebUtilsHttpHelpers, _pmoWebUtilsValidator, _pmoWebUtilsDate, _pmoWebConfigEnvironment) {
  exports['default'] = _ember['default'].Controller.extend({
    session: _ember['default'].inject.service('session'),
    i18n: _ember['default'].inject.service(),
    writeTime: '',
    loadWorkRecord0: [],
    loadWorkRecord1: [],
    editDate: "",
    userInfo: {},
    //已经填报了的工时
    writeWorkTime: [],
    // workDetail:'',

    errorInfo: '',

    //个人已经参加的项目列表
    participateProject: [],
    //每次添加的单项工时
    addOneJobTime: {},
    writeTimeChange: _ember['default'].observer('writeTime', function () {
      this.send('writeJobTime');
    }),

    actions: {
      doAddOneJobTime: function doAddOneJobTime() {
        var addOneJobTime = this.get('addOneJobTime');
        addOneJobTime['date'] = this.get('editDate');
        var writeWorkTime = this.get('writeWorkTime');
        var tmp = {};
        for (var key in addOneJobTime) {
          tmp[key] = addOneJobTime[key];
        }
        if (writeWorkTime) {
          writeWorkTime.forEach(function (item, index) {
            if (item.projectName == tmp.projectName && item.workType == tmp.workType) {
              delete writeWorkTime[index];
            }
          });
        }
        writeWorkTime.unshiftObject(tmp);
        this.set('writeWorkTime', writeWorkTime);
      },

      chooseDestination: function chooseDestination(destinationProject) {
        this.set('addOneJobTime.projectName', destinationProject);
      },

      deleteWorkRec: function deleteWorkRec(deleteRe) {
        var writeWorkTime = this.get('writeWorkTime');
        var newWriteWorkTime = [];
        writeWorkTime.forEach(function (item) {
          if (deleteRe.projectName != item.projectName || deleteRe.workType != item.workType) {
            newWriteWorkTime.pushObject(item);
          }
        });
        this.set('writeWorkTime', newWriteWorkTime);
      },
      setCurrentRe: function setCurrentRe(_setCurrentRe) {
        this.set('addOneJobTime', _setCurrentRe);
      },

      loadStep: function loadStep() {
        this.set('addOneJobTime', {});
        this.set('writeWorkTime', []);
        this.set('loadWorkRecord0', []);
        this.set('loadWorkRecord1', []);
        this.set('participateProject', []);
        this.set('errorInfo', '');
        var date = new Date();
        this.set('writeTime', _pmoWebUtilsDate.dateUtils.formatDate(date));

        //  var data = [[{"date":"2017-08-1","workTime":8,"week":"\u661f\u671f\u4e8c","day":1},{"date":"2017-08-2","workTime":6,"week":"\u661f\u671f\u4e09","day":2},{"date":"2017-08-3","workTime":0,"week":"\u661f\u671f\u56db","day":3},{"date":"2017-08-4","workTime":0,"week":"\u661f\u671f\u4e94","day":4},{"date":"2017-08-5","workTime":0,"week":"\u661f\u671f\u516d","day":5},{"date":"2017-08-6","workTime":0,"week":"\u661f\u671f\u65e5","day":6},{"date":"2017-08-7","workTime":0,"week":"\u661f\u671f\u4e00","day":7},{"date":"2017-08-8","workTime":0,"week":"\u661f\u671f\u4e8c","day":8},{"date":"2017-08-9","workTime":0,"week":"\u661f\u671f\u4e09","day":9},{"date":"2017-08-10","workTime":0,"week":"\u661f\u671f\u56db","day":10},{"date":"2017-08-11","workTime":0,"week":"\u661f\u671f\u4e94","day":11},{"date":"2017-08-12","workTime":0,"week":"\u661f\u671f\u516d","day":12},{"date":"2017-08-13","workTime":0,"week":"\u661f\u671f\u65e5","day":13},{"date":"2017-08-14","workTime":0,"week":"\u661f\u671f\u4e00","day":14},{"date":"2017-08-15","workTime":0,"week":"\u661f\u671f\u4e8c","day":15}],[{"date":"2017-08-16","workTime":0,"week":"\u661f\u671f\u4e09","day":16},{"date":"2017-08-17","workTime":0,"week":"\u661f\u671f\u56db","day":17},{"date":"2017-08-18","workTime":0,"week":"\u661f\u671f\u4e94","day":18},{"date":"2017-08-19","workTime":0,"week":"\u661f\u671f\u516d","day":19},{"date":"2017-08-20","workTime":0,"week":"\u661f\u671f\u65e5","day":20},{"date":"2017-08-21","workTime":0,"week":"\u661f\u671f\u4e00","day":21},{"date":"2017-08-22","workTime":0,"week":"\u661f\u671f\u4e8c","day":22},{"date":"2017-08-23","workTime":0,"week":"\u661f\u671f\u4e09","day":23},{"date":"2017-08-24","workTime":0,"week":"\u661f\u671f\u56db","day":24},{"date":"2017-08-25","workTime":0,"week":"\u661f\u671f\u4e94","day":25},{"date":"2017-08-26","workTime":0,"week":"\u661f\u671f\u516d","day":26},{"date":"2017-08-27","workTime":0,"week":"\u661f\u671f\u65e5","day":27},{"date":"2017-08-28","workTime":0,"week":"\u661f\u671f\u4e00","day":28},{"date":"2017-08-29","workTime":0,"week":"\u661f\u671f\u4e8c","day":29},{"date":"2017-08-30","workTime":0,"week":"\u661f\u671f\u4e09","day":30},{"date":"2017-08-31","workTime":0,"week":"\u661f\u671f\u56db","day":31}]];
        // this.set('loadWorkRecord0',data[0]);
        // this.set('loadWorkRecord1',data[1]);

        this.send('writeJobTime');
      },
      //显示当月报工日期
      writeJobTime: function writeJobTime() {
        var _this = this;

        var data = {};
        var writeTime = this.get('writeTime');
        data['writeTime'] = writeTime;
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.workTimeList.api',
          type: 'post',
          data: data
        }).then(function (data) {
          _this.set('loadWorkRecord0', data[0]);
          _this.set('loadWorkRecord1', data[1]);
        });
      },
      //显示报工表单
      writeTimeForm: function writeTimeForm(date) {
        var self = this;
        this.set('errorInfo', '');
        var data = {};
        self.set('editDate', date);

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.person.projects',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            var participateProject = [];

            data.forEach(function (item) {
              participateProject.push(item.projectName);
            });
            self.set('participateProject', participateProject);
            var timeData = {};
            self.set('editDate', date);
            timeData['editDate'] = date;

            (0, _pmoWebUtilsHttpHelpers.request)({
              name: 'get.getFillJobTime.api',
              type: 'post',
              data: timeData
            }).then(function (data) {
              var writeWorkTime = [];
              if (data) {
                data.forEach(function (item) {
                  if (Number(item.workTime) > 0) {
                    writeWorkTime.push(item);
                  }
                });
              }
              self.set('writeWorkTime', writeWorkTime);

              $('#addWorkTimeDiv').removeClass('hide');
              $('#divbg').removeClass('hide');
            });
          } else {
            self.set('errorInfo', '添加失败，添加机器异常！');
          }
        });

        /*
             var data = [{
                "workTime": 8,
                "workType": "1",
                "projectName": "	BC-LogManager大云日志管家大云日志管家家大云日志管家",
                "workDetail": "doproject"
              },{
                "id": 2,
                "workTime": 0,
                "workType": "1",
                "projectName": "	BC-	BC-SE搜索引擎",
                "workDetail": "doproject"
              },{
                "id": 3,
                "workTime": 8,
                "workType": "1",
                "projectName": "	BC-Moleye数据可视化平台",
                "workDetail": "doproject"
              },{
                "id": 4,
                "workTime": 8,
                "workType": "1",
                "projectName": "	BC-	大数据套件CMH",
                "workDetail": "doproject"
              },{
                "id": 5,
                "workTime": 8,
                "workType": "1",
                "projectName": "	BC-LogManager",
                "workDetail": "doproject"
              }];
              var participateProject = [];
              data.forEach(function (item) {
                participateProject.push(item.projectName);
              })
              this.set('participateProject',participateProject);
        
        */
      },

      typeChanged: function typeChanged(value, workId, event) {
        this.set('addOneJobTime.workType', value);
      },

      //提交报工表单
      doWriteTimeForm: function doWriteTimeForm() {
        this.set('errorInfo', '');
        var self = this;
        var userInfo = this.get('userInfo');
        var data = {};
        data['writeWorkTime'] = this.get('writeWorkTime');
        data['userName'] = userInfo['userName'];
        data['date'] = this.get('editDate');
        var workTotalTime = 0;
        //验证格式
        data['writeWorkTime'].forEach(function (item) {
          if (!_pmoWebUtilsValidator.validator.isValidNaturaNumbers(item.workTime)) {
            self.set('errorInfo', self.get('i18n').t('job.time.format.error'));
            return;
          } else {
            if (item.workTime > 24) {
              self.set('errorInfo', self.get('i18n').t('job.time.format.error'));
              return;
            } else if (item.workTime > 0) {
              workTotalTime = workTotalTime + Number(item.workTime);
            }
          }
        });
        if (workTotalTime > 24) {
          self.set('errorInfo', self.get('i18n').t('job.time.format.error'));
          return;
        }

        //提交数据
        if (!self.get('errorInfo')) {
          (0, _pmoWebUtilsHttpHelpers.request)({
            name: 'get.replaceJobTime.api',
            type: 'post',
            data: data
          }).then(function (data) {
            if (data) {
              $('#addWorkTimeDiv').addClass('hide');
              $('#divbg').addClass('hide');
              self.send('writeJobTime');
            }
          });
        }
      },
      closeWriteTimeForm: function closeWriteTimeForm() {
        $('#addWorkTimeDiv').addClass('hide');
        $('#divbg').addClass('hide');
      },
      showTextArea: function showTextArea() {
        $('#workDetailTextareaBg').removeClass('hide');
        $('#workDetailTextarea').removeClass('hide');
      },
      addWorkdetail: function addWorkdetail() {
        //      var workDetail = this.get('workDetail');
        //      this.set('addOneJobTime.workDetail',workDetail);
        $('#workDetailTextareaBg').addClass('hide');
        $('#workDetailTextarea').addClass('hide');
      },
      closeWorkDetailTextarea: function closeWorkDetailTextarea() {
        $('#workDetailTextareaBg').addClass('hide');
        $('#workDetailTextarea').addClass('hide');
      }

    }

  });
});
define('pmo-web/controllers/left-employee', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({});
});
define('pmo-web/controllers/left-machine', ['exports', 'ember', 'pmo-web/utils/http-helpers', 'pmo-web/utils/number_utils', 'pmo-web/utils/date', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebUtilsHttpHelpers, _pmoWebUtilsNumber_utils, _pmoWebUtilsDate, _pmoWebConfigEnvironment) {
  exports['default'] = _ember['default'].Controller.extend({

    session: _ember['default'].inject.service('session'),
    startTime: '',
    endTime: '',
    userEmail: '',
    useDetail: '',
    computerType: '',
    loadComputer: [],
    searchItem: [],
    searchWordInput: '',

    errorInfo: '',

    pageSizeSelect: [10, 50, 100],
    pageSizeValue: 10,
    currentPage: 0,

    loadDataLength: 0,

    beginShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', {
      get: function get() {
        return this.get('currentPage') * this.get('pageSizeValue');
      }
    }),

    showDataLength: _ember['default'].computed('showData', {
      get: function get() {
        return this.get('showData').length;
      }
    }),
    endShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', 'loadDataLength', {
      get: function get() {
        if ((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadDataLength')) {
          return this.get('loadDataLength');
        }
        return (this.get('currentPage') + 1) * this.get('pageSizeValue');
      }
    }),
    showData: _ember['default'].computed('endShowItem', 'beginShowItem', 'loadComputer', 'searchWordInput', 'searchItem', {
      get: function get() {
        if (this.get('searchWordInput') != '') {
          return this.get('searchItem').slice(this.get('beginShowItem'), this.get('endShowItem'));
        } else {
          return this.get('loadComputer').slice(this.get('beginShowItem'), this.get('endShowItem'));
        }
      }
    }),
    dsComputerIps: _ember['default'].computed('searchItem', {
      get: function get() {
        var searchItem = this.get('searchItem');
        var ips = "";
        searchItem.forEach(function (item) {
          ips = ips + ',' + item.mIp;
        });
        ips = ips.substr(1, ips.length);
        return ips;
      }
    }),
    paginationLeftClass: _ember['default'].computed('currentPage', {
      get: function get() {
        if (this.get("currentPage") > 0) {
          return "paginate_previous";
        }
        return "paginate_disabled_previous";
      }
    }),
    actions: {

      distributeComputer: function distributeComputer() {
        _ember['default'].$('#distributeComputerForm').modal('show');
      },
      distributeComputerSubmit: function distributeComputerSubmit() {
        var self = this;
        self.set('errorInfo', '');
        var data = {};
        data['mIp'] = this.get('dsComputerIps');
        data['startTime'] = this.get('startTime');
        data['endTime'] = this.get('endTime');
        data['userEmail'] = this.get('userEmail');
        data['useDetail'] = this.get('useDetail');
        data['computerType'] = $('#computerType').val();
        data['isShared'] = $('#isShared').val();
        data['isSafe'] = $('#isSafe').val();
        data['area'] = $('#area').val();

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'distribute.computer.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#distributeComputerForm').modal('hide');
          } else {
            self.set('errorInfo', '分配异常，分配机器失败！');
          }
        });
      },
      refreshPageSize: function refreshPageSize() {
        this.set('pageSizeValue', $('#list-status').val());
      },
      pageDown: function pageDown() {
        if (this.get('currentPage') > 0) {
          var page = this.get('currentPage') - 1;
          this.set('currentPage', page);
        }
      },

      searchedItemFromWord: function searchedItemFromWord() {
        var searchResult = [];
        var loadComputer = this.get('loadComputer');
        var searchWord = this.get('searchWordInput').toString().toLowerCase();
        this.set('currentPage', 0);
        loadComputer.forEach(function (computer) {
          if (computer['ip'].toString().toLowerCase().indexOf(searchWord) >= 0 || computer['mIp'].toString().toLowerCase().indexOf(searchWord) >= 0 || computer['cpu'].toString().toLowerCase().indexOf(searchWord) >= 0 || computer['memory'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            searchResult.pushObject(computer);
          }
        });
        this.set('searchItem', searchResult);
      },

      pageUp: function pageUp() {
        var page = this.get('currentPage') + 1;
        if (page * this.get('pageSizeValue') < this.get('loadDataLength')) {
          this.set('currentPage', page);
        }
      },
      sharedChanged: function sharedChanged(value, event) {
        this.set('editComputer.isShared', value);
      },
      safeChanged: function safeChanged(value, event) {
        this.set('editComputer.isSafe', value);
      },
      areaChanged: function areaChanged(value, event) {
        this.set('editComputer.area', value);
      },
      typeChanged: function typeChanged(value, event) {
        this.set('editComputer.computerType', value);
      },

      loadStep: function loadStep() {
        this.send('loadComputer');
        // var data = [];
        //  data = [{"ip":"10.254.9.78","mIp":"10.255.9.78","cpu":"32","memory":"256","disk":"4*3T\/2*900G","area":"2015\u5e74IDC\u6269\u5bb9\u5de5\u7a0b"},{"ip":"10.254.9.63","mIp":"10.255.9.63","cpu":"32","memory":"256","disk":"4*3T\/2*900G","area":"2015\u5e74IDC\u6269\u5bb9\u5de5\u7a0b"}];
        // this.set('loadDataLength',data.length);
        //this.set('loadComputer',data);
      },
      loadComputer: function loadComputer() {
        var _this = this;

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.leftComputer.api',
          type: 'get',
          data: {}
        }).then(function (data) {
          _this.set('loadComputer', data);
          _this.set('loadDataLength', data.length);
        });
      }
    }
  });
});
define('pmo-web/controllers/login', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Controller.extend({
    session: _ember['default'].inject.service('session'),
    errorMessage: '',
    userEmail: '',
    errorInfo: '',
    userPassword: '',
    actions: {}
  });
});
define('pmo-web/controllers/new-project', ['exports', 'ember', 'pmo-web/utils/http-helpers', 'pmo-web/utils/number_utils', 'pmo-web/utils/date', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebUtilsHttpHelpers, _pmoWebUtilsNumber_utils, _pmoWebUtilsDate, _pmoWebConfigEnvironment) {
  exports['default'] = _ember['default'].Controller.extend({

    session: _ember['default'].inject.service('session'),

    loadProject: [],

    searchItem: [],
    searchWordInput: '',
    editProject: {},

    errorInfo: '',
    pageSizeSelect: [10, 50, 100],
    pageSizeValue: 10,
    currentPage: 0,

    loadProjectLength: 0,

    searchItemLength: _ember['default'].computed('searchItem', {
      get: function get() {
        return this.get('searchItem').length;
      }
    }),

    beginShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', {
      get: function get() {
        return this.get('currentPage') * this.get('pageSizeValue');
      }
    }),

    showDataLength: _ember['default'].computed('showData', {
      get: function get() {
        return this.get('showData').length;
      }
    }),
    endShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', 'loadProjectLength', {
      get: function get() {
        if ((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadProjectLength')) {
          return this.get('loadProjectLength');
        }
        return (this.get('currentPage') + 1) * this.get('pageSizeValue');
      }
    }),

    showData: _ember['default'].computed('endShowItem', 'beginShowItem', 'loadProject', 'searchWordInput', 'searchItem', {
      get: function get() {
        if (this.get('searchWordInput') != '') {
          return this.get('searchItem').slice(this.get('beginShowItem'), this.get('endShowItem'));
        } else {
          return this.get('loadProject').slice(this.get('beginShowItem'), this.get('endShowItem'));
        }
      }
    }),

    paginationLeftClass: _ember['default'].computed('currentPage', {
      get: function get() {
        if (this.get("currentPage") > 0) {
          return "paginate_previous";
        }
        return "paginate_disabled_previous";
      }
    }),

    actions: {
      categoryChanged: function categoryChanged(value, event) {
        this.set('editProject.projectType', value);
      },

      showAddProjectForm: function showAddProjectForm() {
        _ember['default'].$('#addProjectForm').modal('show');
      },

      refreshPageSize: function refreshPageSize() {
        this.set('pageSizeValue', $('#list-status').val());
      },
      submitExclData: function submitExclData() {
        _ember['default'].$('#addSomeProjectForm').modal('hide');
      },

      showAddSomeProjectForm: function showAddSomeProjectForm() {
        _ember['default'].$('#addSomeProjectForm').modal('show');
      },

      loadStep: function loadStep() {

        this.send('doLoadProjects');
      },
      searchedItemFromWord: function searchedItemFromWord() {
        var searchResult = [];
        var loadProject = this.get('loadProject');
        var searchWord = this.get('searchWordInput').toString().toLowerCase();
        this.set('currentPage', 0);
        loadProject.forEach(function (project) {
          console.log(project);
          if (project['projectManagerId'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['projectName'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['projectType'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['projectPeople'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            searchResult.pushObject(project);
          }
        });
        this.set('searchItem', searchResult);
      },

      pageUp: function pageUp() {
        var page = this.get('currentPage') + 1;
        if (page * this.get('pageSizeValue') < this.get('loadProjectLength')) {
          this.set('currentPage', page);
        }
      },
      pageDown: function pageDown() {
        if (this.get('currentPage') > 0) {
          var page = this.get('currentPage') - 1;
          this.set('currentPage', page);
        }
      },
      doLoadProjects: function doLoadProjects() {
        var _this = this;

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.newProject.api',
          type: 'get',
          data: {}
        }).then(function (data) {
          _this.set('loadProject', data);
          _this.set('loadProjectLength', data.length);
        });
      },

      editProjectForm: function editProjectForm(data) {
        this.set('editProject', data);
        _ember['default'].$('#editProjectForm').modal('show');
      },
      doEditProject: function doEditProject() {
        var data = this.get('editProject');

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'edit.newProject.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#editProjectForm').modal('hide');
          }
        });
      }

    }
  });
});
define('pmo-web/controllers/operate-logs', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Controller.extend({

    loadLogs: [],
    searchWordInput: '',
    searchItem: [],
    pageSizeSelect: [10, 50, 100],
    pageSizeValue: 10,
    currentPage: 0,
    loadDataLength: 0,

    beginShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', {
      get: function get() {
        return this.get('currentPage') * this.get('pageSizeValue');
      }
    }),

    endShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', 'loadDataLength', {
      get: function get() {
        if ((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadDataLength')) {
          return this.get('loadDataLength');
        }
        return (this.get('currentPage') + 1) * this.get('pageSizeValue');
      }
    }),
    showData: _ember['default'].computed('endShowItem', 'beginShowItem', 'loadLogs', 'searchWordInput', 'searchItem', {
      get: function get() {
        if (this.get('searchWordInput') != '') {
          return this.get('searchItem').slice(this.get('beginShowItem'), this.get('endShowItem'));
        } else {
          return this.get('loadLogs').slice(this.get('beginShowItem'), this.get('endShowItem'));
        }
      }
    }),

    paginationLeftClass: _ember['default'].computed('currentPage', {
      get: function get() {
        if (this.get("currentPage") > 0) {
          return "paginate_previous";
        }
        return "paginate_disabled_previous";
      }
    }),

    actions: {
      refreshPageSize: function refreshPageSize() {
        this.set('pageSizeValue', $('#list-status').val());
      },
      loadStep: function loadStep() {

        this.send('doLoadLogs');
      },
      pageDown: function pageDown() {
        if (this.get('currentPage') > 0) {
          var page = this.get('currentPage') - 1;
          this.set('currentPage', page);
        }
      },
      searchedItemFromWord: function searchedItemFromWord() {
        var searchResult = [];
        var loadLogs = this.get('loadLogs');
        var searchWord = this.get('searchWordInput').toString().toLowerCase();
        this.set('currentPage', 0);
        loadLogs.forEach(function (log) {
          if (log['logDetail'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            searchResult.pushObject(log);
          }
        });
        this.set('searchItem', searchResult);
      },

      pageUp: function pageUp() {
        var page = this.get('currentPage') + 1;
        if (page * this.get('pageSizeValue') < this.get('loadDataLength')) {
          this.set('currentPage', page);
        }
      },
      doLoadLogs: function doLoadLogs() {
        var _this = this;

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.logs.api',
          type: 'get',
          data: {}
        }).then(function (data) {
          _this.set('loadLogs', data);
          _this.set('loadDataLength', data.length);
        });
      }

    }

  });
});
define('pmo-web/controllers/pbug-eperate', ['exports', 'ember', 'pmo-web/utils/http-helpers', 'pmo-web/utils/number_utils', 'pmo-web/utils/date', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebUtilsHttpHelpers, _pmoWebUtilsNumber_utils, _pmoWebUtilsDate, _pmoWebConfigEnvironment) {
  exports['default'] = _ember['default'].Controller.extend({
    session: _ember['default'].inject.service('session'),

    actions: {
      addSomeBugsForm: function addSomeBugsForm() {
        _ember['default'].$('#addSomeBugsForm').modal('show');
      },

      submitExclData: function submitExclData() {
        _ember['default'].$('#addSomeBugsForm').modal('hide');
      }

    }

  });
});
define('pmo-web/controllers/person-info', ['exports', 'ember', 'pmo-web/utils/http-helpers', 'pmo-web/utils/number_utils', 'pmo-web/utils/date', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebUtilsHttpHelpers, _pmoWebUtilsNumber_utils, _pmoWebUtilsDate, _pmoWebConfigEnvironment) {
  exports['default'] = _ember['default'].Controller.extend({

    session: _ember['default'].inject.service('session'),

    //添加个人的项目列表
    projects: [],
    destination: '',
    selectedProjectsItem: [],
    selectedProjects: [],
    loadProject: [],

    searchItem: [],
    searchWordInput: '',
    editProject: {},

    errorInfo: '',
    pageSizeSelect: [10, 50, 100],
    pageSizeValue: 10,
    currentPage: 0,

    loadProjectLength: 0,

    searchItemLength: _ember['default'].computed('searchItem', {
      get: function get() {
        return this.get('searchItem').length;
      }
    }),

    beginShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', {
      get: function get() {
        return this.get('currentPage') * this.get('pageSizeValue');
      }
    }),

    showDataLength: _ember['default'].computed('showData', {
      get: function get() {
        return this.get('showData').length;
      }
    }),
    endShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', 'loadProjectLength', {
      get: function get() {
        if ((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadProjectLength')) {
          return this.get('loadProjectLength');
        }
        return (this.get('currentPage') + 1) * this.get('pageSizeValue');
      }
    }),

    showData: _ember['default'].computed('endShowItem', 'beginShowItem', 'loadProject', 'searchWordInput', 'searchItem', {
      get: function get() {
        if (this.get('searchWordInput') != '') {
          return this.get('searchItem').slice(this.get('beginShowItem'), this.get('endShowItem'));
        } else {
          return this.get('loadProject').slice(this.get('beginShowItem'), this.get('endShowItem'));
        }
      }
    }),

    paginationLeftClass: _ember['default'].computed('currentPage', {
      get: function get() {
        if (this.get("currentPage") > 0) {
          return "paginate_previous";
        }
        return "paginate_disabled_previous";
      }
    }),

    actions: {
      closeAddProject: function closeAddProject() {
        var self = this;
        self.set('selectedProjects', []);
        self.set('projects', []);
        $('#divbg').addClass('hide');
        $('#diveditcontent').addClass('hide');
        $('body').removeClass('no-scroll');
      },
      chooseDestination: function chooseDestination(city) {
        this.set('destination', city);
      },

      doAddProjects: function doAddProjects() {
        var destination = this.get('destination');
        var selectedProjects = this.get('selectedProjects');
        var tag = 1;
        if (selectedProjects.length > 0) {
          selectedProjects.forEach(function (item) {
            if (item == destination) {
              tag = 2;
            }
          });
          if (tag == 1) {
            selectedProjects.pushObject(destination);
          }
        } else {
          selectedProjects.pushObject(destination);
        }

        console.log(selectedProjects);
      },

      deleteRecord: function deleteRecord(project) {
        var selectedProjects = this.get('selectedProjects');
        var newSelectedProjects = [];
        selectedProjects.forEach(function (item, index) {
          if (item.name != project.name) {
            newSelectedProjects.pushObject(item);
          }
        });
        this.set('selectedProjects', newSelectedProjects);
      },

      //添加个人项目
      submitAddProject: function submitAddProject() {
        var data = this.get('selectedProjects');
        var self = this;
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'post.addProject.api',
          type: 'post',
          data: data
        }).then(function (data) {
          self.set('selectedProjects', []);
          $('#divbg').addClass('hide');
          $('#diveditcontent').addClass('hide');
          $('body').removeClass('no-scroll');
        });
      },

      //显示个人可添加项目
      doAddWorkerProject: function doAddWorkerProject() {
        var data = {};
        var projects = [];
        var self = this;
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.joinProject.api',
          type: 'get',
          data: data
        }).then(function (data) {
          var destination = data[0]['projectName'];
          self.set('destination', destination);
          data.forEach(function (item) {
            projects.push(item.projectName);
          });
          self.set('projects', projects);
          $('body').addClass('no-scroll');
          $('#divbg').removeClass('hide');
          $('#diveditcontent').removeClass('hide');
        });
      },
      categoryChanged: function categoryChanged(value, event) {
        this.set('editProject.projectType', value);
      },

      showAddProjectForm: function showAddProjectForm() {
        _ember['default'].$('#addProjectForm').modal('show');
      },

      refreshPageSize: function refreshPageSize() {
        this.set('pageSizeValue', $('#list-status').val());
      },
      submitExclData: function submitExclData() {
        _ember['default'].$('#addSomeProjectForm').modal('hide');
      },

      showAddSomeProjectForm: function showAddSomeProjectForm() {
        _ember['default'].$('#addSomeProjectForm').modal('show');
      },

      loadStep: function loadStep() {

        this.send('doLoadProjects');
      },
      searchedItemFromWord: function searchedItemFromWord() {
        var searchResult = [];
        var loadProject = this.get('loadProject');
        var searchWord = this.get('searchWordInput').toString().toLowerCase();
        this.set('currentPage', 0);
        loadProject.forEach(function (project) {
          console.log(project);
          if (project['projectManagerId'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['projectName'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['projectType'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['projectPeople'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            searchResult.pushObject(project);
          }
        });
        this.set('searchItem', searchResult);
      },

      pageUp: function pageUp() {
        var page = this.get('currentPage') + 1;
        if (page * this.get('pageSizeValue') < this.get('loadProjectLength')) {
          this.set('currentPage', page);
        }
      },
      pageDown: function pageDown() {
        if (this.get('currentPage') > 0) {
          var page = this.get('currentPage') - 1;
          this.set('currentPage', page);
        }
      },
      doLoadProjects: function doLoadProjects() {
        var _this = this;

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.person.projects',
          type: 'get',
          data: {}
        }).then(function (data) {
          _this.set('loadProject', data);
          _this.set('loadProjectLength', data.length);
        });
      },

      editProjectForm: function editProjectForm(data) {
        this.set('editProject', data);
        _ember['default'].$('#editProjectForm').modal('show');
      },
      doEditProject: function doEditProject() {
        var data = this.get('editProject');

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'edit.newProject.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#editProjectForm').modal('hide');
          }
        });
      }
    }
  });
});
define('pmo-web/controllers/projects', ['exports', 'ember', 'pmo-web/utils/http-helpers', 'pmo-web/utils/number_utils', 'pmo-web/utils/date', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebUtilsHttpHelpers, _pmoWebUtilsNumber_utils, _pmoWebUtilsDate, _pmoWebConfigEnvironment) {
  exports['default'] = _ember['default'].Controller.extend({

    session: _ember['default'].inject.service('session'),

    loadProject: [],

    searchItem: [],
    searchWordInput: '',
    editProject: {},

    errorInfo: '',
    pageSizeSelect: [10, 50, 100],
    pageSizeValue: 10,
    currentPage: 0,

    loadProjectLength: 0,

    searchItemLength: _ember['default'].computed('searchItem', {
      get: function get() {
        return this.get('searchItem').length;
      }
    }),

    beginShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', {
      get: function get() {
        return this.get('currentPage') * this.get('pageSizeValue');
      }
    }),

    showDataLength: _ember['default'].computed('showData', {
      get: function get() {
        return this.get('showData').length;
      }
    }),
    endShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', 'loadProjectLength', {
      get: function get() {
        if ((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadProjectLength')) {
          return this.get('loadProjectLength');
        }
        return (this.get('currentPage') + 1) * this.get('pageSizeValue');
      }
    }),

    showData: _ember['default'].computed('endShowItem', 'beginShowItem', 'loadProject', 'searchWordInput', 'searchItem', {
      get: function get() {
        if (this.get('searchWordInput') != '') {
          return this.get('searchItem').slice(this.get('beginShowItem'), this.get('endShowItem'));
        } else {
          return this.get('loadProject').slice(this.get('beginShowItem'), this.get('endShowItem'));
        }
      }
    }),

    paginationLeftClass: _ember['default'].computed('currentPage', {
      get: function get() {
        if (this.get("currentPage") > 0) {
          return "paginate_previous";
        }
        return "paginate_disabled_previous";
      }
    }),

    actions: {
      categoryChanged: function categoryChanged(value, event) {
        this.set('editProject.projectType', value);
      },

      showAddProjectForm: function showAddProjectForm() {
        _ember['default'].$('#addProjectForm').modal('show');
      },

      refreshPageSize: function refreshPageSize() {
        this.set('pageSizeValue', $('#list-status').val());
      },
      submitExclData: function submitExclData() {
        _ember['default'].$('#addSomeProjectForm').modal('hide');
      },

      showAddSomeProjectForm: function showAddSomeProjectForm() {
        _ember['default'].$('#addSomeProjectForm').modal('show');
      },

      loadStep: function loadStep() {
        /* var data =[{"id":"431","contractId":"01-2017-046","projectId":"C201785-018","projectName":"\u5728\u7ebf2017\u5e74hadoop\u7ef4\u4fdd\u9879\u76ee","salesmaneEmail":"wuhui@cmss.chinamobile.com","projectManagerEmail":"huanghaibo@cmss.chinamobile.com","developerEmail":"zhangyongxi@cmss.chinamobile.com","projectType":"\u652f\u6491\u670d\u52a1\u7c7b","projectPrice":"1200000.00","getMoney":null,"leftMoney":null,"customer":null,"leadDepartment":"\u5927\u6570\u636e\u4ea7\u54c1\u90e8","areaBelong":"\u897f\u90e8","projectStage":null,"businessStatus":"","usedProduct":null,"nodeCount":null,"province":"\u5728\u7ebf\u516c\u53f8","assistDepartment":"","spitStatus":"\u5df2\u62c6\u5206"},{"id":"432","contractId":"01-2017-045","projectId":"C201785-151","projectName":"\u8fbd\u5b81\u7701\u91d1\u6c1f\u9f99\u73af\u4fdd\u65b0\u6750\u6599\u6709\u9650\u516c\u53f8\u5546\u60c5\u901a\u8bd5\u7528\u9879\u76ee","salesmaneEmail":"wuhui@cmss.chinamobile.com","projectManagerEmail":"huanghaibo@cmss.chinamobile.com","developerEmail":"zhangyongxi@cmss.chinamobile.com","projectType":"\u4ea7\u54c1\u9500\u552e\u7c7b","projectPrice":"1200.00","getMoney":null,"leftMoney":null,"customer":null,"leadDepartment":"\u5927\u6570\u636e\u4ea7\u54c1\u90e8","areaBelong":"\u5317\u90e8","projectStage":null,"businessStatus":"","usedProduct":null,"nodeCount":null,"province":"\u8fbd\u5b81","assistDepartment":"","spitStatus":"\u5df2\u62c6\u5206"}];
          this.set('loadProject',data);
         this.set('loadProjectLength',data.length);*/

        this.send('doLoadProjects');
      },
      searchedItemFromWord: function searchedItemFromWord() {
        var searchResult = [];
        var loadProject = this.get('loadProject');
        var searchWord = this.get('searchWordInput').toString().toLowerCase();
        this.set('currentPage', 0);
        loadProject.forEach(function (project) {
          if (project['contractId'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['projectId'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['projectName'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['projectManagerEmail'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['projectType'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['areaBelong'].toString().toLowerCase().indexOf(searchWord) >= 0 ||
          //    project['projectStage'].toString().toLowerCase().indexOf(searchWord)>=0||
          project['province'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            searchResult.pushObject(project);
          }
        });
        this.set('searchItem', searchResult);
      },

      pageUp: function pageUp() {
        var page = this.get('currentPage') + 1;
        if (page * this.get('pageSizeValue') < this.get('loadProjectLength')) {
          this.set('currentPage', page);
        }
      },
      pageDown: function pageDown() {
        if (this.get('currentPage') > 0) {
          var page = this.get('currentPage') - 1;
          this.set('currentPage', page);
        }
      },
      doLoadProjects: function doLoadProjects() {
        var _this = this;

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.project.api',
          type: 'get',
          data: {}
        }).then(function (data) {
          _this.set('loadProject', data);
          _this.set('loadProjectLength', data.length);
        });
      },

      editProjectForm: function editProjectForm(data) {
        this.set('editProject', data);
        _ember['default'].$('#editProjectForm').modal('show');
      },
      doEditProject: function doEditProject() {
        var data = this.get('editProject');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'edit.project.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#editProjectForm').modal('hide');
          }
        });
      }

    }
  });
});
define('pmo-web/controllers/puser-manage', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Controller.extend({
    session: _ember['default'].inject.service('session'),
    loadUsers: [],
    searchWordInput: '',
    searchItem: [],
    pageSizeSelect: [10, 50, 100],
    pageSizeValue: 10,
    currentPage: 0,
    loadDataLength: 0,
    editUser: {},
    errorInfo: '',

    beginShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', {
      get: function get() {
        return this.get('currentPage') * this.get('pageSizeValue');
      }
    }),

    endShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', 'loadDataLength', {
      get: function get() {
        if ((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadDataLength')) {
          return this.get('loadDataLength');
        }
        return (this.get('currentPage') + 1) * this.get('pageSizeValue');
      }
    }),
    showData: _ember['default'].computed('endShowItem', 'beginShowItem', 'loadUsers', 'searchWordInput', 'searchItem', {
      get: function get() {
        if (this.get('searchWordInput') != '') {
          return this.get('searchItem').slice(this.get('beginShowItem'), this.get('endShowItem'));
        } else {
          return this.get('loadUsers').slice(this.get('beginShowItem'), this.get('endShowItem'));
        }
      }
    }),

    paginationLeftClass: _ember['default'].computed('currentPage', {
      get: function get() {
        if (this.get("currentPage") > 0) {
          return "paginate_previous";
        }
        return "paginate_disabled_previous";
      }
    }),

    actions: {
      refreshPageSize: function refreshPageSize() {
        this.set('pageSizeValue', $('#list-status').val());
      },
      loadStep: function loadStep() {

        this.send('doLoadUsers');
      },
      pageDown: function pageDown() {
        if (this.get('currentPage') > 0) {
          var page = this.get('currentPage') - 1;
          this.set('currentPage', page);
        }
      },
      searchedItemFromWord: function searchedItemFromWord() {
        var searchResult = [];
        var loadUsers = this.get('loadUsers');
        var searchWord = this.get('searchWordInput').toString().toLowerCase();
        this.set('currentPage', 0);
        loadUsers.forEach(function (user) {
          if (user['userName'].toString().toLowerCase().indexOf(searchWord) >= 0 || user['userEmail'].toString().toLowerCase().indexOf(searchWord) >= 0 || user['userTeam'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            searchResult.pushObject(user);
          }
        });
        this.set('searchItem', searchResult);
      },

      pageUp: function pageUp() {
        var page = this.get('currentPage') + 1;
        if (page * this.get('pageSizeValue') < this.get('loadDataLength')) {
          this.set('currentPage', page);
        }
      },
      doLoadUsers: function doLoadUsers() {
        var _this = this;

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.users.api',
          type: 'get',
          data: {}
        }).then(function (data) {
          _this.set('loadUsers', data);
          _this.set('loadDataLength', data.length);
        });
      },

      editUserForm: function editUserForm(editUser) {
        this.set('editUser', editUser);
        _ember['default'].$('#editUserForm').modal('show');
      },

      typeChanged: function typeChanged(value, event) {
        this.set('editUser.userType', value);
      },

      userEdit: function userEdit() {
        var self = this;
        self.set('errorInfo', '');
        var data = this.get('editUser');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'edit.user.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#editUserForm').modal('hide');
          } else {
            self.set('errorInfo', '编辑失败，编辑结果异常');
          }
        });
      }

    }

  });
});
define('pmo-web/controllers/used-employee', ['exports', 'ember', 'pmo-web/utils/http-helpers', 'pmo-web/utils/number_utils', 'pmo-web/utils/validator', 'pmo-web/utils/date', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebUtilsHttpHelpers, _pmoWebUtilsNumber_utils, _pmoWebUtilsValidator, _pmoWebUtilsDate, _pmoWebConfigEnvironment) {
  exports['default'] = _ember['default'].Controller.extend({

    session: _ember['default'].inject.service('session'),
    i18n: _ember['default'].inject.service(),
    loadProject: [],
    addProject: {},
    searchItem: [],
    searchWordInput: '',
    editProject: {},

    employeeScore: [],

    errorInfo: '',
    pageSizeSelect: [10, 50, 100],
    pageSizeValue: 10,
    currentPage: 0,

    isShow: false,

    writeTime: null,

    loadProjectLength: 0,

    searchItemLength: _ember['default'].computed('searchItem', {
      get: function get() {
        return this.get('searchItem').length;
      }
    }),

    beginShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', {
      get: function get() {
        return this.get('currentPage') * this.get('pageSizeValue');
      }
    }),

    showDataLength: _ember['default'].computed('showData', {
      get: function get() {
        return this.get('showData').length;
      }
    }),
    endShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', 'loadProjectLength', {
      get: function get() {
        if ((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadProjectLength')) {
          return this.get('loadProjectLength');
        }
        return (this.get('currentPage') + 1) * this.get('pageSizeValue');
      }
    }),

    showData: _ember['default'].computed('endShowItem', 'beginShowItem', 'loadProject', 'searchWordInput', 'searchItem', {
      get: function get() {
        if (this.get('searchWordInput') != '') {
          return this.get('searchItem').slice(this.get('beginShowItem'), this.get('endShowItem'));
        } else {
          return this.get('loadProject').slice(this.get('beginShowItem'), this.get('endShowItem'));
        }
      }
    }),

    paginationLeftClass: _ember['default'].computed('currentPage', {
      get: function get() {
        if (this.get("currentPage") > 0) {
          return "paginate_previous";
        }
        return "paginate_disabled_previous";
      }
    }),

    writeTimeChage: _ember['default'].observer('writeTime', function () {
      if (this.get('isShow')) {
        this.send('refreshEScore');
      }
    }),

    actions: {

      showAddProjectForm: function showAddProjectForm() {
        _ember['default'].$('#addProjectForm').modal('show');
      },
      refreshEScore: function refreshEScore() {
        var self = this;
        var data = {};
        data['date'] = this.get('writeTime');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.SomeEmployeeScore.api',
          type: 'post',
          data: data
        }).then(function (data) {
          console.log(data);
          self.set('employeeScore', data);
        });
      },

      //展现雇员打分列表
      addScore: function addScore() {
        var _this = this;

        var self = this;
        var data = {};
        data['date'] = this.get('writeTime');
        _ember['default'].$('#employeeScoreForm').modal('show');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.SomeEmployeeScore.api',
          type: 'post',
          data: data
        }).then(function (data) {
          console.log(data);
          self.set('employeeScore', data);
          _this.set('isShow', true);
        });
      },

      //给雇员打分
      doScoreEmployee: function doScoreEmployee() {
        var _this2 = this;

        var self = this;
        var employeeScore = this.get('employeeScore');
        if (employeeScore) {
          employeeScore.forEach(function (item) {
            if (!_pmoWebUtilsValidator.validator.isValidFloat(item.score)) {
              this.set('errorInfo', this.get('i18n').t('score.format.error'));
              return;
            }
          });
        }

        var data = {};
        data['score'] = employeeScore;
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'post.scoreEmployees.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#employeeScoreForm').modal('hide');
            _this2.set('isShow', false);
          } else {
            self.set('errorInfo', _this2.get('i18n').t('score.format.error'));
          }
        });
      },

      categoryChanged: function categoryChanged(value, event) {
        this.set('editProject.projectType', value);
      },

      refreshPageSize: function refreshPageSize() {
        this.set('pageSizeValue', $('#list-status').val());
      },
      submitExclData: function submitExclData() {
        _ember['default'].$('#addSomeProjectForm').modal('hide');
      },

      showAddSomeProjectForm: function showAddSomeProjectForm() {
        _ember['default'].$('#addSomeProjectForm').modal('show');
      },

      loadStep: function loadStep() {

        this.set('loadProject', []);
        this.set('editProject', []);
        this.set('employeeScore', []);

        var date = new Date();
        this.set('addProject.getInTime', _pmoWebUtilsDate.dateUtils.formatDate(date));
        this.send('doLoadProjects');
      },
      searchedItemFromWord: function searchedItemFromWord() {
        var searchResult = [];
        var loadProject = this.get('loadProject');
        var searchWord = this.get('searchWordInput').toString().toLowerCase();
        this.set('currentPage', 0);
        loadProject.forEach(function (project) {
          console.log(project);
          if (project['employeeName'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['employeeCompany'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['workType'].toString().toLowerCase().indexOf(searchWord) >= 0 || project['locatedTeam'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            searchResult.pushObject(project);
          }
        });
        this.set('searchItem', searchResult);
      },

      pageUp: function pageUp() {
        var page = this.get('currentPage') + 1;
        if (page * this.get('pageSizeValue') < this.get('loadProjectLength')) {
          this.set('currentPage', page);
        }
      },
      pageDown: function pageDown() {
        if (this.get('currentPage') > 0) {
          var page = this.get('currentPage') - 1;
          this.set('currentPage', page);
        }
      },
      doLoadProjects: function doLoadProjects() {
        var _this3 = this;

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.employee.api',
          type: 'get',
          data: {}
        }).then(function (data) {
          _this3.set('loadProject', data);
          _this3.set('loadProjectLength', data.length);
        });
      },

      editProjectForm: function editProjectForm(data) {
        this.set('editProject', data);
        _ember['default'].$('#editProjectForm').modal('show');
      },
      doEditProject: function doEditProject() {
        var data = this.get('editProject');

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'edit.employee.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#editProjectForm').modal('hide');
          }
        });
      },
      doAddProject: function doAddProject() {
        var data = this.get('addProject');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'add.employee.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#addProjectForm').modal('hide');
          }
        });
      }

    }
  });
});
define('pmo-web/controllers/used-machine', ['exports', 'ember', 'pmo-web/utils/http-helpers', 'pmo-web/utils/number_utils', 'pmo-web/utils/date', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebUtilsHttpHelpers, _pmoWebUtilsNumber_utils, _pmoWebUtilsDate, _pmoWebConfigEnvironment) {
  exports['default'] = _ember['default'].Controller.extend({
    session: _ember['default'].inject.service('session'),
    os: '',
    ip: '',
    mIp: '',
    cpu: '',
    memory: '',
    disk: '',
    startTime: '',
    endTime: '',
    userEmail: '',
    useDetail: '',
    computerType: '',
    loadComputer: [],
    editComputer: {},
    searchItem: [],
    searchWordInput: '',
    deleteId: '',
    returnId: '',

    errorInfo: '',

    pageSizeSelect: [10, 50, 100],
    pageSizeValue: 10,
    currentPage: 0,

    loadDataLength: 0,

    searchItemLength: _ember['default'].computed('searchItem', {
      get: function get() {
        return this.get('searchItem').length;
      }
    }),

    beginShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', {
      get: function get() {
        return this.get('currentPage') * this.get('pageSizeValue');
      }
    }),

    showDataLength: _ember['default'].computed('showData', {
      get: function get() {
        return this.get('showData').length;
      }
    }),
    endShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', 'loadDataLength', {
      get: function get() {
        if ((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadDataLength')) {
          return this.get('loadDataLength');
        }
        return (this.get('currentPage') + 1) * this.get('pageSizeValue');
      }
    }),
    returnComputerIps: _ember['default'].computed('searchItem', {
      get: function get() {
        var searchItem = this.get('searchItem');
        var ips = "";
        searchItem.forEach(function (item) {
          ips = ips + ',' + item.mIp;
        });
        ips = ips.substr(1, ips.length);
        return ips;
      }
    }),

    showData: _ember['default'].computed('endShowItem', 'beginShowItem', 'loadComputer', 'searchWordInput', 'searchItem', {
      get: function get() {
        if (this.get('searchWordInput') != '') {
          return this.get('searchItem').slice(this.get('beginShowItem'), this.get('endShowItem'));
        } else {
          return this.get('loadComputer').slice(this.get('beginShowItem'), this.get('endShowItem'));
        }
      }
    }),
    editComputers: _ember['default'].computed('searchItem', {
      get: function get() {
        var searchItem = this.get('searchItem');
        var computers = {};
        var times = {};
        searchItem.forEach(function (item) {
          computers = item;
        });
        times['endTime'] = computers['endTime'];
        times['startTime'] = computers['startTime'];
        return times;
      }
    }),

    paginationLeftClass: _ember['default'].computed('currentPage', {
      get: function get() {
        if (this.get("currentPage") > 0) {
          return "paginate_previous";
        }
        return "paginate_disabled_previous";
      }
    }),

    actions: {
      refreshPageSize: function refreshPageSize() {
        this.set('pageSizeValue', $('#list-status').val());
      },
      pageDown: function pageDown() {
        if (this.get('currentPage') > 0) {
          var page = this.get('currentPage') - 1;
          this.set('currentPage', page);
        }
      },
      editActionComputers: function editActionComputers() {
        _ember['default'].$('#editComputersForm').modal('show');
      },
      doComputersEdit: function doComputersEdit() {
        var self = this;
        var data = this.get('returnComputerIps');
        var editComputers = this.get('editComputers');
        editComputers['ips'] = data;

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'edit.computers.api',
          type: 'post',
          data: editComputers
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#editComputersForm').modal('hide');
          } else {
            self.set('errorInfo', '归还失败，服务器异常');
          }
        });
      },

      returnComputers: function returnComputers() {
        _ember['default'].$('#returnComputers').modal('show');
      },
      doReturnComputers: function doReturnComputers() {
        var self = this;
        var data = this.get('returnComputerIps');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'return.computers.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#returnComputers').modal('hide');
          } else {
            self.set('errorInfo', '归还失败，服务器异常');
          }
        });
      },
      searchedItemFromWord: function searchedItemFromWord() {
        var searchResult = [];
        var loadComputer = this.get('loadComputer');
        var searchWord = this.get('searchWordInput').toString().toLowerCase();
        this.set('currentPage', 0);
        loadComputer.forEach(function (computer) {
          if (computer['disk'].toString().toLowerCase().indexOf(searchWord) >= 0 || computer['userName'].toString().toLowerCase().indexOf(searchWord) >= 0 || computer['userEmail'].toString().toLowerCase().indexOf(searchWord) >= 0 || computer['useDetail'].toString().toLowerCase().indexOf(searchWord) >= 0 || computer['cpu'].toString().toLowerCase().indexOf(searchWord) >= 0 || computer['ip'].toString().toLowerCase().indexOf(searchWord) >= 0 || computer['mIp'].toString().toLowerCase().indexOf(searchWord) >= 0 || computer['cpu'].toString().toLowerCase().indexOf(searchWord) >= 0 || computer['memory'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            searchResult.pushObject(computer);
          }
        });
        this.set('searchItem', searchResult);
      },

      pageUp: function pageUp() {
        var page = this.get('currentPage') + 1;
        if (page * this.get('pageSizeValue') < this.get('loadDataLength')) {
          this.set('currentPage', page);
        }
      },
      sharedChanged: function sharedChanged(value, event) {
        this.set('editComputer.isShared', value);
      },
      safeChanged: function safeChanged(value, event) {
        this.set('editComputer.isSafe', value);
      },
      areaChanged: function areaChanged(value, event) {
        this.set('editComputer.area', value);
      },
      typeChanged: function typeChanged(value, event) {
        this.set('editComputer.computerType', value);
      },

      loadStep: function loadStep() {
        this.send('doLoadComputer');
      },

      submitComputerAdd: function submitComputerAdd() {
        var self = this;
        self.set('errorInfo', '');
        var data = {};
        data['os'] = this.get('os');
        data['ip'] = this.get('ip');
        data['mIp'] = this.get('mIp');
        data['cpu'] = this.get('cpu');
        data['memory'] = this.get('memory');
        data['disk'] = this.get('disk');
        data['startTime'] = this.get('startTime');
        data['endTime'] = this.get('endTime');
        data['userEmail'] = this.get('userEmail');
        data['useDetail'] = this.get('useDetail');
        data['computerType'] = $('#computerType').val();
        data['isShared'] = $('#isShared').val();
        data['isSafe'] = $('#isSafe').val();
        data['area'] = $('#area').val();

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'add.computer.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#addComputerForm').modal('hide');
          } else {
            self.set('errorInfo', '添加失败，添加机器异常！');
          }
        });
      },
      downLoadExcl: function downLoadExcl() {
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'export.computer.api',
          type: 'get'
        }).then(function (data) {
          alert(data);
        });
      },

      computerEdit: function computerEdit() {
        var self = this;
        self.set('errorInfo', '');
        var data = this.get('editComputer');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'edit.computer.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#editComputerForm').modal('hide');
          } else {
            self.set('errorInfo', '编辑失败，编辑结果异常');
          }
        });
      },

      doLoadComputer: function doLoadComputer() {
        var _this = this;

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.computer.api',
          type: 'get',
          data: {}
        }).then(function (data) {
          _this.set('loadComputer', data);
          _this.set('loadDataLength', data.length);
        });
      },

      submitExclData: function submitExclData() {
        var formData = new FormData($("#uploadComputerExcl")[0]);
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'upload.computer.excl',
          type: 'post',
          data: formData
        }).then(function (data) {
          console.log(data);
          _ember['default'].$('#addSomeComputersForm').modal('hide');
        });
      },

      computerDelete: function computerDelete() {
        var self = this;
        self.set('errorInfo', '');
        var data = {};
        data['computerId'] = this.get('deleteId');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'delete.computer.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data == 1) {
            _ember['default'].$('#deleteComputer').modal('hide');
          } else {
            self.set('errorInfo', '删除失败，删除异常');
          }
        });
      },

      computerReturn: function computerReturn() {
        var self = this;
        var data = {};
        data['computerId'] = this.get('returnId');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'return.computer.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data == 1) {
            _ember['default'].$('#returnComputer').modal('hide');
          } else {
            self.set('errorInfo', '归还异常，归还机器失败');
          }
        });
      },
      addComputerForm: function addComputerForm() {
        _ember['default'].$('#addComputerForm').modal('show');
      },
      addSomeComputersForm: function addSomeComputersForm() {
        _ember['default'].$('#addSomeComputersForm').modal('show');
      },

      deleteComputer: function deleteComputer(deleteId) {
        this.set('deleteId', deleteId);
        _ember['default'].$('#deleteComputer').modal('show');
      },

      returnComputer: function returnComputer(returnId) {
        this.set('returnId', returnId);
        _ember['default'].$('#returnComputer').modal('show');
      },

      editComputerForm: function editComputerForm(editComputer) {
        this.set('editComputer', editComputer);
        _ember['default'].$('#editComputerForm').modal('show');
      }

    }

  });
});
define('pmo-web/controllers/worktime-check', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Controller.extend({
    session: _ember['default'].inject.service('session'),
    loadUsers: [],
    searchWordInput: '',
    searchItem: [],
    pageSizeSelect: [10, 50, 100],
    pageSizeValue: 10,
    currentPage: 0,
    loadDataLength: 0,
    editUser: {},
    errorInfo: '',
    writeTime: '',

    beginShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', {
      get: function get() {
        return this.get('currentPage') * this.get('pageSizeValue');
      }
    }),
    writeTimeChange: _ember['default'].observer('writeTime', function () {

      this.send('doLoadUsers');
    }),

    endShowItem: _ember['default'].computed('currentPage', 'pageSizeValue', 'loadDataLength', {
      get: function get() {
        if ((this.get('currentPage') + 1) * this.get('pageSizeValue') > this.get('loadDataLength')) {
          return this.get('loadDataLength');
        }
        return (this.get('currentPage') + 1) * this.get('pageSizeValue');
      }
    }),
    showData: _ember['default'].computed('endShowItem', 'beginShowItem', 'loadUsers', 'searchWordInput', 'searchItem', {
      get: function get() {
        if (this.get('searchWordInput') != '') {
          return this.get('searchItem').slice(this.get('beginShowItem'), this.get('endShowItem'));
        } else {
          return this.get('loadUsers').slice(this.get('beginShowItem'), this.get('endShowItem'));
        }
      }
    }),

    paginationLeftClass: _ember['default'].computed('currentPage', {
      get: function get() {
        if (this.get("currentPage") > 0) {
          return "paginate_previous";
        }
        return "paginate_disabled_previous";
      }
    }),

    actions: {
      refreshPageSize: function refreshPageSize() {
        this.set('pageSizeValue', $('#list-status').val());
      },
      loadStep: function loadStep() {

        this.send('doLoadUsers');
      },
      pageDown: function pageDown() {
        if (this.get('currentPage') > 0) {
          var page = this.get('currentPage') - 1;
          this.set('currentPage', page);
        }
      },
      searchedItemFromWord: function searchedItemFromWord() {
        var searchResult = [];
        var loadUsers = this.get('loadUsers');
        var searchWord = this.get('searchWordInput').toString().toLowerCase();
        this.set('currentPage', 0);
        loadUsers.forEach(function (user) {
          if (user['userName'].toString().toLowerCase().indexOf(searchWord) >= 0 || user['userEmail'].toString().toLowerCase().indexOf(searchWord) >= 0 || user['userTeam'].toString().toLowerCase().indexOf(searchWord) >= 0) {
            searchResult.pushObject(user);
          }
        });
        this.set('searchItem', searchResult);
      },

      pageUp: function pageUp() {
        var page = this.get('currentPage') + 1;
        if (page * this.get('pageSizeValue') < this.get('loadDataLength')) {
          this.set('currentPage', page);
        }
      },
      doLoadUsers: function doLoadUsers() {
        var _this = this;

        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'get.getAllUserInfo.api',
          type: 'get',
          data: {}
        }).then(function (data) {
          _this.set('loadUsers', data);
          _this.set('loadDataLength', data.length);
        });
      },

      editUserForm: function editUserForm(editUser) {
        this.set('editUser', editUser);
        _ember['default'].$('#editUserForm').modal('show');
      },

      typeChanged: function typeChanged(value, event) {
        this.set('editUser.userType', value);
      },

      userEdit: function userEdit() {
        var self = this;
        self.set('errorInfo', '');
        var data = this.get('editUser');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'edit.user.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data) {
            _ember['default'].$('#editUserForm').modal('hide');
          } else {
            self.set('errorInfo', '编辑失败，编辑结果异常');
          }
        });
      }

    }

  });
});
define('pmo-web/helpers/and', ['exports', 'ember', 'ember-truth-helpers/helpers/and'], function (exports, _ember, _emberTruthHelpersHelpersAnd) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersAnd.andHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersAnd.andHelper);
  }

  exports['default'] = forExport;
});
define('pmo-web/helpers/app-version', ['exports', 'ember', 'pmo-web/config/environment', 'ember-cli-app-version/utils/regexp'], function (exports, _ember, _pmoWebConfigEnvironment, _emberCliAppVersionUtilsRegexp) {
  exports.appVersion = appVersion;
  var version = _pmoWebConfigEnvironment['default'].APP.version;

  function appVersion(_) {
    var hash = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    if (hash.hideSha) {
      return version.match(_emberCliAppVersionUtilsRegexp.versionRegExp)[0];
    }

    if (hash.hideVersion) {
      return version.match(_emberCliAppVersionUtilsRegexp.shaRegExp)[0];
    }

    return version;
  }

  exports['default'] = _ember['default'].Helper.helper(appVersion);
});
define('pmo-web/helpers/cancel-all', ['exports', 'ember', 'ember-concurrency/-helpers'], function (exports, _ember, _emberConcurrencyHelpers) {
  exports.cancelHelper = cancelHelper;

  var CANCEL_REASON = "the 'cancel-all' template helper was invoked";

  function cancelHelper(args) {
    var cancelable = args[0];
    if (!cancelable || typeof cancelable.cancelAll !== 'function') {
      _ember['default'].assert('The first argument passed to the `cancel-all` helper should be a Task or TaskGroup (without quotes); you passed ' + cancelable, false);
    }

    return (0, _emberConcurrencyHelpers.taskHelperClosure)('cancelAll', [cancelable, CANCEL_REASON]);
  }

  exports['default'] = _ember['default'].Helper.helper(cancelHelper);
});
define('pmo-web/helpers/ember-power-select-is-group', ['exports', 'ember-power-select/helpers/ember-power-select-is-group'], function (exports, _emberPowerSelectHelpersEmberPowerSelectIsGroup) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectIsGroup['default'];
    }
  });
  Object.defineProperty(exports, 'emberPowerSelectIsGroup', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectIsGroup.emberPowerSelectIsGroup;
    }
  });
});
define('pmo-web/helpers/ember-power-select-is-selected', ['exports', 'ember-power-select/helpers/ember-power-select-is-selected'], function (exports, _emberPowerSelectHelpersEmberPowerSelectIsSelected) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectIsSelected['default'];
    }
  });
  Object.defineProperty(exports, 'emberPowerSelectIsSelected', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectIsSelected.emberPowerSelectIsSelected;
    }
  });
});
define('pmo-web/helpers/ember-power-select-true-string-if-present', ['exports', 'ember-power-select/helpers/ember-power-select-true-string-if-present'], function (exports, _emberPowerSelectHelpersEmberPowerSelectTrueStringIfPresent) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectTrueStringIfPresent['default'];
    }
  });
  Object.defineProperty(exports, 'emberPowerSelectTrueStringIfPresent', {
    enumerable: true,
    get: function get() {
      return _emberPowerSelectHelpersEmberPowerSelectTrueStringIfPresent.emberPowerSelectTrueStringIfPresent;
    }
  });
});
define('pmo-web/helpers/eq', ['exports', 'ember', 'ember-truth-helpers/helpers/equal'], function (exports, _ember, _emberTruthHelpersHelpersEqual) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersEqual.equalHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersEqual.equalHelper);
  }

  exports['default'] = forExport;
});
define('pmo-web/helpers/formatted-date', ['exports', 'ember', 'pmo-web/utils/date-helpers'], function (exports, _ember, _pmoWebUtilsDateHelpers) {
  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  exports.formattedDate = formattedDate;

  function formattedDate(_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var date = _ref2[0];
    var format = _ref2[1];

    return (0, _pmoWebUtilsDateHelpers.formatDate)(date, format);
  }

  exports['default'] = _ember['default'].Helper.helper(formattedDate);
});
define('pmo-web/helpers/gt', ['exports', 'ember', 'ember-truth-helpers/helpers/gt'], function (exports, _ember, _emberTruthHelpersHelpersGt) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersGt.gtHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersGt.gtHelper);
  }

  exports['default'] = forExport;
});
define('pmo-web/helpers/gte', ['exports', 'ember', 'ember-truth-helpers/helpers/gte'], function (exports, _ember, _emberTruthHelpersHelpersGte) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersGte.gteHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersGte.gteHelper);
  }

  exports['default'] = forExport;
});
define('pmo-web/helpers/is-array', ['exports', 'ember', 'ember-truth-helpers/helpers/is-array'], function (exports, _ember, _emberTruthHelpersHelpersIsArray) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersIsArray.isArrayHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersIsArray.isArrayHelper);
  }

  exports['default'] = forExport;
});
define('pmo-web/helpers/is-equal', ['exports', 'ember-truth-helpers/helpers/is-equal'], function (exports, _emberTruthHelpersHelpersIsEqual) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberTruthHelpersHelpersIsEqual['default'];
    }
  });
  Object.defineProperty(exports, 'isEqual', {
    enumerable: true,
    get: function get() {
      return _emberTruthHelpersHelpersIsEqual.isEqual;
    }
  });
});
define('pmo-web/helpers/lt', ['exports', 'ember', 'ember-truth-helpers/helpers/lt'], function (exports, _ember, _emberTruthHelpersHelpersLt) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersLt.ltHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersLt.ltHelper);
  }

  exports['default'] = forExport;
});
define('pmo-web/helpers/lte', ['exports', 'ember', 'ember-truth-helpers/helpers/lte'], function (exports, _ember, _emberTruthHelpersHelpersLte) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersLte.lteHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersLte.lteHelper);
  }

  exports['default'] = forExport;
});
define('pmo-web/helpers/not-eq', ['exports', 'ember', 'ember-truth-helpers/helpers/not-equal'], function (exports, _ember, _emberTruthHelpersHelpersNotEqual) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersNotEqual.notEqualHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersNotEqual.notEqualHelper);
  }

  exports['default'] = forExport;
});
define('pmo-web/helpers/not', ['exports', 'ember', 'ember-truth-helpers/helpers/not'], function (exports, _ember, _emberTruthHelpersHelpersNot) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersNot.notHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersNot.notHelper);
  }

  exports['default'] = forExport;
});
define('pmo-web/helpers/or', ['exports', 'ember', 'ember-truth-helpers/helpers/or'], function (exports, _ember, _emberTruthHelpersHelpersOr) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersOr.orHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersOr.orHelper);
  }

  exports['default'] = forExport;
});
define('pmo-web/helpers/perform', ['exports', 'ember', 'ember-concurrency/-helpers'], function (exports, _ember, _emberConcurrencyHelpers) {
  exports.performHelper = performHelper;

  function performHelper(args, hash) {
    return (0, _emberConcurrencyHelpers.taskHelperClosure)('perform', args, hash);
  }

  exports['default'] = _ember['default'].Helper.helper(performHelper);
});
define('pmo-web/helpers/pluralize', ['exports', 'ember-inflector/lib/helpers/pluralize'], function (exports, _emberInflectorLibHelpersPluralize) {
  exports['default'] = _emberInflectorLibHelpersPluralize['default'];
});
define('pmo-web/helpers/singularize', ['exports', 'ember-inflector/lib/helpers/singularize'], function (exports, _emberInflectorLibHelpersSingularize) {
  exports['default'] = _emberInflectorLibHelpersSingularize['default'];
});
define('pmo-web/helpers/t', ['exports', 'ember-i18n/helper'], function (exports, _emberI18nHelper) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nHelper['default'];
    }
  });
});
define('pmo-web/helpers/task', ['exports', 'ember'], function (exports, _ember) {
  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

  function taskHelper(_ref) {
    var _ref2 = _toArray(_ref);

    var task = _ref2[0];

    var args = _ref2.slice(1);

    return task._curry.apply(task, _toConsumableArray(args));
  }

  exports['default'] = _ember['default'].Helper.helper(taskHelper);
});
define('pmo-web/helpers/xor', ['exports', 'ember', 'ember-truth-helpers/helpers/xor'], function (exports, _ember, _emberTruthHelpersHelpersXor) {

  var forExport = null;

  if (_ember['default'].Helper) {
    forExport = _ember['default'].Helper.helper(_emberTruthHelpersHelpersXor.xorHelper);
  } else if (_ember['default'].HTMLBars.makeBoundHelper) {
    forExport = _ember['default'].HTMLBars.makeBoundHelper(_emberTruthHelpersHelpersXor.xorHelper);
  }

  exports['default'] = forExport;
});
define('pmo-web/initializers/app-version', ['exports', 'ember-cli-app-version/initializer-factory', 'pmo-web/config/environment'], function (exports, _emberCliAppVersionInitializerFactory, _pmoWebConfigEnvironment) {
  var _config$APP = _pmoWebConfigEnvironment['default'].APP;
  var name = _config$APP.name;
  var version = _config$APP.version;
  exports['default'] = {
    name: 'App Version',
    initialize: (0, _emberCliAppVersionInitializerFactory['default'])(name, version)
  };
});
define('pmo-web/initializers/container-debug-adapter', ['exports', 'ember-resolver/container-debug-adapter'], function (exports, _emberResolverContainerDebugAdapter) {
  exports['default'] = {
    name: 'container-debug-adapter',

    initialize: function initialize() {
      var app = arguments[1] || arguments[0];

      app.register('container-debug-adapter:main', _emberResolverContainerDebugAdapter['default']);
      app.inject('container-debug-adapter:main', 'namespace', 'application:main');
    }
  };
});
define('pmo-web/initializers/data-adapter', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `data-adapter` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'data-adapter',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('pmo-web/initializers/ember-concurrency', ['exports', 'ember-concurrency'], function (exports, _emberConcurrency) {
  exports['default'] = {
    name: 'ember-concurrency',
    initialize: function initialize() {}
  };
});
// This initializer exists only to make sure that the following
// imports happen before the app boots.
define('pmo-web/initializers/ember-data', ['exports', 'ember-data/setup-container', 'ember-data/-private/core'], function (exports, _emberDataSetupContainer, _emberDataPrivateCore) {

  /*
  
    This code initializes Ember-Data onto an Ember application.
  
    If an Ember.js developer defines a subclass of DS.Store on their application,
    as `App.StoreService` (or via a module system that resolves to `service:store`)
    this code will automatically instantiate it and make it available on the
    router.
  
    Additionally, after an application's controllers have been injected, they will
    each have the store made available to them.
  
    For example, imagine an Ember.js application with the following classes:
  
    App.StoreService = DS.Store.extend({
      adapter: 'custom'
    });
  
    App.PostsController = Ember.Controller.extend({
      // ...
    });
  
    When the application is initialized, `App.ApplicationStore` will automatically be
    instantiated, and the instance of `App.PostsController` will have its `store`
    property set to that instance.
  
    Note that this code will only be run if the `ember-application` package is
    loaded. If Ember Data is being used in an environment other than a
    typical application (e.g., node.js where only `ember-runtime` is available),
    this code will be ignored.
  */

  exports['default'] = {
    name: 'ember-data',
    initialize: _emberDataSetupContainer['default']
  };
});
define('pmo-web/initializers/ember-i18n', ['exports', 'ember-i18n/initializers/ember-i18n'], function (exports, _emberI18nInitializersEmberI18n) {
  exports['default'] = _emberI18nInitializersEmberI18n['default'];
});
define('pmo-web/initializers/ember-simple-auth', ['exports', 'pmo-web/config/environment', 'ember-simple-auth/configuration', 'ember-simple-auth/initializers/setup-session', 'ember-simple-auth/initializers/setup-session-service'], function (exports, _pmoWebConfigEnvironment, _emberSimpleAuthConfiguration, _emberSimpleAuthInitializersSetupSession, _emberSimpleAuthInitializersSetupSessionService) {
  exports['default'] = {
    name: 'ember-simple-auth',

    initialize: function initialize(registry) {
      var config = _pmoWebConfigEnvironment['default']['ember-simple-auth'] || {};
      config.baseURL = _pmoWebConfigEnvironment['default'].rootURL || _pmoWebConfigEnvironment['default'].baseURL;
      _emberSimpleAuthConfiguration['default'].load(config);

      (0, _emberSimpleAuthInitializersSetupSession['default'])(registry);
      (0, _emberSimpleAuthInitializersSetupSessionService['default'])(registry);
    }
  };
});
define('pmo-web/initializers/export-application-global', ['exports', 'ember', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebConfigEnvironment) {
  exports.initialize = initialize;

  function initialize() {
    var application = arguments[1] || arguments[0];
    if (_pmoWebConfigEnvironment['default'].exportApplicationGlobal !== false) {
      var theGlobal;
      if (typeof window !== 'undefined') {
        theGlobal = window;
      } else if (typeof global !== 'undefined') {
        theGlobal = global;
      } else if (typeof self !== 'undefined') {
        theGlobal = self;
      } else {
        // no reasonable global, just bail
        return;
      }

      var value = _pmoWebConfigEnvironment['default'].exportApplicationGlobal;
      var globalName;

      if (typeof value === 'string') {
        globalName = value;
      } else {
        globalName = _ember['default'].String.classify(_pmoWebConfigEnvironment['default'].modulePrefix);
      }

      if (!theGlobal[globalName]) {
        theGlobal[globalName] = application;

        application.reopen({
          willDestroy: function willDestroy() {
            this._super.apply(this, arguments);
            delete theGlobal[globalName];
          }
        });
      }
    }
  }

  exports['default'] = {
    name: 'export-application-global',

    initialize: initialize
  };
});
define('pmo-web/initializers/injectStore', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `injectStore` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'injectStore',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('pmo-web/initializers/store', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `store` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'store',
    after: 'ember-data',
    initialize: function initialize() {}
  };
});
define('pmo-web/initializers/transforms', ['exports', 'ember'], function (exports, _ember) {

  /*
    This initializer is here to keep backwards compatibility with code depending
    on the `transforms` initializer (before Ember Data was an addon).
  
    Should be removed for Ember Data 3.x
  */

  exports['default'] = {
    name: 'transforms',
    before: 'store',
    initialize: function initialize() {}
  };
});
define('pmo-web/initializers/truth-helpers', ['exports', 'ember', 'ember-truth-helpers/utils/register-helper', 'ember-truth-helpers/helpers/and', 'ember-truth-helpers/helpers/or', 'ember-truth-helpers/helpers/equal', 'ember-truth-helpers/helpers/not', 'ember-truth-helpers/helpers/is-array', 'ember-truth-helpers/helpers/not-equal', 'ember-truth-helpers/helpers/gt', 'ember-truth-helpers/helpers/gte', 'ember-truth-helpers/helpers/lt', 'ember-truth-helpers/helpers/lte'], function (exports, _ember, _emberTruthHelpersUtilsRegisterHelper, _emberTruthHelpersHelpersAnd, _emberTruthHelpersHelpersOr, _emberTruthHelpersHelpersEqual, _emberTruthHelpersHelpersNot, _emberTruthHelpersHelpersIsArray, _emberTruthHelpersHelpersNotEqual, _emberTruthHelpersHelpersGt, _emberTruthHelpersHelpersGte, _emberTruthHelpersHelpersLt, _emberTruthHelpersHelpersLte) {
  exports.initialize = initialize;

  function initialize() /* container, application */{

    // Do not register helpers from Ember 1.13 onwards, starting from 1.13 they
    // will be auto-discovered.
    if (_ember['default'].Helper) {
      return;
    }

    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('and', _emberTruthHelpersHelpersAnd.andHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('or', _emberTruthHelpersHelpersOr.orHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('eq', _emberTruthHelpersHelpersEqual.equalHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('not', _emberTruthHelpersHelpersNot.notHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('is-array', _emberTruthHelpersHelpersIsArray.isArrayHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('not-eq', _emberTruthHelpersHelpersNotEqual.notEqualHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('gt', _emberTruthHelpersHelpersGt.gtHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('gte', _emberTruthHelpersHelpersGte.gteHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('lt', _emberTruthHelpersHelpersLt.ltHelper);
    (0, _emberTruthHelpersUtilsRegisterHelper.registerHelper)('lte', _emberTruthHelpersHelpersLte.lteHelper);
  }

  exports['default'] = {
    name: 'truth-helpers',
    initialize: initialize
  };
});
define("pmo-web/instance-initializers/ember-data", ["exports", "ember-data/-private/instance-initializers/initialize-store-service"], function (exports, _emberDataPrivateInstanceInitializersInitializeStoreService) {
  exports["default"] = {
    name: "ember-data",
    initialize: _emberDataPrivateInstanceInitializersInitializeStoreService["default"]
  };
});
define('pmo-web/instance-initializers/ember-i18n', ['exports', 'ember-i18n/instance-initializers/ember-i18n'], function (exports, _emberI18nInstanceInitializersEmberI18n) {
  exports['default'] = _emberI18nInstanceInitializersEmberI18n['default'];
});
define('pmo-web/instance-initializers/ember-simple-auth', ['exports', 'ember-simple-auth/instance-initializers/setup-session-restoration'], function (exports, _emberSimpleAuthInstanceInitializersSetupSessionRestoration) {
  exports['default'] = {
    name: 'ember-simple-auth',

    initialize: function initialize(instance) {
      (0, _emberSimpleAuthInstanceInitializersSetupSessionRestoration['default'])(instance);
    }
  };
});
define("pmo-web/locales/zh/config", ["exports"], function (exports) {
  // Ember-I18n includes configuration for common locales. Most users
  // can safely delete this file. Use it if you need to override behavior
  // for a locale or define behavior for a locale that Ember-I18n
  // doesn't know about.
  exports["default"] = {
    // rtl: [true|FALSE],
    //
    // pluralForm: function(count) {
    //   if (count === 0) { return 'zero'; }
    //   if (count === 1) { return 'one'; }
    //   if (count === 2) { return 'two'; }
    //   if (count < 5) { return 'few'; }
    //   if (count >= 5) { return 'many'; }
    //   return 'other';
    // }
  };
});
define('pmo-web/locales/zh/translations', ['exports'], function (exports) {
    exports['default'] = {
        'common.back': '返回',
        'common.check': '检测',
        'common.show': '显示',
        'check.summary': '综述',
        'common.complete': '完成',
        'common.sure': '确定',
        'common.submit': '提交',
        'common.close': '关闭',
        'common.ok': '正常',
        'common.ok.info': '-',
        'common.not.ok': '异常',
        'common.op.count': '个操作',
        'job.time.format.error': '提交失败，每天工时最长为24小时，请修改后重新提交！',
        'job.detail.is.null': '提交失败，工作内容为必填，请添加工作内容后重新提交！',
        'job.week.time.format.error': '提交失败,按周填报时，需满足每天工作平均不小于8小时，请修改后提交!',
        'dashbord.operate': '操作区域',
        'score.format.error': '提交分数不合法，请重新提交'
    };
});
define('pmo-web/resolver', ['exports', 'ember-resolver'], function (exports, _emberResolver) {
  exports['default'] = _emberResolver['default'];
});
define('pmo-web/router', ['exports', 'ember', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebConfigEnvironment) {

  var Router = _ember['default'].Router.extend({
    location: _pmoWebConfigEnvironment['default'].locationType,
    rootURL: _pmoWebConfigEnvironment['default'].rootURL
  });

  Router.map(function () {
    this.route('dashboard');
    this.route('projects');
    this.route('employer');
    this.route('used-machine');
    this.route('left-machine');
    this.route('dashbord-machine');
    this.route('login');
    this.route('operate-logs');
    this.route('puser-manage');
    this.route('pbug-eperate');
    this.route('complain');
    this.route('new-project');
    this.route('jobtime-write');
    this.route('person-info');
    this.route('job-time-weekday');
    this.route('worktime-check');
    this.route('employee-apply');
    this.route('used-employee');
    this.route('left-employee');
    this.route('employer-score');
    this.route('employee-dashboard');
  });

  exports['default'] = Router;
});
define('pmo-web/routes/application', ['exports', 'ember', 'ember-simple-auth/mixins/application-route-mixin', 'pmo-web/utils/http-helpers'], function (exports, _ember, _emberSimpleAuthMixinsApplicationRouteMixin, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Route.extend(_emberSimpleAuthMixinsApplicationRouteMixin['default'], {
    i18n: _ember['default'].inject.service(),
    session: _ember['default'].inject.service('session'),
    beforeModel: function beforeModel(transition) {
      var _this = this;

      this.get('i18n').set('defaultLocale', 'zh');
      this.get('i18n').set('locale', 'zh');
      var controller = this.controllerFor('login');
      var appController = this.controllerFor('application');

      var jobTimeController = this.controllerFor('jobtime-write');
      var jobtimeWeekday = this.controllerFor('job-time-weekday');

      var data = {};
      (0, _pmoWebUtilsHttpHelpers.request)({
        name: 'user.login.api',
        type: 'post',
        data: data
      }).then(function (data) {
        if (data) {
          _this.get('session').set('isAuthenticated', true);
          if (data.userType == 2) {
            _this.get('session').set('isSuper', true);
            _this.get('session').set('isAdmin', false);
            _this.get('session').set('isOrigin', false);
          } else if (data.userType == 3) {
            _this.get('session').set('isAdmin', true);
            _this.get('session').set('isOrigin', false);
            _this.get('session').set('isSuper', false);
          } else {
            _this.get('session').set('isOrigin', true);
            _this.get('session').set('isSuper', false);
            _this.get('session').set('isAdmin', false);
          }
          appController.set('userInfo', data);
          jobTimeController.set('userInfo', data);
          jobtimeWeekday.set('userInfo', data);
          _this.transitionTo('dashbord-machine');
        } else {
          _this.transitionTo('login');
        }
      });
    },

    actions: {
      invalidateSession: function invalidateSession() {
        var _this2 = this;

        var data = {};
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'user.logout.api',
          type: 'post',
          data: data
        }).then(function (data) {
          _this2.get('session').set('isAuthenticated', false);
          _this2.transitionTo('login');
        });
      }
    }

  });
});
define('pmo-web/routes/complain', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({

    afterModel: function afterModel(transition) {
      var controller = this.controllerFor('complain');
      controller.send('loadStep');
    }
  });
});
define('pmo-web/routes/dashboard', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('pmo-web/routes/dashbord-machine', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('dashbord-machine');
      controller.send('loadStep');
    }

  });
});
define('pmo-web/routes/employee-apply', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('pmo-web/routes/employee-dashboard', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('employee-dashboard');
      controller.send('loadStep');
    }

  });
});
define('pmo-web/routes/employer-score', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('employer-score');
      controller.set('employeeId', transition.queryParams.employeeId);
      controller.set('employeeName', transition.queryParams.employeeName);
      controller.send('loadStep');
    }
  });
});
define('pmo-web/routes/employer', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('pmo-web/routes/job-time-weekday', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('job-time-weekday');
      controller.send('loadStep');
    }
  });
});
define('pmo-web/routes/jobtime-write', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('jobtime-write');
      controller.send('loadStep');
    }
  });
});
define('pmo-web/routes/left-employee', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('pmo-web/routes/left-machine', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({

    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('left-machine');
      controller.send('loadStep');
    }

  });
});
define('pmo-web/routes/login', ['exports', 'ember', 'pmo-web/utils/http-helpers'], function (exports, _ember, _pmoWebUtilsHttpHelpers) {
  exports['default'] = _ember['default'].Route.extend({
    session: _ember['default'].inject.service('session'),
    email: '',
    password: '',
    actions: {
      authenticate: function authenticate() {
        var _this = this;

        var self = this;
        var controller = this.controllerFor('login');
        var appController = this.controllerFor('application');
        var jobtimeWriteController = this.controllerFor('jobtime-write');
        var jobtimeWeekdayController = this.controllerFor('job-time-weekday');
        var data = {};
        data['userEmail'] = controller.get('userEmail');
        data['userPassword'] = controller.get('userPassword');
        (0, _pmoWebUtilsHttpHelpers.request)({
          name: 'user.login.api',
          type: 'post',
          data: data
        }).then(function (data) {
          if (data.userEmail) {
            _this.get('session').set('isAuthenticated', true);
            if (data.userType == 2) {
              _this.get('session').set('isSuper', true);
              _this.get('session').set('isAdmin', false);
              _this.get('session').set('isOrigin', false);
              _this.get('session').set('isTeamLeader', false);
            } else if (data.userType == 3) {
              _this.get('session').set('isAdmin', true);
              _this.get('session').set('isOrigin', false);
              _this.get('session').set('isSuper', false);
              _this.get('session').set('isTeamLeader', false);
            } else if (data.userType == 4) {
              _this.get('session').set('isOrigin', false);
              _this.get('session').set('isSuper', false);
              _this.get('session').set('isAdmin', false);
              _this.get('session').set('isTeamLeader', true);
            } else {
              _this.get('session').set('isOrigin', true);
              _this.get('session').set('isSuper', false);
              _this.get('session').set('isAdmin', false);
              _this.get('session').set('isTeamLeader', false);
            }
            appController.set('userInfo', data);
            jobtimeWriteController.set('userInfo', data);
            jobtimeWeekdayController.set('userInfo', data);
            _this.transitionTo('dashbord-machine');
          } else {
            controller.set('errorInfo', '登录异常，请检查账号密码是否正确。');
          }
        });

        /*this.get('session').authenticate('authenticator:pmo-auth', user).catch((reason) => {
         var test = reason;
         self.set('errorMessage', reason.error || reason);
         });*/
      }
    }
  });
});
define('pmo-web/routes/new-project', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('new-project');
      controller.send('loadStep');
    }
  });
});
define('pmo-web/routes/operate-logs', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('operate-logs');
      controller.send('loadStep');
    }
  });
});
define('pmo-web/routes/pbug-eperate', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({});
});
define('pmo-web/routes/person-info', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('person-info');
      controller.send('loadStep');
    }
  });
});
define('pmo-web/routes/projects', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({

    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('projects');
      controller.send('loadStep');
    }
  });
});
define('pmo-web/routes/puser-manage', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({

    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('puser-manage');
      controller.send('loadStep');
    }
  });
});
define('pmo-web/routes/used-employee', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('used-employee');
      controller.send('loadStep');
    }
  });
});
define('pmo-web/routes/used-machine', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({

    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('used-machine');
      controller.send('loadStep');
    }

  });
});
define('pmo-web/routes/worktime-check', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = _ember['default'].Route.extend({
    beforeModel: function beforeModel(transition) {
      var controller = this.controllerFor('worktime-check');
      controller.send('loadStep');
    }
  });
});
define('pmo-web/services/ajax', ['exports', 'ember-ajax/services/ajax'], function (exports, _emberAjaxServicesAjax) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberAjaxServicesAjax['default'];
    }
  });
});
define('pmo-web/services/cookies', ['exports', 'ember-cookies/services/cookies'], function (exports, _emberCookiesServicesCookies) {
  exports['default'] = _emberCookiesServicesCookies['default'];
});
define('pmo-web/services/i18n', ['exports', 'ember-i18n/services/i18n'], function (exports, _emberI18nServicesI18n) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nServicesI18n['default'];
    }
  });
});
define('pmo-web/services/session', ['exports', 'ember-simple-auth/services/session'], function (exports, _emberSimpleAuthServicesSession) {
  exports['default'] = _emberSimpleAuthServicesSession['default'];
});
define('pmo-web/services/text-measurer', ['exports', 'ember-text-measurer/services/text-measurer'], function (exports, _emberTextMeasurerServicesTextMeasurer) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberTextMeasurerServicesTextMeasurer['default'];
    }
  });
});
define('pmo-web/services/validations', ['exports', 'ember'], function (exports, _ember) {

  var set = _ember['default'].set;

  exports['default'] = _ember['default'].Service.extend({
    init: function init() {
      set(this, 'cache', {});
    }
  });
});
define('pmo-web/session-store/application', ['exports', 'ember-simple-auth/session-stores/adaptive'], function (exports, _emberSimpleAuthSessionStoresAdaptive) {
  exports['default'] = _emberSimpleAuthSessionStoresAdaptive['default'].extend({
    localStorageKey: 'pmo-session',
    cookieDomain: 'pmo.cmss',
    cookieName: 'pmo-session'
  });
});
define('pmo-web/session-stores/application', ['exports', 'ember-simple-auth/session-stores/adaptive'], function (exports, _emberSimpleAuthSessionStoresAdaptive) {
  exports['default'] = _emberSimpleAuthSessionStoresAdaptive['default'].extend();
});
define("pmo-web/templates/application", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "FSMEPDVg", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAuthenticated\"]]],null,37,5],[\"text\",\"\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"userInfo\",\"errorInfo\",\"hEvent\"],[\"appEditUserForm\",[\"get\",[\"userInfo\"]],[\"get\",[\"errorInfo\"]],\"appUserEdit\"]],4]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"管理员用户\"]],\"locals\":[]},{\"statements\":[[\"text\",\"超级用户\"]],\"locals\":[]},{\"statements\":[[\"text\",\"普通用户\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],2],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],1],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"3\"]],0],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"修改用户密码\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户姓名：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"disabled\",\"value\",\"class\"],[\"disabled\",[\"get\",[\"userInfo\",\"userName\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户密码：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"type\",\"class\"],[[\"get\",[\"userInfo\",\"userPassword\"]],\"password\",\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户权限\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"disabled\"],[[\"get\",[\"userInfo\",\"userType\"]],\"disabled\"]],3],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户团队：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"disabled\",\"value\",\"class\"],[\"disabled\",[\"get\",[\"userInfo\",\"userTeam\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户公司邮箱：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"disabled\",\"value\",\"class\"],[\"disabled\",[\"get\",[\"userInfo\",\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container login-container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"content\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  用户管理\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  操作日志\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"operate-logs\"],null,7],[\"text\",\"              \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    我的项目\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"dropdown-toggle\"],[\"static-attr\",\"data-toggle\",\"dropdown\"],[\"static-attr\",\"role\",\"button\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"项目管理 \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"caret\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"person-info\"],null,9],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    我的项目\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"dropdown-toggle\"],[\"static-attr\",\"data-toggle\",\"dropdown\"],[\"static-attr\",\"role\",\"button\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"项目管理 \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"caret\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"person-info\"],null,11],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                   我的项目\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"           \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown\"],[\"flush-element\"],[\"text\",\"\\n             \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"dropdown-toggle\"],[\"static-attr\",\"data-toggle\",\"dropdown\"],[\"static-attr\",\"role\",\"button\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"项目管理 \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"caret\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n             \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"flush-element\"],[\"text\",\"\\n               \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"person-info\"],null,13],[\"text\",\"               \"],[\"close-element\"],[\"text\",\"\\n               \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n             \"],[\"close-element\"],[\"text\",\"\\n           \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    我的项目\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    投诉管理\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    报工项目列表\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    项目列表\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    缺陷管理\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"dropdown-toggle\"],[\"static-attr\",\"data-toggle\",\"dropdown\"],[\"static-attr\",\"role\",\"button\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"项目管理 \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"caret\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"pbug-eperate\"],null,19],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"projects\"],null,18],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"new-project\"],null,17],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"complain\"],null,16],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"person-info\"],null,15],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    部门工作记录检查\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"worktime-check\"],null,21],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    部门工作记录检查\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"worktime-check\"],null,23],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    部门工作记录检查\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"worktime-check\"],null,25],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  工作日志填报（按周）\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  工作日志填报（按天）\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                    外协概况\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  厂商考评\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  待嫁闺中\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  名花有主\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  外协申请\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  待嫁闺中\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  名花有主\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  资源概况\\n\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"pmo-container\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"nav\",[]],[\"static-attr\",\"class\",\"navbar navbar-default navbar-fixed-top navbar-inverse pmo-nav\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container content-container\"],[\"flush-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"navbar-header\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"navbar-toggle collapsed\"],[\"static-attr\",\"data-toggle\",\"collapse\"],[\"static-attr\",\"data-target\",\"#bs-example-navbar-collapse-1\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"sr-only\"],[\"flush-element\"],[\"text\",\"Toggle navigation\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"icon-bar\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"navbar-brand\"],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"text\",\"PMO项目管理系统\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"collapse navbar-collapse\"],[\"static-attr\",\"id\",\"bs-example-navbar-collapse-1\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"nav navbar-nav\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"dropdown-toggle\"],[\"static-attr\",\"data-toggle\",\"dropdown\"],[\"static-attr\",\"role\",\"button\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"物理机管理 \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"caret\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"dashbord-machine\"],null,36],[\"text\",\"              \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"used-machine\"],null,35],[\"text\",\"              \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"left-machine\"],null,34],[\"text\",\"              \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n\\n          \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"dropdown-toggle\"],[\"static-attr\",\"data-toggle\",\"dropdown\"],[\"static-attr\",\"role\",\"button\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"外协管理 \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"caret\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"employee-apply\"],null,33],[\"text\",\"              \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"used-employee\"],null,32],[\"text\",\"              \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"left-employee\"],null,31],[\"text\",\"              \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"employer-score\"],null,30],[\"text\",\"              \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"employee-dashboard\"],null,29],[\"text\",\"                \"],[\"close-element\"],[\"text\",\"\\n\\n\\n              \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n\\n          \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"dropdown-toggle\"],[\"static-attr\",\"data-toggle\",\"dropdown\"],[\"static-attr\",\"role\",\"button\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"工作日志 \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"caret\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"jobtime-write\"],null,28],[\"text\",\"              \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"job-time-weekday\"],null,27],[\"text\",\"              \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,26],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,24],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isTeamLeader\"]]],null,22],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,20],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,14],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isTeamLeader\"]]],null,12],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isOrigin\"]]],null,10],[\"text\",\"\\n\\n\\n          \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"dropdown-toggle\"],[\"static-attr\",\"data-toggle\",\"dropdown\"],[\"static-attr\",\"role\",\"button\"],[\"static-attr\",\"aria-expanded\",\"false\"],[\"flush-element\"],[\"text\",\"审计 \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"caret\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,8],[\"text\",\"              \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"link-to\"],[\"puser-manage\"],null,6],[\"text\",\"              \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\\n        \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"nav navbar-nav navbar-right\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"data-toggle\",\"modal\"],[\"static-attr\",\"data-target\",\"#signin-signup-tab\"],[\"static-attr\",\"id\",\"signup-button\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paddingR5\\tglyphicon glyphicon-user\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"data-toggle\",\"modal\"],[\"static-attr\",\"data-target\",\"#signin-signup-tab\"],[\"static-attr\",\"id\",\"signup-button\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paddingRl0\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"badge\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"userInfo\",\"userName\"]],false],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"data-toggle\",\"modal\"],[\"static-attr\",\"data-target\",\"#signin-signup-tab\"],[\"static-attr\",\"id\",\"signin-button\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"invalidateSession\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"badge badge-success\"],[\"flush-element\"],[\"text\",\"登出\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"data-toggle\",\"modal\"],[\"static-attr\",\"data-target\",\"#signin-signup-tab\"],[\"static-attr\",\"id\",\"signin-button\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"paddingRl0\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"appEditUserForm\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"badge success\"],[\"flush-element\"],[\"text\",\"改密\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container content-container\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"content\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n  \"],[\"open-element\",\"footer\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"container content-container\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"/licenses/NOTICE.txt\"],[\"static-attr\",\"target\",\"_blank\"],[\"flush-element\"],[\"text\",\"中移（苏州）软件技术有限公司\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/application.hbs" } });
});
define("pmo-web/templates/complain", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "pvpFpdeI", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"项目管理-投诉管理\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\",\"key-up\",\"class\"],[[\"get\",[\"searchWordInput\"]],\"请按项目名称，项目编号或者投诉人等信息模糊搜索\",\"searchedItemFromWord\",\"search-input form-control\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 img-height\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,26],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,25],[\"text\",\"  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目编号\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"项目名称\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"投诉人\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"投诉级别\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"投诉方式\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"投诉单位\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"被投诉人\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"处理状态\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"投诉时间\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"showData\"]]],null,24],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-bar\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"filtered-info span4\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"当前为第\"],[\"append\",[\"unknown\",[\"currentPage\"]],false],[\"text\",\"页\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"selected-hosts-info span4\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"items-on-page\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.show\"],null],false],[\"text\",\":\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"list-status\"],[\"static-attr\",\"class\",\"form-control-2\"],[\"static-attr\",\"name\",\"pagesize\"],[\"dynamic-attr\",\"onchange\",[\"helper\",[\"action\"],[[\"get\",[null]],\"refreshPageSize\"],null],null],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"10\"],[\"flush-element\"],[\"text\",\"10\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"50\"],[\"flush-element\"],[\"text\",\"50\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"100\"],[\"flush-element\"],[\"text\",\"100\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"beginShowItem\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"endShowItem\"]],false],[\"text\",\" of \"],[\"append\",[\"unknown\",[\"loadDataLength\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"paging_two_button\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_previous\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageDown\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_next\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageUp\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"addComplainForm\",[\"get\",[\"errorInfo\"]],\"doAddComplainForm\"]],20],[\"text\",\"\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"editComplain\",\"errorInfo\",\"hEvent\"],[\"editComplainForm\",[\"get\",[\"editComplain\"]],[\"get\",[\"errorInfo\"]],\"doEditComplain\"]],10],[\"text\",\"\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"deleteComplainForm\",[\"get\",[\"errorInfo\"]],\"doComplainDelete\"]],0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"删除投诉\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"确定是否删除投诉？\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"投诉关闭\"]],\"locals\":[]},{\"statements\":[[\"text\",\"投诉回访中\"]],\"locals\":[]},{\"statements\":[[\"text\",\"投诉处理中\"]],\"locals\":[]},{\"statements\":[[\"text\",\"收到投诉\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],4],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],3],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"3\"]],2],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"4\"]],1],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"严重投诉\"]],\"locals\":[]},{\"statements\":[[\"text\",\"重要投诉\"]],\"locals\":[]},{\"statements\":[[\"text\",\"一般投诉\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],8],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],7],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"3\"]],6],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"编辑投诉\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目编号：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComplain\",\"projectId\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目名称：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComplain\",\"projectName\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉人：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComplain\",\"complainant\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉级别：\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"editComplain\",\"complaintLevel\"]],\"levelChanged\"]],9],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉方式：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComplain\",\"complaintWay\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"被投诉人：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComplain\",\"respondent\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉单位：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComplain\",\"complaintCompany\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"处理状态：\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"editComplain\",\"status\"]],\"categoryChanged\"]],5],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉时间：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\",\"disabled\"],[[\"get\",[\"editComplain\",\"complainTime\"]],\"YYYY-MM-DD\",\"form-control\",true]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉证物：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\",\"disabled\"],[[\"get\",[\"editComplain\",\"urlPath\"]],\"form-control\",true]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉描述：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"editComplain\",\"complaintContent\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"投诉关闭\"]],\"locals\":[]},{\"statements\":[[\"text\",\"投诉回访中\"]],\"locals\":[]},{\"statements\":[[\"text\",\"投诉处理中\"]],\"locals\":[]},{\"statements\":[[\"text\",\"收到投诉\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],14],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],13],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"3\"]],12],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"4\"]],11],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"严重投诉\"]],\"locals\":[]},{\"statements\":[[\"text\",\"重要投诉\"]],\"locals\":[]},{\"statements\":[[\"text\",\"一般投诉\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],18],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],17],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"3\"]],16],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"添加项目\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目编号：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addComplain\",\"projectId\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目名称：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addComplain\",\"projectName\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉人：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addComplain\",\"complainant\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉级别：\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"addComplain\",\"complaintLevel\"]],\"levelChanged\"]],19],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉方式：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addComplain\",\"complaintWay\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"被投诉人：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addComplain\",\"respondent\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉单位：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addComplain\",\"complaintCompany\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"处理状态：\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"addComplain\",\"status\"]],\"categoryChanged\"]],15],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉时间：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"addComplain\",\"complainTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉证物：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"file-upload\"],null,[[\"url\",\"class\",\"urlPath\"],[\"?m=Complain&a=addComplainEvidence\",\"input-file\",[\"get\",[\"urlPath\"]]]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"投诉描述：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"addComplain\",\"complaintContent\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showEditComplainForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-trash\"],[\"static-attr\",\"title\",\"删除\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showFeleteComplainForm\",[\"get\",[\"treeValue\",\"id\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-download-alt\"],[\"dynamic-attr\",\"href\",[\"unknown\",[\"treeValue\",\"urlPath\"]],null],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectId\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectName\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"complainant\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"complain-level\"],null,[[\"type\"],[[\"get\",[\"treeValue\",\"complaintLevel\"]]]]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"complaintWay\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"complaintCompany\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"respondent\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"complain-status\"],null,[[\"type\"],[[\"get\",[\"treeValue\",\"status\"]]]]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"complainTime\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,23],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isOrigin\"]]],null,22],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,21],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-download-alt\"],[\"static-attr\",\"href\",\"index.php?m=Complain&a=exportComplain\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"添加投诉\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-plus\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showAddComplainForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-download-alt\"],[\"static-attr\",\"href\",\"index.php?m=Complain&a=exportComplain\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"添加投诉\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-plus\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showAddComplainForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/complain.hbs" } });
});
define("pmo-web/templates/components/-native-select", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "g1fzlvw8", "block": "{\"statements\":[[\"open-element\",\"select\",[]],[\"static-attr\",\"class\",\"native-select form-control\"],[\"dynamic-attr\",\"title\",[\"unknown\",[\"title\"]],null],[\"dynamic-attr\",\"multiple\",[\"unknown\",[\"multiple\"]],null],[\"modifier\",[\"action\"],[[\"get\",[null]],\"selectByValue\"],[[\"on\"],[\"change\"]]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"showNativePrompt\"]]],null,5],[\"block\",[\"if\"],[[\"get\",[\"nestedGroupContentList\",\"firstObject\",\"name\"]]],null,4,1],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"option\",[]],[\"dynamic-attr\",\"value\",[\"unknown\",[\"item\",\"value\"]],null],[\"dynamic-attr\",\"selected\",[\"unknown\",[\"item\",\"selected\"]],null],[\"flush-element\"],[\"append\",[\"unknown\",[\"item\",\"label\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"item\"]},{\"statements\":[[\"block\",[\"each\"],[[\"get\",[\"contentList\"]]],null,0]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"option\",[]],[\"dynamic-attr\",\"value\",[\"unknown\",[\"item\",\"value\"]],null],[\"dynamic-attr\",\"selected\",[\"unknown\",[\"item\",\"selected\"]],null],[\"flush-element\"],[\"append\",[\"unknown\",[\"item\",\"label\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"item\"]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"optgroup\",[]],[\"dynamic-attr\",\"label\",[\"unknown\",[\"group\",\"name\"]],null],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"group\",\"items\"]]],null,2],[\"text\",\"      \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"group\"]},{\"statements\":[[\"block\",[\"each\"],[[\"get\",[\"nestedGroupContentList\"]]],null,3]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"promptMessage\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/-native-select.hbs" } });
});
define("pmo-web/templates/components/apply-machine", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "8eXCfZyJ", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"height: 25rem;\"],[\"dynamic-attr\",\"id\",[\"unknown\",[\"_chartId\"]],null],[\"flush-element\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/apply-machine.hbs" } });
});
define("pmo-web/templates/components/button-status", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "UikhYenq", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isHealthy\"]]],null,4,3]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-report-warning\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"value\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isWarning\"]]],null,0]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-report-danger\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"value\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isUnhealthy\"]]],null,2,1]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-report-success\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"value\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/button-status.hbs" } });
});
define("pmo-web/templates/components/complain-level", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "D5tDAWg4", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isUsual\"]]],null,4,3]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\" 重大投诉\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isImportant\"]]],null,0]],\"locals\":[]},{\"statements\":[[\"text\",\"严重投诉\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isSerious\"]]],null,2,1]],\"locals\":[]},{\"statements\":[[\"text\",\"一般投诉\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/complain-level.hbs" } });
});
define("pmo-web/templates/components/complain-status", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "8fE9/PS2", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isGet\"]]],null,6,5]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  投诉关闭\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isClose\"]]],null,0]],\"locals\":[]},{\"statements\":[[\"text\",\"  客户回访中\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isFeedback\"]]],null,2,1]],\"locals\":[]},{\"statements\":[[\"text\",\"  投诉处理中\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isDeal\"]]],null,4,3]],\"locals\":[]},{\"statements\":[[\"text\",\" 受理投诉\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/complain-status.hbs" } });
});
define("pmo-web/templates/components/computer-type", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "bQPXYTwd", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isLong\"]]],null,2,1]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  临时持有\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isShort\"]]],null,0]],\"locals\":[]},{\"statements\":[[\"text\",\"  长期占用\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/computer-type.hbs" } });
});
define("pmo-web/templates/components/department-used-machine", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "0UvXJ8jH", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"height: 25rem;\"],[\"dynamic-attr\",\"id\",[\"unknown\",[\"_chartId\"]],null],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/department-used-machine.hbs" } });
});
define("pmo-web/templates/components/ember-select-dropdown", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Zlkjl6z/", "block": "{\"statements\":[[\"yield\",\"default\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/ember-select-dropdown.hbs" } });
});
define("pmo-web/templates/components/ember-select-guru", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "rQuZwJwo", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"ember-select-guru__container\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"ember-select-guru__trigger\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"expandComponent\"]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"hasValue\"]]],null,13,9],[\"text\",\"  \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isExpanded\"]]],null,8],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"          \"],[\"append\",[\"helper\",[\"component\"],[[\"get\",[\"noOptionsComponent\"]]],null],false],[\"text\",\"\\n        \"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"append\",[\"helper\",[\"component\"],[[\"get\",[\"optionComponent\"]]],[[\"option\",\"onClick\",\"currentHighlight\",\"index\"],[[\"get\",[\"option\"]],[\"helper\",[\"action\"],[[\"get\",[null]],\"onOptionClick\"],null],[\"get\",[\"currentHighlight\"]],[\"get\",[\"index\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[\"option\",\"index\"]},{\"statements\":[[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"_options\"]]],null,1]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"hasOptions\"]]],null,2,0]],\"locals\":[]},{\"statements\":[[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"component\"],[[\"get\",[\"failureComponent\"]]],null],false],[\"text\",\"\\n        \"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"block\",[\"if\"],[[\"get\",[\"hasFailed\"]]],null,4,3]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"append\",[\"helper\",[\"component\"],[[\"get\",[\"pendingComponent\"]]],null],false],[\"text\",\"\\n        \"]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"ember-select-guru__search-wrapper\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"placeholder\",\"value\",\"class\"],[[\"get\",[\"searchPlaceholder\"]],[\"get\",[\"queryTerm\"]],\"ember-select-guru__search\"]]],false],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"options-wrapper\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"isPending\"]]],null,6,5],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"optionsList\"]},{\"statements\":[[\"block\",[\"ember-select-dropdown\"],null,[[\"name\",\"visible\",\"willHideDropdown\"],[[\"get\",[\"name\"]],[\"get\",[\"isExpanded\"]],\"willHideDropdown\"]],7]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"append\",[\"unknown\",[\"placeholder\"]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"append\",[\"helper\",[\"component\"],[[\"get\",[\"singleValueComponent\"]]],[[\"value\"],[[\"get\",[\"value\"]]]]],false],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"append\",[\"helper\",[\"component\"],[[\"get\",[\"multiValueComponent\"]]],[[\"value\",\"onRemoveClick\"],[[\"get\",[\"selectedValue\"]],\"onRemoveValueClick\"]]],false],[\"text\",\"\\n\"]],\"locals\":[\"selectedValue\"]},{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"multi-value__selected\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"value\"]]],null,11],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"multiple\"]]],null,12,10]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/ember-select-guru.hbs" } });
});
define("pmo-web/templates/components/failure-component", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "N9szV3OT", "block": "{\"statements\":[[\"text\",\"Sorry, something went wrong...\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/failure-component.hbs" } });
});
define("pmo-web/templates/components/file-upload", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "/mdEOZNN", "block": "{\"statements\":[[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"urlPath\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/file-upload.hbs" } });
});
define("pmo-web/templates/components/file-uploader", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Al6PyNX1", "block": "{\"statements\":[[\"open-element\",\"input\",[]],[\"static-attr\",\"id\",\"file\"],[\"static-attr\",\"type\",\"file\"],[\"static-attr\",\"name\",\"file\"],[\"flush-element\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/file-uploader.hbs" } });
});
define("pmo-web/templates/components/jobtime-bar", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "tdnvH7cG", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isHealthy\"]]],null,4,3]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-job-time btn-report-warning\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"process\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isWarning\"]]],null,0]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-job-time btn-report-danger\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"process\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isUnhealthy\"]]],null,2,1]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-job-time btn-report-success\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"process\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/jobtime-bar.hbs" } });
});
define("pmo-web/templates/components/list-picker", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "AMtcaUC+", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"nativeMobile\"]]],null,7],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"bs-select \",[\"helper\",[\"if\"],[[\"get\",[\"nativeMobile\"]],\"hidden-xs\"],null],\" \",[\"helper\",[\"if\"],[[\"get\",[\"disabled\"]],\"disabled\"],null]]]],[\"flush-element\"],[\"text\",\"\\n  \"],[\"yield\",\"default\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"liveSearch\"]]],null,6],[\"block\",[\"if\"],[[\"get\",[\"multiple\"]]],null,5],[\"block\",[\"each\"],[[\"get\",[\"nestedGroupContentList\"]]],null,2],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"role\",\"presentation\"],[\"dynamic-attr\",\"class\",[\"concat\",[\"btn btn-default \",[\"helper\",[\"if\"],[[\"get\",[\"item\",\"selected\"]],\"active\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"selectItem\",[\"get\",[\"item\"]]]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"append\",[\"unknown\",[\"item\",\"label\"]],false],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"glyphicon glyphicon-ok check-mark \",[\"helper\",[\"unless\"],[[\"get\",[\"item\",\"selected\"]],\"invisible\"],null]]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"item\"]},{\"statements\":[[\"open-element\",\"h4\",[]],[\"static-attr\",\"role\",\"presentation\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"group\",\"name\"]],false],[\"close-element\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"block\",[\"if\"],[[\"get\",[\"group\",\"name\"]]],null,1],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"role\",\"group\"],[\"static-attr\",\"class\",\"btn-group-vertical btn-block list-picker-items-container\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"group\",\"items\"]]],null,0],[\"text\",\"    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"group\"]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"role\",\"group\"],[\"static-attr\",\"class\",\"btn-group-vertical btn-block\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleSelectAllNone\"]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"append\",[\"unknown\",[\"selectAllNoneLabel\"]],false],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"check-mark glyphicon \",[\"unknown\",[\"glyphiconClass\"]]]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"btn-group select-all-none\"],[\"static-attr\",\"role\",\"group\"],[\"static-attr\",\"aria-label\",\"Select all or none\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"selectAllNone\",\"unselectedContentList\"]],[\"flush-element\"],[\"append\",[\"unknown\",[\"selectAllLabel\"]],false],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"selectAllNone\",\"selectedContentList\"]],[\"flush-element\"],[\"append\",[\"unknown\",[\"selectNoneLabel\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"splitAllNoneButtons\"]]],null,4,3]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"value\",\"focus\"],[\"text\",\"search-filter form-control\",[\"get\",[\"searchFilter\"]],\"preventClosing\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default list-picker-clear-filter\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"clearSearchDisabled\"]],null],[\"modifier\",[\"action\"],[[\"get\",[null]],\"clearFilter\"]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-remove\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"visible-xs-inline\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"yield\",\"default\"],[\"text\",\"\\n    \"],[\"partial\",\"components/native-select\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":true}", "meta": { "moduleName": "pmo-web/templates/components/list-picker.hbs" } });
});
define("pmo-web/templates/components/multi-value-component", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "QxswI1Gz", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"value\",\"name\"]],false],[\"text\",\" \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"multi-value__remove\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"onRemoveClick\"]],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/multi-value-component.hbs" } });
});
define("pmo-web/templates/components/no-options-component", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "WY+GWFMm", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"ember-select-guru__option\"],[\"flush-element\"],[\"text\",\"No options.\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/no-options-component.hbs" } });
});
define("pmo-web/templates/components/one-employee-attendance", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "ktWenXJM", "block": "{\"statements\":[[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"month\"]],false],[\"append\",[\"unknown\",[\"employeeName\"]],false],[\"text\",\"总计工作\"],[\"append\",[\"unknown\",[\"realWorkDayCount\"]],false],[\"text\",\"天，平均每天工作\"],[\"append\",[\"unknown\",[\"averageWorkTime\"]],false],[\"text\",\"小时,出勤率为\"],[\"append\",[\"unknown\",[\"attendanceRate\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/one-employee-attendance.hbs" } });
});
define("pmo-web/templates/components/option-component", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "FXw8Yjjs", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"option\",\"name\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/option-component.hbs" } });
});
define("pmo-web/templates/components/pending-component", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "60fF0js/", "block": "{\"statements\":[[\"text\",\"Fetching data...\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/pending-component.hbs" } });
});
define("pmo-web/templates/components/person-monthtime-bar", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "RxkBGMfs", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isHealthy\"]]],null,4,3]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-job-time btn-report-warning\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"process\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isWarning\"]]],null,0]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-job-time btn-report-danger\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"process\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isUnhealthy\"]]],null,2,1]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-job-time btn-report-success\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"process\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/person-monthtime-bar.hbs" } });
});
define("pmo-web/templates/components/pmo-modal", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "AzO0Qvn1", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"id\",[\"concat\",[[\"unknown\",[\"modalId\"]]]]],[\"static-attr\",\"class\",\"modal fade\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-dialog health-modal-dialog\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-content\"],[\"flush-element\"],[\"text\",\"\\n           \"],[\"yield\",\"default\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12 error-info\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"error-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"errorInfo\"]],false],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"if\"],[[\"get\",[\"hEvent\"]]],null,0],[\"text\",\"        \"],[\"close-element\"],[\"comment\",\" /.modal-content \"],[\"text\",\"\\n    \"],[\"close-element\"],[\"comment\",\" /.modal-dialog \"],[\"text\",\"\\n\"],[\"close-element\"],[\"comment\",\" /.modal \"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-footer\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"sureAct\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.sure\"],null],false],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.close\"],null],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/pmo-modal.hbs" } });
});
define("pmo-web/templates/components/select-picker", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "62ZOqTSD", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"nativeMobile\"]]],null,8],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"bs-select dropdown \",[\"helper\",[\"if\"],[[\"get\",[\"isDropUp\"]],\"dropup\"],null],\" \",[\"helper\",[\"if\"],[[\"get\",[\"nativeMobile\"]],\"hidden-xs\"],null],\" \",[\"helper\",[\"if\"],[[\"get\",[\"disabled\"]],\"disabled\"],null],\" \",[\"helper\",[\"if\"],[[\"get\",[\"showDropdown\"]],\"open\"],null]]]],[\"static-attr\",\"tabindex\",\"0\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"dynamic-attr\",\"class\",[\"concat\",[\"btn dropdown-toggle \",[\"unknown\",[\"buttonClass\"]],\" \",[\"helper\",[\"if\"],[[\"get\",[\"disabled\"]],\"disabled\"],null]]]],[\"dynamic-attr\",\"id\",[\"unknown\",[\"menuButtonId\"]],null],[\"static-attr\",\"tabindex\",\"-1\"],[\"static-attr\",\"aria-expanded\",\"true\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showHide\"]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"pull-left\"],[\"static-attr\",\"tabindex\",\"-1\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"unknown\",[\"selectionSummary\"]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"dynamic-attr\",\"class\",[\"helper\",[\"if\"],[[\"get\",[\"selectionBadge\"]],\"badge\",\"caret\"],null],null],[\"static-attr\",\"tabindex\",\"-1\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"selectionBadge\"]],false],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"ul\",[]],[\"static-attr\",\"class\",\"dropdown-menu\"],[\"static-attr\",\"role\",\"menu\"],[\"dynamic-attr\",\"aria-labelledby\",[\"unknown\",[\"menuButtonId\"]],null],[\"static-attr\",\"tabindex\",\"-1\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"tabindex\",\"-1\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"yield\",\"default\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"liveSearch\"]]],null,7],[\"block\",[\"if\"],[[\"get\",[\"multiple\"]]],null,6],[\"block\",[\"each\"],[[\"get\",[\"nestedGroupContentList\"]]],null,3],[\"text\",\"  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[\"default\"],\"blocks\":[{\"statements\":[[\"text\",\"        \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"role\",\"presentation\"],[\"static-attr\",\"tabindex\",\"-1\"],[\"dynamic-attr\",\"class\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"disabled\"]],\"disabled\"],null],\" \",[\"helper\",[\"if\"],[[\"get\",[\"item\",\"active\"]],\"active\"],null],\" \",[\"helper\",[\"if\"],[[\"get\",[\"item\",\"selected\"]],\"selected\"],null]]]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"role\",\"menuitem\"],[\"dynamic-attr\",\"data-itemid\",[\"unknown\",[\"item\",\"itemId\"]],null],[\"dynamic-attr\",\"tabindex\",[\"concat\",[[\"helper\",[\"if\"],[[\"get\",[\"item\",\"active\"]],\"0\",\"-1\"],null]]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"selectItem\",[\"get\",[\"item\"]]]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"append\",[\"unknown\",[\"item\",\"label\"]],false],[\"text\",\"\\n            \"],[\"open-element\",\"span\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"glyphicon glyphicon-ok check-mark \",[\"helper\",[\"if\"],[[\"get\",[\"item\",\"selected\"]],\"\",\"hidden\"],null]]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"item\"]},{\"statements\":[[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"dropdown-header\"],[\"static-attr\",\"role\",\"presentation\"],[\"static-attr\",\"tabindex\",\"-1\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"group\",\"name\"]],false],[\"close-element\"]],\"locals\":[]},{\"statements\":[[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"divider\"],[\"static-attr\",\"role\",\"presentation\"],[\"static-attr\",\"tabindex\",\"-1\"],[\"flush-element\"],[\"close-element\"]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"block\",[\"unless\"],[[\"get\",[\"group\",\"items\",\"firstObject\",\"first\"]]],null,2],[\"text\",\"\\n      \"],[\"block\",[\"if\"],[[\"get\",[\"group\",\"name\"]]],null,1],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"group\",\"items\"]]],null,0]],\"locals\":[\"group\"]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default btn-xs btn-block\"],[\"static-attr\",\"tabindex\",\"-1\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"toggleSelectAllNone\"]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"append\",[\"unknown\",[\"selectAllNoneLabel\"]],false],[\"text\",\"\\n            \"],[\"open-element\",\"span\",[]],[\"dynamic-attr\",\"class\",[\"concat\",[\"check-mark glyphicon \",[\"unknown\",[\"glyphiconClass\"]]]]],[\"static-attr\",\"tabindex\",\"-1\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"btn-group select-all-none btn-block\"],[\"static-attr\",\"role\",\"group\"],[\"static-attr\",\"aria-label\",\"Select all or none\"],[\"static-attr\",\"tabindex\",\"-1\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"disabled\"]],null],[\"static-attr\",\"class\",\"btn btn-default btn-xs\"],[\"static-attr\",\"tabindex\",\"-1\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"selectAllNone\",\"unselectedContentList\"]],[\"flush-element\"],[\"text\",\"\\n              \"],[\"append\",[\"unknown\",[\"selectAllLabel\"]],false],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"dynamic-attr\",\"disabled\",[\"unknown\",[\"disabled\"]],null],[\"static-attr\",\"class\",\"btn btn-default btn-xs\"],[\"static-attr\",\"tabindex\",\"-1\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"selectAllNone\",\"selectedContentList\"]],[\"flush-element\"],[\"text\",\"\\n              \"],[\"append\",[\"unknown\",[\"selectNoneLabel\"]],false],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"tabindex\",\"-1\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"splitAllNoneButtons\"]]],null,5,4],[\"text\",\"      \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"tabindex\",\"-1\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"tabindex\",\"disabled\",\"class\",\"value\",\"focus\"],[\"text\",\"-1\",[\"get\",[\"disabled\"]],\"search-filter form-control\",[\"get\",[\"searchFilter\"]],\"preventClosing\"]]],false],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"visible-xs-inline\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"yield\",\"default\"],[\"text\",\"\\n    \"],[\"partial\",\"components/native-select\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":true}", "meta": { "moduleName": "pmo-web/templates/components/select-picker.hbs" } });
});
define("pmo-web/templates/components/single-value-component", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "oD71vOOq", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"value\",\"name\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/single-value-component.hbs" } });
});
define("pmo-web/templates/components/team-used-machine", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "6R10X4mz", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"style\",\"height: 25rem;\"],[\"dynamic-attr\",\"id\",[\"unknown\",[\"_chartId\"]],null],[\"flush-element\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/team-used-machine.hbs" } });
});
define("pmo-web/templates/components/user-type", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "/DGDw7jg", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isSuper\"]]],null,6,5]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-report-warning\"],[\"flush-element\"],[\"text\",\"组长\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isTeamLeader\"]]],null,0]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-report-warning\"],[\"flush-element\"],[\"text\",\"普通用户\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isOrigin\"]]],null,2,1]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-report-danger\"],[\"flush-element\"],[\"text\",\"管理员用户\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isAdmin\"]]],null,4,3]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-health-report btn-report-success\"],[\"flush-element\"],[\"text\",\"超级用户\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/user-type.hbs" } });
});
define("pmo-web/templates/components/work-type", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "EzDjM19o", "block": "{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isA\"]]],null,22,21]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  CICD\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isL\"]]],null,0]],\"locals\":[]},{\"statements\":[[\"text\",\"  其他\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isK\"]]],null,2,1]],\"locals\":[]},{\"statements\":[[\"text\",\"  售后服务支撑\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isJ\"]]],null,4,3]],\"locals\":[]},{\"statements\":[[\"text\",\"  售后服务\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isI\"]]],null,6,5]],\"locals\":[]},{\"statements\":[[\"text\",\"  实施、部署\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isH\"]]],null,8,7]],\"locals\":[]},{\"statements\":[[\"text\",\"  测试\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isG\"]]],null,10,9]],\"locals\":[]},{\"statements\":[[\"text\",\"  开发\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isF\"]]],null,12,11]],\"locals\":[]},{\"statements\":[[\"text\",\"  UIUE\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isE\"]]],null,14,13]],\"locals\":[]},{\"statements\":[[\"text\",\"  需求调研\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isD\"]]],null,16,15]],\"locals\":[]},{\"statements\":[[\"text\",\"  售前支撑\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isC\"]]],null,18,17]],\"locals\":[]},{\"statements\":[[\"text\",\"  售前\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"isB\"]]],null,20,19]],\"locals\":[]},{\"statements\":[[\"text\",\"  管理\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/components/work-type.hbs" } });
});
define('pmo-web/templates/components/x-select', ['exports', 'emberx-select/templates/components/x-select'], function (exports, _emberxSelectTemplatesComponentsXSelect) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberxSelectTemplatesComponentsXSelect['default'];
    }
  });
});
define("pmo-web/templates/dashboard", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "zPuSopbj", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"report\"],[\"static-attr\",\"id\",\"report-detail\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row back-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_previous\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"block\",[\"link-to\"],[\"reports\"],null,0],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row report-header pmo-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"text\",\"ffff\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"action-img\"],[\"dynamic-attr\",\"src\",[\"concat\",[\".\",[\"unknown\",[\"rootUrl\"]],\"imgs/icon_excel.png\"]]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"downLoadExcl\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"img\",[]],[\"static-attr\",\"class\",\"hide action-img\"],[\"dynamic-attr\",\"src\",[\"concat\",[\".\",[\"unknown\",[\"rootUrl\"]],\"imgs/icon_word.png\"]]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row report-info\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"check.type\"],null],false],[\"text\",\":\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"check.start.time\"],null],false],[\"text\",\":\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"check.end.time\"],null],false],[\"text\",\":\"],[\"close-element\"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"check.summary\"],null],false],[\"text\",\":\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"row\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12 report-error-info\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"block-span\"],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"check.common.status\"],null],false],[\"text\",\":\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"check.unhealthy.items\"],null],false],[\"text\",\":\"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"text\",\"teststt\"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"check.cluster.rate\"],null],false],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"row\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"dashboard-widget\"],[\"flush-element\"],[\"text\",\"\\n\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"dashboard-widget center-widget\"],[\"static-attr\",\"data\",\"mydata\"],[\"flush-element\"],[\"text\",\"\\n\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"dashboard-widget\"],[\"flush-element\"],[\"text\",\"\\n\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"open-element\",\"span\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.back\"],null],false],[\"close-element\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/dashboard.hbs" } });
});
define("pmo-web/templates/dashbord-machine", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "slpxUCMo", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"物理机管理-物理机占用概况\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"report\"],[\"static-attr\",\"id\",\"report-detail\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row report-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"span\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"formatted-date\"],[[\"get\",[\"currentTime\"]],\"YYYY-MM-DD HH:mm:ss\"],null],false],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,0],[\"text\",\"  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"check.summary\"],null],false],[\"text\",\":\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"row\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12 report-error-info\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"总物理机数:\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"warning-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"survey\",\"totalComputerCount\"]],false],[\"text\",\" \"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"剩余物理机总数:\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"warning-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"survey\",\"leftComputerCount\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"长期用机总数:\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"warning-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"survey\",\"longComputerCount\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"临时用机总数:\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"warning-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"survey\",\"tmpComputerCount\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"近月可回收机器数:\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"warning-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"survey\",\"backInMonthCount\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"物理机分布图\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"row\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12 dashboard-widget\"],[\"static-attr\",\"data\",\"mydata\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"unknown\",[\"team-used-machine\"]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"two-widget dashboard-widget\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"append\",[\"unknown\",[\"department-used-machine\"]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"two-widget dashboard-widget margin6\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"unknown\",[\"apply-machine\"]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"导出excl\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-download-alt\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"downLoadExcl\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/dashbord-machine.hbs" } });
});
define("pmo-web/templates/employee-apply", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "+TOqo+Vd", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/employee-apply.hbs" } });
});
define("pmo-web/templates/employee-dashboard", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "0K71K6Ab", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"employee-p\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"外协管理-外协概况\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"report\"],[\"static-attr\",\"id\",\"report-detail\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"dashbord.operate\"],null],false],[\"text\",\":\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row report-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"dsahboardTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"导入外协考勤\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-plus\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addAttendance\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"check.summary\"],null],false],[\"text\",\":\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"row\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12 report-error-info\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"总物理机数:\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"warning-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"survey\",\"totalComputerCount\"]],false],[\"text\",\" \"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"剩余物理机总数:\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"warning-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"survey\",\"leftComputerCount\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"长期用机总数:\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"warning-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"survey\",\"longComputerCount\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"临时用机总数:\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"warning-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"survey\",\"tmpComputerCount\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"近月可回收机器数:\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"warning-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"survey\",\"backInMonthCount\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h3\",[]],[\"flush-element\"],[\"text\",\"物理机分布图\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"row\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12 dashboard-widget\"],[\"static-attr\",\"data\",\"mydata\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"unknown\",[\"team-used-machine\"]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"two-widget dashboard-widget\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"unknown\",[\"department-used-machine\"]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"two-widget dashboard-widget margin6\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"unknown\",[\"apply-machine\"]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"addSomeAttendanceForm\",[\"get\",[\"errorInfo\"]],\"submitExclData\"]],0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"批量导入机器\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h5\",[]],[\"static-attr\",\"class\",\" warning-word col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"注意：导入的excl格式如下所示，且导入的是第一张sheet的内容。\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"日期\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"工号\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"姓名\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"开始时间\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"结束时间\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"2017/8/14\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"002\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"曹艳\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"08:57\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"18:21\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"append\",[\"helper\",[\"file-upload\"],null,[[\"url\",\"class\"],[\"?m=Employee&a=inportAtendance\",\"input-file\"]]],false],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/employee-dashboard.hbs" } });
});
define("pmo-web/templates/employer-score", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "mgrac92Z", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"外协管理-\"],[\"append\",[\"unknown\",[\"employeeName\"]],false],[\"text\",\"绩效打分\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"writeTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-zoom-in\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"getAttendTime\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-bordered table-hover table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1 week-th\"],[\"flush-element\"],[\"text\",\"星期一\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1 week-th\"],[\"flush-element\"],[\"text\",\"星期二\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1 week-th\"],[\"flush-element\"],[\"text\",\"星期三\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1 week-th\"],[\"flush-element\"],[\"text\",\"星期四\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1 week-th\"],[\"flush-element\"],[\"text\",\"星期五\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1 week-th\"],[\"flush-element\"],[\"text\",\"星期六\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1 week-th\"],[\"flush-element\"],[\"text\",\"星期天\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"weeks\"]]],null,4],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-offset-2 col-md-offset-2\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                  \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"no-bg\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                  \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"date\"]],false],[\"text\",\" \"],[\"append\",[\"helper\",[\"jobtime-bar\"],null,[[\"jobTime\"],[[\"get\",[\"treeValue\",\"workTime\"]]]]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"treeValue\",\"date\"]]],null,1,0]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"tr\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"writeTimeForm\",[\"get\",[\"tree\"]]]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"tree\"]]],null,2],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"tree\"]]],null,3]],\"locals\":[\"tree\"]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/employer-score.hbs" } });
});
define("pmo-web/templates/employer", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "tuEy00ox", "block": "{\"statements\":[],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/employer.hbs" } });
});
define("pmo-web/templates/job-time-weekday", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "ckOZTAvO", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"工作记录管理-工作记录自助填报\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"writeTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-zoom-in\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"writeJobTime\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-bordered table-hover table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 week-th\"],[\"flush-element\"],[\"text\",\"星期一\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 week-th\"],[\"flush-element\"],[\"text\",\"星期二\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 week-th\"],[\"flush-element\"],[\"text\",\"星期三\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 week-th\"],[\"flush-element\"],[\"text\",\"星期四\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 week-th\"],[\"flush-element\"],[\"text\",\"星期五\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"weeks\"]]],null,22],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-offset-2 col-md-offset-2\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"divbg\"],[\"static-attr\",\"class\",\"hide\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"addWorkTimeDiv\"],[\"static-attr\",\"class\",\"hide\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-dialog modal-dialog-add-workTime health-modal-dialog\"],[\"flush-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-content\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"closeWriteTimeForm\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"填写 \"],[\"append\",[\"unknown\",[\"editDate\"]],false],[\"text\",\" 工作记录\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"add-row\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title\"],[\"flush-element\"],[\"text\",\"添加工作记录:\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"div-2\"],[\"static-attr\",\"id\",\"ember-basic-dropdown-wormhole\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"addOneJobTime\",\"projectName\"]],\"chooseDestination\"]],17],[\"text\",\"          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"danger-word\"],[\"flush-element\"],[\"text\",\"*\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"div-15\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"workId\",\"action\"],[[\"get\",[\"addOneJobTime\",\"workType\"]],[\"get\",[\"treeValue\",\"id\"]],\"typeChanged\"]],14],[\"text\",\"          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"danger-word\"],[\"flush-element\"],[\"text\",\"*\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"div-1\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addOneJobTime\",\"workTime\"]],\"form-control job-time-input\"]]],false],[\"text\",\"\\n              \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"flush-element\"],[\"text\",\"h\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"danger-word\"],[\"flush-element\"],[\"text\",\"*\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"div-5\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil input-icon\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-control job-time-div\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showTextArea\"]],[\"flush-element\"],[\"text\",\"  \"],[\"append\",[\"unknown\",[\"addOneJobTime\",\"workDetail\"]],false],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"div-1\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-success\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"doAddOneJobTime\"]],[\"flush-element\"],[\"text\",\"add+\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title\"],[\"flush-element\"],[\"text\",\"本周总计\"],[\"append\",[\"unknown\",[\"workDay\"]],false],[\"text\",\"天，已添加工时\"],[\"append\",[\"unknown\",[\"addedWorkTime\"]],false],[\"text\",\"小时:\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-hover table-health-report\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-3 col-lg-3\"],[\"flush-element\"],[\"text\",\"参与项目名称\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"工作时长\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"工时类型\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-5 col-lg-5\"],[\"flush-element\"],[\"text\",\"工作内容\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-5 col-lg-5\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"writeWorkTime\"]]],null,1],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12 error-info\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"error-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"errorInfo\"]],false],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-footer\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"doWriteTimeForm\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.submit\"],null],false],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"closeWriteTimeForm\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.close\"],null],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"workDetailTextareaBg\"],[\"static-attr\",\"class\",\"hide\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"workDetailTextarea\"],[\"static-attr\",\"class\",\"hide\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-dialog modal-dialog-add-workTime health-modal-dialog\"],[\"flush-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-content\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"closeWorkDetailTextarea\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"填写 \"],[\"append\",[\"unknown\",[\"addOneJobTime\",\"projectName\"]],false],[\"text\",\" 工作记录\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"addOneJobTime\",\"workDetail\"]],\"form-control\",12]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-footer\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addWorkdetail\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.submit\"],null],false],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"closeWorkDetailTextarea\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.close\"],null],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"tr\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"setCurrentRe\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-3 col-lg-3 projectNameId slight-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectName\"]],false],[\"close-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"workTime\"]],false],[\"close-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"append\",[\"helper\",[\"work-type\"],null,[[\"type\"],[[\"get\",[\"treeValue\",\"workType\"]]]]],false],[\"close-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"over-hide-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"workDetail\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-trash\"],[\"static-attr\",\"title\",\"删除\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"deleteWorkRec\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"treeValue\",\"workTime\"]]],null,0]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"其他\"]],\"locals\":[]},{\"statements\":[[\"text\",\"CICD\"]],\"locals\":[]},{\"statements\":[[\"text\",\"售后服务支撑\"]],\"locals\":[]},{\"statements\":[[\"text\",\"售后服务\"]],\"locals\":[]},{\"statements\":[[\"text\",\"实施、部署\"]],\"locals\":[]},{\"statements\":[[\"text\",\"测试\"]],\"locals\":[]},{\"statements\":[[\"text\",\"开发\"]],\"locals\":[]},{\"statements\":[[\"text\",\"UIUE\"]],\"locals\":[]},{\"statements\":[[\"text\",\"需求调研\"]],\"locals\":[]},{\"statements\":[[\"text\",\"售前支撑\"]],\"locals\":[]},{\"statements\":[[\"text\",\"售前\"]],\"locals\":[]},{\"statements\":[[\"text\",\"管理\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],13],[\"text\",\"\\n              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],12],[\"text\",\"\\n              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"3\"]],11],[\"text\",\"\\n              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"4\"]],10],[\"text\",\"\\n              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"5\"]],9],[\"text\",\"\\n              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"6\"]],8],[\"text\",\"\\n              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"7\"]],7],[\"text\",\"\\n              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"8\"]],6],[\"text\",\"\\n              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"9\"]],5],[\"text\",\"\\n              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"10\"]],4],[\"text\",\"\\n              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"12\"]],3],[\"text\",\"\\n              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"11\"]],2],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"append\",[\"get\",[\"treeValue\"]],false]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[[\"get\",[\"treeValue\"]]]],15],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"block\",[\"each\"],[[\"get\",[\"participateProject\"]]],null,16]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"no-bg\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"date\"]],false],[\"text\",\" \"],[\"append\",[\"helper\",[\"jobtime-bar\"],null,[[\"jobTime\"],[[\"get\",[\"treeValue\",\"workTime\"]]]]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"treeValue\",\"date\"]]],null,19,18]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"writeTimeForm\",[\"get\",[\"tree\"]]]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"tree\"]]],null,20],[\"text\",\"          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"tree\"]]],null,21]],\"locals\":[\"tree\"]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/job-time-weekday.hbs" } });
});
define("pmo-web/templates/jobtime-write", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "NI8yLnx+", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"工作记录管理-工作记录自助填报\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"writeTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-zoom-in\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"writeJobTime\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n       \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6 col-lg-6\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"日期\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"星期\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"工时进度\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"loadWorkRecord0\"]]],null,19],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-offset-2 col-md-offset-2\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-6 col-lg-6\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"日期\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"星期\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"工时进度\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"loadWorkRecord1\"]]],null,18],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"divbg\"],[\"static-attr\",\"class\",\"hide\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"addWorkTimeDiv\"],[\"static-attr\",\"class\",\"hide\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-dialog modal-dialog-add-workTime health-modal-dialog\"],[\"flush-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-content\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"closeWriteTimeForm\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"填写 \"],[\"append\",[\"unknown\",[\"editDate\"]],false],[\"text\",\" 工作记录\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"add-row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title\"],[\"flush-element\"],[\"text\",\"添加工作记录:\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"div-2\"],[\"static-attr\",\"id\",\"ember-basic-dropdown-wormhole\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"addOneJobTime\",\"projectName\"]],\"chooseDestination\"]],17],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"danger-word\"],[\"flush-element\"],[\"text\",\"*\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"div-15\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"workId\",\"action\"],[[\"get\",[\"addOneJobTime\",\"workType\"]],[\"get\",[\"treeValue\",\"id\"]],\"typeChanged\"]],14],[\"text\",\"      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"danger-word\"],[\"flush-element\"],[\"text\",\"*\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"div-1\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addOneJobTime\",\"workTime\"]],\"form-control job-time-input\"]]],false],[\"text\",\"\\n          \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"flush-element\"],[\"text\",\"h\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"danger-word\"],[\"flush-element\"],[\"text\",\"*\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"div-5\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil input-icon\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-control job-time-div\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showTextArea\"]],[\"flush-element\"],[\"text\",\"  \"],[\"append\",[\"unknown\",[\"addOneJobTime\",\"workDetail\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"div-1\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-success\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"doAddOneJobTime\"]],[\"flush-element\"],[\"text\",\"add+\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"clear\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title\"],[\"flush-element\"],[\"text\",\"已添加工时:\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-hover table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-3 col-lg-3\"],[\"flush-element\"],[\"text\",\"参与项目名称\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"工作时长\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"工时类型\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-5 col-lg-5\"],[\"flush-element\"],[\"text\",\"工作内容\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-5 col-lg-5\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"writeWorkTime\"]]],null,1],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12 error-info\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"error-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"errorInfo\"]],false],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-footer\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"doWriteTimeForm\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.submit\"],null],false],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"closeWriteTimeForm\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.close\"],null],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"workDetailTextareaBg\"],[\"static-attr\",\"class\",\"hide\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"workDetailTextarea\"],[\"static-attr\",\"class\",\"hide\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-dialog modal-dialog-add-workTime health-modal-dialog\"],[\"flush-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-content\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"closeWorkDetailTextarea\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"填写 \"],[\"append\",[\"unknown\",[\"addOneJobTime\",\"projectName\"]],false],[\"text\",\"工作记录\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"addOneJobTime\",\"workDetail\"]],\"form-control\",12]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-footer\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addWorkdetail\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.submit\"],null],false],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"closeWorkDetailTextarea\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.close\"],null],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"tr\",[]],[\"modifier\",[\"action\"],[[\"get\",[null]],\"setCurrentRe\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-3 col-lg-3 projectNameId slight-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectName\"]],false],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"workTime\"]],false],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"append\",[\"helper\",[\"work-type\"],null,[[\"type\"],[[\"get\",[\"treeValue\",\"workType\"]]]]],false],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-5 col-lg-5\"],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"over-hide-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"workDetail\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-trash\"],[\"static-attr\",\"title\",\"删除\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"deleteWorkRec\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"treeValue\",\"workTime\"]]],null,0]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"其他\"]],\"locals\":[]},{\"statements\":[[\"text\",\"CICD\"]],\"locals\":[]},{\"statements\":[[\"text\",\"售后服务支撑\"]],\"locals\":[]},{\"statements\":[[\"text\",\"售后服务\"]],\"locals\":[]},{\"statements\":[[\"text\",\"实施、部署\"]],\"locals\":[]},{\"statements\":[[\"text\",\"测试\"]],\"locals\":[]},{\"statements\":[[\"text\",\"开发\"]],\"locals\":[]},{\"statements\":[[\"text\",\"UIUE\"]],\"locals\":[]},{\"statements\":[[\"text\",\"需求调研\"]],\"locals\":[]},{\"statements\":[[\"text\",\"售前支撑\"]],\"locals\":[]},{\"statements\":[[\"text\",\"售前\"]],\"locals\":[]},{\"statements\":[[\"text\",\"管理\"]],\"locals\":[]},{\"statements\":[[\"text\",\"        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],13],[\"text\",\"\\n        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],12],[\"text\",\"\\n        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"3\"]],11],[\"text\",\"\\n        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"4\"]],10],[\"text\",\"\\n        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"5\"]],9],[\"text\",\"\\n        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"6\"]],8],[\"text\",\"\\n        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"7\"]],7],[\"text\",\"\\n        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"8\"]],6],[\"text\",\"\\n        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"9\"]],5],[\"text\",\"\\n        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"10\"]],4],[\"text\",\"\\n        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"12\"]],3],[\"text\",\"\\n        \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"11\"]],2],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"append\",[\"get\",[\"treeValue\"]],false]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[[\"get\",[\"treeValue\"]]]],15],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"block\",[\"each\"],[[\"get\",[\"participateProject\"]]],null,16]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"date\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"week\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"jobtime-bar\"],null,[[\"jobTime\"],[[\"get\",[\"treeValue\",\"workTime\"]]]]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"填报工时\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"writeTimeForm\",[\"get\",[\"treeValue\",\"date\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"date\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"week\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"jobtime-bar\"],null,[[\"jobTime\"],[[\"get\",[\"treeValue\",\"workTime\"]]]]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"填报工作记录\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"writeTimeForm\",[\"get\",[\"treeValue\",\"date\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/jobtime-write.hbs" } });
});
define("pmo-web/templates/left-employee", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "6hNR/s3M", "block": "{\"statements\":[[\"append\",[\"unknown\",[\"outlet\"]],false],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/left-employee.hbs" } });
});
define("pmo-web/templates/left-machine", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "43ALCAgw", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"物理机管理-待分配的物理机\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\",\"key-up\",\"class\"],[[\"get\",[\"searchWordInput\"]],\"请按IP信息模糊搜索\",\"searchedItemFromWord\",\"form-control  search-input\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 img-height\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,3],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,2],[\"text\",\"  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"电口IP\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"管理口IP\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"CPU核数\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"内存参数\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"硬盘参数\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"机器位置\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"showData\"]]],null,1],[\"text\",\"\\n\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-bar\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"filtered-info span4\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"当前为第\"],[\"append\",[\"unknown\",[\"currentPage\"]],false],[\"text\",\"页\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"selected-hosts-info span4\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"items-on-page\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.show\"],null],false],[\"text\",\":\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"list-status\"],[\"static-attr\",\"class\",\"form-control-2\"],[\"static-attr\",\"name\",\"pagesize\"],[\"dynamic-attr\",\"onchange\",[\"helper\",[\"action\"],[[\"get\",[null]],\"refreshPageSize\"],null],null],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"10\"],[\"flush-element\"],[\"text\",\"10\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"50\"],[\"flush-element\"],[\"text\",\"50\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"100\"],[\"flush-element\"],[\"text\",\"100\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"beginShowItem\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"endShowItem\"]],false],[\"text\",\" of \"],[\"append\",[\"unknown\",[\"loadDataLength\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"paging_two_button\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_previous\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageDown\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_next\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageUp\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"distributeComputerForm\",[\"get\",[\"errorInfo\"]],\"distributeComputerSubmit\"]],0],[\"text\",\"\\n\\n\\n\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"添加机器\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title-p\"],[\"flush-element\"],[\"text\",\"申请信息：\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"管理口IPS：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\",\"placeholder\"],[[\"get\",[\"dsComputerIps\"]],\"form-control\",\"请输入需要申请使用的IP已,隔开\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"使用人公司邮箱：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"开始使用时间：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"startTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"结束使用时间：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"endTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"类别：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"computerType\"],[\"static-attr\",\"class\",\"form-control\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"1\"],[\"flush-element\"],[\"text\",\"长期\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"2\"],[\"flush-element\"],[\"text\",\"临时\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"是否可共享\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"isShared\"],[\"static-attr\",\"class\",\"form-control\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"1\"],[\"flush-element\"],[\"text\",\"是\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"2\"],[\"flush-element\"],[\"text\",\"否\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"是否通过安检\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"isSafe\"],[\"static-attr\",\"class\",\"form-control\"],[\"static-attr\",\"value\",\"2\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"1\"],[\"flush-element\"],[\"text\",\"是\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"2\"],[\"flush-element\"],[\"text\",\"否\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"使用详情：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"useDetail\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"ip\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"mIp\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"cpu\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"memory\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"disk\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"area\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"批量分配物理机\"],[\"static-attr\",\"class\",\"icon-add \\tglyphicon glyphicon-send\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"distributeComputer\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"批量分配物理机\"],[\"static-attr\",\"class\",\"icon-add \\tglyphicon glyphicon-send\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"distributeComputer\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/left-machine.hbs" } });
});
define("pmo-web/templates/login", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "ef51JWzz", "block": "{\"statements\":[[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-offset  col-lg-offset-3 col-md-6 col-lg-6\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"class\",\"form-horizontal top-100\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"heading\"],[\"flush-element\"],[\"text\",\"用户登录\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"placeholder\",\"value\"],[\"email\",\"form-control\",\"电子邮件\",[\"get\",[\"userEmail\"]]]]],false],[\"text\",\"\\n          \"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"fa \\tglyphicon glyphicon-user\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group help\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"type\",\"class\",\"placeholder\",\"value\"],[\"password\",\"form-control\",\"密　码\",[\"get\",[\"userPassword\"]]]]],false],[\"text\",\"\\n          \"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"fa glyphicon glyphicon-lock\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"static-attr\",\"class\",\"fa fa-question-circle glyphicon glyphicon-record\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group\"],[\"flush-element\"],[\"text\",\"\\n         \"],[\"comment\",\"\\n         <div class=\\\"main-checkbox\\\">\\n            <input type=\\\"checkbox\\\" value=\\\"None\\\" id=\\\"checkbox1\\\" name=\\\"check\\\"/>\\n            <label for=\\\"checkbox1\\\"></label>\\n          </div>\\n          <span class=\\\"text\\\">Remember me</span>\\n          \"],[\"text\",\"\\n          \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"submit\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"authenticate\"]],[\"flush-element\"],[\"text\",\"登录\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"danger-word\"],[\"static-attr\",\"style\",\"height: 30px;line-height: 30px;\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"errorInfo\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/login.hbs" } });
});
define("pmo-web/templates/new-project", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "xgm8FhbO", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"项目管理-项目列表\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\",\"key-up\",\"class\"],[[\"get\",[\"searchWordInput\"]],\"请按项目名称，项目编号或者项目经理等信息模糊搜索\",\"searchedItemFromWord\",\"search-input form-control\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 img-height\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,15],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,14],[\"text\",\"  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"项目编号\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"项目名称\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目经理\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目类型\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"牵头部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"所属区域\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目阶段\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"showData\"]]],null,13],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-bar\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"filtered-info span4\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"当前为第\"],[\"append\",[\"unknown\",[\"currentPage\"]],false],[\"text\",\"页\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"selected-hosts-info span4\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"items-on-page\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.show\"],null],false],[\"text\",\":\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"list-status\"],[\"static-attr\",\"class\",\"form-control-2\"],[\"static-attr\",\"name\",\"pagesize\"],[\"dynamic-attr\",\"onchange\",[\"helper\",[\"action\"],[[\"get\",[null]],\"refreshPageSize\"],null],null],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"10\"],[\"flush-element\"],[\"text\",\"10\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"50\"],[\"flush-element\"],[\"text\",\"50\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"100\"],[\"flush-element\"],[\"text\",\"100\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"beginShowItem\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"endShowItem\"]],false],[\"text\",\" of \"],[\"append\",[\"unknown\",[\"loadDataLength\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"paging_two_button\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_previous\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageDown\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_next\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageUp\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"addProjectForm\",[\"get\",[\"errorInfo\"]],\"submitComputerAdd\"]],8],[\"text\",\"\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"editProject\",\"errorInfo\",\"hEvent\"],[\"editProjectForm\",[\"get\",[\"editProject\"]],[\"get\",[\"errorInfo\"]],\"doEditProject\"]],4],[\"text\",\"\\n\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"addSomeProjectForm\",[\"get\",[\"errorInfo\"]],\"submitExclData\"]],0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"批量导入项目\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h5\",[]],[\"static-attr\",\"class\",\" warning-word col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"注意：导入的excl格式如下所示，且导入的是第一张sheet的内容。\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目编号\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目名称\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目经理\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目金额（单位：万元）\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"已收入（单位：万元）\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目类型\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"牵头部门\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目阶段\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"节点数\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"所属区域\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"省份\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"协办部门\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"使用到的产品\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目研发，测试人员\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"C201785-018\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"在线2017年hadoop维保项目\"],[\"close-element\"],[\"text\",\"\\n\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"谢晶\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"1200000.00\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"市场类\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"大数据产品部\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"已签合同\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"200\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"西部\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"湖南\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"运营支撑部\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"hadoop\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"王立春,赵雅琳\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"append\",[\"helper\",[\"file-upload\"],null,[[\"url\",\"class\"],[\"?m=Newproject&a=addnewProjectExcl\",\"input-file\"]]],false],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"市场类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"研发类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"研发类\"]],2],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"市场类\"]],1],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"编辑项目\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目编号：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectId\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目名称：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectName\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目经理：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectManagerId\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目金额（单位：万元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectPrice\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"已收入（单位：万元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"getMoney\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目类型：\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"editProject\",\"projectType\"]],\"categoryChanged\"]],3],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"牵头部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"leadDepartment\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目阶段\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectStage\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"节点数\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"nodeCount\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"所属区域\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"areaBelong\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"省份\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"province\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"协办部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"assistDepartment\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"使用到的产品：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"editProject\",\"production\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目研发，测试人员：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"placehoulder\",\"class\",\"rows\"],[[\"get\",[\"editProject\",\"projectPeople\"]],\"参与项目人员以逗号分隔\",\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"市场类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"研发类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"研发类\"]],6],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"市场类\"]],5],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"添加项目\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目编号：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"projectId\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目名称：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"projectName\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目经理：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"projectManagerId\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目金额（单位：元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"projectPrice\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"已收入（单位：元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"getMoney\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目类型：\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"addProject\",\"projectType\"]],\"categoryChanged\"]],7],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"牵头部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"leadDepartment\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目阶段\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"projectStage\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"节点数\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"nodeCount\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"所属区域\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"areaBelong\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"省份\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"province\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"协办部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"assistDepartment\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"使用到的产品：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"addProject\",\"production\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目研发，测试人员：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"placehoulder\",\"class\",\"rows\"],[[\"get\",[\"addProject\",\"projectPeople\"]],\"参与项目人员以逗号分隔\",\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editProjectForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editProjectForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectId\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectName\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectManagerId\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectType\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"leadDepartment\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"areaBelong\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"treeValue\",\"province\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectStage\"]],false],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,12],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,11],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isOrigin\"]]],null,10],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isTeamLeader\"]]],null,9],[\"text\",\"          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"导入excl\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-upload\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showAddSomeProjectForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-download-alt\"],[\"static-attr\",\"href\",\"index.php?m=Computer&a=exportComputers\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"添加项目\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-plus\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showAddProjectForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"导入excl\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-upload\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showAddSomeProjectForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/new-project.hbs" } });
});
define("pmo-web/templates/operate-logs", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Gy/iwJO0", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"操作日志\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\",\"key-up\",\"class\"],[[\"get\",[\"searchWordInput\"]],\"请按操作或者操作人信息模糊搜索\",\"searchedItemFromWord\",\" search-input form-control\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"操作序号\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"操作内容\"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"showData\"]]],null,0],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-bar\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"filtered-info span4\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"当前为第\"],[\"append\",[\"unknown\",[\"currentPage\"]],false],[\"text\",\"页\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"selected-hosts-info span4\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"items-on-page\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.show\"],null],false],[\"text\",\":\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"list-status\"],[\"static-attr\",\"class\",\"form-control-2\"],[\"static-attr\",\"name\",\"pagesize\"],[\"dynamic-attr\",\"onchange\",[\"helper\",[\"action\"],[[\"get\",[null]],\"refreshPageSize\"],null],null],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"10\"],[\"flush-element\"],[\"text\",\"10\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"50\"],[\"flush-element\"],[\"text\",\"50\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"100\"],[\"flush-element\"],[\"text\",\"100\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"beginShowItem\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"endShowItem\"]],false],[\"text\",\" of \"],[\"append\",[\"unknown\",[\"loadDataLength\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"paging_two_button\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_previous\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageDown\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_next\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageUp\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-lg-1 col-md-1\"],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"get\",[\"index\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"logDetail\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\",\"index\"]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/operate-logs.hbs" } });
});
define("pmo-web/templates/pbug-eperate", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Ar9qu1v7", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 img-height\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"导入excl\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-upload\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addSomeBugsForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"addSomeBugsForm\",[\"get\",[\"errorInfo\"]],\"submitExclData\"]],0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"批量导入机器\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h5\",[]],[\"static-attr\",\"class\",\" warning-word col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"注意：导入的excl格式如下所示，且导入的是第一张sheet的内容。\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n\\n\\n\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"问题类型\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"关键字\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"主题\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"经办人\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"报告人\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"优先级\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"状态\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"解决结果\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"创建\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"更新\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"到期日\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"缺陷\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"YQT-2217\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"子帐号收藏微信重点人新闻后，我的收藏-微信重点人中无记录\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"蔡衡\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"顾钧\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"Major.\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"Resolved\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"Fixed\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"2017/6/26  15:59:00\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"2017/6/27  17:08:00\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"append\",[\"helper\",[\"file-upload\"],null,[[\"url\",\"class\"],[\"?m=Bug&a=addBugExcl\",\"input-file\"]]],false],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/pbug-eperate.hbs" } });
});
define("pmo-web/templates/person-info", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "IPR14oSM", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"项目管理-项目列表\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\",\"key-up\",\"class\"],[[\"get\",[\"searchWordInput\"]],\"请按项目名称，项目编号或者项目经理等信息模糊搜索\",\"searchedItemFromWord\",\"search-input form-control\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 img-height\"],[\"flush-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"添加项目\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-plus\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"doAddWorkerProject\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"项目编号\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"项目名称\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目经理\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目类型\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"牵头部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"所属区域\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目阶段\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"showData\"]]],null,11],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-bar\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"filtered-info span4\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"当前为第\"],[\"append\",[\"unknown\",[\"currentPage\"]],false],[\"text\",\"页\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"selected-hosts-info span4\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"items-on-page\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.show\"],null],false],[\"text\",\":\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"list-status\"],[\"static-attr\",\"class\",\"form-control-2\"],[\"static-attr\",\"name\",\"pagesize\"],[\"dynamic-attr\",\"onchange\",[\"helper\",[\"action\"],[[\"get\",[null]],\"refreshPageSize\"],null],null],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"10\"],[\"flush-element\"],[\"text\",\"10\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"50\"],[\"flush-element\"],[\"text\",\"50\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"100\"],[\"flush-element\"],[\"text\",\"100\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"beginShowItem\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"endShowItem\"]],false],[\"text\",\" of \"],[\"append\",[\"unknown\",[\"loadDataLength\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"paging_two_button\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_previous\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageDown\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_next\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageUp\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"divbg\"],[\"static-attr\",\"class\",\"hide\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"diveditcontent\"],[\"static-attr\",\"class\",\"hide\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-dialog health-modal-dialog\"],[\"flush-element\"],[\"text\",\"\\n\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-content\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"closeAddProject\"]],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"添加项目\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal modal-project-workTime\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"add-row\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title\"],[\"flush-element\"],[\"text\",\"添加工作记录:\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-10 col-md-10\"],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"id\",\"ember-basic-dropdown-wormhole\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"power-select\"],null,[[\"selected\",\"options\",\"onchange\"],[[\"get\",[\"destination\"]],[\"get\",[\"projects\"]],[\"helper\",[\"action\"],[[\"get\",[null]],\"chooseDestination\"],null]]],6],[\"text\",\"                  \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-success\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"doAddProjects\"]],[\"flush-element\"],[\"text\",\"add+\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n\\n              \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title\"],[\"flush-element\"],[\"text\",\"已添加工时:\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-hover table-health-report\"],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-10 col-lg-10\"],[\"flush-element\"],[\"text\",\"参与项目名称\"],[\"close-element\"],[\"text\",\"\\n                    \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"close-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"selectedProjects\"]]],null,5],[\"text\",\"                  \"],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12 error-info\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"error-word\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"errorInfo\"]],false],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-footer\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-primary\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"submitAddProject\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.submit\"],null],false],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"style\",\"border-radius: 3px !important;\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"closeAddProject\"]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.close\"],null],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n\\n    \"],[\"close-element\"],[\"comment\",\" /.modal-dialog \"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"comment\",\" /.modal \"],[\"text\",\"\\n\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"editProject\",\"errorInfo\",\"hEvent\"],[\"editProjectForm\",[\"get\",[\"editProject\"]],[\"get\",[\"errorInfo\"]],\"doEditProject\"]],3]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"市场类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"研发类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"研发类\"]],1],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"市场类\"]],0],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"编辑项目\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目编号：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectId\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目名称：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectName\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目经理：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectManagerId\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目金额（单位：万元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectPrice\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"已收入（单位：万元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"getMoney\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目类型：\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"editProject\",\"projectType\"]],\"categoryChanged\"]],2],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"牵头部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"leadDepartment\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目阶段\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectStage\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"节点数\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"nodeCount\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"所属区域\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"areaBelong\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"省份\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"province\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"协办部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"assistDepartment\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"使用到的产品：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"editProject\",\"production\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目研发，测试人员：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"placehoulder\",\"class\",\"rows\"],[[\"get\",[\"editProject\",\"projectPeople\"]],\"参与项目人员以逗号分隔\",\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                      \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-3 col-lg-3 projectNameId slight-word\"],[\"flush-element\"],[\"append\",[\"get\",[\"treeValue\"]],false],[\"close-element\"],[\"text\",\"\\n                        \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-trash\"],[\"static-attr\",\"title\",\"删除\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"deleteRecord\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                      \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"block\",[\"if\"],[[\"get\",[\"treeValue\"]]],null,4]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"                      \"],[\"append\",[\"get\",[\"name\"]],false],[\"text\",\"\\n\"]],\"locals\":[\"name\"]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editProjectForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editProjectForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectId\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectName\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectManagerId\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectType\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"leadDepartment\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"areaBelong\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"treeValue\",\"province\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectStage\"]],false],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,10],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,9],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isOrigin\"]]],null,8],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isTeamLeader\"]]],null,7],[\"text\",\"          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/person-info.hbs" } });
});
define("pmo-web/templates/projects", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "mzYFZAqj", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"项目管理-项目列表\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\",\"key-up\",\"class\"],[[\"get\",[\"searchWordInput\"]],\"请按项目名称，项目编号或者项目经理等信息模糊搜索\",\"searchedItemFromWord\",\"search-input form-control\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 img-height\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,21],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,20],[\"text\",\"  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"合同编号\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目编号\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目名称\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目经理\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目类型\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,19],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,18],[\"text\",\"          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"客户名称\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"牵头部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"所属区域\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目阶段\"],[\"close-element\"],[\"text\",\"\\n\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"省份\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"收款状态\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"showData\"]]],null,17],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-bar\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"filtered-info span4\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"当前为第\"],[\"append\",[\"unknown\",[\"currentPage\"]],false],[\"text\",\"页\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"selected-hosts-info span4\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"items-on-page\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.show\"],null],false],[\"text\",\":\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"list-status\"],[\"static-attr\",\"class\",\"form-control-2\"],[\"static-attr\",\"name\",\"pagesize\"],[\"dynamic-attr\",\"onchange\",[\"helper\",[\"action\"],[[\"get\",[null]],\"refreshPageSize\"],null],null],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"10\"],[\"flush-element\"],[\"text\",\"10\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"50\"],[\"flush-element\"],[\"text\",\"50\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"100\"],[\"flush-element\"],[\"text\",\"100\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"beginShowItem\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"endShowItem\"]],false],[\"text\",\" of \"],[\"append\",[\"unknown\",[\"loadDataLength\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"paging_two_button\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_previous\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageDown\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_next\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageUp\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"addProjectForm\",[\"get\",[\"errorInfo\"]],\"submitComputerAdd\"]],10],[\"text\",\"\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"editProject\",\"errorInfo\",\"hEvent\"],[\"editProjectForm\",[\"get\",[\"editProject\"]],[\"get\",[\"errorInfo\"]],\"doEditProject\"]],9],[\"text\",\"\\n\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"addSomeProjectForm\",[\"get\",[\"errorInfo\"]],\"submitExclData\"]],0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"批量导入机器\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h5\",[]],[\"static-attr\",\"class\",\" warning-word col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"注意：导入的excl格式如下所示，且导入的是第一张sheet的内容。\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"合同编号\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目编号\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目名称\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"销售经理邮箱\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目经理邮箱\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目干系人\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目类型\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目金额（单位：元）\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"已收入\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"待收入\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"客户名称\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"牵头部门\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"所属区域\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"项目阶段\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"商务状态\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"使用到的产品\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"节点数\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"省份\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"协办部门\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"合同额拆分状态\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"01-2017-046\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"C201785-018\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"在线2017年hadoop维保项目\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"施胜杰\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"谢晶\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"谢晶.\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"支撑服务类\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"1200000.00\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"中移在线服务有限公司\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"大数据产品部\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"西部\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"在线公司\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"已拆分\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"append\",[\"helper\",[\"file-upload\"],null,[[\"url\",\"class\"],[\"?m=Project&a=addProjectExcl\",\"input-file\"]]],false],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"资源服务类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"咨询服务类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"支撑服务类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"软件研发类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"解决方案类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"集成服务类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"产品销售类\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"产品销售类\"]],7],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"集成服务类\"]],6],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"解决方案类\"]],5],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"软件研发类\"]],4],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"支撑服务类\"]],3],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"咨询服务类\"]],2],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"资源服务类\"]],1],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"编辑项目\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"合同编号：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"contractId\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目编号：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectId\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目名称：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectName\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"销售经理邮箱：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"salesmaneEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目经理邮箱：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectManagerEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目金额（单位：元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectPrice\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"已收入（单位：元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"getMoney\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"待收入（单位：元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"leftMoney\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目类型：\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"editProject\",\"projectType\"]],\"categoryChanged\"]],8],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"客户名称\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"customer\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"牵头部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"leadDepartment\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目阶段\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"projectStage\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"商务状态\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"businessStatus\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"节点数\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"nodeCount\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"所属区域\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"areaBelong\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"省份\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"province\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"协办部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"assistDepartment\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"合同额拆分状态\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"spitStatus\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"使用到的产品：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"editProject\",\"usedProduct\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目研发，测试人员：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"placehoulder\",\"class\",\"rows\"],[[\"get\",[\"editProject\",\"developerEmail\"]],\"参与项目人员以逗号分隔\",\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"添加项目\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"合同编号：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"ip\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目编号：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"mIp\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目名称：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"cpu\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"销售经理邮箱：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"memory\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目经理邮箱：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"disk\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"研发经理邮箱：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"os\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目金额（单位：元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"os\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"已收入（单位：元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"os\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"待收入（单位：元）：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目类型：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"computerType\"],[\"static-attr\",\"class\",\"form-control\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"产品销售类\"],[\"flush-element\"],[\"text\",\"产品销售类\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"集成服务类\"],[\"flush-element\"],[\"text\",\"集成服务类\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"解决方案类\"],[\"flush-element\"],[\"text\",\"解决方案类\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"软件研发类\"],[\"flush-element\"],[\"text\",\"软件研发类\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"支撑服务类\"],[\"flush-element\"],[\"text\",\"支撑服务类\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"咨询服务类\"],[\"flush-element\"],[\"text\",\"咨询服务类\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"资源服务类\"],[\"flush-element\"],[\"text\",\"资源服务类\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"客户名称\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"牵头部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目阶段\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"商务状态\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"节点数\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"所属区域\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"省份\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"协办部门\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"合同额拆分状态\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"使用到的产品：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"useDetail\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editProjectForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editProjectForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"getMoney\"]],false],[\"text\",\"/\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectPrice\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"getMoney\"]],false],[\"text\",\"/\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectPrice\"]],false],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"contractId\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectId\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectName\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"userName\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectType\"]],false],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,16],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,15],[\"text\",\"            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"customer\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"leadDepartment\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"areaBelong\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"projectStage\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"province\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"spitStatus\"]],false],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,14],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,13],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isOrigin\"]]],null,12],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isTeamLeader\"]]],null,11],[\"text\",\"          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目收入进度\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"             \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"项目收入进度\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"导入excl\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-upload\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showAddSomeProjectForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-download-alt\"],[\"static-attr\",\"href\",\"index.php?m=Computer&a=exportComputers\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"添加项目\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-plus\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showAddProjectForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"导入excl\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-upload\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showAddSomeProjectForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/projects.hbs" } });
});
define("pmo-web/templates/puser-manage", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "II9qMdLB", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"用户管理\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\",\"key-up\",\"class\"],[[\"get\",[\"searchWordInput\"]],\"请按人名，邮箱等信息搜索\",\"searchedItemFromWord\",\"form-control search-input\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,11],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"用户ID\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"用户名\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-3 col-lg-3\"],[\"flush-element\"],[\"text\",\"用户邮箱\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-3 col-lg-3\"],[\"flush-element\"],[\"text\",\"用户所在组\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"用户类别\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"showData\"]]],null,10],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-bar\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"filtered-info span4\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"当前为第\"],[\"append\",[\"unknown\",[\"currentPage\"]],false],[\"text\",\"页\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"selected-hosts-info span4\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"items-on-page\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.show\"],null],false],[\"text\",\":\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"list-status\"],[\"static-attr\",\"class\",\"form-control-2\"],[\"static-attr\",\"name\",\"pagesize\"],[\"dynamic-attr\",\"onchange\",[\"helper\",[\"action\"],[[\"get\",[null]],\"refreshPageSize\"],null],null],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"10\"],[\"flush-element\"],[\"text\",\"10\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"50\"],[\"flush-element\"],[\"text\",\"50\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"100\"],[\"flush-element\"],[\"text\",\"100\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"beginShowItem\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"endShowItem\"]],false],[\"text\",\" of \"],[\"append\",[\"unknown\",[\"loadDataLength\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"paging_two_button\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_previous\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageDown\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_next\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageUp\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"editUser\",\"errorInfo\",\"hEvent\"],[\"editUserForm\",[\"get\",[\"editUser\"]],[\"get\",[\"errorInfo\"]],\"userEdit\"]],5],[\"text\",\"\\n\\n\\n\\n\\n\\n\\n\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"组长\"]],\"locals\":[]},{\"statements\":[[\"text\",\"管理员用户\"]],\"locals\":[]},{\"statements\":[[\"text\",\"超级用户\"]],\"locals\":[]},{\"statements\":[[\"text\",\"普通用户\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],3],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],2],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"3\"]],1],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"4\"]],0],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"编辑用户信息\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户姓名：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editUser\",\"userName\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户密码：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"type\",\"class\"],[[\"get\",[\"editUser\",\"userPassword\"]],\"password\",\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户权限\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"editUser\",\"userType\"]],\"typeChanged\"]],4],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户团队：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editUser\",\"userTeam\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户公司邮箱：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editUser\",\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editUserForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-trash\"],[\"static-attr\",\"title\",\"删除\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"deleteUser\",[\"get\",[\"treeValue\",\"computerId\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"id\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"userName\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"userEmail\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"userTeam\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"user-type\"],null,[[\"statusValue\"],[[\"get\",[\"treeValue\",\"userType\"]]]]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,9],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isOrigin\"]]],null,8],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,7],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isTeamLeader\"]]],null,6],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1 img-height\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"添加用户\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-plus\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addComputerForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1 img-height\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"li\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"file-upload\"],null,[[\"url\",\"class\"],[\"?m=User&a=addUserExcl\",\"input-file\"]]],false],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/puser-manage.hbs" } });
});
define("pmo-web/templates/used-employee", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "Gp7imZRJ", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"外协管理-名花有主\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\",\"key-up\",\"class\"],[[\"get\",[\"searchWordInput\"]],\"请按姓名，厂商名称，项目组等信息模糊搜索\",\"searchedItemFromWord\",\"search-input form-control\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4 img-height\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,8],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,7],[\"text\",\"      \"],[\"open-element\",\"i\",[]],[\"static-attr\",\"title\",\"外协打分\"],[\"static-attr\",\"class\",\"icon-add\\tglyphicon glyphicon-send\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addScore\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"姓名\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"厂家\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"级别\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"职位\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"组长\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"位置\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"项目组\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"手机号码\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"showData\"]]],null,6],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-bar\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"filtered-info span4\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"当前为第\"],[\"append\",[\"unknown\",[\"currentPage\"]],false],[\"text\",\"页\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"selected-hosts-info span4\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"items-on-page\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.show\"],null],false],[\"text\",\":\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"list-status\"],[\"static-attr\",\"class\",\"form-control-2\"],[\"static-attr\",\"name\",\"pagesize\"],[\"dynamic-attr\",\"onchange\",[\"helper\",[\"action\"],[[\"get\",[null]],\"refreshPageSize\"],null],null],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"10\"],[\"flush-element\"],[\"text\",\"10\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"50\"],[\"flush-element\"],[\"text\",\"50\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"100\"],[\"flush-element\"],[\"text\",\"100\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"beginShowItem\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"endShowItem\"]],false],[\"text\",\" of \"],[\"append\",[\"unknown\",[\"loadDataLength\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"paging_two_button\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_previous\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageDown\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_next\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageUp\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"addProject\",\"hEvent\"],[\"addProjectForm\",[\"get\",[\"errorInfo\"]],[\"get\",[\"addProject\"]],\"doAddProject\"]],4],[\"text\",\"\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"editProject\",\"errorInfo\",\"hEvent\"],[\"editProjectForm\",[\"get\",[\"editProject\"]],[\"get\",[\"errorInfo\"]],\"doEditProject\"]],3],[\"text\",\"\\n\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"addSomeProjectForm\",[\"get\",[\"errorInfo\"]],\"submitExclData\"]],2],[\"text\",\"\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"editProject\",\"errorInfo\",\"hEvent\"],[\"employeeScoreForm\",[\"get\",[\"editProject\"]],[\"get\",[\"errorInfo\"]],\"doScoreEmployee\"]],1]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-6 col-lg-6 projectNameId slight-word\"],[\"flush-element\"],[\"append\",[\"helper\",[\"one-employee-attendance\"],null,[[\"employeeId\",\"writeTime\",\"employeeName\"],[[\"get\",[\"treeValue\",\"employeeId\"]],[\"get\",[\"writeTime\"]],[\"get\",[\"treeValue\",\"employeeName\"]]]]],false],[\"close-element\"],[\"text\",\"\\n                  \"],[\"open-element\",\"td\",[]],[\"static-attr\",\"class\",\"col-md-6 col-lg-6\"],[\"flush-element\"],[\"text\",\" \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\",\"placeholder\"],[[\"get\",[\"treeValue\",\"score\"]],\"form-control\",\"请填写本月度，该外协人员绩效得分\\t\"]]],false],[\"close-element\"],[\"text\",\"\\n                \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-2 col-md-2\"],[\"flush-element\"],[\"text\",\"\\n     \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"employeeName\"]],false],[\"append\",[\"unknown\",[\"month\"]],false],[\"text\",\"绩效打分\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-4 col-md-4 margin-t-6\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"writeTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"add-row\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title\"],[\"flush-element\"],[\"text\",\"绩效打分维度:\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"外协绩效评分维度包括技术能力20%、发现有价值的问题20%、工作态度30%、项目计划执行10%、整体出勤情况等20%，总体平均分80分左右。\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-hover table-health-report\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-6 col-lg-6\"],[\"flush-element\"],[\"text\",\"考勤情况\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-6 col-lg-6\"],[\"flush-element\"],[\"text\",\"分数\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"employeeScore\"]]],null,0],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"批量导入项目\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h5\",[]],[\"static-attr\",\"class\",\" warning-word col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"注意：导入的excl格式如下所示，且导入的是第一张sheet的内容。\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"编号\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"姓名\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"厂商\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"入职时间 \"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"入职级别\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"岗位类型\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"驻地\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"联系电话\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"所在项目组组名\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"组长\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"大组组长\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"邮箱\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"备注\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"C201785-018\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"张三\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"东软国际\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"2017/8/7\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"初级开发包\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"PHP开发\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"苏州\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"1778874323421\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"PMO\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"李四头\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"张头\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"zs@163.com\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"append\",[\"helper\",[\"file-upload\"],null,[[\"url\",\"class\"],[\"?m=Employee&a=inportExcel\",\"input-file\"]]],false],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"编辑外协信息\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"外协姓名：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"employeeName\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"厂家名称：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"employeeCompany\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"入职时间：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"disabled\",\"class\"],[[\"get\",[\"editProject\",\"getInTime\"]],true,\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"级别：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"level\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"岗位：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"workType\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"位置：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"location\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目小组：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"locatedTeam\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"小组长：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"teamLeader\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"大组长：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"bigTeamLeader\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"邮箱：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"email\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"电话：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editProject\",\"phoneNum\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"备注：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"editProject\",\"detail\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"添加外协\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"外协编号：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"employeeId\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"外协姓名：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"employeeName\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"厂家名称：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"employeeCompany\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"入职时间：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"addProject\",\"getInTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"级别：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"level\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"岗位：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"workType\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"位置：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"location\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"项目小组：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"locatedTeam\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"小组长：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"teamLeader\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"大组长：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"bigTeamLeader\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"邮箱：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"email\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"电话：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"addProject\",\"phoneNum\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"备注：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"addProject\",\"detail\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\" \"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-flag\"],[\"static-attr\",\"title\",\"绩效评定\"],[\"flush-element\"],[\"close-element\"]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"employeeName\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"employeeCompany\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"level\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"workType\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"teamLeader\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"location\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"locatedTeam\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"phoneNum\"]],false],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editProjectForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"block\",[\"link-to\"],[\"employer-score\",[\"helper\",[\"query-params\"],null,[[\"employeeId\",\"employeeName\"],[[\"get\",[\"treeValue\",\"employeeId\"]],[\"get\",[\"treeValue\",\"employeeName\"]]]]]],null,5],[\"text\",\"\\n              \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"导入excl\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-upload\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showAddSomeProjectForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-download-alt\"],[\"static-attr\",\"href\",\"index.php?m=Computer&a=exportComputers\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"添加外协\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-plus\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showAddProjectForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"导入excl\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-upload\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"showAddSomeProjectForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/used-employee.hbs" } });
});
define("pmo-web/templates/used-machine", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "kM743EiL", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"物理机管理-使用中物理机\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\",\"key-up\",\"class\"],[[\"get\",[\"searchWordInput\"]],\"请按IP，项目或者使用人等模糊搜索\",\"searchedItemFromWord\",\"search-input form-control\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2 img-height\"],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,27],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,26],[\"text\",\"  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"电口IP\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"管理口IP\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"使用小组\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"实际使用人\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"开始使用时间\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"约定归还时间\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"用途说明\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"机器类别\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col.md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"showData\"]]],null,25],[\"text\",\"\\n\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-bar\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"filtered-info span4\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"当前为第\"],[\"append\",[\"unknown\",[\"currentPage\"]],false],[\"text\",\"页\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"selected-hosts-info span4\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"items-on-page\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.show\"],null],false],[\"text\",\":\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"list-status\"],[\"static-attr\",\"class\",\"form-control-2\"],[\"static-attr\",\"name\",\"pagesize\"],[\"dynamic-attr\",\"onchange\",[\"helper\",[\"action\"],[[\"get\",[null]],\"refreshPageSize\"],null],null],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"10\"],[\"flush-element\"],[\"text\",\"10\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"50\"],[\"flush-element\"],[\"text\",\"50\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"100\"],[\"flush-element\"],[\"text\",\"100\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"beginShowItem\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"endShowItem\"]],false],[\"text\",\" of \"],[\"append\",[\"unknown\",[\"loadDataLength\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"paging_two_button\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_previous\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageDown\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_next\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageUp\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"addComputerForm\",[\"get\",[\"errorInfo\"]],\"submitComputerAdd\"]],20],[\"text\",\"\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"addSomeComputersForm\",[\"get\",[\"errorInfo\"]],\"submitExclData\"]],19],[\"text\",\"\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"deleteComputer\",[\"get\",[\"errorInfo\"]],\"computerDelete\"]],18],[\"text\",\"\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"returnComputer\",[\"get\",[\"errorInfo\"]],\"computerReturn\"]],17],[\"text\",\"\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"errorInfo\",\"hEvent\"],[\"returnComputers\",[\"get\",[\"errorInfo\"]],\"doReturnComputers\"]],16],[\"text\",\"\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"editComputer\",\"errorInfo\",\"hEvent\"],[\"editComputerForm\",[\"get\",[\"editComputer\"]],[\"get\",[\"errorInfo\"]],\"computerEdit\"]],15],[\"text\",\"\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"editComputers\",\"errorInfo\",\"hEvent\"],[\"editComputersForm\",[\"get\",[\"editComputers\"]],[\"get\",[\"errorInfo\"]],\"doComputersEdit\"]],0]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"批量调整机器归还时间\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title-p\"],[\"flush-element\"],[\"text\",\"机器详情：\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"批量归还机器\"],[\"append\",[\"unknown\",[\"searchItemLength\"]],false],[\"text\",\"台机器：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"returnComputerIps\"]],\"form-control\",\"5\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title-p\"],[\"flush-element\"],[\"text\",\"申请信息：\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"开始使用时间：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"editComputers\",\"startTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"结束使用时间：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"editComputers\",\"endTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"上海机房\"]],\"locals\":[]},{\"statements\":[[\"text\",\"2015年IDC扩容工程\"]],\"locals\":[]},{\"statements\":[[\"text\",\"大数据产品部自行购买\"]],\"locals\":[]},{\"statements\":[[\"text\",\"2014年自建实验室机房一期工程\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2014年自建实验室机房一期工程\"]],4],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"大数据产品部自行购买\"]],3],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2015年IDC扩容工程\"]],2],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"上海机房\"]],1],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"否\"]],\"locals\":[]},{\"statements\":[[\"text\",\"是\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],7],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],6],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"否\"]],\"locals\":[]},{\"statements\":[[\"text\",\"是\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],10],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],9],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"临时\"]],\"locals\":[]},{\"statements\":[[\"text\",\"长期\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],13],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],12],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"编辑机器\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title-p\"],[\"flush-element\"],[\"text\",\"机器详情：\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"管理口IP：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComputer\",\"ip\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"电口IP：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComputer\",\"mIp\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"内核颗数：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComputer\",\"cpu\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"内存大小GB：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComputer\",\"memory\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"磁盘信息：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComputer\",\"disk\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"操作系统：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComputer\",\"os\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title-p\"],[\"flush-element\"],[\"text\",\"申请信息：\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"开始使用时间：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"editComputer\",\"startTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"结束使用时间：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"editComputer\",\"endTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"使用人公司邮箱：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editComputer\",\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"机器类别\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"editComputer\",\"computerType\"]],\"typeChanged\"]],14],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"是否可共享\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"editComputer\",\"isShared\"]],\"sharedChanged\"]],11],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"是否通过安检\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"editComputer\",\"isSafe\"]],\"safeChanged\"]],8],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"机器位置\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"editComputer\",\"area\"]],\"areaChanged\"]],5],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"使用详情：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"editComputer\",\"useDetail\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"归还机器\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"批量归还机器\"],[\"append\",[\"unknown\",[\"searchItemLength\"]],false],[\"text\",\"台机器：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"returnComputerIps\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"归还机器\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"确定是否归还机器？\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"删除机器\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"确定是否删除机器？\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"批量导入机器\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"h5\",[]],[\"static-attr\",\"class\",\" warning-word col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"注意：导入的excl格式如下所示，且导入的是第一张sheet的内容。\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"电口IP\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"管理口IP\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"开始使用时间\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"约定归还时间\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"用途说明\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"操作系统\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"内核数\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"内存大小\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"磁盘块数及大小\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"使用者邮箱\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"是否共享\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"是否为临时用机\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"是否安全\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"flush-element\"],[\"text\",\"机器位置\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"192.168.2.16\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"192.168.2.16\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"2017/4/5 17:42\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"2017/4/5 17:42\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"上海项目测试\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"centos6.\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"32\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"512GB\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"4T*12\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"dashuju@cmss.chinamobile.com\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"是\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"否\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"是\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"2014年自建实验室机房一期工程\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"append\",[\"helper\",[\"file-upload\"],null,[[\"url\",\"class\"],[\"?m=Computer&a=addComputerExcl\",\"input-file\"]]],false],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"添加机器\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title-p\"],[\"flush-element\"],[\"text\",\"机器详情：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"管理口IP：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"ip\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"电口IP：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"mIp\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"内核颗数：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"cpu\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"内存大小GB：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"memory\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"磁盘信息：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"disk\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"操作系统：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"os\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n          \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"title-p\"],[\"flush-element\"],[\"text\",\"申请信息：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"开始使用时间：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"startTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"结束使用时间：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"endTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"使用人公司邮箱：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"类别：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"computerType\"],[\"static-attr\",\"class\",\"form-control\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"1\"],[\"flush-element\"],[\"text\",\"长期\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"2\"],[\"flush-element\"],[\"text\",\"临时\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"是否可共享\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"isShared\"],[\"static-attr\",\"class\",\"form-control\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"1\"],[\"flush-element\"],[\"text\",\"是\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"2\"],[\"flush-element\"],[\"text\",\"否\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"是否通过安检\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"isSafe\"],[\"static-attr\",\"class\",\"form-control\"],[\"static-attr\",\"value\",\"2\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"1\"],[\"flush-element\"],[\"text\",\"是\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"2\"],[\"flush-element\"],[\"text\",\"否\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"机器位置\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"area\"],[\"static-attr\",\"class\",\"form-control\"],[\"flush-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"2014年自建实验室机房一期工程\"],[\"flush-element\"],[\"text\",\"2014年自建实验室机房一期工程\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"大数据产品部自行购买\"],[\"flush-element\"],[\"text\",\"大数据产品部自行购买\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"2015年IDC扩容工程\"],[\"flush-element\"],[\"text\",\"2015年IDC扩容工程\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"上海机房\"],[\"flush-element\"],[\"text\",\"上海机房\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\\n\\n          \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"使用详情：\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"append\",[\"helper\",[\"textarea\"],null,[[\"value\",\"class\",\"rows\"],[[\"get\",[\"useDetail\"]],\"form-control\",\"3\"]]],false],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editComputerForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-trash\"],[\"static-attr\",\"title\",\"删除\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"deleteComputer\",[\"get\",[\"treeValue\",\"computerId\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-thumbs-up\"],[\"static-attr\",\"title\",\"归还\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"returnComputer\",[\"get\",[\"treeValue\",\"computerId\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"              \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editComputerForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n              \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-trash\"],[\"static-attr\",\"title\",\"删除\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"deleteComputer\",[\"get\",[\"treeValue\",\"computerId\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-thumbs-up\"],[\"static-attr\",\"title\",\"归还\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"returnComputer\",[\"get\",[\"treeValue\",\"computerId\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"ip\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"mIp\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"userTeam\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"userName\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"startTime\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"button-status\"],null,[[\"statusValue\",\"value\"],[[\"get\",[\"treeValue\",\"statusValue\"]],[\"get\",[\"treeValue\",\"endTime\"]]]]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"useDetail\"]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"computer-type\"],null,[[\"type\"],[[\"get\",[\"treeValue\",\"computerType\"]]]]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,24],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,23],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isOrigin\"]]],null,22],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isTeamLeader\"]]],null,21],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]},{\"statements\":[[\"text\",\"      \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-download-alt\"],[\"static-attr\",\"href\",\"index.php?m=Computer&a=exportComputers\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"添加物理机\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-plus\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addComputerForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"导入excl\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-upload\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addSomeComputersForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"批量归还\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-cog\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"returnComputers\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"批量编辑\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-edit\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editActionComputers\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"    \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-download-alt\"],[\"static-attr\",\"href\",\"index.php?m=Computer&a=exportComputers\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"添加物理机\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-plus\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addComputerForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"导入excl\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-upload\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"addSomeComputersForm\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"批量归还\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-cog\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"returnComputers\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"li\",[]],[\"static-attr\",\"title\",\"批量编辑\"],[\"static-attr\",\"class\",\"icon-add glyphicon glyphicon-edit\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editActionComputers\"]],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n\\n\"]],\"locals\":[]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/used-machine.hbs" } });
});
define("pmo-web/templates/worktime-check", ["exports"], function (exports) {
  exports["default"] = Ember.HTMLBars.template({ "id": "1mRM0YBP", "block": "{\"statements\":[[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"p\",[]],[\"static-attr\",\"class\",\"page-header pmo-header title-p\"],[\"flush-element\"],[\"text\",\"用户管理\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-3 col-lg-3\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"append\",[\"helper\",[\"date-picker\"],null,[[\"date\",\"valueFormat\",\"class\"],[[\"get\",[\"writeTime\"]],\"YYYY-MM-DD\",\"form-control\"]]],false],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-4 col-lg-4\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group input-group\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"placeholder\",\"key-up\",\"class\"],[[\"get\",[\"searchWordInput\"]],\"请按人名，邮箱等信息搜索\",\"searchedItemFromWord\",\"form-control search-input\"]]],false],[\"text\",\"\\n      \"],[\"open-element\",\"span\",[]],[\"static-attr\",\"class\",\"input-group-btn\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"class\",\"btn btn-default\"],[\"static-attr\",\"type\",\"button\"],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-search\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"row\"],[\"static-attr\",\"id\",\"report-list\"],[\"flush-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-md-12 col-lg-12\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"table\",[]],[\"static-attr\",\"class\",\"table table-striped table-bordered table-health-report\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"thead\",[]],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"用户ID\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-1 col-lg-1\"],[\"flush-element\"],[\"text\",\"用户名\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-3 col-lg-3\"],[\"flush-element\"],[\"text\",\"填报进度\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-3 col-lg-3\"],[\"flush-element\"],[\"text\",\"用户所在组\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"组长\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"th\",[]],[\"static-attr\",\"class\",\"col-md-2 col-lg-2\"],[\"flush-element\"],[\"text\",\"操作\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"tbody\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"each\"],[[\"get\",[\"showData\"]]],null,9],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"page-bar\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"filtered-info span4\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"当前为第\"],[\"append\",[\"unknown\",[\"currentPage\"]],false],[\"text\",\"页\"],[\"open-element\",\"a\",[]],[\"static-attr\",\"href\",\"#\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"selected-hosts-info span4\"],[\"flush-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"items-on-page\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"t\"],[\"common.show\"],null],false],[\"text\",\":\\n          \"],[\"open-element\",\"select\",[]],[\"static-attr\",\"id\",\"list-status\"],[\"static-attr\",\"class\",\"form-control-2\"],[\"static-attr\",\"name\",\"pagesize\"],[\"dynamic-attr\",\"onchange\",[\"helper\",[\"action\"],[[\"get\",[null]],\"refreshPageSize\"],null],null],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"10\"],[\"flush-element\"],[\"text\",\"10\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"50\"],[\"flush-element\"],[\"text\",\"50\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"option\",[]],[\"static-attr\",\"value\",\"100\"],[\"flush-element\"],[\"text\",\"100\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"info\"],[\"flush-element\"],[\"append\",[\"unknown\",[\"beginShowItem\"]],false],[\"text\",\"-\"],[\"append\",[\"unknown\",[\"endShowItem\"]],false],[\"text\",\" of \"],[\"append\",[\"unknown\",[\"loadDataLength\"]],false],[\"close-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"paging_two_button\"],[\"flush-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_previous\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageDown\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-left\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"a\",[]],[\"static-attr\",\"class\",\"paginate_next\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"pageUp\"]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-arrow-right\"],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"],[\"close-element\"],[\"text\",\"\\n\\n\\n\"],[\"block\",[\"pmo-modal\"],null,[[\"modalId\",\"editUser\",\"errorInfo\",\"hEvent\"],[\"editUserForm\",[\"get\",[\"editUser\"]],[\"get\",[\"errorInfo\"]],\"userEdit\"]],5],[\"text\",\"\\n\\n\\n\\n\\n\\n\\n\\n\\n\"]],\"locals\":[],\"named\":[],\"yields\":[],\"blocks\":[{\"statements\":[[\"text\",\"组长\"]],\"locals\":[]},{\"statements\":[[\"text\",\"管理员用户\"]],\"locals\":[]},{\"statements\":[[\"text\",\"超级用户\"]],\"locals\":[]},{\"statements\":[[\"text\",\"普通用户\"]],\"locals\":[]},{\"statements\":[[\"text\",\"            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"1\"]],3],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"2\"]],2],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"3\"]],1],[\"text\",\"\\n            \"],[\"block\",[\"xs\",\"option\"],null,[[\"value\"],[\"4\"]],0],[\"text\",\"\\n\"]],\"locals\":[\"xs\"]},{\"statements\":[[\"text\",\"  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-header\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"button\",[]],[\"static-attr\",\"type\",\"button\"],[\"static-attr\",\"class\",\"close\"],[\"static-attr\",\"data-dismiss\",\"modal\"],[\"static-attr\",\"aria-label\",\"Close\"],[\"flush-element\"],[\"open-element\",\"span\",[]],[\"static-attr\",\"aria-hidden\",\"true\"],[\"flush-element\"],[\"text\",\"×\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"h4\",[]],[\"static-attr\",\"class\",\"modal-title\"],[\"flush-element\"],[\"text\",\"编辑用户信息\"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"modal-body form-modal\"],[\"flush-element\"],[\"text\",\"\\n    \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"col-lg-12 col-md-12\"],[\"flush-element\"],[\"text\",\"\\n      \"],[\"open-element\",\"form\",[]],[\"static-attr\",\"role\",\"form\"],[\"static-attr\",\"id\",\"addComputerFormId\"],[\"flush-element\"],[\"text\",\"\\n\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户姓名：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editUser\",\"userName\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户密码：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"type\",\"class\"],[[\"get\",[\"editUser\",\"userPassword\"]],\"password\",\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户权限\"],[\"close-element\"],[\"text\",\"\\n\"],[\"block\",[\"x-select\"],null,[[\"value\",\"action\"],[[\"get\",[\"editUser\",\"userType\"]],\"typeChanged\"]],4],[\"text\",\"        \"],[\"close-element\"],[\"text\",\"\\n\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户团队：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editUser\",\"userTeam\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n        \"],[\"open-element\",\"div\",[]],[\"static-attr\",\"class\",\"form-group col-lg-6 col-md-6\"],[\"flush-element\"],[\"text\",\"\\n          \"],[\"open-element\",\"label\",[]],[\"flush-element\"],[\"text\",\"用户公司邮箱：\"],[\"close-element\"],[\"text\",\"\\n          \"],[\"append\",[\"helper\",[\"input\"],null,[[\"value\",\"class\"],[[\"get\",[\"editUser\",\"userEmail\"]],\"form-control\"]]],false],[\"text\",\"\\n        \"],[\"close-element\"],[\"text\",\"\\n      \"],[\"close-element\"],[\"text\",\"\\n    \"],[\"close-element\"],[\"text\",\"\\n  \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"text\",\"暂无操作权限\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"                \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-pencil\"],[\"static-attr\",\"title\",\"编辑\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"editUserForm\",[\"get\",[\"treeValue\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n                \"],[\"open-element\",\"a\",[]],[\"flush-element\"],[\"open-element\",\"i\",[]],[\"static-attr\",\"class\",\"glyphicon glyphicon-trash\"],[\"static-attr\",\"title\",\"删除\"],[\"modifier\",[\"action\"],[[\"get\",[null]],\"deleteUser\",[\"get\",[\"treeValue\",\"computerId\"]]]],[\"flush-element\"],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[]},{\"statements\":[[\"text\",\"          \"],[\"open-element\",\"tr\",[]],[\"flush-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"id\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"userName\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"append\",[\"helper\",[\"person-monthtime-bar\"],null,[[\"workInfo\",\"writeTime\"],[[\"get\",[\"treeValue\"]],[\"get\",[\"writeTime\"]]]]],false],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"userTeam\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"open-element\",\"p\",[]],[\"flush-element\"],[\"append\",[\"unknown\",[\"treeValue\",\"teamLeader\"]],false],[\"close-element\"],[\"close-element\"],[\"text\",\"\\n            \"],[\"open-element\",\"td\",[]],[\"flush-element\"],[\"text\",\"\\n\"],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isSuper\"]]],null,8],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isOrigin\"]]],null,7],[\"block\",[\"if\"],[[\"get\",[\"session\",\"isAdmin\"]]],null,6],[\"text\",\"            \"],[\"close-element\"],[\"text\",\"\\n          \"],[\"close-element\"],[\"text\",\"\\n\"]],\"locals\":[\"treeValue\"]}],\"hasPartials\":false}", "meta": { "moduleName": "pmo-web/templates/worktime-check.hbs" } });
});
define('pmo-web/utils/cookie-helpers', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = cookieHelpers;

  function cookieHelpers() {
    return true;
  }

  function get(name) {
    return _ember['default'].$.cookie(name);
  }
  function set(name, value) {
    _ember['default'].$.cookie(name, value, { path: "/" });
  }
  function getObject(name) {
    var str = get(name);
    return JSON.parse(str);
  }
  function setObject(name, value) {
    var str = JSON.stringify(value);
    _ember['default'].$.cookie(name, str);
  }
  function destory(name) {
    set(name, null);
  }
  function isExists(name) {
    if (get(name) == undefined || 'null' == get(name)) {
      return false;
    } else {
      return true;
    }
  }
  exports.getCookie = get;
  exports.setCookie = set;
  exports.getObject = getObject;
  exports.setObject = setObject;
  exports.destory = destory;
  exports.isExists = isExists;
});
/**
 * 用来处理cookie的方法
 */
define("pmo-web/utils/date-helpers", ["exports"], function (exports) {
	exports["default"] = dateHelpers;

	function dateHelpers() {
		return true;
	}

	function formatDate(date, format) {
		return window.moment(date).format(format);
	}
	exports.formatDate = formatDate;
});
define('pmo-web/utils/date', ['exports', 'ember', 'pmo-web/utils/validator'], function (exports, _ember, _pmoWebUtilsValidator) {
    exports['default'] = httpHelpers;

    function httpHelpers() {
        return true;
    }

    var dateUtils = {

        /**
         * List of monthes short names
         * @type {string[]}
         */
        dateMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

        /**
         * List of days short names
         * @type {string[]}
         */
        dateDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

        /**
         * Add leading zero
         *
         * @param {string} time
         * @returns {string}
         * @method dateFormatZeroFirst
         */
        dateFormatZeroFirst: function dateFormatZeroFirst(time) {
            if (time < 10) return '0' + time;
            return "" + time;
        },

        /**
         * Convert timestamp to date-string
         * default format - 'DAY_OF_THE_WEEK, MONTH DAY, YEAR HOURS:MINUTES'
         *
         * @param {number} timestamp
         * @param {bool} format
         * @return {*} date
         * @method dateFormat
         */
        dateFormat: function dateFormat(timestamp, format) {
            if (!_pmoWebUtilsValidator.validator.isValidInt(timestamp)) {
                return timestamp;
            }
            format = format || 'YYYY/MM/DD HH:mm:ss';
            return window.moment(new Date(timestamp)).format(format);
        },

        /**
         * Convert timestamp to date-string 'DAY_OF_THE_WEEK MONTH DAY YEAR'
         *
         * @param {string} timestamp
         * @return {string}
         * @method dateFormatShort
         */
        dateFormatShort: function dateFormatShort(timestamp) {
            if (!_pmoWebUtilsValidator.validator.isValidInt(timestamp)) {
                return timestamp;
            }
            var format = 'ddd MMM DD YYYY';
            var date = moment(new Date(timestamp)).format(format);
            var today = moment(new Date()).format(format);
            if (date === today) {
                return 'Today ' + new Date(timestamp).toLocaleTimeString();
            }
            return date;
        },

        /**
         * Convert starTimestamp to 'DAY_OF_THE_WEEK, MONTH DAY, YEAR HOURS:MINUTES', except for the case: year equals 1969
         *
         * @param {string} startTimestamp
         * @return {string} startTimeSummary
         * @method startTime
         */
        startTime: function startTime(startTimestamp) {
            if (!_pmoWebUtilsValidator.validator.isValidInt(startTimestamp)) {
                return '';
            }
            var startDate = new Date(startTimestamp);
            var months = this.dateMonths;
            var days = this.dateDays;
            // generate start time
            if (startDate.getFullYear() == 1969 || startTimestamp < 1) {
                return 'Not started';
            }
            var startTimeSummary = '';
            if (new Date(startTimestamp).setHours(0, 0, 0, 0) == new Date().setHours(0, 0, 0, 0)) {
                //today
                startTimeSummary = 'Today ' + this.dateFormatZeroFirst(startDate.getHours()) + ':' + this.dateFormatZeroFirst(startDate.getMinutes());
            } else {
                startTimeSummary = days[startDate.getDay()] + ' ' + months[startDate.getMonth()] + ' ' + this.dateFormatZeroFirst(startDate.getDate()) + ' ' + startDate.getFullYear() + ' ' + this.dateFormatZeroFirst(startDate.getHours()) + ':' + this.dateFormatZeroFirst(startDate.getMinutes());
            }
            return startTimeSummary;
        },

        /**
         * Convert time in mseconds to
         * 30 ms = 30 ms
         * 300 ms = 300 ms
         * 999 ms = 999 ms
         * 1000 ms = 1.00 secs
         * 3000 ms = 3.00 secs
         * 35000 ms = 35.00 secs
         * 350000 ms = 350.00 secs
         * 999999 ms = 999.99 secs
         * 1000000 ms = 16.66 mins
         * 3500000 secs = 58.33 mins
         *
         * @param {number} time
         * @param {bool} [zeroValid] for the case to show 0 when time is 0, not null
         * @return {string|null} formatted date
         * @method timingFormat
         */
        timingFormat: function timingFormat(time, /* optional */zeroValid) {
            var intTime = parseInt(time);
            if (zeroValid && intTime == 0) {
                return 0 + ' secs';
            }
            if (!intTime) {
                return null;
            }
            var timeStr = intTime.toString();
            var lengthOfNumber = timeStr.length;
            var oneMinMs = 60000;
            var oneHourMs = 3600000;
            var oneDayMs = 86400000;

            if (lengthOfNumber < 4) {
                return time + ' ms';
            } else if (lengthOfNumber < 7) {
                time = (time / 1000).toFixed(2);
                return time + ' secs';
            } else if (time < oneHourMs) {
                time = (time / oneMinMs).toFixed(2);
                return time + ' mins';
            } else if (time < oneDayMs) {
                time = (time / oneHourMs).toFixed(2);
                return time + ' hours';
            } else {
                time = (time / oneDayMs).toFixed(2);
                return time + ' days';
            }
        },

        formatDate: function formatDate(date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            m = m < 10 ? '0' + m : m;
            var d = date.getDate();
            d = d < 10 ? '0' + d : d;
            return y + '-' + m + '-' + d;
        }

    };

    exports.dateUtils = dateUtils;
});
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define('pmo-web/utils/export_excl', ['exports'], function (exports) {
    /**
     * Licensed to the Apache Software Foundation (ASF) under one
     * or more contributor license agreements.  See the NOTICE file
     * distributed with this work for additional information
     * regarding copyright ownership.  The ASF licenses this file
     * to you under the Apache License, Version 2.0 (the
     * "License"); you may not use this file except in compliance
     * with the License.  You may obtain a copy of the License at
     *
     *     http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */

    var tableToExcel = (function () {
        var uri = 'data:application/vnd.ms-excel;base64,',
            template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>',
            base64 = function base64(s) {
            return window.btoa(unescape(encodeURIComponent(s)));
        },
            format = function format(s, c) {
            return s.replace(/{(\w+)}/g, function (m, p) {
                return c[p];
            });
        };
        return function (table, name) {
            if (!table.nodeType) table = document.getElementById(table);
            var ctx = { worksheet: name || 'Worksheet', table: table.innerHTML };
            window.location.href = uri + base64(format(template, ctx));
        };
    })();

    var excl = {
        idTmr: null,
        getExplorer: function getExplorer() {
            var explorer = window.navigator.userAgent;
            if (explorer.indexOf("MSIE") >= 0) {
                return 'ie';
            } else if (explorer.indexOf("Firefox") >= 0) {
                return 'Firefox';
            } else if (explorer.indexOf("Chrome") >= 0) {
                return 'Chrome';
            } else if (explorer.indexOf("Opera") >= 0) {
                return 'Opera';
            } else if (explorer.indexOf("Safari") >= 0) {
                return 'Safari';
            }
        },
        newExcl: function newExcl(tableid) {
            if (this.getExplorer() == 'ie') {
                var curTbl = document.getElementById(tableid);
                var oXL = new ActiveXObject("Excel.Application");
                var oWB = oXL.Workbooks.Add();
                var xlsheet = oWB.Worksheets(1);
                var sel = document.body.createTextRange();
                sel.moveToElementText(curTbl);
                sel.select;
                sel.execCommand("Copy");
                xlsheet.Paste();
                oXL.Visible = true;
                try {
                    var fname = oXL.Application.GetSaveAsFilename("Excel.xls", "Excel Spreadsheets (*.xls), *.xls");
                } catch (e) {
                    print("Nested catch caught " + e);
                } finally {
                    oWB.SaveAs(fname);
                    oWB.Close(savechanges = false);
                    oXL.Quit();
                    oXL = null;
                    this.idTmr = window.setInterval(this.Cleanup(), 1);
                }
            } else {
                tableToExcel(tableid);
            }
        },
        Cleanup: function Cleanup() {
            window.clearInterval(this.idTmr);
            CollectGarbage();
        }

    };

    exports.excl = excl;
});
define('pmo-web/utils/http-helpers', ['exports', 'ember', 'pmo-web/config/environment'], function (exports, _ember, _pmoWebConfigEnvironment) {
  exports['default'] = httpHelpers;

  function httpHelpers() {
    return true;
  }

  /**
   *
   * @param args  设置参数
   * @returns {Test.Promise|*|RSVP.Promise}
   */
  function request(args, params) {

    var url = urls[args.name]['real'];

    if (params instanceof Array) {
      for (var key in params) {
        urlPrefix = urlPrefix.replace("{" + key + "}", params[key]);
      }
    }

    args.url = ['http://' + window.location.host, url].join('/');
    if (_ember['default'].isNone(args['contentType'])) {
      args['contentType'] = 'application/json'; //需要指定contentType，若无指定，则默认为此
    }
    var Type = 'type';
    if (_ember['default'].isNone(args[Type])) {
      Type = 'method'; //判断method这种特殊的写法
    }
    if (!_ember['default'].isNone(args['data']) && !_ember['default'].isEqual('get', args[Type].toLowerCase())) {
      args['data'] = JSON.stringify(args['data']);
    }
    var _headers = {};

    args['dataType'] = 'json';
    return $.ajax(_ember['default'].merge(args, { headers: _headers })).error(function (xhr, status, err) {});
  }

  var urls = {
    'add.employee.api': {
      'real': 'Employee/addEmployee',
      'mock': ''
    },
    'get.employee.api': {
      'real': 'Employee/allEmployee',
      'mock': ''
    },
    'edit.employee.api': {
      'real': 'Employee/updateEmployee',
      'mock': ''
    },
    'get.people.process': {
      'real': 'User/getOnePeopleProcess',
      'mock': ''
    },
    'get.person.week.projects': {
      'real': 'Newproject/weekProjectTime',
      'mock': ''
    },
    'get.person.projects': {
      'real': 'Newproject/alreadyJoinProject',
      'mock': ''
    },
    'post.addProject.api': {
      'real': 'Personal/addProject',
      'mock': ''
    },
    'get.joinProject.api': {
      'real': 'Personal/joinProject',
      'mock': ''
    },
    'get.replaceWeeklyJobTime.api': {
      'real': 'Jobtime/replaceWeeklyJobTime',
      'mock': ''
    },
    'get.replaceJobTime.api': {
      'real': 'Jobtime/replaceJobTime',
      'mock': ''
    },
    'get.getFillJobTime.api': {
      'real': 'Jobtime/getFillJobTime',
      'mock': ''
    },
    'get.attendance.api': {
      'real': 'Employee/getAttendance',
      'mock': ''
    },
    'post.scoreEmployees.api': {
      'real': 'Employee/scoreEmployees',
      'mock': ''
    },
    'get.SomeEmployeeScore.api': {
      'real': 'Employee/SomeEmployeeScore',
      'mock': ''
    },

    'get.workTimeList.api': {
      'real': 'Jobtime/getWorkTime',
      'mock': ''
    },
    'get.newProject.api': {
      'real': 'Newproject/getAllProject',
      'mock': ''
    },
    'edit.newProject.api': {
      'real': 'Newproject/updateProject',
      'mock': ''
    },

    'delete.complain.api': {
      'real': 'Complain/deleteComplain',
      'mock': ''
    },
    'edit.complain.api': {
      'real': 'Complain/editComplain',
      'mock': ''
    },
    'get.allComplain.api': {
      'real': 'Complain/getAllComplain',
      'mock': ''
    },
    'add.complain.api': {
      'real': 'Complain/addComplain',
      'mock': ''
    },
    'edit.user.api': {
      'real': 'User/editUsers',
      'mock': ''
    },

    'get.project.api': {
      'real': 'Project/getAllProject',
      'mock': ''
    },
    'edit.project.api': {
      'real': 'Project/editProject',
      'mock': ''
    },
    'get.users.api': {
      'real': 'User/getAllUsers',
      'mock': ''
    },
    'get.getAllUserInfo.api': {
      'real': 'User/getAllUserInfo',
      'mock': ''
    },
    'get.logs.api': {
      'real': 'Log/loadLogs',
      'mock': ''
    },
    'user.logout.api': {
      'real': 'User/logout',
      'mock': ''
    },
    'user.login.api': {
      'real': 'User/login',
      'mock': ''
    },

    'return.computers.api': {
      'real': 'Computer/returnComputers',
      'mock': ''
    },

    'edit.computers.api': {
      'real': 'Computer/editComputers',
      'mock': ''
    },

    'get.leftComputer.api': {
      'real': 'Computer/getLeftComputer',
      'mock': ''
    },
    'distribute.computer.api': {
      'real': 'Computer/distributeComputer',
      'mock': ''
    },
    'export.computer.api': {
      'real': 'Computer/exportComputers',
      'mock': ''
    },
    'computer.type.count': {
      'real': 'Computer/getTmpCCount',
      'mock': ''
    },
    'person.computer.count': {
      'real': 'Computer/getPersonCCount',
      'mock': ''
    },
    'dashbord.computer.survey': {
      'real': 'Computer/computeDashboard',
      'mock': ''
    },
    'return.computer.api': {
      'real': 'Computer/returnComputer',
      'mock': ''
    },
    'edit.computer.api': {
      'real': 'Computer/editComputer',
      'mock': ''
    },
    'delete.computer.api': {
      'real': 'Computer/deleteComputer',
      'mock': ''
    },
    'get.computer.api': {
      'real': 'Computer/getComputer',
      'mock': ''
    },
    'add.computer.api': {
      'real': 'Computer/addComputer',
      'mock': ''
    },
    'upload.computer.excl': {
      'real': 'Computer/addComputerExcl',
      'mock': ''
    }
  };

  exports.request = request;
});
define('pmo-web/utils/i18n/compile-template', ['exports', 'ember-i18n/utils/i18n/compile-template'], function (exports, _emberI18nUtilsI18nCompileTemplate) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nUtilsI18nCompileTemplate['default'];
    }
  });
});
define('pmo-web/utils/i18n/missing-message', ['exports', 'ember-i18n/utils/i18n/missing-message'], function (exports, _emberI18nUtilsI18nMissingMessage) {
  Object.defineProperty(exports, 'default', {
    enumerable: true,
    get: function get() {
      return _emberI18nUtilsI18nMissingMessage['default'];
    }
  });
});
define('pmo-web/utils/number_utils', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = httpHelpers;

    function httpHelpers() {
        return true;
    }

    var numberUtils = {

        /**
         * Convert byte size to other metrics.
         *
         * @param {Number} bytes to convert to string
         * @param {Number} precision Number to adjust precision of return value. Default is 0.
         * @param {String} parseType
         *           JS method name for parse string to number. Default is "parseInt".
         * @param {Number} multiplyBy bytes by this number if given. This is needed
         *          as <code>null * 1024 = 0</null>
         * @remarks The parseType argument can be "parseInt" or "parseFloat".
         * @return {String} Returns converted value with abbreviation.
         */
        bytesToSize: function bytesToSize(bytes, precision, parseType, multiplyBy) {
            if (bytes === null || bytes === undefined) {
                return 'n/a';
            } else {
                if (arguments[2] === undefined) {
                    parseType = 'parseInt';
                }
                if (arguments[3] === undefined) {
                    multiplyBy = 1;
                }
                var value = bytes * multiplyBy;
                var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
                var posttxt = 0;
                while (value >= 1024) {
                    posttxt++;
                    value = value / 1024;
                }
                if (value === 0) {
                    precision = 0;
                }
                var parsedValue = window[parseType](value);
                return parsedValue.toFixed(precision) + " " + sizes[posttxt];
            }
        },

        /**
         * Validates if the given string or number is an integer between the
         * values of min and max (inclusive). The minimum and maximum
         * checks are ignored if their valid is NaN.
         *
         * @method validateInteger
         * @param {string|number} str - input string
         * @param {string|number} [min]
         * @param {string|number} [max]
         */
        validateInteger: function validateInteger(str, min, max) {
            if (str == null || str == undefined || (str + "").trim().length < 1) {
                return Em.I18n.t('number.validate.empty');
            } else {
                str = (str + "").trim();
                var number = parseInt(str);
                if (isNaN(number)) {
                    return Em.I18n.t('number.validate.notValidNumber');
                } else {
                    if (str.length != (number + "").length) {
                        // parseInt("1abc") returns 1 as integer
                        return Em.I18n.t('number.validate.notValidNumber');
                    }
                    if (!isNaN(min) && number < min) {
                        return Em.I18n.t('number.validate.lessThanMinimum').format(min);
                    }
                    if (!isNaN(max) && number > max) {
                        return Em.I18n.t('number.validate.moreThanMaximum').format(max);
                    }
                }
            }
            return null;
        },
        /**
         * @param {String|Number} cardinality - value to parse
         * @param {Boolean} isMax - return maximum count
         * @return {Number}
         **/
        getCardinalityValue: function getCardinalityValue(cardinality, isMax) {
            if (cardinality) {
                var isOptional = cardinality.toString().split('-').length > 1;
                if (isOptional) {
                    return parseInt(cardinality.split('-')[isMax ? 1 : 0]);
                } else {
                    if (isMax) return (/^\d+\+/.test(cardinality) || cardinality == 'ALL' ? Infinity : parseInt(cardinality)
                    );
                    return cardinality == 'ALL' ? Infinity : parseInt(cardinality.toString().replace('+', ''));
                }
            } else {
                return 0;
            }
        },

        getFloatDecimals: function getFloatDecimals(number, separator) {
            separator = separator || '.';

            var value = '' + number;
            var decimals = value.split(separator);

            decimals = decimals[1] ? decimals[1].length : 0;

            return decimals;
        },

        /**
         * @param n
         * @return {boolean}
         */
        isPositiveNumber: function isPositiveNumber(n) {
            var number = Number(n);
            return !isNaN(number) && isFinite(number) && number > 0;
        }
    };

    exports.numberUtils = numberUtils;
});
/**
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements. See the NOTICE file distributed with this
 * work for additional information regarding copyright ownership. The ASF
 * licenses this file to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */
define('pmo-web/utils/schedule-helpers', ['exports', 'ember'], function (exports, _ember) {
  exports['default'] = scheduleHelpers;

  /**
   * 获取shchedule对象
   * @returns {boolean}
   */

  function scheduleHelpers() {
    return true;
  }

  function getSchedule() {
    return _ember['default'].Object.create({
      _interval: 5000,
      setTime: function setTime(times) {
        //set 'interval' time
        this.set('_interval', times);
      },
      // Schedules the function `f` to be executed every `interval` time.
      schedule: function schedule(f) {
        return _ember['default'].run.later(this, function () {
          f.apply(this);
          this.set('timer', this.schedule(f));
        }, this.get('_interval'));
      },
      // Stops the pollster
      stop: function stop() {
        _ember['default'].run.cancel(this.get('timer'));
      }
    });
  }
  exports.getSchedule = getSchedule;
});
define("pmo-web/utils/sha1-helpers", ["exports"], function (exports) {
  exports["default"] = sha1Helpers;

  function sha1Helpers() {
    return true;
  }

  /*
   * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
   * in FIPS 180-1
   * Version 2.2 Copyright Paul Johnston 2000 - 2009.
   * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
   * Distributed under the BSD License
   * See http://pajhome.org.uk/crypt/md5 for details.
   */

  /*
   * Configurable variables. You may need to tweak these to be compatible with
   * the server-side, but the defaults work in most cases.
   */
  var hexcase = 1; /* hex output format. 0 - lowercase; 1 - uppercase        */
  var b64pad = "="; /* base-64 pad character. "=" for strict RFC compliance   */

  /*
   * These are the functions you'll usually want to call
   * They take string arguments and return either hex or base-64 encoded strings
   */
  function hex_sha1(s) {
    return rstr2hex(rstr_sha1(str2rstr_utf8(s)));
  }
  function b64_sha1(s) {
    return rstr2b64(rstr_sha1(str2rstr_utf8(s)));
  }
  function any_sha1(s, e) {
    return rstr2any(rstr_sha1(str2rstr_utf8(s)), e);
  }
  function hex_hmac_sha1(k, d) {
    return rstr2hex(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)));
  }
  function b64_hmac_sha1(k, d) {
    return rstr2b64(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)));
  }
  function any_hmac_sha1(k, d, e) {
    return rstr2any(rstr_hmac_sha1(str2rstr_utf8(k), str2rstr_utf8(d)), e);
  }

  /*
   * Perform a simple self-test to see if the VM is working
   */
  function sha1_vm_test() {
    return hex_sha1("abc").toLowerCase() == "a9993e364706816aba3e25717850c26c9cd0d89d";
  }

  /*
   * Calculate the SHA1 of a raw string
   */
  function rstr_sha1(s) {
    return binb2rstr(binb_sha1(rstr2binb(s), s.length * 8));
  }

  /*
   * Calculate the HMAC-SHA1 of a key and some data (raw strings)
   */
  function rstr_hmac_sha1(key, data) {
    var bkey = rstr2binb(key);
    if (bkey.length > 16) bkey = binb_sha1(bkey, key.length * 8);

    var ipad = Array(16),
        opad = Array(16);
    for (var i = 0; i < 16; i++) {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5C5C5C5C;
    }

    var hash = binb_sha1(ipad.concat(rstr2binb(data)), 512 + data.length * 8);
    return binb2rstr(binb_sha1(opad.concat(hash), 512 + 160));
  }

  /*
   * Convert a raw string to a hex string
   */
  function rstr2hex(input) {
    try {
      hexcase;
    } catch (e) {
      hexcase = 0;
    }
    var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
    var output = "";
    var x;
    for (var i = 0; i < input.length; i++) {
      x = input.charCodeAt(i);
      output += hex_tab.charAt(x >>> 4 & 0x0F) + hex_tab.charAt(x & 0x0F);
    }
    return output;
  }

  /*
   * Convert a raw string to a base-64 string
   */
  function rstr2b64(input) {
    try {
      b64pad;
    } catch (e) {
      b64pad = '';
    }
    var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var output = "";
    var len = input.length;
    for (var i = 0; i < len; i += 3) {
      var triplet = input.charCodeAt(i) << 16 | (i + 1 < len ? input.charCodeAt(i + 1) << 8 : 0) | (i + 2 < len ? input.charCodeAt(i + 2) : 0);
      for (var j = 0; j < 4; j++) {
        if (i * 8 + j * 6 > input.length * 8) output += b64pad;else output += tab.charAt(triplet >>> 6 * (3 - j) & 0x3F);
      }
    }
    return output;
  }

  /*
   * Convert a raw string to an arbitrary string encoding
   */
  function rstr2any(input, encoding) {
    var divisor = encoding.length;
    var remainders = Array();
    var i, q, x, quotient;

    /* Convert to an array of 16-bit big-endian values, forming the dividend */
    var dividend = Array(Math.ceil(input.length / 2));
    for (i = 0; i < dividend.length; i++) {
      dividend[i] = input.charCodeAt(i * 2) << 8 | input.charCodeAt(i * 2 + 1);
    }

    /*
     * Repeatedly perform a long division. The binary array forms the dividend,
     * the length of the encoding is the divisor. Once computed, the quotient
     * forms the dividend for the next step. We stop when the dividend is zero.
     * All remainders are stored for later use.
     */
    while (dividend.length > 0) {
      quotient = Array();
      x = 0;
      for (i = 0; i < dividend.length; i++) {
        x = (x << 16) + dividend[i];
        q = Math.floor(x / divisor);
        x -= q * divisor;
        if (quotient.length > 0 || q > 0) quotient[quotient.length] = q;
      }
      remainders[remainders.length] = x;
      dividend = quotient;
    }

    /* Convert the remainders to the output string */
    var output = "";
    for (i = remainders.length - 1; i >= 0; i--) output += encoding.charAt(remainders[i]);

    /* Append leading zero equivalents */
    var full_length = Math.ceil(input.length * 8 / (Math.log(encoding.length) / Math.log(2)));
    for (i = output.length; i < full_length; i++) output = encoding[0] + output;

    return output;
  }

  /*
   * Encode a string as utf-8.
   * For efficiency, this assumes the input is valid utf-16.
   */
  function str2rstr_utf8(input) {
    var output = "";
    var i = -1;
    var x, y;

    while (++i < input.length) {
      /* Decode utf-16 surrogate pairs */
      x = input.charCodeAt(i);
      y = i + 1 < input.length ? input.charCodeAt(i + 1) : 0;
      if (0xD800 <= x && x <= 0xDBFF && 0xDC00 <= y && y <= 0xDFFF) {
        x = 0x10000 + ((x & 0x03FF) << 10) + (y & 0x03FF);
        i++;
      }

      /* Encode output as utf-8 */
      if (x <= 0x7F) output += String.fromCharCode(x);else if (x <= 0x7FF) output += String.fromCharCode(0xC0 | x >>> 6 & 0x1F, 0x80 | x & 0x3F);else if (x <= 0xFFFF) output += String.fromCharCode(0xE0 | x >>> 12 & 0x0F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);else if (x <= 0x1FFFFF) output += String.fromCharCode(0xF0 | x >>> 18 & 0x07, 0x80 | x >>> 12 & 0x3F, 0x80 | x >>> 6 & 0x3F, 0x80 | x & 0x3F);
    }
    return output;
  }

  /*
   * Encode a string as utf-16
   */
  function str2rstr_utf16le(input) {
    var output = "";
    for (var i = 0; i < input.length; i++) output += String.fromCharCode(input.charCodeAt(i) & 0xFF, input.charCodeAt(i) >>> 8 & 0xFF);
    return output;
  }

  function str2rstr_utf16be(input) {
    var output = "";
    for (var i = 0; i < input.length; i++) output += String.fromCharCode(input.charCodeAt(i) >>> 8 & 0xFF, input.charCodeAt(i) & 0xFF);
    return output;
  }

  /*
   * Convert a raw string to an array of big-endian words
   * Characters >255 have their high-byte silently ignored.
   */
  function rstr2binb(input) {
    var output = Array(input.length >> 2);
    for (var i = 0; i < output.length; i++) output[i] = 0;
    for (var i = 0; i < input.length * 8; i += 8) output[i >> 5] |= (input.charCodeAt(i / 8) & 0xFF) << 24 - i % 32;
    return output;
  }

  /*
   * Convert an array of big-endian words to a string
   */
  function binb2rstr(input) {
    var output = "";
    for (var i = 0; i < input.length * 32; i += 8) output += String.fromCharCode(input[i >> 5] >>> 24 - i % 32 & 0xFF);
    return output;
  }

  /*
   * Calculate the SHA-1 of an array of big-endian words, and a bit length
   */
  function binb_sha1(x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << 24 - len % 32;
    x[(len + 64 >> 9 << 4) + 15] = len;

    var w = Array(80);
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    var e = -1009589776;

    for (var i = 0; i < x.length; i += 16) {
      var olda = a;
      var oldb = b;
      var oldc = c;
      var oldd = d;
      var olde = e;

      for (var j = 0; j < 80; j++) {
        if (j < 16) w[j] = x[i + j];else w[j] = bit_rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
        var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
        e = d;
        d = c;
        c = bit_rol(b, 30);
        b = a;
        a = t;
      }

      a = safe_add(a, olda);
      b = safe_add(b, oldb);
      c = safe_add(c, oldc);
      d = safe_add(d, oldd);
      e = safe_add(e, olde);
    }
    return Array(a, b, c, d, e);
  }

  /*
   * Perform the appropriate triplet combination function for the current
   * iteration
   */
  function sha1_ft(t, b, c, d) {
    if (t < 20) return b & c | ~b & d;
    if (t < 40) return b ^ c ^ d;
    if (t < 60) return b & c | b & d | c & d;
    return b ^ c ^ d;
  }

  /*
   * Determine the appropriate additive constant for the current iteration
   */
  function sha1_kt(t) {
    return t < 20 ? 1518500249 : t < 40 ? 1859775393 : t < 60 ? -1894007588 : -899497514;
  }

  /*
   * Add integers, wrapping at 2^32. This uses 16-bit operations internally
   * to work around bugs in some JS interpreters.
   */
  function safe_add(x, y) {
    var lsw = (x & 0xFFFF) + (y & 0xFFFF);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return msw << 16 | lsw & 0xFFFF;
  }

  /*
   * Bitwise rotate a 32-bit number to the left.
   */
  function bit_rol(num, cnt) {
    return num << cnt | num >>> 32 - cnt;
  }

  /*
   exports.HMACSHA1= function(key, data) {
   return b64_hmac_sha1(key, data);
   }*/
  exports.encrypt = b64_hmac_sha1;
});
define('pmo-web/utils/validator', ['exports', 'ember'], function (exports, _ember) {
    exports['default'] = httpHelpers;

    function httpHelpers() {
        return true;
    }

    var validator = {

        isValidEmail: function isValidEmail(value) {
            var emailRegex = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
            return emailRegex.test(value);
        },

        isValidInt: function isValidInt(value) {
            var intRegex = /^-?\d+$/;
            return intRegex.test(value);
        },

        isValidNaturaNumbers: function isValidNaturaNumbers(value) {
            return this.isValidInt(value) && parseInt(value) >= 0;
        },

        isValidUNIXUser: function isValidUNIXUser(value) {
            var regex = /^[a-z_][a-z0-9_-]{0,31}$/;
            return regex.test(value);
        },

        isValidFloat: function isValidFloat(value) {
            if (typeof value === 'string' && value.trim() === '') {
                return false;
            }
            var floatRegex = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
            return floatRegex.test(value);
        },
        /**
         * validate directory with slash or drive at the start
         * @param value
         * @return {Boolean}
         */
        isValidDir: function isValidDir(value) {
            var floatRegex = /^\/[0-9a-z]*/;
            var winRegex = /^[a-z]:\\[0-9a-zA-Z]*/;
            var winUrlRegex = /^file:\/\/\/[a-zA-Z]:\/[0-9a-zA-Z]*/;
            var dirs = value.replace(/,/g, ' ').trim().split(new RegExp("\\s+", "g"));
            for (var i = 0; i < dirs.length; i++) {
                if (!floatRegex.test(dirs[i]) && !winRegex.test(dirs[i]) && !winUrlRegex.test(dirs[i])) {
                    return false;
                }
            }
            return true;
        },

        /**
         * defines if config value looks like link to other config
         * @param value
         * @returns {boolean}
         */
        isConfigValueLink: function isConfigValueLink(value) {
            return (/^\${.+}$/.test(value)
            );
        },

        /**
         * validate directory with slash at the start
         * @param value
         * @returns {boolean}
         */
        isValidDataNodeDir: function isValidDataNodeDir(value) {
            var dirRegex = /^(\[[0-9a-zA-Z]+_?[0-9a-zA-Z]+\])?(file:\/\/)?(\/[0-9a-z]*)/;
            var winRegex = /^(\[[0-9a-zA-Z]+_?[0-9a-zA-Z]+\])?[a-zA-Z]:\\[0-9a-zA-Z]*/;
            var winUrlRegex = /^(\[[0-9a-zA-Z]+_?[0-9a-zA-Z]+\])?file:\/\/\/[a-zA-Z]:\/[0-9a-zA-Z]*/;
            var dirs = value.split(',');
            if (dirs.some(function (i) {
                return i.startsWith(' ');
            })) {
                return false;
            }
            for (var i = 0; i < dirs.length; i++) {
                if (!dirRegex.test(dirs[i]) && !winRegex.test(dirs[i]) && !winUrlRegex.test(dirs[i])) {
                    return false;
                }
            }
            return true;
        },

        /**
         * validate directory doesn't start "home" or "homes"
         * @param value
         * @returns {boolean}
         */
        isAllowedDir: function isAllowedDir(value) {
            var dirs = value.replace(/,/g, ' ').trim().split(new RegExp("\\s+", "g"));
            for (var i = 0; i < dirs.length; i++) {
                if (dirs[i].startsWith('/home') || dirs[i].startsWith('/homes')) {
                    return false;
                }
            }
            return true;
        },

        /**
         * validate ip address with port
         * @param value
         * @return {Boolean}
         */
        isIpAddress: function isIpAddress(value) {
            var ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)($|\:[0-9]{1,5})$/;
            return ipRegex.test(value);
        },

        /**
         * validate hostname
         * @param value
         * @return {Boolean}
         */
        isHostname: function isHostname(value) {
            var regex = /(?=^.{3,254}$)(^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])(\.([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]{0,61}[a-zA-Z0-9]))*(\.[a-zA-Z]{1,62})$)/;
            return value === 'localhost' || regex.test(value);
        },

        hasSpaces: function hasSpaces(value) {
            var regex = /(\s+)/;
            return regex.test(value);
        },

        isNotTrimmed: function isNotTrimmed(value) {
            var regex = /(^\s+|\s+$)/;
            return regex.test(value);
        },
        /**
         * validate domain name with port
         * @param value
         * @return {Boolean}
         */
        isDomainName: function isDomainName(value) {
            var domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/;
            return domainRegex.test(value);
        },

        /**
         * validate username
         * @param value
         * @return {Boolean}
         */
        isValidUserName: function isValidUserName(value) {
            var usernameRegex = /^[a-z]([-a-z0-9]{0,30})$/;
            return usernameRegex.test(value);
        },

        /**
         * validate key of configurations
         * @param value
         * @return {Boolean}
         */
        isValidConfigKey: function isValidConfigKey(value) {
            var configKeyRegex = /^[0-9a-z_\-\.\*]+$/i;
            return configKeyRegex.test(value);
        },

        /**
         * validate configuration group name
         * @param value
         * @return {Boolean}
         */
        isValidConfigGroupName: function isValidConfigGroupName(value) {
            var configKeyRegex = /^[\s0-9a-z_\-]+$/i;
            return configKeyRegex.test(value);
        },

        /**
         * validate alert group name
         * @param value
         * @return {Boolean}
         */
        isValidAlertGroupName: function isValidAlertGroupName(value) {
            var configKeyRegex = /^[\s0-9a-z_\-]+$/i;
            return configKeyRegex.test(value);
        },

        empty: function empty(e) {
            switch (e) {
                case "":
                case 0:
                case "0":
                case null:
                case false:
                case undefined:
                case typeof this == "undefined":
                    return true;
                default:
                    return false;
            }
        },
        /**
         * Validate string that will pass as parameter to .matches() url param.
         * Try to prevent invalid regexp.
         * For example: /api/v1/clusters/c1/hosts?Hosts/host_name.matches(.*localhost.)
         *
         * @param {String} value - string to validate
         * @return {Boolean}
         * @method isValidMatchesRegexp
         */
        isValidMatchesRegexp: function isValidMatchesRegexp(value) {
            var checkPair = function checkPair(chars) {
                chars = chars.map(function (c) {
                    return '\\' + c;
                });
                var charsReg = new RegExp(chars.join('|'), 'g');
                if (charsReg.test(value)) {
                    var pairContentReg = new RegExp(chars.join('.*'), 'g');
                    if (!pairContentReg.test(value)) return false;
                    var pairCounts = chars.map(function (c) {
                        return value.match(new RegExp(c, 'g')).length;
                    });
                    if (pairCounts[0] != pairCounts[1]) return false;
                }
                return true;
            };
            if (/^[\?\|\*\!,]/.test(value)) return false;
            return (/^((\.\*?)?([\w\s\[\]\/\?\-_,\|\*\!\{\}]*)?)+(\.\*?)?$/g.test(value) && checkPair(['[', ']']) && checkPair(['{', '}'])
            );
        },

        /**
         * Remove validation messages for components which are already installed
         */
        filterNotInstalledComponents: function filterNotInstalledComponents(validationData) {
            var hostComponents = App.HostComponent.find();
            return validationData.resources[0].items.filter(function (item) {
                // true is there is no host with this component
                return hostComponents.filterProperty("componentName", item["component-name"]).filterProperty("hostName", item.host).length === 0;
            });
        },

        isValidRackId: function isValidRackId(path) {
            // See app/message.js:hostPopup.setRackId.invalid
            return (/^\/[/.\w-]+$/.test(path)
            );
        },

        /**
         * Validate url
         * @param value
         * @return {Boolean}
         */
        isValidURL: function isValidURL(value) {
            var urlRegex = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
            return urlRegex.test(value);
        }
    };

    exports.validator = validator;
});
/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* jshint ignore:start */



/* jshint ignore:end */

/* jshint ignore:start */

define('pmo-web/config/environment', ['ember'], function(Ember) {
  var prefix = 'pmo-web';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = document.querySelector('meta[name="' + metaName + '"]').getAttribute('content');
  var config = JSON.parse(unescape(rawConfig));

  var exports = { 'default': config };

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

/* jshint ignore:end */

/* jshint ignore:start */

if (!runningTests) {
  require("pmo-web/app")["default"].create({"name":"pmo-web","version":"0.0.0+47b0a71c"});
}

/* jshint ignore:end */
//# sourceMappingURL=pmo-web.map
