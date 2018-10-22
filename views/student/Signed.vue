<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <TableHeader title="签约学员">
                <router-link :to="{path: '/student/importstudent'}"><MyButton icon="import" type="border" fontColor="fc-m">导入学员</MyButton></router-link>
            </TableHeader>
            <div class="header-tab-box d-f f-j-b">
                <Classify v-for="(tab, index) in tabLists" :key="index" :tab="tab" :active="activeTab == tab.type" @tabclick="tabClick(tab)"></Classify>
            </div>
            <div class="fifter-toolbar mt-30 d-f">
                <ul class="d-f flex1">
                    <li v-if="activeTab !== 'birthday'">
                        <el-select size="small" placeholder="选择课程" v-model="searchFilter.course_id" @change="searchHandle">
                            <el-option label="全部课程" value=""></el-option>
                            <el-option v-for="(item, index) in $store.state.course" :key="index" :value="item.id" :label="item.name"></el-option>
                        </el-select>
                    </li>
                    <li v-if="activeTab === 'onCourse' || activeTab === 'noGrade'">
                        <el-select size="small" placeholder="选择顾问" v-model="searchFilter.advisor_id" @change="searchHandle">
                            <el-option label="全部顾问" value=""></el-option>
                            <el-option v-for="(item, index) in $store.state.advisor" :key="index" :value="item.id" :label="item.name"></el-option>
                        </el-select>
                    </li>
                    <li v-if="activeTab === 'absent'">
                        <el-select size="small" placeholder="全部" v-model="searchFilter.absent_what_time" @change="searchHandle">
                            <el-option label="全部" value=""></el-option>
                            <el-option label="本周" value="week"></el-option>
                            <el-option label="本月" value="month"></el-option>
                        </el-select>
                    </li>
                    <li v-if="activeTab === 'onCourse'">
                        <el-select size="small" placeholder="全部签约" v-model="searchFilter.sign_what_time" @change="searchHandle">
                            <el-option label="全部签约" value=""></el-option>
                            <el-option label="本周签约" value="week"></el-option>
                            <el-option label="本月签约" value="month"></el-option>
                        </el-select>
                    </li>
                    <template v-if="activeTab === 'birthday'">
                        <li>
                            <el-select size="small" placeholder="全部状态" v-model="searchFilter.gift_status" @change="searchHandle">
                                <el-option label="全部" value=""></el-option>
                                <el-option label="已发放" :value="1"></el-option>
                                <el-option label="未发放" :value="0"></el-option>
                            </el-select>
                        </li>
                        <li class="birthday-date">
                            <span class="pr-5">出生月份</span>
                            <el-select size="small" placeholder="选择月份" v-model="searchFilter.month" @change="searchHandle">
                                <el-option v-for="(item, index) in monthArr" :key="index" :label="item + '月'" :value="index + 1"></el-option>
                            </el-select>
                        </li>
                    </template>
                    <li class="name"><el-input size="small" placeholder="请输入学员姓名或手机号" v-model.trim="searchKeyWord"></el-input></li>
                    <li><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
                </ul>

                <MyButton icon="import" type="border" fontColor="fc-m" class="ml-20" @click.native="exportStudent">导出学员</MyButton>
            </div>

            <div class="student-lists-box mt-20">
                <!-- 上课学员列表 -->
                <el-table class="student-table" key='aTable' v-if="activeTab === 'onCourse'" :data="studentTable.data" v-loading="loading" ref="studentTable" @selection-change="handleSelectionChange" stripe>
                    <el-table-column type="selection" width="30" v-if="isShowCheckbox"></el-table-column>
                    <el-table-column label="序号" prop="index" type="index" align="center"></el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope">
                            <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}" class="fc-m">{{scope.row.student_name}}</router-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <div v-if="scope.row.advisor_id">{{scope.row.advisor_name}}</div>
                            <div v-else class="d-f f-a-c f-j-c">
                                <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                    <span class="el-dropdown-link">
                                        <div class="allocation-advisor-btn" slot="reference" @click="advisorClick(scope.row)">分配</div>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                        <el-scrollbar style="height: 100%;">
                                            <el-dropdown-item v-for="(item, index) in $store.state.advisor" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                        </el-scrollbar>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="签约课程" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <ul class="table-item-list" :class="{'first-merge': scope.row.course_lists && scope.row.course_lists.length > 1}">
                                <li v-for="(list, index) in scope.row.course_lists" :key="index">
                                    {{list.course_name}}
                                </li>
                            </ul>
                        </template>
                    </el-table-column>

                    <el-table-column label="剩余课时" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <ul class="table-item-list">
                                <li v-for="(list, index) in scope.row.course_lists" :key="index">
                                    {{list.lesson_num_remain || list.lesson_num}}
                                </li>
                            </ul>
                        </template>
                    </el-table-column>
                    <el-table-column label="课程有效期" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <ul class="table-item-list" :class="{'last-merge': scope.row.course_lists && scope.row.course_lists.length > 1}">
                                <li v-for="(list, index) in scope.row.course_lists" :key="index">
                                    {{list.expired_at && $$tools.format(list.expired_at)}}
                                </li>
                            </ul>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <span class="fc-m cursor-pointer" @click="buyCourse(scope.row.course_lists[0])">购课</span>
                            <span class="fc-m cursor-pointer ml-10" @click="addAudition(scope.row.student_id)">试听</span>
                            <el-dropdown trigger="click" @command="handleCommand" placement="bottom">
                              <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                              <el-dropdown-menu slot="dropdown" class="operation-lists">
                                <el-dropdown-item v-for="(operation, index) in operationLists" :key="index"
                                  v-if="operation.type !== 'delete' && operation.type !== 'audition' ||
                                  (operation.type == 'delete' && ($$cache.getMemberInfo().type === 'institution' || $$cache.getMemberInfo().type === 'master'))"
                                  :command="{type: operation.type, data: scope.row}">{{ operation.text}}
                                </el-dropdown-item>
                              </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 生日学员 -->
                <el-table class="student-table" key='bTable' v-else-if="activeTab === 'birthday'" :data="studentTable.data" v-loading="loading" ref="studentTable" @selection-change="handleSelectionChange" stripe>
                    <el-table-column type="selection" width="30" v-if="isShowCheckbox"></el-table-column>
                    <el-table-column label="序号" prop="index" type="index" align="center"></el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope">
                            <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.id}}" class="fc-m">{{scope.row.name}}</router-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <div v-if="scope.row.advisor_id">{{scope.row.advisor_name}}</div>
                            <div v-else class="d-f f-a-c f-j-c">
                                <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                    <span class="el-dropdown-link">
                                        <div class="allocation-advisor-btn" slot="reference" @click="advisorClick(scope.row)">分配</div>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                        <el-scrollbar style="height: 100%;">
                                            <el-dropdown-item v-for="(item, index) in $store.state.advisor" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                        </el-scrollbar>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="出生日期" align="center">
                        <template slot-scope="scope">
                            <span>{{scope.row.birthday && $$tools.format(scope.row.birthday)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="礼品状态" align="center">
                        <template slot-scope="scope">
                            <span>{{scope.row.gift_status ? '已发放' : '未发放'}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center">
                        <template slot-scope="scope">
                            <div class="d-f f-a-c f-j-c">
                                <span class="grant-gift t-a-c" :class="{'active': !scope.row.gift_status}" @click="grantGift(scope.row)">发放礼品</span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>


                <!-- 未分班列表 -->
                <el-table class="student-table" key='cTable' v-else-if="activeTab === 'noGrade'" :data="studentTable.data" v-loading="loading" ref="studentTable" @selection-change="handleSelectionChange" stripe>
                    <el-table-column type="selection" width="30" v-if="isShowCheckbox"></el-table-column>
                    <el-table-column label="序号" prop="index" type="index" align="center"></el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope">
                            <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}" class="fc-m">{{scope.row.student_name}}</router-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <div v-if="scope.row.advisor_id">{{scope.row.advisor_name}}</div>
                            <div v-else class="d-f f-a-c f-j-c">
                                <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                    <span class="el-dropdown-link">
                                        <div class="allocation-advisor-btn" slot="reference" @click="advisorClick(scope.row)">分配</div>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                        <el-scrollbar style="height: 100%;">
                                            <el-dropdown-item v-for="(item, index) in $store.state.advisor" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                        </el-scrollbar>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="签约课程" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <ul class="table-item-list" :class="{'first-merge': scope.row.course_lists && scope.row.course_lists.length > 1}">
                                <li v-for="(list, index) in scope.row.course_lists" :key="index">
                                    {{list.course_name}}
                                </li>
                            </ul>
                        </template>
                    </el-table-column>
                    <el-table-column label="购买日期" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <ul class="table-item-list" :class="{'last-merge': scope.row.course_lists && scope.row.course_lists.length > 1}">
                                <li v-for="(list, index) in scope.row.course_lists" :key="index">
                                    {{list.pay_at && $$tools.format(list.pay_at)}}
                                </li>
                            </ul>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <span class="fc-m cursor-pointer" @click="buyCourse(scope.row.course_lists[0])">购课</span>
                            <span class="fc-m cursor-pointer ml-10" @click="addAudition(scope.row.student_id)">试听</span>
                            <el-dropdown trigger="click" @command="handleCommand" placement="bottom">
                              <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                              <el-dropdown-menu slot="dropdown" class="operation-lists">
                                <el-dropdown-item v-for="(operation, index) in operationLists" :key="index"
                                  v-if="operation.type !== 'delete' && operation.type !== 'audition' ||
                                  (operation.type == 'delete' && ($$cache.getMemberInfo().type === 'institution' || $$cache.getMemberInfo().type === 'master'))"
                                  :command="{type: operation.type, data: scope.row}">{{ operation.text}}
                                </el-dropdown-item>
                              </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 需续约学员列表 -->
                <el-table class="student-table" key='dTable' v-else-if="activeTab === 'contract'" :data="studentTable.data" v-loading="loading" ref="studentTable" @selection-change="handleSelectionChange" stripe>
                    <el-table-column type="selection" width="30" v-if="isShowCheckbox"></el-table-column>
                    <el-table-column label="序号" prop="index" type="index" align="center"></el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope">
                            <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}" class="fc-m">{{scope.row.student_name}}</router-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <div v-if="scope.row.advisor_id">{{scope.row.advisor_name}}</div>
                            <div v-else class="d-f f-a-c f-j-c">
                                <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                    <span class="el-dropdown-link">
                                        <div class="allocation-advisor-btn" slot="reference" @click="advisorClick(scope.row)">分配</div>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                        <el-scrollbar style="height: 100%;">
                                            <el-dropdown-item v-for="(item, index) in $store.state.advisor" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                        </el-scrollbar>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="签约课程" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <ul class="table-item-list" :class="{'first-merge': scope.row.course_lists && scope.row.course_lists.length > 1}">
                                <li v-for="(list, index) in scope.row.course_lists" :key="index">
                                    {{list.course_name}}
                                </li>
                            </ul>
                        </template>
                    </el-table-column>
                    <el-table-column label="剩余课时" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <ul class="table-item-list">
                                <li v-for="(list, index) in scope.row.course_lists" :key="index">
                                    {{list.lesson_num_remain}}
                                </li>
                            </ul>
                        </template>
                    </el-table-column>
                    <el-table-column label="课程有效期" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <ul class="table-item-list" :class="{'last-merge': scope.row.course_lists && scope.row.course_lists.length > 1}">
                                <li v-for="(list, index) in scope.row.course_lists" :key="index">
                                    {{list.expired_at && $$tools.format(list.expired_at)}}
                                </li>
                            </ul>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <span class="fc-m cursor-pointer" @click="buyCourse(scope.row.course_lists[0])">购课</span>
                            <span class="fc-m cursor-pointer ml-10" @click="addAudition(scope.row.student_id)">试听</span>
                            <el-dropdown trigger="click" @command="handleCommand" placement="bottom">
                              <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                              <el-dropdown-menu slot="dropdown" class="operation-lists">
                                <el-dropdown-item v-for="(operation, index) in operationLists" :key="index"
                                  v-if="operation.type !== 'delete' && operation.type !== 'audition' ||
                                  (operation.type == 'delete' && ($$cache.getMemberInfo().type === 'institution' || $$cache.getMemberInfo().type === 'master'))"
                                  :command="{type: operation.type, data: scope.row}">{{ operation.text}}
                                </el-dropdown-item>
                              </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </el-table-column>
                </el-table>

                <!-- 结业学员/流失学员列表 -->
                <el-table class="student-table" key='fTable' v-else :data="studentTable.data" v-loading="loading" ref="studentTable" @selection-change="handleSelectionChange" stripe>
                    <el-table-column type="selection" width="30" v-if="isShowCheckbox"></el-table-column>
                    <el-table-column label="序号" prop="index" type="index" align="center"></el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope">
                            <router-link :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}" class="fc-m">{{scope.row.student_name}}</router-link>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <div v-if="scope.row.advisor_id">{{scope.row.advisor_name}}</div>
                            <div v-else class="d-f f-a-c f-j-c">
                                <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                    <span class="el-dropdown-link">
                                        <div class="allocation-advisor-btn" slot="reference" @click="advisorClick(scope.row)">分配</div>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                        <el-scrollbar style="height: 100%;">
                                            <el-dropdown-item v-for="(item, index) in $store.state.advisor" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                        </el-scrollbar>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="签约课程" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <ul class="table-item-list" :class="{'first-merge': scope.row.course_lists && scope.row.course_lists.length > 1}">
                                <li v-for="(list, index) in scope.row.course_lists" :key="index">
                                    {{list.course_name}}
                                </li>
                            </ul>
                        </template>
                    </el-table-column>
                    <el-table-column label="课程有效期" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <ul class="table-item-list" :class="{'last-merge': scope.row.course_lists && scope.row.course_lists.length > 1}">
                                <li v-for="(list, index) in scope.row.course_lists" :key="index">
                                    {{list.expired_at && $$tools.format(list.expired_at)}}
                                </li>
                            </ul>
                        </template>
                    </el-table-column>


                    <el-table-column label="操作" class-name="table-item" align="center">
                        <template slot-scope="scope">
                            <span v-if="activeTab === 'invalid'">
                              <span class="fc-m cursor-pointer" @click="buyCourse(scope.row.course_lists[0])">购课</span>
                              <span class="fc-m cursor-pointer ml-10" @click="lossStudent(scope.row.course_lists[0].student_id)">流失</span>
                            </span>

                            <span v-else>
                              <span class="fc-m cursor-pointer" @click="buyCourse(scope.row.course_lists[0])">购课</span>
                              <span class="fc-m cursor-pointer ml-10" v-if="$$cache.getMemberInfo().type === 'institution' || $$cache.getMemberInfo().type === 'master'"
                              @click="deleteStudent(scope.row.student_id)">删除</span>
                            </span>

                            <el-dropdown trigger="click" @command="handleCommand" placement="bottom">
                              <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                              <el-dropdown-menu slot="dropdown" class="operation-lists">
                                <el-dropdown-item v-for="(operation, index) in operationLists" :key="index"
                                  v-if="operation.type === 'audition' || operation.type === 'edit'
                                  || (activeTab === 'invalid' && ($$cache.getMemberInfo().type === 'institution' || $$cache.getMemberInfo().type === 'master') && operation.type === 'delete')" :command="{type: operation.type, data: scope.row}">{{ operation.text}}
                                </el-dropdown-item>
                              </el-dropdown-menu>
                            </el-dropdown>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="d-f p-r" v-if="isDelete">
              <div class="multiple-del-box d-f f-a-c">
                <span v-if="isShowCheckbox" class="fc-9 cursor-pointer" :class="{'fc-m': selectedIds.length}" @click="deleteStudent('all')">批量删除</span>
                <MyButton v-if="!isShowCheckbox" @click.native="isShowCheckbox = true" type="border" fontColor="fc-m">批量管理</MyButton>
                <MyButton v-if="isShowCheckbox" type="border" fontColor="fc-m" class="ml-20" :minWidth="70" @click.native="cancelMultipleDel">取消</MyButton>
              </div>
            </div>

            <el-pagination v-if="studentTable.total"
                class="d-f f-j-c mt-50 mb-20"
                :page-size="studentTable.per_page"
                background layout="total, prev, pager, next"
                :total="studentTable.total"
                :current-page.sync="studentTable.current_page"
                @current-change="paginationClick"
                @next-click="nextClick"
                @prev-click="prevClick">
            </el-pagination>
        </el-card>

        <!-- 修改学员信息弹窗 -->
        <el-dialog title="编辑学员资料" width="800px" center :visible.sync="dialogStatus.student" :close-on-click-modal="false" @close="dialogClose('addStudent')">
            <el-form :model="studentForm" label-width="120px" size="small" ref="addStudent" :rules="rules">
                <div class="form-box">
                    <el-row>
                        <el-col :span="11">
                            <el-form-item label="学员姓名：" prop="student_name">
                                <el-input v-model.trim="studentForm.student_name"></el-input>
                            </el-form-item>

                            <el-form-item label="联系电话：" prop="mobile">
                                <el-input v-model.trim="studentForm.mobile" ref="mobileObj"></el-input>
                            </el-form-item>

                            <el-form-item label="就读学校：" prop="school_name">
                                <el-input v-model.trim="studentForm.school_name" placeholder="选填"></el-input>
                            </el-form-item>

                            <el-form-item label="家长姓名：" prop="parent_name">
                                <el-input v-model.trim="studentForm.parent_name"></el-input>
                            </el-form-item>

                            <el-form-item label="分配顾问：">
                                <el-select v-model="studentForm.advisor_id" placeholder="选择顾问" clearable>
                                    <el-option label="暂不分配" value=""></el-option>
                                    <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>

                        <el-col :span="11" class="ml-30">
                            <el-form-item label="性别：" prop="sex" >
                                <el-select v-model="studentForm.sex" placeholder="选择性别">
                                    <el-option label="男" :value="1"></el-option>
                                    <el-option label="女" :value="0"></el-option>
                                </el-select>
                            </el-form-item>

                            <el-form-item label="出生日期：">
                                <el-date-picker v-model="studentForm.birthday" :picker-options="pickerBeginDateAfter" type="date" :editable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                            </el-form-item>

                            <el-form-item label="家庭住址：" prop="address">
                                <el-input v-model.trim="studentForm.address" placeholder="选填"></el-input>
                            </el-form-item>

                            <el-form-item label="家长关系：" prop="relation">
                                <el-select v-model="studentForm.relation" placeholder="请选择">
                                    <el-option v-for="(item, index) in $store.state.familyRelations" :key="index" :label="item.name" :value="item.id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    </el-row>

                    <div class="d-f f-j-c mt-30"><MyButton @click.native="doneHandle('addStudent')" :loading="submitLoading.student">确定</MyButton></div>
                </div>
            </el-form>
        </el-dialog>

        <!-- 分班弹窗 -->
        <el-dialog title="分班" width="800px" center :visible.sync="dialogStatus.divideGrade" :close-on-click-modal="false" @close="dialogClose('divideGrade')">
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

        <!-- 试听弹窗 -->
        <AddAudition v-model="dialogStatus.audition" :studentId="listStudentId"></AddAudition>
    </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import Classify from '../../components/common/StudentClassify';
