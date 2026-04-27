#!/usr/bin/env node
/**
 * 根据 portfolio-data.yaml 自动生成所有列表页面
 * 运行方式：node scripts/generate-pages.cjs
 */

const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')

const DOCS_DIR = path.join(__dirname, '../docs')
const DATA_PATH = path.join(__dirname, '../portfolio-data.yaml')

function loadData() {
  const raw = fs.readFileSync(DATA_PATH, 'utf8')
  return yaml.load(raw)
}

function formatNumber(n) {
  if (n === undefined || n === null) return '—'
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function formatProfit(n) {
  if (n === undefined || n === null) return '—'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${formatNumber(n)}`
}

// ====== 生成 index.md 首页 ======
function generateHomePage(data) {
  const core = data.holdings.filter(h => h.layer === 'core')
  const growth = data.holdings.filter(h => h.layer === 'growth')
  const watchlist = data.watchlist || []
  const sold = data.sold || []

  const coreMV = core.reduce((s, h) => s + (h.market_value || 0), 0)
  const growthMV = growth.reduce((s, h) => s + (h.market_value || 0), 0)
  const totalMV = coreMV + growthMV
  const coreRatio = ((coreMV / data.meta.total_asset) * 100).toFixed(1)
  const growthRatio = ((growthMV / data.meta.total_asset) * 100).toFixed(1)

  const coreRows = core.map(h => {
    const name = h.has_report ? `[${h.name}](${h.report_path})` : h.name
    return `| ${name} | ${h.code} | ${h.sub_category} | ${formatNumber(h.market_value)} | ${formatProfit(h.float_profit)} |`
  }).join('\n')

  const growthRows = growth.map(h => {
    const name = h.has_report ? `[${h.name}](${h.report_path})` : h.name
    return `| ${name} | ${h.code} | ${h.sub_category} | ${formatNumber(h.market_value)} | ${formatProfit(h.float_profit)} |`
  }).join('\n')

  const watchlistLinks = watchlist.map(w => {
    return w.has_report ? `[${w.name}](${w.report_path})` : w.name
  }).join(' · ')

  let soldSection = ''
  if (sold.length > 0) {
    const soldRows = sold.map(s => {
      const name = s.has_report ? `[${s.name}](${s.report_path})` : s.name
      return `| ${name} | ${s.code} | ${s.sell_date || '—'} | ${s.sell_reason || '—'} |`
    }).join('\n')
    soldSection = `
### 已清仓（${sold.length}个）

| 标的 | 代码 | 卖出日期 | 卖出原因 |
|-------|------|----------|----------|
${soldRows}
`
  }

  const content = `---
layout: home

hero:
  name: "投资研究报告"
  text: ""
  tagline: 定量参考，叙事驱动
  actions:
    - theme: brand
      text: 📊 组合概览
      link: /portfolio/overview
    - theme: alt
      text: 🚀 成长层
      link: /growth-layer/
    - theme: alt
      text: 🛡️ 核心层
      link: /core-layer/

features:
  - title: 🛡️ 核心层 ≥ 60%
    details: 高息股个股 + 红利ETF + 全球宽基 + 政策基础
    link: /core-layer/
  - title: 🚀 成长层 ≤ 25%
    details: 进攻性配置，利润必须向上流动
    link: /growth-layer/
  - title: 👁️ 观察清单
    details: 已分析未建仓或清仓后继续跟踪的标的
    link: /watchlist/
---

## 📊 最新持仓（${data.holdings.length}个标的）

> 总资产 **${formatNumber(data.meta.total_asset)}** | 总市值 **${formatNumber(totalMV)}** | 核心层占比 **${coreRatio}%** | 成长层占比 **${growthRatio}%**

### 核心层（${core.length}个）

| 标的 | 代码 | 分类 | 市值 | 浮盈 |
|-------|------|------|------:|------:|
${coreRows}

### 成长层（${growth.length}个）

| 标的 | 代码 | 分类 | 市值 | 浮盈 |
|-------|------|------|------:|------:|
${growthRows}

### 观察清单（${watchlist.length}个）

${watchlistLinks}
${soldSection}

---

## 📖 投资体系

- [投资哲学纲颈](/framework/philosophy.md)
- [两层策略](/framework/two-layer-policy.md)
- [成长层管理细则](/framework/growth-layer-policy.md)
- [进化规则](/framework/evolutionary-rules.md)
`

  fs.writeFileSync(path.join(DOCS_DIR, 'index.md'), content, 'utf8')
  console.log('✅ 生成 index.md')
}

// ====== 生成 portfolio/overview.md ======
function generatePortfolioOverview(data) {
  const core = data.holdings.filter(h => h.layer === 'core')
  const growth = data.holdings.filter(h => h.layer === 'growth')

  const coreMV = core.reduce((s, h) => s + (h.market_value || 0), 0)
  const growthMV = growth.reduce((s, h) => s + (h.market_value || 0), 0)
  const totalMV = coreMV + growthMV

  const coreRatio = ((coreMV / data.meta.total_asset) * 100).toFixed(1)
  const growthRatio = ((growthMV / data.meta.total_asset) * 100).toFixed(1)

  const coreRows = core.map((h, i) => {
    const name = h.has_report ? `[${h.name}](${h.report_path})` : h.name
    return `| ${i+1} | ${name} | ${h.code} | ${h.sub_category} | ${formatNumber(h.market_value)} | ${h.shares}份 | ${formatProfit(h.float_profit)} |`
  }).join('\n')

  const growthRows = growth.map((h, i) => {
    const name = h.has_report ? `[${h.name}](${h.report_path})` : h.name
    return `| ${i+1} | ${name} | ${h.code} | ${h.sub_category} | ${formatNumber(h.market_value)} | ${h.shares}份 | ${formatProfit(h.float_profit)} |`
  }).join('\n')

  const content = `# 组合概览

> 数据来源：${data.meta.account} 持仓截图
> 截图时间：${data.meta.screenshot_time}
> 总资产：**${formatNumber(data.meta.total_asset)}** | 总市值：**${formatNumber(totalMV)}** | 仓位：**${((totalMV / data.meta.total_asset) * 100).toFixed(2)}%**

---

## 📊 资产配置

| 层级 | 目标 | 实际占比 | 状态 |
|------|------|-----------|------|
| **核心层** | ≥ 60% | ~${coreRatio}% | ✅ 达标 |
| **成长层** | ≤ 25% | ~${growthRatio}% | ✅ 在限内 |
| **现金/逆回购** | - | ~${(100 - parseFloat(coreRatio) - parseFloat(growthRatio)).toFixed(1)}% | ✅ 弹药充足 |

> 估算说明：核心层约${coreRatio}%，成长层约${growthRatio}%

---

## 📋 持仓明细（按市值排序）

### 核心层（${core.length}个）

| 序号 | 标的 | 代码 | 分类 | 市值 | 持仓 | 浮盈 |
|:---:|:---|:---|:---:|---:|:---:|---:|
${coreRows}

### 成长层（${growth.length}个）

| 序号 | 标的 | 代码 | 分类 | 市值 | 持仓 | 浮盈 |
|:---:|:---|:---|:---:|---:|:---:|---:|
${growthRows}

---

## ⚠️ 当前关注

1. **招行仍然超仓** — 单个占总资产 ~${(core[0]?.market_value / data.meta.total_asset * 100).toFixed(1)}%，过渡期上限 10%
2. **成长层空间很大** — 当前仅占 ~${growthRatio}%，距 25%上限还有约${(25 - parseFloat(growthRatio)).toFixed(1)}%空间
3. **数据自动同步** — 修改 portfolio-data.yaml 后自动更新所有页面

---

## 💰 货币基金每日自动逆回购

> 约 ${formatNumber(data.meta.reverse_repo)} 元每日自动买入国债逆回购，T+0 可用。
> 可用现金 ${formatNumber(data.meta.cash_approx)} 元中，实际可操作资金远大于显示数值。
`

  fs.writeFileSync(path.join(DOCS_DIR, 'portfolio/overview.md'), content, 'utf8')
  console.log('✅ 生成 portfolio/overview.md')
}

// ====== 生成 core-layer/index.md ======
function generateCoreLayerIndex(data) {
  const core = data.holdings.filter(h => h.layer === 'core')
  const byCategory = {}
  core.forEach(h => {
    if (!byCategory[h.category]) byCategory[h.category] = []
    byCategory[h.category].push(h)
  })

  const categoryNames = {
    'high-dividend': '🏦 高息股个股',
    'dividend-etfs': '📊 红利ETF',
    'global-broad': '🌍 全球宽基',
    'policy-base': '🏛️ 政策基础',
  }

  const coreMV = core.reduce((s, h) => s + (h.market_value || 0), 0)
  const totalAsset = data.meta.total_asset

  let sections = ''
  for (const [cat, items] of Object.entries(byCategory)) {
    const rows = items.map(h => {
      const name = h.has_report ? `[${h.name}](${h.report_path})` : h.name
      const status = h.has_report ? '✅ 深度分析' : '待补充'
      return `| ${name} | ${h.code} | ${h.sub_category} | ${formatNumber(h.market_value)} | ${formatProfit(h.float_profit)} | ${status} |`
    }).join('\n')

    sections += `
## ${categoryNames[cat] || cat}

| 标的 | 代码 | 分类 | 市值 | 浮盈 | 报告 |
|-------|------|------|------:|------:|:-----|
${rows}
`
  }

  const content = `# 核心层

> 目标占比：**≥ 60%**
> 实际占比：**${((coreMV / totalAsset) * 100).toFixed(1)}%**
> 功能：安全边附，求稳求进
> 原则：基石层 ≥ 30%，任何剪减需经级别程序

---
${sections}
---

> ⚠️ 数据来源：portfolio-data.yaml，修改后自动更新。
`

  fs.writeFileSync(path.join(DOCS_DIR, 'core-layer/index.md'), content, 'utf8')
  console.log('✅ 生成 core-layer/index.md')
}

// ====== 生成 growth-layer/index.md ======
function generateGrowthLayerIndex(data) {
  const growth = data.holdings.filter(h => h.layer === 'growth')
  const byCategory = {}
  growth.forEach(h => {
    if (!byCategory[h.category]) byCategory[h.category] = []
    byCategory[h.category].push(h)
  })

  const categoryNames = {
    'stocks': '🔬 个股',
    'etfs': '📈 行业ETF',
  }

  const growthMV = growth.reduce((s, h) => s + (h.market_value || 0), 0)
  const totalAsset = data.meta.total_asset
  const ratio = ((growthMV / totalAsset) * 100).toFixed(1)

  let sections = ''
  for (const [cat, items] of Object.entries(byCategory)) {
    const rows = items.map(h => {
      const name = h.has_report ? `[${h.name}](${h.report_path})` : h.name
      const status = h.has_report ? '✅ 深度分析' : '待补充'
      return `| ${name} | ${h.code} | ${h.sub_category} | ${formatNumber(h.market_value)} | ${formatProfit(h.float_profit)} | ${status} |`
    }).join('\n')

    sections += `
## ${categoryNames[cat] || cat}

| 标的 | 代码 | 分类 | 市值 | 浮盈 | 报告 |
|-------|------|------|------:|------:|:-----|
${rows}
`
  }

  const content = `# 成长层

> 目标占比：**≤ 25%**
> 实际占比：**${ratio}%**
> 功能：进攻性配置，为未来清晰叙事付费
> 铁律：利润必须向上流动至核心层，不得内滚

---
${sections}
---

## 当前状态

- 成长层总市值：约 **${formatNumber(growthMV)}** 元
- 占总资产比：约 **${ratio}%**
- 距离 25% 上限还有约 **${(25 - parseFloat(ratio)).toFixed(1)}%** 空间

> 有充足的加仓空间。关注回调机会。
`

  fs.writeFileSync(path.join(DOCS_DIR, 'growth-layer/index.md'), content, 'utf8')
  console.log('✅ 生成 growth-layer/index.md')
}

// ====== 生成 watchlist/index.md ======
function generateWatchlistIndex(data) {
  const watchlist = data.watchlist || []

  const rows = watchlist.map(w => {
    const name = w.has_report ? `[${w.name}](${w.report_path})` : w.name
    return `| ${name} | ${w.code} | ${w.reason || '—'} |`
  }).join('\n')

  const content = `# 观察清单

> 已分析未建仓或清仓后继续跟踪的标的
> 数量：${watchlist.length} 个

---

| 标的 | 代码 | 观察原因 |
|-------|------|----------|
${rows}

---

> 修改 portfolio-data.yaml 后自动更新。
`

  fs.writeFileSync(path.join(DOCS_DIR, 'watchlist/index.md'), content, 'utf8')
  console.log('✅ 生成 watchlist/index.md')
}

// ====== 主函数 ======
function main() {
  console.log('🔧 开始生成页面...')
  const data = loadData()

  generateHomePage(data)
  generatePortfolioOverview(data)
  generateCoreLayerIndex(data)
  generateGrowthLayerIndex(data)
  generateWatchlistIndex(data)

  console.log('🎉 全部页面生成完毕！')
}

main()
