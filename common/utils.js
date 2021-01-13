const BN = require('bignumber.js');
/**
* 批量转账
* addrs 转账地址数组
* amount 单个地址金额，单位ether
 */
async function batchTransfer(web3, from, addrs, amount){
  console.log("批量转账");
  for(var i in addrs){
    var addr = addrs[i];
    await web3.eth.sendTransaction({
      from:from,
      to:addr,
      value: web3.utils.toWei("" + amount,'ether')
    },function(err){
      if (!err)
        console.log("转账成功：", i, addr);
    });
  }
}

/**
* 批量转账
* addrs 转账地址数组
* amount 单个地址金额
 */
async function batchTransferToken(token, owner, addrs, amount){
  for(var i in addrs){
    var addr = addrs[i];
    await token.transfer(addr, amount ,{from:owner,gas:2000000}).then(()=>{
      // console.log("转账成功：", i, addr)
      });
  }
}

module.exports = {
  batchTransfer: batchTransfer,
  batchTransferToken: batchTransferToken
}