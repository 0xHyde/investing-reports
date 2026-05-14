<template>
  <div class="fire-calculator">
    <!-- 收入 -->
    <div class="fire-card">
      <div class="fire-card-title">💰 收入情况</div>
      <div class="fire-input-row">
        <div class="fire-input-group">
          <label>月工资（税后）</label>
          <input type="number" v-model.number="monthlySalary" placeholder="15000">
        </div>
        <div class="fire-input-group">
          <label>年终奖（税后）</label>
          <input type="number" v-model.number="yearEndBonus" placeholder="30000">
        </div>
      </div>
      <div class="fire-input-row">
        <div class="fire-input-group">
          <label>其他年收入</label>
          <input type="number" v-model.number="otherIncome" placeholder="0">
        </div>
        <div class="fire-input-group">
          <label>当前已有资产</label>
          <input type="number" v-model.number="currentAssets" placeholder="100000">
        </div>
      </div>
    </div>

    <!-- 支出 -->
    <div class="fire-card">
      <div class="fire-card-title">💸 支出情况</div>
      <div class="fire-input-row">
        <div class="fire-input-group">
          <label>月支出</label>
          <input type="number" v-model.number="monthlyExpense" placeholder="8000">
        </div>
        <div class="fire-input-group">
          <label>年额外支出</label>
          <input type="number" v-model.number="yearExtraExpense" placeholder="20000">
        </div>
      </div>
    </div>

    <!-- 买房计划 -->
    <div class="fire-card">
      <div class="fire-card-title">
        🏠 买房计划
        <label class="fire-toggle">
          <input type="checkbox" v-model="enableHouse">
          <span class="fire-toggle-slider"></span>
        </label>
      </div>
      <div v-if="enableHouse">
        <div class="fire-input-row">
          <div class="fire-input-group">
            <label>计划买房时间（第几年）</label>
            <input type="number" v-model.number="houseYear" placeholder="5" min="1">
          </div>
          <div class="fire-input-group">
            <label>房价总价</label>
            <input type="number" v-model.number="housePrice" placeholder="2000000">
          </div>
        </div>
        <div class="fire-input-row">
          <div class="fire-input-group">
            <label>首付比例</label>
            <input type="number" v-model.number="downPaymentRatio" placeholder="30" min="0" max="100">
          </div>
          <div class="fire-input-group">
            <label>房贷利率（%）</label>
            <input type="number" v-model.number="loanRate" placeholder="3.5" step="0.1">
          </div>
        </div>
        <div class="fire-input-row">
          <div class="fire-input-group">
            <label>贷款年限</label>
            <input type="number" v-model.number="loanYears" placeholder="30" min="1" max="30">
          </div>
          <div class="fire-input-group">
            <label>房产年增值率（%）</label>
            <input type="number" v-model.number="houseAppreciation" placeholder="2" step="0.5">
          </div>
        </div>
        <div class="fire-input-row">
          <div class="fire-input-group" style="grid-column: 1 / -1;">
            <label class="fire-checkbox-label">
              <input type="checkbox" v-model="houseAsAsset">
              房产价值计入 Fire 总资产（保守策略建议不勾选，只算金融资产）
            </label>
          </div>
        </div>
      </div>
      <div v-else class="fire-hint">
        关闭买房计划，按纯金融资产路径计算 Fire
      </div>
    </div>

    <!-- 投资参数 -->
    <div class="fire-card">
      <div class="fire-card-title">📈 投资参数</div>
      <div class="fire-slider-group">
        <label><span>年化投资收益率</span><span>{{ returnRate }}%</span></label>
        <input type="range" v-model.number="returnRate" min="1" max="15" step="0.5">
      </div>
      <div class="fire-slider-group">
        <label><span>Fire 提款率（4%法则）</span><span>{{ withdrawRate }}%</span></label>
        <input type="range" v-model.number="withdrawRate" min="2" max="6" step="0.5">
      </div>
      <div class="fire-slider-group">
        <label><span>收入年增长率</span><span>{{ incomeGrowth }}%</span></label>
        <input type="range" v-model.number="incomeGrowth" min="0" max="15" step="1">
      </div>
      <div class="fire-slider-group">
        <label><span>支出年增长率（通胀）</span><span>{{ expenseGrowth }}%</span></label>
        <input type="range" v-model.number="expenseGrowth" min="0" max="10" step="0.5">
      </div>
    </div>

    <button class="fire-btn" @click="calculateFire">🚀 计算 Fire 时间</button>

    <!-- 结果 -->
    <div class="fire-card fire-result" v-if="showResult">
      <div class="fire-card-title">🎯 Fire 目标分析</div>
      <div class="fire-result-number" :style="{ color: fireYearsColor }">{{ fireYearsText }}</div>
      <div class="fire-result-label">预计达到财务自由</div>

      <div class="fire-savings-rate">
        <div class="fire-rate">{{ savingsRate.toFixed(1) }}%</div>
        <div class="fire-label">当前储蓄率</div>
      </div>

      <div class="fire-result-detail">
        <div class="fire-detail-item">
          <div class="fire-detail-value">{{ formatMoney(targetAssets) }}</div>
          <div class="fire-detail-label">Fire 目标资产</div>
        </div>
        <div class="fire-detail-item">
          <div class="fire-detail-value">{{ formatMoney(annualIncome) }}</div>
          <div class="fire-detail-label">年收入</div>
        </div>
        <div class="fire-detail-item">
          <div class="fire-detail-value">{{ formatMoney(annualExpense) }}</div>
          <div class="fire-detail-label">年支出</div>
        </div>
        <div class="fire-detail-item">
          <div class="fire-detail-value">{{ formatMoney(annualSavings) }}</div>
          <div class="fire-detail-label">年储蓄</div>
        </div>
      </div>

      <!-- 买房影响 -->
      <div v-if="enableHouse && houseImpact" class="fire-house-impact">
        <div class="fire-divider"></div>
        <div class="fire-card-title">🏠 买房影响分析</div>
        <div class="fire-result-detail">
          <div class="fire-detail-item">
            <div class="fire-detail-value">{{ formatMoney(houseImpact.downPayment) }}</div>
            <div class="fire-detail-label">首付支出</div>
          </div>
          <div class="fire-detail-item">
            <div class="fire-detail-value">{{ formatMoney(houseImpact.monthlyMortgage) }}/月</div>
            <div class="fire-detail-label">月供</div>
          </div>
          <div class="fire-detail-item">
            <div class="fire-detail-value">{{ houseImpact.fireWithoutHouse }}年</div>
            <div class="fire-detail-label">不买房 Fire 时间</div>
          </div>
          <div class="fire-detail-item">
            <div class="fire-detail-value" :style="{ color: houseImpact.delayYears > 0 ? '#ff5252' : '#4caf50' }">{{ houseImpact.delayYears > 0 ? '+' + houseImpact.delayYears : houseImpact.delayYears }}年</div>
            <div class="fire-detail-label">买房延迟</div>
          </div>
        </div>
      </div>

      <div class="fire-divider"></div>
      <div class="fire-card-title">📊 逐年资产增长</div>
      <div class="fire-year-breakdown">
        <div v-for="item in breakdown" :key="item.year"
             class="fire-year-row"
             :class="{ 'fire-achieved': item.fireAchieved, 'fire-house': item.houseEvent }">
          <span>{{ item.fireAchieved ? '🔥 ' : '' }}{{ item.houseEvent ? '🏠 ' : '' }}第 {{ item.year }} 年</span>
          <span>
            资产: {{ formatMoney(item.assets) }}
            <template v-if="item.houseEvent">| 首付: {{ formatMoney(item.houseDownPayment) }}</template>
            <template v-else>| 储蓄: {{ formatMoney(item.savings) }} | 收益: {{ formatMoney(item.ret) }}</template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 基础参数
