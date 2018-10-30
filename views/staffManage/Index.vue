<template>
    <div class="flex1">
        <PageState :state="state" />
        <el-card shadow="hover">
            <TableHeader title="员工管理">
                <MyButton @click.native="addUser" v-if="$$tools.isAuthority('addStaffs')">添加员工</MyButton>
            </TableHeader>
            <div class="d-f f-a-c tab-box p-r">
                <ul class="d-f tab-toolbar">
                  <li v-for="(list, index) in roleLists" :key="index" :class="{'ml-20': index, 'active': list.departmentId === staffType.departmentId}">
                    <el-dropdown trigger="click" v-if="list.role.length && list.enName !== 'master'" placement="bottom" @command="tabClick" class="role-popver-box">
                      <span class="el-dropdown-link title cursor-pointer">{{list.cnName}}<i class="el-icon-arrow-down el-icon--right"></i></span>
                      <el-dropdown-menu slot="dropdown" class="role-popver-box">
                        <el-dropdown-item v-for="(item, num) in list.role" :key="num" :command="item" class="drop-item" :class="{'active': item.id === staffType.roleId && list.departmentId === staffType.departmentId}">{{item.cnName}}</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                    <span v-else class="title cursor-pointer" @click="tabClick(list)" :class="{'active': list.departmentId === staffType.departmentId}">{{list.cnName}}</span>
                  </li>
                </ul>
                <!-- <el-tabs v-model="staffType" @tab-click="tabClick" class="tab-toolbar">
                    <el-tab-pane label="全部" name="all"></el-tab-pane>
                    <el-tab-pane v-for="(item, index) in $store.state.roleLists" :key="index" :label="item.display_name" :name="item.name"></el-tab-pane>
                </el-tabs> -->
                <el-select v-model="filterVal" placeholder="请选择" class="ml-50 filter-box" @change="filterChange" size="small">
                    <el-option label="全部任职状态" value=""></el-option>
                    <el-option label="在职" :value="1"></el-option>
                    <el-option label="离职" :value="0"></el-option>
                </el-select>
            </div>
            <div v-loading="loading">
              <el-table :data="staffListInfo.data" stripe class="mt-20">
                  <el-table-column label="序号" type="index" align="center"></el-table-column>
                  <el-table-column label="员工姓名" align="center">
                      <template slot-scope="scope">
                          <router-link v-if="scope.row.status && $$tools.isAuthority('viewStaffs')" :to="{path: '/staff/detail', query: {user_id: scope.row.id}}" class="fc-m"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.name}}</span></router-link>
                          <span v-else :class="{'list-item-gray': !scope.row.status}">{{scope.row.name}}</span>
                      </template>
                  </el-table-column>
                  <el-table-column label="手机号码" align="center">
                      <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.mobile}}</span></template>
                  </el-table-column>
                  <el-table-column label="性别" align="center">
                      <template slot-scope="scope">{{scope.row.sex ? '男' : '女'}}</template>
                  </el-table-column>
                  <el-table-column label="任职岗位" align="center">
                      <template slot-scope="scope">
                          <span v-for="(type,index) in scope.row.type_all" :key="index" :class="{'list-item-gray': !scope.row.status}"><span v-if="index !== 0"> | </span>{{type.type_cn}}</span>
                      </template>
                  </el-table-column>
                  <el-table-column label="职位性质" align="center">
                      <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.kind == 1 ? '全职 ' : '兼职'}}</span></template>
                  </el-table-column>
                  <el-table-column label="任职状态" align="center">
                      <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.status == 1 ? '在职' : '离职'}}</span></template>
                  </el-table-column>
                  <el-table-column label="账号状态" align="center">
                      <template slot-scope="scope"><span>{{!scope.row.status ? '--' : scope.row.is_enable == 1 ? '正常' : '禁用'}}</span></template>
                  </el-table-column>
                  <el-table-column label="操作" align="center">
                      <template slot-scope="scope">
                        <div class="operable-btn-box">
                          <span class="cursor-pointer fc-subm" v-if="!scope.row.status && $$tools.isAuthority('deleteStaffs')" @click="deleteUserInfo(scope.row)">删除</span>
                          <span class="cursor-pointer fc-m" v-if="scope.row.status && scope.row.is_enable && $$tools.isAuthority('editStaffs')" @click="modifyHandle(scope.row)">编辑</span>
                          <span class="cursor-pointer fc-m" v-if="scope.row.operable" @click="forbidClick(scope.row)">
                              {{scope.row.is_enable == 1 ? '禁用' : '启用'}}
                          </span>
                          <span class="cursor-pointer fc-m" v-if="$$tools.isAuthority('quitStaffs') && scope.row.status" @click="dimissionClick(scope.row)">离职</span>
                        </div>
                      </template>
                  </el-table-column>
              </el-table>
              <el-pagination v-if="staffListInfo.total"
                  class="d-f f-j-c mt-50 mb-50"
                  :page-size="staffListInfo.per_page"
                  background layout="total, prev, pager, next"
                  :total="staffListInfo.total"
                  :current-page="parseInt(staffListInfo.current_page)"
                  @current-change="paginationClick"
                  @next-click="nextClick"
                  @prev-click="prevClick">
              </el-pagination>
            </div>
        </el-card>

        <!-- 新增员工弹窗 -->
        <AddStaffDialog v-model="dialogStatus" :editDetail="editDetail" :type="type"
            @CB-dialogStatus="CB_dialogStatus" @CB-AddStaff="CB_addStaff">
        </AddStaffDialog>
    </div>
