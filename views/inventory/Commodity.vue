<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <TableHeader title="物品管理">
                <MyButton @click.native="typeSetting" type="border" fontColor="fc-m">类型设置</MyButton>
                <MyButton @click.native="addCommodity" class="ml-20">添加物品</MyButton>
            </TableHeader>

            <div class="fifter-toolbar mt-30">
                <ul class="d-f">
                    <li>
                        <el-select size="small" placeholder="全部物品类型" v-model="searchFilter.commodity_type" @change="searchHandle">
                            <el-option label="全部物品类型" value=""></el-option>
                            <el-option v-for="(item, index) in commodityTypeLists" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </li>
                    <li>
                        <el-select size="small" placeholder="全部使用类型" v-model="searchFilter.use_type" @change="searchHandle">
                            <el-option label="全部使用类型" value=""></el-option>
                            <el-option label="内部使用" :value="1"></el-option>
                            <el-option label="对外销售" :value="2"></el-option>
                        </el-select>
                    </li>
                    <li class="name"><el-input size="small" placeholder="请输入物品名称" v-model.trim="searchFilter.keyword"></el-input></li>
                    <li><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
                </ul>
            </div>

            <el-table class="mt-20 bor-t" :data="commodityTable.data" v-loading="loading" stripe>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="物品名称" prop="name" align="center"></el-table-column>
                <el-table-column label="物品类型" prop="type_name" align="center"></el-table-column>
                <el-table-column label="使用类型" align="center">
                    <template slot-scope="scope">{{scope.row.use_type == 1 ? '内部使用' : '对外销售'}}</template>
                </el-table-column>
                <el-table-column label="进货单价" align="center">
                    <template slot-scope="scope">{{scope.row.stock_price}}元</template>
                </el-table-column>
                <el-table-column label="销售单价" align="center">
                    <template slot-scope="scope">
                      <span v-if="scope.row.use_type == 1">--</span>
                      <span v-else>{{scope.row.price}}元</span>
                    </template>
                </el-table-column>
                <el-table-column label="实际库存" prop="real_num" align="center">
                  <template slot-scope="scope">
                      <div v-if="scope.row.real_num > scope.row.warning">{{scope.row.real_num}}</div>
                      <div v-else class="d-f f-j-c">
                          <el-popover popper-class="grade-student-popver" placement="right" trigger="hover" :content="`该物品库存已少于等于${scope.row.warning}件，请及时补充库存！`">
                              <div slot="reference" class="ml-5 cursor-pointer">
                                  <span class="fc-r">{{scope.row.real_num}}</span>
                                  <i class="iconfont icon-zhuyidapx fc-r"></i>
                              </div>
                          </el-popover>
                      </div>
                  </template>
                </el-table-column>

                <el-table-column label="待售库存" prop="organ_has" align="center"></el-table-column>
                <el-table-column label="学员库存" prop="student_total" align="center"></el-table-column>
                <el-table-column label="物品单位" prop="unit" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <span class="fc-m cursor-pointer" @click="addStorage(scope.row)">入库</span>
                        <span class="fc-m ml-10 cursor-pointer" @click="removeStorage(scope.row)">出库</span>
                        <el-dropdown trigger="click" @command="handleCommand" placement="bottom">
                            <span class="fc-m ml-10 cursor-pointer el-dropdown-link">更多</span>
                            <el-dropdown-menu slot="dropdown" class="operation-lists">
                                <el-dropdown-item v-for="(operation, index) in operationLists" :key="index"
                                    :disabled="operation.type == 'borrow' && scope.row.use_type == 2"
                                    :command="{type: operation.type, data: scope.row}">{{operation.text}}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination v-if="commodityTable.total"
                class="d-f f-j-c mt-50 mb-50"
                :page-size="commodityTable.per_page"
                background layout="total, prev, pager, next"
                :total="commodityTable.total"
                :current-page="commodityTable.current_page"
                @current-change="paginationClick">
            </el-pagination>
        </el-card>

        <!-- 添加物品弹窗 -->
        <el-dialog :title="`${operationCommodity == 'add' ? '添加' : '编辑'}物品`" width="720px" center :visible.sync="dialogStatus.addCommodity" :close-on-click-modal="false" @close="dialogClose('addCommodity')">
            <el-form :model="addCommodityForm" label-width="125px" size="small" ref="addCommodity" :rules="addRules" class="form-box">
                <el-row>
                    <el-col :span="11">
                        <el-form-item label="物品名称：" prop="name">
                            <el-input v-model.trim="addCommodityForm.name" placeholder="请输入物品名称"></el-input>
                        </el-form-item>

                        <el-form-item label="使用类型：" prop="use_type">
                            <el-select v-model="addCommodityForm.use_type" placeholder="请选择">
                                <el-option label="内部使用" :value="1"></el-option>
                                <el-option label="对外销售" :value="2"></el-option>
                            </el-select>
                        </el-form-item>

                        <el-form-item label="库存预警：" prop="warning">
                            <el-input placeholder="库存预警" type="number" v-model.number="addCommodityForm.warning"></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="11">
                        <el-form-item label="物品类型：" prop="type" class="p-r">
                            <el-select v-model="addCommodityForm.type" placeholder="请选择">
                                <el-option v-for="(item, index) in commodityTypeLists" v-if="item.status != -2" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                            <div class="p-a add-commodity-type ver-c cursor-pointer" @click="addCommodityType"><img src="../../images/common/add.png" alt=""></div>
                        </el-form-item>

                        <el-form-item label="物品单位：" prop="unit">
                            <el-input placeholder="物品单位" v-model.trim="addCommodityForm.unit"></el-input>
                        </el-form-item>

                        <el-form-item label="销售价格：" prop="price" class="units-input" v-if="addCommodityForm.use_type == 2">
                            <el-input placeholder="销售价格" v-model="addCommodityForm.price"></el-input><span class="pl-10">元</span>
                        </el-form-item>
                    </el-col>
                </el-row>

                <div class="d-f f-j-c mt-20"><MyButton @click.native="doneHandle('addCommodity')" :loading="submitLoading.add">确定</MyButton></div>
            </el-form>

            <el-dialog title="添加物品类型" width="500px" center :visible.sync="dialogStatus.commodityType" :close-on-click-modal="false" @close="dialogClose('commodityType_add')" append-to-body>
                <el-form :model="commodityTypeForm" label-width="100px" size="small" :rules="commodityTypeRules" ref="commodityType_add" class="commodity-type-formbox">
                    <el-form-item label="物品类型：" prop="name" class="pl-50">
                        <el-input v-model.trim="commodityTypeForm.name" placeholder="请输入物品类型"></el-input>
                    </el-form-item>
                    <div class="d-f f-j-c mt-40 mb-10"><MyButton @click.native="doneHandle('commodityType_add')" :loading="submitLoading.commodityType">确定</MyButton></div>
                </el-form>
            </el-dialog>
        </el-dialog>

        <!-- 类型设置弹窗 -->
        <el-dialog title="类型设置" width="700px" center :visible.sync="dialogStatus.typeSetting" :close-on-click-modal="false">
            <div class="d-f f-j-e"><MyButton @click.native="addCommodityType">添加物品类型</MyButton></div>

            <el-table class="mt-20 bor-t" :data="commodityTypeLists" v-loading="loading" stripe height="400">
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="物品类型" prop="name" align="center"></el-table-column>
                <el-table-column label="状态" align="center">
                    <template slot-scope="scope">{{scope.row.status == 1 ? '正常' : '禁用'}}</template>
                </el-table-column>
                <el-table-column label="物品类型" align="center">
                    <template slot-scope="scope">
                        <span class="fc-m cursor-pointer" @click="commodityTypeHandle('edit', scope.row)">修改</span>
                        <span class="fc-m cursor-pointer ml-10" @click="commodityTypeHandle(scope.row.status, scope.row)">{{scope.row.status == 1 ? '禁用' : '启用'}}</span>
                        <span class="fc-m cursor-pointer ml-10" @click="commodityTypeHandle('delete', scope.row)">删除</span>
                    </template>
                </el-table-column>
            </el-table>

            <el-dialog :title="commodityTypeStatus == 'add' ? '添加' : '修改' + '物品类型'" width="500px" center :visible.sync="dialogStatus.commodityType"
                :close-on-click-modal="false" @close="dialogClose('commodityType_set')" append-to-body>
                <el-form :model="commodityTypeForm" label-width="100px" size="small" :rules="commodityTypeRules" ref="commodityType_set" class="commodity-type-formbox">
                    <el-form-item label="物品类型：" prop="name" class="pl-50">
                        <el-input v-model.trim="commodityTypeForm.name" placeholder="请输入物品类型"></el-input>
                    </el-form-item>
                    <div class="d-f f-j-c mt-40 mb-10"><MyButton @click.native="doneHandle('commodityType_set')" :loading="submitLoading.commodityType">确定</MyButton></div>
                </el-form>
            </el-dialog>
        </el-dialog>

        <!-- 添加入库 -->
        <el-dialog title="入库" width="650px" center :visible.sync="dialogStatus.addStorage" :close-on-click-modal="false" @close="dialogClose('addStorage')">
            <el-form :model="addStorageForm" label-width="100px" size="small" :rules="addStorageRules" ref="addStorage" class="form-box">
                <el-form-item label="物品名称：" prop="name">{{addStorageForm.name}}</el-form-item>
                <div class="d-f">
                    <el-form-item label="入库数量：" prop="num">
                        <el-input v-model.number="addStorageForm.num" type="number" placeholder="入库数量"></el-input>
                    </el-form-item>
                    <el-form-item label="进货单价：" prop="stock_price" class="ml-50">
                        <el-input type="number" v-model.number="addStorageForm.stock_price" placeholder="进货单价"></el-input><span class="pl-10">元</span>
                    </el-form-item>
                </div>
                <div class="d-f f-j-c mt-20 mb-10"><MyButton @click.native="doneHandle('addStorage')" :loading="submitLoading.addStorage">确定</MyButton></div>
            </el-form>
        </el-dialog>

        <!-- 添加出库 -->
        <el-dialog title="出库" width="650px" center :visible.sync="dialogStatus.removeStorage" :close-on-click-modal="false" @close="dialogClose('removeStorage')">
            <el-form :model="removeStorageForm" label-width="110px" size="small" :rules="removeStorageRules" ref="removeStorage" class="form-box">
                <div class="d-f">
                    <div class="flex1">
                        <el-form-item label="物品名称：">{{removeStorageForm.name}}</el-form-item>
                        <el-form-item label="领取人：" prop="receive_people">
                            <el-select v-model="removeStorageForm.receive_people" placeholder="请选择" filterable @change="receivePeopleChange">
                                <el-option v-for="(item, index) in $store.state.allUser" :key="index" :label="item.name" :value="item.together_id"
                                  v-if="removeStorageForm.use_type == 2 || (removeStorageForm.use_type == 1 && item.user_type == 1)">
                                    <span style="float: left">{{ item.name }}</span>
                                    <span style="float: right; color: #8492a6; font-size: 12px" v-if="item.user_type == 2">学员</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item label="对应课程：" prop="student_course" v-if="receivePeopleType == 2">
                            <el-select v-model="removeStorageForm.student_course" placeholder="请选择" @change="studentCourseChange">
                                <el-option v-for="(item, index) in studentCourseLists" :key="index" :label="item.name" :value="item.id"></el-option>
                            </el-select>
                        </el-form-item>
                    </div>

                    <div class="flex1">
                        <el-form-item label="库存数量：">{{removeStorageForm.total_num}}件</el-form-item>
                        <el-form-item label="出库数量：" prop="num">
                            <el-input type="number" placeholder="出库数量" v-model.number="removeStorageForm.num"></el-input>
                        </el-form-item>
                        <el-form-item label="学员剩余库存：" v-if="receivePeopleType == 2 && removeStorageForm.student_total_num !== ''">{{removeStorageForm.student_total_num}}件</el-form-item>
                    </div>
                </div>
                <el-form-item label="备注：" class="mt-10 textarea-cls" prop="remark">
                    <el-input type="textarea" :rows="4" placeholder="请输入备注" v-model.trim="removeStorageForm.remark"></el-input>
                </el-form-item>

                <el-form-item label="出库金额："><span class="fc-m fs-20">{{removeStorageForm.num * Number(removeStorageForm.price)}}元</span></el-form-item>
                <div class="d-f f-j-c mt-20 mb-10"><MyButton @click.native="doneHandle('removeStorage')" :loading="submitLoading.removeStorage">确定</MyButton></div>
            </el-form>
        </el-dialog>

        <!-- 借用 -->
        <el-dialog title="借用" width="650px" center :visible.sync="dialogStatus.borrow" :close-on-click-modal="false" @close="dialogClose('borrowForm')">
            <el-form :model="borrowForm" label-width="110px" size="small" :rules="borrowRules" ref="borrowForm" class="form-box">

                <div class="d-f">
                    <div>
                        <el-form-item label="物品名称：">{{borrowForm.name}}</el-form-item>
                        <el-form-item label="借用人：" prop="borrow_people">
                            <el-select v-model="borrowForm.borrow_people" placeholder="请选择" filterable @change="borrowPeopleChange">
                                <el-option v-for="(item, index) in $store.state.allUser" :key="index" :label="item.name" :value="item.together_id">
                                    <span style="float: left">{{ item.name }}</span>
                                    <span style="float: right; color: #8492a6; font-size: 12px" v-if="item.user_type == 2">学员</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </div>
                    <div class="ml-20">
                        <el-form-item label="库存数量：">{{borrowForm.total_num}}</el-form-item>
                        <el-form-item label="借用数量：" prop="borrow_num">
                            <el-input type="number" placeholder="借用数量" v-model.number="borrowForm.borrow_num"></el-input>
                        </el-form-item>
                    </div>
                </div>
                <div class="d-f f-j-c mt-20 mb-10"><MyButton @click.native="doneHandle('borrowForm')">确定</MyButton></div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

