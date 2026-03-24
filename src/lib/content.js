const rawArticles = import.meta.glob('/content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

const ERA_ORDER = [
  '旧石器・縄文',
  '弥生',
  '古墳',
  '飛鳥',
  '奈良',
  '平安',
  '鎌倉',
  '室町',
  '安土桃山',
  '江戸',
  '明治',
  '大正',
  '昭和',
  '平成',
  '令和',
]

const TAG_ORDER = ['武家政権', '幕府', '戦国', '統一事業', '政治改革', '近代化']

function getSlug(path) {
  return path.split('/').pop().replace('.md', '')
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string' && value.length > 0) {
    return value.split(',').map((item) => item.trim())
  }
  return []
}

function parseFrontmatter(source) {
  if (!source.startsWith('---')) {
    return { attributes: {}, body: source }
  }

  const lines = source.split('\n')
  const endIndex = lines.findIndex((line, index) => index > 0 && line.trim() === '---')

  if (endIndex === -1) {
    return { attributes: {}, body: source }
  }

  const frontmatterLines = lines.slice(1, endIndex)
  const body = lines.slice(endIndex + 1).join('\n')
  const attributes = {}
  let currentArrayKey = null

  for (const rawLine of frontmatterLines) {
    const line = rawLine.trimEnd()
    if (!line.trim()) continue

    const arrayMatch = line.match(/^\s*-\s+(.+)$/)
    if (arrayMatch && currentArrayKey) {
      attributes[currentArrayKey].push(arrayMatch[1].trim())
      continue
    }

    const keyValueMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/)
    if (!keyValueMatch) continue

    const key = keyValueMatch[1]
    const value = keyValueMatch[2].trim()
    if (value === '') {
      attributes[key] = []
      currentArrayKey = key
    } else {
      attributes[key] = value
      currentArrayKey = null
    }
  }

  return { attributes, body }
}

function toNumber(value) {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return null
  const parsed = Number.parseInt(value, 10)
  return Number.isNaN(parsed) ? null : parsed
}

function toHeadingId(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u3040-\u30ff\u3400-\u9faf -]/g, '')
    .replace(/\s+/g, '-')
}

function extractToc(markdown) {
  return markdown
    .split('\n')
    .map((line) => line.match(/^(#{1,3})\s+(.+)$/))
    .filter(Boolean)
    .map((match) => ({
      level: match[1].length,
      text: match[2].trim(),
      id: toHeadingId(match[2]),
    }))
}

const articles = Object.entries(rawArticles)
  .map(([path, source]) => {
    const parsed = parseFrontmatter(source)
    const data = parsed.attributes
    const content = parsed.body
    return {
      slug: getSlug(path),
      title: data.title || getSlug(path),
      era: data.era || '未分類',
      people: normalizeArray(data.people),
      tags: normalizeArray(data.tags),
      summary: data.summary || '',
      body: content,
      year: toNumber(data.year),
      toc: extractToc(content),
    }
  })
  .sort((a, b) => {
    const aIdx = ERA_ORDER.indexOf(a.era)
    const bIdx = ERA_ORDER.indexOf(b.era)
    if (aIdx === -1 || bIdx === -1) {
      return a.title.localeCompare(b.title, 'ja')
    }
    return aIdx - bIdx
  })

export function getAllArticles() {
  return articles
}

export function getArticleBySlug(slug) {
  return articles.find((article) => article.slug === slug)
}

export function getEras(items) {
  const unique = [...new Set(items.map((item) => item.era))]
  return unique.sort((a, b) => {
    const aIdx = ERA_ORDER.indexOf(a)
    const bIdx = ERA_ORDER.indexOf(b)
    if (aIdx === -1 && bIdx === -1) return a.localeCompare(b, 'ja')
    if (aIdx === -1) return 1
    if (bIdx === -1) return -1
    return aIdx - bIdx
  })
}

export function getTags(items) {
  const counts = new Map()
  for (const tag of items.flatMap((item) => item.tags)) {
    counts.set(tag, (counts.get(tag) || 0) + 1)
  }

  return [...counts.keys()].sort((a, b) => {
    const aIdx = TAG_ORDER.indexOf(a)
    const bIdx = TAG_ORDER.indexOf(b)
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx
    if (aIdx !== -1) return -1
    if (bIdx !== -1) return 1
    const byCount = (counts.get(b) || 0) - (counts.get(a) || 0)
    if (byCount !== 0) return byCount
    return a.localeCompare(b, 'ja')
  })
}

export function getTimeline(items) {
  return [...items]
    .filter((item) => typeof item.year === 'number')
    .sort((a, b) => a.year - b.year)
}
