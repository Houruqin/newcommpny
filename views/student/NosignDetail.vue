<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <TableHeader :title="detail.name" :icon="true" @clicked="editStudent">
                <MyButton class="ml-20" v-if="$$cache.getMemberInfo().class_pattern !== 2" @click.native="addListenHandle">试听</MyButton>
                <MyButton class="ml-20" @click.native="buyCourse">购课</MyButton>
            </TableHeader>
            <div class="detail-box fc-9">
                <p>
                    <span>学员编号：<i>0{{detail.id}}</i></span>
                    <span>性别：<i>{{detail.sex ? '男' : '女'}}</i></span>
                    <span>出生日期：<i>{{detail.birthday > 0 ? $$tools.format(detail.birthday) : ''}}</i></span>
                </p>
                <p v-if="detail.parent_info">
                    <span>家长：<i>{{detail.parent_info.name}}</i><i>({{getRelations(detail.parent_info.relation)}})</i></span>
                    <span>联系电话：<i>{{detail.parent_info.mobile}}</i></span>
                </p>

                <p v-if="detail.parent_info"><span>家庭住址：<i>{{detail.address}}</i></span></p>
                <div class="mt-15 d-f">
                  <a>学员备注：</a>
                  <template v-if="detail.remark && detail.remark.length > 30">
                      <el-popover popper-class="grade-student-popver" placement="right" trigger="hover" width="200" :content="detail.remark">
                          <div slot="reference" class="cursor-pointer">
                              <a class="fc-2">{{detail.remark.substring(0, 30)}}...</a>
                              <!-- <i class="iconfont icon-zhuyidapx"></i> -->
                          </div>
                      </el-popover>
                  </template>
                  <span v-else>{{detail.remark}}</span>
                </div>
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

                <div class="d-f f-j-c mt-50"><MyButton @click.native="listenDoneHandle" :loading="submitLoading">确定</MyButton></div>
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

                    <el-form-item label="下次跟进：" class="mt-30" prop="next_at">
                        <el-date-picker type="datetime" :editable="false" v-model="followUpForm.next_at" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                    </el-form-item>

                    <div class="d-f f-j-c mt-50"><MyButton @click.native="followUpDoneHandle('followUpForm')" :loading="submitLoading">确定</MyButton></div>
                </div>
            </el-form>
        </el-dialog>

        <!-- 登记学员弹窗 -->
        <AddStudentDialog  :dialogStatus="dialogStatus.student" :editDetail="editDetail" :type="studentType"
            @CB-dialogStatus="CB_dialogStatus" @CB-addStudent="CB_addStudent">
        </AddStudentDialog>

        <!-- 购买课程弹窗 -->
        <!-- <BuyCourseDialog :dialogStatus="dialogStatus.course" :buyCourseData="buyCourseData"
            @CB-contract="CB_contract" @CB-dialogStatus="CB_dialogStatus">
        </BuyCourseDialog> -->

        <!-- 购课合约弹窗 -->
        <ContractDialog :dialogStatus="dialogStatus.contract" :contractData="contractData"></ContractDialog>
    </div>
</template>

<script>
import TableHeader  from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'
import {StudentStatic} from '../../script/static'
import Bus from '../../script/bus'
import Tools from '../../script/tools'

import AddStudentDialog from '../../components/dialog/AddStudent'
import BuyCourseDialog from '../../components/dialog/BuyCourse'
import ContractDialog from '../../components/dialog/Contract'

