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
          <label>当前已有被动收入/年</label>
          <input type="number" v-model.number="passiveIncome" placeholder="0">
        </div>
      </div>
      <div class="fire-input-row">
        <div class="fire-input-group">
          <label>当前已有资产</label>
          <input type="number" v-model.number="currentAssets" placeholder="100000">
        </div>
        <div class="fire-input-group">
          <label>当前年龄</label>
          <input type="number" v-model.number="currentAge" placeholder="30" min="18" max="80">
        </div>
      </div>
    </div>

    <!-- 支出 -->
    <div class="fire-card">
      <div class="fire-card-title">💸 支出情况</div>
      <div class="fire-input-row">
        <div class="fire-input-group">
          <label>月支出（不含房贷）</label>
          <input type="number" v-model.number="monthlyExpense" placeholder="8000">
        </div>
        <div class="fire-input-group">
          <label>年额外支出</label>
          <input type="number" v-model.number="yearExtraExpense" placeholder="20000">
        </div>
      </div>
      <div class="fire-input-row">
        <div class="fire-input-group">
          <label>弹性支出占比（%）</label>
          <input type="number" v-model.number="flexibleRatio" placeholder="30" min="0" max="100">
        </div>
        <div class="fire-input-group">
          <label>熊市弹性压缩（%）</label>
          <input type="number" v-model.number="flexibleCut" placeholder="50" min="0" max="100">
        </div>
      </div>
      <div class="fire-hint" style="text-align: left; font-size: 12px; padding: 0;">
        💡 弹性支出 = 可压缩的非必需开支（旅游、娱乐等）。熊市时自动按设定比例压缩。
      </div>
    </div>

    <!-- 买房计划 -->
    <div class="fire-card">
      <div class="fire-card-title">
        <span>🏠 买房计划</span>
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
            <label>首付比例（%）</label>
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
              房产价值计入 Fire 总资产（保守策略建议不勾选）
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
        <label><span>年化投资收益率（工作期）</span><span>{{ returnRate }}%</span></label>
        <input type="range" v-model.number="returnRate" min="1" max="15" step="0.5">
      </div>
      <div class="fire-slider-group">
        <label><span>退休期收益率调整</span><span>{{ retirementReturnAdj >= 0 ? '+' : '' }}{{ retirementReturnAdj }}%</span></label>
        <input type="range" v-model.number="retirementReturnAdj" min="-5" max="0" step="0.5">
      </div>
      <div class="fire-slider-group">
        <label><span>Fire 提款率</span><span>{{ withdrawRate }}%</span></label>
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

    <!-- 社保养老金 -->
    <div class="fire-card">
      <div class="fire-card-title">
        <span>🏛️ 社保养老金</span>
        <label class="fire-toggle">
          <input type="checkbox" v-model="enablePension">
          <span class="fire-toggle-slider"></span>
        </label>
      </div>
      <div v-if="enablePension">
        <div class="fire-input-row">
          <div class="fire-input-group">
            <label>养老金开始年龄</label>
            <input type="number" v-model.number="pensionAge" placeholder="60" min="50" max="75">
          </div>
          <div class="fire-input-group">
            <label>预估月养老金</label>
            <input type="number" v-model.number="pensionMonthly" placeholder="3000">
          </div>
        </div>
      </div>
      <div v-else class="fire-hint">
        关闭社保养老金，按无养老金计算
      </div>
    </div>

    <!-- 压力测试 -->
    <div class="fire-card">
      <div class="fire-card-title">
        <span>🛡️ Fire 后压力测试</span>
        <label class="fire-toggle">
          <input type="checkbox" v-model="enableStressTest">
          <span class="fire-toggle-slider"></span>
        </label>
      </div>
      <div v-if="enableStressTest">
        <div class="fire-input-row">
          <div class="fire-input-group">
            <label>预期寿命</label>
            <input type="number" v-model.number="lifeExpectancy" placeholder="85" min="60" max="120">
          </div>
          <div class="fire-input-group">
            <label>风险承受度</label>
            <select v-model="riskProfile" class="fire-select">
              <option value="conservative">保守（5%收益，8%波动）</option>
              <option value="balanced">均衡（7%收益，15%波动）</option>
              <option value="aggressive">激进（9%收益，22%波动）</option>
            </select>
          </div>
        </div>
        <div class="fire-input-row">
          <div class="fire-input-group">
            <label>模拟次数</label>
            <select v-model.number="simulationCount" class="fire-select">
              <option :value="500">500次（快）</option>
              <option :value="1000">1000次（标准）</option>
              <option :value="2000">2000次（精确）</option>
            </select>
          </div>
          <div class="fire-input-group">
            <label>大额支出金额</label>
            <input type="number" v-model.number="majorExpenseAmount" placeholder="100000" step="10000">
          </div>
        </div>
        <div class="fire-hint" style="margin-top: 8px; text-align: left; font-size: 12px;">
          💡 大额支出按年龄分层触发（30-50岁2%/年，50-70岁5%/年，70+岁10%/年）。触发后有3年冷却期。金额随通胀增长保持购买力。参考：有医保建议5-10万，无医保建议20-30万。
        </div>
      </div>
      <div v-else class="fire-hint">
        关闭压力测试，仅计算理想路径
      </div>
    </div>

    <button class="fire-btn" @click="calculateFire">🚀 计算 Fire 时间</button>

    <!-- 结果 -->
    <div class="fire-card fire-result" v-if="showResult">
      <div class="fire-card-title">🎯 Fire 目标分析</div>
      <div class="fire-result-number" :style="{ color: fireYearsColor }">{{ fireYearsText }}</div>
      <div class="fire-result-label">
        {{ fireAge ? `预计 ${fireAge} 岁达成 (${fireYears}年后)` : '预计达到财务自由' }}
      </div>

      <div class="fire-savings-rate">
        <div class="fire-rate">{{ savingsRate.toFixed(1) }}%</div>
        <div class="fire-label">当前储蓄率</div>
      </div>

      <div class="fire-result-detail">
        <div class="fire-detail-item">
          <div class="fire-detail-value">{{ formatMoney(fireTarget) }}</div>
          <div class="fire-detail-label">Fire 目标资产<br><small>（达成当年）</small></div>
        </div>
        <div class="fire-detail-item">
          <div class="fire-detail-value">{{ formatMoney(fireAssets) }}</div>
          <div class="fire-detail-label">Fire 时总资产</div>
        </div>
        <div class="fire-detail-item">
          <div class="fire-detail-value">{{ formatMoney(annualIncome) }}</div>
          <div class="fire-detail-label">当前年收入</div>
        </div>
        <div class="fire-detail-item">
          <div class="fire-detail-value">{{ formatMoney(annualExpense) }}</div>
          <div class="fire-detail-label">当前年支出</div>
        </div>
      </div>

      <!-- 买房影响 -->
      <div v-if="enableHouse && houseImpact" class="fire-house-impact">
        <div class="fire-divider"></div>
        <div class="fire-card-title">🏠 买房影响分析</div>
        <div v-if="houseImpact.warning" class="fire-warning">{{ houseImpact.warning }}</div>
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
            <div class="fire-detail-value">{{ houseImpact.mortgageRatio }}%</div>
            <div class="fire-detail-label">月供占收入比</div>
          </div>
          <div class="fire-detail-item">
            <div class="fire-detail-value">{{ houseImpact.loanYears }}年</div>
            <div class="fire-detail-label">贷款期限</div>
          </div>
        </div>
        <div class="fire-result-detail" style="margin-top: 12px;">
          <div class="fire-detail-item">
            <div class="fire-detail-value">{{ houseImpact.fireWithoutHouseText }}</div>
            <div class="fire-detail-label">不买房 Fire 时间</div>
          </div>
          <div class="fire-detail-item">
            <div class="fire-detail-value" :style="{ color: houseImpact.delayColor }">{{ houseImpact.delayText }}</div>
            <div class="fire-detail-label">买房影响</div>
          </div>
        </div>
      </div>

      <!-- Fire 后压力测试结果 -->
      <div v-if="enableStressTest && stressResult" class="fire-stress-result">
        <div class="fire-divider"></div>
        <div class="fire-card-title">🛡️ Fire 后压力测试（{{ simulationCount }}次模拟）</div>
        
        <div class="fire-stress-summary">
          <div class="fire-stress-item">
            <div class="fire-stress-value" :style="{ color: stressResult.perpetualProb >= 80 ? '#4caf50' : stressResult.perpetualProb >= 50 ? '#ff9800' : '#ff5252' }">
              {{ stressResult.perpetualProb }}%
            </div>
            <div class="fire-stress-label">资产永续概率<br><small>（活到{{ lifeExpectancy }}岁不耗尽）</small></div>
          </div>
          <div class="fire-stress-item">
            <div class="fire-stress-value">{{ stressResult.medianDepletionAge }}岁</div>
            <div class="fire-stress-label">耗尽中位数年龄<br><small>（50%概率在此之前耗尽）</small></div>
          </div>
          <div class="fire-stress-item">
            <div class="fire-stress-value" style="color: #ff5252;">{{ stressResult.worstAge }}岁</div>
            <div class="fire-stress-label">最坏情况耗尽年龄<br><small>（95%分位，仅5%更差）</small></div>
          </div>
          <div class="fire-stress-item">
            <div class="fire-stress-value">{{ stressResult.medianLegacy > 0 ? formatMoney(stressResult.medianLegacy) : '已耗尽' }}</div>
            <div class="fire-stress-label">预期遗产（中位数）<br><small>（{{ lifeExpectancy }}岁时的剩余资产）</small></div>
          </div>
        </div>

        <div v-if="stressResult.scenarios" class="fire-scenarios">
          <div class="fire-card-title" style="margin-top: 16px; font-size: 14px;">📊 情景分析</div>
          <div class="fire-scenario-row fire-scenario-header">
            <span>情景</span>
            <span>耗尽年龄</span>
            <span>说明</span>
          </div>
          <div v-for="s in stressResult.scenarios" :key="s.name" class="fire-scenario-row" :class="{ 'fire-scenario-bad': s.depletionAge < lifeExpectancy }">
            <span><strong>{{ s.name }}</strong></span>
            <span :style="{ color: s.depletionAge >= lifeExpectancy ? '#4caf50' : '#ff5252' }">{{ s.depletionAge >= lifeExpectancy ? '未耗尽（≥' + lifeExpectancy + '岁）' : s.depletionAge + '岁' }}</span>
            <span class="fire-scenario-desc">{{ s.desc }}</span>
          </div>
        </div>

        <div class="fire-chart-container" style="height: 360px; margin-top: 16px;">
          <canvas id="stressChart"></canvas>
        </div>
        <div class="fire-hint" style="font-size: 11px; margin-top: 4px;">
          上图：蒙特卡洛模拟 {{ simulationCount }} 次的路径分布。浅蓝区域为 10%-90% 分位，深蓝线为中位数。
        </div>
      </div>

      <div class="fire-divider"></div>
      <div class="fire-card-title">📈 资产增长曲线</div>
      <div class="fire-chart-container">
        <canvas id="fireChart"></canvas>
      </div>

      <div class="fire-divider"></div>
      <div class="fire-card-title">📋 逐年资产明细</div>
      <div class="fire-year-breakdown">
        <div v-for="item in breakdown" :key="item.year"
             class="fire-year-row"
             :class="{ 'fire-achieved': item.fireAchieved, 'fire-house': item.houseEvent, 'fire-negative': item.financialAssets < 0 }">
          <span>{{ item.fireAchieved ? '🔥 ' : '' }}{{ item.houseEvent ? '🏠 ' : '' }}第 {{ item.year }} 年 ({{ item.age }}岁)</span>
          <span>
            资产 {{ formatMoney(item.assets) }}
            <template v-if="item.houseEvent">| 首付 {{ formatMoney(item.houseDownPayment) }}</template>
            <template v-else>| 储蓄 {{ formatMoney(item.savings) }} | 收益 {{ formatMoney(item.ret) }}</template>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

