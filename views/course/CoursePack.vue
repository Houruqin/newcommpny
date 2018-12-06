<template>
  <div class="flex1">
    <PageState :state="state"/>
    <el-card shadow="hover">
       <TableHeader title="课程包">
            <MyButton @click.native="addCoursePack" class="ml-20">添加课程包</MyButton>
        </TableHeader>

        <div class="course-box mt-20" v-for="(course, index) in $store.state.coursePackLists" :key="index">
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
        </div>
    </el-card>

    <AddCoursePack v-model="dialogStatus.coursePack" :courselists="noGradeCourseLists" :detail="editDetail" @CB-success="CB_success" @input="CB_input" :type="courseType"></AddCoursePack>
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
      noGradeCourseLists: [] //无班课程列表
    }
  },
  methods: {
    CB_input (type) {
      if (!type) {
        this.editDetail = {};
      }
    },
    CB_success () {
      // this.getCoursePackLists();
      this.$store.dispatch('getCoursePack');
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
    listHeaderClick () {

    },
    async getStudentLists () {
      // let res = await this.$$request.get('')
    },
    async getCourseLists () {
      let res = await this.$$request.post('/course/orderLists', {type: this.activeTab});
      console.log(res);

      if (!res) {
        return 0;
      }

      this.noGradeCourseLists = res.lists.map(v => {return {id: v.id, name: v.name, type: 'nograde'}});
       return true;
    },
    // async getCoursePackLists () {
    //   let res = await this.$$request.get('/coursePackage/lists');
    //   console.log(res);

    //   if (!res) {
    //     return 0;
    //   }
    //   this.coursePackLists = res.lists;
    //   return true;
    //   this.$store.dispatch('coursePackLists');
    //   return true;
    // }
  },
  async created (){
    // this.$store.dispatch('getCourse');
    let datas = await this.getCourseLists();
    if (datas) {
      this.state = 'loaded';
    }
  }
}
</script>

<style lang="less" scoped>
  .course-box {
    .list-header {
      background-color: #EEEEEE;
      height: 50px;
      padding: 0 20px;
    }
  }
</style>

