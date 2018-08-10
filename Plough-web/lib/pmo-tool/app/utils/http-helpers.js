import Ember from 'ember';
import ENV from '../config/environment';
export default function httpHelpers() {
  return true;
}


/**
 *
 * @param args  设置参数
 * @returns {Test.Promise|*|RSVP.Promise}
 */
function request(args,params) {

  var url =urls[args.name]['real'];

  if(params instanceof Array){
    for(var key in params){
      urlPrefix = urlPrefix.replace("{"+key+"}",params[key]);
    }
  }

  args.url = ['http://'+window.location.host, url].join('/');
  if (Ember.isNone(args['contentType'])) {
    args['contentType'] = 'application/json'; //需要指定contentType，若无指定，则默认为此
  }
  var Type = 'type';
  if (Ember.isNone(args[Type])) {
    Type = 'method'; //判断method这种特殊的写法
  }
  if (!Ember.isNone(args['data']) && !Ember.isEqual('get', args[Type].toLowerCase())) {
    args['data'] = JSON.stringify(args['data']);
  }
  let _headers = {};

  args['dataType']='json';
  return $.ajax(Ember.merge(args, {headers: _headers})).error(
    (xhr, status, err)=> {
    }
  );
}

var urls =  {
  'return.computers.api':{
    'real': 'index.php?m=Computer&a=returnComputers',
    'mock':''
  },

  'get.leftComputer.api':{
    'real': 'index.php?m=Computer&a=getLeftComputer',
    'mock':''
  },
  'distribute.computer.api':{
    'real': 'index.php?m=Computer&a=distributeComputer',
    'mock':''
  },
  'export.computer.api':{
    'real': 'index.php?m=Computer&a=exportComputers',
    'mock':''
  },
  'computer.type.count':{
    'real': 'index.php?m=Computer&a=getTmpCCount',
    'mock':''
  },
  'person.computer.count':{
    'real': 'index.php?m=Computer&a=getPersonCCount',
    'mock':''
  },
  'dashbord.computer.survey':{
    'real': 'index.php?m=Computer&a=computeDashboard',
    'mock':''
  },
  'return.computer.api':{
    'real': 'index.php?m=Computer&a=returnComputer',
    'mock':''
  },
  'edit.computer.api':{
    'real': 'index.php?m=Computer&a=editComputer',
    'mock':''
  },
  'delete.computer.api':{
    'real': 'index.php?m=Computer&a=deleteComputer',
    'mock':''
  },
  'get.computer.api':{
    'real': 'index.php?m=Computer&a=getComputer',
    'mock':''
  },
  'add.computer.api':{
    'real': 'index.php?m=Computer&a=addComputer',
    'mock':''
  },
  'upload.computer.excl':{
    'real': 'index.php?m=Computer&a=addComputerExcl',
    'mock':''
  },
}





export{
  request
};
