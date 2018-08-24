// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import Element from 'element-ui'
import store from './store/store'

//引入封装js
import './script/request'
import './script/cache'
import './script/tools'
import { $date } from './script/$date'

//引入插件
import './script/Blob.js'
import './script/Export2Excel.js'

import 'element-ui/lib/theme-chalk/index.css'
// import './font/iconfont.css'

import './styles/common'; //公共样式
import './styles/cover'; //覆盖elementUI组件的样式
import './styles/calendar'; //日历样式

Vue.config.productionTip = false
Vue.use(Element)

Vue.prototype.$format_date = $date;

Vue.filter('date', function (val, type) {
  if (!val) return '';
  return $date(val, type);
});

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
});
