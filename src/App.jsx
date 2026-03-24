import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { marked } from 'marked'
import styles from './App.module.css'
import {
  getAllArticles,
  getArticleBySlug,
  getEras,
  getTags,
  getTimeline,
} from './lib/content'

function Header() {
  return (
    <header className={styles.header}>
      <h1>日本史リファレンス</h1>
      <p>時代・人物・出来事を横断して調べられる学習サイト</p>
    </header>
  )
}

function SearchBox({ articles }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const results = useMemo(() => {
    if (!query) return []
    const fuse = new Fuse(articles, {
      keys: ['title', 'summary', 'era', 'people', 'tags'],
      threshold: 0.35,
    })
    return fuse.search(query, { limit: 8 }).map(({ item }) => item)
  }, [articles, query])

  return (
    <div className={styles.search}>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="キーワード検索（例: 鎌倉, 徳川家康）"
      />
      {results.length > 0 && (
        <ul className={styles.searchResults}>
          {results.map((article) => (
            <li key={article.slug}>
              <button
                type="button"
                onClick={() => {
                  navigate(`/articles/${article.slug}`)
                  setQuery('')
                }}
              >
                {article.title}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Sidebar({ articles }) {
  const eras = getEras(articles)
  const tags = getTags(articles).slice(0, 12)

  return (
    <aside className={styles.sidebar}>
      <h2>時代</h2>
      <ul>
        {eras.map((era) => (
          <li key={era}>
            <NavLink to={`/eras/${encodeURIComponent(era)}`}>{era}</NavLink>
          </li>
        ))}
      </ul>
      <h2>タグ</h2>
      <ul className={styles.tags}>
        {tags.map((tag) => (
          <li key={tag}>
            <NavLink to={`/tags/${encodeURIComponent(tag)}`}>{tag}</NavLink>
          </li>
        ))}
      </ul>
      <h2>ビュー</h2>
      <ul>
        <li>
          <NavLink to="/timeline">年表</NavLink>
        </li>
      </ul>
    </aside>
  )
}

function HomePage({ articles }) {
  return (
    <section className={styles.list}>
      <h2>記事一覧</h2>
      {articles.map((article) => (
        <article key={article.slug} className={styles.card}>
          <h3>
            <Link to={`/articles/${article.slug}`}>{article.title}</Link>
          </h3>
          <p>{article.summary}</p>
          <small>
            {article.era} / {article.people.join(', ')}
          </small>
        </article>
      ))}
    </section>
  )
}

function ArticlePage({ slug }) {
  const article = getArticleBySlug(slug)
  if (!article) {
    return <p>記事が見つかりません。</p>
  }

  const renderer = new marked.Renderer()
  renderer.heading = ({ tokens, depth }) => {
    const text = tokens.map((token) => token.raw).join('').trim()
    const id = text
      .toLowerCase()
      .replace(/[^\w\u3040-\u30ff\u3400-\u9faf -]/g, '')
      .replace(/\s+/g, '-')
    return `<h${depth} id="${id}">${text}</h${depth}>`
  }
  const html = marked.parse(article.body, { renderer })

  return (
    <article className={styles.article}>
      <h2>{article.title}</h2>
      <p className={styles.meta}>
        {article.era} | {article.people.join(', ')} | {article.tags.join(', ')}
      </p>
      {article.toc.length > 0 && (
        <nav className={styles.toc}>
          <strong>目次</strong>
          <ul>
            {article.toc.map((item) => (
              <li key={item.id} className={styles[`tocLevel${item.level}`]}>
                <a href={`#${item.id}`}>{item.text}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  )
}

function EraPage({ articles }) {
  const { era } = useParams()
  const decodedEra = decodeURIComponent(era || '')
  const filtered = articles.filter((article) => article.era === decodedEra)

  return (
    <section className={styles.list}>
      <h2>{decodedEra}</h2>
      {filtered.map((article) => (
        <article key={article.slug} className={styles.card}>
          <h3>
            <Link to={`/articles/${article.slug}`}>{article.title}</Link>
          </h3>
          <p>{article.summary}</p>
        </article>
      ))}
    </section>
  )
}

function TagPage({ articles }) {
  const { tag } = useParams()
  const decodedTag = decodeURIComponent(tag || '')
  const filtered = articles.filter((article) => article.tags.includes(decodedTag))

  return (
    <section className={styles.list}>
      <h2>タグ: {decodedTag}</h2>
      {filtered.map((article) => (
        <article key={article.slug} className={styles.card}>
          <h3>
            <Link to={`/articles/${article.slug}`}>{article.title}</Link>
          </h3>
          <p>{article.summary}</p>
        </article>
      ))}
    </section>
  )
}

function TimelinePage({ articles }) {
  const timeline = getTimeline(articles)
  return (
    <section className={styles.list}>
      <h2>年表ビュー</h2>
      {timeline.length === 0 && <p>year を持つ記事がありません。</p>}
      {timeline.map((article) => (
        <article key={article.slug} className={styles.timelineItem}>
          <div className={styles.timelineYear}>{article.year}</div>
          <div className={styles.timelineBody}>
            <h3>
              <Link to={`/articles/${article.slug}`}>{article.title}</Link>
            </h3>
            <p>{article.summary}</p>
            <small>{article.era}</small>
          </div>
        </article>
      ))}
    </section>
  )
}

function App() {
  const articles = useMemo(() => getAllArticles(), [])

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.layout}>
        <Sidebar articles={articles} />
        <section className={styles.main}>
          <SearchBox articles={articles} />
          <Routes>
            <Route path="/" element={<HomePage articles={articles} />} />
            <Route path="/articles/:slug" element={<ArticleRoute />} />
            <Route path="/eras/:era" element={<EraPage articles={articles} />} />
            <Route path="/tags/:tag" element={<TagPage articles={articles} />} />
            <Route path="/timeline" element={<TimelinePage articles={articles} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  )
}

function ArticleRoute() {
  const { slug } = useParams()
  return <ArticlePage slug={decodeURIComponent(slug || '')} />
}

export default App
