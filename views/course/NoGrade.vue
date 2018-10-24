<template>
     <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <TableHeader title="无班课程">
                <MyButton @click.native="addCourse" class="ml-20">添加课程</MyButton>
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
                              <i class="iconfont icon-bianji ml-10" @click="editCourse(course)"></i>
                          </span>
                          <span class="syllabus fc-m ml-20" v-if="$store.state.systemSetting.outline && $store.state.systemSetting.outline.status" @click="syllabusClick(course.id)">课程大纲</span>
                      </div>
                      <div class="d-f f-a-c">
                          <span class="fc-9 ml-20 zhankai-icon" :class="{'rotate': course.collapse}" @click="listHeaderClick(course, index)">
                              <i class="iconfont icon-zhankai"></i>
                          </span>
                      </div>
                  </div>
                  <div class="grade-table-box" :ref="'grade-table-content_' + index" v-if="course.student_lists && course.student_lists.data">
                      <el-table :data="course.student_lists.data" v-if="course.student_lists.data.length" strip>
                          <el-table-column label="序号" type="index" align="center"></el-table-column>
                          <el-table-column label="学员姓名" align="center">
                              <template slot-scope="scope">
                                  <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student.id}}" class="fc-m">{{scope.row.student.name}}</router-link>
                              </template>
                          </el-table-column>
                          <el-table-column label="任课老师" prop="teacher.name" align="center"> </el-table-column>
                          <el-table-column label="课程总课时" prop="total_num" align="center"></el-table-column>
                          <el-table-column label="未排课时" prop="no_rank_num" align="center"></el-table-column>
                          <el-table-column label="剩余课时" prop="lesson_num_remain" align="center"></el-table-column>
                          <el-table-column label="操作" align="center">
                              <template slot-scope="scope">
                                <span class="fc-m cursor-pointer" @click="editTeacher(course, scope.row)">分配老师</span>
                                <span class="fc-m ml-10 cursor-pointer" @click="planTimeTable(course, scope.row)">排课</span>
                              </template>
                          </el-table-column>
                      </el-table>
                      <el-pagination v-if="course.student_lists.total > 10" small
                        class="d-f f-j-e pt-20 student-pagination"
                        :page-size="course.student_lists.per_page"
                        layout="total, prev, pager, next"
                        :total="course.student_lists.total"
                        :current-page="course.student_lists.current_page"
                        @click.native="paginationClick(course, index)"
                        @current-change="paginationChange">
                      </el-pagination>
                  </div>
              </div>
            </div>
        </el-card>

        <!-- 添加、修改课程弹窗 -->
        <AddCourseDialog :dialogStatus="dialogStatus.course" :type="courseOperate" :editDetail="editDetail" :courseMode="2"
            @CB-dialogStatus="CB_dialogStatus" @CB-addCourse="CB_addCourse">
        </AddCourseDialog>


        <!-- 编辑，修改老师弹窗 -->
        <el-dialog title="编辑" width="400px" center :visible.sync="dialogStatus.edit" :close-on-click-modal="false">
            <el-form :model="teacherForm" label-width="100px" size="small" :rules="teacherRules" ref="teacherForm">
                <el-form-item prop="techer_id" label="选择老师：">
                    <el-select v-model="teacherForm.techer_id" placeholder="请选择">
                        <el-option v-for="(teacher, index) in editTeacherLists" :key="index" :label="teacher.name" :value="teacher.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="d-f f-j-c mt-40"><MyButton @click.native="editTeacherDone" :loading="submitLoading.edit">确定</MyButton></div>
        </el-dialog>

        <!-- 排课弹窗 -->
        <el-dialog title="快速排课" width="850px" center :visible.sync="dialogStatus.timetable" :close-on-click-modal="false" @close="dialogClose('timetableForm')">
            <div class="form-box">
                <el-form :model="timetableForm" label-width="100px" size="small" :rules="timetableRules" ref="timetableForm">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="排课课程：">{{timetableForm.course_name}}</el-form-item>

                            <el-form-item label="上课教室：" prop="room_id">
                                <el-select placeholder="请选择"  v-model="timetableForm.room_id">
                                    <el-option v-for="(item, index) in $store.state.classRoom" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>

                            <div class="d-f">
                                <el-form-item label="上课时间：" prop="begin_day" class="begin-day-form">
                                    <el-date-picker v-model="timetableForm.begin_day"
                                        :picker-options="pickerBeginDateAfter" type="date" :editable="false"
                                        @change="beginTimeChange"
                                        placeholder="选择日期" value-format="yyyy/MM/dd">
                                    </el-date-picker>
                                </el-form-item>

                                <el-form-item  label-width="0" prop="begin_time" class="begin-day-time ml-10">
                                    <el-time-select
                                        :editable="false" v-model="timetableForm.begin_time"
                                        :picker-options="timePicker" placeholder="时间">
                                    </el-time-select>
                                </el-form-item>
                            </div>
                        </el-col>

                        <el-col :span="12">
                            <el-form-item label="上课老师：">{{timetableForm.teacher_name}}</el-form-item>

                            <el-form-item label="上课学员：">{{timetableForm.student_name}}</el-form-item>

                            <el-form-item label="扣课时数：" prop="lesson_num">
                                <el-input-number v-model="timetableForm.lesson_num" controls-position="right" :min="1" :max="99"></el-input-number><span class="pl-10">课时</span>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <div class="d-f f-j-c mt-30">
                        <MyButton @click.native="timetableDone" :loading="submitLoading.timetable">确定</MyButton>
                    </div>
                </el-form>
            </div>
        </el-dialog>

        <!-- 冲突弹窗 -->
        <el-dialog width="1020px" center :visible.sync="dialogStatus.conflictMask" :close-on-click-modal="false">
            <div class="conflict-box">
                <h3>排课冲突提醒</h3>
                <p class="mb-20">课程：{{timetableForm.course_name}}</p>

                <el-table class="student-table" border :data="conflictLists" height="400" header-row-class-name="row-header">
                    <el-table-column label="序号" prop="index" type="index" width="50" class-name="number"></el-table-column>
                    <el-table-column label="上课日期">
                        <template slot-scope="scope">
                            <el-date-picker size="small" type="date" :editable="false" :clearable="false" value-format="timestamp" v-model="scope.row.begin_time"></el-date-picker>
                        </template>
                    </el-table-column>
                    <el-table-column label="开始时间">
                        <template slot-scope="scope">
                            <el-time-select size="small" :picker-options="timePicker" :editable="false" :clearable="false" v-model="scope.row.begin_hours"></el-time-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="冲突教室">
                        <template slot-scope="scope">
                            <el-select v-model="conflict_room" size="small" v-if="scope.row.conflict_data.reason == 2" key="conflict_room">
                                <el-option v-for="(item, index) in $store.state.classRoom" :key="index" :label="item.name" :value="item.id" ></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="冲突学员">
                        <template slot-scope="scope">
                            <span v-if="scope.row.conflict_data.reason == 3">
                                <i v-for="(item, index) in scope.row.conflict_data.data" :key="index"><i v-if="index > 0">/</i>{{item.name}}</i>
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="解决建议">
                        <template slot-scope="scope">{{conflictType[`reason${scope.row.conflict_data.reason}`]}}</template>
                    </el-table-column>
                </el-table>

                <div class="d-f f-j-c mt-30">
                    <MyButton type="gray" @click.native="dialogStatus.conflictMask = false">返回编辑</MyButton>
                    <MyButton type="subm" class="ml-30" @click.native="doneModify" :loading="submitLoading.timetable">确认修改</MyButton>
                </div>
            </div>
        </el-dialog>

        <!-- 课程大纲 -->
        <CourseSyllabus v-model="dialogStatus.syllabus" :syllabus="syllabusParams"/>
     </div>
