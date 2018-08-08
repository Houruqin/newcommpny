<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="课程表">
                <!-- <MyButton type="border" @click.native="addTimetable('multiple')" fontColor="fc-m">批量排课</MyButton> -->
            </TableHeader>

            <div class="content-box">
                <div class="d-f f-j-b mt-20 fc-7">
                    <div>
                        <el-popover placement="bottom-start" width="260" trigger="click" ref="myFilterPopover" popper-class="timetable-filter">
                            <div class="timetable-filter-tab">
                                <ul class="d-f">
                                    <li class="flex1" :class="{'active': timetableFilter == item.id}" v-for="(item, index) in timetableFilterTab" :key="index" @click="timetableFilterTabClick(item)">{{item.name}}</li>
                                </ul>

                                <div class="grade-checkbox mb-30">
                                    <!-- 班级课表 -->
                                    <div v-if="timetableFilter == 'grade'" key="default">
                                        <div class="timetable-gradecheckbox my-scrollbar">
                                            <div class="check-item">
                                                <el-checkbox v-model="timetable_courseAll" @change="gradeCheckAllChange" class="p-r">
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
                                        </div>
                                    </div>

                                    <!-- 老师课表 -->
                                    <div v-else-if="timetableFilter == 'teacher'" key="teacher">
                                        <div class="timetable-gradecheckbox my-scrollbar">
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
                                        </div>
                                    </div>

                                    <div v-else>
                                        <div class="timetable-gradecheckbox my-scrollbar">
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
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span slot="reference" class="cursor-pointer"><i class="iconfont icon-zhankai3 mr-5"></i>本周全部课表</span>
                        </el-popover>
                        <el-radio-group v-model="tableType" size="small" class="table-type-radio ml-50" @change="tableTypeChange">
                            <el-radio-button label="week">按周</el-radio-button>
                            <el-radio-button label="day">按日</el-radio-button>
                        </el-radio-group>
                    </div>
                    <div>
                        <i class="iconfont icon-icon--left fc-m cursor-pointer" @click="lastWeekLists"></i>
                        <el-popover placement="bottom" width="260" trigger="click" ref="calendarPopover" popper-class="calendar-popover">
                            <span slot="reference" class="cursor-pointer ml-5 mr-5">
                                {{defaultWeekList[0].day.newFullDay}}-{{defaultWeekList[6].day.newFullDay}}
                            </span>
                            <div id="myCalendar"></div>
                        </el-popover>
                        <i class="iconfont icon-you fc-m cursor-pointer" @click="nextWeekLists"></i>
                    </div>
                    <div class="timetable-status d-f fc-5">
                        <span class="gray">已结课</span>
                        <span class="green">未满员</span>
                        <span class="yellow">满员</span>
                        <span class="red">超员</span>
                    </div>
                </div>

                <div class="timetable-box mt-20" v-loading="loading">
                    <!-- 周课表 -->
                    <div class="fc-5 week-table" v-if="tableType === 'week'" ref="myTimetable">
                        <el-table :data="weekTableLists" border header-row-class-name="time-table-header" @cell-mouse-enter="timeTableHover" @cell-mouse-leave="timeTableleave"
                            max-height="700" style="width: 100%">
                            <el-table-column align="center" prop="time" width="70" fixed="left" :resizable="false"></el-table-column>
                            <el-table-column align="center" :render-header="tableHeader" min-width="185" :resizable="false">
                                <template slot-scope="scope">
                                    <div class="cursor-pointer item-box" mytype="week_one">
                                        <TimetablePopver v-for="(item, n) in scope.row.week_one.lists" :key="n"
                                            @CB-detailEdit="detailEdit" @CB-deleteTable="CB_deleteTable"
                                            :item="item" :pastdue="scope.row.week_one.past_due"></TimetablePopver>
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_one.past_due"
                                            :class="{'hover': scope.row.week_one.operate == true}"  
                                            @click="addTimetable('single', scope.row.week_one.hours_id, scope.row.week_one.full_date, scope.row.week_one.id)">
                                            <div v-show="scope.row.week_one.operate"><i class="iconfont icon-add"></i></div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column align="center" :render-header="tableHeader" min-width="185" :resizable="false">
                                <template slot-scope="scope">
                                    <div class="cursor-pointer item-box" mytype="week_two">
                                        <TimetablePopver v-for="(item, n) in scope.row.week_two.lists" :key="n" 
                                            @CB-detailEdit="detailEdit" @CB-deleteTable="CB_deleteTable"
                                            :item="item" :pastdue="scope.row.week_two.past_due"></TimetablePopver>
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_two.past_due"
                                            :class="{'hover': scope.row.week_two.operate == true}"  
                                            @click="addTimetable('single', scope.row.week_two.hours_id, scope.row.week_two.full_date, scope.row.week_two.id)">
                                            <div v-show="scope.row.week_two.operate"><i class="iconfont icon-add"></i></div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column align="center" :render-header="tableHeader" min-width="185" :resizable="false">
                                <template slot-scope="scope">
                                    <div class="cursor-pointer item-box" mytype="week_three">
                                        <TimetablePopver v-for="(item, n) in scope.row.week_three.lists" :key="n" 
                                            @CB-detailEdit="detailEdit" @CB-deleteTable="CB_deleteTable"
                                            :item="item" :pastdue="scope.row.week_three.past_due"></TimetablePopver>
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_three.past_due"
                                            :class="{'hover': scope.row.week_three.operate == true}"  
                                            @click="addTimetable('single', scope.row.week_three.hours_id, scope.row.week_three.full_date, scope.row.week_three.id)">
                                            <div v-show="scope.row.week_three.operate"><i class="iconfont icon-add"></i></div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column align="center" :render-header="tableHeader" min-width="185" :resizable="false">
                                <template slot-scope="scope">
                                    <div class="cursor-pointer item-box" mytype="week_four">
                                        <TimetablePopver v-for="(item, n) in scope.row.week_four.lists" :key="n" 
                                            @CB-detailEdit="detailEdit" @CB-deleteTable="CB_deleteTable"
                                            :item="item" :pastdue="scope.row.week_four.past_due"></TimetablePopver>
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_four.past_due"
                                            :class="{'hover': scope.row.week_four.operate == true}"  
                                            @click="addTimetable('single', scope.row.week_four.hours_id, scope.row.week_four.full_date, scope.row.week_four.id)">
                                            <div v-show="scope.row.week_four.operate"><i class="iconfont icon-add"></i></div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column align="center" :render-header="tableHeader" min-width="185" :resizable="false">
                                <template slot-scope="scope">
                                    <div class="cursor-pointer item-box" mytype="week_five">
                                        <TimetablePopver v-for="(item, n) in scope.row.week_five.lists" :key="n" 
                                            @CB-detailEdit="detailEdit" @CB-deleteTable="CB_deleteTable"
                                            :item="item" :pastdue="scope.row.week_five.past_due"></TimetablePopver>
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_five.past_due"
                                            :class="{'hover': scope.row.week_five.operate == true}"  
                                            @click="addTimetable('single', scope.row.week_five.hours_id, scope.row.week_five.full_date, scope.row.week_five.id)">
                                            <div v-show="scope.row.week_five.operate"><i class="iconfont icon-add"></i></div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column align="center" :render-header="tableHeader" min-width="185" :resizable="false">
                                <template slot-scope="scope">
                                    <div class="cursor-pointer item-box" mytype="week_six">
                                        <TimetablePopver v-for="(item, n) in scope.row.week_six.lists" :key="n" 
                                            @CB-detailEdit="detailEdit" @CB-deleteTable="CB_deleteTable"
                                            :item="item" :pastdue="scope.row.week_six.past_due"></TimetablePopver>
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_six.past_due"
                                            :class="{'hover': scope.row.week_six.operate == true}"  
                                            @click="addTimetable('single', scope.row.week_six.hours_id, scope.row.week_six.full_date, scope.row.week_six.id)">
                                            <div v-show="scope.row.week_six.operate"><i class="iconfont icon-add"></i></div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                            <el-table-column align="center" :render-header="tableHeader" min-width="185" :resizable="false">
                                <template slot-scope="scope">
                                    <div class="cursor-pointer item-box" mytype="week_seven">
                                        <TimetablePopver v-for="(item, n) in scope.row.week_seven.lists" :key="n" 
                                            @CB-detailEdit="detailEdit" @CB-deleteTable="CB_deleteTable"
                                            :item="item" :pastdue="scope.row.week_seven.past_due"></TimetablePopver>
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_seven.past_due"
                                            :class="{'hover': scope.row.week_seven.operate == true}"  
                                            @click="addTimetable('single', scope.row.week_seven.hours_id, scope.row.week_seven.full_date, scope.row.week_seven.id)">
                                            <div v-show="scope.row.week_seven.operate"><i class="iconfont icon-add"></i></div>
                                        </div>
                                    </div>
                                </template>
                            </el-table-column>
                        </el-table>
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
                                                    'green': !item.lesson_end_time && item.course_type === 1 && item.student_grades.length < item.grade_limit_num,
                                                    'yellow': !item.lesson_end_time && (item.course_type !== 1 || (item.student_grades.length == item.grade_limit_num)),
                                                    'red': !item.lesson_end_time && item.course_type === 1 && item.student_grades.length > item.grade_limit_num}">

                                            <div class="proportion-box p-a" v-if="!item.lesson_end_time && item.student_grades.length < item.grade_limit_num">
                                                <div class="proportion p-a" :style="{height: (item.student_grades.length / item.grade_limit_num * 100) + '%'}"></div>
                                            </div>

                                            <div class="d-f f-d-c f-j-c pl-15">
                                                <p>
                                                    <span class="fs-16 title">{{item.course_name}}</span>
                                                    <span class="ml-50">{{Math.round((item.end_time - item.begin_time) / 60)}}分钟</span>
                                                    <span class="ml-40">{{item.lesson_num}}课时</span>
                                                    <span v-if="item.course_type !== 1" class="ml-20 course-type fs-12" :class="item.lesson_end_time ? 'gray' : 'yellow'">一对一</span>
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
                                            <div class="d-f f-a-c mr-30" v-if="item.operate && !row.past_due">
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
        </el-card>
        
        <!-- 新增排课弹窗 -->
        <el-dialog :title="addTableType == 'multiple' ? '批量排课' : addTableType == 'single' ? '添加排课'  : '修改排课'" width="900px" center :visible.sync="addTimetableMask" :close-on-click-modal="false" @close="dialogClose">
            <el-form label-width="120px" :model="timetableForm" size="small" ref="addTimeTable" :rules="addRules">
                <div class="form-box" id="form-box">
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="选择课程：" prop="course_id">
                                <el-select placeholder="请选择" v-model="timetableForm.course_id" @change="formGradeChange">
                                    <el-option v-for="(item, index) in planCourseLists" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="上课老师：" prop="teacher_ids">
                                <el-select placeholder="请选择" v-model="timetableForm.teacher_ids" :disabled="!planTeacherLists.length" @change="planTeacherChange">
                                    <el-option v-for="(item, index) in planTeacherLists" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="上课教室：" prop="room_id">
                                <el-select placeholder="请选择"  v-model="timetableForm.room_id" :multiple="addTableType == 'multiple'">
                                    <el-option v-for="(item, index) in $store.state.classRoom" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>

                            <div class="add-date-box">
                                <el-form :model="addDate" size="small" ref="addDateForm" :rules="timeRules" v-for="(addDate, num) in formAddDate" :key="num">
                                    <div class="d-f">
                                        <div class="title p-r is-required pt-3"><span class="pr-12">上课时间：</span></div>
                                        <el-row class="p-r flex1">
                                            <el-col :span="addTableType == 'edit' ? 14 : 8">
                                                <el-form-item v-if="addTableType == 'edit'">
                                                    <el-date-picker v-model="addDate.week" @change="formEditDateChange"
                                                        :picker-options="pickerBeginDateAfter" type="date" :editable="false" 
                                                        placeholder="选择日期" value-format="yyyy/MM/dd">
                                                    </el-date-picker>
                                                </el-form-item>
                                                <el-form-item label-width="0" prop="week" v-else>
                                                    <el-select placeholder="某天" v-model="addDate.week" @change="formWeekChange">
                                                        <el-option v-for="(item, index) in timetableWeekList" :key="index" :disabled="(addTableType == 'single' || addTableType == 'edit') && !item.day.past_due" :label="item.name" :value="item.id"></el-option>
                                                    </el-select>
                                                </el-form-item>
                                            </el-col>

                                            <el-col :span="addTableType == 'edit' ? 9 : 15" class="p-r" :offset="1">
                                                <el-form-item  label-width="0" prop="begin_time" class="p-r">
                                                    <el-time-select 
                                                        :editable="false"
                                                        v-model="addDate.begin_time" 
                                                        :picker-options="timePicker" 
                                                        placeholder="时间">
                                                    </el-time-select>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                    </div>
                                </el-form>
                            </div>
                        </el-col>

                        <el-col :span="11" :offset="1">
                            <el-form-item label="课程属性：">
                                <span>{{courseType === 1 ? '普通课程' : '一对一课程'}}</span>
                                <span class="ml-10" v-if="timetableForm.lesson_time">{{timetableForm.lesson_time}}分钟</span>
                            </el-form-item>

                            <template v-if="addTableType == 'multiple'">
                                <el-form-item label="扣课时数：" prop="lesson_num">
                                    <el-input-number v-model="timetableForm.lesson_num" controls-position="right" :min="1" :max="99"></el-input-number><span class="pl-10">课时</span>
                                </el-form-item>
                            </template>
                            <template v-else>
                                <el-form-item label="扣课时数：" prop="lesson_num">
                                    <el-input-number v-model="timetableForm.lesson_num" controls-position="right" :min="1" :max="99"></el-input-number><span class="pl-10">课时</span>
                                </el-form-item>
                            </template>
                            <el-form-item label="上课学员：" class="addtimetable-student">
                                <div v-if="courseType == 1">
                                    <div class="flex1" :class="{'d-f f-a-c': courseType === 2}">
                                        <ul v-if="courseType === 1 && checkStudentForm.length" class="d-f f-w-w" >
                                            <li v-for="(item, index) in checkStudentForm" :key="index" class="mb-10 mr-10">
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
                                </div>

                                <div v-else>
                                    <div class="d-f">
                                        <div class="d-f">
                                            <MyButton type="border" fontColor="fc-m" @click.native="addStudentClick">
                                                {{addStudentBtnChange()}}
                                            </MyButton>
                                        </div>
                                        <span class="fc-m ml-10" v-if="timetableForm.no_timetable !== ''">学员未排课时：{{timetableForm.no_timetable}}</span>
                                    </div>
                                </div>
                            </el-form-item>
                        </el-col>                    
                    </el-row>
                </div>
                <div class="d-f f-j-c mt-30">
                    <MyButton @click.native="doneHandle('addTimeTable')" :loading="submitLoading.timetable">确定</MyButton>
                </div>
            </el-form>

            <el-dialog :title="courseType === 1 ? '选择普通上课学员' : '选择一对一上课学员'" width="600px" center :visible.sync="addStudentDialog" :close-on-click-modal="false" append-to-body>
                <div class="form-box">
                    <template v-if="courseType === 1">
                        <el-checkbox v-model="studentCheckAll" @change="studentCheckAllChange">全选</el-checkbox>
                        <el-checkbox-group v-model="studentLists" @change="studentCheckChange" class="time-table-student-check">
                            <el-checkbox v-for="(item, index) in allStudentLists" :label="item.id" :key="index">{{item.name}}</el-checkbox>
                        </el-checkbox-group>
                    </template>
                    <el-radio-group v-model="studentRadio" v-else>
                        <el-radio v-for="(item, index) in allStudentLists" :disabled="!item.scheduled"
                        :key="index" :label="item.id">{{item.name}}</el-radio>
                    </el-radio-group>

                    <div class="d-f f-j-c mt-30"><MyButton @click.native="checkStudentDone">确定</MyButton></div>
                </div>
            </el-dialog>
        </el-dialog>

        <!-- 冲突弹窗 -->
        <el-dialog width="1020px" center :visible.sync="conflictMask" :close-on-click-modal="false">
            <div class="conflict-box">
                <h3>排课冲突提醒</h3>
                <p class="mb-20">课程：</p>

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
                                <el-option v-for="(item, index) in $store.state.classRoom" :key="index" :label="item.name" :value="item.id" ></el-option>
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
                    <MyButton type="subm" class="ml-30" @click.native="doneModify" :loading="submitLoading.timetable">确认修改</MyButton>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import TableHeader  from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'
