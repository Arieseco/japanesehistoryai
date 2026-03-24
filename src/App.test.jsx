import { describe, expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routes', () => {
  test('renders home with title and article list', () => {
    renderApp('/')
    expect(screen.getByRole('heading', { name: '日本史リファレンス' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '記事一覧' })).toBeInTheDocument()
  })

  test('renders timeline view', () => {
    renderApp('/timeline')
    expect(screen.getByRole('heading', { name: '年表ビュー' })).toBeInTheDocument()
    expect(screen.getByText('1192')).toBeInTheDocument()
  })

  test('renders article page with generated toc', () => {
    renderApp('/articles/kamakura-shogunate')
    expect(
      screen.getByRole('heading', { name: '鎌倉幕府の成立', level: 2 }),
    ).toBeInTheDocument()
    expect(screen.getByText('目次')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '背景' })).toBeInTheDocument()
  })
})
