/**
 * 食材采购清单服务
 */
import { mergeIngredients } from '../utils/ingredientMerge.js'

/**
 * 汇总多道菜的食材为采购清单
 * @param {Array} dishes
 * @returns {Array}
 */
export function aggregateIngredients(dishes) {
  return mergeIngredients(dishes)
}

export { mergeIngredients }
