# 基本設計書

## 1. 画面構成
- **ヘッダー**: サイトタイトル、説明文
- **サイドバー**: 時代リンク、タグリンク
- **メイン**:
  - 記事一覧 (`/`)
  - 記事詳細 (`/articles/:slug`)
  - 時代別一覧 (`/eras/:era`)
  - タグ別一覧 (`/tags/:tag`)

## 2. ディレクトリ構成
- `content/`: Markdown 記事本体
- `src/lib/content.js`: frontmatter 解析とデータ整形
- `src/App.jsx`: ルーティングとレイアウト
- `src/App.module.css`: ページスタイル
- `docs/`: 要件定義・設計資料

## 3. データ設計 (frontmatter)
必須に近い項目:
- `title`: 記事タイトル
- `era`: 時代区分
- `summary`: 概要

推奨項目:
- `people`: 関連人物配列
- `tags`: タグ配列

## 4. 処理設計
- `import.meta.glob('/content/*.md', { eager: true, query: '?raw' })` で Markdown を静的取り込み
- 自前 parser で frontmatter と本文に分離
- 記事配列を era 順でソート
- Fuse.js で `title`, `summary`, `era`, `people`, `tags` を検索対象とする
- `marked` で Markdown 本文を HTML 化して表示

## 5. GitHub Pages 配備設計
- `vite.config.js` の `base` を `VITE_BASE_PATH` で制御
- GitHub Actions で build 時に
  - `VITE_BASE_PATH=/<repository-name>/` を設定
  - `dist/` を Pages Artifact としてデプロイ
- これによりリポジトリ名付きサブパスでも正しく動作
