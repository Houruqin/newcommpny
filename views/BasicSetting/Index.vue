<template>
  <div class="flex1">
      <PageState :state="state"/>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover">
                <TableHeader title="教室设置">
                    <MyButton @click.native="buttonHandle('addClassroom')" v-if="$$tools.isAuthority('addClassroom')">添加教室</MyButton>
                </TableHeader>
                <el-table :data="$store.state.classRoom" stripe>
                    <el-table-column label="序号" type="index" width="80" align="center"></el-table-column>
                    <el-table-column prop="name" label="教室"></el-table-column>
                    <el-table-column label="操作" width="100" align="center">
                        <template slot-scope="scope">
                            <div class="d-f f-j-c">
                                <span class="cursor-pointer fc-m" @click="modifySource(scope.row, 'class')" v-if="$$tools.isAuthority('editClassroom')">编辑</span>
                                <span class="cursor-pointer ml-20 fc-subm" @click="deleteSource(scope.row, 'class')" v-if="$$tools.isAuthority('deleteClassroom')">删除</span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="card-box" shadow="hover">
                <TableHeader title="渠道来源">
                    <MyButton @click.native="buttonHandle('addSource')" v-if="$$tools.isAuthority('addChannel')">添加渠道</MyButton>
                </TableHeader>
                <el-table :data="$store.state.source" stripe cell-class-name="cell-style">
                    <el-table-column label="序号" type="index" width="100" align="center"></el-table-column>
                    <el-table-column prop="name" label="渠道"></el-table-column>
                    <el-table-column label="操作" width="100" align="center">
                        <template slot-scope="scope">
                            <div class="d-f f-j-c">
                                <span class="cursor-pointer fc-m" @click="modifySource(scope.row, 'source')" v-if="$$tools.isAuthority('editChannel')">编辑</span>
                                <span class="cursor-pointer ml-20 fc-subm" @click="deleteSource(scope.row, 'source')" v-if="$$tools.isAuthority('deleteChannel')">删除</span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </el-card>
          </el-col>
        </el-row>

        <el-dialog :title="classMask[maskState]" width="500px" center :visible.sync="classMaskStatus" :close-on-click-modal="false" @close="dialogClose('classForm')">
            <el-form :model="classForm" label-width="100px" size="small" :rules="classRules" ref="classForm" @submit.native.prevent>
                <div class="form-box">
                    <el-form-item :label="classMask.label" prop="name">
                        <el-input v-model.trim="classForm.name" placeholder="教室名称"></el-input>
                    </el-form-item>
                    <div class="d-f f-j-c mt-40"><MyButton @click.native="doneHandle('classForm')" :loading="submitLoading">确定</MyButton></div>
                </div>
            </el-form>
        </el-dialog>

        <el-dialog :title="sourseMask[maskState]" width="500px" center :visible.sync="sourceMaskStatus" :close-on-click-modal="false" @close="dialogClose('sourseForm')">
            <el-form :model="sourceForm" label-width="100px" size="small" :rules="sourceRules" ref="sourseForm" @submit.native.prevent>
                <div class="form-box">
                    <el-form-item :label="sourseMask.label" prop="name">
                        <el-input v-model.trim="sourceForm.name" placeholder="渠道名称"></el-input>
                    </el-form-item>
                    <div class="d-f f-j-c mt-40"><MyButton @click.native="doneHandle('sourseForm')" :loading="submitLoading">确定</MyButton></div>
                </div>
            </el-form>
        </el-dialog>
    </div>
</template>

<script>

