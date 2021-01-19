<template>
  <div
    class="content column align-center center"
    style="position: absolute; left: 30px; right: 30px;"
  >
    <div class="column" style="position:absolute; right: 0; top: 20px;">
      <div @click="changeLang()">
        <span>{{$t('message.convert_lang')}}</span>
      </div>
    </div>
    <div class="title-en">
      SIX CONTACTS
    </div>
    <div style="font-weight: 400; font-size: 48px;">{{$t('message.title')}}</div>
    <div class="text">{{$t('message.title2')}}</div>
    <div class="text" style="margin-bottom: 25px;white-space: nowrap;">
      {{$t('message.title3')}}
    </div>
    <div class="btn2" @click="sendPocket()" v-if="player.level!=9">{{$t('message.send')}}（{{ player.amount }}{{symbol}}）</div>
    <div class="btn2" v-if="player.level==9">{{$t('message.pending')}}</div>
    <div class="error">{{error}}</div>
    <div class="btn2" @click="copy()">
      <span>{{$t('message.copy_link')}}</span>
    </div>
    <div v-if="player.level!=0" style="margin: 0 20px; word-wrap: break-word; text-align: center; ">{{ player.shareUrl }}</div>
    <div style="margin: 0 20px; margin-bottom: 30px; text-align: left;" v-if="player.level==0">
      {{$t('message.copy_warn')}}
    </div>
    <div
      class="column align-start text statistic"
      style="width: 100%; padding: 10px;margin-top:20px;"
    >
      <div class="btn2" style="height: 30px; line-height: 30px; width: 280px;">
        {{$t('message.statistics')}}
      </div>
      <div>{{$t('message.invitees')}}：<span style="font-size:12px; font-weight: 400;">{{ player.referer ? player.referer + "（" + $t('message.bound')+"）" : referer && player.id == 0 ? referer+'（'+$t("message.unbound")+'）':$t('message.nothing') }}</span></div>
      <div>{{$t('message.current_level')}}：{{ player.level }}</div>
      <div>{{$t('message.total_level_count')}}：{{ player.allCount }}</div>
      <div v-if="language == 0" class="column">
        <span v-for="(v, i) in player.levelCount" :key="i">
          {{ i + 1 }}{{$t('message.level_count')}}：{{ v }}
        </span>
      </div>
      <div v-if="language == 1" class="column">
        <span v-for="(v, i) in player.levelCount" :key="i">
          {{$t('message.level_count')}} {{ i + 1 }}：{{ v }}
        </span>
      </div>
      <div>
        {{$t('message.received_count')}}：
      </div>
      <div>
        {{player.receivedCount}}
      </div>
      <div>
        {{$t('message.received_amount')}}：
      </div>
      <div>
        {{player.receivedAmount}} {{symbol}}
      </div>
    </div>
    <div class="btn2" style="height: 30px; line-height: 30px; width: 280px;">
      {{$t('message.rules_title')}}
    </div>
    <div
      class="column align-center"
      style="text-align: left; display: flex; margin: 20px;"
    >
      <pre
        class="text"
        style="word-wrap: break-word; white-space: pre-wrap; width: 88%;"
      >
{{$t('message.rules')}}
  </pre>
    </div>
    <div class="toast" v-show="toastShow">
      {{toastText}}
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import Web3 from 'web3'
import contract from 'truffle-contract'
import BN from 'bignumber.js'
import rpUDSTAbi from '../../../../build/contracts/RedPocketOfUSDT.json'
import rpAbi from '../../../../build/contracts/RedPocket.json'
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
        directPushs: [],
        // sendList:[],
        // receivedList:[],
        receivedCount:0,
        sendAmount:0,
        receivedAmount:0,
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
      toastText: '',
      language: 0,
      lang: [{
          label: this.$t('message.zh'),       //模板语法的一种
          value: 0
        }, {
          label: this.$t('message.en'),
          value: 1
        }],
    }
  },
  watch: {    //侦听器
    language: function (val) {       //侦听单选按钮的变化，从而进行切换语言
      val === 0 ? this.$i18n.locale = 'zh' : this.$i18n.locale = 'en';
      Vue.set(this.lang, 0, {label: this.$t('message.zh'), value: 0});
      Vue.set(this.lang, 1, {label: this.$t('message.en'), value: 1})
      /**
      this.lang: [{
        label: this.$t('message.zh'),       //如果不使用Vue.set，也可以使用更新数据的方法
        value: 0
      }, {
        label: this.$t('message.en'),
        value: 1
      }]
      **/
    }
  },
  mounted() {
    this.$i18n.locale === 'zh' ? this.language = 0 : this.language = 1   //数据加载时判断当前属于哪种语言，为其单选按钮赋值
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
    changeLang:function(){
      this.language = this.language == 0 ? 1 : 0;
      // window.location.reload();
    },
    toast (e) {
      let self = this
      self.toastText = e
      self.toastShow = true
      setTimeout(function(){
        self.toastShow = false
      }, 1500)
    },
    showError(err){
      this.error = err;
      let that = this;
      setTimeout(function(){
        that.error = '';
      },1500);
    },
    copy:function(){
      if(this.player.id==0){
        return;
      }
      let container = this.$refs.container
      this.$copyText(this.player.shareUrl, container)
      this.showError(this.$t('message.copy_success'));
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
      let balance = this.web3.utils.fromWei(await this.web3.eth.getBalance(this.account));
      console.log('余额', BN(balance).toFixed(), this.player.amount);
      if(balance < this.player.amount){
        this.showError(this.$t('message.balance_low'));
        return;
      }

      let nonce = await this.web3.eth.getTransactionCount(this.account);
      console.log("nonce",nonce);
      if(nonce!=0){
        nonce = nonce+1;
      }
      this.redpocket.sendPocket(this.referer||'0x0000000000000000000000000000000000000000', {
        from: this.account,
        value: this.web3.utils.toWei(this.player.amount+'','ether'),
        nonce: nonce,
        gas: 400000
      }).then(()=>{
        console.log("刷新玩家信息");
        this.initPlayerState();
      }).catch(err=>{
        if(err.reason === 'Not up to standard'){
          this.showError(this.$t('message.upgrade_error_v5'));
        }
        console.log("合约调用异常",err);
      });
    },
    sendByToken:async function(){
      // 查询代币余额
      let balance = await this.token.balanceOf(this.account);
      console.log('余额', BN(balance).toFixed(), this.player.amount);
      if(balance < this.player.amount){
        this.showError(this.$t('message.balance_low'));
        return;
      }
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
          this.showError(this.$t('message.upgrade_error_v5'));
        }
        console.log("合约调用异常",err);
      });

      
    },
    sendPocket:async function(){
      this.error = '';
      console.log("推荐人",this.referer);
      console.log("发送金额",this.player.amount);
      // 升v2、v5前检查推广条件
      if(this.player.level == 1 && this.player.directPushs.length<3){
        this.showError(this.$t('message.upgrade_error_v2'));
        return;
      }
      console.log("levelCount:",this.player.levelCount);
      let count = parseInt(this.player.levelCount[0])+parseInt(this.player.levelCount[1])+parseInt(this.player.levelCount[2])+parseInt(this.player.levelCount[3]);
      console.log("count:",count);
      if(this.player.level == 4){
        if(count < 81){
          this.showError(this.$t('message.upgrade_error_v5'));
          return;
        }
      }
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
      console.log('provider',this.provider);
      this.web3 = new Web3(this.provider)
      this.web3.eth.getAccounts().then((accs) => {
        this.account = accs[0]
      })
    },
    initContract: async function () {
      this.isTokenMode = process.env.VUE_APP_TOKEN_MODE === 'true';
      console.log("合约版本：", this.isTokenMode );
      this.symbol = this.isTokenMode ? 'USDT':'ETH';

      this.redpocketAddress = process.env.VUE_APP_REDPOCKET_ADDRESS;
      let RedPocketContract = contract(rpAbi);
      

      if(this.isTokenMode){
        this.tokenAddress = process.env.VUE_APP_TOKEN_ADDRESS;
        const TokenContract = contract(tokenAbi)
        TokenContract.setProvider(this.provider)
        this.token = await TokenContract.at(this.tokenAddress)
        console.log("代币合约地址：",this.tokenAddress);
        RedPocketContract = contract(rpUDSTAbi);
      }

      RedPocketContract.setProvider(this.provider)
      this.redpocket = await RedPocketContract.at(this.redpocketAddress)
      
    },
    initConfigState: async function(){
      if(this.isTokenMode){
        await this.redpocket._baseAmount().then(res=>{
          this.baseAmount = BN(res).div(10**6).toFixed();
          console.log("基数", this.baseAmount);
        });
      }else{
        await this.redpocket._baseAmount().then(res=>{
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
      this.player.receivedCount = player[6];
      this.player.receivedAmount = BN(player[6]).multipliedBy(this.baseAmount);
      
      // this.player.sendList = player[6];
      // this.player.receivedList = player[7];
      // console.log(this.player.directPushs);
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
