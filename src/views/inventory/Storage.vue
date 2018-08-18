<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="出入库记录"></TableHeader>

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
                        <el-select size="small" placeholder="全部类别" v-model="searchFilter.storage_type" @change="searchHandle">
                            <el-option label="全部类别" value=""></el-option>
                            <el-option label="入库" :value="2"></el-option>
                            <el-option label="出库" :value="1"></el-option>
                        </el-select>
                    </li>
                    <li class="ml-20">
                        <el-select size="small" placeholder="全部物品类型" v-model="searchFilter.commodity_type" @change="searchHandle">
                            <el-option label="全部物品类型" value=""></el-option>
                            <el-option v-for="(item, index) in commodityTypeLists" :key="index" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </li>
                    <li class="ml-20">    
                        <el-select size="small" placeholder="全部使用类型" v-model="searchFilter.use_type" @change="searchHandle">
                            <el-option label="全部使用类型" value=""></el-option>
                            <el-option label="内部使用" :value="1"></el-option>
                            <el-option label="对外销售" :value="2"></el-option>
                        </el-select>
                    </li>
                    <li class="name ml-20"><el-input size="small" placeholder="请输入物品名称" v-model.trim="searchFilter.keyword"></el-input></li>
                    <li class="ml-20"><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
                </ul>
            </div>

            <el-table class="mt-20 bor-t" :data="storageTable.data" v-loading="loading" stripe>
                <el-table-column label="序号" type="index" align="center"></el-table-column>
                <el-table-column label="物品名称" prop="goods_name" align="center"></el-table-column>
                <el-table-column label="类别" align="center">
                    <template slot-scope="scope">{{scope.row.type == 1 ? '出库' : '入库'}}</template>
                </el-table-column>
                <el-table-column label="物品类型" prop="goods_types_name" align="center"></el-table-column>
                <el-table-column label="使用类型" align="center"></el-table-column>
                <el-table-column label="操作人" prop="user_name" align="center"></el-table-column>
                <el-table-column label="操作时间" align="center">
                    <template slot-scope="scope">
                        {{$$tools.format(scope.row.updated_at)}}
                    </template>
                </el-table-column>
                <el-table-column label="操作数量" prop="num" align="center"></el-table-column>
                <el-table-column label="领用人" prop="receive_name" align="center"></el-table-column>
            </el-table>

            <el-pagination v-if="storageTable.total"
                class="d-f f-j-c mt-50 mb-50" 
                :page-size="storageTable.per_page" 
                background layout="total, prev, pager, next" 
                :total="storageTable.total" 
                :current-page="storageTable.current_page" 
                @current-change="paginationClick">
            </el-pagination>
        </el-card>
    </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'

export default {
    data() {
        return {
            loading: false,
            storageLists: [],   
            dialogStatus: {addStorage: false},
            searchFilter: {
                begin_time: new Date().setMonth(new Date().getMonth() - 1), 
                end_time: new Date().getTime(), 
                storage_type: '', commodity_type: '', use_type: '', keyword: ''
            },
            storageTable: {},

            commodityTypeLists: []
        }
    },
    methods: {
        dialogClose() {

        },
        dateChange() {
            if(this.searchFilter.end_time < this.searchFilter.begin_time) return this.$message.warning('结束时间不能小于开始时间，请从新选择');
            this.getStorageLists();
        },
        searchHandle() {
            this.getStorageLists();
        },
        paginationClick(current) {
            this.getStorageLists(current);
        },
        //获取出入库记录列表
        async getStorageLists(page) {
            this.loading = true;
            let params = {
                data: {
                    name: this.searchFilter.keyword,
                    use_type: this.searchFilter.use_type,
                    goods_type: this.searchFilter.commodity_type,
                    storage_type: this.searchFilter.storage_type,
                    time: {
                        start: this.searchFilter.begin_time / 1000,
                        end: this.searchFilter.end_time / 1000
                    }
                }
            };

            if(page) params.page_num = page;

            let result = await this.$$request.get('api/repertory/storageLists', params);
            console.log(result);

            if(!result) return 0;
            this.storageTable = result.lists;
            this.loading = false;
        },
        //获取物品类型列表
        async getCommodityTypeLists() {
            let result = await this.$$request.get('api/goodsType/goodsTypeLists');
            console.log(result);
            if(!result) return 0;

            this.commodityTypeLists = result.lists;
        }
    },
    created() {
        this.getStorageLists();
        this.getCommodityTypeLists();
    },
    components: {TableHeader, MyButton}
}
</script>

<style lang="less" scoped>
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


