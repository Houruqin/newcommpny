<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="员工管理">
                <MyButton @click.native="addUser">添加员工</MyButton>
            </TableHeader>
            <div class="p-r">
                <el-tabs v-model="staffType" @tab-click="tabClick">
                    <el-tab-pane label="全部" name="all"></el-tab-pane>
                    <el-tab-pane v-for="(item, index) in roleLists" :key="index" :label="item.display_name" :name="item.name"></el-tab-pane>
                </el-tabs>
                <el-select v-model="filterVal" placeholder="请选择" class="p-a filter-box" @change="filterChange">
                    <el-option label="全部" value=""></el-option>
                    <el-option label="在职" :value="1"></el-option>
                    <el-option label="离职" :value="0"></el-option>
                </el-select>
            </div>
            <el-table :data="staffListInfo.data" stripe v-loading="loading">
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="姓名" align="center">
                    <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.name}}</span></template>
                </el-table-column>
                <el-table-column label="手机号" align="center">
                    <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.mobile}}</span></template>
                </el-table-column>
                <el-table-column label="职位" align="center">
                    <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.type_cn}}</span></template>
                </el-table-column>
                <el-table-column label="职位性质" align="center">
                    <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.kind == 1 ? '全职 ' : '兼职'}}</span></template>
                </el-table-column>
                <el-table-column prop="status" label="全部状态" align="center">
                    <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.status == 1 ? '在职' : '离职'}}</span></template>
                </el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <div v-if="scope.row.type_en !== 'master'">
                            <a class="cursor-pointer fc-m" v-if="scope.row.status" @click="modifyHandle(scope.row)">编辑</a>
                            <a class="cursor-pointer fc-subm" v-else @click="deleteUserInfo(scope.row)">删除</a>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination v-if="staffListInfo.total"
                class="d-f f-j-c mt-50 mb-50" 
                :page-size="staffListInfo.per_page" 
                background layout="total, prev, pager, next" 
                :total="staffListInfo.total" 
                :current-page="staffListInfo.current_page"
                @current-change="paginationClick"
                @next-click="nextClick"
                @prev-click="prevClick">
            </el-pagination>
        </el-card>


        <el-dialog :title="maskTitle[type]" width="800px" center :visible.sync="maskStatus" :close-on-click-modal="false" @close="formClose">
            <el-form :model="form" label-width="100px" :rules="rules" ref="userForm" size="small">
                <div class="form-box">
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="姓名：" prop="name" :validate-on-rule-change="false">
                                <el-input v-model.trim="form.name" placeholder="姓名"></el-input>
                            </el-form-item>
                            <el-form-item label="职务：" prop="role_type"  class="mt-30">
                                <el-select v-model="form.role_type" placeholder="选择职务名称" @change="roleChange">
                                    <el-option v-for="(item, index) in roleLists" v-if="item.name !== 'master'" :key="index" :label="item.display_name" :value="item.name"></el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="职位性质：" prop="kind"  class="mt-30">
                                <el-select v-model="form.kind" placeholder="选择职位性质">
                                    <el-option label="全职" :value="1"></el-option>
                                    <el-option label="兼职" :value="2"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11" :offset="1">
                            <el-form-item label="电话：" prop="mobile">
                                <el-input v-model.number="form.mobile" placeholder="电话"></el-input>
                            </el-form-item>
                            <el-form-item label="入职时间：" prop="entry_date"  class="mt-30">
                                <el-date-picker
                                    v-model="form.entry_date"
                                    type="date"
                                    :editable="false"
                                    placeholder="选择日期"
                                    value-format="timestamp">
                                </el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <!-- <el-form-item label="权限分配：" class="mt-10">
                        <el-checkbox v-model="authorityAll" @change="authorityCheckAllChange">全选</el-checkbox>
                        <el-checkbox-group v-model="authorityCheckList" @change="authorityCheckChange">
                            <el-checkbox v-for="(item, index) in authorityAllLists" :label="item" :key="index">{{item.name}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item> -->
                </div>
            </el-form>
            <div class="mt-50 d-f f-j-c">
                <MyButton @click.native="doneHandle">确定</MyButton>
                <MyButton v-if="type == 'modify'" @click.native="dimissionClick" type="gray" class="ml-20">离职</MyButton>
            </div>
        </el-dialog>
    </div>
</template>

<script>

import TableHeader from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'

export default {
    data() {
        return {
            staffType: 'all',
            staffListInfo: {},
            filterVal: '',
            maskStatus: false,
            loading: true,
            maskTitle: {add: '添加员工', modify: '修改员工'},
            type: 'modify',
            currPage: false,
            //职务列表
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
            authorityCheckList: [],   //选中的权限列表
            form: {role_id: '', name: '', mobile: '', role_type: '', entry_date: '', authority: '', user_id: '', kind: ''},
            rules: {
                name: [
                    {required: true, message: '请输入员工姓名'},
                    {max: 7, message: '长度不能超过7个字符'}
                ],
                mobile: [
                    {required: true, message: '请输入员工电话'},
                    {validator: this.$$tools.formValidate('phone')}
                ],
                role_type: [
                    {required: true, message: '请选择职务', trigger: 'change'}
                ],
                entry_date: [
                    {required: true, message: '请选择入职时间', trigger: 'change'}
                ],
                kind: [
                    {required: true, message: '请选择职位性质', trigger: 'change'}
                ]
                // authority: [
                //     { required: true, message: '请选择权限', trigger: 'none' }
                // ]
            }
        }
    },
    methods: {
        addUser() {
            this.type = 'add';
            for(let key in this.form) {this.form[key] = ''};
            this.maskStatus = true;
        },
        //员工状态筛选
        filterChange() {
            this.getUserLists();
        },
        //新增，选择角色
        roleChange(val) {
            this.roleLists.forEach(v => {if(v.name === val) this.form.role_id = v.id});
        },
        tabClick(tab, event) {
            this.getUserLists();
        },
        formClose() {
            this.$refs.userForm.resetFields();
            this.authorityCheckList = [];
            this.authorityAll = false;
        },
        nextClick(currentPage) {
            this.currPage = true;
            this.getUserLists(currentPage);
        },
        prevClick(currentPage) {
            this.currPage = true;
            this.getUserLists(currentPage);
        },
        //分页
        paginationClick(currentPage) {
            if(!this.currPage) this.getUserLists(currentPage);
            this.currPage = false;
        },
        //权限check全选
        authorityCheckAllChange(val) {
            this.authorityCheckList = val ? this.authorityAllLists : [];
        },
        //权限check勾选
        authorityCheckChange(val) {
            let checkedCount = val.length;
            this.authorityAll = checkedCount === this.authorityAllLists.length;
        },
        //修改
        modifyHandle(scope) {
            console.log(scope)
            this.type = 'modify';

            for(var key in scope) {
                if(key == 'mobile') this.form.mobile = scope.mobile;
                if(key == 'name') this.form.name = scope.name;
                if(key == 'type_en') {
                    this.form.role_type = scope.type_en;
                    this.roleLists.forEach(v => {if(v.name === scope.type_en) this.form.role_id = v.id});
                }
                if(key == 'entry_at') this.form.entry_date = scope.entry_at * 1000;
                if(key == 'id') this.form.user_id = scope.id;
                if(key == 'kind') this.form.kind = scope.kind;
            }
            this.maskStatus = true;
        },
        //确定
        doneHandle() {
            this.$refs.userForm.validate(valid => {if(valid) this.submitUserInfo()});
        },
        //离职
        async dimissionClick() {
            console.log(this.form);

            this.$confirm('员工离职后，数据将无法恢复，您确定要办理离职吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.dimissionHandle(this.form.user_id);
            }).catch(() => {return 0});
        },
        async dimissionHandle(user_id) {
            let result = await this.$$request.post('api/user/changeStatus', {id: user_id});
            console.log(result);
            if(!result) return 0;
            this.getUserLists();
            this.$store.dispatch('getAdvisor');   //更新员工顾问信息
            this.$message.success('已修改为离职状态');
            this.maskStatus = false;
        },
        //提交新增、修改员工信息
        async submitUserInfo() {
            let url = this.type == 'add' ? 'api/user/add' : 'api/user/edit';
            let params = {
                name: this.form.name,
                mobile: this.form.mobile,
                type: this.form.role_type,
                role_id: this.form.role_id,
                entry_at: this.form.entry_date ?  this.form.entry_date / 1000 : '',
                kind: this.form.kind
            };

            if(this.type == 'modify') params.id = this.form.user_id;

            console.log(params)
            let result = await this.$$request.post(url, params);
            console.log(result);

            if(!result) return 0;
            this.getUserLists();
            this.$store.dispatch('getAdvisor');   //更新员工顾问信息
            this.$message.success(this.type == 'modify' ? '修改成功' : '添加成功');
            this.maskStatus = false;
        },
        //删除用户
        deleteUserInfo(scope) {
            this.$confirm('确定删除该员工吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteHandle(scope);
            }).catch(() => {return 0});
        },
        async deleteHandle(scope) {
            let result = await this.$$request.post('api/user/delete', {id: scope.id});
            console.log(result);

            if(!result) return 0;
            this.getUserLists();
            this.$message.success('已删除');
        },
        //用户列表
        async getUserLists(currentPage) {
            this.loading = true;
            let params = {type: this.staffType};
            if(currentPage) params.page = currentPage;
            if(this.filterVal === 0 || this.filterVal === 1) params.status = this.filterVal;
            console.log(params)
            let result = await this.$$request.get('api/user/lists', params);
            console.log(result);

            if(!result) return 0;
            this.staffListInfo = result.lists;
            this.loading = false;
        },
        //角色列表
        async getRoleLists() {
            let result = await this.$$request.post('api/permission/roleLists');
            console.log(result);

            if(!result) return 0;
            this.roleLists = result.lists;
        },
        //权限列表
        async getAuthorityLists() {
            let result = await this.$$request.post('api/permission/lists');
            console.log(result);

            if(!result) return 0;
            this.authorityAllLists = result.lists;
        }
    },
    created() {
        this.getRoleLists();
        this.getUserLists();
    },
    components: {TableHeader, MyButton}
}
</script>

<style lang="less" scoped>
    .list-item-gray{
        color: #c0c4cc
    }
    .form-box {
        padding: 0 30px;
        .el-select, .el-date-editor {
            width: 100%;
        }
    }
</style>


