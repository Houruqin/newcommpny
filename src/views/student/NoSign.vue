<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="未签约学员">
                <MyButton class="mr-20" @click.native="addStudent">登记学员</MyButton>
                <router-link :to="{path: '/student/importstudent'}"><MyButton icon="import" type="border" fontColor="fc-m">导入学员</MyButton></router-link>
            </TableHeader>
            
            <div class="header-tab-box d-f f-j-b mt-50">
                <Classify v-for="(tab, index) in tabLists" :key="index" :tab="tab" :active="activeTab == tab.type" @tabclick="tabClick(tab)"></Classify>
            </div>
            <div class="fifter-toolbar mt-50">
                <ul class="d-f">
                    <li v-if="activeTab != 'no_advisor'">
                        <el-select size="small" placeholder="全部顾问" v-model="searchFilter.advisor_id" @change="searchHandle">
                            <el-option label="全部顾问" value=""></el-option>
                            <el-option v-for="(item, index) in fillInfo.advisor" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </li>
                    <li>    
                        <el-select size="small" placeholder="所有渠道" v-model="searchFilter.source_id" @change="searchHandle">
                            <el-option label="所有渠道" value=""></el-option>
                            <el-option v-for="(item, index) in fillInfo.source" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </li>
                    <li v-if="activeTab != 'no_advisor' && activeTab != 'invalid'">
                        <el-select size="small" placeholder="全部跟进" v-model="searchFilter.follow_status" @change="searchHandle"> 
                            <el-option label="全部跟进" value=""></el-option>
                            <el-option v-for="(item, index) in followUp" :key="index" :label="item.name" :value="item.id" v-if="item.id != -1"></el-option>
                        </el-select>
                    </li>
                    <li class="name"><el-input size="small" placeholder="请输入学员姓名或手机号" v-model.trim="searchKeyWord"></el-input></li>
                    <li><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
                </ul>
            </div>

            <el-table class="student-table mt-30" :data="studentTable.data" v-loading="loading" stripe>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="姓名" align="center">
                    <template slot-scope="scope">
                        <router-link :to="{path: '/student/nosigndetail', query: {student_id: scope.row.id}}" class="fc-m">{{scope.row.name}}</router-link>
                    </template>
                </el-table-column>
                <el-table-column label="联系电话" prop="parent_info.mobile" align="center"></el-table-column>
                <el-table-column label="学员顾问" align="center">
                    <template slot-scope="scope">
                        <div v-if="scope.row.advisor_info">{{scope.row.advisor_info.name}}</div>
                        <div v-else-if="activeTab == 'unsign' || activeTab == 'no_advisor'" class="d-f f-a-c f-j-c"> 
                            <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                <span class="el-dropdown-link">
                                    <div class="allocation-advisor-btn" slot="reference" @click="advisorClick(scope.row)">分配</div>
                                </span>
                                <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                    <el-scrollbar style="height: 100%;">
                                        <el-dropdown-item v-for="(item, index) in fillInfo.advisor" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                    </el-scrollbar>
                                </el-dropdown-menu>
                            </el-dropdown>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="最新跟进状态" prop="follow_cn" align="center">
                    <template slot-scope="scope">
                        <div class="d-f f-a-c f-j-c">
                            <span class="follow-status fs-12" :class="{'green': scope.row.follow_status === 2 || scope.row.follow_status === 3 || scope.row.follow_status === 4 || scope.row.follow_status === 5, 
                            'red': scope.row.follow_status === 1 || scope.row.follow_status === 6, 'gray': scope.row.follow_status === 0 || scope.row.follow_status === -1}">
                                {{scope.row.follow_cn}}
                            </span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="渠道" prop="source_info.name" align="center"></el-table-column>
                <el-table-column label="学员录入时间" prop="created_at" :formatter="dateForamt" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <a class="cursor-pointer fc-m" @click="editStudent(scope.row)">编辑</a>
                        <a v-if="activeTab == 'invalid'" class="cursor-pointer fc-subm ml-20" @click="deleteStudent(scope.row.id)">删除</a>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination v-if="studentTable.total"
                class="d-f f-j-c mt-50 mb-50" 
                :page-size="studentTable.per_page" 
                background layout="total, prev, pager, next" 
                :total="studentTable.total" 
                :current-page="studentTable.current_page" 
                @current-change="paginationClick"
                @next-click="nextClick"
                @prev-click="prevClick">
            </el-pagination>
        </el-card>
        <!-- 登记学员弹窗 -->
        <el-dialog :title="type == 'add' ? '学员登记' : '学员修改'" width="800px" center :visible.sync="studentMaskStatus" :close-on-click-modal="false" @close="dialogClose('addStudent')">
            <el-form :model="studentForm" label-width="120px" size="small" ref="addStudent" :rules="rules">
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
                                <el-input v-model.trim="studentForm.mobile" ref="mobileObj"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <el-form-item label="家庭住址：" prop="address" class="mt-10">
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
                                <el-date-picker v-model="studentForm.birthday" :picker-options="pickerBeginDateAfter" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    

                    <el-form-item label="就读学校：" class="mt-10" prop="school_name">
                        <el-col :span="20"><el-input v-model.trim="studentForm.school_name" placeholder="选填"></el-input></el-col>
                    </el-form-item>

                    <el-row class="mt-10">
                        <el-col :span="12">
                            <el-form-item label="意向课程：">
                                <el-select v-model="studentForm.like_course" placeholder="选择课程" clearable>
                                    <el-option v-for="(item, index) in fillInfo.course" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" :offset="1">
                            <el-form-item label-width="0">
                                <el-select v-model="studentForm.like_grade" placeholder="选择意向度" clearable>
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
                                <el-select v-model="studentForm.advisor_id" placeholder="选择顾问" clearable>
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

                    <div class="d-f f-j-c mt-50"><MyButton @click.native="doneHandle('addStudent')">确定</MyButton></div>
                </div>
            </el-form>

            <el-dialog title="添加渠道" width="500px" center :visible.sync="sourceMaskStatus" :close-on-click-modal="false" @close="dialogClose('sourseForm')" append-to-body>
                <el-form :model="sourceForm" label-width="100px" size="small" :rules="sourceRules" ref="sourseForm">
                    <div class="form-box">
                        <el-form-item label="渠道来源：" prop="name">
                            <el-input v-model.trim="sourceForm.name" placeholder="渠道名称"></el-input>
                        </el-form-item>
                        <div class="d-f f-j-c mt-40"><MyButton @click.native="doneHandle('sourseForm')">确定</MyButton></div>
                    </div>
                </el-form>
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
                        <MyButton @click.native="doneHandle('courseForm')">提交生成合约</MyButton>
                    </div>
                </div>
            </el-form>
        </el-dialog>
        
         <!-- 购课合约弹窗 -->
         <el-dialog title="购课合约" width="800px" center :visible.sync="contractMaskStatus" :close-on-click-modal="false" id="contract">
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
import Classify from '../../components/common/StudentClassify'
import {StudentStatic} from '../../script/static'
import Bus from '../../script/bus'

