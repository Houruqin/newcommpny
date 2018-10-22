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

        <MyButton icon="import" type="border" fontColor="fc-m" class="ml-20" @click.native="exportTable">导出列表</MyButton>
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
        <el-table-column prop="eliminateTime" :render-header="removeRenderHeader" align="center"></el-table-column>
        <el-table-column prop="attendTime" :render-header="courseRenderHeader" align="center">
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

    <el-dialog title="上课详情" width="650px" center :visible.sync="dialogStatus.course" :close-on-click-modal="false">
      <p class="fs-15">上课老师：{{courseDetail.teacher_name}}</p>
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
      dialogStatus: {course: false},
      searchFilter: {
        begin_time: new Date(this.$format_date(new Date(), 'yyyy/MM/01')),
        end_time: new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0),
        course_id: '', keyword: ''
      },
      courseDetail: {teacher_name: '', lists: []},
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
    attendDetail (data) {
      this.courseDetail.teacher_name = data.teacherName;
      this.courseDetail.lists = data.attendList;
      this.dialogStatus.course = true;
    },
    paginationClick (current_page) {
      this.getLessonLists(current_page);
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

      window.location.href = `${baseUrl}eduCount/export?${qs.stringify(params)}`;
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


