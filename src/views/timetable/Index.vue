<template>
    <div class="flex1">
        <el-card shadow="hover" class="tabletime-card">
            <TableHeader title="课程表">
                <!-- <MyButton class="mr-20">导出课表</MyButton> -->
                <MyButton type="border" @click.native="addTimetable('multiple')" fontColor="fc-m">批量排课</MyButton>
            </TableHeader>

            <div class="d-f content-box">
                <div class="content-left">
                    <div class="d-f f-j-c">
                        <div id="myCalendar" class="mt-20"></div>
                    </div>
                    <div class="mt-50 pl-20">
                        <div v-if="showType == 'default'" key="default">
                            <p class="fc-5 fs-16">排课概览</p>
                            <p class="fc-9 mt-20">总排课节：<span class="fc-5">{{timeTableInfo.total_num}}</span></p>
                            <p class="fc-9 mt-10">总课消数：<span class="fc-5">{{timeTableInfo.expend_num}}</span></p>
                        </div>
                        <div v-else-if="showType == 'teacher'" key="teacher">
                            <p class="fc-5 fs-16">有课老师</p>
                            <p class="fc-9 mt-20 cursor-pointer" 
                                v-for="(teacher, index) in timeTableInfo.teacher_info" 
                                @click="timeTableClick(teacher.id)" :key="index">
                                    {{teacher.name}}：<span class="fc-5">{{teacher.num}}</span>
                            </p>
                        </div>
                        <div v-else key="class">
                            <p class="fc-5 fs-16">有课教室</p>
                            <p class="fc-9 mt-20 cursor-pointer"
                                v-for="(room, index) in timeTableInfo.room_info" 
                                @click="timeTableClick(room.id)" :key="index">
                                    {{room.name}}：<span class="fc-5">{{room.num}}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div class="content-right flex1">
                    <header class="d-f f-j-b f-a-c timetable-header pl-30">
                        <div class="d-f showtype-check">
                            <a class="flex1 t-a-c left cursor-pointer" :class="{active: tableType == 'week'}" @click="tableTypeTab('week')">按周</a>
                            <a class="flex1 t-a-c right cursor-pointer" :class="{active: tableType == 'day'}" @click="tableTypeTab('day')">按日</a>
                        </div>

                        <div class="d-f end-curse fc-5 mr-20">
                            <a class="yes d-f f-a-c">已结课</a>
                            <a class="ml-30 no d-f f-a-c">未结课</a>
                        </div>
                    </header>

                    <div class="timetable-box" v-loading="loading">
                        <!-- 周课表 -->
                        <div class="week-table fc-5" v-if="tableType === 'week'">
                            
                            <div class="week-ul d-f">
                                <div class="first-li d-f f-a-c f-j-c">时间</div>
                                <ul class="d-f flex1">
                                    <!-- <li class="d-f f-a-c f-j-c">时间</li> -->
                                    <li v-for="(item, index) in defaultWeekList" :key="index" class="d-f f-a-c f-j-c flex1">
                                        <div class="p-r t-a-c">
                                            <p :class="{'fc-m': item.day.isToday}">{{item.name}}</p>
                                            <p class="mt-5" :class="{'fc-m': item.day.isToday}">{{item.day.date}}</p>
                                            <div class="today btn-m fc-f fs-12" v-if="item.day.isToday">今日</div>
                                        </div>
                                    </li>
                                </ul>
                            </div>

                            <div class="week-timetable-box my-scrollbar">
                                <el-scrollbar style="height: 100%;">
                                    <div v-for="(row, index) in weekTableLists" :key="index" class="d-f">
                                        <div class="first-li d-f f-a-c f-j-c">
                                            <span>{{hourData[index].name}}</span>
                                        </div>
                                        <ul class="d-f flex1">
                                            <li v-for="(col, num) in row.course" :key="num" class="cursor-pointer flex1" @mouseenter.stop="coursehover(col)" @mouseleave="courseMouseout(col)">
                                                <el-popover v-if="col.lists.length" v-for="(item, n) in col.lists" :key="n" v-model="item.popver" placement="bottom" width="380" trigger="click">
                                                    <div class="course-popver">
                                                        <div class="d-f f-j-b">
                                                            <span class="fs-17 fc-m">{{item.grade_name}}</span>
                                                            <div class="d-f btn" v-if="item.status == 1 && !col.past_due && item.begin_time > new Date().getTime() / 1000">
                                                                <a class="cursor-pointer" @click="detailEdit(item)">编辑</a>
                                                                <a class="cursor-pointer ml-10" @click="detailDelete(item)">删除</a>
                                                            </div>
                                                        </div>
                                                        <p class="mt-10"><span>{{item.course_name}}</span><span class="ml-50">{{item.teacher.name}}</span></p>
                                                        <p class="mt-5"><span>{{`${item.time_quantum.begin_time}-${item.time_quantum.end_time}`}}</span><span class="ml-50">{{Math.round((item.end_time - item.begin_time) / 60)}}分钟</span></p>
                                                        <p class="mt-20 fc-9">课时:<span class="fc-5 ml-10">{{item.lesson_num}}课时</span></p>
                                                        <p class="mt-10 fc-9">教室:<span class="fc-5 ml-10">{{item.room_name}}</span></p>
                                                        <p class="mt-10 d-f fc-9">
                                                            学员:
                                                            <span class="d-f flex1 fc-5 f-w-w">
                                                                <i v-for="(student, m) in item.student_grades" :key="m">{{student.name}}</i>
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div class="course-item pl-13 pr-10 pt-8" :class="{'active': item.status == 1 && !col.past_due && item.begin_time > new Date().getTime() / 1000}" slot="reference">
                                                        <p class="fs-16">{{item.grade_name}}</p>
                                                        
                                                        <p class="pt-5 d-f f-a-s">
                                                            <i class="icon teacher-icon"></i>
                                                            <span class="d-f f-a-c flex1 f-w-w pl-5">
                                                                <span class="pr-10">{{item.teacher[0].name}}</span>
                                                                <span>{{item.counselor.length ? item.counselor[0].name : ''}}</span>
                                                            </span>
                                                        </p>
                                                        <p class="pt-5 pb-8 d-f f-a-c">
                                                            <i class="time-icon"></i>
                                                            <span class="pl-5">{{`${item.time_quantum.begin_time}-${item.time_quantum.end_time}`}}</span>
                                                        </p>
                                                    </div>
                                                </el-popover>
                                                <div class="add-course d-f f-a-c f-j-c" v-if="!col.past_due"
                                                    :class="{'hover': col.operate == true}"  @click="addTimetable('single', col.hours_id, col.full_date, col.id)">
                                                    <div v-show="col.operate"><img src="../../images/common/add.png" alt=""></div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                </el-scrollbar>
                            </div>
                        </div>
                        <!-- 日课表 -->
                        <div class="day-table my-scrollbar fc-5" v-else>
                            <el-scrollbar style="height: 100%;">                          
                                <ul>
                                    <li v-for="(row, index) in dayTableLists" :key="index" class="d-f">
                                        <div class="left t-a-c">{{hourData[index].name}}</div>
                                        <div class="right fc-7 flex1">
                                            <div v-if="row.course.length" v-for="(item, num) in row.course" :key="num"
                                                @mouseenter.stop="coursehover(item)" @mouseleave="courseMouseout(item)"
                                                class="course-box d-f f-j-b cursor-pointer" 
                                                :class="{'mt-5' : num > 0, 'active': item.status == 1 && !row.past_due}">
                                                <div class="d-f f-d-c f-j-c pl-15">
                                                    <p>
                                                        <span class="fs-16 title">{{item.grade_name}}</span>
                                                        <span class="ml-50">{{Math.round((item.end_time - item.begin_time) / 60)}}分钟</span>
                                                        <span class="ml-40">{{item.lesson_num}}课时</span>
                                                    </p>
                                                    <p class="mt-10 d-f f-a-c">
                                                        <span class="d-f f-a-c">
                                                            <i class="address-icon"></i><i class="pl-5">{{item.room_name}}</i>
                                                        </span>
                                                        <span class="ml-50 d-f f-a-c">
                                                            <i class="time-icon mb-1"></i><i class="pl-5">{{`${item.time_quantum.begin_time}-${item.time_quantum.end_time}`}}</i>
                                                        </span>
                                                        <span class="ml-40 d-f f-a-c">
                                                            <i class="teacher-icon"></i><i class="pl-5">{{item.teacher[0].name}}</i>
                                                            <i class="pl-10">{{item.counselor.length ? item.counselor[0].name : ''}}</i>
                                                        </span>
                                                    </p>
                                                </div>
                                                <div class="d-f f-a-c mr-30" v-if="item.operate && item.status == 1 && !row.past_due">
                                                    <MyButton type="border" fontColor="fc-m" @click.native="detailEdit(item)">编辑</MyButton>
                                                    <MyButton type="border" fontColor="fc-m" class="ml-10" @click.native="detailDelete(item)">删除</MyButton>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </el-scrollbar>
                        </div>
                    </div>
                </div>
            </div>
        </el-card>
        
        <!-- 新增排课弹窗 -->
        <el-dialog :title="addTableType == 'multiple' ? '批量排课' : addTableType == 'single' ? '添加排课'  : '修改排课'" width="800px" center :visible.sync="addTimetableMask" :close-on-click-modal="false" @close="dialogClose('addTimeTable')">
            <el-form label-width="120px" :model="timetableForm" size="small" ref="addTimeTable" :rules="addRules">
                <div class="form-box" v-if="Object.keys(timetableFull).length">
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="选择班级：" prop="grade_info">
                                <el-cascader :options="timetableFull.course" v-model="timetableForm.grade_info" @change="formGradeChange" expand-trigger="hover"></el-cascader>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11" :offset="1">
                            <el-form-item label="课节时长："><span v-if="timetableForm.lesson_time">{{timetableForm.lesson_time}}分钟</span></el-form-item>
                        </el-col>
                    </el-row>

                    <el-row class="mt-10">
                        <el-col :span="11">
                            <el-form-item label="上课老师：" prop="teacher_ids">
                                <el-select placeholder="请选择" v-model="timetableForm.teacher_ids">
                                    <el-option v-for="(item, index) in timetableFull.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11" :offset="1">
                            <el-form-item label="未排课时："><span v-if="timetableForm.no_timetable !== ''">{{timetableForm.no_timetable}}节课</span></el-form-item>
                        </el-col>
                    </el-row>

                    <el-row class="mt-10">
                        <el-col :span="11">
                            <el-form-item label="辅助老师：" prop="counselor_ids">
                                <el-select placeholder="请选择" v-model="timetableForm.counselor_ids" clearable>
                                    <el-option v-for="(item, index) in timetableFull.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="11" :offset="1">
                            <el-form-item label="扣课时数：" prop="lesson_num">
                                <el-input-number v-model="timetableForm.lesson_num" controls-position="right" :min="1" :max="99"></el-input-number><span class="pl-10">节课</span>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row class="mt-10">
                        <el-col :span="11">
                            <el-form-item label="上课教室：" prop="room_id">
                                <el-select placeholder="请选择"  v-model="timetableForm.room_id" multiple :multiple-limit="addTableType == 'multiple' ? 0 : 1">
                                    <el-option v-for="(item, index) in timetableFull.class_room" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col v-if="addTableType == 'multiple'" :span="11" :offset="1">
                            <el-form-item label="开课日期：" prop="start_time">
                                <el-date-picker v-model="timetableForm.start_time" @change="startTimeChange" type="date" :editable="false" :picker-options="pickerBeginDateAfter" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                            </el-form-item>
                            
                        </el-col>
                    </el-row>
                    
                    <el-row class="mt-10" v-if="addTableType == 'multiple'">
                        <el-col :span="11">
                             <el-form-item label="重复规则：" prop="loop">
                                <el-select placeholder="请选择" v-model="timetableForm.loop">
                                    <el-option label="无" value="no"></el-option>
                                    <el-option label="按周循环" value="yes"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row class="mt-10 add-date-box">
                        <el-col class="title">上课时间：</el-col>
                        <el-col :span="19" class="list">
                            <el-form label-width="120px" :model="addDate" size="small" ref="addDateForm" :rules="timeRules" v-for="(addDate, num) in formAddDate" :key="num">
                                <el-row :class="{'mt-10': num}">
                                    <el-col :span="5">
                                        <el-form-item label-width="0" prop="week">
                                            <el-select placeholder="选择某天" v-model="addDate.week" @change="formWeekChange">
                                                <el-option v-for="(item, index) in timetableWeekList" :key="index" :disabled="(addTableType == 'single' || addTableType == 'edit') && !item.day.past_due" :label="item.name" :value="item.id"></el-option>
                                            </el-select>
                                        </el-form-item>
                                    </el-col>

                                    <el-col :span="8" class="p-r ml-20">
                                        <el-form-item  label-width="0" prop="begin_time">
                                            <el-time-select 
                                                :editable="false"
                                                v-model="addDate.begin_time" 
                                                :picker-options="timePicker" 
                                                placeholder="开始时间">
                                            </el-time-select>
                                        </el-form-item>

                                        <div v-if="addTableType == 'multiple'">
                                            <div class="add-date cursor-pointer" v-if="num == formAddDate.length - 1" @click="addDateHandle"><img src="../../images/common/add.png" alt=""></div>
                                            <div class="add-date cursor-pointer" v-else @click="deleteDateHandle(num)"><img src="../../images/common/deleteSchool.png" alt=""></div>
                                        </div>
                                    </el-col>
                                </el-row>
                            </el-form>
                        </el-col>
                    </el-row>

                    <el-row class="mt-10">
                        <el-form-item label="选择学员：">
                            <el-checkbox v-model="studentCheckAll" @change="studentCheckAllChange">全选</el-checkbox>
                            <el-checkbox-group v-model="studentLists" @change="studentCheckChange" v-if="allStudentLists.length">
                                <el-checkbox v-for="(item, index) in allStudentLists" :label="item" :key="index">{{item.student_name}}</el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-row>
                </div>

                <div class="d-f f-j-c mt-30">
                    <MyButton @click.native="doneHandle('addTimeTable')">确定</MyButton>
                </div>
            </el-form>
        </el-dialog>

        <!-- 冲突弹窗 -->
        <el-dialog width="1020px" center :visible.sync="conflictMask" :close-on-click-modal="false">
            <div class="conflict-box">
                <h3>排课冲突提醒</h3>
                <p class="mb-20">班级：{{gradeInfo.name}}</p>

                <el-table class="student-table" border :data="conflictLists" height="400" header-row-class-name="row-header">
                    <el-table-column label="序号" prop="index" type="index" width="50" class-name="number"></el-table-column>
                    <el-table-column label="上课日期">
                        <template slot-scope="scope">
                            <el-date-picker type="date" :editable="false" :clearable="false" value-format="timestamp" v-model="scope.row.begin_time"></el-date-picker>
                        </template>
                    </el-table-column>
                    <el-table-column label="开始时间">
                        <template slot-scope="scope">
                            <el-time-select :picker-options="timePicker" :editable="false" :clearable="false" v-model="scope.row.begin_hours"></el-time-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="冲突教室">
                        <template slot-scope="scope">
                            <el-select v-if="scope.row.conflict_data.reason == 2" v-model="conflict_room" multiple :multiple-limit="addTableType == 'multiple' ? 0 : 1">
                                <el-option v-for="(item, index) in timetableFull.class_room" :key="index" :label="item.name" :value="item.id" ></el-option>
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column label="冲突学员">
                        <template slot-scope="scope">
                            <span v-if="scope.row.conflict_data.reason == 3">
                                <i v-for="(item, index) in scope.row.conflict_data.data" :key="index"><i v-if="index > 0">/</i>{{item.name}}</i>
                            </span> 
                        </template>
                    </el-table-column>
                    <el-table-column label="解决建议">
                        <template slot-scope="scope">{{conflictType[`reason${scope.row.conflict_data.reason}`]}}</template>
                    </el-table-column>
                </el-table>

                <div class="d-f f-j-c mt-30">
                    <MyButton type="gray" @click.native="conflictMask = false">返回编辑</MyButton>
                    <MyButton type="subm" class="ml-30" @click.native="doneModify">确认修改</MyButton>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import TableHeader  from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'
