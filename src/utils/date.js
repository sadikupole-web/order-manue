/**
 * 日期工具函数
 */

/**
 * 获取今天的日期字符串
 * @returns {string} YYYY-MM-DD 格式
 */
export function getToday() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 自然中文日期格式化（如 "9月3日 星期四"）
 * @param {string} dateStr - YYYY-MM-DD 或 ISO 字符串
 * @returns {string} 自然亲切的中文日期
 */
export function formatDateNatural(dateStr) {
  if (!dateStr) return '某一天'

  try {
    const cleanStr = String(dateStr).split('T')[0]
    const parts = cleanStr.split('-')
    if (parts.length < 3) return dateStr

    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10)
    const day = parseInt(parts[2], 10)
    const dateObj = new Date(year, month - 1, day)

    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const weekDay = weekDays[dateObj.getDay()]

    return `${month}月${day}日 星期${weekDay}`
  } catch {
    return dateStr
  }
}

/**
 * 判断是否是今天
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isToday(dateStr) {
  if (!dateStr) return false
  const cleanStr = String(dateStr).split('T')[0]
  return cleanStr === getToday()
}

/**
 * 格式化友好时间文案
 * @param {string} dateStr - YYYY-MM-DD 格式的日期
 * @returns {string} 友好的日期文案
 */
export function formatDate(dateStr) {
  const today = getToday()
  if (dateStr === today) return '今天'

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  if (dateStr === yesterdayStr) return '昨天'

  return formatDateNatural(dateStr)
}

/**
 * 格式化时间戳为提交时间（HH:MM 格式，不暴露底层长串）
 * @param {string} isoString - ISO 时间戳
 * @returns {string} HH:MM 格式
 */
export function formatTime(isoString) {
  if (!isoString) return ''
  try {
    const date = new Date(isoString)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  } catch {
    return ''
  }
}
