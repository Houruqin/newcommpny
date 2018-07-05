
import Vuex from 'vuex';
import Vue from 'vue';
import axios from 'axios';
import $$cache from '../script/cache'
import $$request from '../script/request'

Vue.use(Vuex);

const state = { 
    token: null,
    phone: null,
    guide: false
};

const mutations = {
    // 用户登录成功，存储 token 并设置 header 头
    logined(state, token) {
        state.token = token;
        $$cache.set('TOKEN', token); 
    },

    // 用户刷新 token 成功，使用新的 token 替换掉本地的token
    refreshToken(state, token) {
        state.token = token;
        $$cache.set('TOKEN', token); 
        axios.defaults.headers.common['Authorization'] = state.token;    //新的token添加到请求头部header配置项内
    },

    //登录成功后拉取用户的信息存储到本地
    profile(state, data) {
        state.phone = data.phone;    
    },

    // 用户退出登录，清除本地数据
    loginOut(state) {
        state.phone = null;
        $$cache.remove('TOKEN', res.data.token); 
    },

    //引导页改变
    guideChange(state, type) {
        state.guide = type;
    }
};

const actions = {
    // 登录成功后保存用户信息
    logined({dispatch, commit}, token) {
        return new Promise((resolve, reject) => {
            commit('logined', token);
            axios.defaults.headers.common['Authorization'] = token;
            // dispatch('profile', {}).then(res => {
            //     if(res.status === 200) {
            //         commit('profile', res.data);
            //         resolve();
            //     } else {
            //         reject();
            //     }
            // })
        })
    },


    //退出登录
    loginOut({commit}) {
        return new Promise((resolve, reject) => {
            commit('loginOut');
            //调用退出登录接口

            // $$request.post('auth/logout', {}).then(respond => {
            //     Vue.$router.push({name:'login'})
            // })
        });
    },

    // 将刷新的 token 保存至本地
    refreshToken({commit}, token) {
        return new Promise(function (resolve, reject) {
            commit('refreshToken', token)
        })
    },

    guideChange(context, type) {
        context.commit('guideChange', type);
    }
};


export default  new Vuex.Store({
    state,
    mutations,
    actions
});