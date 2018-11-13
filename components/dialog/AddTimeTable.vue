<template>
  <el-dialog :title="addTableType == 'multiple' ? '批量排课' : addTableType == 'single' ? '添加排课'  : '修改排课'"
      width="900px" center :visible.sync="dialogStatus.timetable" :close-on-click-modal="false" @close="dialogClose('addTimeTable')">
      <el-form label-width="100px" :model="timetableForm" size="small" ref="addTimeTable" :rules="timetableRules">
          <div class="form-box pr-20 pl-20" v-if="Object.keys(timetableFull).length">
              <div class="d-f">
                  <div class="flex1">
                      <el-form-item label="选择班级：" prop="grade_info" v-if="parentPage === 'timetable'" key="grade_info">
                          <el-cascader :options="timetableFull.course" v-model="timetableForm.grade_info" @change="formGradeChange" expand-trigger="hover"></el-cascader>
                      </el-form-item>
                      <el-form-item label="排课班级：" v-else key="grade_info_name">{{timetableForm.class_name}}</el-form-item>

                      <el-form-item label="开课日期：" prop="start_time" v-if="addTableType === 'multiple'" key="start_time">
                          <el-date-picker v-model="timetableForm.start_time" @change="startTimeChange" type="date" :editable="false" :picker-options="pickerBeginDateAfter" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                      </el-form-item>

                      <el-form-item label="上课老师：" prop="teacher_ids">
                          <el-select placeholder="请选择" v-model="timetableForm.teacher_ids" @change="$refs.addTimeTable.validateField('counselor_ids')">
                              <el-option v-for="(item, index) in timetableFull.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                          </el-select>
                      </el-form-item>

                      <el-form-item label="上课教室：">
                          <el-select placeholder="请选择" v-model="timetableForm.room_id" :multiple="addTableType === 'multiple'" :key="addTableType + '_room'" :clearable="true">
                              <el-option v-for="(item, index) in timetableFull.class_room" :key="index" :label="item.name" :value="item.id"></el-option>
                          </el-select>
                      </el-form-item>

                      <el-form-item label="重复规则：" prop="loop" v-if="addTableType === 'multiple' && courseType !== 1" key="loop2">
                          <el-select placeholder="请选择" v-model="timetableForm.loop" @change="timetableForm.loop_time = 1">
                              <el-option label="无" value="no"></el-option>
                              <el-option label="按周循环" value="yes"></el-option>
                          </el-select>
                      </el-form-item>

                      <el-form-item label="课程时长：" prop="lesson_time">
                          <el-input type="number" v-model.number="timetableForm.lesson_time"></el-input><span class="pl-10">分钟</span>
                      </el-form-item>
                  </div>

                  <div class="flex1">
                      <el-form-item label="课程属性：">
                          <span>{{courseType === 1 ? '一对多课程' : courseType === 2 ? '一对一课程' : ''}}</span>
                          <!-- <span class="ml-10" v-if="timetableForm.lesson_time">{{timetableForm.lesson_time}}分钟</span> -->
                          <span class="fc-m ml-10" v-if="timetableForm.no_timetable !== '' && courseType === 1">未排课时：{{timetableForm.no_timetable}}</span>
                      </el-form-item>

                      <div v-if="addTableType === 'multiple'" key="multiple">
                          <el-form-item label="扣课时数：" prop="lesson_num">
                              <el-input type="number" v-model.number="timetableForm.lesson_num"></el-input><span class="pl-10">课时</span>
                          </el-form-item>

                          <el-form-item label="辅助老师：" prop="counselor_ids">
                              <el-select placeholder="请选择" v-model="timetableForm.counselor_ids" clearable @change="$refs.addTimeTable.validateField('teacher_ids')">
                                  <el-option v-for="(item, index) in timetableFull.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                              </el-select>
                          </el-form-item>
                      </div>
                      <div v-else key="single">
                          <el-form-item label="辅助老师：" prop="counselor_ids">
                              <el-select placeholder="请选择" v-model="timetableForm.counselor_ids" clearable @change="$refs.addTimeTable.validateField('teacher_ids')">
                                  <el-option v-for="(item, index) in timetableFull.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                              </el-select>
                          </el-form-item>
                          <el-form-item label="扣课时数：" prop="lesson_num">
                              <el-input type="number" v-model.number="timetableForm.lesson_num"></el-input><span class="pl-10">课时</span>
                          </el-form-item>
                      </div>
                      <el-form-item label="重复规则：" prop="loop" v-if="addTableType === 'multiple' && courseType === 1" key="loop1">
                          <el-select placeholder="请选择" v-model="timetableForm.loop" @change="timetableForm.loop_time = 1">
                              <el-option label="无" value="no"></el-option>
                              <el-option label="按周循环" value="yes"></el-option>
                          </el-select>
                      </el-form-item>

                      <el-form-item label="上课学员：" class="addtimetable-student" v-if="courseType !== 1 && addTableType === 'multiple'" key="multiple_add_student">
                          <div class="d-f">
                              <div class="d-f">
                                  <MyButton type="border" fontColor="fc-m" @click.native="addStudentClick">
                                      {{addStudentBtnChange()}}
                                  </MyButton>
                              </div>
                              <span class="fc-m ml-10" v-if="timetableForm.no_timetable !== ''">学员未排课时：{{timetableForm.no_timetable}}</span>
                          </div>
                      </el-form-item>
                      <el-form-item label="排课次数：" prop="loop_time" v-if="addTableType === 'multiple' && courseType !== 1" key="loop_time">
                          <el-input type="number" v-model.number="timetableForm.loop_time" :disabled="timetableForm.loop == 'no'"></el-input><span class="pl-10">次</span>
                      </el-form-item>
                  </div>
              </div>

              <div class="d-f">
                  <div class="add-date-box d-f flex1">
                      <div class="title p-r is-required">上课时间：</div>
                      <div class="flex1">
                          <div class="scroll-box" id="formAddDate">
                              <el-form :model="addDate" size="small" ref="addDateForm" :rules="timeRules" v-for="(addDate, num) in formAddDate" :key="num">
                                  <div class="p-r d-f">
                                      <div :class="addTableType === 'edit' ? 'date-change' : 'flex1' ">
                                          <el-form-item v-if="addTableType === 'edit'" key="edit_date">
                                              <el-date-picker v-model="addDate.week" @change="formEditDateChange"
                                                  :picker-options="pickerBeginDateAfter" type="date" :editable="false"
                                                  placeholder="选择日期" value-format="yyyy/MM/dd">
                                              </el-date-picker>
                                          </el-form-item>
                                          <el-form-item label-width="0" prop="week" v-else key="add_date">
                                              <el-select placeholder="某天" v-model="addDate.week" @change="formWeekChange">
                                                  <el-option v-for="(item, index) in timetableWeekList" :key="index" :disabled="addTableType !== 'multiple' && !item.day.past_due" :label="item.name" :value="item.id"></el-option>
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

                                      <i v-if="addTableType === 'multiple' && formAddDate.length > 1" @click="deleteDateHandle(num)" class="p-a delete-time el-tag__close el-icon-close"></i>
                                  </div>
                              </el-form>
                              <div class="d-f mt-10" v-if="addTableType === 'multiple'"><MyButton type="border" fontColor="fc-m"  @click.native="addDateHandle">添加时间</MyButton></div>
                          </div>
                      </div>
                  </div>

                  <div class="d-f f-a-s flex1 addtimetable-student" v-if="addTableType !== 'multiple' || (addTableType === 'multiple' && courseType === 1)" key="single_add_student">
                      <el-form-item label="上课学员：">
                      <div class="flex1" :class="{'d-f f-a-c': courseType === 2}">
                          <ul v-if="courseType === 1 && checkStudentForm.length" class="d-f f-w-w" >
                              <li v-for="(item, index) in checkStudentForm" :key="index" class="mb-10 mr-10">
                                  <span>{{getStudentName(item)}}</span>
                              </li>
                          </ul>
                          <div class="d-f mb-5" :class="{'mt-5': checkStudentForm.length}">
                              <MyButton type="border" fontColor="fc-m" @click.native="addStudentClick">
                                  {{addStudentBtnChange()}}
                              </MyButton>
                          </div>

                          <span class="fc-m ml-10" v-if="courseType === 2 && timetableForm.no_timetable !== ''">学员未排课时：{{timetableForm.no_timetable}}  </span>
                      </div>
                      </el-form-item>
                  </div>
              </div>
          </div>
          <div class="d-f f-j-c mt-30">
              <MyButton @click.native="doneHandle('addTimeTable')" :loading="submitLoading.timetable">确定</MyButton>
          </div>
      </el-form>

      <!-- 选择学员弹窗 -->
      <el-dialog :title="courseType === 1 ? '选择一对多上课学员' : '选择一对一上课学员'" width="670px" center :visible.sync="dialogStatus.student" :close-on-click-modal="false" append-to-body>
          <div class="form-box">
              <template v-if="courseType === 1">
                  <el-checkbox v-model="studentCheckAll" @change="studentCheckAllChange" class="pl-20">全选</el-checkbox>
                  <el-checkbox-group v-model="studentLists" @change="studentCheckChange" class="time-table-student-check pl-20 pr-20 mt-10">
                      <el-checkbox v-for="(item, index) in allStudentLists" :label="item.student_id" :key="index" :disabled="item.disabled">{{item.student_name}}</el-checkbox>
                  </el-checkbox-group>
              </template>
              <el-radio-group v-model="studentRadio" class="time-table-student-check pl-20 pr-20" v-else>
                  <el-radio v-for="(item, index) in allStudentLists" :disabled="item.disabled"
                  :key="index" :label="item.student_id">{{item.student_name}}</el-radio>
              </el-radio-group>

              <div class="d-f f-j-c mt-30"><MyButton @click.native="checkStudentDone">确定</MyButton></div>
          </div>
      </el-dialog>

      <!-- 冲突弹窗 -->
      <el-dialog width="1020px" center :visible.sync="dialogStatus.conflict" :close-on-click-modal="false" append-to-body>
          <div class="conflict-box">
              <h3>排课冲突提醒</h3>
              <p class="mb-20">班级：{{timetableForm.grade_name}}</p>
              <el-table border :data="conflictLists" height="400" header-row-class-name="row-header">
                  <el-table-column label="序号" prop="index" type="index" width="50" class-name="number"></el-table-column>
                  <el-table-column label="上课日期">
                      <template slot-scope="scope">
                          <el-date-picker type="date" :editable="false" :clearable="false" value-format="timestamp" v-model="scope.row.begin_time"></el-date-picker>
                      </template>
                  </el-table-column>
                  <el-table-column label="开始时间">
                      <template slot-scope="scope">
                          <el-time-select :picker-options="timePicker" :editable="false" :clearable="false" v-model="scope.row.begin_hours"></el-time-select>
                      </template>
                  </el-table-column>
                  <el-table-column label="冲突教室">
                      <template slot-scope="scope">
                          <el-select v-if="scope.row.conflict_data.reason == 2" v-model="conflict_room" :multiple="addTableType === 'multiple'" key="conflict_room">
                              <el-option v-for="(item, index) in timetableFull.class_room" :key="index" :label="item.name" :value="item.id" ></el-option>
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
  components: {MyButton},
  props: {
    value: {default: false},
    tableType: {default: 'single'},
    day: {},
    calendar: {default: ''},
    weekLists: {default: null},
    parentPage: {default: 'timetable'},
    parentData: {},
    editDetail: {},
    tableFull: {} //排课填充数据
  },
  watch: {
    value (val) {
      if (val) {
        this.$nextTick(() => {
          if (this.parentPage === 'timetable') {
            this.addTableType === 'edit' ? this.editTimeTable() : this.planTimeTable();
          } else {
            this.courseTimetable(); //课程快捷排课，且为批量排课
          }
        });
      }
    },
    // 课表编辑数据
    editDetail (detail) {
      if (!Object.keys(detail).length) {
        return 0;
      }
      this.courseType = detail.course_type;
      this.formAddDate.splice(0, this.formAddDate.length, {begin_time: detail.time_quantum.begin_time, end_time: '', week: detail.time_quantum.week});
      this.editStudentGrades = detail.student_grades;
      this.timetableForm.timetable_id = detail.id;
      this.timetableForm.grade_info = [detail.course_id, detail.grade_id];
      this.timetableForm.lesson_num = detail.lesson_num;
      this.timetableForm.lesson_time = Math.round((detail.end_time - detail.begin_time) / 60);
      this.timetableForm.teacher_ids = detail.teacher.length ? detail.teacher[0].id : ''; //任课老师
      this.timetableForm.counselor_ids = detail.counselor.length ? detail.counselor[0].id : ''; //辅助老师
      this.timetableForm.room_id = detail.room_id ? detail.room_id : '';
      // this.timetableForm.room_id = detail.room_id;
    },
    // 课程快速排课数据
    parentData (option) {
      console.log(option);
      if (!Object.keys(option).length) {
        return 0;
      }
      this.timetableForm.room_id = [];
      if (option.course_info.type === 1) {
        this.timetableForm.no_timetable = option.grade_info.unscheduled;
      }

      this.courseType = option.course_info.type;
      this.timetableForm.loop_time = 1;
      this.timetableForm.class_name = `${option.course_info.name}/${option.grade_info.name}`;
      this.timetableForm.lesson_time = option.course_info.lesson_time;
      this.timetableForm.teacher_ids = option.grade_info.teacher_lists.length ? option.grade_info.teacher_lists[0].id : ''; //任课老师
      this.timetableForm.counselor_ids = option.grade_info.counselor_lists.length ? option.grade_info.counselor_lists[0].id : ''; //辅助老师
      this.timetableForm.room_id.push(option.grade_info.room_id); //上课教室
      this.timetableForm.course_id = option.grade_info.course_id;
      this.timetableForm.grade_id = option.grade_info.id;

      if (option.grade_info.start_time * 1000 > new Date().setHours(0, 0, 0, 0)) {
        //若开课时间大于五年 则显示当前日期
        this.timetableForm.start_time = option.grade_info.start_time * 1000 - new Date().getTime() > 5 * 360 * 24 * 60 * 60 * 1000 ? new Date().setHours(0, 0, 0, 0) : option.grade_info.start_time * 1000;
        this.getWeek(this.timetableForm.start_time);
        this.disableStartTime = this.timetableForm.start_time;
      } else {
        this.timetableForm.start_time = new Date().setHours(0, 0, 0, 0);
        this.getWeek();
      }
    },
    tableType (val) {
      this.addTableType = val;
    },
    tableFull (val) {
      this.timetableFull = val;
    },
    weekLists (val) {
      console.log(val);
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
      addTableType: '',
      timetableFull: {},
      courseType: '', //课程类型  普通课程、一对一课程
      timePicker: JSON.parse(JSON.stringify(timePicker)),
      formAddDate: [],
      submitLoading: {
        timetable: false,
        conflict: false
      },

      dialogStatus: {
        timetable: false,
        conflict: false,
        student: false
      },
      timetableWeekList: this.weekLists,
      editStudentGrades: [],

      studentCheckAll: false,
      allStudentLists: [],
      studentLists: [], //普通排课选择学员数据
      studentRadio: '', //一对一排课，选择学员数据
      checkStudentForm: [], //form展示选中的学员
      radioStudentForm: '', //form展示选中的学员

      conflictLists: [],
      otherLists: [],
      conflict_room: [],

      timetableForm: {
        no_timetable: '', //未排课时
        course_id: '',
        grade_id: '',
        class_name: '',
        start_time: '',
        lesson_time: '',
        lesson_num: '',
        teacher_ids: '',
        counselor_ids: '',
        room_id: [],
        loop: 'no',
        loop_time: ''
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
      timetableRules: {
        grade_info: [
          {required: true, message: '请选择班级', trigger: 'change'}
        ],
        // room_id: [
          // {required: true, message: '请选择教室', trigger: 'change'}
        // ],
        teacher_ids: [
          {required: true, message: '请选择任课老师', trigger: 'change'},
          {validator: this.teacherValidator('teacher')}
        ],
        counselor_ids: [
          {validator: this.teacherValidator('counselor')}
        ],
        lesson_num: [
          {required: true, message: '请输入扣课时数'},
          {validator: this.$$tools.formOtherValidate('lesson_num')},
          {validator: this.$$tools.formOtherValidate('total', 99)}
        ],
        loop: [],
        lesson_time: [
          {required: true, message: '请输入课程时长'},
          {validator: this.$$tools.formOtherValidate('int')},
          {validator: this.$$tools.formOtherValidate('total', 180)}
        ],
        loop_time: [
          {required: true, message: '请输入排课次数'},
          {validator: this.$$tools.formOtherValidate('int')},
          {validator: this.$$tools.formOtherValidate('total', 99)}
        ],
        start_time: [
          {required: true, message: '请输入开课时间', trigger: 'change'}
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
      this.formAddDate.splice(0, this.formAddDate.length);
      this.$refs.addTimeTable.resetFields();

      Object.keys(this.timetableForm).forEach(v => {
        if (v === 'grade_info') {
          this.timetableForm[v] = [];
        } else if (v === 'loop') {
          this.timetableForm[v] = 'no';
        } else {
          this.timetableForm[v] = '';
        }
      });
      this.timePicker.minTime = 0;

      //排课学员相关数据重置
      this.studentCheckAll = false;
      this.allStudentLists = [];
      this.studentRadio = '';
      this.studentLists = [];
      this.courseType = '';
      this.timetableForm.no_timetable = '';
      this.checkStudentForm = [];
      this.radioStudentForm = '';

      this.$emit('input', false);
      this.$emit('CB-popverClose');
      // this.addTableType = 'single';
    },
    //任课老师、辅助老师不能重复验证
    teacherValidator (type) {
      return (rule, value, callback) => {
        if (type === 'teacher' && value == this.timetableForm.counselor_ids) {
          return callback(new Error('任课老师不能和辅助老师相同'));
        } else if (type === 'counselor' && value == this.timetableForm.teacher_ids) {
          return callback(new Error('辅助老师不能和任课老师相同'));
        }

        return callback();
      };
    },
    // 课表排课 批量、单个
    planTimeTable () {
      this.timetableForm.loop_time = 1;

      if (this.addTableType === 'single') {
        this.timetableForm.room_id = '';

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
        this.timetableForm.room_id = [];
        this.formAddDate.push({begin_time: '', end_time: '', week: ''});
        this.timetableForm.start_time = new Date().getTime();
      }


      this.dialogStatus.timetable = true;
    },
    // 课表编辑
    editTimeTable () {
      if (this.courseType !== 1 && this.editStudentGrades.length) {
        this.studentRadio = this.editStudentGrades[0].student_id;
      }
      let gradeInfo;

      this.timetableFull.course.forEach(v => {
        if (v.id === this.timetableForm.grade_info[0]) {
          v.grade.forEach(d => {
            if (d.id === this.timetableForm.grade_info[1]) {
              if (this.courseType === 1) {
                this.timetableForm.no_timetable = d.lesson_num - +d.scheduled;
              }
              gradeInfo = d;
            }
          });
        }
      });

      this.allStudentLists = gradeInfo.student_course.concat(gradeInfo.student_grade);

      if (this.courseType === 1) {
        this.checkStudentForm = this.editStudentGrades.map(v => {
          return v.student_id;
        });
        this.studentLists = this.checkStudentForm;
        this.studentCheckAll = this.checkStudentForm.length === this.allStudentLists.length;
      } else {
        this.radioStudentForm = this.editStudentGrades[0].student_id;
        this.studentRadio = this.radioStudentForm;
      }

      this.allStudentLists.forEach(m => {
        if (this.checkStudentForm.indexOf(m.student_id) != -1) {
          m.disabled = false;
        } else {
          m.disabled = m.buy_lesson_num - m.scheduled <= 0;
        }
      });

      this.dialogStatus.timetable = true;
    },
    // 课程班级列表，快速排课
    courseTimetable () {
      this.formAddDate.push({begin_time: '', end_time: '', week: ''});
      this.getGradeFill();
    },
    async getGradeFill () {
      let result = await this.$$request.post('/grade/fill', {course_id: this.timetableForm.course_id, grade_id: this.timetableForm.grade_id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.timetableFull = {
        teacher: result.lists.teacher,
        class_room: result.lists.room
      };
      this.allStudentLists = result.lists.student_course.concat(result.lists.student_grade);

      this.allStudentLists.forEach(m => {
        m.disabled = m.buy_lesson_num - m.scheduled <= 0;
      });

      if (result.lists.course.type === 1) {
        this.studentLists.splice(0, this.studentLists.length);
        result.lists.student_grade.forEach(v => {
          if (v.buy_lesson_num - v.scheduled > 0) {
            this.studentLists.push(v.student_id);
          }
        });
        this.checkStudentForm = JSON.parse(JSON.stringify(this.studentLists));
        // this.studentCheckAll = this.studentLists.length === this.allStudentLists.filter(f => {return !f.disabled}).length;
      }
      this.dialogStatus.timetable = true;
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
    //学员checkbox，全选
    studentCheckAllChange (val) {
      this.studentLists.splice(0, this.studentLists.length);
      if (val) {
        this.allStudentLists.forEach(v => {if (!v.disabled) this.studentLists.push(v.student_id)});
      }
    },
    //学员checkbox，多选
    studentCheckChange (val) {
      let checkedCount = val.length;

      this.studentCheckAll = checkedCount === this.allStudentLists.filter(f => {return !f.disabled}).length;
    },
    //选学员按钮判断变化
    addStudentBtnChange () {
      let text = '';

      if (this.courseType === 1) {
        text = this.checkStudentForm.length ? '重新选择' : '选择学员';
      } else {
        text = this.radioStudentForm ? this.getStudentName(this.radioStudentForm) : '选择学员';
      }

      return text;
    },
    //排课弹窗通过选中的student_id获取student_name
    getStudentName (student_id) {
      let name = '';

      this.allStudentLists.forEach(v => {
        if (student_id === v.student_id) {
          name = v.student_name;
        }
      });

      return name;
    },
    // 课程change
    formGradeChange (val) {
      //课程班级改变，学员数据全部重置
      this.studentCheckAll = false;
      this.allStudentLists = [];
      this.studentRadio = '';
      this.studentLists = [];
      this.checkStudentForm = [];
      this.radioStudentForm = '';
      this.timetableForm.lesson_num = '';
      this.timetableForm.no_timetable = '';

      let gradeInfo = {};

      if (this.addTableType === 'multiple') {
        this.formAddDate.splice(0, this.formAddDate.length, {begin_time: '', end_time: '', week: ''});
      }

      this.timetableFull.course.forEach(v => {
        if (v.id === val[0]) {
          this.timetableForm.lesson_time = v.lesson_time;
          this.courseType = v.type;
          v.grade.forEach(d => {
            if (d.id === val[1]) {
              gradeInfo = d;
              this.timetableForm.grade_name = gradeInfo.name;
              if (v.type === 1) {
                this.timetableForm.no_timetable = d.lesson_num - +d.scheduled;
              }
            }
          });
        }
      });

      console.log(gradeInfo);

      this.allStudentLists = gradeInfo.student_course.concat(gradeInfo.student_grade);
      this.allStudentLists.forEach(m => {
        m.disabled = m.buy_lesson_num - m.scheduled <= 0;
      }); //手动判断学员是否还能排课

      if (this.courseType === 1) {
        this.studentLists.splice(0, this.studentLists.length);
        gradeInfo.student_grade.forEach(k => {
          if (k.buy_lesson_num - k.scheduled > 0) {
            this.studentLists.push(k.student_id);
          }
        });
        this.checkStudentForm = this.studentLists;
      }

      if (gradeInfo.start_time * 1000 > new Date().setHours(0, 0, 0, 0)) {
        //若开课时间大于五年 则显示当前日期
        this.timetableForm.start_time = gradeInfo.start_time * 1000 - new Date().getTime() > 5 * 360 * 24 * 60 * 60 * 1000 ? new Date().setHours(0, 0, 0, 0) : gradeInfo.start_time * 1000;
        if (this.addTableType === 'multiple') {
          this.$emit('CB-startTimeChange', this.timetableForm.start_time);
        }
        this.disableStartTime = this.timetableForm.start_time;
      } else {
        this.timetableForm.start_time = new Date().setHours(0, 0, 0, 0);
      }

      this.timetableForm.teacher_ids = gradeInfo.teacher.length ? gradeInfo.teacher[0].id : ''; //任课老师
      this.timetableForm.counselor_ids = gradeInfo.counselor.length ? gradeInfo.counselor[0].id : ''; //辅助老师

      if (this.addTableType === 'multiple') {
        this.timetableForm.room_id.splice(0, this.timetableForm.room_id.length, gradeInfo.room_id);
      } else {
        this.timetableForm.room_id = gradeInfo.room_id;
      }
    },
    //排课，开课日期改变
    startTimeChange (val) {
      if (this.parentPage === 'course') {
        return this.getWeek(val);
      }
      this.$emit('CB-startTimeChange', val);
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
    // 新增学员
    addStudentClick () {
      if (!this.allStudentLists.length) {
        return this.$message.warning('暂无可选择学员');
      }
      this.dialogStatus.student = true;
      if (this.courseType === 1) {
        this.studentLists = JSON.parse(JSON.stringify(this.checkStudentForm));
        this.studentCheckAll = this.studentLists.length === this.allStudentLists.filter(f => {return (f.buy_lesson_num - f.scheduled)}).length;
      } else {
        this.studentRadio = this.radioStudentForm;
      }
    },
    // 选择学员确定
    checkStudentDone () {
      if (this.courseType === 1) {
        this.checkStudentForm = JSON.parse(JSON.stringify(this.studentLists));
      } else {
        this.radioStudentForm = this.studentRadio;
        this.allStudentLists.forEach(v =>{
          if (v.student_id == this.studentRadio) {
            this.timetableForm.no_timetable = v.buy_lesson_num - v.scheduled;
          }
        });
      }
      this.dialogStatus.student = false;
    },
    //排课表单确定
    doneHandle (formName) {
      let a, b;

      this.$refs[formName].validate(valid => {
        a = valid ? true : false;
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
      if (this.courseType !== 1 && !this.radioStudentForm) {
        return this.$message.warning('请选择学员！');
      }

      let params = {
        course_id: this.parentPage === 'timetable' ? this.timetableForm.grade_info[0] : this.timetableForm.course_id,
        grade_id: this.parentPage === 'timetable' ? this.timetableForm.grade_info[1] : this.timetableForm.grade_id,
        lesson_num: this.timetableForm.lesson_num,
        teacher_ids: `,${this.timetableForm.teacher_ids},`,
        counselor_ids: `,${this.timetableForm.counselor_ids},`,
        loop_time: this.timetableForm.loop_time,
        room_id: this.timetableForm.room_id,
        student_lists: this.courseType === 1 ? this.checkStudentForm.map(v => {
          return {student_id: v};
        }) : [{student_id: this.radioStudentForm}]
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
        console.log(this.formAddDate);
        params.begin_time = new Date(`${this.formAddDate[0].week} ${this.formAddDate[0].begin_time}`).getTime() / 1000;
        params.end_time = params.begin_time + this.timetableForm.lesson_time * 60;
        params.edit_id = this.timetableForm.timetable_id;
      } else {
        //批量提交
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
              } else if (new Date(this.timetableForm.start_time).getDay() == 0) { //周日
                begin_time = d.week != 0 ? later_begin_time : default_begin_time;
                end_time = d.week != 0 ? later_end_time : default_end_time;
              } else if (d.week == 0) {
                begin_time = default_begin_time;
                end_time = default_end_time;
              } else {
                begin_time = d.week < new Date(this.timetableForm.start_time).getDay() ? later_begin_time : default_begin_time;
                end_time = d.week < new Date(this.timetableForm.start_time).getDay() ? later_end_time : default_end_time;
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
            } else if (key === 'room_id') {
              if (this.addTableType === 'multiple') {
                item[key] = this.conflict_room.length ? this.conflict_room : this.timetableForm.room_id;
              } else {
                item[key] = this.conflict_room ? this.conflict_room : this.timetableForm.room_id;
              }
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
    //检测是否有冲突，获取冲突数据列表
    async getConflictLists (params) {
      if (this.submitLoading.timetable) {
        return 0;
      }
      this.submitLoading.timetable = true;
      this.conflict_room = this.addTableType === 'multiple' ? [] : '';

      let result = await this.$$request.post(`/timetable/${this.addTableType === 'edit' ? 'editTimetable' : 'conflictLists'}`, params);

      console.log(result);
      this.submitLoading.timetable = false;
      if (!result) {
        return 0;
      }

      if (result.status === 0) {
        return this.$message.warning('操作失败，请稍后再试!');
      }

      if (result.status === 1) {
        this.conflict_room = this.addTableType === 'multiple' ? [] : '';
        this.$message.success(`${this.addTableType === 'edit' ? '修改' : '添加'}排课成功`);
        this.$emit('CB-timetableSuccess'); //排课成功
        this.dialogStatus.timetable = false;
        this.dialogStatus.conflict = false;
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
        this.otherLists = result.lists; //正常列表
        this.dialogStatus.conflict = true;
      }
    },
    //周数据做处理
    getWeek (time) {
      let now = new Date(), nowTime, day;
      let weekList = [
        {id: 1, name: '周一', day: {}},
        {id: 2, name: '周二', day: {}},
        {id: 3, name: '周三', day: {}},
        {id: 4, name: '周四', day: {}},
        {id: 5, name: '周五', day: {}},
        {id: 6, name: '周六', day: {}},
        {id: 0, name: '周日', day: {}}
      ];

      if (time) {
        nowTime = time;
        day = new Date(nowTime).getDay();
      } else {
        nowTime = now.getTime();
        day = now.getDay();
      }

      let oneDayLong = 24 * 60 * 60 * 1000;

      this.timetableWeekList = weekList.map(d => {
        let num = d.id, newTime;
        let day_a = day == 0 ? 7 : day;

        newTime = num == 0 ? nowTime + (7 - day_a) * oneDayLong : nowTime - (day_a - num) * oneDayLong;

        let newDay = this.$$tools.formatTime(newTime / 1000, 'day');
        let newFullDay = this.$$tools.format(newTime / 1000);

        d.day = {
          date: newDay.replace(/\-/g, '/') || 0,
          newFullDay: newFullDay.replace(/\-/g, '/') || 0
        };

        return d;
      });
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
</style>


