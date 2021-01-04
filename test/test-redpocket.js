const RedPocket = artifacts.require("RedPocket");
RedPocket.numberFormat = 'String';
let constractA;

let owner;
let companyAddrs;
let techAddrs;

//执行定义合约中的其他操作
contract('RedPocket',accounts => {
    let zero = '0x0000000000000000000000000000000000000000';
    let a = accounts[16];
    let b = accounts[17];
    let c = accounts[18];
    let d = accounts[19];
    let e = accounts[20];
    let balance = 0;

    before(async () => {
      // 初始化合约参数
      if("development" == network){
          // console.log("入参：{}，{}，{}",network,accounts);
          
          // 初始化合约参数
          owner = accounts[0];
          // console.log("部署合约", res);
          companyAddrs = accounts.slice(1,11);
          techAddrs = accounts.slice(11,16);
      }else{
          owner = "0xEAA5Df3Ef948b96269D1bf6C59cA2AD215B5997F";
          companyAddrs = [
              "0x13A01A598439D2894d4AEF4B0CB810f845a82148",
              "0xfFDDeF506F978A8888a89694B54013F311c54D8a",
              "0xE8d0B504a786D9C19B1451fb795A4fDD94DB359b",
              "0x10FBA3d753E31a23eEf7A3590B86d5A7cecf5720",
              "0x90A8AC2D268a4aA16523Ec35a6c9618e7d341902",
              "0x93ECba021eF015d6C3177E54140b5931CAc4A88C",
              "0x67B54A622c65A9506ccD25A4Ff5b9A79742FB303",
              "0xF0944b7519E59C97E5B1Ab9FEBf06cC47f40Db71",
              "0x7BcC8b8cEE2b2fe9d7b57ca861E0B09D4D8fDeC2",
              "0xF89dc58Da24bEb222E791E7E3A7C9b90651Ff5ce",
              ];
          techAddrs = [
              "0xc3F284bfb9f8b23F6b1922Ed84Ae3AE0eC906399",
              "0x2cf8cf35E87Ca530aa95f241431c0Fc5DA9D9693",
              "0xfefBc0864B67dADA68F88D9507A33ecaa5E3dB6E",
              "0x866484476625Eb08a866D0D62D7e6494d1e560A6",
              "0x81C7bB24e520694AfC07eBCA351D396562a48f53",
          ];
      }
      //构建合约(可以设置两种方式)
      //01
      RedPocket.deployed().then(async instance=>{
        constractA = instance;
        
        balance = await web3.eth.getBalance(instance.address);
        console.log("合约地址以太坊余额：",balance);
        // web3.eth.transfer(instance.address,100,{from: a}).then(res=>{
        //   console.log("转1个以太坊到合约地址");
        // });
        constractA._techFee().then(res=>{
          console.log("合约收取手续费：",res.toNumber());
        });
      });
      // RedPocket.at('0x28aefc8a603c089e018318878d5814501dD2D702').then(instance=>{
      //   console.log(instance);
      //   constractA = instance;
      // });

    });
    it('1.A玩家发送红包给0地址，查询没有没有推荐人', async () => {
      await constractA.sendPocket(zero,{from: a}).then(instance=>{
        return constractA.getPlayerInfo({from: a});
      }).then(res=>{
        console.log("A用户ID：", res[0].toNumber());
        console.log("A推荐人地址：", res[1]);
        console.log("A用户等级：", res[2].toNumber());
      //   return constractA.sendPocket.call(a,{from: b});
      // }).then(res=>{
      //   return constractA.getPlayerInfo.call(b,{from: b});
      // }).then(res=>{
      //   console.log("B用户ID：", res[0].toNumber());
      //   console.log("B用户等级：", res[2].toNumber());
        // console.log("合约地址以太坊余额：",web3.eth.getBalance(instance));
      }).catch(err=>{
        console.log("异常1：", err);
      });
    }); 
    it('2.B玩家发送红包给A地址，查询B信息显示推荐人为A地址',async() => {
      await constractA.sendPocket(a,{from: b}).then(res=>{
        return constractA.getPlayerInfo({from: b});
      }).then(res=>{
        console.log("B用户ID：", res[0].toNumber());
        console.log("B推荐人地址：", res[1].toString());
        console.log("B用户等级：", res[2].toNumber());
        assert.equal(res[1].toString(), a , "B的推荐人应该是A");
      }).catch(err=>{
          console.log("异常2：", err);
      });
    });
    it('3.C、D玩家给A地址发红包，A玩家发红包给0地址，A红包升为2星',async()=>{
      await constractA.sendPocket(a,{from:c}).then(res=>{
        return constractA.sendPocket(a,{from:d});
      }).then(res=>{
        return constractA.sendPocket(zero,{from:a});
      }).then(res=>{
        return constractA.getPlayerInfo({from: a});
      }).then(res=>{
        console.log("A用户等级：", res[2].toNumber());
        assert.equal(res[2].toNumber(),2,"A的星级应该升为2");
      });
    });
});