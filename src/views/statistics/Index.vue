<template>
  <div class="flex1">
        <!-- 年龄及性别统计 -->
        <el-card shadow="hover">
            <TableHeader title="校区统计"></TableHeader>
            <h4>年龄及性别统计</h4>
            <p>
                <span>时间颗粒度：</span>
                <el-date-picker size="small" @change="sexDateChange" class="date-select" v-model="sex.start_time" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
                <span>-</span>
                <el-date-picker size="small" @change="sexDateChange" class="date-select" v-model="sex.end_time" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            </p>
            <div class="echart-box d-f">
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
                <div class="right-chart flex1" ref="ageChart"></div>
            </div>
        </el-card>

        <!-- 学员统计 -->
        <el-card class="mt-20" shadow="hover">
            <h4>学员统计</h4>
            <span>年份：</span>
            <el-date-picker v-model="student.year" size="small" type="year" @change="studentDateChange" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <div class="echart-box d-f">
                <div class="left-chart p-r flex1">
                    <div ref="studentLeft" class="left-chart"></div>
                    <div class="student-total p-a t-a-c">
                        <p class="fs-30" v-if="student.total_lists">{{student.total_lists.total_num}}</p><span class="fs-12">学员总数</span>
                    </div>
                </div>
                <div class="flex1">
                    <ul class="d-f ml-50">
                        <li v-for="(item, index) in student.student_type" 
                            :key="index" 
                            class="cursor-pointer d-f f-a-c" 
                            :class="{'ml-30': index > 0}" 
                            @click="chartTypeCheck('student', item)">
                            <span class="bg d-f f-j-c f-a-c" :style="{'backgroundColor': item.color}"><img v-if="item.check" src="../../images/common/draw-icon.png" alt=""></span>
                            <span class="ml-10">{{item.name}}</span>
                        </li>
                    </ul>
                    <div class="right-chart" ref="studentRight"></div>
                </div>
            </div>
        </el-card>

        <!-- 课程及考勤统计 -->
        <el-card class="mt-20" shadow="hover">
            <h4>课程及考勤统计</h4>
            <span>年份：</span>
            <el-date-picker v-model="course.year" size="small" @change="courseDateChange" type="year" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <div class="echart-box">
                <ul class="d-f ml-50 mt-20">
                    <li v-for="(item, index) in course.course_type" 
                        :key="index" 
                        class="cursor-pointer d-f f-a-c" 
                        :class="{'ml-30': index > 0}" 
                        @click="chartTypeCheck('course', item)">
                        <span class="bg d-f f-j-c f-a-c" :style="{'backgroundColor': item.color}"><img v-if="item.check" src="../../images/common/draw-icon.png" alt=""></span>
                        <span class="ml-10">{{item.name}}</span>
                    </li>
                </ul>
                <div class="right-chart" ref="courseChart"></div>
            </div>
        </el-card>

        <!-- 销售统计 -->
        <el-card class="mt-20" shadow="hover">
            <h4>销售统计</h4>
            <span>时间颗粒度：</span>
            <el-date-picker size="small" class="date-select" @change="sellDateChange" v-model="sell.start_time" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <span>-</span>
            <el-date-picker size="small" class="date-select" @change="sellDateChange" v-model="sell.end_time" :editable="false" :clearable="false" placeholder="选择日期" value-format="timestamp"></el-date-picker>
            <div class="echart-box sell-box d-f pb-40" v-if="Object.keys(sell.sell_lists).length">
                <div class="funnel-chart flex1 pl-100 d-f mt-50">
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
                <div class="sell-right mt-60 flex1 ml-60">
                    <div class="item p-r">
                        <span class="fs-15 fc-5">成交率（已成交/全部咨询）</span>
                        <div class="schedule-box mt-10">
                            <a :style="{width: `${Number(sell.sell_lists.deal_ratio) * 100}%`}" :class="{'all': sell.sell_lists.deal_ratio == 1}"></a>
                            <span class="fs-20 ratio">{{`${Number(sell.sell_lists.deal_ratio) * 100}%`}}</span>
                        </div>
                    </div>

                    <div class="item mt-40 p-r">
                        <span class="fs-15 fc-5">失效率（已失效/全部咨询）</span>
                        <div class="schedule-box mt-10">
                            <a :style="{width: `${Number(sell.sell_lists.fail_ratio) * 100}%`}" :class="{'all': sell.sell_lists.fail_ratio == 1}"></a>
                            <span class="fs-20 ratio">{{`${Number(sell.sell_lists.fail_ratio) * 100}%`}}</span>
                        </div>
                    </div>
                </div>
            </div>
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

            sex: {
                start_time: new Date().getTime() -  60*60*24*365*1000,
                end_time: new Date().getTime(),
                data: {}
            },
            student: {
                year: new Date().getTime(),
                student_type: [
                    {id: 'new', name: '新增学员', color: '#E94848', check: true}, 
                    {id: 'course', name: '上课学员', color: '#45DAB2', check: true}, 
                    {id: 'expired', name: '结业学员', color: '#FF7D50', check: true}
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
            sell: {
                start_time: new Date().getTime() -  60*60*24*365*1000,
                end_time: new Date().getTime(),
                // sell_type: [
                //     {id: 'total', name: '全部咨询', color: '#45DAB2', data: 0},
                //     {id: 'to', name: '待跟进', color: '#BDD74E', data: 0},
                //     {id: 'have', name: '跟进中', color: '#FDDE3B', data: 0},
                //     {id: 'invited', name: '已邀约', color: '#A3B4DA', data: 0},
                //     {id: 'listen', name: '已试听', color: '#838A99', data: 0},
                //     {id: 'visited', name: '已到访', color: '#114355', data: 0},
                //     {id: 'sign', name: '已成交', color: '#E94848', data: 0}
                // ],
                // colors: ['#45DAB2', '#BDD74E', '#FDDE3B', '#A3B4DA', '#838A99', '#114355', '#E94848'],
                // data: {},
                sell_lists: [],
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
                    top: 20,
                    itemGap: 15,
                    itemWidth: 15,
                    itemHeight: 8,
                    borderRadius: 0,
                    selectedMode: false
                }
            },
            lineOptions: {
                tooltip: {trigger: 'axis'},
                grid: {  
                    left: '100',  
                    right: '60',
                    top: '40',  
                    bottom: '20',  
                    containLabel: true  
                }
            }
        }
    },
    methods: {
        //性别时间change
        sexDateChange(val) {
            if(this.sex.end_time < this.sex.start_time) return this.$message.warning('结束时间不能小于开始时间，请从新选择');
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
        //销售
        sellDateChange() {
            if(this.sell.end_time < this.sell.start_time) return this.$message.warning('结束时间不能小于开始时间，请从新选择');
            this.getSellLists();
        },
        //折线图参数整理
        lineChartOptions(type, colors) {
            let options = {
                tooltip: this.lineOptions.tooltip,
                legend: {show: false},
                color: colors ? colors : this[type].colors,
                xAxis: {
                    type: 'category',
                    data: this.monthArr
                },
                yAxis: {
                    type: 'value',
                    minInterval: 3
                },
                grid: this.lineOptions.grid
            };

            if(type === 'course') {
                options.grid.left = '30';
                // options.tooltip.formatter = '{b0}<br/>{a0}量:{c0}<br/>{a1}量:{c1}<br/>{a2}量:{c2}<br/>{a3}量:{c3}'
            }

            return options;
        },
        //学员性别图表
        sexChartInit() {
            this.sexChartObj = Echart.init(this.$refs.sexChart);
            let options = {
                tooltip: this.pieOptions.tooltip,
                color: this.colors.sex,
                legend: this.pieOptions.legend,
                textStyle: {color: '#555' }
            };
            options.legend.formatter = (params) => {
                if(params == '女') return `${params}：${this.sex.data.woman_num}`;
                if(params == '男') return `${params}：${this.sex.data.man_num}`;
            };
            this.sexChartObj.setOption(options);
        },
        //学员年龄图表
        ageChartInit() {
            this.ageChartObj = Echart.init(this.$refs.ageChart);
            let xaxisText = {fontSize: 12, color: '#555'};            
            let options = {
                color: this.colors.sex,
                tooltip: this.lineOptions.tooltip,
                legend: {show: false},
                label: {show: false},
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
                grid: this.lineOptions.grid               
            };
            
            this.ageChartObj.setOption(options);
        },
        //学员上课情况图表
        studentChartInit() {
            this.studentLeftObj = Echart.init(this.$refs.studentLeft);

            let options = {
                tooltip: this.pieOptions.tooltip,
                color: this.colors.student,
                legend: this.pieOptions.legend,
                textStyle: {color: '#555' }
            };
            options.legend.formatter = (params) => {
                if(params == '上课学员') return `${params}：${this.student.total_lists.course_num}`;
                if(params == '结业学员') return `${params}：${this.student.total_lists.expired_num}`;
            };

            this.studentLeftObj.setOption(options);
        },
        //学员上课情况折线图
        studentRightInit() {
            this.studentRightObj = Echart.init(this.$refs.studentRight);
            this.studentRightObj.setOption(this.lineChartOptions('student'));
        },
        //课程及考勤图表初始化
        courseChartInit() {
            this.courseChartObj = Echart.init(this.$refs.courseChart);
            this.courseChartObj.setOption(this.lineChartOptions('course'));
        },
        //折线图切换显示
        chartTypeCheck(type, item) {
            item.check = !item.check;

            let grid_lists = [], colors = [];

            this[type][`${type}_type`].forEach(v => {if(v.check) {
                grid_lists.push({type: 'line', name: v.name, data: this[type].data[`${v.id}_lists`]});
                colors.push(v.color);
            }});

            let obj = type == 'student' ? this.studentRightObj : this.courseChartObj;

            let options = this.lineChartOptions(type, colors);

            options.series = grid_lists;

            obj.setOption(options, true);
        },
        //获取性别、年龄学员列表
        async getSexLists() {
            let result = await this.$$request.post('api/collect/sexLists', {start: this.sex.start_time / 1000, end: this.sex.end_time / 1000});
            console.log(result);
            if(!result) return 0;
            result.total_num = result.woman_num + result.man_num;
            result.man_percentage = result.man_num == 0 ? '0%' : `${(result.man_num / result.total_num * 100).toFixed(1)}%`;
            result.woman_percentage = result.woman_num == 0 ? '0%' : `${(result.woman_num / result.total_num * 100).toFixed(1)}%`;

            this.sex.data = result;

            this.sexChartObj.setOption({
                series: [
                    {
                        name:'性别',
                        type:'pie',
                        startAngle: 80,
                        radius: ['35%', '50%'],
                        center: ['60%', '50%'],
                        avoidLabelOverlap: false,
                        legendHoverLink: false,
                        label: {show: false},
                        data:[{value: this.sex.data.woman_num, name: '女'}, {value: this.sex.data.man_num, name: '男'}]
                    }
                ]
            });

            this.ageChartObj.setOption({
                series: [
                    {name: '女', type: 'bar', label: {show: true}, barWidth: 30, data: this.sex.data.lists.map(v => {return v.woman_num})},
                    {name: '男', type: 'bar', label: {show: true}, barWidth: 30, barGap: 0, data: this.sex.data.lists.map(v => {return v.man_num})}
                ]
            });
        },
        //上课情况，获取学员列表
        async getStudentLists() {
            let result = await this.$$request.post('api/collect/signLists', {what_time: this.student.year / 1000});
            console.log(result);
            if(!result) return 0;

            result.lists.total_lists.total_num = result.lists.total_lists.course_num + result.lists.total_lists.expired_num;  //学员总数
            this.student.total_lists = result.lists.total_lists;
            this.studentLeftObj.setOption({
                series: [
                    {
                        name:'学员',
                        type:'pie',
                        startAngle: 90,
                        radius: ['35%', '50%'],
                        center: ['60%', '50%'],
                        avoidLabelOverlap: false,
                        legendHoverLink: false,
                        label: {show: false},
                        data:[{value: result.lists.total_lists.course_num || 0, name: '上课学员'}, {value: result.lists.total_lists.expired_num || 0, name: '结业学员'}]
                    }
                ]
            });

            this.student.data = result.lists;

            let grid_lists = [];
            this.student.student_type.forEach(v => {
                if(v.check) grid_lists.push({type: 'line', name: v.name, data: result.lists[`${v.id}_lists`]});
            });

            let options = this.lineChartOptions('student')
            options.series = grid_lists;

            this.studentRightObj.setOption(options, true);
        },
        //课程及考勤统计
        async getCourseLists() {
            let result = await this.$$request.post('api/collect/courseLists', {what_time: this.course.year / 1000});
            console.log(result);
            if(!result) return 0;
            
            this.course.data = result.lists;

            let grid_lists = [];
            this.course.course_type.forEach(v => {
                if(v.check) grid_lists.push({type: 'line', name: v.name, data: result.lists[`${v.id}_lists`]});
            });

            let options = this.lineChartOptions('course')
            options.series = grid_lists;

            console.log(options)

            this.courseChartObj.setOption(options, true);
        },
        //销售统计列表
        async getSellLists() {
            let result = await this.$$request.post('api/collect/sellLists', {start: this.sell.start_time / 1000, end: this.sell.end_time / 1000});
            console.log(result);
            if(!result) return 0;

            this.sell.sell_lists = result.lists;

            // this.sell.sell_type.forEach(v => {v.data = result.lists[`${v.id}_num`]});

            // result.lists.sign_ratio = result.lists.total_num === 0 ? '0%' : (result.lists.sign_num / result.lists.total_num * 100).toFixed() + '%';
            // result.lists.wait_ratio = result.lists.total_num === 0 ? '0%' : (result.lists.to_num / result.lists.total_num * 100).toFixed() + '%';

            // this.sell.data = result.lists;
            // this.sell.sell_type.sort((a, b) => {return b.data - a.data});
        }   
    },
    created() {
        let arr = [];
        for(let i = 1; i <= 12; i++) {this.monthArr.push(`${i}月`)};
    },
    mounted() {
        this.sexChartInit();
        this.ageChartInit();
        this.getSexLists();

        
        this.studentChartInit();
        this.studentRightInit();
        this.getStudentLists();

        this.courseChartInit();
        this.getCourseLists();

        this.getSellLists();
    },
    components: {TableHeader}
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
            width: 520px;
            height: 350px;
            .student-total, .sex-num {
                top: 50%;
                left: 60%;
                transform: translate(-50%, -50%);
            }
            .sex-num {
                width: 350px;
            }
        }
        .right-chart {
            min-width: 1040px;
            height: 350px;
        }
        ul {
            li {
                .bg {
                    width: 12px;
                    height: 12px;
                }
            }
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
                width: 390px;
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
</style>


