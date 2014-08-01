var fs = require('fs');


function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

var tdat = fs.readFileSync("test.bin");
var a = toArrayBuffer(tdat);
var af = new Float32Array(a);

console.log(tdat,tdat.length);
console.log(a);
console.log(af);
