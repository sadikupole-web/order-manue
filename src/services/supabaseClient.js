/**
 * Supabase 客户端配置与初始化
 * 绝不在前端使用 SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from '@supabase/supabase-js'

// 安全读取环境变量（兼顾 Vite 浏览器环境与 Node.js 测试环境）
const env = (typeof import.meta !== 'undefined' && import.meta.env) || (typeof process !== 'undefined' && process.env) || {}
const supabaseUrl = env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || ''
const spaceId = env.VITE_COUPLE_SPACE_ID || 'our_home'

// 检查是否配置了有效的 Supabase 环境变量
const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-id')
)

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null

/**
 * 判断 Supabase 云端服务是否已正确配置就绪
 * @returns {boolean}
 */
export function isSupabaseReady() {
  return Boolean(supabase)
}

/**
 * 获取当前情侣专属空间标识
 * @returns {string}
 */
export function getSpaceId() {
  return spaceId
}
