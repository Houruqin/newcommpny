<template>
    <!-- 修改班级弹窗 -->
    <el-dialog :title="gradeType == 'add' ? '添加班级' : '编辑班级资料'" width="780px" center :visible.sync="gradeDialogStatus" :close-on-click-modal="false" @close="dialogClose('gradeForm')">
        <el-form :model="classForm" label-width="120px" size="small" ref="gradeForm" :rules="classRules" class="form-box pl-20 pr-20">
            <div class="d-f">
              <div class="flex1">
                  <el-form-item label="课程名称："><span>{{classForm.course_name}}</span></el-form-item>
                  <el-form-item label="班级名称：" prop="name">
                      <el-input v-model.trim="classForm.name"></el-input>
                  </el-form-item>
                  <el-form-item label="任课老师：" prop="teacher_ids" class="p-r">
                      <el-select v-model="classForm.teacher_ids" placeholder="必选" :disabled="disabled.teacher" @change="$refs.gradeForm.validateField('counselor_ids')">
                          <el-option
                              v-for="(item, index) in classSelectInfo.teacher"
                              :key="index"
                              :label="item.name"
                              :value="item.id">
                          </el-option>
                      </el-select>
                      <div class="p-a add-room ver-c cursor-pointer" v-if="$$tools.isAuthority('addStaffs')" @click="addTeacher"><img src="../../images/common/add.png" alt=""></div>
                  </el-form-item>
                  <!-- <el-form-item label="开班日期：" prop="start_time" v-if="courseType === 1">
                      <el-date-picker v-model.trim="classForm.start_time" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                  </el-form-item> -->
                  <el-form-item label="可否试听：" prop="is_listen" v-if="courseType === 1">
                      <el-select v-model="classForm.is_listen" placeholder="请选择">
                          <el-option label="是" :value="1"></el-option>
                          <el-option label="否" :value="0"></el-option>
                      </el-select>
                  </el-form-item>
                  <el-form-item label="上课教室：" prop="room_id" v-if="courseType === 1" class="p-r">
                      <el-select v-model="classForm.room_id" placeholder="请选择">
                          <el-option
                              v-for="item in $store.state.classRoom"
                              :key="item.id"
                              :label="item.name"
                              :value="item.id">
                          </el-option>
                      </el-select>
                      <div class="p-a add-room ver-c cursor-pointer" v-if="$$tools.isAuthority('addClassroom')" @click="addRoom"><img src="../../images/common/add.png" alt=""></div>
                  </el-form-item>
              </div>

              <div class="flex1">
                  <el-form-item label="课程类型："><span>{{courseType === 1 ? '一对多' : '一对一'}}</span></el-form-item>
                  <el-form-item label="班级课时：" prop="lesson_num" v-if="courseType === 1">
                      <el-input type="number" v-model.number="classForm.lesson_num"></el-input><span class="pl-10">课时</span>
                  </el-form-item>

                  <!-- <el-form-item label="开班日期：" prop="start_time" v-if="courseType !== 1">
                      <el-date-picker v-model.trim="classForm.start_time" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                  </el-form-item> -->

                  <el-form-item label="辅助老师：" prop="counselor_ids">
                      <el-select v-model="classForm.counselor_ids" placeholder="可选" clearable :disabled="disabled.counselor" @change="$refs.gradeForm.validateField('teacher_ids')">
                          <el-option
                              v-for="(item, index) in classSelectInfo.teacher"
                              :key="index"
                              :label="item.name"
                              :value="item.id">
                          </el-option>
                      </el-select>
                  </el-form-item>

                  <el-form-item label="人数上限：" prop="limit_num" v-if="courseType === 1">
                      <el-input type="number" v-model.number="classForm.limit_num"></el-input>
                  </el-form-item>

                  <el-form-item label="上课教室：" prop="room_id" v-if="courseType === 2" class="p-r">
                      <el-select v-model="classForm.room_id" placeholder="请选择">
                          <el-option
                              v-for="item in $store.state.classRoom"
                              :key="item.id"
                              :label="item.name"
                              :value="item.id">
                          </el-option>
                      </el-select>
                      <div class="p-a add-room ver-c cursor-pointer" v-if="$$tools.isAuthority('addClassroom')" @click="addRoom"><img src="../../images/common/add.png" alt=""></div>
                  </el-form-item>
              </div>
            </div>
            <el-form-item label="班级学员：">
                <el-checkbox v-model="studentCheckAll" @change="studentCheckAllChange">全选</el-checkbox>
                <el-checkbox-group v-model="studentLists" @change="studentCheckChange" v-if="allStudentLists.length" class="grade-student-check">
                    <el-checkbox v-for="(item, index) in allStudentLists" :label="item" :key="index" :disabled="item.buy_lesson_num - item.scheduled <= 0">{{item.student_name}}</el-checkbox>
                </el-checkbox-group>
            </el-form-item>

            <div class="d-f f-j-c">
                <MyButton @click.native="doneHandle('gradeForm')" :loading="submitLoading.grade">确定</MyButton>
            </div>
        </el-form>

        <!-- 添加教室 -->
        <el-dialog title="添加教室" width="500px" center :visible.sync="roomDialogStatus" :close-on-click-modal="false" @close="dialogClose('roomForm')" append-to-body>
            <el-form :model="roomForm" label-width="100px" size="small" :rules="roomRules" ref="roomForm" class="form-box pl-10 pr-10" @submit.native.prevent>
                <div class="d-f f-j-c">
                    <el-form-item label="教室名称" prop="name">
                        <el-input v-model.trim="roomForm.name" placeholder="教室名称"></el-input>
                    </el-form-item>
                </div>
                <div class="d-f f-j-c mt-20"><MyButton @click.native="doneHandle('roomForm')" :loading="submitLoading.room">确定</MyButton></div>
            </el-form>
        </el-dialog>

        <!-- 新增员工弹窗 -->
        <AddStaffDialog v-model="userDialogStatus" :type="userType" :role="userRole" :appendBody="true"
            @CB-dialogStatus="CB_dialogStatus" @CB-AddStaff="CB_addStaff">
        </AddStaffDialog>
    </el-dialog>
