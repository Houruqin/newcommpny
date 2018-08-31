<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <TableHeader title="未签约学员">
                <MyButton class="mr-20" @click.native="addStudent">登记学员</MyButton>
                <router-link :to="{path: '/student/importstudent'}"><MyButton icon="import" type="border" fontColor="fc-m">导入学员</MyButton></router-link>
            </TableHeader>

            <div class="header-tab-box d-f f-j-b mt-50">
                <Classify v-for="(tab, index) in tabLists" :key="index" :tab="tab" :active="activeTab == tab.type" @tabclick="tabClick(tab)"></Classify>
            </div>
            <div class="fifter-toolbar mt-30 d-f">
                <ul class="d-f flex1">
                    <li v-if="activeTab != 'no_advisor'">
                        <el-select size="small" placeholder="全部顾问" v-model="searchFilter.advisor_id" @change="searchHandle">
                            <el-option label="全部顾问" value=""></el-option>
                            <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </li>
                    <li>
                        <el-select size="small" placeholder="所有渠道" v-model="searchFilter.source_id" @change="searchHandle">
                            <el-option label="所有渠道" value=""></el-option>
                            <el-option v-for="(item, index) in $store.state.source" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </li>
                    <li v-if="activeTab != 'no_advisor' && activeTab != 'invalid'">
                        <el-select size="small" placeholder="全部跟进" v-model="searchFilter.follow_status" @change="searchHandle">
                            <el-option label="全部跟进" value=""></el-option>
                            <el-option v-for="(item, index) in followUp" :key="index" :label="item.name" :value="item.id" v-if="item.id != -1"></el-option>
                        </el-select>
                    </li>
                    <li class="name"><el-input size="small" placeholder="请输入学员姓名或手机号" v-model.trim="searchKeyWord"></el-input></li>
                    <li><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
                </ul>

                <MyButton icon="import" type="border" fontColor="fc-m" class="ml-20" @click.native="exportStudent">导出学员</MyButton>
            </div>

            <el-table class="student-table mt-20" :data="studentTable.data" v-loading="loading" stripe>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="姓名" align="center">
                    <template slot-scope="scope">
                        <router-link :to="{path: '/student/nosigndetail', query: {student_id: scope.row.id}}" class="fc-m">{{scope.row.name}}</router-link>
                    </template>
                </el-table-column>
                <el-table-column label="联系电话" prop="parent_info.mobile" align="center"></el-table-column>
                <el-table-column label="学员顾问" align="center">
                    <template slot-scope="scope">
                        <div v-if="scope.row.advisor_info">{{scope.row.advisor_info.name}}</div>
                        <div v-else-if="activeTab == 'unsign' || activeTab == 'no_advisor' || activeTab == 'following'" class="d-f f-a-c f-j-c">
                            <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                <span class="el-dropdown-link">
                                    <div class="allocation-advisor-btn" slot="reference" @click="listStudentId = scope.row.id">分配</div>
                                </span>
                                <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                    <el-scrollbar style="height: 100%;">
                                        <el-dropdown-item v-for="(item, index) in $store.state.advisor" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                    </el-scrollbar>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="最新跟进状态" prop="follow_cn" align="center">
                    <template slot-scope="scope">
                        <div class="d-f f-a-c f-j-c">
                            <span class="follow-status fs-12" :class="{'green': scope.row.follow_status === 2 || scope.row.follow_status === 3 || scope.row.follow_status === 4 || scope.row.follow_status === 5,
                            'red': scope.row.follow_status === 1 || scope.row.follow_status === 6, 'gray': scope.row.follow_status === 0 || scope.row.follow_status === -1}">
                                {{scope.row.follow_cn}}
                            </span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="渠道" prop="source_info.name" align="center"></el-table-column>
                <el-table-column label="学员录入时间" prop="created_at" :formatter="dateForamt" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <a class="cursor-pointer fc-m" @click="editStudent(scope.row)">编辑</a>
                        <a v-if="activeTab == 'invalid'" class="cursor-pointer fc-subm ml-20" @click="deleteStudent(scope.row.id)">删除</a>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination v-if="studentTable.total"
                class="d-f f-j-c mt-50 mb-50"
                :page-size="studentTable.per_page"
                background layout="total, prev, pager, next"
                :total="studentTable.total"
                :current-page="studentTable.current_page"
                @current-change="paginationClick"
                @next-click="nextClick"
                @prev-click="prevClick">
            </el-pagination>
        </el-card>

        <!-- 登记学员弹窗 -->
        <AddStudentDialog  :dialogStatus="dialogStatus.student" :editDetail="editDetail" :type="studentType"
            @CB-dialogStatus="CB_dialogStatus" @CB-buyCourse="CB_buyCourse" @CB-addStudent="CB_addStudent">
        </AddStudentDialog>

        <!-- 购买课程弹窗 -->
        <!-- <BuyCourseDialog :dialogStatus="dialogStatus.course" :buyCourseData="buyCourseData"
            @CB-contract="CB_contract">
        </BuyCourseDialog> -->

        <!-- 购课合约弹窗 -->
        <!-- <ContractDialog :dialogStatus="dialogStatus.contract" :contractData="contractData"></ContractDialog> -->
    </div>
