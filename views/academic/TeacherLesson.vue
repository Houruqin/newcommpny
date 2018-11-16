<template>
  <div class="flex1">
    <PageState :state="state" />
    <el-card shadow="hover">
      <TableHeader title="老师课时记录"></TableHeader>
      <el-tabs v-model="activeTab" @tab-click="tabClick">
          <el-tab-pane v-for="(item, index) in tabHeader" :key="index" :label="item.name" :name="item.id"></el-tab-pane>
      </el-tabs>
      <div class="fifter-toolbar mt-10 mb-10 d-f">
        <ul class="d-f f-a-c flex1">
          <li>
              <el-date-picker size="small" :editable="false" :clearable="false"
                  @change="dateChange" v-model="searchFilter.begin_time"
                  type="date" placeholder="选择日期" value-format="timestamp">
              </el-date-picker>
          </li>
          <li class="ml-10 mr-10 text">至</li>
          <li>
              <el-date-picker size="small" :editable="false" :clearable="false"
                  @change="dateChange" v-model="searchFilter.end_time"
                  type="date" placeholder="选择日期" value-format="timestamp">
              </el-date-picker>
          </li>
          <li class="ml-20">
            <el-select size="small" placeholder="全部课程" v-model="searchFilter.course_id" @change="searchHandle">
                <el-option label="全部课程" value=""></el-option>
                <el-option v-for="(item, index) in $store.state.course" :key="index" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </li>
          <li class="name ml-20"><el-input size="small" placeholder="请输入老师姓名" v-model.trim="searchFilter.keyword"></el-input></li>
          <li class="ml-20"><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
        </ul>

        <MyButton v-if="$$tools.isAuthority('exportTeacherRecord')" icon="import" type="border" fontColor="fc-m" class="ml-20" @click.native="exportAuthority">导出列表</MyButton>
      </div>

      <el-table class="mt-20 bor-t" :data="lessonTable.data" v-loading="loading" stripe>
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="老师姓名" prop="teacherName" align="center"></el-table-column>
        <el-table-column label="课程名称" prop="courseName" align="center"></el-table-column>
        <el-table-column label="课程类型" align="center">
          <template slot-scope="scope">
            {{scope.row.courseType == 1 ? '一对多' : '一对一'}}
          </template>
        </el-table-column>
        <el-table-column v-if="$$cache.getMemberInfo().class_pattern != 2" label="班级名称" align="center">
          <template slot-scope="scope">
            {{scope.row.classPattern == 2 ? '--' : scope.row.gradeName}}
          </template>
        </el-table-column>
        <el-table-column prop="lessonTime" align="center" :render-header="lessonTimeRenderHeader"></el-table-column>
        <el-table-column :render-header="removeRenderHeader" align="center">
          <template slot-scope="scope">
            <span class="fc-m cursor-pointer" @click="eliminationData = scope.row;getEliminationDetail(scope.row)">{{scope.row.eliminateTime}}</span>
          </template>
        </el-table-column>
        <el-table-column :render-header="courseRenderHeader" align="center">
          <template slot-scope="scope"><span class="fc-m cursor-pointer" @click="attendDetail(scope.row)">{{scope.row.attendTime}}</span></template>
        </el-table-column>
        <el-table-column prop="lessonNum" :render-header="lessonNumRenderHeader" align="center"></el-table-column>
      </el-table>
      <el-pagination v-if="lessonTable.total"
          class="d-f f-j-c mt-50 mb-50"
          :page-size="lessonTable.per_page"
          background layout="total, prev, pager, next"
          :total="lessonTable.total"
          :current-page="lessonTable.current_page"
          @current-change="paginationClick">
      </el-pagination>
    </el-card>

    <el-dialog title="学员消课次数详情" center :visible.sync="dialogStatus.elimination" :close-on-click-modal="false">
      <p class="fs-15" v-if="eliminationDetail.info">{{eliminationDetail.info.course_name}}-{{eliminationDetail.info.teacher_name}}</p>
      <el-table v-if="eliminationDetail.list" class="mt-20 bor-t" :data="eliminationDetail.list" v-loading="loading" show-summary :summary-method="get_sum" stripe>
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="上课日期" prop="lessonDate" align="center"></el-table-column>
        <el-table-column label="上课时间" prop="lessonTime" align="center"></el-table-column>
        <el-table-column label="人数上限" prop="limit_num" align="center"></el-table-column>
        <el-table-column label="应到人数" prop="shouldComeNum" align="center"></el-table-column>
        <el-table-column label="超员人数" prop="moreNum" align="center"></el-table-column>
        <el-table-column label="试听人数" prop="listenNum" align="center"></el-table-column>
      </el-table>
      <el-pagination v-if="eliminationDetail.total"
          class="d-f f-j-c mt-50 mb-50"
          :page-size="eliminationDetail.per_page"
          background layout="total, prev, pager, next"
          :total="eliminationDetail.total"
          :current-page="eliminationDetail.current_page"
          @current-change="dialogPaginationClick">
      </el-pagination>
    </el-dialog>

    <el-dialog title="上课详情" width="800px" center :visible.sync="dialogStatus.course" :close-on-click-modal="false">
      <p class="fs-15">{{courseDetail.course_name}}-{{courseDetail.teacher_name}}</p>
      <el-table class="mt-20 bor-t" :data="courseDetail.lists" v-loading="loading" stripe height="300">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="上课日期" prop="attendBeginDate" align="center"></el-table-column>
        <el-table-column label="上课时间" prop="attendTime" align="center"></el-table-column>
        <el-table-column label="上课教室" prop="attendClassRoom" align="center"></el-table-column>
        <el-table-column label="扣课时数" prop="attendLessonNum" align="center"></el-table-column>
      </el-table>
    </el-dialog>

  </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import qs from 'qs';
