<template>
    <div class="flex1">
        <el-card shadow="hover">
            <div class="d-f ml-20 mt-40 mb-20">
                <div class="">
                    <img src="../../images/staff/teacher.png" alt="">
                    <div class="d-f f-a-c f-j-c cursor-pointer">
                        <span class="pr-10">{{userDetail.name}}</span>
                        <img src="../../images/common/edit-icon.png" @click="editDetail">
                    </div>
                </div>
                <div class="ml-40 fc-7">
                    <p class="mt-3">职位：<span>教务</span></p>
                    <p class="mt-10">联系电话：<span>{{userDetail.mobile}}</span></p>
                    <p class="mt-10">入职时间：<span>{{$$tools.format(userDetail.created_at)}}</span></p>
                </div>
            </div>
        </el-card>

        <el-card>
            <TableHeader title="员工数据"></TableHeader>
            <el-tabs v-model="activeTab" @tab-click="tabClick" class="tab-toolbar">
                <el-tab-pane label="跟进名单" name="followUp"></el-tab-pane>
                <el-tab-pane label="签约学员" name="student"></el-tab-pane>
                <el-tab-pane label="任课班级" name="grade"></el-tab-pane>
            </el-tabs>
            <div>
                <!-- 跟进名单 -->
                <el-table :data="bottomLists.data" stripe v-loading="loading" v-if="activeTab === 'followUp'">
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope"><span>{{scope.row.name}}</span></template>
                    </el-table-column>
                    <el-table-column label="联系电话" align="center" prop="mobile"></el-table-column>
                    <el-table-column label="跟进状态" align="center">
                        <template slot-scope="scope"><span>{{scope.row.name}}</span></template>
                    </el-table-column>
                    <el-table-column label="最后跟进日期" align="center">
                        <template slot-scope="scope"><span>{{$$tools.format(scope.row.followup_at)}}</span></template>
                    </el-table-column>
                    <el-table-column label="签约人" align="center">
                        <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.name}}</span></template>
                    </el-table-column>
                </el-table>
                <!-- 签约学员列表 -->
                <el-table :data="bottomLists.data" stripe v-loading="loading" v-if="activeTab === 'student'">
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope"><span>{{scope.row.student_name}}</span></template>
                    </el-table-column>
                    <el-table-column label="联系电话" align="center" prop="mobile"></el-table-column>
                    <el-table-column label="购买课程" align="center" prop="course_name"></el-table-column>
                    <el-table-column label="购买性质" align="center">
                        <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.name}}</span></template>
                    </el-table-column>
                    <el-table-column label="购买日期" align="center">
                        <template slot-scope="scope"><span>{{$tools.format(scope.row.created_at)}}</span></template>
                    </el-table-column>
                    <el-table-column label="签约人" align="center" prop="user_name"></el-table-column>
                </el-table>
                <!-- 任课班级列表 -->
                <el-table :data="bottomLists.data" stripe v-loading="loading" v-if="activeTab === 'grade'">
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="课程名称" align="center">
                        <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.name}}</span></template>
                    </el-table-column>
                    <el-table-column label="班级" align="center">
                        <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.name}}</span></template>
                    </el-table-column>
                    <el-table-column label="任课老师" align="center">
                        <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.name}}</span></template>
                    </el-table-column>
                    <el-table-column label="上课人数" align="center">
                        <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.name}}</span></template>
                    </el-table-column>
                    <el-table-column label="开课日期" align="center">
                        <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.name}}</span></template>
                    </el-table-column>
                    <el-table-column label="班级状态" align="center">
                        <template slot-scope="scope"><span :class="{'list-item-gray': !scope.row.status}">{{scope.row.name}}</span></template>
                    </el-table-column>
                </el-table>

                <el-pagination v-if="bottomLists.total"
                    class="d-f f-j-c mt-50 mb-50" 
                    :page-size="bottomLists.per_page" 
                    background layout="total, prev, pager, next" 
                    :total="bottomLists.total" 
                    :current-page="bottomLists.current_page"
                    @current-change="paginationClick">
                </el-pagination>
            </div>
        </el-card>
    </div>
</template>


<script>

import TableHeader  from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'

export default {
    components: {TableHeader, MyButton},
    data() {
        return {
            loading: false,
            userId: '',
            userDetail: {},
            activeTab: 'followUp',
            bottomLists: {}
        }
    },
    methods: {
        editDetail() {

        },
        tabClick() {
            this.getBottomLists();
        },
        paginationClick(curr_page) {
            this.getBottomLists(curr_page);
        },
        async getBottomLists(curr_page) {
            let key = this.activeTab == 'followUp' ? 'followRoster' : this.activeTab == 'student' ? 'signRoster' : 'grade';
            let params = {user_id: this.userId};

            if(curr_page) params.page = curr_page;
            let result = await this.$$request.get(`api/user/${key}`, params);

            console.log(result);
            if(!result) return 0;
            this.bottomLists = result.lists;
        },
        async getDetail() {
            let result = await this.$$request.get('api/user/detail', {user_id: this.userId});
            console.log(result);
            if(!result) return 0;
            this.userDetail = result.user;

            this.getBottomLists();
        }
    },
    created() {
        if(this.$route.query.user_id) this.userId = this.$route.query.user_id;
        this.getDetail();
    }
}
</script>

