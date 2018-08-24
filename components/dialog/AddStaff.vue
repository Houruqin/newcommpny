<template>
    <el-dialog :title="staffType == 'add' ? '添加员工' : '修改员工'" width="700px" center :visible.sync="staffDialogStatus" :close-on-click-modal="false" @close="formClose" :append-to-body="appendBody">
        <el-form :model="staffForm" label-width="100px" :rules="rules" ref="userForm" size="small">
            <div class="form-box">
                <el-row>
                    <el-col :span="11">
                        <el-form-item label="姓名：" prop="name" :validate-on-rule-change="false">
                            <el-input v-model.trim="staffForm.name" placeholder="姓名"></el-input>
                        </el-form-item>
                        <el-form-item label="电话：" prop="mobile">
                            <el-input v-model.trim="staffForm.mobile" placeholder="电话"></el-input>
                        </el-form-item>
                        <el-form-item label="职位性质：" prop="kind">
                            <el-select v-model="staffForm.kind" placeholder="选择职位性质">
                                <el-option label="全职" :value="1"></el-option>
                                <el-option label="兼职" :value="2"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span="11" :offset="1">
                        <el-form-item label="职务：" prop="role_type">
                            <el-select v-if="!role" v-model="staffForm.role_type" multiple  placeholder="选择职务名称" @remove-tag="remove_tag">
                                <el-option v-if="staffForm.role_type.indexOf('master') !== -1" value="master" label="校长" :disabled="true"></el-option>
                                <el-option v-for="(item, index) in $store.state.roleLists" v-if="item.name !== 'master'" :key="index" :label="item.display_name" :value="item.name"></el-option>
                            </el-select>
                            <span v-else>{{staffForm.role_name}}</span>
                        </el-form-item>
                        <el-form-item label="入职时间：" prop="entry_date">
                            <el-date-picker
                                v-model="staffForm.entry_date"
                                type="date"
                                :editable="false"
                                placeholder="选择日期"
                                value-format="timestamp">
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <!-- <el-form-item label="权限分配：" class="mt-10">
                    <el-checkbox v-model="authorityAll" @change="authorityCheckAllChange">全选</el-checkbox>
                    <el-checkbox-group v-model="authorityCheckList" @change="authorityCheckChange">
                        <el-checkbox v-for="(item, index) in authorityAllLists" :label="item" :key="index">{{item.name}}</el-checkbox>
                    </el-checkbox-group>
                </el-form-item> -->
            </div>
        </el-form>
        <div class="mt-20 d-f f-j-c">
            <MyButton @click.native="doneHandle" :loading="submitLoading.add">确定</MyButton>
            <MyButton v-if="type == 'edit' && origin === 'list'" @click.native="dimissionClick" type="gray" class="ml-20" :loading="submitLoading.remove">离职</MyButton>
        </div>
    </el-dialog>
</template>


<script>
import MyButton from '../../components/common/MyButton'

export default {
    props: {
        role: {default: false},
        type: {default: 'add'},
        origin: {default: 'list'},
        dialogStatus: '',
        appendBody: {default: false},
        editDetail: {default: null}
    },
    watch: {
        dialogStatus(newVal, oldVal) {
            this.staffDialogStatus = newVal;
        },
        type(newVal, oldVal) {
            this.staffType = newVal;
        },
        editDetail(newVal, oldVal) {
            console.log(newVal, oldVal)
            if(!Object.keys(newVal).length) return 0;

            for(var key in this.staffForm) {
                if(key == 'entry_date') this.staffForm[key] = newVal.entry_at * 1000;
                else if(key == 'role_type'){this.staffForm[key] = [];for(let type of newVal.type_all){this.staffForm[key].push(type.type_en)}}
                else this.staffForm[key] = newVal[key];
            }
        },
        role(newVal, oldVal) {
            if(newVal) {
                this.$store.state.roleLists.forEach(v => {if(v.name === newVal) {
                    this.staffForm.role_type = [newVal];
                    this.staffForm.role_name = v.display_name;
                }});
            }
        }
    },
    data() {
        return {
            submitLoading: {
                add: false, remove: false
            },
            staffDialogStatus: false,
            staffForm: {name: '', mobile: '', role_type: [], entry_date: '', id: '', kind: ''},
            roleLists: [],
            staffType: 'add',
            rules: {
                name: [
                    {required: true, message: '请输入员工姓名'},
                    {max: 7, message: '长度不能超过7个字符'}
                ],
                mobile: [
                    {required: true, message: '请输入员工电话'},
                    {validator: this.$$tools.formValidate('phone')}
                ],
                role_type: [
                    {required: true, message: '请选择职务', trigger: 'change'}
                ],
                entry_date: [
                    {required: true, message: '请选择入职时间', trigger: 'change'}
                ],
                kind: [
                    {required: true, message: '请选择职位性质', trigger: 'change'}
                ]
            }
        }
    },
    methods: {
        formClose() {
            this.$refs.userForm.resetFields();
            Object.keys(this.staffForm).forEach(v => {this.staffForm[v] = v === 'role_type' ? [] : ''});
            this.$emit('CB-dialogStatus', 'staff');
        },
        //角色列表
        async getRoleLists() {
            let result = await this.$$request.post('/permission/roleLists');
            console.log(result);

            if(!result) return 0;
            this.roleLists = result.lists;
        },
        //确定
        doneHandle() {
            this.$refs.userForm.validate(valid => {if(valid) this.submitUserInfo()});
        },
        //提交新增、修改员工信息
        async submitUserInfo() {

            if(this.submitLoading.add) return 0;
            this.submitLoading.add = true;

            let url = this.staffType == 'add' ? '/user/add' : '/user/edit';
            let params = {
                name: this.staffForm.name,
                mobile: this.staffForm.mobile,
                type: this.staffForm.role_type,
                entry_at: this.staffForm.entry_date ?  this.staffForm.entry_date / 1000 : '',
                kind: this.staffForm.kind
            };

            if(this.staffType == 'edit') params.id = this.staffForm.id;
            console.log(params)
            let result = await this.$$request.post(url, params);
            this.submitLoading.add = false;
            console.log(result);

            if(!result) return 0;

            this.$emit('CB-AddStaff');
            this.staffDialogStatus = false;
            this.$store.dispatch('getAdvisor');   //更新员工顾问信息
            this.$store.dispatch('getTeacher');
            this.$message.success(this.staffType == 'edit' ? '修改成功' : '添加成功');
        },
        //离职
        async dimissionClick() {
            this.$confirm('员工离职后，数据将无法恢复，您确定要办理离职吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.dimissionHandle();
            }).catch(() => {return 0});
        },
        async dimissionHandle() {
            if(this.submitLoading.remove) return 0;
            this.submitLoading.remove = true;

            let result = await this.$$request.post('/user/changeStatus', {id: this.staffForm.id});
            this.submitLoading.remove = false;
            console.log(result);
            if(!result) return 0;
            this.$emit('CB-dimission');
            this.staffDialogStatus = false;
            this.$store.dispatch('getAdvisor');   //更新员工顾问信息
            this.$store.dispatch('getTeacher');
            this.$message.success('已修改为离职状态');
        },
        remove_tag(tag) {
            console.log(tag)
            if(tag === 'master') {
                this.staffForm.role_type.unshift('master')
                this.$message.closeAll();
                this.$message.warning('不能删除校长职务！')
            };

        }
    },
    components: {MyButton}
}
</script>

<style lang="less" scoped>
    .form-box {
        padding: 0 30px;
        /deep/ .el-select, .el-date-editor {
            width: 100%;
        }
    }
</style>

