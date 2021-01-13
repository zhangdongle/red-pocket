const Token = artifacts.require("TetherToken");

let instance;
let token;
let _config = {
  
}
function approve(to,from,value){
  return instance.approve(to,value,{from:from});
}
function sendPocket(to,from,value){
  return approve(instance.address,from,value).then(res=>{
    instance.sendPocket(to, {from: from ,value: value})
  });
}
// 设置红包合约的实例
function config(_instance){
  _config.instance = _instance;
  return _config;
}

// 初始化token
async function initToken(options){
  
}
module.exports = {
  config: config,
  token: token,
  initToken:initToken,
  sendPocket: sendPocket
}