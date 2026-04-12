import rss from '@astrojs/rss'
import { getCollection } from 'astro:content'
import type { APIContext } from 'astro'

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog'))
    .filter(post => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())

  return rss({
    title: 'Njord Protocol Blog',
    description:
      'Articles, tutorials, and insights about decentralized affiliate marketing, on-chain tracking, and Solana DeFi from the Njord Protocol team.',
    site: context.site!.toString(),
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${post.slug}`,
      categories: post.data.tags,
      author: post.data.author,
    })),
    customData: '<language>en-us</language>',
  })
}
