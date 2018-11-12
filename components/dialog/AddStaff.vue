<template>
    <el-dialog :title="staffType == 'add' ? '添加员工' : '编辑员工资料'" width="800px" center :visible.sync="staffDialogStatus" :close-on-click-modal="false" @close="formClose" :append-to-body="appendBody">
        <el-form :model="staffForm" label-width="100px" :rules="rules" ref="userForm" size="small">
            <div class="form-box pl-20 pr-20">
                <div class="d-f">
                    <div class="flex1">
                      <el-form-item label="姓名：" prop="name" :validate-on-rule-change="false">
                          <el-input v-model.trim="staffForm.name" placeholder="姓名"></el-input>
                      </el-form-item>
                      <el-form-item label="电话：" prop="mobile">
                          <el-input v-model.trim="staffForm.mobile" placeholder="电话"></el-input>
                      </el-form-item>
                      <div class="role-type d-f">
                        <span class="title is-required">职务：</span>
                        <div class="flex1">
                          <el-form :model="roleType" size="small" ref="roleTypeForm" :rules="roleTypeRules" v-for="(roleType, num) in roleTypeForm" :key="num">
                            <div class="d-f p-r">
                              <el-form-item label-width="0" prop="department_id" class="flex1">
                                <el-select placeholder="选择部门" v-model="roleType.department_id" @change="roleType.role_id = ''" :disabled="Boolean(role)">
                                    <el-option v-for="(item, index) in $store.state.roleLists" v-if="item.enName !== 'master'" :disabled="departmentOptionIsDisabled(item.departmentId)" :key="index" :label="item.cnName" :value="item.departmentId"></el-option>
                                </el-select>
                              </el-form-item>
                              <el-form-item label-width="0" prop="role_id" class="flex1 ml-10">
                                  <el-select placeholder="选择职务" v-model="roleType.role_id" :disabled="Boolean(role)">
                                      <el-option v-for="(item, index) in roleSelectOptions[roleType.department_id]" :key="index"  :label="item.cnName" :value="item.id"></el-option>
                                  </el-select>
                              </el-form-item>
                              <i v-if="roleTypeForm.length > 1 || isMaster" @click="roleTypeForm.splice(num, 1)" class="p-a delete-time el-tag__close el-icon-close"></i>
                            </div>
                          </el-form>
                          <div class="d-f mt-10" v-if="roleTypeForm.length < $store.state.roleLists.length - 1 && !role"><MyButton type="border" fontColor="fc-m" @click.native="addRoleType">添加职务</MyButton></div>
                        </div>
                      </div>
                    </div>
                    <div class="flex1 ml-40">
                      <el-form-item label="性别：" prop="sex" >
                          <el-select v-model="staffForm.sex" placeholder="选择性别">
                              <el-option label="男" :value="1"></el-option>
                              <el-option label="女" :value="0"></el-option>
                          </el-select>
                      </el-form-item>
                      <el-form-item label="职位性质：" prop="kind">
                          <el-select v-model="staffForm.kind" placeholder="选择职位性质" :disabled="isMaster">
                              <el-option label="全职" :value="1"></el-option>
                              <el-option label="兼职" :value="2"></el-option>
                          </el-select>
                      </el-form-item>
                      <el-form-item label="入职时间：" prop="entry_date">
                          <el-date-picker
                              v-model="staffForm.entry_date"
                              type="date"
                              :editable="false"
                              placeholder="选择日期"
                              value-format="timestamp">
                          </el-date-picker>
                      </el-form-item>
                    </div>
                </div>
            </div>
        </el-form>
        <div class="mt-20 d-f f-j-c">
            <MyButton @click.native="doneHandle" :loading="submitLoading.add">确定</MyButton>
        </div>
    </el-dialog>
</template>


<script>
import MyButton from '../../components/common/MyButton';

