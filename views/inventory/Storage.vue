<template>
    <div class="flex1">
        <PageState :state="state"/>
        <el-card shadow="hover">
            <TableHeader title="出入库明细"></TableHeader>

            <el-tabs v-model="listType" @tab-click="tabClick" class="tab-toolbar">
                <el-tab-pane label="出入库记录" name="record"></el-tab-pane>
                <el-tab-pane label="作废记录" name="cancellation"></el-tab-pane>
            </el-tabs>

            <div></div>
            <div class="fifter-toolbar">
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
                    <li class="ml-20" v-if="listType == 'record'">
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
                    <li class="name ml-20"><el-input size="small" :placeholder="listType == 'record' ? '请输入物品或领用人名称' : '请输入物品名称'" v-model.trim="searchFilter.keyword"></el-input></li>
                    <li class="ml-20"><MyButton @click.native="searchHandle" :radius="false">搜索</MyButton></li>
                </ul>
            </div>

            <div v-if="listType == 'record'" key="record">
                <el-table class="mt-20 bor-t" :data="storageTable.data" v-loading="loading" stripe>
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="物品名称" prop="goods_name" align="center"></el-table-column>
                    <el-table-column label="类别" align="center">
                        <template slot-scope="scope">{{scope.row.type == 1 ? '出库' : '入库'}}</template>
                    </el-table-column>
                    <el-table-column label="物品类型" prop="goods_types_name" align="center"></el-table-column>
                    <el-table-column label="使用类型" align="center">
                        <template slot-scope="scope">{{scope.row.use_type == 1 ? '内部使用' : '对外销售'}}</template>
                    </el-table-column>
                    <el-table-column label="操作人" prop="user_name" align="center"></el-table-column>
                    <el-table-column label="操作时间" align="center">
                        <template slot-scope="scope">
                            {{$$tools.format(scope.row.updated_at)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="操作数量" prop="num" align="center"></el-table-column>
                    <el-table-column label="领用人" prop="receive_name" align="center"></el-table-column>
                    <el-table-column label="备注" align="center">
                      <template slot-scope="scope">
                          <div v-if="scope.row.remark.length > 16" class="d-f f-j-c">
                              <el-popover popper-class="grade-student-popver" placement="right" trigger="hover" width="200" :content="scope.row.remark">
                                  <div slot="reference" class="ml-5 cursor-pointer">
                                      <span>{{scope.row.remark.substring(0, 16)}}...</span>
                                      <!-- <i class="iconfont icon-zhuyidapx"></i> -->
                                  </div>
                              </el-popover>
                          </div>
                          <div v-else>{{scope.row.remark}}</div>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" align="center">
                        <template slot-scope="scope">
                            <span v-if="scope.row.type == 2" class="fc-m cursor-pointer" @click="cancellationClick(scope.row.id)">作废</span>
                        </template>
                    </el-table-column>
                </el-table>
                <el-pagination v-if="storageTable.total"
                    class="d-f f-j-c mt-50 mb-50"
                    :page-size="storageTable.per_page"
                    background layout="total, prev, pager, next"
                    :total="storageTable.total"
                    :current-page="storageTable.current_page"
                    @current-change="paginationClick">
                </el-pagination>
            </div>

            <div v-else key="cancellation">
                <el-table class="mt-20 bor-t" :data="cancellationTable.data" v-loading="loading" stripe>
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="入库时间" align="center">
                        <template slot-scope="scope">{{$$tools.format(scope.row.created_at)}}</template>
                    </el-table-column>
                    <el-table-column label="物品名称" prop="goods_name" align="center"></el-table-column>
                    <el-table-column label="类别" align="center">
                        <template slot-scope="scope">{{scope.row.type == 1 ? '出库' : '入库'}}</template>
                    </el-table-column>
                    <el-table-column label="物品类型" prop="goods_types_name" align="center"></el-table-column>
                    <el-table-column label="使用类型" align="center">
                        <template slot-scope="scope">{{scope.row.use_type == 1 ? '内部使用' : '对外销售'}}</template>
                    </el-table-column>
                    <el-table-column label="入库操作人" prop="user_name" align="center"></el-table-column>

                    <el-table-column label="操作数量" prop="num" align="center"></el-table-column>
                    <el-table-column label="作废时间" align="center">
                        <template slot-scope="scope">
                            {{$$tools.format(scope.row.cancel_time)}}
                        </template>
                    </el-table-column>
                    <el-table-column label="作废操作人" align="center" prop="cancel_name"></el-table-column>
                </el-table>
                <el-pagination v-if="cancellationTable.total"
                    class="d-f f-j-c mt-50 mb-50"
                    :page-size="cancellationTable.per_page"
                    background layout="total, prev, pager, next"
                    :total="cancellationTable.total"
                    :current-page="cancellationTable.current_page"
                    @current-change="paginationClick">
                </el-pagination>
            </div>
        </el-card>
    </div>
</template>

<script>
import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';

export default {
  data () {
    return {
      state: 'loading',
      listType: 'record',
      loading: false,
      activePage: 1,
      storageLists: [],
      dialogStatus: {addStorage: false},
      searchFilter: {
        begin_time: new Date(this.$format_date(new Date(), 'yyyy/MM/01')),
        end_time: new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0),
        storage_type: '', commodity_type: '', use_type: '', keyword: ''
      },

      storageTable: {},
      cancellationTable: {},

      commodityTypeLists: []
    };
  },
  methods: {
    dateChange () {
      if (this.searchFilter.end_time < this.searchFilter.begin_time) {
        return this.$message.warning('结束时间不能小于开始时间，请重新选择');
      }
      this.getStorageLists();
    },
    searchHandle () {
      this.getStorageLists();
    },
    paginationClick (current) {
      this.getStorageLists(current);
    },
    tabClick () {
      for (let key in this.searchFilter) {
        if (key == 'begin_time') {
          this.searchFilter[key] = new Date(this.$format_date(new Date(), 'yyyy/MM/01'));
        } else if (key == 'end_time') {
          this.searchFilter[key] = new Date(new Date().setMonth(new Date().getMonth() + 1)).setDate(0);
        } else {
          this.searchFilter[key] = '';
        }
      }
      this.getStorageLists();
    },
    // 作废
    cancellationClick (id) {
      this.$confirm('记录作废之后数据不能还原，请确认进行作废操作！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.cancellationHandle(id);
      }).catch(() => {
        return 0;
      });
    },
    async cancellationHandle (id) {
      let result = await this.$$request.post('/repertory/cancellation', {id: id});

      console.log(result);
      if (!result) {
        return 0;
      }
      this.$message.success('已作废');
      this.getStorageLists(this.activePage);
    },
    //获取出入库记录列表
    async getStorageLists (page) {
      this.loading = true;

      let searchFilter = this.searchFilter;

      let params = {
        data: {
          name: searchFilter.keyword,
          use_type: searchFilter.use_type,
          goods_type: searchFilter.commodity_type,
          storage_type: this.listType == 'record' ? searchFilter.storage_type : '',
          type: this.listType,
          time: {
            start: searchFilter.begin_time / 1000,
            end: searchFilter.end_time / 1000
          }
        }
      };

      if (page) {
        params.page = page;
      }

      let result = await this.$$request.get('/repertory/storageLists', params);

      console.log(result);
      if (!result) {
        return 0;
      }

      if (this.listType == 'record') {
        this.storageTable = result.lists;
      } else {
        this.cancellationTable = result.lists;
      }
      if (page) {
        this.activePage = page;
      }

      this.loading = false;

      return true;
    },
    //获取物品类型列表
    async getCommodityTypeLists () {
      let result = await this.$$request.get('/goodsType/goodsTypeLists');

      console.log(result);
      if (!result) {
        return 0;
      }

      this.commodityTypeLists = result.lists;

      return true;
    }
  },
  async created () {
    let [a, b] = await Promise.all([this.getStorageLists(), this.getCommodityTypeLists()]);

    if (a && b) {
      this.state = 'loaded';
    }
  },
  components: {TableHeader, MyButton}
};
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


