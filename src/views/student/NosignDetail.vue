<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader :title="detail.name" :icon="true" @clicked="editDetail">
                <MyButton class="ml-20" @click.native="addListenHandle">试听</MyButton>
                <MyButton class="ml-20" type="subm" @click.native="buyCourse">购课</MyButton>
            </TableHeader>
            <div class="detail-box fc-9">
                <p>
                    <span>学员编号：<i>0{{detail.id}}</i></span>
                    <span>性别：<i>{{detail.sex ? '男' : '女'}}</i></span>
                    <span>出生日期：<i>{{detail.birthday > 0 ? $$tools.format(detail.birthday) : ''}}</i></span>
                </p>
                <p v-if="detail.parent_info">
                    <span>家长：<i>{{detail.parent_info.name}}</i><i>({{detail.parent_info.relation == 1 ? '母亲' : detail.parent_info.relation == 2 ? '父亲' : '其他'}})</i></span>
                    <span>联系电话：<i>{{detail.parent_info.mobile}}</i></span>
                </p>

                <p v-if="detail.parent_info"><span>家庭住址：<i>{{detail.address}}</i></span></p>
                <p><span>学员备注：<i>{{detail.remark}}</i></span></p>
            </div>
        </el-card>

        <el-card class="detail-bottom mt-20" shadow="hover">
            <TableHeader title="跟进记录">
                <MyButton class="ml-20" @click.native="addFollowUp">添加跟进</MyButton>
            </TableHeader>

            <div class="followup-lists-box" v-loading="loading">
                <div class="followup-lists" v-if="followUpLists.total">
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
                        :current-page="followUpLists.current_page" 
                        @current-change="paginationClick"
                        @next-click="nextClick"
                        @prev-click="prevClick">
                    </el-pagination>
                </div>
                <div v-else class="d-f f-a-c f-j-c fc-5 nothing"><span>暂无数据</span></div>
            </div>
        </el-card>

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
                <div v-else class="bgc-m mt-30 d-f f-j-c f-a-c listen-nothing"><span class="fc-5">暂无数据</span></div>

                <div class="d-f f-j-c mt-50"><MyButton @click.native="listenDoneHandle">确定</MyButton></div>
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
                            <el-option v-for="(item, index) in resultArr" :key="index" :label="item.name" :value="item.id"></el-option>
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
                        <el-input type="textarea" :rows="6" v-model.trim="followUpForm.content" placeholder="请输入跟进内容"></el-input>
                    </el-form-item>

                    <el-form-item label="下次跟进：" class="mt-30"  >
                        <el-date-picker type="date" :editable="false" v-model="followUpForm.next_at" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                    </el-form-item>

                    <div class="d-f f-j-c mt-50"><MyButton @click.native="doneHandle('followUpForm')">确定</MyButton></div>
                </div>
            </el-form>
        </el-dialog>

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
                    

                    <el-form-item label="就读学校：" class="mt-10" prop="school_name">
                        <el-col :span="20"><el-input v-model.trim="studentForm.school_name" placeholder="选填"></el-input></el-col>
                    </el-form-item>

                    <el-row class="mt-10">
                        <el-col :span="12">
                            <el-form-item label="意向课程：">
                                <el-select v-model="studentForm.like_course" placeholder="选择课程">
                                    <el-option v-for="(item, index) in fillInfo.course" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" :offset="1">
                            <el-form-item label-width="0">
                                <el-select v-model="studentForm.like_grade" placeholder="选择意向度">
                                <el-option v-for="(item, index) in likeGrade" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-row class="mt-10">
                        <el-col :span="12">
                            <el-form-item label="渠道信息：" prop="source_id">
                                <el-select v-model="studentForm.source_id" placeholder="请选择">
                                    <el-option v-for="(item, index) in fillInfo.source" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="2"  class="add-source cursor-pointer ml-20" @click.native="addSource">
                            <img src="../../images/common/add.png" alt="">
                        </el-col>
                    </el-row>

                    <el-row class="mt-10">
                        <el-col :span="12">
                            <el-form-item label="分配顾问：">
                                <el-select v-model="studentForm.advisor_id" placeholder="选择顾问">
                                    <el-option v-for="(item, index) in fillInfo.advisor" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="备注：" prop="remark" class="mt-10 textarea-cls">
                        <el-col :span="20">
                            <el-input type="textarea" :rows="4" placeholder="请输入备注信息" v-model.trim="studentForm.remark"></el-input>
                        </el-col>
                    </el-form-item>

                    <div class="d-f f-j-c mt-50">
                        <MyButton @click.native="doneHandle('addStudent')">确定</MyButton>
                        <MyButton type="gray" class="ml-20" @click.native="deleteStudent">删除</MyButton>
                    </div>
                </div>
            </el-form>

            <el-dialog title="添加渠道" width="500px" center :visible.sync="sourceMaskStatus" :close-on-click-modal="false" @close="dialogClose('sourseForm')" append-to-body>
                <el-form :model="sourceForm" label-width="100px" size="small" :rules="sourceRules" ref="sourseForm">
                    <el-form-item label="渠道来源：" prop="name">
                        <el-input v-model.trim="sourceForm.name" placeholder="渠道名称"></el-input>
                    </el-form-item>
                </el-form>
                <div class="d-f f-j-c mt-50"><MyButton @click.native="doneHandle('sourseForm')">确定</MyButton></div>
            </el-dialog>
        </el-dialog>

        <!-- 购买课程弹窗 -->
        <el-dialog title="购买课程" width="1100px" center :visible.sync="courseMaskStatus" :close-on-click-modal="false" @close="dialogClose('courseForm')">
            <el-form :model="courseForm" label-width="95px" size="small" :rules="courseRules" ref="courseForm">
                <div class="form-box">
                    <p class="head-info">购买信息</p>
                    <el-row class="mt-10">
                        <el-col :span="7">
                            <el-form-item label="选择课程：" prop="course_id">
                                <el-select v-model="courseForm.course_id" placeholder="选择课程" @change="addCourseChange">
                                    <el-option v-for="(item, index) in buyCourseLists" :key="index" :label="item.name" :value="item.id"></el-option>
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

                    <div class="pl-90">业绩归属：<span>{{detail.advisor_info && detail.advisor_info.name}}</span></div>

                    <div class="mt-10 pl-10">总金额：<span class="fc-m fs-22">￥{{courseForm.unit_price * courseForm.lesson_num - courseForm.preferential_price}}</span></div>

                    <div class="d-f f-j-c mt-30">
                        <MyButton @click.native="doneHandle('courseForm')">提交生成合约</MyButton>
                    </div>
                </div>
            </el-form>
        </el-dialog>

        <!-- 购课合约弹窗 -->
        <el-dialog title="购课合约" width="800px" center :visible.sync="contractMaskStatus" :close-on-click-modal="false">
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
    </div>
