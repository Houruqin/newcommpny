import Vue from 'vue';
import Cache from '@/script/cache';
import Router from 'vue-router';
import store from '../store/store';
import qs from 'qs';
import Rquest from '@/script/request';

Vue.use(Router);

const router = new Router({
  mode: 'history', //build之后本地不能访问 hash
  routes: [
    { path: '/', component: () => import(/* webpackChunkName: 'page-home' */ '@/views/Home'), meta: { needlogin: true }, children: [

      { path: '/', component: () => import(/* webpackChunkName: 'page-workbench-index' */ '@/views/workbench/Index'), meta: { needlogin: true, menu: '/' } },
      { path: '/workbench/editNotice', component: () => import(/* webpackChunkName: 'page-workbench-editnotice' */ '@/views/workbench/EditNotice'), meta: {needlogin: true, menu: '/'} },
      { path: '/workbench/schoolsetting', component: () => import(/* webpackChunkName: 'page-workbench-schoolsetting' */ '@/views/BasicSetting/SchoolSetting'), meta: {needlogin: true, menu: '/'} },
      // 教学记录路由
      // { path:'/timetable/begrade', component: () => import('../components/common/AddTeachRecord'), meta: { needlogin: true, menu: '/'}},

      { path: '/setting', component: () => import(/* webpackChunkName: 'page-setting-index' */ '@/views/BasicSetting/Index'), meta: {needlogin: true, menu: '/setting'} },
      { path: '/setting/wechat', component: () => import(/* webpackChunkName: 'page-setting-wechat' */ '@/views/BasicSetting/WechatSetting'), meta: {needlogin: true, menu: '/setting/wechat'} },
      { path: '/setting/system', component: () => import(/* webpackChunkName: 'page-setting-wechat' */ '@/views/BasicSetting/System'), meta: {needlogin: true, menu: '/setting/system'} },
      { path: '/setting/authority', component: () => import(/* webpackChunkName: 'page-setting-wechat' */ '@/views/BasicSetting/Authority'), meta: {needlogin: true, menu: '/setting/authority'} },

      { path: '/student/signed', component: () => import(/* webpackChunkName: 'page-student-signed' */ '@/views/student/Signed'), meta: { needlogin: true, menu: '/student/signed' } },
      { path: '/student/nosign', component: () => import(/* webpackChunkName: 'page-student-nosign' */ '@/views/student/NoSign'), meta: { needlogin: true, menu: '/student/nosign' } },
      { path: '/student/nosigndetail', component: () => import(/* webpackChunkName: 'page-student-nosigndetail' */ '@/views/student/NosignDetail'), meta: { needlogin: true, menu: '/student/nosign' } },
      { path: '/student/signeddetail', component: () => import(/* webpackChunkName: 'page-student-signeddetail' */ '@/views/student/SignedDetail'), meta: { needlogin: true, menu: '/student/signed' } },
      { path: '/student/importstudent', component: () => import(/* webpackChunkName: 'page-student-importstudent' */ '@/views/student/ImportStudent'), meta: { needlogin: true, menu: '/student/nosign' } },
      { path: '/student/nosignbuycourse', component: () => import(/* webpackChunkName: 'page-student-nosignbuycourse' */ '@/views/course/BuyCourse'), meta: { needlogin: true, menu: '/student/nosign' } },
      { path: '/student/signedbuycourse', component: () => import(/* webpackChunkName: 'page-student-signedbuycourse' */ '@/views/course/BuyCourse'), meta: { needlogin: true, menu: '/student/signed' } },
      { path: '/student/changecourse', component: () => import(/* webpackChunkName: 'page-student-signedbuycourse' */ '@/views/student/ChangeCourse'), meta: { needlogin: true, menu: '/student/signed' } },


      { path: '/timetable/begrade', component: () => import(/* webpackChunkName: 'page-timetable-begrade' */ '@/views/timetable/BeGradeIndex'), meta: { needlogin: true } },
      { path: '/timetable/nograde', component: () => import(/* webpackChunkName: 'page-timetable-nograde' */ '@/views/timetable/NoGradeIndex'), meta: { needlogin: true } },

      { path: '/academic/classElimination', component: () => import(/* webpackChunkName: 'page-academic-classElimination' */ '@/views/academic/ClassElimination'), meta: { needlogin: true } },
      { path: '/academic/audition', component: () => import(/* webpackChunkName: 'page-academic-audition' */ '@/views/academic/Audition'), meta: { needlogin: true } },
      { path: '/academic/buy', component: () => import(/* webpackChunkName: 'page-academic-buy' */ '@/views/academic/Buy'), meta: { needlogin: true } },
      { path: '/academic/teacherLesson', component: () => import(/* webpackChunkName: 'page-academic-buy' */ '@/views/academic/TeacherLesson'), meta: { needlogin: true } },
      { path: '/academic/changeCourse', component: () => import(/* webpackChunkName: 'page-academic-buy' */ '@/views/academic/ChangeCourse'), meta: { needlogin: true } },

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

      { path: '/statistics', component: () => import(/* webpackChunkName: 'page-statistics-index' */ '@/views/statistics/Index'), meta: { needlogin: true } }
    ] },
    { path: '/login', component: () => import(/* webpackChunkName: 'page-login' */ '@/views/Login'), meta: {needlogin: false} },
    { path: '/addschool', component: () => import(/* webpackChunkName: 'page-addschool' */ '@/views/SchoolArea'), meta: {needlogin: true} },
    { path: '/contract', component: () => import(/* webpackChunkName: 'page-contract' */ '@/views/Contract'), meta: {needlogin: true} },
    { path: '/refundPrint', component: () => import(/* webpackChunkName: 'page-refundPrint' */ '@/views/RefundPrint'), meta: {needlogin: true} },
    { path: '/refresh', component: () => import(/* webpackChunkName: 'page-refresh' */ '@/views/Refresh') },
    { path: '/help', component: () => import(/* webpackChunkName: 'page-help' */ '@/views/Help') },
    { path: '*', component: () => import(/* webpackChunkName: 'page-404' */ '@/views/NotFound') }
  ]
});


//跳转之前先做判断
router.beforeEach((to, from, next) => {

  if (to.path === '/login') {
    document.title = '教优方 - 教优方系统登录';
  } else {
    document.title = '教优方 - 校区运营管理系统';
  }

  // 用于测试
  if (from.query.debugger && !to.query.debugger) {
    location.href = `${to.path}?${qs.stringify({...to.query, debugger: from.query.debugger})}`;

    return null;
  }

  if (!navigator.onLine) {
    return store.commit('stateChange', { state: 'error', errorMsg: '网络异常'});
  }

  store.commit('stateChange', { state: 'loading' });

  if (to.path === '/login' && (Cache.get('TOKEN') || Cache.getSession('TOKEN'))) {
    return router.replace({path: '/'});
  }

  if (to.meta.needlogin === true && !Cache.get('TOKEN') && !Cache.getSession('TOKEN')) {
    return router.replace({path: '/login'});
  }

  // 百度统计
  _hmt.push(['_trackPageview', to.path]);

  window.scrollTo(0, 0); //跳转之后，页面到最顶部

  if (to.path !== '/login') {
    Rquest.get('/operation/statistics');
  }

  next();
});

export default router;