import AddAudition from '../../components/dialog/AddAudition';
import Bus from '../../script/bus';
import qs from 'qs';
import config from 'config';

export default {
  components: {TableHeader, Classify, MyButton, AddAudition},
  data () {
    return {
      state: 'loading',
      activeTab: 'onCourse',
      currPage: false,

      activePage: 1,
      isDelete: false,
      isShowCheckbox: false,
      selectedIds: [], //批量删除学员列表

      dialogStatus: {audition: false, divideGrade: false, student: false},

      hasContact: true,
      contactDot: 0,

      submitLoading: {
        student: false, divideClass: false
      },

      gradeDivideLists: {
        lists: [],
        disabled: false
      },

      listStudentId: '',
      operationLists: [
        {type: 'audition', text: '试听'},
        {type: 'divideGrade', text: '分班'},
        {type: 'edit', text: '编辑'},
        {type: 'delete', text: '删除'}
      ],

      monthArr: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],

      svg_src: null,
      searchKeyWord: '',

      divideClassRadio: '',

      tabLists: [],
      loading: true,
      studentTable: {}, //学员table列表
      searchFilter: { //学员搜索筛选条件
        course_id: '', advisor_id: '', absent_what_time: '', sign_what_time: '', gift_status: '', month: ''
      },
      studentForm: {id: '', student_name: '', parent_name: '', relation: '', mobile: '', address: '', sex: '', birthday: '', school_name: '', advisor_id: ''},
      rules: {
        parent_name: [
          // {required: true, message: '请输入家长姓名'},
          {max: 7, message: '长度不能超过7个字符'}
        ],
        relation: [
          // {required: true, message: '请选择关系', trigger: 'change'}
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
      pickerBeginDateAfter: {
        disabledDate: (time) => {
          return time.getTime() > new Date().getTime();
        }
      }
    };
  },
  methods: {
    getDays () {
      let date = new Date();
      let y = date.getFullYear();
      let m = date.getMonth() + 1;

      if (m == 2) {
        return y % 4 == 0 ? 29 : 28;
      } else if (m == 1 || m == 3 || m == 5 || m == 7 || m == 8 || m == 10 || m == 12) {
        return 31;
      }

      return 30;
    },
    //搜索
    searchHandle () {
      this.getStudentLists();
    },
    //导出学员
    async exportStudent () {
      let token = this.$$cache.get('TOKEN') || this.$$cache.getSession('TOKEN') || '';
      let params = {type: this.activeTab, token: token.replace('bearer ', '')};

      if (this.searchKeyWord) {
        if (isNaN(this.searchKeyWord)) {
          params.name = this.searchKeyWord;
          params.mobile = '';
        } else {
          params.mobile = this.searchKeyWord;
          params.name = '';
        }
      } else {
        params.mobile = '';
        params.name = '';
      }

      if (this.activeTab === 'birthday') {
        params.gift_status = this.searchFilter.gift_status;
        params.month = this.searchFilter.month;
      } else {
        params.course_id = this.searchFilter.course_id;
        if (this.activeTab === 'onCourse') {
          params.advisor_id = this.searchFilter.advisor_id;
          params.what_time = this.searchFilter.sign_what_time;
          params.teacher_id = '';
        } else if (this.activeTab === 'noGrade') {
          params.advisor_id = this.searchFilter.advisor_id;
        } else if (this.activeTab === 'absent') {
          params.what_time = this.searchFilter.absent_what_time;
        }
      }

      console.log(params);

      window.location.href = `${config.api}sign/export?${qs.stringify(params)}`;
    },
    //关闭弹窗
    dialogClose (form) {
      if (form === 'divideGrade') {
        this.divideClassRadio = '';
      } else {
        this.$refs[form].resetFields();
        Object.keys(this.studentForm).forEach(v => {
          this.studentForm[v] = '';
        });
      }
    },
    //tab标签切换筛选列表
    tabClick (tab) {
      this.searchKeyWord = '';

      if (tab.type != this.activeTab) {
        this.loading = true;
        for (let key in this.searchFilter) {
          if (key != 'month') {
            this.searchFilter[key] = '';
          }
        }
        this.activeTab = tab.type;
        this.getStudentLists();
      }
    },
    handleSelectionChange (x) {
      this.selectedIds = x.map(v => v.id);
    },
    handleCommand (d) {
      console.log(d);
      switch (d.type) {
        case 'buyCourse':
          this.buyCourse(d.data.course_lists[0]);
          break;
        case 'divideGrade':
          this.divideGradeHandle(d.data.course_lists[0]);
          break;
        case 'audition':
          this.addAudition(d.data.student_id);
          break;
        case 'edit':
          this.editStudent(d.data.course_lists[0]);
          break;
        case 'delete':
          this.deleteStudent(d.data.student_id);
          break;
        default:
          break;
      }
    },
    // 试听
    addAudition (id) {
      this.listStudentId = id;
      this.dialogStatus.audition = true;
    },
    // 购课 isFirst 是否首次购课
    buyCourse (data) {
      let params = {
        student_id: data.student_id,
        advisor_id: data.advisor_id,
        advisor: data.advisor_id ? {id: data.advisor_id, name: data.advisor_name} : null,
        parent_id: data.parent_id,
        deposit_money: -1
      };

      this.$router.push({path: '/student/nosignbuycourse', query: {buyCourseData: JSON.stringify(params)}});
    },
    //生日筛选点击
    birthdayChange () {
      if (this.searchFilter.end_time < this.searchFilter.start_time) {
        return this.$message.warning('结束时间不能小于开始时间，请从新选择');
      }
      this.searchHandle();
    },
    //发放礼品点击
    grantGift (data) {
      if (data.gift_status) {
        return 0;
      }

      this.$confirm('确定发放礼品吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.grantGiftHandle(data.id);
      }).catch(() => {
        return 0;
      });
    },
    async grantGiftHandle (id) {
      let result = await this.$$request.post('/sign/gift', {student_id: id});

      console.log(result);

      if (!result) {
        return 0;
      }
      this.$message.success('礼品发放状态修改成功');
      this.getStudentLists(this.activePage);
    },
    //修改学员信息
    editStudent (data) {
      console.log(data);

      Object.keys(this.studentForm).forEach(v => {
        if (v == 'id') {
          this.studentForm[v] = data.student_id;
        } else if (v == 'birthday') {
          this.studentForm[v] = data.birthday > 0 ? data.birthday * 1000 : '';
        } else {
          this.studentForm[v] = data[v];
        }
      });

      this.dialogStatus.student = true;
    },
    //分班按钮点击
    divideGradeHandle (data) {
      this.listStudentId = data.student_id;
      this.getStudentGradeLists();
    },
    //分配顾问点击
    advisorClick (data) {
      console.log(data);
      this.listStudentId = data.student_id;
    },
    //列表顾问选择
    async listAdvisorChange (val) {
      let result = await this.$$request.post('/student/distribute', {student_id: this.listStudentId, advisor_id: val});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.getAllLists(true);
    },
    //表单确定
    doneHandle (type) {
      this.$refs[type].validate(valid => {
        if (valid) {
          this.submitStudentInfo();
        }
      });
    },
    //流失学员
    lossStudent (id) {
      this.$confirm('确定改为流失学员吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.lossHandle(id);
      }).catch(() => {
        return 0;
      });
    },
    async lossHandle (id) {
      let result = await this.$$request.post('/sign/setLoss', {student_id: id});

      console.log(result);

      if (!result) {
        return 0;
      }
      this.$message.success('已改为流失学员');
      this.getAllLists();
    },
    //删除学员
    deleteStudent (id) {
      if (id === 'all' && !this.selectedIds.length) {
        return this.$message.error('请至少选中一条数据');
      }

      this.$confirm(`学员删除之后数据不能恢复，请确认进行${id === 'all' ? '批量' : ''}删除操作！`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteHandle(id);
      }).catch(() => {
        return 0;
      });
    },
    async deleteHandle (id) {
      let result = await this.$$request.post('/sign/delete', {student_id: id === 'all' ? this.selectedIds : [id]});

      if (!result) {
        return 0;
      }

      if (id === 'all') {
        this.isShowCheckbox = false;
        this.selectedIds.splice(0, this.selectedIds.length);
      }

      this.$message.success('已删除');
      this.getAllLists();
    },
    // 取消批量删除
    cancelMultipleDel () {
      this.isShowCheckbox = false;
      this.selectedIds.splice(0, this.selectedIds.length);
      this.$refs.studentTable.clearSelection();
    },
    nextClick (currentPage) {
      this.currPage = true;
      this.getStudentLists(currentPage);
    },
    prevClick (currentPage) {
      this.currPage = true;
      this.getStudentLists(currentPage);
    },
    //列表分页点击
    paginationClick (currentPage) {
      if (!this.currPage) {
        this.getStudentLists(currentPage);
      }
      this.currPage = false;
    },
    //提交学员信息
    async submitStudentInfo () {
      if (this.submitLoading.student) {
        return 0;
      }
      this.submitLoading.student = true;

      let params = {};

      for (let key in this.studentForm) {
        params[key] = key == 'birthday' ? this.studentForm[key] / 1000 : this.studentForm[key];
      }

      let result = await this.$$request.post('/sign/edit', params);

      setTimeout(d => {
        this.submitLoading.student = false;
      }, 500);
      console.log(result);
      if (!result) {
        return 0;
      }

      this.dialogStatus.student = false;
      this.$message.success('修改成功');
      this.getAllLists(true);
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
                this.submitDivideClass();
              }).catch(() => {
                return 0;
              });
            } else {
              this.submitDivideClass();
            }
          }
        });
      });
    },
    //提交分班信息
    async submitDivideClass () {
      if (this.submitLoading.divideClass) {
        return 0;
      }
      this.submitLoading.divideClass = true;

      let result = await this.$$request.post('/studentGrade/add', {
        grade_id: this.divideClassRadio,
        student_id: this.listStudentId
      });

      this.submitLoading.divideClass = false;
      if (!result) {
        return 0;
      }
      this.$message.success('分班成功');
      this.dialogStatus.divideGrade = false;
    },
    async getAllLists (isCurrPage) {
      let [a, b] = await Promise.all([this.getTabLists(), this.getStudentLists(isCurrPage ? this.activePage : false)]);

      return a && b;
    },
    //获取tab列表
    async getTabLists (isCurrPage) {
      let result = await this.$$request.post('/sign/tab');

      console.log(result);
      if (!result) {
        return 0;
      }

      result.lists.forEach(v => {if(v.type === 'invalid') v.type = 'over'});

      this.tabLists = result.lists;

      if (this.$$cache.getMemberInfo().class_pattern == 2) {
        this.tabLists.forEach((v, n) => {
          if (v.type === 'noGrade') {
            this.tabLists.splice(n, 1);
          }
        });
      }

      return true;
    },
    //课程列表，点击分班，获取班级列表
    async getStudentGradeLists () {
      let result = await this.$$request.post('/sign/courseLists', {student_id: this.listStudentId});

      console.log(result);
      if (!result) {
        return 0;
      }

      if (!result.lists.length) {
        return this.$message.warning('没有可分班的课程!');
      }
      this.gradeDivideLists.lists = result.lists;
      this.gradeDivideLists.disabled = result.lists.every(k => {
        return k.grade.length ? false : true;
      });

      this.dialogStatus.divideGrade = true;
    },
    //获取学员列表
    async getStudentLists (currentPage) {
      this.loading = true;
      let params = {};

      if (this.searchKeyWord) {
        if (isNaN(this.searchKeyWord)) {
          params.name = this.searchKeyWord;
          params.mobile = '';
        } else {
          params.mobile = this.searchKeyWord;
          params.name = '';
        }
      } else {
        params.mobile = '';
        params.name = '';
      }

      if (this.activeTab === 'birthday') {
        params.gift_status = this.searchFilter.gift_status;
        params.month = this.searchFilter.month;
      } else {
        params.course_id = this.searchFilter.course_id;
        if (this.activeTab === 'onCourse') {
          params.advisor_id = this.searchFilter.advisor_id;
          params.what_time = this.searchFilter.sign_what_time;
          params.teacher_id = '';
        } else if (this.activeTab === 'noGrade') {
          params.advisor_id = this.searchFilter.advisor_id;
        } else if (this.activeTab === 'absent') {
          params.what_time = this.searchFilter.absent_what_time;
        }

      }

      let newParams = {data: params};

      if (currentPage) {
        newParams.page = currentPage;
      }

      let result = await this.$$request.post(`sign/${this.activeTab === 'over' ? 'invalid' : this.activeTab}`, newParams);

      console.log(result);
      if (!result) {
        return 0;
      }

      this.activePage = currentPage ? currentPage : 1;
      result.lists.data = this.mergeHandle(result.lists.data);

      this.studentTable = result.lists;
      this.loading = false;

      return true;
    },
    //签约学员合并
    mergeHandle (data) {
      let obj = {};

      let map = {}, dest = [];

      for (let i = 0, len = data.length; i < len; i++) {
        let ai = data[i];

        if (!map[ai.student_id]) {
          dest.push({
            student_id: ai.student_id,
            mobile: ai.mobile,
            advisor_id: ai.advisor_id,
            advisor_name: ai.advisor_name,
            student_name: ai.student_name,
            course_lists: [ai]
          });

          map[ai.student_id] = ai;
        } else {
          for (let j = 0, len = dest.length; j < len; j++) {
            let dj = dest[j];

            if (dj.student_id == ai.student_id) {
              dj.course_lists.push(ai);
              break;
            }
          }
        }
      }

      if (this.activeTab === 'absent') {
        data.sort((a, b) => {
          return a.begin_time < b.begin_time;
        });

        return data;
      }

      if (this.activeTab === 'birthday') {
        return data;
      }

      return dest;
    }
  },
  async created () {
    this.isDelete = this.$$cache.getMemberInfo().type === 'institution' || this.$$cache.getMemberInfo().type === 'master';
    this.searchFilter.month = new Date().getMonth() + 1;
    let datas = await this.getAllLists();

    if (datas) {
      this.state = 'loaded';
    }
    //监听如果详情修改，那么刷新学员列表
    Bus.$on('refreshSignedStudentLists', () => {
      this.getStudentLists();
    });
  },
  beforeRouteEnter (to, from, next) {
    //判断如果是未签约详情过来，那么就不用刷新，直接取缓存即可，否则其他页面过来的，都需要刷新整个页面
    if (from.name == 'signedDetail') {
      to.meta.keepAlive = true;
    } else {
      to.meta.keepAlive = false;
    }
    next(); //来到页面，包括通过返回
  },
  beforeDestroy () {
    Bus.$off('refreshSignedStudentLists');
  }
};
</script>