let chartInstance = null
let stressChartInstance = null

function loadChartJS() {
  return new Promise((resolve, reject) => {
    if (window.Chart) { resolve(window.Chart); return }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js'
    script.onload = () => resolve(window.Chart)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

function isDarkMode() {
  return document.documentElement.classList.contains('dark')
}

// ========== 基础参数 ==========
const monthlySalary = ref(15000)
const yearEndBonus = ref(30000)
const otherIncome = ref(0)
const passiveIncome = ref(0)
const currentAssets = ref(100000)
const currentAge = ref(30)
const monthlyExpense = ref(8000)
const yearExtraExpense = ref(20000)
const flexibleRatio = ref(30)
const flexibleCut = ref(50)
const returnRate = ref(7)
const retirementReturnAdj = ref(-2)
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

// 社保参数
const enablePension = ref(false)
const pensionAge = ref(60)
const pensionMonthly = ref(3000)

// 压力测试参数
const enableStressTest = ref(false)
const lifeExpectancy = ref(85)
const riskProfile = ref('balanced')
const simulationCount = ref(1000)
const majorExpenseAmount = ref(200000)

// 结果
const showResult = ref(false)
const fireYearsText = ref('-- 年')
const fireYearsColor = ref('var(--vp-c-brand-1)')
const fireAge = ref(null)
const fireYears = ref(0)
const savingsRate = ref(0)
const fireTarget = ref(0)
const fireAssets = ref(0)
const annualIncome = ref(0)
const annualExpense = ref(0)
const breakdown = ref([])
const houseImpact = ref(null)
const stressResult = ref(null)

function formatMoney(num) {
  if (num >= 100000000) return (num / 100000000).toFixed(2) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  if (num <= -10000) return (num / 10000).toFixed(1) + '万'
  return num.toFixed(0)
}

function calcMonthlyPayment(principal, annualRate, years) {
  const monthlyRate = annualRate / 100 / 12
  const months = years * 12
  if (monthlyRate === 0) return principal / months
  return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)
}

function getRiskParams() {
  const profiles = {
    conservative: { meanReturn: 0.05, stdDev: 0.08 },
    balanced: { meanReturn: 0.07, stdDev: 0.15 },
    aggressive: { meanReturn: 0.09, stdDev: 0.22 }
  }
  return profiles[riskProfile.value] || profiles.balanced
}

function randn() {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
}

function getMajorExpenseProb(age) {
  if (age < 50) return 0.02
  if (age < 70) return 0.05
  return 0.10
}

// ========== 工作期模拟 ==========
function simulateWorkPhase(
  startAssets, startIncome, startExpense,
  enableHouseFlag, houseYearVal, housePriceVal, downPaymentRatioVal, loanRateVal, loanYearsVal
) {
  const r = returnRate.value / 100
  const wr = withdrawRate.value / 100
  const ig = incomeGrowth.value / 100
  const eg = expenseGrowth.value / 100
  const ha = houseAppreciation.value / 100
  const pi = passiveIncome.value

  const downPayment = enableHouseFlag ? housePriceVal * (downPaymentRatioVal / 100) : 0
  const loanPrincipal = enableHouseFlag ? housePriceVal - downPayment : 0
  const monthlyMortgage = enableHouseFlag ? calcMonthlyPayment(loanPrincipal, loanRateVal, loanYearsVal) : 0
  const annualMortgage = monthlyMortgage * 12

  let assets = startAssets
  let houseValue = 0
  let mortgage = 0
  let mortgageYearsPaid = 0
  let income = startIncome
  let expense = startExpense
  let years = 0
  const maxYears = 50
  const bd = []
  let achieved = false

  while (years < maxYears) {
    years++
    const age = currentAge.value + years - 1

    // 买房事件（年初）
    let houseEvent = false
    let actualDownPayment = 0
    if (enableHouseFlag && years === houseYearVal) {
      houseEvent = true
      actualDownPayment = Math.min(downPayment, assets)
      assets -= actualDownPayment
      houseValue = housePriceVal
      mortgage = annualMortgage
      mortgageYearsPaid = 0
    }

    // 贷款还清
    if (mortgage > 0) {
      mortgageYearsPaid++
      if (mortgageYearsPaid > loanYearsVal) mortgage = 0
    }

    // 总支出 = 基础支出 + 月供
    const totalExpense = expense + mortgage

    // 总收入 = 主动收入 + 被动收入
    const totalIncome = income + pi

    // 储蓄
    const savings = totalIncome - totalExpense

    // 资产增长
    const investmentReturn = assets * r
    assets = assets + investmentReturn + savings

    // 房产增值
    if (houseValue > 0) houseValue *= (1 + ha)

    // Fire 判断（关键修复：用当年支出算目标）
    const totalAssets = assets + (enableHouseFlag && houseAsAsset.value ? houseValue : 0)
    const adjustedTarget = (totalExpense - pi) / wr
    const fireAchieved = totalAssets >= adjustedTarget

    bd.push({
      year: years,
      age,
      assets: totalAssets,
      financialAssets: assets,
      houseValue,
      income: totalIncome,
      expense: totalExpense,
      savings,
      ret: investmentReturn,
      target: adjustedTarget,
      fireAchieved,
      houseEvent,
      houseDownPayment: actualDownPayment,
    })

    if (fireAchieved) {
      achieved = true
      break
    }

    // 下年参数更新
    income = income * (1 + ig)
    expense = expense * (1 + eg)
  }

  return {
    years: achieved ? years : null,
    breakdown: bd,
    monthlyMortgage,
    downPayment,
    fireAssets: achieved ? assets : 0,
    fireHouseValue: achieved ? houseValue : 0,
    fireExpense: achieved ? expense : 0,
    fireMortgage: achieved ? mortgage : 0,
    fireMortgageYearsPaid: achieved ? mortgageYearsPaid : 0,
  }
}

// ========== 退休期蒙特卡洛模拟 ==========
function simulateRetirementMC(fireAssets, fireExpense, fireMortgage, fireMortgageYearsPaid, fireAge, fireHouseValue) {
  const risk = getRiskParams()
  const sims = simulationCount.value
  const maxYears = lifeExpectancy.value - fireAge + 1
  const meAmount = majorExpenseAmount.value
  const fr = flexibleRatio.value / 100
  const fc = flexibleCut.value / 100
  const pi = passiveIncome.value
  const pa = pensionAge.value
  const pm = pensionMonthly.value
  const eg = expenseGrowth.value / 100
  const rr = retirementReturnAdj.value / 100
  const ha = houseAppreciation.value / 100
  const hasHouse = enableHouse.value && houseAsAsset.value

  const depletionAges = []
  const finalAssetsList = []
  const samplePaths = []

  for (let sim = 0; sim < sims; sim++) {
    let assets = fireAssets
    let expense = fireExpense
    let mortgage = fireMortgage
    let mortgageYearsPaid = fireMortgageYearsPaid
    let houseValue = hasHouse ? fireHouseValue : 0
    let meAmountReal = meAmount  // 大额支出金额（随通胀增长）
    let majorExpenseCooldown = 0  // 大额支出冷却期（年）
    const path = [assets + houseValue]
    let depleted = false

    for (let year = 1; year <= maxYears; year++) {
      const age = fireAge + year - 1

      // 贷款还清
      if (mortgage > 0) {
        mortgageYearsPaid++
        if (mortgageYearsPaid > loanYears.value) mortgage = 0
      }

      // 随机收益率
      const randomReturn = risk.meanReturn + rr + risk.stdDev * randn()

      // 被动收入
      const pension = age >= pa ? pm * 12 : 0
      const totalPassive = pi + pension

      // 支出增长
      expense = expense * (1 + eg)

      // 大额支出（年龄分层，有冷却期，金额随通胀增长）
      if (majorExpenseCooldown > 0) {
        majorExpenseCooldown--
      } else if (Math.random() < getMajorExpenseProb(age)) {
        expense += meAmountReal
        majorExpenseCooldown = 3  // 触发后3年冷却
      }

      // 大额支出金额随通胀增长（保持购买力）
      meAmountReal = meAmountReal * (1 + eg)

      // 熊市压缩弹性支出
      if (randomReturn < -0.10) {
        const flexible = expense * fr
        expense -= flexible * fc
      }

      const totalExpense = expense + mortgage

      // 资产提取
      const withdrawal = Math.max(0, totalExpense - totalPassive)

      // 资产变化
      assets = assets * (1 + randomReturn) - withdrawal

      // 房产增值（退休期继续）
      if (houseValue > 0) {
        houseValue *= (1 + ha)
      }

      const totalAssets = assets + (hasHouse ? houseValue : 0)
      path.push(totalAssets)

      if (totalAssets <= 0) {
        depletionAges.push(age)
        depleted = true
        break
      }
    }

    if (!depleted) {
      depletionAges.push(lifeExpectancy.value + 1)
    }
    // 所有模拟都记录最终资产（耗尽的记为0）
    finalAssetsList.push(depleted ? 0 : (assets + (hasHouse ? houseValue : 0)))

    if (sim < 100) samplePaths.push(path)
  }

  // 统计
  const perpetual = depletionAges.filter(a => a > lifeExpectancy.value).length
  const perpetualProb = Math.round((perpetual / sims) * 100)

  const depleted = depletionAges.filter(a => a <= lifeExpectancy.value).sort((a, b) => a - b)
  const medianDepletionAge = depleted.length > 0 ? depleted[Math.floor(depleted.length * 0.5)] : lifeExpectancy.value
  const worstAge = depleted.length > 0 ? (depleted[Math.floor(depleted.length * 0.05)] || depleted[0]) : lifeExpectancy.value

  const sortedFinal = finalAssetsList.sort((a, b) => a - b)
  const medianLegacy = sortedFinal.length > 0 ? sortedFinal[Math.floor(sortedFinal.length * 0.5)] : 0

  // 情景分析
  const scenarios = [
    {
      name: '理想路径',
      depletionAge: simulateDeterministic(fireAssets, fireExpense, fireMortgage, fireMortgageYearsPaid, fireAge, risk.meanReturn + rr, 0, 0, fireHouseValue),
      desc: `每年固定 ${((risk.meanReturn + rr) * 100).toFixed(1)}% 收益，无大额支出`
    },
    {
      name: '温和熊市',
      depletionAge: simulateDeterministic(fireAssets, fireExpense, fireMortgage, fireMortgageYearsPaid, fireAge, risk.meanReturn + rr, 3, 0, fireHouseValue),
      desc: 'Fire后连续3年 -20%，之后恢复'
    },
    {
      name: '严重熊市',
      depletionAge: simulateDeterministic(fireAssets, fireExpense, fireMortgage, fireMortgageYearsPaid, fireAge, risk.meanReturn + rr, 5, 0, fireHouseValue),
      desc: 'Fire后连续5年 -20%，之后恢复'
    },
    {
      name: '通胀超预期',
      depletionAge: simulateDeterministic(fireAssets, fireExpense, fireMortgage, fireMortgageYearsPaid, fireAge, risk.meanReturn + rr, 0, 2, fireHouseValue),
      desc: '支出增长率比预期高 2%'
    }
  ]

  return {
    perpetualProb,
    medianDepletionAge,
    worstAge,
    medianLegacy,
    paths: samplePaths,
    scenarios,
  }
}

// 确定性情景模拟
function simulateDeterministic(fireAssets, fireExpense, fireMortgage, fireMortgageYearsPaid, fireAge, normalReturn, bearYears, extraInflation, fireHouseValue) {
  let assets = fireAssets
  let expense = fireExpense
  let mortgage = fireMortgage
  let mortgageYearsPaid = fireMortgageYearsPaid
  let houseValue = (enableHouse.value && houseAsAsset.value) ? fireHouseValue : 0
  const maxYears = lifeExpectancy.value - fireAge + 1
  const pi = passiveIncome.value
  const pa = pensionAge.value
  const pm = pensionMonthly.value
  const eg = (expenseGrowth.value + extraInflation) / 100
  const ha = houseAppreciation.value / 100

  for (let year = 1; year <= maxYears; year++) {
    const age = fireAge + year - 1

    if (mortgage > 0) {
      mortgageYearsPaid++
      if (mortgageYearsPaid > loanYears.value) mortgage = 0
    }

    const actualReturn = year <= bearYears ? -0.20 : normalReturn
    const pension = age >= pa ? pm * 12 : 0
    const totalPassive = pi + pension

    expense = expense * (1 + eg)
    const totalExpense = expense + mortgage
    const withdrawal = Math.max(0, totalExpense - totalPassive)

    assets = assets * (1 + actualReturn) - withdrawal

    // 房产增值
    if (houseValue > 0) {
      houseValue *= (1 + ha)
    }

    const totalAssets = assets + ((enableHouse.value && houseAsAsset.value) ? houseValue : 0)

    if (totalAssets <= 0) return age
  }
  return lifeExpectancy.value + 1
}

// ========== 主计算 ==========
function calculateFire() {
  const ai = monthlySalary.value * 12 + yearEndBonus.value + otherIncome.value
  const baseExpense = monthlyExpense.value * 12 + yearExtraExpense.value
  const as = ai - baseExpense
  const sr = ai > 0 ? ((as / ai) * 100) : 0

  // 不买房版本
  const noHouse = simulateWorkPhase(
    currentAssets.value, ai, baseExpense,
    false, 0, 0, 0, 0, 0
  )

  // 买房版本
  const withHouse = enableHouse.value
    ? simulateWorkPhase(
        currentAssets.value, ai, baseExpense,
        true, houseYear.value, housePrice.value,
        downPaymentRatio.value, loanRate.value, loanYears.value
      )
    : null

  const result = withHouse || noHouse
  const achieved = result.years !== null

  showResult.value = true
  annualIncome.value = ai
  annualExpense.value = baseExpense
  savingsRate.value = sr
  fireYears.value = achieved ? result.years : 0
  fireAge.value = achieved ? currentAge.value + result.years : null
  breakdown.value = result.breakdown

  if (achieved) {
    const lastEntry = result.breakdown[result.breakdown.length - 1]
    fireTarget.value = lastEntry.target
    fireAssets.value = lastEntry.assets

    fireYearsText.value = result.years + ' 年'
    fireYearsColor.value = 'var(--vp-c-brand-1)'
  } else {
    fireTarget.value = 0
    fireAssets.value = 0
    fireYearsText.value = '>50 年'
    fireYearsColor.value = '#ff5252'
  }

  // 买房影响
  if (enableHouse.value && withHouse) {
    const monthlyMortgage = withHouse.monthlyMortgage
    const mortgageRatio = ai > 0 ? ((monthlyMortgage * 12) / ai * 100) : 0
    const noHouseYears = noHouse.years
    const withHouseYears = withHouse.years

    let delayText, delayColor
    if (!noHouseYears && !withHouseYears) {
      delayText = '均无法达成'
      delayColor = '#ff9800'
    } else if (!noHouseYears) {
      delayText = '不买房也>50年'
      delayColor = '#ff9800'
    } else if (!withHouseYears) {
      delayText = '买房后>50年'
      delayColor = '#ff5252'
    } else {
      const delay = withHouseYears - noHouseYears
      delayText = (delay > 0 ? '+' : '') + delay + '年'
      delayColor = delay > 0 ? '#ff5252' : '#4caf50'
    }

    let warning = ''
    if (mortgageRatio > 50) warning = '⚠️ 月供占收入比超过50%，财务风险较高'
    else if (mortgageRatio > 40) warning = '⚡ 月供占收入比超过40%，注意现金流压力'

    houseImpact.value = {
      downPayment: withHouse.downPayment,
      monthlyMortgage,
      mortgageRatio: mortgageRatio.toFixed(1),
      loanYears: loanYears.value,
      fireWithoutHouseText: noHouseYears ? noHouseYears + '年' : '>50年',
      delayText,
      delayColor,
      warning
    }
  } else {
    houseImpact.value = null
  }

  // Fire 后压力测试
  if (enableStressTest.value && achieved) {
    stressResult.value = simulateRetirementMC(
      result.fireAssets,
      result.fireExpense,
      result.fireMortgage,
      result.fireMortgageYearsPaid,
      currentAge.value + result.years,
      result.fireHouseValue
    )
    renderStressChart(stressResult.value)
  } else {
    stressResult.value = null
  }

  renderChart(result.breakdown)
}

// ========== 图表渲染 ==========
async function renderChart(data) {
  if (!data || data.length === 0) return
  try {
    const Chart = await loadChartJS()
    const dark = isDarkMode()
    const ctx = document.getElementById('fireChart')
    if (!ctx) return
    if (chartInstance) chartInstance.destroy()

    const labels = data.map(d => `第${d.year}年`)
    const assetsData = data.map(d => d.assets)
    const targetData = data.map(d => d.target)
    const financialData = data.map(d => d.financialAssets)
    const houseValueData = data.map(d => d.houseValue)

    const textColor = dark ? '#e0e0e0' : '#333'
    const gridColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

    const datasets = [
      {
        label: '总资产',
        data: assetsData,
        borderColor: '#646cff',
        backgroundColor: 'rgba(100,108,255,0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6
      },
      {
        label: 'Fire 目标线',
        data: targetData,
        borderColor: '#ff6b6b',
        borderDash: [6, 4],
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4
      }
    ]

    if (enableHouse.value && houseAsAsset.value) {
      datasets.push(
        { label: '金融资产', data: financialData, borderColor: '#4caf50', fill: false, tension: 0.3, pointRadius: 2 },
        { label: '房产价值', data: houseValueData, borderColor: '#ff9800', fill: false, tension: 0.3, pointRadius: 2 }
      )
    }

    chartInstance = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: textColor, font: { size: 12 } } },
          tooltip: {
            backgroundColor: dark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + formatMoney(context.raw)
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: textColor, font: { size: 11 }, maxTicksLimit: 12 }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, font: { size: 11 }, callback: function(value) { return formatMoney(value) } }, grid: { color: gridColor } }
        }
      }
    })
  } catch (e) {
    console.error('Chart render failed:', e)
  }
}