export default {
    data() {
        return {
            activeTab: 'unsign',
            loading: true,
            tabLists: [],

            currPage: false,

            listStudentId: '',
            studentId: '',

            headTab: ['意向学员', '未分配顾问学员', '跟进中学员', '无效学员'],
            studentTable: {},
            searchKeyWord: '',
            contractData: {},   //合约数据
            searchFilter: {type: 'unsign', name: '', mobile: '', advisor_id: '', source_id: '', follow_status: ''},  //搜索筛选条件
            followUp: StudentStatic.followUp.status,
            relationArr: StudentStatic.relation,
            likeGrade: StudentStatic.likeGrade,
            paymentMethod: StudentStatic.paymentMethod, //付款方式
            studentMaskStatus: false,  //学员登记弹窗
            courseMaskStatus: false,  //购买课程弹窗
            contractMaskStatus: false, //购课合约弹窗
            sourceMaskStatus: false, //添加渠道弹窗
            type: 'add',
            fillInfo: {},
            courseLists: [],
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
            rules: {
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
                    {max: 200,  message: '长度不能超过200个字符'}
                ]
            },
            pickerBeginDateAfter: {
                disabledDate: (time) => {
                    return time.getTime() > new Date().getTime();
                }
            }
        } 
    },
    methods: {
        tabClick(tab) {
            if(tab.type == 'following' && this.followUp.length == 5) this.followUp.splice(0, 1);
            else if(tab.type == 'unsign' && this.followUp.length == 4) this.followUp.unshift({id: 0, name: '未跟进'});

            this.searchKeyWord = '';

            if(tab.type != this.activeTab) {
                this.loading = true;
                for(let key in this.searchFilter) this.searchFilter[key] = key == 'type' ? tab.type : '';
                this.activeTab = tab.type;
                this.getStudentLists();
            }
        },
        addStudent() {
            this.type = 'add';
            // for(let key in this.studentForm) {this.studentForm[key] = ''};
            this.studentMaskStatus = true;
        },
        //合约确定按钮，跳转签约学员详情
        goSignedLists() {
            this.contractMaskStatus = false;
            this.$router.replace({path: '/student/signeddetail', query: {id: this.studentId}});
        },
        //打印合同
        printCompact() {
            this.$router.push({name: 'contractView', params: {contractData: this.contractData, replace_path: 'student/nosign'}});
        },
        dialogClose(form) {
            this.$refs[form].resetFields();
            if(form === 'addStudent') Object.keys(this.studentForm).forEach(v =>{this.studentForm[v] = ''});
            else if(form === 'courseForm') Object.keys(this.courseForm).forEach(v =>{this.courseForm[v] = ''});
        },
        //单元格时间格式化
        dateForamt(row, column, cellValue) {
            return this.$$tools.format(cellValue)
        },
        //搜索
        searchHandle() {
            this.getStudentLists();
        },
        //添加渠道信息
        addSource() {
            this.sourceForm.name = '';
            this.sourceMaskStatus = true;
        },
        //购买课程，选择课程change
        addCourseChange(val) {
            this.courseLists.forEach(v => {
                if(v.id == val) {
                    this.courseForm.expire = v.expire;
                    this.courseForm.leave_num = v.leave_num;
                    this.courseForm.unit_price = v.unit_price;
                }
            });
        },
        //列表顾问选择
        async listAdvisorChange(val) {
            let result = await this.$$request.post('api/student/distribute', {student_id: this.listStudentId, advisor_id: val});
            console.log(result);
            if(!result) return 0;
            this.getTabLists();
        },
        //分配顾问点击
        advisorClick(data) {
            this.listStudentId = data.id;
        },
        //修改学员信息
        editStudent(data) {
            for(let key in data) {
                if(key == 'address' || key == 'remark' || key == 'school_name' || key == 'source_id' || key == 'sex' || key == 'id') {
                    this.studentForm[key] = data[key];
                }else if(key == 'birthday') {
                    this.studentForm[key] = data[key] > 0 ? data[key] * 1000 : '';
                }else if(key == 'parent_info') {
                    this.studentForm.mobile = data[key].mobile;
                    this.studentForm.parent_name = data[key].name;
                    this.studentForm.relation = data[key].relation;
                }else if(key == 'name') this.studentForm.student_name = data[key]
                else if(key == 'advisor_id' || key == 'like_course' || key == 'like_grade') {
                    this.studentForm[key] = data[key] == 0 ? '' : data[key];
                }
            }
            
            this.type = 'edit';
            this.studentMaskStatus = true;
        },
        //删除学员
        deleteStudent(id) {
            this.$confirm('确定删除该学员吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteHandle(id);
            }).catch(() => {return 0});
        },
        async deleteHandle(id) {
            let result = await this.$$request.post('api/student/delete', {id: id});
            if(!result) return 0;
            this.getTabLists();
            this.$message.success('已删除');
        },

        nextClick(currentPage) {
            this.currPage = true;
            this.getStudentLists(currentPage);
        },
        prevClick(currentPage) {
            this.currPage = true;
            this.getStudentLists(currentPage);
        },
        //分页
        paginationClick(currentPage) {
            if(!this.currPage) this.getStudentLists(currentPage);
            this.currPage = false;
        },
        //购课
        async buyCourse(data) {
            this.courseForm.student_id = data.id;
            this.courseForm.advisor_id = data.advisor_id;
            this.courseForm.advisor_name = data.advisor ? data.advisor.name : '';
            this.courseForm.parent_id = data.parent_id;
            this.courseForm.expire = 12;
            this.courseForm.pay_at = new Date().getTime();
            this.courseMaskStatus = true;
        },
        //表单确定
        doneHandle(type) {
            this.$refs[type].validate(valid => {
                if(valid) type == 'addStudent' ? this.submitStudentInfo() : type == 'sourseForm' ? this.submitSourceInfo() : this.submitBuyCourse();
            });
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

            console.log(params);
            let result = await this.$$request.post('api/studentCourse/add', params);
            console.log(result);
            if(!result) return 0;

            this.$set(this, 'contractData', result.data);

            this.getTabLists();
            this.courseMaskStatus = false;
            this.contractMaskStatus = true;
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
            let params = {}, url = 'api/student/add';
            for(let key in this.studentForm) {
                if(key == 'birthday') {
                    params[key] = this.studentForm[key] / 1000;
                }else if(key != 'id') params[key] = this.studentForm[key];
            };

            if(this.type == 'edit') {
                params.id = this.studentForm.id; 
                url = 'api/student/edit';
            }
            
            let result = await this.$$request.post(url, params);
            console.log(result);
            if(!result) return 0;

            if(this.type == 'edit') {
                if(result.status) this.$message.success('修改成功');
                this.getTabLists();
                this.studentMaskStatus = false;
            }else {
                if(result.status) {
                    this.$confirm('已存在该账号，是否将学员添加至该账号下？', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '修改手机号',
                        type: 'warning'
                    }).then(() => {
                        this.studentRepeat(params);
                    }).catch(() => {
                        this.$refs.mobileObj.focus();
                    });
                }else {
                    this.studentSuccessMessage(result.data);
                }
            }
        },
        //登记学员重复手机号码，处理方法
        async studentRepeat(params) {
            let result = await this.$$request.post('api/student/add', {...params, parent_this: 'yes'});
            console.log(result)
            if(!result) return 0;
            this.studentSuccessMessage(result.data);
        },
        //登记学员成功，二次提醒是否购课
        studentSuccessMessage(data) {
            this.$confirm('已成功登记学员，是否选择购课?', '提示', {
                confirmButtonText: '购买课程',
                cancelButtonText: '暂不办理',
                type: 'success'
            }).then(() => {
                this.buyCourse(data);
            }).catch(() => {return 0});

            this.getTabLists();
            this.studentId = data.id;
            this.studentMaskStatus = false;
        },  
        //获取tab列表
        async getTabLists() {
            let result = await this.$$request.post('api/student/tab');
            console.log(result);
            if(!result) return 0;
            this.tabLists = result.lists.map((v, index) => {v.name = this.headTab[index]; return v});
            this.getStudentLists();
        },
        //获取附件信息
        async getStudentFill() {
            let result = await this.$$request.post('api/student/fill');
            console.log(result)
            if(!result) return 0;
            this.$set(this, 'fillInfo', result);
        },
        //获取课程列表
        async getCourseLits() {
            let result = await this.$$request.post('api/course/normalLists');
            console.log(result);
            if(!result) return 0;
            this.courseLists = result.lists;
        },
        //获取学员列表
        async getStudentLists(currentPage) {
            this.loading = true;
            if(this.searchKeyWord) {
                if(isNaN(this.searchKeyWord)) {
                    this.searchFilter.name = this.searchKeyWord;
                    this.searchFilter.mobile = '';
                }else {
                    this.searchFilter.mobile = this.searchKeyWord;
                    this.searchFilter.name = '';
                }
            }else {
                this.searchFilter.mobile = '';
                this.searchFilter.name = '';
            }
            let params = {data: this.searchFilter};
            if(currentPage) params.page = currentPage;
            console.log(params);

            let result = await this.$$request.post('api/student/lists', params);
            console.log(result);
            if(!result) return 0;
            this.studentTable = result.lists;
            this.loading = false;
        }
    },
    created() {
        this.getTabLists();
        this.getCourseLits();
        this.getStudentFill();
        //监听如果详情修改，那么刷新学员列表
        Bus.$on('refreshStudentLists', () => {this.getStudentLists()});
    },
    beforeRouteEnter(to, from, next) {
        console.log(from)
        //判断如果是未签约详情过来，那么就不用刷新，直接取缓存即可，否则其他页面过来的，都需要刷新整个页面
        if(from.name == 'nosignDetail') to.meta.keepAlive = true; 
        else to.meta.keepAlive = false;
        next();   //来到页面，包括通过返回
    },
    beforeRouteLeave(to, from, next) {
        next();   //离开页面时，做判断
    },
    beforeDestroy() {
        Bus.$off('refreshStudentLists');
    },
    components: {Classify, MyButton, TableHeader}
}
</script>

<style lang="less" scoped>
    .header-tab-box {
        padding: 0 200px;
    }
    .fifter-toolbar {
        ul li {
            margin-right: 20px;
            &:not(:last-child) {
                width: 105px;
            }
            &.name {
                width: auto;
            }
        }
    }
    .student-table {
        border-top: 1px #e3e3e3 solid;
        .follow-status {
            width: 65px;
            text-align: center;
            height: 24px;
            line-height: 24px;
            border-radius: 5px;
            &.red {
                background-color: #FFF0EA;
                color: #aa4e2a;
            }
            &.green {
                background-color: #E4F3E8;
                color: #347924;
            }
            &.gray {
                background-color: #EDEDED;
                color: #555555;
            }
        }
        .allocation-advisor-btn {
            width: 50px;
            line-height: 22px;
            border: 1px #45DAD5 solid;
            border-radius: 3px;
            text-align: center;
            color: #45DAD5;
            cursor: pointer;
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
</style>


