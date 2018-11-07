<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-row>
            <el-col :span="24">
                <el-card shadow="hover">
                    <TableHeader title="校区设置">
                        <MyButton @click.native="addSchool" :type="schoolNum > 4 ? 'gray' : 'main'">添加校区</MyButton>
                    </TableHeader>
                    <el-table :data="schoolLists" stripe v-loading="loading">
                        <el-table-column type="index" label="序号" align="center"></el-table-column>
                        <el-table-column prop="school_name" label="校区名称" align="center"></el-table-column>
                        <el-table-column prop="user_name" label="校长姓名" align="center"></el-table-column>
                        <el-table-column prop="user_mobile" label="校长手机号" align="center"></el-table-column>
                        <el-table-column prop="school_contact" label="校区座机号" align="center"></el-table-column>
                        <el-table-column prop="school_address" label="校区地址" align="center"></el-table-column>
                        <el-table-column label="课程模式" align="center">
                            <template slot-scope="scope">
                                <span>{{scope.row.class_pattern == 1 ? '有班课程' : scope.row.class_pattern == 0 ? '有班课程/无班课程' : '无班课程'}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" align="center">
                            <template slot-scope="scope">
                                <div class="d-f operate-btn f-j-c">
                                    <a class="cursor-pointer fc-m" @click="operateHnadle(scope.row, 'modify')">编辑</a>
                                    <a v-if="schoolLists.length > 1" class="cursor-pointer ml-20 fc-m" @click="operateHnadle(scope.row, 'delete')">删除</a>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>

        <el-dialog :title="maskType == 'add' ? '添加校区' : '修改校区'" width="600px" center :visible.sync="maskStatus" :close-on-click-modal="false" @close="formClose">
            <el-form :model="form" label-width="120px" size="small" :rules="rules" ref="schoolForm">
                <div class="form-box">
                    <el-form-item label="机构名称：" prop="organization_id">
                        <el-select v-model="form.organization_id" placeholder="选择机构名称">
                            <el-option v-for="(item, index) in organizationInfo" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="校区名称：" prop="school_name" class="mt-30">
                        <el-input v-model.trim="form.school_name" placeholder="校区名称"></el-input>
                    </el-form-item>

                    <el-form-item label="分校长姓名：" prop="user_name" class="mt-30">
                        <el-input v-model.trim="form.user_name" placeholder="分校长姓名"></el-input>
                    </el-form-item>

                    <el-form-item label="校长手机号：" prop="user_mobile" class="mt-30">
                        <el-input v-model.trim="form.user_mobile" placeholder="校长手机号"></el-input>
                    </el-form-item>

                    <el-form-item label="校区座机号：" prop="school_contact" class="mt-30">
                        <el-input v-model.trim="form.school_contact" placeholder="校区座机号"></el-input>
                    </el-form-item>

                    <el-form-item label="校区地址：" prop="school_address" class="mt-30">
                        <el-input v-model.trim="form.school_address" placeholder="校区地址"></el-input>
                    </el-form-item>

                    <el-form-item label="课程模式：" prop="class_pattern" class="mt-30">
                        <el-radio-group v-model="form.class_pattern" :disabled="maskType == 'modify'">
                            <el-radio :label="0">全部</el-radio>
                            <el-radio :label="1">有班课程</el-radio>
                            <el-radio :label="2">无班课程</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </div>
            </el-form>
            <div class="mt-40 d-f f-j-c">
                <MyButton @click.native="doneHandle('schoolForm')" :loading="submitLoading">确定</MyButton>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import Bus from '../../script/bus';

let organization_id, school_name, user_name, user_mobile, school_contact, school_address, class_pattern; //全局申明字段，修改的时候判断参数

export default {
  data () {
    return {
      state: 'loading',
      loading: false,
      schoolNum: 3, //可用的校区数量
      maskStatus: false, //新增、修改form
      maskType: 'add',
      submitLoading: false,
      schoolLists: [],
      organizationInfo: [],
      form: {
        organization_id: '', //机构id
        school_name: '', //校区名称
        user_name: '', //校长姓名
        user_mobile: '', //校长手机号
        school_contact: '', //联系电话
        school_address: '', //校区
        school_id: '',
        user_id: '',
        class_pattern: ''
      },
      rules: {
        organization_id: [
          {required: true, message: '请选择机构', trigger: 'change'}
        ],
        school_name: [
          {required: true, message: '请输入校区名称'},
          {max: 20, message: '长度不能超过20个字符'}
        ],
        user_name: [
          {required: true, message: '请输入分校长姓名'},
          {max: 7, message: '长度不能超过7个字符'}
        ],
        user_mobile: [
          {required: true, message: '请输入分校长电话'},
          {validator: this.$$tools.formValidate('phone')}
        ],
        school_contact: [
          {required: true, message: '请输入联系电话'},
          {validator: this.$$tools.formValidate('tel')}
        ],
        school_address: [
          {required: true, message: '请输入校区地址'},
          {max: 50, message: '长度不能超过50个字符'}
        ],
        class_pattern: [
          {required: true, message: '请选择课程模式', trigger: 'change'}
        ]
      }
    };
  },
  methods: {
    //弹窗关闭
    formClose () {
      this.$refs.schoolForm.resetFields();
      Object.keys(this.form).forEach(v => {
        this.form[v] = '';
      });
    },
    //添加校区
    addSchool () {
      for (let key in this.form) {
        this.form[key] = '';
      }
      this.maskStatus = true;
      this.maskType = 'add';
    },
    //确定点击
    doneHandle (formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.submitData();
        } else {
          return 0;
        }
      });
    },
    //列表操作按钮方法
    operateHnadle (scope, type) {
      console.log(scope);
      if (type === 'modify') {
        for (let key in scope) {
          if (key !== 'institution_info') {
            this.form[key] = scope[key];
            switch (key) {
              case 'school_name':
                school_name = scope.school_name;
                break;
              case 'user_name':
                user_name = scope.user_name;
                break;
              case 'user_mobile':
                user_mobile = scope.user_mobile;
                break;
              case 'school_contact':
                school_contact = scope.school_contact;
                break;
              case 'school_address':
                school_address = scope.school_address;
                break;
              case 'class_pattern':
                class_pattern = scope.class_pattern;
                break;
              default:
                break;
            }
          } else {
            organization_id = scope.institution_info.id;
            this.form.organization_id = scope.institution_info.id;
          }
        }

        this.maskStatus = true;
        this.maskType = type;
      } else {
        this.deleteList(scope);
      }
    },
    //删除
    deleteList (scope) {
      if (scope.school_id === this.$$cache.getMemberInfo().school_id) {
        return this.$message.warning('不能删除当前所在校区');
      }

      this.$confirm('确定删除该校区吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteSchool(scope.school_id);
      }).catch(() => {
        return 0;
      });
    },
    async deleteSchool (school_id) {
      let result = await this.$$request.post('/school/delete', {school_id: school_id});

      console.log(result);
      if (!result) {
        return 0;
      }

      let memberInfo = this.$$cache.getMemberInfo();

      memberInfo.school_id = result.user.school_id;
      this.$$cache.setMemberInfo(memberInfo);

      this.getSchoolLists();
      Bus.$emit('refreshSchoolId'); //删了校区，更新home的schoolId
      this.$message.success('已删除');
    },
    //提交校区信息
    async submitData () {
      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;

      let url = this.maskType === 'add' ? '/school/add' : '/school/edit';
      let postdata = this.getModifyParams();

      let result = await this.$$request.post(url, postdata);

      this.submitLoading = false;
      console.log(result);

      if (!result) {
        return 0;
      }

      this.getSchoolLists();
      Bus.$emit('refreshSchoolId'); //新增校区，更新home的schoolId
      this.$message.success(this.maskType === 'add' ? '添加成功' : '修改成功');
      this.maskStatus = false;
    },
    //参数处理方法
    getModifyParams () {
      let postdata = {}, form = this.form;

      let params = {
        school: {
          institution_id: form.organization_id,
          name: form.school_name,
          type: '',
          contact: form.school_contact,
          class_pattern: form.class_pattern,
          address: form.school_address
        },
        user: {
          institution_id: form.organization_id,
          mobile: form.user_mobile,
          name: form.user_name
        }
      };

      if (this.maskType === 'modify') {
        params.school.id = form.school_id;
        params.user.id = form.user_id;
        params.user.school_id = form.school_id;

        if (organization_id == form.organization_id) {
          if (school_contact == form.school_contact && school_address == form.school_address && school_name == form.school_name && class_pattern == form.class_pattern) {
            params.school = null;
          }

          if (user_mobile == form.user_mobile && user_name == form.user_name) {
            params.user = null;
          }
        }
        postdata.data = params;
      } else {
        postdata.lists = [params];
      }

      return postdata;
    },
    //获取校区列表
    async getSchoolLists () {
      this.loading = true;
      let result = await this.$$request.get('/school/lists');

      if (!result) {
        return void 0;
      }
      this.schoolLists = result.lists;
      this.loading = false;

      return true;
    },
    //获取机构列表
    async getOrgLists () {
      let orgLists = await this.$$request.post('/user/orgLists');

      if (!orgLists) {
        return void 0;
      }
      this.organizationInfo = orgLists.lists;

      return true;
    }
  },
  async created () {
    let [r1, r2] = await Promise.all([this.getOrgLists(), this.getSchoolLists()]);

    if (r1 && r2) {
      this.state = 'loaded';
    }
  },
  components: {TableHeader, MyButton}
};
</script>

<style lang="less" scoped>
    .form-box {
        padding:  0 30px;
    }
    .operate-btn {
        img {
            display: block;
        }
    }
</style>

