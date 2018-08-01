<template>
     <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="无班课管理">
                <MyButton @click.native="addCourse" class="ml-20">添加课程</MyButton>
            </TableHeader>

            <div class="course-list-box mt-20" v-for="(course, index) in courseLists" :key="index">
                <div class="list-header cursor-pointer d-f p-r f-a-c f-j-b pl-20 pr-20" @click.stop.self.prevent="listHeaderClick(course, index)">
                    <div class="d-f f-a-c">
                        <span class="fc-7 fs-16 d-f f-a-c">
                            <i class="fc-5">{{course.name}}</i>
                            <i class="iconfont icon-bianji ml-10" @click="editCourse(course)"></i>
                        </span>
                        <span class="fc-9 course_type ml-20 fs-12">{{course.type === 1 ? '普通' : '一对一'}}</span>
                    </div>
                    <div class="d-f f-a-c">
                        <span class="fc-9 ml-20 zhankai-icon" :class="{'rotate': course.collapse}" @click="listHeaderClick(course, index)">
                            <i class="iconfont icon-zhankai"></i>
                        </span>
                    </div>
                </div>

                <div>
                    
                </div>
            </div>
        </el-card>

        <!-- 添加、修改课程弹窗 -->
        <AddCourseDialog :dialogStatus="dialogStatus.course" :type="courseOperate" :editDetail="editDetail" :courseMode="1"
            @CB-dialogStatus="CB_dialogStatus" @CB-addCourse="CB_addCourse">
        </AddCourseDialog>
     </div>
</template>

<script>

import TableHeader from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'
import AddCourseDialog from '../../components/dialog/AddCourse'

export default {
    components: {TableHeader, MyButton, AddCourseDialog},
    data() {
        return {
            courseOperate: '',
            courseLists: [],
            editDetail: {},
            dialogStatus: {
                course: false,
            }
        }
    },
    methods: {
        CB_dialogStatus() {

        },
        CB_addCourse() {

        },
        //获取课程列表
        async getCourseLists(course_id) {
            let active = '';

            let result = await this.$$request.post('api/course/orderLists');
            console.log(result);
            if(!result) return 0;
            // result.lists.forEach((d, num) => {
            //     // d.collapse = (course_id && course_id == d.id);
            //     if(course_id && course_id == d.id) {
            //         d.collapse = true;
            //         active = num;
            //     }else d.collapse = false;

            //     d.class_lists.forEach(v => {v.operationStatus = false; v.gradeStatus = this.gradeStatus(v)});
            // });
            this.courseLists = result.lists;

            // this.$nextTick(v => {
            //     if(active !== '') {
            //         let dom = this.$refs['grade-table-content_' + active][0];
            //         let child = dom.firstChild;
            //         dom.style.height = `${child.offsetHeight}px`;
            //     }
            // });
        },
    },
    created() {
        this.getCourseLists();
    }
}
</script>

<style lang="less" scoped>
    .course-list-box {
        .list-header {
            background-color: #EEEEEE;
            height: 50px;
            span {
                img {
                    display: block;
                }
            }
            .zhankai-icon {
                -webkit-transition: transform 300ms;
                transition: transform 300ms;
                &.rotate {
                    -webkit-transform :rotate(180deg);
                    transform: rotate(180deg);
                }
            }
        }
        .grade-table-box {
            height: 0;
            position: relative;  
            overflow: hidden;
            -webkit-transition:  height 500ms;
            transition:  height 500ms;
        }
        .el-table {
            border-left: 1px #eeeeee solid;
            border-right: 1px #eeeeee solid;
        }
        .unfold-icon {
            .iconfont {
                -webkit-transition: transform 300ms;
                transition: transform 300ms;
                display: block;
                &.rotate {
                    -webkit-transform :rotate(180deg);
                    transform: rotate(180deg);
                }
            }
        }
        .course_type{
            display: inline-block;
            border: 1px solid #a9a9a9;
            height: 20px;
            line-height: 20px;
            padding: 0 5px;
            border-radius: 4px;
        }
    }
</style>

