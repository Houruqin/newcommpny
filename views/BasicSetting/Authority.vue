<template>
  <div class="flex1">
    <PageState :state="state"/>
    <el-card shadow="hover">
      <TableHeader title="权限设置"></TableHeader>
      <el-tabs v-model="activeId" @tab-click="tabClick" class="tab-toolbar">
          <el-tab-pane v-if="item.enName !== 'master'" v-for="(item, index) in roleLists" :key="index" :label="item.cnName" :name="item.enName"></el-tab-pane>
      </el-tabs>
      <div v-loading="loading">
        <div class="role-item-box mt-10 p-r">
          <div v-for="(item, index) in roleLists" :key="index" v-show="item.enName === activeId">
            <ul class="d-f">
              <li v-for="(role, num) in item.role" :key="role.id" class="cursor-pointer p-r" :class="{'active': role.id === activeRoleId, 'ml-20': num, 'mr-20': role.level === 2 && activeRoleId === role.id}"
                @click="roleListsClick(role.id)">
                <span>{{role.cnName}}</span>
                <i class="iconfont icon-bianji fc-m ml-10 p-a edit-icon" v-if="role.level === 2 && activeRoleId === role.id" @click.stop="editRoleMethod(role)"></i>
              </li>
              <li class="add-btn ml-20 cursor-pointer" @click="addRoleMethod(item.departmentId)" v-if="item.role.length < 6">
                <i class="iconfont icon-40 fc-subm"></i>
                <span>添加</span>
              </li>
            </ul>
          </div>

          <span class="p-a remake-info">注：如果没有勾选任何权限则默认该职务不能登录PC端</span>
        </div>

        <div class="authority-box mt-20">
          <el-table :data="authorityLists" border>
            <el-table-column label="模块" align="center" width="200">
              <template slot-scope="scope">
                <div class="checkall-box" :mydata="JSON.stringify(scope.row)">
                  <el-checkbox :indeterminate="scope.row.isIndeterminate" v-model="scope.row.isCheckAll" @change="roleCheckAllChange(scope.row)">
                    {{scope.row.display_name}}
                  </el-checkbox>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="权限" align="center">
              <template slot-scope="scope">
                <el-checkbox-group v-model="scope.row.checked" @change="roleCheckChange(scope.row)" class="d-f f-w-w role-check-box">
                  <el-checkbox v-for="(item, num) in scope.row.permissions" :key="num" :label="item.id" class="role-check-item">{{item.display_name}}</el-checkbox>
                </el-checkbox-group>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="d-f mt-20">
        <MyButton @click.native="authorityReset">恢复默认设置</MyButton>
        <MyButton @click.native="saveAuthority" class="ml-20">保存设置</MyButton>
      </div>
    </el-card>

    <!-- 添加，修改角色弹窗 -->
    <el-dialog :title="roleOperation == 'add' ? '添加角色' : '编辑角色'" width="500px" center :visible.sync="dialogStatus.role" :close-on-click-modal="false" @close="dialogClose('roleForm')">
      <el-form :model="roleForm" label-width="100px" :rules="roleRules" ref="roleForm" size="small" class="form-box" @submit.native.prevent>
        <el-form-item label="角色名称：" prop="name">
            <el-input v-model.trim="roleForm.name" placeholder="角色名称"></el-input>
        </el-form-item>
      </el-form>
      <div class="mt-20 d-f f-j-c">
          <MyButton @click.native="doneHandle" :loading="submitLoading.role">确定</MyButton>
          <MyButton @click.native="deleteRoleMethod" v-if="roleOperation === 'edit'" class="ml-20">删除</MyButton>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';

