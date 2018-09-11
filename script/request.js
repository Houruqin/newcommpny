
import Vue from 'vue';
import axios from 'axios';
import qs from 'qs';
import cache from './cache';
import config from 'config';
import Bus from '../script/bus';
import store from '../store/store';
import { Message } from 'element-ui';
import Router from '../router';

//全局配置baseURL和超时时间  根据当前环境 development开发/ production生产正式,申明不同的baseURL
axios.defaults.baseURL = config.api;
axios.defaults.timeout = 1e4; //超时时间

// 用于调试
let query = qs.parse(location.search.replace(/^\?/, ''));

if (query.debugger) {
  axios.defaults.baseURL = /^http/.test(query.debugger) ? query.debugger : `http://${query.debugger}`;
}

const DEFAULT_DATA = {}; //默认的公共参数


//请求之前拦截器
axios.interceptors.request.use(config => {
  config.headers.Authorization = cache.get('TOKEN') || cache.getSession('TOKEN') || 'reset';

  return config;
}, error => {
  return Message.warning('请求错误，请稍后再试');
}
);


//请求完成之后的拦截器
axios.interceptors.response.use(res => {
  if (config.version !== res.headers.version) {
    return window.location.reload(true);
  }

  let result = res.data;

  switch (result.code) {
    case 1:
      if (result.data.token) {
        if (cache.get('isRemember')) {
          cache.set('TOKEN', result.data.token);
        } //是否记住密码，保存不同的位置
        else {
          cache.setSession('TOKEN', result.data.token);
        }
        cache.setMemberInfo(result.data.user);
        Bus.$emit('refreshSchoolLists');
      }

      // if(result.data.user) cache.setMemberInfo(result.data.user);

      return result.data;
    // case 3:
    //     Message.warning(result.message);
    //     return null;
    case 1001:
      if (!store.state.isOutOfLine) {
        cache.loginOut();
        if (Router.app.$route.path !== '/help') {
          Message.warning(result.message);
        }
        store.state.isOutOfLine = true;
      }

      return null;
    default:
      let errorMsg = result.message || '请求错误，请稍后再试';

      store.state.pageState === 'loaded' ? Message.warning(errorMsg) : store.commit('stateChange', { state: 'error', errorMsg });

      return null;
  }
}, error => {
  let result = error.response || {};
  let errorMsg = '';

  switch (result.status) {
    case 403:
      errorMsg = '您没有操作权限';
      break;
    case 401:
      return cache.loginOut();
    default:
      errorMsg = '请求失败，请稍后再试';
  }

  store.state.pageState === 'loaded' ? Message.warning(errorMsg) : store.commit('stateChange', { state: 'error', errorMsg });

  return null;
});


const Request = {
  /**
	 * @param {String} url 请求url
	 * @param {Object} params 请求参数
     * @param {object} options 请求配置config
	 */
  get (url, data, options) {
    let params = { ...DEFAULT_DATA, ...data };


    return axios.get(`${url}?${qs.stringify(params)}`, { options });
  },

  post (url, data, options) {
    return axios.post(url, { ...DEFAULT_DATA, ...data }, { options });
  }
};


export default Vue.prototype.$$request = Request;
