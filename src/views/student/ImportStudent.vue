<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader :title="stepActive == 1 ? '导入学员' : stepActive == 2 ? '预览名单' : '上传结果'"></TableHeader>

            <div class="step-box" v-if="stepActive < 3">
                <ul class="d-f f-j-b">
                    <li v-for="(list, index) in stepLists" :key="index">
                        <div class="d-f f-d-c f-a-c">
                            <div class="img-box" :class="{'active': list.step <= stepActive}">
                                <template v-if="list.step <= stepActive">
                                    <img v-if="list.step == stepActive" src="../../images/common/step-edit.png" alt="">
                                    <img v-else src="../../images/common/step-success.png" alt="">
                                </template>
                            </div>
                            <span class="fc-7 mt-5 fs-15" :class="{'fc-m': list.step <= stepActive}">第{{list.step}}步<i class="pl-10">{{list.text}}</i></span>
                        </div>
                    </li>
                </ul>
            </div>


            <div class="content-box">
                <!-- 下载模板 -->
                <div class="step-one" v-show="stepActive === 1">
                    <el-row>
                        <h4 class="fc-m">下载学员名单模板</h4>
                        <div class="d-f mt-30">
                            <a class="d-f f-a-c f-j-c f-d-c ml-130" @click="downloadExcel('nosign')">
                                <img src="../../images/common/nosign-excel.png" alt="">
                                <span class="mt-25 fc-5">意向学员名单</span>
                            </a>
                            <a class="d-f f-a-c f-j-c f-d-c ml-130" @click="downloadExcel('signed')">
                                <img src="../../images/common/signed-excel.png" alt="">
                                <span class="mt-25 fc-5">已签约学员名单</span>
                            </a>
                        </div>
                        <p class="mt-30">注：</p>
                        <p>1.模板分为未签约和已签约学员模板</p>
                        <p>2.模板表头不可删，学员姓名、联系方式、性别为必填项</p>
                    </el-row>
                    <el-row class="mt-40">
                        <h4 class="fc-m">上传名单文件</h4>
                        <div class="d-f mt-50">
                            <el-upload
                                ref="nosignUpload"
                                :action="importUrl"
                                :auto-upload="false"
                                :name="fileName"
                                :headers="importHeaders"
                                :data="uploadParams"
                                :on-error="uploadFail"
                                :on-change="onChange"
                                :limit="1"
                                :show-file-list="true"
                                :on-success="uploadSuccess"
                                class="upload-cls">
                                <a class="d-f f-a-c f-j-c f-d-c" @click="uploadClick('nosign')">
                                    <img src="../../images/common/upload-icon.png" alt="">
                                    <span class="mt-25 fc-5">意向学员上传</span>
                                </a>
                            </el-upload>

                            <el-upload
                                ref="signedUpload"
                                :action="importUrl"
                                :auto-upload="false"
                                :name="fileName"
                                :headers="importHeaders"
                                :data="uploadParams"
                                :on-error="uploadFail"
                                :on-change="onChange"
                                :limit="1"
                                :show-file-list="true"
                                :on-success="uploadSuccess"
                                class="upload-cls">
                                <a class="d-f f-a-c f-j-c f-d-c" @click="uploadClick('signed')">
                                    <img src="../../images/common/upload-icon.png" alt="">
                                    <span class="mt-25 fc-5">签约学员上传</span>
                                </a>
                            </el-upload>
                        </div>
                        <p class="mt-30">注：</p>
                        <p>将学员按照格式名单填写，完成编辑后上传</p>
                    </el-row>
                </div>
                
                <!-- 预览名单 -->
                <div class="step-two" v-show="stepActive === 2" v-loading="loading">
                    <el-table class="student-table" :data="tableData" height="500" stripe>
                        <el-table-column label="序号" type="index" align="center"></el-table-column>
                        <el-table-column label="学员姓名" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': scope.row.school_name.trim().length > 7}">{{scope.row.school_name}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="学员性别" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': !['男', '女'].includes(scope.row.sex)}">{{scope.row.sex}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="学员生日" prop="birthday" align="center"></el-table-column>
                        <el-table-column label="家长姓名" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': scope.row.parent_name.trim().length > 7}">{{scope.row.parent_name}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="家长手机号" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': validate('phone', scope.row.mobile)}">{{scope.row.mobile}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="家长称呼" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': !$store.state.familyRelations.includes(scope.row.relation)}">{{scope.row.relation}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column label="渠道来源" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': scope.row.source.trim().length > 20}">{{scope.row.source}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column :label="uploadType === 'nosign' ? '意向课程' : '签约课程'" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': validate('course_name', scope.row.course_name)}">{{scope.row.course_name}}</span>
                            </template>
                        </el-table-column>
                        
                        <el-table-column v-if="uploadType === 'signed'" label="所在班级" prop="grade_name" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': validate('grade_name', scope.row)}">{{scope.row.grade_name}}</span>
                            </template>
                        </el-table-column>

                        <el-table-column v-if="uploadType === 'signed'" label="购课时数" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': validate('int', scope.row.lesson_num)}">{{scope.row.lesson_num}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column v-if="uploadType === 'signed'" label="剩余课时" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': validate('int', scope.row.remain_num)}">{{scope.row.remain_num}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column v-if="uploadType === 'signed'" label="赠送课时" prop="given_num" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': validate('int', scope.row.given_num)}">{{scope.row.given_num}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column v-if="uploadType === 'signed'" label="签约日期" prop="created_at" align="center"></el-table-column>
                        <el-table-column v-if="uploadType === 'signed'" label="合约金额" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': validate('price', scope.row.real_price)}">{{scope.row.real_price}}</span>
                            </template>
                        </el-table-column>

                        <el-table-column label="课程顾问" align="center">
                            <template slot-scope="scope">
                                <span :class="{'error': validate('course_advisor', scope.row.course_advisor)}">{{scope.row.course_advisor}}</span>
                            </template>
                        </el-table-column>
                    </el-table>

                    <div class="d-f f-a-c error mt-20">
                        <img src="../../images/common/error.png" alt="">
                        <span class="pl-10 fs-15">温馨提示：如果有被标红的数据，说明格式是有误的，请核对数据以后重新导入，系统将会过滤掉这些标红的有误数据</span>
                    </div>

                    <div class="d-f f-j-c mt-30">
                        <MyButton type="border" fontColor="fc-m" @click.native="reselect">重新上传</MyButton>
                        <MyButton class="ml-20" @click.native="done">确定导入</MyButton>
                    </div>
                </div>

                <!-- 上传结果 -->
                <div class="step-three mt-50" v-show="stepActive === 3">
                    <div class="d-f f-d-c f-a-c">
                        <img src="../../images/common/import-success.png" alt="">
                        <h3 class="fs-20 mt-20">导入成功</h3>
                        <span class="mt-10 fc-5 fs-15">签约学员数据已经导入成功，合计{{total}}条！</span>
                    </div>
                    <div class="d-f f-j-c mt-50">
                        <div class="btn border" @click="goWorkBench">回到工作台</div>
                        <div class="btn ml-20 bgc" @click="goStudentLists">点击查看</div>
                    </div>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>
import TableHeader  from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'
import XLSX from 'xlsx'
import {excelHeader} from '../../script/static'
import config from '../../config.json'

export default {
    data() {
        return {
            loading: false,
            stepActive: 1,
            excelHeader: excelHeader,
            total: 0,
            importUrl: '',
            fileName: 'import_excel',
            uploadParams:{excel_type: 'unsign'},
            doneStatus: false,  //是否是确定导入
            uploadType: 'nosign',
            excelfileExtend: '.xls,.xlsx',    //文件格式
            rABS: false,   //是否将文件读取为二进制字符串 
            stepLists: [
                {text: '下载模板', step: 1}, {text: '预览名单', step: 2}, {text: '上传结果', step: 3}
            ],
            tableAllHeader: {
                nosign: ['school_name', 'sex', 'birthday', 'parent_name', 'mobile', 'relation', 'source', 'course_name', 'course_advisor'],
                signed: ['school_name', 'sex', 'birthday', 'parent_name', 'mobile', 'relation', 'source', 'course_name', 'grade_name',
                    'lesson_num', 'remain_num', 'given_num', 'leave_num', 'real_price', 'created_at', 'course_advisor']
            },
            tableData: []
        }
    },
    computed: {
        importHeaders() {
            return {'Authorization': this.$$cache.get('TOKEN') || this.$$cache.getSession('TOKEN') || ''};
        }
    },
    methods: {
        //table验证
        validate(type, value) {
            if(type === 'phone') return !/^(1[34578]\d{9})?$/.test(value);

            if(type === 'price') {
                if(!value || isNaN(value)) return true;
                else if(value < 0) return true;
				else if(String(value).split('.')[1] && String(value).split('.')[1].length > 2) return true;
				else if(value > 99999) return true;
                else return false
            };

            if(type === 'course_name') return !this.$store.state.course.some(v => {return v.name == value});

            if(type === 'course_advisor') return !this.$store.state.advisor.some(v => {return v.name == value});

            if(type === 'grade_name') {
                if(!value.grade_name) return true;
                let isError;
                this.$store.state.course.forEach(v => {
                    isError = value.course_name == v.name ? !v.grades.some(k => {return k.name == value.grade_name}) : true;
                });
                return isError;
            };

            if(type == 'int') {
                if(isNaN(value)) return true;
                else if(Number(value) < 0) return true;
                else if(String(value).indexOf('.') > -1) return true;
                else return false;
            };
        },
        //下载模板
        downloadExcel(type) {
            let baseUrl = process.env.NODE_ENV  == 'development' ?  config.devBaseurl.api : config.prodBaseUrl.api;
            let downloadType = type === 'nosign' ? 'unsign' : 'sign';
            window.location.href = `${baseUrl}api/excel/download?excel_type=${downloadType}`;
        },
        uploadClick(type) {
            this.uploadType = type;
            this.uploadParams.excel_type = type === 'signed' ? 'sign' : 'unsign';
            this.$refs[`${type}Upload`].clearFiles();
        },
        onChange(file, fileList) {
            let fileExtend = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if(this.excelfileExtend.indexOf(fileExtend) <= -1) return this.$message.error('文件格式错误');
            this.readFiles(file.raw);
        },
        //上传错误
        uploadFail(err, file, fileList) {
            this.$message.warning('上传失败，请稍后再试');
        },
        //上传成功
        uploadSuccess(response, file, fileList) {
            console.log(response);
            if(response.code === 1) {
                if(response.data.status === 1) {
                    this.total = response.data.success;
                    this.loading = false;
                    this.stepActive = 3; 
                    this.doneStatus = true; 
                }else {
                    this.$message.warning('上传失败，请稍后再试');
                }
            }else {
                this.$message.warning('上传失败，请稍后再试');
            }
        },
        //回到工作台
        goWorkBench() {
            this.$router.replace({path: '/refresh'});   //刷新工作台路由
        },
        //回到学员列表
        goStudentLists() {
            this.$router.go(-1);
            this.doneStatus = false;
        },
        //读取文件
        readFiles(file) {
            FileReader.prototype.readAsBinaryString = () => {
                let binary = ""; 
                let pt = this;  
                var wb; //读取完成的数据 
                let reader = new FileReader();
                reader.onload = () => {
                    var bytes = new Uint8Array(reader.result);
                    var length = bytes.byteLength;  
                    for(let i = 0; i < length; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    wb = this.rABS ? XLSX.read(btoa(fixdata(binary)),{type: 'base64'}) : XLSX.read(binary, {type: 'binary'});
                    outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);   //outdata就是你想要的东西
                    this.verifyExcelFile(outdata);
                }
                reader.readAsArrayBuffer(file);   
            };
            
            let reader = new FileReader(), outdata;
            if(this.rABS) reader.readAsArrayBuffer(file);  
            else reader.readAsBinaryString(file);
        },
        //验证文件
        verifyExcelFile(data) {
            data.shift();
            if(!data.length) return this.$message.warning('不能上传空白列表，请重新上传');
            if(data.length > 500) return this.$message.warning('最多上传500条，请重新上传');

            let request = this.uploadType == 'nosign' ? 'nosign_request' : 'sign_request';
            
            let requestStatus = data.every((d, index) => {
                let requestArr = [];
                for(let key in d) {if(~key.indexOf('*')) requestArr.push(key)};
                return requestArr.length == excelHeader[request].length;
            });

            if(!requestStatus) return this.$message.warning('excel表格填写不正确，请重新上传');
            
            let tableHeader = excelHeader[this.uploadType];

            console.log(tableHeader);
            console.log(data);

            let newData = data.map(d => {
                let newObj = {};
                for(let key in d) {newObj[tableHeader[key.replace('*', '')]] = d[key]};
                this.tableAllHeader[this.uploadType].forEach(v => {if(!newObj[v]) newObj[v] = ''});
                return newObj;
            });

            console.log(newData);
            this.tableData = newData;
            if(!this.doneStatus) this.stepActive = 2;
            else this.stepActive = 3;
        },
        //重新上传
        reselect() {
            this.stepActive = 1;
            this.tableData = [];
            this.$refs[`${this.uploadType}Upload`].clearFiles();
        },
        //确定导入
        done() {
            this.loading = true;
            this.$refs[`${this.uploadType}Upload`].submit();       
        }
    },
    created() {
        let baseUrl = process.env.NODE_ENV  == 'development' ?  config.devBaseurl.api : config.prodBaseUrl.api;
        this.importUrl = `${baseUrl}api/excel/upload`;
    },
    components: {TableHeader, MyButton}
}
</script>

<style lang="less" scoped>
    .step-box {
        width: 600px;
        margin: 0 auto;
        margin-top: 20px;
        ul {
            li {
                .img-box {
                    position: relative;
                    border: 2px #e3e3e3 solid;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    &.active {
                        width: auto;
                        height: auto;
                        border: none;
                    }
                    img {
                        display: block;
                    }
                }
                &:not(:last-child) {
                    .img-box {
                        &::after {
                            content: '';
                            width: 212px;
                            height: 1px;
                            background-color: #e3e3e3;
                            position: absolute;
                            top: 50%;
                            transform: translateY(-50%);
                            left: 100%;
                        }
                    }
                }
            }
        }
    }
    .content-box {
        min-height: 600px;
        padding: 30px;
        h4 {
            font-weight: normal;
            font-size: 15px;
            border-left: 4px #45DAD5 solid;
            padding-left: 10px;
        }
        a {
            width: 260px;
            height: 145px;
            cursor: pointer;
            border: 1px #e3e3e3 solid;
        }
        .upload-cls {
            margin-left: 130px;
        }
        p {
            color: #999;
        }
    }
    .error {
        color: red;
    }
    .step-three {
        h3 {
            color: #45C365;
        }
        .btn {
            width: 130px;
            box-sizing: border-box;
            line-height: 30px;
            text-align: center;
            border-radius: 5px;
            border: 1px #45DAD5 solid;
            cursor: pointer;
            &.border {
                color: #45DAD5;
            }
            &.bgc {
                background-color: #45DAD5;
                color: #fff;
            }
        }
    }
</style>

