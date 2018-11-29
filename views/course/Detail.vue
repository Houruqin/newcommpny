<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <TableHeader title="班级详情" :other="true">
              <span class="syllabus fc-m ml-20 mt-2 cursor-pointer" v-if="$store.state.systemSetting.outline && $store.state.systemSetting.outline.status" @click="syllabusClick">班级大纲</span>
            </TableHeader>

            <h3 class="fs-18 fc-2 f-w-n mt-20 mb-10">{{gradeDetail.name}}</h3>
            <div class="d-f detail-header-box" v-if="Object.keys(gradeDetail).length">
                <div>
                    <p>课　　程：<i>{{gradeDetail.course && gradeDetail.course.name}}</i></p>
                    <p v-if="gradeDetail.course.type !== 2">课　　时：<i>{{gradeDetail.lesson_num}}</i></p>
                    <p>任课老师：<i v-for="(teacher, index) in gradeDetail.teacher_lists" :key="index" class="mr-10">{{teacher.name}}</i></p>
                    <!-- <p>开课日期：<i>{{$$tools.format(gradeDetail.start_time)}}</i></p> -->
                    <p>上课教室：<i>{{getRoomName()}}</i></p>
                    <p>可否试听：<i>{{gradeDetail.is_listen ? '是' : '否'}}</i></p>
                </div>
                <div class="ml-100 flex1">
                    <p v-if="gradeDetail.course.type !== 2">人数上限：<i>{{gradeDetail.limit_num}}</i></p>
                    <p v-if="gradeDetail.course.type !== 2">剩余课时：<i>{{gradeDetail.lesson_num_remain}}</i></p>
                    <p v-if="gradeDetail.course.type !== 2">辅助老师：<i v-for="(teacher, index) in gradeDetail.counselor_lists" :key="index">{{teacher.name}}</i></p>
                    <p class="d-f">
                        <span>班级学员：</span>
                        <ul class="flex1 d-f fc-2 student-box f-w-w">
                            <li v-for="(student, index) in gradeDetail.student" :key="index" class="mr-10 mb-10">
                                <router-link v-if="$$tools.isAuthority('signDetail')" :to="{path: '/student/signeddetail', query: {id: student.id}}" class="fc-m">{{student.name}}</router-link>
                                <span v-else>{{student.name}}</span>
                            </li>
                        </ul>
                    </p>
                </div>
            </div>
        </el-card>

        <el-card shadow="hover" class="mt-20">
            <TableHeader title="班级课表">
              <div class="d-f f-a-c" v-if="$$tools.isAuthority('deleteTimetable')">
                <MyButton v-if="!isShowCheckbox" @click.native="isShowCheckbox = true" type="border" fontColor="fc-m">批量管理</MyButton>
                <span v-if="isShowCheckbox" class="fc-9 cursor-pointer" :class="{'fc-m': selectedIds.length}" @click="deleteTimeTable">批量删除</span>
                <MyButton v-if="isShowCheckbox" type="border" fontColor="fc-m" class="ml-20" :minWidth="70" @click.native="cancelMultipleDel">取消</MyButton>
              </div>
            </TableHeader>

            <el-table :data="timeTableLists.data" strip ref="timetable" @selection-change="handleSelectionChange" v-loading="loading">
                <el-table-column type="selection" :selectable="checkboxIsDisabled" width="30" v-if="isShowCheckbox"></el-table-column>
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

        <!-- 修改班级弹窗 -->
        <!-- <AddGradeDialog v-model="dialogStatus.grade" @CB-dialogStatus="CB_dialogStatus" :editDetail="editDetail" type="edit" @CB-addGrade="CB_addGrade"></AddGradeDialog> -->

        <!-- 班级大纲 -->
        <CourseSyllabus v-model="dialogStatus.syllabus" :syllabus="syllabusParams" type="grade" @refreshGradeDetail="getGradeDetail"/>
    </div>
</template>

<script>

import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
// import AddGradeDialog from '../../components/dialog/AddGrade';
import CourseSyllabus from '../../components/dialog/CourseSyllabus';

