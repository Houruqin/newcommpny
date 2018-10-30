<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <TableHeader title="有班课程">
                <MyButton @click.native="addCourse" class="ml-20" v-if="$$tools.isAuthority('addCourse')">添加课程</MyButton>
            </TableHeader>
            <el-tabs v-model="activeTab" @tab-click="tabClick" class="tab-toolbar">
                <el-tab-pane label="一对多" name="1"></el-tab-pane>
                <el-tab-pane label="一对一" name="2"></el-tab-pane>
            </el-tabs>
            <div v-loading="loading">
              <div class="course-list-box" :class="{'mt-20': index}" v-for="(course, index) in courseLists" :key="index">
                  <div class="list-header cursor-pointer d-f p-r f-a-c f-j-b pl-20 pr-20" @click.stop.self.prevent="listHeaderClick(course, index)">
                      <div class="d-f f-a-c">
                          <span class="fc-7 fs-16 d-f f-a-c">
                              <i class="fc-5">{{course.name}}</i>
                              <i class="iconfont icon-bianji ml-10" @click="editCourse(course)" v-if="$$tools.isAuthority('editCourse')"></i>
                          </span>
                          <span class="syllabus fc-m ml-20" v-if="$store.state.systemSetting.outline && $store.state.systemSetting.outline.status" @click="syllabusClick(course.id)">课程大纲</span>
                      </div>
                      <div class="d-f f-a-c">
                          <span class="d-f f-a-c fc-m cursor-pointer" @click="addClassRoom(course.id, course.type)">
                              <img src="../../images/common/add.png" alt="">
                              <i class="pl-10">添加班级</i>
                          </span>

                          <span class="fc-9 ml-20 zhankai-icon" :class="{'rotate': course.collapse}" @click="listHeaderClick(course, index)">
                              <i class="iconfont icon-zhankai"></i>
                          </span>
                      </div>
                  </div>

                  <div class="grade-table-box" :ref="'grade-table-content_' + index">
                      <div class="grade-table-content">
                          <el-table :data="course.class_lists" v-if="course.class_lists.length" cell-class-name="class-list-cell" strip>
                              <el-table-column label="序号" type="index" align="center"></el-table-column>
                              <el-table-column label="班级" align="center">
                                  <template slot-scope="scope">
                                      <router-link v-if="$$tools.isAuthority('viewClass')" :to="{path: '/course/detail', query: {grade_id: scope.row.id}}" class="fc-m">{{scope.row.name}}</router-link>
                                      <span v-else>{{scope.row.name}}</span>
                                  </template>
                              </el-table-column>
                              <el-table-column label="开课日期" align="center">
                                  <template slot-scope="scope">
                                      <span>{{scope.row.start_time * 1000 - new Date().getTime() > 5*360*24*60*60*1000 ? '' : $$tools.format(scope.row.start_time)}}</span>
                                  </template>
                              </el-table-column>
                              <el-table-column label="任课老师/辅助老师" align="center">
                                  <template slot-scope="scope">
                                      <span>{{scope.row.teacher_lists.length ? scope.row.teacher_lists[0].name : ''}}<i v-if="scope.row.counselor_lists.length">/</i>{{scope.row.counselor_lists.length ? scope.row.counselor_lists[0].name : ''}}</span>
                                  </template>
                              </el-table-column>
                              <el-table-column label="上课学员" align="center">
                                  <template slot-scope="scope">
                                      <div v-if="course.type === 2">{{scope.row.student.length}}</div>
                                      <div v-else class="d-f f-a-c f-j-c">
                                          <el-popover v-if="scope.row.student.length > scope.row.limit_num" popper-class="grade-student-popver" placement="right" width="325" trigger="hover" content="该班级人数已经超过最大上限，请给多余学员另外分班！">
                                              <div slot="reference" class="cursor-pointer">
                                                <span class="fc-r">{{scope.row.student.length}}/{{scope.row.limit_num}}</span>
                                                <i class="iconfont icon-zhuyidapx fc-r"></i>
                                              </div>
                                          </el-popover>
                                          <div v-else :class="scope.row.student.length < scope.row.limit_num ? 'fc-5' : 'fc-m'">{{scope.row.student.length}}/{{scope.row.limit_num}}</div>
                                      </div>
                                  </template>
                              </el-table-column>
                              <el-table-column label="剩余课时" align="center">
                                  <template slot-scope="scope">{{course.type === 1 ? scope.row.lesson_num_remain : '--'}}</template>
                              </el-table-column>
                              <el-table-column label="上课状态" align="center">
                                  <template slot-scope="scope">
                                      <div class="fc-f fs-12 course-status">
                                          <div class="d-f f-a-c f-j-c">
                                              <span :class="{'green': scope.row.gradeStatus.id === 'yes', 'red': scope.row.gradeStatus.id === 'no', 'gray': scope.row.gradeStatus.id === 'stop'}">
                                                  {{scope.row.gradeStatus.name}}
                                              </span>
                                          </div>
                                      </div>
                                  </template>
                              </el-table-column>
                              <el-table-column label="操作" align="center">
                                  <template slot-scope="scope">
                                      <span class="cursor-pointer" v-if="$$tools.isAuthority('hasClassScheduling')"
                                      :class="!scope.row.unscheduled && course.type === 1 ? 'fc-9' : 'fc-m'" @click="addTimetable({grade_info: scope.row, course_info: course})">排课</span>
                                      <span class="fc-m ml-10 cursor-pointer" v-if="$$tools.isAuthority('endingClass')" @click="classCourseState({type: 'over', grade_info: scope.row, course_info: course})">结课</span>
                                      <el-dropdown trigger="click" @command="handleCommand" placement="bottom">
                                          <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                                          <el-dropdown-menu slot="dropdown" class="operation-lists">
                                              <el-dropdown-item v-for="(item, index) in operationLists" :key="index" :command="{type: item.type, grade_info: scope.row, course_info: course}">
                                                  <!--未开课-->
                                                  <template v-if="scope.row.begin_status == 0">
                                                      <div class="d-f f-j-b" v-if="(item.type == 'edit' && $$tools.isAuthority('editClasses'))
                                                          || (item.type == 'delete' && $$tools.isAuthority('deleteClasses'))">
                                                          <i class="iconfont" :class="item.icon"></i>
                                                          <span>{{item.text}}</span>
                                                      </div>
                                                  </template>
                                                  <!--已开课-->
                                                  <template v-else>
                                                      <!--停课-->
                                                      <template v-if="scope.row.status == -3">
                                                          <div class="d-f f-j-b" v-if="(item.type == 'begin' && $$tools.isAuthority('stopClasses'))
                                                              || (item.type == 'edit' && $$tools.isAuthority('editClasses'))
                                                              || (item.type == 'delete' && $$tools.isAuthority('deleteClasses'))">
                                                              <i class="iconfont" :class="item.icon"></i>
                                                              <span>{{item.text}}</span>
                                                          </div>
                                                      </template>

                                                      <!--结课-->
                                                      <template v-else-if="scope.row.status == -2">
                                                          <div class="d-f f-j-b" v-if="(item.type == 'edit' && $$tools.isAuthority('editClasses'))
                                                              || (item.type == 'delete' && $$tools.isAuthority('deleteClasses'))"
                                                              :class="{'fc-9': item.type == 'plan' && !scope.row.unscheduled && course.type === 1}">
                                                              <i class="iconfont" :class="item.icon"></i>
                                                              <span>{{item.text}}</span>
                                                          </div>
                                                      </template>

                                                      <!--正常开课-->
                                                      <template v-else>
                                                          <div class="d-f f-j-b" v-if="(item.type == 'stop' && $$tools.isAuthority('stopClasses'))
                                                              || (item.type == 'edit' && $$tools.isAuthority('editClasses'))
                                                              || (item.type == 'delete' && $$tools.isAuthority('deleteClasses'))"
                                                              :class="{'fc-9': item.type == 'plan' && !scope.row.unscheduled && course.type === 1}">
                                                              <i class="iconfont" :class="item.icon"></i>
                                                              <span>{{item.text}}</span>
                                                          </div>
                                                      </template>
                                                  </template>
                                              </el-dropdown-item>
                                          </el-dropdown-menu>
                                      </el-dropdown>
                                  </template>
                              </el-table-column>
                          </el-table>
                      </div>
                  </div>
                  <div v-if="!courseLists.length" class="d-f f-a-c f-j-c fc-7 course-lits-nothing"><span>暂无数据</span></div>
              </div>
            </div>
        </el-card>
        <!-- 添加、修改课程弹窗 -->
        <AddCourseDialog :dialogStatus="dialogStatus.course" :type="courseOperate" :editDetail="editCourseDetail" :courseMode="1"
            @CB-dialogStatus="CB_dialogStatus" @CB-addCourse="CB_addCourse">
        </AddCourseDialog>

        <!-- 添加/修改班级弹窗 -->
        <AddGradeDialog :dialogStatus="dialogStatus.grade" @CB-dialogStatus="CB_dialogStatus" @CB-addGrade="CB_addGrade" :editDetail="editGradeDetail" :type="gradeType"></AddGradeDialog>

        <!-- 课程大纲 -->
        <CourseSyllabus v-model="dialogStatus.syllabus" :syllabus="syllabusParams"/>

        <!-- 添加排课 -->
        <AddTimeTable :tableType="addTableType" v-model="dialogStatus.timetable" @CB-popverClose="CB_popverClose" :parentData="timetableDetail"
        @CB-timetableSuccess="CB_timetableSuccess" parentPage="course"></AddTimeTable>
    </div>
