const RedPocket = artifacts.require("RedPocketOfUSDT");

let redpocket;
module.exports = async function(deployer,network,accounts) {
  const { deployProxy } = require('@openzeppelin/truffle-upgrades');
  this.redpocket = await deployProxy(RedPocket, [42], {initializer: 'store'});
  console.log("新的合约地址：",redpocket);
}