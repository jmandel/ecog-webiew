for (var i=0;i<100;i++) {
 var ith = require('./neurals_'+String('00000'+i).slice(-3)+'.json')
 neurals[i] = ith
 console.log('done', i)
}
