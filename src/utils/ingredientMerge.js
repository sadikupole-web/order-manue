/**
 * 食材合并工具函数 (Ingredient Merge Utility)
 * 用于将多道菜品中的食材进行规范化解析与数量合并
 */

/**
 * 解析用量与单位
 * 兼顾纯数字+单位对象，以及如 "500g", "2个", "适量" 等字符串
 * @param {number|string} rawAmount - 原始数量
 * @param {string} [rawUnit] - 原始单位
 * @returns {{ amount: number|null, unit: string, isVague: boolean, text: string }}
 */
export function parseIngredientAmount(rawAmount, rawUnit = '') {
  // 1. 如果 rawAmount 已经是数值
  if (typeof rawAmount === 'number' && !isNaN(rawAmount)) {
    const cleanUnit = (rawUnit || '').trim()
    return {
      amount: rawAmount,
      unit: cleanUnit,
      isVague: false,
      text: `${rawAmount}${cleanUnit}`,
    }
  }

  const str = String(rawAmount || '').trim()

  // 2. 检查模糊量词（如适量、少许、若干）
  const vagueKeywords = ['适量', '少许', '若干', '少许点缀', '随心']
  if (vagueKeywords.some(kw => str.includes(kw))) {
    return {
      amount: null,
      unit: str,
      isVague: true,
      text: str,
    }
  }

  // 3. 正则提取数字与单位 (例如 "500g", "2.5个", "10 只")
  const match = str.match(/^([\d.]+)\s*(.*)$/)
  if (match) {
    const num = parseFloat(match[1])
    const unit = (match[2] || rawUnit || '').trim()
    return {
      amount: isNaN(num) ? null : num,
      unit: unit,
      isVague: false,
      text: `${num}${unit}`,
    }
  }

  // 4. 其他无法提取出纯数字的情况
  return {
    amount: null,
    unit: str || rawUnit || '',
    isVague: true,
    text: str || rawUnit || '适量',
  }
}

/**
 * 格式化数值，避免浮点数精度误差 (例如 0.1 + 0.2 = 0.3)
 * @param {number} num
 * @returns {number}
 */
function cleanNumber(num) {
  return Math.round(num * 100) / 100
}

/**
 * 将多道菜品的食材合并为采购清单
 * @param {Array<Object>} dishes - 菜品列表，每个菜品包含 name 与 ingredients
 * @returns {Array<{
 *   name: string,
 *   amount: number|null,
 *   unit: string,
 *   displayText: string,
 *   isVague: boolean,
 *   fromDishes: string[]
 * }>} 合并后的采购清单
 */
export function mergeIngredients(dishes = []) {
  if (!Array.isArray(dishes) || dishes.length === 0) {
    return []
  }

  const map = new Map()

  for (const dish of dishes) {
    const dishName = dish.name || dish.dishName || '菜品'
    const ingredients = dish.ingredients || []

    for (const item of ingredients) {
      if (!item || !item.name) continue

      const name = String(item.name).trim()
      const parsed = parseIngredientAmount(item.amount, item.unit)

      if (map.has(name)) {
        const existing = map.get(name)

        // 记录来源菜品（去重）
        if (!existing.fromDishes.includes(dishName)) {
          existing.fromDishes.push(dishName)
        }

        // 单位相同且都是明确数值：合并累加
        if (
          !existing.isVague &&
          !parsed.isVague &&
          existing.amount !== null &&
          parsed.amount !== null &&
          existing.unit === parsed.unit
        ) {
          existing.amount = cleanNumber(existing.amount + parsed.amount)
          existing.displayText = `${existing.amount}${existing.unit}`
        } else if (existing.isVague && parsed.isVague) {
          // 双方都是模糊量词，保留一份
          existing.displayText = existing.unit || parsed.unit || '适量'
        } else if (!existing.isVague && parsed.isVague) {
          // 一个是具体数值，一个是模糊用量，保留具体数值
          existing.displayText = `${existing.amount}${existing.unit}`
        } else if (existing.isVague && !parsed.isVague) {
          // 变成具体数值
          existing.amount = parsed.amount
          existing.unit = parsed.unit
          existing.isVague = false
          existing.displayText = `${parsed.amount}${parsed.unit}`
        } else {
          // 单位不同且无法相加（如 500g 与 1盒），用 + 连接
          existing.displayText = `${existing.displayText} + ${parsed.text}`
        }
      } else {
        map.set(name, {
          name,
          amount: parsed.amount,
          unit: parsed.unit,
          displayText: parsed.text,
          isVague: parsed.isVague,
          fromDishes: [dishName],
        })
      }
    }
  }

  return Array.from(map.values())
}
