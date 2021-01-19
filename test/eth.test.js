const RedPocket = artifacts.require("RedPocket");
const BN = require('bignumber.js');
BN.set({ DECIMAL_PLACES: 18 })
const constants = require('../common/constants.js');
const utils = require('../common/utils.js');
// console.log('测试账户', constants);

const math = require('../common/math.js');

RedPocket.numberFormat = 'String';
let constractA;
let balance = 0;
var amount = 0.1;
var baseAmount = web3.utils.toWei(amount+"", 'ether');
var doubleAmount = web3.utils.toWei(amount*2+"", 'ether');
let companyBalance = [];
let techBalance = [];
let diffCompBal = [];
let diffTechBal = [];
let testAccounts = constants.accounts;

let owner;
let companyAddrs;
let techAddrs;
async function showCompanyBalance(){
  var _companyBalance = [];
  for(var i in companyAddrs){
    var addr = companyAddrs[i];
    var bal = await web3.eth.getBalance(addr);
    companyBalance[i] = bal;
    _companyBalance[i] = web3.utils.fromWei(bal.toString(),'ether');
  }
  console.log("公司地址所有余额：", _companyBalance);
}
async function showTechBalance(){
    var _techBalance = [];
    for(var i in techAddrs){
      var addr = techAddrs[i];
      var bal = await web3.eth.getBalance(addr);
      techBalance[i] = bal;
      _techBalance[i] = web3.utils.fromWei(bal.toString(),'ether');
    }
    console.log("技术地址所有余额：", _techBalance);
}
async function showDiff(){
  for(var i in companyAddrs){
    var addr = companyAddrs[i];
    var bal = await web3.eth.getBalance(addr);
    bal = bal-companyBalance[i];
    diffCompBal[i] = BN(bal).div(10**18).toFixed();
  }
  console.log("捡漏地址增量：", diffCompBal);
  for(var i in techAddrs){
    var addr = techAddrs[i];
    var bal = await web3.eth.getBalance(addr);
    bal = bal-techBalance[i];
    diffTechBal[i] = BN(bal).div(10**18).toFixed();
  }
  console.log("技术捡漏地址增量：", diffTechBal);
}

