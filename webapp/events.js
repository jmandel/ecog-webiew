var EventEmitter = require('events').EventEmitter;
var data = require('./data');
var extend = require('extend');

var Settings = new EventEmitter();

var electrodes = [];
for (var i=0;i<256;i++){
  electrodes.push(false);
}

electrodes[0] = true;
electrodes[1] = true;
electrodes[2] = true;

var current = {
  sort: false,
  electrodes: electrodes,
  categories: {"vowel.A":true,"vowel.I":true}
};

Settings.current = function(){
  return extend({}, current);
}

Settings.update = function(p){
  extend(current, p);
  Settings.emit('change', Settings.current());
}

Settings.subsets = function(){
  return Object.keys(current.categories)
  .filter(function(c){return current.categories[c] == true;})
  .map(function(cat){
    var parts = cat.split(/(.*)\.(.*)/);
    var name = parts[1];
    var val = parts[2];
    var tlist = [];

    return {
      label: cat,
      trials:  data.trialsInCategory(name, val)
    }
  });
};


module.exports = {
  Settings: Settings
}
