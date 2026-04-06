# 投资研究报告

基于 VitePress 的股票与 ETF 投资分析报告站点。

## 在线访问

https://yourname.github.io/investing-reports/

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run docs:dev

# 构建
npm run docs:build
```

## 添加报告

### 股票报告

使用 `stock-quick-analyzer` skill 分析股票，报告会自动保存到：
- `analyses/stocks/{代码}-{名称}/quick-analysis.md`（存档）
- `docs/stocks/{代码}-{名称}/quick-analysis.md`（展示）

### ETF 报告

使用 `etf-quick-analyzer` skill 分析ETF，报告会自动保存到：
- `analyses/etfs/{代码}-{名称}/quick-analysis.md`（存档）
- `docs/etfs/{代码}-{名称}/quick-analysis.md`（展示）

## 部署

推送到 main 分支后，GitHub Actions 会自动构建并部署到 GitHub Pages。

```bash
git add .
git commit -m "添加 XX 分析报告"
git push origin main
```

## 目录结构

```
investing-reports/
├── analyses/          # 报告存档（Git 历史）
│   ├── stocks/
│   └── etfs/
├── docs/              # VitePress 站点
│   ├── .vitepress/    # 配置
│   ├── stocks/        # 股票报告（展示）
│   ├── etfs/          # ETF报告（展示）
│   └── index.md       # 首页
└── .github/workflows/ # 自动部署
```
