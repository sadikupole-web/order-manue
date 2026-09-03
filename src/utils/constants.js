/**
 * 应用常量定义
 */

// 菜品分类
export const CATEGORIES = [
  { key: 'all',     label: '全部',  emoji: '🍱' },
  { key: 'meat',    label: '荤菜',  emoji: '🥩' },
  { key: 'veggie',  label: '素菜',  emoji: '🥬' },
  { key: 'soup',    label: '汤',    emoji: '🍲' },
  { key: 'staple',  label: '主食',  emoji: '🍚' },
  { key: 'dessert', label: '甜品',  emoji: '🍰' },
]

// 难度等级
export const DIFFICULTIES = [
  { key: 'easy',   label: '简单',         emoji: '⭐' },
  { key: 'medium', label: '普通',         emoji: '⭐⭐' },
  { key: 'hard',   label: '稍微费点功夫', emoji: '⭐⭐⭐' },
]

// 分类对应的默认 emoji（用于无图片时的菜品卡片展示）
export const CATEGORY_EMOJIS = {
  meat: '🍖',
  veggie: '🥗',
  soup: '🍲',
  staple: '🍚',
  dessert: '🍰',
}

// 难度标签
export const DIFFICULTY_LABELS = {
  easy: '简单',
  medium: '普通',
  hard: '稍微费点功夫',
}

// localStorage key 前缀
export const STORAGE_KEYS = {
  DISHES: 'coupleMenu_dishes',
  CURRENT_SELECTION: 'coupleMenu_currentSelection',
  TONIGHT_ORDER: 'coupleMenu_tonightOrder',
  HISTORY: 'coupleMenu_history',
}

// Tab 导航配置
export const TABS = [
  { key: '/',         label: '今晚吃什么', emoji: '🍽️' },
  { key: '/tonight',  label: '今晚菜单',   emoji: '📋' },
  { key: '/chef',     label: '做饭',       emoji: '👨‍🍳' },
  { key: '/history',  label: '我们吃过的', emoji: '📖' },
]