import TimetablePopver from '../../components/common/TimetablePopverNograde'
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
            timetableFilterTab: [
                {id: 'grade', name: '班级'},
                {id: 'teacher', name: '老师'},
                {id: 'room', name: '教室'}
            ],

            submitLoading: {timetable: false},

            nowTime: new Date().getTime(),//时间选择器，选中的当天日期

            gradeTimeTableRadio: 0,    //班级课表，radio筛选
            gradeInfoCheckLists: {total_num: 0, lists: []},

            loading: true,
            addTimetableMask: false,  //新增排课弹窗
            conflictMask: false,   //冲突弹窗
            addStudentDialog: false,  //排课添加学员列表
            addTableType: 'single',
            gradeInfo: {student: []},   //选择班级，确定班级详情，填充表单默认值

            studentLists: [],    //普通排课选择学员数据
            studentRadio: '',   //一对一排课，选择学员数据
            checkStudentForm: [],   //form展示选中的学员
            radioStudentForm: '',   //form展示选中的学员

            conflictLists: [],  //冲突列表
            conflict_room: [],   //冲突教室

            other_lists: [],   //批量排课除开冲突，剩下正确的数据列表

            timetable_courseAll: true,
            timetable_gradeCheck: [],

            timetable_teacherAll: true,
            timetable_teacherCheck: [],

            timetable_roomAll: true,
            timetable_roomCheck: [],

            tableType: 'week',   //按周、日展示课表
            timetableFilter: 'grade',   //显示类型  default，teacher，classroom
            calendar: {time: new Date().getTime() / 1000},   //日历默认时间
            timeTableInfo: {},     //课表总数据
            weekTableLists: [],  //按周展示，课表列表
            dayTableLists: [],  //按天展示，课表列表

            //排课相关填充数据
            planCourseLists: [],
            planTeacherLists: [],
            planStudentLists: [],


            studentCheckAll: false,
            allStudentLists: [],   //学员总数

            timePicker: {start: '09:00', step: '00:05', end: '21:45', minTime: 0},
            
            weekList: [
                {id: 1, name: '周一', type: 'week_one'}, 
                {id: 2, name: '周二', type: 'week_two'}, 
                {id: 3, name: '周三', type: 'week_three'}, 
                {id: 4, name: '周四', type: 'week_four'}, 
                {id: 5, name: '周五', type: 'week_five'}, 
                {id: 6, name: '周六', type: 'week_six'}, 
                {id: 0, name: '周日', type: 'week_seven'}
            ],
            
            defaultWeekList: [],    //课表头部展示周数据
            timetableWeekList: [],   //排课下拉选择周数据

            courseType: 1,  //课程类型  普通课程、一对一课程

            hourData: [],
            timetableForm: {
                no_timetable: '',   //未排课时
                timetable_id: '',
                course_id: '',
                start_time: '',
                lesson_time: '',
                lesson_num: '',
                teacher_ids: '',
                room_id: '',
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
                course_id: [
                    {required: true, message: '请选择课程', trigger: 'change'}
                ],
                room_id: [
                    {required: true, message: '请选择教室', trigger: 'change'}
                ],
                teacher_ids: [
                    {required: true, message: '请选择任课老师', trigger: 'change'}
                ],
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
    methods: {
        tableHeader(elem, {column, $index}) {
            let weekList = this.defaultWeekList;
            return elem('div', {'class': 'header-box'}, [
                elem('div', [
                    elem('p', {
                        'class': {'fc-m': weekList[$index-1].day.isToday}
                    }, weekList[$index-1].name),
                    elem('p', {
                        'class': {'fc-m': weekList[$index-1].day.isToday, 'mt-5': true}
                    }, weekList[$index-1].day.date),
                ]),
                elem('div', {'class': {'today fs-12': true, 'd-b': weekList[$index-1].day.isToday}}, [
                    elem('p', {'class': 'pt-2'}, '今'), elem('p',{'class': 'pt-2'}, '日')
                ])
            ]);
        },
        timetableFilterTabClick(item) {
            if(this.timetableFilter != item.id) this.timetableFilter = item.id;
        },
        //上一周翻页
        lastWeekLists() {
            let last = new Date(`${this.defaultWeekList[0].day.newFullDay} 00:00`).getTime() - ONE_DAY_LONG * 7;
            this.calendar.time = last / 1000;
            this.getAllTableLists();
            this.getWeekList(last, 'default');
        },
        //下一周翻页
        nextWeekLists() {
            let next = new Date(`${this.defaultWeekList[0].day.newFullDay} 00:00`).getTime() + ONE_DAY_LONG * 7;
            this.calendar.time = next / 1000;
            this.getAllTableLists();
            this.getWeekList(next, 'default');
        },
        dialogClose() {
            this.formAddDate.splice(0, this.formAddDate.length);
            // for(let i = 0, len = this.$refs.addDateForm.length; i < len; i++) {this.$refs.addDateForm[i].resetFields()};
            
            Object.keys(this.timetableForm).forEach(v => {
                if(v == 'room_id') this.timetableForm[v] = this.addTableType == 'multiple' ? [] : '';
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

            this.timeTableInfo.course_info.forEach(v => {
                if(this.gradeTimeTableRadio == 0 || v.type == this.gradeTimeTableRadio) {
                    this.gradeInfoCheckLists.lists.push(v);
                    num+= v.num;
                }
            });  

            this.gradeInfoCheckLists.total_num = num;

            this.timetable_courseAll = true;
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
            this.timetable_courseAll = checkedCount === this.gradeInfoCheckLists.lists.length;
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
        tableTypeChange() {
            this.getAllTableLists();
        },
        //批量排课，新增多个时间段
        addDateHandle() {
            this.formAddDate.push({begin_time: '', end_time: '', week: ''});
            setTimeout(v => {document.querySelector('#form-box').scrollTo(0, document.querySelector('#form-box').scrollHeight)}, 10);
        },
        //删除时间段
        deleteDateHandle(index) {
            this.formAddDate.splice(index, 1);
        },
        //周课表hover事件
        timeTableHover(row, col, elem) {
            let item = elem.querySelector('.item-box');
            if(!item) return 0;
            let mytype = elem.querySelector('.item-box').getAttribute('mytype');
            row[mytype].operate = true;
        },
        //周课表leave事件
        timeTableleave(row, col, elem) {
            let item = elem.querySelector('.item-box');
            if(!item) return 0;
            let mytype = elem.querySelector('.item-box').getAttribute('mytype');
            row[mytype].operate = false;
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
            this.timetableForm.course_id = detail.course_id;
            this.timetableForm.lesson_num = detail.lesson_num;
            this.timetableForm.lesson_time = detail.lesson_time;
            this.timetableForm.teacher_ids = detail.teacher.length ? +detail.teacher[0].id : '';  //任课老师
            this.timetableForm.room_id = detail.room_id;

            this.allStudentLists = detail.student_grades.concat(detail.student_audition);

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
        detailDelete(detail) {
            this.$confirm('确定删除排课吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteHandle(detail.id);
            }).catch(() => {return 0});
        },
        async deleteHandle(id) {
            let result = await this.$$request.post('api/timetable/delete', {id: id});
            if(!result || !result.status) return 0;

            this.$message.success('删除成功');
            this.getAllTableLists();
            this.getAddTimeTableFull();
        },
        CB_deleteTable() {
            this.getAllTableLists();
            this.getAddTimeTableFull();
        },
        //新增排课  type: single / multiple
        addTimetable(type, time, full_day, week) {
            if(!this.planCourseLists.length) return this.$message.warning('没有可排课的课程，请新增课程!');

            this.addTableType = type;

            if(type === 'single') {
                this.timetableForm.room_id = '';

                this.getWeekList(this.calendar.time * 1000, 'timetable');
                // if(new Date(`${full_day} 00:00`).getTime() < new Date().getTime() && time < new Date().getHours()) return this.$message.warning('不能给过去时间排课!');
                let newdate = [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&');

                if(this.isSameWeek(this.calendar.time * 1000)) {
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
            this.timetableForm.teacher_ids = '';
            this.planTeacherLists = [];

            this.planCourseLists.forEach(v => {
                if(v.id == val){
                    this.courseType = v.type;
                    this.timetableForm.lesson_time = v.lesson_time;
                    this.planTeacherLists = v.teachers;
                }
            });
        },
        //排课 选择老师确定学员列表
        planTeacherChange(val) {
            this.planCourseLists.forEach(v => {
                if(v.id == this.timetableForm.course_id){
                    v.teachers.forEach(k => {
                        if(k.id == val) this.allStudentLists = k.students;
                    });
                }
            });
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
        //编辑课表时，时间控件选择当天，判断时刻disabled
        formEditDateChange(val) {
            if(new Date(val).toDateString() === new Date().toDateString()) {
                this.timePicker.minTime = [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
            }else this.timePicker.minTime = 0;
        },
        //学员checkbox，全选
        studentCheckAllChange(val) {
            this.studentLists = val ? this.allStudentLists.map(v => {return v.id}) : [];
        },
        //学员checkbox，多选
        studentCheckChange(val) {
            let checkedCount = val.length;
            this.studentCheckAll = checkedCount === this.allStudentLists.length;
        },
        //排课弹窗通过选中的student_id获取student_name
        getStudentName(student_id) {
            let name = '';
            this.allStudentLists.forEach(v => {if(student_id == v.id) name = v.name});
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
            console.log(this.studentLists)
            if(this.courseType === 1) {
                this.checkStudentForm = this.studentLists;
            }else {
                this.radioStudentForm = this.studentRadio;
                this.allStudentLists.forEach(v =>{
                    if(v.id == this.studentRadio) this.timetableForm.no_timetable = v.scheduled;
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
            console.log(this.conflict_room)
            let lists = this.conflictLists.map(v => {
                let item = {};
                for(let key in v) {
                    if(key != 'begin_hours' && key != 'conflict_data') {
                        if(key == 'begin_time') {
                            item[key] = new Date(`${this.$$tools.format(v[key] / 1000).replace(/\-/g, "/")} ${v.begin_hours}`).getTime() / 1000;
                        }else if(key == 'end_time'){
                            item[key] = item.begin_time + this.timetableForm.lesson_time * 60;
                        }else if(key == 'room_id'){
                            console.log(this.conflict_room)
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

            let params = {lists: lists};

            if(this.addTableType == 'edit') params.id = this.timetableForm.timetable_id;

            console.log(params);
            this.getConflictLists(params);
        },
        //批量、单个排课参数整理
        addTimeTableParams() {
            console.log(this.timetableForm)

            if(this.courseType !== 1 && !this.radioStudentForm) return this.$message.warning('请选择学员！');

            let params = {
                course_id: this.timetableForm.course_id,
                lesson_num: this.timetableForm.lesson_num,
                teacher_ids: this.timetableForm.teacher_ids,
                // loop_time: this.timetableForm.loop_time,
                room_id : this.timetableForm.room_id,  
                student_lists: this.courseType === 1 ? this.checkStudentForm.map(v => {return {student_id: v}}) : [{student_id: this.radioStudentForm}]
            }
            //单个提交
            if(this.addTableType == 'single') { 
                // params.commit_type = 'single';
                this.timetableWeekList.forEach(v => {if(v.id == this.formAddDate[0].week) {
                    params.begin_time = new Date(`${v.day.newFullDay} ${this.formAddDate[0].begin_time}`).getTime() / 1000;
                    params.end_time = params.begin_time + this.timetableForm.lesson_time * 60;
                }});
            } else if(this.addTableType == 'edit') {
                params.commit_type = 'single';
                console.log(this.formAddDate)
                params.begin_time = new Date(`${this.formAddDate[0].week} ${this.formAddDate[0].begin_time}`).getTime() / 1000;
                params.end_time = params.begin_time + this.timetableForm.lesson_time * 60;
                params.edit_id = this.timetableForm.timetable_id;
            }else{
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
            if(this.submitLoading.timetable) return 0;
            this.submitLoading.timetable = true;

            this.conflict_room = this.addTableType == 'multiple' ? [] : '';

            let result = await this.$$request.post('api/timetable/notModelCourse', params);
            console.log(result);
            this.submitLoading.timetable = false;
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
                    };
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
            let result = await this.$$request.get('api/timetable/notModelFill');
            console.log(result);
            this.planCourseLists = result.course;
        },
        //默认获取全部课表
        async getAllTableLists() {
            this.loading = true;
            let result = await this.$$request.post('api/timetable/notModelList', {select_time: Math.round(this.calendar.time), type: this.tableType});
            console.log(result);
            if(!result) return 0;

            this.resultDispose(result.lists.timetable_lists);
            this.timeTableInfo = result.lists;

            this.gradeInfoCheckLists.lists = result.lists.course_info.map(v => {return v});
            this.gradeInfoCheckLists.total_num = result.lists.total_num;
            this.gradeTimeTableRadio = 0;

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
            let result = await this.$$request.post('api/timetable/noGradeCourseLists', {
                select_time: Math.round(this.calendar.time),
                type: this.tableType,
                course_id: this.timetable_gradeCheck.map(v => {return v.id})
            });

            if(!result) return 0;
            this.resultDispose(result.lists);
        },
        //老师获取课表
        async getTeacherTableLists() {
            if(!this.timetable_teacherCheck.length) return this.resultDispose([]);

            this.loading = true;
            let result = await this.$$request.post('api/timetable/noGradeTeacherLists', {
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
            let result = await this.$$request.post('api/timetable/noGradeRoomLists', {
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
                    let newData = {id: v.id, time: v.name};
                    this.defaultWeekList.forEach(w => {
                        newData[w.type] = {
                            full_date: w.day.newFullDay,
                            lists: [],
                            id: w.id,
                            operate: false,
                            hours_id: v.id
                        };

                        let past_due, full_date = w.day.newFullDay;
                        if(full_date == this.$$tools.format(new Date().getTime() / 1000).replace(/\-/g, "/")) {                           
                            past_due = v.id < new Date().getHours() ? true : false;
                        }else if(new Date(`${full_date} 00:00`).getTime() < new Date().getTime()){
                            past_due = true;
                        }else {
                            past_due = false;
                        };

                        newData[w.type].past_due = past_due;

                        resultData.forEach(d => {
                            let nowDate = new Date(d.begin_time * 1000);
                            let hour = nowDate.getHours();
                            let week = nowDate.getDay();

                            d.time_quantum = {
                                begin_time: this.$$tools.formatTime(d.begin_time),
                                end_time: this.$$tools.formatTime(d.end_time),
                                week: this.$$tools.format(d.begin_time)
                            };

                            if(hour == v.id && w.id == week) {
                                newData[w.type].lists.push(d);
                            }
                        });
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
                            week: this.$$tools.format(d.begin_time)
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

                // let isToday = this.$$tools.format(newTime / 1000) === this.$$tools.format(now.getTime() / 1000) ? true : false;  //是否是当天
                let isToday = new Date(newTime).toDateString() === new Date().toDateString();
                if(this.isSameWeek(nowTime)) {
                    past_due = newTime >= nowTime ? true : false;  //是否过了今天
                }else {
                    past_due = true;
                }

                let newFullDay = this.$$tools.format(newTime / 1000);

                return {
                    id: d.id,
                    name: d.name,
                    type: d.type,
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
            width: 260,
            height: 280,
            customClass: 'my-calender',
            onSelected: (view, date, data) => {
                if(date.getTime() / 1000 === this.calendar.time) return 0;
                this.calendar.time = date.getTime() / 1000;
                this.getWeekList(date.getTime(), 'default');
                // this.nowTime = date.getTime();
                this.getAllTableLists();
            }
        });
    },
    created() {
        for(let a = 9; a <= 21; a++) {this.hourData.push({id: a, name: `${a}:00`})};
        this.getWeekList(null, 'default');
        this.getWeekList(null, 'timetable');
        this.getAllTableLists();
        this.getAddTimeTableFull();


        this.$nextTick(v => {
            let width = document.querySelector('.home-main-box').clientWidth;
            if(width <= 1070) document.querySelector('.week-table').style.width = '990px';
            else document.querySelector('.week-table').style.width = (width - 80) + 'px';
        })
    },
    components: {TableHeader, MyButton, TimetablePopver}
}
</script>

<style lang="less" scoped>
    .content-box {
        overflow: hidden;
        overflow-x: auto;
        .timetable-status {
            span {
                position: relative;
                font-size: 12px;
                margin: 0 10px;
                &::before {
                    content: '';
                    display: block;
                    width: 12px;
                    height: 5px;
                    position: relative;
                    left: 50%;
                    bottom: 5px;
                    transform: translateX(-50%);
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
    }
    .week-table {
        /deep/ .el-table--border, .el-table--group {
            // border-color: #e3e3e3;
        }
        /deep/ .time-table-header {
            th {
                padding: 0;
                &.is-leaf {
                    // border-color: #e3e3e3;
                }
            }
            .header-box {
                display: -webkit-flex;
                display: flex;
                justify-content: center;
                line-height: normal;
                font-weight: normal;
                color: #555;
                padding: 10px;
                div {
                    line-height: normal;
                }
            }
        }
        /deep/ .el-table--border td {
            // border-color: #e3e3e3;
        }
        /deep/ .today {
            display: none;
            &.d-b {
                display: block;
                padding: 0;
                width: 15px;
                color: #fff;
                background-color: #45DAD5;
            }
        }

        /deep/ .el-table__body {
            tr.hover-row > td {
                &:not(:first-child) {
                    background-color: #f8f8f8;
                }
                &:first-child {
                    background-color: #fff;
                }
            }
            td {
                padding: 0;
                &:not(:first-child) {
                    background-color: #f8f8f8;
                    vertical-align: top;
                }
                .cell {
                    padding: 0;
                    min-height: 30px;
                    line-height: 30px;
                    .add-course {
                        width: 100%;
                        height: 30px;
                        &.hover {
                            background-color: #fff;
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
    
    .day-table {
        height: 660px;
        ul {
            li {
                // width: 1260px;
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
                    .course-type {
                        color: #fff;
                        padding: 0 5px;
                        &.gray {
                            background-color: #BCBCBC;
                        }
                        &.yellow {
                            background-color: #FBBF3F;
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
        max-height: 450px;
        overflow: hidden;
        overflow-y: auto;
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
                &.is-required {
                    &:before {
                        content: '*';
                        color: #f56c6c;
                        margin-right: 4px;
                    }
                }
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
            ul {
                max-height: 100px;
                overflow: hidden;
                overflow-y: auto;
                li {
                    background-color: #f0f2f5;
                    border-radius: 3px;
                    padding: 0 5px;
                }
            }
        }
        .time-table-student-check {
            max-height: 200px;
            overflow: hidden;
            overflow-y: auto;
            .el-checkbox {
                margin-left: 0;
                margin-right: 30px;
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


    .timetable-filter {
        .timetable-filter-tab {
            // /deep/ .el-tabs__active-bar {
            //     background-color: #45DAD5;
            // }
            // /deep/ .el-tabs__item {
            //     // padding: 0 29px !important;
            //     &.is-active {
            //         color: #45DAD5;
            //     }
            //     &:hover {
            //         color: #45DAD5;
            //     }
            // }
            ul {
                border-bottom: 2px #e9e9e9 solid;
                li {
                    text-align: center;
                    line-height: 40px;
                    position: relative;
                    cursor: pointer;
                    &.active {
                        color: #45DAD5;
                        &::after {
                            content: '';
                            display: block;
                            width: 60%;
                            height: 2px;
                            position: absolute;
                            left: 50%;
                            transform: translateX(-50%);
                            bottom: -2px;
                            background-color: #45DAD5;
                        }
                    }
                    &:hover {
                        color: #45DAD5;
                    }
                }
            }
            .grade-checkbox {
                padding: 0 10px;
                .timetable-gradecheckbox {
                    width: 100%;
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
    }
    .table-type-radio {
        /deep/ .el-radio-button__orig-radio:checked+.el-radio-button__inner {
            background-color: #45DAD5;
            border-color: #45DAD5;
            box-shadow: 1px 0 0 0 #45DAD5;
        }
        /deep/ .el-radio-button {
            &.is-active .el-radio-button__inner {
                &:hover {
                    color: #fff;
                }
            }
            .el-radio-button__inner {
                &:hover {
                    color: #45DAD5;
                }
            }
        }
    }

</style>

