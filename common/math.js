const BN = require('bignumber.js');
function sum(arr) {
  console.log(arr);
  var s = BN(0);
  for (var i = 0; i < arr.length; i++) {
      s = s.plus(BN(arr[i]));
  }
  return s.toFixed();
}
module.exports = {
  sum: sum
}