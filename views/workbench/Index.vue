<template>
  <div class="content flex1 workbench_container">
    <PageState :state="state" />
    <el-row :gutter="20" class="top_content">
      <el-card shadow="hover" >
        <el-col :span="11" v-if="statitics_info.sign !== ''">
          <el-row>
            <el-col :span="6"></el-col>
            <el-col :span="6" :offset="6">今日</el-col>
            <el-col :span="6">本月</el-col>
            <el-col :span="6">上月</el-col>
          </el-row>
          <el-row>
            <el-col :span="6"> <i class="iconfont icon-renshu fs-14"></i> 签约单数(笔)</el-col>
            <el-col :span="6" class="times">{{statitics_info.sign.today.count}}</el-col>
            <el-col :span="6" class="times">{{statitics_info.sign.present_month.count}}</el-col>
            <el-col :span="6" class="times">{{statitics_info.sign.last_month.count}}</el-col>
          </el-row>
          <el-row>
            <el-col :span="6"> <i class="iconfont icon-jine"></i> 签约金额(元)</el-col>
            <el-col :span="6">{{statitics_info.sign.today.sum}}元</el-col>
            <el-col :span="6">{{statitics_info.sign.present_month.sum}}元</el-col>
            <el-col :span="6">{{statitics_info.sign.last_month.sum}}元</el-col>
          </el-row>
        </el-col>
        <el-col :span="2" v-if="statitics_info.sign !== '' && statitics_info.eliminate !== '' ">
          <div class="line"></div>
        </el-col>
        <el-col :span="11" v-if="statitics_info.eliminate !== '' ">
          <el-row>
            <el-col :span="6"></el-col>
            <el-col :span="6" :offset="6">今日</el-col>
            <el-col :span="6">本月</el-col>
            <el-col :span="6">上月</el-col>
          </el-row>
          <el-row v-cloak>
            <el-col :span="6"> <i class="iconfont icon-kexiaobaobiao fs-18"></i> 消课节数(次)</el-col>
            <el-col :span="6" class="times">{{statitics_info.eliminate.today.count}}</el-col>
            <el-col :span="6" class="times">{{statitics_info.eliminate.present_month.count}}</el-col>
            <el-col :span="6" class="times">{{statitics_info.eliminate.last_month.count}}</el-col>
          </el-row>
          <el-row v-cloak>
            <el-col :span="6"> <i class="iconfont icon-jine"></i> 消课金额(元)</el-col>
            <el-col :span="6">{{statitics_info.eliminate.today.sum}}元</el-col>
            <el-col :span="6">{{statitics_info.eliminate.present_month.sum}}元</el-col>
            <el-col :span="6">{{statitics_info.eliminate.last_month.sum}}元</el-col>
          </el-row>
        </el-col>
      </el-card>
    </el-row>

    <el-row class="head_content card-box" :gutter="20">
      <el-col :span="17">
        <el-card shadow="hover">
          <TableHeader title="今日待办">
            <MyButton @click.native="register">登记学员</MyButton>
            <div class="t_button" @click="memo_info.show = true;memo_info.content = '';memo_info.readonly = false;">备忘录</div>
          </TableHeader>
          <el-tabs v-model="activeName" @tab-click="change_tab">

            <!-- 待处理请假 -->
            <el-tab-pane label="待处理请假" name="leave" v-if="user_info.class_pattern !== 2">
              <el-table class="student-table" :data="leave_info.data" v-loading="loading" :show-header="true">
                <el-table-column label="学员姓名" align="left">
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
                    <a class="student_handle able_handle" @click="leave_handle(scope.row.id,2)">同意</a>
                    <a class="student_handle able_sub_handle" @click="open_refuse_dialog(scope.row.id)">拒绝</a>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 待分班学员 -->
            <el-tab-pane label="待分班学员" name="divide" v-if="user_info.class_pattern !== 2">
              <el-table class="student-table" :data="divide_info.data" v-loading="loading" :span-method="objectSpanMethod" :show-header="true">
                <el-table-column class-name="table_head" label="学员姓名" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}">
                      <span class='c_icon' :class="[scope.row.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.student_name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="待分班课程" prop="course_name" align="center"></el-table-column>
                <el-table-column label="剩余课时" prop="lesson_num_remain" align="center"></el-table-column>
                <el-table-column label="签约日期" align="center">
                  <template slot-scope="scope">
                    <span>{{scope.row.pay_at | date('yyyy-MM-dd')}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" prop="operate" align="center">
                  <template slot-scope="scope">
                    <a class="student_handle able_handle" @click="divide_class(scope.row)">分班</a>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 需续约学员 -->
            <el-tab-pane label="需续约学员" name="renewal">
              <el-table class="student-table" :data="renewal_info.data" :span-method="objectSpanMethod" v-loading="loading" :show-header="true">
                <el-table-column label="学员姓名" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}">
                      <span class='c_icon' :class="[scope.row.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.student_name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="需续约课程" prop="course_name" align="center"></el-table-column>
                <el-table-column label="课程剩余课时" prop="lesson_num_remain" align="center"></el-table-column>
                <el-table-column label="预计到期时间" align="center">
                  <template slot-scope="scope">
                    <span v-if='scope.row.may_expire_at === 0'>暂无</span>
                    <span v-else>{{scope.row.may_expire_at | date('yyyy-MM-dd')}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" prop="operate" align="center">
                  <template slot-scope="scope">
                    <a class="student_handle able_handle" @click="renew(scope.row)">续约</a>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 生日学员 -->
            <el-tab-pane label="生日学员" name="birth">
              <el-table class="student-table" :data="birth_info.data" v-loading="loading" :show-header="true">
                <el-table-column label="学员姓名" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.id}}">
                      <span class='c_icon' :class="[scope.row.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="出生日期" align="center">
                  <template slot-scope="scope">
                    {{scope.row.birthday | date('yyyy-MM-dd')}}
                  </template>
                </el-table-column>
                <el-table-column label="礼品状态"  align="center">
                  <template slot-scope="scope">
                    {{scope.row.gift_send_status === 0 ? '未发放' : '已发放'}}
                  </template>
                </el-table-column>
                <el-table-column label="操作" prop="operate" align="center">
                  <template slot-scope="scope">
                    <a v-if="scope.row.gift_send_status === 0" class="student_handle able_handle" @click='give_gift(scope.row.id,scope.row.name)'>发放礼品</a>
                    <span v-else class='student_handle disable_handle'>发放礼品</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 备忘录 -->
            <el-tab-pane label="备忘录" name="memo" class="t-o-e">
              <el-table class="student-table" @row-click="view_memo" :data="memo_info.data" v-loading="loading" :show-header="false">
                <el-table-column type="index" align="center" width="80px"></el-table-column>
                <el-table-column prop="trim_content" align="left">
                  <template slot-scope="scope">
                    <div class="t-o-e">{{scope.row.trim_content}}</div>
                  </template>
                </el-table-column>
                <el-table-column prop="created_at" align="center" width="200px">
                  <template slot-scope="scope">
                    {{scope.row.created_at | date('yyyy-MM-dd hh:mm')}}
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

          </el-tabs>
          <div v-if="activeName === 'leave'" @click="open_all_leave_dialog" class="more_record t-a-c fc-7 mt-20 cursor-pointer">历史请假记录>></div>
          <!-- 分页 -->
          <el-pagination v-if="activeName !== 'memo' && page_info.total > 5" class="d-f f-j-c mt-10" :page-size="5" background layout="total, prev, pager, next" :total="page_info.total" :current-page="page_info.current_page" @current-change="go_page">
          </el-pagination>
          <el-pagination v-if="activeName === 'memo' && page_info.total > 6" class="d-f f-j-c mt-10" :page-size="6" background layout="total, prev, pager, next" :total="page_info.total" :current-page="page_info.current_page" @current-change="go_page">
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
                  <span v-if="item.grade" class='fc-3' :class="{'fc-m' : new Date().getTime() <= item.end_time*1000}">{{item.grade.name}}</span>
                  <span v-else class='fc-3' :class="{'fc-m' : new Date().getTime() <= item.end_time*1000}">{{item.course.name}}</span>
                </el-col>
                <el-col :span="13" class="t-a-r">
                  <span @click="view_all_student(item)" class='fs-12 cursor-pointer'>全部学员（{{item.students}}人） >></span>
                </el-col>
              </el-row>
              <el-row class="border_item">
                <el-col class="fs-13 t-a-l" :span="8">
                  <i class='c_icon icon_teacher'></i>
                  <span v-for="teacher in item.teacher" :key="teacher.id" class='ml-16'>{{teacher.name}}</span>
                </el-col>
                <el-col class="fs-13 t-a-c" :span="7" :offset="1">
                  <i class='c_icon icon_people'></i>
                  <span class='ml-16'>{{item.class_room.name}}</span>
                </el-col>
                <el-col class="fs-13 t-a-r" :span="7" :offset="1">
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

    <el-row class="card-box" :gutter="20">
      <el-col :span="17">
        <el-card shadow="hover">
          <TableHeader title="今日跟进管理"></TableHeader>
          <el-tabs v-model="follow_up_activeName" @tab-click="chage_follow_tab">

            <!-- 预约到访 -->
            <el-tab-pane label="邀约到访" name="visit">
              <el-table class="student-table" :data="visit_list" v-loading="follow_loading" :show-header="true">
                <el-table-column label="学员姓名" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/nosigndetail', query: {student_id: scope.row.student.id}}">
                      <span class='c_icon' :class="[scope.row.student.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.student.name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="邀约时间" prop="invited_at" align="center">
                  <template slot-scope="scope">
                    {{scope.row.invited_at | date('MM-dd hh:mm')}}
                  </template>
                </el-table-column>
                <el-table-column label="课程顾问" prop="advisor.name" align="center"></el-table-column>
                <el-table-column label="操作" prop="operate" align="center">
                  <template slot-scope="scope">
                    <a v-if="scope.row.status === 2" class="student_handle able_handle" @click="handle_visit(scope.row.id)">到访</a>
                    <span v-else class="fc-9">已到访</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 邀约试听 -->
            <el-tab-pane label="邀约试听" name="audition" v-if="user_info.class_pattern !== 2">
              <el-table class="student-table" :data="audition_list" v-loading="follow_loading" :show-header="true">
                <el-table-column label="学员姓名" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/nosigndetail', query: {student_id: scope.row.student.id}}">
                      <span class='c_icon' :class="[scope.row.student.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.student.name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="试听课程" align="center">
                  <template slot-scope="scope">
                    {{scope.row.timetable.course.name}}--{{scope.row.timetable.grade.name}}
                  </template>
                </el-table-column>
                <el-table-column label="试听时间" prop="timetable" align="center">
                  <template slot-scope="scope">
                    {{scope.row.timetable.begin_time | date('MM-dd')}}　 {{scope.row.timetable.begin_time | date('hh:mm')}}-{{scope.row.timetable.end_time | date('hh:mm')}}
                  </template>
                </el-table-column>
                <el-table-column label="课程顾问" prop="advisor.name" align="center"></el-table-column>
                <el-table-column label="状态" prop="operate" align="center">
                  <template slot-scope="scope">
                    <span v-if="scope.row.status === 4" class="fc-subm">待试听</span>
                    <span v-if="scope.row.status === 5" class="fc-9">已试听</span>
                    <span v-if="scope.row.status === 7" class="fc-m">已过期</span>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 需跟进学员 -->
            <el-tab-pane label="需跟进学员" name="follow_up">
              <el-table class="student-table" :data="follow_up_list" v-loading="follow_loading" :show-header="true">
                <el-table-column label="学员姓名" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/nosigndetail', query: {student_id: scope.row.student.id}}">
                      <span class='c_icon' :class="[scope.row.student.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.student.name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="课程顾问" prop="advisor.name" align="center"></el-table-column>
                <el-table-column label="上次跟进时间" align="center">
                  <template slot-scope="scope">
                    <span>{{scope.row.created_at | date('yyyy-MM-dd hh:mm')}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="预计跟进时间" align="center">
                  <template slot-scope="scope">
                    <span>{{scope.row.next_at | date('yyyy-MM-dd hh:mm')}}</span>
                  </template>
                </el-table-column>
              </el-table>

            </el-tab-pane>

            <!-- 待分配意向学员 -->
            <el-tab-pane label="待分配意向学员" name="assign">
              <el-table class="student-table" :data="assign_list" v-loading="follow_loading" :show-header="true">
                <el-table-column label="学员姓名" align="left">
                  <template slot-scope="scope">
                    <router-link :to="{path: '/student/nosigndetail', query: {student_id: scope.row.id}}" class="fc-m">
                      <span class='c_icon' :class="[scope.row.sex === 0 ? 'icon_girl' : 'icon_boy']">
                        <span class='name fc-m cursor-pointer'>{{scope.row.name}}</span>
                      </span>
                    </router-link>
                  </template>
                </el-table-column>
                <el-table-column label="登记时间" prop="created_at" align="center">
                  <template slot-scope="scope">
                    <span>{{scope.row.created_at | date('yyyy-MM-dd')}}</span>
                  </template>
                </el-table-column>
                <el-table-column label="渠道来源" prop="source_info.name"  align="center"></el-table-column>
                <el-table-column label="操作" prop="operate" align="center">
                  <template slot-scope="scope">
                    <!-- <a class="cursor-pointer fc-m" @click="assign_advisor(scope.row.id)">分配顾问</a> -->
                    <el-dropdown trigger="click" placement="left" @command="select_advisor">
                                <span class="el-dropdown-link">
                                    <div class="student_handle able_handle" slot="reference" @click="handle_student.id = scope.row.id">分配</div>
                                </span>
                                <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                    <el-scrollbar style="height: 100%;">
                                        <el-dropdown-item v-for="(item, index) in $store.state.advisor" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                    </el-scrollbar>
                                </el-dropdown-menu>
                            </el-dropdown>
                  </template>
                </el-table-column>
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
              <div slot="label">
                <el-badge :value="unread_num" :max="10" class="item">已收通知</el-badge>
              </div>
              <el-row v-loading="notice_loading" class="content_height" v-if="notice_lists.length>0">
                <el-row class="cursor-pointer fc-9" :class="{'unread' : notice.is_receive === 0 }" @click.native="notice_detail(notice)" v-for="(notice,index) in notice_lists" :key="index">
                  <el-col :span="18" class="notice_title">【{{notice.notification.type}}】{{notice.notification.title}}</el-col>
                  <el-col :span="6">{{notice.updated_at | date('yyyy.MM.dd')}}</el-col>
                </el-row>
              </el-row>
              <el-row v-else class="f-j-c d-f f-a-c fc-9">暂无通知</el-row>
            </el-tab-pane>
            <!-- 已发通知 -->
            <el-tab-pane name="send">
              <div slot="label">
                已发通知
              </div>
              <el-row v-loading="notice_loading" class="content_height" v-if="notice_send_lists.length>0">
                <el-row class="cursor-pointer" @click.native="notice_detail(notice)" v-for="(notice,index) in notice_send_lists" :key="index">
                  <el-col :span="18" class="notice_title">【{{notice.type}}】{{notice.title}}</el-col>
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

    <!-- 备忘录弹窗 -->
    <el-dialog v-if="memo_info.show" class="memo"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="memo_info.show"
    title="备忘录"
    :show-close="true"
    width="800px"
    center>
      <el-input type="textarea" :readonly="memo_info.readonly" placeholder="内容(不超过500字)" resize="none" :autosize="{ minRows: 15, maxRows: 30}" :maxlength="500" v-model.trim="memo_info.content">
      </el-input>
      <span slot="footer" class="dialog-footer">
        <span class='text_num' v-if="!memo_info.readonly">{{memo_info.content.length}}/500</span>
        <el-button type="primary" v-if="!memo_info.readonly && memo_info.render" @click.once="add_memo();">提交</el-button>
        <el-button type="primary" v-if="memo_info.readonly" @click="memo_info.show = false;">确定</el-button>
        <el-button v-if="memo_info.readonly" @click="delete_memo(memo_info.id)">删除</el-button>
      </span>
    </el-dialog>

    <!-- 登记学员弹窗 -->
    <AddStudentDialog  :dialogStatus="dialogStatus.student"
        @CB-dialogStatus="CB_dialogStatus" @CB-buyCourse="CB_buyCourse" @CB-addStudent="CB_addStudent">
    </AddStudentDialog>

    <!-- 购买课程弹窗 -->
    <!-- <BuyCourseDialog :dialogStatus="dialogStatus.course" @CB-dialogStatus="CB_dialogStatus" :buyCourseData="buyCourseData"
        @CB-contract="CB_contract">
    </BuyCourseDialog> -->

    <!-- 购课合约弹窗 -->
    <!-- <ContractDialog :dialogStatus="dialogStatus.contract" :contractData="contractData"></ContractDialog> -->

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
      <el-table stripe class="student-table" :data="all_leave_record.data" v-loading="leave_record_loading" :show-header="true">
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
      <el-table stripe class="student-table" :data="all_student_info.data" v-loading="all_student_info.loading" :show-header="true">
        <el-table-column label="序号" type="index" align="center"></el-table-column>
        <el-table-column label="姓名" prop="student.name" align="center"></el-table-column>
        <el-table-column label="学员类型" prop="type_describe" align="center"></el-table-column>
        <el-table-column label="上课状态" prop="status2_describe" align="center">
          <template slot-scope="scope">
              <div :class="[scope.row.status2 === 1 ? 'signed' : (scope.row.status2 === 3 ? 'leaved' : 'no_sign'),'course_status']">{{scope.row.status2_describe}}</div>
          </template>
        </el-table-column>
        <el-table-column label="上课确认" prop="confirm_status" align="center">
          <template slot-scope="scope">
              <div class='fc-7'>
                {{scope.row.confirm_status === 0 ? '未确认' : (scope.row.confirm_status === 1 ? '确认上课' : '确认不上课')}}
              </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
              <span @click="sign_student(scope.row.student_id,scope.row.timetable_id,scope.row.status2,scope.row)" :class="[scope.row.status2 === 5 && all_student_info.sign && !all_student_info.end ? 'able_handle' : 'disable_handle','student_handle']">签到</span>
              <span v-if="scope.row.type === 1 && all_student_info.course_type !== 1" @click="leave_student(scope.row.student_id,scope.row.timetable_id,scope.row.status2,scope.row)" :class="[scope.row.status2 === 5 && all_student_info.leave ? 'able_handle' : 'disable_handle','student_handle','ml-10']">请假</span>
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
import echarts from "echarts";

import AddStudentDialog from '../../components/dialog/AddStudent'
import BuyCourseDialog from '../../components/dialog/BuyCourse'
import ContractDialog from '../../components/dialog/Contract'

export default {
  data() {
    return {
      state: 'loading',
      activeName: "leave",
      follow_up_activeName: "visit",
      notice_activeName: "receive",

      user_info: '',

      dialogStatus: {student: false, course: false, contract: false},
      buyCourseData: {},
      contractData: {}, //合约数据

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
      //财务统计
      statitics_info: {
        sign: '',
        eliminate: ''
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
      memo_info: {
        id: '',
        data: [],
        show: false,
        content: '',
        readonly: false,
        render: true
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
        end: false,
        course_type: 0,
        loading: false
      },
      //今日跟进
      visit_list: [],
      audition_list: [],
      follow_up_list: [],
      assign_list: [],
      handle_student: {
        id: ''
      },
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
      charts_data: {
        pie_data: null,
        bar_data: null
      },


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
    //弹窗变比，改变dialog状态回调
    CB_dialogStatus(type) {
        if(type == 'student') return this.dialogStatus.student = false;
        // if(type == 'course') return this.dialogStatus.course = false;
    },
    //登记成功，刷新列表
    CB_addStudent() {
        this.dialogStatus.student = false;
    },
    //登记成功，购课回调
    CB_buyCourse(data) {
        console.log(data)
        // this.buyCourseData = data;
        // this.dialogStatus.student = false;
        // this.dialogStatus.course = true;

        let params = {
            student_id: data.id,
            advisor_id: data.advisor_id,
            advisor: data.advisor,
            parent_id: data.parent_id
        };

        this.$router.push({path: '/student/nosignbuycourse', query: {buyCourseData: JSON.stringify(params)}});
    },
    //购课成功，合约回调
    // CB_contract(data) {
    //     this.contractData = data;
    //     this.dialogStatus.course = false;
    //     this.dialogStatus.contract = true;
    // },
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
      console.log('activeName',this.activeName)
      switch (this.activeName) {
        case "leave":
          await this.get_leave_data();
          return true;
          break;
        case "divide":
          await this.get_divide_data();
          break;
        case "renewal":
          await this.get_renewal_data();
          return true;
          break;
        case "birth":
          await this.get_birth_data();
          break;
        case "memo":
          await this.get_memo_data();
      }
    },
    //打开历史记录弹窗
    open_all_leave_dialog() {
      this.all_leave_record.show = true;
      this.all_leave_record.search_info = {
        start: new Date(this.$format_date(new Date(),'yyyy/MM/01')), //默认当月第一天
        end: new Date(new Date().getFullYear(),new Date().getMonth()+1,0,24),
        student_name: '',
        page: 1,
        pageNum: 7
      };
      this.view_all_leave_record();
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
      this.$$request.post('/leaveTicket/processedLists',params).then(
        res => {
          this.all_leave_record.data = res.lists.data;
          this.all_leave_record.page_info.total = res.lists.total;
          this.leave_record_loading = false;
        }
      )
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
    //学员登记
    register() {
      this.dialogStatus.student = true;
    },
    //添加备忘录
    add_memo() {
      this.memo_info.render = false;
      if(this.memo_info.content.length<1){
        this.$nextTick(() => {
          this.memo_info.render = true;
        })
        this.$message.warning('请输入内容');
        return false;
      }
      this.memo_info.render = true;
      const params = {
        content: this.memo_info.content
      }
      this.$$request.post('/memorandum/add',params).then(res => {
        this.memo_info.show = false;
        this.get_memo_data();
        this.$message.success('已添加');
      })
    },
    //删除备忘录
    delete_memo(id) {
      this.$confirm('确定删除该备忘录吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const params = {
                  id: id
                }
                this.$$request.post('/memorandum/delete',params).then(res => {
                  this.memo_info.show = false;
                  this.get_memo_data();
                  this.$message.success('已删除');
                })
            }).catch(() => {return 0});
    },
    //查看备忘录
    view_memo(row, event, column) {
      this.memo_info.id = row.id;
      this.memo_info.content = row.content;
      this.memo_info.show = true;
      this.memo_info.readonly = true;
    },
    //获取待处理请假列表
    async get_leave_data() {
      this.loading = true;
      const params = {
        page_num: 5,
        page: this.page_info.current_page
      };
      let res = await this.$$request.get("/student/undisposedLeaveTicketLists", params);
      if(!res) return false;
      this.leave_info.data = res.lists;
      this.page_info.total = res.total;
      this.loading = false;
      return true;
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
      this.$$request.post("/student/leaveTicketCheck", params).then(res => {
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
      this.$$request.post("/sign/noGrade", params).then(res => {
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
      this.$$request.post("/sign/gradeLists", params).then(res => {
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
    async get_renewal_data() {
      this.row_span_num = new Map();
      this.loading = true;
      const params = {
        page_num: 5,
        page: this.page_info.current_page
      };
      let res = await this.$$request.post("/sign/contract", params);
      if(!res) return false;
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
      return true;
    },
    //续约
    renew(data) {
        console.log(data);


    //   this.buyCourseData = {
    //     course_id: student.course_id,
    //     id: student.student_id,
    //     advisor_id: student.advisor_id === null ? 0 : student.advisor_id,
    //     advisor: {name: student.advisor_name},
    //     parent_id: student.parent_id,
    //     buy_type: 2
    //   };
    //   this.dialogStatus.course = true;


        let params = {
            student_id: data.student_id,
            advisor_id: data.advisor_id,
            advisor: {name: data.advisor_name},
            parent_id: data.parent_id,
            buy_type: 2,
            course_id: data.course_id,
        };

        this.$router.push({path: '/student/signedbuycourse', query: {buyCourseData: JSON.stringify(params)}});
    },
    //获取生日学员列表
    get_birth_data() {
      this.loading = true;
      const params = {
        page_num: 5,
        page: this.page_info.current_page
      };
      this.$$request.get("/student/birthday", params).then(res => {
        this.birth_info.data = res.lists;
        this.page_info.total = res.total;
        this.loading = false;
      });
    },
    //发放礼物
    give_gift(id,name) {
      const params = {
        student_id: id
      };
      this.$confirm('确定为 '+name+' 发放礼物吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
            this.$$request.post("/student/sendGift", params).then(res => {
              this.get_birth_data();
              this.$message.success("操作成功");
            });
        })
    },
    //获取备忘录列表
    get_memo_data() {
      this.loading = true;
      const params = {
        page_num : 6,
        page: this.page_info.current_page
      }
      this.$$request.post('/memorandum/lists',params).then(res => {
        this.memo_info.data = res.memorandums.data;
        this.page_info.total = res.memorandums.total;
        this.loading = false;
      })
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
      this.$$request.post("/studentGrade/add", params).then(res => {
        this.$message.success("分班成功");
        this.divide_info.show_divide_dialog = false;
        this.get_data();
      });
    },
    //================财务统计模块================
    async get_finance_data() {
      let res = await this.$$request.get('/financial/statistics');
      if(!res) return false;
        this.statitics_info.sign = res.sign;
        this.statitics_info.eliminate = res.eliminate;
        return true;
    },
    //================今日课程模块================
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
        let res = await this.$$request.post("/student/lists", params);
        if(!res) return false;
        this[`${this.follow_up_activeName}_list`] = res.lists.data;
        this.follow_up_page_info.total = res.lists.total;
        this.follow_loading = false;
        return true;
      }else if(type === "followup") {
        params = {
          page_num: 5,
          page: this.follow_up_page_info.current_page
        };
        let res = await this.$$request.post("/followUp/needFollow", params);
        if(!res) return false;
        this[`${this.follow_up_activeName}_list`] = res.followUps.data;
        this.follow_up_page_info.total = res.followUps.total;
        this.follow_loading = false;
        return true;
      }else{
        params = {
          page_num: 5,
          type: type,
          page: this.follow_up_page_info.current_page
        };
        let res = await this.$$request.post("/followUp/todayLists", params);
        if(!res) return false;
        this[`${this.follow_up_activeName}_list`] = res.lists;
        this.follow_up_page_info.total = res.total;
        this.follow_loading = false;
        return true;
      }
    },
    //获取今日课程列表
    async get_today_course() {
      let res = await this.$$request.get("/timetable/todayLists");
      if(!res) return false;
      this.today_course_list = res.lists;
      return true;
    },
    //查看全部学员
    view_all_student(obj) {
      this.all_student_info.loading = true;
      this.all_student_info.data = [];
      this.all_student_info.show = true;
      this.all_student_info.grade_id = obj.grade_id;
      this.all_student_info.title = obj.grade_name;
      this.all_student_info.course_type = obj.course.is_order;
      this.get_all_student_list(obj.id)
      //当且仅当在上课前一小时和上课后一小时内才能签到
      if(new Date().getTime()/1000 > obj.begin_time - 60*60
       && new Date().getTime()/1000 < obj.end_time + 60*60){
        this.all_student_info.sign = true;
      }else{
        this.all_student_info.sign = false;
      }
      //当且仅当在上课前两个小时之前才能请假
      if(new Date().getTime()/1000 < obj.begin_time - 2*60*60){
        this.all_student_info.leave = true;
      }else{
        this.all_student_info.leave = false;
      }
    },
    get_all_student_list(id) {
      const params = {
              timetable_id: id
            }
      this.$$request.get('/timetable/studentLists',params).then(res => {
        this.all_student_info.data = res.lists;
        this.all_student_info.end = (res.lesson_end_time > 0);
        this.all_student_info.loading = false;
      })
    },
    //学员签到
    sign_student(s_id,t_id,status,item) {
      if(status === 5 && this.all_student_info.sign && !this.all_student_info.end){
        item.status2 = 6;
        const params = {
                timetable_id: t_id,
                student_id: s_id
              }
        this.$$request.post('/signRecord/add',params).then(res => {
          this.$message.success("已签到");
          this.get_all_student_list(t_id);
        })
      }

    },
    //学员请假
    leave_student(s_id,t_id,status,item) {
      if(status === 5 && this.all_student_info.leave){
        item.status2 = 6;
        const params = {
          grade_id: this.all_student_info.grade_id,
          timetable_id: t_id,
          student_id: s_id
        }
        this.$$request.post('/leaveTicket/add',params).then(res => {
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
      this.$$request.post("/followUp/inviteSure", params).then(res => {
        this.get_follow_up_data();
        this.$message.success("操作成功");
      });
    },
     //列表顾问选择
        async select_advisor(val) {
            let result = await this.$$request.post('/student/distribute', {student_id: this.handle_student.id, advisor_id: val})
            .then(res => {
              this.get_follow_up_data();
              this.$message.success("操作成功");
            })
        },
    //================通知模块================

    //发通知
    edit_notice() {
      this.$router.push({ path: "/workbench/editNotice" });
    },
    //获取员工通知列表
    async get_notice_list() {
      this.notice_loading = true;
      const params = {
        page: this.notice_page_info.current_page
      };
      let res = await this.$$request.get("/notification/personalLists", params);
      if(!res) return false;
        this.notice_lists = res.lists;
        this.notice_page_info.total = res.total;
        this.unread_num = res.unread < 1 ? "" : res.unread;
        this.notice_loading = false;
        return true;
    },
    //获取员工发送通知列表
    get_notice_send_list() {
      this.notice_loading = true;
      const params = {
        page: this.notice_page_info.current_page
      };
      this.$$request.get("/notification/lists", params).then(res => {
        this.notice_send_lists = res.lists;
        this.notice_page_info.total = res.total;
        this.notice_loading = false;
      });
    },

    //查看通知
    async notice_detail(notice) {
      switch (this.notice_activeName) {
        case "receive":
          const params = {
            notification_id: notice.notification.id
          };
          let res = await this.$$request.post("/notification/read", params);
          if(!res) return false;
          this.get_notice_list();
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
      console.log(pie_data)
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
      console.log(bar_data)
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
    async choose_time(val) {
      this.search_time = val;
      await this.get_course_info();
      await this.$nextTick(() => {
        this.init_pie_charts(this.charts_data.pie_data);
        this.init_bar_charts(this.charts_data.bar_data);
      })
    },
    //选择类型
    async choose_type(type) {
      this.search_type = type;
      await this.get_course_info();
      await this.$nextTick(() => {
        this.init_pie_charts(this.charts_data.pie_data);
        this.init_bar_charts(this.charts_data.bar_data);
      })
    },
    //获取课消数据
    async get_course_info() {
      let params = {
        begin: this.search_time[0],
        end: this.search_time[1],
        groupby: this.search_type
      };
      let res = await this.$$request.post("/classElimination/statistics", params);
      if(!res) return false;
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
          }
          this.charts_data = {
            pie_data : pie_data,
            bar_data : bar_data
          }
          return true;
    }
  },
  async created() {
    this.user_info = this.$$cache.getMemberInfo();
    this.activeName = this.user_info.class_pattern !== 2 ? "leave" : "renewal";
    let now = new Date().setDate(1);
    let next = now + 31 * 24 * 60 * 60 * 1000;
    let now_month = this.$format_date(new Date(), "yyyy-MM-01");
    let next_month = this.$format_date(new Date(next), "yyyy-MM-01");
    this.search_time = [now_month, next_month];
    let [r1,r2,r3,r4,r5,r6] = await Promise.all([this.get_data(),this.get_finance_data(),this.get_follow_up_data(),this.get_today_course(),this.get_notice_list(),this.get_course_info()])
    if(r1 && r2 && r3 && r4 && r5 && r6) this.state = "loaded";
    this.$nextTick(() => {
      console.log(this.charts_data.pie_data,this.charts_data.bar_data)
      this.init_pie_charts(this.charts_data.pie_data);
      this.init_bar_charts(this.charts_data.bar_data);
    })
  },
  components: { TableHeader, MyButton, AddStudentDialog, BuyCourseDialog, ContractDialog }
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
    .top_content{
      margin: 0 !important;
      /deep/ .el-card__body{
        min-height: 0 !important;
      }
      .el-card{
        padding: 20px 0;
      }
      .el-col {
        height: 40px;
        line-height: 40px;
        text-align: center;
        color: #555555;
      }
      .line{
        width: 1px;
        height: 125px;
        background: #cccccc;
        margin: auto
      }
      .times{
        color: #536A81;
        font-size: 28px;
        font-weight: bold;
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
      width: 9px;
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
      background-image: url("../../images/common/address-icon.png");
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
    position: absolute;
    left: 50px;
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
.t_button{
  background-color: #fff;
  color: #45dad5;
  border: 1px solid #45dad5;
  box-sizing: border-box;
  height: 32px;
  line-height: 32px;
  padding: 0 18px;
  border-radius: 3px;
  margin-left: 22px;
  cursor: pointer;
}
.unread {
  color: #45dad5 !important;
}
.notice_title{
  overflow: hidden;
  height: 19px;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 315px;
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
    padding: 0px 10px;
    height: 24px;
    line-height: 24px;
    border-radius: 4px;
    cursor: pointer;
}
.able_handle{
  border:1px solid #45dad5;
  color: #45dad5;
}
.able_sub_handle{
  border:1px solid #ED9374;
  color: #ED9374;
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
.el-button {
  color: #45dad5;
  border-color: #45dad5;
}
.el-button--primary {
  background-color: #45dad5;
  border-color: #45dad5;
  color: #fff;
}
.workbench_container /deep/ .is-fullscreen {
  height: 700px !important;
  overflow: hidden;
  .el-dialog__header{
    border-bottom: 1px solid #e9e9e9;
  }
  .el-dialog__body{
    height: 580px;
    overflow-y: auto;
  }
}
.workbench_container /deep/ .el-dialog__footer {
  padding: 0 20px 10px;
}
.memo /deep/ .el-dialog__body {
  padding: 25px 50px 30px;
}
.memo /deep/ .el-dialog__footer {
  padding: 0 20px 20px;
}
.memo /deep/ .el-textarea__inner {
  background-color: #F4F4F4;
  border: none;
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
      // height: 100%;
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
.workbench_container /deep/ .el-badge{
  vertical-align: inherit !important;
}
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


