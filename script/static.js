

// 各下拉框静态数据

const StudentStatic = {
  followUp: {
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
    {id: 1, name: '现金付款', icon: 'icon-xianjin', font_color: '#FFB349'},
    {id: 2, name: '支付宝付款', icon: 'icon-zhifubao', font_color: '#1AACEB'},
    {id: 3, name: '微信付款', icon: 'icon-weixinhover', font_color: '#08BB08'},
    {id: 4, name: '银行卡付款', icon: 'icon-icon-yinhangqia2', font_color: '#1FAED4'},
    {id: 5, name: '其他', icon: 'icon-qianbaozhifumaijia', font_color: '#999'}
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
    {id: 4, name: '正常签到'}
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
    'begin_time': 1524967200,
    'end_time': 1524970800,
    'course_id': 2,
    'grade_id': 42,
    'lesson_num': 2,
    'teacher_ids': ',30,',
    'counselor_ids': ',50,',
    'room_id': 7,
    'student_lists': [
      {
        'id': 32,
        'name': '米龙东'
      },
      {
        'id': 33,
        'name': '张四'
      },
      {
        'id': 3,
        'name': '是的归了'
      }
    ],
    'conflict_data': {
      'reason': 1,
      'data': [
        {
          'id': 30,
          'name': '刘教务'
        },
        {
          'id': 50,
          'name': '啊感受感受'
        }
      ]
    },
    other_lists: []
  }
];

//排课时间选择范围
const timePicker = {start: '08:00', step: '00:05', end: '21:45', minTime: 0, maxTime: '22:00'};

const explainLists = {
  'explain_a': { title: '需续约学员', text: '课时即将消耗完，需要进行续约的学员' },
  'explain_b': { title: '全部学员', text: '有购课意向的学员' },
  'explain_c': { title: '无效学员', text: '跟进过程中判定为无效的未签约学员' },
  'explain_d': { title: '在校学员', text: '剩余课时不为0的签约学员' },
  'explain_e': { title: '结业学员', text: '剩余课时为0的签约学员' },
  'explain_f': { title: '流失学员', text: '剩余课时耗完以后，且明确表示不续费的结业学员' },
  'explain_g': { title: '有班课程', text: '以班级为中心，有固定班级的课程，分为一对多课程和一对一课程两种类型' },
  'explain_h': { title: '无班课程', text: '以学员为中心，无固定班级的课程，分为一对多课程和一对一课程两种类型，无班课程支持学员预约上课' },
  'explain_i': { title: '签约前扣课时', text: '办理购课流程时，学员已产生课消数据（如购课时已经产生课消，则需要扣除相关课时）' },
  'explain_j': { title: '系统', text: '学员请假后老师未及时处理，上课后系统判定为“请假通过”' },
  'explain_k': { title: '已过期', text: '成功邀约试听但未试听的状态' },
  'explain_l': { title: '课节时长', text: '单节课程上课的时长' },
  'explain_m': { title: '学员消课次数总和', text: '时间区间内，该老师的上课学员消耗的课次总和（学员消课次数总和=学员a消课次数+学员b消课次数…，含试听学员）' },
  'explain_n': { title: '老师上课次数总和', text: '时间区间内，该上课老师完成上课的课次总和（老师上课次数总和=课程a上课次数+课程b上课次数…含试听课）' },
  'explain_o': { title: '老师消课时数总和', text: '时间区间内，该上课老师完成上课的课时总和（老师消课时数总和=课程a上课次数*单节课耗课时数+课程b上课次数*单节课耗课时数…，含试听课）' },
  'explain_p': { title: '类型设置', text: '根据物品用途，设置物品的种类，例如教具、教材' },
  'explain_q': { title: '实际库存', text: '实际库存=待售库存+学员库存' },
  'explain_r': { title: '待售库存', text: '仓库内该库存未售出，所有权归属于机构的库存' },
  'explain_s': { title: '学员库存', text: '学员已经购买，但还未发放的物品库存' },
  'explain_t': { title: '跟进状态设置', text: '该状态为“未承诺上门”状态下的二级状态' }
};


export {StudentStatic, timeTableStatic, excelHeader, conflictLists, timePicker, explainLists};