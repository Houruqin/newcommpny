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
                                <a class="fc-subm cursor-pointer" @click="editTeacher(scope.row)">编辑</a>
                                <a class="fc-m ml-10 cursor-pointer" @click="planTimeTable(course, scope.row)">排课</a>
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


        <!-- 编辑，修改老师弹窗 -->
        <el-dialog title="编辑" width="500" center :visible.sync="dialogStatus.edit" :close-on-click-modal="false">
            <div class="form-box">
                <el-form :model="teacherForm" label-width="100px" size="small" :rules="teacherRules" ref="teacherForm">
                    <el-form-item prop="techer_id" label="选择老师">
                        <el-select v-model="teacherForm.techer_id" placeholder="请选择">
                            <el-option v-for="(teacher, index) in editTeacherLists" :key="index" :label="teacher.name" :value="teacher.id"></el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
                
                <div class="d-f f-j-c mt-40"><MyButton @click.native="editTeacherDone" :loading="submitLoading.edit">确定</MyButton></div>
            </div>
        </el-dialog>

        <!-- 排课弹窗 -->
        <el-dialog title="快速排课" width="800px" center :visible.sync="dialogStatus.timetable" :close-on-click-modal="false" @close="dialogClose('addTimeTable')">
            <div class="form-box">
                <el-form :model="timetableForm" label-width="100px" size="small" :rules="timetableRules" ref="timetableForm">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item label="排课课程：">{{timetableForm.course_name}}</el-form-item>

                            <el-form-item label="上课教室：" prop="room_id">
                                <el-select placeholder="请选择"  v-model="timetableForm.room_id">
                                    <el-option v-for="(item, index) in $store.state.classRoom" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>

                            <div class="d-f">
                                <el-form-item label="上课时间：" prop="begin_day" class="begin-day-form">
                                    <el-date-picker v-model="timetableForm.begin_day"
                                        :picker-options="pickerBeginDateAfter" type="date" :editable="false" 
                                        placeholder="选择日期" value-format="yyyy/MM/dd">
                                    </el-date-picker>
                                </el-form-item>

                                <el-form-item  label-width="0" prop="begin_time" class="begin-day-time ml-10">
                                    <el-time-select 
                                        :editable="false" v-model="timetableForm.begin_time" 
                                        :picker-options="timePicker" placeholder="时间">
                                    </el-time-select>
                                </el-form-item>
                            </div>
                        </el-col>

                        <el-col :span="12">
                            <el-form-item label="上课老师：">{{timetableForm.teacher_name}}</el-form-item>

                            <el-form-item label="上课学员：">{{timetableForm.student_name}}</el-form-item>

                            <el-form-item label="扣课时数：" prop="lesson_num">
                                <el-input-number v-model="timetableForm.lesson_num" controls-position="right" :min="1" :max="99"></el-input-number><span class="pl-10">课时</span>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <div class="d-f f-j-c mt-30">
                        <MyButton @click.native="timetableDone" :loading="submitLoading.timetable">确定</MyButton>
                    </div>
                </el-form>
            </div>
        </el-dialog>
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
            editTeacherLists: [],
            dialogStatus: {
                course: false,
                edit: false,
                timetable: false
            },
            submitLoading: {
                edit: false,
                timetable: false
            },
            teacherForm: {course_id: '', techer_id: '', student_id: ''},
            timetableForm: {
                course_id: '', course_name: '', student_id: '', student_name: '', teacher_id: '', teacher_name: '', room_id: '', begin_time: '', begin_day: '', lesson_num: ''
            },
            teacherRules: {
                techer_id: [
                    {required: true, message: '请选择老师', trigger: 'change'}
                ]
            },
            timetableRules: {
                room_id: [
                    {required: true, message: '请选择上课教室', trigger: 'change'}
                ],
                begin_time: [
                    {required: true, message: '请选择上课时间', trigger: 'change'}
                ],
                lesson_num: [
                    {required: true, message: '请输入扣课时数'}
                ]
            },
            timePicker: {start: '09:00', step: '00:05', end: '21:45', minTime: 0},
            disableStartTime: new Date().setHours(0, 0, 0, 0),
            pickerBeginDateAfter: {
                disabledDate: (time) => {
                    return time.getTime() < this.disableStartTime;
                }
            }
        }
    },
    methods: {
        dialogClose() {

        },
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
        },
        //排课 click
        planTimeTable(course, data) {
            console.log(data);
            this.timetableForm.course_id = course.id;
            this.timetableForm.course_name = course.name;
            this.timetableForm.student_id = data.student.id;
            this.timetableForm.student_name = data.student.name;
            this.timetableForm.teacher_id = data.teacher.id;
            this.timetableForm.teacher_name = data.teacher.name;

            this.dialogStatus.timetable = true;
        },
        timetableDone() {
            this.$refs.timetableForm.validate(valid => {if(valid) this.submitTimeTable()});
        },
        async submitTimeTable() {
            let params = {
                course_id: this.timetableForm.course_id,
                student_id: this.timetableForm.student_id,
                teacher_id: this.timetableForm.teacher_id,
                room_id: this.timetableForm.room_id,
                lesson_num: this.timetableForm.lesson_num
            };

            params.begin_time = new Date(`${this.timetableForm.begin_day} ${this.timetableForm.begin_time}`).getTime() / 1000;

            console.log(params);

            let result = await this.$$request.post('api/timetable/order', params);
            console.log(result);

            if(!result) return 0;
            this.$message.success('快速排课成功!');
            this.dialogStatus.timetable = false;
        },
        //编辑修改老师信息 click
        editTeacher(data) {
            this.teacherForm.techer_id = data.teacher.id;
            this.teacherForm.course_id = data.course_id;
            this.teacherForm.student_id = data.id;

            this.getEditTeacherLists(data.course_id);
        },
        //获取编辑老师列表
        async getEditTeacherLists(id) {
            let result = await this.$$request.post('api/course/orderTeachers', {course_id: id});
            console.log(result);
            if(!result) return 0;
            this.editTeacherLists = result.teachers;
            this.dialogStatus.edit = true;
        },
        //修改老师确定 click
        editTeacherDone() {
            this.$refs.teacherForm.validate(valid => {if(valid) this.submitEditTeacher()});
        },
        //提交修改老师数据
        async submitEditTeacher() {
            let result = await this.$$request.post('api/course/changeTeacher', {
                course_id: this.teacherForm.course_id,
                teacher_id: this.teacherForm.techer_id,
                student_id: this.teacherForm.student_id
            });

            console.log(result);

            if(!result) return 0;
            this.$message.success('修改老师成功');
            this.dialogStatus.edit = false;
            this.getCourseLists();
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
    .form-box {
        padding: 0 10px;
        .el-select {
            width: 100%;
        }
        /deep/ .begin-day-form .el-date-editor{
            width: 130px !important;
        }
        /deep/ .begin-day-time .el-date-editor{
            width: 100px !important;
        }
        /deep/ .el-input-number {
            width: 150px;
        }
        /deep/ .el-input {
            width: 150px;
        }
    }
</style>

