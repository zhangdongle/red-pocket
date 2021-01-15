const RedPocket = artifacts.require("RedPocketOfUSDT");
const TetherToken = artifacts.require("TetherToken");
const BN = require('bignumber.js');
const constants = require("../common/constants.js")
const utils = require("../common/utils.js")
let _initialSupply = 100000000000000; // Token总量
let _name = "USDT"; // Token名称
let _symbol = _name; // Token代号
let _decimals = 6; // Token精度
let baseAmount = 100*(10**6);
let token;
let tokenaddress = "0x27f46f1F96E6788E16d54c6DfEAa3B3BDA623194";

const {ZWeb3,Contracts,ProxyAdminProject} = require("@openzeppelin/upgrades");  

module.exports = async function(deployer,network,accounts) {
  ZWeb3.initialize(web3.currentProvider);
    const loader = setupLoader({
      provider: web3
    }).web3;
  }
  //Fetch the default account  
  const from = await ZWeb3.defaultAccount();

}