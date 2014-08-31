var save = require('save') // npm install save
  , saveJson = require('save-json')

var bonescript = require('bonescript')
// Create a save object and pass in a saveJson engine.
var deviceStore = save('Device', { engine: saveJson('device.json') })

if (!deviceStore)
  throw Error('Could not initiate json save') // Common cause is file creation issue  

function setDevice(device) {
  console.log("Setting device for "+ device.name)
  bonescript.pinMode(device.pin_address,'out')
  bonescript.digitalWrite(device.pin_address, device.state)
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


deviceStore.on('afterCreate',setDevice)
deviceStore.on('afterUpdate',updateDevice)
deviceStore.on('delete',deleteDevice)

deviceStore.find({}, function (error, devices) {
  for (var i=0,  tot=devices.length; i < tot; i++) {
    setDevice(devices[i], function (device) { console.log("Setting device complete for ",device.name)})
  }
})


exports.getDevicestore = deviceStore
