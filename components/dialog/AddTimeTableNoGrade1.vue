<template>
  <el-dialog :title="addTableType === 'edit' ? '编辑预约课' : addTableType === 'single' ? '添加预约课' : '预约课设置'" width="840px" center :visible.sync="dialogStatus.timetable" :close-on-click-modal="false" @close="dialogClose">
    <el-form :model="timetableForm" label-width="120px" size="small" ref="timetable" :rules="rules" class="form-box">
      <div class="d-f">
        <div class="flex1">
          <el-form-item label="预约课程：" prop="course_id" v-if="parentData" key="course_plan">
              <span>{{timetableForm.course_name}}</span>
          </el-form-item>
          <el-form-item label="选择课程：" prop="course_id" v-else key="timetable_plan">
              <el-select placeholder="请选择" v-model="timetableForm.course_id" @change="formCourseChange" :disabled="addTableType === 'edit' && studentGradesLists.filter(v => {return v.order_type === 2}).length > 0">
                  <el-option v-for="(item, index) in planCourseLists" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
          </el-form-item>

          <el-form-item v-if="addTableType === 'multiple'" key="begin_time" label="开始日期：" prop="in_start_time">
              <el-date-picker v-model="timetableForm.in_start_time" @change="startTimeChange"
                  :picker-options="pickerBeginDateAfter" type="date" :editable="false"
                  placeholder="选择日期" value-format="timestamp">
              </el-date-picker>
          </el-form-item>
          <el-form-item label="上课老师：" prop="teacher_ids">
              <el-select placeholder="请选择" v-model="timetableForm.teacher_ids">
                  <el-option v-for="(item, index) in planTeacherLists" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
          </el-form-item>
          <el-form-item label="上课教室：" prop="room_id">
              <el-select placeholder="请选择"  v-model="timetableForm.room_id">
                  <el-option v-for="(item, index) in $store.state.classRoom" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
          </el-form-item>
          <el-form-item label="重复规则：" prop="loop" v-if="addTableType === 'multiple'" key="loop">
              <el-select placeholder="请选择" v-model="timetableForm.loop">
                  <el-option label="无" value="no"></el-option>
                  <el-option label="按周循环" value="yes"></el-option>
              </el-select>
          </el-form-item>
        </div>

        <div class="flex1">
          <el-form-item label="课节时长："><span v-if="timetableForm.lesson_time">{{timetableForm.lesson_time}}分钟</span></el-form-item>
          <el-form-item v-if="addTableType === 'multiple'" key="end_time" label="结束日期：" prop="in_end_time">
              <el-date-picker v-model="timetableForm.in_end_time" @change="endTimeChange"
                  :picker-options="pickerBeginDateAfter" type="date" :editable="false"
                  placeholder="选择日期" value-format="timestamp">
              </el-date-picker>
          </el-form-item>
          <el-form-item label="辅助老师：" prop="counselor_ids">
              <el-select placeholder="请选择" v-model="timetableForm.counselor_ids" clearable >
                  <el-option v-for="(item, index) in $store.state.teacherList" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
          </el-form-item>
          <el-form-item label="人数上限：" prop="limit_num">
              <el-input type="number" v-model.trim="timetableForm.limit_num" placeholder="人数上限" :disabled="addTableType === 'edit'"></el-input>
          </el-form-item>
          <el-form-item label="线下预约：" v-if="addTableType === 'multiple'" key="multiple_student">
              <el-select v-model.trim="timetableForm.student_lists" multiple filterable remote reserve-keyword loading-text="搜索中..."
                placeholder="请输入关键词" :remote-method="remoteMethod" :loading="searchLoading">
                <el-option
                  v-for="item in studentInfo.allLists"
                  :key="item.studentId"
                  :label="item.studentName"
                  :value="item.studentId">
                </el-option>
              </el-select>
          </el-form-item>
        </div>
      </div>
      <div class="add-date-box d-f">
        <div class="flex1 d-f">
          <div class="title p-r is-required pt-4"><span class="pr-12">上课时间：</span></div>
          <div class="flex1" id="formAddDate">
            <div class="scroll-box">
              <el-form :model="addDate" size="small" ref="addDateForm" :rules="timeRules" v-for="(addDate, num) in formAddDate" :key="num">
                <el-row class="p-r flex1">
                    <el-col :span="addTableType == 'edit' ? 14 : 9">
                        <el-form-item v-if="addTableType === 'edit'">
                            <el-date-picker v-model="addDate.week" @change="formEditDateChange"
                                :picker-options="pickerBeginDateAfter" type="date" :editable="false"
                                placeholder="选择日期" value-format="yyyy/MM/dd">
                            </el-date-picker>
                        </el-form-item>
                        <el-form-item label-width="0" prop="week" v-else>
                            <el-select placeholder="某天" v-model="addDate.week" @change="formWeekChange">
                                <el-option v-for="(item, index) in timetableWeekList" :key="index" :disabled="(addTableType == 'single' || addTableType == 'edit') && !item.day.past_due" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :span="addTableType == 'edit' ? 9 : 14" class="p-r" :offset="1">
                        <el-form-item  label-width="0" prop="begin_time" class="p-r">
                            <el-time-select
                                :editable="false"
                                v-model="addDate.begin_time"
                                :picker-options="timePicker"
                                placeholder="时间">
                            </el-time-select>
                        </el-form-item>
                    </el-col>

                    <i v-if="addTableType == 'multiple' && formAddDate.length > 1" @click="deleteDateHandle(num)" class="p-a delete-time el-tag__close el-icon-close"></i>
                </el-row>
              </el-form>
              <div class="d-f" v-if="addTableType === 'multiple'"><MyButton type="border" fontColor="fc-m"  @click.native="addDateHandle">添加时间</MyButton></div>
            </div>
          </div>
        </div>
        <el-form-item label="线下预约：" v-if="addTableType === 'single' || addTableType === 'edit'" key="single_student">
            <el-select v-model.trim="timetableForm.student_lists" multiple filterable remote reserve-keyword loading-text="搜索中..."
              placeholder="请输入关键词" :remote-method="remoteMethod" :loading="searchLoading">
              <el-option
                v-for="item in studentInfo.allLists"
                :key="item.studentId"
                :label="item.studentName"
                :value="item.studentId">
              </el-option>
            </el-select>
        </el-form-item>
      </div>

      <div class="d-f f-j-c mt-30">
          <MyButton @click.native="doneHandle" :loading="submitLoading">确定</MyButton>
      </div>
    </el-form>

    <!-- 学员无课时，错误提醒 -->
    <el-dialog width="500px" center title="错误提示" :visible.sync="dialogStatus.student" :close-on-click-modal="false" append-to-body>
      <p class="fs-13 pl-60 pr-60 t-a-c student-error-list">
        <span v-for="(item, index) in studentErrorLists" :key="index" class="fc-9" :class="{'pl-10': index}">{{item.name}}</span>
      </p>
      <p class="mt-10 t-a-c">以上学员剩余{{timetableForm.charge_mode ? '收费' : '免费'}}课时不足，无法排课</p>
      <div class="d-f f-j-c mt-30">
        <MyButton @click.native="dialogStatus.student = false">返回编辑</MyButton>
      </div>
    </el-dialog>

    <!-- 冲突弹窗 -->
    <el-dialog width="900px" center :visible.sync="dialogStatus.conflict" :close-on-click-modal="false" append-to-body>
        <div class="conflict-box">
            <h3>排课冲突提醒</h3>
            <p class="mb-20">课程：{{timetableForm.course_name}}</p>

            <el-table class="student-table" border :data="conflictLists" height="400" header-row-class-name="row-header">
                <el-table-column label="序号" prop="index" type="index" width="50" class-name="number"></el-table-column>
                <el-table-column label="上课日期">
                    <template slot-scope="scope">
                        <el-date-picker size="small" type="date" :editable="false" :clearable="false" value-format="timestamp" :picker-options="pickerBeginDateAfter" v-model="scope.row.begin_time"></el-date-picker>
                    </template>
                </el-table-column>
                <el-table-column label="开始时间">
                    <template slot-scope="scope">
                        <el-time-select size="small" :picker-options="timePicker" :editable="false" :clearable="false" v-model="scope.row.begin_hours"></el-time-select>
                    </template>
                </el-table-column>
                <el-table-column label="冲突教室">
                    <template slot-scope="scope">
                        <el-select v-if="scope.row.conflict_data.reason == 2" size="small" v-model="scope.row.room_id" key="conflict_room">
                            <el-option v-for="(item, index) in $store.state.classRoom" :key="index" :label="item.name" :value="item.id" ></el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column label="解决建议">
                    <template slot-scope="scope">{{conflictType[`reason${scope.row.conflict_data.reason}`]}}</template>
                </el-table-column>
            </el-table>

            <div class="d-f f-j-c mt-30">
                <MyButton type="gray" @click.native="dialogStatus.conflict = false">返回编辑</MyButton>
                <MyButton type="subm" class="ml-30" @click.native="doneModify" :loading="submitLoading">确认修改</MyButton>
            </div>
        </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import {timePicker} from '../../script/static';