</template>

<script>

import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import {courseStatic} from '../../script/static';
import AddCourseDialog from '../../components/dialog/AddCourse';
import AddGradeDialog from '../../components/dialog/AddGrade';
import CourseSyllabus from '../../components/dialog/CourseSyllabus';
import AddTimeTable from '../../components/dialog/AddTimeTable';

export default {
  components: {TableHeader, MyButton, AddCourseDialog, AddGradeDialog, CourseSyllabus, AddTimeTable},
  data () {
    return {
      state: 'loading',
      loading: false,
      submitLoading: {
        grade: false, timetable: false
      },
      oldTab: '1',
      activeTab: '1',
      conflictType: {
        reason1: '老师冲突 请修改时间',
        reason2: '教室冲突 请修改时间或教室',
        reason3: '学员冲突 请修改时间'
      },
      courseLists: [],
      addTableType: '',
      timetableDetail: {},

      syllabusParams: {},

      dialogStatus: {timetable: false, conflict: false, course: false, grade: false, syllabusDetail: false, syllabus: false},
      addStudentDialog: false,

      gradeType: '',
      editCourseDetail: {},
      editGradeDetail: {},
      classEdit: false,
      courseOperate: '', //添加课程/编辑课程
      operationLists: courseStatic.classRoomStatus,
      timeRules: {
        begin_time: [
          {required: true, message: '请选择起始时间', trigger: 'change'}
        ],
        end_time: [
          {required: true, message: '请选择结束时间', trigger: 'change'}
        ],
        week: [
          {required: true, message: '请选择某天', trigger: 'change'}
        ]
      },
      courseRules: {
        name: [
          {required: true, message: '请输入课程名称'},
          {max: 20, message: '长度不能超过20个字符'}
        ],
        expire: [
          {required: true, message: '请输入课程有效期'}
        ],
        unit_price: [
          {required: true, message: '请输入学费标准'}
        ],
        lesson_time: [
          {required: true, message: '请输入课节时长'}
        ]
      }
    };
  },
  methods: {
    //弹出框关闭事件
    dialogClose (type) {
      this.$refs[type].resetFields();
    },
    CB_popverClose () {
      this.addTableType = '';
      this.timetableDetail = {};
    },
    CB_timetableSuccess () {
      this.getCourseLists();
    },
    tabClick (item) {
      if (this.oldTab === item.name) {
        return 0;
      }
      this.oldTab = item.name;
      this.courseLists.forEach((v, num) => {
        this.$refs[`grade-table-content_${num}`][0].style.height = 0;
      });
      this.getCourseLists();
    },
    //课程大纲 点击
    async syllabusClick (id) {
      let result = await this.$$request.get('course/getCourseOutline', {courseId: id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.syllabusParams = {course_id: id, course_syllabus: result.courseOutline};
      this.dialogStatus.syllabus = true;
    },
    listHeaderClick (course, index) {
      let dom = this.$refs[`grade-table-content_${index}`][0];
      let child = dom.firstChild;

      if (!course.collapse) {
        dom.style.height = `${child.offsetHeight}px`;
        course.collapse = true;
      } else {
        dom.style.height = 0;
        course.collapse = false;
      }
    },
    gradeStatus (data) {
      let date = new Date().getTime() / 1000, result = {};

      if (data.status === -3) {
        result = {id: 'stop', name: '停课'};
      } else if (data.status === -2) {
        result = {id: 'no', name: '未开课'};
      } else {
        result = data.start_time < date ? {id: 'yes', name: '已开课'} : {id: 'no', name: '未开课'};
      }

      return result;
    },
    //弹窗变比，改变dialog状态回调
    CB_dialogStatus (type) {
      if (type === 'add_course') {
        this.editCourseDetail = {};
        this.dialogStatus.course = false;
        this.courseOperate = '';

        return 0;
      }
      if (type === 'grade') {
        this.editGradeDetail = {};
        this.dialogStatus.grade = false;

        return 0;
      }
    },
    CB_addGrade (course_id) {
      this.getCourseLists(course_id);
      this.dialogStatus.grade = false;
    },
    CB_addCourse (course_id) {
      this.getCourseLists(course_id);
      this.dialogStatus.course = false;
    },
    //新增课程
    addCourse () {
      this.courseOperate = 'add';
      this.dialogStatus.course = true;
    },
    //编辑课程
    editCourse (course) {
      this.courseOperate = 'edit';
      this.editCourseDetail = course;
      this.dialogStatus.course = true;
    },
    //新增班级，获取form相关数据
    async addClassRoom (id, type) {
      this.editGradeDetail = {course_id: id, course_type: type};
      this.gradeType = 'add';
      this.dialogStatus.grade = true;
    },
    //修改班级
    async editClassRoom (data, type) {
      console.log(data);
      this.editGradeDetail = {...data, course_type: type};
      this.gradeType = 'edit';
      this.dialogStatus.grade = true;
    },
    //班级操作列表点击回调
    handleCommand (option) {
      switch (option.type) {
        case 'begin':
          this.startCourseStatus(option);
          break;
        case 'stop':
          this.classCourseState(option);
          break;
        case 'edit':
          this.editClassRoom(option.grade_info, option.course_info.type);
          break;
        case 'delete':
          this.$confirm('确定删除班级吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.deleteClassRoom(option.grade_info);
          }).catch(() => {
            return 0;
          });
          break;
      }
    },
    //新增排课  type: single / multiple
    addTimetable (option) {
      console.log(option);
      if (!option.grade_info.unscheduled && option.course_info.type === 1) {
        return 0;
      }
      this.timetableDetail = {
        course_info: {
          type: option.course_info.type,
          name: option.course_info.name,
          lesson_time: option.course_info.lesson_time
        },
        grade_info: option.grade_info
      };
      this.addTableType = 'multiple';
      this.dialogStatus.timetable = true;
    },
    //批量排课，根据开课日期，重新循环获取周数据
    // getNewWeekLists (nowTime, num) {
    //   let day = new Date(nowTime).getDay();
    //   let oneDayLong = 24 * 60 * 60 * 1000;
    //   let newTime = num == 0 ? nowTime + (7 - day) * oneDayLong : nowTime - (day - num) * oneDayLong;
    //   let newFullDay = this.$$tools.format(newTime / 1000).replace(/\-/g, '/');

    //   return newFullDay || 0;
    // },
    //班级课程结课、停课、开课
    classCourseState (option) {
      let text = option.type === 'over' ? '结课以后会将班级的学员和课表信息清空，您确定要结课吗?' : '停课以后将班级的课表信息关闭，您确定要停课吗？';

      this.$confirm(text, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.submitChangeCourseStatus(option, option.type == 'over' ? -2 : -3);
      }).catch(() => {
        return 0;
      });
    },
    //开课 判断是不是需要排课
    async startCourseStatus (option) {
      let result = await this.$$request.post('/grade/changeStatus', {id: option.grade_info.id, status: 8});

      console.log(result);
      if (!result) {
        return 0;
      }

      this.getCourseLists(option.course_info.id);

      switch (result.status) {
        case 1: //没有剩余有效课表
          this.$confirm('开课成功，您是否需要对该课程进行排课？', '排课提醒', {
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning'
          }).then(() => {
            //排课
            this.addTimetable(option);
          }).catch(() => {
            return 0;
          });
          break;

        case 2: //有剩余有效课表，但与停课后排的课表不冲突
          this.$confirm('开课成功，您是否需要删除停课前所排课程表并进行重新排课？', '排课提醒', {
            confirmButtonText: '是',
            cancelButtonText: '否',
            type: 'warning'
          }).then(() => {
            //排课
            this.submitChangeCourseStatus(option, 1);
            this.addTimetable(option);
          }).catch(() => {
            return 0;
          });
          break;

        case 3: //有剩余有效课表，与停课后排的课表有冲突
          this.$confirm('停课前所排课表与现有课表存在冲突，无法开课，请重新排课！', '排课提醒', {
            confirmButtonText: '重新排课',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            //排课
            this.submitChangeCourseStatus(option, -1);
            this.addTimetable(option);
          }).catch(() => {
            return 0;
          });
          break;

        case 4: //剩余课时为0，直接开课成功
          this.$message.success('开课成功!');
          break;
      }
    },
    //改变班级状态 开课/结课/停课
    async submitChangeCourseStatus (option, status) {
      let params = {id: option.grade_info.id, status: status};
      let result = await this.$$request.post('/grade/changeStatus', params);

      if (!result) {
        return 0;
      }
      if (status === -2 || status === -3) {
        this.$message.success('修改状态成功');
      }
      this.getCourseLists(option.course_info.id);
    },
    //删除班级
    async deleteClassRoom (data) {
      let result = await this.$$request.post('/grade/delete', {id: data.id});

      if (!result) {
        return 0;
      }
      this.$message.success('已删除');
      this.getCourseLists(data.course_id);
    },
    //获取课程列表
    async getCourseLists (course_id) {
      console.log(course_id)
      this.loading = true;
      let active = '';
      let result = await this.$$request.post('/course/lists', {type: this.activeTab});

      if (!result) {
        return 0;
      }
      result.lists.forEach((d, num) => {
        if (course_id && course_id == d.id) {
          d.collapse = true;
          active = num;
        } else {
          d.collapse = false;
        }

        d.class_lists.forEach(v => {
          v.gradeStatus = this.gradeStatus(v);
        });
      });
      this.courseLists = result.lists;
      this.loading = false;
      this.$nextTick(() => {
        if (active !== '') {
          let dom = this.$refs[`grade-table-content_${active}`][0];
          let child = dom.firstChild;

          dom.style.height = `${child.offsetHeight}px`;
        }
      });

      return true;
    }
  },
  async created () {
    this.$store.dispatch('getSynstemSetLists');
    let datas = await this.getCourseLists();

    if (datas) {
      this.state = 'loaded';
    }
  }
};
</script>

