<template>
     <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="无班课管理">
                <MyButton @click.native="addCourse" class="ml-20">添加课程</MyButton>
            </TableHeader>

            <div class="course-list-box mt-20" v-for="(course, index) in courseLists" :key="index">
                <div class="list-header cursor-pointer d-f p-r f-a-c f-j-b pl-20 pr-20" @click.stop.self.prevent="listHeaderClick(course, index)">
                    <div class="d-f f-a-c">
                        <span class="fc-7 fs-16 d-f f-a-c">
                            <i class="fc-5">{{course.name}}</i>
                            <i class="iconfont icon-bianji ml-10" @click="editCourse(course)"></i>
                        </span>
                        <span class="fc-9 course_type ml-20 fs-12">{{course.type === 1 ? '普通' : '一对一'}}</span>
                    </div>
                    <div class="d-f f-a-c">
                        <span class="fc-9 ml-20 zhankai-icon" :class="{'rotate': course.collapse}" @click="listHeaderClick(course, index)">
                            <i class="iconfont icon-zhankai"></i>
                        </span>
                    </div>
                </div>
                <div class="grade-table-box" :ref="'grade-table-content_' + index">
                    <el-table :data="course.student_course" v-if="course.student_course.length" strip>
                        <el-table-column label="序号" type="index" align="center"></el-table-column>
                        <el-table-column label="学员姓名" align="center">
                            <template slot-scope="scope">
                                <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}" class="fc-m">{{scope.row.student.name}}</router-link>
                            </template>
                        </el-table-column>
                        <el-table-column label="任课老师" prop="teacher.name" align="center"> </el-table-column>
                        <el-table-column label="课时总课程" prop="total_num" align="center"></el-table-column>
                        <el-table-column label="未排课时" prop="no_rank_num" align="center"></el-table-column>
                        <el-table-column label="剩余课时" prop="lesson_num_remain" align="center"></el-table-column>
                        <el-table-column label="操作" align="center">
                            <template slot-scope="scope">
                                <a class="fc-subm cursor-pointer">编辑</a>
                                <a class="fc-m ml-10 cursor-pointer" @click="planTimeTable">排课</a>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </el-card>

        <!-- 添加、修改课程弹窗 -->
        <AddCourseDialog :dialogStatus="dialogStatus.course" :type="courseOperate" :editDetail="editDetail" :courseMode="1"
            @CB-dialogStatus="CB_dialogStatus" @CB-addCourse="CB_addCourse">
        </AddCourseDialog>

        <!-- <el-dialog title="一对一排课" width="900px" center :visible.sync="dialogStatus.timetable" :close-on-click-modal="false" @close="dialogClose('addTimeTable')">
            <div class="form-box" id="form-box" v-if="Object.keys(timetableFull).length">
                <el-row>
                    <el-col :span="11">

                    </el-col>
                </el-row>
            </div>
        </el-dialog> -->
     </div>
</template>

<script>

import TableHeader from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'
import AddCourseDialog from '../../components/dialog/AddCourse'

export default {
    components: {TableHeader, MyButton, AddCourseDialog},
    data() {
        return {
            courseOperate: '',
            courseLists: [],
            editDetail: {},
            dialogStatus: {
                course: false,
            }
        }
    },
    methods: {
        //弹窗变比，改变dialog状态回调
        CB_dialogStatus(type) {
            if(type == 'add_course')  {
                this.editDetail = {};
                this.dialogStatus.course = false;
                this.courseOperate = '';
            }
        },
        CB_addCourse() {
            this.getCourseLists();
            this.dialogStatus.course = false;
        },
        //新增课程
        addCourse() {
            this.courseOperate = 'add';
            this.dialogStatus.course = true;
        },
        //编辑课程
        editCourse(course) {
            this.courseOperate = 'edit';
            this.editDetail = course;
            this.dialogStatus.course = true;
        },
        //排课
        planTimeTable() {

        },
        //获取课程列表
        async getCourseLists(course_id) {
            let active = '';

            let result = await this.$$request.post('api/course/orderLists');
            console.log(result);
            if(!result) return 0;

            result.lists.forEach((d, num) => {d.collapse = false});

            this.courseLists = result.lists;

            this.$nextTick(v => {
                if(active !== '') {
                    let dom = this.$refs['grade-table-content_' + active][0];
                    let child = dom.firstChild;
                    dom.style.height = `${child.offsetHeight}px`;
                }
            });
        },
        listHeaderClick(course, index) {
            let dom = this.$refs['grade-table-content_' + index][0];
            let child = dom.firstChild;

            if(!course.collapse) {
                dom.style.height = `${child.offsetHeight}px`;
                course.collapse = true;
            }else {
                dom.style.height = 0;
                course.collapse = false;
            }
        }
    },
    created() {
        this.getCourseLists();
    }
}
</script>

<style lang="less" scoped>
    .course-list-box {
        .list-header {
            background-color: #EEEEEE;
            height: 50px;
            span {
                img {
                    display: block;
                }
            }
            .zhankai-icon {
                -webkit-transition: transform 300ms;
                transition: transform 300ms;
                &.rotate {
                    -webkit-transform :rotate(180deg);
                    transform: rotate(180deg);
                }
            }
        }
        .grade-table-box {
            height: 0;
            position: relative;  
            overflow: hidden;
            -webkit-transition:  height 500ms;
            transition:  height 500ms;
        }
        .el-table {
            border-left: 1px #eeeeee solid;
            border-right: 1px #eeeeee solid;
        }
        .course_type{
            display: inline-block;
            border: 1px solid #a9a9a9;
            height: 20px;
            line-height: 20px;
            padding: 0 5px;
            border-radius: 4px;
        }
    }
</style>

