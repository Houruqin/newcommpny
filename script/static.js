

// 各下拉框静态数据

const StudentStatic = {
    followUp: {
        status: [
            // {id: -2, name: '已签约'},
            {id: -1, name: '无效'},
            // {id: 0, name: '未跟进'}, 
            {id: 1, name: '已沟通'}, 
            {id: 2, name: '邀约到访'}, 
            // {id: 3, name: '已到访'}, 
            {id: 4, name: '邀约试听'},
            // {id: 5, name: '已试听'},
            {id: 6, name: '未接通'}
        ],
        wayId: [
            {id: 1, name: '面谈'}, 
            {id: 2, name: '微信'}, 
            {id: 3, name: '短信'},
            {id: 4, name: '电话'},
            {id: 5, name: '其他'}
        ],
        typeId: [
            {id: 1, name: '学员登记'}, 
            {id: 2, name: '购课'}, 
            {id: 3, name: '顾问变更'}, 
            {id: 4, name: '续约'}, 
            {id: 5, name: '售前跟进'}, 
            {id: 6, name: '售后跟进'}
        ]
    },
    relation: [
        {id: 1, name: '母亲'},
        {id: 2, name: '父亲'},
        {id: 3, name: '其他'}
    ],
    likeGrade: [
        {id: 1, name: '高'},
        {id: 2, name: '中'},
        {id: 3, name: '低'}
    ],
    paymentMethod: [
        {id: 1, name: '现金付款'},
        {id: 2, name: '支付宝付款'},
        {id: 3, name: '微信付款'},
        {id: 4, name: '银行卡付款'}
    ]
};

const courseStatic = {
    classRoomStatus: [
        {type: 'begin', text: '开课', icon: 'icon-renwuweikaishi'}, 
        {type: 'plan', text: '排课', icon: 'icon-paike1'}, 
        {type: 'over', text: '结课', icon: 'icon-jieke'}, 
        {type: 'stop', text: '停课', icon: 'icon-tingke'}, 
        {type: 'edit', text: '编辑', icon: 'icon-icon1'}, 
        {type: 'delete', text: '删除', icon: 'icon-shanchu'}
    ]
};

const timeTableStatic = {
    status: [
        {id: -5, name: '旷课'},
        {id: -4, name: '早退'},
        {id: -3, name: '迟到'},
        {id: -2, name: '请假拒绝'},
        {id: -1, name: '请假通过'},
        {id: 0, name: '审核中'}, 
        {id: 1, name: '正常'}, 
        {id: 2, name: '试听'}, 
        {id: 3, name: '补课'}, 
        {id: 4, name: '正常签到'}, 
    ]
};

const excelHeader = {
    student: {
        '学员姓名': 'student_name', 
        '学员性别': 'sex',
        '联系电话': 'mobile', 
        '学员生日': 'birthday',
        '课程顾问': 'course_advisor',
        '渠道来源': 'source'
    },
    nosign: {
        '学员姓名': 'school_name', 
        '学员性别': 'sex', 
        '学员生日': 'birthday', 
        '家长姓名': 'parent_name', 
        '家长手机号': 'mobile', 
        '家长称呼': 'relation', 
        '渠道来源': 'source',
        '意向课程': 'course_name',
        '课程顾问': 'course_advisor'
    },
    signed: {
        '学员姓名': 'school_name', 
        '学员性别': 'sex', 
        '学员生日': 'birthday', 
        '家长姓名': 'parent_name', 
        '家长手机号': 'mobile', 
        '家长称呼': 'relation', 
        '渠道来源': 'source',
        '签约课程': 'course_name',
        '所在班级': 'grade_name',
        '购课时数': 'lesson_num',
        '剩余课时': 'remain_num',
        '赠送课时': 'given_num',
        '合约金额': 'real_price', 
        '签约日期': 'created_at',
        '课程顾问': 'course_advisor'
    },
    course: {
        '学员姓名': 'student_name',
        '联系电话': 'mobile',
        '课程名称': 'course_name',
        '任课老师': 'course_teacher',
        '购买课时': 'buy_lesson_num',
        '赠送课时': 'given_lesson_num',
        '剩余课时': 'surplus_lesson_num',
        '材料费用': 'textbook_price',
        '购课总额': 'total_price',
        '购课日期': 'expire',
        '支付方式': 'pay_way',
        '业绩归属': 'advisor_name'
    },
    nosign_request: [
        '学员姓名', '学员性别', '家长手机号', '渠道来源'
    ],
    sign_request: [
        '学员姓名', '学员性别', '家长手机号', '签约课程', '购课时数', '剩余课时', '合约金额'
    ],
    student_request: [
        '学员姓名', '学员性别', '联系电话'
    ],
    course_request: [
        '学员姓名', '联系电话', '课程名称', '购买课时', '剩余课时', '购课日期', '购课总额', '支付方式'
    ]
};


const conflictLists = [
    {
        "begin_time": 1524967200,
        "end_time": 1524970800,
        "course_id": 2,
        "grade_id": 42,
        "lesson_num": 2,
        "teacher_ids": ",30,",
        "counselor_ids": ",50,",
        "room_id": 7,
        "student_lists": [
            {
                "id": 32,
                "name": "米龙东"
            },
            {
            "id": 33,
            "name": "张四"
            },
            {
            "id": 3,
            "name": "是的归了"
            }
        ],
        "conflict_data": {
            "reason": 1,
            "data": [
                {
                "id": 30,
                "name": "刘教务"
                },
                {
                "id": 50,
                "name": "啊感受感受"
                }
            ]
        },
        other_lists: []
    }
]

export {StudentStatic, courseStatic, timeTableStatic, excelHeader, conflictLists};