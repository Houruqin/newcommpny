<template>
    <div class="flex1">
        <el-card shadow="hover">
            <div class="table-header d-f f-a-c f-j-b fc-5">
                <div class="d-f">
                    <span class="fs-16">{{studentDetail.name}}</span>
                    <div class="ml-10 d-f f-a-c f-j-c cursor-pointer" @click="editDetail"><img src="../../images/common/edit-icon.png"></div>
                    <span class="ml-20">学员编号：<i>0{{studentDetail.id}}</i></span>
                    <span class="ml-20">课堂评分：<i>{{studentDetail.score}}</i></span>
                </div>
                <div class="d-f">
                    <MyButton type="subm" @click.native="gradeDivideClick('add')">添加分班</MyButton>
                    <MyButton class="ml-20" @click.native="addListenHandle">试听</MyButton>
                    <MyButton class="ml-20" @click.native="buyCourse">购课</MyButton>
                </div>
            </div>

            <div class="detail-box fc-9">
                <p>
                    <span>性别：<i>{{studentDetail.sex ? '男' : '女'}}</i></span>
                    <span>出生日期：<i>{{studentDetail.birthday > 0 ? $$tools.format(studentDetail.birthday) : ''}}</i></span>
                </p>
                <p v-if="studentDetail.parent_info">
                    <span>家长：<i>{{studentDetail.parent_info.name}}</i><i>({{studentDetail.parent_info.relation == 1 ? '母亲' : studentDetail.parent_info.relation == 2 ? '父亲' : '其他'}})</i></span>
                    <span>联系电话：<i>{{studentDetail.parent_info.mobile}}</i></span>
                </p>    
                <p><span>家庭住址：<i>{{studentDetail.parent_info && studentDetail.parent_info.address}}</i></span></p>
                <p><span>学员备注：<i>{{studentDetail.remark}}</i></span></p>
            </div>
        </el-card>

        <el-card class="mt-20" shadow="hover">
            <TableHeader title="课程资料"></TableHeader>
            <el-tabs v-model="activeTab">
                <el-tab-pane v-for="(item, index) in tabLists" :key="index" :label="item.name" :name="item.type"></el-tab-pane>
            </el-tabs>
            <div class="bottom-content-box">
                <!-- 课程信息列表 -->
                <div key="course_info" v-if="activeTab == 'course_info'">
                    <el-table :data="quitCourseLists.data" stripe>
                        <el-table-column label="序号" type="index" align="center"></el-table-column>
                        <el-table-column label="购课类型" align="center">
                            <template slot-scope="scope">{{scope.row.type === 1 ? '新签约' : '续约'}}</template>
                        </el-table-column>
                        <el-table-column label="课程名称" prop="course_name" align="center"></el-table-column>
                        <el-table-column label="课程总额" prop="real_price" align="center"></el-table-column>
                        <el-table-column label="课程有效期" align="center">
                            <template slot-scope="scope">
                                <span>{{$$tools.format(scope.row.expired_at)}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="所有课时" align="center">
                            <template slot-scope="scope">
                                <span>{{scope.row.lesson_num + scope.row.given_num}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="剩余课时" align="center">
                            <template slot-scope="scope">
                                <span>{{scope.row.lesson_num_remain}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="业绩归属" prop="advisor.name" align="center"></el-table-column>
                        <el-table-column label="操作" align="center">
                            <template slot-scope="scope">
                                <span class="cursor-pointer fc-m pr-10" @click="showContract(scope.row)">查看</span>
                                <span v-if="scope.row.expired_at < new Date().getTime() / 1000">课程已经过期</span>
                                <span v-else-if="scope.row.status == 2">已退费</span>
                                <span v-else-if="scope.row.lesson_num_remain <= 0">课时已用完</span>
                                <span v-else class="fc-subm cursor-pointer" @click="quitCourse(scope.row)">退费</span>
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

                <!-- 班级信息列表 -->
                <div key="grade" v-else-if="activeTab == 'grade'">
                    <el-table :data="courseTimeTable.data" stripe>
                        <el-table-column label="序号" type="index" align="center"></el-table-column>
                        <el-table-column label="班级名称" align="center">
                            <template slot-scope="scope">
                                <span class="fc-m cursor-pointer" @click="gradeDetailHandle(scope.row)">{{scope.row.grade.name}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="开课日期" align="center">
                            <template slot-scope="scope">{{$$tools.format(scope.row.grade.start_time)}}</template>
                        </el-table-column>
                        <el-table-column label="任课老师/辅助老师" align="center">
                            <template slot-scope="scope">
                                <span>{{scope.row.grade.teachers.length && scope.row.grade.teachers[0].name}}</span>
                                <span v-if="scope.row.grade.counselors.length">/{{scope.row.grade.counselors[0].name}}</span>
                            </template>
                        </el-table-column>
                        <!-- <el-table-column label="总课时" align="center" prop="buy_lesson_num_total"></el-table-column> -->
                        <el-table-column label="已扣课时" align="center">
                            <template slot-scope="scope">
                                <span class="fc-m cursor-pointer" @click="lessonNumHandle(scope.row)">{{scope.row.lesson_num_already}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="已请假次数" align="center">
                            <template slot-scope="scope">
                                <span class="fc-m cursor-pointer" @click="leaveNumHandle(scope.row)">{{scope.row.leave_num}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="剩余课时" align="center">
                            <template slot-scope="scope">
                                <!-- <span >{{scope.row.buy_lesson_num_total - scope.row.lesson_num_already}}</span> -->
                                <span>{{scope.row.grade.lesson_num_remain}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" align="center">
                            <template slot-scope="scope">
                                <span class="fc-subm cursor-pointer" @click="gradeDivideClick('change', scope.row)">重新分班</span>
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

                <!-- 课程评价列表 -->
                <div v-else-if="activeTab == 'comment'" key="comment" class="course-comment">
                    <div v-if="courseCommentLists.length">
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
                    <div v-else class="d-f f-a-c f-j-c fc-7 nothing"><span>暂无数据</span></div>
                </div>
                <!-- 跟进列表 -->
                <div v-else key="follow_up">
                    <div class="followup-lists-box p-r">
                        <div class="add-followup p-a"><MyButton type="border" fontColor="fc-m" @click.native="addFollowUp">添加跟进</MyButton></div>
                        <div class="followup-lists">
                            <ul>
                                <li class="d-f" v-for="(list, index) in followUpLists.data" :key="index">
                                    <h5 class="fs-14">{{$$tools.format(list.created_at, 'second')}}</h5>
                                    <div class="content fs-15 pl-20 flex1">
                                        <a class="fc-m">【{{list.type_name}}】</a>
                                        <!--学员登记,顾问变更-->
                                        <p v-if="list.type_id === 1 || list.type_id === 3" class="pt-10">
                                            <span>跟进顾问：<i>{{list.advisor_name ? list.advisor_name : '无'}}</i></span>
                                            <span>操作人：<i>{{list.user_name}}</i></span>
                                        </p>
                                        <!--购课-->
                                        <p v-else-if="list.type_id === 2" class="pt-10">
                                            <span>购买课程：<i>{{list.course_name}}</i></span>
                                            <span>业绩归属：<i>{{list.advisor_name}}</i></span>
                                            <span>操作人：<i>{{list.user_name}}</i></span>
                                        </p>
                                        <!--续约-->
                                        <p v-else-if="list.type_id === 4" class="pt-10">
                                            <span>续约课程：<i>{{list.course_name}}</i></span>
                                            <span>业绩归属：<i>{{list.advisor_name}}</i></span>
                                            <span>操作人：<i>{{list.user_name}}</i></span>
                                        </p>
                                        <!--售前跟进，售后跟进-->
                                        <p v-else class="pt-10">
                                            <span>跟进形式：<i>{{list.way_name}}</i></span>
                                            <span>
                                                跟进结果：<i>{{list.status_name}}</i>
                                                <i v-if="list.status === 2">
                                                    (<i>{{$$tools.format(list.invited_at, 'second')}}</i>)
                                                </i>
                                                <i v-if="list.status === 4">
                                                    (<i>{{$$tools.format(list.listen.begin_time, 'second')}}</i>
                                                    <i class="pl-10">{{list.listen.grade_name}}</i>
                                                    <i class="pl-10">{{list.listen.teachers.length>0 ? list.listen.teachers[0].name : ''}}</i>)
                                                </i>
                                            </span>
                                            <span>跟进内容：<i>{{list.content}}</i></span>
                                            <span>操作人：<i>{{list.user_name}}</i></span>
                                        </p>
                                    </div>
                                </li>
                            </ul>
                            <el-pagination v-if="followUpLists.total"
                                class="d-f f-j-c mt-50 mb-20" 
                                :page-size="followUpLists.per_page" 
                                background layout="total, prev, pager, next" 
                                :total="followUpLists.total" 
                                :current-page="followUpLists.current_page" @current-change="paginationClick">
                            </el-pagination>
                        </div>
                    </div>
                </div>
            </div>
        </el-card>
        
        <!-- 学员修改弹窗 -->
        <el-dialog title="学员修改" width="790px" center :visible.sync="studentMaskStatus" :close-on-click-modal="false" @close="dialogClose('addStudent')">
            <el-form :model="studentForm" label-width="120px" size="small" ref="addStudent" class="form-box" :rules="detailRules">
                <div class="form-box">
                    <h3>家长信息</h3>
                    <el-row>
                        <el-col :span="13">
                            <el-form-item label="家长姓名：" prop="parent_name">
                                <el-input v-model.trim="studentForm.parent_name"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="4" :offset="1">
                            <el-form-item prop="relation" label-width="0">
                                <el-select v-model="studentForm.relation" placeholder="请选择">
                                    <el-option v-for="(item, index) in relationArr" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    
                    <el-row class="mt-10">
                        <el-col :span="13">
                            <el-form-item label="手机号码：" prop="mobile">
                                <el-input v-model.trim="studentForm.mobile"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="家庭住址：" class="mt-10" prop="address">
                        <el-col :span="20"><el-input v-model.trim="studentForm.address" placeholder="选填"></el-input></el-col>
                    </el-form-item>

                    <h3>学员信息</h3>
                    
                    <el-row>
                        <el-col :span="13">
                            <el-form-item label="学员姓名：" prop="student_name">
                                <el-input v-model.trim="studentForm.student_name"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="4" :offset="1">
                            <el-form-item prop="sex" label-width="0">
                                <el-select v-model="studentForm.sex" placeholder="选择性别">
                                    <el-option label="男" :value="1"></el-option>
                                    <el-option label="女" :value="0"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row class="mt-10">
                        <el-col :span="13">
                            <el-form-item label="出生日期：">
                                <el-date-picker v-model="studentForm.birthday" type="date" :picker-options="pickerBeginDateAfter" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>                    

                    <el-row class="mt-10">
                        <el-col :span="12">
                            <el-form-item label="分配顾问：">
                                <el-select v-model="studentForm.advisor_id" placeholder="选择顾问" clearable>
                                    <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="就读学校：" class="mt-10" prop="school_name">
                        <el-col :span="20"><el-input v-model.trim="studentForm.school_name" placeholder="选填"></el-input></el-col>
                    </el-form-item>

                    <div class="d-f f-j-c mt-50">
                        <MyButton @click.native="doneHandle('addStudent')" :loading="submitLoading.student">确定</MyButton>
                        <MyButton type="gray" class="ml-20" @click.native="deleteStudent">删除</MyButton>
                    </div>
                </div>
            </el-form>
        </el-dialog>
        
        <!-- 购买课程弹窗 -->
        <BuyCourseDialog :dialogStatus="dialogStatus.course" :buyCourseData="buyCourseData"
            @CB-contract="CB_contract" @CB-dialogStatus="CB_dialogStatus">
        </BuyCourseDialog>
        
        <!-- 购课合约弹窗 -->
        <ContractDialog :dialogStatus="dialogStatus.contract" :contractData="contractData" @CB-dialogStatus="CB_dialogStatus"></ContractDialog>

        <!-- 退费弹窗 -->
        <el-dialog title="退费" width="800px" center :visible.sync="quitCourseMaskStatus" :close-on-click-modal="false" @close="dialogClose('quitCourseForm')">
            <el-form label-width="110px" size="small" ref="quitCourseForm" :rules="quitCourseRules" :model="quitCourseForm">
                <div class="form-box">
                    <el-form-item label="上课学员：">{{studentDetail.name}}</el-form-item>
                    <el-form-item label="课程名称：">{{quitCourseInfo.course_name}}</el-form-item>
                    <el-row>
                        <el-col :span="6">
                            <el-form-item label="购买课时：">{{quitCourseInfo.lesson_num}}</el-form-item>
                            <el-form-item label="购买金额：">{{quitCourseInfo.real_price}}</el-form-item>
                        </el-col>
                        <el-col :span="7" :offset="1">
                            <el-form-item label="赠送课时：">{{quitCourseInfo.given_num}}</el-form-item>
                            <el-form-item label="课时单价：">{{quitCourseInfo.unit_price}}元/课</el-form-item>
                        </el-col>
                        <el-col :span="7" :offset="1">
                            <el-form-item label="剩余课时：">{{quitCourseInfo.lesson_num_remain}}</el-form-item>
                            <el-form-item label="剩余费用：">{{quitCourseInfo.remain_price}}</el-form-item>
                        </el-col>
                    </el-row>
                    <el-form-item label="实际退费：" prop="rel_remain">
                        <el-col :span="10">
                            <el-input placeholder="实际退费" v-model="quitCourseForm.rel_remain"></el-input>
                        </el-col>
                    </el-form-item>
                    <el-row class="mt-30">
                        <el-col :span="21">
                            <el-form-item label="退费说明：" prop="explain" class="textarea-cls">
                                <el-input type="textarea" :rows="4" placeholder="退费说明" v-model="quitCourseForm.explain"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <div class="d-f f-j-c mt-30"><MyButton @click.native="doneHandle('quitCourseForm')" :loading="submitLoading.quitCourse">确认</MyButton></div>
                </div>
            </el-form>
        </el-dialog>

        <!-- 分班弹窗 -->
        <el-dialog title="分班" width="800px" center :visible.sync="classMaskStatus" :close-on-click-modal="false" @close="dialogClose('divideGrade')">
            <div class="form-box divide-grade-dialog">
                <div v-for="(course, index) in gradeDivideLists.lists" :key="index" :class="{'mt-30': index}">
                    <div class="fc-m fs-16">{{course.name}}</div>
                    <div v-if="course.grade.length">
                        <el-radio-group v-model="divideClassRadio">
                            <ul class="d-f f-w-w">
                                <li v-for="(list, index) in course.grade" :key="index" class="fs-15 mr-30 mt-20">
                                    <el-radio :label="list.id">
                                        <span>{{list.name}}</span><span class="ml-20">{{list.join_num}}/{{list.limit_num}}</span>
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
        
        <!-- 邀约试听弹窗 -->
        <el-dialog title="试听" width="720px" center :visible.sync="maskAudition" :close-on-click-modal="false" @close="dialogClose('listen')">
            <div class="form-box">
               <el-row type="flex" justify="center">
                    <el-col :span="10">
                        <el-date-picker size="small" 
                            v-model="auditionData.time" type="date" 
                            value-format="timestamp" :clearable="false" 
                            :editable="false" placeholder="选择日期" 
                            @change="getListenLists"
                            :picker-options="pickListenDisable">
                        </el-date-picker>
                    </el-col>
                </el-row>
                <el-row type="flex" justify="center" class="mt-30">
                   <el-col :span="8">
                       <el-select v-model="auditionData.teacher_id" placeholder="请选择" size="small" @change="getListenCourseLists">
                            <el-option label="全部老师" value=""></el-option>
                            <el-option v-for="(item, index) in auditionData.teacher_lists" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                   </el-col>
                   <el-col :span="8" :offset="1">
                       <el-select v-model="auditionData.course_id" placeholder="请选择" size="small" @change="getListenCourseLists">
                            <el-option label="全部课程" value=""></el-option>
                            <el-option v-for="(item, index) in auditionData.course_lists" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                   </el-col>
                </el-row>
                <div v-if="listenCourseLists.length" class="listen-course-box mt-30">
                    <ul class="bgc-m audition-lists">
                        <li class="fc-7 cursor-pointer p-r" :class="{active: checkListen[0] === list.id}" v-for="(list, index) in listenCourseLists" :key="index" @click="listenCourseClick(list)">
                            <p class="fs-16 fc-2">{{list.course.name}}</p>
                            <p class="two-p mt-5 d-f f-a-c">
                                <span class="d-f f-a-c">
                                    <i class="time-icon"></i>
                                    <i class="pl-5">{{$$tools.formatTime(list.begin_time)}}-{{$$tools.formatTime(list.end_time)}}</i>
                                </span>
                                <span class="ml-30 d-f f-a-c">
                                    <i class="teacher-icon"></i>
                                    <i class="pl-5" :class="{'pl-10': key}" v-for="(item, key) in list.teacher" :key="key">{{item.name}}</i>
                                </span>
                                <span class="ml-30 d-f f-a-c">
                                    <i class="address-icon"></i>
                                    <i class="pl-5">{{list.class_room.name}}</i>
                                </span>
                            </p>
                            <p class="mt-5"><span>正式学员：<i>{{list.student_num}}/{{list.grade.limit_num}}</i></span><span class="pl-50">试听学员：{{list.listen_num}}</span></p>
                        </li>
                    </ul>
                </div>
                <div v-else class="bgc-m mt-30 d-f f-j-c f-a-c listen-nothing"><span class="fc-7">暂无数据</span></div>

                <div class="d-f f-j-c mt-50"><MyButton @click.native="listenDoneHandle" :loading="submitLoading.followUp">确定</MyButton></div>
            </div>
        </el-dialog>

        <!-- 添加跟进弹窗 -->
        <el-dialog title="添加跟进" width="600px" center :visible.sync="maskFollowUp" :close-on-click-modal="false" @close="dialogClose('followUpForm')">
            <el-form :model="followUpForm" label-width="125px" size="small" :rules="followUpRules" ref="followUpForm">
                <div class="form-box">
                    <el-form-item label="跟进方式：" prop="way_id" class="mt-30">
                        <el-select v-model="followUpForm.way_id" placeholder="请选择">
                            <el-option v-for="(item, index) in wayIdArr" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="跟进结果：" prop="status" class="mt-30">
                        <el-select v-model="followUpForm.status" placeholder="请选择" @change="followUpStatusChange">
                            <el-option v-for="(item, index) in resultArr" v-if="item.id != 3 && item.id != 5" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-form-item>
                    
                    <el-form-item v-if="followupStatus === 4 && checkListenCourse.timetable_id">
                        <span>试听课程：{{checkListenCourse.course_name}}</span>
                        <span class="ml-10">上课时间: {{checkListenCourse.begin_time}}</span>
                    </el-form-item>

                    <el-form-item v-if="followupStatus === 2" label="邀约到访时间：" prop="invited_at" class="mt-30">
                        <el-date-picker type="datetime" :editable="false" v-model="followUpForm.invited_at" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                    </el-form-item>

                    <el-form-item label="跟进内容：" prop="content" class="mt-30 textarea-cls">
                        <el-input type="textarea" :rows="4" v-model.trim="followUpForm.content" placeholder="请输入跟进内容"></el-input>
                    </el-form-item>

                    <el-form-item label="下次跟进：" class="mt-30"  >
                        <el-date-picker type="date" :editable="false" v-model="followUpForm.next_at" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                    </el-form-item>

                    <div class="d-f f-j-c mt-50"><MyButton @click.native="doneHandle('followUpForm')" :loading="submitLoading.followUp">确定</MyButton></div>
                </div>
            </el-form>
        </el-dialog>

        <!-- 班级信息列表，班级详情 -->
        <el-dialog title="班级详情" width="900px" center :visible.sync="gradeDetailMask" :close-on-click-modal="false" v-if="gradeDetail.grade" @close="gradeDetailDialogClose">
            <p class="fc-m fs-16 t-a-c">{{gradeDetail.grade.name}}</p>
            <div class="detail">
                <div class="detail-top">
                    <div class="d-f pb-15">
                        <ul class="detail-left">
                            <li>课程：<span>{{gradeDetail.course && gradeDetail.course.name}}</span></li>
                            <li>课时：<span>{{gradeDetail.grade.lesson_num}}课时</span></li>
                            <li>
                                任课老师：<span v-if="gradeDetail.grade.teachers && gradeDetail.grade.teachers.length">
                                    <i v-for="(teacher, index) in gradeDetail.grade.teachers" :key="index"><i v-if="index > 0">/</i>{{teacher.name}}</i>
                                </span>
                            </li>
                            <li>开课日期：<span>{{$$tools.format(gradeDetail.grade.start_time)}}</span></li>
                            <li>可否试听：<span>{{gradeDetail.grade.is_listen ? '是' : '否'}}</span></li>                       
                        </ul>
                        <ul class="flex1">
                            <li>人数上限：<span>{{gradeDetail.grade.limit_num}}</span></li>
                            <li>剩余课时：<span>{{gradeDetail.grade.lesson_num_remain}}</span></li>
                            <li>
                                辅助老师：<span v-if="gradeDetail.grade.counselors && gradeDetail.grade.counselors.length">
                                    <i v-for="(teacher, index) in gradeDetail.grade.counselors" :key="index"><i v-if="index > 0">/</i>{{teacher.name}}</i>
                                </span>
                            </li>
                            <li>上课教室：<span>{{gradeDetail.grade.room && gradeDetail.grade.room.name}}</span></li>
                        </ul>
                    </div>
                    <div class="mb-20 d-f">
                        <span class="fc-9">班级学员：</span>
                        <span class="d-f f-w-w flex1" v-if="gradeDetail.grade.student && gradeDetail.grade.student.length">
                            <i v-for="(student, index) in gradeDetail.grade.student" :key="index" :class="{'pl-20': index > 0}">{{student.name}}</i>
                        </span>
                    </div>
                </div>

                <div class="detail-bottom mt-40 p-r">
                    <div class="timetable-edit p-a cursor-pointer" @click="timetableEditClick">{{timetableCheckbox ? '取消' : '编辑'}}</div>
                    <el-table :data="gradeDetail.grade.timetable" v-if="gradeDetail.grade.timetable.length" height="280" ref="multipleTable">
                        <el-table-column type="selection" :selectable="checkboxIsDisabled" width="30" v-if="timetableCheckbox"></el-table-column>
                        <el-table-column label="序号" type="index" align="center"></el-table-column>
                        <el-table-column label="上课日期" align="center">
                            <template slot-scope="item">{{$$tools.courseTime(item.row.begin_time, item.row.end_time)}}</template>
                        </el-table-column>
                        <el-table-column label="上课时间" align="center">
                            <template slot-scope="item">{{$$tools.courseTime(item.row.begin_time, item.row.end_time, 'time')}}</template>
                        </el-table-column>
                        <el-table-column label="上课老师" align="center">
                            <template slot-scope="item">
                                <span v-if="item.row.teacher.length">
                                    <i v-for="(teacher, index) in item.row.teacher" :key="index"><i v-if="index > 0">/</i>{{teacher.name}}</i>
                                </span>
                            </template>
                        </el-table-column>
                        <el-table-column label="上课学员" prop="students" align="center"></el-table-column>
                        <el-table-column label="结课状态" align="center">
                            <template slot-scope="item">{{item.row.lesson_end_time ? '已结课' : '未结课'}}</template>
                        </el-table-column>
                    </el-table>

                    <div class="d-f f-j-c mt-20" v-if="timetableCheckbox"><MyButton @click.native="deleteTimeTableHandle(gradeDetail.grade.timetable)" :type="deleteTimeTableLists.length ? 'main' : 'gray'">删除</MyButton></div>
                </div>
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
    </div>
</template>

<script>
import TableHeader  from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'
import {StudentStatic, timeTableStatic} from '../../script/static'
import Bus from '../../script/bus'

import BuyCourseDialog from '../../components/dialog/BuyCourse'
import ContractDialog from '../../components/dialog/Contract'

export default {
    data() {
        return {
            submitLoading: {
                student: false, gradeDivide: false, followUp: false, quitCourse: false
            },
            studentId: '',     //学员id
            studentDetail: {},
            contractData: {},  //合约详情

            deleteTimeTableLists: [],    //删除课表，选中的课表
            timetableCheckbox: false,    //班级详情删除课表，checkbox是否显示

            quitCourseLists: {},   //退费课程列表
            courseTimeTable: {},   //课程表
            courseCommentLists: {},   //课评列表
            followUpLists: {},   //跟进列表

            listenType: '',   //试听类型，直接试听、跟进邀约试听
            listenCourseLists: [],   //试听课程列表
            checkListenCourse: {timetable_id: '', course_name: '', begin_time: ''},  //试听课程，跟进form显示
            checkListen: [],

            buyCourseData: {},
            auditionData: {time: new Date().getTime(), teacher_lists: [], course_lists: [], teacher_id: '', course_id: ''},   //试听数据

            gradeDivideLists: {
                lists: [],
                disabled: false
            },    //分班，课程班级列表
            divideClassRadio: '',    //分班单选列表，选中的班级id
            divideClassType: 'add',    //分班类型 默认add
            original_grade_id: '',   //原本分班id

            gradeDetail: {},   //班级详情
            gradeName: '',   //班级名称
            lessonNumDetail: [],   //已扣课时详情列表
            leaveNumDetail: [],   //请假详情列表

            gradeDetailMask: false,
            lessonNumDetailMask: false,
            leaveNumDetailMask: false,

            activeTab: 'course_info',  //tab列表选中key

            dialogStatus: {student: false, course: false, contract: false},

            classMaskStatus: false,  //分班弹窗
            quitCourseMaskStatus: false, //退费弹窗
            maskFollowUp: false,   //添加跟进弹窗
            studentMaskStatus: false,//  修改基本信息弹窗
            maskAudition: false,  //邀约试听弹窗
            followupStatus: '',   //跟进结果
            paymentMethod: StudentStatic.paymentMethod, //付款方式
            resultArr: StudentStatic.followUp.status,
            wayIdArr: StudentStatic.followUp.wayId,
            relationArr: StudentStatic.relation,
            timeTableStatic: timeTableStatic.status,   //上课状态
            
            quitCourseInfo: {},   //退费课程详细数据
            tabLists: [{type: 'course_info', name: '课程信息'}, {type: 'grade', name: '班级信息'}, {type: 'comment', name: '课评信息'}, {type: 'follow_up', name: '跟进记录'}],

            quitCourseForm: {
                rel_remain: '',
                explain: ''
            },
            quitCourseRules: {
                rel_remain: [
                    {required: true, message: '请输入实际退费金额'},
                    {validator: this.$$tools.formOtherValidate('price')}
                ],
                explain: [
                    {max: 200, message: '最多输入200个字符'}
                ]
            },
            studentForm: { id: '', student_name: '', parent_name: '', relation: '', mobile: '', address: '', sex: '', birthday: '', school_name: '', advisor_id: ''},
            followUpForm: {
                way_id: '',   //跟进方式
                status: '',   //跟进结果
                invited_at: '',   //邀约时间
                content: '',   //跟进内容
                next_at: ''
            },
            detailRules: {
                parent_name: [
                    {required: true, message: '请输入家长姓名'},
                    {max: 7, message: '长度不能超过7个字符'}
                ],
                relation: [
                    {required: true, message: '请选择关系', trigger: 'change'}
                ],
                mobile: [
                    {required: true, message: '请输入家长电话'},
                    {validator: this.$$tools.formValidate('phone')}
                ],
                address: [
                    {max: 50, message: '长度不能超过50个字符'}
                ],
                school_name: [
                    {max: 20, message: '长度不能超过20个字符'}
                ],
                student_name: [
                    {required: true, message: '请输入学员姓名'},
                    {max: 7, message: '长度不能超过7个字符'}
                ],
                sex: [
                    {required: true, message: '请选择性别', trigger: 'change'}
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
        }
    },
    methods: {
        dialogClose(form) {
            if(form === 'listen') {
                this.checkListen = [];
                this.listenCourseLists = [];
                this.auditionData = {
                    time: new Date().getTime(),
                    teacher_lists: [],
                    course_lists: [],
                    teacher_id: '',
                    course_id: ''
                };
            }else if(form === 'followUpForm') {
                this.listenCourseInit();
                this.$refs[form].resetFields();
            }else if(form === 'divideGrade') {
                this.divideClassRadio = '';
            }else this.$refs[form].resetFields();
        },
        gradeDetailDialogClose() {
            this.timetableCheckbox = false;
        },
        timetableEditClick() {
            this.timetableCheckbox = !this.timetableCheckbox;
            if(!this.timetableCheckbox) this.$refs.multipleTable.clearSelection();
        },
        handleSelectionChange(val) {
            console.log(val);
            this.deleteTimeTableLists = val;
        },
        checkboxIsDisabled(row, index) {
            return row.lesson_end_time == 0;
        },
        async deleteTimeTableHandle(data) {
            if(!this.deleteTimeTableLists.length) return 0;
            let timetableLists = this.deleteTimeTableLists.map(v => {return v.id});

            let result = await this.$$request.post('api/timetable/deleteAll', {id: timetableLists});
            console.log(result);
            if(!result) return 0;
    
            if(result.status == 1) {
                this.$message.success('删除成功');
                timetableLists.forEach(v => {
                    data.forEach((k, n) => {if(k.id == v) data.splice(n, 1)});
                });

                this.timetableCheckbox = false;
                this.deleteTimeTableLists = [];
            }else {
                this.$message.warning('删除失败');
            }
        },
        //课程信息列表查看合约
        async showContract(data) {
            let result = await this.$$request.get('api/studentCourse/detail', {sc_id: data.id});
            console.log(result);
            if(!result) return 0;
            this.contractData = result.data
            this.dialogStatus.contract = true;
        },
        //弹窗变比，改变dialog状态回调
        CB_dialogStatus(type) {
            if(type == 'course') {
                this.buyCourseData = {};
                this.dialogStatus.course = false;
                return 0;
            };
            if(type == 'contract') {
                this.contractData = {};
                this.dialogStatus.contract = false;
                return 0;
            };
        },
        //购课成功，合约回调
        CB_contract(data) {
            this.contractData = data;
            this.getBottomTabLists('api/studentCourse/normalLists', 'quitCourseLists');
            this.dialogStatus.course = false;
            this.dialogStatus.contract = true;
        },
        //添加跟进
        addFollowUp() {
            for(let key in this.followUpForm) this.followUpForm[key] = '';
            this.followupStatus = '';
            this.listenType = 'followup';    //添加跟进，直接修改试听类型为跟进，即便不选择试听，也不影响
            this.maskFollowUp = true;
        },
        //跟进结果选择 
        followUpStatusChange(value) {
            this.followupStatus = value;
            if(value === 4) {               
                this.getListenLists();
                this.maskAudition = true;
            }else {
                this.listenCourseInit();
            }
        },
        //添加试听
        addListenHandle() {
            this.listenType = 'default';
            this.getListenLists();
            this.maskAudition = true;
        },
        //试听课程列表点击
        listenCourseClick(list) {
            let index = this.checkListen.indexOf(list.id);

            if(index === -1) {
                if(this.checkListen.length) return this.$message.warning('最多选择一个');
                this.checkListen.push(list.id);
            }
            else this.checkListen.splice(index, 1);
        },
        //试听跟进弹窗关闭，数据重置
        listenCourseInit() {
            this.auditionData = {
                time: new Date().getTime(),
                teacher_lists: [],
                course_lists: [],
                teacher_id: '',
                course_id: ''
            };
            this.checkListen = [];
            this.listenCourseLists = [];
            Object.keys(this.checkListenCourse).forEach(v => {this.checkListenCourse[v] = ''});
        },
        //添加分班
        gradeDivideClick(type, data) {
            this.divideClassType = type;
            if(type === 'add') this.getStudentGradeLists('api/sign/courseLists');
            else {
                this.divideClassRadio = data.grade_id;
                this.original_grade_id = data.grade_id;
                this.getStudentGradeLists('api/sign/gradeLists', data);
            }
        },
        //分班确定按钮
        divideClassDone(disabled) {
            if(disabled) return 0;
            if(!this.divideClassRadio) return this.$message.warning('请选择班级');
            
            this.gradeDivideLists.lists.forEach(v => {
                v.grade.forEach(d => {
                    if(d.id == this.divideClassRadio) {
                        if(d.join_num >= d.limit_num && v.type === 1) {
                            this.$confirm('学员数量已经超过上限，是否继续添加?', '提示', {
                                confirmButtonText: '确定',
                                cancelButtonText: '取消',
                                type: 'warning'
                            }).then(() => {
                                this.submitClassRoomHandle();
                            }).catch(() => {return 0});
                        }else {
                            this.submitClassRoomHandle();
                        }
                    }
                });
            })
        },
        //提交分班数据
        submitClassRoomHandle() {
            if(this.divideClassType === 'add') {
                this.submitDivideClass('api/studentGrade/add', {student_id: this.studentId, grade_id: this.divideClassRadio});
            }else {
                this.submitDivideClass('api/studentGrade/change', {
                    student_id: this.studentId,
                    original_grade_id: this.original_grade_id,
                    target_grade_id: this.divideClassRadio
                });
            }
        },
        //班级信息，班级详情
        gradeDetailHandle(data) {
            console.log(data);
            this.gradeDetail = data;
            this.gradeDetailMask = true;
        },
        //班级信息，已扣课时点击
        lessonNumHandle(data) {
            console.log(data);
            this.lessonNumDetail = data.lesson_num_reduce;
            this.gradeName = data.grade.name;
            this.lessonNumDetailMask = true;
        },
        //班级信息，已请假次数点击
        leaveNumHandle(data) {
            this.leaveNumDetail = data.leave_tickets;
            this.gradeName = data.grade.name;
            this.leaveNumDetailMask = true;
        },
        //购课
        buyCourse() {
            console.log(this.studentDetail)
            this.dialogStatus.course = true;
            this.buyCourseData = this.studentDetail;
        },
        //上课状态转换
        timeTableStatus(status) {
            let str = '';
            this.timeTableStatic.forEach(v => {
                if(v.id == status) str = v.name;
            });
            return str;
        },
        //编辑
        editDetail() {
            this.studentForm.id = this.studentDetail.id;
            this.studentForm.student_name = this.studentDetail.name;
            this.studentForm.birthday = this.studentDetail.birthday > 0 ? this.studentDetail.birthday * 1000 : '';
            this.studentForm.mobile = this.studentDetail.parent_info.mobile;
            this.studentForm.parent_name = this.studentDetail.parent_info.name;
            this.studentForm.relation = this.studentDetail.parent_info.relation;
            this.studentForm.address = this.studentDetail.parent_info.address;
            this.studentForm.sex = this.studentDetail.sex;
            this.studentForm.school_name = this.studentDetail.school_name;
            this.studentForm.advisor_id = this.studentDetail.advisor_id == 0 ? '' : this.studentDetail.advisor_id;

            this.studentMaskStatus = true;
        },
        //删除学员
        deleteStudent() {
            this.$confirm('确定删除该学员吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteHandle();
            }).catch(() => {return 0});
        },
        async deleteHandle() {
            let result = await this.$$request.post('api/sign/delete', {id: this.studentId});
            if(!result) return 0;
            if(result.status) {
                Bus.$emit('refreshStudentLists');
                this.$router.go(-1);
            }
        },
        //退费按钮点击
        quitCourse(data) {
            console.log(data);
            this.quitCourseInfo = data;
            let lesson_num_remain = this.quitCourseInfo.lesson_num_remain - this.quitCourseInfo.given_num;
            lesson_num_remain = lesson_num_remain <= 0 ? 0 : lesson_num_remain;

            this.quitCourseInfo.remain_price = (+(this.quitCourseInfo.unit_price) * lesson_num_remain).toFixed(2);
            
            this.quitCourseMaskStatus = true;
        },
        //试听确定
        listenDoneHandle() {
            if(!this.checkListen.length) return this.$message.warning('试听课程不能为空!');

            if(this.listenType == 'default') {
                this.followUpForm.way_id = 5;
                this.followUpForm.status = 4;
                this.followUpForm.content = '无跟进内容记录';

                this.submitFollowUpInfo();
            }else {
                this.listenCourseLists.forEach(v => {
                    if(v.id === this.checkListen[0]) {
                        this.checkListenCourse.timetable_id = v.id;
                        this.checkListenCourse.course_name = v.course.name;
                        this.checkListenCourse.begin_time = this.$$tools.formatTime(v.begin_time);
                    }
                });
            }

            this.listenCourseLists = [];    //试听课程列表重置
            this.maskAudition = false;
        },
        //表单确定
        doneHandle(type) {
            this.$refs[type].validate(valid => {if(valid) {
                if(type === 'followUpForm') this.submitFollowUpInfo();
                else if(type === 'addStudent') this.submitStudentInfo();
                else if(type === 'quitCourseForm') this.submitQuitCourse();
            }});
        },
        //tab列表数据分页
        paginationClick(currentPage) {
            let url = '', data = '';
            switch(this.activeTab) {
                case 'course_info':
                    url = 'api/studentCourse/normalLists';
                    data = 'quitCourseLists';
                    break;
                case 'grade':
                    url = 'api/sign/timetable';
                    data = 'courseTimeTable';
                    break;
                case 'comment':
                    url = 'api/sign/comment';
                    data = 'courseCommentLists';
                    break;
                case 'follow_up':
                    url = 'api/followUp/lists';
                    data = 'followUpLists';
                    break;
            };
            this.getBottomTabLists(url, data, currentPage);
        },
        //提交退费数据
        async submitQuitCourse() {
            if(this.submitLoading.quitCourse) return 0;
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
                rel_remain: this.quitCourseForm.rel_remain,
                explain: this.quitCourseForm.explain
            };

            console.log(params)
            
            let result = await this.$$request.post('api/quitCourse/add', params);
            this.submitLoading.quitCourse = false;
            console.log(result);
            if(!result) return 0;
            this.$message.success('退费成功');
            this.getBottomTabLists('api/studentCourse/normalLists', 'quitCourseLists');
            this.quitCourseMaskStatus = false;
        },
        //提交学员信息
        async submitStudentInfo() {
            if(this.submitLoading.student) return 0;
            this.submitLoading.student = true;

            let params = {};
            for(let key in this.studentForm) {
                params[key] = key == 'birthday' ? this.studentForm[key] / 1000 : this.studentForm[key];
            };

            let result = await this.$$request.post('api/sign/edit', params);
            this.submitLoading.student = false;
            console.log(result);
            if(!result) return 0;

            this.$message.success('修改成功');
            this.studentMaskStatus = false;
            this.getStudentDetail(this.studentForm.id);
            Bus.$emit('refreshStudentLists');
        },
        //提交分班信息
        async submitDivideClass(url, params) {
            if(this.submitLoading.gradeDivide) return 0;
            this.submitLoading.gradeDivide = true;

            console.log(params)
            let result = await this.$$request.post(url, params);
            this.submitLoading.gradeDivide = false;
            if(!result) return 0;
            
            this.getBottomTabLists('api/studentGrade/lists', 'courseTimeTable');
            this.$message.success('分班成功');
            this.classMaskStatus = false;
        },
        //提交跟进
        async submitFollowUpInfo() {
            for(let key in this.followUpForm) {if(key == 'invited_at' || key == 'next_at') this.followUpForm[key] = this.followUpForm[key] / 1000};
            
            if(this.followupStatus === 4 && !this.checkListenCourse.timetable_id) return this.$message.warning('邀约试听，试听课程不能为空!');


            if(this.submitLoading.followUp) return 0;
            this.submitLoading.followUp = true;

            let params = {...this.followUpForm, type_id: 6, student_id: this.studentId};  //type_id默认售前跟进5

            if(this.listenType == 'default' && this.checkListen.length) {
                params.timetable_id = this.checkListen[0];
            }else if(this.checkListenCourse.timetable_id) params.timetable_id = this.checkListenCourse.timetable_id;

            console.log(params);

            let result = await this.$$request.post('api/followUp/add', params);  //type_id默认售后跟进6
            this.submitLoading.followUp = false;
            console.log(result);
            if(!result) return 0;
            this.$message.success('添加成功');

            this.maskFollowUp = false;
            this.maskAudition = false;

            this.listenCourseInit();
            for(let key in this.followUpForm) this.followUpForm[key] = '';
            this.getBottomTabLists('api/followUp/lists', 'followUpLists');
        },
        //获取学员详情
        async getStudentDetail() {
            let result = await this.$$request.post('api/student/detail', {id: this.studentId});
            console.log(result);
            if(!result) return 0;
            this.$set(this, 'studentDetail', result.detail);
            this.getTabLists();
        },
        //课程列表，点击分班，获取班级列表
        async getStudentGradeLists(url, data) {
            let params = this.divideClassType === 'add' ? {student_id: this.studentId} : {id: data.course.id};
            let result = await this.$$request.post(url, params);
            console.log(result);
            if(!result) return 0;

            if(this.divideClassType === 'add') {
                if(!result.lists.length) return this.$message.warning('没有可分班的课程!');
                this.gradeDivideLists.lists = result.lists;
                this.gradeDivideLists.disabled = result.lists.every(k => {return k.grade.length ? false : true});
            }else {
                let courseObj = [{grade: result.lists || [], id: data.course.id, name: data.course.name}];
                this.gradeDivideLists.lists = courseObj;
            }

            this.classMaskStatus = true;
        },
        //获取底部tab四个列表的数据
        getTabLists() {
            let requestUrl = [
                {url: 'api/studentCourse/normalLists', data: 'quitCourseLists'},
                {url: 'api/studentGrade/lists', data: 'courseTimeTable'},
                {url: 'api/sign/comment', data: 'courseCommentLists'},
                {url: 'api/followUp/lists', data: 'followUpLists'},
            ];
            requestUrl.forEach(d => {this.getBottomTabLists(d.url, d.data)});
        },
        //获取4个列表方法
        async getBottomTabLists(url, data, currentPage) {
            let params = {student_id: this.studentId};
            if(currentPage) params.page = currentPage;
            let result = await this.$$request.post(url, params);
            console.log(result);
            if(!result) return 0;
            if(data === 'courseCommentLists') result.lists.forEach(v => {
                v.pic = v.pic ? v.pic.split(',') : [];
                v.imageMore = false;
            });
            this[data] = result.lists;
        },
        //获取试听填充列表
        async getListenLists() {
            let old_time = Math.round(this.auditionData.time / 1000);

            let result = await this.$$request.post('api/listenCourse/fill', {start_time: old_time});
            console.log(result);
            if(!result) return 0;
            this.auditionData.teacher_lists = result.teacher;
            this.auditionData.course_lists = result.course;
            this.getListenCourseLists();
        },
        //获取试听课程列表
        async getListenCourseLists() {
            let old_time = Math.round(this.auditionData.time / 1000);

            let params = {
                time: old_time,
                teacher_id: this.auditionData.teacher_id,
                course_id: this.auditionData.course_id
            };

            let result = await this.$$request.post('api/listenCourse/lists', {data: params});
            console.log(result);
            if(!result) return 0;
            this.listenCourseLists = result.lists;
        }
    },
    created() {
        this.studentId = this.$route.query.id;
        this.getStudentDetail();
    },
    components: {TableHeader, MyButton, BuyCourseDialog, ContractDialog}
}
</script>

<style lang="less" scoped>
    .table-header {
        height: 50px;
        border-bottom: 1px #e3e3e3 solid;
        img {
            display: block;
        }
    }
    .detail-box {
        padding: 20px;
        p:not(:first-child){
            margin-top: 15px;
        }
        span {
            margin-right: 20px;
            i {
                color: #222;
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
    .followup-lists-box {
        // overflow-y: scroll;
        // max-height: 450px;
        .followup-lists {
            padding: 30px;
            h5 {
                font-weight: normal;
                width: 150px;
            }
            ul li {
                &:not(:first-child) {
                    .content, h5 {
                        padding-top: 40px;
                    }
                }
                p span {
                    padding-right: 30px;
                }
            }
            .content {
                border-left: 1px #e3e3e3 solid;
            }
        }
        .add-followup {
            top: 0;
            right: 0;
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
    .detail {
        .detail-left {
            width: 400px;
        }
        .detail-top {
            padding: 0 60px;
            ul li {
                margin-top: 20px;
                color: #999999;
                span {
                    color: #222222;
                }
            }
        }
        .detail-bottom {
            border-top: 1px #e3e3e3 dotted;
            ul li {
                margin-top: 20px;
            }
            .timetable-edit {
                border: 1px #45DAD5 solid;
                text-align: center;
                width: 60px;
                line-height: 30px;
                height: 30px;
                box-sizing: border-box;
                right: 10px;
                top: -40px;
                color: #45DAD5;
                border-radius: 5px;
            }
        }
    }
</style>


