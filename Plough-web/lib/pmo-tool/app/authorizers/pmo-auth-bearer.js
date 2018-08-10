/**
 * Created by Administrator on 2015/11/12.
 * 用于设置验证的header头格式
 */
import Base from 'ember-simple-auth/authorizers/base';
import Ember from 'ember';
import ENV from '../config/environment';
import {encrypt} from '../utils/sha1-helpers';
export default Base.extend({
  authorize(data, block){
    const accessKeyId = data['accessKeyId'];
    let body = block.requestBody;
    let time = new Date().getTime();
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
    if (Ember.isNone(body['type'])) {//判断method这种特殊的写法
      Type = body.method;
    } else {
      Type = body.type;
    }
    let stringToSign = [Type.toLowerCase(), '', body.contentType.toLowerCase(), time, URL].join('\n');
    //  console.info(stringToSign);
    var key = data['secretAccessKey'];
    let Signature = encrypt(key, stringToSign);
    if (!Ember.isEmpty(accessKeyId)) {
      block.setHeader([{'Authorization': ['BDOC', ' ', `${accessKeyId}`, ':', `${Signature}`].join('')}, {'BDOC-Date': time}, {'Content-Type': body.contentType.toLowerCase()}]);
    }
  }
});
