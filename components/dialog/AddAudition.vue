<template>
  <el-dialog title="试听" width="950px" center :visible.sync="dialogStatus.audition" :close-on-click-modal="false" @close="dialogClose" :append-to-body="istoBody">
      <div class="form-box d-f pl-30 pr-30">
        <div class="canlender-box d-f f-d-c f-j-b">
          <div class="input-box d-f f-j-b">
              <el-select v-model="auditionData.course_id" placeholder="请选择" size="small" @change="getListenCourseLists">
                  <el-option label="全部课程" value=""></el-option>
                  <el-option v-for="(item, index) in courseLists" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
              <el-select v-model="auditionData.teacher_id" placeholder="请选择" size="small" @change="getListenCourseLists" class="ml-20">
                  <el-option label="全部老师" value=""></el-option>
                  <el-option v-for="(item, index) in teacherLists" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
          </div>
          <TableCalender v-model="auditionData.time" @input="canlenderChange" @date-change="dateChange" :tips="hasTimeTable"></TableCalender>
        </div>

        <div class="flex1 ml-30 listen-course-box" v-loading="loading.timetable">
            <div v-if="listenCourseLists.length" class="audition-lists">
                <ul>
                    <li class="fc-7 cursor-pointer p-r"
                        :class="{'check-show': auditionType !== 'student_audition', active: checkListen[0] === list.id}"
                        v-for="(list, index) in listenCourseLists" :key="index" @click="listenCourseClick(list)">
                        <p class="fs-14 fc-2">{{list.course.name}}</p>
                        <p class="two-p mt-5 d-f f-a-c fs-12">
                            <span class="d-f f-a-c">
                                <i class="time-icon"></i>
                                <i class="pl-5">{{$$tools.formatTime(list.begin_time)}}-{{$$tools.formatTime(list.end_time)}}</i>
                            </span>
                            <span class="ml-30 d-f f-a-c">
                                <i class="teacher-icon"></i>
                                <i class="pl-5" :class="{'pl-10': key}" v-for="(item, key) in list.teacher" :key="key">{{item.name}}</i>
                            </span>
                            <span v-if="list.class_room" class="ml-30 d-f f-a-c">
                                <i class="address-icon"></i>
                                <i class="pl-5">{{list.class_room.name}}</i>
                            </span>
                        </p>
                        <p class="mt-5 fs-12"><span>正式学员：<i>{{list.student_num}}/{{list.grade.limit_num}}</i></span><span class="pl-50">试听学员：{{list.listen_num}}</span></p>
                        <div v-if="auditionType === 'student_audition'" @click="listenAddStudent(list.id)" class="p-a add-student">添加学员</div>
                    </li>
                </ul>
            </div>
            <div v-else class="d-f f-j-c f-a-c listen-nothing"><span class="fc-5">暂无数据</span></div>
          </div>
      </div>
      <div class="d-f f-j-c mt-50" v-if="auditionType !== 'student_audition'">
        <MyButton @click.native="auditionDoneClick" type="border" fontColor="fc-m">暂不选课</MyButton>
        <MyButton @click.native="auditionDoneClick('yes')" :loading="submitLoading" class="ml-20">确定</MyButton>
      </div>


      <!-- 试听选择学员 -->
      <el-dialog title="添加试听学员" width="800px" center :visible.sync="dialogStatus.student" append-to-body :close-on-click-modal="false" @close="dialogClose('student')">
          <div class="pl-20 pr-20">
              <div class="d-f f-j-c">
                  <el-input v-model.trim="studentKeyword" placeholder="输入学员姓名/手机号" size="small" class="search-input mr-10"></el-input>
                  <MyButton @click.native="listenStudentSearch" :radius="false">搜索</MyButton>
              </div>

              <el-table class="mt-30 scroll-box student-table" :data="listenStudentFilterLists" stripe height="400" v-loading="loading.student">
                  <el-table-column label="序号" type="index" align="center"></el-table-column>
                  <el-table-column label="姓名" prop="name" align="center"></el-table-column>
                  <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                  <el-table-column label="顾问" prop="advisor_name" align="center"></el-table-column>
                  <el-table-column label="渠道" prop="source_name" align="center"></el-table-column>
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
                  <MyButton class="mt-20" @click.native="submitAuditionData('student_audition')" :type="checkListenStudent.length ? 'main' : 'gray'" :loading="submitLoading">确定</MyButton>
              </div>
          </div>
      </el-dialog>
  </el-dialog>
