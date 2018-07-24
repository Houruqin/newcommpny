<template>
    <el-dialog :title="type == 'edit' ? '修改课程' : '添加课程'" width="800px" center :visible.sync="courseDialogStatus" :close-on-click-modal="false" @close="dialogClose('courseForm')">
        <el-form :model="courseForm" label-width="125px" size="small" ref="courseForm" :rules="courseRules">
            <div class="form-box add_course">
                <el-row>
                    <el-col :span="11">
                        <el-form-item label="课程名字：" prop="name">
                            <el-input v-model.trim="courseForm.name" placeholder="课程名称"></el-input>
                        </el-form-item>
                        <el-form-item label="课节时长：" prop="lesson_time" class="mt-30">
                            <el-input-number v-model="courseForm.lesson_time" controls-position="right" :min="1" :max="180"></el-input-number><span class="pl-10">分钟</span>
                        </el-form-item>
                    </el-col>

                    <el-col :span="11" :offset="1">
                        <el-form-item label="课程有效期：" prop="expire">
                            <el-input-number v-model="courseForm.expire" controls-position="right" :min="1" :max="120"></el-input-number><span class="pl-10">个月</span>
                        </el-form-item>
                        <el-form-item label="课程性质：" prop="type" class="mt-30">
                            <el-select :disabled="courseType == 'edit'" v-model="courseForm.type" placeholder="请选择">
                                <el-option label="普通课程" :value="1"></el-option>
                                <el-option label="一对一课程" :value="2"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </div>
        </el-form>
        
        <div class="d-f f-j-c mt-20">
            <MyButton class="mr-20" @click.native="doneHandle('courseForm')" :loading="submitLoading">提交</MyButton>
            <MyButton v-if="courseType == 'edit'" type="gray" @click.native="deleteCourse(courseForm.id)">删除</MyButton>
        </div>
    </el-dialog>
</template>

<script>

import MyButton from '../common/MyButton'
import Bus from '../../script/bus'

export default {
    props: {
        type: {default: 'add'},
        dialogStatus: '',
        editDetail: {default: null}
    },
    components: {MyButton},
    watch: {
        dialogStatus(newVal, oldVal) {
            // newVal == true && this.$refs.courseForm && this.$refs.courseForm.resetFields();

            this.courseDialogStatus = newVal;
            if(this.courseDialogStatus) {
                this.courseForm.expire = 12;   //有效期默认12月
                this.courseForm.lesson_time = 30;   //时长默认30分钟
                this.courseForm.type = 1;   //课程性质默认普通排课
            }
        },
        type(newVal, oldVal) {
            console.log(newVal)
            this.courseType = newVal;
        },
        editDetail(newVal, oldVal) {
            if(!Object.keys(newVal).length) return 0;
            for(let key in this.courseForm) this.courseForm[key] = newVal[key];
        }
    },
    data() {
        return {
            submitLoading: false,
            courseForm: {
                id: '',
                name: '',  //名字
                expire: '', //有效期
                lesson_time: '',  //课时时长
                type: 1 //课程性质
            },
            courseDialogStatus: false,
            courseType: 'add',
            courseRules: {
                name: [
                    {required: true, message: '请输入课程名称'},
                    {max: 20, message: '长度不能超过20个字符'}
                ],
                expire: [
                    {required: true, message: '请输入课程有效期'}
                ],
                unit_price: [
                    {required: true, message: '请输入学费标准'}
                ],
                lesson_time: [
                    {required: true, message: '请输入课节时长'}
                ]
            },
        }
    },
    methods: {
        dialogClose() {
            this.$refs.courseForm.resetFields();
            for(let key in this.courseForm) this.courseForm[key] = '';
            this.$emit('CB-dialogStatus', 'add_course');
        },
        //form表单确定按钮
        doneHandle() {
            this.$refs.courseForm.validate(valid => {if(valid) this.submitCourse()});
        },
        //删除课程
        deleteCourse(course_id) {
            this.$confirm('确定删除课程吗?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.deleteHandle(course_id);
            }).catch(() => {return 0});
        },
        async deleteHandle(course_id) {
            if(!course_id) return this.$message.warning('操作失败');
            
            let result = await this.$$request.post('api/course/delete', {id: course_id});
            console.log(result);
            if(!result) return 0;

            this.$message.success('删除成功');
            this.$store.dispatch('getCourse');   //更新课程信息
            this.$emit('CB-addCourse');
        },
        //新增、编辑课程提交数据
        async submitCourse() {
            if(this.submitLoading) return 0;
            this.submitLoading = true;

            let url = this.courseType == 'edit' ? 'api/course/edit' : 'api/course/add';
            let params = {};
            for(let key in this.courseForm) {if(key != 'id') params[key] = this.courseForm[key]};
            if(this.courseType == 'edit') params.id = this.courseForm.id;
            console.log(params);

            let result = await this.$$request.post(url, params);
            this.submitLoading = false;
            console.log(result);
            if(!result) return 0;

            this.courseDialogStatus = false;
            this.$message.success(this.courseType == 'edit' ? '修改成功' : '添加成功');
            this.$store.dispatch('getCourse');   //更新课程信息

            this.$emit('CB-addCourse');
            Bus.$emit('refreshCourseLists');
        }
    }
}
</script>

<style lang="less" scoped>
    .add_course /deep/ .el-input-number--small{
        width: 180px;
    }
</style>

