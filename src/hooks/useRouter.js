/**
 * 简易客户端 Hash 路由 Hook
 * 支持 Hash 路由与分享参数自动检测
 */
import { useState, useEffect, useCallback } from 'react'

function getRoute() {
  if (typeof window === 'undefined') return '/'

  // 1. 如果 Query 参数中含有 menu 或 m，自动视为分享页面
  if (window.location.search && /[?&](?:m|menu)=/.test(window.location.search)) {
    return '/share'
  }

  // 2. 正常获取 Hash 路由路径
  const rawHash = window.location.hash.slice(1)
  if (!rawHash) return '/'

  const path = rawHash.split('?')[0]
  return path || '/'
}

export function useRouter() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    const handler = () => setRoute(getRoute())
    window.addEventListener('hashchange', handler)
    window.addEventListener('popstate', handler)
    return () => {
      window.removeEventListener('hashchange', handler)
      window.removeEventListener('popstate', handler)
    }
  }, [])

  const navigate = useCallback((path) => {
    window.location.hash = path
  }, [])

  return { route, navigate }
}
