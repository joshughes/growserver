var restify = require('restify');

var pinStore = require('./read_pins.js').getPinstore();

var server = restify.createServer({
  name: 'PinServer'
});

server.use(restify.bodyParser());

server.post('/pin', function create(req, res, next) {
  console.log("Session: %j", req.body);
  if (req.body.name === undefined) {
    return next(new restify.InvalidArgumentError('Name must be supplied'));
  }
  if (req.body.state === undefined) {
    return next(new restify.InvalidArgumentError('State must be supplied'));
  }
  pinStore.create({ name: req.body.name, state: req.body.state }, function (error, pin) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send(201, pin);
  });
});

server.get('/pin/:id', function create(req, res, next) {
  pinStore.findOne({ id: req.params.id }, function (error, pin) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send(pin);
  });
});

server.get('/pin', function create(req, res, next) {
  pinStore.find({}, function (error, pins) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send(pins);
  });
});

server.put('/pin/:id', function create(req, res, next) {
  if (req.body.name === undefined) {
    return next(new restify.InvalidArgumentError('Name must be supplied'));
  }
  if (req.body.state === undefined) {
    return next(new restify.InvalidArgumentError('State must be supplied'));
  }
  
  pinStore.update({ id: req.params.id, name: req.body.name, state: req.body.state}, function (error, pin) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send();
  });
});
  
server.del('/pin/:id', function (req, res, next) {
  console.log("request is "+ req.params.id);
  pinStore.delete(req.params.id, function( error, pin) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send('204');
  });
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