import MyButton from '../common/MyButton';

export default {
  components: {MyButton},
  props: {
    value: {default: false},
    tableType: {default: 'single'},
    day: {},
    calendar: {default: ''},
    weekLists: {default: []},
    editDetail: {},
    parentData: {}
  },
  watch: {
    value (val) {
      if (val) {
        if (!this.parentData) {
          this.getAddTimeTableFull(); //课表排课，请求课程列表
        } else {
          this.courseTimetable(); //课程快捷排课，且为批量排课
        }
      } else {
        this.dialogStatus.timetable = false;
      }
    },
    tableType (val) {
      this.addTableType = val;
    },
    editDetail (val) {
      if (Object.keys(val).length) {
        this.formAddDate.splice(0, this.formAddDate.length, {begin_time: val.time_quantum.begin_time, end_time: '', week: val.time_quantum.week});

        val.student_grades.forEach(v => {
          if (v.order_type === 1) {
            this.timetableForm.student_lists.push(v.student_id);
          }
        });

        this.studentGradesLists = val.student_grades;
        this.timetableForm.timetable_id = val.id;
        this.timetableForm.course_id = val.course_id;
        this.timetableForm.lesson_time = val.lesson_time;
        this.timetableForm.room_id = val.room_id;
        this.timetableForm.grade_id = val.grade_id;
        this.timetableForm.teacher_ids = val.teacher.length ? val.teacher[0].id : '';
        this.timetableForm.counselor_ids = val.counselor.length ? val.counselor[0].id : '';
        this.timetableForm.limit_num = val.limit_num;
      }
    },
    weekLists (val) {
      this.timetableWeekList = val;
    }
  },
  data () {
    return {
      conflictType: {
        reason1: '老师冲突 请修改时间',
        reason2: '教室冲突 请修改时间或教室',
        reason3: '学员冲突 请修改时间'
      },
      addTableType: '', //编辑，新增
      multipleStatus: '', //是否批量排课  single multiple edit
      dialogStatus: {
        timetable: this.value,
        conflict: false,
        student: false
      },

      submitLoading: false,
      searchLoading: false,
      studentErrorLists: [],
      studentGradesLists: [],
      studentInfo: {
        keyword: '', //搜索关键字
        allLists: [], //搜索结果列表
        checkedLists: [] //选中的列表
      },

      planCourseLists: {},
      timePicker: timePicker,
      otherLists: [], //正常列表
      conflictLists: [], //冲突列表

      planTeacherLists: [],
      timetableWeekList: this.weekLists,

      timetableForm: {
        charge_mode: '', //课程类型  免费/收费

        timetable_id: '',
        course_id: '',
        grade_id: '',

        course_name: '',
        student_lists: [],

        in_start_time: '', //批量排课 开始时间
        in_end_time: '', //批量排课 结束时间
        lesson_time: '',

        teacher_ids: '',
        counselor_ids: '',
        room_id: '',
        limit_num: '',
        loop: ''
      },
      formAddDate: [],
      rules: {
        course_id: [
          {required: true, message: '请选择课程', trigger: 'change'}
        ],
        room_id: [
          {required: true, message: '请选择教室', trigger: 'change'}
        ],
        teacher_ids: [
          {required: true, message: '请选择任课老师', trigger: 'change'}
        ],
        limit_num: [
          {required: true, message: '请设置人数上限'},
          {validator: this.$$tools.formOtherValidate('int')},
          {validator: this.$$tools.formOtherValidate('min', 1)}
        ],
        loop: [
          {required: true, message: '请选择重复规则', trigger: 'change'}
        ],
        in_start_time: [
          {required: true, message: '请选择开始时间', trigger: 'change'}
        ],
        in_end_time: [
          {required: true, message: '请选择结束时间', trigger: 'change'}
        ]
      },
      timeRules: {
        begin_time: [
          {required: true, message: '请选择开始时间', trigger: 'change'}
        ],
        end_time: [
          {required: true, message: '请选择结束时间', trigger: 'change'}
        ],
        week: [
          {required: true, message: '请选择某天', trigger: 'change'}
        ]
      },
      disableStartTime: new Date().setHours(0, 0, 0, 0),
      pickerBeginDateAfter: {
        disabledDate: (time) => {
          return time.getTime() < this.disableStartTime;
        }
      }
    };
  },
  methods: {
    dialogClose () {
      this.$refs.timetable.resetFields();
      Object.keys(this.timetableForm).forEach(v => {
        this.timetableForm[v] = v === 'student_lists' ? [] : '';
      });
      this.timePicker.minTime = 0;
      this.studentGradesLists = [];
      this.planTeacherLists = [];
      this.formAddDate.splice(0, this.formAddDate.length);
      this.$emit('input', false);
      this.$emit('CB-popverClose');
    },
    //获取新增排课填充数据
    async getAddTimeTableFull () {
      let result = await this.$$request.get('/timetable/notModelFill');

      console.log(result);
      if (!result) {
        return 0;
      }
      this.remoteMethod();
      this.planCourseLists = result.course;
      if (!this.planCourseLists.length) {
        return this.$message.warning('没有可排课的课程，请新增课程!');
      }
      if (this.addTableType === 'single') {
        let {full_day} = this.day, {day} = this.day, {hours_id} = this.day;
        let newdate = [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&');

        if (this.isSameWeek(this.calendar * 1000)) {
          this.timePicker.minTime = day == new Date().getDay() ? newdate : 0;
        } else {
          this.timePicker.minTime = 0;
        }

        let newTime = new Date(`${full_day} 00:00`).getTime() < new Date().getTime() && hours_id == new Date().getHours() ?
          [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&') : `${hours_id}:00`;

        this.formAddDate.push({begin_time: newTime, end_time: '', week: day});
      } else if (this.addTableType === 'multiple') {
        this.formAddDate.push({begin_time: '', end_time: '', week: ''});
        this.timetableForm.in_start_time = new Date().getTime();
        this.timetableForm.in_end_time = new Date().getTime();
      } else if (this.addTableType === 'edit' && this.timetableForm.course_id) {
        this.planCourseLists.forEach(v => {
          if (v.id === this.timetableForm.course_id) {
            this.planTeacherLists = v.teachers;
          }
        });
      }

      this.dialogStatus.timetable = true;
    },
    // 课程快捷排课
    courseTimetable () {
      let val = this.parentData;

      this.formAddDate.push({begin_time: '', end_time: '', week: ''});
      this.timetableForm.in_start_time = new Date().getTime();
      this.timetableForm.in_end_time = new Date().getTime();
      this.timetableForm.course_id = val.id;
      this.timetableForm.course_name = val.name;
      this.timetableForm.lesson_time = val.lesson_time;
      this.timetableForm.room_id = val.grades[0].room_id;
      this.timetableForm.grade_id = val.grades[0].id;
      this.planTeacherLists = val.teacherList;

      this.dialogStatus.timetable = true;
      this.remoteMethod();
    },
    startTimeChange (val) {
      this.$emit('CB-startTimeChange', val);
      if (this.timetableForm.in_end_time < this.timetableForm.in_start_time) {
        return this.$message.error('开始时间不能小于结束时间');
      }
    },
    endTimeChange () {
      if (this.timetableForm.in_end_time < this.timetableForm.in_start_time) {
        return this.$message.error('开始时间不能小于结束时间');
      }
    },
    //判断当前开课日期是不是本周
    isSameWeek (old) {
      let oneDayTime = 1000 * 60 * 60 * 24;
      let old_count = parseInt(old / oneDayTime);
      let now_other = parseInt(new Date().getTime() / oneDayTime);

      return parseInt((old_count + 4) / 7) == parseInt((now_other + 4) / 7);
    },
    //批量排课，新增多个时间段
    addDateHandle () {
      this.formAddDate.push({begin_time: '', end_time: '', week: ''});
      setTimeout(() => {
        document.querySelector('#formAddDate').scrollTo(0, document.querySelector('#formAddDate').scrollHeight);
      }, 10);
    },
    //删除时间段
    deleteDateHandle (index) {
      this.formAddDate.splice(index, 1);
    },
    //课程 change
    formCourseChange (val) {
      this.timetableForm.teacher_ids = '';
      this.planCourseLists.forEach(v => {
        if (v.id === val) {
          this.timetableForm.lesson_time = v.lesson_time;
          this.planTeacherLists = v.teachers;
          this.timetableForm.room_id = v.room_id;
          this.timetableForm.grade_id = v.grade_id;
          this.timetableForm.course_name = v.name;
          this.timetableForm.charge_mode = v.charge_mode;
        }
      });
    },
    //编辑课表时，时间控件选择当天，判断时刻disabled
    formEditDateChange (val) {
      if (new Date(val).toDateString() === new Date().toDateString()) {
        this.timePicker.minTime = [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
      } else {
        this.timePicker.minTime = 0;
      }
    },
    //排课弹窗，选择一周某一天
    formWeekChange (val) {
      if (this.addTableType === 'multiple') {
        this.timePicker.minTime = 0;
      } else {
        this.formAddDate.forEach(d => {
          if (d.week == val) {
            d.begin_time = '';
          }
        });
        if (val == new Date().getDay()) {
          this.timePicker.minTime = [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
        } else {
          this.timePicker.minTime = 0;
        }
      }
    },
    // 人数上限
    // getLimitNum () {
    //   if (this.addTableType === 'edit') {
    //     return Number(this.timetableForm.limit_num) - this.studentGradesLists.filter(v => {return v.order_type === 2}).length;
    //   }

    //   return Number(this.timetableForm.limit_num);
    // },
    // 搜索学员方法
    remoteMethod (keyword) {
      let params = {};

      if (keyword) {
        if (isNaN(keyword)) {
          params.name = keyword;
          params.mobile = '';
        } else {
          params.name = '';
          params.mobile = keyword;
        }
      } else {
        params.name = '';
        params.mobile = '';
      }
      this.searchHandle(params);
    },
    async searchHandle (params) {
      this.searchLoading = true;
      if (this.addTableType === 'edit') {
        params.timetableId = this.timetableForm.timetable_id;
        params.filterType = 1;
      }
      let res = await this.$$request.get('/sign/studentSearch', params);

      // console.log(res);
      if (!res) {
        return 0;
      }
      this.studentInfo.allLists = res;
      this.searchLoading = false;
    },
    doneHandle () {
      let a;

      this.$refs.timetable.validate(valid => {
        a = valid;
      });
      let b = this.$refs.addDateForm.every(v => {
        let state;

        v.validate(valid => {
          state = valid;
        });

        return state;
      });

      if (a && b) {
        this.addTimeTableParams();
      }
    },
    //批量、单个排课参数整理
    addTimeTableParams () {
      // if (this.timetableForm.student_lists.length > this.timetableForm.limit_num) {
      //   return this.$message.error('选择的线下预约学员数量超过上限，请重新选择');
      // }
      let params = {
        course_id: this.timetableForm.course_id,
        grade_id: this.timetableForm.grade_id,
        lesson_num: 1,
        teacher_ids: `,${this.timetableForm.teacher_ids},`,
        room_id: this.timetableForm.room_id,
        counselor_ids: `,${this.timetableForm.counselor_ids},`,
        limit_num: this.timetableForm.limit_num,
        student_lists: this.timetableForm.student_lists.map(v => {return {student_id: v}})
      };
      //单个提交

      if (this.addTableType === 'single') {
        params.commit_type = 'single';
        this.timetableWeekList.forEach(v => {
          if (v.id == this.formAddDate[0].week) {
            params.begin_time = new Date(`${v.day.newFullDay} ${this.formAddDate[0].begin_time}`).getTime() / 1000;
            params.end_time = params.begin_time + this.timetableForm.lesson_time * 60;
          }
        });
      } else if (this.addTableType === 'edit') {
        params.commit_type = 'single';
        params.begin_time = new Date(`${this.formAddDate[0].week} ${this.formAddDate[0].begin_time}`).getTime() / 1000;
        params.end_time = params.begin_time + this.timetableForm.lesson_time * 60;
        params.edit_id = this.timetableForm.timetable_id;
      } else {
        //批量提交
        params.in_start_time = this.timetableForm.in_start_time / 1000;
        params.in_end_time = this.timetableForm.in_end_time / 1000;
        params.commit_type = 'multiple';
        params.loop = this.timetableForm.loop;

        let time_lists = this.formAddDate.map(d => {
          let begin_time, end_time;

          this.timetableWeekList.forEach(v => {
            let default_begin_time = new Date(`${v.day.newFullDay} ${d.begin_time}`).getTime() / 1000;
            let default_end_time = default_begin_time + this.timetableForm.lesson_time * 60;
            let later_begin_time = default_begin_time + 604800;
            let later_end_time = default_end_time + 604800;

            if (d.week == v.id) {
              if (new Date().getTime() / 1000 > default_begin_time) {
                begin_time = later_begin_time;
                end_time = later_end_time;
              } else if (new Date(this.timetableForm.in_start_time).getDay() == 0) { //周日
                begin_time = d.week != 0 ? later_begin_time : default_begin_time;
                end_time = d.week != 0 ? later_end_time : default_end_time;
              } else if (d.week == 0) {
                begin_time = default_begin_time;
                end_time = default_end_time;
              } else {
                begin_time = d.week < new Date(this.timetableForm.in_start_time).getDay() ? later_begin_time : default_begin_time;
                end_time = d.week < new Date(this.timetableForm.in_start_time).getDay() ? later_end_time : default_end_time;
              }
            }
          });

          return {begin_time: begin_time, end_time: end_time};
        });

        params.time_lists = time_lists;
      }
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
            } else {
              item[key] = v[key];
            }
          }
        }

        return item;
      });

      lists = lists.concat(this.otherLists);
      let params = {lists: lists, commit_type: 'conflict'};

      if (this.addTableType === 'edit') {
        params.id = this.timetableForm.timetable_id;
      }
      this.getConflictLists(params);
    },
    //提交排课信息  冲突
    async getConflictLists (params) {
      console.log(params);

      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;
      let result = await this.$$request.post('/timetable/conflictLists', params);

      console.log(result);
      this.submitLoading = false;
      if (!result) {
        return 0;
      }

      if (result.status === 0) {
        return this.$message.warning('操作失败，请稍后再试!');
      }

      if (result.status === 1) {
        this.$message.success(`${this.addTableType === 'edit' ? '修改' : '添加'}排课成功`);
        this.$emit('CB-timetableSuccess'); //排课成功
        this.dialogStatus.timetable = false;
        this.dialogStatus.conflict = false;
      } else if (result.status === -1) {
        result.conflict_lists.forEach(v => {
          v.begin_time = v.begin_time * 1000;
          let nowtime = new Date(v.begin_time);

          v.begin_hours = [nowtime.getHours(), nowtime.getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
        });

        this.conflictLists = result.conflict_lists; //冲突列表
        this.otherLists = result.lists; //正常列表
        this.dialogStatus.conflict = true;
      } else {
        this.studentErrorLists = result.lists;
        this.dialogStatus.student = true;
      }
    }
  }
};
</script>

<style lang="less" scoped>
  .form-box {
    padding: 0 20px;
    /deep/ .el-input {
      width: 255px;
    }
  }
  .add-date-box {
    #formAddDate {
      max-height: 220px;
      overflow: hidden;
      overflow-y: auto;
    }
    .scroll-box {
      width: 255px;
      /deep/ .el-input {
          width: 100%;
      }
    }
    .title {
        text-align: right;
        width: 120px;
        &.is-required {
            &:before {
                content: '*';
                color: #f56c6c;
                margin-right: 4px;
            }
        }
    }
    .delete-time {
        top: 10px;
        right: -20px;
        cursor: pointer;
    }
    .date-change {
        width: 130px;
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
  .search-bar {
    /deep/ .el-input {
      width: 200px;
    }
  }
  .student-btn {
    .btn {
        width: 50px;
        text-align: center;
        border-radius: 3px;
        box-sizing: border-box;
        cursor: pointer;
        &.done {
            border: 1px #01bac1 solid;
            color: #01bac1;
        }
        &.cancel {
            border: 1px #e3e3e3 solid;
            color: #999;
        }
    }
  }
  .student-error-list {
    line-height: 24px;
  }
</style>


