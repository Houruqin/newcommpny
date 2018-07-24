<template>
    <div class="flex1">
        <el-card shadow="hover">
            <TableHeader title="导入学员">
                <MyButton class="mr-20" v-if="stepActive == 2" type="border" @click.native="timetableEditClick" fontColor="fc-m">
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
                    <div class="input-box ml-10 pl-20 pr-20 fc-7 t-o-e" :title="fileInput">{{fileInput}}</div>
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
                        :show-file-list="false"
                        :on-success="uploadSuccess">
                        <MyButton>浏览</MyButton>
                    </el-upload>
                </div>

                <div class="explain-box mt-50">
                    <h4 class="fc-5 mt-50 fs-15 mb-10">导入须知：</h4>
                    <p>1. 支持学员基本信息导入</p>
                    <p>2. 输入信息请遵循模板格式添加，否则无法成功导入数据</p>
                    <p>3. 导入课程顾问和渠道来源需要和系统信息保持一致，否则无法成功导入</p>
                    <p>4. 导入的数据将同步到学员信息和统计信息内</p>
                    <p>5. 一次导入数据最多不可超过200条，否则无法成功导入数据</p>
                    <p>6. 如遇到导入问题请联系在线客服或者致电：028-85251337</p>
                </div>

                <div class="d-f f-j-s mt-50 mb-30"><MyButton @click.native="submitHandle">提交</MyButton></div>
            </div>

            <!-- 第二页预览，修改文件 -->
            <div class="preview-box" v-else-if="stepActive == 2">
                <el-table class="student-table" :data="previewData" height="680" stripe @selection-change="handleSelectionChange" ref="previewTable">
                    <el-table-column type="selection" width="50" v-if="errTableEdit"></el-table-column>
                    <el-table-column label="序号" type="index" align="center"></el-table-column>
                    <el-table-column label="错误原因" align="center" width="350">
                        <template slot-scope="scope">
                            <span class="red">{{scope.row.error_info.data}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="学员姓名" align="center">
                        <template slot-scope="scope">
                            <el-popover placement="bottom" width="170" trigger="click">
                                <el-input v-model="scope.row.student_name.data" size="small" @change="scope.row.student_name.error = false"></el-input>
                                <div class="cell-box" slot="reference">
                                    <span class="out-line" :class="{'red': scope.row.student_name.error}">{{scope.row.student_name.data}}</span>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="学员性别" align="center">
                        <template slot-scope="scope">
                            <el-popover placement="bottom" width="170" trigger="click">
                                <el-input v-model="scope.row.sex.data" size="small" @change="scope.row.sex.error = false"></el-input>
                                <div class="cell-box" slot="reference">
                                    <span slot="reference" class="out-line" :class="{'red': scope.row.sex.error}">{{scope.row.sex.data}}</span>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="联系电话" align="center">
                        <template slot-scope="scope">
                            <el-popover placement="bottom" width="170" trigger="click">
                                <el-input v-model="scope.row.mobile.data" size="small" @change="scope.row.mobile.error = false"></el-input>
                                <div class="cell-box" slot="reference">
                                    <span class="out-line" :class="{'red': scope.row.mobile.error}">{{scope.row.mobile.data}}</span>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="学员生日" align="center">
                        <template slot-scope="scope">
                            <el-popover placement="bottom" width="170" trigger="click" popper-class="birthday-popper">
                                <el-date-picker 
                                    v-model="scope.row.birthday.data" type="date" 
                                    placeholder="选择日期" :editable="false" 
                                    size="small" :picker-options="pickerBeginDateAfter"
                                    value-format="yyyy-MM-dd"
                                    @change="scope.row.birthday.error = false">
                                </el-date-picker>
                                <div class="cell-box" slot="reference">
                                    <span class="out-line" :class="{'red': scope.row.birthday.error}">{{scope.row.birthday.data}}</span>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="课程顾问" align="center">
                        <template slot-scope="scope">
                            <el-popover placement="bottom" width="170" trigger="click">
                                <el-input v-model="scope.row.course_advisor.data" size="small" @change="scope.row.course_advisor.error = false"></el-input>
                                <div class="cell-box" slot="reference">
                                    <span class="out-line" :class="{'red': scope.row.course_advisor.error}">{{scope.row.course_advisor.data}}</span>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                    <el-table-column label="渠道来源" align="center">
                        <template slot-scope="scope">
                            <el-popover placement="bottom" width="170" trigger="click">
                                <el-input v-model="scope.row.source.data" size="small" @change="scope.row.source.error = false"></el-input>
                                <div class="cell-box" slot="reference">
                                    <span class="out-line" :class="{'red': scope.row.source.error}">{{scope.row.source.data}}</span>
                                </div>
                            </el-popover>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="d-f f-j-c mt-40 mb-10">
                    <MyButton @click.native="conflictSubmit" v-if="!errTableEdit">提交</MyButton>
                    <MyButton @click.native="conflictDelete" v-else :type="deleteData.length ? 'subm' : 'gray'" class="ml-20">删除</MyButton>
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
            previewData: [],    //错误冲突列表数据
            deleteData: [],   //删除列表
            tableData: [],   //excel表原始数据
            pickerBeginDateAfter: {
                disabledDate: (time) => {
                    return time.getTime() > new Date().getTime();
                }
            }
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
            this.$message.warning('请求失败，请稍后再试');
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
                    let list = response.data.data;
                    
                    console.log(list);

                    this.previewData = list.map((d, e) => {
                        let list = {index: `student_${e}`};
                        this.tableAllHeader.basis.forEach((v, n) => {
                            list[v] = {data: d[n].data, error: d[n].error, errInfo: d[n].error_info};
                        });
                        return list;
                    });

                    console.log(this.previewData);
                }
            }else {
                this.$message.warning('请求失败，请稍后再试');
            }
        },
        //选择文件
        onChange(file, fileList) {
            if(fileList.length > 1) fileList.shift();
            let fileExtend = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
            if(this.excelfileExtend.indexOf(fileExtend) <= -1) return this.$message.error('文件格式错误');
            this.readFiles(file.raw);
        },
        //读取文件
        readFiles(file) {
            this.fileInput = file.name;
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
                    this.tableData = outdata.slice(1);
                }
                reader.readAsArrayBuffer(file);   
            };
            
            let reader = new FileReader(), outdata;
            if(this.rABS) reader.readAsArrayBuffer(file);  
            else reader.readAsBinaryString(file);
        },
        //提交excel
        submitHandle() {
            if(!this.fileInput) return this.$message.warning('请选择文件!');
            this.verifyExcelFile();
        },
        //验证文件
        verifyExcelFile() {
            console.log(this.tableData)
            if(!this.tableData.length) return this.$message.warning('不能上传空白列表文件，请重新上传');
            if(this.tableData.length > 500) return this.$message.warning('最多上传500条，请重新上传');

            let requestStatus = this.tableData.every((d, index) => {
                let requestArr = [];
                for(let key in d) {if(~key.indexOf('*')) requestArr.push(key)};
                return requestArr.length == excelHeader.basis_request.length;
            });

            if(!requestStatus) return this.$message.warning('excel表格填写不正确，请重新上传');

            this.$refs.nosignUpload.submit();
        },
        //冲突预览，表格checkbox勾选change
        handleSelectionChange(val) {
            this.deleteData = val;
        },
        //右上角编辑、取消切换
        timetableEditClick(a, b) {
            this.errTableEdit = !this.errTableEdit;
            if(!this.errTableEdit) this.$refs.previewTable.clearSelection();
        },
        //冲突提交
        conflictSubmit() {
            console.log(this.previewData);

            var tableList = this.previewData.map(d => {
                let res = [];
                this.tableAllHeader.basis.slice(1).forEach((v, n) => {res[n] = d[v].data});
                return res;
            });

            console.log(tableList);
            this.subSubmitHandle(tableList);
        },
        async subSubmitHandle(params) {
            let result = await this.$$request.post('api/excel/upload', {excel_type: 'unsign', data: params});
            console.log(result);
            if(!result) return 0;

            if(result.status === 1) {
                this.total = result.success;
                this.stepActive = 3; 
            }else {
                this.stepActive = 2;
                let list = result.data;
                
                console.log(list);

                this.previewData = list.map(d => {
                    let list = {};
                    this.tableAllHeader.basis.forEach((v, n) => {
                        list[v] = {data: d[n].data, error: d[n].error, errInfo: d[n].error_info};
                    });
                    return list;
                });
                console.log(this.previewData);
            }
        },
        //冲突删除
        conflictDelete() {
            if(!this.deleteData.length) return this.$message.warning('请选择数据!');

            this.deleteData.forEach(v => {
                this.previewData.forEach((d, n) => {if(d.index == v.index) this.previewData.splice(n, 1)});
            });

            this.errTableEdit = false;
            console.log(this.previewData);
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
            height: 32px;
            line-height: 32px;
            border-radius: 3px;
            border: 1px #e3e3e3 solid;
        }
    }
    .explain-box {
        border-top: 1px #e3e3e3 solid;
        h4 {font-weight: normal;}
        p {
            margin-top: 5px;
            color: #777;
        }
    }
    .red {
        color: red;
    }
    .birthday-popper {
        .el-date-editor {
            width: 100%;
        }
    }
    .student-table {
        .cell-box {
            width: 100%;
            min-height: 22px;
        }
    }
</style>


