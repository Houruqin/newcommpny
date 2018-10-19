<template>
  <el-dialog title="试听" width="720px" center :visible.sync="dialogStatus" :close-on-click-modal="false" @close="dialogClose">
      <div class="form-box">
          <div class="input-box">
            <div class="d-f f-j-b">
              <el-select v-model="auditionData.teacher_id" placeholder="请选择" size="small" @change="getListenCourseLists">
                  <el-option label="全部老师" value=""></el-option>
                  <el-option v-for="(item, index) in teacherLists" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>

              <el-select v-model="auditionData.course_id" placeholder="请选择" size="small" @change="getListenCourseLists">
                  <el-option label="全部课程" value=""></el-option>
                  <el-option v-for="(item, index) in courseLists" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </div>
            <el-date-picker size="small" class="mt-10"
                v-model="auditionData.time" type="date"
                value-format="timestamp" :clearable="false"
                :editable="false" placeholder="选择日期"
                @change="getListenLists"
                :picker-options="pickListenDisable">
            </el-date-picker>
          </div>

          <div class="mt-30" v-loading="loading">
            <div v-if="listenCourseLists.length" class="listen-course-box">
                <ul class="bgc-m audition-lists">
                    <li class="fc-7 cursor-pointer p-r" :class="{active: checkListen[0] === list.id}" v-for="(list, index) in listenCourseLists" :key="index" @click="listenCourseClick(list)">
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
                    </li>
                </ul>
            </div>
            <div v-else class="bgc-m mt-30 d-f f-j-c f-a-c listen-nothing"><span class="fc-5">暂无数据</span></div>
          </div>

          <div class="d-f f-j-c mt-50"><MyButton @click.native="auditionDoneClick" :loading="submitLoading">确定</MyButton></div>
      </div>
  </el-dialog>
</template>

<script>
import MyButton from '../../components/common/MyButton';

export default {
  props: {
    value: {default: false},
    studentId: {default: ''},
    auditionType: {default: 'audition'}
  },
  components: {MyButton},
  watch: {
    value (newVal) {
      if (newVal) {
        this.getListenLists();
      }
      this.dialogStatus = newVal;
    }
  },
  data () {
    return {
      submitLoading: false,
      loading: false,
      dialogStatus: this.value,
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
      auditionData: {time: new Date().getTime(), teacher_id: '', course_id: ''}, //试听数据
      pickListenDisable: {
        disabledDate: (time) => {
          return time.getTime() < new Date().setHours(0, 0, 0, 0);
        }
      }
    };
  },
  methods: {
    dialogClose () {
      this.dialogStatus = false;
      this.listenCourseInit();
      this.$emit('input', this.dialogStatus);
    },
    listenCourseInit () {
      this.checkListen = [];
      this.teacherLists = [];
      this.courseLists = [];
      this.listenCourseLists = [];
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
      this.loading = true;
      let select_time = this.auditionData.time / 1000;
      let current_time = new Date().getTime() / 1000;
      let old_time = select_time < current_time ? current_time : select_time;

      let params = {
        time: old_time,
        teacher_id: this.auditionData.teacher_id,
        course_id: this.auditionData.course_id
      };

      let result = await this.$$request.post('/listenCourse/lists', {data: params});

      if (!result) {
        return 0;
      }
      this.listenCourseLists = result.lists;
      this.loading = false;
    },
    //试听课程列表点击
    listenCourseClick (list) {
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
    auditionDoneClick () {
      console.log(this.auditionType);
      if (!this.checkListen.length) {
        return this.$message.warning('试听课程不能为空!');
      }

      if (this.auditionType === 'audition') {
        this.submitAuditionData();
      } else {
        let req = {};

        this.listenCourseLists.forEach(v => {
          if (v.id === this.checkListen[0]) {
            req.timetable_id = v.id;
            req.course_name = v.course.name;
            req.begin_time = this.$$tools.formatTime(v.begin_time);
          }
        });

        this.dialogStatus = false;
        this.$emit('CB-audition', req);
      }
    },
    //提交试听
    async submitAuditionData () {
      if (this.submitLoading) {
        return 0;
      }

      this.submitLoading = true;
      let params = {
        way_id: 5,
        status: 4,
        type_id: 5, //type_id默认售前跟进5
        student_id: this.studentId,
        invited_at: 0,
        next_at: 0,
        content: '无跟进内容记录',
        timetable_id: this.checkListen[0]
      };

      console.log(params);

      let result = await this.$$request.post('/followUp/add', params);

      this.submitLoading = false;
      console.log(result);
      if (!result) {
        return 0;
      }
      this.$message.success('添加成功');
      this.dialogStatus = false;
    }
  }
};
</script>

<style lang="less" scoped>
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
    .listen-nothing {
        height: 120px;
    }
    .audition-lists {
        li {
            padding: 20px;
            &:not(:first-child) {
                border-top: 1px #e3e3e3 solid;
            }
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
            &.active {
                &::after {
                    background: url(../../images/common/check-box.png) no-repeat;
                    background-size: 100%;
                }
            }
        }
    }
  }
</style>


