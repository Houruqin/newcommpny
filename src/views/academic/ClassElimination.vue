<template>
  <div class="flex1">
    <el-card shadow="hover">
      <TableHeader title="学员消课记录">
      </TableHeader>
      <div class="p-r">
        <el-tabs v-model="active" @tab-click="tab_change">
          <el-tab-pane label="消课记录" name="elimination"></el-tab-pane>
          <el-tab-pane label="请假记录" name="leave"></el-tab-pane>
          <el-tab-pane label="旷课记录" name="absenteeism"></el-tab-pane>
        </el-tabs>
      </div>

      <div class="toolbar mt-20">
        <ul class="d-f">
          <li>
            <el-date-picker size="small" class="date-select" @change="date_change" v-model="search_info.begin" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <span>至</span>
            <el-date-picker size="small" class="date-select" @change="date_change" v-model="search_info.end" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
          </li>
          <li v-if="active === 'leave'" class="course_select ml-20">
            <el-select v-model="search_info.grade" placeholder="请选择班级" @change="filter_change">
              <el-option label="全部班级" :value="0"></el-option>
              <el-option v-for="item in grade_option" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
          </li>
          <li v-else class="course_select ml-20">
            <el-select v-model="search_info.course" placeholder="请选择课程" @change="filter_change">
              <el-option label="全部课程" :value="0"></el-option>
              <el-option v-for="item in course_option" :key="item.id" :label="item.name" :value="item.id"></el-option>
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
      <!-- 消课模块 -->
      <el-table key="elimination" v-if="active === 'elimination'" stripe class="student-table mt-30" :data="elimination_info.data" :span-method="objectSpanMethod" v-loading="loading" :show-header="true" :cell-style="cell_style">
        <el-table-column label="序号" align="center" width="50">
          <template slot-scope="scope">
            <div>
              <div>{{row_span_index.get(scope.row.student_id)+1}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="姓名" align="center" width="200">
          <template slot-scope="scope">
            <div>
              <NameRoute :id="scope.row.student_id">{{scope.row.student_name}}</NameRoute>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="课程名称" prop="course_name" align="center" width="300"></el-table-column>
        <el-table-column label="购课总课时" prop="buy_total" align="center"></el-table-column>
        <el-table-column label="签约前扣课时" prop="reduce_total" align="center"></el-table-column>
        <el-table-column label="签到扣课时" align="center">
          <template slot-scope="scope">
            <div>
              <span class='fc-m cursor-pointer' @click="show_elimination(scope.row.student_id,'签到')">{{scope.row.signin_total}}</span>
              <!-- <NameRoute :id="scope.row.student_id">{{scope.row.leave_total}}</NameRoute> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column label="请假扣课时" align="center">
          <template slot-scope="scope">
            <div>
              <span class='fc-subm cursor-pointer' @click="show_elimination(scope.row.student_id,'请假')">{{scope.row.leave_total}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="旷课扣课时" align="center">
          <template slot-scope="scope">
            <div>
              <span class='fc-m cursor-pointer' @click="show_elimination(scope.row.student_id,'旷课')">{{scope.row.absenteeism_total}}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="剩余课时" prop="remain_total" align="center"></el-table-column>
      </el-table>
      <!-- 请假模块 -->
      <el-table key="leave" v-if="active === 'leave'" stripe class="student-table mt-30" :data="leave_info.data" v-loading="loading" :show-header="true">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="姓名" align="center">
          <template slot-scope="scope">
            <div>
              <NameRoute :id="scope.row.student.id">{{scope.row.student.name}}</NameRoute>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="请假课时" align="center" width="300">
          <template slot-scope="scope">
            <div>
              <div>{{scope.row.grade.name}}</div>
              <div>{{scope.row.timetable.begin_time | date('yyyy-MM-dd hh:mm')}}-{{scope.row.timetable.end_time | date('hh:mm')}}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="请假时间" align="center">
          <template slot-scope="scope">
            <div>{{scope.row.created_at | date('yyyy-MM-dd hh:mm')}}</div>
          </template>
        </el-table-column>
        <el-table-column label="批复状态" prop="status_describe" align="center"></el-table-column>
        <el-table-column label="批复时间" align="center">
          <template slot-scope="scope">
            <div>{{scope.row.is_receive_apply | date('yyyy-MM-dd hh:mm')}}</div>
          </template>
        </el-table-column>
        <el-table-column label="批复人" prop="teacher.name" align="center"></el-table-column>
      </el-table>
      <!-- 旷课模块 -->
      <el-table key="absenteeism" v-if="active === 'absenteeism'" stripe class="student-table mt-30" :data="absenteeism_info.data" v-loading="loading" :show-header="true">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="姓名" prop="student_name" align="center">
          <template slot-scope="scope">
            <div>
              <NameRoute :id="scope.row.student_id">{{scope.row.student_name}}</NameRoute>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
        <el-table-column label="旷课时间" align="center">
          <template slot-scope="scope">
            <div>{{scope.row.begin_time | date('MM-dd hh:mm')}}-{{scope.row.end_time | date('hh:mm')}}</div>
          </template>
        </el-table-column>
        <el-table-column label="旷课课程" prop="course_name" align="center"></el-table-column>
        <el-table-column label="任课老师" align="center">
          <template slot-scope="scope">
            <div>{{scope.row.teacher.name}}　{{scope.row.teacher.mobile}}</div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination v-if="page_info.total > 10" class="d-f f-j-c mt-50 mb-50" :page-size="10" background layout="total, prev, pager, next" :total="page_info.total" :current-page="page_info.page" @current-change="go_page">
      </el-pagination>

      <!-- 消课详情弹窗 -->
      <el-dialog :title="dialog.c_record.title+'消课记录'" width="900px" center :visible.sync="dialog.c_record.show" :close-on-click-modal="false">
        <el-row class='mb-10'>
          <el-col :span="6">王同学</el-col>
          <el-col :span="3" :offset="15" class='t-r'>
            <MyButton @click.native="elimination" :radius="false">手动消课</MyButton>
          </el-col>
        </el-row>
        <el-table stripe class="student-table" :data="dialog.c_record.data" v-loading="dialog.loading" :show-header="true">
          <el-table-column label="序号" type="index" align="center"></el-table-column>
          <el-table-column label="上课日期" align="center">
            <template slot-scope="scope">
              <div></div>
            </template>
          </el-table-column>
          <el-table-column label="上课时间" align="center">
            <template slot-scope="scope">
              <div></div>
            </template>
          </el-table-column>
          <el-table-column label="上课老师" align="center"></el-table-column>
          <el-table-column label="上课教室" align="center"></el-table-column>
          <el-table-column label="扣课时数" align="center"></el-table-column>
          <el-table-column label="结课状态" align="center"></el-table-column>
        </el-table>
        <!-- 分页 -->
        <el-pagination v-if="dialog.page_info.total > 7" class="d-f f-j-c mt-10" :page-size="7" background layout="total, prev, pager, next" :total="dialog.page_info.total" :current-page="dialog.page_info.current_page" @current-change="go_leave_record_page">
        </el-pagination>
      </el-dialog>

      <!-- 手动消课弹窗 -->
      <el-dialog title="手动消课" width="800px" center :visible.sync="dialog.c_record.show" :close-on-click-modal="false">
        <el-form :model="form" label-width="100px" :rules="rules" ref="userForm" size="small">
          <div class="form-box">
            <el-row>
              <el-col :span="11">
                <el-form-item label="上课时间：" prop="class_time">
                  <el-date-picker v-model="form.entry_date" type="date" :editable="false" placeholder="选择日期" value-format="timestamp">
                  </el-date-picker>
                </el-form-item>
                <el-form-item label="上课教室：" class="mt-30" prop="class_room">
                  <el-select v-model="form.role_type" placeholder="选择教室">
                    <el-option v-for="(item, index) in roleLists" v-if="item.name !== 'master'" :key="index" :label="item.display_name" :value="item.name"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="11" :offset="1">
                <el-form-item label="上课老师：" prop="teacher">
                  <el-input v-model.number="form.mobile" placeholder="选择老师"></el-input>
                </el-form-item>
                <el-form-item label="扣课时数：" class="mt-30" prop="lesson_num">
                  <el-input-number v-model="form.lesson_num" controls-position="right" :min="1" :max="200"></el-input-number>
                  <span class="pl-10">课时</span>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
        <div class="mt-50 d-f f-j-c">
          <MyButton @click.native="doneHandle">确定</MyButton>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import TableHeader from "../../components/common/TableHeader";
import MyButton from "../../components/common/MyButton";
import NameRoute from "../../components/common/NameRoute";

export default {
  data() {
    return {
      active: "elimination",
      //搜索信息
      search_info: {
        course: 0,
        grade: 0,
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
      elimination_info: {
        data: []
      },
      //请假信息
      leave_info: {
        data: []
      },
      //旷课信息
      absenteeism_info: {
        data: []
      },
      //分页信息
      page_info: {
        page_num: 10,
        page: 1,
        total: 0
      },
      //弹窗信息
      dialog: {
        c_record: {
          show: false,
          data: [],
          title: ""
        },
        c_handle: {
          show: false,
          data: []
        },
        loading: false,
        page_info: {
          page_num: 10,
          page: 1,
          total: 0,
          current_page: 1
        }
      },
      form: {
        class_room: [],
        class_time: "",
        teacher: [],
        lesson_num: ""
      },

      rules: {
        class_room: [
          { required: true, message: "请选择上课教室", trigger: "change" }
        ],
        class_time: [
          { required: true, message: "请选择上课时间", trigger: "change" }
        ],
        teacher: [
          { required: true, message: "请选择上课老师", trigger: "change" }
        ],
        lesson_num: [{ required: true, message: "请输入扣课时数" }]
      },
      loading: false,
      row_span_num: new Map(),
      row_span_index: new Map()
    };
  },
  computed: {
    course_option() {
      return this.$store.state.course;
    },
    grade_option() {
      return this.$store.state.grade;
    }
  },
  methods: {
    init_search_info() {
      let search_info = {
        course: 0,
        grade: 0,
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

    //切换tab加载数据
    tab_change() {
      this.page_info.page = 1;
      this.init_search_info();
      this.get_data();
    },
    //更改日期加载数据
    date_change() {
      if (this.search_info.end < this.search_info.begin)
        return this.$message.warning("结束时间不能小于开始时间，请从新选择");
      this.page_info.page = 1;
      this.get_data();
    },
    //筛选条件加载数据
    filter_change() {
      this.page_info.page = 1;
      this.get_data();
    },
    //搜索按钮搜索
    search() {
      this.page_info.page = 1;
      this.get_data();
    },
    //页面跳转
    go_page(page) {
      this.page_info.page = page;
      this.get_data();
    },
    //合并表格的行
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0 || columnIndex === 1) {
        let row_info = this.row_span_num.get(row.student_id);
        //该学生出现的次数(即：该学生所占的表格行数)
        if (row_info) {
          let num = row_info.length;
          //如果表格行索引等于该学生数组的第一个值 则改变行高  其余的行高则皆为0
          if (rowIndex === row_info[0]) {
            return {
              rowspan: num,
              colspan: 1
            };
          } else {
            return {
              rowspan: 0,
              colspan: 0
            };
          }
        }
      }
    },
    //调整单元格样式
    cell_style({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 1) {
        console.log(row, column, rowIndex, columnIndex);
      }
    },
    //查看消课详情
    show_elimination(s_id, title) {
      this.dialog.c_record.show = true;
      this.dialog.c_record.title = title;
    },
    //消课
    elimination() {
      this.dialog.c_handle.show = true;
    },
    //====================获取数据方法====================
    get_data() {
      switch (this.active) {
        case "elimination":
          this.get_elimination_data();
          break;
        case "leave":
          this.get_leave_data();
          break;
        case "absenteeism":
          this.get_absenteeism_data();
          break;
      }
    },
    //获取消课记录
    get_elimination_data() {
      this.row_span_num = new Map();
      this.row_span_index = new Map();
      this.loading = true;
      const params = {
        start_date: this.get_seconde(this.search_info.begin),
        end_date: this.get_seconde(this.search_info.end),
        stu_name: this.search_info.name,
        course_id: this.search_info.course,
        page: this.page_info.page,
        page_num: this.page_info.page_num
      };
      this.$$request
        .post("api/eduCount/classEliminationLists", params)
        .then(res => {
          let data = res.lists.data;
          let data_map = new Map();
          for (let i = 0; i < data.length; i++) {
            //如果map里没有该学生数据  则存储
            if (!data_map.get(data[i].student_id)) {
              data_map.set(data[i].student_id, [data[i]]);
            } else {
              data_map.get(data[i].student_id).push(data[i]);
            }
          }
          let data_sort = [];
          for (let value of data_map) {
            data_sort.push(...value[1]);
          }
          this.elimination_info.data = data_sort;
          this.merge_data(data_sort);
          this.page_info.total = res.lists.total;
          this.loading = false;
        });
    },
    merge_data(data) {
      let j = 0;
      for (let i = 0; i < data.length; i++) {
        if (!this.row_span_num.get(data[i].student_id)) {
          this.row_span_num.set(data[i].student_id, [i]);
          this.row_span_index.set(data[i].student_id, j);
          j++;
        } else {
          this.row_span_num.get(data[i].student_id).push(i);
        }
      }
      // console.log(this.row_span_index)
    },
    //获取请假记录
    get_leave_data() {
      const params = {
        start: this.get_seconde(this.search_info.begin),
        end: this.get_seconde(this.search_info.end),
        student_name: this.search_info.name,
        grade_id: this.search_info.grade,
        page: this.page_info.page,
        page_num: this.page_info.page_num
      };
      this.$$request
        .post("api/leaveTicket/processedLists", params)
        .then(res => {
          this.leave_info.data = res.lists.data;
          this.page_info.total = res.lists.total;
        });
    },
    //获取旷课记录
    get_absenteeism_data() {
      const params = {
        data: {
          page_num: this.page_info.page_num,
          start: this.get_seconde(this.search_info.begin),
          end: this.get_seconde(this.search_info.end),
          course_id: this.search_info.course,
          name: this.search_info.name,
          mobile: ""
        },
        page: this.page_info.page
      };
      this.$$request.post("api/sign/absent", params).then(res => {
        this.absenteeism_info.data = res.lists.data;
        this.page_info.total = res.lists.total;
      });
    },
    //将时间转换为秒数
    get_seconde(date) {
      return new Date(date).getTime() / 1000;
    }
  },
  created() {
    this.get_data();
  },
  mounted() {
    console.timeEnd("page");
    console.log(this.$store.state);
    console.log(this.$store.state["course"]);
  },
  components: { TableHeader, MyButton, NameRoute }
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
// .clear_handle{
//   background-color: #45DAD5;
//   padding:
// }
</style>


