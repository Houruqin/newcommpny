<template>
  <el-dialog :title="paymentType === 'add' ? '缴纳定金' : '退回定金'" width="550px" center :visible.sync="dialogStatus" :close-on-click-modal="false" @close="dialogClose">
      <el-form :model="paymentForm" ref="payment" :rules="rules" label-width="95px" class="pl-60 pr-60" size="small">
        <div v-if="paymentType === 'add'" key="add">
          <el-form-item label="定金金额：" prop="money">
            <el-input type="number" v-model="paymentForm.money" placeholder="请输入定金金额"></el-input>
          </el-form-item>
        </div>
        <div v-else key="back">
          <span>{{studentName}}</span><span class="ml-50">已交定金：{{paymentForm.money}}</span>
          <el-form-item label="备注：" class="mt-30 textarea-cls explain-input" prop="remark">
              <el-input type="textarea" :rows="4" placeholder="请输入备注" v-model.trim="paymentForm.remark"></el-input>
          </el-form-item>
          <p class="fc-m t-a-c fs-16">确定退回定金？</p>
        </div>
        <div class="d-f f-j-c mt-50">
          <MyButton @click.native="dialogStatus = false" type="border" fontColor="fc-m">取消</MyButton>
          <MyButton @click.native="doneHandle" :loading="submitLoading" class="ml-20">确定</MyButton>
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
        money: [
          {required: true, message: '请输入定金金额'},
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
    doneHandle () {
      this.$refs.payment.validate(valid => {
        if (valid) {
          this.submitPayment();
        }
      });
    },
    async submitPayment () {
      if (this.submitLoading) {
        return 0;
      }
      this.submitLoading = true;
      let params = {
        studentId: this.studentId,
        depositMoney: this.paymentForm.money
      };

      if (this.paymentType === 'back') {
        params.remark = this.paymentForm.remark;
      }

      console.log(params);
      let result = await this.$$request.post(`/student/${this.paymentType === 'add' ? 'addDeposit' : 'returnDeposit'}`, params);

      console.log(result);
      this.submitLoading = false;
      if (!result) {
        return 0;
      }

      this.$message.success(`${this.paymentType === 'add' ? '缴纳' : '退回'}定金成功`);
      this.dialogStatus = false;
      this.$emit('CB-payment');
    }
  }
};
</script>

<style lang="less" scoped>

</style>