const monthlySalary = ref(15000)
const yearEndBonus = ref(30000)
const otherIncome = ref(0)
const currentAssets = ref(100000)
const monthlyExpense = ref(8000)
const yearExtraExpense = ref(20000)
const returnRate = ref(7)
const withdrawRate = ref(4)
const incomeGrowth = ref(5)
const expenseGrowth = ref(3)

// 买房参数
const enableHouse = ref(false)
const houseYear = ref(5)
const housePrice = ref(2000000)
const downPaymentRatio = ref(30)
const loanRate = ref(3.5)
const loanYears = ref(30)
const houseAppreciation = ref(2)
const houseAsAsset = ref(false)

// 结果
const showResult = ref(false)
const fireYearsText = ref('-- 年')
const fireYearsColor = ref('var(--vp-c-brand-1)')
const savingsRate = ref(0)
const targetAssets = ref(0)
const annualIncome = ref(0)
const annualExpense = ref(0)
const annualSavings = ref(0)
const breakdown = ref([])
const houseImpact = ref(null)

function formatMoney(num) {
  if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toFixed(0)
}

// 计算月供（等额本息）
function calcMonthlyPayment(principal, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12
  const months = years * 12
  if (monthlyRate === 0) return principal / months
  return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)
}

function calculateFire() {
  const ai = monthlySalary.value * 12 + yearEndBonus.value + otherIncome.value
  const ae = monthlyExpense.value * 12 + yearExtraExpense.value
  const as = ai - ae
  const sr = ai > 0 ? (as / ai * 100) : 0

  // 买房相关计算
  const downPayment = enableHouse.value ? housePrice.value * (downPaymentRatio.value / 100) : 0
  const loanPrincipal = enableHouse.value ? housePrice.value - downPayment : 0
  const monthlyMortgage = enableHouse.value ? calcMonthlyPayment(loanPrincipal, loanRate.value, loanYears.value) : 0
  const annualMortgage = monthlyMortgage * 12

  let assets = currentAssets.value
  let houseValue = 0
  let income = ai
  let expense = ae
  let years = 0
  const maxYears = 50
  const bd = []

  // 先算一个不买房的版本，用于对比
  let assetsNoHouse = currentAssets.value
  let incomeNoHouse = ai
  let expenseNoHouse = ae
  let yearsNoHouse = 0
  while (assetsNoHouse < (expenseNoHouse / (withdrawRate.value / 100)) && yearsNoHouse < maxYears) {
    yearsNoHouse++
    assetsNoHouse = assetsNoHouse * (1 + returnRate.value / 100) + (incomeNoHouse - expenseNoHouse)
    incomeNoHouse *= (1 + incomeGrowth.value / 100)
    expenseNoHouse *= (1 + expenseGrowth.value / 100)
  }

  while (years < maxYears) {
    years++
    const investmentReturn = assets * (returnRate.value / 100)
    const newSavings = income - expense

    // 买房事件
    let houseEvent = false
    let actualDownPayment = 0
    if (enableHouse.value && years === houseYear.value) {
      houseEvent = true
      actualDownPayment = Math.min(downPayment, assets) // 资产不够时只能付这么多
      assets -= actualDownPayment
      houseValue = housePrice.value
      expense += annualMortgage
    }

    // 资产增长
    assets = assets + investmentReturn + newSavings

    // 房产增值
    if (enableHouse.value && houseValue > 0) {
      houseValue *= (1 + houseAppreciation.value / 100)
    }

    // 收入和支出增长
    income = income * (1 + incomeGrowth.value / 100)
    expense = expense * (1 + expenseGrowth.value / 100)

    // Fire 目标资产（基于当前支出）
    const currentTarget = expense / (withdrawRate.value / 100)

    // 计算总资产（金融资产 + 房产）
    const totalAssets = assets + (houseAsAsset.value ? houseValue : 0)

    bd.push({
      year: years,
      assets: totalAssets,
      financialAssets: assets,
      houseValue: houseValue,
      target: currentTarget,
      income,
      expense,
      savings: newSavings,
      ret: investmentReturn,
      fireAchieved: totalAssets >= currentTarget,
      houseEvent,
      houseDownPayment: actualDownPayment,
      monthlyMortgage: houseEvent ? monthlyMortgage : 0
    })

    if (totalAssets >= currentTarget) break
  }

  showResult.value = true
  annualIncome.value = ai
  annualExpense.value = ae
  annualSavings.value = as
  savingsRate.value = sr
  targetAssets.value = expense / (withdrawRate.value / 100)
  breakdown.value = bd

  if (years >= maxYears) {
    fireYearsText.value = '>50 年'
    fireYearsColor.value = '#ff5252'
  } else if (years === 0 && currentAssets.value >= targetAssets.value) {
    fireYearsText.value = '已达成！'
    fireYearsColor.value = '#4caf50'
  } else {
    fireYearsText.value = years + ' 年'
    fireYearsColor.value = 'var(--vp-c-brand-1)'
  }

  // 买房影响
  if (enableHouse.value) {
    houseImpact.value = {
      downPayment,
      monthlyMortgage,
      fireWithoutHouse: yearsNoHouse >= maxYears ? '>50' : yearsNoHouse,
      delayYears: years - yearsNoHouse
    }
  } else {
    houseImpact.value = null
  }
}

