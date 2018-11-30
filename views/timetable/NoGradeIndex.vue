<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <TableHeader title="无班课表" :other="true">
                <div class="flex1 d-f f-j-b">
                  <div class="table-header-btn d-f ml-20 f-a-c">
                      <span v-for="item in timetableType" :key="item.type" @click="tableTypeChange(item.type)" class="mr-10 fs-12 cursor-pointer" :class="{'active': tableType == item.type}">{{item.text}}</span>
                  </div>
                </div>
                <MyButton v-if="returnPlanAuthority()" @click.native="multipleAddTimetable">批量发布预约课</MyButton>
            </TableHeader>

            <div class="content-box">
                <div class="d-f f-j-b f-a-c mt-20 fc-7">
                    <div>
                        <el-popover placement="bottom-start" width="260" trigger="click" ref="myFilterPopover" popper-class="timetable-filter">
                            <div class="timetable-filter-tab">
                                <ul class="d-f">
                                    <li class="flex1" :class="{'active': timetableFilter == item.id}"
                                    v-if="(item.id === 'teacher' && $$tools.isAuthority('viewAllData')) || item.id !== 'teacher'"
                                    v-for="(item, index) in timetableFilterTab" :key="index" @click="timetableFilterTabClick(item)">{{item.name}}</li>
                                </ul>

                                <div class="grade-checkbox my-scrollbar">
                                    <el-scrollbar style="height: 100%;">
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
                                    </el-scrollbar>
                                </div>
                            </div>
                            <span slot="reference" class="cursor-pointer fc-m"><i class="iconfont icon-zhankai3 mr-5"></i>本{{tableType == 'week' ? '周' : '日'}}全部课表</span>
                        </el-popover>
                    </div>
                    <div>
                        <i class="iconfont icon-icon--left fc-m cursor-pointer" @click="lastWeekLists"></i>
                        <el-popover placement="bottom" width="260" trigger="click" ref="calendarPopover" popper-class="calendar-popover">
                            <span slot="reference" class="cursor-pointer ml-5 mr-5 out-line" v-if="tableType == 'week'">
                                {{defaultWeekList[0].day.newFullDay}}-{{defaultWeekList[6].day.newFullDay}}
                            </span>
                            <span v-if="tableType == 'day'" slot="reference" class="out-line">{{$$tools.format(calendarTime)}}</span>
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
                            max-height="690" style="width: 100%">
                            <el-table-column align="center" prop="time" width="70" fixed="left" :resizable="false"></el-table-column>
                            <el-table-column align="center" :render-header="tableHeader" min-width="185" :resizable="false">
                                <template slot-scope="scope">
                                    <div class="cursor-pointer item-box" mytype="week_one">
                                        <TimetablePopver v-for="(item, n) in scope.row.week_one.lists" :key="n"
                                            @CB-detailEdit="detailEdit" @CB-deleteTable="CB_deleteTable"
                                            :item="item" :pastdue="scope.row.week_one.past_due">
                                        </TimetablePopver>
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_one.past_due && returnPlanAuthority()"
                                            :class="{'hover': scope.row.week_one.operate == true}"
                                            @click="addTimetableClick(scope.row.week_one.hours_id, scope.row.week_one.full_date, scope.row.week_one.id)">
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
                                            :item="item" :pastdue="scope.row.week_two.past_due">
                                        </TimetablePopver>
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_two.past_due && returnPlanAuthority()"
                                            :class="{'hover': scope.row.week_two.operate == true}"
                                            @click="addTimetableClick(scope.row.week_two.hours_id, scope.row.week_two.full_date, scope.row.week_two.id)">
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
                                            :item="item" :pastdue="scope.row.week_three.past_due">
                                        </TimetablePopver>
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_three.past_due && returnPlanAuthority()"
                                            :class="{'hover': scope.row.week_three.operate == true}"
                                            @click="addTimetableClick(scope.row.week_three.hours_id, scope.row.week_three.full_date, scope.row.week_three.id)">
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
                                            :item="item" :pastdue="scope.row.week_four.past_due">
                                        </TimetablePopver>
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_four.past_due && returnPlanAuthority()"
                                            :class="{'hover': scope.row.week_four.operate == true}"
                                            @click="addTimetableClick(scope.row.week_four.hours_id, scope.row.week_four.full_date, scope.row.week_four.id)">
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
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_five.past_due && returnPlanAuthority()"
                                            :class="{'hover': scope.row.week_five.operate == true}"
                                            @click="addTimetableClick(scope.row.week_five.hours_id, scope.row.week_five.full_date, scope.row.week_five.id)">
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
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_six.past_due && returnPlanAuthority()"
                                            :class="{'hover': scope.row.week_six.operate == true}"
                                            @click="addTimetableClick(scope.row.week_six.hours_id, scope.row.week_six.full_date, scope.row.week_six.id)">
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
                                        <div class="add-course d-f f-a-c f-j-c" v-if="!scope.row.week_seven.past_due && returnPlanAuthority()"
                                            :class="{'hover': scope.row.week_seven.operate == true}"
                                            @click="addTimetableClick(scope.row.week_seven.hours_id, scope.row.week_seven.full_date, scope.row.week_seven.id)">
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
                                            class="course-box bgc-f d-f f-j-b cursor-pointer p-r"
                                            :class="{'mt-5' : num > 0, 'gray': item.lesson_end_time,
                                                    'green': !item.lesson_end_time && item.course_type === 1,
                                                    'yellow': !item.lesson_end_time && item.course_type == 2}">

                                            <div class="proportion-box p-a" v-if="!item.lesson_end_time && item.student_grades.length < item.grade_limit_num">
                                                <div class="proportion p-a" :style="{height: (item.student_grades.length / item.grade_limit_num * 100) + '%'}"></div>
                                            </div>

                                            <div class="d-f f-a-c pl-15 course-item-box">
                                                <div class="d-f f-a-c flex1">
                                                    <div class="fs-15 fc-5">{{item.course_name}}</div>
                                                    <div class="ml-50">
                                                        <i class="iconfont icon-dingwei"></i>
                                                        <span>{{item.room_name}}</span>
                                                    </div>
                                                    <div class="ml-50">
                                                        <i class="iconfont icon-shijian"></i>
                                                        <span>{{`${item.time_quantum.begin_time}-${item.time_quantum.end_time}`}}</span>
                                                    </div>
                                                    <div class="ml-50">
                                                        <i class="iconfont icon-laoshi"></i>
                                                        <span>{{item.teacher[0].name}}</span>
                                                        <span class="pl-10" v-if="item.counselor.length">{{item.counselor[0].name}}</span>
                                                    </div>
                                                    <div class="ml-50">
                                                        <i class="iconfont fs-13 icon-renshu"></i>
                                                        <span v-if="item.course_type === 2 && item.student_grades.length">{{item.student_grades[0].student_name}}</span>
                                                        <span v-else>{{item.student_grades.length}}</span>
                                                    </div>
                                                </div>

                                                <div class="d-f f-a-c mr-30 ml-30 edit-btn" v-if="item.operate && !row.past_due">
                                                    <a v-if="$$tools.isAuthority('editScheduling')" @click="detailEdit(item)">编辑</a>
                                                    <a v-if="$$tools.isAuthority('deleteTimetable')" class="ml-20" @click="detailDelete(item)">删除</a>
                                                </div>
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

        <!-- 排课弹窗 -->
        <AddTimeTable v-model="dialogStatus.timetable" :editDetail="timetableDetail" :tableFull="planCourseLists"
          @CB-popverClose="CB_popverClose" :tableType="addTableType" :day="weekDay" :calendar="calendarTime"
          :weekLists="timetableWeekList" @CB-timetableSuccess="CB_timetableSuccess" @CB-startTimeChange="CB_startTimeChange">
        </AddTimeTable>
    </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import TimetablePopver from '../../components/common/TimetablePopverNograde';
