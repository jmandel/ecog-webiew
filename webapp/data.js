var util = require('util');
var event = require('events');

var data = module.exports =  new event.EventEmitter();

data.trialsInCategory = function(name, val){
  var ret = []
  for (var i=0;i<data.categories.length;i++){
    if (categories[i][name] == val) {
      ret.push(i);
    }
  }
  return ret;
}


var config = data.config = {
  AT_A_TIME: 3,
  LIMIT_NEURALS: 25,
  TRIALS:  2580,
  NEURAL_SAMPLES: 366,
  FORMANT_SAMPLES: 184,
  FORMANTS: 5
};

var neurals = data.neurals = [];
var formants = data.formants = null;
var categories = data.categories = null;

function getArrayBuffer(url, cb){
  var oReq = new XMLHttpRequest();
  oReq.open("GET", url, true);
  oReq.responseType = "arraybuffer";
  oReq.onload = function (oEvent) {
    var arrayBuffer = oReq.response; // Note: not oReq.responseText
    cb(arrayBuffer);
  };
  oReq.send(null);
}

getArrayBuffer("data/formants.bin", function(binary){
  formants = data.formants = new Float32Array(binary);
  checkDone();
});

$.get("data/categories.json").then(function(cats){
  categories = data.categories = cats;
  categoryDetail = data.categoryDetail = {};
  Object.keys(cats[0]).forEach(function(cat){
    var d = categoryDetail[cat] = {};
    cats.forEach(function(c){
      current = d[c[cat]] || 0;
      d[c[cat]] = current+1;
    });
  });
});

function getNeural(i){
  neurals[i] = "loading";
  var padi = ("00000"+i).slice(-3);
  getArrayBuffer(util.format("data/neurals_%s.bin", padi),
  function (binary) {
    neurals[i] = new Float32Array(binary);
    gotNeural();
  });
};

function nextFile(){
  var next = neurals.length;
  if (next >= config.LIMIT_NEURALS) return null;
  return next;
}

function checkDone(){
  var n = neurals.filter(function(x){return x && x !== "loading"}).length;
  if (n === config.LIMIT_NEURALS && formants  && categories){
    data.emit('ready');
  }
}

function gotNeural(){
  var next = nextFile();
  if (next){
    return getNeural(next);
  } 
  checkDone();
}

for (var i=0;i<config.AT_A_TIME;i++){
  getNeural(nextFile());
}