</template>

<script>
import TableHeader  from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'
import {StudentStatic} from '../../script/static'
import Bus from '../../script/bus'
import Tools from '../../script/tools'

export default {
    data() {
        return {
            detail: {},
            studentId: '',
            fillInfo: {},
            loading: true,

            listenType: '',   //试听类型，直接试听、跟进邀约试听
            listenCourseLists: [],   //试听课程列表
            checkListenCourse: {timetable_id: '', course_name: '', begin_time: ''},  //试听课程，跟进form显示
            checkListen: [],

            currPage: false,

            auditionData: {time: new Date().getTime(), teacher_lists: [], course_lists: [], teacher_id: '', course_id: ''},   //试听数据
            contractData: {},  //合约数据
            maskAudition: false, //试听弹窗
            maskFollowUp: false,   //跟进弹窗
            studentMaskStatus: false,  //学员修改弹窗
            courseMaskStatus: false,  //购买课程弹窗
            contractMaskStatus: false, //购课合约弹窗
            sourceMaskStatus: false, //添加渠道弹窗
            followupStatus: '',   //跟进结果
            wayIdArr: StudentStatic.followUp.wayId,
            resultArr: StudentStatic.followUp.status,
            relationArr: StudentStatic.relation,
            likeGrade: StudentStatic.likeGrade,
            paymentMethod: StudentStatic.paymentMethod, //付款方式
            followUpLists: [],   //跟进列表
            buyCourseLists: [],   //购买课程，课程列表
            followUpForm: {
                way_id: '',   //跟进方式
                status: '',   //跟进结果
                invited_at: '',   //邀约时间
                content: '',   //跟进内容
                next_at: ''
            },
            courseForm: {
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
            studentForm: {
                id: '',
                student_name: '',
                parent_name: '',
                relation: '',
                mobile: '',
                address: '',
                sex: '',
                birthday: '',
                like_course: '',
                like_grade: '',
                source_id: '',   //渠道id
                advisor_id: '',    //顾问id
                remark: '',   //备注信息
                school_name: ''
            },
            sourceForm: {name: ''},
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
            detailRules: {
                parent_name: [
                    {required: true, message: '请输入家长姓名'},
                    {max: 7, message: '长度不能超过7个字符'}
                ],
                relation: [
                    {required: true, message: '请选择关系', trigger: 'change'}
                ],
                address: [
                    {max: 50, message: '长度不能超过50个字符'}
                ],
                school_name: [
                    {max: 20, message: '长度不能超过20个字符'}
                ],
                mobile: [
                    {required: true, message: '请输入家长电话'},
                    {validator: this.$$tools.formValidate('phone')}
                ],
                student_name: [
                    {required: true, message: '请输入学员姓名'},
                    {max: 7, message: '长度不能超过7个字符'}
                ],
                sex: [
                    {required: true, message: '请选择性别', trigger: 'change'}
                ],
                source_id: [
                    {required: true, message: '请选择渠道信息', trigger: 'change'}
                ],
                remark: [
                    {max: 50, message: '长度不能超过50个字符'}
                ]
            },
            sourceRules: {  
                name: [
                    {required: true, message: '请输入渠道'},
                    {max: 20, message: '长度不能超过20个字符'}
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
                    {max: 200,  message: '最多输入200字符'}
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
            }else this.$refs[form].resetFields();
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
        //购买课程，选择课程change
        addCourseChange(val) {
            this.buyCourseLists.forEach(v => {
                if(v.id == val) {
                    this.courseForm.expire = v.expire;
                    this.courseForm.leave_num = v.leave_num;
                    this.courseForm.unit_price = v.unit_price;
                }
            });
        },
        //添加试听
        addListenHandle() {
            this.listenType = 'default';
            this.getListenLists();
            this.maskAudition = true;
        },
        //试听课程列表点击
        listenCourseClick(list) {
            console.log(list);
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
        //合约确定按钮，跳转签约学员详情
        goSignedLists() {
            this.contractMaskStatus = false;
            this.$router.replace({path: '/student/signeddetail', query: {id: this.studentId}});
        },
        //打印合同
        printCompact() {
            this.$router.push({name: 'contractView', params: {contractData: this.contractData, replace_path: '/student/signeddetail', path_query: {id: this.studentId}}});
        },
        //购课
        buyCourse() {
            this.courseForm.expire = 12;
            this.courseForm.pay_at = new Date().getTime();
            this.courseMaskStatus = true;
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
                else if(type === 'courseForm') this.submitBuyCourse();
                else this.submitSourceInfo();
            }});
        },
        nextClick(currentPage) {
            this.currPage = true;
            this.getFollowUpLists(currentPage);
        },
        prevClick(currentPage) {
            this.currPage = true;
            this.getFollowUpLists(currentPage);
        },
        //跟进分页
        paginationClick(currentPage) {
            if(!this.currPage) this.getFollowUpLists(currentPage);
            this.currPage = false;
        },
        //编辑
        editDetail() {
            for(let key in this.detail) {
                if(key == 'address' || key == 'remark' || key == 'school_name' || key == 'source_id' || key == 'sex' || key == 'id') {
                    this.studentForm[key] = this.detail[key];
                }else if(key == 'birthday') {
                    this.studentForm[key] = this.detail[key] > 0 ? this.detail[key] * 1000 : '';
                }else if(key == 'parent_info') {
                    this.studentForm.mobile = this.detail[key].mobile;
                    this.studentForm.parent_name = this.detail[key].name;
                    this.studentForm.relation = this.detail[key].relation;
                }else if(key == 'name') this.studentForm.student_name = this.detail[key]
                else if(key == 'advisor_id' || key == 'like_course' || key == 'like_grade') {
                    this.studentForm[key] = this.detail[key] == 0 ? '' : this.detail[key];
                }
            }
            
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
            let result = await this.$$request.post('api/student/delete', {id: this.detail.id});
            if(!result) return 0;
            if(result.status) {
                Bus.$emit('refreshStudentLists');
                this.$router.go(-1);
            }
        },
        addSource() {
            this.sourceForm.name = '';
            this.sourceMaskStatus = true;
        },
        //提交购课信息
        async submitBuyCourse() {
            if(this.courseForm.lesson_num_already > this.courseForm.lesson_num) return this.$message.warning('已扣课时数不能超过购买课时数!');
            if(this.courseForm.leave_num > this.courseForm.lesson_num) return this.$message.warning('请假次数不能超过购买课时数!');
            if(this.courseForm.preferential_price > this.courseForm.unit_price * this.courseForm.lesson_num) return this.$message.warning('优惠不能超过总金额!');
            let params = {};
            for(let key in this.courseForm) {
                if(typeof this.courseForm[key] === 'undefined') params[key] = '';
                else params[key] = key == 'pay_at' ? this.courseForm[key] / 1000 : this.courseForm[key];
            }
            console.log(params)

            let result = await this.$$request.post('api/studentCourse/add', {...params, student_id: this.detail.id, parent_id: this.detail.parent_id, advisor_id: this.detail.advisor_id});
            console.log(result);

            if(!result) return 0;
            this.$set(this, 'contractData', result.data);
            this.courseMaskStatus = false;
            this.contractMaskStatus = true;
            this.getFollowUpLists();
        },
        //提交渠道信息
        async submitSourceInfo() {
            let result = await this.$$request.post('api/source/add', this.sourceForm);
            if(!result) return 0;

            this.sourceMaskStatus = false;
            this.fillInfo.source.push({id: result.data.id, name: result.data.name});
        },
        //提交学员信息
        async submitStudentInfo() {
            let params = {};
            for(let key in this.studentForm) {
                if(key == 'birthday') {
                    params[key] = this.studentForm[key] / 1000;
                }else params[key] = this.studentForm[key];
            };

            console.log(params);

            let result = await this.$$request.post('api/student/edit', params);
            console.log(result);
            if(!result) return 0;

            this.$message.success('修改成功');
            this.studentMaskStatus = false;
            this.getStudentDetail();
            Bus.$emit('refreshStudentLists');
        },
        //提交跟进
        async submitFollowUpInfo() {
            for(let key in this.followUpForm) {if((key == 'invited_at' || key == 'next_at')) this.followUpForm[key] = this.followUpForm[key] / 1000};

            if(this.followupStatus === 4 && !this.checkListenCourse.timetable_id) return this.$message.warning('邀约试听，试听课程不能为空!');

            let params = {...this.followUpForm, type_id: 5, student_id: this.detail.id};  //type_id默认售前跟进5

            if(this.listenType == 'default' && this.checkListen.length) {
                params.timetable_id = this.checkListen[0];
            }else if(this.checkListenCourse.timetable_id) params.timetable_id = this.checkListenCourse.timetable_id;

            console.log(params);
            
            let result = await this.$$request.post('api/followUp/add', params);
            console.log(result);
            if(!result) return 0;
            this.$message.success('添加成功');
            
            this.maskFollowUp = false;
            this.maskAudition = false;
            this.listenCourseInit();
            for(let key in this.followUpForm) this.followUpForm[key] = '';
            this.getFollowUpLists();
        },
        //获取跟进列表
        async getFollowUpLists(currentPage) {
            this.loading = true;
            let params = {student_id: this.studentId};
            if(currentPage) params.page = currentPage;
            let result = await this.$$request.post('api/followUp/lists', params);
            console.log(result);
            if(!result) return 0;
            this.followUpLists = result.lists;
            this.loading = false;
        },
        //获取学员详情
        async getStudentDetail() {
            let result = await this.$$request.post('api/student/detail', {id: this.studentId});
            console.log(result);
            if(!result) return 0;
            this.$set(this, 'detail', result.detail);
        },
        //获取附件信息
        async getStudentFill() {
            let result = await this.$$request.post('api/student/fill');
            console.log(result)
            if(!result) return 0;
            this.$set(this, 'fillInfo', result);
            this.getCourseLits();
        },
        //获取购课页面，课程列表
        async getCourseLits() {
            let result = await this.$$request.post('api/course/normalLists');
            console.log(result);
            if(!result) return 0;
            this.buyCourseLists = result.lists;
        },
        //获取试听填充列表
        async getListenLists() {
            let select_time = this.auditionData.time / 1000;
            let current_time = new Date().getTime() / 1000;
            let old_time = select_time < current_time ? current_time : select_time;
            let result = await this.$$request.post('api/listenCourse/fill', {start_time: old_time});

            if(!result) return 0;
            this.auditionData.teacher_lists = result.teacher;
            this.auditionData.course_lists = result.course;
            this.getListenCourseLists();
        },
        //获取试听课程列表
        async getListenCourseLists() {
            let select_time = this.auditionData.time / 1000;
            let current_time = new Date().getTime() / 1000;
            let old_time = select_time < current_time ? current_time : select_time;

            let params = {
                time: old_time,
                teacher_id: this.auditionData.teacher_id,
                course_id: this.auditionData.course_id
            };

            let result = await this.$$request.post('api/listenCourse/lists', {data: params});
            if(!result) return 0;
            this.listenCourseLists = result.lists;
        }
    },
    created() {
        if(this.$route.query.student_id) this.studentId = this.$route.query.student_id;
        this.getStudentDetail();
        this.getStudentFill();
        this.getFollowUpLists();
    },
    components: {TableHeader, MyButton}
}
</script>

<style lang="less" scoped>
    h5 {font-weight: normal}
    
    .table-header {
        height: 50px;
        border-bottom: 1px #e3e3e3 solid;
        span {
            padding-left: 20px;
        }
        a {
            width: 80px;
            line-height: 35px;
            border-radius: 3px;
            margin-left: 20px;
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
    .detail-bottom {
        .followup-lists-box {
            .nothing {
                height: 200px;
            }
            .followup-lists {
                padding: 30px;
                h5 {
                    width: 150px;
                    font-weight: normal;
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
        .add-source {
            img {
                position: relative;
                top: 3px;
            }
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
        }
    }
</style>


