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
                            <!-- <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option> -->
                        </el-select>
                    </li>
                    <li>    
                        <el-select size="small" placeholder="全部使用类型" v-model="searchFilter.use_type" @change="searchHandle">
                            <el-option label="全部使用类型" value=""></el-option>
                            <!-- <el-option v-for="(item, index) in $store.state.source" :key="index" :label="item.name" :value="item.id"></el-option> -->
                        </el-select>
                    </li>
                    <li class="name"><el-input size="small" placeholder="请输入物品名称" v-model.trim="searchFilter.keyword"></el-input></li>
                    <li><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
                </ul>
            </div>

            <el-table class="mt-20 commodity-table" :data="commodityTable.data" v-loading="loading" stripe>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="物品名称" prop="name" align="center"></el-table-column>
                <el-table-column label="物品类型" align="center">
                    <template slot-scope="scope"></template>
                </el-table-column>
                <el-table-column label="使用类型" align="center"></el-table-column>
                <el-table-column label="进货单价" align="center"></el-table-column>
                <el-table-column label="销售单价" align="center"></el-table-column>
                <el-table-column label="库存数量" prop="total_num" align="center"></el-table-column>
                <el-table-column label="物品单位" prop="unit" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <span class="fc-m">入库</span>
                        <span class="fc-m ml-20">出库</span>
                        <span class="fc-m ml-20">更多</span>
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
                            <el-select v-model="addCommodityForm.use_type" placeholder="请选择" multiple>
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
                            <el-select v-model="addCommodityForm.type" placeholder="请选择" multiple>
                                <!-- <el-option label="内部使用" :value="item.id"></el-option> -->
                            </el-select>
                            <div class="p-a add-commodity-type ver-c cursor-pointer" @click="addCommodityType"><img src="../../images/common/add.png" alt=""></div>
                        </el-form-item>

                        <el-form-item label="物品单位：" prop="unit">
                            <el-input placeholder="物品单位" v-model="addCommodityForm.unit"></el-input>
                        </el-form-item>

                        <el-form-item label="库存预警：" prop="warning" class="units-input">
                            <el-input placeholder="库存预警" v-model="addCommodityForm.waring"></el-input>
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
                    <div class="d-f f-j-c mt-40 mb-10"><MyButton @click.native="doneHandle('commodityType')" :loading="submitLoading.source">确定</MyButton></div>
                </el-form>
            </el-dialog>
        </el-dialog>

        <!-- 类型设置弹窗 -->
        <el-dialog title="类型设置" width="700px" center :visible.sync="dialogStatus.typeSetting" :close-on-click-modal="false" @close="dialogClose">
            <div class="d-f f-j-e"><MyButton @click.native="addCommodityType">添加物品类型</MyButton></div>

            <el-dialog title="添加物品类型" width="500px" center :visible.sync="dialogStatus.commodityType" :close-on-click-modal="false" @close="dialogClose('commodityType')" append-to-body>
                <el-form :model="commodityTypeForm" label-width="100px" size="small" :rules="commodityTypeRules" ref="commodityType" class="commodity-type-formbox">
                    <el-form-item label="物品类型：" prop="name" class="pl-50">
                        <el-input v-model.trim="commodityTypeForm.name" placeholder="请输入物品类型"></el-input>
                    </el-form-item>
                    <div class="d-f f-j-c mt-40 mb-10"><MyButton @click.native="doneHandle('commodityType')" :loading="submitLoading.source">确定</MyButton></div>
                </el-form>
            </el-dialog>
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
                typeSetting: false
            },
            submitLoading: {
                add: false, commodityType: false
            },
            searchFilter: {commodity_type: '', use_type: '', keyword: ''},

            commodityTable: [],   //物品列表
            commodityTypeLists: [],  //物品类型列表

            addCommodityForm: {
                name: '', type: '', use_type: '', unit: '', price: '', waring: ''
            },
            commodityTypeForm: {name: ''},
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
        //提交 物品数据添加
        async submitAddCommodity() {
            let params = this.addCommodityForm;

            console.log(params);

            let result = await this.$$request.post('api/goods/goodsAdd', params);
            console.log(result);
            if(!result) return 0;


        },
        //提交 物品类型添加
        async submitCommodityType() {
            let result = await this.$$request.post('api/goodsType/goodsTypeAdd', {name: this.commodityTypeForm.name});
            console.log(result);

            if(!result) return 0;
        },
        //获取物品列表
        async getCommodityLists(page) {
            let result = await this.$$request.get('api/repertory/goodsLists');
            console.log(result);
            if(!result) return 0;

            // this.commodityTable = result;
        },
        //获取物品类型列表
        async getCommodityTypeLists() {

        }
    },
    created() {
        this.getCommodityLists();
    },
    components: {TableHeader, MyButton}
}
</script>

<style lang="less" scoped>
    .commodity-table {
        border-top: 1px #e3e3e3 solid;
    }
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