</template>

<script>
import TableHeader  from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'
import Classify from '../../components/common/StudentClassify'

import AddStudentDialog from '../../components/dialog/AddStudent'
import BuyCourseDialog from '../../components/dialog/BuyCourse'
import ContractDialog from '../../components/dialog/Contract'

import {StudentStatic} from '../../script/static'
import Bus from '../../script/bus'
import qs from 'qs'
import config from 'config'

export default {
    data() {
        return {
            state: 'loading',
            activeTab: 'unsign',
            loading: true,
            tabLists: [],

            currPage: false,
            activePage: 1,

            listStudentId: '',

            headTab: ['意向学员', '未分配顾问学员', '跟进中学员', '无效学员'],
            studentTable: {},
            searchKeyWord: '',

            searchFilter: {type: 'unsign', name: '', mobile: '', advisor_id: '', source_id: '', follow_status: ''},  //搜索筛选条件
            followUp: StudentStatic.followUp.status,

            dialogStatus: {student: false, course: false, contract: false},
            studentType: '',

            // buyCourseData: {},
            editDetail: {},
            // contractData: {},   //合约数据

            studentLists: [],
            editStudentData: {},
            sourceRules: {
                name: [
                    {required: true, message: '请输入渠道'},
                    {max: 20, message: '长度不能超过20个字符'}
                ]
            },
            courseRules: {
                course_id: [
                    {required: true, message: '请选择课程', trigger: 'change'}
                ],
                lesson_num: [
                    {required: true, message: '请输入购买课时数'}
                ],
                given_num: [
                    {required: true, message: '请输入赠送课时数'}
                ],
                expire: [
                    {required: true, message: '请输入课程有效期'}
                ],
                pay_at: [
                    {required: true, message: '请选择购课日期', trigger: 'change'}
                ],
                pay_way: [
                    {required: true, message: '请选择付款方式', trigger: 'change'}
                ],
                preferential_price: [
                    {required: true, message: '请输入优惠金额'}
                ],
                unit_price: [
                    {required: true, message: '请输入课时单价'}
                ],
                explain: [
                    {max: 200,  message: '长度不能超过200个字符'}
                ]
            },
            pickerBeginDateAfter: {
                disabledDate: (time) => {
                    return time.getTime() > new Date().getTime();
                }
            }
        }
    },
    methods: {
        tabClick(tab) {
            if(tab.type == 'following' && this.followUp.length == 5) this.followUp.splice(0, 1);
            else if(tab.type == 'unsign' && this.followUp.length == 4) this.followUp.unshift({id: 0, name: '未跟进'});

            this.searchKeyWord = '';

            if(tab.type != this.activeTab) {
                this.loading = true;
                for(let key in this.searchFilter) this.searchFilter[key] = key == 'type' ? tab.type : '';
                this.activeTab = tab.type;
                this.getStudentLists();
            }
        },
        addStudent() {
            this.studentType = 'add';
            this.dialogStatus.student = true;
        },
        //导出学员
        async exportStudent() {
            if(this.searchKeyWord) {
                if(isNaN(this.searchKeyWord)) {
                    this.searchFilter.name = this.searchKeyWord;
                    this.searchFilter.mobile = '';
                }else {
                    this.searchFilter.mobile = this.searchKeyWord;
                    this.searchFilter.name = '';
                }
            }else {
                this.searchFilter.mobile = '';
                this.searchFilter.name = '';
            }

            let baseUrl = config.api;
            let token = this.$$cache.get('TOKEN') || this.$$cache.getSession('TOKEN') || '';
            let params = {data: this.searchFilter, token: token.replace('bearer ', '')};

            window.location.href = `${baseUrl}student/lists?${qs.stringify(params)}`;
        },
        //弹窗变比，改变dialog状态回调
        CB_dialogStatus(type) {
            if(type == 'student') {
                this.dialogStatus.student = false;
                this.editDetail = {};
                this.studentType = '';
                return 0;
            }
            if(type == 'course') return this.dialogStatus.course = false;
        },
        //登记成功，刷新列表
        CB_addStudent(type) {
            this.getAllLists(type == 'edit');
            this.dialogStatus.student = false;
        },
        //登记成功，购课回调
        CB_buyCourse(data) {
            let params = {
                student_id: data.id,
                advisor_id: data.advisor_id,
                advisor: data.advisor,
                parent_id: data.parent_id
            };

            this.$router.push({path: '/student/nosignbuycourse', query: {buyCourseData: JSON.stringify(params)}});
        },
        //单元格时间格式化
        dateForamt(row, column, cellValue) {
            return this.$$tools.format(cellValue)
        },
        //搜索
        searchHandle() {
            this.getStudentLists();
        },
        //列表顾问选择
        async listAdvisorChange(val) {
            let result = await this.$$request.post('/student/distribute', {student_id: this.listStudentId, advisor_id: val});
            console.log(result);
            if(!result) return 0;

            this.getAllLists(true);
        },
        //修改学员信息
        editStudent(data) {
            this.studentType = 'edit';
            this.editDetail = data;
            this.dialogStatus.student = true;
        },
        //删除学员
        deleteStudent(id) {
            this.$confirm('确定删除该学员吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteHandle(id);
            }).catch(() => {return 0});
        },
        async deleteHandle(id) {
            let result = await this.$$request.post('/student/delete', {id: id});
            if(!result) return 0;
            this.getAllLists();
            this.$message.success('已删除');
        },
        nextClick(currentPage) {
            this.currPage = true;
            this.getStudentLists(currentPage);
        },
        prevClick(currentPage) {
            this.currPage = true;
            this.getStudentLists(currentPage);
        },
        //分页
        paginationClick(currentPage) {
            if(!this.currPage) this.getStudentLists(currentPage);
            this.currPage = false;
        },
        async getAllLists(isCurrPage) {
            let [a, b] = await Promise.all([this.getTabLists(), this.getStudentLists(isCurrPage ? this.activePage : false)]);
            return a && b;
        },
        //获取tab列表
        async getTabLists(isCurrPage) {
            let result = await this.$$request.post('/student/tab');
            console.log(result);
            if(!result) return 0;
            this.tabLists = result.lists.map((v, index) => {v.name = this.headTab[index]; return v});
            return true;
        },
        //获取学员列表
        async getStudentLists(currentPage) {
            this.loading = true;
            if(this.searchKeyWord) {
                if(isNaN(this.searchKeyWord)) {
                    this.searchFilter.name = this.searchKeyWord;
                    this.searchFilter.mobile = '';
                }else {
                    this.searchFilter.mobile = this.searchKeyWord;
                    this.searchFilter.name = '';
                }
            }else {
                this.searchFilter.mobile = '';
                this.searchFilter.name = '';
            }
            let params = {data: this.searchFilter};
            if(currentPage) params.page = currentPage;
            console.log(params);

            let result = await this.$$request.post('/student/lists', params);
            console.log(result);
            if(!result) return 0;

            this.activePage = currentPage ? currentPage: 1;
            this.studentTable = result.lists;
            this.loading = false;
            return true;
        }
    },
    async created() {
        let datas = await this.getAllLists();
        if(datas) this.state = 'loaded';
    },
    beforeRouteEnter(to, from, next) {
        //判断如果是未签约详情过来，那么就不用刷新，直接取缓存即可，否则其他页面过来的，都需要刷新整个页面
        if(from.name == 'nosignDetail') to.meta.keepAlive = true;
        else to.meta.keepAlive = false;
        next();   //来到页面，包括通过返回
    },
    beforeRouteLeave(to, from, next) {
        next();   //离开页面时，做判断
    },
    components: {Classify, MyButton, TableHeader, AddStudentDialog, BuyCourseDialog, ContractDialog}
}
</script>