import Jquery from 'jquery'
import '../../plugins/calendar'

const ONE_DAY_LONG = 24*60*60*1000;


export default {
    data() {
        return {
            conflictType: {
                reason1: '老师冲突 请修改时间',
                reason2: '教室冲突 请修改时间或教室',
                reason3: '学员冲突 请修改时间'
            },

            nowTime: new Date().getTime(),//时间选择器，选中的当天日期

            loading: true,
            addTimetableMask: false,  //新增排课弹窗
            conflictMask: false,   //冲突弹窗
            addTableType: 'single',
            course_index: 0,
            gradeLists: [],    //选择课程，确定课程的班级列表
            gradeInfo: {student: []},   //选择班级，确定班级详情，填充表单默认值
            studentLists: [],

            conflictLists: [],  //冲突列表
            conflict_room: [],   //冲突教室

            other_lists: [],   //批量排课除开冲突，剩下正确的数据列表

            tableType: 'week',   //按周、日展示课表
            showType: 'default',   //显示类型  default，teacher，classroom
            calendar: {time: new Date().getTime() / 1000},   //日历默认时间
            timeTableInfo: {},     //课表总数据
            weekTableLists: [],  //按周展示，课表列表
            dayTableLists: [],  //按天展示，课表列表
            teacher_id: '',
            timetableFull: {},
            classroom_id: '',

            studentCheckAll: false,
            allStudentLists: [],   //学员总数

            timePicker: {start: '09:00', step: '00:15', end: '21:45', minTime: 0},
            
            weekList: [
                {id: 1, name: '周一'}, 
                {id: 2, name: '周二'}, 
                {id: 3, name: '周三'}, 
                {id: 4, name: '周四'}, 
                {id: 5, name: '周五'}, 
                {id: 6, name: '周六'}, 
                {id: 0, name: '周日'}
            ],
            
            defaultWeekList: [],    //课表头部展示周数据
            timetableWeekList: [],   //排课下拉选择周数据

            hourData: [],
            timetableForm: {
                no_timetable: '',   //未排课时
                timetable_id: '',
                grade_info: [],
                start_time: '',
                lesson_time: '',
                lesson_num: '',
                teacher_ids: '',
                counselor_ids: '',
                room_id: [],
                loop: 'no'
            },
            formAddDate: [],
            timeRules: {
                begin_time: [
                    {required: true, message: '请选择起始时间', trigger: 'change'}
                ],
                end_time: [
                    {required: true, message: '请选择结束时间', trigger: 'change'}
                ],
                week: [
                    {required: true, message: '请选择某天', trigger: 'change'}
                ]
            },
            addRules: {
                grade_info: [
                    {required: true, message: '请选择班级', trigger: 'change'}
                ],
                room_id: [
                    {required: true, message: '请选择教室', trigger: 'change'}
                ],
                teacher_ids: [
                    {required: true, message: '请选择任课老师', trigger: 'change'}
                ],
                counselor_ids: [],
                lesson_num: [
                    {required: true, message: '请输入课时数'},
                ],
                loop: [],
                start_time: [
                    {required: true, message: '请输入开课时间', trigger: 'change'}
                ]
            },
            disableStartTime: new Date().setHours(0, 0, 0, 0),
            pickerBeginDateAfter: {
                disabledDate: (time) => {
                    return time.getTime() < this.disableStartTime;
                }
            }
        }
    },
    watch: {
        $route(to, from) {  
            this.showType = to.name == 'timetableDefault' ? 'default' : to.name == 'timetableTeacher' ? 'teacher' : 'class';
            this.teacher_id = '';
            this.classroom_id = '';
            this.getAllTableLists();
        } 
    },
    methods: {
        dialogClose(form) {
            this.$refs[form].resetFields();
            this.formAddDate.splice(0, this.formAddDate.length);
            // for(let i = 0, len = this.$refs.addDateForm.length; i < len; i++) {this.$refs.addDateForm[i].resetFields()};
            
            Object.keys(this.timetableForm).forEach(v => {
                if(v == 'grade_info' || v == 'room_id') this.timetableForm[v] = [];
                else if(v == 'loop') this.timetableForm[v] = 'no';
                else this.timetableForm[v] = '';
            });
            this.timePicker.minTime = 0;

            this.studentLists = [];
            this.studentCheckAll = false;
            this.allStudentLists = [];
        },
        //按周、日展示切换
        tableTypeTab(type) {
            this.tableType = type;
            this.getTimeTableFull();
        },
        //老师、教室筛选点击，重新请求课表
        timeTableClick(id) {
            this.showType == 'teacher' ? this.teacher_id = id : this.classroom_id = id;
            this.getTimeTableFull();
        },
        //批量排课，新增多个时间段
        addDateHandle() {
            this.formAddDate.push({begin_time: '', end_time: '', week: ''});
        },
        deleteDateHandle(index) {
            this.formAddDate.splice(index, 1);
        },
        //鼠标移入课表
        coursehover(item) {
            item.operate = true;
        },
        //鼠标移出课表
        courseMouseout(item) {
            item.operate = false;
        },
        //详情编辑
        detailEdit(detail) {
            console.log(detail);
            this.getAddTimeTableFull();

            this.formAddDate.splice(0, this.formAddDate.length, {begin_time: detail.time_quantum.begin_time, end_time: '', week: detail.time_quantum.week});

            this.timetableForm.timetable_id = detail.id;
            this.timetableForm.grade_info = [detail.course_id, detail.grade_id]
            this.timetableForm.lesson_num = detail.lesson_num;
            this.timetableForm.lesson_time = detail.lesson_time;
            this.timetableForm.teacher_ids = detail.teacher.length ? detail.teacher[0].id : '';  //任课老师
            this.timetableForm.counselor_ids = detail.counselor.length ? detail.counselor[0].id : '';  //辅助老师
            this.timetableForm.room_id.splice(0, this.timetableForm.room_id.length, detail.room_id);  //上课教室

            this.timetableFull.course.forEach(v => {
                if(v.id === detail.course_id) {
                    v.grade.forEach(d => {if(d.id === detail.grade_id) {
                        this.timetableForm.no_timetable = d.lesson_num - (+d.scheduled);
                        this.gradeInfo = d;
                    }});
                }
            });

            this.allStudentLists = detail.student_grades;
            this.studentLists = detail.student_grades;
            this.studentCheckAll = true;

            this.addTableType = 'edit';
            this.addTimetableMask = true;
        },
        //详情删除
        async detailDelete(detail) {
            let result = await this.$$request.post('api/timetable/delete', {id: detail.id});
            if(!result || !result.status) return 0;

            this.$message.success('删除成功');
            detail.popver = false;
            this.getTimeTableFull();
        },
        //新增排课  type: single / multiple
        addTimetable(type, time, full_day, week) {
            if(type === 'single') {
                this.getWeekList(this.calendar.time * 1000, 'timetable');

                // if(new Date(`${full_day} 00:00`).getTime() < new Date().getTime() && time < new Date().getHours()) return this.$message.warning('不能给过去时间排课!');

                let newdate = [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&');

                if(this.isSameWeek(this.nowTime)) {
                    this.timePicker.minTime = week == new Date().getDay() ? newdate : 0
                }else {
                    this.timePicker.minTime = 0;
                }

                let newTime = new Date(`${full_day} 00:00`).getTime() < new Date().getTime() && time == new Date().getHours() ?
                                [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&') : `${time}:00`;

                console.log(newTime)
                this.formAddDate.push({begin_time: newTime, end_time: '', week: week});
                console.log(this.formAddDate)
            }else {
                this.formAddDate.push({begin_time: '', end_time: '', week: ''});               
                this.timetableForm.start_time = new Date().getTime();
            }
            console.log(this.timetableForm.start_time)
            this.getAddTimeTableFull();
            this.addTableType = type;
            this.addTimetableMask = true;
        },
        //新增排课选择班级
        formGradeChange(val) {
            this.timetableFull.course.forEach(v => {
                if(v.id === val[0]) {
                    this.timetableForm.lesson_time = v.lesson_time;
                    v.grade.forEach(d => {if(d.id === val[1]) {
                        this.timetableForm.no_timetable = d.lesson_num - (+d.scheduled);
                        this.gradeInfo = d;
                    }});
                }
            });
            
            console.log(this.gradeInfo)

            this.allStudentLists = this.gradeInfo.student_course.concat(this.gradeInfo.student_grade);
            this.studentLists = this.gradeInfo.student_grade;

            if(!this.gradeInfo.student_course.length && this.gradeInfo.student_grade.length) {
                this.studentCheckAll = true;
            }else {
                this.studentCheckAll = false;
            }

            if(this.gradeInfo.start_time * 1000 > new Date().setHours(0, 0, 0, 0)) {
                //若开课时间大于五年 则显示当前日期
                this.timetableForm.start_time = this.gradeInfo.start_time * 1000 - new Date().getTime() > 5*360*24*60*60*1000 ? new Date().setHours(0, 0, 0, 0) : this.gradeInfo.start_time * 1000;

                if(this.addTableType == 'multiple') this.getWeekList(this.timetableForm.start_time, 'timetable');
                this.disableStartTime = this.timetableForm.start_time;
            }else {
                this.timetableForm.start_time = new Date().setHours(0, 0, 0, 0);
            }

            this.timetableForm.teacher_ids = this.gradeInfo.teacher.length ? this.gradeInfo.teacher[0].id : '';  //任课老师
            this.timetableForm.counselor_ids = this.gradeInfo.counselor.length ? this.gradeInfo.counselor[0].id : '';  //辅助老师
            this.timetableForm.room_id.splice(0, this.timetableForm.room_id.length, this.gradeInfo.room_id);  //上课教室
            console.log(this.timetableForm)
        },
        //排课弹窗，选择一周某一天
        formWeekChange(val) {
            if(this.addTableType == 'multiple') {
                this.timePicker.minTime = 0;
            }else {
                this.formAddDate.forEach(d => {if(d.week == val) d.begin_time = ''});
                if(val == new Date().getDay()) this.timePicker.minTime = [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
                else this.timePicker.minTime = 0;
            }
        },
        //学员checkbox，全选
        studentCheckAllChange(val) {
            this.studentLists = val ? this.allStudentLists : [];
        },
        //学员checkbox，多选
        studentCheckChange(val) {
            let checkedCount = val.length;
            this.studentCheckAll = checkedCount === this.allStudentLists.length;
        },
        //排课，开课日期改变
        startTimeChange(val) {
            this.getWeekList(val, 'timetable');
        },
        //排课表单确定
        doneHandle(formName) {
            let a, b;
            this.$refs[formName].validate(valid => {a = valid ? true : false});
            for(let i = 0, len = this.$refs.addDateForm.length; i < len; i++) {
                this.$refs.addDateForm[i].validate(valid => {b = valid ? true : false})
            }
            if(a && b) this.addTimeTableParams();
        },
        //冲突页面确定修改
        doneModify() {
            let lists = this.conflictLists.map(v => {
                let item = {};
                for(let key in v) {
                    if(key != 'begin_hours' && key != 'conflict_data') {
                        if(key == 'begin_time') {
                            item[key] = new Date(`${this.$$tools.format(v[key] / 1000).replace(/\-/g, "/")} ${v.begin_hours}`).getTime() / 1000;
                        }else if(key == 'end_time'){
                            item[key] = item.begin_time + this.timetableForm.lesson_time * 60;
                        }else if(key == 'room_id'){
                            if(this.addTableType == 'single' || this.addTableType == 'edit') {
                                item[key] = this.conflict_room.length ? this.conflict_room[0] : this.timetableForm.room_id[0];
                            }else {
                                item[key] = this.conflict_room.length ? this.conflict_room : this.timetableForm.room_id;
                            }
                        }else {
                            item[key] = v[key];
                        }
                    }
                };
                return item;
            });

            console.log(lists);

            lists = lists.concat(this.other_lists);

            let params = {lists: lists, commit_type: 'conflict'};

            if(this.addTableType == 'edit') params.id = this.timetableForm.timetable_id;

            console.log(params);
            this.getConflictLists(params);
        },
        //批量、单个排课参数整理
        addTimeTableParams() {

            console.log(this.timetableForm)

            let params = {
                course_id: this.timetableForm.grade_info[0],
                grade_id: this.timetableForm.grade_info[1],
                lesson_num: this.timetableForm.lesson_num,
                teacher_ids: `,${this.timetableForm.teacher_ids},`,
                counselor_ids: `,${this.timetableForm.counselor_ids},`,
                student_lists: this.studentLists.map(v => {return {student_id: v.student_id}})
            }

            //单个提交
            if(this.addTableType == 'single' || this.addTableType == 'edit') { 
                params.commit_type = 'single';
                params.room_id = this.timetableForm.room_id[0];
                this.timetableWeekList.forEach(v => {if(v.id == this.formAddDate[0].week) {
                    console.log(`${v.day.newFullDay}`)
                    console.log(` ${this.formAddDate[0].begin_time}`)
                    params.begin_time = new Date(`${v.day.newFullDay} ${this.formAddDate[0].begin_time}`).getTime() / 1000;
                    params.end_time = params.begin_time + this.timetableForm.lesson_time * 60;
                }});
                if(this.addTableType == 'edit') params.edit_id = this.timetableForm.timetable_id;
            } else {
                //批量提交
                params.commit_type = 'multiple',
                params.loop = this.timetableForm.loop;
                params.room_id = this.timetableForm.room_id;

                let time_lists = this.formAddDate.map(d => {
                    let begin_time, end_time;
                    this.timetableWeekList.forEach(v => {
                        let default_begin_time = new Date(`${v.day.newFullDay} ${d.begin_time}`).getTime() / 1000;
                        let default_end_time = default_begin_time + this.timetableForm.lesson_time * 60;
                        let later_begin_time = default_begin_time + 604800;
                        let later_end_time = default_end_time + 604800;

                        if(d.week == v.id) {
                            if(new Date().getTime() / 1000 > default_begin_time) {
                                begin_time = later_begin_time;
                                end_time = later_end_time;
                            }else {
                                if(new Date(this.timetableForm.start_time).getDay() == 0) {   //周日
                                    begin_time = d.week != 0 ? later_begin_time : default_begin_time;
                                    end_time = d.week != 0 ? later_end_time : default_end_time;
                                }else {
                                    if(d.week == 0) {
                                        begin_time = default_begin_time;
                                        end_time = default_end_time;
                                    }else {
                                        begin_time = d.week < new Date(this.timetableForm.start_time).getDay() ? later_begin_time : default_begin_time;
                                        end_time = d.week < new Date(this.timetableForm.start_time).getDay() ? later_end_time : default_end_time
                                    }
                                }
                            }
                        }
                    });
                    return {begin_time: begin_time, end_time: end_time};
                });

                params.time_lists = time_lists;
            }
            console.log(params);
            this.getConflictLists(params);
        },
        //检测是否有冲突，获取冲突数据列表
        async getConflictLists(params) {
            let result = await this.$$request.post('api/timetable/conflictLists', params);
            console.log(result);

            if(!result) return 0;

            if(result.status === 0) return this.$message.warning('操作失败，请稍后再试!');

            if(result.status === 1) {
                this.getTimeTableFull();
                this.conflict_room = [];
                let message = this.addTableType == 'edit' ? '修改' : '添加';
                this.$message.success(`${message}排课成功`);
                this.addTimetableMask = false;
                this.conflictMask = false;               
            }else if(result.status === -1) {
                result.conflict_lists.forEach(v => {
                    v.begin_time = v.begin_time * 1000;
                    let nowtime = new Date(v.begin_time);
                    v.begin_hours = [nowtime.getHours(), nowtime.getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
                    if(v.conflict_data.reason == 2) {
                        if(v.conflict_data.data.constructor === Array) {
                            this.conflict_room = v.conflict_data.data.map(k => {return k.id});
                        }else {
                            this.conflict_room = [v.conflict_data.data.id];
                        }
                    }
                });


                this.conflictLists = result.conflict_lists;   //冲突列表
                this.other_lists = result.lists;    //正常列表
                this.conflictMask = true;
            }
        },
        //判断当前开课日期是不是本周
        isSameWeek(old){  
            var oneDayTime = 1000*60*60*24;  
            var old_count = parseInt(old/oneDayTime);  
            var now_other = parseInt(new Date().getTime() / oneDayTime);  
            return parseInt((old_count+4)/7) == parseInt((now_other+4)/7);  
        },
        //获取课表列表
        getTimeTableFull() {
            console.log(this.showType);
            if(this.showType == 'default') this.getAllTableLists();
            else {
                if(this.teacher_id || this.classroom_id) this.getOtherTableLists();
                else this.getAllTableLists();
            }
        },
        //获取新增排课填充数据
        async getAddTimeTableFull() {
            let result = await this.$$request.post('api/timetable/fill');
            console.log(result);

            if(!result) return 0;

            result.lists.course.forEach(v => {
                v.value = v.id;
                v.label = v.name;
                v.children = v.grade.map(d => {
                    d.value = d.id;
                    d.label = d.name;
                    return d;
                });
            });

            this.timetableFull = result.lists;
        },
        //默认获取全部课表
        async getAllTableLists() {
            this.loading = true;
            console.log({select_time: Math.round(this.calendar.time), type: this.tableType});
            let result = await this.$$request.post('api/timetable/lists', {select_time: Math.round(this.calendar.time), type: this.tableType});
            console.log(result);
            if(!result) return 0;

            this.resultDispose(result.lists.timetable_lists);
            this.timeTableInfo = result.lists;
        },
        //教室、老师获取课表
        async getOtherTableLists() {
            this.loading = true;
            let url = this.showType == 'teacher' ? 'api/timetable/teacherLists' : 'api/timetable/roomLists';
            let params = {select_time: Math.round(this.calendar.time), type: this.tableType};
            if(this.showType == 'teacher') params.teacher_id = this.teacher_id;
            if(this.showType == 'class') params.room_id = this.classroom_id;

            console.log(params);
            let result = await this.$$request.post(url, params);
            console.log(result)
            if(!result) return 0;
            this.resultDispose(result.lists);
        },
        //返回数据判断梳理
        resultDispose(resultData) {
            if(this.tableType == 'week') {
                let newResult = this.hourData.map(v => {
                    let newData = {id: v.id, course: []};
                    newData.course = this.defaultWeekList.map(w => {
                        let weekData = {id: w.id, full_date: w.day.newFullDay, lists: [], operate: false, hours_id: v.id};
                        let past_due;
                        let full_date = w.day.newFullDay;
                        console.log(full_date);
                        if(full_date == this.$$tools.format(new Date().getTime() / 1000).replace(/\-/g, "/")) {                           
                            past_due = v.id < new Date().getHours() ? true : false;
                        }else if(new Date(`${full_date} 00:00`).getTime() < new Date().getTime()){
                            past_due = true;
                        }else {
                            past_due = false;
                        }
                        
                        weekData.past_due = past_due;
                        console.log(past_due)

                        resultData.forEach(d => {
                            let nowDate = new Date(d.begin_time * 1000);
                            let hour = nowDate.getHours();
                            let week = nowDate.getDay();

                            d.time_quantum = {
                                begin_time: this.$$tools.formatTime(d.begin_time),
                                end_time: this.$$tools.formatTime(d.end_time),
                                week: week
                            };

                            if(hour == v.id && w.id == week) {
                                weekData.lists.push(d);
                            }
                        });
                        return weekData;
                    }); 
                    return newData;
                });
                this.weekTableLists = newResult;
                this.loading = false;
                console.log(newResult)
            } else {
                let newResult = this.hourData.map(v => {
                    let newData = {id: v.id, course: []};

                    let past_due;

                    let full_date = this.$$tools.format(this.calendar.time).replace(/\-/g, "/");

                    if(full_date == this.$$tools.format(new Date().getTime() / 1000).replace(/\-/g, "/")) { 
                        console.log(v.id <= new Date().getHours())
                        past_due = v.id <= new Date().getHours();
                        console.log(past_due)
                    }else if(new Date(`${full_date} 00:00`).getTime() < new Date().getTime()){
                        past_due = true;
                    }else {
                        past_due = false;
                    }

                    newData.past_due = past_due;

                    resultData.forEach(d => {
                        let nowDate = new Date(d.begin_time * 1000);
                        let hour = nowDate.getHours();
                        let week = nowDate.getDay();
                        
                        d.operate = false;
                        d.time_quantum = {
                            begin_time: this.$$tools.formatTime(d.begin_time),
                            end_time: this.$$tools.formatTime(d.end_time),
                            week: week
                        };
                        if(hour == v.id) {
                            newData.course.push(d);
                        }
                    });

                    return newData;
                });

                this.dayTableLists = newResult;
                this.loading = false;
                console.log(this.dayTableLists)
            }
        },
        //周数据做处理
        getWeekList(time, type) {
            let now = new Date(), nowTime, day; 

            if(time) {
                nowTime = time;
                day = new Date(nowTime).getDay();
            }else {
                nowTime = now.getTime();
                day = now.getDay();
            }

            let weekLists = this.weekList.map(d => {

                let num = d.id, newTime, past_due;
                
                let day_a = day == 0 ? 7 : day;

                newTime = num == 0 ? nowTime + (7-day_a) * ONE_DAY_LONG : nowTime - (day_a-num) * ONE_DAY_LONG;
                
                let newDay = this.$$tools.formatTime(newTime / 1000, 'day');

                let isToday = this.$$tools.format(newTime / 1000) === this.$$tools.format(now.getTime() / 1000) ? true : false;  //是否是当天

                if(this.isSameWeek(nowTime)) {
                    past_due = newTime >= nowTime ? true : false;  //是否过了今天
                }else {
                    past_due = true;
                }

                let newFullDay = this.$$tools.format(newTime / 1000);

                return {
                    id: d.id,
                    name: d.name,
                    day: {
                        isToday: isToday,
                        past_due:  past_due,
                        date: newDay.replace(/\-/g, "/") || 0,
                        newFullDay: newFullDay.replace(/\-/g, "/") || 0
                    }
                }
            });

            console.log(weekLists);
            if(type === 'default') this.defaultWeekList = weekLists;
            else this.timetableWeekList = weekLists;
        }
    },
    mounted() {
        Jquery('#myCalendar').calendar({
            width: 280,
            height: 280,
            customClass: 'my-calender',
            onSelected: (view, date, data) => {
                if(date.getTime() / 1000 === this.calendar.time) return 0;
                this.calendar.time = date.getTime() / 1000;
                this.getWeekList(date.getTime(), 'default');
                this.nowTime = date.getTime();
                // this.showType = 'default';
                console.log(this.showType);
                this.getTimeTableFull();
            }
        });
    },
    created() {
        this.showType = this.$route.name == 'timetableDefault' ? 'default' : this.$route.name == 'timetableTeacher' ? 'teacher' : 'class';
        for(let a = 9; a <= 21; a++) {this.hourData.push({id: a, name: `${a}:00`})};
        this.getWeekList(null, 'default');
        this.getWeekList(null, 'timetable');
        this.getAllTableLists();
        this.getAddTimeTableFull();
    },
    components: {TableHeader, MyButton}
}
</script>

<style lang="less" scoped>
    .tabletime-card {
        min-width: 1600px;
    }
    .content-box {
        overflow: hidden;
        overflow-x: auto;
    }
    .content-left {
        width: 300px;
        background-color: #f8f8f8;
        border-right: 1px #e3e3e3 solid;
    }
    .content-right {
        .timetable-header {
            height: 80px;
        }
    }
    .showtype-check {
        border: 1px #45DAD5 solid;
        box-sizing: border-box;
        color: #45DAD5;
        border-radius: 20px;
        width: 140px;
        height: 30px;
        a {
            height: 100%;
            line-height: 30px;
            &.active {
                background-color: #45DAD5;
                color: #fff;
            }
            &.left {
                border-top-left-radius: 20px;
                border-bottom-left-radius: 20px;
            }
            &.right {
                border-top-right-radius: 20px;
                border-bottom-right-radius: 20px;
            }
        }
    }
    .end-curse {
        a {
            position: relative;
            &::before {
                content: '';
                display: block;
                width: 24px;
                height: 8px;
                border-radius: 2px;
                margin-right: 10px;
            }
            &.yes::before{
                background-color: #BCBCBC;
            }
            &.no::before{
                background-color: #45DAD5;
            }
        }
    }

    .week-table {
        .week-ul {
            border-top: 2px #e3e3e3 solid;
            border-bottom: 2px #e3e3e3 solid;
            .first-li {width: 80px; border-right: 1px #e3e3e3 solid;}
            li {
                height: 56px;
                border-right: 1px #e3e3e3 solid;
                .today {
                    position: absolute;
                    left: 50px;
                    top: 2px;
                    padding: 3px 2px;
                }
            }
        }
        .week-timetable-box {
            height: 600px;
            .first-li {width: 80px; border-right: 1px #e3e3e3 solid;}
            ul {
                li {
                    background-color: #f8f8f8;
                    border-bottom: 1px #e3e3e3 solid;
                    text-align: left;
                    min-height: 30px;
                    border-right: 1px #e3e3e3 solid;
                    position: relative;
                    .course-item {
                        box-sizing: border-box;
                        border: 1px #C8C8C8 solid;
                        border-left-width: 5px !important;
                        background-color: #f5f5f5;
                        min-height: 85px;
                        &.active {
                            border: 1px #45DAD5 solid;
                            background-color: #F7FDFD;
                        }
                        .icon {
                            position: relative;
                            top: 3px;
                        }
                    }
                    .add-course {
                        width: 100%;
                        height: 30px;
                        &.hover {
                            background-color: #E8F9F9;
                        }
                        img {
                            width: 15px;
                            height: 15px;
                        }
                    }
                }
            }
        }
    }

    .course-popver {
        padding: 10px;
        .btn {
            a {
                width: 60px;
                box-sizing: border-box;
                line-height: 30px;
                text-align: center;
                border: 1px #45DAD5 solid;
                color: #45DAD5;
                border-radius: 3px;
            }
        }
        i {
            margin: 0 10px;
            margin-bottom: 5px;
        }
    }
    
    .day-table {
        // border-top: 1px #e3e3e3 solid;
        height: 660px;
        ul {
            li {
                width: 1260px;
                .left {
                    width: 80px;
                    border-right: 1px #e3e3e3 solid;
                }
                .right {
                    background-color: #f8f8f8;
                    border-top: 1px #e3e3e3 solid;
                    border-right: 1px #e3e3e3 solid;
                    width: 100%;
                    min-height: 60px;
                    .course-box {
                        background-color: #FCFCFC;
                        height: 80px;
                        border-left: 5px #BCBCBC solid;
                        &.active {
                            border-color: #45DAD5;
                            .title {
                                color: #45DAD5;
                            }
                        }
                    }
                }
                &:last-child {
                    .right {
                        border-bottom: 1px #e3e3e3 solid;
                    }
                }
                // &:not(:first-child) {
                //     .right {
                //         border-top: 1px #e3e3e3 solid;
                //     }
                // }
            }
        }
    }

    .form-box {
        padding: 0 30px;
        .el-select, .el-date-editor {
            width: 100%;
        }
        .add-date {
            position: absolute;
            right: -35px;
            top: 5px;
        }
        .add-date-box {
            .title {
                text-align: right;
                width: 120px;
                padding-right: 13px;
                padding-top: 3px;
            }
            .list {
                max-height: 370px;
                overflow: hidden;
                overflow-y: auto;
            }
        }
    }

    .conflict-box {
        .el-select, .el-date-editor {
            width: 100%;
        }
        h3 {
            color: #E72E2E;
            font-size: 17px;
            text-align: center;
            font-weight: normal;
        }
        .row-header {
            background-color: #EEEEEE !important;
        }
    }

</style>