</template>

<script>
import MyButton from '../../components/common/MyButton';
import TableCalender from '../../components/common/TimeTableCalender';

export default {
  props: {
    value: {default: false},
    studentId: {default: ''},
    istoBody: {default: false},
    auditionType: {default: 'audition'}
  },
  components: {MyButton, TableCalender},
  watch: {
    value (newVal) {
      if (newVal) {
        this.getListenLists();
      }
      this.dialogStatus.audition = newVal;
    }
  },
  data () {
    return {
      submitLoading: false,
      loading: {timetable: false, student: false},
      dialogStatus: {audition: this.value, student: false},
      checkListen: [],
      teacherLists: [],
      courseLists: [],
      listenCourseLists: [],
      followUpForm: {
        way_id: '', //跟进方式
        status: '', //跟进结果
        invited_at: '', //邀约时间
        content: '', //跟进内容
        next_at: ''
      },

      studentKeyword: '', //试听学员列表，搜索关键字
      listenStudentLists: [], //试听学员列表
      checkListenStudent: [], //选中的试听学员
      listenStudentFilterLists: [], //试听学员筛选列表

      auditionData: {time: new Date(), teacher_id: '', course_id: '', start_time: '', end_time: ''}, //试听数据
      hasTimeTable: [],
      pickListenDisable: {
        disabledDate: (time) => {
          return time.getTime() < new Date().setHours(0, 0, 0, 0);
        }
      }
    };
  },
  methods: {
    dialogClose (type) {
      if (type === 'student') {
        this.checkListenStudent = [];
        this.studentKeyword = '';
      } else {
        this.listenCourseInit();
        this.dialogStatus.audition = false;
        this.$emit('input', this.dialogStatus.audition);
      }
    },
    // 时间change
    canlenderChange () {
      this.getListenCourseLists();
    },
    dateChange (data) {
      this.auditionData.start_time = data.start_time;
      this.auditionData.end_time = data.end_time;
      this.getTimeTableRed();
    },
    listenCourseInit () {
      this.checkListen = [];
      this.teacherLists = [];
      this.courseLists = [];
      this.listenCourseLists = [];
      this.auditionData.time = new Date();
      this.auditionData.teacher_id = '';
      this.auditionData.course_id = '';
    },

    //试听学员搜索
    listenStudentSearch () {
      this.listenStudentFilterLists = this.listenStudentFilter(this.studentKeyword);
    },
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
    listenAddStudent (id) {
      this.dialogStatus.student = true;
      this.checkListen = [id];
      this.checkListenStudent = [];
      this.getListenStudentLists();
    },
    //获取试听学员列表
    async getListenStudentLists () {
      this.loading.student = true;
      let result = await this.$$request.get('/listenCourse/studentLists', {timetable_id: this.checkListen[0]});

      console.log(result);
      if (!result) {
        return 0;
      }

      result.lists.forEach(v => {
        v.active = false;
      });

      this.loading.student = false;
      this.listenStudentLists = result.lists; //原始数据
      this.listenStudentFilterLists = this.listenStudentFilter();
    },
    //试听学员列表搜索搜索筛选方法
    listenStudentFilter (text) {
      // document.querySelector('.scroll-box .el-table__body-wrapper').scrollTo(0, 0);

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
    async getListenLists () {
      this.checkListen.splice(0, this.checkListen.length);

      let select_time = this.auditionData.time / 1000;
      let current_time = new Date().getTime() / 1000;
      let old_time = select_time < current_time ? current_time : select_time;
      let result = await this.$$request.post('/listenCourse/fill', {start_time: old_time});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.teacherLists = result.teacher;
      this.courseLists = result.course;
      this.getListenCourseLists();
    },
    //获取试听课程列表
    async getListenCourseLists () {
      this.checkListen = [];
      this.loading.timetable = true;

      let params = {
        time: this.auditionData.time / 1000,
        teacher_id: this.auditionData.teacher_id,
        course_id: this.auditionData.course_id
      };

      console.log(params);
      let result = await this.$$request.post('/listenCourse/lists', {data: params});

      if (!result) {
        return 0;
      }
      this.listenCourseLists = result.lists;
      this.loading.timetable = false;
    },
    // 获取当月具体哪一天有课表 红点
    async getTimeTableRed () {
      let params = {
        course_id: this.auditionData.course_id,
        teacher_id: this.auditionData.teacher_id,
        start_time: this.auditionData.start_time / 1000,
        end_time: this.auditionData.end_time / 1000
      };

      let res = await this.$$request.get('/listenCourse/getTimetable', {data: params});
      this.hasTimeTable = res.lists;
    },
    //试听课程列表点击
    listenCourseClick (list) {
      if (this.auditionType === 'student_audition') return 0;

      let index = this.checkListen.indexOf(list.id);

      if (index === -1) {
        if (this.checkListen.length) {
          return this.$message.warning('最多选择一个');
        }
        this.checkListen.push(list.id);
      } else {
        this.checkListen.splice(index, 1);
      }
    },
    // 试听确定点击
    auditionDoneClick (type) {
      if (type === 'yes' && !this.checkListen.length) {
        return this.$message.warning('试听课程不能为空!');
      }

      if (this.auditionType === 'audition') {
        if (type !== 'yes') this.checkListen = [0];
        this.submitAuditionData();
      } else {
        let req = {timetable_id: '', course_name: '', begin_time: '', done_type: 'yes'}; //done_type  是否选择课程

        if (type === 'yes') {
          this.listenCourseLists.forEach(v => {
            if (v.id === this.checkListen[0]) {
              req.timetable_id = v.id;
              req.course_name = v.course.name;
              req.begin_time = this.$$tools.formatTime(v.begin_time);
            }
          });
        } else {
          req.done_type = 'no';
        }

        this.dialogStatus.audition = false;
        this.$emit('CB-audition', req);
      }
    },
    //提交试听
    async submitAuditionData (type) {
      if (type === 'student_audition' && !this.checkListenStudent.length) {
        return this.$message.warning('请选择试听学员');
      }

      if (this.submitLoading) {
        return 0;
      }

      this.submitLoading = true;

      let params = {timetable_id: this.checkListen[0], student_id: [this.studentId]};
      if (type === 'student_audition') {
        params.student_id = this.checkListenStudent;
      }
      console.log(params)

      let result = await this.$$request.post('/listenCourse/add', params);

      this.submitLoading = false;
      console.log(result);
      if (!result) {
        return 0;
      }

      this.$emit('CB-auditionSuccess');
      this.$message.success('添加试听成功');
      this.dialogStatus.audition = false;
      this.dialogStatus.student = false;
    }
  }
};
</script>

<style lang="less" scoped>
  .form-box {
    margin: 20px auto;
    margin-top: 20px;
    .listen-course-box {
      background-color: #f2f2f2;
    }
    .audition-lists {
      height: 380px;
      overflow: hidden;
      overflow-y: auto;
    }
    .input-box {
      width: 350px;
    }
    .listen-nothing {
      height: 100%;
    }
    .audition-lists {
        li {
            padding: 10px 20px;
            &.check-show {
              &::after {
                content: '';
                display: block;
                width: 20px;
                height: 20px;
                background: url(../../images/common/not-check.png) no-repeat;
                background-size: 100%;
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
              }
            }
            &.active {
                &::after {
                    background: url(../../images/common/check-box.png) no-repeat;
                    background-size: 100%;
                }
            }
            &:not(:first-child) {
                border-top: 1px #e3e3e3 solid;
            }
            .add-student {
              right: 10px;
              top: 50%;
              transform: translateY(-50%);
              padding: 3px 5px;
              border: 1px #45DAD5 solid;
              border-radius: 3px;
              color: #45DAD5;
              font-size: 13px;
            }
        }
    }
    .canlender-box {
      width: 352px;
      height: 380px;
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
</style>


