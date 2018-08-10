import Ember from 'ember';
import Mock from 'npm:mockjs';
import { format2Date, formatDate } from '../utils/date-helpers';

export default Ember.Component.extend({
  classNames: ['date-range-picker'],
  Value: '',
  _id:'',
  Format: 'YYYY-MM-DD',
  onChange: Ember.observer('Value', function () {
    const Value = this.get('Value');
    const date = Value.split(' ~ ');
    const startDate = date[0];
    const endDate = date[1];
    const onChange = this.get('dateChange');
    const format = this.get('Format');
    const sDate = format2Date(startDate, format).getTime();
    const eDate = format2Date(endDate, format).getTime();
    onChange && onChange(sDate, eDate);
  }),
  didInsertElement() {
    Ember.$(`#${this.get('_id')}`).daterangepicker({
      timePicker: false,
      timePicker24Hour: true,
      timePickerSeconds: true,
      /* ranges: {
        一个小时: [
          moment().subtract(1, 'hours'), moment(),
        ],
        一天: [
          moment().subtract(1, 'days'), moment(),
        ],
        一周: [
          moment().subtract(6, 'days'), moment(),
        ],
        一个月: [
          moment().subtract(1, 'month'), moment(),
        ],
      }, */
      locale: {
        format: 'YYYY-MM-DD',
        separator: ' ~ ',
        applyLabel: '确定',
        cancelLabel: '取消',
        fromLabel: 'From',
        toLabel: 'To',
        customRangeLabel: '自定义',
        weekLabel: 'W',
        daysOfWeek: [
          '日',
          '一',
          '二',
          '三',
          '四',
          '五',
          '六',
        ],
        monthNames: [
          '一月',
          '二月',
          '三月',
          '四月',
          '五月',
          '六月',
          '七月',
          '八月',
          '九月',
          '十月',
          '十一月',
          '十二月',
        ],
        firstDay: 1,
      },
      alwaysShowCalendars: false,
      autoUpdateInput:false
   //   startDate: formatDate(this.get('startDate'), this.get('Format')),
   //   endDate: formatDate(this.get('endDate'), this.get('Format')),
 //     minDate: 'YYYY-MM-DD hh:mm:ss',
 //     maxDate: 'YYYY-MM-DD hh:mm:ss',
    });
  },
  init() {
    this._super();
    // this.set('_id', Mock.Random.guid());
  },
});