<style lang="less" scoped>
    h4 {
        font-weight: normal;
        padding-left: 38px;
    }
    .course-status {
        span {
            width: 60px;
            text-align: center;
            height: 25px;
            line-height: 25px;
            border-radius: 5px;
            &.green {
                background-color: #E4F3E8;
                color: #347924;
            }
            &.red {
                background-color: #FFF0EA;
                color: #aa4e2a;
            }
            &.gray {
                background-color: #EDEDED;
                color: #555555;
            }
        }
    }
    .content-box {
        height: 750px;
    }
    .course-list-box {
        .list-header {
            background-color: #EEEEEE;
            height: 50px;
            span {
                img {
                    display: block;
                }
            }
            .zhankai-icon {
                -webkit-transition: transform 300ms;
                transition: transform 300ms;
                &.rotate {
                    -webkit-transform :rotate(180deg);
                    transform: rotate(180deg);
                }
            }
        }
        .grade-table-box {
            height: 0;
            position: relative;
            overflow: hidden;
            -webkit-transition:  height 300ms;
            transition:  height 300ms;
        }
        .el-table {
            border-left: 1px #eeeeee solid;
            border-right: 1px #eeeeee solid;
        }
        .unfold-icon {
            .iconfont {
                -webkit-transition: transform 300ms;
                transition: transform 300ms;
                display: block;
                &.rotate {
                    -webkit-transform :rotate(180deg);
                    transform: rotate(180deg);
                }
            }
        }
        .course_type{
            border: 1px solid #a9a9a9;
            height: 20px;
            line-height: 20px;
            padding: 0 5px;
            border-radius: 4px;
        }
        .syllabus {
            border: 1px solid #45DAD5;
            height: 20px;
            line-height: 20px;
            padding: 0 5px;
            border-radius: 4px;
        }
    }
    .course-lits-nothing {
        height: 100%;
    }

    .form-box {
        .add-lesson-bottom {
            padding-top: 30px;
            border-top: 1px #e3e3e3 solid;
        }
        .el-select, .el-date-editor {
            width: 100%;
        }
        .form-unit {
            position: absolute;
            right: -30px;
            top: 0;
        }
        .add-date {
            position: absolute;
            right: -35px;
            top: 5px;
        }
        .add-date-box {
            .title {
                text-align: right;
                width: 120px;
                padding-right: 13px;
                padding-top: 3px;
                &.is-required {
                    &:before {
                        content: '*';
                        color: #f56c6c;
                        margin-right: 4px;
                    }
                }
            }
            .list {
                max-height: 370px;
                overflow: hidden;
                overflow-y: auto;
            }
            .delete-time {
                top: 5px;
                cursor: pointer;
            }
        }
        .addtimetable-student {
            .label {
                line-height: 32px;
                width: 120px;
                text-align: right;
                span {
                    padding-right: 12px;
                }
            }
            ul {
                max-height: 100px;
                overflow: hidden;
                overflow-y: auto;
                li {
                    background-color: #f0f2f5;
                    border-radius: 3px;
                    padding: 0 5px;
                }
            }
        }
        .time-table-student-check {
            max-height: 200px;
            overflow: hidden;
            overflow-y: auto;
            .el-checkbox, .el-radio {
                margin-left: 0;
                margin-bottom: 10px;
                width: 140px;
            }
        }
    }

    .conflict-box {
        .el-select, .el-date-editor {
            width: 100%;
        }
        h3 {
            color: #E72E2E;
            font-size: 17px;
            text-align: center;
            font-weight: normal;
        }
        .row-header {
            background-color: #EEEEEE !important;
        }
    }

    .operation-lists {
        width: 110px;
        /deep/ .el-dropdown-menu__item {
            padding: 0 27px;
        }
    }
</style>