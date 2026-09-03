/**
 * 分享链接编解码、微信文本生成与剪贴板工具
 * 纯前端运行，零后端依赖
 */

/**
 * 将菜单数据编码为紧凑、安全、URL-Safe 的 Base64 字符串
 * 针对中文、Emoji 和特殊字符进行安全的 UTF-8 字节流转换
 * @param {Object} data - { version: 1, dishes: string[], note: string }
 * @returns {string} URL-Safe 字符串
 */
export function encodeShareData(data) {
  try {
    const jsonStr = JSON.stringify(data)
    const encoder = new TextEncoder()
    const bytes = encoder.encode(jsonStr)

    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }

    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  } catch (e) {
    console.error('[shareUtils] 编码分享数据失败:', e)
    return ''
  }
}

/**
 * 将 URL-Safe Base64 字符串安全还原为菜单数据
 * @param {string} encodedStr
 * @returns {Object|null}
 */
export function decodeShareData(encodedStr) {
  if (!encodedStr || typeof encodedStr !== 'string') return null

  try {
    let base64 = encodedStr.replace(/-/g, '+').replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }

    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }

    const decoder = new TextDecoder()
    const jsonStr = decoder.decode(bytes)
    const parsed = JSON.parse(jsonStr)

    // 校验基本数据结构健全性
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.dishes)) {
      return null
    }

    return {
      version: parsed.version || 1,
      dishes: parsed.dishes,
      note: typeof parsed.note === 'string' ? parsed.note : '',
      createdAt: parsed.createdAt || Date.now(),
    }
  } catch (e) {
    console.warn('[shareUtils] 解码分享链接失败 (可能链接被截断或损坏):', e)
    return null
  }
}

/**
 * 生成完整的分享访问 URL
 * @param {Object} menuPayload - { dishes: string[], note: string }
 * @returns {string} 完整的分享链接
 */
export function generateShareUrl({ dishes = [], note = '' }) {
  const payload = {
    version: 1,
    dishes: dishes.map(d => (typeof d === 'string' ? d : (d.id || d.dishId))).filter(Boolean),
    note: (note || '').trim(),
    createdAt: Date.now(),
  }

  const encoded = encodeShareData(payload)
  const origin = window.location.origin
  const pathname = window.location.pathname

  // 采用 Hash 路由兼容方式，同时在微信中打开极稳定
  return `${origin}${pathname}#/share?m=${encoded}`
}

/**
 * 从当前浏览器的 URL（Hash 或 Search 中）解析分享数据
 * @returns {Object|null}
 */
export function getShareDataFromCurrentUrl() {
  if (typeof window === 'undefined') return null

  let encoded = ''

  // 1. 优先从 Hash 参数中匹配，如 #/share?m=xxxxx
  const hash = window.location.hash
  const hashMatch = hash.match(/[?&](?:m|menu)=([^&]+)/)
  if (hashMatch && hashMatch[1]) {
    encoded = hashMatch[1]
  }

  // 2. 次级从 Search 参数中匹配，如 ?menu=xxxxx
  if (!encoded) {
    const search = window.location.search
    const searchMatch = search.match(/[?&](?:m|menu)=([^&]+)/)
    if (searchMatch && searchMatch[1]) {
      encoded = searchMatch[1]
    }
  }

  if (!encoded) return null

  return decodeShareData(decodeURIComponent(encoded))
}

/**
 * 生成适合直接粘贴发在微信聊天里的温馨菜单文字
 * @param {Object} params
 * @param {Array} params.dishes - 菜品对象列表
 * @param {string} params.note - 备注
 * @param {Array} params.shoppingList - 合并后的食材列表
 * @returns {string} 格式化文本
 */
export function generateWechatShareText({ dishes = [], note = '', shoppingList = [] }) {
  const lines = []

  lines.push('❤️ 今晚想吃')
  lines.push('')

  if (dishes.length > 0) {
    dishes.forEach((d, idx) => {
      lines.push(`${idx + 1}. ${d.name || d.dishName}`)
    })
  } else {
    lines.push('（还没挑好菜品～）')
  }

  lines.push('')
  lines.push('备注：')
  lines.push(note ? `${note}～` : '大厨看着做就好啦～')

  if (shoppingList && shoppingList.length > 0) {
    lines.push('')
    lines.push('🛒 需要准备')
    lines.push('')
    shoppingList.forEach(item => {
      lines.push(`${item.name} ${item.displayText}`)
    })
  }

  return lines.join('\n')
}

/**
 * 跨浏览器安全复制文字到剪贴板
 * 兼容 iOS Safari、Android Chrome 与微信内置浏览器
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  if (!text) return false

  // 1. 优先使用现代标准的 Clipboard API
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // 部分浏览器（如微信未授权或非 HTTPS 环境）可能被拦截，继续执行 fallback
    }
  }

  // 2. 传统兼容 fallback (通过 textarea + execCommand)
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    // 隐藏文本域，防止在 iOS 上引发视口跳动
    textArea.style.position = 'fixed'
    textArea.style.top = '0'
    textArea.style.left = '-9999px'
    textArea.style.opacity = '0'
    textArea.setAttribute('readonly', '')
    document.body.appendChild(textArea)

    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)
    return successful
  } catch (err) {
    console.error('[shareUtils] 复制到剪贴板完全失败:', err)
    return false
  }
}

/**
 * 尝试唤起系统分享面板 (Web Share API)
 * @param {Object} params - { title, text, url }
 * @returns {Promise<boolean>} 是否成功唤起系统分享
 */
export async function shareViaSystem({ title = '今晚想吃这些 ❤️', text = '', url = '' }) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      })
      return true
    } catch (e) {
      // 用户取消分享或系统不支持特定参数
      if (e.name === 'AbortError') {
        return true // 用户主动取消也视为已触发
      }
      return false
    }
  }
  return false
}
