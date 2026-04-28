import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

// 中文映射表
const CN_MAP: Record<string, string> = {
  'high-dividend': '🏦 高息股个股',
  'dividend-etfs': '📊 红利ETF',
  'global-broad': '🌍 全球宽基',
  'policy-base': '🏛️ 政策基础',
  'etfs': '📈 行业ETF',
  'stocks': '🔬 个股',
}

// Scan directories for deep-dive.md reports
function scanReports(baseDir: string, relDir: string): any[] {
  const fullPath = path.join(baseDir, relDir)
  if (!fs.existsSync(fullPath)) return []

  const items: any[] = []
  const entries = fs.readdirSync(fullPath, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const dirName = entry.name
    const reportPath = path.join(fullPath, dirName, 'deep-dive.md')

    if (fs.existsSync(reportPath)) {
      // Extract name and code from dirname like "阳光电源-300274"
      const match = dirName.match(/^(.+)-([\d\.]+)$/)
      const displayName = match ? `${match[1]} (${match[2]})` : dirName
      const link = `/${relDir}/${dirName}/deep-dive`

      items.push({
        text: displayName,
        link: link,
      })
    }
  }

  return items.sort((a, b) => a.text.localeCompare(b.text))
}

// Generate sidebar for a section
function generateSectionSidebar(baseDir: string, section: string, title: string): any {
  const items: any[] = []
  const sectionPath = path.join(baseDir, section)

  if (!fs.existsSync(sectionPath)) {
    return { text: title, items: [] }
  }

  const entries = fs.readdirSync(sectionPath, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue

    const subDir = entry.name
    const subPath = path.join(sectionPath, subDir)
    const reports = scanReports(baseDir, `${section}/${subDir}`)

    // Check for index.md in subdirectory
    const hasIndex = fs.existsSync(path.join(subPath, 'index.md'))

    if (reports.length > 0 || hasIndex) {
      const subItems: any[] = []

      if (hasIndex) {
        subItems.push({ text: '📋 概览', link: `/${section}/${subDir}/` })
      }

      subItems.push(...reports)

      items.push({
        text: CN_MAP[subDir] || subDir,
        collapsed: false,
        items: subItems,
      })
    }
  }

  // Also check for reports directly in the section
  const directReports = scanReports(baseDir, section)
  items.push(...directReports)

  return { text: title, items }
}

// Scan framework docs
function scanFramework(baseDir: string): any[] {
  const fwPath = path.join(baseDir, 'framework')
  if (!fs.existsSync(fwPath)) return []

  return fs.readdirSync(fwPath)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .map(f => {
      const name = f.replace('.md', '')
      const textMap: Record<string, string> = {
        'philosophy': '📜 投资哲学纲领',
        'two-layer-policy': '🏗️ 两层策略',
        'growth-layer-policy': '🚀 成长层细则',
        'evolutionary-rules': '📋 进化规则',
      }
      return {
        text: textMap[name] || name,
        link: `/framework/${name}`,
      }
    })
    .sort((a, b) => a.text.localeCompare(b.text))
}

const baseDir = path.join(__dirname, '../')

export default defineConfig({
  title: '投资研究报告',
  description: '定量参考，叙事驱动 — 个股与ETF深度分析',
  base: '/investing-reports/',
  lang: 'zh-CN',

  themeConfig: {
    logo: '',

    nav: [
      { text: '🏠 首页', link: '/' },
      { text: '📊 组合', link: '/portfolio/' },
      { text: '🛡️ 核心层', link: '/core-layer/' },
      { text: '🚀 成长层', link: '/growth-layer/' },
      { text: '👁️ 观察', link: '/watchlist/' },
      { text: '📖 体系', link: '/framework/philosophy' },
    ],

    sidebar: {
      '/portfolio/': [
        { text: '📊 组合概览', link: '/portfolio/' },
        { text: '📈 资产配置', link: '/portfolio/overview' },
      ],
      '/core-layer/': [
        { text: '🛡️ 核心层概览', link: '/core-layer/' },
        generateSectionSidebar(baseDir, 'core-layer', '核心资产'),
      ],
      '/growth-layer/': [
        { text: '🚀 成长层概览', link: '/growth-layer/' },
        { text: '📋 标的质量回顾（2026-04-28）', link: '/growth-layer/review-20260428' },
        { text: '🔍 新方向标的筛选', link: '/growth-layer/new-targets-screening-20260428' },
        generateSectionSidebar(baseDir, 'growth-layer', '成长标的'),
      ],
      '/watchlist/': [
        { text: '👁️ 观察清单', link: '/watchlist/' },
        ...scanReports(baseDir, 'watchlist'),
      ],
      '/sold/': [
        { text: '📦 已卖出档案', link: '/sold/' },
        ...scanReports(baseDir, 'sold'),
      ],
      '/framework/': [
        { text: '📖 投资体系', link: '/framework/philosophy' },
        ...scanFramework(baseDir),
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/0xHyde/investing-reports' },
    ],

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索',
                buttonAriaLabel: '搜索',
              },
              modal: {
                noResultsText: '未找到结果',
                resetButtonTitle: '清除',
                footer: {
                  selectText: '选择',
                  navigateText: '导航',
                  closeText: '关闭',
                },
              },
            },
          },
        },
      },
    },

    outline: {
      label: '目录',
      level: [2, 4],
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '深色模式',

    footer: {
      message: '定量参考，叙事驱动',
      copyright: '© 2026 投资研究',
    },
  },

  markdown: {
    lineNumbers: true,
  },
})
