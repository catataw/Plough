/*jshint node:true*/
module.exports = function(app) {
  var express = require('express');
  var postsRouter = express.Router();
  var logRouter = express.Router();
  postsRouter.get('/', function(req, res) {
    res.send(
        {"id":"85","userName":"\u5434\u8f89","userType":"2","userEmail":"wuhui@cmss.chinamobile.com"}
    );
  });

  postsRouter.post('/', function(req, res) {
    res.send(

      {"id":"85","userName":"\u5434\u8f89","userType":"2","userEmail":"wuhui@cmss.chinamobile.com"}
    );
  });



  postsRouter.put('/:id', function(req, res) {
    res.send({
      'posts': {
        id: req.params.id
      }
    });
  });

  postsRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });


  logRouter.post('/', function(req, res) {
    res.send(
      {"id":"85","logDetail":"\u5434\u8f89"}
    );
  });
  logRouter.get('/', function(req, res) {
    res.send(
      {"id":"85","logDetail":"\u5434\u8f89"}
    );
  });

  logRouter.put('/:id', function(req, res) {
    res.send({
      'posts': {
        id: req.params.id
      }
    });
  });

  logRouter.delete('/:id', function(req, res) {
    res.status(204).end();
  });
  // The POST and PUT call will not contain a request body
  // because the body-parser is not included by default.
  // To use req.body, run:

  //    npm install --save-dev body-parser

  // After installing, you need to `use` the body-parser for
  // this mock uncommenting the following line:
  //
  //app.use('/api/posts', require('body-parser').json());
  app.use('/User/login', postsRouter);
  app.use('Logs/getLogs',logRouter);
};