export default {
  components: {TableHeader, MyButton, CourseSyllabus},
  data () {
    return {
      state: 'loading',
      loading: false,
      gradeId: 167,
      gradeDetail: {},
      timeTableLists: [],

      dialogStatus: {grade: false, syllabus: false},
      courseType: 1,
      classSelectInfo: {},
      studentLists: [],
      allStudentLists: [],
      studentCheckAll: false,

      // editDetail: {},
      syllabusParams: {},

      selectedIds: [], //删除课表，选中的课表
      isShowCheckbox: false //班级详情删除课表，checkbox是否显示
    };
  },
  methods: {
    getRoomName () {
      let room_name = '';

      this.$store.state.classRoom.forEach(v => {
        if (this.gradeDetail.room_id == v.id) {
          room_name = v.name;
        }
      });

      return room_name;
    },
    // CB_dialogStatus (type) {
    //   if (type == 'grade') {
    //     this.editDetail = {};
    //     return 0;
    //   }
    // },
    // CB_addGrade () {
    //   this.getPageData();
    //   this.dialogStatus.grade = false;
    // },
    //班级大纲点击
    async syllabusClick (id) {
      let result = await this.$$request.get('course/getCourseOutline', {courseId: id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.syllabusParams = {
        course_id: this.gradeDetail.course.id,
        grade_id: this.gradeDetail.id,
        is_sync: this.gradeDetail.is_sync,
        course_syllabus: this.gradeDetail.course.course_outline,
        grade_syllabus: this.gradeDetail.grade_outline
      };

      this.dialogStatus.syllabus = true;
    },
    paginationClick (curr) {
      this.getTimeTableLists(curr);
    },
    checkboxIsDisabled (row) {
      return row.begin_time > new Date().getTime() / 1000 && !row.lesson_end_time;
    },
    handleSelectionChange (val) {
      this.selectedIds = val.map(v => v.id);
    },
    async deleteTimeTable () {
      if (this.selectedIds && this.selectedIds.length) {
        this.$confirm('删除之后数据不能恢复，请确认进行批量删除操作！', '删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.multipleDelete();
        }).catch(() => {
          return 0;
        });
      } else {
        this.$message.error('请至少选中一条数据');
      }
    },
    async multipleDelete () {
      let result = await this.$$request.post('/timetable/deleteAll', {id: this.selectedIds});

      console.log(result);

      if (!result) {
        return 0;
      }

      if (result.status == 1) {
        this.$message.success('删除成功');
        this.getTimeTableLists();
        this.isShowCheckbox = false;
        this.selectedIds.splice(0, this.selectedIds.length);
      } else {
        this.$message.warning('删除失败');
      }
    },
    cancelMultipleDel () {
      this.isShowCheckbox = false;
      this.selectedIds.splice(0, this.selectedIds.length);
      this.$refs.timetable.clearSelection();
    },
    async getPageData () {
      let [a, b] = await Promise.all([this.getGradeDetail(), this.getTimeTableLists()]);

      return a && b;
    },
    async getGradeDetail () {
      let result = await this.$$request.get('/grade/detail', {grade_id: this.gradeId});

      console.log(result);

      if (!result) {
        return 0;
      }
      this.gradeDetail = result.grade;
      this.courseType = this.gradeDetail.course.type;

      return true;
    },
    async getTimeTableLists (curr_page) {
      this.loading = true;
      let params = {grade_id: this.gradeId};

      if (curr_page) {
        params.page = curr_page;
      }

      let result = await this.$$request.get('/grade/timetableList', params);

      console.log(result);

      if (!result) {
        return 0;
      }

      this.timeTableLists = result.timetable;
      this.loading = false;

      return true;
    }
  },
  async created () {
    if (this.$route.query.grade_id) {
      this.gradeId = this.$route.query.grade_id;
    }
    let datas = await this.getPageData();

    if (datas) {
      this.state = 'loaded';
    }
  }
};
</script>

<style lang="less" scoped>
    .detail-header-box {
        p {
            color: #999;
            margin-top: 12px;
            i {
                color: #222;
            }
        }
    }
    .student-box {
        max-width: 600px;
        li {
            width: 70px;
            text-align: left;
        }
    }
    .syllabus {
        border: 1px solid #45DAD5;
        height: 20px;
        line-height: 20px;
        padding: 0 5px;
        border-radius: 4px;
    }
</style>