import config from 'config';

export default {
  components: {TableHeader, MyButton},
  data () {
    return {
      state: 'loading',
      loading: false,
      activeTab: '1',
      tabHeader: [{id: '1', name: '任课老师'}, {id: '2', name: '辅助老师'}],
      dialogStatus: {
        elimination: false,
        course: false
        },
      searchFilter: {
        begin_time: new Date(this.$format_date(new Date(), 'yyyy/MM/01')),
        end_time: new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0),
        course_id: '', keyword: ''
      },
      courseDetail: {teacher_name: '', lists: [], course_name: ''},
      eliminationData: '',
      eliminationDetail: {},
      lessonTable: {}
    };
  },
  methods: {
    lessonTimeRenderHeader (elem) {
      // return elem('div', {'class': {'d-f f-j-c': true}}, [elem('Explain', {attrs: {title: 'explain_l'}})]);
      return elem('Explain', {attrs: {title: 'explain_l'}});
    },
    removeRenderHeader (elem) {
      return elem('Explain', {attrs: {title: 'explain_m'}});
    },
    courseRenderHeader (elem) {
      return elem('Explain', {attrs: {title: 'explain_n'}});
    },
    lessonNumRenderHeader (elem) {
      return elem('Explain', {attrs: {title: 'explain_o'}});
    },
    tabClick () {
      this.searchFilter.begin_time = new Date(this.$format_date(new Date(), 'yyyy/MM/01'));
      this.searchFilter.end_time = new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0);
      this.searchFilter.keyword = '';
      this.searchFilter.course_id = '';

      this.getLessonLists();
    },
    searchHandle () {
      this.getLessonLists();
    },
    dateChange () {
      if (this.searchFilter.end_time < this.searchFilter.begin_time) {
        return this.$message.warning('结束时间不能小于开始时间，请重新选择');
      }
      this.getLessonLists();
    },
    async getEliminationDetail(data,page) {
      const params = {
        teacher_id: data.teacherId,
        course_id: data.courseId,
        grade_id: data.gradeId,
        begin_time: this.searchFilter.begin_time/1000,
        end_time: this.searchFilter.end_time/1000,
        teacher_type: this.activeTab,
        page: page || 1,
        pageNum: 5
      }
      let res = await this.$$request.post('eduCount/classTimeStatisticDetail',params);
      if(!res) return false;
      this.dialogStatus.elimination = true;
      this.eliminationDetail = res.lists;
    },
    attendDetail (data) {
      this.courseDetail.teacher_name = data.teacherName;
      this.courseDetail.course_name = data.courseName;
      this.courseDetail.lists = data.attendList;
      this.dialogStatus.course = true;
    },
    paginationClick (current_page) {
      this.getLessonLists(current_page);
    },
    dialogPaginationClick(current_page) {
      this.getEliminationDetail(this.eliminationData,current_page)
    },
    async exportAuthority () {
      let res = await this.$$request.get('/eduCount/exportClassTimeOutShadow');
      console.log(res)
      if (!res) {
        return 0;
      }
      this.exportTable();
    },
    //导出列表
    async exportTable () {
      let baseUrl = config.api;
      let token = this.$$cache.get('TOKEN') || this.$$cache.getSession('TOKEN') || '';

      let params = {
        type: 1,
        teacherType: this.activeTab,
        beginDate: this.searchFilter.begin_time / 1000,
        endDate: this.searchFilter.end_time / 1000,
        teacherName: this.searchFilter.keyword,
        courseId: this.searchFilter.course_id,
        token: token.replace('bearer ', '')
      };

      window.location.href = `${baseUrl}eduCount/exportClassTimeOut?${qs.stringify(params)}`;
    },
    get_sum (param) {
      let sums = [];
      const { columns, data } = param;

      sums[1] = '总计:';
      // sums[1] = '(该时段内的所有数据)';
      columns.forEach((item, index) => {
        switch (item.label) {
          case '人数上限':
            return sums[index] = this.eliminationDetail.info.totalLimitNum;
            break;
          case '应到人数':
            return sums[index] = this.eliminationDetail.info.totalShouldComeNum;
            break;
          case '超员人数':
            return sums[index] = this.eliminationDetail.info.totalMoreNum;
            break;
          case '试听人数':
            return sums[index] = this.eliminationDetail.info.totalListenNum;
            break;
        }
      });

      return sums;
    },
    //获取课时列表
    async getLessonLists (page) {
      this.loading = true;

      let params = {
        teacherType: this.activeTab,
        beginDate: this.searchFilter.begin_time / 1000,
        endDate: this.searchFilter.end_time / 1000,
        teacherName: this.searchFilter.keyword,
        courseId: this.searchFilter.course_id
      };

      if (page) {
        params.page = page;
      }

      let result = await this.$$request.post('eduCount/classTimeStatistics', params);

      console.log(result);
      if (!result) {
        return 0;
      }

      this.lessonTable = result.lists;
      this.loading = false;

      return true;
    }
  },
  async created () {
    let datas = await this.getLessonLists();

    if (datas) {
      this.state = 'loaded';
    }
  }
};
</script>

<style lang="less" scoped>
  .fifter-toolbar {
      ul li {
          &:not(:last-child) {
              width: 150px;
          }
          .el-select, .el-date-editor {
              width: 100%;
          }
          &.name {
              width: auto;
          }
          &.text {
              width: 15px;
          }
      }
  }
</style>


