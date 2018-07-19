<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="课程管理">
                <MyButton @click.native="addCourse">添加课程</MyButton>
            </TableHeader>
            <!-- <div class="content-box my-scrollbar"> -->
                <!-- <el-scrollbar v-if="courseLists.length" style="height: 100%;"> -->
                    <div class="course-list-box" :class="{'mt-15': index}" v-for="(course, index) in courseLists" :key="index">
                        <div class="list-header d-f p-r f-a-c f-j-b pl-20 pr-20">
                            <div class="d-f f-a-c">
                                <span class="fc-7 fs-16 d-f f-a-c">
                                    <i class="fc-5">{{course.name}}</i>
                                    <i @click="editCourse(course)" class="cursor-pointer ml-10"><img src="../../images/common/edit-icon.png"></i>
                                </span>
                                <span class="fc-9 course_type ml-20">{{course.type === 1 ? '普通课程' : '一对一课程'}}</span>
                            </div>
                            <div class="d-f f-a-c">
                                <span class="d-f f-a-c fc-m cursor-pointer" @click="addClassRoom(course.id, course.type)">
                                    <img src="../../images/common/add.png" alt="">
                                    <i class="pl-10">添加班级</i>
                                </span>
                                <span class="ml-40 cursor-pointer" @click="course.collapse = !course.collapse">
                                    <img v-if="!course.collapse" src="../../images/common/collapse-false.png" alt="">
                                    <img v-else src="../../images/common/collapse-true.png" alt="">
                                </span>
                                <!-- <MyButton @click.native="addClassRoom(course.id, course.type)" type="border" fontColor="fc-m">添加班级</MyButton> -->
                            </div>
                        </div>
                        <div class="grade-table-box" :class="{'is-collapse': course.collapse}">
                            <el-table :data="course.class_lists" v-if="course.class_lists.length" cell-class-name="class-list-cell" strip>
                                <el-table-column label="序号" type="index" align="center"></el-table-column>
                                <el-table-column label="班级" align="center">
                                    <template slot-scope="scope">
                                        <div>
                                            <el-popover width="800" placement="right" trigger="click" ref="detailPopover" v-model="scope.row.popver" @hide="timetableCheckbox = false">
                                                <p class="fc-m fs-16 t-a-c mt-10 p-r">
                                                    <span>{{scope.row.name}}</span>
                                                    <a class="p-a popver-close-icon mr-5 cursor-pointer" @click="scope.row.popver = false">
                                                        <img src="../../images/common/close-icon.png" alt="">
                                                    </a>
                                                </p>
                                                <div class="detail">
                                                    <div class="detail-top">
                                                        <div class="d-f">
                                                            <ul class="detail-left">
                                                                <li>课程：<span>{{course.name}}</span></li>
                                                                <li>课时：<span>{{scope.row.lesson_num}}课时</span></li>
                                                                <li>
                                                                    任课老师：<span v-if="scope.row.teacher_lists.length">
                                                                        <i v-for="(teacher, index) in scope.row.teacher_lists" :key="index"><i v-if="index > 0">/</i>{{teacher.name}}</i>
                                                                    </span>
                                                                </li>
                                                                <li>开课日期：<span>{{$$tools.format(scope.row.start_time)}}</span></li>
                                                                <li>可否试听：<span>{{scope.row.is_listen ? '是' : '否'}}</span></li>                                                   
                                                            </ul>
                                                            <ul class="flex1">
                                                                <li>人数上限：<span>{{scope.row.limit_num}}</span></li>
                                                                <li>剩余课时：<span>{{scope.row.lesson_num_remain}}</span></li>
                                                                <li>
                                                                    辅助老师：<span v-if="scope.row.counselor_lists.length">
                                                                        <i v-for="(teacher, index) in scope.row.counselor_lists" :key="index"><i v-if="index > 0">/</i>{{teacher.name}}</i>
                                                                    </span>
                                                                </li>
                                                                <li>上课教室：<span>{{scope.row.room && scope.row.room.name}}</span></li>
                                                            </ul>
                                                        </div>
                                                        <div class="mt-20 d-f">
                                                            <span class="fc-9">班级学员：</span>
                                                            <span class="d-f f-w-w flex1" v-if="scope.row.student.length">
                                                                <i v-for="(student, index) in scope.row.student" class="pb-5 pr-20" :key="index">{{student.name}}</i>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div class="detail-bottom pb-30 p-r mt-50">
                                                        <div class="timetable-edit p-a cursor-pointer" @click="timetableEditClick(course.id, scope.$index)">{{timetableCheckbox ? '取消' : '编辑'}}</div>
                                                        <el-table :data="scope.row.timetable" height="280" stripe @selection-change="handleSelectionChange" :ref="'multipleTable_' + course.id + '_' + scope.$index">
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
                                                            <el-table-column label="上课学员" prop="students" align="center"></el-table-column>
                                                            <el-table-column label="结课状态" align="center">
                                                                <template slot-scope="item">{{item.row.lesson_end_time ? '已结课' : '未结课'}}</template>
                                                            </el-table-column>
                                                        </el-table>

                                                        <div class="d-f f-j-c mt-20" v-if="timetableCheckbox"><MyButton @click.native="deleteTimeTableHandle(scope.row.timetable)" :type="deleteTimeTableLists.length ? 'main' : 'gray'">删除</MyButton></div>
                                                    </div>
                                                </div>
                                                <a slot="reference" class="cursor-pointer fc-m t-a-c">{{scope.row.name}}</a>
                                            </el-popover>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="开课日期" align="center">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.start_time * 1000 - new Date().getTime() > 5*360*24*60*60*1000 ? '' : $$tools.format(scope.row.start_time)}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="任课老师/辅助老师" align="center">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.teacher_lists.length ? scope.row.teacher_lists[0].name : ''}}<i v-if="scope.row.counselor_lists.length">/</i>{{scope.row.counselor_lists.length ? scope.row.counselor_lists[0].name : ''}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="上课学员" align="center">
                                    <template slot-scope="scope">
                                        <div v-if="course.type === 2">{{scope.row.student.length}}</div>
                                        <div v-else class="d-f f-a-c f-j-c">
                                            <div :class="scope.row.student.length < scope.row.limit_num ? 'fc-5' : scope.row.student.length == scope.row.limit_num ? 'fc-m' : 'fc-r'">{{scope.row.student.length}}/{{scope.row.limit_num}}</div>
                                            <el-popover v-if="scope.row.student.length > scope.row.limit_num" popper-class="grade-student-popver" placement="right" width="325" trigger="click" content="该班级人数已经超过最大上限，请给多余学员另外分班！">
                                                <div slot="reference" class="ml-5 cursor-pointer"><img src="../../images/common/zhuyi.png" alt=""></div>
                                            </el-popover>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column prop="lesson_num_remain" label="剩余课时" align="center"></el-table-column>
                                <el-table-column label="上课状态" align="center">
                                    <template slot-scope="scope">
                                        <div class="fc-f fs-12 course-status">
                                            <div class="d-f f-a-c f-j-c">
                                                <span :class="{'green': scope.row.gradeStatus.id === 'yes', 'red': scope.row.gradeStatus.id === 'no', 'gray': scope.row.gradeStatus.id === 'stop'}">
                                                    {{scope.row.gradeStatus.name}}
                                                </span>
                                            </div>
                                        </div>
                                    </template>
                                </el-table-column>
                                <el-table-column label="操作" align="center">
                                    <template slot-scope="scope">
                                        <el-dropdown trigger="click" @command="handleCommand" @visible-change="scope.row.operationStatus = !scope.row.operationStatus">
                                            <a class="unfold-icon cursor-pointer el-dropdown-link" :class="{'rotate': scope.row.operationStatus}"><img src="../../images/common/drop-up.png"></a>
                                            <el-dropdown-menu slot="dropdown">
                                                <el-dropdown-item v-for="(item, index) in operationLists" :key="index" :command="{type:item.type, grade_info: scope.row, course_info: course}">
                                                    <!--未开课-->
                                                    <template v-if="scope.row.begin_status == 0">                            
                                                        <span v-if="item.type == 'plan' || item.type == 'edit' || item.type == 'delete'">{{item.text}}</span>
                                                    </template>
                                                    <!--已开课-->
                                                    <template v-else>
                                                        <!--停课-->
                                                        <template v-if="scope.row.status == -3">
                                                            <span v-if="item.type == 'begin' || item.type == 'over' || item.type == 'edit' || item.type == 'delete'">{{item.text}}</span>
                                                        </template>

                                                        <!--结课-->
                                                        <template v-else-if="scope.row.status == -2">
                                                            <span :class="{'fc-9': item.type == 'plan' && scope.row.timetable.length == scope.row.lesson_num && course.type === 1}" v-if="item.type == 'plan' || item.type == 'edit' || item.type == 'delete'">{{item.text}}</span>
                                                        </template>

                                                        <!--正常开课-->
                                                        <template v-else>
                                                            <span :class="{'fc-9': item.type == 'plan' && scope.row.timetable.length == scope.row.lesson_num && course.type === 1}" v-if="item.type == 'plan' || item.type == 'over' || item.type == 'stop' || item.type == 'edit' || item.type == 'delete'">{{item.text}}</span>
                                                        </template>
                                                    </template>
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </el-dropdown>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    <!-- </div> -->
                <!-- </el-scrollbar> -->
                <div v-if="!courseLists.length" class="d-f f-a-c f-j-c fc-7 course-lits-nothing"><span>暂无数据</span></div>
            </div>
        </el-card>
        <!-- 添加、修改课程弹窗 -->
        <AddCourseDialog :dialogStatus="dialogStatus.course" :type="courseOperate" :editDetail="editDetail" 
            @CB-dialogStatus="CB_dialogStatus" @CB-addCourse="CB_addCourse">
        </AddCourseDialog>

        <!-- 添加/修改班级弹窗 -->
        <el-dialog :title="classEdit ? '修改班级' : '添加班级'" width="800px" center :visible.sync="dialogStatus.grade" :close-on-click-modal="false" @close="dialogClose('classRoomForm')">
            <div class="form-box">
                <el-form :model="classForm" label-width="120px" size="small" ref="classRoomForm" :rules="classRules">
                    <el-row class="add-lesson-top">
                        <el-col :span="11">
                            <el-form-item label="课程名称："><span>{{classForm.course_name}}</span></el-form-item>
                            <el-form-item label="班级名称：" prop="name" class="mt-30">
                                <el-input v-model.trim="classForm.name"></el-input>
                            </el-form-item>
                            <el-form-item label="任课老师：" prop="teacher_ids" class="mt-30">
                                <el-select v-model="classForm.teacher_ids" placeholder="必选">
                                    <el-option
                                        v-for="(item, index) in classSelectInfo.teacher"
                                        :key="index"
                                        :label="item.name"
                                        :value="item.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="开班日期：" prop="start_time" class="mt-30" v-if="courseType === 1">
                                <el-date-picker v-model.trim="classForm.start_time" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                            </el-form-item>
                            <el-form-item label="上课教室：" prop="room_id" class="mt-30"  v-if="courseType !== 1">
                                <el-select v-model="classForm.room_id" placeholder="请选择">
                                    <el-option
                                        v-for="item in classSelectInfo.room  "
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            <el-form-item label="可否试听：" prop="is_listen" class="mt-30" v-if="courseType === 1">
                                <el-select v-model="classForm.is_listen" placeholder="请选择">
                                    <el-option label="是" :value="1"></el-option>
                                    <el-option label="否" :value="0"></el-option>
                                </el-select>
                            </el-form-item>                           
                        </el-col>

                        <el-col :span="11" :offset="1">
                            <el-form-item label="课程类型："><span>{{courseType === 1 ? '普通课程' : '一对一课程'}}</span></el-form-item>
                            <el-form-item label="班级课时：" prop="lesson_num" class="mt-30" v-if="courseType === 1">
                                <el-input-number v-model="classForm.lesson_num" controls-position="right" :min="1" :max="200"></el-input-number><span class="pl-10">课时</span>
                            </el-form-item>
                            <el-form-item label="辅助老师：" class="mt-30" prop="counselor_ids">
                                <el-select v-model="classForm.counselor_ids" placeholder="可选" clearable>
                                    <el-option
                                        v-for="(item, index) in classSelectInfo.teacher"
                                        :key="index"
                                        :label="item.name"
                                        :value="item.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                            
                            <el-form-item label="开班日期：" prop="start_time" class="mt-30" v-if="courseType !== 1">
                                <el-date-picker v-model.trim="classForm.start_time" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                            </el-form-item>
                            
                            <el-form-item label="人数上限：" prop="limit_num" class="mt-30" v-if="courseType === 1">
                                <el-input-number v-model="classForm.limit_num" controls-position="right" :min="1" :max="99"></el-input-number>
                            </el-form-item>

                            <el-form-item label="上课教室：" prop="room_id" class="mt-30"  v-if="courseType === 1">
                                <el-select v-model="classForm.room_id" placeholder="请选择">
                                    <el-option
                                        v-for="item in classSelectInfo.room  "
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id">
                                    </el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="班级学员：">
                        <el-checkbox v-model="studentCheckAll" @change="studentCheckAllChange">全选</el-checkbox>
                        <el-checkbox-group v-model="studentLists" @change="studentCheckChange" v-if="allStudentLists.length">
                            <el-checkbox v-for="(item, index) in allStudentLists" :label="item" :key="index">{{item.student_name}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>

                    <div class="d-f f-j-c">
                        <MyButton @click.native="doneHandle">确定</MyButton>
                    </div>
                </el-form>
            </div>
        </el-dialog>
        <!-- 排课弹窗 -->
        <el-dialog title="批量排课" width="900px" center :visible.sync="dialogStatus.timetable" :close-on-click-modal="false" @close="dialogClose('addTimeTable')">
            <el-form label-width="120px" :model="timetableForm" size="small" ref="addTimeTable" :rules="timetableRules">
                <div class="form-box">
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="排课班级：" >{{timetableForm.class_name}}</el-form-item>

                            <el-form-item label="开课日期：" prop="start_time" class="mt-30">
                                <el-date-picker v-model="timetableForm.start_time" @change="startTimeChange" type="date" :editable="false" :picker-options="pickerBeginDateAfter" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                            </el-form-item>

                            <el-form-item label="上课老师：" prop="teacher_ids" class="mt-30">
                                <el-select placeholder="请选择" v-model="timetableForm.teacher_ids">
                                    <el-option v-for="(item, index) in classSelectInfo.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="上课教室：" prop="room_id" class="mt-30">
                                <el-select placeholder="请选择"  v-model="timetableForm.room_id" multiple>
                                    <el-option v-for="(item, index) in classSelectInfo.room" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="重复规则：" prop="loop" class="mt-30" v-if="courseType !== 1">
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

                            <el-form-item label="扣课时数：" prop="lesson_num" class="mt-30">
                                <el-input-number v-model="timetableForm.lesson_num" controls-position="right" :min="1" :max="99"></el-input-number><span class="pl-10">课时</span>
                            </el-form-item>

                            <el-form-item label="辅助老师：" prop="counselor_ids" class="mt-30">
                                <el-select placeholder="请选择" v-model="timetableForm.counselor_ids" clearable>
                                    <el-option v-for="(item, index) in classSelectInfo.teacher" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="重复规则：" prop="loop" class="mt-30" v-if="courseType === 1">
                                <el-select placeholder="请选择" v-model="timetableForm.loop">
                                    <el-option label="无" value="no"></el-option>
                                    <el-option label="按周循环" value="yes"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="上课学员：" prop="counselor_ids" class="mt-30 addtimetable-student" v-if="courseType !== 1">
                                <div class="d-f">
                                    <div class="d-f">
                                        <MyButton type="border" fontColor="fc-m" @click.native="addStudentClick">
                                            {{addStudentBtnChange()}}
                                        </MyButton>
                                    </div>
                                    <span class="fc-m ml-10" v-if="timetableForm.no_timetable !== ''">学员未排课时：{{timetableForm.no_timetable}}</span>
                                </div>
                            </el-form-item>

                            <el-form-item label="排课次数：" prop="loop_time" class="mt-30" v-if="courseType !== 1">
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
                                                            <el-option v-for="(item, index) in weekList" :key="index" :label="item.name" :value="item.id"></el-option>
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

                                                <el-col :span="2" v-if="formAddDate.length > 1" class="p-r delete-time ml-5" @click.native="deleteDateHandle(num)"><i class="el-tag__close el-icon-close"></i></el-col>
                                            </el-row>
                                        </el-form>
                                    </div>
                                    <div class="d-f mt-10"><MyButton type="border" fontColor="fc-m"  @click.native="addDateHandle">添加时间</MyButton></div>
                                </el-col>
                            </el-row>
                        </el-col>

                        <el-col :span="11" class="d-f f-a-s addtimetable-student" v-if="courseType === 1">
                            <div class="label"><span>上课学员：</span></div>
                            <div class="flex1">
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
                            </div>
                        </el-col>
                    </el-row>
                </div>

                <div class="d-f f-j-c mt-30">
                    <MyButton @click.native="addTimeTableDone" :loading="submitLoading.timetable">确定</MyButton>
                </div>
            </el-form>

            <el-dialog :title="courseType === 1 ? '选择普通上课学员' : '选择一对一上课学员'" width="600px" center :visible.sync="addStudentDialog" :close-on-click-modal="false" append-to-body>
                <div class="form-box">
                    <template v-if="courseType === 1">
                        <el-checkbox v-model="timetable_studentCheckAll" @change="timetable_studentCheckAllChange">全选</el-checkbox>
                        <el-checkbox-group v-model="timetable_studentLists" @change="timetable_studentCheckChange" v-if="allStudentLists.length">
                            <el-checkbox v-for="(item, index) in allStudentLists" :label="item.student_id" :key="index">{{item.student_name}}</el-checkbox>
                        </el-checkbox-group>
                    </template>
                    <el-radio-group v-model="studentRadio" v-else>
                        <el-radio v-for="(item, index) in allStudentLists" :key="index" :label="item.student_id">{{item.student_name}}</el-radio>
                    </el-radio-group>

                    <div class="d-f f-j-c mt-30"><MyButton @click.native="checkStudentDone">确定</MyButton></div>
                </div>
            </el-dialog>
        </el-dialog>

        <!-- 冲突弹窗 -->
        <el-dialog width="1020px" center :visible.sync="dialogStatus.conflict" :close-on-click-modal="false">
            <div class="conflict-box">
                <h3>排课冲突提醒</h3>
                <p class="mb-20">班级：{{timetableForm.class_name}}</p>

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
                            <el-select v-if="scope.row.conflict_data.reason == 2" v-model="conflict_room" multiple>
                                <el-option v-for="(item, index) in classSelectInfo.room" :key="index" :label="item.name" :value="item.id" ></el-option>
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
                    <MyButton type="gray" @click.native="dialogStatus.conflict = false">返回编辑</MyButton>
                    <MyButton type="subm" class="ml-30" @click.native="doneModify" :loading="submitLoading.timetable">确认修改</MyButton>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>

import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import {courseStatic} from '../../script/static'
import AddCourseDialog from '../../components/dialog/AddCourse'
import Bus from '../../script/bus'
import Vue from 'vue';

export default {
    data() {
        return {
            submitLoading: {
                grade: false, timetable: false
            },
            conflictType: {
                reason1: '老师冲突 请修改时间',
                reason2: '教室冲突 请修改时间或教室',
                reason3: '学员冲突 请修改时间'
            },

            deleteTimeTableLists: [],    //删除课表，选中的课表
            timetableCheckbox: false,    //班级详情删除课表，checkbox是否显示

            courseLists: [],  
            
            conflictLists: [],   //冲突列表
            conflict_room: [],

            other_lists: [],   //正常排课列表

            dialogStatus: {timetable: false, conflict: false, course: false, grade: false},
            addStudentDialog: false,

            editDetail: {},


            classSelectInfo: {},
            classEdit: false,
            courseOperate: 'add',

            courseType: 1,  //课程类型  普通课程、一对一课程

            allStudentLists: [],   //所有学员列表    编辑是，等于班级学员+未分班学员
            studentCheckAll: false,   //添加班级，学员全选状态
            timetable_studentCheckAll: false,   //添加排课，学员全选状态

            studentRadio: '',   //一对一排课 radio选中的学员
            studentLists: [],    //添加班级，选择的学员列表

            checkStudentForm: [],  //form展示选中的学员
            radioStudentForm: '',  //form展示选中的学员
            timetable_studentLists: [],  //添加排课，选择的学员列表

            operationLists: courseStatic.classRoomStatus,
            timePicker: {start: '09:00', step: '00:05', end: '21:45', minTime: 0},
            weekList: [
                {id: 1, name: '周一', day: {}}, 
                {id: 2, name: '周二', day: {}}, 
                {id: 3, name: '周三', day: {}}, 
                {id: 4, name: '周四', day: {}}, 
                {id: 5, name: '周五', day: {}}, {id: 6, name: '周六', day: {}}, {id: 0, name: '周日', day: {}}
            ],
            timetableForm: {
                no_timetable: '',   //未排课时
                course_id: '',
                grade_id: '',
                class_name: '',
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
            classForm: {
                id: '',
                course_name: '',   //课程名称
                course_id: '',   //课程id
                lesson_num: '',   //课程课时
                name: '',     //班级名称
                teacher_ids: '',  //任课老师id
                start_time: '',   //开课日期
                limit_num: '',    //人数上限
                counselor_ids: '',    // 辅助老师id
                room_id: '',    //所选教室id
                is_listen: ''    //是否试听
            },
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
            courseRules: {
                name: [
                    {required: true, message: '请输入课程名称'},
                    {max: 20, message: '长度不能超过20个字符'}
                ],
                expire: [
                    {required: true, message: '请输入课程有效期'}
                ],
                unit_price: [
                    {required: true, message: '请输入学费标准'}
                ],
                lesson_time: [
                    {required: true, message: '请输入课节时长'}
                ]
            },
            classRules: {
                name: [
                    {required: true, message: '请输入班级名称'},
                    {max: 20, message: '长度不能超过20个字符'}
                ],
                lesson_num: [
                    {required: true, message: '请输入班级课时'}
                ],
                teacher_ids: [
                    {required: true, message: '请选择任课老师', trigger: 'change'}
                ],
                counselor_ids: [],
                start_time: [
                    {required: true, message: '请选择开课日期', trigger: 'change'}
                ],
                limit_num: [
                    {required: true, message: '请设置人数上限'}
                ],
                room_id: [
                    {required: true, message: '请选择上课教室', trigger: 'change'}
                ],
                is_listen: [
                    {required: true, message: '请设置可否试听', trigger: 'change'}
                ]
            },
            timetableRules: {
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
    methods: {
        //弹出框关闭事件
        dialogClose(type) { 
            this.$refs[type].resetFields();
            if(type == 'classRoomForm') {
                this.studentLists = [];
                this.studentCheckAll = false;
                for(let key in this.classForm) this.classForm[key] = '';
            }else {
                Object.keys(this.timetableForm).forEach(v => {
                    if(v == 'room_id') this.timetableForm[v] = [];
                    else if(v == 'loop') this.timetableForm[v] = 'no';
                    else this.timetableForm[v] = '';
                });


                this.formAddDate.splice(0, this.formAddDate.length);
                this.timetable_studentCheckAll = false;
                this.studentRadio = '';
                this.timetable_studentLists = [];
            }
            this.allStudentLists = [];
        },
        timetableEditClick(a, b) {
            this.timetableCheckbox = !this.timetableCheckbox;
            if(this.timetableCheckbox) this.$refs[`multipleTable_${a}_${b}`][0].clearSelection();
        },
        handleSelectionChange(val) {
            this.deleteTimeTableLists = val;
        },
        checkboxIsDisabled(row, index) {
            return row.lesson_end_time == 0;
        },
        async deleteTimeTableHandle(data) {
            if(!this.deleteTimeTableLists.length) return 0;
            let timetableLists = this.deleteTimeTableLists.map(v => {return v.id});

            let result = await this.$$request.post('api/timetable/deleteAll', {id: timetableLists});
            console.log(result);
            if(!result) return 0;
    
            if(result.status == 1) {
                this.$message.success('删除成功');
                timetableLists.forEach(v => {
                    data.forEach((k, n) => {if(k.id == v) data.splice(n, 1)});
                });

                this.timetableCheckbox = false;
                this.deleteTimeTableLists = [];
            }else {
                this.$message.warning('删除失败');
            }
        },
        gradeStatus(data) {
            let date = new Date().getTime() / 1000, result = {};
            if(data.status === -3) {
                result = {id: 'stop', name: '停课'};
            }else if(data.status === -2){
                result = {id: 'no', name: '未开课'};
            }else {
                result = data.start_time < date ? {id: 'yes', name: '已开课'} : {id: 'no', name: '未开课'};
            }
            return result;
        },
        //弹窗变比，改变dialog状态回调
        CB_dialogStatus(type) {
            if(type == 'add_course')  {
                this.editDetail = {};
                this.dialogStatus.course = false;
            }
        },
        CB_addCourse() {
            this.getCourseLists();
            this.dialogStatus.course = false;
        },
        //创建班级学员checkbox，全选
        studentCheckAllChange(val) {
            this.studentLists = val ? this.allStudentLists : [];
        },
        //排课学员checkbox，全选
        timetable_studentCheckAllChange(val) {
            this.timetable_studentLists = val ? this.allStudentLists.map(v => {return v.student_id}) : [];
        },
        //学员checkbox，多选
        studentCheckChange(val) {
            let checkedCount = val.length;
            this.studentCheckAll = checkedCount === this.allStudentLists.length;
        },
        timetable_studentCheckChange(val) {
            let checkedCount = val.length;
            this.timetable_studentCheckAll = checkedCount === this.allStudentLists.length;
        },

        //排课弹窗通过选中的student_id获取student_name
        getStudentName(student_id) {
            let name = '';
            this.allStudentLists.forEach(v => {if(student_id == v.student_id) name = v.student_name});
            return name;
        },
        addStudentClick() {
            if(!this.allStudentLists.length) return this.$message.warning('暂无可选择学员');
            this.addStudentDialog = true;

            if(this.courseType === 1) {
                this.timetable_studentLists = this.checkStudentForm;
                this.timetable_studentCheckAll = this.timetable_studentLists.length === this.allStudentLists.length;
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
                this.checkStudentForm = this.timetable_studentLists;
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
            this.getWeek(val);
        },
        //批量排课，新增多个时间段
        addDateHandle() {
            this.formAddDate.push({begin_time: '', end_time: '', week: ''});
        },
        deleteDateHandle(index) {
            this.formAddDate.splice(index, 1);
        },
        //新增课程
        addCourse() {
            this.dialogStatus.course = true;
            this.courseOperate = 'add';
            console.log(this.dialogStatus)
        },
        //编辑课程
        editCourse(course) {
            this.editDetail = course;
            this.dialogStatus.course = true;
            this.courseOperate = 'edit';
        },
         //新增班级，获取form相关西数据
        async addClassRoom(id, type) {
            this.dialogStatus.grade = true;
            this.classEdit = false;
            this.courseType = type;
            this.getGradeFill(id, null, 'add');
        },
        //修改班级
        async editClassRoom(data, type) {
            console.log(data);
            this.courseType = type;
            this.getGradeFill(data.course_id, data.id, 'edit');
            
            for(let key in this.classForm) {
                if(key == 'teacher_ids') {
                    this.classForm[key] = data['teacher_lists'].length ? data['teacher_lists'][0].id : '';
                }else if(key == 'counselor_ids') {
                    this.classForm[key] = data['counselor_lists'].length ? data['counselor_lists'][0].id : '';
                }else if(key == 'start_time') {
                    //若开课时间大于五年 则显示当前日期
                    this.classForm[key] = data[key] * 1000 - new Date().getTime() > 5*360*24*60*60*1000 ? new Date().getTime() : data[key] * 1000;
                }else if(key == 'limit_num') this.classForm[key] = `${data[key]}`;
                else this.classForm[key] = data[key];
            }
            this.dialogStatus.grade = true;
            this.classEdit = true;
        },
        //form表单确定按钮
        doneHandle() {
            this.$refs.classRoomForm.validate(valid => {if(valid) this.submitClassRoom()});
        },
        //班级操作列表点击回调
        handleCommand(option) {
            console.log(option)
            switch(option.type) {
                case 'plan':
                    this.addTimetable(option);
                    break;
                case 'begin':
                    this.classCourseState(option);
                    break;
                case 'over':
                    this.classCourseState(option);
                    break;
                case 'stop':
                    this.classCourseState(option);
                    break;
                case 'edit':
                    this.editClassRoom(option.grade_info, option.course_info.type);
                    break;
                case 'delete':
                    this.$confirm('确定删除班级吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.deleteClassRoom(option.grade_info);
                    }).catch(() => {return 0});
                    break;
            }
        },
        //新增排课  type: single / multiple
        addTimetable(option) {
            console.log(option);
            this.courseType = option.course_info.type;
            if(option.course_info.type === 1 && option.grade_info.timetable.length == option.grade_info.lesson_num) return this.$message.warning('该班级排课已满，不能添加排课，可选择编辑班级添加学员或班级信息，或到排课管理，修改指定排课!');

            this.formAddDate.splice(0, this.formAddDate.length, {begin_time: '', end_time: '', week: ''});
            this.getGradeFill(option.grade_info.course_id, option.grade_info.id, 'timetable');

            this.timetableForm.class_name = `${option.course_info.name}/${option.grade_info.name}`;
            this.timetableForm.lesson_time = option.course_info.lesson_time;
            this.timetableForm.teacher_ids = option.grade_info.teacher_lists.length ? option.grade_info.teacher_lists[0].id : '';  //任课老师
            this.timetableForm.counselor_ids = option.grade_info.counselor_lists.length ? option.grade_info.counselor_lists[0].id : '';  //辅助老师
            this.timetableForm.room_id.splice(0, this.timetableForm.room_id.length, option.grade_info.room_id);  //上课教室
            this.timetableForm.course_id = option.grade_info.course_id;
            this.timetableForm.grade_id = option.grade_info.id;

            if(option.grade_info.start_time * 1000 > new Date().setHours(0, 0, 0, 0)) {
                //若开课时间大于五年 则显示当前日期
                this.timetableForm.start_time = option.grade_info.start_time * 1000 - new Date().getTime() > 5*360*24*60*60*1000 ? new Date().setHours(0, 0, 0, 0) : option.grade_info.start_time * 1000;
                
                this.getWeek(this.timetableForm.start_time);
                this.disableStartTime = this.timetableForm.start_time;
            }else {
                this.timetableForm.start_time = new Date().setHours(0, 0, 0, 0);
            }
            
            this.dialogStatus.timetable = true;
        },
        //排课弹窗，选择一周某一天
        formWeekChange(val) {
            this.timePicker.minTime = 0;
        },
        //新增排课确定
        addTimeTableDone() {
            let a, b;
            this.$refs.addTimeTable.validate(valid => {a = valid ? true : false});
            for(let i = 0, len = this.$refs.addDateForm.length; i < len; i++) {
                this.$refs.addDateForm[i].validate(valid => {b = valid ? true : false})
            }
            if(a && b) this.addTimeTableParams();
        },
         //排课参数整理
        addTimeTableParams() {
            if(this.courseType !== 1 && !this.radioStudentForm) return this.$message.warning('请选择学员！');

            let params = {
                commit_type: 'multiple',
                loop: this.timetableForm.loop,
                room_id: this.timetableForm.room_id,
                course_id: this.timetableForm.course_id,
                grade_id: this.timetableForm.grade_id,
                lesson_num: this.timetableForm.lesson_num,
                teacher_ids: `,${this.timetableForm.teacher_ids},`,
                counselor_ids: `,${this.timetableForm.counselor_ids},`,
                loop_time: this.timetableForm.loop_time,
                student_lists: this.courseType === 1 ? this.checkStudentForm.map(v => {return {student_id: v}}) : [{student_id: this.radioStudentForm}]
            }

            let time_lists = this.formAddDate.map(d => {
                let begin_time, end_time;
                this.weekList.forEach(v => {
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

            console.log(params);
            this.getConflictLists(params);
        },
        //判断当前开课日期是不是本周
        isSameWeek(old){  
            var oneDayTime = 1000*60*60*24;  
            var old_count = parseInt(old/oneDayTime);  
            var now_other = parseInt(new Date().getTime() / oneDayTime);  
            return parseInt((old_count+4)/7) == parseInt((now_other+4)/7);  
        },
        //批量排课，根据开课日期，重新循环获取周数据
        getNewWeekLists(nowTime, num) {
            let day = new Date(nowTime).getDay();
            let oneDayLong = 24*60*60*1000; 
            let newTime = num == 0 ? nowTime + (7-day) * oneDayLong : nowTime - (day-num) * oneDayLong;

            let newFullDay = this.$$tools.format(newTime / 1000).replace(/\-/g, "/");
            return newFullDay || 0;
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
                            item[key] = this.conflict_room.length ? this.conflict_room : this.timetableForm.room_id;
                        }else {
                            item[key] = v[key];
                        }
                    }
                };
                return item;
            });
            
            lists = lists.concat(this.other_lists);

            let params = {lists: lists, commit_type: 'conflict'};

            console.log(params)
            this.getConflictLists(params);
        },
        //检测是否有冲突，获取冲突数据列表
        async getConflictLists(params) {
            if(this.submitLoading.timetable) return 0;
            this.submitLoading.timetable = true;

            let result = await this.$$request.post('api/timetable/conflictLists', params);
            this.submitLoading.timetable = false;
            console.log(result);

            if(!result || result.status === 0) return 0;

            if(result.status === 1) {
                this.getCourseLists();
                this.$message.success('添加排课成功');
                this.dialogStatus.timetable = false;
                this.dialogStatus.conflict = false;
                this.conflict_room = [];
            }else if(result.status === -1) {
                result.conflict_lists.forEach(v => {
                    v.begin_time = v.begin_time * 1000;
                    let nowtime = new Date(v.begin_time);
                    v.begin_hours = [nowtime.getHours(), nowtime.getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
                    if(v.conflict_data.reason == 2) this.conflict_room = v.conflict_data.data.map(k => {return k.id});
                });
                
                this.conflictLists = result.conflict_lists;   //冲突列表
                this.other_lists = result.lists;    //正常列表
                this.dialogStatus.conflict = true;
            }
        },
        //获取老师列表、上课教室等附加信息
        async getGradeFill(course_id, grade_id, type) {
            let params = {course_id: course_id};
            if(grade_id) params.grade_id = grade_id;

            let result = await this.$$request.post('api/grade/fill', params);
            console.log(result)
            if(!result) return 0;
            this.classSelectInfo = result.lists;

            if(type === 'add') {
                this.allStudentLists = result.lists.student_course;
            }else {
                this.allStudentLists = result.lists.student_course.concat(result.lists.student_grade);
                if(type === 'edit') {
                    this.studentLists = result.lists.student_grade;
                    if(!result.lists.student_course.length && result.lists.student_grade.length) this.studentCheckAll = true;
                }else {
                    this.timetable_studentLists = result.lists.student_grade.map(v => {return v.student_id});
                    if(!result.lists.student_course.length && result.lists.student_grade.length) this.timetable_studentCheckAll = true;
                }
            }
            
            this.timetableForm.no_timetable = result.lists.unscheduled;
            this.classForm.course_name = result.lists.course.name;
            this.classForm.course_id = result.lists.course.id;
        },
        //班级课程结课、停课、开课
        classCourseState(option) {
            if(option.type === 'over' || option.type === 'stop') {
                let text = option.type === 'over' ? '结课以后会将班级的学员和课表信息清空，您确定要结课吗?' : '停课以后将班级的课表信息关闭，您确定要停课吗？';
                this.$confirm(text, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.submitChangeCourseStatus(option);
                }).catch(() => {return 0});
            }else {
                this.submitChangeCourseStatus(option);
            }
        },
        //改变班级状态 开课/结课/停课
        async submitChangeCourseStatus(option) {
            let params = {id: option.grade_info.id, status: option.type == 'over' ?  -2 : option.type == 'stop' ? -3 : 1};
            let result = await this.$$request.post('api/grade/changeStatus', params);
            if(!result) return 0;
            this.$message.success('修改状态成功');
            this.getCourseLists(); 
        },
        //删除班级
        async deleteClassRoom(data) {
            let result = await this.$$request.post('api/grade/delete', {id: data.id});
            if(!result) return 0;
            this.$message.success('已删除');
            this.getCourseLists();
        },
        //新增、编辑班级提交数据
        submitClassRoom() {
            if(this.courseType === 1) {
                if(this.classForm.limit_num < this.studentLists.length) {
                    this.$confirm('学员数量已经超过上限，是否继续添加?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.submitClassRoomHandle();
                    }).catch(() => {return 0});
                }else {
                    this.submitClassRoomHandle();
                }
            }else {
                this.submitClassRoomHandle();
            }
        },
        async submitClassRoomHandle() {
            if(this.submitLoading.grade) return 0;
            this.submitLoading.grade = true;

            let url = this.classEdit ? 'api/grade/edit' : 'api/grade/add';
            let params = {};
            
            for(let key in this.classForm) {
                if(key == 'teacher_ids' || key == 'counselor_ids') {
                    params[key] = `,${this.classForm[key]},`;
                }else if(key == 'start_time'){
                    params[key] = this.classForm[key] / 1000;
                }else params[key] = this.classForm[key];
            };
            
            params.students = this.studentLists.map(v => {return {student_id: v.student_id}});
            console.log(params)

            let result = await this.$$request.post(url, params);
            this.submitLoading.grade = false;
            console.log(result);
            if(!result) return 0;
            this.$message.success(this.classEdit ? '修改成功' : '添加成功');

            this.getCourseLists();
            this.dialogStatus.grade = false;
            this.studentLists.splice(0, this.studentLists.length);  //成功以后，studentLists选中的学员列表清空
        },
        //获取课程列表
        async getCourseLists() {
            let result = await this.$$request.post('api/course/lists');
            console.log(result);
            if(!result) return 0;
            result.lists.forEach(d => {
                d.collapse = false;
                d.class_lists.forEach(v => {v.operationStatus = false; v.gradeStatus = this.gradeStatus(v)})
            });
            this.courseLists = result.lists;
        },
        //周数据做处理
        getWeek(time) {
            let now = new Date(), nowTime, day; 

            if(time) {
                nowTime = time;
                day = new Date(nowTime).getDay();
            }else {
                nowTime = now.getTime();
                day = now.getDay();
            }

            let oneDayLong = 24*60*60*1000 ; 

            this.weekList.forEach(d => {
                let num = d.id, newTime;
                
                let day_a = day == 0 ? 7 : day;

                newTime = num == 0 ? nowTime + (7-day_a) * oneDayLong : nowTime - (day_a-num) * oneDayLong;
                
                let newDay = this.$$tools.formatTime(newTime / 1000, 'day');
                
                let newFullDay = this.$$tools.format(newTime / 1000);

                d.day = {
                    date: newDay.replace(/\-/g, "/") || 0,
                    newFullDay: newFullDay.replace(/\-/g, "/") || 0
                };
            });
        }
    },
    created() {
        this.getCourseLists();
        this.getWeek();
        Bus.$on('refreshCourseLists', () => {this.getCourseLists()});
    },
    components: {TableHeader, MyButton, AddCourseDialog}
}
</script>

<style lang="less" scoped>
    h4 {
        font-weight: normal;
        padding-left: 38px;
    }
    .course-status {
        span {
            width: 60px;
            text-align: center;
            height: 25px;
            line-height: 25px;
            border-radius: 5px;
            &.green {
                background-color: #E4F3E8;
                color: #347924;
            }
            &.red {
                background-color: #FFF0EA;
                color: #aa4e2a;
            }
            &.gray {
                background-color: #EDEDED;
                color: #555555;
            }
        }
    }
    .content-box {
        height: 750px;
    }
    .course-list-box {
        .list-header {
            background-color: #EEEEEE;
            height: 50px;
            span {
                img {
                    display: block;
                }
            }
        }
        .grade-table-box {
            height: 0;
            position: relative;  overflow: hidden;
            -webkit-transition: height 2s;
            transition: height 2s;
            &.is-collapse {
                height: auto !important;
            }
        }
        .el-table {
            border-left: 1px #eeeeee solid;
            border-right: 1px #eeeeee solid;
        }
        .unfold-icon {
            -webkit-transition: transform 300ms;
            transition: transform 300ms;
            display: block;
            img {
                display: block;
            }
            &.rotate {
                -webkit-transform :rotate(180deg);
                transform: rotate(180deg);
            }
        }
    }
    .course-lits-nothing {
        height: 100%;
    }

    .detail {
        padding: 0 10px;
        .detail-left {
            width: 400px;
        }
        .detail-top {
            padding: 0 50px;
            ul li {
                margin-top: 20px;
                color: #999999;
                span {
                    color: #222222;
                }
            }
        }
        .detail-bottom {
            border-top: 1px #e3e3e3 dotted;
            .timetable-edit {
                border: 1px #45DAD5 solid;
                text-align: center;
                width: 60px;
                line-height: 30px;
                height: 30px;
                box-sizing: border-box;
                right: 10px;
                top: -40px;
                color: #45DAD5;
                border-radius: 5px;
            }
        }
    }

    .form-box {
        padding: 0 10px;
        .add-lesson-top {
            padding-bottom: 20px;
        }
        .add-lesson-bottom {
            padding-top: 30px;
            border-top: 1px #e3e3e3 solid;
        }
        .el-select, .el-date-editor {
            width: 100%;
        }
        .el-cascader {
            display: block;
        }
        .form-unit {
            position: absolute;
            right: -30px;
            top: 0;
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
    .course_type{
        display: inline-block;
        border: 1px solid #a9a9a9;
        height: 24px;
        line-height: 24px;
        padding: 0 5px;
        border-radius: 4px;
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