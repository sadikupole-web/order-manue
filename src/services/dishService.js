/**
 * 菜品数据服务 (Dishes Service)
 * 纯本地运行，零后端依赖，使用 localStorage 进行健壮持久化
 */
import { STORAGE_KEYS } from '../utils/constants.js'
import { generateId } from '../utils/id.js'
import { getItem, setItem } from './storage.js'
import { sampleDishes } from '../data/sampleDishes.js'

/**
 * 校验单道菜品结构是否健全
 */
function isValidDish(dish) {
  return (
    dish &&
    typeof dish === 'object' &&
    typeof dish.name === 'string' &&
    dish.name.trim().length > 0 &&
    typeof dish.id === 'string'
  )
}

/**
 * 恢复默认预置菜品数据
 */
export function restoreDefaultDishes() {
  const freshDishes = JSON.parse(JSON.stringify(sampleDishes))
  setItem(STORAGE_KEYS.DISHES, freshDishes)
  return freshDishes
}

/**
 * 获取所有菜品（首次启动自动初始化默认菜品，已有用户数据绝不覆盖）
 * @returns {Array} 菜品列表
 */
export function getAllDishes() {
  const dishes = getItem(STORAGE_KEYS.DISHES, null)

  // 若尚未初始化或被完全清空，载入默认菜品
  if (!dishes || !Array.isArray(dishes) || dishes.length === 0) {
    return restoreDefaultDishes()
  }

  // 健全性检查：确保数据有效
  const validDishes = dishes.filter(isValidDish)
  if (validDishes.length === 0) {
    return restoreDefaultDishes()
  }

  if (validDishes.length !== dishes.length) {
    setItem(STORAGE_KEYS.DISHES, validDishes)
  }

  return validDishes
}

/**
 * 同步获取/刷新菜品列表
 * 保持兼容性返回 Promise
 */
export async function fetchDishes() {
  return getAllDishes()
}

/**
 * 根据 ID 获取菜品
 */
export function getDishById(id) {
  if (!id) return null
  const dishes = getAllDishes()
  return dishes.find(d => d.id === id) || null
}

/**
 * 按分类筛选菜品
 */
export function getDishesByCategory(category) {
  const dishes = getAllDishes()
  if (!category || category === 'all') return dishes
  return dishes.filter(d => d.category === category)
}

/**
 * 新增菜品
 */
export async function addDish(dishData) {
  const dishes = getAllDishes()
  const newDish = {
    ...dishData,
    id: generateId(),
    createdAt: new Date().toISOString().split('T')[0],
  }
  dishes.push(newDish)
  setItem(STORAGE_KEYS.DISHES, dishes)
  return newDish
}

/**
 * 更新菜品
 */
export async function updateDish(id, updates) {
  if (!id || !updates) return null
  const dishes = getAllDishes()
  const index = dishes.findIndex(d => d.id === id)
  if (index === -1) return null

  dishes[index] = { ...dishes[index], ...updates }
  setItem(STORAGE_KEYS.DISHES, dishes)
  return dishes[index]
}

/**
 * 删除菜品
 */
export async function deleteDish(id) {
  if (!id) return false
  const dishes = getAllDishes()
  const filtered = dishes.filter(d => d.id !== id)
  if (filtered.length === dishes.length) return false
  setItem(STORAGE_KEYS.DISHES, filtered)
  return true
}

/**
 * 随机推荐菜品
 */
export function getRandomDishes(count = 3) {
  const dishes = getAllDishes()
  if (dishes.length <= count) return [...dishes]
  const shuffled = [...dishes].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
