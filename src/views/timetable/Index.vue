<template>
    <div class="flex1">
        <el-card shadow="hover" class="tabletime-card">
            <TableHeader title="课程表">
                <MyButton type="border" @click.native="addTimetable('multiple')" fontColor="fc-m">批量排课</MyButton>
            </TableHeader>

            <div class="d-f content-box">
                <div class="content-left">
                    <div class="d-f f-j-c">
                        <div id="myCalendar" class="mt-20"></div>
                    </div>
                    <div class="mt-30">
                        <!-- 班级课表 -->
                        <div v-if="showType == 'default'" key="default">
                            <p class="fc-5 fs-16 t-a-c pr-20">本<span>{{tableType == 'week' ? '周' : '日'}}</span>班级课表</p>
                            <el-radio-group v-model="gradeTimeTableRadio" class="mt-20 grade-radio" @change="gradeRadioChange">
                                <el-radio :label="0">全部</el-radio>
                                <el-radio :label="1">普通课程</el-radio>
                                <el-radio :label="2">一对一课程</el-radio>
                            </el-radio-group>
                            <div class="grade-checkbox mt-20 pr-20">
                                <div class="timetable-gradecheckbox my-scrollbar">
                                    <el-scrollbar style="height: 100%;">
                                        <div class="check-item">
                                            <el-checkbox v-model="timetable_gradeAll" @change="gradeCheckAllChange" class="p-r">
                                                <span>全选</span>
                                                <span class="p-a num">{{gradeInfoCheckLists.total_num}}</span>
                                            </el-checkbox>
                                        </div>
                                        <el-checkbox-group v-model="timetable_gradeCheck" @change="gradeCheckChange">
                                            <div v-for="(item, index) in gradeInfoCheckLists.lists" :key="index" class="check-item">
                                                <el-checkbox :label="item" class="p-r">
                                                    <span>{{item.name}}</span>
                                                    <span class="p-a num">{{item.num}}</span>
                                                </el-checkbox>
                                            </div>
                                        </el-checkbox-group>
                                    </el-scrollbar>
                                </div>
                            </div>
                        </div>
                        <!-- 老师课表 -->
                        <div v-else-if="showType == 'teacher'" key="teacher">
                            <p class="fc-5 fs-16 t-a-c pr-20">本<span>{{tableType == 'week' ? '周' : '日'}}</span>老师课表</p>

                            <div class="grade-checkbox mt-20 pr-20">
                                <div class="timetable-gradecheckbox my-scrollbar">
                                    <el-scrollbar style="height: 100%;">
                                        <div class="check-item">
                                            <el-checkbox v-model="timetable_teacherAll" @change="teacherCheckAllChange" class="p-r">
                                                <span>全选</span>
                                                <span class="p-a num">{{timeTableInfo.total_num}}</span>
                                            </el-checkbox>
                                        </div>
                                        <el-checkbox-group v-model="timetable_teacherCheck" @change="teacherCheckChange">
                                            <div v-for="(item, index) in timeTableInfo.teacher_info" :key="index" class="check-item">
                                                <el-checkbox :label="item" class="p-r">
                                                    <span>{{item.name}}</span>
                                                    <span class="p-a num">{{item.num}}</span>
                                                </el-checkbox>
                                            </div>
                                        </el-checkbox-group>
                                    </el-scrollbar>
                                </div>
                            </div>
                        </div>
                        <!-- 教室课表 -->
                        <div v-else key="class">
                            <p class="fc-5 fs-16 t-a-c pr-20">本<span>{{tableType == 'week' ? '周' : '日'}}</span>教室课表</p>

                            <div class="grade-checkbox mt-20 pr-20">
                                <div class="timetable-gradecheckbox my-scrollbar">
                                    <el-scrollbar style="height: 100%;">
                                        <div class="check-item">
                                            <el-checkbox v-model="timetable_roomAll" @change="roomCheckAllChange" class="p-r">
                                                <span>全选</span>
                                                <span class="p-a num">{{timeTableInfo.total_num}}</span>
                                            </el-checkbox>
                                        </div>
                                        <el-checkbox-group v-model="timetable_roomCheck" @change="roomCheckChange">
                                            <div v-for="(item, index) in timeTableInfo.room_info" :key="index" class="check-item">
                                                <el-checkbox :label="item" class="p-r">
                                                    <span>{{item.name}}</span>
                                                    <span class="p-a num">{{item.num}}</span>
                                                </el-checkbox>
                                            </div>
                                        </el-checkbox-group>
                                    </el-scrollbar>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="content-right flex1">
                    <header class="d-f f-j-b f-a-c timetable-header pl-30">
                        <div class="d-f showtype-check">
                            <a class="flex1 t-a-c left cursor-pointer" :class="{active: tableType == 'week'}" @click="tableTypeTab('week')">按周</a>
                            <a class="flex1 t-a-c right cursor-pointer" :class="{active: tableType == 'day'}" @click="tableTypeTab('day')">按日</a>
                        </div>

                        <div class="d-f end-curse fc-5 mr-10">
                            <a class="gray d-f f-a-c">已结课</a>
                            <a class="green ml-30 no d-f f-a-c">未满员</a>
                            <a class="yellow ml-30 no d-f f-a-c">满员</a>
                            <a class="red ml-30 no d-f f-a-c">超员</a>
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
                                                        <p class="mt-20 fc-9">课时：<span class="fc-5">{{item.lesson_num}}课时</span></p>
                                                        <p class="mt-10 fc-9">教室：<span class="fc-5">{{item.room_name}}</span></p>
                                                        <p class="mt-10 d-f fc-9">
                                                            上课学员：
                                                            <span class="d-f flex1 fc-5 f-w-w">
                                                                <i v-for="(student, m) in item.student_grades" :key="m" class="pr-10">{{student.name}}</i>
                                                            </span>
                                                        </p>
                                                        <p class="mt-10 d-f fc-9" v-if="item.student_audition.length">
                                                            试听学员：
                                                            <span class="d-f flex1 fc-5 f-w-w">
                                                                <i v-for="(student, m) in item.student_audition" :key="m" class="pr-10">{{student.name}}</i>
                                                            </span>
                                                        </p>
                                                    </div>
                                                    <div class="course-item pl-13 pr-10 pt-8 p-r" 
                                                            :class="{
                                                                'gray': item.lesson_end_time,
                                                                'green': !item.lesson_end_time && item.course_type === 1 && item.status == 1 && item.student_grades.length < item.grade_limit_num,
                                                                'yellow': !item.lesson_end_time && (item.course_type !== 1 || (item.status == 1 && item.student_grades.length == item.grade_limit_num)),
                                                                'red': !item.lesson_end_time && item.course_type === 1 && item.status == 1 && item.student_grades.length > item.grade_limit_num}" 
                                                                slot="reference">
                                                        <div class="proportion-box p-a" v-if="item.status == 1 && !item.lesson_end_time && item.student_grades.length < item.grade_limit_num">
                                                            <div class="proportion p-a" :style="{height: (item.student_grades.length / item.grade_limit_num * 100) + '%'}"></div>
                                                        </div>

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

                                                        <div class="course-type p-a" v-if="item.course_type !== 1" :class="item.lesson_end_time ? 'gray' : 'yellow'">一对一</div>
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
                                                class="course-box d-f f-j-b cursor-pointer p-r" 
                                                :class="{'mt-5' : num > 0, 'gray': item.lesson_end_time,
                                                        'green': !item.lesson_end_time && item.course_type === 1 && item.status == 1 && item.student_grades.length < item.grade_limit_num,
                                                        'yellow': !item.lesson_end_time && (item.course_type !== 1 || (item.status == 1 && item.student_grades.length == item.grade_limit_num)),
                                                        'red': !item.lesson_end_time && item.course_type === 1 && item.status == 1 && item.student_grades.length > item.grade_limit_num}">

                                                <div class="proportion-box p-a" v-if="item.status == 1 && !item.lesson_end_time && item.student_grades.length < item.grade_limit_num">
                                                    <div class="proportion p-a" :style="{height: (item.student_grades.length / item.grade_limit_num * 100) + '%'}"></div>
                                                </div>

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
        <el-dialog :title="addTableType == 'multiple' ? '批量排课' : addTableType == 'single' ? '添加排课'  : '修改排课'" width="900px" center :visible.sync="addTimetableMask" :close-on-click-modal="false" @close="dialogClose">
            <el-form label-width="120px" :model="timetableForm" size="small" ref="addTimeTable" :rules="addRules">
                <div class="form-box" v-if="Object.keys(timetableFull).length">
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="选择班级：" prop="grade_info">
                                <el-cascader :options="timetableFull.course" v-model="timetableForm.grade_info" @change="formGradeChange" expand-trigger="hover"></el-cascader>
                            </el-form-item>

                            <el-form-item label="开课日期：" prop="start_time" class="mt-30" v-if="addTableType == 'multiple'">
                                <el-date-picker v-model="timetableForm.start_time" @change="startTimeChange" type="date" :editable="false" :picker-options="pickerBeginDateAfter" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                            </el-form-item>

                            <el-form-item label="上课老师：" prop="teacher_ids" class="mt-30">
                                <el-select placeholder="请选择" v-model="timetableForm.teacher_ids">
                                    <el-option v-for="(item, index) in timetableFull.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="上课教室：" prop="room_id" class="mt-30">
                                <el-select placeholder="请选择"  v-model="timetableForm.room_id" :multiple="addTableType == 'multiple'">
                                    <el-option v-for="(item, index) in timetableFull.class_room" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="重复规则：" prop="loop" class="mt-30" v-if="addTableType == 'multiple' && courseType !== 1">
                                <el-select placeholder="请选择" v-model="timetableForm.loop">
                                    <el-option label="无" value="no"></el-option>
                                    <el-option label="按周循环" value="yes"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>

                        <el-col :span="11" :offset="1">
                            <el-form-item label="课程属性：">
                                <span>{{courseType === 1 ? '普通课程' : '一对一课程'}}</span>
                                <span class="ml-10" v-if="timetableForm.lesson_time">{{timetableForm.lesson_time}}分钟</span>
                                <span class="fc-m ml-10" v-if="timetableForm.no_timetable !== '' && courseType === 1">未排课时：{{timetableForm.no_timetable}}</span>
                            </el-form-item>

                            <template v-if="addTableType == 'multiple'">
                                <el-form-item label="扣课时数：" prop="lesson_num" class="mt-30">
                                    <el-input-number v-model="timetableForm.lesson_num" controls-position="right" :min="1" :max="99"></el-input-number><span class="pl-10">课时</span>
                                </el-form-item>

                                <el-form-item label="辅助老师：" prop="counselor_ids" class="mt-30">
                                    <el-select placeholder="请选择" v-model="timetableForm.counselor_ids" clearable>
                                        <el-option v-for="(item, index) in timetableFull.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                                    </el-select>
                                </el-form-item>
                            </template>
                            <template v-else>
                                <el-form-item label="辅助老师：" prop="counselor_ids" class="mt-30">
                                    <el-select placeholder="请选择" v-model="timetableForm.counselor_ids" clearable>
                                        <el-option v-for="(item, index) in timetableFull.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="扣课时数：" prop="lesson_num" class="mt-30">
                                    <el-input-number v-model="timetableForm.lesson_num" controls-position="right" :min="1" :max="99"></el-input-number><span class="pl-10">课时</span>
                                </el-form-item>
                            </template>
                            <el-form-item label="重复规则：" prop="loop" class="mt-30" v-if="addTableType == 'multiple' && courseType === 1">
                                <el-select placeholder="请选择" v-model="timetableForm.loop">
                                    <el-option label="无" value="no"></el-option>
                                    <el-option label="按周循环" value="yes"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="上课学员：" prop="counselor_ids" class="mt-30 addtimetable-student" v-if="courseType !== 1 && addTableType == 'multiple'">
                                <div class="d-f">
                                    <div class="d-f">
                                        <MyButton type="border" fontColor="fc-m" @click.native="addStudentClick">
                                            {{addStudentBtnChange()}}
                                        </MyButton>
                                    </div>
                                    <span class="fc-m ml-10" v-if="timetableForm.no_timetable !== ''">学员未排课时：{{timetableForm.no_timetable}}</span>
                                </div>
                            </el-form-item>
                            <el-form-item label="排课次数：" prop="loop_time" class="mt-30" v-if="addTableType == 'multiple' && courseType !== 1">
                                <el-input-number :disabled="timetableForm.loop == 'no'" v-model="timetableForm.loop_time" controls-position="right" :min="1" :max="99"></el-input-number><span class="pl-10">次</span>
                            </el-form-item>
                        </el-col>                    
                    </el-row>


                    <el-row class="mt-10">
                        <el-col :span="12">
                            <el-row class="add-date-box d-f">
                                <el-col class="title p-r is-required">上课时间：</el-col>
                                <el-col class="flex1">
                                    <div class="list">
                                        <el-form :model="addDate" size="small" ref="addDateForm" :rules="timeRules" v-for="(addDate, num) in formAddDate" :key="num">
                                            <el-row class="p-r">
                                                <el-col :span="8">
                                                    <el-form-item label-width="0" prop="week">
                                                        <el-select placeholder="某天" v-model="addDate.week" @change="formWeekChange">
                                                            <el-option v-for="(item, index) in timetableWeekList" :key="index" :disabled="(addTableType == 'single' || addTableType == 'edit') && !item.day.past_due" :label="item.name" :value="item.id"></el-option>
                                                        </el-select>
                                                    </el-form-item>
                                                </el-col>

                                                <el-col :span="12" class="p-r" :offset="1">
                                                    <el-form-item  label-width="0" prop="begin_time" class="p-r">
                                                        <el-time-select 
                                                            :editable="false"
                                                            v-model="addDate.begin_time" 
                                                            :picker-options="timePicker" 
                                                            placeholder="时间">
                                                        </el-time-select>
                                                    </el-form-item>
                                                </el-col>

                                                <el-col :span="2" v-if="addTableType == 'multiple' && formAddDate.length > 1" class="p-r delete-time ml-5" @click.native="deleteDateHandle(num)"><i class="el-tag__close el-icon-close"></i></el-col>
                                            </el-row>
                                        </el-form>
                                    </div>
                                    <div class="d-f mt-10" v-if="addTableType == 'multiple'"><MyButton type="border" fontColor="fc-m"  @click.native="addDateHandle">添加时间</MyButton></div>
                                </el-col>
                            </el-row>
                        </el-col>

                        <el-col :span="11" class="d-f f-a-s addtimetable-student" v-if="addTableType == 'single' || addTableType == 'edit' || (addTableType == 'multiple' && courseType === 1)">
                            <div class="label"><span>上课学员：</span></div>
                            <div class="flex1" :class="{'d-f f-a-c': courseType === 2}">
                                <ul v-if="courseType === 1 && checkStudentForm.length" class="d-f f-w-w">
                                    <li v-for="(item, index) in checkStudentForm" :key="index" :class="{'ml-10': index}" class="mb-10">
                                        <span>{{getStudentName(item)}}</span>
                                    </li>
                                </ul>
                                <div class="d-f">
                                    <MyButton type="border" fontColor="fc-m" @click.native="addStudentClick">
                                        {{addStudentBtnChange()}}
                                    </MyButton>
                                </div>

                                <span class="fc-m ml-10" v-if="courseType === 2 && timetableForm.no_timetable !== ''">学员未排课时：{{timetableForm.no_timetable}}  </span>
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <div class="d-f f-j-c mt-30">
                    <MyButton @click.native="doneHandle('addTimeTable')">确定</MyButton>
                </div>
            </el-form>

            <el-dialog :title="courseType === 1 ? '选择普通上课学员' : '选择一对一上课学员'" width="600px" center :visible.sync="addStudentDialog" :close-on-click-modal="false" append-to-body>
                <div class="form-box">
                    <template v-if="courseType === 1">
                        <el-checkbox v-model="studentCheckAll" @change="studentCheckAllChange">全选</el-checkbox>
                        <el-checkbox-group v-model="studentLists" @change="studentCheckChange">
                            <el-checkbox v-for="(item, index) in allStudentLists" :label="item.student_id" :key="index">{{item.student_name}}</el-checkbox>
                        </el-checkbox-group>
                    </template>
                    <el-radio-group v-model="studentRadio" v-else>
                        <el-radio v-for="(item, index) in allStudentLists" :disabled="!(item.lesson_num - item.scheduled)" :key="index" :label="item.student_id">{{item.student_name}}</el-radio>
                    </el-radio-group>

                    <div class="d-f f-j-c mt-30"><MyButton @click.native="checkStudentDone">确定</MyButton></div>
                </div>
            </el-dialog>
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
                            <el-select v-if="scope.row.conflict_data.reason == 2" v-model="conflict_room" :multiple="addTableType == 'multiple'">
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

            gradeTimeTableRadio: 0,    //班级课表，radio筛选
            gradeInfoCheckLists: {total_num: 0, lists: []},

            loading: true,
            addTimetableMask: false,  //新增排课弹窗
            conflictMask: false,   //冲突弹窗
            addStudentDialog: false,  //排课添加学员列表
            addTableType: 'single',
            course_index: 0,
            gradeLists: [],    //选择课程，确定课程的班级列表
            gradeInfo: {student: []},   //选择班级，确定班级详情，填充表单默认值

            studentLists: [],    //普通排课选择学员数据
            studentRadio: '',   //一对一排课，选择学员数据
            checkStudentForm: [],   //form展示选中的学员
            radioStudentForm: '',   //form展示选中的学员

            conflictLists: [],  //冲突列表
            conflict_room: [],   //冲突教室

            other_lists: [],   //批量排课除开冲突，剩下正确的数据列表

            timetable_gradeAll: true,
            timetable_gradeCheck: [],

            timetable_teacherAll: true,
            timetable_teacherCheck: [],

            timetable_roomAll: true,
            timetable_roomCheck: [],

            tableType: 'week',   //按周、日展示课表
            showType: 'default',   //显示类型  default，teacher，classroom
            calendar: {time: new Date().getTime() / 1000},   //日历默认时间
            timeTableInfo: {},     //课表总数据
            weekTableLists: [],  //按周展示，课表列表
            dayTableLists: [],  //按天展示，课表列表
            timetableFull: {},

            studentCheckAll: false,
            allStudentLists: [],   //学员总数

            timePicker: {start: '09:00', step: '00:05', end: '21:45', minTime: 0},
            
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

            courseType: 1,  //课程类型  普通课程、一对一课程

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
                loop: 'no',
                loop_time: ''
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
                loop_time: [
                    {required: true, message: '请输入排课次数'},
                ],
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
            this.getAllTableLists();
        } 
    },
    methods: {
        dialogClose() {
            this.formAddDate.splice(0, this.formAddDate.length);
            // for(let i = 0, len = this.$refs.addDateForm.length; i < len; i++) {this.$refs.addDateForm[i].resetFields()};
            
            Object.keys(this.timetableForm).forEach(v => {
                if(v == 'grade_info') this.timetableForm[v] = [];
                else if(v == 'room_id') this.timetableForm[v] = this.addTableType == 'multiple' ? [] : '';
                else if(v == 'loop') this.timetableForm[v] = 'no';
                else this.timetableForm[v] = '';
            });
            this.timePicker.minTime = 0;

            //排课学员相关数据重置
            this.studentCheckAll = false;
            this.allStudentLists = [];
            this.studentRadio = '';
            this.studentLists = [];
            this.courseType = 1;
            this.timetableForm.no_timetable = '';
            this.checkStudentForm = [];
            this.radioStudentForm = '';

            this.$refs.addTimeTable.resetFields();
        },
        //班级课表radio
        gradeRadioChange() {
            this.gradeInfoCheckLists.lists.splice(0, this.gradeInfoCheckLists.lists.length);
            let num = 0;
            this.timeTableInfo.grade_info.forEach(v => {
                if(this.gradeTimeTableRadio == 0 || v.type == this.gradeTimeTableRadio) {
                    this.gradeInfoCheckLists.lists.push(v);
                    num+= v.num;
                }
            });       
            this.gradeInfoCheckLists.total_num = num;

            this.timetable_gradeAll = true;
            this.timetable_gradeCheck = this.gradeInfoCheckLists.lists;
            this.getGradeTableLists();
        },
        //排课班级全选
        gradeCheckAllChange(val) {
            this.timetable_gradeCheck = val ? this.gradeInfoCheckLists.lists : [];
            this.getGradeTableLists();
        },
        //排课班级多选
        gradeCheckChange(val) {
            let checkedCount = val.length;
            this.timetable_gradeAll = checkedCount === this.gradeInfoCheckLists.lists.length;
            this.getGradeTableLists();
        },
        //排课老师全选
        teacherCheckAllChange(val) {
            this.timetable_teacherCheck = val ? this.timeTableInfo.teacher_info : [];
            this.getTeacherTableLists();
        },
        //排课老师多选
        teacherCheckChange(val) {
            let checkedCount = val.length;
            this.timetable_teacherAll = checkedCount === this.timeTableInfo.teacher_info.length;
            this.getTeacherTableLists();
        },
        //排课教室全选
        roomCheckAllChange(val) {
            this.timetable_roomCheck = val ? this.timeTableInfo.room_info : [];
            this.getRoomTableLists();
        },
        //排课教室多选
        roomCheckChange(val) {
            let checkedCount = val.length;
            this.timetable_roomAll = checkedCount === this.timeTableInfo.room_info.length;
            this.getRoomTableLists();
        },

        //按周、日展示切换
        tableTypeTab(type) {
            this.tableType = type;
            this.getAllTableLists();
        },
        //批量排课，新增多个时间段
        addDateHandle() {
            this.formAddDate.push({begin_time: '', end_time: '', week: ''});
        },
        //删除时间段
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
            this.addTableType = 'edit';
            this.getWeekList(this.calendar.time * 1000, 'timetable');

            this.courseType = detail.course_type;
            if(this.courseType !== 1 && detail.student_grades.length) this.studentRadio = detail.student_grades[0].student_id;
            
            this.formAddDate.splice(0, this.formAddDate.length, {begin_time: detail.time_quantum.begin_time, end_time: '', week: detail.time_quantum.week});

            this.timetableForm.timetable_id = detail.id;
            this.timetableForm.grade_info = [detail.course_id, detail.grade_id]
            this.timetableForm.lesson_num = detail.lesson_num;
            this.timetableForm.lesson_time = detail.lesson_time;
            this.timetableForm.teacher_ids = detail.teacher.length ? detail.teacher[0].id : '';  //任课老师
            this.timetableForm.counselor_ids = detail.counselor.length ? detail.counselor[0].id : '';  //辅助老师
            this.timetableForm.room_id = detail.room_id;

            this.timetableFull.course.forEach(v => {
                if(v.id === detail.course_id) {
                    v.grade.forEach(d => {if(d.id === detail.grade_id) {
                        if(this.courseType === 1) this.timetableForm.no_timetable = d.lesson_num - (+d.scheduled);
                        this.gradeInfo = d;
                    }});
                }
            });

            this.allStudentLists = this.gradeInfo.student_course.concat(this.gradeInfo.student_grade);

            if(this.courseType === 1) {
                this.checkStudentForm = detail.student_grades.map(v => {return v.student_id});
                this.studentLists = this.checkStudentForm;
                this.studentCheckAll = this.checkStudentForm.length === this.allStudentLists.length; 
            }else {
                this.radioStudentForm = detail.student_grades[0].student_id;
                this.studentRadio = this.radioStudentForm;
            }

            
            this.addTimetableMask = true;
        },
        //详情删除
        async detailDelete(detail) {
            let result = await this.$$request.post('api/timetable/delete', {id: detail.id});
            if(!result || !result.status) return 0;

            this.$message.success('删除成功');
            detail.popver = false;
            this.getAllTableLists();
        },
        //新增排课  type: single / multiple
        addTimetable(type, time, full_day, week) {
            this.addTableType = type;

            if(type === 'single') {
                this.timetableForm.room_id = '';

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

                this.formAddDate.push({begin_time: newTime, end_time: '', week: week});
            }else {
                this.timetableForm.room_id = [];
                this.formAddDate.push({begin_time: '', end_time: '', week: ''});               
                this.timetableForm.start_time = new Date().getTime();
            }
            
            this.addTimetableMask = true;
        },
        //新增排课选择班级
        formGradeChange(val) {
            //课程班级改变，学员数据全部重置
            this.studentCheckAll = false;
            this.allStudentLists = [];
            this.studentRadio = '';
            this.studentLists = [];
            this.checkStudentForm = [];
            this.radioStudentForm = '';
            this.timetableForm.no_timetable = '';
            // this.$refs.addTimeTable.resetFields();
            
            this.timetableFull.course.forEach(v => {
                if(v.id === val[0]) {
                    this.timetableForm.lesson_time = v.lesson_time;
                    this.courseType = v.type;

                    v.grade.forEach(d => {if(d.id === val[1]) {
                        if(v.type === 1) this.timetableForm.no_timetable = d.lesson_num - (+d.scheduled);
                        this.gradeInfo = d;
                    }});
                }
            });
            
            console.log(this.gradeInfo)

            this.timetableForm.grade_info = val;
            this.allStudentLists = this.gradeInfo.student_course.concat(this.gradeInfo.student_grade);
            
            if(this.courseType === 1) {
                this.studentLists = this.gradeInfo.student_grade.map(v => {return v.student_id});
                this.checkStudentForm = this.studentLists;
                this.studentCheckAll = (!this.gradeInfo.student_course.length && this.gradeInfo.student_grade.length);
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

            if(this.addTableType == 'multiple') this.timetableForm.room_id.splice(0, this.timetableForm.room_id.length, this.gradeInfo.room_id);  //上课教室
            else this.timetableForm.room_id = this.gradeInfo.room_id;

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
            this.studentLists = val ? this.allStudentLists.map(v => {return v.student_id}) : [];
        },
        //学员checkbox，多选
        studentCheckChange(val) {
            let checkedCount = val.length;
            this.studentCheckAll = checkedCount === this.allStudentLists.length;
        },
        //排课弹窗通过选中的student_id获取student_name
        getStudentName(student_id) {
            let name = '';
            this.allStudentLists.forEach(v => {if(student_id == v.student_id) name = v.student_name});
            return name;
        },
        addStudentClick() {
            console.log(this.allStudentLists)
            if(!this.allStudentLists.length) return this.$message.warning('暂无可选择学员');
            this.addStudentDialog = true;
            
            if(this.courseType === 1) {
                this.studentLists = this.checkStudentForm;
                this.studentCheckAll = this.studentLists.length === this.allStudentLists.length;
            }else {
                this.studentRadio = this.radioStudentForm;
            }
        },
        //选学员按钮判断变化
        addStudentBtnChange() {
            let text = '';
            if(this.courseType === 1) {
                text = this.checkStudentForm.length ? '重新选择' : '选择学员';
            }else {
                text = this.radioStudentForm ? this.getStudentName(this.radioStudentForm) : '选择学员';
            }
            return text;
        },
        checkStudentDone() {
            if(this.courseType === 1) {
                this.checkStudentForm = this.studentLists;
            }else {
                this.radioStudentForm = this.studentRadio;
                this.allStudentLists.forEach(v =>{
                    if(v.student_id == this.studentRadio) this.timetableForm.no_timetable = v.buy_lesson_num - v.scheduled;
                });
            }
            this.addStudentDialog = false;           
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
                            if(this.addTableType == 'multiple') {
                                item[key] = this.conflict_room.length ? this.conflict_room : this.timetableForm.room_id;
                            }else {
                                item[key] = this.conflict_room ? this.conflict_room : this.timetableForm.room_id;
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

            if(this.courseType !== 1 && !this.radioStudentForm) return this.$message.warning('请选择学员！');

            let params = {
                course_id: this.timetableForm.grade_info[0],
                grade_id: this.timetableForm.grade_info[1],
                lesson_num: this.timetableForm.lesson_num,
                teacher_ids: `,${this.timetableForm.teacher_ids},`,
                counselor_ids: `,${this.timetableForm.counselor_ids},`,
                loop_time: this.timetableForm.loop_time,
                room_id : this.timetableForm.room_id,  
                student_lists: this.courseType === 1 ? this.checkStudentForm.map(v => {return {student_id: v}}) : [{student_id: this.radioStudentForm}]
            }
            //单个提交
            if(this.addTableType == 'single' || this.addTableType == 'edit') { 
                params.commit_type = 'single';
                this.timetableWeekList.forEach(v => {if(v.id == this.formAddDate[0].week) {
                    params.begin_time = new Date(`${v.day.newFullDay} ${this.formAddDate[0].begin_time}`).getTime() / 1000;
                    params.end_time = params.begin_time + this.timetableForm.lesson_time * 60;
                }});
                if(this.addTableType == 'edit') params.edit_id = this.timetableForm.timetable_id;
            } else {
                //批量提交
                params.commit_type = 'multiple',
                params.loop = this.timetableForm.loop;

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
                this.getAllTableLists();
                this.getAddTimeTableFull();
                this.conflict_room = this.addTableType == 'multiple' ? [] : '';
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
                            this.conflict_room = v.conflict_data.data.id;
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
            let result = await this.$$request.post('api/timetable/lists', {select_time: Math.round(this.calendar.time), type: this.tableType});
            console.log(result);
            if(!result) return 0;

            this.resultDispose(result.lists.timetable_lists);
            this.timeTableInfo = result.lists;
            this.gradeInfoCheckLists.lists = result.lists.grade_info.map(v => {return v});
            this.gradeInfoCheckLists.total_num = result.lists.total_num;

            this.timetable_gradeAll = true;
            this.timetable_teacherAll = true;
            this.timetable_roomAll = true;
            this.timetable_gradeCheck = this.gradeInfoCheckLists.lists;
            this.timetable_teacherCheck = result.lists.teacher_info;
            this.timetable_roomCheck = result.lists.room_info;
        },
        //班级获取课表
        async getGradeTableLists() {
            if(!this.timetable_gradeCheck.length) return this.resultDispose([]);

            this.loading = true;
            let result = await this.$$request.post('api/timetable/gradeLists', {
                select_time: Math.round(this.calendar.time),
                type: this.tableType,
                grade_id: this.timetable_gradeCheck.map(v => {return v.id})
            });

            if(!result) return 0;
            this.resultDispose(result.lists);
        },
        //老师获取课表
        async getTeacherTableLists() {
            if(!this.timetable_teacherCheck.length) return this.resultDispose([]);

            this.loading = true;
            let result = await this.$$request.post('api/timetable/teacherLists', {
                select_time: Math.round(this.calendar.time),
                type: this.tableType,
                teacher_id: this.timetable_teacherCheck.map(v => {return v.id})
            });

            if(!result) return 0;
            this.resultDispose(result.lists);
        },
        //教室获取课表
        async getRoomTableLists() {
            if(!this.timetable_roomCheck.length) return this.resultDispose([]);

            this.loading = true;
            let result = await this.$$request.post('api/timetable/roomLists', {
                select_time: Math.round(this.calendar.time),
                type: this.tableType,
                room_id: this.timetable_roomCheck.map(v => {return v.id})
            });

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
                        if(full_date == this.$$tools.format(new Date().getTime() / 1000).replace(/\-/g, "/")) {                           
                            past_due = v.id < new Date().getHours() ? true : false;
                        }else if(new Date(`${full_date} 00:00`).getTime() < new Date().getTime()){
                            past_due = true;
                        }else {
                            past_due = false;
                        }
                        
                        weekData.past_due = past_due;
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
            } else {
                let newResult = this.hourData.map(v => {
                    let newData = {id: v.id, course: []};

                    let past_due;

                    let full_date = this.$$tools.format(this.calendar.time).replace(/\-/g, "/");

                    if(full_date == this.$$tools.format(new Date().getTime() / 1000).replace(/\-/g, "/")) { 
                        past_due = v.id <= new Date().getHours();
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
                this.getAllTableLists();
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
        .grade-radio {
            .el-radio+.el-radio {
                margin-left: 25px;
            }
        }
    }
    .content-left {
        width: 300px;
        border-right: 1px #e3e3e3 solid;
    }
    .content-right {
        .timetable-header {
            height: 80px;
        }
        .grade-checkbox {
            .timetable-gradecheckbox {
                width: 100%;
                height: 320px;
                border: 1px #e3e3e3 solid;
                .check-item {
                    height: 45px;
                    line-height: 45px;
                    border-bottom: 1px #e3e3e3 solid;
                    padding: 0 30px;
                    .num {
                        right: 0;
                    }
                }
                .el-checkbox {
                    width: 100%;
                }
            }
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
                width: 20px;
                height: 6px;
                border-radius: 2px;
                margin-right: 10px;
            }
            &.gray::before{
                background-color: #BCBCBC;
            }
            &.green::before{
                background-color: #3FD88A;
            }
            &.yellow::before{
                background-color: #FBBF3F;
            }
            &.red::before{
                background-color: #FC5A5A;
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
                    top: 0;
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
                        min-height: 85px;
                        outline: none;
                        &.gray {
                            border: 1px #C8C8C8 solid;
                            background-color: #f5f5f5;
                        }
                        &.green {
                            border: 1px #3FD88A solid;
                            background-color: #fff;
                            padding-left: 18px;
                        }
                        &.yellow {
                            border: 1px #FBBF3F solid;
                            background-color: #fff;
                            border-left-width: 5px !important;
                        }
                        &.red {
                            border: 1px #FC5A5A solid;
                            background-color: #fff;
                            border-left-width: 5px !important;
                        }
                        .icon {
                            position: relative;
                            top: 3px;
                        }
                        .course-type {
                            right: 0;
                            top: 0;
                            font-size: 12px;
                            width: 18px;
                            line-height: 13px;
                            text-align: center;
                            color: #fff;
                            &.gray {
                                background-color: #C8C8C8;
                            }
                            &.yellow {
                                background-color: #FBBF3F;
                            }
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

    .proportion-box {
        width: 5px;
        height: 100%;
        left: 0;
        top: 0;
        background-color: #f5f5f5;
        .proportion {
            background-color: #3FD88A;
            width: 100%;
            left: 0;
            bottom: 0;
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
            margin-bottom: 5px;
        }
    }
    
    .day-table {
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
                        height: 80px;
                        &.gray {
                            border: 1px #BCBCBC solid;
                            background-color: #FCFCFC;
                            border-left-width: 5px !important;
                        }
                        &.green {
                            border: 1px #3FD88A solid;
                            background-color: #fff;
                            // .title {
                            //     color: #3FD88A;
                            // }
                        }
                        &.yellow {
                            border: 1px #FBBF3F solid;
                            background-color: #fff;
                            border-left-width: 5px !important;
                            // .title {
                            //     color: #FBBF3F;
                            // }
                        }
                        &.red {
                            border: 1px #FC5A5A solid;
                            background-color: #fff;
                            border-left-width: 5px !important;
                            // .title {
                            //     color: #FC5A5A;
                            // }
                        }
                    }
                }
                &:last-child {
                    .right {
                        border-bottom: 1px #e3e3e3 solid;
                    }
                }
            }
        }
    }

    .form-box {
        padding: 0 10px;
        .el-select, .el-date-editor {
            width: 100%;
        }
        .add-date {
            position: absolute;
            right: -35px;
            top: 5px;
        }
        .el-cascader {
            display: block;
        }
        /deep/.el-radio {
            .el-radio__input {
                input {
                    border: none;
                    outline: none;
                    &:active {
                        border: none;
                        outline: none;
                    }
                    &:focus {
                        border: none;
                        outline: none;
                    }
                }
            }
        }
        .add-date-box {
            .title {
                text-align: right;
                width: 120px;
                padding-right: 13px;
                padding-top: 3px;
                &.is-required {
                    &:before {
                        content: '*';
                        color: #f56c6c;
                        margin-right: 4px;
                    }
                }
            }
            .list {
                max-height: 370px;
                overflow: hidden;
                overflow-y: auto;
            }
            .delete-time {
                top: 5px;
                cursor: pointer;
            }
        }
        .addtimetable-student {
            .label {
                line-height: 32px;
                width: 120px;
                text-align: right;
                span {
                    padding-right: 12px;
                }
            }
            li {
                background-color: #f0f2f5;
                border-radius: 3px;
                padding: 0 5px;
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

