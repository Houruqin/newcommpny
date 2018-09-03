import Vue from 'vue';
import router from '../router'

const Cache = {
    get(key) {
        try {return JSON.parse(localStorage.getItem(key))} catch (error) {}
    },

    //设置local数据
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },

    //删除local、session数据
    remove(key) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    },

    //设置session数据
    setSession(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    },

    //获取session数据
    getSession(key) {
        try {return JSON.parse(sessionStorage.getItem(key))} catch (error) {}
    },

    // 保存用户信息
    setMemberInfo(memberinfo) {
        this.set('MEMBERINFO', memberinfo);
        this.set('MEMBERID', memberinfo.id);
    },

    // 获取用户信息
    getMemberInfo() { return this.get('MEMBERINFO') || {} },

    // 清除用户信息
	  removeMemberInfo() {
        this.remove('TOKEN');
        this.remove('MEMBERID');
        this.remove('MEMBERINFO');
    },

    //退出登录
    loginOut() {
        this.removeMemberInfo();
        if(router.app.$route.meta.needlogin) router.replace({path: '/login'});
    }
};


export default Vue.prototype.$$cache = Cache;