export default {
  components: {TableHeader, MyButton},
  data () {
    return {
      state: 'loading',
      activeId: 'education_department',
      oldTabId: 'education_department',
      activeRoleId: '',
      loading: false,
      // activeDepartmentId: '',
      activeNavId: '',

      roleLists: [], // 所有角色列表
      roleOperation: '',

      authorityLists: [], // 权限列表
      authorityCheckInfo: {},

      dialogStatus: {role: false},
      submitLoading: {role: false},

      roleForm: {id: '', name: ''},
      roleRules: {
        name: [
          {required: true, message: '请输入角色名称'},
          {max: 7, message: '长度不能超过7个字符'}
        ]
      }
    };
  },
  methods: {
    dialogClose (type) {
      this.$refs[type].resetFields();
      this.roleForm.name = '';
    },
    tabClick () {
      if (this.activeId === this.oldTabId) {
        return 0;
      }
      this.oldTabId = this.activeId;
      this.getActiveRoleId();
    },
    roleListsClick (id) {
      if (this.activeRoleId === id) {
        return 0;
      }
      this.activeRoleId = id;
      this.getAuthorityLists();
    },
    // 添加角色点击
    addRoleMethod () {
      this.roleOperation = 'add';
      this.dialogStatus.role = true;
    },
    // 编辑角色
    editRoleMethod (data) {
      console.log(data);
      this.roleOperation = 'edit';
      this.roleForm.id = data.id;
      this.roleForm.name = data.cnName;
      this.dialogStatus.role = true;
    },
    // 删除角色
    deleteRoleMethod () {
      this.$confirm('确定删除该角色吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteRoleHandle();
      }).catch(() => {
        return 0;
      });
    },
    async deleteRoleHandle () {
      let res = await this.$$request.post('/role/del', {roleId: this.roleForm.id});

      if (!res) {
        return 0;
      }

      this.$message.success('删除角色成功');
      this.dialogStatus.role = false;
      this.getRoleLists();
    },
    // 角色全选
    roleCheckAllChange (val) {
      val.checked = val.isCheckAll ? val.permissions.map(v => {return v.id}) : [];
      val.isIndeterminate = false;
    },
    // 角色选择
    roleCheckChange (val) {
      let checkedCount = val.checked.length;

      val.isCheckAll = checkedCount === val.permissions.length;
      val.isIndeterminate = checkedCount > 0 && checkedCount < val.permissions.length;
    },
    // 权限重置
    authorityReset () {
      this.$confirm('确定恢复默认设置吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.authorityResetHandle();
      }).catch(() => {
        return 0;
      });
    },
    async authorityResetHandle () {
      let params = {
        roleId: this.activeRoleId,
        departmentId: this.activeDepartmentId
      };

      console.log(params);
      let res = await this.$$request.post('/role/reset', params);

      console.log(res);

      if (!res) {
        return 0;
      }
      this.$message.success('重置成功');
      this.getAuthorityLists();
    },
    // 保存权限设置
    saveAuthority () {
      this.$confirm('确定保存权限设置吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.saveAuthorityHandle();
      }).catch(() => {
        return 0;
      });
    },
    async saveAuthorityHandle () {
      let authorityList = [];

      this.authorityLists.forEach(v => {
        authorityList = authorityList.concat(v.checked);
      });

      let res = await this.$$request.post('/role/savePermission', {roleId: this.activeRoleId, permissionList: authorityList});

      if (!res) {
        return 0;
      }

      this.$message.success('保存权限成功');
      this.getAuthorityLists();
    },
    // 添加，修改角色 确定
    doneHandle () {
      this.$refs.roleForm.validate(valid => {
        if (valid) {
          this.submitRoleData();
        }
      });
    },
    // 提交角色新增、修改数据
    async submitRoleData () {
      if (this.submitLoading.role) {
        return 0;
      }

      this.submitLoading.role = true;
      let params = {displayName: this.roleForm.name};

      if (this.roleOperation === 'add') {
        params.departmentId = this.activeDepartmentId;
      } else {
        params.roleId = this.activeRoleId;
      }

      console.log(params);
      let res = await this.$$request.post(`/role/${this.roleOperation === 'add' ? 'create' : 'edit'}`, params);

      console.log(res);
      this.submitLoading.role = false;
      if (!res) {
        return 0;
      }

      if (this.roleOperation === 'add') {
        this.activeRoleId = res.id;
      }
      this.getRoleLists(this.roleOperation);
      this.$message.success(`${this.roleOperation === 'add' ? '新增' : '编辑'}成功`);
      this.dialogStatus.role = false;
    },
    //获取选中的角色ID
    getActiveRoleId () {
      this.roleLists.forEach(v => {
        if (v.enName === this.activeId) {
          this.activeRoleId = v.role[0].id;
          this.activeDepartmentId = v.departmentId;
        }
      });
      this.getAuthorityLists();
    },
    // 获取角色列表
    async getRoleLists (isRefresh) {
      let result = await this.$$request.post('/permission/roleLists');

      console.log(result);
      if (!result) {
        return 0;
      }
      this.roleLists = result.lists;
      this.$store.commit('getRoleLists', result.lists);
      if (!isRefresh) {
        this.getActiveRoleId();
      } else if (isRefresh === 'add') {
        this.getAuthorityLists();
      }

      return true;
    },
    // 获取权限列表
    async getAuthorityLists () {
      this.loading = true;
      let res = await this.$$request.post('permission/lists', {role_id: this.activeRoleId});

      if (!res) {
        return 0;
      }
      res.navs.forEach(v => {
        let checked = [];

        v.permissions.forEach(k => {
          if (k.status) {
            checked.push(k.id);
          }
        });
        let isCheckAll = v.permissions.every(m => {
          return m.status;
        });

        v.isCheckAll = isCheckAll;
        v.checked = checked;
        v.isIndeterminate = checked.length > 0 && checked.length < v.permissions.length;
      });

      this.authorityLists = res.navs.filter(v => {return v.permissions.length});
      this.loading = false;
      console.log(this.authorityLists);

      return true;
    }
  },
  async created () {
    let datas = await this.getRoleLists();

    if (datas) {
      this.state = 'loaded';
    }
  }
};
</script>

<style lang="less" scoped>
  .role-item-box {
    ul li {
      padding: 4px 10px;
      border: 1px #45DAD5 solid;
      background-color: #fff;
      border-radius: 3px;
      color: #45DAD5;
      .edit-icon {
        right: -20px;
        top: 50%;
        transform: translateY(-50%);
      }
      &.active {
        background-color: #45DAD5;
        color: #fff;
      }
      &.add-btn {
        background: none;
        color: #ED9374;
        border-color: #ED9374;
      }
    }
    .remake-info {
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      color: #555;
    }
  }
  .form-box {
    /deep/ .el-input {
      width: 300px;
    }
  }

  .role-check-box {
    padding: 0 20px;
    margin-bottom: 10px;
    /deep/ .el-checkbox+.el-checkbox {
      margin-left: 0;
    }
    /deep/ .role-check-item {
      margin-top: 10px;
      margin-right: 30px;
      width: 230px;
      text-align: left;
    }
  }
</style>


