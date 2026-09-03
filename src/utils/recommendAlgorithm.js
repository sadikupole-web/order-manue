/**
 * 智能菜品推荐算法 (Recommend Algorithm)
 *
 * 推荐规则：
 * 1. 不要三道全部是主食
 * 2. 不要三道全部是汤
 * 3. 优先组合：
 *    - 1～2个荤菜/素菜
 *    - 0～1个汤
 *    - 0～1个主食
 * 4. 如果菜品数量不足则合理降级补齐，保证不重复
 */

/**
 * 数组随机洗牌
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 从候选池中抽取指定数量的不重复菜品
 * @param {Array} pool - 候选菜品数组
 * @param {number} count - 需要抽取的数量
 * @param {Set<string>} usedIds - 已经被选中的菜品 ID 集合
 * @returns {Array} 抽取到的菜品
 */
function pickFromPool(pool, count, usedIds) {
  const available = pool.filter(d => !usedIds.has(d.id))
  const shuffled = shuffle(available)
  const picked = shuffled.slice(0, count)
  picked.forEach(d => usedIds.add(d.id))
  return picked
}

/**
 * 随机推荐菜品组合
 * @param {Array} allDishes - 所有可用菜品
 * @param {number} [targetCount=3] - 目标推荐数量
 * @returns {Array} 推荐的菜品列表
 */
export function recommendTonightDishes(allDishes = [], targetCount = 3) {
  if (!Array.isArray(allDishes) || allDishes.length === 0) {
    return []
  }

  // 若菜品总数本就不足或刚好等于目标数，直接洗牌返回
  if (allDishes.length <= targetCount) {
    return shuffle(allDishes)
  }

  // 按分类归类
  const meats = allDishes.filter(d => d.category === 'meat')
  const veggies = allDishes.filter(d => d.category === 'veggie')
  const soups = allDishes.filter(d => d.category === 'soup')
  const staples = allDishes.filter(d => d.category === 'staple')
  const desserts = allDishes.filter(d => d.category === 'dessert')

  // 均衡热菜池（荤菜 + 素菜）
  const mains = [...meats, ...veggies]

  // 经典合理的搭配模板组合（轮巡权重）
  // 模板 1: 1荤 + 1素 + 1汤 (标准两菜一汤)
  // 模板 2: 1荤 + 1素 + 1主食
  // 模板 3: 2荤 + 1素 (丰盛硬菜)
  // 模板 4: 1荤(或素) + 1汤 + 1主食
  // 模板 5: 2荤(或素) + 1甜品
  const plans = [
    { name: '荤素汤', steps: [{ pool: meats, count: 1 }, { pool: veggies, count: 1 }, { pool: soups, count: 1 }] },
    { name: '荤素饭', steps: [{ pool: meats, count: 1 }, { pool: veggies, count: 1 }, { pool: staples, count: 1 }] },
    { name: '双荤一素', steps: [{ pool: meats, count: 2 }, { pool: veggies, count: 1 }] },
    { name: '一热一汤一主食', steps: [{ pool: mains, count: 1 }, { pool: soups, count: 1 }, { pool: staples, count: 1 }] },
    { name: '两热一甜', steps: [{ pool: mains, count: 2 }, { pool: desserts, count: 1 }] },
  ]

  // 随机挑一个搭配模板
  const chosenPlan = plans[Math.floor(Math.random() * plans.length)]
  const usedIds = new Set()
  const result = []

  // 按模板逐步抽取
  for (const step of chosenPlan.steps) {
    if (result.length >= targetCount) break
    const needed = Math.min(step.count, targetCount - result.length)
    const picked = pickFromPool(step.pool, needed, usedIds)
    result.push(...picked)
  }

  // 降级兜底机制：若因某分类菜品不足导致未满 3 道，从剩余未选菜品中补齐
  if (result.length < targetCount) {
    // 限制主食和汤的数量，避免三道全是主食或全是汤
    const currentStapleCount = result.filter(d => d.category === 'staple').length
    const currentSoupCount = result.filter(d => d.category === 'soup').length

    // 优先补荤菜/素菜，最后补其他
    const fallbackPool = shuffle(
      allDishes.filter(d => {
        if (usedIds.has(d.id)) return false
        // 若已有主食，且再加就超过 1 个，尽量不加主食
        if (d.category === 'staple' && currentStapleCount >= 1) return false
        // 若已有汤，且再加就超过 1 个，尽量不加汤
        if (d.category === 'soup' && currentSoupCount >= 1) return false
        return true
      })
    )

    for (const d of fallbackPool) {
      if (result.length >= targetCount) break
      result.push(d)
      usedIds.add(d.id)
    }

    // 若依然不足（极端情况：比如全部是主食或汤），取任意剩余不重复菜品补齐
    if (result.length < targetCount) {
      const anyRemaining = shuffle(allDishes.filter(d => !usedIds.has(d.id)))
      for (const d of anyRemaining) {
        if (result.length >= targetCount) break
        result.push(d)
        usedIds.add(d.id)
      }
    }
  }

  // 确保最终结果严格不超过 3 道且不重复
  return result.slice(0, targetCount)
}
