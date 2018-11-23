<template>
  <el-dialog :title="paymentType === 'add' ? '缴纳定金' : '退回定金'" width="560px" center :visible.sync="dialogStatus" :close-on-click-modal="false" @close="dialogClose">
      <el-form :model="paymentForm" ref="payment" :rules="rules" class="pl-60 pr-60 fomr-box" size="small" label-width="95px" @submit.native.prevent>
        <div v-if="paymentType === 'add'" key="add">
          <el-form-item label="定金金额：" prop="money">
            <el-input type="number" v-model.number="paymentForm.money" placeholder="请输入定金金额"></el-input>
          </el-form-item>
        </div>
        <div v-else key="back">
          <el-form-item label="学员姓名：">{{studentName}}</el-form-item>
          <el-form-item label="退回定金：">{{paymentForm.money}}元</el-form-item>
          <el-form-item label="备　　注：" class="mt-10 textarea-cls explain-input" prop="remark">
              <el-input type="textarea" :rows="4" placeholder="请输入备注" v-model.trim="paymentForm.remark"></el-input>
          </el-form-item>
        </div>
        <div class="d-f f-j-c mt-50">
          <MyButton @click.native="dialogStatus = false" type="border" fontColor="fc-m">取消</MyButton>
          <MyButton @click.native="doneHandle" :loading="submitLoading" class="ml-20">{{this.paymentType === 'back' ? '确定退回' : '确定'}}</MyButton>
        </div>
      </el-form>
  </el-dialog>
</template>

<script>
import MyButton from '../../components/common/MyButton';

export default {
  props: {
    value: {default: false},
    paymentDetail: {default: {}}
  },
  components: {MyButton},
  watch: {
    value (val) {
      this.dialogStatus = val;
    },
    paymentDetail (val) {
      this.studentId = val.id;
      if (val.name) {
        this.studentName = val.name;
        this.paymentForm.money = val.depositMoney;
      }
      this.paymentType = val.paymentType;
    }
  },
  data () {
    return {
      dialogStatus: this.value,
      submitLoading: false,
      studentId: '',
      studentName: '',
      paymentType: '',
      paymentForm: {
        money: '',
        remark: ''
      },
      rules: {
        remark: [{ max: 100, message: '长度不能超过100个字符' }],
        money: [
          {required: true, message: '请输入定金金额'},
          {validator: this.moneyValidate()},
          {validator: this.$$tools.formOtherValidate('decimals', 2)},
          {validator: this.$$tools.formOtherValidate('total', 9999)}
        ]
      }
    };
  },
  methods: {
    dialogClose () {
      this.$refs.payment.resetFields();
      this.paymentForm.money = '';
      this.paymentForm.remark = '';
      this.dialogStatus = false;
      this.$emit('input', this.dialogStatus);
    },
    moneyValidate () {
      return (rule, value, callback) => {
        if (value <= 0) {
          return callback(new Error('金额必须大于0'));
        }

        return callback();
      };
    },
    doneHandle () {
      this.$refs.payment.validate(valid => {
        if (valid) {
          this.paymentType === 'back' ? this.submitBackPayment() : this.submitPayment();
        }
      });
    },
    // 交定金
    async submitPayment () {
      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;
      let params = {
        studentId: this.studentId,
        depositMoney: this.paymentForm.money
      };

      let result = await this.$$request.post('/student/addDeposit', params);

      console.log(result);
      this.submitLoading = false;
      if (!result) {
        return 0;
      }

      this.$message.success('缴纳定金成功');
      this.dialogStatus = false;
      this.$emit('CB-payment');
    },
    // 退定金
    async submitBackPayment () {
      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;
      let params = {
        studentId: this.studentId,
        depositMoney: this.paymentForm.money,
        remark: this.paymentForm.remark
      };

      let result = await this.$$request.post('/student/returnDeposit', params);

      this.submitLoading = false;
      if (!result) {
        return 0;
      }
      this.$message.success('退回定金成功');
      this.dialogStatus = false;
      this.$emit('CB-payment');
    }
  }
};
</script>

<style lang="less" scoped>
  .fomr-box {
    /deep/ .el-form-item--mini.el-form-item, .el-form-item--small.el-form-item {
      margin-bottom: 0;
    }
    /deep/ .el-input {
      width: 230px;
    }
  }
</style>