</template>

<script>
import MyButton from '../common/MyButton';
import AddStaffDialog from './AddStaff';

export default {
  props: {
    type: {default: 'add'},
    dialogStatus: '',
    editDetail: {default: null}
  },
  components: {MyButton, AddStaffDialog},
  watch: {
    dialogStatus (newVal) {
      this.gradeDialogStatus = newVal;
    },
    type (newVal) {
      this.gradeType = newVal;
    },
    editDetail (newVal) {
      if (!Object.keys(newVal).length) {
        return 0;
      }

      this.courseType = newVal.course_type;
      this.courseId = newVal.course_id;
      this.gradeId = newVal.id;

      this.getGradeFill();

      if (this.gradeType === 'edit') {
        for (let key in this.classForm) {
          if (key === 'teacher_ids') {
            this.classForm[key] = newVal['teacher_lists'].length ? newVal['teacher_lists'][0].id : '';
          } else if (key === 'counselor_ids') {
            this.classForm[key] = newVal['counselor_lists'].length ? newVal['counselor_lists'][0].id : '';
          } else if (key === 'limit_num') {
            this.classForm[key] = `${newVal[key]}`;
          } else {
            this.classForm[key] = newVal[key];
          }
        }
      }
    }
  },
  data () {
    return {
      gradeDialogStatus: false,
      roomDialogStatus: false,
      userDialogStatus: false,

      gradeType: 'add',
      userType: 'add',
      userRole: false,

      disabled: {
        teacher: false,
        counselor: false
      },

      courseType: 1,
      courseId: '',
      studentLists: [],
      classSelectInfo: {},
      allStudentLists: [],
      studentCheckAll: false,

      submitLoading: {grade: false, room: false},

      classForm: {
        id: '',
        course_name: '', //课程名称
        course_id: '', //课程id
        lesson_num: '', //课程课时
        name: '', //班级名称
        teacher_ids: '', //任课老师id
        // start_time: '', //开课日期
        limit_num: '', //人数上限
        counselor_ids: '', // 辅助老师id
        room_id: '', //所选教室id
        is_listen: '' //是否试听
      },
      roomForm: {id: '', name: ''},
      classRules: {
        name: [
          {required: true, message: '请输入班级名称'},
          {max: 20, message: '长度不能超过20个字符'}
        ],
        lesson_num: [
          {required: true, message: '请输入班级课时'},
          {validator: this.$$tools.formOtherValidate('int')},
          {validator: this.$$tools.formOtherValidate('total', 200)},
          {validator: this.lessonNumValidator()}
        ],
        teacher_ids: [
          {required: true, message: '请选择任课老师', trigger: 'change'},
          {validator: this.teacherValidator('teacher')}
        ],
        counselor_ids: [
          {validator: this.teacherValidator('counselor')}
        ],
        // start_time: [
        //   {required: true, message: '请选择开课日期', trigger: 'change'}
        // ],
        limit_num: [
          {required: true, message: '请设置人数上限'},
          {validator: this.$$tools.formOtherValidate('int')},
          {validator: this.$$tools.formOtherValidate('total', 99)}
        ],
        room_id: [
          {required: true, message: '请选择上课教室', trigger: 'change'}
        ],
        is_listen: [
          {required: true, message: '请设置可否试听', trigger: 'change'}
        ]
      },
      roomRules: {
        name: [
          {required: true, message: '请输入教室'},
          {max: 10, message: '长度不能超过10个字符'}
        ]
      }
    };
  },
  methods: {
    dialogClose (type) {
      this.$refs[type].resetFields();
      if (type === 'gradeForm') {
        this.studentLists = [];
        this.allStudentLists = [];
        this.studentCheckAll = false;

        for (let key in this.classForm) {
          if (this.classForm.hasOwnProperty(key)) {
            this.classForm[key] = '';
          }
        }
        this.$emit('CB-dialogStatus', 'grade');
      }
    },
    CB_dialogStatus () {
      this.userRole = false;
    },
    CB_addStaff (data) {
      this.getGradeFill(v => {
        this.classForm.teacher_ids = data.id;
      });
    },
    //班级课时验证
    lessonNumValidator () {
      return (rule, value, callback) => {
        if (value == 0) {
          return callback(new Error('班级课时不能为0'));
        }

        return callback();
      };
    },
    //任课老师、辅助老师不能重复验证
    teacherValidator (type) {
      return (rule, value, callback) => {
        if (type === 'teacher' && value == this.classForm.counselor_ids) {
          return callback(new Error('任课老师不能和辅助老师相同'));
        } else if (type === 'counselor' && value == this.classForm.teacher_ids) {
          return callback(new Error('辅助老师不能和任课老师相同'));
        }

        return callback();
      };
    },
    //班级学员checkbox，全选
    studentCheckAllChange (val) {
      this.studentLists = val ? this.allStudentLists.filter(v => {return v.buy_lesson_num - v.scheduled > 0}) : [];
    },
    //学员checkbox，多选
    studentCheckChange (val) {
      let checkedCount = val.length;

      this.studentCheckAll = checkedCount === this.allStudentLists.filter(v => {return v.buy_lesson_num - v.scheduled > 0}).length;
    },
    //添加教室
    addRoom () {
      this.roomDialogStatus = true;
    },
    //添加老师
    addTeacher () {
      this.userRole = 'teacher';
      this.userDialogStatus = true;
    },
    //编辑班级确定
    doneHandle (type) {
      this.$refs[type].validate(valid => {
        if (valid) {
          if (type === 'gradeForm') {
            return this.submitGrade();
          }
          if (type === 'roomForm') {
            return this.submitRoom();
          }
        }
      });
    },
    //获取老师列表、上课教室等附加信息
    async getGradeFill (fn) {
      let params = {course_id: this.courseId, grade_id: this.gradeId};

      let result = await this.$$request.post('/grade/fill', params);

      console.log(result);
      if (!result) {
        return 0;
      }
      this.classSelectInfo = result.lists;
      if (fn && typeof fn === 'function') fn(true);
      if (this.gradeType === 'add') {
        this.allStudentLists = result.lists.student_course;
      } else {
        this.allStudentLists = result.lists.student_course.concat(result.lists.student_grade);
        this.studentLists = result.lists.student_grade;
        if (!result.lists.student_course.length && result.lists.student_grade.length) {
          this.studentCheckAll = true;
        }
      }
      console.log(this.allStudentLists);
      this.classForm.course_name = result.lists.course.name;
      this.classForm.course_id = result.lists.course.id;
    },
    //提交新增教室数据
    async submitRoom () {
      if (this.submitLoading.room) {
        return 0;
      }
      this.submitLoading.room = true;

      let result = await this.$$request.post('/classRoom/add', {name: this.roomForm.name});

      console.log(result);
      this.submitLoading.room = false;

      if (!result) {
        return 0;
      }

      this.$store.dispatch('getClassRoom', d => {
        this.roomDialogStatus = false;
        this.$message.success('添加成功');
        this.classForm.room_id = result.class_room.id;
      }); //更新教室信息
    },
    //新增、编辑班级提交数据
    submitGrade () {
      if (this.courseType === 1) {
        if (this.classForm.limit_num < this.studentLists.length) {
          this.$confirm('学员数量已经超过上限，是否继续添加?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            this.submitGradeHandle();
          }).catch(() => {
            return 0;
          });
        } else {
          this.submitGradeHandle();
        }
      } else {
        this.submitGradeHandle();
      }
    },
    async submitGradeHandle () {
      if (this.submitLoading.grade) {
        return 0;
      }
      this.submitLoading.grade = true;

      let url = this.gradeType === 'edit' ? '/grade/edit' : '/grade/add';
      let params = {};

      for (let key in this.classForm) {
        if (key === 'teacher_ids' || key === 'counselor_ids') {
          params[key] = `,${this.classForm[key]},`;
        } else {
          params[key] = this.classForm[key];
        }
      }

      params.students = this.studentLists.map(v => {
        return {student_id: v.student_id};
      });
      console.log(params);

      let result = await this.$$request.post(url, params);

      this.submitLoading.grade = false;
      console.log(result);
      if (!result) {
        return 0;
      }
      this.$message.success(this.gradeType === 'edit' ? '修改成功' : '添加成功');

      this.$emit('CB-addGrade', params.course_id);
      this.$store.dispatch('getCourse');
      this.studentLists.splice(0, this.studentLists.length); //成功以后，studentLists选中的学员列表清空
    },
    // 获取角色列表
    async getRoleLists () {
      let result = await this.$$request.post('/permission/roleLists');

      if (!result) {
        return 0;
      }
      this.$store.commit('getRoleLists', result.lists);
    }
  },
  created () {
    let roleList = this.$store.state.roleLists;

    if (!roleList.length) {
      this.getRoleLists();
    }
  }
};
</script>

<style lang="less" scoped>
    .form-box {
        /deep/ .el-input {
            width: 150px;
        }
        .add-room {
            right: 40px;
            img {
                display: block;
            }
        }
    }
    .grade-student-check {
        max-height: 200px;
        overflow: hidden;
        overflow-y: auto;
        .el-checkbox {
            margin-left: 0;
            margin-right: 30px;
        }
    }
</style>


