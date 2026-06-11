import { createContentLoader } from 'vitepress'

interface Post {
  title: string
  url: string
  order: number
}

export default createContentLoader('posts/*.md', {
  transform(raw): Post[] {
    return raw
      .filter(post => post.url !== '/posts/')
      .map(post => ({
        title: post.frontmatter.title || '',
        url: post.url,
        order: post.frontmatter.order ?? 9999
      }))
      .sort((a, b) => a.order - b.order)
  }
})