<template>
  <div class="flex1">
    <el-card shadow="hover">
      <TableHeader title="试听课记录">
      </TableHeader>

      <div class="toolbar mt-20">
        <ul class="d-f">
          <li>
            <el-date-picker size="small" class="date-select" @change="date_change" v-model="search_info.begin" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <span>至</span>
            <el-date-picker size="small" class="date-select" @change="date_change" v-model="search_info.end" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
          </li>
          <li class="course_select ml-20">
            <el-select v-model="search_info.grade" placeholder="请选择班级" @change="filter_change">
              <el-option label="全部班级" :value="0"></el-option>
              <el-option v-for="item in grade_option" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </li>
          <li class="teacher_select ml-20">
            <el-select v-model="search_info.status" placeholder="请选择状态" @change="filter_change">
              <!-- <el-option label="全部状态" :value="0"></el-option> -->
              <el-option v-for="item in status_option" :key="item.code" :label="item.comment" :value="item.code"></el-option>
            </el-select>
          </li>
          <li class="name ml-20">
            <el-input size="small" placeholder="请输入学员姓名" v-model.trim="search_info.name"></el-input>
          </li>
          <li>
            <MyButton @click.native="search" :radius="false">搜索</MyButton>
          </li>
        </ul>
      </div>

      <el-table stripe class="student-table mt-30" :data="audition_info.data" v-loading="loading" :show-header="true">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="试听学员" prop="stu_name" align="center">
          <template slot-scope="scope">
            <div>
              <NameRoute :type="scope.row.stu_type" :id="scope.row.stu_id">{{scope.row.stu_name}}</NameRoute>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="试听班级" prop="grade_name" align="center"></el-table-column>
        <el-table-column label="试听课程" prop="cour_name" align="center"></el-table-column>
        <el-table-column label="上课老师" align="center">
          <template slot-scope="scope">
            <div>
              <span v-for="teacher in scope.row.teacherinfo" :key="teacher.teacher_id">{{teacher.teacher_name}} </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="试听日期" align="center">
          <template slot-scope="scope">
            <div>
              <div>{{scope.row.begin_time | date('yyyy-MM-dd hh:mm')}}-{{scope.row.end_time | date('hh:mm')}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="试听状态" prop="status" align="center">
          <template slot-scope="scope">
            <div>
              <div :style="{'color' : scope.row.status === 4 ? '#606266' : (scope.row.status === 2 ? '#de7b1c' : '#45DAD5')}">{{scope.row.status === 4 ? '已试听' : (scope.row.status === 2 ? '待试听' : '已过期')}}</div>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-if="page_info.total > 10" class="d-f f-j-c mt-50 mb-50" :page-size="10" background layout="total, prev, pager, next" :total="page_info.total" :current-page="page_info.page" @current-change="go_page">
      </el-pagination>
    </el-card>

  </div>
</template>

<script>
import TableHeader from "../../components/common/TableHeader";
import MyButton from "../../components/common/MyButton";
import NameRoute from  "../../components/common/NameRoute";

export default {
  data() {
    return {
      //搜索信息
      search_info: {
        grade: 0,
        status: 0,
        begin: new Date(this.$format_date(new Date(), "yyyy/MM/01")),
        end: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
          24
        ),
        name: ""
      },
      //消课信息
      audition_info: {
        data: []
      },
      //分页信息
      page_info: {
        page_num: 10,
        page: 1,
        total: 0
      },
      loading: false
    };
  },
  computed: {
    grade_option() {
      return this.$store.state.listen_grade;
    },
    status_option() {
      return this.$store.state.listen_status;
    }
  },
  methods: {
    init_search_info() {
      let search_info = {
        grade: 0,
        status: 0,
        begin: new Date(this.$format_date(new Date(), "yyyy/MM/01")),
        end: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
          24
        ),
        name: ""
      };
      this.search_info = search_info;
    },
    tab_change() {
      this.page_info.page = 1;
      this.init_search_info();
      this.get_data();
    },
    date_change() {
      if (this.search_info.end < this.search_info.begin)
        return this.$message.warning("结束时间不能小于开始时间，请从新选择");
      this.page_info.page = 1;
      this.get_data();
    },
    filter_change() {
      this.page_info.page = 1;
      this.get_data();
    },
    search() {
      this.page_info.page = 1;
      this.get_data();
    },
    go_page(page) {
      this.page_info.page = page;
      this.get_data();
    },
    get_data() {
      this.loading = true;
      const params = {
        start_date: this.get_seconde(this.search_info.begin),
        end_date: this.get_seconde(this.search_info.end),
        stu_name: this.search_info.name,
        status: this.search_info.status,
        grade_id: this.search_info.grade,
        page: this.page_info.page,
        page_num: this.page_info.page_num
      };
      this.$$request
        .post("api/eduCount/listenCourseLists", params)
        .then(res => {
          this.audition_info.data = res.listenCourseLists.data;
          this.page_info.total = res.listenCourseLists.total;
          this.loading = false;
        });
    },
    //将时间转换为秒数
    get_seconde(date) {
      return new Date(date).getTime() / 1000;
    }
  },
  created() {
    this.$store.dispatch("getListenGrade");
    this.$store.dispatch("getStatus");
    this.get_data();
  },
  components: { TableHeader, MyButton, NameRoute}
};
</script>

<style lang="less" scoped>
.student-table {
  border-top: 1px #e3e3e3 solid;
}
.toolbar /deep/ .el-input {
  width: 160px;
}
.toolbar /deep/ .el-input__inner {
  height: 32px;
  line-height: 32px;
}
.toolbar /deep/ .el-input__icon {
  line-height: 32px;
}
</style>


