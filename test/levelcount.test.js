const RedPocket = artifacts.require("RedPocketOfUSDT");
const Token = artifacts.require("TetherToken");
const Engine = require("../common/engine-token.js");
const BN = require('bignumber.js');
const constants = require('../common/constants.js');
const utils = require('../common/utils.js');
// console.log('测试账户', constants);
const math = require('../common/math.js');
RedPocket.numberFormat = 'String';
BN.set({ DECIMAL_PLACES: 18 })
let balance = 0;
var amount = 100;
var baseAmount = BN(amount).multipliedBy(10**6).toFixed();
var doubleAmount = BN(baseAmount).multipliedBy(2).toFixed();
let companyBalance = [];
let techBalance = [];
let diffCompBal = [];
let diffTechBal = [];
let testAccounts = constants.accounts;
let instance;
let token;
let owner;
let companyAddrs;
let techAddrs;
async function showCompanyBalance(){
  var _companyBalance = [];
  for(var i in companyAddrs){
    var addr = companyAddrs[i];
    var bal = await token.balanceOf(addr);
    companyBalance[i] = bal;
    _companyBalance[i] = BN(bal).div(10**6).toFixed();
  }
  console.log("公司地址所有余额：", _companyBalance);
}
async function showTechBalance(){
    var _techBalance = [];
    for(var i in techAddrs){
      var addr = techAddrs[i];
      var bal = await token.balanceOf(addr);
      techBalance[i] = bal;
      _techBalance[i] = BN(bal).div(10**6).toFixed();
    }
    console.log("技术地址所有余额：", _techBalance);
}
async function showDiff(){
  for(var i in companyAddrs){
    var addr = companyAddrs[i];
    var bal = await token.balanceOf(addr);
    bal = bal-companyBalance[i];
    diffCompBal[i] = BN(bal).div(10**6).toFixed();
  }
  console.log("捡漏地址增量：", diffCompBal);
  for(var i in techAddrs){
    var addr = techAddrs[i];
    var bal = await token.balanceOf(addr);
    bal = bal-techBalance[i];
    diffTechBal[i] = BN(bal).div(10**6).toFixed();
  }
  console.log("技术捡漏地址增量：", diffTechBal);
}
async function sendPocket(to,options){
  let bal = await token.balanceOf(options.from);
  let approve = await token.allowance(options.from,instance.address);
  // console.log("账户余额：",BN(bal).toString());
  // console.log("可用授权额度：",BN(approve).toString());
  return await token.approve(instance.address,options.value,{from:options.from}).then(async res=>{
    approve = await token.allowance(options.from,instance.address);
    // console.log("可用授权额度：",BN(approve).toString());
    return await instance.sendPocket(to,{from:options.from,gas:2000000});
  });
}
//执行定义合约中的其他操作
contract('RedPocket', accounts => {
    let zero = '0x0000000000000000000000000000000000000000';
    let a = accounts[16];
    let b = accounts[17];
    let c = accounts[18];
    let d = accounts[19];
    let e = accounts[20];
    let f = accounts[21];
    let g = accounts[22];
    let h = accounts[23];
    let i = accounts[24];
    let j = accounts[25];
    let k = accounts[26];
    let l = accounts[27];
    let m = accounts[28];
    let n = accounts[29];
    let o = accounts[30];
    let p = accounts[31];


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
        await Token.new(100000000*(10**6),"USDT","USDT",6,{from: owner}).then(instance=>{
          token = instance;
        });
        console.log("Token合约地址：",token.address);
        await RedPocket.new(companyAddrs, techAddrs , token.address, baseAmount , 5).then(async res => {
            instance = res;
            console.log("合约地址",instance.address);
            // balance = await token.balanceOf(instance.address);
            // console.log("合约地址以太坊余额：", balance);
            // web3.eth.transfer(instance.address,100,{from: a}).then(res=>{
            //   console.log("转1个以太坊到合约地址");
            // });
            // instance._techFee().then(res => {
            //     console.log("合约收取手续费：", web3.utils.fromWei(res,"ether"));
            // }).catch(res=>{
            //   console.log(res);
            // });

            // 批量给测试地址转1个ETH
            await utils.batchTransferToken(token, owner, accounts, 10000000000);

            // 设置红包大小
            await instance.setBaseAmount(baseAmount ,{from: owner}).then(async res=>{
              return await instance._baseAmount();
            }).then(res => {
              assert.equal(amount,BN(res).div(10**6).toFixed(),"红包大小应该为：" + amount);
            }).catch(err=>{
              console.log(err);
            });
           
        });

    });
    it('1.A玩家发送红包给0地址，查询没有没有推荐人', async() => {
        await sendPocket(zero, {from: a ,value: doubleAmount}).then(res => {
            return instance.getPlayerInfo({ from: a });
        }).then(res => {
            assert.equal(res[0],16,"A玩家ID应为16")
            assert.equal(res[1].toString(),zero,"A玩家推荐人应该为0地址");
            assert.equal(res[2],1,"A玩家等级应该为1")
        }).catch(err => {
            console.log("异常1：", err.reason || err);
        });
    });
    it('2.B玩家发送红包给A地址，查询B信息显示推荐人为A地址，A玩家的1级人脉数为1', async() => {
        await sendPocket(a, { from: b ,value: doubleAmount}).then(res => {
            return instance.getPlayerInfo({ from: b });
        }).then(res => {
            assert.equal(res[0],17,"B玩家ID应为17")
            assert.equal(a,res[1].toString(),"B玩家推荐人应该为A玩家的地址");
            assert.equal(res[2],1,"B玩家等级应该为1")
            return instance.getPlayerInfo({from: a});
        }).then(res => {
            console.log("A玩家各级人脉数",res[5]);
            // assert.equal(res[5][0],1,"A玩家1级人脉数应为1")
        }).catch(err => {
            console.log("异常2：", err.reason || err);
        });
    });
    it('3.C、D玩家给B地址发红包，A玩家的2级人脉数为2，B玩家的1级人脉数为1', async() => {
        await sendPocket(b, { from: c,value: doubleAmount}).then(res => {
            return sendPocket(b, { from: d ,value: doubleAmount});
        }).then(res => {
            return instance.getPlayerInfo({ from: a });
        }).then(res => {
            // console.log(res);
            assert.equal(1,res[3].length,"A玩家的直推数量应该为1");
            assert.equal(res[4],3,"A玩家的总人脉数应该为3");
            // assert.equal(res[5][0],1,"A玩家1级人脉数应为1");
            assert.equal(res[5][1],2,"A玩家的2级人脉数应该为2");
            return instance.getPlayerInfo({ from: b });
        }).then(res => {
            assert.equal(res[3].length,2,"B玩家直推人数应为2");
            assert.equal(res[1],a,"B玩家邀请人应为A");
            assert.equal(res[5][0],2,"B玩家1级人脉数应为2");
        }).catch(err=>{
            console.log("异常3：", err.reason || err);
        });
    });
    it('4.A玩家再直推2人E、F，A玩家发一个红包，升为2级',async()=>{
      await sendPocket(a, { from: e, value: doubleAmount});
      await sendPocket(a, { from: f, value: doubleAmount});
      await sendPocket(a, { from: a, value: baseAmount});
      instance.getPlayerInfo({ from: a }).then(res => {
          assert.equal(res[3].length,3,"A玩家直推人数应为3");
          assert.equal(res[2],2,"A玩家应升为2级");
      }).catch(err=>{
          console.log("异常4：", err.reason || err);
      });
    });
    it('5.C玩家直推G、H、I, C玩家发1个红包，升为2级',async()=>{
      await sendPocket(c, { from: g, value: doubleAmount});
      await sendPocket(c, { from: h, value: doubleAmount});
      await sendPocket(c, { from: i, value: doubleAmount});
      await sendPocket(c, { from: c, value: baseAmount});
      let p_count = await instance._pid();
      console.log("红包总数",p_count);
      // let rp = await instance._redPocketMap(p_count);
      // let to = rp['to'];// 红包的接收者
      // let toAddr = await instance._playerMap(to);
      // assert.equal(a,toAddr,"C玩家发的这个红包接收者应该是A");
      await instance.getPlayerInfo({ from: c }).then(async res => {
          assert.equal(res[3].length,3,"C玩家直推人数应为3");
          assert.equal(res[1],b,"C玩家邀请人应为B");
          assert.equal(res[2],2,"C玩家应升为2级");
          assert.equal(res[6].length,3,"C发出去的红包数量应为3");
          let toAddr = await instance._playerMap(res[6][res[6].length-1]);
          assert.equal(toAddr,a,"C玩家发的这个红包接收者应该是A");
      }).catch(err=>{
          console.log("异常4：", err.reason || err);
      });
    });
    it('6.H玩家直推J、K、L, H玩家发1个红包，升为2级，H发送红包的接收者应该为捡漏地址，因为B的等级没有达标（2）',async()=>{
      await sendPocket(h, { from: j, value: doubleAmount});
      await sendPocket(h, { from: k, value: doubleAmount});
      await sendPocket(h, { from: l, value: doubleAmount});
      await sendPocket(h, { from: h, value: baseAmount});
      let p_count = await instance._pid();
      console.log("红包总数",p_count);

      await instance.getPlayerInfo({ from: c }).then(res => {
          assert.equal(res[4],6,"C玩家总推荐人数应为6");
          return instance.getPlayerInfo({ from: a });
      }).then(res => {
          assert.equal(res[4],11,"A玩家总推荐人数应为11");
          assert.equal(res[7].length,4,"A玩家收到的红包数量应为4");
          return instance.getPlayerInfo({ from: h });
      }).then(res => {
          // 注：技术地址的id<=15
          assert.equal(res[6][res[6].length-1]<=15,true,"H玩家发的这个红包接收者应该是一个技术地址");
      }).catch(err=>{
          console.log("异常4：", err.reason || err);
      });
    });
});