import TableHeader from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'

export default {
    data() {
        return {
            dialogStatus: {
                addCommodity: false,
                commodityType: false,
                typeSetting: false,
                addStorage: false,
                removeStorage: false,
                borrow: false,

                activePage: 1
            },

            state: 'loading',
            operationCommodity: 'add',   //操作物品，默认为新增  可编辑

            operationLists: [
                {type: 'borrow', text: '借用'}, {type: 'edit', text: '编辑'}, {type: 'delete', text: '删除'}
            ],


            removeStorageWaringText: {
                one: '该学员没有购买任何物品，不能出库', two: '没有购买该物品，不能出库', three: '该物品购买库存为0，不能出库'
            },

            loading: false,
            studentCourseLists: [],
            commodityTypeStatus: 'add',
            receivePeopleType: 1,    //出库人员类型  user/student
            submitLoading: {
                add: false, commodityType: false, addStorage:false, removeStorage: false
            },
            searchFilter: {commodity_type: '', use_type: '', keyword: ''},

            commodityTable: {},   //物品列表
            commodityTypeLists: [],  //物品类型列表
            removeStoageBtn: {
                one: false, two: false
            },

            addCommodityForm: {goods_id: '', name: '', type: '', use_type: '', unit: '', price: '', warning: ''},  //添加物品表单
            commodityTypeForm: {name: '', id: ''},   //添加物品类型表单
            addStorageForm: {name: '', goods_id: '', num: '', stock_price: ''},   //入库表单
            removeStorageForm: {
                name: '', goods_id: '', num: '', receive_people: '', remark: '', price: '',
                total_num: '', student_course: '', student_total_num: '',
                student_course: '', use_type: ''
            },   //出库表单
            borrowForm: {
                name: '', goods_id: '', borrow_num: '', borrow_people: '', total_num: '', borrow_people_type: ''
            },

            commodityTypeRules: {
                name: [
                    {required: true, message: '请输入物品类型'},
                    {max: 10,  message: '长度不能超过10个字符'}
                ],
                id: []
            },
            addRules: {
                name: [
                    {required: true, message: '请输入物品名称'}
                ],
                type: [
                    {required: true, message: '请选择物品类型', trigger: 'change'}
                ],
                use_type: [
                    {required: true, message: '请选择使用类型', trigger: 'change'}
                ],
                unit: [
                    {required: true, message: '请输入物品单位'}
                ],
                price: [
                    {required: true, message: '请输入销售价格'},
                    {validator: this.$$tools.formOtherValidate('decimals', 2)},
                    {validator: this.$$tools.formOtherValidate('total', 20000)}
                ],
                warning: [
                    {required: true, message: '请输入库存预警数量'},
                    {validator: this.$$tools.formOtherValidate('int')},
                    {validator: this.$$tools.formOtherValidate('total', 500)}
                ]
            },
            addStorageRules: {
                num: [
                    {required: true, message: '请输入入库数量'},
                    {validator: this.$$tools.formOtherValidate('int')},
                    {validator: this.$$tools.formOtherValidate('total', 5000)}
                ],
                stock_price: [
                    {required: true, message: '请输入进货单价'},
                    {validator: this.$$tools.formOtherValidate('decimals', 2)},
                    {validator: this.$$tools.formOtherValidate('total', 20000)}
                ]
            },
            removeStorageRules: {
                num: [
                    {required: true, message: '请输入出库数量'},
                    {validator: this.$$tools.formOtherValidate('int')},
                    {validator: this.removeStorageNumValidate('removeStorage')}
                ],
                receive_people: [
                    {required: true, message: '请选择出库人', trigger: 'change'}
                ],
                student_course: [
                    {required: true, message: '请选择课程', trigger: 'change'}
                ],
                remark: [
                    // {max: 200,  message: '长度不能超过200个字符'}
                ]
            },
            borrowRules: {
                borrow_num: [
                    {required: true, message: '请输入借用数量'},
                    {validator: this.$$tools.formOtherValidate('int')},
                    {validator: this.removeStorageNumValidate('borrow')}
                ],
                borrow_people: [
                    {required: true, message: '请选择借用人', trigger: 'change'}
                ]
            }
        }
    },
    methods: {
        dialogClose(type) {
            this.$refs[type].resetFields();
            if(type == 'removeStorage') {
                this.receivePeopleType = 1;
                this.studentCourseLists.splice(0, this.studentCourseLists.length);
            };
        },
        removeStorageNumValidate(type) {
            return (rule, value, callback, event, e, d) => {
                let total_num = type == 'removeStorage' ? this.removeStorageForm.total_num : this.borrowForm.total_num;
                if(value > total_num) return callback(new Error('不能超过库存数量'));
                else return callback();
            }
        },
        //添加物品点击
        addCommodity() {
            this.operationCommodity = 'add';
            this.dialogStatus.addCommodity = true;
        },
        //类型设置点击
        typeSetting() {
            this.dialogStatus.typeSetting = true;
        },
        //添加物品类型点击
        addCommodityType() {
            this.commodityTypeStatus = 'add';
            this.dialogStatus.commodityType = true;
        },
        //搜索
        searchHandle() {
            this.getCommodityLists();
        },
        //分页
        paginationClick(current) {
            this.getCommodityLists(current);
        },
        //入库点击
        addStorage(data) {
            this.addStorageForm.name = data.name;
            this.addStorageForm.goods_id = data.id;
            this.addStorageForm.stock_price = data.stock_price;
            this.dialogStatus.addStorage = true;
        },
        //出库点击
        removeStorage(data) {
            console.log(data);
            this.removeStorageForm.use_type = data.use_type;
            this.removeStorageForm.goods_id = data.id;
            this.removeStorageForm.name = data.name;
            this.removeStorageForm.total_num = data.real_num;
            this.removeStorageForm.price =  Number(data.price);
            this.dialogStatus.removeStorage = true;
        },
        //更多点击
        handleCommand(info) {
            console.log(info);
            switch(info.type) {
                case 'borrow':
                    this.borrowForm.name = info.data.name;
                    this.borrowForm.total_num = info.data.real_num;
                    this.borrowForm.goods_id = info.data.id;
                    this.dialogStatus.borrow = true;
                    break;
                case 'edit':
                    this.operationCommodity = 'edit';

                    this.addCommodityForm.name = info.data.name;
                    this.addCommodityForm.type = info.data.type;
                    this.addCommodityForm.use_type = info.data.use_type;
                    this.addCommodityForm.unit = info.data.unit;
                    this.addCommodityForm.warning = info.data.warning;
                    this.addCommodityForm.goods_id = info.data.id;
                    this.addCommodityForm.price = info.data.price;

                    this.dialogStatus.addCommodity = true;
                    break;
                case 'delete':
                    this.$confirm('物品删除之后数据不能恢复，请确认进行删除操作！', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        if(info.data.total_num) return this.$message.warning('还有库存，不能删除！');
                        this.deleteCommodity(info.data.id);
                    }).catch(() => {return 0});
                    break;
            }
        },
        async deleteCommodity(id) {
            let result = await this.$$request.post('/goods/goodsOperate', {id: id});
            console.log(result);
            if(!result) return 0;

            this.$message.success('删除物品成功');
            this.getCommodityLists();
        },
        //物品类型 操作
        commodityTypeHandle(type, item) {
            if(type == 'edit') {
                this.commodityTypeStatus = 'edit';
                this.commodityTypeForm.name = item.name;
                this.commodityTypeForm.id = item.id;
                this.dialogStatus.commodityType = true;
            }else this.commodityTypeSubmit(type, item.id);
        },
        //物品类型删除、禁用
        async commodityTypeSubmit(type, id) {
            if(type == 'delete') {
              this.$confirm('确定删除该物品类型?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              }).then(() => {
                  this.typeSubmitHandle(type, id);
              }).catch(() => {return 0});
            }else {
              this.typeSubmitHandle(type, id);
            }
        },
        async typeSubmitHandle(type, id) {
            let params = {id: id, type: type == 'delete' ? 'del' : type == 1 ? 'limit' : 'start'};
            console.log(params);

            let result = await this.$$request.get('/goodsType/goodsTypeOperate', params);
            console.log(result);
            if(!result) return 0;
            this.getCommodityTypeLists();
            this.$message.success(`${type == 'delete' ? '删除' : type == 1 ? '禁用' : '启用'}成功`);
        },
        //借用  借用人change
        borrowPeopleChange(val) {
            this.$store.state.allUser.forEach(v => {
                if(v.together_id == val) this.borrowForm.borrow_people_type = v.user_type;
            });
        },
        //出库 领取人change
        receivePeopleChange(val) {
            this.$store.state.allUser.forEach(v => {
                if(v.together_id == val) {
                    this.receivePeopleType = v.user_type;
                    if(v.user_type == 2) {
                        this.removeStorageForm.student_course = '';
                        this.removeStorageForm.student_total_num = '';
                        this.getStudentCourse(v.id);
                    }
                }
            });
        },
        //出库 学员课程change
        studentCourseChange(val) {
            this.removeStorageForm.student_total_num = '';

            this.studentCourseLists.forEach(v => {
                if(v.id == val) {
                    if(!v.goods.length) {
                        this.$message.warning(this.removeStorageWaringText.one);
                        this.removeStoageBtn.one = true;
                        return 0;
                    }else this.removeStoageBtn.one = false;

                    console.log(this.removeStorageForm.goods_id);

                    if(v.goods.some(f => {
                        return (f.goods_id == this.removeStorageForm.goods_id)
                    })) {
                        this.removeStoageBtn.two = false;
                        v.goods.forEach(k => {
                            if(k.goods_id == this.removeStorageForm.goods_id) {
                                if(!k.total_num) {
                                    this.removeStoageBtn.three = true;
                                    this.$message.warning(this.removeStorageWaringText.three);
                                }else {
                                    this.removeStoageBtn.three = false;
                                    this.removeStorageForm.student_total_num = k.total_num;
                                }
                            }
                        });
                    }else {
                        this.removeStoageBtn.two = true;
                        this.$message.warning(this.removeStorageWaringText.two);
                    }
                }
            });
        },
        //表单确定
        doneHandle(type) {
            this.$refs[type].validate(valid => {
                if(valid) {
                    switch(type) {
                        case 'addCommodity':
                            this.submitAddCommodity();
                            break;
                        case 'commodityType_add':
                            this.submitCommodityType(type);
                            break;
                        case 'commodityType_set':
                            this.submitCommodityType(type);
                            break;
                        case 'addStorage':
                            this.submitAddStorage();
                            break;
                        case 'removeStorage':
                            this.submitRemoveStorage();
                            break;
                        case 'borrowForm':
                            this.submitBorrowInfo();
                            break;
                    }
                }
            });
        },
        //出库  如果领取人为学员 获取学员相关课程
        async getStudentCourse(id) {
            let result = await this.$$request.get('/repertory/courseLists', {student_id: id});
            console.log(result);

            if(!result) return 0;
            this.studentCourseLists = result;
        },
        //提交 物品数据添加
        async submitAddCommodity() {
            let params = {};
            let url = this.operationCommodity == 'add' ? '/goods/goodsAdd' : '/goods/goodsEdit';

            for(let key in this.addCommodityForm) {
                if(key == 'price') {
                    if(this.addCommodityForm.use_type == 2) params[key] = this.addCommodityForm[key];
                }else if(key != 'goods_id'){
                    params[key] = this.addCommodityForm[key];
                }
            };

            if(this.operationCommodity == 'edit') params.id = this.addCommodityForm.goods_id;

            console.log(params);
            let result = await this.$$request.post(url, params);
            console.log(result);
            if(!result) return 0;

            if(this.operationCommodity == 'edit') this.getCommodityLists(this.activePage);
            else this.getCommodityLists();

            this.$message.success(`${this.operationCommodity == 'add' ? '添加' : '修改'}物品成功`);
            this.dialogStatus.addCommodity = false;
        },
        //提交 物品类型添加
        async submitCommodityType(type) {

            if(this.submitLoading.commodityType) return 0;
            this.submitLoading.commodityType = true;

            let params = {name: this.commodityTypeForm.name};
            let url = this.commodityTypeStatus == 'add' ? '/goodsType/goodsTypeAdd' : '/goodsType/goodsTypeEdit';
            if(this.commodityTypeStatus == 'edit') params.id = this.commodityTypeForm.id;

            let result = await this.$$request.post(url, params);
            console.log(result);
            if(!result) return 0;

            if(this.commodityTypeStatus == 'edit') this.getCommodityLists(this.activePage);

            let datas = await this.getCommodityTypeLists();
            this.submitLoading.commodityType = false;

            if(type == 'commodityType_add' && datas) this.addCommodityForm.type = result.list.id;

            this.$message.success(`${this.commodityTypeStatus == 'add' ? '添加' : '修改'}物品类型成功`);
            this.dialogStatus.commodityType = false;
        },
        //提交 入库数据
        async submitAddStorage() {
            let params = {
                goods_id: this.addStorageForm.goods_id,
                num: this.addStorageForm.num,
                stock_price: this.addStorageForm.stock_price
            };

            console.log(params);

            let result = await this.$$request.post('/repertory/putStorage', params);
            console.log(result);
            if(!result) return 0;

            this.$message.success('入库成功');
            this.getCommodityLists(this.activePage);
            this.dialogStatus.addStorage = false;
        },
        //提交 出库数据
        async submitRemoveStorage() {
            if(this.receivePeopleType == 2) {
                if(this.removeStoageBtn.one) return this.$message.warning(this.removeStorageWaringText.one);
                if(this.removeStoageBtn.two) return this.$message.warning(this.removeStorageWaringText.two);
                if(this.removeStoageBtn.three) return this.$message.warning(this.removeStorageWaringText.three);
            };

            let params = {
                goods_id: this.removeStorageForm.goods_id,
                num: this.removeStorageForm.num,
                receive_people: this.removeStorageForm.receive_people,
                remark: this.removeStorageForm.remark
            };

            if(this.receivePeopleType == 2) params.student_course = this.removeStorageForm.student_course;
            console.log(params);

            let result = await this.$$request.post('/repertory/outStorage', params);
            console.log(result);
            if(!result) return 0;

            this.$message.success('出库成功');
            this.getCommodityLists(this.activePage);
            this.dialogStatus.removeStorage = false;
        },
        //提交借用数据
        async submitBorrowInfo() {
            let params = {
                borrow_user_type: this.borrowForm.borrow_people_type,
                goods_id: this.borrowForm.goods_id,
                borrow_num: this.borrowForm.borrow_num,
                borrow_people: this.borrowForm.borrow_people
            };
            console.log(params);

            let result = await this.$$request.post('/repertory/borrow', params);
            console.log(result);
            if(!result) return 0;

            this.$message.success('借用成功');
            this.dialogStatus.borrow = false;
            this.getCommodityLists(this.activePage);
        },
        //获取物品列表
        async getCommodityLists(page) {
            this.loading = true;

            let params = {
                data: {
                    name: this.searchFilter.keyword,
                    goods_type: this.searchFilter.commodity_type,
                    use_type: this.searchFilter.use_type
                }
            };

            if(page) params.page = page;

            console.log(params);

            let result = await this.$$request.get('/repertory/goodsLists', params);
            console.log(result);
            if(!result) return 0;

            if(page) this.activePage = page;
            this.commodityTable = result.lists;
            this.loading = false;
            return true;
        },
        //获取物品类型列表
        async getCommodityTypeLists() {
            let result = await this.$$request.get('/goodsType/goodsTypeLists');
            console.log(result);
            if(!result) return 0;

            this.commodityTypeLists = result.lists;
            return true;
        }
    },
    async created() {
        this.$store.dispatch('getAllUser');

        let [a, b] = await Promise.all([this.getCommodityLists(), this.getCommodityTypeLists()]);
        if(a && b) this.state = 'loaded';
    },
    components: {TableHeader, MyButton}
}
</script>

<style lang="less" scoped>
    .form-box {
        .el-select, .el-date-editor {
            width: 100%;
        }
        /deep/ .el-input {
            width: 150px;
        }
    }
    .commodity-type-formbox {
        /deep/ .el-input {
            width: 200px;
        }
    }
    .add-commodity-type {
        right: -10px;
        img {
            display: block;
        }
    }
    .fifter-toolbar {
        ul li {
            margin-right: 20px;
            &:not(:last-child) {
                width: 150px;
            }
            &.name {
                width: auto;
            }
        }
    }
</style>