onMounted(() => {
  calculateFire()
})
</script>

<style scoped>
.fire-calculator { max-width: 600px; margin: 0 auto; }
.fire-card { background: var(--vp-c-bg-soft); border-radius: 16px; padding: 24px; margin-bottom: 16px; border: 1px solid var(--vp-c-divider); }
.fire-card-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--vp-c-text-1); display: flex; align-items: center; gap: 8px; justify-content: space-between; }
.fire-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.fire-input-group { margin-bottom: 16px; }
.fire-input-group label { display: block; margin-bottom: 6px; font-size: 14px; color: var(--vp-c-text-2); }
.fire-input-group input { width: 100%; padding: 12px 16px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 16px; transition: all 0.3s; }
.fire-input-group input:focus { outline: none; border-color: var(--vp-c-brand-1); box-shadow: 0 0 0 3px rgba(100,108,255,0.1); }
.fire-slider-group { margin-bottom: 16px; }
.fire-slider-group label { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; color: var(--vp-c-text-2); }
.fire-slider-group input[type="range"] { width: 100%; -webkit-appearance: none; height: 6px; border-radius: 3px; background: var(--vp-c-divider); outline: none; }
.fire-slider-group input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--vp-c-brand-1); cursor: pointer; box-shadow: 0 0 10px rgba(100,108,255,0.5); }
.fire-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2)); border: none; border-radius: 12px; color: #fff; font-size: 16px; font-weight: 600; cursor: pointer; transition: all 0.3s; margin-bottom: 16px; }
.fire-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(100,108,255,0.4); }
.fire-result { background: linear-gradient(135deg, rgba(100,108,255,0.08), rgba(100,108,255,0.04)); border: 1px solid rgba(100,108,255,0.2); }
.fire-result-number { font-size: 36px; font-weight: 700; text-align: center; margin: 8px 0; }
.fire-result-label { text-align: center; color: var(--vp-c-text-2); font-size: 14px; }
.fire-savings-rate { text-align: center; padding: 16px; background: rgba(76,175,80,0.08); border-radius: 12px; margin-top: 16px; }
.fire-savings-rate .fire-rate { font-size: 32px; font-weight: 700; color: #4caf50; }
.fire-savings-rate .fire-label { font-size: 14px; color: var(--vp-c-text-2); }
.fire-result-detail { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
.fire-detail-item { background: var(--vp-c-bg); padding: 12px; border-radius: 10px; text-align: center; }
.fire-detail-value { font-size: 20px; font-weight: 600; color: var(--vp-c-text-1); }
.fire-detail-label { font-size: 12px; color: var(--vp-c-text-2); margin-top: 4px; }
.fire-divider { height: 1px; background: var(--vp-c-divider); margin: 16px 0; }
.fire-year-breakdown { max-height: 300px; overflow-y: auto; margin-top: 16px; }
.fire-year-row { display: flex; justify-content: space-between; padding: 8px 12px; border-radius: 8px; margin-bottom: 4px; font-size: 13px; }
.fire-year-row:nth-child(odd) { background: var(--vp-c-bg); }
.fire-year-row.fire-achieved { background: rgba(76,175,80,0.12); color: #4caf50; font-weight: 600; }
.fire-year-row.fire-house { background: rgba(255,152,0,0.1); }

/* Toggle Switch */
.fire-toggle { position: relative; display: inline-block; width: 48px; height: 26px; }
.fire-toggle input { opacity: 0; width: 0; height: 0; }
.fire-toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: var(--vp-c-divider); transition: .3s; border-radius: 26px; }
.fire-toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 3px; bottom: 3px; background-color: white; transition: .3s; border-radius: 50%; }
.fire-toggle input:checked + .fire-toggle-slider { background-color: var(--vp-c-brand-1); }
.fire-toggle input:checked + .fire-toggle-slider:before { transform: translateX(22px); }

.fire-hint { text-align: center; color: var(--vp-c-text-2); font-size: 14px; padding: 16px; }
.fire-checkbox-label { display: flex !important; align-items: center; gap: 8px; font-size: 13px !important; cursor: pointer; }
.fire-checkbox-label input { width: auto !important; }
.fire-house-impact { margin-top: 16px; }
</style>
