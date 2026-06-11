import { defineConfig } from 'vitepress'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

// 解析 frontmatter
function parseFrontmatter(filePath: string) {
  const content = readFileSync(filePath, 'utf-8')
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (!match) return { title: '', order: 9999, category: '未分类' }
  
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
    category: frontmatter.category || '未分类'
  }
}

// 同步生成带分类的教程侧边栏
function getTutorialSidebar() {
  const postsDir = join(__dirname, '../posts')
  const files = readdirSync(postsDir).filter(f => f.endsWith('.md') && f !== 'index.md')

  // 解析所有文章
  const articles = files.map(file => {
    const { title, order, category } = parseFrontmatter(join(postsDir, file))
    const url = `/posts/${file.replace('.md', '')}`
    return { text: title || file, link: url, order, category }
  })

  // 按分类分组
  const categoryMap = new Map<string, typeof articles>()
  articles.forEach(article => {
    if (!categoryMap.has(article.category)) {
      categoryMap.set(article.category, [])
    }
    categoryMap.get(article.category)!.push(article)
  })

  // 构建侧边栏分组，并按组内第一篇文章的 order 对分组排序（或自定义顺序）
  const sidebarItems = Array.from(categoryMap.entries())
    .map(([category, items]) => {
      items.sort((a, b) => a.order - b.order)   // 组内排序
      return {
        text: category,
        collapsible: true,       // 可折叠
        items: items.map(({ text, link }) => ({ text, link }))
      }
    })
    // 分组排序：按组内最小 order 排序，保证整体顺序可控
    .sort((a, b) => {
      const aMinOrder = articles.find(art => art.category === a.text)?.order ?? 9999
      const bMinOrder = articles.find(art => art.category === b.text)?.order ?? 9999
      return aMinOrder - bMinOrder
    })

  return [
    {
      text: '教程目录',     // 顶层标题
      items: sidebarItems   // 二级分组
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
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' }
    ],
    sidebar: {
      '/posts/': getTutorialSidebar()
    }
  }
})