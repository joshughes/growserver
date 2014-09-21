var save = require('save') // npm install save
  , saveJson = require('save-json')

var bonescript = require('bonescript')
// Create a save object and pass in a saveJson engine.
var deviceStore = save('Device', { engine: saveJson('device.json') })

if (!deviceStore)
  throw Error('Could not initiate json save') // Common cause is file creation issue  

function setDevice(device) {
  console.log("Setting device for "+ device.name)
  if(device.type != 'A') {
    bonescript.pinMode(device.address,'out')
    bonescript.digitalWrite(device.address, device.state)
  }
}

function updateDevice(device,overwrite) {
  setDevice(device)
}

function deleteDevice(deviceId) {
  deviceStore.findOne({ id: deviceId }, function (error, device) {
    device.state = 0
    setDevice(device)
  })
}

var readAnalogDevice = function(error, device, call_back) {
  if(device.type == 'A' && !error) {
    bonescript.analogRead(device.address, function (reading) {
      deviceStore.update({id: device.id, reading: reading.value}, call_back(error, device))
    })
  } else if(error) {
    call_back(error, device)
  } else {
    error = {errors:{ type: { message: "Wrong Device Type"} } }
    call_back(error, device)
  }
}
    
deviceStore.on('afterCreate',setDevice)
deviceStore.on('afterUpdate',updateDevice)
deviceStore.on('delete',deleteDevice)

deviceStore.find({}, function (error, devices) {
  for (var i=0,  tot=devices.length; i < tot; i++) {
    setDevice(devices[i], function (device) { console.log("Setting device complete for ",device.name)})
  }
})

var foo = 5

module.exports.getDevicestore = deviceStore
module.exports.readAnalogDevice = readAnalogDevice
