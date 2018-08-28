<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="借用记录"></TableHeader>

            <div class="fifter-toolbar mt-30">
                <ul class="d-f f-a-c">
                    <li>
                        <el-date-picker size="small" :editable="false" :clearable="false"
                            @change="dateChange" v-model="searchFilter.begin_time"
                            type="date" placeholder="选择日期" value-format="timestamp">
                        </el-date-picker>
                    </li>
                    <li class="ml-10 mr-10 text">至</li>
                    <li>
                        <el-date-picker size="small" :editable="false" :clearable="false"
                            @change="dateChange" v-model="searchFilter.end_time"
                            type="date" placeholder="选择日期" value-format="timestamp">
                        </el-date-picker>
                    </li>
                    <li class="ml-20">
                        <el-select size="small" placeholder="全部归还状态" v-model="searchFilter.borrow_type" @change="searchHandle">
                            <el-option label="全部归还状态" value=""></el-option>
                            <el-option label="已归还" :value="1"></el-option>
                            <el-option label="未归还" :value="2"></el-option>
                        </el-select>
                    </li>
                    <li class="name ml-20"><el-input size="small" placeholder="请输入物品名称" v-model.trim="searchFilter.keyword"></el-input></li>
                    <li class="ml-20"><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
                </ul>
            </div>

            <el-table class="mt-20 bor-t" :data="borrowTable.data" v-loading="loading" stripe>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="物品名称" prop="goods_name" align="center"></el-table-column>
                <el-table-column label="借用人" prop="borrow_name" align="center"></el-table-column>
                <el-table-column label="借用数量" prop="borrow_num" align="center"></el-table-column>
                <el-table-column label="借用时间" align="center">
                    <template slot-scope="scope">
                        {{$$tools.format(scope.row.borrow_time)}}
                    </template>
                </el-table-column>
                <el-table-column label="归还状态" align="center">
                    <template slot-scope="scope">
                        {{scope.row.status == 1 ? '已归还' : '未归还'}}
                    </template>
                </el-table-column>
                <el-table-column label="已归还数量" prop="return_num" align="center"></el-table-column>
                <el-table-column label="归还时间" align="center">
                    <template slot-scope="scope">
                        {{scope.row.return_time > 0 ? $$tools.format(scope.row.return_time) : ''}}
                    </template>
                </el-table-column>
                <el-table-column label="操作人" prop="user_name" align="center"></el-table-column>
                <el-table-column label="备注" prop="remark" align="center"></el-table-column>
                <el-table-column label="操作" align="center">
                    <template slot-scope="scope">
                        <span class="fc-m cursor-pointer" v-if="(scope.row.borrow_num - scope.row.return_num)" @click="giveBackClick(scope.row)">归还</span>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination v-if="borrowTable.total"
                class="d-f f-j-c mt-50 mb-50"
                :page-size="borrowTable.per_page"
                background layout="total, prev, pager, next"
                :total="borrowTable.total"
                :current-page="borrowTable.current_page"
                @current-change="paginationClick">
            </el-pagination>
        </el-card>

        <!-- 归还弹窗 -->
        <el-dialog title="归还" width="700px" center :visible.sync="dialogStatus.giveBack" :close-on-click-modal="false" @close="dialogClose">
            <el-form :model="backForm" label-width="100px" size="small" :rules="backRules" ref="backForm" class="form-box">
                <div class="d-f f-j-b">
                    <el-form-item label="应归还数量：">{{backForm.back_num}}</el-form-item>
                    <el-form-item label="归还数量：" prop="return_num">
                        <el-input type="number" v-model.number="backForm.return_num" placeholder="请输入归还数量"></el-input>
                    </el-form-item>
                </div>

                <el-form-item label="备注：" class="mt-10 textarea-cls" prop="explain">
                    <el-input type="textarea" :rows="4" placeholder="请输入备注" v-model.trim="backForm.explain"></el-input>
                </el-form-item>

                <div class="d-f f-j-c mt-40 mb-10"><MyButton @click.native="doneHandle" :loading="submitLoading.back">确定</MyButton></div>
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
            activePage: 1,
            searchFilter: {
                begin_time: new Date(this.$format_date(new Date(), "yyyy/MM/01")),
                end_time: new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0),
                borrow_type: '', keyword: ''
            },

            borrowTable: {},

            backForm: {back_num: '', return_num: '', explain: ''},
            backRules: {
                return_num: [
                    {required: true, message: '请输入归还数量'},
                    {validator: this.$$tools.formOtherValidate('int')},
                    {validator: this.$$tools.formOtherValidate('total', 5000)}
                ],
                explain: [
                    {max: 18,  message: '长度不能超过18个字符'}
                ]
            }
        }
    },
    methods: {
        dialogClose() {
            this.$refs.backForm.resetFields();
        },
        dateChange() {
            if(this.searchFilter.end_time < this.searchFilter.begin_time) return this.$message.warning('结束时间不能小于开始时间，请从新选择');
            this.getBorrowLists();
        },
        searchHandle() {
            this.getBorrowLists();
        },
        giveBackClick(item) {
            this.backForm.id = item.id,
            this.backForm.back_num = item.borrow_num - item.return_num;
            this.dialogStatus.giveBack = true;
        },
        doneHandle() {
            this.$refs.backForm.validate(valid => {if(valid) this.submitBackForm()});
        },
        paginationClick(current) {
            this.getBorrowLists(current);
        },
        //提交归还数据
        async submitBackForm() {
            let params = {
                borrow_id: this.backForm.id,
                return_num: this.backForm.return_num,
                remark: this.backForm.explain
            };

            let result = await this.$$request.post('/repertory/returns', params);
            console.log(result);
            if(!result) return 0;

            this.$message.success('归还成功');
            this.dialogStatus.giveBack = false;
            this.getBorrowLists(this.activePage);
        },
        //获取借用记录列表
        async getBorrowLists(page) {
            this.loading = true;

            let params = {
                data: {
                    name: this.searchFilter.keyword,
                    borrow_status: this.searchFilter.borrow_type,
                    time: {
                        start: this.searchFilter.begin_time / 1000,
                        end: this.searchFilter.end_time / 1000
                    }
                }
            };

            if(page) params.page = page;

            let result = await this.$$request.get('/repertory/borrowRecords', params);
            console.log(result);
            if(!result) return 0;

            if(page) this.activePage = page;
            this.borrowTable = result.lists;
            this.loading = false;
        }
    },
    created() {
        this.getBorrowLists();
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
                width: 150px;
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


