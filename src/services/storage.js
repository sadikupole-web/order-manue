/**
 * localStorage 通用读写封装
 * 提供完备的异常保护、Safari 无痕浏览模式降级机制及数据自愈能力
 */

// 内存降级存储（用于 Safari 无痕模式或 WebView 禁用 Storage 的极端场景）
const memoryStorage = new Map()

/**
 * 检测 localStorage 是否可用
 * @returns {boolean}
 */
function checkStorageAvailable() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false
    }
    const testKey = '__storage_test__'
    window.localStorage.setItem(testKey, '1')
    window.localStorage.removeItem(testKey)
    return true
  } catch {
    return false
  }
}

const isAvailable = checkStorageAvailable()

/**
 * 从 localStorage 读取 JSON 数据
 * @param {string} key - 存储键名
 * @param {*} defaultValue - 默认值
 * @returns {*} 解析后的数据
 */
export function getItem(key, defaultValue = null) {
  try {
    if (!isAvailable) {
      return memoryStorage.has(key) ? memoryStorage.get(key) : defaultValue
    }
    const raw = window.localStorage.getItem(key)
    if (raw === null || raw === undefined || raw === '') {
      return defaultValue
    }
    const parsed = JSON.parse(raw)
    return parsed !== null && parsed !== undefined ? parsed : defaultValue
  } catch (e) {
    console.warn(`[CoupleMenu] 读取 localStorage [${key}] 解析失败，已回退默认值:`, e)
    return defaultValue
  }
}

/**
 * 将数据以 JSON 格式写入 localStorage
 * @param {string} key - 存储键名
 * @param {*} value - 要存储的数据
 */
export function setItem(key, value) {
  try {
    if (!isAvailable) {
      memoryStorage.set(key, value)
      return
    }
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.warn(`[CoupleMenu] 写入 localStorage [${key}] 失败，降级写入内存:`, e)
    memoryStorage.set(key, value)
  }
}

/**
 * 删除 localStorage 中的数据
 * @param {string} key - 存储键名
 */
export function removeItem(key) {
  try {
    if (!isAvailable) {
      memoryStorage.delete(key)
      return
    }
    window.localStorage.removeItem(key)
  } catch (e) {
    console.warn(`[CoupleMenu] 删除 localStorage [${key}] 失败:`, e)
    memoryStorage.delete(key)
  }
}

/**
 * 判断本地持久化存储是否健康可用
 * @returns {boolean}
 */
export function isStorageSupported() {
  return isAvailable
}
