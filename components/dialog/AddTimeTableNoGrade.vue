<template>
  <el-dialog :title="tableType == 'multiple' ? '批量发布预约课' : tableType == 'single' ? '发布预约课'  : '修改预约课'"
      width="900px" center :visible.sync="dialogStatus.timetable" :close-on-click-modal="false" @close="dialogClose">
    <el-form :model="timetableForm" label-width="100px" size="small" ref="addTimeTable" :rules="rules" class="form-box pr-20 pl-20">
      <div class="d-f">
        <div class="flex1">
          <el-form-item label="选择课程：" prop="course_id">
              <el-select placeholder="请选择" v-model="timetableForm.course_id" @change="formCourseChange" :disabled="tableType === 'edit'">
                  <el-option v-for="(item, index) in planCourseLists" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
          </el-form-item>

          <el-form-item v-if="tableType === 'multiple'" key="begin_time" label="开始日期：" prop="begin_time">
              <el-date-picker v-model="timetableForm.begin_time" @change="startTimeChange"
                  :picker-options="pickerEndDateAfter" type="date" :editable="false"
                  placeholder="选择日期" value-format="timestamp">
              </el-date-picker>
          </el-form-item>
          <el-form-item label="上课老师：" prop="teacher_ids">
              <el-select placeholder="请选择" v-model="timetableForm.teacher_ids" :disabled="!timetableForm.course_id || tableType === 'edit'" @change="planTeacherChange">
                  <el-option v-for="(item, index) in planTeacherLists" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
          </el-form-item>
          <el-form-item label="上课教室：">
              <el-select placeholder="请选择" v-model="timetableForm.room_id" :clearable="true">
                  <el-option v-for="(item, index) in $store.state.classRoom" :key="index" :label="item.name" :value="item.id"></el-option>
              </el-select>
          </el-form-item>
          <el-form-item label="人数上限：" prop="limit_num">
              <el-input type="number" v-model.number="timetableForm.limit_num" placeholder="人数上限" :disabled="tableType === 'edit' || courseType === 2"></el-input>
          </el-form-item>
          <el-form-item label="重复规则：" prop="loop" v-if="tableType === 'multiple'" key="loop">
              <el-select placeholder="请选择" v-model="timetableForm.loop">
                  <el-option label="无" value="no"></el-option>
                  <el-option label="按周循环" value="yes"></el-option>
              </el-select>
          </el-form-item>
          <!-- <el-form-item label="发布方式：" prop="loop" v-if="tableType === 'multiple'" key="loop">
              <el-radio-group v-model="radio2">
                <el-radio :label="1">立即发布</el-radio>
                <el-radio :label="2">定时发布</el-radio>
              </el-radio-group>
          </el-form-item> -->
        </div>

        <div class="flex1">
          <el-form-item label="课程属性：">{{courseType === 1 ? '一对多课程' : courseType === 2 ? '一对一课程' : ''}}</el-form-item>
          <el-form-item v-if="tableType === 'multiple'" key="end_time" label="结束日期：" prop="end_time">
              <el-date-picker v-model="timetableForm.end_time" @change="endTimeChange"
                  :picker-options="pickerEndDateAfter" type="date" :editable="false"
                  placeholder="选择日期" value-format="timestamp">
              </el-date-picker>
          </el-form-item>
          <el-form-item label="扣课时数：" prop="lesson_num">
            <el-input type="number" v-model.number="timetableForm.lesson_num" placeholder="扣课时数"></el-input>
          </el-form-item>
          <el-form-item label="课节时长：" prop="lesson_time">
            <el-input type="number" v-model.number="timetableForm.lesson_time" placeholder="课节时长"></el-input><span class="pl-10">分钟</span>
          </el-form-item>
          <el-form-item label="线下预约：">
            <el-select v-model.trim="timetableForm.student_lists" multiple filterable :disabled="!timetableForm.teacher_ids" key="student_lists">
              <el-option v-for="item in allStudentLists" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </el-form-item>
        </div>
      </div>

      <div class="add-date-box d-f flex1">
          <div class="title p-r is-required">上课时间：</div>
          <div class="flex1">
              <div class="scroll-box" id="formAddDate">
                  <el-form :model="addDate" size="small" ref="addDateForm" :rules="timeRules" v-for="(addDate, num) in formAddDate" :key="num">
                      <div class="p-r d-f">
                          <div :class="tableType === 'edit' ? 'date-change' : 'flex1' ">
                              <el-form-item v-if="tableType === 'edit'" key="edit_date">
                                  <el-date-picker v-model="addDate.week" @change="formEditDateChange"
                                      :picker-options="pickerBeginDateAfter" type="date" :editable="false"
                                      placeholder="选择日期" value-format="yyyy/MM/dd">
                                  </el-date-picker>
                              </el-form-item>
                              <el-form-item label-width="0" prop="week" v-else key="add_date">
                                  <el-select placeholder="某天" v-model="addDate.week" @change="formWeekChange">
                                      <el-option v-for="(item, index) in timetableWeekList" :key="index" :disabled="tableType !== 'multiple' && !item.day.past_due" :label="item.name" :value="item.id"></el-option>
                                  </el-select>
                              </el-form-item>
                          </div>

                          <div class="pl-15 flex1">
                              <el-form-item label-width="0" prop="begin_time" class="p-r begin-time-form">
                                  <el-time-select
                                      :editable="false"
                                      v-model="addDate.begin_time"
                                      :picker-options="timePicker"
                                      placeholder="时间">
                                  </el-time-select>
                              </el-form-item>
                          </div>

                          <i v-if="tableType === 'multiple' && formAddDate.length > 1" @click="deleteDateHandle(num)" class="p-a delete-time el-tag__close el-icon-close"></i>
                      </div>
                  </el-form>
                  <div class="d-f mt-10" v-if="tableType === 'multiple'"><MyButton type="border" fontColor="fc-m"  @click.native="addDateHandle">添加时间</MyButton></div>
              </div>
          </div>
      </div>
      <div class="d-f f-j-c mt-30">
          <MyButton @click.native="doneHandle" :loading="submitLoading.timetable">确定</MyButton>
      </div>
    </el-form>

    <!-- 冲突弹窗 -->
    <el-dialog width="1020px" center :visible.sync="dialogStatus.conflict" :close-on-click-modal="false" append-to-body>
        <div class="conflict-box">
            <h3>排课冲突提醒</h3>
            <p class="mb-20">课程：{{timetableForm.course_name}}</p>

            <el-table border :data="conflictLists" height="400" header-row-class-name="row-header">
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
                        <el-select v-if="scope.row.conflict_data.reason == 2" size="small" v-model="scope.row.room_id" :clearable="true">
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
                <MyButton type="gray" @click.native="dialogStatus.conflict = false">返回编辑</MyButton>
                <MyButton type="subm" class="ml-30" @click.native="doneModify" :loading="submitLoading.timetable">确认修改</MyButton>
            </div>
        </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import {timePicker} from '../../script/static';
