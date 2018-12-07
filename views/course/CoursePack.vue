<template>
  <div class="flex1">
    <PageState :state="state"/>
    <el-card shadow="hover">
        <TableHeader title="课程包">
            <MyButton @click.native="addCoursePack" class="ml-20">添加课程包</MyButton>
        </TableHeader>

        <div class="course-box mt-20" v-for="(course, index) in coursePackLists" :key="index">
          <div class="list-header cursor-pointer d-f p-r f-a-c f-j-b" @click.stop.self.prevent="listHeaderClick(course, index)">
              <div class="d-f f-a-c">
                <div class="fc-7 fs-16 d-f f-a-c">
                  <p class="fs-16">{{course.name}}</p>
                  <span v-if="course.course_package && course.course_package.length" class="fc-9 fs-13 ml-10">
                    (<i v-for="(pack, num) in course.course_package" :key="pack.id">{{pack.course.name}}<i v-if="course.course_package.length > 1 && num < course.course_package.length - 1">、</i></i>)
                  </span>
                  <i class="iconfont icon-bianji ml-10" @click="editCoursePack(course)"></i>
                </div>
              </div>
              <div class="d-f f-a-c">
                  <span class="fc-9 ml-20 zhankai-icon" :class="{'rotate': course.collapse}" @click="listHeaderClick(course, index)">
                      <i class="iconfont icon-zhankai"></i>
                  </span>
              </div>
          </div>

          <div class="grade-table-box" :ref="'grade-table-content_' + index" v-if="course.student_lists">
            <el-table :data="course.student_lists" v-if="course.student_lists.length" strip>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="学员姓名" align="center">
                    <template slot-scope="scope">
                        <router-link v-if="$$tools.isAuthority('signDetail')" :to="{path: '/student/signeddetail', query: {id: scope.row.id}}" class="fc-m">{{scope.row.name}}</router-link>
                        <span v-else>{{scope.row.name}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="购买总课时" prop="total_lesson_num" align="center"></el-table-column>
                <el-table-column label="已上课时" prop="used_lesson_num" align="center"></el-table-column>
                <el-table-column label="剩余课时" prop="total_lesson_num_remain" align="center"></el-table-column>
                <el-table-column label="未排课时" prop="no_rank_lesson_num" align="center"></el-table-column>
            </el-table>
        </div>
        </div>
    </el-card>

    <AddCoursePack v-model="dialogStatus.coursePack" :detail="editDetail" @CB-success="CB_success" @input="CB_input" :type="courseType"></AddCoursePack>
  </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import AddCoursePack from '../../components/dialog/AddCoursePack';

export default {
  components: {TableHeader, MyButton, AddCoursePack},
  data () {
    return {
      state: 'loading',
      dialogStatus: {
        coursePack: false
      },
      editDetail: {},
      courseType: '',
      coursePackLists: [],
      courseInfo: {course: {}, index: '', state: ''}
    }
  },
  methods: {
    CB_input (type) {
      if (!type) {
        this.editDetail = {};
      }
    },
    CB_success () {
      this.$store.dispatch('getCoursePack');
      // this.getCoursePackLists();
    },
    addCoursePack () {
      this.courseType = 'add';
      this.dialogStatus.coursePack = true;
    },
    editCoursePack (data) {
      this.courseType = 'edit';
      this.editDetail = data;
      this.dialogStatus.coursePack = true;
    },
    async listHeaderClick (course, num) {
      this.courseInfo.course = course;
      this.courseInfo.index = num;

      if (course.student_lists.length || course.loaded) {
        this.courseCollapse();
      } else {
        let datas = await this.getStudentLists(course, num);

        if (datas) {
          this.courseCollapse(true);
        }
      }
    },
    async getStudentLists (course, num) {
      this.loading = true;
      let res = await this.$$request.get('/coursePackage/studentLists', {course_package_id: course.id});
      console.log(res);

      if (!res) {
        return 0;
      }
      this.loading = false;
      course.loaded = true;
      this.coursePackLists[num].student_lists = res.students;
      return true;
    },
    // 学员列表展开处理
    courseCollapse (collapse) {
      let {course, index} = this.courseInfo;
      let dom = this.$refs[`grade-table-content_${index}`][0];
      let height = 0;

      for (let i = 0; i < dom.children.length; i++) {
        height += dom.children[i].offsetHeight;
      }

      if (!course.collapse || collapse) {
        dom.style.height = `${height}px`;
        course.collapse = true;
      } else {
        dom.style.height = 0;
        course.collapse = false;
      }
    },
    getCoursePackLists () {
      this.coursePackLists = this.$store.state.coursePackLists.map(v => {
        return {...v, collapse: false, student_lists: [], loaded: false}
      });
    }
  },
  async created (){
    // let datas = await this.getAllCourse();
    // if (datas) {
    //   this.state = 'loaded';
    // }
    this.getCoursePackLists();
  },
  mounted () {
    // console.log(this.$store.state.coursePackLists)
    setTimeout(() => {this.state = 'loaded'}, 1000);
  }
}
</script>

<style lang="less" scoped>
  .course-box {
    .list-header {
        background-color: #EEEEEE;
        padding: 0 20px;
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
        -webkit-transition:  height 300ms;
        transition:  height 300ms;
        .student-pagination {
          /deep/ .el-pager li {
            &:hover {
              color: #45DAD5;
            }
            &.active {
              color: #45DAD5;
            }
          }
          /deep/ button {
            &:hover {
              color: #45DAD5;
            }
          }
        }
    }
  }
</style>

