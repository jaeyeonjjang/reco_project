// src/api.js
// 목적: 프론트에서 백엔드 API 호출을 모듈로 정리.
export const apiBase = (typeof window !== 'undefined' && window?.VITE_API_BASE) || (import.meta.env.VITE_API_BASE ?? 'http://localhost:8000')

async function jget(path) {
  const res = await fetch(`${apiBase}${path}`)
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

async function jpost(path, body) {
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error('HTTP ' + res.status)
  return res.json()
}

export const getWorks = () => jget('/api/works')
export const addWork = (data) => jpost('/api/works', data)
export const getReviews = (id) => jget(`/api/works/${id}/reviews`)
export const addReview = (id, data) => jpost(`/api/works/${id}/reviews`, data)
export const getRecs = () => jget('/api/recommendations')
