import Cache from '@/script/cache';

import Workbench from '@/views/workbench/Index';
import EditNotice from '@/views/workbench/EditNotice';

import BasicSet from '@/views/BasicSetting/Index';
import WechatSetting from '@/views/BasicSetting/WechatSetting';
import SchoolSetting from '@/views/BasicSetting/SchoolSetting';

import NoSign from '@/views/student/NoSign';
import Signed from '@/views/student/Signed';
import NosignDetail from '@/views/student/NosignDetail';
import SignedDetail from '@/views/student/SignedDetail';

import ImportStudent from '@/views/student/ImportStudent';
import BeGradeCourse from '@/views/course/BeGrade';
import NoGradeCourse from '@/views/course/NoGrade';
import GradeDetail from '@/views/course/Detail';

import StaffManage from '@/views/staffManage/Index';
import StaffDetail from '@/views/staffManage/Detail';

import Statistics from '@/views/statistics/Index';

import TimeTableBeGrade from '@/views/timetable/BeGradeIndex';
import TimeTableNoGrade from '@/views/timetable/NoGradeIndex';

import ClassElimination from '@/views/academic/ClassElimination';
import Audition from '@/views/academic/Audition';
import Buy from '@/views/academic/Buy';

import IncomeStatistics from '@/views/finance/IncomeStatistics';
import OutlayStatistics from '@/views/finance/OutlayStatistics';
import RefundStatistics from '@/views/finance/RefundStatistics';
import AssignPerformance from '@/views/finance/AssignPerformance';

import Commodity from '@/views/inventory/Commodity';
import StorageView from '@/views/inventory/Storage';
import Borrow from '@/views/inventory/Borrow';

import BuyCourse from '@/views/course/BuyCourse';
import ChangeCourse from '@/views/student/ChangeCourse';

const homeRouter = [
  {path: '', component: Workbench, meta: {needlogin: true, menu: '/home/workbench'}},
  {path: 'workbench', component: Workbench, meta: {needlogin: true, menu: '/home/workbench'}},
  {path: 'workbench/editNotice', component: EditNotice, meta: {needlogin: true, menu: '/home/workbench'}},
  {path: 'workbench/schoolsetting', component: SchoolSetting, meta: {needlogin: true, menu: '/home/workbench'}},

  {path: 'setting', component: BasicSet, meta: {needlogin: true, menu: '/home/setting'}},
  {path: 'setting/wechat', component: WechatSetting, meta: {needlogin: true, menu: '/setting/wechat'}},

  {path: 'student/signed', component: Signed, meta: {keepAlive: true, needlogin: true, menu: '/student/signed'}},
  {path: 'student/nosign', component: NoSign, meta: {keepAlive: true, needlogin: true, menu: '/student/nosign'}},
  {path: 'student/nosigndetail', component: NosignDetail, name: 'nosignDetail', meta: {needlogin: true, menu: '/student/nosign'}}, //需要传递参数，配置name属性，并且通过name跳转，params传递参数
  {path: 'student/signeddetail', component: SignedDetail, name: 'signedDetail', meta: {needlogin: true, menu: '/student/signed'}}, //需要传递参数，配置name属性，并且通过name跳转，params传递参数
  {path: 'student/importstudent', component: ImportStudent, meta: {needlogin: true, menu: '/student/nosign'}},
  {path: 'student/nosignbuycourse', name: 'nosignBuyCourse', component: BuyCourse, meta: {needlogin: true, menu: '/student/nosign'}},
  {path: 'student/signedbuycourse', name: 'signedBuyCourse', component: BuyCourse, meta: {needlogin: true, menu: '/student/signed'}},
  {path: 'student/changecourse', name: 'changecourse', component: ChangeCourse, meta: {needlogin: true, menu: '/student/signed'}},

  {path: 'timetable/index', component: TimeTableBeGrade, meta: {needlogin: true}},
  {path: 'timetable/begrade', component: TimeTableBeGrade, name: 'timetableBegrade', meta: {needlogin: true}},
  {path: 'timetable/nograde', component: TimeTableNoGrade, name: 'timetableNograde', meta: {needlogin: true}},


  {path: 'academic/classElimination', component: ClassElimination, name: 'academicDefault', meta: {needlogin: true}},
  {path: 'academic/audition', component: Audition, name: 'academicAudition', meta: {needlogin: true}},
  {path: 'academic/buy', component: Buy, name: 'academicBuy', meta: {needlogin: true}},
  {path: 'staff', component: StaffManage, meta: {needlogin: true}},
  {path: 'staff/detail', component: StaffDetail, meta: {needlogin: true, menu: '/home/staff'}},

  {path: 'course/index', component: BeGradeCourse, meta: {needlogin: true, menu: '/course/begrade'}},
  {path: 'course/begrade', component: BeGradeCourse, meta: {needlogin: true, menu: '/course/begrade'}},
  {path: 'course/nograde', component: NoGradeCourse, meta: {needlogin: true, menu: '/course/nograde'}},
  {path: 'course/detail', component: GradeDetail, meta: {needlogin: true, menu: '/course/begrade'}},

  {path: 'finance/income', component: IncomeStatistics, meta: {needlogin: true}},
  {path: 'finance/outlay', component: OutlayStatistics, meta: {needlogin: true}},
  {path: 'finance/refund', component: RefundStatistics, meta: {needlogin: true}},
  {path: 'finance/assign', component: AssignPerformance, meta: {needlogin: true}},

  {path: 'inventory', component: Commodity, meta: {needlogin: true}},
  {path: 'inventory/commodity', component: Commodity, meta: {needlogin: true}},
  {path: 'inventory/storage', component: StorageView, meta: {needlogin: true}},
  {path: 'inventory/borrow', component: Borrow, meta: {needlogin: true}},

  {path: 'statistics', component: Statistics, meta: {needlogin: true}}
];

export default homeRouter;
