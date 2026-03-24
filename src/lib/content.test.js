import { describe, expect, test } from 'vitest'
import { getAllArticles, getEras, getTags, getTimeline } from './content'

describe('content helpers', () => {
  test('returns article list with parsed frontmatter fields', () => {
    const items = getAllArticles()
    expect(items.length).toBeGreaterThan(0)
    expect(items[0]).toHaveProperty('slug')
    expect(items[0]).toHaveProperty('era')
    expect(items[0]).toHaveProperty('toc')
  })

  test('sorts eras by custom era order', () => {
    const eras = getEras(getAllArticles())
    expect(eras.indexOf('鎌倉')).toBeLessThan(eras.indexOf('安土桃山'))
    expect(eras.indexOf('安土桃山')).toBeLessThan(eras.indexOf('明治'))
  })

  test('sorts timeline by ascending year', () => {
    const timeline = getTimeline(getAllArticles())
    expect(timeline.length).toBeGreaterThan(0)
    for (let i = 1; i < timeline.length; i += 1) {
      expect(timeline[i].year).toBeGreaterThanOrEqual(timeline[i - 1].year)
    }
  })

  test('sorts tags with priority order first', () => {
    const tags = getTags(getAllArticles())
    expect(tags.indexOf('武家政権')).toBeLessThan(tags.indexOf('戦国'))
  })
})
