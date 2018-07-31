<template>
  <div class="flex1">
        <!-- 年龄及性别统计 -->
        <el-card shadow="hover">
            <TableHeader title="校区统计"></TableHeader>
            <div class="d-f f-a-c">
                <h4>年龄及性别统计</h4>
                <el-select v-model="sex.student_type" placeholder="请选择" size="small" class="ml-20" @change="sexStudentTypeChange">
                    <el-option label="已签约学员" value="sign"></el-option>
                    <el-option label="未签约学员" value="unsign"></el-option>
                </el-select>
            </div>
            <p>
                <span>时间颗粒度：</span>
                <el-date-picker size="small" @change="sexDateChange" class="date-select" v-model="sex.start_time" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                <span>-</span>
                <el-date-picker size="small" @change="sexDateChange" class="date-select" v-model="sex.end_time" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            </p>
            <el-row :gutter="20" class="sex-chart-box echart-box mt-20">
                <el-col :span="7" class="p-r">
                    <div class="left-chart" ref="sexChart"></div>
                    <div class="student-total p-a t-a-c">
                        <p class="fs-30">{{sex.data.total_num}}</p><span class="fs-12">学员总数</span>
                    </div>
                </el-col>
                <el-col :span="17">
                    <div class="right-chart" ref="ageChart"></div>
                </el-col>
            </el-row>
            <!-- <div class="echart-box d-f">
                <div class="p-r left-chart">
                    <div ref="sexChart" class="left-chart"></div>
                    <div class="student-total p-a t-a-c">
                        <p class="fs-30">{{sex.data.total_num}}</p><span class="fs-12">学员总数</span>
                    </div>
                    <div class="sex-num p-a d-f f-j-b">
                        <div class="boy-num t-a-c">
                            <img :src="boyIcon" alt="">
                            <p>{{sex.data.man_percentage}}</p>
                        </div>
                        <div class="girl-num t-a-c">
                            <img :src="girlIcon" alt="">
                            <p>{{sex.data.woman_percentage}}</p>
                        </div>
                    </div>
                </div>
                <div class="right-chart flex1 ml-50" ref="ageChart"></div>
            </div> -->
        </el-card>

        <!-- 签约学员统计 -->
        <el-card class="mt-20" shadow="hover">
            <h4>签约学员统计</h4>
            <span>年份：</span>
            <el-date-picker v-model="student.year" size="small" type="year" @change="studentDateChange" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <el-row :gutter="20" class="student-chart-box echart-box mt-20">
                <el-col :span="7" class="p-r">
                    <div class="left-chart" ref="studentLeft"></div>
                    <div class="student-total p-a t-a-c">
                        <p class="fs-30" v-if="student.total_lists">{{student.total_lists.total_num}}</p><span class="fs-12">学员总数</span>
                    </div>
                </el-col>
                <el-col :span="17">
                    <div class="right-chart" ref="studentRight"></div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 课程及考勤统计 -->
        <el-card class="mt-20" shadow="hover">
            <h4>课程及考勤统计</h4>
            <span>年份：</span>
            <el-date-picker v-model="course.year" size="small" @change="courseDateChange" type="year" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <div class="echart-box mt-20">
                <div class="right-chart" ref="courseChart"></div>
            </div>
        </el-card>
        
        <!-- 渠道统计 -->
        <el-card class="mt-20" shadow="hover">
            <div class="d-f f-a-c">
                <h4>渠道统计</h4>
                <el-select v-model="source.student_type" placeholder="请选择" size="small" class="ml-20" @change="sourceStudentTypeChange">
                    <el-option label="已签约学员" value="sign"></el-option>
                    <el-option label="未签约学员" value="unsign"></el-option>
                </el-select>
            </div>
            <span>年份：</span>
            <el-date-picker v-model="source.what_time" size="small" @change="sourceDateChange" type="year" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <el-row :gutter="20" class="echart-box mt-20">
                <el-col :span="9" class="p-r">
                    <div class="left-chart" ref="sourceLeft"></div>
                    <div class="student-total p-a t-a-c">
                        <p class="fs-30" v-if="source.total_num">{{source.total_num}}</p><span class="fs-12">渠道总数</span>
                    </div>
                </el-col>
                <el-col :span="15" class="p-r">
                    <el-popover placement="bottom" width="150" trigger="click" popper-class="source-filter-popover">
                        <div class="my-scrollbar">
                            <el-scrollbar style="height: 100%;">
                                <ul>
                                    <li class="fc-7 cursor-pointer" :class="{'checked': item.checked}" 
                                        v-for="(item, index) in source.data" :key="index"
                                        @click="sourceFilterClick(item)">{{item.source_name}}
                                    </li>
                                </ul>
                            </el-scrollbar>
                        </div>
                        <MyButton slot="reference" class="p-a source-filter-btn">自定义筛选</MyButton>
                    </el-popover>
                    <div class="right-chart" ref="sourceRight"></div>
                </el-col>
            </el-row>
        </el-card>

        <!-- 销售统计 -->
        <el-card class="mt-20" shadow="hover">
            <div class="d-f f-a-c">
                <h4>销售统计</h4>
                <el-select v-model="sell.advisor_id" placeholder="请选择" size="small" class="ml-20" @change="sellAdvisorChange">
                    <el-option label="全部顾问" value=""></el-option>
                    <el-option v-for="(item, index) in $store.state.advisor" :key="index" :label="item.name" :value="item.id"></el-option>
                </el-select>
            </div>
            <span>时间颗粒度：</span>
            <el-date-picker size="small" class="date-select" @change="sellDateChange" v-model="sell.start_time" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <span>-</span>
            <el-date-picker size="small" class="date-select" @change="sellDateChange" v-model="sell.end_time" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <div class="echart-box sell-box d-f pb-40 f-j-b mt-50" v-if="Object.keys(sell.sell_lists).length">
                <div class="funnel-chart flex1 pl-50 d-f">
                    <div class="model-box p-r">
                        <ul>
                            <li v-for="(item, index) in sell.sell_lists.data" :key="index" :style="{backgroundColor: item.color}" :class="{'mt-5': index > 0}"></li>
                        </ul>
                    </div>

                    <ul class="detail-box pl-20">
                        <li v-for="(item, index) in sell.sell_lists.data" :key="index" class="p-r d-f f-a-c" :class="{'mt-5': index > 0}">
                            <div class="line"></div>
                            <div class="detail d-f f-a-c ml-5">
                                <span class="type" :style="{backgroundColor: item.color}"></span>
                                <span class="fc-7 fs-12 ml-10">{{item.name}}：{{item.c}}</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="sell-right flex1 pt-40">
                    <div class="item p-r">
                        <span class="fs-15 fc-5">成交率（已成交/全部咨询）</span>
                        <div class="schedule-box mt-10">
                            <a :style="{width: sell.sell_lists.deal_ratio_display}" :class="{'all': sell.sell_lists.deal_ratio == 1}"></a>
                            <span class="fs-20 ratio">{{sell.sell_lists.deal_ratio_display}}</span>
                        </div>
                    </div>

                    <div class="item mt-40 p-r">
                        <span class="fs-15 fc-5">失效率（已失效/全部咨询）</span>
                        <div class="schedule-box mt-10">
                            <a :style="{width: sell.sell_lists.fail_ratio_display}" :class="{'all': sell.sell_lists.fail_ratio == 1}"></a>
                            <span class="fs-20 ratio">{{sell.sell_lists.fail_ratio_display}}</span>
                        </div>
                    </div>
                </div>
            </div>
            <p class="fc-7">注：已沟通（包括已沟通和未接通学员）</p>
        </el-card>
    </div>
