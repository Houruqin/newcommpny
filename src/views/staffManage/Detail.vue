<template>
    <div class="flex1">
        <el-card shadow="hover">
            <div class="d-f">
                <div>
                    <span></span>
                    <div class="ml-10 d-f f-a-c f-j-c cursor-pointer" @click="editDetail">
                        <span></span>
                        <img src="../../images/common/edit-icon.png">
                    </div>
                </div>
                <div class="ml-100">
                    <p>职位：<span>教务</span></p>
                    <p>联系电话：<span></span></p>
                    <p>入职时间：<span></span></p>
                </div>
            </div>
        </el-card>

        <el-card>
            <TableHeader title="员工数据"></TableHeader>
            <el-tabs v-model="staffType" @tab-click="tabClick" class="tab-toolbar">
                <el-tab-pane label="跟进名单" name="followUp"></el-tab-pane>
                <el-tab-pane label="签约学员" name="student"></el-tab-pane>
                <el-tab-pane label="任课班级" name="grade"></el-tab-pane>
            </el-tabs>
            <div>
                <el-table :data="staffListInfo.data" stripe v-loading="loading">
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
            
        }
    }
}
</script>

