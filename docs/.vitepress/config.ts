import { defineConfig } from 'vitepress'

export default defineConfig({
  base : "/",
  title: "废墟图书馆mod教程",
  description: "测试用喵？",
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/posts/' }
    ],
    // 侧边栏可配，博客模式下一般用 frontmatter 自动生成
  }
})