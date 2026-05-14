<template>
  <div class="fire-calculator">
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

      <div class="fire-divider"></div>
      <div class="fire-card-title">📊 逐年资产增长</div>
      <div class="fire-year-breakdown">
        <div v-for="item in breakdown" :key="item.year"
             class="fire-year-row"
             :class="{ 'fire-achieved': item.fireAchieved }">
          <span>{{ item.fireAchieved ? '🔥 ' : '' }}第 {{ item.year }} 年</span>
          <span>资产: {{ formatMoney(item.assets) }} | 储蓄: {{ formatMoney(item.savings) }} | 收益: {{ formatMoney(item.ret) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

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

const showResult = ref(false)
const fireYearsText = ref('-- 年')
const fireYearsColor = ref('var(--vp-c-brand-1)')
const savingsRate = ref(0)
const targetAssets = ref(0)
const annualIncome = ref(0)
const annualExpense = ref(0)
const annualSavings = ref(0)
const breakdown = ref([])

function formatMoney(num) {
  if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toFixed(0)
}

function calculateFire() {
  const ai = monthlySalary.value * 12 + yearEndBonus.value + otherIncome.value
  const ae = monthlyExpense.value * 12 + yearExtraExpense.value
  const as = ai - ae
  const sr = ai > 0 ? (as / ai * 100) : 0
  const ta = ae / (withdrawRate.value / 100)

  let assets = currentAssets.value
  let income = ai
  let expense = ae
  let years = 0
  const maxYears = 50
  const bd = []

  while (assets < ta && years < maxYears) {
    years++
    const investmentReturn = assets * (returnRate.value / 100)
    const newSavings = income - expense
    assets = assets + investmentReturn + newSavings
    income = income * (1 + incomeGrowth.value / 100)
    expense = expense * (1 + expenseGrowth.value / 100)
    const currentTarget = expense / (withdrawRate.value / 100)
    bd.push({
      year: years,
      assets,
      target: currentTarget,
      income,
      expense,
      savings: newSavings,
      ret: investmentReturn,
      fireAchieved: assets >= currentTarget
    })
  }

  showResult.value = true
  annualIncome.value = ai
  annualExpense.value = ae
  annualSavings.value = as
  savingsRate.value = sr
  targetAssets.value = ta
  breakdown.value = bd

  if (years >= maxYears) {
    fireYearsText.value = '>50 年'
    fireYearsColor.value = '#ff5252'
  } else if (years === 0 && currentAssets.value >= ta) {
    fireYearsText.value = '已达成！'
    fireYearsColor.value = '#4caf50'
  } else {
    fireYearsText.value = years + ' 年'
    fireYearsColor.value = 'var(--vp-c-brand-1)'
  }
}

onMounted(() => {
  calculateFire()
})
</script>

<style scoped>
.fire-calculator { max-width: 600px; margin: 0 auto; }
.fire-card { background: var(--vp-c-bg-soft); border-radius: 16px; padding: 24px; margin-bottom: 16px; border: 1px solid var(--vp-c-divider); }
.fire-card-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--vp-c-text-1); display: flex; align-items: center; gap: 8px; }
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
</style>
