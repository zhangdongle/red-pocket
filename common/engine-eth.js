let instance;
function sendPocket(to,from,value){
  return instance.sendPocket(to, {from: from ,value: value});
}
function config(_instance){
  instance = _instance;
}
module.exports = {
  config: config
  sendPocket: sendPocket
}