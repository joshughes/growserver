var restify = require('restify');
var restifyValidation = require('node-restify-validation');
var sys = require('sys')
var exec = require('child_process').exec;
var fs    = require("fs")

var deviceStore = require('./devices.js').getDevicestore;

var server = restify.createServer({
  name: 'DeviceServer'
});

server.use(restify.bodyParser());
server.use(restifyValidation.validationPlugin( { errorsAsArray: false }));

var validDevice = {
  name: { isRequired: true, scope: 'path', description: 'The name of the device' },
  address: { isRequired: true,  scope: 'path', description: 'The pin address to connect to the device' },
  type: { isRequired: true, isIn: ['D','A'], scope: 'params', description: 'The type of the device [D,A] Digital or Analog' },
  state: { isRequired: true, isIn: [0,1], scope: 'params', description: 'The state of the device [0,1]' }
};

server.get('/temperature.json', function (req, res, next){
  child = exec("./getTemp.py 11 30", function (error, stdout, stderr) {
    res.send(JSON.parse(stdout));
  });
});

server.get('/screenshot.json', function(req, res, next){
  child = exec("streamer -c /dev/video0 -o /tmp/current_picture.jpeg", function (error, stdout, stderr) {
    fs.readFile('/tmp/current_picture.jpeg', function(err, data) {
      var base64data = new Buffer(data).toString('base64');
      var response = { image: base64data }
      res.send(response);
    });
  });
});

server.post({ url: '/devices.json',
  validation: validDevice },
  function create(req, res, next) {
    deviceStore.create(req.body, function (error, device) {
      if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
        res.send(201, device);
    });
});

server.get( '/devices/:id' , function get(req, res, next) {
  console.log("Device id %j", req.params.id)
  var device_id = req.params.id.split('.')
  console.log("New %j", device_id)
  deviceStore.findOne({ id: parseInt(device_id[0]) }, function (error, device) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send(device);
  });
});

server.get( '/devices/:id/analog_reading.json' , function get(req, res, next) {
  console.log("Device id %j", req.params.id)
  console.log("Starting analog read")
  var device_id = req.params.id.split('.')
  deviceStore.findOne({ id: parseInt(device_id[0]) }, deviceStore.readAnalogDevice(device, function (error, device) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send(device);
  }));
});

server.get('/devices.json', function get(req, res, next) {
  deviceStore.find({}, function (error, devices) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send(devices);
  });
});

server.put({ url: '/devices/:id',
  validation: validDevice},
  function create(req, res, next) {
    var device_id = req.params.id.split('.')
    deviceStore.update({ id: parseInt(device_id[0]), name: req.body.name, state: req.body.state, device_address: req.body.device_address}, function (error, device) {
      if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
      res.send();
    });
});
  
server.del('/devices/:id', function (req, res, next) {
  var device_id = req.params.id.split('.')
  deviceStore.delete(parseInt(device_id[0]), function( error, device) {
    if (error) return next(new restify.InvalidArgumentError(JSON.stringify(error.errors)));
    res.send('204');
  });
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
