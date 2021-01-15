import Vue from 'vue'
import App from './App.vue'
import VueClipboard from 'vue-clipboard2'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n);    //通过插件的形式挂载
Vue.use(VueClipboard)
Vue.config.productionTip = false

console.log("当前环境模式：",process.env.NODE_ENV);
console.log("是否Token模式：",process.env.VUE_APP_TOKEN_MODE);
console.log("红包合约地址：",process.env.VUE_APP_REDPOCKET_ADDRESS);

// /*---------基本使用-----------*/
// const i18n = new VueI18n({
//  locale: 'CN',    // 语言标识
//  messages : {
//    en: {
//      message: {
//        hello: 'hello world'
//      }
//    },
//    cn: {
//      message: {
//        hello: '你好、世界'
//      }
//    }
//  }
// })
/*---------使用语言包-----------*/
const i18n = new VueI18n({
   locale: 'zh',    // 语言标识
   //this.$i18n.locale // 通过切换locale的值来实现语言切换
   messages: {
     'zh': require('./common/lang/zh'),   // 中文语言包
     'en': require('./common/lang/en')    // 英文语言包
   }
})

new Vue({
    i18n,
    render: h => h(App),
}).$mount('#app')