</template>

<script>

import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import AddCourseDialog from '../../components/dialog/AddCourse';
import CourseSyllabus from '../../components/dialog/CourseSyllabus';
import {timePicker} from '../../script/static';

export default {
  components: {TableHeader, MyButton, AddCourseDialog, CourseSyllabus},
  data () {
    return {
      state: 'loading',
      conflictType: {
        reason1: '老师冲突 请修改时间',
        reason2: '教室冲突 请修改时间或教室',
        reason3: '学员冲突 请修改时间'
      },
      courseOperate: '',
      courseLists: [],
      activeTab: '1',
      oldTab: '1',
      loading: false,

      conflict_room: '',

      syllabusParams: {},
      courseInfo: {
        course: {}, index: ''
      },

      editDetail: {},
      editTeacherLists: [],
      dialogStatus: {
        course: false,
        edit: false,
        timetable: false,
        conflictMask: false,
        syllabus: false
      },
      submitLoading: {
        edit: false,
        timetable: false
      },
      conflictLists: [], //冲突列表
      other_lists: [], //正常数据
      teacherForm: {course_id: '', techer_id: '', student_id: '', old_teacher_id: ''},
      timetableForm: {
        course_id: '', course_name: '', student_id: '', student_name: '', teacher_id: '', teacher_name: '', room_id: '', begin_time: '', begin_day: '', lesson_num: ''
      },
      teacherRules: {
        techer_id: [
          {required: true, message: '请选择老师', trigger: 'change'}
        ]
      },
      timetableRules: {
        room_id: [
          {required: true, message: '请选择上课教室', trigger: 'change'}
        ],
        begin_time: [
          {required: true, message: '请选择上课时间', trigger: 'change'}
        ],
        lesson_num: [
          {required: true, message: '请输入扣课时数'}
        ]
      },
      timePicker: timePicker,
      disableStartTime: new Date().setHours(0, 0, 0, 0),
      pickerBeginDateAfter: {
        disabledDate: (time) => {
          return time.getTime() < this.disableStartTime;
        }
      }
    };
  },
  methods: {
    dialogClose (type) {
      this.$refs[type].resetFields();
    },
    tabClick (val) {
      if (this.oldTab === val) {
        return 0;
      }
      this.oldTab = val;
      this.getCourseLists();
    },
    //弹窗变比，改变dialog状态回调
    CB_dialogStatus (type) {
      if (type === 'add_course') {
        this.editDetail = {};
        this.dialogStatus.course = false;
        this.courseOperate = '';
      }
    },
    CB_addCourse () {
      this.getCourseLists();
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
      this.editDetail = course;
      this.dialogStatus.course = true;
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
    // 课程header点击
    async listHeaderClick (course, index) {
      this.courseInfo.course = course;
      this.courseInfo.index = index;

      if (Object.keys(course.student_lists).length) {
        this.courseCollapse();
      } else {
        let datas = await this.getOrderStudentLists();

        if (datas) {
          this.courseCollapse(true);
        }
      }
    },
    paginationClick (course, index) {
      this.courseInfo.course = course;
      this.courseInfo.index = index;
    },
    // 学员列表分页
    paginationChange (current_page) {
      setTimeout(() => {
        this.paginationMethods(current_page);
      }, 100);
    },
    async paginationMethods (current_page) {
      let datas = await this.getOrderStudentLists(current_page);

      if (datas) {
        this.courseCollapse(true);
      }
    },
    // 学员列表展开处理
    courseCollapse (collapse) {
      let {course, index} = this.courseInfo;
      let dom = this.$refs[`grade-table-content_${index}`][0];
      let height = 0;

      for (let i = 0; i < dom.children.length; i++) {
        height += dom.children[i].offsetHeight;
      }

      if (!course.collapse || collapse) {
        dom.style.height = `${height}px`;
        course.collapse = true;
      } else {
        dom.style.height = 0;
        course.collapse = false;
      }
    },
    // 获取课程 班级学员列表
    async getOrderStudentLists (page) {
      this.loading = true;
      let params = {
        course_id: this.courseInfo.course.id,
        per_page: 10
      };

      if (page) {
        params.page = page;
      }
      let res = await this.$$request.get('/course/orderStudentLists', params);

      console.log(res);
      if (!res) {
        return 0;
      }
      this.courseLists.forEach(v => {
        if (v.id === this.courseInfo.course.id) {
          v.student_lists = res;
        }
      });
      this.loading = false;

      return true;
    },
    //获取课程列表
    async getCourseLists () {
      this.loading = true;
      let active = '';
      let result = await this.$$request.post('/course/orderLists', {type: this.activeTab});

      console.log(result);
      if (!result) {
        return 0;
      }

      result.lists.forEach((d) => {
        d.collapse = false;
        d.student_lists = {};
      });

      this.courseLists = result.lists;
      this.loading = false;
      this.$nextTick(() => {
        if (active !== '') {
          let dom = this.$refs[`grade-table-content_${ active}`][0];
          let child = dom.firstChild;

          dom.style.height = `${child.offsetHeight}px`;
        }
      });

      return true;
    },
    //快速时间选择change
    beginTimeChange (val) {
      if (new Date(val).toDateString() === new Date().toDateString()) {
        this.timePicker.minTime = [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
      } else {
        this.timePicker.minTime = 0;
      }
    },
    //排课 click
    planTimeTable (course_info, grade_info) {
      this.timetableForm.course_id = course_info.id;
      this.timetableForm.course_name = course_info.name;
      this.timetableForm.student_id = grade_info.student.id;
      this.timetableForm.student_name = grade_info.student.name;
      this.timetableForm.teacher_id = grade_info.teacher.id;
      this.timetableForm.teacher_name = grade_info.teacher.name;
      this.timetableForm.lesson_time = course_info.lesson_time;

      this.dialogStatus.timetable = true;
    },
    //排课确定
    timetableDone () {
      this.$refs.timetableForm.validate(valid => {
        if (valid) {
          this.submitTimeTable();
        }
      });
    },
    //提交排课数据
    submitTimeTable () {
      if (this.submitLoading.timetable) {
        return 0;
      }
      this.submitLoading.timetable = true;

      let params = {
        course_id: this.timetableForm.course_id,
        // student_id: this.timetableForm.student_id,
        student_lists: [{student_id: this.timetableForm.student_id}],
        teacher_ids: this.timetableForm.teacher_id,
        room_id: this.timetableForm.room_id,
        lesson_num: this.timetableForm.lesson_num
      };

      params.begin_time = new Date(`${this.timetableForm.begin_day} ${this.timetableForm.begin_time}`).getTime() / 1000;
      params.end_time = params.begin_time + this.timetableForm.lesson_time * 60;

      this.getConflictLists(params);
    },
    //冲突页面确定修改
    doneModify () {
      let lists = this.conflictLists.map(v => {
        let item = {};

        for (let key in v) {
          if (key !== 'begin_hours' && key !== 'conflict_data') {
            if (key === 'begin_time') {
              item[key] = new Date(`${this.$$tools.format(v[key] / 1000).replace(/\-/g, '/')} ${v.begin_hours}`).getTime() / 1000;
            } else if (key === 'end_time') {
              item[key] = item.begin_time + this.timetableForm.lesson_time * 60;
            } else if (key === 'room_id') {
              item[key] = this.conflict_room ? this.conflict_room : this.timetableForm.room_id;
            } else {
              item[key] = v[key];
            }
          }
        }

        return item;
      });

      console.log(lists);

      lists = lists.concat(this.other_lists);
      this.getConflictLists({lists: lists});
    },
    //提交排课数据，验证冲突
    async getConflictLists (params) {
      console.log(params);

      let result = await this.$$request.post('/timetable/notModelCourse', params);

      this.submitLoading.timetable = false;
      if (!result) {
        return 0;
      }

      if (result.status === 0) {
        return this.$message.warning('操作失败，请稍后再试!');
      }

      if (result.status === 1) {
        this.$message.success('快速排课成功!');
        this.dialogStatus.timetable = false;
        this.dialogStatus.conflictMask = false;
      } else if (result.status === -1) {
        result.conflict_lists.forEach(v => {
          v.begin_time = v.begin_time * 1000;
          let nowtime = new Date(v.begin_time);

          v.begin_hours = [nowtime.getHours(), nowtime.getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
          if (v.conflict_data.reason == 2) {
            if (v.conflict_data.data.constructor === Array) {
              this.conflict_room = v.conflict_data.data.map(k => {
                return k.id;
              });
            } else {
              this.conflict_room = v.conflict_data.data.id;
            }
          }
        });

        this.conflictLists = result.conflict_lists; //冲突列表
        this.other_lists = result.lists; //正常列表
        this.dialogStatus.conflictMask = true;
      }
    },
    //编辑修改老师信息 click
    editTeacher (course_info, grade_info) {
      this.teacherForm.old_teacher_id = grade_info.teacher.id;
      this.teacherForm.techer_id = grade_info.teacher.id;
      this.teacherForm.course_id = course_info.id;
      this.teacherForm.student_id = grade_info.student.id;
      this.getEditTeacherLists(course_info.id);
    },
    //获取编辑老师列表
    async getEditTeacherLists (id) {
      let result = await this.$$request.post('/course/orderTeachers', {course_id: id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.editTeacherLists = result.teachers;
      this.dialogStatus.edit = true;
    },
    //修改老师确定 click
    editTeacherDone () {
      this.$refs.teacherForm.validate(valid => {
        if (valid) {
          this.submitEditTeacher();
        }
      });
    },
    //提交修改老师数据
    async submitEditTeacher () {
      console.log(this.teacherForm);

      if (this.submitLoading.edit) {
        return 0;
      }
      this.submitLoading.edit = true;

      let result = await this.$$request.post('/course/changeTeacher', {
        id: this.teacherForm.old_teacher_id,
        course_id: this.teacherForm.course_id,
        teacher_id: this.teacherForm.techer_id,
        student_id: this.teacherForm.student_id
      });

      console.log(result);
      this.submitLoading.edit = false;
      if (!result) {
        return 0;
      }

      this.$message.success('修改老师成功');
      this.dialogStatus.edit = false;
      this.getCourseLists();
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
            .student-pagination {
              /deep/ .el-pager li {
                &:hover {
                  color: #45DAD5;
                }
                &.active {
                  color: #45DAD5;
                }
              }
              /deep/ button {
                &:hover {
                  color: #45DAD5;
                }
              }
            }
        }
        .el-table {
            border-left: 1px #eeeeee solid;
            border-right: 1px #eeeeee solid;
        }
        // .unfold-icon {
        //     .iconfont {
        //         -webkit-transition: transform 300ms;
        //         transition: transform 300ms;
        //         display: block;
        //         &.rotate {
        //             -webkit-transform :rotate(180deg);
        //             transform: rotate(180deg);
        //         }
        //     }
        // }
        .course_type{
            display: inline-block;
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
    .form-box {
        padding: 0 10px;
        .el-select {
            width: 100%;
        }
        /deep/ .begin-day-form .el-date-editor{
            // width: 130px !important;
        }
        /deep/ .begin-day-time .el-date-editor{
            width: 100px !important;
        }
        /deep/ .el-input-number {
            width: 150px;
        }
        /deep/ .el-input {
            width: 150px;
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
        width: 130px;
        /deep/ .el-dropdown-menu__item {
            padding: 0 20px;
        }
    }
</style>

