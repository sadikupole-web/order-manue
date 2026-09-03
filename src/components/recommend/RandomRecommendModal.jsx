import { useState } from 'react'
import { CATEGORIES } from '../../utils/constants.js'
import styles from './RandomRecommendModal.module.css'

/**
 * “今天不知道吃什么”随机推荐弹层
 */
export default function RandomRecommendModal({
  visible,
  recommendedDishes = [],
  onReroll,
  onAccept,
  onClose,
}) {
  const [isRolling, setIsRolling] = useState(false)

  if (!visible) return null

  const handleRerollClick = () => {
    setIsRolling(true)
    onReroll()
    setTimeout(() => {
      setIsRolling(false)
    }, 280)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        {/* 关闭按钮 */}
        <button
          type="button"
          className={styles.closeBtn}
          onClick={onClose}
          aria-label="关闭"
        >
          ✕
        </button>

        {/* 标题区 */}
        <div className={styles.header}>
          <div className={styles.titleIcon}>🎲</div>
          <h3 className={styles.title}>那今晚我来决定 😎</h3>
          <p className={styles.subtitle}>
            为你精选了这 3 道菜，营养均衡不用纠结～
          </p>
        </div>

        {/* 推荐的 3 道菜列表 */}
        <div className={`${styles.dishList} ${isRolling ? styles.dishListRolling : ''}`}>
          {recommendedDishes.map((dish, index) => {
            const catLabel = CATEGORIES.find(c => c.key === dish.category)?.label || '私房'
            const cookingTime = dish.cookingTime || dish.cookTime || 15

            return (
              <div key={dish.id || index} className={styles.dishCard}>
                {/* 缩略图 */}
                <div
                  className={styles.dishThumb}
                  style={{ background: `var(--color-cat-${dish.category || 'meat'})` }}
                >
                  <span className={styles.dishEmoji}>{dish.emoji || '🍽️'}</span>
                  {dish.image && (
                    <img
                      src={dish.image}
                      alt={dish.name}
                      decoding="async"
                      draggable="false"
                      className={styles.dishImg}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                  )}
                </div>

                {/* 菜品信息 */}
                <div className={styles.dishInfo}>
                  <div className={styles.dishNameRow}>
                    <span className={styles.dishName}>{dish.name}</span>
                    <span className={styles.catBadge}>{catLabel}</span>
                  </div>
                  <span className={styles.dishMeta}>⏱️ 约 {cookingTime} 分钟</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 底部按钮组 */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={styles.rerollBtn}
            onClick={handleRerollClick}
          >
            <span className={`${styles.rerollIcon} ${isRolling ? styles.rerollSpin : ''}`}>
              🎲
            </span>
            <span>再换一组</span>
          </button>

          <button
            type="button"
            className={styles.acceptBtn}
            onClick={() => onAccept(recommendedDishes)}
          >
            就吃这些 ❤️
          </button>
        </div>
      </div>
    </div>
  )
}