</template>

<script>
import TableHeader  from '../../components/common/TableHeader'
import MyButton from '../../components/common/MyButton'
import Echart from 'echarts'
import boyIcon from '../../images/common/boy.png'
import girlIcon from '../../images/common/girl.png'


export default {
    data() {
        return {
            monthArr: [],
            boyIcon: boyIcon,
            girlIcon: girlIcon,

            sexChartObj: null,   //性别图表对象
            ageChartObj: null,   //年龄折线图表对象

            studentLeftObj: null,  //学员统计饼图
            studentRightObj: null,   //学员统计折线图对象

            courseChartObj: null,   //课程及考勤折线图对象

            sourceLeftObj: null,    //渠道统计饼图
            sourceRightObj: null,    //渠道统计折线图

            sex: {
                start_time: new Date().getTime() -  60*60*24*365*1000,
                end_time: new Date().getTime(),
                student_type: 'sign',
                data: {}
            },
            student: {
                year: new Date().getTime(),
                student_type: [
                    {id: 'new', name: '新增学员', color: '#E94848', check: true}, 
                    {id: 'renew', name: '续约学员', color: '#45DAB2', check: true}, 
                    {id: 'quit', name: '退费学员', color: '#FF7D50', check: true}
                ],
                data: {},
                total_lists: {},
                colors: ['#E94848', '#45DAB2', '#FF7D50']
            },
            course: {
                year: new Date().getTime(),
                course_type: [
                    {id: 'timetable', name: '排课', color: '#45DAB2', check: true}, 
                    {id: 'course', name: '上课', color: '#FF7D50', check: true}, 
                    {id: 'leave', name: '请假', color: '#6880E5', check: true},
                    {id: 'absent', name: '旷课', color: '#E94848', check: true}
                ],
                data: {},
                colors: ['#45DAB2', '#FF7D50', '#6880E5', '#E94848']
            },
            source: {
                what_time: new Date().getTime(),
                student_type: 'sign',
                data: [],
                total_num: 0,
                colors: [
                    '#1cbc9c', '#87d37a', '#b7dd58', '#e0da6e', '#f2ba49', '#e67e24', '#d36e46', '#d65858', '#ce677d', '#c66f97',
                    '#a3559d', '#7f5091', '#913c8b', '#9d59b6', '#a17fcc', '#887ece', '#6a98db', '#53adc1', '#53bcc4', '#1ca4ba'
                ],
                showCheckBox: []    //渠道自定义的checkbox选项
            },
            sell: {
                start_time: new Date().getTime()     -  60*60*24*365*1000,
                end_time: new Date().getTime(),
                sell_lists: [],
                advisor_id: ''
            },
            colors: {
                sex: ['#FFCC50', '#45DAD5'],
                student: ['#45DAB2', '#FF7D50']
            },
            pieOptions: {
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b}: {c} ({d}%)'
                },
                legend : {
                    orient: 'vertical',
                    x: 'left',
                    top: 0,
                    right: 20,
                    itemGap: 15,
                    itemWidth: 15,
                    itemHeight: 8,
                    borderRadius: 0,
                    selectedMode: false
                }
            },
            mytext: ''
        }
    },
    methods: {
        aaaa(val) {
            console.log(val)
        },
        //性别时间change
        sexDateChange(val) {
            if(this.sex.end_time < this.sex.start_time) return this.$message.warning('结束时间不能小于开始时间，请从新选择');
            this.getSexLists();
        },
        //性别学员类型
        sexStudentTypeChange() {
            this.getSexLists();
        },
        //学员
        studentDateChange(val) {
            this.getStudentLists();
        },
        //课程
        courseDateChange(val) {
            this.getCourseLists();
        },
        //渠道
        sourceDateChange() {
            this.getSourseLists();
        },
        //渠道学员类型change
        sourceStudentTypeChange() {
            this.getSourseLists();
        },
        //销售
        sellDateChange() {
            if(this.sell.end_time < this.sell.start_time) return this.$message.warning('结束时间不能小于开始时间，请从新选择');
            this.getSellLists();
        },
        //销售顾问change
        sellAdvisorChange() {
            this.getSellLists();
        },
        //sourceFilter自定义筛选
        sourceFilterClick(item) {
            if(!item.checked) {
                if(this.source.showCheckBox.length == 7) return this.$message.warning('最多展示7条');
                this.source.showCheckBox.push(item);
                item.checked = true;
            }else {
                this.source.showCheckBox.forEach((v, num) => {if(v.source_id == item.source_id) this.source.showCheckBox.splice(num, 1)});
                item.checked = false;
            }
            console.log(this.source.showCheckBox);
            this.sourceRightInit();
        },
        //折线图参数整理
        lineChartOptions(type, colors) {
            let options = {
                tooltip: {trigger: 'axis'},
                legend: {
                    left: 50,
                    data: this[type][`${type}_type`].map(v => {return v.name})
                },
                color: colors ? colors : this[type].colors,
                xAxis: {
                    type: 'category',
                    data: this.monthArr
                },
                yAxis: {
                    type: 'value',
                    minInterval: 3
                },
                grid: {left: '50', right: '50', top: '50', bottom: '20', containLabel: true}
            };

            if(type === 'course') options.grid.left = '30';
            return options;
        },
        //年龄及性别统计 left
        sexChartInit() {
            let options = {
                tooltip: this.pieOptions.tooltip,
                color: this.colors.sex,
                legend: this.pieOptions.legend,
                textStyle: {color: '#555'},
                series: [
                    {
                        name: '性别',
                        type: 'pie',
                        startAngle: 80,
                        radius: ['35%', '50%'],
                        center: ['60%', '50%'],
                        avoidLabelOverlap: false,
                        legendHoverLink: false,
                        label: {show: false},
                        data: [{value: this.sex.data.woman_num, name: '女'}, {value: this.sex.data.man_num, name: '男'}]
                    }
                ]
            };
            options.legend.formatter = (params) => {
                if(params == '女') return `${params}：${this.sex.data.woman_num}`;
                if(params == '男') return `${params}：${this.sex.data.man_num}`;
            };
            this.sexChartObj.setOption(options, true);
        },
        //年龄及性别统计 right
        ageChartInit() {
            let xaxisText = {fontSize: 12, color: '#555'};            
            let options = {
                color: this.colors.sex,
                tooltip: {trigger: 'axis'},
                legend: {left: 50, data: ['女', '男']},
                xAxis: {
                    type: 'category',
                    data: [
                        {value: '3-5岁', textStyle: xaxisText}, 
                        {value: '5-7岁', textStyle: xaxisText}, 
                        {value: '7-9岁', textStyle: xaxisText}, 
                        {value: '9-11岁', textStyle: xaxisText},
                        {value: '11-12岁及以上', textStyle: xaxisText},
                        {value: '其他', textStyle: xaxisText}
                    ]
                },
                yAxis: {type: 'value', minInterval: 10},
                grid: {left: '50', right: '50', top: '50', bottom: '20', containLabel: true},
                series: [
                    {name: '女', type: 'bar', label: {show: true}, barWidth: 30, data: this.sex.data.lists.map(v => {return v.woman_num})},
                    {name: '男', type: 'bar', label: {show: true}, barWidth: 30, barGap: 0, data: this.sex.data.lists.map(v => {return v.man_num})}
                ]              
            };
            this.ageChartObj.setOption(options, true);
        },
        //签约学员统计 left
        studentChartInit() {
            let options = {
                tooltip: this.pieOptions.tooltip,
                color: this.colors.student,
                legend: this.pieOptions.legend,
                textStyle: {color: '#555'},
                series: [
                    {
                        name: '学员',
                        type: 'pie',
                        startAngle: 90,
                        radius: ['35%', '50%'],
                        center: ['60%', '50%'],
                        avoidLabelOverlap: false,
                        legendHoverLink: false,
                        label: {show: false},
                        data: [{value: this.student.total_lists.course_num || 0, name: '在校学员'}, {value: this.student.total_lists.expired_num || 0, name: '结业学员'}]
                    }
                ]
            };
            options.legend.formatter = (params) => {
                if(params == '在校学员') return `${params}：${this.student.total_lists.course_num}`;
                if(params == '结业学员') return `${params}：${this.student.total_lists.expired_num}`;
            };

            this.studentLeftObj.setOption(options, true);
        },
        //签约学员统计 right
        studentRightInit() {
            let options = this.lineChartOptions('student');

            let grid_lists = [];
            this.student.student_type.forEach(v => {
                if(v.check) grid_lists.push({type: 'line', name: v.name, data: this.student.data[`${v.id}_lists`]});
            });

            options.series = grid_lists;
            this.studentRightObj.setOption(options, true);
        },
        //课程及考勤
        courseChartInit() {
            let options = this.lineChartOptions('course');

            let grid_lists = [];
            this.course.course_type.forEach(v => {
                if(v.check) grid_lists.push({type: 'line', name: v.name, data: this.course.data[`${v.id}_lists`]});
            });

            options.series = grid_lists;
            this.courseChartObj.setOption(options, true);
        },
        //渠道统计 left
        sourceChartInit() {
            let options = {
                tooltip: this.pieOptions.tooltip,
                color: this.source.colors.slice(0, this.source.data.length),
                legend: this.pieOptions.legend,
                textStyle: {color: '#555' }
            };
            
            options.legend.formatter = (params) => {return `${params}：${this.getSourceItemNum(params)}`};
            options.series = [{
                name: '渠道',
                type: 'pie',
                startAngle: 90,
                radius: ['35%', '50%'],
                center: ['60%', '50%'],
                avoidLabelOverlap: false,
                legendHoverLink: false,
                label: {show: false},
                data: this.source.data.map(v => {return {value: v.total, name: v.source_name}})
            }]

            this.sourceLeftObj.setOption(options, true);
        },
        getSourceItemNum(text) {
            let num = 0;
            this.source.data.forEach(v => {
                if(v.source_name == text) num = v.total;
            });
            return num;
        },
        //渠道统计 right
        sourceRightInit() {
            let options = {
                tooltip: {trigger: 'axis'},
                legend: {
                    left: 50,
                    padding: [5, 150, 5, 5],
                    data: this.source.showCheckBox.map(v => {return v.source_name})
                },
                color: this.source.colors.slice(0, this.source.showCheckBox.length),
                grid: {left: '50', right: '50', top: '60', bottom: '20', containLabel: true},
                xAxis: {
                    type: 'category',
                    data: this.monthArr
                },
                yAxis: {
                    type: 'value',
                    minInterval: 3
                },
                series: this.source.showCheckBox.map(v => {
                    return {
                        name: v.source_name,
                        type: 'line',
                        data: v.data
                    }
                })
            };

            this.sourceRightObj.setOption(options, true);
        },
        //获取性别、年龄学员列表
        async getSexLists() {
            let result = await this.$$request.post('api/collect/sexLists', {start: this.sex.start_time / 1000, end: this.sex.end_time / 1000, type: this.sex.student_type});
            console.log(result);
            if(!result) return 0;
            
            result.total_num = result.woman_num + result.man_num;
            result.man_percentage = result.man_num == 0 ? '0%' : `${(result.man_num / result.total_num * 100).toFixed(1)}%`;
            result.woman_percentage = result.woman_num == 0 ? '0%' : `${(result.woman_num / result.total_num * 100).toFixed(1)}%`;

            this.sex.data = result;

            this.sexChartInit();
            this.ageChartInit();
        },
        //获取签约学员列表
        async getStudentLists() {
            let result = await this.$$request.post('api/collect/signLists', {what_time: this.student.year / 1000});
            console.log(result);
            if(!result) return 0;

            result.lists.total_lists.total_num = result.lists.total_lists.course_num + result.lists.total_lists.expired_num;  //学员总数
            this.student.total_lists = result.lists.total_lists;

            this.student.data = result.lists;

            this.studentChartInit();
            this.studentRightInit();
        },
        //课程及考勤统计列表
        async getCourseLists() {
            let result = await this.$$request.post('api/collect/courseLists', {what_time: this.course.year / 1000});
            console.log(result);
            if(!result) return 0;
            
            this.course.data = result.lists;

            this.courseChartInit();
        },
        //销售统计列表
        async getSellLists() {
            let result = await this.$$request.post('api/collect/sellLists', {start: this.sell.start_time / 1000, end: this.sell.end_time / 1000, advisor_id: this.sell.advisor_id});
            console.log(result);
            if(!result) return 0;

            this.sell.sell_lists = result.lists;
        },
        //渠道统计列表
        async getSourseLists() {
            let result = await this.$$request.post('api/collect/sourceLists', {what_time: this.source.what_time / 1000, type: this.source.student_type});
            console.log(result);
            if(!result) return 0;

            this.source.showCheckBox.splice(0, this.source.showCheckBox.length);
            // result.lists.sort((a, b) => {return a.total < b.total});
            
            result.lists.forEach((v, num) => {
                v.checked = num < 7 ? true : false;
                if(num < 7) this.source.showCheckBox.push(v);
            });

            this.source.data = result.lists;

            let total_num = result.lists.map(v => {return v.total}).reduce((a, b) => {return a + b});
            this.source.total_num = total_num;

            this.sourceChartInit();
            this.sourceRightInit();
        },
        allEChartInit() {
            this.sexChartObj = Echart.init(this.$refs.sexChart);
            this.ageChartObj = Echart.init(this.$refs.ageChart);

            this.studentLeftObj = Echart.init(this.$refs.studentLeft);
            this.studentRightObj = Echart.init(this.$refs.studentRight);

            this.courseChartObj = Echart.init(this.$refs.courseChart);

            this.sourceLeftObj = Echart.init(this.$refs.sourceLeft);
            this.sourceRightObj = Echart.init(this.$refs.sourceRight);
        }   
    },
    created() {
        let arr = [];
        for(let i = 1; i <= 12; i++) {this.monthArr.push(`${i}月`)};
    },
    mounted() {
        //定义所有图表对象
        this.allEChartInit();

        //年龄性别统计
        this.getSexLists();

        //签约学员统计
        this.getStudentLists();

        //课程考勤统计
        this.getCourseLists();

        //销售统计
        this.getSellLists();

        //渠道统计
        this.getSourseLists();
    },
    components: {TableHeader, MyButton}
}
</script>

