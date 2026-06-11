import { defineConfig } from 'vitepress'

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
      '/posts/': async () => {
        const { default: posts } = await import('../.vitepress/posts.data.js')
        return [
          {
            text: '全部文章',
            items: posts.map((post: any) => ({
              text: post.title,
              link: post.url
            }))
          }
        ]
      },
      // 其他路径可以不配或配固定侧边栏
    }
  }
})