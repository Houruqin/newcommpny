<template>
  <div class="flex1">
    <PageState :state="state" />
    <el-card shadow="hover">
      <TableHeader title="转课记录"></TableHeader>

      <div class="fifter-toolbar mt-20 mb-10 d-f">
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
          <li class="name ml-20"><el-input size="small" placeholder="请输入学员姓名" v-model.trim="searchFilter.keyword"></el-input></li>
          <li class="ml-20"><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
        </ul>

        <MyButton icon="import" v-if="$$tools.isAuthority('exportTransferRecord')" type="border" fontColor="fc-m" class="ml-20" @click.native="exportAuthority">导出列表</MyButton>
      </div>

      <el-table stripe class="student-table mt-30" :data="courseLists.data" v-loading="loading" :show-header="true">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="学员姓名" align="center">
          <template slot-scope="scope">
            <router-link v-if="$$tools.isAuthority('signDetail')" :to="{path: '/student/signeddetail', query: {id: scope.row.studentId}}" class="fc-m">{{scope.row.studentName}}</router-link>
            <span v-else>{{scope.row.student_name}}</span>
          </template>
        </el-table-column>
        <el-table-column label="转出课程" prop="outCourseName" align="center"></el-table-column>
        <el-table-column label="转入课程" prop="inCourseName" align="center"></el-table-column>
        <el-table-column label="转出课时" prop="outLessonNum" align="center"></el-table-column>
        <el-table-column label="转入课时" prop="inLessonNum" align="center"></el-table-column>
        <el-table-column label="操作人" prop="operationUserName" align="center"></el-table-column>
        <el-table-column label="转课时间" align="center">
          <template slot-scope="scope">{{scope.row.createdAt | date('yyyy-MM-dd')}}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" v-if="$$tools.isAuthority('transferCourse')">
          <template slot-scope="scope">
            <span class="fc-m cursor-pointer" @click="changeCourseDetail(scope.row.studentCourseId)">转课详情</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="courseLists.total"
          class="d-f f-j-c mt-50 mb-50"
          :page-size="courseLists.per_page"
          background layout="total, prev, pager, next"
          :total="courseLists.total"
          :current-page="courseLists.current_page"
          @current-change="paginationClick">
      </el-pagination>
    </el-card>

    <!-- 转课详情弹窗 -->
    <ChangeCourseContract :routerAble="false" v-model="dialogStatus.contract" :contractData="contractData" @CB-dialogStatus="CB_dialogStatus"></ChangeCourseContract>
  </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import ChangeCourseContract from '../../components/dialog/ChangeCourseContract';
import qs from 'qs';
import config from 'config';

export default {
  components: {TableHeader, MyButton, ChangeCourseContract},
  data () {
    return {
      state: 'loading',
      searchFilter: {
        begin_time: new Date(this.$format_date(new Date(), 'yyyy/MM/01')),
        end_time: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 24),
        keyword: ''
      },
      courseLists: {},
      loading: false,

      dialogStatus: {contract: false},
      contractData: {}
    }
  },
  methods: {
    getSeconde (date) {
      return new Date(date).getTime() / 1000;
    },
    CB_dialogStatus (type) {
      if (type === 'changeCourse') {
        this.contractData = {};
      }
    },
    dateChange () {
      if (this.searchFilter.end_time < this.searchFilter.begin_time) {
        return this.$message.warning('结束时间不能小于开始时间，请重新选择');
      }
      this.changeCourseLists();
    },
    searchHandle () {
      this.changeCourseLists();
    },
    // 获取转课详情
    async changeCourseDetail (id) {
      let res = await this.$$request.get("/studentCourse/getTransferDetail", {id: id});
      if (!res) {
        return 0;
      }

      this.contractData = res;
      this.dialogStatus.contract = true;
    },
    // 分页
    paginationClick (current_page) {
      this.changeCourseLists(current_page);
    },
    // 获取转课记录列表
    async changeCourseLists (page) {
      this.loading = true;
      let params = {
        startTime: this.getSeconde(this.searchFilter.begin_time),
        endTime: this.getSeconde(this.searchFilter.end_time),
        studentName: this.searchFilter.keyword
      };

      if (page) {
        params.page = page;
      }

      let res = await this.$$request.get('/eduCount/getTransferRecord', params);
      console.log(res);

      this.courseLists = res;
      this.loading = false;

      return true;
    },
    // 验证导出权限
    async exportAuthority () {
      let res = await this.$$request.get('/eduCount/exportTransferRecordShadow');
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
        startTime: this.getSeconde(this.searchFilter.begin_time),
        endTime: this.getSeconde(this.searchFilter.end_time),
        studentName: this.searchFilter.keyword,
        token: token.replace('bearer ', '')
      };

      window.location.href = `${baseUrl}eduCount/exportTransferRecord?${qs.stringify(params)}`;
    }
  },
  async created () {
    let datas = await this.changeCourseLists();

    if (datas) {
      this.state = 'loaded';
    }
  }
}
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


