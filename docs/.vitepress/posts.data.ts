import { createContentLoader } from 'vitepress'

export default createContentLoader('posts/*.md', {
  transform(raw) {
    return raw
      .filter(post => post.url !== '/posts/')   // 排除 posts/index.md 自身
      .map(post => ({
        title: post.frontmatter.title || post.url.replace(/^.*\//, '').replace('.html', ''),
        url: post.url,
        order: post.frontmatter.order ?? 9999  // 默认极大值，没写 order 的文章排最后
      }))
      .sort((a, b) => a.order - b.order)       // 升序排列，order 小的在前
  }
})