async function renderStressChart(stressData) {
  if (!stressData || !stressData.paths || stressData.paths.length === 0) return
  try {
    const Chart = await loadChartJS()
    const dark = isDarkMode()
    const ctx = document.getElementById('stressChart')
    if (!ctx) return
    if (stressChartInstance) stressChartInstance.destroy()

    const paths = stressData.paths
    const maxLen = Math.max(...paths.map(p => p.length))
    const labels = []
    for (let i = 0; i < maxLen; i++) {
      labels.push((currentAge.value + fireYears.value - 1 + i) + '岁')
    }

    const textColor = dark ? '#e0e0e0' : '#333'
    const gridColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

    // 计算分位数
    const p10 = [], p25 = [], p50 = [], p75 = [], p90 = []
    for (let year = 0; year < maxLen; year++) {
      const values = paths.map(p => p[year] !== undefined ? p[year] : 0).filter(v => v > 0).sort((a, b) => a - b)
      if (values.length === 0) {
        p10.push(0); p25.push(0); p50.push(0); p75.push(0); p90.push(0)
        continue
      }
      p10.push(values[Math.floor(values.length * 0.1)] || values[0])
      p25.push(values[Math.floor(values.length * 0.25)] || values[0])
      p50.push(values[Math.floor(values.length * 0.5)] || values[0])
      p75.push(values[Math.floor(values.length * 0.75)] || values[values.length - 1])
      p90.push(values[Math.floor(values.length * 0.9)] || values[values.length - 1])
    }

    const datasets = [
      { label: '90%分位', data: p90, borderColor: 'rgba(100,108,255,0.2)', backgroundColor: 'rgba(100,108,255,0.05)', fill: '+1', pointRadius: 0, tension: 0.3 },
      { label: '75%分位', data: p75, borderColor: 'rgba(100,108,255,0.35)', backgroundColor: 'rgba(100,108,255,0.08)', fill: '+1', pointRadius: 0, tension: 0.3 },
      { label: '中位数', data: p50, borderColor: '#646cff', backgroundColor: 'rgba(100,108,255,0.15)', fill: '+1', pointRadius: 2, tension: 0.3, borderWidth: 2 },
      { label: '25%分位', data: p25, borderColor: 'rgba(100,108,255,0.35)', backgroundColor: 'rgba(100,108,255,0.08)', fill: '+1', pointRadius: 0, tension: 0.3 },
      { label: '10%分位', data: p10, borderColor: 'rgba(100,108,255,0.2)', backgroundColor: 'rgba(100,108,255,0.05)', fill: false, pointRadius: 0, tension: 0.3 }
    ]

    stressChartInstance = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { color: textColor, font: { size: 11 } } },
          tooltip: {
            backgroundColor: dark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + formatMoney(context.raw)
              }
            }
          }
        },
        scales: {
          x: { ticks: { color: textColor, font: { size: 10 }, maxTicksLimit: 10 }, grid: { color: gridColor } },
          y: { ticks: { color: textColor, font: { size: 10 }, callback: function(value) { return formatMoney(value) } }, grid: { color: gridColor } }
        }
      }
    })
  } catch (e) {
    console.error('Stress chart render failed:', e)
  }
}

