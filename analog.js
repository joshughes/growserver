var b = require('bonescript');
function printStatus(x) {
      console.log('x.value = ' + x.value);
          console.log('x.err = ' + x.err);
}

readSensor = function() {
  b.analogRead('P9_40',printStatus);
};

timer = setInterval(readSensor, 1000);

stopTimer = function() {
  clearInterval(timer);
};

setTimeout(stopTimer, 30000);