<style lang="less" scoped>
    .header-tab-box {
        margin-top: 50px;
        padding: 0 20px;
    }
    .fifter-toolbar {
        ul li {
            margin-right: 20px;
            &:not(:last-child) {
                width: 105px;
            }
            &.birthday-date {
                width: auto;
                .el-select {
                    width: 100px;
                }
            }
            &.name {
                width: auto;
            }
        }
    }
    .form-box {
        padding: 0 30px;
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
        &.divide-grade-dialog {
            height: 250px;
            overflow: hidden;
            overflow-y: auto;
        }
    }
    .student-table {
        border-top: 1px #e3e3e3 solid;
        .allocation-advisor-btn {
            width: 50px;
            line-height: 22px;
            border: 1px #45DAD5 solid;
            border-radius: 3px;
            text-align: center;
            color: #45DAD5;
            cursor: pointer;
        }
        .grant-gift {
            width: 80px;
            height: 30px;
            line-height: 30px;
            border: 1px #e3e3e3 solid;
            border-radius: 5px;
            color: #999;
            &.active {
                color: #45DAD5;
                border: 1px #45DAD5 solid;
                cursor: pointer;
            }
        }
    }
    .ground-route-table,
    .ground-route-table-samll {
        width: 100%;
        border: 1px solid #dfe6ec;
        border-collapse: collapse;
    }
    .ground-route-table td{
        border: 1px solid #dfe6ec;
    }
    .multiple-del-box {
      position: absolute;
      top: 20px;
      left: 0;
    }
</style>


