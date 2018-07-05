<template>
  <div class="content flex1 workbench_container">
    <el-row :gutter="20" class="head_content">
      <el-col :span="17">
        <el-card shadow="hover">
          <TableHeader title="今日待办">
            <MyButton @click.native="register">登记学员</MyButton>
          </TableHeader>
          <el-tabs v-model="activeName" @tab-click="change_tab">

            <!-- 待处理请假 -->
            <el-tab-pane label="待处理请假" name="leave">
              <el-table class="student-table" :data="leave_info.data" v-loading="loading" :show-header="true">
                <el-table-column label="人员" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student.id}}">
                      <span class='c_icon' :class="[scope.row.student.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.student.name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="请假课程" prop="course.name" align="center"></el-table-column>
                <el-table-column label="上课时间" prop="timetable" align="center">
                  <template slot-scope="scope">
                    {{scope.row.timetable.begin_time | date('MM.dd')}}　 {{scope.row.timetable.begin_time | date('hh:mm')}}-{{scope.row.timetable.end_time | date('hh:mm')}}
                  </template>
                </el-table-column>
                <el-table-column label="请假原因" prop="reason" align="center"></el-table-column>
                <el-table-column label="操作" prop="operate" align="center">
                  <template slot-scope="scope">
                    <a class="cursor-pointer fc-m" @click="leave_handle(scope.row.id,2)">同意</a>
                    <a class="cursor-pointer fc-m ml-20 fc-subm" @click="open_refuse_dialog(scope.row.id)">拒绝</a>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 待分班学员 -->
            <el-tab-pane label="待分班学员" name="divide">
              <el-table class="student-table" :data="divide_info.data" v-loading="loading" :span-method="objectSpanMethod" :show-header="true">
                <el-table-column class-name="table_head" label="人员" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}">
                      <span class='c_icon' :class="[scope.row.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.student_name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="签约课程" prop="course_name" align="center"></el-table-column>
                <el-table-column label="操作" prop="operate" align="center">
                  <template slot-scope="scope">
                    <a class="cursor-pointer fc-m" @click="divide_class(scope.row)">分班</a>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 需续约学员 -->
            <el-tab-pane label="需续约学员" name="renewal">
              <el-table class="student-table" :data="renewal_info.data" :span-method="objectSpanMethod" v-loading="loading" :show-header="true">
                <el-table-column label="人员" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}">
                      <span class='c_icon' :class="[scope.row.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.student_name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="签约课程" prop="course_name" align="center"></el-table-column>
                <el-table-column label="剩余课时" prop="lesson_num_remain" align="center"></el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 生日学员 -->
            <el-tab-pane label="生日学员" name="birth">
              <el-table class="student-table" :data="birth_info.data" v-loading="loading" :show-header="true">
                <el-table-column label="人员" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.id}}">
                      <span class='c_icon' :class="[scope.row.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.name}}</span>
                      </span>
                    </router-link>

                  </template>
                </el-table-column>
                <el-table-column label="班级" prop="grade.name" align="center"></el-table-column>
                <el-table-column label="生日" prop="birthday" align="center">
                  <template slot-scope="scope">
                    {{scope.row.birthday | date('yyyy-MM-dd')}}
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
          <div v-if="activeName === 'leave'" @click="view_all_leave_record" class="more_record t-a-c fc-7 mt-20 cursor-pointer">历史请假记录>></div>
          <!-- 分页 -->
          <el-pagination v-if="page_info.total > 5" class="d-f f-j-c mt-10" :page-size="5" background layout="total, prev, pager, next" :total="page_info.total" :current-page="page_info.current_page" @current-change="go_page">
          </el-pagination>
          
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card shadow="hover">
          <TableHeader title="今日课程"></TableHeader>
          <el-row v-if="today_course_list.length>0" class="course_content content_height">
            <el-row class="course_list mt-10" v-for="item in today_course_list" :key="item.id">
              <el-row class='fc-3'>
                <el-col :span="11">
                  <span class='fc-3' :class="{'fc-m' : new Date().getTime() <= item.end_time*1000}">{{item.grade.name}}</span>
                  <span class='ml-20 fs-12 fc-9'>{{item.class_room.name}}</span>
                </el-col>
                <el-col :span="13" class="t-a-r">
                  <span @click="view_all_student(item.id,item.begin_time,item.end_time,item.grade_id,item.grade.name)" class='fs-12 cursor-pointer'>全部学员（{{item.students}}人） >></span>
                </el-col>
              </el-row>
              <el-row class="border_item">
                <el-col class="fs-13" :span="8">
                  <i class='c_icon icon_teacher'></i>
                  <span v-for="teacher in item.teacher" :key="teacher.id" class='ml-16'>{{teacher.name}}</span>
                </el-col>
                <el-col class="fs-13" :span="8">
                  <i class='c_icon icon_people'></i>
                  <span class='ml-16'>{{item.students}}人</span>
                </el-col>
                <el-col class="fs-13" :span="8">
                  <i class='c_icon icon_time'></i>
                  <span class='ml-16  '>{{item.begin_time | date('hh:mm')}}-{{item.end_time | date('hh:mm')}}</span>
                </el-col>
              </el-row>
            </el-row>
          </el-row>
          <el-row v-else class="no_content f-j-c d-f f-a-c">暂无课程</el-row>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="card-box">
      <el-col :span="17">
        <el-card shadow="hover">
          <TableHeader title="今日跟进管理"></TableHeader>
          <el-tabs v-model="follow_up_activeName" @tab-click="chage_follow_tab">

            <!-- 预约到访 -->
            <el-tab-pane label="预约到访" name="visit">
              <el-table class="student-table" :data="visit_list" v-loading="follow_loading" :show-header="true">
                <el-table-column label="人员" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/nosigndetail', query: {student_id: scope.row.student.id}}">
                      <span class='c_icon' :class="[scope.row.student.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.student.name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="预约时间" prop="invited_at" align="center">
                  <template slot-scope="scope">
                    {{scope.row.invited_at | date('MM-dd hh:mm')}}
                  </template>
                </el-table-column>
                <el-table-column label="顾问" prop="student.advisor.name" align="center"></el-table-column>
                <el-table-column label="操作" prop="operate" align="center">
                  <template slot-scope="scope">
                    <a v-if="scope.row.status === 2" class="cursor-pointer fc-m" @click="handle_visit(scope.row.id)">到达</a>
                    <span v-else class="fc-9">已到达</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 邀约试听 -->
            <el-tab-pane label="邀约试听" name="audition">
              <el-table class="student-table" :data="audition_list" v-loading="follow_loading" :show-header="true">
                <el-table-column label="人员" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/nosigndetail', query: {student_id: scope.row.student.id}}">
                      <span class='c_icon' :class="[scope.row.student.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.student.name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="试听课程" prop="timetable.course.name" align="center"></el-table-column>
                <el-table-column label="试听时间" prop="timetable" align="center">
                  <template slot-scope="scope">
                    {{scope.row.timetable.begin_time | date('MM-dd')}}　 {{scope.row.timetable.begin_time | date('hh:mm:ss')}}-{{scope.row.timetable.end_time | date('hh:mm')}}
                  </template>
                </el-table-column>
                <el-table-column label="操作" prop="operate" align="center">
                  <template slot-scope="scope">
                    <a v-if="scope.row.status === 4" class="cursor-pointer fc-m" @click="handle_audition(scope.row.id)">试听</a>
                    <span v-else class="fc-9">已试听</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 需跟进学员 -->
            <el-tab-pane label="需跟进学员" name="follow_up">
              <el-table class="student-table" :data="follow_up_list" v-loading="follow_loading" :show-header="true">
                <el-table-column label="人员" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/nosigndetail', query: {student_id: scope.row.student.id}}">
                      <span class='c_icon' :class="[scope.row.student.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.student.name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="跟进顾问" prop="student.advisor.name" align="center"></el-table-column>
                <el-table-column label="状态" prop="today" align="center"></el-table-column>
              </el-table>

            </el-tab-pane>

            <!-- 待分配意向学员 -->
            <el-tab-pane label="待分配意向学员" name="assign">
              <el-table class="student-table" :data="assign_list" v-loading="follow_loading" :show-header="true">
                <el-table-column label="人员" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/nosigndetail', query: {student_id: scope.row.id}}" class="fc-m">
                      <span class='c_icon' :class="[scope.row.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="跟进顾问" prop="advisor_info" align="center">
                  <template slot-scope="scope">
                    <span v-if="scope.row.advisor_info === null">待定</span>
                  </template>
                </el-table-column>
                <!-- <el-table-column label="状态" class="fc-subm" prop="follow_cn">
                      <template slot-scope="scope">
                            <span class="fc-subm">{{scope.row.follow_cn}}</span>
                        </template> 
                    </el-table-column> -->
              </el-table>
            </el-tab-pane>
          </el-tabs>

          <!-- 分页 -->
          <el-pagination v-if="follow_up_page_info.total > 5" class="d-f f-j-c mt-10" :page-size="5" background layout="total, prev, pager, next" :total="follow_up_page_info.total" :current-page="follow_up_page_info.current_page" @current-change="go_follow_page">
          </el-pagination>
        </el-card>
      </el-col>
      <el-col :span="7">
        <el-card shadow="hover" class="notice_list">
          <TableHeader title="员工通知">
            <MyButton @click.native="edit_notice">发通知</MyButton>
          </TableHeader>
          <el-tabs v-model="notice_activeName" @tab-click="change_notice_tab">

            <!-- 已收通知 -->
            <el-tab-pane name="receive">
              <span slot="label">
                <el-badge :value="unread_num" :max="10" class="item">已收通知</el-badge>
              </span>
              <el-row v-loading="notice_loading" class="content_height" v-if="notice_lists.length>0">
                <el-row class="cursor-pointer fc-9" :class="{'unread' : notice.is_receive === 0 }" @click.native="notice_detail(notice)" v-for="(notice,index) in notice_lists" :key="index">
                  <el-col :span="18">【{{notice.notification.type}}】{{notice.notification.title}}</el-col>
                  <el-col :span="6">{{notice.updated_at | date('yyyy.MM.dd')}}</el-col>
                </el-row>
              </el-row>
              <el-row v-else class="f-j-c d-f f-a-c fc-9">暂无通知</el-row>
            </el-tab-pane>
            <!-- 已发通知 -->
            <el-tab-pane label="已发通知" name="send">
              <el-row v-loading="notice_loading" class="content_height" v-if="notice_send_lists.length>0">
                <el-row class="cursor-pointer" @click.native="notice_detail(notice)" v-for="(notice,index) in notice_send_lists" :key="index">
                  <el-col :span="18">【{{notice.type}}】{{notice.title}}</el-col>
                  <el-col :span="6">{{notice.updated_at | date('yyyy.MM.dd')}}</el-col>
                </el-row>
              </el-row>
              <el-row v-else class="f-j-c d-f f-a-c fc-9">暂无通知</el-row>
            </el-tab-pane>

          </el-tabs>

          <!-- 分页 -->
          <el-pagination v-if="notice_page_info.total > 10" class="d-f f-j-c mt-10" :page-size="10" background layout="total, prev, pager, next" :total="notice_page_info.total" :current-page="notice_page_info.current_page" @current-change="go_notice_page">
          </el-pagination>
        </el-card>
      </el-col>
    </el-row>

    <el-row class="card-box">
      <el-col :span="24">
        <el-card shadow="hover" class="course_finished">
          <TableHeader title="课消统计"></TableHeader>
          <el-row>
            <el-col :span="6">
              <el-date-picker v-model="search_time" type="daterange" range-separator="-" :editable="false" @change="choose_time" value-format='yyyy-MM-dd' start-placeholder="开始日期" end-placeholder="结束日期">
              </el-date-picker>
            </el-col>
            <el-col :span="14">　</el-col>
            <el-col :span="4">
              <el-button-group>
                <el-button @click.native="choose_type('course')" :class="[search_type==='course' ? 'check_type' : 'type']">按课程</el-button>
                <el-button @click.native="choose_type('teacher')" :class="[search_type==='teacher' ? 'check_type' : 'type']">按老师</el-button>
              </el-button-group>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col id="pie" :span="6">
            </el-col>
            <el-col id="bar" :span="18"></el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>

    <!-- 登记学员弹窗 -->
    <el-dialog title="学员登记" width="800px" center :visible.sync="show_register_dialog" :close-on-click-modal="false" @close="dialogClose('addStudent')">
      <el-form :model="register_info" label-width="120px" size="small" ref="addStudent" :rules="rules">
        <div class="form-box">
          <h3>家长信息</h3>
          <el-row>
            <el-col :span="13">
              <el-form-item label="家长姓名：" prop="parent_name">
                <el-input v-model.trim="register_info.parent_name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4" :offset="1">
              <el-form-item prop="relation" label-width="0">
                <el-select v-model="register_info.relation" placeholder="请选择">
                  <el-option v-for="(item, index) in relationArr" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="mt-10">
            <el-col :span="13">
              <el-form-item label="手机号码：" prop="mobile">
                <el-input v-model.trim="register_info.mobile" ref="mobileObj"></el-input>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="家庭住址：" class="mt-10">
            <el-col :span="20">
              <el-input v-model.trim="register_info.address" placeholder="选填"></el-input>
            </el-col>
          </el-form-item>

          <h3>学员信息</h3>

          <el-row>
            <el-col :span="13">
              <el-form-item label="学员姓名：" prop="student_name">
                <el-input v-model.trim="register_info.student_name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="4" :offset="1">
              <el-form-item prop="sex" label-width="0">
                <el-select v-model="register_info.sex" placeholder="选择性别">
                  <el-option label="男" :value="1"></el-option>
                  <el-option label="女" :value="0"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="mt-10">
            <el-col :span="13">
              <el-form-item label="出生日期：">
                <el-date-picker v-model="register_info.birthday" :picker-options="pickerBeginDateAfter" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="就读学校：" class="mt-10">
            <el-col :span="20">
              <el-input v-model.trim="register_info.school_name" placeholder="选填"></el-input>
            </el-col>
          </el-form-item>

          <el-row class="mt-10">
            <el-col :span="12">
              <el-form-item label="意向课程：">
                <el-select v-model="register_info.like_course" placeholder="选择课程">
                  <el-option v-for="(item, index) in fillInfo.course" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8" :offset="1">
              <el-form-item label-width="0">
                <el-select v-model="register_info.like_grade" placeholder="选择意向度">
                  <el-option v-for="(item, index) in likeGrade" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row class="mt-10">
            <el-col :span="12">
              <el-form-item label="渠道信息：" prop="source_id">
                <el-select v-model="register_info.source_id" placeholder="请选择">
                  <el-option v-for="(item, index) in fillInfo.source" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="2" class="add-source cursor-pointer ml-20" @click.native="addSource">
              <img src="../../images/common/add.png" alt="">
            </el-col>
          </el-row>

          <el-row class="mt-10">
            <el-col :span="12">
              <el-form-item label="分配顾问：">
                <el-select v-model="register_info.advisor_id" placeholder="选择顾问">
                  <el-option v-for="(item, index) in fillInfo.advisor" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="备注：" prop="remark" class="mt-10 textarea-cls">
            <el-col :span="20">
              <el-input type="textarea" resize="none" :rows="4" placeholder="请输入备注信息" v-model.trim="register_info.remark"></el-input>
            </el-col>
          </el-form-item>

          <div class="d-f f-j-c mt-50">
            <MyButton @click.native="confirm('addStudent')">确定</MyButton>
          </div>
        </div>
      </el-form>

      <el-dialog title="添加渠道" width="500px" center :visible.sync="show_source_dialog" :close-on-click-modal="false" @close="dialogClose('sourseForm')" append-to-body>
        <el-form :model="sourceForm" label-width="100px" size="small" :rules="sourceRules" ref="sourseForm">
          <div class="form-box">
            <el-form-item label="渠道来源：" prop="name">
              <el-input v-model.trim="sourceForm.name" placeholder="渠道名称"></el-input>
            </el-form-item>
            <div class="d-f f-j-c mt-40">
              <MyButton @click.native="confirm('sourseForm')">确定</MyButton>
            </div>
          </div>
        </el-form>
      </el-dialog>
    </el-dialog>

    <!-- 购买课程弹窗 -->
    <el-dialog title="购买课程" width="1100px" center :visible.sync="show_buy_course_dialog" :close-on-click-modal="false" @close="dialogClose('courseForm')">
      <el-form :model="courseForm" label-width="95px" size="small" :rules="courseRules" ref="courseForm">
            <div class="form-box">
                <p class="head-info">购买信息</p>
                <el-row class="mt-10">
                    <el-col :span="7">
                        <el-form-item label="选择课程：" prop="course_id">
                            <el-select v-model="courseForm.course_id" placeholder="选择课程" @change="addCourseChange">
                                <el-option v-for="(item, index) in courseLists" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-form-item label="购课日期：" prop="pay_at">
                            <el-date-picker v-model="courseForm.pay_at" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span="7" :offset="1">
                        <el-form-item label="课程有效期：" prop="expire" label-width="110px">
                            <el-input-number v-model="courseForm.expire" controls-position="right" :min="1" :max="120"></el-input-number><span class="pl-10">月</span>
                        </el-form-item>
                    </el-col>
                </el-row>

                <p class="head-info">课程信息</p>
                <el-row class="mt-10 course-form-box">
                    <el-col :span="7">
                        <el-form-item label="购买课时：" prop="lesson_num">
                            <el-input-number v-model="courseForm.lesson_num" controls-position="right" :min="1" :max="200"></el-input-number><span class="pl-10">课时</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8" :offset="1">
                        <el-form-item label="课时单价：" prop="unit_price">
                            <el-input-number v-model="courseForm.unit_price" controls-position="right" :min="0" :max="9999"></el-input-number><span class="pl-10">元/课时</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8">
                        <el-form-item label="允许请假数：" prop="leave_num" label-width="110px">
                            <el-input-number v-model="courseForm.leave_num" controls-position="right" :min="0" :max="200"></el-input-number><span class="pl-10">次</span>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row class="course-form-box">
                    <el-col :span="7">
                        <el-form-item label="已扣课时：" prop="lesson_num_already">
                            <el-input-number v-model="courseForm.lesson_num_already" controls-position="right" :min="0" :max="200"></el-input-number><span class="pl-10">课时</span>
                        </el-form-item>
                    </el-col>
                </el-row>

                <p class="head-info">购课优惠及费用</p>
                <el-row class="mt-10 course-form-box">
                    <el-col :span="7">
                        <el-form-item label="赠送课时：" prop="given_num">
                            <el-input-number v-model="courseForm.given_num" controls-position="right" :min="0" :max="200"></el-input-number><span class="pl-10">课时</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="8" :offset="1">
                        <el-form-item label="优惠金额：" prop="preferential_price">
                            <el-input-number v-model="courseForm.preferential_price" controls-position="right" :min="0" :max="9999"></el-input-number><span class="pl-10">元</span>
                        </el-form-item>
                    </el-col>
                    <el-col :span="7">
                        <el-form-item label="付款方式：" prop="pay_way" label-width="110px">
                            <el-select v-model="courseForm.pay_way" placeholder="付款方式">
                                <el-option v-for="(item, index) in paymentMethod" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>

                <el-form-item label="购买说明：" class="mt-10 textarea-cls" prop="explain">
                    <el-col :span="21">
                        <el-input type="textarea" :rows="4" placeholder="购买说明" v-model.trim="courseForm.explain"></el-input>
                    </el-col>
                </el-form-item>

                <div class="pl-90">业绩归属：<span>{{courseForm.advisor_name}}</span></div>

                <div class="mt-10 pl-10">总金额：<span class="fc-m fs-22">￥{{courseForm.unit_price * courseForm.lesson_num - courseForm.preferential_price}}</span></div>

                <div class="d-f f-j-c mt-30">
                    <MyButton @click.native="confirm('courseForm')">提交生成合约</MyButton>
                </div>
            </div>
        </el-form>
    </el-dialog>

    <!-- 购课合约弹窗 -->
    <el-dialog title="购课合约" width="800px" center :visible.sync="show_course_contract_dialog" :close-on-click-modal="false" id="contract">
      <div class="contract-box" v-if="Object.keys(contractData).length">
        <p>
            <span>甲方：<i>{{contractData.institution.name}}</i></span>
            <span>签约校区：<i>{{contractData.school.name}}</i></span>
            <span>签约人：<i>{{contractData.user.name}}</i></span>
        </p>
        <p v-if="contractData.parent">
            <span>乙方(学员)：<i>{{contractData.student.name}}</i></span>
            <span>乙方家长：<i>{{contractData.parent.name}}</i></span>
            <span>电话：<i>{{contractData.parent.mobile}}</i></span>
        </p>
        <p><span>签约日期：<i>{{$$tools.format(contractData.pay_at)}}</i></span></p>

        <p>购买课程详情：</p>
        <table class="course-table">
            <tr>
                <td>课程名称</td>
                <td>购买课时</td>
                <td>课时单价</td>
                <td>优惠金额</td>
                <td>赠送课时</td>
                <td>已扣课时</td>
                <td>合同金额</td>
            </tr>
            <tr>
                <td>{{contractData.course.name}}</td>
                <td>{{contractData.lesson_num}}</td>
                <td>{{contractData.unit_price}}</td>
                <td>{{contractData.preferential_price}}</td>
                <td>{{contractData.given_num}}</td>
                <td>{{contractData.lesson_num_already}}</td>
                <td>{{contractData.real_price}}</td>
            </tr>
        </table>

        <p>课程有效期：<i>{{contractData.expire}}</i>个月</p>
        <p>购买日期：<i>{{$$tools.format(contractData.pay_at)}}</i></p>
        <p>购买说明：<i>{{contractData.explain}}</i></p>
        <p>
            <img :src="`data:image/png;base64,${contractData.qr}`" /><br/>
            <span>扫码获取合约信息</span>
        </p>
        <div class="d-f f-j-e">
          <MyButton @click.native="goSignedLists">确定</MyButton>
          <MyButton @click.native="printCompact" class="ml-20">打印合同</MyButton>
        </div>
      </div>
    </el-dialog>

    <!-- 拒绝请假弹窗 -->
    <el-dialog :visible.sync="leave_info.show_refuse_dialog" :show-close="false" width="400px">
      <el-input type="textarea" :rows="2" placeholder="请输入拒绝理由" resize="none" :autosize="{ minRows: 4, maxRows: 6}" :maxlength="20" v-model="leave_info.remark">
      </el-input>
      <span slot="footer" class="dialog-footer">
        <span class='text_num'>{{leave_info.remark.length}}/20</span>
        <el-button type="primary" @click="leave_handle(leave_info.id,3);leave_info.show_refuse_dialog = false;">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分班弹窗 -->
    <el-dialog title="分班" width="500px" center :visible.sync="divide_info.show_divide_dialog" :close-on-click-modal="false">
      <div class="form-box">
        <div class="fc-m fs-16">{{divide_info.class.course_name}}</div>
        <el-radio-group v-model="divide_info.class.id">
          <ul>
            <li v-for="(list, index) in divide_info.class.lists" :key="index" class="mt-20">
              <el-radio :label="list.id">
                <span>{{list.name}}</span>
                <span class="ml-20">{{list.join_num}}/{{list.limit_num}}</span>
              </el-radio>
            </li>
          </ul>
        </el-radio-group>
        <div class="d-f f-j-c mt-30">
          <MyButton @click.native="doneHandle('divideClass')">确认</MyButton>
        </div>
      </div>
    </el-dialog>

    <!-- 请假记录弹窗 -->
    <el-dialog title="请假记录" width="1160px" center :visible.sync="all_leave_record.show" :close-on-click-modal="false">
            <div class="fifter-toolbar">
                <ul class="d-f">
                    <li>
                      <span>请假时间：</span>
                      <el-date-picker size="small" class="date-select" @change="date_limit" v-model="all_leave_record.search_info.start" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                      <span>至</span>
                      <el-date-picker size="small" class="date-select" @change="date_limit" v-model="all_leave_record.search_info.end" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                    </li>
                    <li class="name"><el-input size="small" placeholder="请输入学员姓名" v-model.trim="all_leave_record.search_info.student_name"></el-input></li>
                    <li><MyButton @click.native="search_leave_record" :radius="false">搜索</MyButton></li>
                </ul>
            </div>
      <el-table class="student-table" :data="all_leave_record.data" v-loading="leave_record_loading" :show-header="true">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="姓名" prop="student.name" align="center"></el-table-column>
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
      <!-- 分页 -->
          <el-pagination v-if="all_leave_record.page_info.total > 7" class="d-f f-j-c mt-10" :page-size="7" background layout="total, prev, pager, next" :total="all_leave_record.page_info.total" :current-page="all_leave_record.page_info.current_page" @current-change="go_leave_record_page">
          </el-pagination>
    </el-dialog>

    <!-- 全部学员弹窗 -->
    <el-dialog :title="all_student_info.title" width="880px" center :visible.sync="all_student_info.show" :close-on-click-modal="false">
      <div v-if="all_student_info.data.length>0" class="fc-7">上课学员：{{all_student_info.data.length}}人</div>
      <el-table class="student-table" :data="all_student_info.data" v-loading="all_student_info.loading" :show-header="true">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="姓名" prop="student.name" align="center"></el-table-column>
        <el-table-column label="上课类型" prop="type_describe" align="center"></el-table-column>
        <el-table-column label="上课状态" prop="status2_describe" align="center">
          <template slot-scope="scope">
              <div :class="[scope.row.status2 === 1 ? 'signed' : (scope.row.status2 === 3 ? 'leaved' : 'no_sign'),'course_status']">{{scope.row.status2_describe}}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
              <span @click="sign_student(scope.row.student_id,scope.row.timetable_id,scope.row.status2)" :class="[scope.row.status2 === 5 && all_student_info.sign ? 'able_handle' : 'disable_handle','student_handle']">签到</span>
              <span @click="leave_student(scope.row.student_id,scope.row.timetable_id,scope.row.status2)" :class="[scope.row.status2 === 5 && all_student_info.leave ? 'able_handle' : 'disable_handle','student_handle','ml-10']">请假</span>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 查看通知 -->
    <el-dialog class='notice_detail' title="员工通知" width="50%" :fullscreen="true" :visible.sync="notice_info.show_dialog" :close-on-click-modal="true">
      <el-row class="t-a-c fs-20 fc-2 f-w">
        {{notice_info.title}}
      </el-row>
      <el-row class="t-a-c fs-13 fc-9">
        发送人：{{notice_info.sender}}　　 时间：{{notice_info.time | date('yyyy-MM-dd hh:mm')}}
      </el-row>
      <el-row v-html="notice_info.content"></el-row>
    </el-dialog>

  </div>