onMounted(() => {
  calculateFire()
})
</script>

<style scoped>
.fire-calculator { max-width: 640px; margin: 0 auto; }
.fire-card { background: var(--vp-c-bg-soft); border-radius: 16px; padding: 24px; margin-bottom: 16px; border: 1px solid var(--vp-c-divider); }
.fire-card-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--vp-c-text-1); display: flex; align-items: center; gap: 8px; justify-content: space-between; }
.fire-input-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.fire-input-group { margin-bottom: 16px; }
.fire-input-group label { display: block; margin-bottom: 6px; font-size: 14px; color: var(--vp-c-text-2); }
.fire-input-group input, .fire-select { width: 100%; padding: 12px 16px; border: 1px solid var(--vp-c-divider); border-radius: 10px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 16px; transition: all 0.3s; }
.fire-input-group input:focus, .fire-select:focus { outline: none; border-color: var(--vp-c-brand-1); box-shadow: 0 0 0 3px rgba(100,108,255,0.1); }
.fire-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
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
.fire-detail-value { font-size: 18px; font-weight: 600; color: var(--vp-c-text-1); }
.fire-detail-label { font-size: 12px; color: var(--vp-c-text-2); margin-top: 4px; line-height: 1.4; }
.fire-detail-label small { font-size: 11px; opacity: 0.7; }
.fire-divider { height: 1px; background: var(--vp-c-divider); margin: 16px 0; }
.fire-year-breakdown { max-height: 300px; overflow-y: auto; margin-top: 16px; }
.fire-year-row { display: flex; justify-content: space-between; padding: 8px 12px; border-radius: 8px; margin-bottom: 4px; font-size: 13px; }
.fire-year-row:nth-child(odd) { background: var(--vp-c-bg); }
.fire-year-row.fire-achieved { background: rgba(76,175,80,0.12); color: #4caf50; font-weight: 600; }
.fire-year-row.fire-house { background: rgba(255,152,0,0.1); }
.fire-year-row.fire-negative { color: #ff5252; }

.fire-chart-container { position: relative; height: 320px; margin-top: 16px; }
.fire-chart-container canvas { width: 100% !important; height: 100% !important; }

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
.fire-warning { background: rgba(255,152,0,0.1); border: 1px solid rgba(255,152,0,0.3); border-radius: 8px; padding: 10px 14px; margin-bottom: 12px; font-size: 13px; color: #ff9800; }

/* 压力测试 */
.fire-stress-result { margin-top: 16px; }
.fire-stress-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
.fire-stress-item { background: var(--vp-c-bg); padding: 16px 12px; border-radius: 12px; text-align: center; }
.fire-stress-value { font-size: 26px; font-weight: 700; color: var(--vp-c-brand-1); }
.fire-stress-label { font-size: 12px; color: var(--vp-c-text-2); margin-top: 6px; line-height: 1.5; }
.fire-stress-label small { font-size: 11px; opacity: 0.7; }

.fire-scenarios { margin-top: 16px; }
.fire-scenario-row { display: grid; grid-template-columns: 90px 130px 1fr; gap: 8px; padding: 10px 12px; border-radius: 8px; margin-bottom: 4px; font-size: 13px; align-items: center; }
.fire-scenario-row:nth-child(odd) { background: var(--vp-c-bg); }
.fire-scenario-header { font-weight: 600; color: var(--vp-c-text-2); font-size: 12px; }
.fire-scenario-bad { background: rgba(255,82,82,0.05) !important; }
.fire-scenario-desc { font-size: 12px; color: var(--vp-c-text-2); }
</style>
