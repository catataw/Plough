/*jshint node:true*/
/* global require, module */
var EmberApp = require("ember-cli/lib/broccoli/ember-app");

module.exports = function (defaults) {
  var app = new EmberApp(defaults, {
    lessOptions: {
      paths: ["app/styles/app.less"]
    },
    outputPaths: {
      app: {
        html: "index.html",
        css: {
          app: "/assets/css/pmo-web.css"
        },
        js: "/assets/js/pmo-web.js"
      },
      vendor: {
        css: "/assets/css/vendor.css",
        js: "/assets/js/vendor.js"
      }
    }
    // Add options here
  });

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.
  //注入js组件
  //   app.import('vendor/pdf/html2canvas.js');
  //  app.import('vendor/pdf/jspdf.debug.js');
  app.import("vendor/ember-charts-2.2.7/dist/echarts.common.min.js");
  app.import("bower_components/bootstrap/dist/js/bootstrap.min.js");
  app.import("bower_components/messenger/build/js/messenger.js");
  app.import("bower_components/jquery.cookie/jquery.cookie.js");
  app.import("bower_components/moment/moment.js");
  app.import("vendor/zTree/js/jquery.ztree.all.min.js");
  app.import("vendor/datatables/js/jquery.dataTables.min.js");
  app.import("vendor/datatables-plugins/dataTables.bootstrap.min.js");
  app.import("vendor/datatables-responsive/dataTables.responsive.js");
  // app.import('vendor/jQuery-File-Upload-master/js/jquery.fileupload.js');
  // app.import('vendor/jQuery-File-Upload-master/js/jquery.iframe-transport.js');
  // app.import('vendor/jQuery-File-Upload-master/js/vendor/jquery.ui.widget.js');
  // app.import('vendor/jQuery-File-Upload-master/js/cors/jquery.xdr-transport.js');

  app.import("vendor/pekeUpload-master/js/pekeUpload.min.js");
  app.import("vendor/fixed-table.js");
  app.import("vendor/fixed-table.css");
  app.import("vendor/daterangepicker.js");
  app.import("vendor/daterangepicker.css");
  


  //注入消息提示
 /*  app.import('vender/messenger-master/js/messenger.js');
  app.import('vender/messenger-master/js/messenger-theme-future.js');
  app.import('vender/messenger-master/css/messenger.css');
  app.import('vender/messenger-master/css/messenger-theme-future.css'); */


// app.import('vendor/d3-process-map-master/d3/d3.v3.min.js');
  //注入css
  app.import('vendor/mydatetimepicker/bootstrap-datetimepicker.js');
  app.import('vendor/mydatetimepicker/bootstrap-datetimepicker.css');

  app.import("vendor/font-awesome/css/font-awesome.min.css");
  app.import("vendor/ember-charts-2.2.7/dist/ember-charts.css");
  app.import("bower_components/bootstrap/dist/css/bootstrap.min.css");
  app.import("bower_components/bootstrap/dist/css/bootstrap-theme.min.css");
  app.import("vendor/zTree/css/zTreeStyle/zTreeStyle.css");

  //注入字体
  app.import(
    "bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.eot", {
      destDir: "assets/fonts"
    }
  );
  app.import(
    "bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.svg", {
      destDir: "assets/fonts"
    }
  );
  app.import(
    "bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf", {
      destDir: "assets/fonts"
    }
  );
  app.import(
    "bower_components/bootstrap/dist/fonts/glyphicons-halflings-regular.woff", {
      destDir: "assets/fonts"
    }
  );
  return app.toTree();
};
