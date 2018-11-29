<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <TableHeader title="签约学员">
                <router-link v-if="$$tools.isAuthority('importStudent')" :to="{path: '/student/importstudent'}"><MyButton icon="import" type="border" fontColor="fc-m">导入学员</MyButton></router-link>
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
                    <li v-if="(activeTab === 'onCourse' || activeTab === 'noGrade') && $$tools.isAuthority('viewAllData') && !$$tools.isDepartment('consulting_department')">
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

                <MyButton icon="import" v-if="$$tools.isAuthority('exportStudent')" type="border" fontColor="fc-m" class="ml-20" @click.native="exportAuthority">导出学员</MyButton>
            </div>

            <div class="student-lists-box mt-20">
                <!-- 上课学员列表 -->
                <el-table class="student-table" key='aTable' v-if="activeTab === 'onCourse'" :data="studentTable.data" v-loading="loading" ref="studentTable" @selection-change="handleSelectionChange" stripe>
                    <el-table-column type="selection" width="30" v-if="isShowCheckbox"></el-table-column>
                    <el-table-column label="序号" prop="index" type="index" align="center"></el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope">
                            <router-link v-if="$$tools.isAuthority('signDetail')" :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}" class="fc-m">{{scope.row.student_name}}</router-link>
                            <span v-else>{{scope.row.student_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <div v-if="scope.row.advisor_id > 0">{{scope.row.advisor_name}}</div>
                            <div v-else-if="$$tools.isAuthority('assignConsultant')" class="d-f f-a-c f-j-c">
                                <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                    <span class="el-dropdown-link">
                                        <div class="allocation-advisor-btn" slot="reference" @click="advisorClick(scope.row)">分配</div>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                        <el-scrollbar style="height: 100%;">
                                            <el-dropdown-item v-for="(item, index) in $$tools.getAdvisorLists()" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                        </el-scrollbar>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                            <div v-else>暂无顾问</div>
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

                    <el-table-column label="操作" class-name="table-item" align="center" v-if="operationLists.length">
                        <template slot-scope="scope">
                            <span v-for="(operation, num) in operationLists" :key="num" class="fc-m cursor-pointer" @click="handleCommand({type: operation.type, data: scope.row})"
                              :class="{'ml-10': num}" v-if="operationLists.length <= 3 && num < 3 || operationLists.length > 3 && num < 2">
                              {{operation.text}}
                            </span>
                            <el-dropdown trigger="click" @command="handleCommand" placement="bottom" v-if="operationLists.length > 3">
                              <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                              <el-dropdown-menu slot="dropdown" class="operation-lists">
                                <el-dropdown-item v-for="(operation, index) in operationLists" :key="index" v-if="index > 1"
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
                            <router-link v-if="$$tools.isAuthority('signDetail')" :to="{path: '/student/signeddetail', query: {id: scope.row.id}}" class="fc-m">{{scope.row.name}}</router-link>
                            <span v-else>{{scope.row.name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <div v-if="scope.row.advisor_id > 0">{{scope.row.advisor_name}}</div>
                            <div v-else-if="$$tools.isAuthority('assignConsultant')" class="d-f f-a-c f-j-c">
                                <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                    <span class="el-dropdown-link">
                                        <div class="allocation-advisor-btn" slot="reference" @click="advisorClick(scope.row)">分配</div>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                        <el-scrollbar style="height: 100%;">
                                            <el-dropdown-item v-for="(item, index) in $$tools.getAdvisorLists()" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                        </el-scrollbar>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                            <div v-else>暂无顾问</div>
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
                    <el-table-column v-if="$$tools.isAuthority('sendGift')" label="操作" align="center">
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
                            <router-link v-if="$$tools.isAuthority('signDetail')" :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}" class="fc-m">{{scope.row.student_name}}</router-link>
                            <span v-else>{{scope.row.student_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <div v-if="scope.row.advisor_id > 0">{{scope.row.advisor_name}}</div>
                            <div v-else-if="$$tools.isAuthority('assignConsultant')" class="d-f f-a-c f-j-c">
                                <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                    <span class="el-dropdown-link">
                                        <div class="allocation-advisor-btn" slot="reference" @click="advisorClick(scope.row)">分配</div>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                        <el-scrollbar style="height: 100%;">
                                            <el-dropdown-item v-for="(item, index) in $$tools.getAdvisorLists()" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                        </el-scrollbar>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                            <div v-else>暂无顾问</div>
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
                    <el-table-column label="操作" class-name="table-item" align="center" v-if="operationLists.length">
                        <template slot-scope="scope">
                            <span v-for="(operation, num) in operationLists" :key="num" class="fc-m cursor-pointer" @click="handleCommand({type: operation.type, data: scope.row})"
                              :class="{'ml-10': num}" v-if="operationLists.length <= 3 && num < 3 || operationLists.length > 3 && num < 2">
                              {{operation.text}}
                            </span>
                            <el-dropdown trigger="click" @command="handleCommand" placement="bottom" v-if="operationLists.length > 3">
                              <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                              <el-dropdown-menu slot="dropdown" class="operation-lists">
                                <el-dropdown-item v-for="(operation, index) in operationLists" :key="index" v-if="index > 1"
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
                            <router-link v-if="$$tools.isAuthority('signDetail')" :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}" class="fc-m">{{scope.row.student_name}}</router-link>
                            <span v-else>{{scope.row.student_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <div v-if="scope.row.advisor_id > 0">{{scope.row.advisor_name}}</div>
                            <div v-else-if="$$tools.isAuthority('assignConsultant')" class="d-f f-a-c f-j-c">
                                <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                    <span class="el-dropdown-link">
                                        <div class="allocation-advisor-btn" slot="reference" @click="advisorClick(scope.row)">分配</div>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                        <el-scrollbar style="height: 100%;">
                                            <el-dropdown-item v-for="(item, index) in $$tools.getAdvisorLists()" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                        </el-scrollbar>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                            <div v-else>暂无顾问</div>
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
                    <el-table-column label="操作" class-name="table-item" align="center" v-if="operationLists.length">
                        <template slot-scope="scope">
                            <span v-for="(operation, num) in operationLists" :key="num" class="fc-m cursor-pointer" @click="handleCommand({type: operation.type, data: scope.row})"
                              :class="{'ml-10': num}" v-if="operationLists.length <= 3 && num < 3 || operationLists.length > 3 && num < 2">
                              {{operation.text}}
                            </span>
                            <el-dropdown trigger="click" @command="handleCommand" placement="bottom" v-if="operationLists.length > 3">
                              <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                              <el-dropdown-menu slot="dropdown" class="operation-lists">
                                <el-dropdown-item v-for="(operation, index) in operationLists" :key="index" v-if="index > 1"
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
                            <router-link v-if="$$tools.isAuthority('signDetail')" :to="{path: '/student/signeddetail', query: {id: scope.row.student_id}}" class="fc-m">{{scope.row.student_name}}</router-link>
                            <span v-else>{{scope.row.student_name}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" prop="mobile" align="center"></el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <div v-if="scope.row.advisor_id > 0">{{scope.row.advisor_name}}</div>
                            <div v-else-if="$$tools.isAuthority('assignConsultant')" class="d-f f-a-c f-j-c">
                                <el-dropdown trigger="click" placement="left" @command="listAdvisorChange">
                                    <span class="el-dropdown-link">
                                        <div class="allocation-advisor-btn" slot="reference" @click="advisorClick(scope.row)">分配</div>
                                    </span>
                                    <el-dropdown-menu slot="dropdown" class="allocation-advisor-tooltip my-scrollbar">
                                        <el-scrollbar style="height: 100%;">
                                            <el-dropdown-item v-for="(item, index) in $$tools.getAdvisorLists()" :command="item.id" :key="index">{{item.name}}</el-dropdown-item>
                                        </el-scrollbar>
                                    </el-dropdown-menu>
                                </el-dropdown>
                            </div>
                            <div v-else>暂无顾问</div>
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


                    <el-table-column label="操作" class-name="table-item" align="center" v-if="(activeTab === 'over' && invalidLists.length) || (activeTab === 'loss' && lostLists.length)">
                        <template slot-scope="scope">
                            <div v-if="activeTab === 'over'" key="over_operation">
                              <span v-for="(operation, num) in invalidLists" :key="num" class="fc-m cursor-pointer" @click="handleCommand({type: operation.type, data: scope.row})"
                                :class="{'ml-10': num}" v-if="invalidLists.length <= 3 && num < 3 || invalidLists.length > 3 && num < 2">
                                {{operation.text}}
                              </span>
                              <el-dropdown trigger="click" @command="handleCommand" placement="bottom" v-if="invalidLists.length > 3">
                                <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                                <el-dropdown-menu slot="dropdown" class="operation-lists">
                                  <el-dropdown-item v-for="(operation, index) in invalidLists" :key="index" v-if="index > 1"
                                    :command="{type: operation.type, data: scope.row}">{{ operation.text}}
                                  </el-dropdown-item>
                                </el-dropdown-menu>
                              </el-dropdown>
                            </div>

                            <div v-else key="loss_operation">
                              <span v-for="(operation, num) in lostLists" :key="num" class="fc-m cursor-pointer" @click="handleCommand({type: operation.type, data: scope.row})"
                                :class="{'ml-10': num}" v-if="lostLists.length <= 3 && num < 3 || lostLists.length > 3 && num < 2">
                                {{operation.text}}
                              </span>
                              <el-dropdown trigger="click" @command="handleCommand" placement="bottom" v-if="lostLists.length > 3">
                                <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                                <el-dropdown-menu slot="dropdown" class="operation-lists">
                                  <el-dropdown-item v-for="(operation, index) in lostLists" :key="index" v-if="index > 1"
                                    :command="{type: operation.type, data: scope.row}">{{ operation.text}}
                                  </el-dropdown-item>
                                </el-dropdown-menu>
                              </el-dropdown>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>

            <div class="d-f p-r" v-if="$$tools.isAuthority('deleteSigned')">
              <div class="multiple-del-box d-f f-a-c">
                <!-- <span v-if="isShowCheckbox" class="fc-9 cursor-pointer" :class="{'fc-m': selectedIds.length}" @click="distributionAdvisor">批量分配</span> -->
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

        <!-- 分班弹窗 -->
        <el-dialog title="分班" width="800px" center :visible.sync="dialogStatus.divideGrade" :close-on-click-modal="false" @close="dialogClose('divide_grade')">
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

        <!-- 学员基础信息 -->
        <EditStudent v-model="dialogStatus.student" :editDetail="studentDetail" @CB-success="CB_success" @CB-dialogStatus="CB_dialogStatus"></EditStudent>

        <!-- 删除学员错误 -->
        <el-dialog title="错误提示" width="500px" center :visible.sync="dialogStatus.errorAlert" :close-on-click-modal="false" @close="dialogClose('errorAlert')">
            <p>以下学员课程已开课，无法进行删除操作：</p>
            <p class="mt-20"><span :class="{'pl-10': index}" v-for="(item, index) in deleteErrorStudents" :key="index">{{item}}</span></p>
            <div class="d-f f-j-c mt-30"><MyButton @click.native="dialogStatus.errorAlert = false">返回</MyButton></div>
        </el-dialog>
    </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
import Classify from '../../components/common/StudentClassify';
import AddAudition from '../../components/dialog/AddAudition';
import EditStudent from '../../components/dialog/StudentSigned';

import Bus from '../../script/bus';
import qs from 'qs';
import config from 'config';

const OperationLists = [
  {type: 'buy_course', text: '购课', permission: 'purchaseViewCourse'},
  {type: 'audition', text: '试听', permission: 'handleAudition'},
  {type: 'divide_grade', text: '分班', permission: 'divideClasses'},
  {type: 'edit', text: '编辑', permission: 'editSigned'},
  {type: 'delete', text: '删除', permission: 'deleteSigned'}
];

const InvalidOperation = [
  {type: 'buy_course', text: '购课', permission: 'purchaseViewCourse'},
  {type: 'loss_student', text: '流失', permission: 'endTurnLose'},
  {type: 'audition', text: '试听', permission: 'handleAudition'},
  {type: 'edit', text: '编辑', permission: 'editSigned'},
  {type: 'delete', text: '删除', permission: 'deleteSigned'}
];

const LoseOperation = [
  {type: 'buy_course', text: '购课', permission: 'purchaseViewCourse'},
  {type: 'delete', text: '删除', permission: 'deleteSigned'},
  {type: 'audition', text: '试听', permission: 'handleAudition'},
  {type: 'edit', text: '编辑', permission: 'editSigned'}
];

export default {
  components: {TableHeader, Classify, MyButton, AddAudition, EditStudent},
  data () {
    return {
      state: 'loading',
      activeTab: 'onCourse',
      currPage: false,

      activePage: 1,
      isShowCheckbox: false,
      selectedIds: [], //批量删除学员列表
      deleteErrorStudents: [],

      dialogStatus: {audition: false, divideGrade: false, student: false, errorAlert: false, advisor: false},

      studentDetail: {},

      submitLoading: {
        student: false, divideClass: false, advisor: false
      },

      // 分班数据
      gradeDivideLists: {
        lists: [],
        disabled: false
      },

      listStudentId: '',
      advisorId: '',

      operationLists: [],
      invalidLists: [],
      lostLists: [],

      monthArr: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],

      svg_src: null,
      searchKeyWord: '',

      divideClassRadio: '',

      tabLists: [],
      loading: true,
      studentTable: {}, //学员table列表
      searchFilter: { //学员搜索筛选条件
        course_id: '', advisor_id: '', absent_what_time: '', sign_what_time: '', gift_status: '', month: ''
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
    async exportAuthority () {
      let res = await this.$$request.get('/sign/exportShadow');
      console.log(res)
      if (!res) {
        return 0;
      }
      this.exportStudent();
    },
    //导出学员
    async exportStudent () {
      let token = this.$$cache.get('TOKEN') || this.$$cache.getSession('TOKEN') || '';
      let params = {type: this.activeTab === 'over' ? 'invalid' : this.activeTab , token: token.replace('bearer ', '')};

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
    dialogClose (type) {
      if (type === 'divide_grade') {
        this.divideClassRadio = '';
      } else if (type === 'errorAlert') {
        this.deleteErrorStudents = [];
      } else if (type === 'advisor') {
        this.advisorId = '';
      }
    },
    CB_dialogStatus () {
      this.studentDetail = {};
    },
    CB_success () {
      this.getAllLists(true);
    },
    // CB_auditionSuccess () {
    //   this.getStudentLists(this.activePage);
    // },
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
      this.selectedIds = x.map(v => {
        return {student_id: v.student_id, student_name: v.student_name}
      });
    },
    handleCommand (d) {
      switch (d.type) {
        case 'buy_course':
          this.buyCourse(d.data.course_lists[0]);
          break;
        case 'divide_grade':
          this.divideGradeHandle(d.data.course_lists[0]);
          break;
        case 'audition':
          this.addAudition(d.data.student_id);
          break;
        case 'edit':
          this.editStudent(d.data.course_lists[0]);
          break;
        case 'loss_student':
          this.lossStudent(d.data.student_id);
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
        advisor_id: data.advisor_id ? data.advisor_id : 0,
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
      let result = await this.$$request.post('/student/sendGift', {student_id: id, type: 2});

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
      this.studentDetail = data;
      this.dialogStatus.student = true;
    },
    //分班按钮点击
    divideGradeHandle (data) {
      this.listStudentId = data.student_id;
      this.getStudentGradeLists();
    },
    //分配顾问点击
    advisorClick (data) {
      this.listStudentId = data.student_id;
    },
    //列表顾问选择
    async listAdvisorChange (id) {
      let result = await this.$$request.post('/student/distribute', {
        student_id: [this.listStudentId],
        advisor_id: id
      });
      console.log(result);

      if (!result) {
        return 0;
      }

      this.getAllLists(true);
      this.$message.success('分配成功');
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
      this.getAllLists(true);
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
      let result = await this.$$request.post('/sign/delete', {student_id: id === 'all' ? this.selectedIds.map(v => v.student_id) : [id]});

      console.log(result);

      if (!result) {
        return 0;
      }

      if (result.can_not_delete_names.length) {
        this.deleteErrorStudents = result.can_not_delete_names;
        this.dialogStatus.errorAlert = true;
      } else {
        this.$message.success('已删除');
        if (id === 'all') {
          this.isShowCheckbox = false;
          this.selectedIds.splice(0, this.selectedIds.length);
        }
      }
      this.getAllLists(true);
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
    async getTabLists () {
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
    this.searchFilter.month = new Date().getMonth() + 1;

    this.operationLists = OperationLists.filter(v => {
      return this.$$tools.isAuthority(v.permission);
    });

    this.invalidLists = InvalidOperation.filter(v => {
      return this.$$tools.isAuthority(v.permission);
    });

    this.lostLists = LoseOperation.filter(v => {
      return this.$$tools.isAuthority(v.permission);
    });

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


