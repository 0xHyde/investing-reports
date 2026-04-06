---
layout: home

hero:
  name: "投资研究报告"
  text: ""
  tagline: 股票与ETF的系统性分析
  actions:
    - theme: brand
      text: 查看股票报告
      link: /stocks/
    - theme: alt
      text: 查看ETF报告
      link: /etfs/

features:
  - title: 📈 股票分析
    details: 技术面、基本面、行业对比、市场情绪全面覆盖
  - title: 🎯 ETF研究
    details: 宽基、行业、红利、跨境、黄金分类分析
  - title: ⏰ 实时更新
    details: 自动化报告生成与站点部署
---

## 最新报告

::: tip 提示
使用 Kimi Code CLI 的 `stock-quick-analyzer` 或 `etf-quick-analyzer` skill 生成分析报告后，站点会自动更新。
:::

### 股票

> 暂无报告，请使用 `stock-quick-analyzer` skill 分析股票

### ETF

> 暂无报告，请使用 `etf-quick-analyzer` skill 分析ETF

---

## 使用流程

```
1. 使用 skill 分析股票/ETF
   ↓
2. 报告保存到 analyses/ 和 docs/
   ↓
3. git commit && git push
   ↓
4. GitHub Actions 自动部署
   ↓
5. 站点更新完成
```