export default {
    data() {
        return {
            submitLoading: false,

            state: 'loading',

            detail: {},
            studentId: '',
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

            dialogStatus: {student: false, course: false, contract: false},
            buyCourseData: {},
            editDetail: {},

            studentType: '',

            followupStatus: '',   //跟进结果
            wayIdArr: StudentStatic.followUp.wayId,
            resultArr: [],

            followUpLists: [],   //跟进列表
            followUpForm: {
                way_id: '',   //跟进方式
                status: '',   //跟进结果
                invited_at: '',   //邀约时间
                content: '',   //跟进内容
                next_at: ''
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
                ],
                next_at: []
            },
            sourceRules: {
                name: [
                    {required: true, message: '请输入渠道'},
                    {max: 20, message: '长度不能超过20个字符'}
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
        getRelations(id) {
            let text = '';
            this.$store.state.familyRelations.forEach(v => {
                if(id == v.id) text = v.name;
            });

            return text;
        },
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
            }else{
                this.listenCourseInit();
                this.$refs[form].resetFields();
            }
        },
        //弹窗变比，改变dialog状态回调
        CB_dialogStatus(type) {
            if(type == 'student') {
                this.dialogStatus.student = false;
                this.editDetail = {};
                return 0;
            };
            // if(type == 'course') {
            //     this.dialogStatus.course = false;
            //     this.buyCourseData = {};
            //     return 0;
            // };
        },
        //修改详情成功，刷新列表
        CB_addStudent() {
            this.getStudentDetail();
            this.dialogStatus.student = false;
        },
        //购课成功，合约回调
        CB_contract(data) {
            this.contractData = data;
            this.getFollowUpLists();
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
            console.log(list);
            let index = this.checkListen.indexOf(list.id);

            if(index === -1) {
                if(this.checkListen.length) return this.$message.warning('最多选择一个');
                this.checkListen.push(list.id);
            }else this.checkListen.splice(index, 1);
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
        //购课
        buyCourse() {
            // this.dialogStatus.course = true;
            // this.buyCourseData = this.detail;
            let params = {
                student_id: this.detail.id,
                advisor_id: this.detail.advisor_id,
                advisor: this.detail.advisor,
                parent_id: this.detail.parent_id
            };

            this.$router.push({path: '/student/nosignbuycourse', query: {buyCourseData: JSON.stringify(params)}});
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
        followUpDoneHandle(type) {
            this.$refs.followUpForm.validate(valid => {if(valid) this.submitFollowUpInfo()});
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
        editStudent() {
            this.studentType = 'edit';
            this.editDetail = this.detail;
            this.dialogStatus.student = true;
        },
        //提交跟进
        async submitFollowUpInfo() {
            if(this.submitLoading) return 0;
            this.submitLoading = true;

            let params = {type_id: 5, student_id: this.detail.id}; //type_id默认售前跟进5

            for(let key in this.followUpForm) params[key] = key == 'invited_at' || key == 'next_at' ? this.followUpForm[key] / 1000 : this.followUpForm[key];

            if(this.followupStatus === 4 && !this.checkListenCourse.timetable_id) {
                this.submitLoading = false;
                return this.$message.warning('邀约试听，试听课程不能为空!');
            }

            if(this.listenType == 'default' && this.checkListen.length) {
                params.timetable_id = this.checkListen[0];
            }else if(this.checkListenCourse.timetable_id) params.timetable_id = this.checkListenCourse.timetable_id;

            console.log(params);

            let result = await this.$$request.post('/followUp/add', params);
            this.submitLoading = false;
            console.log(result);
            if(!result) return 0;
            this.$message.success('添加成功');

            this.maskFollowUp = false;
            this.maskAudition = false;
            this.listenCourseInit();
            this.getFollowUpLists();
        },
        //获取跟进列表
        async getFollowUpLists(currentPage) {
            this.loading = true;
            let params = {student_id: this.studentId};
            if(currentPage) params.page = currentPage;
            let result = await this.$$request.post('/followUp/lists', params);
            console.log(result);
            if(!result) return 0;
            this.followUpLists = result.lists;
            this.loading = false;
            return true;
        },
        //获取学员详情
        async getStudentDetail() {
            let result = await this.$$request.post('/student/detail', {id: this.studentId});
            console.log(result);
            if(!result) return 0;
            this.$set(this, 'detail', result.detail);
            return true;
        },
        //获取试听填充列表
        async getListenLists() {
            this.checkListen.splice(0, this.checkListen.length);

            let select_time = this.auditionData.time / 1000;
            let current_time = new Date().getTime() / 1000;
            let old_time = select_time < current_time ? current_time : select_time;
            let result = await this.$$request.post('/listenCourse/fill', {start_time: old_time});

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

            let result = await this.$$request.post('/listenCourse/lists', {data: params});
            if(!result) return 0;
            this.listenCourseLists = result.lists;
        }
    },
    async created() {
        if(this.$route.query.student_id) this.studentId = this.$route.query.student_id;

        if(this.$$cache.getMemberInfo().class_pattern === 2) {
            this.resultArr.splice(0, this.resultArr.length);
            StudentStatic.followUp.status.forEach(v => {if(v.id != 4) this.resultArr.push(v)});
        }else this.resultArr = StudentStatic.followUp.status;

        let [a, b] = await Promise.all([this.getStudentDetail(), this.getFollowUpLists()]);
        if(a && b) this.state = 'loaded';
    },
    watch: {
        $route: function(val,oldval) {
            this.studentId = val.query.student_id;
            this.getStudentDetail();
            this.getFollowUpLists();
        }
    },
    components: {TableHeader, MyButton, AddStudentDialog, BuyCourseDialog, ContractDialog}
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