//执行定义合约中的其他操作
contract('RedPocket', accounts => {
    let zero = '0x0000000000000000000000000000000000000000';
    let a = accounts[16];
    let b = accounts[17];
    let c = accounts[18];
    let d = accounts[19];
    let e = accounts[20];


    let a_referers; // a所有邀请人
    console.log("红包大小：", amount);
    before(async() => {
        // 初始化合约参数
        // console.log("入参：{}，{}，{}",network,accounts);
        // 初始化合约参数
        owner = accounts[0];
        // console.log("部署合约", res);
        companyAddrs = accounts.slice(1, 11);
        techAddrs = accounts.slice(11, 16);
        // console.log(accounts);
        a_referers = accounts.slice(20,98);
        
        //构建合约(可以设置两种方式)
        // await RedPocket.deployed().then(async instance => {
        await RedPocket.new(companyAddrs, techAddrs, baseAmount, 10).then(async instance => {
            constractA = instance;
            console.log("合约地址",instance.address);
            balance = await web3.eth.getBalance(instance.address);
            console.log("合约地址以太坊余额：", balance);
            // web3.eth.transfer(instance.address,100,{from: a}).then(res=>{
            //   console.log("转1个以太坊到合约地址");
            // });
            // constractA._techFee().then(res => {
            //     console.log("合约收取手续费：", web3.utils.fromWei(res,"ether"));
            // }).catch(res=>{
            //   console.log(res);
            // });

            // 批量给测试地址转1个ETH
            console.log("批量转账");
            await utils.batchTransfer(web3, owner, testAccounts, 1000);

            // 设置红包大小
            // await constractA.setBaseAmount(baseAmount ,{from: owner}).then(async res=>{
            //   return await constractA._baseAmount();
            // }).then(res => {
              
            //   assert.equal(amount,web3.utils.fromWei(res,"ether"),"红包大小应该为：" + baseAmount);
            // }).catch(err=>{
            //   console.log(err);
            // });
            
            showCompanyBalance();
            showTechBalance();
           
        });

    });
    it('1.A玩家发送红包给0地址，查询没有没有推荐人', async() => {
        await constractA.sendPocket(zero, {from: a ,value: doubleAmount}).then(instance => {
            return constractA.getPlayerInfo({ from: a });
        }).then(res => {
            assert.equal(1,res[0],"A玩家ID应为1")
            assert.equal(zero,res[1].toString(),"A玩家推荐人应该为0地址");
            assert.equal(1,res[2],"A玩家等级应该为1")
        }).catch(err => {
            console.log("异常1：", err.reason || err);
        });
    });
    it('2.B玩家发送红包给A地址，查询B信息显示推荐人为A地址', async() => {
        await constractA.sendPocket(a, { from: b ,value: doubleAmount}).then(res => {
            return constractA.getPlayerInfo({ from: b });
        }).then(res => {
            assert.equal(2,res[0],"B玩家ID应为1")
            assert.equal(a,res[1].toString(),"B玩家推荐人应该为A玩家的地址");
            assert.equal(1,res[2],"B玩家等级应该为1")
        }).catch(err => {
            console.log("异常2：", err.reason || err);
        });
    });
    it('3.C、D玩家给A地址发红包，A玩家发红包给0地址，A红包升为2星', async() => {
        await constractA.sendPocket(a, { from: c,value: doubleAmount}).then(res => {
            return constractA.sendPocket(a, { from: d ,value: doubleAmount});
        }).then(res => {
            return constractA.sendPocket(zero, { from: a,value: baseAmount });
        }).then(res => {
            return constractA.getPlayerInfo({ from: a });
        }).then(res => {
            assert.equal(2,res[2],  "A的星级应该升为2");
            assert.equal(3,res[3].length,"A玩家的直推数量应该为3");
        }).catch(err=>{
          console.log("异常3：", err.reason || err);
        });
    });
    it('4.当前A玩家2星，将A玩家升级到4星，再发2个红包', async()=>{
      await constractA.sendPocket(zero,{from : a,value:baseAmount}).then(res=>{
          return constractA.sendPocket(zero,{from : a,value:baseAmount});
      }).then(res => {
          return constractA.getPlayerInfo({ from: a});
      }).then(res => {
          assert.equal(4,res[2],  "A的星级应该升为4");
      });
    });
    it('5.A玩家4星，将A玩家升级到5星，需要总共推荐81个人，当前已推荐3个人，再邀请（含间接邀请）78人，这里省事用直推，然后发送一个红包', async()=>{
      for(var i = 0; i < 77 ; i++ ){
        var account = a_referers[i];
        await constractA.sendPocket(a, {from: account,value:doubleAmount});
      }
      await constractA.sendPocket(a, {from: a_referers[77],value:doubleAmount}).then(res=>{
        return constractA.getPlayerInfo({ from: a});
      }).then(res=>{
        assert.equal(4,res[2],  "A的星级应该还是4");
        return constractA.sendPocket(zero, {from: a, value:doubleAmount});
      }).then(res=>{
        return constractA.getPlayerInfo({ from: a});
      }).then(res => {
          assert.equal(5,res[2],  "A的星级应该升为5");
          assert.equal(81,res[3].length, "A的直推人数应该为81人");
          assert.equal(81,res[4], "A的总人脉数应该为81人");
      }).catch(err=>{
          console.log("异常5：", err.reason || err);
      });;
    });
    it('6.A玩家升到9级，需要再发送4个红包', async()=>{
      for(var i = 0; i < 4 ; i++ ){
        await constractA.sendPocket(zero, {from: a, value: baseAmount});
      }
      await constractA.getPlayerInfo({ from: a}).then(res=>{
        assert.equal(9,res[2],  "A的星级应该升为9");
      });
    });
    it('last.公司地址余额变动遵循循环规律增长', async()=>{
        await showDiff();
        var compAmount = math.sum(diffCompBal); 
        var techAmount = math.sum(diffTechBal);
        // 总共收到的红包
        assert.equal(BN(92).multipliedBy(amount).toFixed(),BN(compAmount).plus(techAmount).toFixed(),"捡漏地址应该收到92个红包");
    });
});