<style lang="less" scoped>
    h4 {
        font-weight: normal;
        color: #555;
        font-size: 15px;
        margin: 20px 0;
    }
    .date-select {
        width: 150px;
    }

    .echart-box {
        .left-chart {
            height: 350px;
        }
        .right-chart {
            height: 350px;
        }
        .student-total {
            top: 50%;
            left: 60%;
            transform: translate(-50%, -50%);
        }
    }

    .sell-box {
        .funnel-chart {
            .model-box {
                overflow: hidden;
                width: 214px;
                height: 240px;
                ul {
                    li {
                        width: 215px;
                        height: 30px;
                    }
                }
                &::before {
                    content: '';
                    display: block;
                    position: absolute;
                    width: 0;
                    height: 0;
                    top: 0;
                    left: 0;
                    border-width: 180px 80px 180px 80px;
                    border-style: solid;
                    border-color: transparent transparent #fff #fff;
                }
                &::after {
                    content: '';
                    display: block;
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 0;
                    height: 0;
                    border-width: 175px 80px 175px 80px;
                    border-style: solid;
                    border-color: transparent transparent #fff #fff;
                    transform: scaleX(-1);
                }
            }
            .detail-box {
                li {
                    height: 30px;
                    .line {
                        width: 70px;
                        border: 0.5px #e3e3e3 dashed;
                    }
                    .detail {
                        .type {
                            width: 10px;
                            height: 10px;
                        }
                    }
                }
            }
        }
        .sell-right {
            .item {
                width: 360px;
                .schedule-box {
                    position: relative;
                    width: 100%;
                    height: 20px;
                    background-color: #CBEEED;
                    border-top-left-radius: 30px;
                    border-bottom-left-radius: 30px;
                    border-top-right-radius: 30px;
                    border-bottom-right-radius: 30px;
                    a {
                        position: absolute;
                        height: 100%;
                        border-top-left-radius: 30px;
                        border-bottom-left-radius: 30px;
                        background-color: #45DAD5;
                        &.all {
                            border-top-right-radius: 30px;
                            border-bottom-right-radius: 30px;
                        }
                    }        
                }
                .ratio {
                    display: block;
                    text-align: left;
                    width: 100px;
                    position: absolute;
                    right: -120px;
                    top: 50%;
                    transform: translateY(-50%);
                }
            }
        }
    }
    .source-filter-popover {
        .my-scrollbar {
            width: 100%;
            height: 200px;
        }
        ul {
            li {
                border-bottom: 1px #e3e3e3 solid;
                position: relative;
                height: 36px;
                line-height: 36px;
                &.checked {
                    color: #45DAD5;
                    &::after {
                        position: absolute;
                        right: 20px;
                        font-family: element-icons;
                        content: "\E611";
                        font-size: 12px;
                        font-weight: 700;
                        -webkit-font-smoothing: antialiased;
                    }
                }
            }
        }
    }
    .source-filter-btn {
        position: absolute;
        z-index: 50;
        top: 0;
        right: 40px;
    }
</style>