</template>

<script>

import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import AddStaffDialog from '../../components/dialog/AddStaff';

export default {
  data () {
    return {
      state: 'loading',
      staffType: {
        departmentId: 'all',
        roleId: ''
      },
      // staffType: 'all',
      staffListInfo: {},
      filterVal: '',
      dialogStatus: false,
      loading: true,
      editDetail: {},
      type: 'add',
      currPage: false,

      activePage: 1,
      roleLists: [],

      //所有权限列表
      authorityAllLists: [
        {id: 'paike', name: '排课', checked: false},
        {id: 'caiwu', name: '财务', checked: false},
        {id: 'xueyuan', name: '学员管理', checked: false},
        {id: 'course', name: '课程管理', checked: false},
        {id: 'staff', name: '员工管理', checked: false}
      ],
      authorityAll: false,
      authorityCheckList: [], //选中的权限列表
      load_lazy: false
    };
  },
  methods: {
    addUser () {
      this.type = 'add';
      this.dialogStatus = true;
    },
    CB_dialogStatus () {
      this.dialogStatus = false;
      this.editDetail = {};
    },
    CB_addStaff () {
      this.dialogStatus = false;
      this.getUserLists(this.activePage);
    },
    //员工状态筛选
    filterChange () {
      this.getUserLists();
    },
    tabClick (tab) {
      if (tab.departmentId === 'all') {
        this.staffType.departmentId = tab.departmentId;
        this.staffType.roleId = '';
      } else if (tab.enName === 'master') {
        this.staffType.departmentId = tab.departmentId;
        this.staffType.roleId = 'master';
      } else {
        this.staffType.departmentId = tab.parent_id;
        this.staffType.roleId = tab.id;
      }
      this.getUserLists();
    },
    titleClick (list) {
      this.roleLists.forEach(v => {
        if (list.departmentId === v.departmentId) {
          v.rotate = !v.rotate;
        } else {
          v.rotate = false;
        }
      });
    },
    nextClick (currentPage) {
      this.currPage = true;
      this.getUserLists(currentPage);
    },
    prevClick (currentPage) {
      this.currPage = true;
      this.getUserLists(currentPage);
    },
    //分页
    paginationClick (currentPage) {
      if (!this.currPage) {
        this.getUserLists(currentPage);
      }
      this.currPage = false;
    },
    //权限check全选
    authorityCheckAllChange (val) {
      this.authorityCheckList = val ? this.authorityAllLists : [];
    },
    //权限check勾选
    authorityCheckChange (val) {
      let checkedCount = val.length;

      this.authorityAll = checkedCount === this.authorityAllLists.length;
    },
    //修改
    modifyHandle (data) {
      this.type = 'edit';
      console.log(data);
      this.editDetail = data;
      this.dialogStatus = true;
    },
    //离职
    dimissionClick (data) {
      this.$confirm('员工离职后，数据将无法恢复，您确定要办理离职吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.dimissionHandle(data.id);
      }).catch(() => {
        return 0;
      });
    },
    async dimissionHandle (id) {
      let result = await this.$$request.post('/user/changeStatus', {id: id});

      console.log(result);
      if (!result) {
        return 0;
      }

      this.getUserLists(this.activePage);
      this.$store.dispatch('getAdvisor'); //更新员工顾问信息
      this.$store.dispatch('getTeacher');
      this.$message.success('已修改为离职状态');
    },
    //禁用账号
    forbidClick (data) {
      this.$confirm(`确定${data.is_enable ? '禁' : '启'}用该账号吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.forbideHandle(data);
      }).catch(() => {
        return 0;
      });
    },
    async forbideHandle (data) {
      console.log(data);
      let result = await this.$$request.post(`user/${data.is_enable ? 'disable' : 'enable'}`, {user_id: data.id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.$message.success(`${data.is_enable ? '禁' : '启'}用操作成功!`);
      this.getUserLists(this.activePage);
    },
    //删除用户
    deleteUserInfo (scope) {
      this.$confirm('确定删除该员工吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteHandle(scope);
      }).catch(() => {
        return 0;
      });
    },
    async deleteHandle (scope) {
      let result = await this.$$request.post('/user/delete', {id: scope.id});

      console.log(result);

      if (!result) {
        return 0;
      }
      this.getUserLists();
      this.$message.success('已删除');
    },
    // 角色列表
    async getRoleLists () {
      let result = await this.$$request.post('/permission/roleLists');

      console.log(result);
      if (!result) {
        return 0;
      }

      console.log(result);

      this.$store.commit('getRoleLists', result.lists);

      let newResult = JSON.parse(JSON.stringify(result.lists));

      newResult.forEach(v => {
        if (v.enName !== 'master') {
          v.role.unshift({
            cnName: '全部',
            enName: 'all',
            id: 'all',
            parent_id: v.departmentId
          });
        }
      });
      newResult.unshift({
        cnName: '全部',
        enName: 'all',
        departmentId: 'all',
        role: []
      });
      this.roleLists = newResult;

      return true;
    },
    //用户列表
    async getUserLists (currentPage) {
      this.loading = true;
      let params = {roleList: ''};

      console.log(this.staffType);

      if (this.staffType.departmentId === 'all') {
        params.roleList = 'all';
      } else if (this.staffType.roleId === 'all') {
        this.roleLists.forEach(v => {
          if (v.departmentId === this.staffType.departmentId) {
            params.roleList = v.role.map(k => {
              return k.id;
            });
            params.roleList.shift();
          }
        });
      } else if (this.staffType.roleId === 'master') {
        params.roleList = [this.staffType.departmentId];
      } else {
        params.roleList = [this.staffType.roleId];
      }

      // let params = {type: this.staffType};

      if (currentPage) {
        params.page = currentPage;
      }
      if (this.filterVal === 0 || this.filterVal === 1) {
        params.status = this.filterVal;
      }
      console.log(params);
      let result = await this.$$request.get('/user/lists', params);

      console.log(result);

      if (!result) {
        return 0;
      }

      this.activePage = currentPage ? currentPage : 1;
      this.staffListInfo = result.lists;
      this.loading = false;

      return true;
    },
    //权限列表
    async getAuthorityLists () {
      let result = await this.$$request.post('/permission/lists');

      console.log(result);

      if (!result) {
        return 0;
      }
      this.authorityAllLists = result.lists;
    }
  },
  async created () {
    let [a, b] = await Promise.all([this.getUserLists(), this.getRoleLists()]);

    if (a && b) {
      this.state = 'loaded';
    }
  },
  components: {TableHeader, MyButton, AddStaffDialog}
};
</script>

<style lang="less" scoped>
    .list-item-gray{
        color: #c0c4cc
    }
    .tab-box {
        width: 100%;
        border-bottom: 2px #e4e7ed solid;
        .tab-toolbar {
          li {
            position: relative;
            padding: 15px 0;
            &.active {
              &::before {
                content: '';
                display: block;
                width: 100%;
                height: 2px;
                background-color: #45DAD5;
                position: absolute;
                left: 0;
                bottom: -2px;
              }
              .title {
                color: #45DAD5;
              }
            }
            .title {
              padding: 0 20px;
              outline: none;
              .el-icon-arrow-down {
                -webkit-transition: transform 300ms;
                transition: transform 300ms;
              }
              &.dropshow {
                .el-icon-arrow-down {
                  -webkit-transform :rotate(180deg);
                  transform: rotate(180deg);
                }
              }
            }
          }
        }
        // width: 100%;
        // .tab-toolbar {
        //     /deep/ .el-tabs__header {
        //         margin: 0;
        //     }
        //     /deep/ .el-tabs__nav-wrap::after {content: none}
        // }
        // &::after {
        //     content: "";
        //     position: absolute;
        //     left: 0;
        //     bottom: -1px;
        //     width: 100%;
        //     height: 2px;
        //     background-color: #e4e7ed;
        //     z-index: 1;
        // }
    }
    .role-popver-box {
      .drop-item {
        padding: 0 40px 0 20px;
        &.active {
          color: #45DAD5;
        }
      }
    }
    .filter-box {
        width: 125px;
    }
    .operable-btn-box {
      span {
        &:not(:first-child) {
          margin-left: 10px;
        }
      }
    }
</style>


