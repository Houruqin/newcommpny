<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="导入学员">
                <MyButton class="mr-20" v-if="stepActive == 2" type="border" @click.native="errTableEdit = !errTableEdit" fontColor="fc-m">
                    {{errTableEdit ? '取消' : '编辑'}}
                </MyButton>
            </TableHeader>

            <!-- 第一页选择文件 -->
            <div class="mt-30 pl-20" v-if="stepActive == 1">
                <p class="fs-16 fc-5">导入学员基础信息</p>

                <div class="d-f f-a-c f-j-c f-d-c download-box mt-20 cursor-pointer" @click="downloadExcel">
                    <img src="../../images/common/signed-excel.png" alt="">
                    <span class="mt-15 fc-5">学员名单下载</span>
                </div>

                <div class="d-f upload-box f-a-c mt-50">
                    <span class="fc-5">选择上传文件</span>
                    <div class="input-box ml-10"><el-input readonly="true" size="small" v-model="fileInput"></el-input></div>
                    <el-upload
                        class="ml-20"
                        ref="nosignUpload"
                        :action="importUrl"
                        :auto-upload="false"
                        :name="fileName"
                        :headers="importHeaders"
                        :data="uploadParams"
                        :on-error="uploadFail"
                        :on-change="onChange"
                        :limit="1"
                        :show-file-list="false"
                        :on-success="uploadSuccess">
                        <MyButton>浏览</MyButton>
                    </el-upload>
                </div>

                <div class="explain-box mt-50">
                    <h4 class="fc-5 mt-50">导入须知：</h4>
                    <p></p>
                </div>

                <div class="d-f f-j-s mt-50"><MyButton @click.native="submitHandle">提交</MyButton></div>
            </div>

            <!-- 第二页预览，修改文件 -->
            <div class="preview-box" v-else-if="stepActive == 2">
                <el-table class="student-table" :data="previewData" height="800" stripe @selection-change="handleSelectionChange">
                    <el-table-column type="selection" :selectable="checkboxIsDisabled" width="30" v-if="errTableEdit"></el-table-column>
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="错误原因" align="center">
                        <template slot-scope="scope">
                            <span class="red">{{scope.row.error_info.data}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope">
                            <el-popover ref="name-popver" placement="bottom" width="200" trigger="click">
                                <el-input v-model="scope.row.student_name.data"></el-input>
                            </el-popover>
                            <span v-popover:name-popver :class="{'red': scope.row.student_name.error}">{{scope.row.student_name.data}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="学员性别" align="center">
                        <template slot-scope="scope">
                            <el-popover ref="sex-popver" placement="bottom" width="200" trigger="click">
                                <el-input v-model="scope.row.sex.data"></el-input>
                            </el-popover>
                            <span v-popover:sex-popver :class="{'red': scope.row.sex.error}">{{scope.row.sex.data}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" align="center">
                        <template slot-scope="scope">
                            <el-popover ref="mobile-popver" placement="bottom" width="200" trigger="click">
                                <el-input v-model="scope.row.mobile.data"></el-input>
                            </el-popover>
                            <span v-popover:mobile-popver :class="{'red': scope.row.mobile.error}">{{scope.row.mobile.data}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="学员生日" align="center">
                        <template slot-scope="scope">
                            <span :class="{'red': scope.row.birthday.error}">{{scope.row.birthday.data}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <span :class="{'red': scope.row.course_advisor.error}">{{scope.row.course_advisor.data}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="渠道来源" align="center">
                        <template slot-scope="scope">
                            <span :class="{'red': scope.row.source.error}">{{scope.row.source.data}}</span>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="d-f f-j-c mt-40 mb-20">
                    <MyButton @click.native="conflictSubmit">提交</MyButton>
                    <!-- <MyButton @click.native="doneHandle('addStudent')" :loading="submitLoading.student">删除</MyButton> -->
                </div>
            </div>
        </el-card>
    </div>
</template>

<script>

import TableHeader  from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'
import config from '../../config.json'
import XLSX from 'xlsx'
import {excelHeader} from '../../script/static'

export default {
    components: {TableHeader, MyButton},
    data() {
        return {
            stepActive: 1,
            importUrl: '',
            total: 0,
            fileName: 'import_excel',
            uploadParams:{excel_type: 'unsign'},
            excelfileExtend: '.xls,.xlsx',    //文件格式
            fileInput: '',
            errTableEdit: false,
            tableAllHeader: {
                basis: ['error_info', 'student_name', 'sex', 'mobile', 'birthday', 'course_advisor', 'source']
            },
            previewData: []
        }
    },
    computed: {
        importHeaders() {
            return {'Authorization': this.$$cache.get('TOKEN') || this.$$cache.getSession('TOKEN') || ''};
        }
    },
    methods: {
        //下载模板
        downloadExcel() {
            let baseUrl = process.env.NODE_ENV  == 'development' ?  config.devBaseurl.api : config.prodBaseUrl.api;
            window.location.href = `${baseUrl}api/excel/download?excel_type=unsign`;
        },
        //上传错误
        uploadFail(err, file, fileList) {
            this.$message.warning('上传失败，请稍后再试');
        },
        //上传成功
        uploadSuccess(response, file, fileList) {
            console.log(response)
            if(response.code === 1) {
                if(response.data.status === 1) {
                    this.total = response.data.success;
                    this.stepActive = 3; 
                }else {
                    this.stepActive = 2;
                    let result = response.data.data;
                    
                    console.log(result);

                    this.previewData = result.map(d => {
                        let list = {};
                        this.tableAllHeader.basis.forEach((v, n) => {
                            list[v] = {data: d[n].data, error: d[n].error, errInfo: d[n].error_info};
                        });
                        return list;
                    });

                    console.log(this.previewData);
                }
            }else {
                this.$message.warning('上传失败，请稍后再试');
            }
        },
        onChange(file, fileList) {
            let fileExtend = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if(this.excelfileExtend.indexOf(fileExtend) <= -1) return this.$message.error('文件格式错误');
            this.readFiles(file.raw);
        },
        //读取文件
        readFiles(file) {
            this.fileInput = file.name
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

            let requestStatus = data.every((d, index) => {
                let requestArr = [];
                for(let key in d) {if(~key.indexOf('*')) requestArr.push(key)};
                return requestArr.length == excelHeader.basis_request.length;
            });

            if(!requestStatus) return this.$message.warning('excel表格填写不正确，请重新上传');
            
            let tableHeader = excelHeader.basis;

            let newData = data.map(d => {
                let newObj = {};
                for(let key in d) {newObj[tableHeader[key.replace('*', '')]] = d[key]};
                this.tableAllHeader.basis.forEach(v => {if(!newObj[v]) newObj[v] = ''});
                return newObj;
            });

            this.tableData = newData;
        },
        submitHandle() {
            this.$refs.nosignUpload.submit();
        },


        handleSelectionChange() {

        },
        checkboxIsDisabled() {

        },
        //冲突提交
        conflictSubmit() {

        }
    },
    created() {
        let baseUrl = process.env.NODE_ENV  == 'development' ?  config.devBaseurl.api : config.prodBaseUrl.api;
        this.importUrl = `${baseUrl}api/excel/upload`;
    }
}
</script>

<style lang="less" scoped>
    .download-box {
        width: 220px;
        height: 130px;
        border: 1px #e3e3e3 solid;
    }
    .upload-box {
        .input-box {
            width: 300px;
        }
    }
    .explain-box {
        border-top: 1px #e3e3e3 solid;
        h4 {
            font-weight: normal;
        }
    }
    .red {
        color: red;
    }
</style>


