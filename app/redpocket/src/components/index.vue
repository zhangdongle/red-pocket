<template>
  <div
    class="content column align-center center"
    style="position: absolute; left: 30px; right: 30px;"
  >
    <div class="title-en">
      SIX CONTACTS
    </div>
    <div style="font-weight: 400; font-size: 48px;">六度红包</div>
    <div class="text">基于六度人脉理论</div>
    <div class="text" style="margin-bottom: 25px;">
      用智能合约来验证你的人际长度
    </div>
    <div class="btn2" @click="sendPocket()" v-if="player.level!=9">发红包（{{ player.amount }}{{symbol}}）</div>
    <div class="btn2" v-if="player.level==9">等待红包</div>
    <div class="error">{{error}}</div>
    <div class="btn2" @click="copy()">
      <span>复制游戏邀请链接</span>
    </div>
    <div v-if="player.level!=0" style="margin: 0 20px; word-wrap: break-word; text-align: center; ">{{ player.shareUrl }}</div>
    <div style="margin: 0 20px; margin-bottom: 30px; text-align: left;" v-if="player.level==0">
      发送第一个红包即会出现游戏邀请链接！
    </div>
    <div
      class="column align-start text statistic"
      style="width: 100%; padding: 10px;margin-top:20px;"
    >
      <div class="btn2" style="height: 30px; line-height: 30px; width: 280px;">
        当前统计
      </div>
      <div>邀请人：<span style="font-size:12px; font-weight: 400;">{{ player.referer ? player.referer + "（已绑定）" : referer ? referer+'（未绑定）':'无' }}</span></div>
      <div>目前级：{{ player.level }}</div>
      <div>当前总人脉数：{{ player.allCount }}</div>
      <span v-for="(v, i) in player.levelCount" :key="i">
        {{ i + 1 }}阶人脉数：{{ v }}
      </span>
    </div>
    <div class="btn2" style="height: 30px; line-height: 30px; width: 280px;">
      游戏规则
    </div>
    <div
      class="column align-center"
      style="text-align: left; display: flex; margin: 20px;"
    >
      <pre
        class="text"
        style="word-wrap: break-word; white-space: pre-wrap; width: 88%;"
      >
  1\基于六度人脉理论及以太坊合约算法实现去信任，去中心化运行。

  2\合约地址：{{redpocketAddress}}

  3\参与游戏只需要三个动作，发红包给其他人，邀请其他人参与游戏，提取其他人发给你的红包。

  4\游戏规则：
      发送红包约定为0.5ETH/个，1个地址最多发送11个红包；接收红包为0.5ETH/个；接收红包不限量，接收数量从你开始所产生的邀请关系越多，那么后续你所收到的红包就越多。

      成为v1
      发送两个红包给其他两个参与地址即可成为v1，此时才可以邀请好友，并获得一阶地址的参与红包。
      (说明：一阶地址指你邀请的参与地址，二阶地址指你邀请的参与地址 再邀请进来的参与地址，三阶到九阶地址以此类推）
      成为v2
      向一个地址发送一个红包并邀请三个地址成为v1，即可成为v2，此时二阶地址要成为v2时，都会向你发送一个红包。（同时享有v1收取的红包权限）
      成为v3
      v2后向一个地址发送一个红包，即可成为v3，此时三阶地址要成为v3时，都会向你发送一个红包。（同时享有v1-v2收取的红包权限）
      成为v4
      v3后向一个地址发送一个红包，即可成为v4，此时四阶地址要成为v4时，都会向你发送一个红包。（同时享有v1-v3收取的红包权限）
      成为v5
      v4后向两个地址发送两个红包，且你的邀请关系队伍中四阶内至少有81个参与游戏的地址用户，即可成为v5，此时五阶地址要成为v5时，都会向你发送一个红包。且五阶地址成为v1时，都会向你发送一个红包。（同时享有v1-v4收取的红包权限）
      成为v6
      v5后向一个地址发送一个红包，即可成为v6，此时六阶地址要成为v6时，都会向你发送一个红包。（同时享有v1-v5收取的红包权限）
      成为v7
      v6后向一个地址发送一个红包，即可成为v7，此时七阶地址要成为v7时，都会向你发送一个红包。（同时享有v1-v5收取的红包权限）
      成为v8
      v7后向一个地址发送一个红包，即可成为v8，此时八阶地址要成为v8时，都会向你发送一个红包。（同时享有v1-v5收取的红包权限）
      成为v9
      v8后向两个地址发送两个红包，即可成为v9，此时九阶地址要成为v9时，都会向你发送一个红包。且五阶地址成为v5时，都会向你发送一个红包。（同时享有v1-v8收取的红包权限）
      
      超出你的等级所发生的阶梯红包，合约将把红包匹配给技术服务地址作为技术奖励。

  5\游戏理论效果： 
  每个参与用户若扩散3人且按照规则发送11个红包
  总发出红包为0.5ETHx11=5.5ETH 
  v1累计收取红包 
  3x0.5ETH=1.5ETH
  v2累计收取红包 
  （3+9）x0.5ETH=6ETH 
  v3累计收取红包
  （3+9+27）x0.5ETH=19.5ETH 
  v4累计收取红包 
  （3+9+27+81）x0.5ETH=60ETH
  v5累计收取红包 
  （3+9+27+81+243+243）x0.5ETH=303ETH 
  v6累计收取红包
  （3+9+27+81+243+243+729）x0.5ETH=667.5ETH 
  v7累计收取红包
  （3+9+27+81+243+243+729+2187）x0.5ETH=1761ETH 
  v8累计收取红包
  （3+9+27+81+243+243+729+2187+6561）x0.5ETH=5041.5ETH 
  v9累计收取红包
  （3+9+27+81+243+243+729+2187+6561+19683+243）x0.5ETH=15004.5ETH
  </pre>
    </div>
    <div class="toast" v-show="toastShow">
      {{toastText}}
    </div>
  </div>
</template>

<script>
import Web3 from 'web3'
import contract from 'truffle-contract'
import BN from 'bignumber.js'
import rpAbi from '../../../../build/contracts/RedPocketOfUSDT.json'
import tokenAbi from '../../../../build/contracts/TetherToken.json'
export default {
  name: 'RedPocket',
  data() {
    return {
      player: {
        amount: 0,
        shareUrl: '',
        referer: '', // 我的推荐人
        level: 0,
        allCount: 0,
        levelCount: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        directPushs: []
      },
      domain: '',
      baseAmount: 0,
      referer:'', // 未投资时的推荐人，从链接获取的
      redpocket: '',
      token:'',
      timer:'',
      error:'',
      tokenAddress:'',
      redpocketAddress:'',
      isTokenMode:false,
      symbol:'',
      toastShow: false,
      toastText: ''
    }
  },
  async created() {
    this.initDomain();
    //  初始化 web3及账号
    await this.initWeb3Account()
    //  初始化合约实例
    await this.initContract()
    //  初始化配置信息
    await this.initConfigState();
    //  获取合约的状态信息
    await this.initPlayerState()
    this.timer = setInterval(() => {
      this.web3.eth.getAccounts().then((accs) => {
        if(this.account != accs[0]){
          console.log("玩家切换了账户");
          // 刷新用户信息
          this.account = accs[0];
          this.initPlayerState();
        }
      })
    }, 500);
  },
  methods: {
    toast (e) {
      let self = this
      self.toastText = e
      self.toastShow = true
      setTimeout(function(){
        self.toastShow = false
      }, 1500)
    },
    copy:function(){
      if(this.player.id==0){
        return;
      }
      let container = this.$refs.container
      this.$copyText(this.player.shareUrl, container)
      this.toast('复制成功');
    },
    getUrlKey: function (name) {
        return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.href) || ["",""])[1].replace(/\+/g, '%20')) || null
    },
    initDomain: function(){
      let referer = this.getUrlKey("r");
      if(referer){
        this.referer = referer; 
      }
      this.domain = window.location.href;
      console.log(this.domain);
      if(this.domain.indexOf("?") != -1){
        this.domain = this.domain.split("?")[0];
      }
    },
    sendByETH:async function(){
      let nonce = await this.web3.eth.getTransactionCount(this.account);
      console.log("nonce",nonce);
      if(nonce!=0){
        nonce = nonce+1;
      }
      this.redpocket.sendPocket(this.referer||'0x0000000000000000000000000000000000000000', {
        from: this.account,
        value: this.web3.utils.toWei(this.player.amount+'','ether'),
        nonce: nonce,
        gas: 200000
      }).then(()=>{
        console.log("刷新玩家信息");
        this.initPlayerState();
      }).catch(err=>{
        if(err.reason === 'Not up to standard'){
          this.error = '1-4阶邀请人数不足';
        }
        console.log("合约调用异常",err);
      });
    },
    sendByToken:async function(){
      let amount = BN(this.player.amount).multipliedBy(10**6).toFixed();
      let allowance = await this.token.allowance(this.account,this.redpocketAddress);
      if(allowance > 0){
        await this.token.approve(this.redpocketAddress, 0 ,{from: this.account});
      }
      this.token.approve(this.redpocketAddress, amount ,{
        from: this.account
      }).then(async ()=>{
        let nonce = await this.web3.eth.getTransactionCount(this.account);
        console.log("nonce",nonce);
        if(nonce!=0){
          nonce = nonce+1;
        }
        return this.redpocket.sendPocket(this.referer||'0x0000000000000000000000000000000000000000', {
          from: this.account,
          gas: 300000,
          nonce: nonce,
        });
      }).then(()=>{
          console.log("刷新玩家信息");
          this.initPlayerState();
      }).catch(err=>{
        if(err.reason === 'Not up to standard'){
          this.error = '未满足升级条件';
        }
        console.log("合约调用异常",err);
      });

      
    },
    sendPocket:async function(){
      console.log("推荐人",this.referer);
      console.log("发送金额",this.player.amount);
      if(this.isTokenMode){
        this.sendByToken();
      }else{
        this.sendByETH();
      }
      
    },
    initWeb3Account: async function () {
      if (window.ethereum) {
        this.provider = window.ethereum
        try {
          await window.ethereum.enable()
        } catch (error) {
          //   console.log("User denied account access");
        }
      } else if (window.web3) {
        this.provider = window.web3.currentProvider
      } else {
        this.provider = new Web3.providers.HttpProvider(
          'http://192.168.1.118:7545',
        )
      }
      this.web3 = new Web3(this.provider)
      this.web3.eth.getAccounts().then((accs) => {
        this.account = accs[0]
      })
    },
    initContract: async function () {
      this.isTokenMode = process.env.VUE_APP_TOKEN_MODE;
      this.symbol = this.isTokenMode?'USDT':'ETH';
      this.redpocketAddress = process.env.VUE_APP_REDPOCKET_ADDRESS;
      this.tokenAddress = process.env.VUE_APP_TOKEN_ADDRESS;
      console.log("红包合约地址：",this.redpocketAddress);
      console.log("代币合约地址：",this.tokenAddress);
      const RedPocketContract = contract(rpAbi)
      const TokenContract = contract(tokenAbi)
      RedPocketContract.setProvider(this.provider)
      TokenContract.setProvider(this.provider)
      // this.redpocket = await RedPocketContract.deployed()
      this.redpocket = await RedPocketContract.at(this.redpocketAddress)
      this.token = await TokenContract.at(this.tokenAddress)
    },
    initConfigState: async function(){
      if(this.isTokenMode){
        this.redpocket._baseAmount().then(res=>{
          this.baseAmount = BN(res).div(10**6).toFixed();
          console.log("基数", this.baseAmount);
        });
      }else{
        this.redpocket._baseAmount().then(res=>{
          this.baseAmount = this.web3.utils.fromWei(res,'ether');
            console.log("基数", this.baseAmount);
        });
      }
      
    },
    initPlayerState: async function () {
      this.player.directPushs = [];
      const player = await this.redpocket.getPlayerInfo.call({ from: this.account });
      this.player.id = BN(player[0]).toFixed();
      this.player.referer = player[1] == '0x0000000000000000000000000000000000000000'?'':player[1];
      this.player.level = BN(player[2]).toFixed();
      if(this.player.level == 0 || this.player.level == 4){
        this.player.amount = this.baseAmount * 2;
      }else{
        this.player.amount = this.baseAmount;
      }
      this.player.shareUrl = this.domain + "?r="+this.account;
      this.player.allCount = BN(player[4]).toFixed();
      let levelCount = player[5];
      for(var i in levelCount){
        this.player.levelCount[i] = BN(levelCount[i]).toFixed();
      }
      console.log(this.player)
      for(var j in player[3]){
        this.player.directPushs.push(BN(player[3][j]).toFixed());
      }
      console.log(this.player.directPushs);
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style >
body {
  width: 100%;
  background-image: url('../assets/bg.png');
  background-size: 100% auto;
  background-repeat: no-repeat;
  display: flex;
  color: rgb(252, 245, 192);
}
div {
  font-size: 14px;
  font-family: STHeiti;
}
.title-en {
  opacity: 0.8;
  font-size: 12px;
  letter-spacing: 5px;
  font-weight: 200;
  margin-top: 330px;
}
.statistic {
  display: flex;
  background-color: rgb(206, 135, 138);
  widows: 100%;
  margin-bottom: 30px;
}
.text {
  color: rgb(252, 245, 192);
  line-height: 25px;
  font-weight: 600;
}
.btn2 {
  color: rgb(252, 245, 192);
  margin: 10px auto;
  background-color: rgb(244, 43, 51);
  height: 50px;
  font-size: 18px;
  line-height: 50px;
  text-align: center;
  width: 220px;
  border-radius: 50px;
}
.row {
  display: flex;
  flex-direction: row;
}
.column {
  display: flex;
  flex-direction: column;
}
.center {
  justify-content: center;
}
.between {
  justify-content: space-between;
}
.flex-start {
  justify-content: flex-start;
}
.align-center {
  align-items: center;
}
.align-start {
  align-items: flex-start;
}
.error {
  height: 30px;
  line-height: 30px;
}
.toast{
  position: fixed;
  z-index: 2000;
  left: 50%;
  top:45%;
  transition:all .5s;
  -webkit-transform: translateX(-50%) translateY(-50%);
      -moz-transform: translateX(-50%) translateY(-50%);
      -ms-transform: translateX(-50%) translateY(-50%);
        -o-transform: translateX(-50%) translateY(-50%);
          transform: translateX(-50%) translateY(-50%);
  text-align: center;
  border-radius: 5px;
  color:#FFF;
  background: rgba(17, 17, 17, 0.7);
  height: 45px;
  line-height: 45px;
  padding: 0 15px;
  max-width: 150px;
}
</style>
