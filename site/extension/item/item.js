'use strict';
var debug = require('debug')('item');
var util = require('util');
var tool = require('leaptool');

module.exports = function(app) {

  var module_name = 'item';
  app.eventEmitter.emit('extension::init', module_name);
  
  var block = tool.object(require('base')(app, module_name));
  block.role = 'user';
  block.description ='example module',
  block.tags = ['template'];
  block.depends = [];
  
  block.data = tool.object(require('basedata')(app, module_name));
  block.page = tool.object(require('basepage')(app, module_name, block.data));

  block.model = {
    name: { type: 'string' },
    type: { type: 'string' },
    content: { type: 'text' },
    note: {
      type: 'object',
      subtype: {
        type: 'json'
      }
    },
    photo: {
      type: 'file'
    },
    images: {
      type: 'array',
      subtype: {
        type: 'file'
      }
    },
    status: {
      type: 'string',
      values: [
        { display:'Active', value:'active', default:true },
        { display:'Inactive', value:'inactive' }
      ]
    },
    create_by: { type: 'string', config:{ auto:true } },
    create_date: { type: 'date', config:{ auto:true } },
    edit_by: { type: 'string', config:{ auto:true } },
    edit_date: { type: 'date', config:{ auto:true } }
  };

  block.option = {
    edit_fields: ['name', 'type'],
    list_fields: ['name', 'type'],
    search_fields: ['name', 'type']
  };

  block.test = function() {
    return 'item test';
  };
  
  block.convert = function(input) {
    var error = null;
    var result = 'item convert test';
    return { error:error, result:result };
  };

  // page
  block.page.index = function(req, res, record) {
    var condition = { type:'example' };
    app.db.find(module_name, condition, {}, function(error, docs, info) {
      console.log('item find result:', error, docs, info);
      var page = app.getPage(req, { title:'item' });
      page.record = record;
      page.examples = docs;
      res.render('item/index', { page:page });
    });
  };
  
  block.page.convert = function(req, res) {
    var callback = arguments[3] || null;
    var parameter = tool.getReqParameter(req);
    debug('item convert parameter:', parameter);
    var data = block.convert(parameter.input);
    app.sendJsonData(req, res, data);
  };
  
  block.page.viewByName = function(req, res) {
    var parameter = tool.getReqParameter(req);
    var condition = { name:parameter.name };
    app.db.find(module_name, condition, {}, function(error, docs, info) {
      console.log('item find by name result:', error, docs, info);
      var record = docs && docs[0] || null;
      if (record) {
        block.page.index(req, res, record);
      } else {
        var result = 'record is not found'; 
        app.renderInfoPage(null, [], { message:result }, req, res);
      }
    });
  };
  
  // page route
  app.server.get('/item', block.page.index);
  app.server.get('/item/convert', block.page.convert);
  app.server.get('/item/:name', block.page.viewByName);

  return block;
};