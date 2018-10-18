<template>
    <el-dialog :title="type == 'edit' ? '修改课程' : '添加课程'" width="720px" center :visible.sync="courseDialogStatus" :close-on-click-modal="false" @close="dialogClose('courseForm')">
        <el-form :model="courseForm" label-width="125px" size="small" ref="courseForm" :rules="courseRules">
            <div class="form-box add_course">
                <el-row>
                    <el-col :span="12">
                        <el-form-item label="课程名字：" prop="name">
                            <el-input v-model.trim="courseForm.name" placeholder="课程名称"></el-input>
                        </el-form-item>
                        <el-form-item label="课节时长：" prop="lesson_time">
                            <el-input type="number" v-model.number="courseForm.lesson_time"></el-input><span class="pl-10">分钟</span>
                        </el-form-item>
                        <!-- <el-form-item label="是否可预约：" prop="is_order">
                            <el-radio-group v-model="courseForm.is_order" disabled>
                                <el-radio :label="0">不可预约</el-radio>
                                <el-radio :label="1">可预约</el-radio>
                            </el-radio-group>
                        </el-form-item> -->
                        <el-form-item label="任课老师：" prop="order_teacher_ids" v-if="courseMode == 2">
                            <el-select v-model="courseForm.order_teacher_ids" placeholder="请选择" multiple>
                                <el-option v-for="(item, index) in $store.state.teacherList" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>

                    <el-col :span="12">
                        <el-form-item label="课程有效期：" prop="expire">
                            <el-input type="number" v-model.number="courseForm.expire"></el-input><span class="pl-10">个月</span>
                        </el-form-item>
                        <el-form-item label="课程性质：" prop="type">
                            <el-select :disabled="courseType == 'edit'" v-model="courseForm.type" placeholder="请选择">
                                <el-option label="普通课程" :value="1"></el-option>
                                <el-option label="一对一课程" :value="2"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </div>
        </el-form>

        <div class="d-f f-j-c mt-20">
            <MyButton @click.native="doneHandle('courseForm')" :loading="submitLoading">提交</MyButton>
            <MyButton v-if="courseType == 'edit'" class="ml-20" type="gray" @click.native="deleteCourse(courseForm.id)">删除</MyButton>
        </div>
    </el-dialog>
</template>

<script>

import MyButton from '../common/MyButton';
import Bus from '../../script/bus';

export default {
  props: {
    type: {default: 'add'},
    dialogStatus: '',
    courseMode: {default: ''},
    editDetail: {default: null}
  },
  components: {MyButton},
  watch: {
    dialogStatus (newVal) {
      this.courseDialogStatus = newVal;
      if (this.courseDialogStatus) {
        this.courseForm.expire = 12; //有效期默认12月
        this.courseForm.lesson_time = 30; //时长默认30分钟
        this.courseForm.type = 1; //课程性质默认普通排课
        this.courseForm.is_order = this.courseMode == 1 ? 0 : 1;
      }
    },
    type (newVal) {
      console.log(newVal);
      this.courseType = newVal;
    },
    editDetail (newVal) {
      console.log(newVal);
      if (!Object.keys(newVal).length) {
        return 0;
      }
      for (let key in this.courseForm) {
        if (key === 'order_teacher_ids') {
          this.courseForm[key] = newVal[key].substring(1, newVal[key].length - 1).split(',').map(v => {
            return +v;
          });
        } else {
          this.courseForm[key] = newVal[key];
        }
      }
    }
  },
  data () {
    return {
      submitLoading: false,
      courseForm: {
        id: '',
        name: '', //名字
        expire: '', //有效期
        lesson_time: '', //课时时长
        type: 1, //课程性质
        order_teacher_ids: [],
        is_order: ''
      },
      courseDialogStatus: false,
      courseType: 'add',
      courseRules: {
        name: [
          {required: true, message: '请输入课程名称'},
          {max: 20, message: '长度不能超过20个字符'}
        ],
        expire: [
          {required: true, message: '请输入课程有效期'},
          {validator: this.$$tools.formOtherValidate('int')},
          {validator: this.$$tools.formOtherValidate('total', 120)}
        ],
        unit_price: [
          {required: true, message: '请输入学费标准'}
        ],
        lesson_time: [
          {required: true, message: '请输入课节时长'},
          {validator: this.$$tools.formOtherValidate('int')},
          {validator: this.$$tools.formOtherValidate('total', 180)}
        ],
        type: [
          {required: true, message: '请选择课程性质', trigger: 'change'}
        ],
        order_teacher_ids: [
          {required: true, message: '请选择上课老师', trigger: 'change'}
        ]
        // is_order: [
        //     {required: true, message: '请设置是否可预约', trigger: 'change'}
        // ]
      }
    };
  },
  methods: {
    dialogClose () {
      this.$refs.courseForm.resetFields();
      for (let key in this.courseForm) {
        this.courseForm[key] = key == 'order_teacher_ids' ? [] : '';
      }
      this.$emit('CB-dialogStatus', 'add_course');
    },
    //form表单确定按钮
    doneHandle () {
      this.$refs.courseForm.validate(valid => {
        if (valid) {
          this.submitCourse();
        }
      });
    },
    //删除课程
    deleteCourse (course_id) {
      this.$confirm('确定删除课程吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteHandle(course_id);
      }).catch(() => {
        return 0;
      });
    },
    async deleteHandle (course_id) {
      if (!course_id) {
        return this.$message.warning('操作失败');
      }

      let result = await this.$$request.post('/course/delete', {id: course_id});

      console.log(result);
      if (!result) {
        return 0;
      }

      this.$message.success('删除成功');
      this.$store.dispatch('getCourse'); //更新课程信息
      this.$emit('CB-addCourse');
    },
    //新增、编辑课程提交数据
    async submitCourse () {
      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;

      let url = this.courseType == 'edit' ? '/course/edit' : '/course/add';
      let params = {};

      for (let key in this.courseForm) {
        if (key != 'id') {
          if (key == 'order_teacher_ids') {
            params[key] = this.courseMode == 2 ? this.courseForm[key] : [];
          } else {
            params[key] = this.courseForm[key];
          }
        }
      }

      params.class_pattern = this.courseMode;
      if (this.courseType == 'edit') {
        params.id = this.courseForm.id;
      }
      console.log(params);

      let result = await this.$$request.post(url, params);

      this.submitLoading = false;
      console.log(result);
      if (!result) {
        return 0;
      }

      this.courseDialogStatus = false;
      this.$message.success(this.courseType == 'edit' ? '修改成功' : '添加成功');
      this.$store.dispatch('getCourse'); //更新课程信息
      this.$emit('CB-addCourse');
    }
  }
};
</script>

<style lang="less" scoped>
    .add_course /deep/ .el-input-number--small{
        width: 180px;
    }
    .form-box {
        /deep/ .el-input-number {
            width: 150px;
        }
        /deep/ .el-input {
            width: 150px;
        }
    }
</style>

