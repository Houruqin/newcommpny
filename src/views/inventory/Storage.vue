<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="出入库记录"></TableHeader>

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
                        <el-select size="small" placeholder="全部类别" v-model="searchFilter.commodity_type" @change="searchHandle">
                            <el-option label="全部类别" value=""></el-option>
                            <!-- <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option> -->
                        </el-select>
                    </li>
                    <li class="ml-20">
                        <el-select size="small" placeholder="全部物品类型" v-model="searchFilter.commodity_type" @change="searchHandle">
                            <el-option label="全部物品类型" value=""></el-option>
                            <!-- <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option> -->
                        </el-select>
                    </li>
                    <li class="ml-20">    
                        <el-select size="small" placeholder="全部使用类型" v-model="searchFilter.use_type" @change="searchHandle">
                            <el-option label="全部使用类型" value=""></el-option>
                            <!-- <el-option v-for="(item, index) in $store.state.source" :key="index" :label="item.name" :value="item.id"></el-option> -->
                        </el-select>
                    </li>
                    <li class="name ml-20"><el-input size="small" placeholder="请输入物品名称" v-model.trim="searchFilter.keyword"></el-input></li>
                    <li class="ml-20"><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
                </ul>
            </div>
        </el-card>
    </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'

export default {
    data() {
        return {
            searchFilter: {begin_time: '', end_time: '', commodity_type: '', use_type: '', keyword: ''},
        }
    },
    methods: {
        searchHandle() {

        }
    },
    components: {TableHeader, MyButton}
}
</script>

<style lang="less" scoped>
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


