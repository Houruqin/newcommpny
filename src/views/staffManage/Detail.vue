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
                <el-table :data="followUpLists" stripe v-loading="loading" v-if="activeTab === 'followUp'">
                </el-table>
                <!-- 签约学员列表 -->
                <el-table :data="studentLists" stripe v-loading="loading" v-if="activeTab === 'student'">
                </el-table>
                <!-- 任课班级列表 -->
                <el-table :data="gradeLists" stripe v-loading="loading" v-if="activeTab === 'grade'">
                </el-table>
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
            followUpLists: [],
            studentLists: [],
            gradeLists: []
        }
    },
    methods: {
        editDetail() {

        },
        tabClick() {

        },
        getFollowUpLists() {

        },
        getStudentLists() {

        },
        getGradeLists() {
            
        },
        async getDetail() {
            let result = await this.$$request.get('api/user/detail', {user_id: this.userId});
            console.log(result);
            if(!result) return 0;

            this.userDetail = result.user;
        }
    },
    created() {
        if(this.$route.query.user_id) this.userId = this.$route.query.user_id;
        this.getDetail();
    }
}
</script>

