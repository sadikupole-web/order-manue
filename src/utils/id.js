/**
 * 生成唯一 ID
 * @returns {string} 唯一标识符
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