export default {
  props: {
    role: {default: false},
    staffType: {default: 'add'},
    value: {default: false},
    appendBody: {default: false},
    editDetail: {default: null}
  },
  watch: {
    value (val) {
      if (val) {
        this.pageShowInit();
      }
    },
    editDetail (newVal) {
      if (!Object.keys(newVal).length) {
        return 0;
      }

      newVal.type_all.forEach(v => {
        if (v.type_en !== 'master') {
          this.roleTypeForm.push({
            department_id: v.department.id,
            role_id: v.id
          });
        } else {
          this.isMaster = true;
        }
      });

      for (let key in this.staffForm) {
        if (key === 'entry_date') {
          this.staffForm[key] = newVal.entry_at * 1000;
        } else {
          this.staffForm[key] = newVal[key];
        }
      }
    },
    role (newVal) {
      if (newVal) {
        this.$store.state.roleLists.forEach(v => {
          v.role.forEach(k => {
            if (k.enName === newVal) {
              this.roleTypeForm.push({
                department_id: k.parent_id,
                role_id: k.id
              });
            }
          });
        });
      }
    }
  },
  data () {
    return {
      submitLoading: {
        add: false, remove: false
      },
      isMaster: false, // 是否是校长
      staffDialogStatus: this.value,
      staffForm: {name: '', mobile: '', entry_date: '', id: '', kind: '', sex: ''},
      roleLists: [],
      roleTypeForm: [],
      roleSelectOptions: {},

      rules: {
        name: [
          {required: true, message: '请输入员工姓名'},
          {max: 7, message: '长度不能超过7个字符'}
        ],
        mobile: [
          {required: true, message: '请输入员工电话'},
          {validator: this.$$tools.formValidate('phone')}
        ],
        sex: [
          {required: true, message: '请选择性别'}
        ],
        // role_type: [
        //   {required: true, message: '请选择职务', trigger: 'change'}
        // ],
        entry_date: [
          {required: true, message: '请选择入职时间', trigger: 'change'}
        ],
        kind: [
          {required: true, message: '请选择职位性质', trigger: 'change'}
        ]
      },
      roleTypeRules: {
        department_id: [
          {required: true, message: '请选择部门', trigger: 'change'}
        ],
        role_id: [
          {required: true, message: '请选择职务', trigger: 'change'}
        ]
      }
    };
  },
  methods: {
    formClose () {
      this.$refs.userForm.resetFields();
      Object.keys(this.staffForm).forEach(v => {
        this.staffForm[v] = '';
      });

      this.roleTypeForm.splice(0, this.roleTypeForm.length);
      this.isMaster = false;
      this.$emit('input', false);
      this.$emit('CB-dialogStatus', 'staff');
    },
    pageShowInit () {
      this.roleLists = JSON.parse(JSON.stringify(this.$store.state.roleLists));
      this.roleLists.forEach(v => {
        if (v.enName !== 'master') {
          this.roleSelectOptions[v.departmentId] = v.role;
        }
      });

      if (this.staffType === 'add' && !this.role) {
        this.roleTypeForm.push({department_id: '', role_id: ''});
      }

      this.staffDialogStatus = true;
    },
    addRoleType () {
      this.roleTypeForm.push({department_id: '', role_id: ''});
    },
    //删除时间段
    deleteRoleType (index) {
      this.roleTypeForm.splice(index, 1);
    },
    departmentOptionIsDisabled (id) {
      return this.roleTypeForm.some(v => {
        return v.department_id === id;
      });
    },
    //确定
    doneHandle () {
      let a, b;

      this.$refs.userForm.validate(valid => {
        a = valid ? true : false;
      });

      if (this.isMaster && a) {
        return this.submitUserInfo();
      }

      for (let i = 0, len = this.$refs.roleTypeForm.length; i < len; i++) {
        this.$refs.roleTypeForm[i].validate(valid => {
          b = valid ? true : false;
        });
      }

      if (a && b) {
        this.submitUserInfo();
      }
    },
    //提交新增、修改员工信息
    async submitUserInfo () {

      if (this.submitLoading.add) {
        return 0;
      }
      this.submitLoading.add = true;

      let url = this.staffType === 'add' ? '/user/add' : '/user/edit';
      let params = {
        sex: this.staffForm.sex,
        name: this.staffForm.name,
        mobile: this.staffForm.mobile,
        role_ids: this.roleTypeForm.map(v => {return v.role_id}),
        entry_at: this.staffForm.entry_date ? this.staffForm.entry_date / 1000 : '',
        kind: this.staffForm.kind
      };

      if (this.staffType === 'edit') {
        params.id = this.staffForm.id;
      }

      console.log(params);
      let result = await this.$$request.post(url, params);

      this.submitLoading.add = false;
      console.log(result);

      if (!result) {
        return 0;
      }

      this.$emit('CB-AddStaff', result.user_add);
      this.staffDialogStatus = false;
      this.$store.dispatch('getAdvisor'); //更新员工顾问信息
      this.$store.dispatch('getTeacher');
      this.$message.success(this.staffType === 'edit' ? '修改成功' : '添加成功');
    },
    remove_tag (tag) {
      console.log(tag);
      if (tag === 'master') {
        this.staffForm.role_type.unshift('master');
        this.$message.closeAll();
        this.$message.warning('不能删除校长职务！');
      }
    }
  },
  components: {MyButton}
};
</script>

<style lang="less" scoped>
    .form-box {
        /deep/ .el-input {
          width: 235px;
        }
    }
    .role-type {
      /deep/ .el-input {
        width: 100%;
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
      .delete-time {
          top: 10px;
          right: -20px;
          cursor: pointer;
      }
    }
</style>

