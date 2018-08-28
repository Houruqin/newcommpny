import Vue from 'vue';
import Cache from '@/script/cache';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
    mode: 'history',   //build之后本地不能访问 hash
    routes: routers
});


//跳转之前先做判断
router.beforeEach((to, from, next) => {
    if(to.path == '/login' && (Cache.get('TOKEN') || Cache.getSession('TOKEN'))) return router.replace({path: '/home/workbench'});
    if(to.meta.needlogin === true && !Cache.get('TOKEN') && !Cache.getSession('TOKEN')) return router.replace({path: '/login'});
    next();
});

//跳转之后，页面到最顶部
router.beforeEach((to, from, next) => {
    window.scrollTo(0, 0);
    next();
});

export default router