<style lang="less" scoped>
    .header-tab-box {
        padding: 0 100px;
    }
    .fifter-toolbar {
        ul li {
            margin-right: 20px;
            &:not(:last-child) {
                width: 105px;
            }
            &.name {
                width: auto;
            }
        }
    }
    .student-table {
        border-top: 1px #e3e3e3 solid;
        .follow-status {
            width: 65px;
            text-align: center;
            height: 24px;
            line-height: 24px;
            border-radius: 5px;
            &.red {
                background-color: #FFF0EA;
                color: #aa4e2a;
            }
            &.green {
                background-color: #E4F3E8;
                color: #347924;
            }
            &.gray {
                background-color: #EDEDED;
                color: #555555;
            }
        }
        .allocation-advisor-btn {
            width: 50px;
            line-height: 22px;
            border: 1px #45DAD5 solid;
            border-radius: 3px;
            text-align: center;
            color: #45DAD5;
            cursor: pointer;
        }
    }
    .form-box {
        padding: 0 20px;
        .el-select, .el-date-editor {
            width: 100%;
        }
        h3 {
            font-weight: normal;
            font-size: 14px;
            padding-left: 38px;
            margin-bottom: 15px;
        }
        .add-source {
            img {
                position: relative;
                top: 3px;
            }
        }
    }
    .contract-box {
        padding: 0 30px;
        p {
            &:not(:first-child) {
                margin-top: 10px;
            }
            span {
                margin-right: 30px;
            }
        }
        .course-table {
            border-collapse: collapse;
            margin-top: 10px;
            td {
                border: 1px #BFBFBF solid;
                width: 120px;
                text-align: center;
                line-height: 40px;
            }
        }
    }
</style>