import TableHeader from '../../components/common/TableHeader';
import MyButton from '../../components/common/MyButton';
export default {
  data () {
    return {
      state: 'loading',
      classroomLists: [],
      submitLoading: false,
      sourceLists: [],
      classMaskStatus: false,
      sourceMaskStatus: false,
      loading: true,
      classMask: { modify: '编辑教室', add: '添加教室', label: '教室名称：'},
      sourseMask: { modify: '编辑渠道', add: '添加渠道', label: '渠道来源：' },
      maskState: 'add',
      classForm: {id: '', name: ''},
      sourceForm: {id: '', name: ''},
      sourceRules: {
        name: [
          {required: true, message: '请输入渠道'},
          {max: 10, message: '长度不能超过10个字符'}
        ]
      },
      classRules: {
        name: [
          {required: true, message: '请输入教室'},
          {max: 10, message: '长度不能超过10个字符'}
        ]
      }
    };
  },
  methods: {
    //弹窗关闭
    dialogClose (type) {
      this.$refs[type].resetFields();
    },
    //头部按钮点击
    buttonHandle (d) {
      if (d == 'addClassroom') {
        this.classMaskStatus = true;
        this.sourceMaskStatus = false;
        this.classForm.name = '';
      } else {
        this.sourceMaskStatus = true;
        this.classMaskStatus = false;
        this.sourceForm.name = '';
      }

      this.maskState = 'add';
    },
    //表单确定点击
    doneHandle (formName) {
      console.log(this.form);

      this.$refs[formName].validate(valid => {
        if (valid) {
          this.submitData(formName);
        } else {
          return 0;
        }
      });
    },
    //点击修改
    modifySource (scope, type) {
      console.log(scope);
      if (type == 'class') {
        this.classMaskStatus = true;
        this.sourceMaskStatus = false;
        this.classForm.name = scope.name;
        this.classForm.id = scope.id;
      } else {
        this.sourceMaskStatus = true;
        this.classMaskStatus = false;
        this.sourceForm.name = scope.name;
        this.sourceForm.id = scope.id;
      }

      this.maskState = 'modify';
    },
    //删除
    deleteSource (scope, type) {
      let msg = type == 'source' ? '渠道' : '教室';

      this.$confirm(`确定删除${msg}吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteHandle(scope, type);
      }).catch(() => {
        return 0;
      });
    },
    //删除调用方法
    async deleteHandle (scope, type) {
      let url = type == 'source' ? '/source/delete' : '/classRoom/delete';
      let result = await this.$$request.post(url, {id: scope.id});

      if (!result) {
        return 0;
      }

      if (type == 'source') {
        this.$store.dispatch('getSource'); //更新渠道信息
      } else {
        this.$store.dispatch('getClassRoom'); //更新教室信息
      }

      this.$message.success('已删除');
    },
    //表单提交方法
    async submitData (formName) {
      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;

      let params = {}, url = '';

      if (formName == 'classForm') {
        params.name = this.classForm.name;
        url = this.maskState == 'modify' ? '/classRoom/edit' : '/classRoom/add';
        if (this.maskState == 'modify') {
          params.id = this.classForm.id;
        }
      } else {
        params.name = this.sourceForm.name;
        url = this.maskState == 'modify' ? '/source/edit' : '/source/add';
        if (this.maskState == 'modify') {
          params.id = this.sourceForm.id;
        }
      }

      let result = await this.$$request.post(url, params);

      this.submitLoading = false;
      console.log(result);

      if (!result) {
        return 0;
      }

      this.$message.success(this.maskState == 'modify' ? '修改成功' : '添加成功');

      if (formName == 'classForm') {
        this.$store.dispatch('getClassRoom'); //更新教室信息
        this.classForm.name = '';
        this.classMaskStatus = false;
      } else {
        this.$store.dispatch('getSource'); //更新渠道信息
        this.sourceForm.name = '';
        this.sourceMaskStatus = false;
      }
    },
    setLoaded () {
      if ('loaded' === this.$store.state.sourceState && 'loaded' === this.$store.state.classRoomState) {
        this.state = 'loaded';
      }
    }
  },
  mounted () {
    this.setLoaded();
  },
  watch: {
    '$store.state.sourceState' () {
      this.setLoaded();
    },
    '$store.state.classRoomState' () {
      this.setLoaded();
    }
  },
  components: {TableHeader, MyButton}
};
</script>

<style lang="less" scoped>
    .form-box {
        padding: 0 30px;
    }
</style>