</template>

<script>
import TableHeader from "../../components/common/TableHeader";
import MyButton from "../../components/common/MyButton";
import { StudentStatic } from "../../script/static";
import echarts from "echarts";

export default {
  data() {
    return {
      activeName: "leave",
      follow_up_activeName: "visit",
      notice_activeName: "receive",
      paymentMethod: StudentStatic.paymentMethod, //付款方式
      contractData: {}, //合约数据
      courseLists: [],
      studentId: "",
      fillInfo: {},

        show_register_dialog: false, //学员登记弹窗
        show_source_dialog: false, //添加渠道弹窗
        show_buy_course_dialog: false, //购买课程弹窗
        show_course_contract_dialog: false, //购课合约弹窗


      register_info: {
        id: "",
        student_name: "",
        parent_name: "",
        relation: "",
        mobile: "",
        address: "",
        sex: "",
        birthday: "",
        like_course: "",
        like_grade: "",
        source_id: "", //渠道id
        advisor_id: "", //顾问id
        remark: "", //备注信息
        school_name: ""
      },
      sourceForm: { name: "" },
      courseForm: {
        student_id: '', //学员id
        parent_id: '',  //家长id
        advisor_id: '', //顾问id
        advisor_name: '',   //顾问
        course_id: '',  //课程id
        lesson_num: '',   //购买课时
        given_num: '',  //赠送课时
        lesson_num_already: '',  //已扣课时数
        expire: '',   //有效期
        leave_num: '',   //请假次数 
        pay_at: '',   //购课日期
        pay_way: '',   //付款方式
        unit_price: '',   //课时单价
        preferential_price: '',  //优惠价格
        explain: ''   //说明
      },
      studentLists: [],
      relationArr: StudentStatic.relation,
      likeGrade: StudentStatic.likeGrade,
      rules: {
        parent_name: [
          { required: true, message: "请输入家长姓名" },
          { max: 7, message: "长度不能超过7个字符" }
        ],
        relation: [
          { required: true, message: "请选择关系", trigger: "change" }
        ],
        address: [{ max: 50, message: "长度不能超过50个字符" }],
        school_name: [{ max: 20, message: "长度不能超过20个字符" }],
        mobile: [
          { required: true, message: "请输入家长电话" },
          { validator: this.$$tools.formValidate("phone") }
        ],
        student_name: [
          { required: true, message: "请输入学员姓名" },
          { max: 7, message: "长度不能超过7个字符" }
        ],
        sex: [{ required: true, message: "请选择性别", trigger: "change" }],
        source_id: [
          { required: true, message: "请选择渠道信息", trigger: "change" }
        ],
        remark: [{ max: 50, message: "长度不能超过50个字符" }]
      },
      sourceRules: {
        name: [
          { required: true, message: "请输入渠道", trigger: "none" },
          { max: 20, message: "长度不能超过20个字符" }
        ]
      },
      courseRules: {
        course_id: [
            {required: true, message: '请选择课程', trigger: 'change'}
        ],
        lesson_num: [
            {required: true, message: '请输入购买课时数'}
        ],
        given_num: [
            {required: true, message: '请输入赠送课时数'}
        ],
        expire: [
            {required: true, message: '请输入课程有效期'}
        ],
        pay_at: [
            {required: true, message: '请选择购课日期', trigger: 'change'}
        ],
        pay_way: [
            {required: true, message: '请选择付款方式', trigger: 'change'}
        ],
        preferential_price: [
            {required: true, message: '请输入优惠金额'}
        ],
        unit_price: [
            {required: true, message: '请输入课时单价'}
        ],
        explain: [
            {max: 200,  message: '长度不能超过200个字符'}
        ]
      },
      //今日待办
      leave_info: {
        id: null,
        show_refuse_dialog: false,
        remark: "",
        data: []
      },
      divide_info: {
        id: null,
        show_divide_dialog: false,
        class: {
          id: null, //班级id
          sc_id: null, //购课id
          student_id: null, //学生id
          course_name: null, //课程名字
          lists: [] //班级列表
        },
        data: []
      },
      renewal_info: {
        id: null,
        data: []
      },
      birth_info: {
        data: []
      },
      page_info: {
        total: 0,
        current_page: 1
      },
      all_leave_record: {
        data: [],
        show: false,
        search_info: {
          start: new Date(this.$format_date(new Date(),'yyyy/MM/01')), //默认当月第一天
          end: new Date(new Date().getFullYear(),new Date().getMonth()+1,0,24),
          student_name: '',
          page: 1,
          pageNum: 7
        },
        page_info: {
          total: 0,
          current_page: 1
        },
      },
      //今日课程
      today_course_list: [],
      all_student_info:{
        title: '',
        data: [],
        show: false,
        sign: false,
        leave: false,
        grade_id: null,
        loading: false
      },
      //今日跟进
      visit_list: [],
      audition_list: [],
      follow_up_list: [],
      assign_list: [],
      //今日跟进部分分页信息
      follow_up_page_info: {
        total: 0,
        current_page: 1
      },
      //员工通知列表
      notice_lists: [],
      notice_send_lists: [],
      //通知信息
      notice_info: {
        show_dialog: false,
        title: null,
        content: null,
        sender: null,
        time: null
      },
      unread_num: null,
      //通知分页信息
      notice_page_info: {
        total: 0,
        current_page: 1
      },
      //课消统计
      search_time: [],
      search_type: "course",
      loading: false,
      follow_loading: false,
      notice_loading: false,
      leave_record_loading: false,
      row_span_num: new Map(),
      pickerBeginDateAfter: {
            disabledDate: (time) => {
                return time.getTime() > new Date().getTime();
            }
        }
    };
  },
  methods: {
    //切换tab标签
    change_tab() {
      this.page_info.current_page = 1;
      this.get_data();
    },
    chage_follow_tab() {
      this.follow_up_page_info.current_page = 1;
      this.get_follow_up_data();
    },
    change_notice_tab() {
      this.notice_page_info.current_page = 1;
      switch (this.notice_activeName) {
        case "receive":
          this.get_notice_list();
          break;
        case "send":
          this.get_notice_send_list();
          break;
      }
    },

    //请假记录弹窗选择时间限制
    date_limit () {
      if(this.all_leave_record.search_info.end < this.all_leave_record.search_info.start) return this.$message.warning('结束时间不能小于开始时间，请从新选择');
      this.search_leave_record();
    },
    //按需获取今日待办所有数据
    async get_data() {
      switch (this.activeName) {
        case "leave":
          this.get_leave_data();
          break;
        case "divide":
          this.get_divide_data();
          break;
        case "renewal":
          this.get_renewal_data();
          break;
        case "birth":
          this.get_birth_data();
          break;
      }
    },
    //查看全部请假记录
    view_all_leave_record() {
      this.leave_record_loading = true;
      let info = this.all_leave_record.search_info;
      const params = {
        start: info.start/1000,
        end: info.end/1000,
        student_name: info.student_name,
        page: info.page,
        page_num: info.pageNum,
      }
      this.$$request.post('api/leaveTicket/processedLists',params).then(
        res => {
          this.all_leave_record.data = res.lists.data;
          this.all_leave_record.page_info.total = res.lists.total;
          this.leave_record_loading = false;
        }
      )
      this.all_leave_record.show = true; 
    },
    //请假记录弹窗翻页
    go_leave_record_page(page) {
      this.all_leave_record.page_info.current_page = page;
      this.all_leave_record.search_info.page = page;
      this.view_all_leave_record();
    },
    //按条件搜索请假记录
    search_leave_record() {
      this.all_leave_record.page_info.current_page = 1;
      this.all_leave_record.search_info.page = 1;
      this.view_all_leave_record();
    },
    //按需获取今日跟进所有数据
    async get_follow_up_data() {
      this.follow_loading = true;
      let type;
      switch (this.follow_up_activeName) {
        case "visit":
          type = "invited";
          break;
        case "audition":
          type = "audition";
          break;
        case "follow_up":
          type = "followup";
          break;
        case "assign":
          type = "no_advisor";
          break;
      }
      let params;
      if (type === "no_advisor") {
        params = {
          page_num: 5,
          data: {
            type: type,
            name: "",
            mobile: "",
            advisor_id: "",
            source_id: "",
            follow_status: ""
          },
          page: this.follow_up_page_info.current_page
        };
        this.$$request.post("api/student/lists", params).then(res => {
          this[`${this.follow_up_activeName}_list`] = res.lists.data;
          this.follow_up_page_info.total = res.lists.total;
          this.follow_loading = false;
        });
      } else {
        params = {
          page_num: 5,
          type: type,
          page: this.follow_up_page_info.current_page
        };
        this.$$request.post("api/followUp/todayLists", params).then(res => {
          this[`${this.follow_up_activeName}_list`] = res.lists;
          this.follow_up_page_info.total = res.total;
          this.follow_loading = false;
        });
      }
    },
    //学员登记
    register() {
      this.show_register_dialog = true;
      this.getStudentFill();
    },
    //合约确定按钮，跳转签约学员详情
    goSignedLists() {
      this.show_course_contract_dialog = false;
      this.$router.replace({
        path: "/student/signeddetail",
        query: { id: this.studentId }
      });
    },
    //打印合同
    printCompact() {
      this.$router.push({name: 'contractView', params: {contractData: this.contractData, replace_path: '/student/signeddetail', path_query: {id: this.studentId}}});
    },
    //提交表单
    confirm(type) {
      this.$refs[type].validate(valid => {
        if (valid)
          type === "addStudent"
            ? this.submitStudentInfo()
            : type === "sourseForm"
              ? this.submitSourceInfo()
              : this.submitBuyCourse();
      });
    },
    //提交学员信息
    async submitStudentInfo() {
    //   let params = this.register_info;
    //   this.register_info.birthday = this.register_info.birthday / 1000;
      let params = {};

      for(let key in this.register_info) {
            if(key == 'birthday') {
                params[key] = this.register_info[key] / 1000;
            }else if(key != 'id') params[key] = this.register_info[key];
        };

      let result = await this.$$request.post("api/student/add", params);
      if (!result) return 0;
      if (result.status) {
        this.$confirm("已存在该账号，是否将学员添加至该账号下？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "修改手机号",
          type: "warning"
        })
          .then(() => {
            this.studentRepeat(params);
          })
          .catch(() => {
            this.$refs.mobileObj.focus();
          });
      } else {
        this.studentSuccessMessage(result.data);
      }
    },
    //登记学员重复手机号码，处理方法
    async studentRepeat(params) {
      let result = await this.$$request.post("api/student/add", {
        ...params,
        parent_this: "yes"
      });
      if (!result) return 0;
      this.studentSuccessMessage(result.data);
    },
    //登记学员成功，二次提醒是否购课
    studentSuccessMessage(data) {
      this.show_register_dialog = false;
      this.$confirm("已成功登记学员，是否选择购课?", "提示", {
        confirmButtonText: "购买课程",
        cancelButtonText: "暂不办理",
        type: "success"
      })
        .then(() => {
          this.buyCourse(data);
          this.getCourseLits();
        })
        .catch(() => {
          return 0;
        });
      this.studentId = data.id;
    },
    //提交渠道信息
    async submitSourceInfo() {
      let result = await this.$$request.post("api/source/add", this.sourceForm);
      if (!result) return 0;
      this.show_source_dialog = false;
      this.fillInfo.source.push({ id: result.data.id, name: result.data.name });
    },
    //提交购买课程
    async submitBuyCourse() {
        if(this.courseForm.lesson_num_already > this.courseForm.lesson_num) return this.$message.warning('已扣课时数不能超过购买课时数!');
        if(this.courseForm.leave_num > this.courseForm.lesson_num) return this.$message.warning('请假次数不能超过购买课时数!');
        if(this.courseForm.preferential_price > this.courseForm.unit_price * this.courseForm.lesson_num) return this.$message.warning('优惠不能超过总金额!');

      let params = {};

      for(let key in this.courseForm) {
        if(typeof this.courseForm[key] === 'undefined') params[key] = '';
        else if(key == 'pay_at') params[key] = this.courseForm[key] / 1000;
        else if(key != 'advisor_name') params[key] = this.courseForm[key];
    };
      let result = await this.$$request.post("api/studentCourse/add", params);
      if (!result) return 0;
      this.$set(this, "contractData", result.data);
      this.show_buy_course_dialog = false;
      this.show_course_contract_dialog = true;
    },
    //获取附件信息
    async getStudentFill() {
      let result = await this.$$request.post("api/student/fill");
      if (!result) return 0;
      this.$set(this, "fillInfo", result);
    },
    //添加渠道信息
    addSource() {
      this.sourceForm.name = "";
      this.show_source_dialog = true;
    },
    //购课
    async buyCourse(data) {
      this.courseForm.student_name = data.name;
      this.courseForm.student_id = data.id;
      this.courseForm.advisor_id = data.advisor_id;
      this.courseForm.advisor_name = data.advisor ? data.advisor.name : "";
      this.courseForm.parent_id = data.parent_id;
      this.courseForm.expire = 12;
      this.courseForm.pay_at = new Date().getTime();
      this.show_buy_course_dialog = true;
    },
    //获取课程列表
    async getCourseLits() {
      let result = await this.$$request.post("api/course/normalLists");
      console.log(result);
      if (!result) return 0;
      this.courseLists = result.lists;
    },
    //购买课程，选择课程change
    addCourseChange(val) {
      this.courseLists.forEach(v => {
        if (v.id == val) {
            this.courseForm.expire = v.expire;
            this.courseForm.leave_num = v.leave_num;
            this.courseForm.unit_price = v.unit_price;
        }
      });
    },
    dialogClose(form) {
        console.log(form)
        this.$refs[form].resetFields();
        if(form === 'addStudent') Object.keys(this.register_info).forEach(v =>{this.register_info[v] = ''});
        else if(form === 'courseForm') Object.keys(this.courseForm).forEach(v =>{this.courseForm[v] = ''});
    },
    //获取待处理请假列表
    get_leave_data() {
      this.loading = true;
      const params = {
        page_num: 5,
        page: this.page_info.current_page
      };
      this.$$request
        .get("api/student/undisposedLeaveTicketLists", params)
        .then(res => {
          this.leave_info.data = res.lists;
          this.page_info.total = res.total;
          this.loading = false;
        });
    },
    //处理请假
    leave_handle(id, status) {
      let params = {
        page_num: 5,
        leaveTicket_id: id,
        status: status
      };
      if (status === 3) {
        if (this.leave_info.remark.length < 1) {
          this.$message.error("拒绝理由不能为空");
          return false;
        } else {
          params.remark = this.leave_info.remark;
        }
      }
      this.$$request.post("api/student/leaveTicketCheck", params).then(res => {
        this.get_leave_data();
        this.$message.success("已处理");
      });
    },
    //打开拒绝请假弹窗
    open_refuse_dialog(id) {
      this.leave_info.remark = "";
      this.leave_info.show_refuse_dialog = true;
      this.leave_info.id = parseInt(id);
    },
    //获取待分班列表
    get_divide_data() {
      this.row_span_num = new Map();
      this.loading = true;
      const params = {
        page_num: 5,
        page: this.page_info.current_page
      };
      this.$$request.post("api/sign/noGrade", params).then(res => {
        let data = res.lists.data;
        let data_map = new Map();
        for (let i = 0; i < data.length; i++) {
          //如果map里没有该学生数据  则存储
          if (!data_map.get(data[i].student_id)) {
            data_map.set(data[i].student_id, [data[i]])
          } else {
            data_map.get(data[i].student_id).push(data[i])
          }
        }
        let data_sort = [];
        for(let value of data_map){
          data_sort.push(...value[1])
        }
        this.divide_info.data = data_sort;
        this.merge_data(data_sort);
        this.page_info.total = res.lists.total;
        this.loading = false;
      });
    },
    //分班
    divide_class(info) {
      const params = {
        id: info.course_id
      };
      this.$$request.post("api/sign/gradeLists", params).then(res => {
        if (res.lists.length < 1) {
          this.$message.warning("暂无可选班级");
        }
        this.divide_info.class.id = res.lists[0].id;
        this.divide_info.class.course_name = info.course_name;
        this.divide_info.class.sc_id = info.id;
        this.divide_info.class.student_id = info.student_id;
        this.divide_info.class.lists = res.lists;
        this.divide_info.show_divide_dialog = true;
      });
    },
    //获取需续约学员列表
    get_renewal_data() {
      this.row_span_num = new Map();
      this.loading = true;
      const params = {
        page_num: 5,
        page: this.page_info.current_page
      };
      this.$$request.post("api/sign/contract", params).then(res => {
        let data = res.lists.data;
        let data_map = new Map();
        for (let i = 0; i < data.length; i++) {
          //如果map里没有该学生数据  则存储
          if (!data_map.get(data[i].student_id)) {
            data_map.set(data[i].student_id, [data[i]])
          } else {
            data_map.get(data[i].student_id).push(data[i])
          }
        }
        let data_sort = [];
        for(let value of data_map){
          data_sort.push(...value[1])
        }
        this.renewal_info.data = data_sort;
        this.merge_data(data_sort);
        this.page_info.total = res.lists.total;
        this.loading = false;
      });
    },
    //获取生日学员列表
    get_birth_data() {
      this.loading = true;
      const params = {
        page_num: 5,
        page: this.page_info.current_page
      };
      this.$$request.get("api/student/birthday", params).then(res => {
        this.birth_info.data = res.lists;
        this.page_info.total = res.total;
        this.loading = false;
      });
    },
    merge_data(data) {
      for (let i = 0; i < data.length; i++) {
                if (!this.row_span_num.get(data[i].student_id)) {
                  this.row_span_num.set(data[i].student_id, [i]);
                } else {
                  this.row_span_num.get(data[i].student_id).push(i);
                }
              }
    },
    //页数跳转
    go_page(page) {
      this.page_info.current_page = page;
      this.get_data();
    },
    go_follow_page(page) {
      this.follow_up_page_info.current_page = page;
      this.get_follow_up_data();
    },
    go_notice_page(page) {
      this.notice_page_info.current_page = page;
      switch (this.notice_activeName) {
        case "receive":
          this.get_notice_list();
          break;
        case "send":
          this.get_notice_send_list();
          break;
      }
    },
    //合并表格的行
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
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
    //确定操作
    doneHandle(type) {
      const params = {
        student_id: this.divide_info.class.student_id,
        grade_id: this.divide_info.class.id,
        sc_id: this.divide_info.class.sc_id
      };
      this.$$request.post("api/studentGrade/add", params).then(res => {
        this.$message.success("分班成功");
        this.divide_info.show_divide_dialog = false;
        this.get_data();
      });
    },
    //================今日课程模块================
    //获取今日课程列表
    async get_today_course() {
      this.$$request.get("api/timetable/todayLists").then(res => {
        this.today_course_list = res.lists;
      });
    },
    //查看全部学员
    view_all_student(timetable_id,start,end,grade_id,grade_name) {
      this.all_student_info.loading = true; 
      this.all_student_info.data = [];
      this.all_student_info.show = true; 
      this.all_student_info.grade_id = grade_id;
      this.all_student_info.title = grade_name; 
      this.get_all_student_list(timetable_id)
      //当且仅当在上课前一小时和上课后一小时内才能签到
      if(new Date().getTime()/1000 > start - 60*60
       && new Date().getTime()/1000 < end + 60*60){
        this.all_student_info.sign = true;
      }else{
        this.all_student_info.sign = false;
      }
      //当且仅当在上课前两个小时之前才能请假
      if(new Date().getTime()/1000 < start - 2*60*60){
        this.all_student_info.leave = true;
      }else{
        this.all_student_info.leave = false;
      }
    },
    get_all_student_list(id) {
      const params = {
              timetable_id: id
            }
      this.$$request.get('api/timetable/studentLists',params).then(res => {
        this.all_student_info.data = res.lists;
        this.all_student_info.loading = false; 
      })
    },
    //学员签到
    sign_student(s_id,t_id,status) {
      if(status === 5 && this.all_student_info.sign){
      const params = {
              timetable_id: t_id,
              student_id: s_id
            }
      this.$$request.post('api/signRecord/add',params).then(res => {
        this.$message.success("已签到");
        this.get_all_student_list(t_id);
      })
      }
      
    },
    //学员请假
    leave_student(s_id,t_id,status) {
      if(status === 5 && this.all_student_info.leave){
        const params = {
          grade_id: this.all_student_info.grade_id,
          timetable_id: t_id,
          student_id: s_id
        }
        this.$$request.post('api/leaveTicket/add',params).then(res => {
          this.$message.success("已请假");
          this.get_all_student_list(t_id);
        })
      }
    },
    //================今日跟进管理模块================
    //到访确认
    handle_visit(id) {
      const params = {
        follow_up_id: id
      };
      this.$$request.post("api/followUp/inviteSure", params).then(res => {
        this.get_follow_up_data();
        this.$message.success("操作成功");
      });
    },
    //试听确认
    handle_audition(id) {
      const params = {
        follow_up_id: id
      };
      this.$$request.post("api/followUp/auditionSure", params).then(res => {
        this.get_follow_up_data();
        this.$message.success("操作成功");
      });
    },

    //================通知模块================

    //发通知
    edit_notice() {
      this.$router.push({ path: "/home/workbench/editNotice" });
    },
    //获取员工通知列表
    async get_notice_list() {
      this.notice_loading = true;
      const params = {
        page: this.notice_page_info.current_page
      };
      this.$$request.get("api/notification/personalLists", params).then(res => {
        this.notice_lists = res.lists;
        this.notice_page_info.total = res.total;
        this.unread_num = res.unread < 1 ? "" : res.unread;
        this.notice_loading = false;
      });
    },
    //获取员工发送通知列表
    get_notice_send_list() {
      this.notice_loading = true;
      const params = {
        page: this.notice_page_info.current_page
      };
      this.$$request.get("api/notification/lists", params).then(res => {
        this.notice_send_lists = res.lists;
        this.notice_page_info.total = res.total;
        this.notice_loading = false;
      });
    },

    //查看通知
    notice_detail(notice) {
      switch (this.notice_activeName) {
        case "receive":
          const params = {
            notification_id: notice.notification.id
          };
          this.$$request.post("api/notification/read", params).then(res => {
            this.get_notice_list();
          });
          this.notice_info.title = notice.notification.title;
          this.notice_info.content = notice.notification.content;
          this.notice_info.sender = notice.notification.sender.name;
          break;
        case "send":
          this.notice_info.title = notice.title;
          this.notice_info.content = notice.content;
          this.notice_info.sender = notice.sender.name;
          break;
      }
      this.notice_info.show_dialog = true;
      this.notice_info.time = notice.created_at;
    },

    //================课消模块================

    //加载饼图
    init_pie_charts(pie_data) {
      let pie_charts = echarts.init(document.getElementById("pie"));
      let option = {
        color: ["#45DAD5", "#FFCC50"],
        tooltip: {
          trigger: "item",
          formatter: data => {
            return (
              "总课时：" +
              pie_data[0].total +
              "<br/>" +
              data.name +
              ":" +
              data.value
            );
          }
        },
        legend: {
          orient: "horizontal",
          x: "center",
          bottom: "0px",
          data: ["已消课时", "未消课时"]
        },
        series: [
          {
            name: "总课时",
            type: "pie",
            radius: ["50%", "70%"],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: "center"
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: "16",
                  fontWeight: "500"
                }
              }
            },
            labelLine: {
              normal: {
                show: false
              }
            },
            data: pie_data
          }
        ]
      };
      pie_charts.setOption(option);
    },
    //加载柱状图
    init_bar_charts(bar_data) {
      let bar_charts = echarts.init(document.getElementById("bar"));
      let option = {
        color: ["#45DAD5", "#FFCC50", "transparent"],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          },
          formatter: data => {
            return (
              data[0].name +
              "<br/>" +
              "总课时：" +
              (data[0].value + data[1].value) +
              "<br/>" +
              data[0].seriesName +
              ":" +
              data[0].value +
              "<br/>" +
              data[1].seriesName +
              ":" +
              data[1].value
            );
          }
        },
        calculable: true,
        xAxis: [
          {
            type: "category",
            axisTick: { show: false },
            data: bar_data.x_data
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ],
        series: [
          {
            name: "已消课时",
            type: "bar",
            barWidth: "20px",
            data: bar_data.s_data_1
          },
          {
            name: "未消课时",
            type: "bar",
            barWidth: "20px",
            data: bar_data.s_data_2
          }
        ]
      };
      bar_charts.setOption(option);
    },
    //选择时间
    choose_time(val) {
      this.search_time = val;
      this.get_course_info();
    },
    //选择类型
    choose_type(type) {
      this.search_type = type;
      this.get_course_info();
    },
    //获取课消数据
    async get_course_info() {
      let params = {
        begin: this.search_time[0],
        end: this.search_time[1],
        groupby: this.search_type
      };
      this.$$request
        .post("api/classElimination/statistics", params)
        .then(res => {
          let pie_data = [
            { value: res.actual, name: "已消课时", total: res.should },
            {
              value: res.should - res.actual,
              name: "未消课时",
              total: res.should
            }
          ];
          let bar_data = {
            x_data: [],
            s_data_1: [],
            s_data_2: []
          };
          for (let info of res.detail) {
            bar_data.x_data.push(info.name);
            bar_data.s_data_1.push(info.actual);
            bar_data.s_data_2.push(info.should - info.actual);
            // bar_data.s_data_3.push(info.should);
          }
          this.init_pie_charts(pie_data);
          this.init_bar_charts(bar_data);
        });
    }
  },
  created() {
    this.get_data();
    this.get_follow_up_data();
    this.get_today_course();
    this.get_notice_list();
    let now = new Date().setDate(1);
    let next = now + 31 * 24 * 60 * 60 * 1000;
    let now_month = this.$format_date(new Date(), "yyyy-MM-01");
    let next_month = this.$format_date(new Date(next), "yyyy-MM-01");
    this.search_time = [now_month, next_month];
  },
  mounted() {
    this.get_course_info();
  },
  components: { TableHeader, MyButton }
};
</script>

