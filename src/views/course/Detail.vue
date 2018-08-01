<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="班级详情"></TableHeader>

            <h3 class="fs-18 fc-2 f-w-n mt-20 mb-10">{{gradeDetail.name}}</h3>
            <div class="d-f detail-header-box">
                <div>
                    <p>课　　程：<i>{{gradeDetail.course_name}}</i></p>
                    <p>课　　时：<i>{{gradeDetail.lesson_num}}</i></p>
                    <p>任课老师：<i v-for="(teacher, index) in gradeDetail.teacher_lists" :key="index" class="mr-10">{{teacher.name}}</i></p>
                    <p>开课日期：<i>{{$$tools.format(gradeDetail.start_time)}}</i></p>
                    <p>可否试听：<i>{{gradeDetail.is_listen ? '是' : '否'}}</i></p>
                </div>
                <div class="ml-100">
                    <p>人数上限：<i>{{gradeDetail.limit_num}}</i></p>
                    <p>剩余课时：<i>{{gradeDetail.lesson_num_remain}}</i></p>
                    <p>辅导老师：<i v-for="(teacher, index) in gradeDetail.counselor_lists" :key="index">{{teacher.name}}</i></p>
                    <p>上课教室：<i>{{getRoomName()}}</i></p>
                    <p>
                        <span>班级学员：</span>
                        <span>
                            <i v-for="(student, index) in gradeDetail.student" :key="index" class="mr-10">{{student.name}}</i>
                        </span>
                    </p>
                </div>
            </div>
        </el-card>

        <el-card shadow="hover" class="mt-20">
            <TableHeader title="班级课表"></TableHeader>
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
            gradeDetail: {}
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
        async getGradeDetail() {
            let result = await this.$$request.get('api/grade/detail', {grade_id: this.gradeId});
            console.log(result);

            if(!result) return 0;
            this.gradeDetail = result.grade;
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
</style>


