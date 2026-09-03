/**
 * 菜单/订单服务 (Order Service)
 * 纯本地运行，零后端依赖，完全基于 localStorage 持久化
 */
import { STORAGE_KEYS } from '../utils/constants.js'
import { generateId } from '../utils/id.js'
import { getToday } from '../utils/date.js'
import { getItem, setItem, removeItem } from './storage.js'

/**
 * 获取当前选择（未提交的草稿）
 */
export function getCurrentSelection() {
  const defaultVal = { dishIds: [], note: '' }
  const data = getItem(STORAGE_KEYS.CURRENT_SELECTION, defaultVal)
  if (!data || typeof data !== 'object') return defaultVal
  return {
    dishIds: Array.isArray(data.dishIds) ? data.dishIds.filter(Boolean) : [],
    note: typeof data.note === 'string' ? data.note : '',
  }
}

/**
 * 保存当前选择
 */
export function saveCurrentSelection(selection) {
  if (!selection || typeof selection !== 'object') {
    removeItem(STORAGE_KEYS.CURRENT_SELECTION)
    return
  }
  const cleanData = {
    dishIds: Array.isArray(selection.dishIds) ? selection.dishIds.filter(Boolean) : [],
    note: typeof selection.note === 'string' ? selection.note.trim() : '',
  }
  setItem(STORAGE_KEYS.CURRENT_SELECTION, cleanData)
}

/**
 * 清空当前选择
 */
export function clearCurrentSelection() {
  removeItem(STORAGE_KEYS.CURRENT_SELECTION)
}

/**
 * 提交今晚菜单并追加到本地历史
 * @param {Array} dishes - 菜品对象列表
 * @param {string} note - 备注
 * @returns {Promise<Object>} 提交的完整菜单对象
 */
export async function submitTonightOrder(dishes = [], note = '') {
  const safeDishes = Array.isArray(dishes) ? dishes.filter(Boolean) : []
  const newOrder = {
    id: generateId(),
    date: getToday(),
    dishes: safeDishes.map(d => ({
      dishId: d.id || d.dishId || generateId(),
      dishName: d.name || d.dishName || '美味佳肴',
      image: d.image || null,
      emoji: d.emoji || '🍽️',
      cookingTime: d.cookingTime || d.cookTime || 15,
      difficulty: d.difficulty || 'easy',
      category: d.category || 'meat',
      ingredients: Array.isArray(d.ingredients) ? d.ingredients : [],
    })),
    note: typeof note === 'string' ? note.trim() : '',
    status: 'submitted',
    checkedIngredients: [],
    submittedAt: new Date().toISOString(),
  }

  // 1. 保存到今晚菜单
  setItem(STORAGE_KEYS.TONIGHT_ORDER, newOrder)

  // 2. 追加到历史记录
  const history = getHistory()
  history.unshift(newOrder)
  setItem(STORAGE_KEYS.HISTORY, history)

  // 3. 清空未提交的草稿暂存
  clearCurrentSelection()

  return newOrder
}

/**
 * 将分享的菜单保存到当前设备的历史菜单中 (避免重复保存)
 * @param {Object} menuOrder - { dishes: Array, note: string, date?: string }
 * @returns {boolean} 是否成功新增保存
 */
export function saveSharedMenuToHistory(menuOrder) {
  if (!menuOrder || !Array.isArray(menuOrder.dishes) || menuOrder.dishes.length === 0) {
    return false
  }

  const history = getHistory()
  const today = getToday()

  // 检查是否在今天已经保存过完全相同的菜品组合，避免重复点击
  const isDuplicate = history.some(item => {
    if (item.date !== today) return false
    const currentIds = (item.dishes || []).map(d => d.dishId || d.id).sort().join(',')
    const newIds = menuOrder.dishes.map(d => d.dishId || d.id).sort().join(',')
    return currentIds === newIds
  })

  if (isDuplicate) {
    return false // 已存在相同记录
  }

  const orderRecord = {
    id: generateId(),
    date: today,
    dishes: menuOrder.dishes.map(d => ({
      dishId: d.id || d.dishId,
      dishName: d.name || d.dishName || '美味佳肴',
      image: d.image || null,
      emoji: d.emoji || '🍽️',
      cookingTime: d.cookingTime || d.cookTime || 15,
      difficulty: d.difficulty || 'easy',
      category: d.category || 'meat',
      ingredients: Array.isArray(d.ingredients) ? d.ingredients : [],
    })),
    note: typeof menuOrder.note === 'string' ? menuOrder.note.trim() : '',
    status: 'completed',
    submittedAt: new Date().toISOString(),
  }

  history.unshift(orderRecord)
  setItem(STORAGE_KEYS.HISTORY, history)
  return true
}

/**
 * 获取今晚菜单
 */
export function getTonightOrder() {
  const order = getItem(STORAGE_KEYS.TONIGHT_ORDER, null)
  if (!order || typeof order !== 'object' || !Array.isArray(order.dishes)) {
    return null
  }
  return order
}

/**
 * 异步获取今晚菜单（保持接口兼容）
 */
export async function fetchTonightOrder() {
  return getTonightOrder()
}

/**
 * 更新采购勾选状态 (持久化存储在当前设备 localStorage)
 */
export async function updateCheckedIngredients(orderId, checkedList = []) {
  const localKey = orderId ? `coupleMenu_shopping_checked_${orderId}` : 'coupleMenu_shopping_checked'
  setItem(localKey, checkedList)

  const tonight = getTonightOrder()
  if (tonight && (tonight.id === orderId || !orderId)) {
    tonight.checkedIngredients = checkedList
    setItem(STORAGE_KEYS.TONIGHT_ORDER, tonight)
  }
}

/**
 * 更新菜单状态 (如 'cooking')
 */
export async function updateOrderStatus(orderId, status) {
  const tonight = getTonightOrder()
  if (tonight && tonight.id === orderId) {
    tonight.status = status
    setItem(STORAGE_KEYS.TONIGHT_ORDER, tonight)
  }
}

/**
 * 清除今晚菜单
 */
export function clearTonightOrder() {
  removeItem(STORAGE_KEYS.TONIGHT_ORDER)
}

/**
 * 获取历史菜单列表
 */
export function getHistory() {
  const list = getItem(STORAGE_KEYS.HISTORY, [])
  return Array.isArray(list) ? list.filter(item => item && typeof item === 'object') : []
}

/**
 * 异步获取历史菜单（保持接口兼容）
 */
export async function fetchHistory() {
  return getHistory()
}
