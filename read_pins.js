var save = require('save') // npm install save
  , saveJson = require('save-json')

var bonescript = require('bonescript')
// Create a save object and pass in a saveJson engine.
var pinStore = save('Pin', { engine: saveJson('pin.json') })

if (!pinStore)
  throw Error('Could not initiate json save') // Common cause is file creation issue  

function setPin(pin) {
  console.log("Setting pin for "+ pin.name)
  bonescript.pinMode(pin.name,'out')
  bonescript.digitalWrite(pin.name, pin.state)
}

function updatePin(pin,overwrite) {
  setPin(pin)
}

function deletePin(pinId) {
  pinStore.findOne({ id: pinId }, function (error, pin) {
    pin.state = 0
    setPin(pin)
  })
}


pinStore.on('afterCreate',setPin)
pinStore.on('afterUpdate',updatePin)
pinStore.on('delete',deletePin)

pinStore.find({}, function (error, users) {
  for (var i=0,  tot=users.length; i < tot; i++) {
    setPin(users[i], function (pin) { console.log("Setting pin complete for ",pin.name)})
  }
})


exports.getPinstore = function () {
  return pinStore
}
