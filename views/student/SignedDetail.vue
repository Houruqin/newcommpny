<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <div class="d-f detail-header p-r">
              <div class="left t-a-c">
                <img v-if="studentDetail.sex" src="../../images/student/boy.png" alt="">
                <img v-else src="../../images/student/girl.png" alt="">
                <p class="mt-5">
                  <span class="fs-16">{{studentDetail.name}}</span>
                  <i v-if="$$tools.isAuthority('editSigned')" class="iconfont icon-bianji cursor-pointer" @click="editDetail"></i>
                </p>
                <p class="mt-10"><span class="fc-9">学员编号：</span>{{studentDetail.id}}</p>
                <p><span class="fc-9">课堂评分：</span>{{studentDetail.score}}</p>
              </div>
              <div class="right flex1 pl-20 pt-20" v-if="studentDetail.parent_info">
                <p><span>性　　别：</span>{{studentDetail.sex ? '男' : '女'}}</p>
                <p><span>出生日期：</span>{{studentDetail.birthday > 0 ? $$tools.format(studentDetail.birthday) : ''}}</p>
                <div class="d-f parent-info">
                  <div class="fc-9">家长信息：</div>
                  <div class="flex1 fc-2">
                    <p v-if="!studentDetail.parent_info.name && studentDetail.parent_info.relation === 0">
                      <span>暂无</span>
                      <span class="pl-20">{{studentDetail.parent_info.mobile}}</span>
                    </p>
                    <p v-if="studentDetail.parent_info.name">
                      <span>{{studentDetail.parent_info.name}}({{getRelations(studentDetail.parent_info.relation)}})</span>
                      <span class="pl-20">{{studentDetail.parent_info.mobile}}</span>
                    </p>
                    <div v-if="studentDetail.deputyParentInfo.length">
                      <div v-for="(item, num) in studentDetail.deputyParentInfo" :key="num">
                        <p v-if="!item.name">
                          <span>暂无</span>
                          <span class="pl-20">{{item.mobile}}</span>
                        </p>
                        <p v-if="item.name">
                          <span>{{item.name}}({{getRelations(item.pivot.relation)}})</span>
                          <span class="pl-20">{{item.mobile}}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- <p><span>联系电话：</span>{{studentDetail.parent_info.mobile}}</p> -->
                <p><span>家庭住址：</span>{{studentDetail.address}}</p>
                <p><span>登记时间：</span>{{$$tools.format(studentDetail.registerInfo.created_at)}}</p>
                <p><span>登记人员：</span>{{studentDetail.registerInfo.operator.name}}</p>
                <div class="d-f">
                  <span>学员备注：</span>
                  <template v-if="studentDetail.remark && studentDetail.remark.length > 30">
                      <el-popover popper-class="grade-student-popver" placement="right" trigger="hover" width="200" :content="studentDetail.remark">
                          <div slot="reference" class="cursor-pointer">
                              <a class="fc-2">{{studentDetail.remark.substring(0, 30)}}...</a>
                          </div>
                      </el-popover>
                  </template>
                  <a v-else>{{studentDetail.remark}}</a>
                </div>
              </div>
              <div class="p-a d-f btn-toolbar">
                <MyButton type="subm" v-if="$$cache.getMemberInfo().class_pattern !== 2 && $$tools.isAuthority('divideClasses')" @click.native="gradeDivideClick('add')">分班</MyButton>
                <MyButton class="ml-20" v-if="$$tools.isAuthority('handleAudition') && $$cache.getMemberInfo().class_pattern !== 2" @click.native="addListenHandle">试听</MyButton>
                <MyButton v-if="$$tools.isAuthority('purchaseViewCourse')" class="ml-20" @click.native="buyCourse">购课</MyButton>
              </div>
            </div>
        </el-card>

        <el-card class="mt-20" shadow="hover">
            <div class="mt-10 p-r">
              <el-tabs v-model="activeTab" @tab-click="tabClick">
                <el-tab-pane v-for="(item, index) in tabLists" :key="index" :label="item.name" :name="item.type"></el-tab-pane>
              </el-tabs>
              <div class="d-f f-a-c p-a timetable-multiple" v-if="activeTab === 'timetable' && $$tools.isAuthority('deleteTimetable')">
                <MyButton v-if="!timetableMultiple.isShowCheckbox" @click.native="timetableMultiple.isShowCheckbox = true" type="border" fontColor="fc-m">批量管理</MyButton>
                <span v-if="timetableMultiple.isShowCheckbox" class="fc-9 cursor-pointer" :class="{'fc-m': timetableMultiple.selectedIds.length}" @click="deleteTimeTable">批量删除</span>
                <MyButton v-if="timetableMultiple.isShowCheckbox" type="border" fontColor="fc-m" class="ml-20" :minWidth="70" @click.native="cancelMultipleDel">取消</MyButton>
              </div>
            </div>
            <div class="bottom-content-box">
                <!-- 订单记录列表 -->
                <div key="course_info" v-if="activeTab == 'course_info'">
                    <el-table :data="quitCourseLists.data" stripe v-loading="loading">
                        <el-table-column label="序号" type="index" align="center"></el-table-column>
                        <el-table-column label="购课类型" align="center">
                            <template slot-scope="scope">{{scope.row.type === 1 ? '新签约' : '续约'}}</template>
                        </el-table-column>
                        <el-table-column label="课程名称" prop="course_name" align="center"></el-table-column>
                        <el-table-column label="购课总额" prop="real_price" align="center"></el-table-column>
                        <el-table-column label="总课时" align="center">
                            <template slot-scope="scope">
                                <span>{{scope.row.lesson_num + scope.row.given_num}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="剩余课时" align="center">
                            <template slot-scope="scope">
                                <span>{{scope.row.status == 2 ? 0 : scope.row.lesson_num_remain}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="课程状态" align="center">
                            <template slot-scope="scope">
                                <span v-if="scope.row.expired_at < new Date().getTime() / 1000">课程已经过期</span>
                                <span v-else-if="scope.row.status == 2">已退费</span>
                                <span v-else-if="scope.row.lesson_num_remain <= 0">课时已用完</span>
                                <span v-else>正常</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" align="center" width="230" v-if="$$tools.isAuthority(['purchaseViewCourse', 'refundAndView', 'manualEliminate'])">
                            <template slot-scope="scope">
                                <span v-if="$$tools.isAuthority('purchaseViewCourse')" class="cursor-pointer fc-m mr-10" @click="againBuyCourse(scope.row)">续约</span>
                                <span v-if="$$tools.isAuthority('purchaseViewCourse')" class="cursor-pointer fc-m mr-10" @click="showContract(scope.row)">购课详情</span>
                                <span v-if="$$tools.isAuthority('refundAndView') && scope.row.status != 2 && scope.row.expired_at > new Date().getTime() / 1000 && scope.row.lesson_num_remain > 0" class="fc-subm cursor-pointer" @click="quitCourse(scope.row)">退费</span>
                                <span v-if="$$tools.isAuthority('refundAndView') && scope.row.status == 2" class="fc-m cursor-pointer" @click="getQuitPriceDetail(scope.row)">退费详情</span>
                                <span v-if="$$tools.isAuthority('manualEliminate') && scope.row.lesson_num_remain > 0 && scope.row.status != 2"
                                    @click="removeTimeTableClick(scope.row)" class="fc-subm cursor-pointer ml-10">消课</span>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination v-if="quitCourseLists.total"
                        class="d-f f-j-c mt-50 mb-20"
                        :page-size="quitCourseLists.per_page"
                        background layout="total, prev, pager, next"
                        :total="quitCourseLists.total"
                        :current-page="quitCourseLists.current_page" @current-change="paginationClick">
                    </el-pagination>
                </div>

                <!-- 上课信息列表 -->
                <div key="grade" v-else-if="activeTab == 'grade'">
                    <el-table :data="courseTimeTable.data" stripe v-loading="loading">
                        <el-table-column label="序号" type="index" align="center"></el-table-column>
                        <el-table-column label="课程名称" prop="course.name" align="center"></el-table-column>
                        <el-table-column label="班级名称" align="center">
                            <template slot-scope="scope">
                                <router-link v-if="scope.row.course.class_pattern == 1"
                                    :to="{path: '/course/detail', query: {grade_id: scope.row.grade.id}}" class="fc-m">{{scope.row.grade.name}}</router-link>
                                <span v-else>无</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="任课老师/辅助老师" align="center" class-name="table-item">
                            <template slot-scope="scope">
                                <div v-if="scope.row.course.class_pattern == 1">
                                    <span>{{scope.row.grade.teachers.length && scope.row.grade.teachers[0].name}}</span>
                                    <span v-if="scope.row.grade.counselors.length">/{{scope.row.grade.counselors[0].name}}</span>
                                </div>
                                <ul v-else class="table-item-list" :class="{'first-merge': scope.row.studentCourses && scope.row.studentCourses.length > 1}">
                                    <li v-for="(list, index) in scope.row.studentCourses" :key="index">
                                        {{getTeacherName(scope.row.grade, list.teacher_ids)}}
                                    </li>
                                </ul>
                            </template>
                        </el-table-column>
                        <el-table-column label="上课教室" align="center" class-name="table-item">
                            <template slot-scope="scope">
                                <div v-if="scope.row.course.class_pattern == 1">
                                    <span v-if="scope.row.grade.room">{{scope.row.grade.room.name}}</span>
                                </div>
                                <ul v-else class="table-item-list">
                                    <li v-for="(list, index) in scope.row.studentCourses" :key="index">无</li>
                                </ul>
                            </template>
                        </el-table-column>
                        <el-table-column label="学员未排课时" align="center" class-name="table-item">
                            <template slot-scope="scope">
                                <div v-if="scope.row.course.class_pattern == 1">
                                    <span>{{scope.row.unscheduled}}</span>
                                </div>
                                <ul v-else class="table-item-list">
                                    <li v-for="(list, index) in scope.row.studentCourses" :key="index">
                                        {{list.lesson_num_reduce}}
                                    </li>
                                </ul>
                            </template>
                        </el-table-column>
                        <el-table-column label="学员剩余课时" align="center" class-name="table-item">
                            <template slot-scope="scope">
                                <div v-if="scope.row.course.class_pattern == 1">
                                    <span>{{scope.row.lesson_num_remain}}</span>
                                </div>
                                <ul v-else class="table-item-list">
                                    <li v-for="(list, index) in scope.row.studentCourses" :key="index">
                                        {{list.lesson_num_remain}}
                                    </li>
                                </ul>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" align="center" class-name="table-item" v-if="$$tools.isAuthority(['changeClasses', 'stopCourses', 'assignTeacher'])">
                            <template slot-scope="scope">
                                <div v-if="scope.row.lesson_num_remain > 0">
                                    <div v-if="scope.row.course.class_pattern == 1">
                                        <span v-if="$$tools.isAuthority('changeClasses')" class="cursor-pointer fc-m"  @click="gradeDivideClick('change', scope.row)">转班</span>
                                        <span v-if="$$tools.isAuthority('stopCourses') && scope.row.suspend_type !== 1" class="fc-subm cursor-pointer ml-10" @click="stopCourse(scope.row.student_id,scope.row.grade_id,scope.row.suspend_type,scope.$index)">
                                            {{scope.row.suspend_type === 0 ? '停课' : '开课'}}
                                        </span>
                                    </div>
                                    <ul v-else class="table-item-list">
                                        <li v-for="(list, index) in scope.row.studentCourses" :key="index">
                                            <span class="cursor-pointer fc-m" v-if="$$tools.isAuthority('assignTeacher')" @click="editTeacherClick(scope.row.course.id, list.teacher_ids, scope.row.student_id)">分配老师</span>
                                        </li>
                                    </ul>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                    <el-pagination v-if="courseTimeTable.total"
                        class="d-f f-j-c mt-50 mb-20"
                        :page-size="courseTimeTable.per_page"
                        background layout="total, prev, pager, next"
                        :total="courseTimeTable.total"
                        :current-page="courseTimeTable.current_page" @current-change="paginationClick">
                    </el-pagination>
                </div>
                <!-- 学员课表 -->
                <div key="timetable" v-else-if="activeTab == 'timetable'">
                  <el-table :data="timetableLists.data" stripe v-loading="loading" @selection-change="handleSelectionChange" ref="timetable">
                    <el-table-column type="selection" :selectable="checkboxIsDisabled" width="30" v-if="timetableMultiple.isShowCheckbox"></el-table-column>
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="课程名称" prop="course_name" align="center"></el-table-column>
                    <el-table-column label="上课日期" align="center">
                      <template slot-scope="item">{{$$tools.courseTime(item.row.begin_time, item.row.end_time)}}</template>
                    </el-table-column>
                    <el-table-column label="上课时间" align="center">
                      <template slot-scope="item">{{$$tools.courseTime(item.row.begin_time, item.row.end_time, 'time')}}</template>
                    </el-table-column>
                    <el-table-column label="上课老师" align="center">
                      <template slot-scope="item">
                          <span v-if="item.row.teachers.length">
                              <i v-for="(teacher, index) in item.row.teachers" :key="index"><i v-if="index > 0">/</i>{{teacher.name}}</i>
                          </span>
                      </template>
                    </el-table-column>
                    <el-table-column label="上课教室" prop="class_room_name" align="center"></el-table-column>
                    <el-table-column label="扣除课时" prop="lesson_num" align="center"></el-table-column>
                    <el-table-column label="课程状态" align="center">
                      <template slot-scope="item">{{item.row.lesson_end_time ? '已结课' : '未结课'}}</template>
                    </el-table-column>
                    <el-table-column label="学员状态" prop="status.define" align="center"></el-table-column>
                  </el-table>
                  <el-pagination v-if="timetableLists.total"
                        class="d-f f-j-c mt-50 mb-20"
                        :page-size="timetableLists.per_page"
                        background layout="total, prev, pager, next"
                        :total="timetableLists.total"
                        :current-page="timetableLists.current_page" @current-change="paginationClick">
                    </el-pagination>
                </div>
                <!-- 课程评价列表 -->
                <div v-else-if="activeTab == 'comment'" key="comment" class="course-comment">
                    <div v-if="courseCommentLists.length" v-loading="loading">
                        <ul>
                            <li v-for="(list, index) in courseCommentLists" :key="index">
                                <h3 class="fc-m fs-16">{{list.grade && list.grade.name}}</h3>
                                <p class="fs-12 fc-9 mt-10">{{list.teacher && list.teacher.name}}<span class="pl-20">发表于<i class="pl-5">{{$$tools.format(list.created_at)}}</i></span></p>
                                <p class="mt-20 fs-15">{{list.content}}</p>
                                <div v-if="list.pic.length" class="mt-10 d-f">
                                    <div v-if="index < 2 && !list.imageMore"
                                        v-for="(img, index) in list.pic" :key="index"
                                        class="comment-img-box"
                                        :class="{'ml-10': index > 0}"
                                        @click="list.imageMore = true">
                                        <img :src="img" alt="">
                                    </div>
                                </div>
                                <p class="fc-9 mt-5 cursor-pointer" v-if="list.pic.length > 2 && !list.imageMore" @click="list.imageMore = true">显示更多<span>{{list.pic.length - 2}}</span>张图片</p>
                                <div v-if="list.imageMore">
                                    <div v-for="(img, index) in list.pic" :key="index" class="commentmore-img-box" @click="list.imageMore = false"><img :src="img" alt=""></div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div v-else class="d-f f-a-c f-j-c fc-9 nothing"><span>暂无数据</span></div>
                </div>
                <!-- 跟进列表 -->
                <div v-else key="follow_up">
                    <div class="followup-lists-box p-r pl-80" v-loading="loading">
                        <!-- <div class="d-f"><MyButton class="ml-156 mt-20" @click.native="addFollowUp">添加跟进</MyButton></div> -->
                        <div v-if="followUpLists.total">
                            <FollowUpList v-for="(item, index) in followUpLists.data" :list="item" :key="index"></FollowUpList>
                        </div>
                        <div v-else class="d-f f-a-c f-j-c fc-9 nothing"><span>暂无数据</span></div>
                    </div>
                </div>
            </div>
        </el-card>

        <!-- 购课合约弹窗 -->
        <ContractDialog :routerAble="false" :dialogStatus="dialogStatus.contract" :contractData="contractData" @CB-dialogStatus="CB_dialogStatus"></ContractDialog>

        <!-- 退费弹窗 -->
        <el-dialog title="退费" width="940px" center :visible.sync="quitCourseMaskStatus" :close-on-click-modal="false" @close="dialogClose('quitCourseForm')">
            <el-form label-width="130px" size="small" ref="quitCourseForm" :rules="quitCourseRules" :model="quitCourseForm" class="quit-price-form">
                <p class="pl-35 fs-17">上课学员：<span>{{studentDetail.name}}</span></p>
                <div class="d-f mt-20">
                    <div class="list-item">
                        <el-form-item label="购买课时：">{{quitCourseInfo.lesson_num}}</el-form-item>
                        <el-form-item label="课时单价：">{{quitCourseInfo.unit_price}}元/课</el-form-item>
                        <el-form-item label="课时实际退费：" prop="lesson_quitprice">
                            <el-input type="number" placeholder="课时实际退费" v-model.number="quitCourseForm.lesson_quitprice"></el-input>
                        </el-form-item>
                    </div>

                    <div class="list-item">
                        <el-form-item label="赠送课时：">{{quitCourseInfo.given_num}}</el-form-item>
                        <el-form-item label="实交课时费：">{{quitCourseInfo.lesson_price}}</el-form-item>
                    </div>

                    <div class="list-item">
                        <el-form-item label="购买剩余课时：">{{quitCourseInfo.lesson_num_remain}}</el-form-item>
                        <el-form-item label="剩余课时费：">{{quitCourseInfo.residue_lesson_price}}</el-form-item>
                    </div>
                </div>

                <div class="d-f mt-10">
                    <div class="list-item">
                        <el-form-item label="实交教材费：">{{quitCourseInfo.textbook_price}}</el-form-item>
                        <el-form-item label="教材实际退费：" prop="textbook_quitprice">
                            <el-input type="number" placeholder="教材实际退费" v-model.number="quitCourseForm.textbook_quitprice"></el-input>
                        </el-form-item>
                    </div>
                    <div class="list-item">
                        <el-form-item label="剩余教材费：">{{quitCourseInfo.textbooks_price}}</el-form-item>
                    </div>
                </div>
                <el-form-item label="退费说明：" prop="explain" class="textarea-cls pr-100 mt-10">
                    <el-input type="textarea" :rows="4" placeholder="退费说明" v-model="quitCourseForm.explain"></el-input>
                </el-form-item>
                <div class="d-f f-j-c mt-30"><MyButton @click.native="doneHandle('quitCourseForm')" :loading="submitLoading.quitCourse">确认</MyButton></div>
            </el-form>
        </el-dialog>

        <!-- 分班弹窗 -->
        <el-dialog :title="divideClassType === 'add' ? '分班' : '转班'" width="800px" center :visible.sync="classMaskStatus" :close-on-click-modal="false" @close="dialogClose('divideGrade')">
            <div class="form-box divide-grade-dialog">
                <div v-for="(course, index) in gradeDivideLists.lists" :key="index" :class="{'mt-30': index}">
                    <div class="fc-m fs-16">{{course.name}}</div>
                    <div v-if="course.grade.length">
                        <el-radio-group v-model="divideClassRadio">
                            <ul class="d-f f-w-w">
                                <li v-for="(list, index) in course.grade" :key="index" class="fs-15 mr-30 mt-20">
                                    <el-radio :label="list.id">
                                        <span>{{list.name}}</span>
                                        <span class="ml-20">
                                          <i class="iconfont" :class="course.type == 1 ? 'fs-13 icon-renshu' : 'icon-renyuan'"></i>
                                          <i>{{list.join_num}}</i>
                                          <i v-if="course.type == 1">/{{list.limit_num}}</i>
                                        </span>
                                    </el-radio>
                                </li>
                            </ul>
                        </el-radio-group>
                    </div>
                    <div v-else class="fc-7 mt-20">暂无班级</div>
                </div>
            </div>

            <div class="d-f f-j-c mt-30">
                <MyButton :type="gradeDivideLists.disabled ? 'gray': 'main'" @click.native="divideClassDone(gradeDivideLists.disabled)" :loading="submitLoading.gradeDivide">确认</MyButton>
            </div>
        </el-dialog>

        <!-- 班级信息列表，扣课时数弹窗 -->
        <el-dialog title="扣课详情" width="1000px" center :visible.sync="lessonNumDetailMask" :close-on-click-modal="false">
            <div class="form-box">
                <h4>班级：{{gradeName}}</h4>
                <el-table :data="lessonNumDetail" stripe height="300">
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="上课日期" align="center">
                        <template slot-scope="scope">
                            {{$$tools.format(scope.row.timetable.begin_time)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="上课时间" align="center">
                        <template slot-scope="scope">
                            <span>{{$$tools.formatTime(scope.row.timetable.begin_time, 'minute')}}</span>
                            <i>-</i>
                            <span>{{$$tools.formatTime(scope.row.timetable.end_time, 'minute')}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="上课老师" align="center">
                        <template slot-scope="scope">
                            <span v-if="scope.row.timetable.teacher && scope.row.timetable.teacher.length">
                                <i v-for="(teacher, index) in scope.row.timetable.teacher" :key="index"><i v-if="index > 0">/</i>{{teacher.name}}</i>
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column label="上课教室" prop="timetable.room.name" align="center"></el-table-column>
                    <el-table-column label="扣课时数" prop="lesson_num_actually" align="center"></el-table-column>
                    <el-table-column label="课表状态" prop="status_describe" align="center"></el-table-column>
                </el-table>
            </div>
        </el-dialog>


        <!-- 班级信息列表，请假详情弹窗 -->
        <el-dialog title="请假详情" width="1000px" center :visible.sync="leaveNumDetailMask" :close-on-click-modal="false">
            <div class="form-box">
                <h4>班级：{{gradeName}}</h4>
                <el-table :data="leaveNumDetail" stripe height="300">
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="上课时间" width="200" align="center">
                        <template slot-scope="scope">
                            {{$$tools.courseTime(scope.row.timetable.begin_time, scope.row.timetable.end_time)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="请假时间" width="200" align="center">
                        <template slot-scope="scope">
                            {{$$tools.format(scope.row.created_at, 'second')}}
                        </template>
                    </el-table-column>
                    <el-table-column label="请假理由" prop="reason" align="center"></el-table-column>
                    <el-table-column label="批复状态" prop="status_describe" align="center"></el-table-column>
                    <el-table-column label="批复人" prop="teacher.name" align="center"></el-table-column>
                    <el-table-column label="操作" align="center">
                        <template solt-scope="scope">
                            <span class="fc-m">重新批复</span>
                            <span class="fc-sbm ml-10">删除</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-dialog>

        <!-- 手动消课 -->
        <el-dialog title="手动消课" width="900px" center :visible.sync="removeTimetableDialog" :close-on-click-modal="false" @close="timetableDialogClose">
            <el-form label-width="120px" :model="removeTimetableForm" size="small" ref="removeTimeTable" :rules="removeTimetableRules">
                <div class="form-box remove-timetable">
                    <div class="d-f">
                        <div class="flex1">
                          <el-form-item label="消课课程：">{{removeTimetableForm.course_name}}</el-form-item>

                          <el-form-item label="消课类型：" prop="type" v-if="removeTimetableForm.class_pattern == 1">
                              <el-select placeholder="请选择" v-model="removeTimetableForm.type">
                                  <el-option label="签到" value="sign"></el-option>
                                  <el-option label="请假" value="leave"></el-option>
                                  <el-option label="旷课" value="absenteeism"></el-option>
                              </el-select>
                          </el-form-item>

                          <el-row class='time-select'>
                              <el-col :span="16">
                                  <el-form-item label="上课时间：" prop="day">
                                      <el-date-picker v-model="removeTimetableForm.day" type="date" :editable="false" :picker-options="pickerBeginDateAfter"
                                          @change="removeTimeChange"
                                          placeholder="选择日期" value-format="yyyy/MM/dd">
                                      </el-date-picker>
                                  </el-form-item>
                              </el-col>

                              <el-col :span="7" :offset="1">
                                  <el-form-item label-width="0" prop="time">
                                      <el-time-select
                                          :editable="false"
                                          v-model="removeTimetableForm.time"
                                          :picker-options="timePicker"
                                          placeholder="时间">
                                      </el-time-select>
                                  </el-form-item>
                              </el-col>
                          </el-row>
                        </div>
                        <div class="flex1">
                          <el-form-item label="选择班级：" prop="grade_id" v-if="removeTimetableForm.class_pattern == 1">
                              <el-select placeholder="请选择" v-model="removeTimetableForm.grade_id" @change="removeTimeTableChange">
                                  <el-option v-for="(item, index) in gradeLists" :key="index" :label="item.name" :value="item.id"></el-option>
                              </el-select>
                          </el-form-item>

                          <el-form-item label="上课老师：" prop="teacher_id" v-if="removeTimetableForm.class_pattern == 1" key="teacher_id_form">
                              <el-select placeholder="请选择" v-model="removeTimetableForm.teacher_id">
                                  <el-option v-for="(item, index) in $store.state.teacherList" :key="index" :label="item.name" :value="item.id"></el-option>
                              </el-select>
                          </el-form-item>
                          <el-form-item label="上课老师：" prop="teacher_name" v-else key="teacher_id">{{removeTimetableForm.teacher_name}}</el-form-item>

                          <el-form-item label="扣课时数：" prop="lesson_num">
                              <el-input type="number" placeholder="扣课时数" v-model.number="removeTimetableForm.lesson_num"></el-input><span class="pl-10">课时</span>
                          </el-form-item>
                        </div>
                    </div>

                    <div class="d-f f-j-c mt-30">
                        <MyButton @click.native="timetableDone" :loading="submitLoading.removeTimetable">确定</MyButton>
                    </div>
                </div>
            </el-form>
        </el-dialog>

        <!-- 编辑，修改老师弹窗 -->
        <el-dialog title="编辑" width="400px" center :visible.sync="dialogStatus.editTeacher" :close-on-click-modal="false" @close="editTeahcerDiaClose">
            <el-form :model="teacherForm" label-width="100px" size="small" :rules="teacherRules" ref="teacherForm">
                <el-form-item prop="techer_id" label="选择老师：">
                    <el-select v-model="teacherForm.techer_id" placeholder="请选择">
                        <el-option v-for="(teacher, index) in editTeacherLists" :key="index" :label="teacher.name" :value="teacher.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="d-f f-j-c mt-40"><MyButton @click.native="editTeacherDone" :loading="submitLoading.edit">确定</MyButton></div>
        </el-dialog>

        <RefundDialog :routerAble="false" :dialogStatus="dialogStatus.quitPrice" :refundData="quitPriceDetail" @CB-dialogStatus="CB_dialogStatus"></RefundDialog>

        <!-- 试听弹窗 -->
        <AddAudition v-model="dialogStatus.audition" :studentId="studentId" @CB-auditionSuccess="CB_auditionSuccess"></AddAudition>

        <!-- 学员基础信息 -->
        <EditStudent v-model="dialogStatus.student" :editDetail="studentEditDetail" @CB-success="CB_success" @CB-dialogStatus="CB_dialogStatus"></EditStudent>
    </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import FollowUpList from '../../components/common/FollowUp';

import RefundDialog from '../../components/dialog/Refund';
import {StudentStatic, timeTableStatic, timePicker} from '../../script/static';
import Bus from '../../script/bus';

import ContractDialog from '../../components/dialog/Contract';
import AddAudition from '../../components/dialog/AddAudition';
import EditStudent from '../../components/dialog/StudentSigned';

export default {
  components: {TableHeader, MyButton, ContractDialog, RefundDialog, FollowUpList, AddAudition, EditStudent},
  data () {
    return {
      submitLoading: {
        student: false, gradeDivide: false, followUp: false, quitCourse: false, removeTimetable: false
      },

      state: 'loading',
      dialogStatus: {student: false, editTeacher: false, quitPrice: false, audition: false},

      studentId: '', //学员id
      studentDetail: {},
      studentEditDetail: {},
      contractData: {}, //合约详情
      quitPriceDetail: {}, //退费详情

      editTeacherLists: [],
      teacherForm: {course_id: '', techer_id: '', student_id: '', old_teacher_id: ''},
      loading: false,

      quitCourseLists: {}, //退费课程列表
      courseTimeTable: {}, //课程信息
      timetableLists: {}, //学员课表
      courseCommentLists: {}, //课评列表
      followUpLists: {}, //跟进列表

      gradeDivideLists: {
        lists: [],
        disabled: false
      }, //分班，课程班级列表
      divideClassRadio: '', //分班单选列表，选中的班级id
      divideClassType: 'add', //分班类型 默认add
      original_grade_id: '', //原本分班id

      gradeName: '', //班级名称
      lessonNumDetail: [], //已扣课时详情列表
      leaveNumDetail: [], //请假详情列表

      lessonNumDetailMask: false,
      leaveNumDetailMask: false,

      //消课先关字段
      timePicker: JSON.parse(JSON.stringify(timePicker)),
      removeTimetableDialog: false, //手动消课弹窗
      gradeLists: [], //手动消课填充数据

      oldActiveTab: 'course_info', //tab之前的值
      activeTab: 'course_info', //tab列表选中key

      classMaskStatus: false, //分班弹窗
      quitCourseMaskStatus: false, //退费弹窗
      paymentMethod: StudentStatic.paymentMethod, //付款方式
      wayIdArr: StudentStatic.followUp.wayId,
      relationArr: StudentStatic.relation,
      timeTableStatic: timeTableStatic.status, //上课状态

      quitCourseInfo: {}, //退费课程详细数据

      //学员课表批量操作
      timetableMultiple: {
        isShowCheckbox: false,
        selectedIds: []
      },

      tabLists: [
        {type: 'course_info', name: '订单记录'},
        {type: 'grade', name: '课程信息'},
        {type: 'timetable', name: '学员课表'},
        {type: 'comment', name: '课评信息'},
        {type: 'follow_up', name: '跟进记录'}
      ],

      quitCourseForm: {
        rel_remain: '',
        explain: '',
        lesson_quitprice: '',
        textbook_quitprice: ''
      },
      quitCourseRules: {
        explain: [
          {max: 200, message: '最多输入200个字符'}
        ],
        lesson_quitprice: [
          {required: true, message: '请输入课时实际退费'},
          {validator: this.$$tools.formOtherValidate('decimals', 2)},
          {validator: this.quitPriceValidate('lesson')}
        ],
        textbook_quitprice: [
          // {required: true, message: '请输入教材实际退费'},
          {validator: this.$$tools.formOtherValidate('decimals', 2)},
          {validator: this.quitPriceValidate('textbook')}
        ]
      },
      teacherRules: {
        techer_id: [
          {required: true, message: '请选择老师', trigger: 'change'}
        ]
      },
      removeTimetableForm: {
        course_id: '', course_name: '', type: '', grade_id: '', teacher_id: '', lesson_num: '', day: '', time: '', begin_time: '', teacher_name: ''
      },
      removeTimetableRules: {
        type: [
          {required: true, message: '请选择消课类型', trigger: 'change'}
        ],
        grade_id: [
          {required: true, message: '请选择班级', trigger: 'change'}
        ],
        teacher_id: [
          {required: true, message: '请选择老师', trigger: 'change'}
        ],
        lesson_num: [
          {required: true, message: '请输入课时数'},
          {validator: this.$$tools.formOtherValidate('lesson_num')},
          {validator: this.$$tools.formOtherValidate('total', 99)}
        ],
        day: [
          {required: true, message: '请选择日期', trigger: 'change'}
        ],
        teacher_name: [],
        time: [
          {required: true, message: '请选择时间', trigger: 'change'}
        ]
      },
      followUpRules: {
        way_id: [
          {required: true, message: '请选择跟进方式', trigger: 'change'}
        ],
        status: [
          {required: true, message: '请选择跟进结果', trigger: 'change'}
        ],
        invited_at: [
          {required: true, message: '请选择邀约时间', trigger: 'change'}
        ],
        content: [
          {required: true, message: '请填写跟进内容'},
          {max: 150, message: '长度不能超过150个字符'}
        ]
      },
      pickerBeginDateAfter: {
        disabledDate: (time) => {
          return time.getTime() > new Date().getTime();
        }
      },
      pickListenDisable: {
        disabledDate: (time) => {
          return time.getTime() < new Date().setHours(0, 0, 0, 0);
        }
      }
    };
  },
  methods: {
    getRelations (id) {
      let text = '';

      this.$store.state.familyRelations.forEach(v => {
        if (id == v.id) {
          text = v.name;
        }
      });

      return text;
    },
    //弹窗变比，改变dialog状态回调
    CB_dialogStatus (type) {
      if (type === 'student') {
        this.studentEditDetail = {};

        return 0;
      }

      if (type === 'contract') {
        this.contractData = {};
        this.dialogStatus.contract = false;

        return 0;
      }

      if (type === 'refund') {
        this.quitPriceDetail = {};
        this.dialogStatus.quitPrice = false;

        return 0;
      }
    },
    CB_success () {
      this.getStudentDetail();
      Bus.$emit('refreshSignedStudentLists');
    },
    editTeahcerDiaClose () {
      this.$refs.teacherForm.resetFields();
    },
    // 试听成功
    CB_auditionSuccess () {
      this.getBottomTabLists();
    },
    dialogClose (form) {
      if (form === 'divideGrade') {
        this.divideClassRadio = '';
      } else {
        this.$refs[form].resetFields();
      }
    },
    // 批量删除课表
    deleteTimeTable () {
      if (this.timetableMultiple.selectedIds && this.timetableMultiple.selectedIds.length) {
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
      let res = await this.$$request.post('/timetable/deleteStudentTiemtables', {
        student_id: this.studentId,
        student_timetable_ids: this.timetableMultiple.selectedIds
      });

      console.log(res);
      if (!res) {
        return 0;
      }
      this.$message.success('删除成功');
      this.getBottomTabLists();
    },
    cancelMultipleDel () {
      this.timetableMultiple.isShowCheckbox = false;
      this.timetableMultiple.selectedIds.splice(0, this.timetableMultiple.selectedIds.length);
      this.$refs.timetable.clearSelection();
    },
    handleSelectionChange (val) {
      this.timetableMultiple.selectedIds = val.map(v => v.student_timetable_id);
    },
    checkboxIsDisabled (row) {
      return row.begin_time > new Date().getTime() / 1000 && !row.lesson_end_time;
    },
    //退费  课时退费和教材退费单独验证
    quitPriceValidate (type) {
      return (rule, value, callback) => {
        if (type === 'lesson') {
          if (value > Number(this.quitCourseInfo.real_price)) {
            return callback(new Error('课时退费金额不能超过剩余课时费'));
          }

          return callback();
        }
        if (value > Number(this.quitCourseInfo.textbook_price)) {
          return callback(new Error('教材退费金额不能超过剩余教材费'));
        }

        return callback();

      };
    },
    //编辑修改老师信息 click
    editTeacherClick (course_id, teacher_id, student_id) {
      this.teacherForm.old_teacher_id = +teacher_id;
      this.teacherForm.techer_id = +teacher_id;
      this.teacherForm.course_id = course_id;
      this.teacherForm.student_id = student_id;
      this.getEditTeacherLists(course_id);
    },
    //获取编辑老师列表
    async getEditTeacherLists (id) {
      let result = await this.$$request.post('/course/orderTeachers', {course_id: id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.editTeacherLists = result.teachers;
      this.dialogStatus.editTeacher = true;
    },
    getTeacherName (grade, teacher_id) {
      let teacher_name = '';

      grade.teachers.forEach(v => {
        if (v.id == teacher_id) {
          teacher_name = v.name;
        }
      });

      return teacher_name;
    },
    //修改老师确定 click
    editTeacherDone () {
      this.$refs.teacherForm.validate(valid => {
        if (valid) {
          this.submitEditTeacher();
        }
      });
    },
    //提交修改老师数据
    async submitEditTeacher () {
      let params = {
        id: this.teacherForm.old_teacher_id,
        course_id: this.teacherForm.course_id,
        teacher_id: this.teacherForm.techer_id,
        student_id: this.teacherForm.student_id
      };

      console.log(params);

      let result = await this.$$request.post('/course/changeTeacher', params);

      console.log(result);

      if (!result) {
        return 0;
      }
      this.$message.success('修改老师成功');
      this.dialogStatus.editTeacher = false;
      this.getBottomTabLists();
    },
    //评分兑换
    // conversionClick() {

    // },
    //手动消课相关
    removeTimeTableClick (data) {
      console.log(data);
      this.removeTimetableForm.course_id = data.course_id;
      this.removeTimetableForm.course_name = data.course_name;
      this.removeTimetableForm.class_pattern = data.class_pattern;

      if (data.class_pattern == 1) {
        this.$store.state.course.forEach(v => {
          if (v.id == data.course_id) {
            this.removeTimetableForm.lesson_time = v.lesson_time;
            this.gradeLists = v.grades;
          }
        });
      } else {
        this.removeTimetableForm.teacher_id = data.teacher_ids;
        this.$store.state.teacherList.forEach(v => {
          if (v.id == data.teacher_ids) {
            this.removeTimetableForm.teacher_name = v.name;
          }
        });
        this.removeTimetableForm.lesson_time = data.lesson_time;
      }

      this.removeTimetableDialog = true;

    },
    // 手动消课选择课程班级
    removeTimeTableChange (val) {
      this.gradeLists.forEach(v =>{
        if (v.id == val) {
          this.removeTimetableForm.teacher_id = +v.teacher_ids.substring(1, v.teacher_ids.length - 1);
        }
      });
    },
    //手动消课点击确定
    timetableDone () {
      this.$refs.removeTimeTable.validate(valid => {
        if (valid) {
          this.submitTimetable();
        }
      });
    },
    //底部列表切换
    tabClick (item) {
      if (this.oldActiveTab === item.name) {
        return 0;
      }
      this.oldActiveTab = item.name;
      this.getBottomTabLists();
    },
    //手动消课提交数据
    async submitTimetable () {
      if (this.submitLoading.removeTimetable) {
        return 0;
      }
      this.submitLoading.removeTimetable = true;

      let params = {
        student_id: this.studentId,
        course_id: this.removeTimetableForm.course_id,
        grade_id: this.removeTimetableForm.grade_id,
        teacher_id: this.removeTimetableForm.teacher_id,
        lesson_num: this.removeTimetableForm.lesson_num,
        type: this.removeTimetableForm.class_pattern == 1 ? this.removeTimetableForm.type : 'sign'
      };

      if (this.removeTimetableForm.class_pattern == 2) {
        params.grade_id = 0;
      }
      let day = this.removeTimetableForm.day;
      let time = this.removeTimetableForm.time;

      params.begin_time = new Date(`${day} ${time}`).getTime() / 1000;
      params.end_time = params.begin_time + this.removeTimetableForm.lesson_time * 60;

      console.log(params);

      let result = await this.$$request.post('/eduCount/manualElimination', params);

      this.submitLoading.removeTimetable = false;
      console.log(result);
      if (!result) {
        return 0;
      }
      this.$message.success('手动消课成功!');
      this.removeTimetableDialog = false;
      this.getBottomTabLists();
    },
    //手动消课弹窗关闭
    timetableDialogClose () {
      this.gradeLists = [];
      this.$refs.removeTimeTable.resetFields();
      Object.keys(this.removeTimetableForm).forEach(v => {
        this.removeTimetableForm[v] = '';
      });
    },
    removeTimeChange (val) {
      if (new Date(val).toDateString() === new Date().toDateString()) {
        this.timePicker.maxTime = [new Date().getHours(), new Date().getMinutes()].join(':').replace(/\b\d\b/g, '0$&');
      } else {
        this.timePicker.maxTime = '22:00';
      }
    },
    //续约，再次购买课程
    againBuyCourse (data) {
      console.log(data);

      let params = {
        student_id: data.student_id,
        advisor_id: data.advisor_id,
        advisor: data.advisor,
        parent_id: data.parent_id,
        deposit_money: -1,
        expire: data.expire,
        buy_type: 2,
        course_id: data.course_id,
        class_pattern: data.class_pattern,
        teacher_id: data.teacher_ids
      };

      this.$router.push({path: '/student/signedbuycourse', query: {buyCourseData: JSON.stringify(params)}});
    },
    //课程信息列表查看合约
    async showContract (data) {
      let result = await this.$$request.get('/studentCourse/detail', {sc_id: data.id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.contractData = result.data;
      this.dialogStatus.contract = true;
    },
    //退费详情
    async getQuitPriceDetail (data) {
      let result = await this.$$request.get('/financeManage/quitCourseDetail', {student_course_id: data.id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.quitPriceDetail = result;
      this.dialogStatus.quitPrice = true;
    },
    //添加试听
    addListenHandle () {
      this.dialogStatus.audition = true;
    },
    //添加分班
    gradeDivideClick (type, data) {
      this.divideClassType = type;
      if (type === 'add') {
        this.getStudentGradeLists('/sign/courseLists');
      } else {
        this.divideClassRadio = data.grade_id;
        this.original_grade_id = data.grade_id;
        this.getStudentGradeLists('/sign/gradeLists', data);
      }
    },
    //分班确定按钮
    divideClassDone (disabled) {
      if (disabled) {
        return 0;
      }
      if (!this.divideClassRadio) {
        return this.$message.warning('请选择班级');
      }

      this.gradeDivideLists.lists.forEach(v => {
        v.grade.forEach(d => {
          if (d.id == this.divideClassRadio) {
            if (d.join_num >= d.limit_num && v.type === 1) {
              this.$confirm('学员数量已经超过上限，是否继续添加?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                this.submitClassRoomHandle();
              }).catch(() => {
                return 0;
              });
            } else {
              this.submitClassRoomHandle();
            }
          }
        });
      });
    },
    //提交分班数据
    submitClassRoomHandle () {
      if (this.divideClassType === 'add') {
        this.submitDivideClass('/studentGrade/add', {student_id: this.studentId, grade_id: this.divideClassRadio});
      } else {
        this.submitDivideClass('/studentGrade/change', {
          student_id: this.studentId,
          original_grade_id: this.original_grade_id,
          target_grade_id: this.divideClassRadio
        });
      }
    },
    // 停课/开课（只针对学员停课）
    stopCourse (s_id, g_id, type, index) {
      const params = {
        student_id: s_id,
        grade_id: g_id,
        type: type === 0 ? 'stop' : 'start'
      };
      let tip = type === 0 ? '停课' : '开课';

      this.$confirm(`确定办理${tip}吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let result = this.$$request.post('/studentGrade/suspend', params);

        if (!result) {
          return 0;
        }
        this.$message.success('操作成功');
        this.courseTimeTable.data[index].suspend_type = type === 0 ? 2 : 0;
      });
    },
    //班级信息，已扣课时点击
    lessonNumHandle (data) {
      console.log(data);
      this.lessonNumDetail = data.lesson_num_reduce;
      this.gradeName = data.grade.name;
      this.lessonNumDetailMask = true;
    },
    //班级信息，已请假次数点击
    leaveNumHandle (data) {
      this.leaveNumDetail = data.leave_tickets;
      this.gradeName = data.grade.name;
      this.leaveNumDetailMask = true;
    },
    //购课
    buyCourse () {
      let params = {
        student_id: this.studentDetail.id,
        advisor_id: this.studentDetail.advisor_id,
        advisor: this.studentDetail.advisor,
        parent_id: this.studentDetail.parent_id,
        deposit_money: -1
      };

      this.$router.push({path: '/student/signedbuycourse', query: {buyCourseData: JSON.stringify(params)}});
    },
    //上课状态转换
    timeTableStatus (status) {
      let str = '';

      this.timeTableStatic.forEach(v => {
        if (v.id == status) {
          str = v.name;
        }
      });

      return str;
    },
    //编辑
    editDetail () {
      this.studentEditDetail = {
        student_id: this.studentDetail.id,
        birthday: this.studentDetail.birthday,
        student_name: this.studentDetail.name,
        mobile: this.studentDetail.parent_info.mobile,
        parent_name: this.studentDetail.parent_info.name,
        relation: this.studentDetail.parent_info.relation,
        address: this.studentDetail.parent_info.address,
        sex: this.studentDetail.sex,
        school_name: this.studentDetail.school_name,
        advisor_id: this.studentDetail.advisor_id,
        remark: this.studentDetail.remark
      };

      this.dialogStatus.student = true;
    },
    //退费按钮点击
    quitCourse (data) {
      console.log(data);
      this.quitCourseInfo = data;
      let lesson_num_remain = this.quitCourseInfo.lesson_num_remain - this.quitCourseInfo.given_num;

      lesson_num_remain = lesson_num_remain <= 0 ? 0 : lesson_num_remain;

      this.quitCourseInfo.remain_price = (+this.quitCourseInfo.unit_price * lesson_num_remain).toFixed(2);

      this.quitCourseMaskStatus = true;
    },
    //表单确定
    doneHandle (type) {
      this.$refs[type].validate(valid => {
        if (valid) {
          if (type === 'quitCourseForm') {
            this.submitQuitCourse();
          }
        }
      });
    },
    //tab列表数据分页
    paginationClick (currentPage) {
      this.getBottomTabLists(currentPage);
    },
    //提交退费数据
    async submitQuitCourse () {
      if (this.submitLoading.quitCourse) {
        return 0;
      }
      this.submitLoading.quitCourse = true;

      let params = {
        sc_id: this.quitCourseInfo.id,
        student_id: this.quitCourseInfo.student_id,
        course_id: this.quitCourseInfo.course_id,
        expire: this.quitCourseInfo.expire,
        lesson_num: this.quitCourseInfo.lesson_num,
        remain_num: this.quitCourseInfo.lesson_num_remain,
        real_price: this.quitCourseInfo.real_price,
        pre_price: this.quitCourseInfo.unit_price,
        remain_price: this.quitCourseInfo.remain_price,
        explain: this.quitCourseForm.explain,
        rel_remain: this.quitCourseForm.lesson_quitprice + this.quitCourseForm.textbook_quitprice,
        remain_lesson_price: this.quitCourseForm.lesson_quitprice,
        remain_textbook_price: this.quitCourseForm.textbook_quitprice
      };

      console.log(params);

      let result = await this.$$request.post('/quitCourse/add', params);

      this.submitLoading.quitCourse = false;
      console.log(result);
      if (!result) {
        return 0;
      }
      this.$message.success('退费成功');
      this.getBottomTabLists();
      this.quitCourseMaskStatus = false;
    },
    //提交分班信息
    async submitDivideClass (url, params) {
      if (this.submitLoading.gradeDivide) {
        return 0;
      }
      this.submitLoading.gradeDivide = true;

      console.log(params);
      let result = await this.$$request.post(url, params);

      this.submitLoading.gradeDivide = false;
      if (!result) {
        return 0;
      }

      this.getBottomTabLists();
      this.$message.success('分班成功');
      this.classMaskStatus = false;
    },
    //获取学员详情
    async getStudentDetail () {
      let result = await this.$$request.post('/sign/detail', {id: this.studentId});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.$set(this, 'studentDetail', result.detail);

      return true;
    },
    //课程列表，点击分班，获取班级列表
    async getStudentGradeLists (url, data) {
      let params = this.divideClassType === 'add' ? {student_id: this.studentId} : {id: data.course.id};
      let result = await this.$$request.post(url, params);

      console.log(result);
      if (!result) {
        return 0;
      }

      if (this.divideClassType === 'add') {
        if (!result.lists.length) {
          return this.$message.warning('没有可分班的课程!');
        }
        this.gradeDivideLists.lists = result.lists;
        this.gradeDivideLists.disabled = result.lists.every(k => {
          return k.grade.length ? false : true;
        });
      } else {
        let courseObj = [{grade: result.lists || [], id: data.course.id, name: data.course.name}];

        this.gradeDivideLists.lists = courseObj;
      }

      this.classMaskStatus = true;
    },
    //获取5个列表方法
    async getBottomTabLists (currentPage) {
      this.timetableMultiple.isShowCheckbox = false;
      this.loading = true;

      let requestUrl = {
        course_info: {url: '/studentCourse/normalLists', list: 'quitCourseLists'},
        grade: {url: '/studentGrade/lists', list: 'courseTimeTable'},
        timetable: {url: '/timetable/studentList', list: 'timetableLists'},
        comment: {url: '/sign/comment', list: 'courseCommentLists'},
        follow_up: {url: '/followUp/lists', list: 'followUpLists'}
      };

      let url = requestUrl[this.activeTab].url, params = {student_id: this.studentId}, dataLists = requestUrl[this.activeTab].list;

      if (currentPage) {
        params.page = currentPage;
      }

      let result = null;

      if (this.activeTab === 'timetable') {
        result = await this.$$request.get(url, params);
      } else {
        result = await this.$$request.post(url, params);
      }
      console.log(result);
      if (!result) {
        return 0;
      }

      if (dataLists === 'courseCommentLists') {
        result.lists.forEach(v => {
          v.pic = v.pic ? v.pic.split(',') : [];
          v.imageMore = false;
        });
      }

      this[dataLists] = result.lists;
      this.loading = false;

      return true;
    },
    async pageInit () {
      let [a, b] = await Promise.all([this.getStudentDetail(), this.getBottomTabLists()]);

      if (a && b) {
        this.state = 'loaded';
      }
    }
  },
  created () {
    this.studentId = this.$route.query.id;
    this.pageInit();
  },
  watch: {
    $route: function (val) {
      this.state = 'loading';
      this.studentId = val.query.id;
      this.pageInit();
    }
  }
};
</script>

<style lang="less" scoped>
    .detail-header {
      padding: 20px;
      .btn-toolbar {
        top: 30px;
        right: 30px;
      }
      .left {
        border-right: 1px #e3e3e3 solid;
        padding: 20px;
      }
      .right {
        p {
          margin-bottom: 10px;
        }
        span {
          color: #999;
        }
      }
      .parent-info {
        span {
          color: #303133;
        }
      }
    }
    .form-box {
        padding: 0 20px;
        .el-select, .el-date-editor {
            width: 100%;
        }
        h3 {
            font-weight: normal;
            font-size: 14px;
            padding-left: 38px;
            margin-bottom: 15px;
        }
        &.divide-grade-dialog {
            height: 250px;
            overflow: hidden;
            overflow-y: auto;
        }
    }
    .remove-timetable {
      padding: 0;
      /deep/ .el-input {
        width: 260px;
      }
      .time-select {
        width: 380px;
        /deep/ .el-input {
          width: 100%;
        }
      }
    }
    .quit-price-form {
        padding: 0 20px;
        .el-input {
            width: 150px;
        }
        .list-item {
            width: 280px;
        }
    }
    .followup-lists-box {
        // overflow-y: scroll;
        // max-height: 450px;
        .nothing {
            height: 200px;
        }
    }
    .course-comment {
        max-height: 600px;
        overflow-y: auto;
        // overflow: hidden;
        ul {
            li {
                padding: 20px;
                &:not(:first-child) {
                    border-top: 1px #e3e3e3 solid;
                }
                h3 {
                    font-weight: normal;
                }
            }
            .comment-img-box {
                width: 230px;
                height: 172px;
                overflow: hidden;
                img {
                    max-width: 230px;
                }
            }
            .commentmore-img-box {
                width: 470px;
                min-height: 180px;
                overflow: hidden;
                img {
                    max-width: 470px;
                }
            }
        }
        .nothing {
            height: 200px;
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
                border: 1px #BFBFBF solid;
                width: 120px;
                text-align: center;
                line-height: 40px;
            }
        }
    }
    .listen-course-box {
        max-height: 350px;
        overflow: hidden;
        overflow-y: auto;
    }
    .listen-nothing {
        width: 610px;
        height: 120px;
    }
    .audition-lists {
        li {
            padding: 20px;
            &:not(:first-child) {
                border-top: 1px #e3e3e3 solid;
            }
            &::after {
                content: '';
                display: block;
                width: 20px;
                height: 20px;
                background: url(../../images/common/not-check.png) no-repeat;
                background-size: 100%;
                position: absolute;
                right: 20px;
                top: 50%;
                transform: translateY(-50%);
            }
            &.active {
                &::after {
                    background: url(../../images/common/check-box.png) no-repeat;
                    background-size: 100%;
                }
            }
            .two-p {
                span {
                    position: relative;
                }
            }
        }
    }
    .timetable-multiple {
      top: 0;
      right: 0;
    }
</style>


