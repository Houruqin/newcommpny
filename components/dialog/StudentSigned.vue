<template>
  <el-dialog title="编辑学员资料" width="800px" center :visible.sync="studentDialogStatus" :close-on-click-modal="false" @close="dialogClose">
    <el-form :model="studentForm" label-width="120px" size="small" ref="addStudent" :rules="rules">
        <div class="form-box pl-20 pr-20">
            <div class="d-f">
              <div class="flex1">
                <el-form-item label="学员姓名：" prop="student_name">
                    <el-input v-model.trim="studentForm.student_name"></el-input>
                </el-form-item>

                <el-form-item label="联系电话：" prop="mobile">
                    <el-input v-model.trim="studentForm.mobile" ref="mobileObj"></el-input>
                </el-form-item>

                <el-form-item label="就读学校：" prop="school_name">
                    <el-input v-model.trim="studentForm.school_name" placeholder="选填"></el-input>
                </el-form-item>

                <el-form-item label="家长姓名：" prop="parent_name">
                    <el-input v-model.trim="studentForm.parent_name" @input="parentNameInput"></el-input>
                </el-form-item>

                <el-form-item label="分配顾问：">
                    <el-select v-model="studentForm.advisor_id" placeholder="选择顾问" clearable>
                        <el-option label="暂不分配" value=""></el-option>
                        <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
              </div>
              <div class="flex1">
                <el-form-item label="性别：" prop="sex" >
                    <el-select v-model="studentForm.sex" placeholder="选择性别">
                        <el-option label="男" :value="1"></el-option>
                        <el-option label="女" :value="0"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="出生日期：">
                    <el-date-picker v-model="studentForm.birthday" :picker-options="pickerBeginDateAfter" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                </el-form-item>

                <el-form-item label="家庭住址：" prop="address">
                    <el-input v-model.trim="studentForm.address" placeholder="选填"></el-input>
                </el-form-item>

                <el-form-item label="家长关系：" key="relation1" v-if="!studentForm.parent_name">
                    <el-select v-model="studentForm.relation" placeholder="请选择" :disabled="!studentForm.parent_name">
                        <el-option v-for="(item, index) in $store.state.familyRelations" :key="index" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="家长关系：" key="relation2" prop="relation"  v-else>
                    <el-select v-model="studentForm.relation" placeholder="请选择" :disabled="!studentForm.parent_name">
                        <el-option v-for="(item, index) in $store.state.familyRelations" :key="index" :label="item.name" :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
              </div>
            </div>
            <el-form-item label="备注：" class="textarea-cls pr-40" prop="remark">
                <el-input type="textarea" :rows="4" placeholder="请输入备注信息" v-model.trim="studentForm.remark"></el-input>
            </el-form-item>
            <div class="d-f f-j-c mt-30"><MyButton @click.native="doneHandle" :loading="submitLoading">确定</MyButton></div>
        </div>
    </el-form>
</el-dialog>
</template>

<script>
import MyButton from '../../components/common/MyButton';

export default {
  components: {MyButton},
  props: {
    value: {default: false},
    editDetail: {}
  },
  watch: {
    value (val) {
      if (val) {
        this.studentDialogStatus = val;
      }
    },
    editDetail (data) {
      if (Object.keys(data).length) {
        Object.keys(this.studentForm).forEach(v => {
          if (v === 'id') {
            this.studentForm[v] = data.student_id;
          } else if (v === 'birthday') {
            this.studentForm[v] = data.birthday > 0 ? data.birthday * 1000 : '';
          } else if (v === 'advisor_id') {
            this.studentForm[v] = data[v] == 0 ? '' : data[v];
          } else {
            this.studentForm[v] = data[v];
          }
        });
      }
    }
  },
  data () {
    return {
      studentDialogStatus: this.value,
      submitLoading: false,
      studentForm: {
        id: '',
        student_name: '',
        parent_name: '',
        relation: '',
        mobile: '',
        address: '',
        sex: '',
        birthday: '',
        school_name: '',
        advisor_id: '',
        remark: ''
      },
      rules: {
        parent_name: [
          {max: 7, message: '长度不能超过7个字符'}
        ],
        relation: [
          {required: true, message: '请选择关系', trigger: 'change'}
        ],
        mobile: [
          {required: true, message: '请输入家长电话'},
          {validator: this.$$tools.formValidate('phone')}
        ],
        address: [
          {max: 50, message: '长度不能超过50个字符'}
        ],
        school_name: [
          {max: 20, message: '长度不能超过20个字符'}
        ],
        student_name: [
          {required: true, message: '请输入学员姓名'},
          {max: 7, message: '长度不能超过7个字符'}
        ],
        sex: [
          {required: true, message: '请选择性别', trigger: 'change'}
        ],
        remark: [{ max: 100, message: '长度不能超过100个字符' }]
      },
      pickerBeginDateAfter: {
        disabledDate: (time) => {
          return time.getTime() > new Date().getTime();
        }
      }
    };
  },
  methods: {
    dialogClose () {
      this.$refs.addStudent.resetFields();
      Object.keys(this.studentForm).forEach(v =>{
        this.studentForm[v] = '';
      });
      this.studentDialogStatus = false;
      this.$emit('input', false);
      this.$emit('CB-dialogStatus', 'student');
    },
    parentNameInput () {
      if (!this.studentForm.parent_name) {
        this.studentForm.relation = '';
      }
    },
    doneHandle () {
      this.$refs.addStudent.validate(valid => {
        if (valid) {
          this.submitStudentInfo();
        }
      });
    },
    async submitStudentInfo () {
      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;

      let params = {};

      Object.keys(this.studentForm).forEach(key => {
        params[key] = key === 'birthday' ? this.studentForm[key] / 1000 : this.studentForm[key];
      });

      let result = await this.$$request.post('/sign/edit', params);

      this.submitLoading = false;
      if (!result) {
        return 0;
      }

      this.studentDialogStatus = false;
      this.$message.success('修改成功');
      this.$emit('CB-success');
    }
  }
};
</script>

<style lang="less" scoped>
  .form-box /deep/ .el-input {
    width: 200px;
  }
</style>