<style lang="less" scoped>
    .date-select {
        width: 150px;
    }
    .header-tab-box {
        padding: 0 200px;
    }
    .fifter-toolbar {
        ul li {
            margin-right: 20px;
            &.name {
                width: auto;
            }
        }
    }
.content {
  .el-row {
    // min-height: 250px;
    .el-col {
      height: 100%;
      .el-card {
        height: 100%;
      }
    }
  }
  .c_icon {
    position: relative;
    &::after {
      content: "";
      display: inline-block;
      width: 14px;
      height: 30px;
      position: absolute;
      left: 0px;
      top: 50%;
      transform: translateY(-50%);
      background-repeat: no-repeat;
      background-position: center;
      background-size: 100% auto;
    }
    .name {
      margin-left: 16px;
    }
  }
  .icon_girl {
    &::after {
      background-image: url("../../images/common/girl_icon.png");
    }
  }
  .icon_people {
    &::after {
      background-image: url("../../images/common/people_icon.png");
    }
  }
  .icon_teacher {
    &::after {
      background-image: url("../../images/common/teacher-icon.png");
    }
  }
  .icon_boy {
    &::after {
      background-image: url("../../images/common/boy_icon.png");
    }
  }
  .icon_time {
    &::after {
      background-image: url("../../images/common/time-icon.png");
    }
  }
  .card-box {
    margin-top: 20px;
  }
  .text_num {
    display: inline-block;
    float: left;
    height: 32px;
    line-height: 32px;
  }
  #pie,
  #bar {
    min-height: 300px;
  }
  .course_finished {
    .el-row {
      padding: 10px 20px;
    }
    .el-col {
      min-height: 40px;
    }
  }
  .type {
    background-color: #ffffff;
    color: #45dad5;
    border: 1px solid #45dad5;
  }
  .check_type {
    background-color: #45dad5;
    color: #ffffff;
    border: 1px solid #45dad5;
  }
}
.form-box {
  padding: 0 20px;
  .el-select,
  .el-date-editor {
    width: 100%;
  }
  h3 {
    font-weight: normal;
    font-size: 14px;
    padding-left: 38px;
    margin-bottom: 15px;
  }
  .add-source {
    img {
      position: relative;
      top: 3px;
    }
  }
}
.course_content {
  height: 366px;
  overflow: auto;
}
.no_content {
  height: 366px;
  color: #999999;
}
.course_list {
  background-color: #f1f1f1;
  .el-row {
    padding: 10px 20px;
  }
  .border_item {
    position: relative;
    border-top: 1px solid #d9d9d9;
  }
}
.notice_list {
  .el-row {
    padding: 8px 0;
  }
}
.notice_detail {
  .el-row {
    padding: 10px 20px 0;
  }
  .f-w {
    font-weight: 900;
  }
}
.contract-box {
  padding: 0 30px;
  p {
    &:not(:first-child) {
      margin-top: 10px;
    }
    span {
      margin-right: 30px;
    }
  }
  .course-table {
    border-collapse: collapse;
    margin-top: 10px;
    td {
      border: 1px #bfbfbf solid;
      width: 120px;
      text-align: center;
      line-height: 40px;
    }
  }
}
.unread {
  color: #45dad5 !important;
}
.course_status{
  width: 60px;
  height: 24px;
  line-height: 24px;
  border-radius: 4px;
  margin: auto;
}
.no_sign{
  background-color: #F1F1F1;
  color: #777777;
}
.leaved{
  background-color: #FFE9E1;
  color: #C97422;
}
.signed{
  background-color: #DCF2E2;
  color: #13782F;
}
.student_handle{
    display: inline-block;
    width: 50px;
    height: 30px;
    line-height: 30px;
    border-radius: 4px;
    cursor: pointer;
}
.able_handle{
  border:1px solid #45dad5;
  color: #45dad5;
}
.disable_handle{
  border:1px solid #CCCCCC;
  color: #CCCCCC;
}
.more_record{
  position: absolute;
  right: 20px;
  bottom: 15px;
}
.el-button--primary {
  background-color: #45dad5;
  border-color: #45dad5;
}
.workbench_container /deep/ .is-fullscreen {
  height: 80% !important;
}
// .workbench_container /deep/ .el-dialog__body {
//   padding: 10px 20px 10px;
// }
.workbench_container /deep/ .el-dialog__footer {
  padding: 0 20px 10px;
}
.workbench_container /deep/ .el-button {
  padding: 0 18px;
  height: 32px;
}
.workbench_container /deep/ .el-tabs__content {
  overflow: auto;
  height: 300px;
  .el-tab-pane {
    height: 100%;
    .el-row {
      height: 100%;
    }
  }
}
.table_head{
  border-right: 1px solid #ebeef5 !important;
}
// .workbench_container /deep/ .el-dialog__title {
//   font-size: 14px;
//   color: #555555;
// }
.workbench_container /deep/ .el-badge__content {
  top: 10px;
  right: 0px;
}
.workbench_container /deep/ .el-card__body {
  position: relative;
  min-height: 417px;
  padding: 0 20px 12px;
}
.workbench_container /deep/ .el-tabs__header {
  margin: 0;
}
.workbench_container /deep/ .el-table__body-wrapper{
  max-height: 600px;
  overflow-y: auto;
}
.el-pagination {
  padding: 0;
}
</style>


