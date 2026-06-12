import { defineConfig } from 'vitepress'
import { readdirSync, readFileSync, statSync } from 'fs'
import { join, extname } from 'path'

// 递归获取所有 .md 文件（排除 index.md）
function getAllMdFiles(dir: string): string[] {
  const results: string[] = []
  const list = readdirSync(dir)
  for (const file of list) {
    const fullPath = join(dir, file)
    const stat = statSync(fullPath)
    if (stat.isDirectory()) {
      results.push(...getAllMdFiles(fullPath))   // 递归
    } else if (extname(file) === '.md' && file !== 'index.md') {
      results.push(fullPath)
    }
  }
  return results
}
// 解析 frontmatter
function parseFrontmatter(filePath: string) {
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return { title: '', order: 9999, category: '' }
  
  const frontmatter: Record<string, any> = {}
  match[1].split('\n').forEach(line => {
    const [key, ...rest] = line.split(':')
    if (key && rest.length) {
      let value = rest.join(':').trim()
      if (!isNaN(Number(value))) value = Number(value)
      frontmatter[key.trim()] = value
    }
  })
  return {
    title: frontmatter.title || '',
    order: frontmatter.order ?? 9999,
    category: frontmatter.category || ''
  }
}

// 自动生成侧边栏，按第一级子文件夹分组
function getTutorialSidebar() {
  const postsDir = join(__dirname, '../LorModTutoials/')
  const files = getAllMdFiles(postsDir)

  // 解析所有文章，计算相对路径和 URL
  const articles = files.map(file => {
    const { title, order } = parseFrontmatter(file)
    const relative = file.replace(postsDir, '').replace(/\\/g, '/')
    const url = `/LorModTutoials/${relative.replace('.md', '')}`
    // 提取第一级子文件夹名（若文章就在 LorModTutoials/ 根下，则归入「未分类」）
    const folder = relative.split('/').filter(p => p)[0] || '未分类'
    return { text: title || relative, link: url, order, folder }
  })

  // 按文件夹分组
  const folderMap = new Map<string, typeof articles>()
  articles.forEach(article => {
    if (!folderMap.has(article.folder)) folderMap.set(article.folder, [])
    folderMap.get(article.folder)!.push(article)
  })
  // 构建侧边栏数组
  const sidebarItems = Array.from(folderMap.entries())
    .map(([folder, items]) => {
      items.sort((a, b) => a.order - b.order)
      return {
        text: folder,
        collapsible: true,
        items: items.map(({ text, link }) => ({ text, link }))
      }
    })
    // 按文件夹名排序（或按第一篇文章的 order 排序，这里用名称）
    .sort((a, b) => a.text.localeCompare(b.text, 'zh-Hans-CN'))

  return [
    {
      text: '教程目录',
      items: sidebarItems
    }
  ]
}
// 其余配置
export default defineConfig({
  base: "/",
  title: "废墟图书馆mod教程",
  description: "测试用？",
  themeConfig: {
    nav: [
      { text: '首页', link: '/LorModTutoials' },
      { text: '文章', link: '/LorModTutoials/开始/前言' }
    ],
    sidebar: {
      '/LorModTutoials/': getTutorialSidebar()
    },
    socialLinks: [
      
      { icon: 'github', link: 'https://github.com/Taullarkura/Taullarkura.github.io' }
    ,{
    icon: {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><image href="data:image/png;base64,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" width="24" height="24"/></svg>'
    },
    link: 'https://space.bilibili.com/2097990722'
  }

    ]
  }
})