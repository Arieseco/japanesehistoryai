# 日本史リファレンスサイト (初期テンプレート)

React + Vite + React Router で構成した、日本史リファレンスサイトの初期実装です。  
Markdown(frontmatter) で記事を管理し、Fuse.js でクライアント検索できます。

## 技術スタック
- React
- Vite
- React Router
- CSS Modules
- marked
- Fuse.js
- GitHub Pages (GitHub Actions)

## セットアップ
```bash
npm install
npm run dev
```

## テスト
```bash
# 単体/コンポーネントテスト
npm run test

# ブラウザE2Eテスト
npm run test:e2e
```

## 記事追加
`content/*.md` に以下形式で追加します。

```md
---
title: 記事タイトル
era: 時代
people:
  - 人物名
tags:
  - タグ
summary: 概要
year: 西暦年
---

# 本文
```

## GitHub Pages デプロイ
`main` ブランチへの push で `.github/workflows/deploy-pages.yml` が実行されます。  
GitHub 側で Pages の Build and deployment を **GitHub Actions** に設定してください。

## ドキュメント
- 要件定義: `docs/requirements.md`
- 基本設計: `docs/basic-design.md`

## 追加ビュー
- ` /timeline `: `year` を使った年表ビュー
- 記事詳細: 見出し (`##`, `###`) から目次を自動生成
