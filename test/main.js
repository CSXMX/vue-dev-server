import Vue from 'vue'
import App from './test.vue'

console.log('进入主函数1');
new Vue({
  render: h => h(App)
}).$mount('#app')