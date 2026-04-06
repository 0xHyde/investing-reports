import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

// 扫描目录获取股票/ETF列表
function scanItems(baseDir: string) {
  const fullPath = path.join(__dirname, '../', baseDir)
  if (!fs.existsSync(fullPath)) return []
  
  return fs.readdirSync(fullPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const match = d.name.match(/^(.+)-([\d\.]+)$/)
      if (match) {
        return { name: match[1], code: match[2], dir: d.name }
      }
      return { name: d.name, code: '', dir: d.name }
    })
    .sort((a, b) => a.code.localeCompare(b.code))
}

// 生成侧边栏
function generateSidebar(basePath: string, items: any[]) {
  const sidebars: Record<string, any> = {}
  
  items.forEach(item => {
    const key = `/${basePath}/${item.dir}/`
    sidebars[key] = [
      { text: `← 返回列表`, link: `/${basePath}/` },
      { text: `${item.name} (${item.code})` },
      { text: '📊 快速分析报告', link: `/${basePath}/${item.dir}/quick-analysis` }
    ]
  })
  
  return sidebars
}

// 获取股票和ETF列表
const stocks = scanItems('stocks')
const etfs = scanItems('etfs')

export default defineConfig({
  title: '投资研究报告',
  description: '股票与ETF投资分析',
  base: '/investing-reports/',
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: `股票(${stocks.length})`, link: '/stocks/' },
      { text: `ETF(${etfs.length})`, link: '/etfs/' }
    ],
    
    sidebar: {
      '/stocks/': [
        {
          text: '股票列表',
          items: stocks.length > 0 
            ? stocks.map(s => ({ text: `${s.name} (${s.code})`, link: `/stocks/${s.dir}/quick-analysis` }))
            : [{ text: '暂无报告', link: '#' }]
        }
      ],
      ...generateSidebar('stocks', stocks),
      
      '/etfs/': [
        {
          text: 'ETF列表',
          items: etfs.length > 0
            ? etfs.map(e => ({ text: `${e.name} (${e.code})`, link: `/etfs/${e.dir}/quick-analysis` }))
            : [{ text: '暂无报告', link: '#' }]
        }
      ],
      ...generateSidebar('etfs', etfs)
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourname/investing-reports' }
    ],
    
    search: {
      provider: 'local'
    }
  }
})
