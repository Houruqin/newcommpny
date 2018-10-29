<template>
    <div class="home-bg">
        <div class="aside-box">
            <div class="home-menu-box">
                <div class="logo d-f f-d-c f-a-c">
                    <img src="../images/common/menu-logo.png"/>
                    <div class="select">
                        <div v-if="schoolLists.length > 1">
                            <el-dropdown trigger="click" @visible-change="schoolSelectShow" @command="schoolChange">
                                <div class="el-dropdown-link">
                                    <div class="school-title d-f f-j-b f-a-c cursor-pointer" :class="{'active': schoolSelect}">
                                        <span class="flex1">{{schoolTitle}}</span>
                                        <i class="el-icon-arrow-down el-icon--right" :class="{'active': schoolSelect}"></i>
                                    </div>
                                </div>
                                <el-dropdown-menu slot="dropdown" class="school-options">
                                    <el-scrollbar style="height: 100%;">
                                        <el-dropdown-item
                                            :title="item.name"
                                            v-for="(item, index) in schoolLists"
                                            :command="item.id" :key="index" :class="{'active': item.id == schoolId}">
                                            <div class="t-o-e">{{item.name}}</div>
                                        </el-dropdown-item>
                                    </el-scrollbar>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                        <div v-else class="t-a-c t-o-e cursor-pointer" :title="schoolLists.length > 0 ? schoolLists[0].name : ''">
                            {{schoolLists.length > 0 ? schoolLists[0].name : ''}}
                        </div>
                    </div>
                </div>
                <Menu></Menu>
            </div>
        </div>
        <el-container class="content-right">
            <el-header class="header">
                <div class="d-f f-a-c header-box bgc-f">
                    <div class="pl-50 d-f f-a-c">
                        <el-input :maxlength="11" v-model="search_student_info" placeholder="请输入学员姓名或手机号" @keyup.native.enter="search_student" clearable></el-input>
                        <i @click="search_student" class="iconfont icon-sousuo fc-m fs-26 ml-10 cursor-pointer"></i>
                    </div>
                    <div class="d-f f-a-c pr-50">
                        <a class="ml-30"><img src="../images/common/service-icon.png"></a>
                        <el-dropdown trigger="click" @command="helpHandleCommand" @visible-change="helpShowHandle">
                            <a class="cursor-pointer user-box p-r fc-5 el-dropdown-link pl-10" :class="{'rotate': helpShow}">在线帮助</a>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="helpCenter" class="d-f f-a-c">
                                    <i class="iconfont icon-icon fc-9"></i>
                                    <span class="pl-10">帮助中心</span>
                                </el-dropdown-item>
                                <el-dropdown-item command="lineQQ" class="d-f f-a-c">
                                    <i class="iconfont icon-QQ fc-9"></i>
                                    <span class="pl-10">在线客服</span>
                                </el-dropdown-item>
                                <el-dropdown-item class="d-f f-a-c p-r qr-code-box" @mouseover.native="qr_code_show = true" @mouseout.native="qr_code_show = false">
                                    <i class="iconfont icon-weixingongzhonghao fc-9"></i>
                                    <span class="pl-10">微信公众号</span>
                                    <div class="p-a qr-code" v-show="qr_code_show">
                                        <img :src="apiUrl + 'wechat/common/qrcode'" alt="">
                                    </div>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>

                        <a class="avatar-box ml-50">
                          <img v-if="memberInfo.type === 'institution'" :src="roleIcon.adminICon" alt="">
                          <img v-else :src="memberInfo.sex ? roleIcon.manICon : roleIcon.womanICon" alt="">
                        </a>

                        <el-dropdown trigger="click" @command="settingHandleCommand" @visible-change="settingShowHandle">
                            <a class="cursor-pointer user-box p-r fc-5 el-dropdown-link pl-10" :class="{'rotate': settingShow}">你好，{{memberInfo.name}}</a>
                            <el-dropdown-menu slot="dropdown">
                                <el-dropdown-item command="usersetting" v-if="$$cache.getMemberInfo().type != 'institution' && $$cache.getMemberInfo().type != 'jyf_operation'">
                                    <i class="iconfont icon-fl-renyuan cursor-pointer fc-9"></i>
                                    <span class="pl-5">我的资料</span>
                                </el-dropdown-item>
                                <el-dropdown-item command="schoolsetting" v-if="memberInfo.type == 'institution'">
                                    <i class="iconfont icon-icon1460191753512 cursor-pointer fc-9"></i>
                                    <span class="pl-5">校区设置</span>
                                </el-dropdown-item>
                                <el-dropdown-item command="loginOut">
                                    <i class="iconfont icon-tuichu cursor-pointer fc-9"></i>
                                    <span class="pl-5">安全退出</span>
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </div>
                </div>
                <div class="border-bottom"></div>
            </el-header>
            <el-container class="home-main-box">
                <div class="inner-page-loading-box page-loadding-box" v-if="'loading' === $store.state.pageState">
                  <div class="loading-icon"><span>加载中</span><i></i></div>
                  <p class="loading-text">正在努力加载，请耐心等候</p>
                </div>
                <div class="page-error-box" v-if="'error' === $store.state.pageState">
                  <img :src="errorLoading">
                  <div class="page-error-inner">
                    <p>很抱歉！</p>
                    <span>{{ $store.state.pageErrorText }}</span>
                    <i @click="reloadPage">刷新页面</i>
                  </div>
                </div>
                <!-- <keep-alive><router-view v-if="$route.meta.keepAlive"></router-view></keep-alive>  v-if="!$route.meta.keepAlive"-->
                <router-view v-show="'loaded' === $store.state.pageState"></router-view>
            </el-container>
        </el-container>

        <!-- 引导页 -->
        <div class="guide-box" :class="{'guide-end': guideSetup > 5}" v-if="$store.state.guide && ($$cache.getMemberInfo.type === 'master' || $$cache.getMemberInfo.type === 'institution')">
            <div v-if="guideSetup == 5" class="guide-sex p-r">
                <div class="guide-sex-content p-a fc-f d-f f-d-c f-a-c">
                    <p class="fs-26 d-f f-a-c f-j-c mt-40">新手第<span class="step fs-16 t-a-c btn-m">6</span>步</p>
                    <p class="fs-18 mt-10 pl-22 pr-20">如果在使用过程中遇到任何问题，请及时联系客服帮你解决哦！</p>
                    <div class="next-step mt-15 btn-m fc-f t-a-c cursor-pointer" @click="nextStepHandle">下一步</div>
                </div>
            </div>
            <div v-else-if="guideSetup > 5" class="p-r">
                <img src="../images/guide/done.png" alt="">
                <div class="guide-end-btn p-a btn-m fc-f t-a-c cursor-pointer" @click="guideEnd">立即使用</div>
            </div>
            <div v-else class="p-r">
                <div class="left-tab p-a">
                    <div class="pl-20 tab-title">
                        <i class="iconfont" :class="guideData[guideSetup].icon"></i><span class="fs-16 pl-10">{{guideData[guideSetup].text}}</span>
                    </div>
                </div>
                <div class="bg-img p-a guide-right-box">
                    <div class="right p-a fc-f d-f f-d-c f-a-c">
                        <p class="d-f fs-26 f-a-c f-j-c"><span>新手第</span><span class="step fs-16 t-a-c btn-m">{{guideSetup + 1}}</span><span>步</span></p>
                        <template v-if="guideSetup === 0">
                            <p class="mt-15 p2">在基础设置里面<span class="fc-m pl-10 pr-10">"添加教室"</span>和<span class="fc-m pr-10">"渠道来源"</span>哦~</p>
                        </template>

                        <template v-if="guideSetup === 1">
                            <p class="mt-15 p2">在员工管理里面<span class="fc-m pl-10 pr-10">"添加员工信息"</span></p>
                        </template>

                        <template v-if="guideSetup === 2">
                            <p class="mt-15 p2">在课程管理里面<span class="fc-m pl-10 pr-10">"添加课程"</span>以及<span class="fc-m pr-10">"添加课程下的班级"</span></p>
                        </template>

                        <template v-if="guideSetup === 3">
                            <p class="mt-15 p2">
                                在学员管理里面
                                <span class="fc-m pl-10 pr-10">"登记学员-购课"</span>
                                或者<span class="fc-m pr-10">"导入未签约学员"</span>和<span class="fc-m pl-10 pr-10">"导入已签约学员"</span>
                            </p>
                        </template>

                        <template v-if="guideSetup === 4">
                            <p class="mt-15 p2">在排课管理里面给班级<span class="fc-m pl-10 pr-10">"批量排课"</span>，也可以在课表处添加<span class="fc-m pl-10 pr-10">"单节排课"</span>哦~</p>
                        </template>
                        <div class="d-f f-j-c mt-20"><div class="next-step btn-m fc-f t-a-c cursor-pointer" @click="nextStepHandle">下一步</div></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="speedy-btn cursor-pointer">
            <el-dropdown trigger="click" @visible-change="speedyClick" @command="speedyChange">
                <div class="el-dropdown-link speedy-img" :class="{'rotate': speedyShow}">
                    <img src="../images/common/speedy.png" alt="">
                </div>
                <el-dropdown-menu slot="dropdown" class="speedy-lists">
                    <el-dropdown-item :title="item.name" v-for="(item, index) in speedyLists" :command="item.id" :key="index"
                        v-if="(item.id === 'addStudent' && $$tools.isAuthority('registerStudent'))
                         || (item.id === 'importStudent' && $$tools.isAuthority('importStudent'))
                         || item.id != 'addListen' 
                         || (item.id == 'addListen' && $$tools.isAuthority('handleAudition') && $$cache.getMemberInfo().class_pattern != 2)">
                        <i class="iconfont" :class="item.icon"></i>
                        <span class="t-o-e ml-5">{{item.name}}</span>
                    </el-dropdown-item>

                </el-dropdown-menu>
            </el-dropdown>
        </div>

        <!-- 查找学员弹窗 -->
        <el-dialog width="900px" center :visible.sync="dialogStatus.search" :close-on-click-modal="false" @close="search_student_info = ''">
            <div class="search_student d-f f-a-c mb-20">
                <el-input :maxlength="11" v-model="search_student_info" placeholder="请输入学员姓名或手机号" @keyup.native.enter="search_student" clearable></el-input>
                <i @click="search_student" class="iconfont icon-sousuo fc-m fs-26 ml-10 cursor-pointer"></i>
            </div>
            <div class='fs-12 mb-10'>查询共{{page_info.total}}个学员</div>
            <el-table class="student-table" :data="search_result" v-loading="loading" :show-header="true">
                <el-table-column label="序号"  align="center" width="60" type="index"></el-table-column>
                <el-table-column label="学员姓名" align="center" width="160">
                  <template slot-scope="scope">
                    <router-link v-if="scope.row.type === 'sign'" :to="{path: '/student/signeddetail', query: {id: scope.row.id}}">
                      <span class='c_icon'>
                        <span class='name fc-m cursor-pointer' @click="dialogStatus.search = false">{{scope.row.name}}</span>
                      </span>
                    </router-link>
                    <router-link v-else :to="{path: '/student/nosigndetail', query: {student_id: scope.row.id}}">
                      <span class='c_icon'>
                        <span class='name fc-m cursor-pointer' @click="dialogStatus.search = false">{{scope.row.name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                <el-table-column label="出生日期" align="center">
                  <template slot-scope="scope">
                    <span v-if="scope.row.birthday !== 0">{{scope.row.birthday | date('yyyy-MM-dd')}}</span>
                    <span v-else>未知</span>
                  </template>
                </el-table-column>
                <el-table-column label="课程顾问" prop="advisor_name" align="center"></el-table-column>
                <el-table-column label="登记日期" align="center">
                  <template slot-scope="scope">
                    {{scope.row.created_at | date('yyyy-MM-dd')}}
                  </template>
                </el-table-column>
              </el-table>

              <!-- 分页 -->
                <el-pagination v-if="page_info.total > 10" class="d-f f-j-c mt-30" :page-size="10" background layout="total, prev, pager, next" :total="page_info.total" :current-page="page_info.current_page" @current-change="go_page">
                </el-pagination>
        </el-dialog>

        <!-- 登记学员弹窗 -->
        <AddStudentDialog  :dialogStatus="dialogStatus.student"
            @CB-dialogStatus="CB_dialogStatus" @CB-buyCourse="CB_buyCourse" @CB-addStudent="CB_addStudent">
        </AddStudentDialog>

        <!-- 添加、修改课程弹窗 -->
        <AddCourseDialog :dialogStatus="dialogStatus.addCourse"
            @CB-dialogStatus="CB_dialogStatus" @CB-addCourse="CB_addCourse">
        </AddCourseDialog>

        <!-- 办理试听 -->
        <el-dialog title="办理试听" width="720px" center :visible.sync="dialogStatus.listen" :close-on-click-modal="false" @close="dialogClose('listen')">
            <div class="form-box" v-loading="loading">
                <div class="input-box">
                  <div class="d-f f-j-b">
                    <el-select v-model="auditionData.teacher_id" placeholder="请选择" size="small" @change="getListenCourseLists">
                        <el-option label="全部老师" value=""></el-option>
                        <el-option v-for="(item, index) in auditionData.teacher_lists" :key="index" :label="item.name" :value="item.id"></el-option>
                    </el-select>

                    <el-select v-model="auditionData.course_id" placeholder="请选择" size="small" @change="getListenCourseLists">
                        <el-option label="全部课程" value=""></el-option>
                        <el-option v-for="(item, index) in auditionData.course_lists" :key="index" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                  </div>
                  <el-date-picker size="small" class="mt-10"
                      v-model="auditionData.time" type="date"
                      value-format="timestamp" :clearable="false"
                      :editable="false" placeholder="选择日期"
                      @change="listenDateChange"
                      :picker-options="pickListenDisable">
                  </el-date-picker>
                </div>

                <div v-if="listenCourseLists.length" class="listen-course-box mt-30">
                    <ul class="bgc-m audition-lists">
                        <li class="fc-7 cursor-pointer p-r" v-for="(list, index) in listenCourseLists" :key="index">
                            <p class="fs-16 fc-2">{{list.course.name}}</p>
                            <p class="two-p mt-5 d-f f-a-c">
                                <span class="d-f f-a-c">
                                    <i class="time-icon"></i>
                                    <i class="pl-5">{{$$tools.formatTime(list.begin_time)}}-{{$$tools.formatTime(list.end_time)}}</i>
                                </span>
                                <span class="ml-30 d-f f-a-c">
                                    <i class="teacher-icon"></i>
                                    <i class="pl-5" :class="{'pl-10': key}" v-for="(item, key) in list.teacher" :key="key">{{item.name}}</i>
                                </span>
                                <span class="ml-30 d-f f-a-c">
                                    <i class="address-icon"></i>
                                    <i class="pl-5">{{list.class_room.name}}</i>
                                </span>
                            </p>
                            <p class="mt-5"><span>正式学员：<i>{{list.student_num}}/{{list.grade.limit_num}}</i></span><span class="pl-50">试听学员：{{list.listen_num}}</span></p>
                            <MyButton class="listen-addstudent p-a ver-c" type="border" fontColor="fc-m" @click.native="listenAddStudent(list.id)">添加学员</MyButton>
                        </li>
                    </ul>
                </div>
                <div v-else class="bgc-m mt-30 d-f f-j-c f-a-c listen-nothing"><span class="fc-7">暂无数据</span></div>
            </div>
        </el-dialog>
        <!-- 试听选择学员 -->
        <el-dialog title="添加试听学员" width="800px" center :visible.sync="dialogStatus.listenStudent" :close-on-click-modal="false" @close="dialogClose('listen_student')">
            <div class="pl-20 pr-20">
                <div class="d-f f-j-c">
                    <el-input v-model.trim="studentKeyword" placeholder="输入学员姓名/手机号" size="small" class="search-input mr-10"></el-input>
                    <MyButton @click.native="listenStudentSearch" :radius="false">搜索</MyButton>
                </div>

                <el-table class="student-table mt-30" :data="listenStudentFilterLists" stripe height="400" v-loading="loading">
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="姓名" prop="name" align="center"></el-table-column>
                    <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                    <el-table-column label="顾问" prop="advisor_name" align="center"></el-table-column>
                    <el-table-column label="渠道" prop="advisor_name" align="center"></el-table-column>
                    <el-table-column label="操作" align="center">
                        <template slot-scope="scope">
                            <div class="d-f f-j-c student-btn">
                                <div class="btn done" v-if="!scope.row.active" @click="listenStudentClick(scope.row, 'add')">加入</div>
                                <div class="btn cancel" v-else @click="listenStudentClick(scope.row, 'delete')">取消</div>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="d-f f-j-c mt-20">
                    <MyButton class="mt-20" @click.native="listenStudentDone" :type="checkListenStudent.length ? 'main' : 'gray'" :loading="submitLoading">确定</MyButton>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>

import Menu from '../components/Menus';
// import bossIcon from '../images/common/boss-icon.png';
// import masterIcon from '../images/common/master-icon.png';
// import registerIcon from '../images/common/register-icon.png';
import adminICon from '../images/staff/admin.png';
import manICon from '../images/staff/user-man.png';
import womanICon from '../images/staff/user-woman.png';

import Bus from '../script/bus';
import MyButton from '../components/common/MyButton';

import AddStudentDialog from '../components/dialog/AddStudent';
import AddCourseDialog from '../components/dialog/AddCourse';

import errorLoading from '!url-loader!../images/state-500.png';

import config from 'config';
// import Jquery from 'jquery';
// import '../../plugins/drag';

export default {
  data () {
    return {
      loading: false,
      errorLoading,
      apiUrl: config.api,

      roleIcon: {
        adminICon: adminICon,
        manICon: manICon,
        womanICon: womanICon
      },
      search_student_info: '', //搜索学员信息
      search_result: [], //搜索结果
      settingShow: false,
      helpShow: false,
      schoolId: '',
      schoolSelect: false, //默认校区不选择
      schoolTitle: '', //校区title
      speedyShow: false,

      qr_code_show: false, //二维码是否显示
      submitLoading: false,
      schoolLists: [],

      dialogStatus: {search: false, student: false, course: false, contract: false, addCourse: false, listen: false, listenStudent: false},
      // buyCourseData: {},

      auditionData: {time: new Date().getTime(), teacher_lists: [], course_lists: [], teacher_id: '', course_id: ''}, //试听数据
      listenCourseLists: [], //试听课程列表
      studentKeyword: '', //试听学员列表，搜索关键字
      listenStudentLists: [], //试听学员列表
      listenStudentFilterLists: [], ////试听学员筛选列表
      checkListenStudent: [], //选中的试听学员
      listenTimetableId: '', //选中的试听课程

      memberInfo: {},

      modalObj: null, //遮罩层modal
      guideSetup: 0, //引导页步骤
      guideData: [
        {icon: 'icon-shezhi1', text: '基础设置', dom: 'mymenu-8'},
        {icon: 'icon-yuangongguanli', text: '员工管理', dom: 'mymenu-5'},
        {icon: 'icon-kecheng-', text: '课程管理', dom: 'mymenu-4'},
        {icon: 'icon-xueyuanguanli', text: '学员管理', dom: 'mymenu-1'},
        {icon: 'icon-paike', text: '排课管理', dom: 'mymenu-2'}
      ],
      speedyLists: [
        {id: 'addStudent', name: '学员登记', icon: 'icon-iconwogzydj'},
        {id: 'importStudent', name: '导入学员', icon: 'icon-daoruexcel'},
        // {id: 'addCourse', name: '添加课程', icon: 'icon-add'},
        {id: 'notice', name: '发布通知', icon: 'icon-fabu2'},
        {id: 'addListen', name: '办理试听', icon: 'icon-shiting'}
      ],
      pickListenDisable: {
        disabledDate: (time) => {
          return time.getTime() < new Date().setHours(0, 0, 0, 0);
        }
      },
      page_info: {
        total: 0,
        current_page: 1
      }
    };
  },
  methods: {
    speedyClick (type) {
      this.speedyShow = type;
    },
    //查找学员
    search_student () {
      // if(!this.search_student_info || this.search_student_info === '' || this.search_student_info.length < 1){
      //     this.$message.closeAll();
      //     this.$message.warning('请输入学员姓名或手机号')
      //      return false
      // };
      this.loading = true;
      this.page_info.current_page = 1;
      this.get_search_student_info();
    },
    get_search_student_info () {
      const params = {
        search_data: this.search_student_info,
        page: this.page_info.current_page
      };

      this.$$request.post('/student/studentSearch', params)
        .then(res => {
          this.loading = false;
          if (res.lists.data.length < 1) {
            this.$message.closeAll();
            this.$message.warning('未搜索到相关学员信息');
          }
          this.dialogStatus.search = true;
          this.page_info.total = res.lists.total;
          this.page_info.current_page = res.lists.current_page;
          this.search_result = res.lists.data;
        });
    },
    speedyChange (val) {
      switch (val) {
        case 'addStudent':
          this.dialogStatus.student = true;
          break;
        case 'importStudent':
          this.$router.push({path: '/student/importstudent'});
          break;
        case 'addCourse':
          this.dialogStatus.addCourse = true;
          break;
        case 'addListen':
          this.dialogStatus.listen = true;
          this.getListenLists();
          break;
        case 'notice':
          this.$router.push({path: '/workbench/editNotice'});
          break;
      }
    },
    //弹窗变比，改变dialog状态回调
    CB_dialogStatus (type) {
      if (type === 'student') {
        this.dialogStatus.student = false;
      } else if (type === 'add_course') {
        this.dialogStatus.addCourse = false;
      }
    },
    //登记成功，刷新列表
    CB_addStudent () {
      this.dialogStatus.student = false;
      if (this.$route.path === '/student/nosign') {
        Bus.$emit('refresh', 'student');
      } //如果是在课程列表页面，刷新课程列表
    },
    //登记成功，购课回调
    CB_buyCourse (data) {
      console.log(data);
      let params = {
        student_id: data.id,
        advisor_id: data.advisor_id,
        advisor: data.advisor,
        parent_id: data.parent_id,
        deposit_money: data.deposit_money
      };

      this.$router.push({path: '/student/nosignbuycourse', query: {buyCourseData: JSON.stringify(params)}});
    },
    //新增课程成功，回调
    CB_addCourse () {
      this.dialogStatus.addCourse = false;
    },
    //试听窗口关闭
    dialogClose (type) {
      if (type === 'listen') {
        this.listenCourseLists = [];
        this.auditionData = {
          time: new Date().getTime(),
          teacher_lists: [],
          course_lists: [],
          teacher_id: '',
          course_id: ''
        };
      } else if (type === 'listen_student') {
        this.checkListenStudent = [];
        this.listenTimetableId = '';
        this.studentKeyword = '';
      }
    },
    listenDateChange (val) {
      if (new Date(val).toDateString() === new Date().toDateString()) {
        this.auditionData.time = new Date().getTime();
      }
      this.getListenLists();
    },
    //试听学员搜索
    listenStudentSearch () {
      this.listenStudentFilterLists = this.listenStudentFilter(this.studentKeyword);
    },
    //试听列表添加学员
    listenAddStudent (id) {
      this.loading = true;
      this.listenTimetableId = id;
      this.getListenStudentLists();
      this.checkListenStudent = [];
      this.dialogStatus.listenStudent = true;
    },
    //试听学员列表操作
    listenStudentClick (data, type) {
      if (type === 'add') {
        data.active = true;
        this.checkListenStudent.push(data.id);
      } else {
        data.active = false;
        let index = this.checkListenStudent.indexOf(data.id);

        this.checkListenStudent.splice(index, 1);
      }

      console.log(this.checkListenStudent);
    },
    //试听学员确定
    async listenStudentDone () {

      if (!this.checkListenStudent.length) {
        return this.$message.warning('请选择试听学员');
      }

      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;

      let result = await this.$$request.post('/listenCourse/add', {
        timetable_id: this.listenTimetableId,
        student_id: this.checkListenStudent
      });

      this.submitLoading = false;
      console.log(result);
      if (!result) {
        return 0;
      }

      this.dialogStatus.listen = false;
      this.dialogStatus.listenStudent = false;

      this.$message.success('办理试听成功!');
    },
    //获取试听填充列表
    async getListenLists () {
      let old_time = Math.round(this.auditionData.time / 1000);

      let result = await this.$$request.post('/listenCourse/fill', {start_time: old_time});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.auditionData.teacher_lists = result.teacher;
      this.auditionData.course_lists = result.course;
      this.getListenCourseLists();
    },
    //获取试听课程列表
    async getListenCourseLists () {
      this.loading = true;
      let old_time = Math.round(this.auditionData.time / 1000);

      let params = {
        time: old_time,
        teacher_id: this.auditionData.teacher_id,
        course_id: this.auditionData.course_id
      };

      let result = await this.$$request.post('/listenCourse/lists', {data: params});

      this.loading = false;
      console.log(result);
      if (!result) {
        return 0;
      }

      this.listenCourseLists = result.lists;
    },
    //获取试听学员列表
    async getListenStudentLists () {
      let result = await this.$$request.get('/listenCourse/studentLists', {timetable_id: this.listenTimetableId});

      this.loading = false;
      console.log(result);
      if (!result) {
        return 0;
      }

      result.lists.forEach(v => {
        v.active = false;
      });
      this.listenStudentLists = result.lists; //原始数据
      this.listenStudentFilterLists = this.listenStudentFilter();

    },
    //试听学员列表搜索搜索筛选方法
    listenStudentFilter (text) {
      if (typeof text === 'undefined') {
        return this.listenStudentLists;
      }
      let newData = [];

      this.listenStudentLists.forEach(v => {
        if (isNaN(text)) {
          if (v.name.includes(text)) {
            newData.push(v);
          }
        } else if (v.mobile.includes(text)) {
          newData.push(v);
        }
      });

      return newData;
    },
    //在线帮助下拉
    helpHandleCommand (val) {
      if (val === 'lineQQ') {
        return window.open('http://wpa.qq.com/msgrd?v=3&uin=3266315153&site=qq&menu=yes');
      }
      if (val === 'helpCenter') {
        return window.open('http://csdoc.jiaoyf.com/');
      }
    },
    //设置下拉
    settingHandleCommand (val) {
      if (val === 'usersetting') {
        return this.$router.push({path: '/staff/detail', query: {user_id: this.$$cache.getMemberInfo().id}});
      }
      if (val === 'schoolsetting') {
        return this.$router.push({path: '/workbench/schoolsetting'});
      }
      if (val === 'loginOut') {
        this.loginOut();
      }
    },
    //校区切换
    schoolChange (val) {
      if (val == this.schoolId) {
        return 0;
      }

      this.$confirm('确定切换校区吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.loginCheckOut(val);
      }).catch(() => {
        return 0;
      });
    },
    //退出登录
    async loginOut () {
      let result = await this.$$request.post('/auth/logout');

      console.log(result);
      if (!result) {
        return 0;
      }
      this.$$cache.loginOut();
      this.$message('已退出登录！');
    },
    //获取校区列表
    async getSchoolLists () {
      let result = await this.$$request.post('/user/schoolLists');

      console.log(result);
      if (!result) {
        return 0;
      }
      this.schoolLists = result.lists;
      this.getSchoolName();
    },
    schoolSelectShow (type) {
      this.schoolSelect = type;
    },
    //切换校区，切换登录
    async loginCheckOut (school_id) {
      let result = await this.$$request.post('/auth/checkLogin', {school_id: school_id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.schoolId = school_id;

      let memberInfo = this.$$cache.getMemberInfo();

      memberInfo.school_id = school_id;
      this.$$cache.setMemberInfo(memberInfo);

      this.getSchoolName();

      this.$router.push({path: '/refresh', query: {url: '/'}}); //刷新工作台路由
    },
    //根据school_id获取校区名称
    getSchoolName () {
      this.schoolLists.forEach(v => {
        if (v.id == this.schoolId) {
          this.schoolTitle = v.name;
        }
      });
    },
    helpShowHandle (isShow) {
      this.helpShow = isShow;
    },
    settingShowHandle (isShow) {
      this.settingShow = isShow;
    },
    //下一步
    nextStepHandle () {
      this.guideSetup = this.guideSetup + 1;
      this.mymenuPosition();
    },
    //引导页显示
    showModal () {
      this.modalObj = document.createElement('div');
      this.modalObj.classList = 'v-modal'; this.modalObj.style.zIndex = '5000';
      document.body.appendChild(this.modalObj);
      document.body.style.overflow = 'hidden';
      this.mymenuPosition();
    },
    //计算引导tab位置
    mymenuPosition () {
      if (this.guideSetup < 5) {
        let mymenu = document.querySelector(`.${this.guideData[this.guideSetup].dom}`);
        let rightBox = document.querySelector('.guide-right-box').clientHeight;

        document.querySelector('.guide-box').style.left = '0';
        document.querySelector('.guide-box').style.top = `${mymenu.offsetTop + 180 - rightBox + mymenu.clientHeight}px`;
      } else if (this.guideSetup == 5) {
        document.querySelector('.guide-box').style.left = 'auto';
        document.querySelector('.guide-box').style.top = '50px';
        document.querySelector('.guide-box').style.right = '280px';
      } else {
        document.querySelector('.guide-box').removeAttribute('style');
      }
    },
    //引导结束
    guideEnd () {
      this.guideSetup = 0;
      document.body.removeChild(this.modalObj);
      this.$store.dispatch('guideChange', false);
      document.body.removeAttribute('style');
      this.modalObj = null;
      this.$router.push({path: '/refresh', query: {url: '/'}}); //刷新工作台路由
    },
    //翻页
    go_page (page) {
      this.page_info.current_page = page;
      this.get_search_student_info();
    },
    pageInit () {
      this.getSchoolLists();
      this.memberInfo = this.$$cache.getMemberInfo();
      this.schoolId = this.$$cache.getMemberInfo().school_id;
    },
    reloadPage () {
      // this.$store.replace(`/refresh?path=${this.$route.fullpath}`);
      location.reload();
    }
  },
  mounted () {
    if (this.$store.state.guide && (this.$$cache.getMemberInfo.type === 'master' || this.$$cache.getMemberInfo.type === 'institution')) {
      this.showModal();
    }

    this.$store.dispatch('getAdvisor');
    this.$store.dispatch('getFollowupStatus');
    this.$store.dispatch('getCourse');
    this.$store.dispatch('getSource');
    this.$store.dispatch('getClassRoom');
    this.$store.dispatch('getGrade');
    this.$store.dispatch('getRelation');
    this.$store.dispatch('getTeacher');
  },
  created () {
    this.pageInit();
    Bus.$on('refreshSchoolId', () => {
      this.pageInit();
    });
  },
  beforeDestroy () {
    Bus.$off('refreshCourseLists');
    Bus.$off('home_refreshTimeTable');
  },
  beforeRouteLeave (to, from, next) {
    //强行删除遮罩层
    if (this.modalObj) {
      document.body.removeChild(this.modalObj);
    }
    document.body.removeAttribute('style');
    this.modalObj = null;
    next();
  },
  components: {Menu, AddStudentDialog, AddCourseDialog, MyButton}
};
</script>

<style lang="less" scoped>
    .home-bg {
        // min-width: 1900px;
        // min-height: 100%;
        height: 100%;
    }
    .aside-box {
        background-color: #223243;
        color: #7F9CB9;
        width: 230px;
        height: 100%;
        position: fixed;
        z-index: 1000;
        overflow: hidden;
    }
    .home-menu-box {
        padding-top: 20px;
        height: 100%;
        width: 247px;   //滚动条只有17px宽
        overflow-y: auto;
        overflow-x: hidden;
    }
    .logo {
        padding-top: 20px;
        width: 230px;
        a {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
        }
        .select {
            width: 195px;
            margin-top: 20px;
            .el-dropdown {
                width: 100%;
                color: #7F9CB9;
            }
            .school-title {
                border: 1px #7f9cb9 solid;
                height: 30px;
                padding: 0 15px;
                span {
                    overflow: hidden;
                    white-space: nowrap;
                }
                &.active {
                    color: #45DAD5;
                    border-color: #45DAD5;
                }
                .el-icon-arrow-down {
                    -webkit-transition: transform 300ms;
                    transition: transform 300ms;
                    &.active {
                        -webkit-transform :rotate(180deg);
                        transform: rotate(180deg);
                    }
                }
            }
        }
    }
    .inner-page-loading-box, .page-error-box {
      position: fixed;
      left: 230px;
      top: 90px;
      bottom: 0;
      right: 0;
      width: auto;
      height: auto;;
    }
    .page-error-box {
      z-index: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        margin-right: 50px;
        display: block;
      }
    }
    .page-error-inner {
      display: flex;
      flex-direction: column;
      margin-top: -45px;
      p {
        font-size: #555;
        font-weight: bold;
        font-size: 30px;
      }
      span {
        font-size: 15px;
        color: #777;
        margin-top: 20px;
      }
      i {
        border: 1px #45DAD5 solid;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #45DAD5;
        height: 32px;
        min-width: 94px;
        padding: 0 18px;
        margin-top: 25px;
        cursor: pointer;
        border-radius: 2px;
      }
    }
    .content-right {
        padding-left: 230px;
        padding-top: 90px;
        height: 100%;
        .header {
            padding: 0;
            position: fixed;
            z-index: 800;
            top: 0;
            left: 230px;
            right: 0;
            .header-box {
                height: 70px;
                justify-content: space-between;
            }
            .header-box /deep/  .el-input__inner{
                width: 300px;
                border-radius: 6px !important;
                border: none !important;
                background-color: #F2F2F2 !important;
            }
            .border-bottom {
                width: 100%;
                height: 20px;
                background-color: #F3F3F3;
            }
            .avatar-box {
                border-radius: 50%;
                width: 40px;
                height: 40px;
                overflow: hidden;
                img {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: block;
                }
            }
            .user-box {
                &::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 0;
                    top: 5px;
                    margin-left: 5px;
                    border-left: 6px solid transparent;
                    border-right: 6px solid transparent;
                    border-top: 10px solid #9B9B9B;
                    -webkit-transition: transform 300ms;
                    transition: transform 300ms;
                }
                &.rotate {
                    &::after {
                        -webkit-transform :rotate(180deg);
                        transform: rotate(180deg);
                    }
                }
            }
        }
        .home-main-box {
            padding: 0 20px 20px;
        }
    }
    .guide-box {
        position: fixed;
        z-index: 6000;
        &.guide-end {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .left-tab {
            width: 230px;
            height: 58px;
            background-color: #2A3C50;
            color: #45DAD5;
            left: 0;
            top: 170px;
            .tab-title {
                border-right: 5px #45DAD5 solid;
                height: 100%;
                line-height: 58px;
            }
        }
        .guide-sex {
            width: 450px;
            height: 386px;
            background: url(../images/guide/guide-sex.png) no-repeat;
            background-size: 100%;
            top: 0;
            right: 0;
            .guide-sex-content {
                bottom: 0;
                left: 0;
                width: 410px;
                height: 210px;
                .step {
                    width: 25px;
                    height: 25px;
                    line-height: 25px;
                    border-radius: 50%;
                    font-weight: bold;
                    margin: 0 5px;
                }
                .next-step {
                    width: 70px;
                    height: 30px;
                    line-height: 30px;
                    border-radius: 5px;
                }
            }
        }
        .bg-img {
            width: 585px;
            height: 228px;
            background: url(../images/guide/guide-icon.png) no-repeat;
            background-size: 100%;
            left: 170px;
            top: 0;
            .right {
                width: 375px;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                .p2 {
                    font-size: 18px;
                    line-height: 30px;
                    padding: 0 20px 0 30px;
                }
                .step {
                    width: 25px;
                    height: 25px;
                    line-height: 25px;
                    border-radius: 50%;
                    font-weight: bold;
                    margin: 0 5px;
                }
                .next-step {
                    width: 70px;
                    height: 30px;
                    line-height: 30px;
                    border-radius: 5px;
                }
            }
        }
        .guide-end {
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
        .guide-end-btn {
            top: 0;
            left: 0;
            border-radius: 5px;
            height: 30px;
            line-height: 30px;
            width: 80px;
            left: 50%;
            top: 140px;
            margin-left: -27px;
            transform: translate(-50%);
        }
    }
    .speedy-btn {
        position: fixed;
        right: 50px;
        bottom: 50px;
        z-index: 500;
        img {display: block;}
        .speedy-img {
            outline: none;
            -webkit-transition: transform 300ms;
            transition: transform 300ms;
            &.rotate {
                -webkit-transform :rotate(135deg);
                transform: rotate(135deg);
            }
        }
    }
    .form-box {
        padding: 0 20px;
        .input-box {
          width: 400px;
          margin: 0 auto;
        }
        /deep/ .el-input {
          width: 180px;
        }
        .listen-course-box {
          max-height: 350px;
          overflow: hidden;
          overflow-y: auto;
        }
        .audition-lists {
            li {
                padding: 20px 130px 20px 20px;
                &:not(:first-child) {
                    border-top: 1px #e3e3e3 solid;
                }
                .two-p {
                    span {
                        position: relative;
                    }
                }
                .listen-addstudent {
                    right: 20px;
                }
            }
        }
        .listen-nothing {
            width: 610px;
            height: 120px;
        }
    }

    .search-input {
        width: 200px;
    }
    .student-table {
        border-top: 1px #e3e3e3 solid;
        .student-btn {
            .btn {
                width: 50px;
                height: 30px;
                line-height: 28px;
                text-align: center;
                border-radius: 3px;
                cursor: pointer;
                &.done {
                    border: 1px #45DAD5 solid;
                    color: #45DAD5;
                }
                &.cancel {
                    border: 1px #e3e3e3 solid;
                    color: #999;
                }
            }
        }
    }
    .search_student{
        justify-content: center;
        width: 100%;
    }
    .search_student /deep/  .el-input__inner{
        width: 300px;
        border-radius: 6px !important;
        border: none !important;
        background-color: #F2F2F2 !important;
    }
    .search_student /deep/  .el-input{
        width: auto;
    }

    //首页悬浮
    .speedy-lists {
        /deep/ .el-dropdown-menu__item {
            padding: 0 30px;
            // &:not(:first-child) {
            //     border-top: 1px #e6e6e6 solid;
            // }
        }
    }
</style>


