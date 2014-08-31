var restify = require('restify');

var deviceStore = require('./devices.js').getDevicestore;

var server = restify.createServer({
  name: 'DeviceServer'
});

server.use(restify.bodyParser());

server.post('/device.json', function create(req, res, next) {
  if (req.body.name === undefined) {
    return next(new restify.InvalidArgumentError('Name must be supplied'));
  }
  if (req.body.state === undefined) {
    return next(new restify.InvalidArgumentError('State must be supplied'));
  }
  deviceStore.create({ name: req.body.name, state: req.body.state, device_address: req.body.device_address }, function (error, device) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send(201, device);
  });
});

server.get('/devices/:id.json', function get(req, res, next) {
  deviceStore.findOne({ id: req.params.id }, function (error, device) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send(device);
  });
});

server.get('/devices.json', function get(req, res, next) {
  deviceStore.find({}, function (error, devices) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send(devices);
  });
});

server.put('/devices/:id.json', function create(req, res, next) {
  if (req.body.name === undefined) {
    return next(new restify.InvalidArgumentError('Name must be supplied'));
  }
  if (req.body.state === undefined) {
    return next(new restify.InvalidArgumentError('State must be supplied'));
  }
  
  deviceStore.update({ id: req.params.id, name: req.body.name, state: req.body.state, device_address: req.body.device_address}, function (error, device) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send();
  });
});
  
server.del('/devices/:id.json', function (req, res, next) {
  console.log("request is "+ req.params.id);
  deviceStore.delete(req.params.id, function( error, device) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send('204');
  });
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
