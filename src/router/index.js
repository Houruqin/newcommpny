import Vue from 'vue'
import cache from '@/script/cache'
import Router from 'vue-router'
import Home from '@/views/Home'
import Login from '@/views/Login'
import HomeRouter from './home'
import SchoolArea from '@/views/SchoolArea'
import Refresh from '@/views/Refresh' 
import Contract from '@/views/Contract'
import NotFoundComponent from '@/views/NotFound'

Vue.use(Router)

const routers = [
    {path: '', component: Home, children: HomeRouter},
    {path: '/login', component: Login, meta: {needlogin: false}},
    {path: '/addschool', component: SchoolArea, meta: {needlogin: true}},
    {path: '/home', component: Home, children: HomeRouter},
    {path: '/contract', component: Contract, name: 'contractView'},
    {path: '/refresh', component: Refresh},
    {path: '*', component: NotFoundComponent}
];


const router = new Router({
//   mode: 'history',   //build之后本地不能访问 hash
    routes: routers
});


//跳转之前先做判断
router.beforeEach((to, from, next) => {
    if(to.meta.needlogin === true && !cache.get('TOKEN') && !cache.getSession('TOKEN')) return router.replace({path: '/login'});
    next();
});

//跳转之后，页面到最顶部
router.beforeEach((to, from, next) => {
    window.scrollTo(0, 0);
    next();
});

export default router