import AddTimeTable from '../../components/dialog/AddTimeTableNoGrade';
import Jquery from 'jquery';
import '../../plugins/calendar';

const ONE_DAY_LONG = 24 * 60 * 60 * 1000;


export default {
  data () {
    return {
      state: 'loading',
      timetableFilterTab: [
        {id: 'grade', name: '课程'},
        {id: 'teacher', name: '老师'},
        {id: 'room', name: '教室'}
      ],

      timetableType: [
        {type: 'week', text: '按周'}, {type: 'day', text: '按日'}
      ],

      dialogStatus: {timetable: false},
      weekDay: {},

      CalendatObj: null,
      submitLoading: {timetable: false},

      gradeTimeTableRadio: 0, //班级课表，radio筛选
      gradeInfoCheckLists: {total_num: 0, lists: []},

      loading: true,
      addTableType: 'single',

      timetable_courseAll: true,
      timetable_gradeCheck: [],

      timetable_teacherAll: true,
      timetable_teacherCheck: [],

      timetable_roomAll: true,
      timetable_roomCheck: [],

      tableType: 'week', //按周、日展示课表
      timetableFilter: 'grade', //显示类型  default，teacher，classroom
      calendarTime: new Date().getTime() / 1000, //日历默认时间
      timeTableInfo: {}, //课表总数据
      weekTableLists: [], //按周展示，课表列表
      dayTableLists: [], //按天展示，课表列表

      //排课相关填充数据
      planCourseLists: [],

      weekList: [
        {id: 1, name: '周一', type: 'week_one'},
        {id: 2, name: '周二', type: 'week_two'},
        {id: 3, name: '周三', type: 'week_three'},
        {id: 4, name: '周四', type: 'week_four'},

        {id: 5, name: '周五', type: 'week_five'},
        {id: 6, name: '周六', type: 'week_six'},
        {id: 0, name: '周日', type: 'week_seven'}
      ],

      timetableDetail: {},
      defaultWeekList: [], //课表头部展示周数据
      timetableWeekList: [], //排课下拉选择周数据
      hourData: []
    };
  },
  methods: {
    setNewDate () {
      let now = new Date(this.calendarTime * 1000);
      let year = now.getFullYear();
      let month = now.getMonth() + 1;
      let day = now.getDate();

      this.CalendatObj.data('calendar').updateDateView(year, month);
      this.CalendatObj.data('calendar').selectedDay(day);
    },
    // 是否有排课权限
    returnPlanAuthority () {
      return this.$$tools.isAuthority('scheduling') && (this.$$tools.isAuthority('viewAllData') || (!this.$$tools.isAuthority('viewAllData') && this.planCourseLists.course && this.planCourseLists.course.length));
    },
    tableHeader (elem, {column, $index}) {
      let weekList = this.defaultWeekList;

      return elem('div', {'class': 'header-box'}, [
        elem('div', [
          elem('p', {
            'class': {'fc-m': weekList[$index - 1].day.isToday}
          }, weekList[$index - 1].name),
          elem('p', {
            'class': {'fc-m': weekList[$index - 1].day.isToday, 'mt-5': true}
          }, weekList[$index - 1].day.date)
        ]),
        elem('div', {'class': {'today fs-12': true, 'd-b': weekList[$index - 1].day.isToday}}, [
          elem('p', {'class': 'pt-2'}, '今'), elem('p', {'class': 'pt-2'}, '日')
        ])
      ]);
    },
    timetableFilterTabClick (item) {
      if (this.timetableFilter != item.id) {
        this.timetableFilter = item.id;
      }
      this.getAllTableLists();
    },
    CB_popverClose () {
      this.addTableType = '';
      this.timetableDetail = {};
    },
    CB_startTimeChange (val) {
      this.getWeekList(val, 'timetable');
    },
    CB_timetableSuccess () {
      this.getAllTableLists();
      this.getAddTimeTableFull();
    },
    //上一周翻页
    lastWeekLists () {
      if (this.tableType === 'week') {
        let last = new Date(`${this.defaultWeekList[0].day.newFullDay} 00:00`).getTime() - ONE_DAY_LONG * 7;

        this.calendarTime = last / 1000;
        this.getWeekList(last, 'all');
      } else {
        this.calendarTime = this.calendarTime - ONE_DAY_LONG / 1000;
        this.setNewDate();
        this.getWeekList(this.calendarTime, 'all');
      }

      this.getAllTableLists();
    },
    //下一周翻页
    nextWeekLists () {
      if (this.tableType == 'week') {
        let next = new Date(`${this.defaultWeekList[0].day.newFullDay} 00:00`).getTime() + ONE_DAY_LONG * 7;

        this.calendarTime = next / 1000;
        this.getWeekList(next, 'all');
      } else {
        this.calendarTime = this.calendarTime + ONE_DAY_LONG / 1000;
        this.setNewDate();
        this.getWeekList(this.calendarTime, 'all');
      }

      this.getAllTableLists();
    },
    //排课班级全选
    gradeCheckAllChange (val) {
      this.timetable_gradeCheck = val ? this.gradeInfoCheckLists.lists : [];
      this.getGradeTableLists();
    },
    //排课班级多选
    gradeCheckChange (val) {
      let checkedCount = val.length;

      this.timetable_courseAll = checkedCount === this.gradeInfoCheckLists.lists.length;
      this.getGradeTableLists();
    },
    //排课老师全选
    teacherCheckAllChange (val) {
      this.timetable_teacherCheck = val ? this.timeTableInfo.teacher_info : [];
      this.getTeacherTableLists();
    },
    //排课老师多选
    teacherCheckChange (val) {
      let checkedCount = val.length;

      this.timetable_teacherAll = checkedCount === this.timeTableInfo.teacher_info.length;
      this.getTeacherTableLists();
    },
    //排课教室全选
    roomCheckAllChange (val) {
      this.timetable_roomCheck = val ? this.timeTableInfo.room_info : [];
      this.getRoomTableLists();
    },
    //排课教室多选
    roomCheckChange (val) {
      let checkedCount = val.length;

      this.timetable_roomAll = checkedCount === this.timeTableInfo.room_info.length;
      this.getRoomTableLists();
    },

    //按周、日展示切换
    tableTypeChange (type) {
      if (type == this.tableType) {
        return 0;
      }
      this.tableType = type;

      this.calendarTime = new Date().getTime() / 1000;
      this.getWeekList(null, 'all');
      this.setNewDate();
      this.getAllTableLists();
    },
    //周课表hover事件
    timeTableHover (row, col, elem) {
      let item = elem.querySelector('.item-box');

      if (!item) {
        return 0;
      }
      let mytype = elem.querySelector('.item-box').getAttribute('mytype');

      row[mytype].operate = true;
    },
    //周课表leave事件
    timeTableleave (row, col, elem) {
      let item = elem.querySelector('.item-box');

      if (!item) {
        return 0;
      }
      let mytype = elem.querySelector('.item-box').getAttribute('mytype');

      row[mytype].operate = false;
    },
    //鼠标移入课表
    coursehover (item) {
      item.operate = true;
    },
    //鼠标移出课表
    courseMouseout (item) {
      item.operate = false;
    },
    //详情删除
    detailDelete (detail) {
      this.$confirm('确定删除排课吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteHandle(detail.id);
      }).catch(() => {
        return 0;
      });
    },
    async deleteHandle (id) {
      let result = await this.$$request.post('/timetable/delete', {id: id});

      if (!result || !result.status) {
        return 0;
      }

      this.$message.success('删除成功');
      this.getAllTableLists();
      this.getAddTimeTableFull();
    },
    CB_deleteTable () {
      this.getAllTableLists();
      this.getAddTimeTableFull();
    },
    //批量排课
    multipleAddTimetable () {
      if (!this.planCourseLists.length) {
        return this.$message.warning('没有可排课的课程，请新增课程!');
      }

      this.getWeekList(null, 'timetable');
      this.addTableType = 'multiple';
      this.dialogStatus.timetable = true;
    },
    //新增排课
    addTimetableClick (time, full_day, week) {
      if (!this.planCourseLists.length) {
        return this.$message.warning('没有可排课的课程，请新增课程!');
      }

      this.weekDay = {day: week, full_day: full_day, hours_id: time};
      this.addTableType = 'single';
      this.dialogStatus.timetable = true;
    },
    //编辑排课
    detailEdit (detail) {
      console.log(detail);
      this.timetableDetail = detail;
      this.addTableType = 'edit';
      this.dialogStatus.timetable = true;
    },
    //默认获取全部课表
    async getAllTableLists () {
      this.loading = true;
      let result = await this.$$request.post('/timetable/notModelList', {select_time: Math.round(this.calendarTime), type: this.tableType});

      console.log(result);
      if (!result) {
        return 0;
      }

      this.resultDispose(result.lists.timetable_lists);
      this.timeTableInfo = result.lists;

      this.gradeInfoCheckLists.lists = result.lists.course_info.map(v => {
        return v;
      });
      this.gradeInfoCheckLists.total_num = result.lists.total_num;
      this.gradeTimeTableRadio = 0;

      this.timetable_gradeAll = true;
      this.timetable_teacherAll = true;
      this.timetable_roomAll = true;
      this.timetable_gradeCheck = this.gradeInfoCheckLists.lists;
      this.timetable_teacherCheck = result.lists.teacher_info;
      this.timetable_roomCheck = result.lists.room_info;

      return true;
    },
    //班级获取课表
    async getGradeTableLists () {
      if (!this.timetable_gradeCheck.length) {
        return this.resultDispose([]);
      }

      this.loading = true;
      let result = await this.$$request.post('/timetable/noGradeCourseLists', {
        select_time: Math.round(this.calendarTime),
        type: this.tableType,
        course_id: this.timetable_gradeCheck.map(v => {
          return v.id;
        })
      });

      if (!result) {
        return 0;
      }
      this.resultDispose(result.lists);
    },
    //老师获取课表
    async getTeacherTableLists () {
      if (!this.timetable_teacherCheck.length) {
        return this.resultDispose([]);
      }

      this.loading = true;
      let result = await this.$$request.post('/timetable/noGradeTeacherLists', {
        select_time: Math.round(this.calendarTime),
        type: this.tableType,
        teacher_id: this.timetable_teacherCheck.map(v => {
          return v.id;
        })
      });

      if (!result) {
        return 0;
      }
      this.resultDispose(result.lists);
    },
    //教室获取课表
    async getRoomTableLists () {
      if (!this.timetable_roomCheck.length) {
        return this.resultDispose([]);
      }

      this.loading = true;
      let result = await this.$$request.post('/timetable/noGradeRoomLists', {
        select_time: Math.round(this.calendarTime),
        type: this.tableType,
        room_id: this.timetable_roomCheck.map(v => {
          return v.id;
        })
      });

      if (!result) {
        return 0;
      }
      this.resultDispose(result.lists);
    },
    //判断当前开课日期是不是本周
    isSameWeek (old) {
      let oneDayTime = 1000 * 60 * 60 * 24;
      let old_count = parseInt(old / oneDayTime);
      let now_other = parseInt(new Date().getTime() / oneDayTime);

      return parseInt((old_count + 4) / 7) == parseInt((now_other + 4) / 7);
    },
    //获取新增排课填充数据
    async getAddTimeTableFull () {
      let result = await this.$$request.get('/timetable/notModelFill');

      console.log(result);
      if (!result) {
        return 0;
      }

      this.planCourseLists = result.course;

      return true;
    },
    //返回数据判断梳理
    resultDispose (resultData) {
      if (this.tableType == 'week') {
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

            if (full_date == this.$$tools.format(new Date().getTime() / 1000).replace(/\-/g, '/')) {
              past_due = v.id < new Date().getHours() ? true : false;
            } else if (new Date(`${full_date} 00:00`).getTime() < new Date().getTime()) {
              past_due = true;
            } else {
              past_due = false;
            }

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

              if (hour == v.id && w.id == week) {
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

          let full_date = this.$$tools.format(this.calendarTime).replace(/\-/g, '/');

          if (full_date == this.$$tools.format(new Date().getTime() / 1000).replace(/\-/g, '/')) {
            past_due = v.id <= new Date().getHours();
          } else if (new Date(`${full_date} 00:00`).getTime() < new Date().getTime()) {
            past_due = true;
          } else {
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
            if (hour == v.id) {
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
    getWeekList (time, type) {
      let now = new Date(), nowTime, day;

      if (time) {
        nowTime = time;
        day = new Date(nowTime).getDay();
      } else {
        nowTime = now.getTime();
        day = now.getDay();
      }

      let weekLists = this.weekList.map(d => {
        let num = d.id, newTime, past_due;
        let day_a = day == 0 ? 7 : day;

        newTime = num == 0 ? nowTime + (7 - day_a) * ONE_DAY_LONG : nowTime - (day_a - num) * ONE_DAY_LONG;

        let newDay = this.$$tools.formatTime(newTime / 1000, 'day');
        let isToday = new Date(newTime).toDateString() === new Date().toDateString();

        if (this.isSameWeek(nowTime)) {
          past_due = newTime >= nowTime ? true : false; //是否过了今天
        } else {
          past_due = true;
        }

        let newFullDay = this.$$tools.format(newTime / 1000);

        return {
          id: d.id,
          name: d.name,
          type: d.type,
          day: {
            isToday: isToday,
            past_due: past_due,
            date: newDay.replace(/\-/g, '/') || 0,
            newFullDay: newFullDay.replace(/\-/g, '/') || 0
          }
        };
      });

      if (type === 'all') {
        this.defaultWeekList = weekLists;
        this.timetableWeekList = weekLists;
      } else if (type === 'default') {
        this.defaultWeekList = weekLists;
      } else {
        this.timetableWeekList = weekLists;
      }
    }
  },
  mounted () {
    this.CalendatObj = Jquery('#myCalendar').calendar({
      width: 260,
      height: 280,
      customClass: 'my-calender',
      onSelected: (view, date, data) => {
        if (date.getTime() / 1000 === this.calendarTime) {
          return 0;
        }
        this.calendarTime = date.getTime() / 1000;
        this.getWeekList(date.getTime(), 'all');
        this.getAllTableLists();
        this.$refs.calendarPopover.showPopper = false;
      }
    });
  },
  async created () {
    for (let a = 8; a <= 21; a++) {
      this.hourData.push({id: a, name: `${a}:00`});
    }
    this.getWeekList(null, 'all');

    let [a, b] = await Promise.all([this.getAllTableLists(), this.getAddTimeTableFull()]);

    if (a && b) {
      this.state = 'loaded';
    }

    this.$nextTick(v => {
      let width = document.querySelector('.home-main-box').clientWidth;

      if (width <= 1070) {
        document.querySelector('.week-table').style.width = '990px';
      } else {
        document.querySelector('.week-table').style.width = `${width - 80 }px`;
      }
    });
  },
  components: {TableHeader, MyButton, TimetablePopver, AddTimeTable}
};
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
        height: 690px;
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
                    min-height: 50px;
                    box-sizing: border-box;
                    .course-box {
                        height: 48px;
                        &.gray {
                            border: 1px #BCBCBC solid;
                            background-color: #FCFCFC;
                            border-left-width: 5px !important;
                        }
                        &.green {
                            border: 1px #3FD88A solid;
                            background-color: #fff;
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
                        .course-item-box {
                            width: 100%;
                        }
                        .edit-btn {
                            a {
                                width: 56px;
                                height: 30px;
                                text-align: center;
                                line-height: 30px;
                                box-sizing: border-box;
                                border: 1px #45DAD5 solid;
                                border-radius: 3px;
                                color: #45DAD5;
                            }
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
        max-height: 450px;
        overflow: hidden;
        overflow-y: auto;
        .add-date {
            position: absolute;
            right: -35px;
            top: 5px;
        }
        /deep/ .el-input, /deep/ .el-cascader {
          width: 240px;
        }
        // .lesson-num .el-input {
        //     width: 180px;
        // }
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
            /deep/ .el-form {
              width: 240px;
            }
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
            .scroll-box {
              max-height: 220px;
              overflow: hidden;
              overflow-y: auto;
            }
            .delete-time {
                top: 10px;
                right: -20px;
                cursor: pointer;
            }
            /deep/ .el-input {
                width: 100%;
            }
            .date-change {
                width: 130px;
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
            .el-checkbox, .el-radio {
                margin-left: 0;
                margin-bottom: 10px;
                width: 140px;
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
                height: 420px;
                margin: 10px 0 20px;
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

    .table-header-btn {
        span {
            width: 48px;
            line-height: 24px;
            text-align: center;
            border: 1px #45DAD5 solid;
            border-radius: 3px;
            color: #45DAD5;
            &.active {
                background-color: #45DAD5;
                color: #fff;
            }
        }
    }
</style>

