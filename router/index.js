import Vue from 'vue';
import Cache from '@/script/cache';
import Router from 'vue-router';
import store from '../store/store';

Vue.use(Router);

const router = new Router({
  mode: 'history',   //build之后本地不能访问 hash
  routes: [
    { path: '/', component: () => import(/* webpackChunkName: 'page-home' */ '@/views/Home'), children: [

      { path: '/', component: () => import(/* webpackChunkName: 'page-workbench-index' */ '@/views/workbench/Index'), meta: { needlogin: true, menu: '/workbench' } },
      { path: '/workbench', component: () => import(/* webpackChunkName: 'page-workbench-index' */ '@/views/workbench/Index'), meta: { needlogin: true, menu: '/workbench' } },
      { path: '/workbench/editNotice', component: () => import(/* webpackChunkName: 'page-workbench-editnotice' */ '@/views/workbench/EditNotice'), meta: {needlogin: true, menu: '/workbench'} },
      { path: '/workbench/schoolsetting', component: () => import(/* webpackChunkName: 'page-workbench-schoolsetting' */ '@/views/BasicSetting/SchoolSetting'), meta: {needlogin: true, menu: '/workbench'} },

      { path: '/setting', component: () => import(/* webpackChunkName: 'page-setting-index' */ '@/views/BasicSetting/Index'), meta: {needlogin: true, menu: '/setting'} },
      { path: '/setting/wechat', component: () => import(/* webpackChunkName: 'page-setting-wechat' */ '@/views/BasicSetting/WechatSetting'), meta: {needlogin: true, menu: '/setting'} },

      { path: '/student/signed', component: () => import(/* webpackChunkName: 'page-student-signed' */ '@/views/student/NoSign'), meta: { needlogin: true, menu: '/student/signed' } },
      { path: '/student/nosign', component: () => import(/* webpackChunkName: 'page-student-nosign' */ '@/views/student/Signed'), meta: { needlogin: true, menu: '/student/nosign' } },
      { path: '/student/nosigndetail', component: () => import(/* webpackChunkName: 'page-student-nosigndetail' */ '@/views/student/NosignDetail'), meta: { needlogin: true, menu: '/student/nosign' } },
      { path: '/student/signeddetail', component: () => import(/* webpackChunkName: 'page-student-signeddetail' */ '@/views/student/SignedDetail'), meta: { needlogin: true, menu: '/student/signed' } },
      { path: '/student/importstudent', component: () => import(/* webpackChunkName: 'page-student-importstudent' */ '@/views/student/ImportStudent'), meta: { needlogin: true, menu: '/student/nosign' } },
      { path: '/student/nosignbuycourse', component: () => import(/* webpackChunkName: 'page-student-nosignbuycourse' */ '@/views/course/BuyCourse'), meta: { needlogin: true, menu: '/student/nosign' } },
      { path: '/student/signedbuycourse', component: () => import(/* webpackChunkName: 'page-student-signedbuycourse' */ '@/views/course/BuyCourse'), meta: { needlogin: true, menu: '/student/signed' } },

      { path: '/timetable/begrade', component: () => import(/* webpackChunkName: 'page-timetable-begrade' */ '@/views/timetable/BeGradeIndex'), meta: { needlogin: true } },
      { path: '/timetable/nograde', component: () => import(/* webpackChunkName: 'page-timetable-nograde' */ '@/views/timetable/NoGradeIndex'), meta: { needlogin: true } },

      { path: '/academic/classElimination', component: () => import(/* webpackChunkName: 'page-academic-classElimination' */ '@/views/academic/ClassElimination'), meta: { needlogin: true } },
      { path: '/academic/audition', component: () => import(/* webpackChunkName: 'page-academic-audition' */ '@/views/academic/Audition'), meta: { needlogin: true } },
      { path: '/academic/buy', component: () => import(/* webpackChunkName: 'page-academic-buy' */ '@/views/academic/Buy'), meta: { needlogin: true } },

      { path: '/staff', component: () => import(/* webpackChunkName: 'page-staff-index' */ '@/views/staffManage/Index'), meta: { needlogin: true } },
      { path: '/staff/detail', component: () => import(/* webpackChunkName: 'page-staff-detail' */ '@/views/staffManage/Detail'), meta: { needlogin: true, menu: '/staff' } },

      { path: '/course/begrade', component: () => import(/* webpackChunkName: 'page-course-begrade' */ '@/views/course/BeGrade'), meta: { needlogin: true, menu: '/course/begrade' } },
      { path: '/course/nograde', component: () => import(/* webpackChunkName: 'page-course-nograde' */ '@/views/course/NoGrade'), meta: { needlogin: true, menu: '/course/nograde' } },
      { path: '/course/detail', component: () => import(/* webpackChunkName: 'page-course-detail' */ '@/views/course/Detail'), meta: { needlogin: true, menu: '/course/begrade' } },

      { path: '/finance/income', component: () => import(/* webpackChunkName: 'page-finance-income' */ '@/views/finance/IncomeStatistics'), meta: { needlogin: true } },
      { path: '/finance/outlay', component: () => import(/* webpackChunkName: 'page-finance-outlay' */ '@/views/finance/OutlayStatistics'), meta: { needlogin: true } },
      { path: '/finance/refund', component: () => import(/* webpackChunkName: 'page-finance-refund' */ '@/views/finance/RefundStatistics'), meta: { needlogin: true } },
      { path: '/finance/assign', component: () => import(/* webpackChunkName: 'page-finance-assign' */ '@/views/finance/AssignPerformance'), meta: { needlogin: true } },

      { path: '/inventory/commodity', component: () => import(/* webpackChunkName: 'page-inventory-commodity' */ '@/views/inventory/Commodity'), meta: { needlogin: true } },
      { path: '/inventory/storage', component: () => import(/* webpackChunkName: 'page-inventory-storage' */ '@/views/inventory/Storage'), meta: { needlogin: true } },
      { path: '/inventory/borrow', component: () => import(/* webpackChunkName: 'page-inventory-borrow' */ '@/views/inventory/Borrow'), meta: { needlogin: true } },

      { path: '/statistics', component: () => import(/* webpackChunkName: 'page-statistics-index' */ '@/views/statistics/Index'), meta: { needlogin: true } },
    ] },
    { path: '/login', component: () => import(/* webpackChunkName: 'page-login' */ '@/views/Login'), meta: {needlogin: false} },
    { path: '/addschool', component: () => import(/* webpackChunkName: 'page-login' */ '@/views/SchoolArea'), meta: {needlogin: true} },
    { path: '/contract', component: () => import(/* webpackChunkName: 'page-login' */ '@/views/Contract') },
    { path: '/refundPrint', component: () => import(/* webpackChunkName: 'page-login' */ '@/views/RefundPrint') },
    { path: '/refresh', component: () => import(/* webpackChunkName: 'page-login' */ '@/views/Refresh') },
    { path: '*', component: () => import(/* webpackChunkName: 'page-login' */ '@/views/NotFound') },
  ]
});


//跳转之前先做判断
router.beforeEach((to, from, next) => {
  store.commit('stateChange', { state: 'loading' });
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