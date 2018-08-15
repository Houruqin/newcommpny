<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="借用记录"></TableHeader>

            <div class="fifter-toolbar mt-30">
                <ul class="d-f f-a-c">
                    <li>
                        <el-date-picker size="small" v-model="searchFilter.begin_time" type="date" placeholder="选择日期"></el-date-picker>
                    </li>
                    <li class="ml-10 mr-10 text">至</li>
                    <li>
                        <el-date-picker size="small" v-model="searchFilter.end_time" type="date" placeholder="选择日期"></el-date-picker>
                    </li>
                    <li class="ml-20">
                        <el-select size="small" placeholder="全部归还记录" v-model="searchFilter.commodity_type" @change="searchHandle">
                            <el-option label="全部类别" value=""></el-option>
                            <!-- <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option> -->
                        </el-select>
                    </li>
                    <li class="name ml-20"><el-input size="small" placeholder="请输入物品名称" v-model.trim="searchFilter.keyword"></el-input></li>
                    <li class="ml-20"><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
                </ul>
            </div>

            <el-table class="mt-20 bor-t" v-loading="loading" stripe>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="物品名称" align="center"></el-table-column>
                <el-table-column label="借用人" align="center"></el-table-column>
                <el-table-column label="借用数量" align="center"></el-table-column>
                <el-table-column label="借用时间" align="center"></el-table-column>
                <el-table-column label="归还状态" align="center"></el-table-column>
                <el-table-column label="已归还数量" align="center"></el-table-column>
                <el-table-column label="归还时间" align="center"></el-table-column>
                <el-table-column label="操作人" align="center"></el-table-column>
                <el-table-column label="备注" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <span class="fc-m cursor-pointer" @click="giveBackClick">归还</span>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!-- 归还弹窗 -->
        <el-dialog title="归还" width="700px" center :visible.sync="dialogStatus.giveBack" :close-on-click-modal="false" @close="dialogClose">
            <el-form :model="backForm" label-width="100px" size="small" :rules="backRules" ref="backForm" class="form-box">
                <div class="d-f f-j-b">
                    <el-form-item label="应归还数量：">10</el-form-item>
                    <el-form-item label="归还数量：" prop="back_num">
                        <el-input v-model.trim="backForm.back_num" placeholder="请输入物品类型"></el-input>
                    </el-form-item>
                </div>

                <el-form-item label="备注：" class="mt-10 textarea-cls" prop="explain">
                    <el-input type="textarea" :rows="4" placeholder="请输入备注" v-model.trim="backForm.explain"></el-input>
                </el-form-item>

                <div class="d-f f-j-c mt-40 mb-10"><MyButton @click.native="doneHandle('commodityType')" :loading="submitLoading.back">确定</MyButton></div>
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
            loading: false,
            dialogStatus: {giveBack: false},
            submitLoading: {back: false},
            searchFilter: {begin_time: '', end_time: '', commodity_type: '', use_type: '', keyword: ''},
            backForm: {back_num: '', explan: ''},
            backRules: {
                back_num: [
                    {required: true, message: '请输入归还数量'}
                ]
            }
        }
    },
    methods: {
        dialogClose() {

        },
        searchHandle() {

        },
        giveBackClick() {

        },
        doneHandle() {
            
        }
    },
    components: {TableHeader, MyButton}
}
</script>

<style lang="less" scoped>
    .form-box {
        padding: 0 50px;
    }
    .fifter-toolbar {
        ul li {
            &:not(:last-child) {
                width: 135px;
            }
            .el-select, .el-date-editor {
                width: 100%;
            }
            &.name {
                width: auto;
            }
            &.text {
                width: 15px;
            }
        }
    }
</style>


