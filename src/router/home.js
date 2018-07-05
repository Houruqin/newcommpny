
import Workbench from '@/views/workbench/Index'
import EditNotice from '@/views/workbench/EditNotice'
import BasicSet from '@/views/BasicSetting/Index'
import SchoolSetting from '@/views/BasicSetting/SchoolSetting'
import NoSign from '@/views/student/NoSign'
import Signed from '@/views/student/Signed'
import NosignDetail from '@/views/student/NosignDetail'
import SignedDetail from '@/views/student/SignedDetail'
import ImportStudent from '@/views/student/ImportStudent'
import StaffManage from '@/views/staffManage/StaffList'
import CourseIndex from '@/views/course/Index'

import Statistics from '@/views/statistics/Index'

import TimeTable from '@/views/timetable/Index'

const homeRouter = [
    {path: '', component: Workbench, meta: {needlogin: true, menu: '/home/workbench'}},
    {path: 'workbench', component: Workbench, meta: {needlogin: true, menu: '/home/workbench'}},
    {path: 'workbench/editNotice', component: EditNotice, meta: {needlogin: true, menu: '/home/workbench'}},
    {path: 'workbench/schoolsetting', component: SchoolSetting, meta: {needlogin: true, menu: '/home/workbench'}},
    {path: 'setting', component: BasicSet, meta: {needlogin: true, menu: '/home/setting'}},
    {path: 'student/signed', component: Signed, meta: {keepAlive: true, needlogin: true, menu: '/student/signed'}},
    {path: 'student/nosign', component: NoSign, meta: {keepAlive: true, needlogin: true, menu: '/student/nosign'}},
    {path: 'student/nosigndetail', component: NosignDetail, name: 'nosignDetail', meta: {needlogin: true, menu: '/student/nosign'}},   //需要传递参数，配置name属性，并且通过name跳转，params传递参数
    {path: 'student/signeddetail', component: SignedDetail, name: 'signedDetail', meta: {needlogin: true, menu: '/student/signed'}},   //需要传递参数，配置name属性，并且通过name跳转，params传递参数
    {path: 'student/importstudent', component: ImportStudent, meta: {needlogin: true, menu: '/student/signed'}},
    {path: 'timetable/index', component: TimeTable, name: 'timetableDefault', meta: {needlogin: true}},
    {path: 'timetable/teacher', component: TimeTable, name: 'timetableTeacher', meta: {needlogin: true}},
    {path: 'timetable/class', component: TimeTable, name: 'timetableClass', meta: {needlogin: true}},
    {path: 'staff', component: StaffManage, meta: {needlogin: true}},
    {path: 'course', component: CourseIndex, meta: {needlogin: true}},
    {path: 'statistics', component: Statistics, meta: {needlogin: true}}
];

export default homeRouter