import MyButton from '../common/MyButton';

export default {
  props: {
    value: {default: false},
    tableType: {default: 'single'},
    day: {},
    calendar: {default: ''},
    weekLists: {default: null},
    editDetail: {},
    tableFull: {} //排课填充数据
  },
  components: {MyButton},
  watch: {
    value (val) {
      if (val) {
        this.$nextTick(() => {
          this.tableType === 'edit' ? this.editTimeTable() : this.planTimeTable();
        });
      }
    },
    tableFull (val) {
      console.log(val);
      this.planCourseLists = val;
    },
    weekLists (val) {
      this.timetableWeekList = val;
    },
    // 课表编辑数据
    editDetail (detail) {
      console.log(detail)
      if (!Object.keys(detail).length) {
        return 0;
      }
      this.courseType = detail.course_type;
      this.formAddDate.splice(0, this.formAddDate.length, {begin_time: detail.time_quantum.begin_time, end_time: '', week: detail.time_quantum.week});
      this.timetableForm.course_id = detail.course_id;
      this.timetableForm.limit_num = detail.limit_num;
      this.timetableForm.course_name = detail.course_name;
      this.timetableForm.timetable_id = detail.id;
      this.timetableForm.lesson_num = detail.lesson_num;
      this.timetableForm.lesson_time = Math.round((detail.end_time - detail.begin_time) / 60);
      this.timetableForm.teacher_ids = detail.teacher.length ? detail.teacher[0].id : ''; //任课老师
      this.timetableForm.room_id = detail.room_id ? detail.room_id : '';
      this.timetableForm.student_lists = detail.student_grades.length ? detail.student_grades.map(v => {return v.id}) : [];
    }
  },
  data () {
    return {
      dialogStatus: {
        timetable: false,
        conflict: false,
        student: false
      },
      conflictType: {
        reason1: '老师冲突 请修改时间',
        reason2: '教室冲突 请修改时间或教室',
        reason3: '学员冲突 请修改时间'
      },
      planCourseLists: [],
      planTeacherLists: [],
      courseType: '',

      timetableWeekList: this.weekLists,

      allStudentLists: [],
      conflictLists: [],
      otherLists: [],
      formAddDate: [],

      timePicker: JSON.parse(JSON.stringify(timePicker)),
      submitLoading: {
        timetable: false,
        conflict: false
      },

      timetableForm: {
        timetable_id: '',
        course_id: '',
        course_name: '',
        lesson_time: '',
        lesson_num: '',
        teacher_ids: '',
        room_id: '',
        loop: '',
        limit_num: '',
        begin_time: '', //开始时间
        end_time: '', //结束时间
        student_lists: [],  //内定学员
      },
      rules: {
        course_id: [
          {required: true, message: '请选择课程', trigger: 'change'}
        ],
        teacher_ids: [
          {required: true, message: '请选择任课老师', trigger: 'change'}
        ],
        lesson_num: [
          {required: true, message: '请输入扣课时数'},
          {validator: this.$$tools.formOtherValidate('lesson_num')},
          {validator: this.$$tools.formOtherValidate('total', 99)}
        ],
        lesson_time: [
          {required: true, message: '请输入课节时长'}
        ],
        limit_num: [
          {required: true, message: '请设置人数上限'},
          {validator: this.$$tools.formOtherValidate('int')}
        ],
        loop: [
          {required: true, message: '请选择重复规则', trigger: 'change'}
        ],
        begin_time: [
          {required: true, message: '请选择开始时间', trigger: 'change'}
        ],
        end_time: [
          {required: true, message: '请选择结束时间', trigger: 'change'}
        ]
      },
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
      disableStartTime: new Date().setHours(0, 0, 0, 0),
      disableEndTime: this.getEndTime(),
      pickerBeginDateAfter: {
        disabledDate: (time) => {
          return time.getTime() < this.disableStartTime;
        }
      },
      pickerEndDateAfter: {
        disabledDate: (time) => {
          return time.getTime() > this.disableEndTime || time.getTime() < this.disableStartTime;
        }
      }
    }
  },
  methods: {
    getEndTime () {
      let date = new Date(), y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
      if (m > 5) {
        y++;
        m = m - 6;
      } else {
        m = m + 6;
      }

      let netTime = new Date(y, m, d).getTime();
      return netTime;
    },
    dialogClose () {
      this.formAddDate.splice(0, this.formAddDate.length);
      this.$refs.addTimeTable.resetFields();

      Object.keys(this.timetableForm).forEach(v => {this.timetableForm[v] = v === 'student_lists' ?  [] : ''});
      this.timePicker.minTime = 0;
      this.$emit('input', false);
      this.$emit('CB-popverClose');
      this.courseType = '';
    },
    // 课表排课 批量、单个
    planTimeTable () {
      if (this.tableType === 'single') {
        let newdate = [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
        let {full_day} = this.day, {day} = this.day, {hours_id} = this.day;

        if (this.isSameWeek(this.calendar * 1000)) {
          this.timePicker.minTime = day == new Date().getDay() ? newdate : 0;
        } else {
          this.timePicker.minTime = 0;
        }
        let newTime = new Date(`${full_day} 00:00`).getTime() < new Date().getTime() && hours_id == new Date().getHours() ?
          [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&') : `${hours_id}:00`;

        this.formAddDate.push({begin_time: newTime, end_time: '', week: day});
      } else {
        this.formAddDate.push({begin_time: '', end_time: '', week: ''});
        this.timetableForm.begin_time = Date.now();
        this.timetableForm.end_time = Date.now();
      }

      this.dialogStatus.timetable = true;
    },
    // 课表编辑
    editTimeTable () {
      this.planCourseLists.forEach(v => {
        if (v.id == this.timetableForm.course_id) {
          this.planTeacherLists = v.teachers;
          v.teachers.forEach(k => {
            if (k.id == this.timetableForm.teacher_ids) {
              this.allStudentLists = k.students;
            }
          });
        }
      });

      this.dialogStatus.timetable = true;
    },
    // 课程选择change
    formCourseChange (val) {
      this.timetableForm.teacher_ids = '';
      this.planTeacherLists = [];

      this.planCourseLists.forEach(v => {
        if (v.id == val) {
          this.courseType = v.type;
          this.timetableForm.lesson_time = v.lesson_time;
          this.timetableForm.course_name = v.name;
          this.planTeacherLists = v.teachers;
        }
      });

      this.timetableForm.limit_num = this.courseType === 1 ? 10 : 1;
    },
    // 老师选择change
    planTeacherChange (val) {
      this.planCourseLists.forEach(v => {
        if (v.id == this.timetableForm.course_id) {
          v.teachers.forEach(k => {
            if (k.id == val) {
              this.allStudentLists = k.students;
            }
          });
        }
      });

      this.allStudentLists.forEach(m => {
        m.disabled = m.scheduled <= 0;
      });

      console.log(this.allStudentLists)
    },
    //编辑课表时，时间控件选择当天，判断时刻disabled
    formEditDateChange (val) {
      if (new Date(val).toDateString() === new Date().toDateString()) {
        this.timePicker.minTime = [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
      } else {
        this.timePicker.minTime = 0;
      }
    },
    //判断当前开课日期是不是本周
    isSameWeek (old) {
      let oneDayTime = 1000 * 60 * 60 * 24;
      let old_count = parseInt(old / oneDayTime);
      let now_other = parseInt(new Date().getTime() / oneDayTime);

      return parseInt((old_count + 4) / 7) == parseInt((now_other + 4) / 7);
    },
    //排课弹窗，选择一周某一天
    formWeekChange (val) {
      if (this.tableType === 'multiple') {
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
    // 排课，开始日期改变
    startTimeChange (val) {
      this.$emit('CB-startTimeChange', val);
      if (this.timetableForm.in_end_time < this.timetableForm.in_start_time) {
        return this.$message.error('开始时间不能小于结束时间');
      }
    },
    // 排课，结束日期改变
    endTimeChange () {
      if (this.timetableForm.in_end_time < this.timetableForm.in_start_time) {
        return this.$message.error('开始时间不能小于结束时间');
      }
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
    //排课表单确定
    doneHandle () {
      let a, b;

      this.$refs.addTimeTable.validate(valid => {
        a = valid;
      });
      for (let i = 0, len = this.$refs.addDateForm.length; i < len; i++) {
        this.$refs.addDateForm[i].validate(valid => {
          b = valid ? true : false;
        });
      }
      if (a && b) {
        this.addTimeTableParams();
      }
    },
    //批量、单个排课参数整理
    addTimeTableParams () {
      console.log(this.timetableForm);

      let params = {
        course_id: this.timetableForm.course_id,
        lesson_num: this.timetableForm.lesson_num,
        teacher_ids: this.timetableForm.teacher_ids,
        room_id: this.timetableForm.room_id,
        limit_num: this.timetableForm.limit_num,
        student_lists: this.timetableForm.student_lists.map(v => {return {student_id: v}})
      };


      //单个提交
      if (this.tableType === 'single') {
        params.commit_type = 'single';
        this.timetableWeekList.forEach(v => {
          if (v.id == this.formAddDate[0].week) {
            params.begin_time = new Date(`${v.day.newFullDay} ${this.formAddDate[0].begin_time}`).getTime() / 1000;
            params.end_time = params.begin_time + this.timetableForm.lesson_time * 60;
          }
        });
      } else if (this.tableType === 'edit') {
        params.commit_type = 'single';
        params.begin_time = new Date(`${this.formAddDate[0].week} ${this.formAddDate[0].begin_time}`).getTime() / 1000;
        params.end_time = params.begin_time + this.timetableForm.lesson_time * 60;
        params.edit_id = this.timetableForm.timetable_id;
      } else {
        //批量提交
        params.begin_time = this.timetableForm.begin_time / 1000;
        params.end_time = this.timetableForm.end_time / 1000;
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
              } else if (new Date(this.timetableForm.begin_time).getDay() == 0) { //周日
                begin_time = d.week != 0 ? later_begin_time : default_begin_time;
                end_time = d.week != 0 ? later_end_time : default_end_time;
              } else if (d.week == 0) {
                begin_time = default_begin_time;
                end_time = default_end_time;
              } else {
                begin_time = d.week < new Date(this.timetableForm.begin_time).getDay() ? later_begin_time : default_begin_time;
                end_time = d.week < new Date(this.timetableForm.begin_time).getDay() ? later_end_time : default_end_time;
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
          if (key != 'begin_hours' && key != 'conflict_data') {
            if (key == 'begin_time') {
              item[key] = new Date(`${this.$$tools.format(v[key] / 1000).replace(/\-/g, '/')} ${v.begin_hours}`).getTime() / 1000;
            } else if (key == 'end_time') {
              item[key] = item.begin_time + this.timetableForm.lesson_time * 60;
            } else {
              item[key] = v[key];
            }
          }
        }

        return item;
      });

      console.log(lists);

      lists = lists.concat(this.otherLists);

      let params = {lists: lists};
      if (this.tableType == 'edit') {
        params.id = this.timetableForm.timetable_id;
      }
      this.getConflictLists(params);
    },
    //检测是否有冲突，获取冲突数据列表
    async getConflictLists (params) {
      console.log(params);

      if (this.submitLoading.timetable) {
        return 0;
      }
      this.submitLoading.timetable = true;

      let result = await this.$$request.post(`/timetable/${this.tableType === 'edit' ? 'notModelCourseEdit' : 'notModelCourse'}`, params);

      console.log(result);
      this.submitLoading.timetable = false;
      if (!result) {
        return 0;
      }

      if (result.status === 0) {
        return this.$message.warning('操作失败，请稍后再试!');
      }

      if (result.status === 1) {
        this.$message.success(`${this.tableType === 'edit' ? '修改' : '添加'}排课成功`);
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
      }
    }
  }
};
</script>

<style lang="less" scoped>
  .form-box {
      .add-date {
          position: absolute;
          right: -35px;
          top: 5px;
      }
      /deep/ .el-input, /deep/ .el-cascader {
          width: 240px;
      }
      /deep/.el-radio {
          .el-radio__input {
              input {
                  border: none;
                  outline: none;
                  &:active {
                      border: none;
                      outline: none;
                  }
                  &:focus {
                      border: none;
                      outline: none;
                  }
              }
          }
      }
      .add-date-box {
          /deep/ .el-form {
            width: 240px;
          }
          .title {
              text-align: right;
              width: 88px;
              padding-right: 12px;
              padding-top: 4px;
              &.is-required {
                  &:before {
                      content: '*';
                      color: #f56c6c;
                      margin-right: 4px;
                  }
              }
          }
          .scroll-box {
            max-height: 220px;
            overflow: hidden;
            overflow-y: auto;
          }
          .delete-time {
              top: 10px;
              right: -20px;
              cursor: pointer;
          }
          /deep/ .el-input {
              width: 100%;
          }
          .date-change {
              width: 130px;
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


