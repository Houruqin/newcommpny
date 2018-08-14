<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="班级详情"></TableHeader>

            <h3 class="fs-18 fc-2 f-w-n mt-20 mb-10">{{gradeDetail.name}}</h3>
            <div class="d-f detail-header-box">
                <div>
                    <p>课　　程：<i>{{gradeDetail.course && gradeDetail.course.name}}</i></p>
                    <p v-if="gradeDetail.course.type !== 2">课　　时：<i>{{gradeDetail.lesson_num}}</i></p>
                    <p>任课老师：<i v-for="(teacher, index) in gradeDetail.teacher_lists" :key="index" class="mr-10">{{teacher.name}}</i></p>
                    <p>开课日期：<i>{{$$tools.format(gradeDetail.start_time)}}</i></p>
                    <p>可否试听：<i>{{gradeDetail.is_listen ? '是' : '否'}}</i></p>
                </div>
                <div class="ml-100 flex1">
                    <p v-if="gradeDetail.course.type !== 2">人数上限：<i>{{gradeDetail.limit_num}}</i></p>
                    <p v-if="gradeDetail.course.type !== 2">剩余课时：<i>{{gradeDetail.lesson_num_remain}}</i></p>
                    <p v-if="gradeDetail.course.type !== 2">辅助老师：<i v-for="(teacher, index) in gradeDetail.counselor_lists" :key="index">{{teacher.name}}</i></p>
                    <p>上课教室：<i>{{getRoomName()}}</i></p>
                    <p class="d-f">
                        <span>班级学员：</span>
                        <span class="flex1">
                            <i v-for="(student, index) in gradeDetail.student" :key="index" class="mr-10 mb-10">{{student.name}}</i>
                        </span>
                    </p>
                </div>
            </div>
        </el-card>

        <el-card shadow="hover" class="mt-20">
            <TableHeader title="班级课表">
                <div class="delete-btn fc-f t-a-c cursor-pointer" v-if="timetableCheckbox" @click="deleteTimeTable" :class="{'btn-subm': deleteTimeTableLists.length}">删除</div>
                <div class="edit-btn fc-m t-a-c ml-10 cursor-pointer" @click="timetableEdit">{{timetableCheckbox ? '取消' : '编辑'}}</div>
            </TableHeader>

            <el-table :data="timeTableLists.data" strip ref="timetable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" :selectable="checkboxIsDisabled" width="30" v-if="timetableCheckbox"></el-table-column>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="上课日期" align="center">
                    <template slot-scope="item">{{$$tools.courseTime(item.row.begin_time, item.row.end_time)}}</template>
                </el-table-column>
                <el-table-column label="上课时间" align="center">
                    <template slot-scope="item">{{$$tools.courseTime(item.row.begin_time, item.row.end_time, 'time')}}</template>
                </el-table-column>
                <el-table-column label="上课老师" align="center">
                    <template slot-scope="item">
                        <span v-if="item.row.teacher.length">
                            <i v-for="(teacher, index) in item.row.teacher" :key="index"><i v-if="index > 0">/</i>{{teacher.name}}</i>
                        </span>
                    </template>
                </el-table-column>
                <el-table-column label="上课学员" align="center" prop="students"></el-table-column>
                <el-table-column label="上课状态" align="center">
                    <template slot-scope="item">{{item.row.lesson_end_time ? '已结课' : '未结课'}}</template>
                </el-table-column>
            </el-table>

            <el-pagination v-if="timeTableLists.total"
                class="d-f f-j-c mt-50 mb-50" 
                :page-size="timeTableLists.per_page" 
                background layout="total, prev, pager, next" 
                :total="timeTableLists.total" 
                :current-page="timeTableLists.current_page" 
                @current-change="paginationClick">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>

import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';

export default {
    components: {TableHeader, MyButton},
    data() {
        return {
            gradeId: 167,
            gradeDetail: {},
            timeTableLists: [],

            deleteTimeTableLists: [],    //删除课表，选中的课表
            timetableCheckbox: false,    //班级详情删除课表，checkbox是否显示
        }
    },
    methods: {
        getRoomName() {
            let room_name;
            this.$store.state.classRoom.forEach(v => {
                if(this.gradeDetail.room_id == v.id) room_name = v.name; 
            });
            return room_name;
        },
        paginationClick(curr) {
            this.getTimeTableLists(curr);
        },
        checkboxIsDisabled(row, index) {
            return row.begin_time > new Date().getTime() / 1000;
        },
        handleSelectionChange(val) {
            this.deleteTimeTableLists = val;
        },
        async deleteTimeTable() {
            if(!this.deleteTimeTableLists.length) return this.$message.warning('请选择数据!');
            let timetableLists = this.deleteTimeTableLists.map(v => {return v.id});

            let result = await this.$$request.post('api/timetable/deleteAll', {id: timetableLists});
            console.log(result);
            if(!result) return 0;
    
            if(result.status == 1) {
                this.$message.success('删除成功');
                this.getTimeTableLists();
                this.timetableCheckbox = false;
                this.deleteTimeTableLists = [];
            }else {
                this.$message.warning('删除失败');
            }
        },
        timetableEdit() {
            this.timetableCheckbox = !this.timetableCheckbox;
            if(!this.timetableCheckbox) this.$refs.timetable.clearSelection();
        },
        async getGradeDetail() {
            let result = await this.$$request.get('api/grade/detail', {grade_id: this.gradeId});
            console.log(result);

            if(!result) return 0;
            this.gradeDetail = result.grade;
            this.getTimeTableLists();
        },
        async getTimeTableLists(curr_page) {
            let params = {grade_id: this.gradeId};
            if(curr_page) params.page = curr_page;

            let result = await this.$$request.get('api/grade/timetableList', params);
            console.log(result);

            if(!result) return 0;
            this.timeTableLists = result.timetable;
        }
    },
    created() {
        if(this.$route.query.grade_id) this.gradeId = this.$route.query.grade_id;
        this.getGradeDetail();
    }
}
</script>

<style lang="less" scoped>
    .detail-header-box {
        p {
            color: #999;
            margin-top: 15px;
            i {
                color: #222;
            }
        }
    }
    .delete-btn {
        width: 70px;
        height: 35px;
        line-height: 35px;
        background-color: #D6D6D6;
        border-radius: 5px;
    }
    .edit-btn {
        width: 70px;
        height: 35px;
        box-sizing: border-box;
        border: 1px #45DAD5 solid;
        line-height: 35px;
        border-radius: 5px;
    }
</style>


