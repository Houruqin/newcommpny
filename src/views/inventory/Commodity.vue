<template>
    <div class="flex1">
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
                            <el-option v-for="(item, index) in commodityTypeLists" :key="index" :label="item.name" :value="item.status"></el-option>
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
                <el-table-column label="进货单价" align="center"></el-table-column>
                <el-table-column label="销售单价" align="center">
                    <template slot-scope="scope">{{scope.row.price}}元</template>
                </el-table-column>
                <el-table-column label="库存数量" prop="total_num" align="center"></el-table-column>
                <el-table-column label="物品单位" prop="unit" align="center"></el-table-column>
                <el-table-column label="操作" align="center" width="200">
                    <template slot-scope="scope">
                        <span class="fc-m cursor-pointer" @click="addStorage(scope.row)">入库</span>
                        <span class="fc-m ml-20 cursor-pointer" @click="removeStorage(scope.row)">出库</span>
                        <span class="fc-m ml-20 cursor-pointer">更多</span>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 添加物品弹窗 -->
        <el-dialog title="添加物品" width="720px" center :visible.sync="dialogStatus.add" :close-on-click-modal="false" @close="dialogClose('addCommodity')">
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

                        <el-form-item label="销售价格：" prop="price" class="units-input">
                            <el-input placeholder="销售价格" v-model="addCommodityForm.price"></el-input><span class="pl-10">元</span>
                        </el-form-item>
                    </el-col>

                    <el-col :span="11">
                        <el-form-item label="物品类型：" prop="type" class="p-r">
                            <el-select v-model="addCommodityForm.type" placeholder="请选择">
                            <el-option v-for="(item, index) in commodityTypeLists" :key="index" :label="item.name" :value="item.status"></el-option>
                            </el-select>
                            <div class="p-a add-commodity-type ver-c cursor-pointer" @click="addCommodityType"><img src="../../images/common/add.png" alt=""></div>
                        </el-form-item>

                        <el-form-item label="物品单位：" prop="unit">
                            <el-input placeholder="物品单位" v-model="addCommodityForm.unit"></el-input>
                        </el-form-item>

                        <el-form-item label="库存预警：" prop="warning" class="units-input">
                            <el-input placeholder="库存预警" v-model="addCommodityForm.warning"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>

                <div class="d-f f-j-c mt-20"><MyButton @click.native="doneHandle('addCommodity')" :loading="submitLoading.add">确定</MyButton></div>
            </el-form>

            <el-dialog title="添加物品类型" width="500px" center :visible.sync="dialogStatus.commodityType" :close-on-click-modal="false" @close="dialogClose('commodityType')" append-to-body>
                <el-form :model="commodityTypeForm" label-width="100px" size="small" :rules="commodityTypeRules" ref="commodityType" class="commodity-type-formbox">
                    <el-form-item label="物品类型：" prop="name" class="pl-50">
                        <el-input v-model.trim="commodityTypeForm.name" placeholder="请输入物品类型"></el-input>
                    </el-form-item>
                    <div class="d-f f-j-c mt-40 mb-10"><MyButton @click.native="doneHandle('commodityType')" :loading="submitLoading.commodityType">确定</MyButton></div>
                </el-form>
            </el-dialog>
        </el-dialog>

        <!-- 类型设置弹窗 -->
        <el-dialog title="类型设置" width="700px" center :visible.sync="dialogStatus.typeSetting" :close-on-click-modal="false" @close="dialogClose">
            <div class="d-f f-j-e"><MyButton @click.native="addCommodityType">添加物品类型</MyButton></div>
            
            <el-table class="mt-20 bor-t" :data="commodityTypeLists" v-loading="loading" stripe>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="物品类型" prop="name" align="center"></el-table-column>
                <el-table-column label="状态" align="center">
                    <template slot-scope="scope">{{scope.row.status == 1 ? '正常' : '禁用'}}</template>
                </el-table-column>
                <el-table-column label="物品类型" align="center">
                    <template slot-scope="scope">
                        <span class="fc-m cursor-pointer" @click="commodityTypeHandle('edit')">修改</span>
                        <span class="fc-m cursor-pointer ml-10" @click="commodityTypeHandle('forbid')">禁用</span>
                        <span class="fc-m cursor-pointer ml-10" @click="commodityTypeHandle('delete')">删除</span>
                    </template>
                </el-table-column>
            </el-table>

            <div class="d-f f-j-c mt-30 mb-10"><MyButton @click.native="dialogStatus.typeSetting = false">确定</MyButton></div>

            <el-dialog title="添加物品类型" width="500px" center :visible.sync="dialogStatus.commodityType" :close-on-click-modal="false" @close="dialogClose('commodityType')" append-to-body>
                <el-form :model="commodityTypeForm" label-width="100px" size="small" :rules="commodityTypeRules" ref="commodityType" class="commodity-type-formbox">
                    <el-form-item label="物品类型：" prop="name" class="pl-50">
                        <el-input v-model.trim="commodityTypeForm.name" placeholder="请输入物品类型"></el-input>
                    </el-form-item>
                    <div class="d-f f-j-c mt-40 mb-10"><MyButton @click.native="doneHandle('commodityType')" :loading="submitLoading.typeSetting">确定</MyButton></div>
                </el-form>
            </el-dialog>
        </el-dialog>

        <!-- 添加入库 -->
        <el-dialog title="类型设置" width="650px" center :visible.sync="dialogStatus.addStorage" :close-on-click-modal="false" @close="dialogClose">
            <el-form :model="addStorageForm" label-width="100px" size="small" :rules="addStorageRules" ref="addStorage" class="form-box">
                <el-form-item label="物品名称：" prop="name">{{addStorageForm.name}}</el-form-item>
                <div class="d-f">
                    <el-form-item label="入库数量：" prop="num">
                        <el-input v-model.trim="addStorageForm.num" placeholder="入库数量"></el-input>
                    </el-form-item>
                    <el-form-item label="进货单价：" prop="stock_price" class="ml-50">
                        <el-input v-model.trim="addStorageForm.stock_price" placeholder="进货单价"></el-input><span class="pl-10">元</span>
                    </el-form-item>
                </div>
                <div class="d-f f-j-c mt-20 mb-10"><MyButton @click.native="doneHandle('addStorage')" :loading="submitLoading.addStorage">确定</MyButton></div>
            </el-form>
        </el-dialog>

        <!-- 添加出库 -->
        <el-dialog title="添加出库" width="650px" center :visible.sync="dialogStatus.removeStorage" :close-on-click-modal="false" @close="dialogClose">
            <el-form :model="removeStorageForm" label-width="100px" size="small" :rules="removeStorageRules" ref="removeStorage" class="form-box">
                <div class="d-f">
                    <div class="flex1">
                        <el-form-item label="物品名称：">{{removeStorageForm.name}}</el-form-item>
                        <el-form-item label="领取人：" prop="receive_people" class="p-r">
                            <el-select v-model="removeStorageForm.receive_people" placeholder="请选择">
                            </el-select>
                            <span class="p-a">学院剩余库存：5件</span>
                        </el-form-item>
                    </div>

                    <div class="flex1">
                        <el-form-item label="库存数量：">{{removeStorageForm.total_num}}件</el-form-item>
                        <el-form-item label="出库数量：" prop="num" class="units-input">
                            <el-input placeholder="出库数量" v-model="removeStorageForm.num"></el-input>
                        </el-form-item>
                    </div>
                </div>
                <el-form-item label="备注：" class="mt-40 textarea-cls" prop="remark">
                    <el-input type="textarea" :rows="4" placeholder="请输入备注" v-model.trim="removeStorageForm.remark"></el-input>
                </el-form-item>

                <el-form-item label="出库金额：" prop="remark"><span class="fc-m fs-20">{{removeStorageForm.money}}元</span></el-form-item>
                <div class="d-f f-j-c mt-20 mb-10"><MyButton @click.native="doneHandle('removeStorage')" :loading="submitLoading.removeStorage">确定</MyButton></div>
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
                add: false,
                commodityType: false,
                typeSetting: false,
                addStorage: false,
                removeStorage: false
            },
            loading: false,
            submitLoading: {
                add: false, commodityType: false, typeSetting: false, addStorage:false, removeStorage: false
            },
            searchFilter: {commodity_type: '', use_type: '', keyword: ''},

            commodityTable: [],   //物品列表
            commodityTypeLists: [],  //物品类型列表

            addCommodityForm: {name: '', type: '', use_type: '', unit: '', price: '', warning: ''},  //添加物品表单
            commodityTypeForm: {name: ''},   //添加物品类型表单
            addStorageForm: {name: '', goods_id: '', num: '', stock_price: ''},   //入库表单
            removeStorageForm: {name: '', goods_id: '', num: '', receive_people: '', remark: '', total_num: '', money: ''},   //入库表单

            
            commodityTypeRules: {
                name: [
                    {required: true, message: '请输入物品类型'}
                ]
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
                    {validator: this.$$tools.formOtherValidate('price')}
                ],
                warning: [
                    {required: true, message: '请输入库存预警数量'}
                ]
            },
            addStorageRules: {
                num: [
                    {required: true, message: '请输入入库数量'}
                ],
                stock_price: [
                    {required: true, message: '请输入进货单价'}
                ]
            },
            removeStorageRules: {
                num: [
                    {required: true, message: '请输入出库数量'}
                ],
                receive_people: [
                    {required: true, message: '请选择出库人', trigger: 'change'}
                ]
            }
        }
    },
    methods: {
        dialogClose(type) {
            if(type) this.$refs[type].resetFields();
        },
        addCommodity() {
            this.dialogStatus.add = true;
        },
        typeSetting() {
            this.dialogStatus.typeSetting = true;
        },
        addCommodityType() {
            this.dialogStatus.commodityType = true;
        },
        doneHandle(type) {
            this.$refs[type].validate(valid => {
                if(valid) type == 'addCommodity' ? this.submitAddCommodity() : this.submitCommodityType();
            });
        },
        searchHandle() {

        },
        //入库点击
        addStorage(data) {
            this.addStorageForm.name = data.name;
            this.addStorageForm.goods_id = data.id;
            this.dialogStatus.addStorage = true;
        },
        //出库点击
        removeStorage(data) {
            this.removeStorageForm.goods_id = data.id;
            this.removeStorageForm.name = data.name;
            this.removeStorageForm.total_num = data.total_num;
            this.dialogStatus.removeStorage = true;
        },
        //物品类型 操作
        commodityTypeHandle(type) {

        },
        //提交 物品数据添加
        async submitAddCommodity() {
            let params = this.addCommodityForm;

            console.log(params);

            let result = await this.$$request.post('api/goods/goodsAdd', params);
            console.log(result);
            if(!result) return 0;

            this.getCommodityLists();
            this.dialogStatus.add = false;
        },
        //提交 物品类型添加
        async submitCommodityType() {
            let result = await this.$$request.post('api/goodsType/goodsTypeAdd', {name: this.commodityTypeForm.name});
            console.log(result);

            if(!result) return 0;
            this.getCommodityTypeLists();
            this.dialogStatus.commodityType = false;
        },
        //获取物品列表
        async getCommodityLists(page) {
            this.loading = true;
            let result = await this.$$request.get('api/repertory/goodsLists');
            console.log(result);
            if(!result) return 0;

            this.commodityTable = result.lists;
            this.getCommodityTypeLists();
        },
        //获取物品类型列表
        async getCommodityTypeLists() {
            let result = await this.$$request.get('api/goodsType/goodsTypeLists');
            console.log(result);
            if(!result) return 0;

            this.commodityTypeLists = result.lists;
            this.loading = false;
        }
    },
    created() {
        this.getCommodityLists();
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

