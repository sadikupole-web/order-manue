import { useState } from 'react'
import styles from './SelectedDishItem.module.css'

/**
 * 今晚菜单中的单道已选菜品项
 * 显示：图片、菜名、制作时间、删除按钮
 */
export default function SelectedDishItem({ dish, onRemove }) {
  const [imgError, setImgError] = useState(false)
  const cookingTime = dish.cookingTime || dish.cookTime || 15
  const gradientVar = `var(--color-cat-${dish.category || 'meat'})`

  return (
    <div className={styles.item}>
      {/* 菜品缩略图区 */}
      <div className={styles.thumbWrapper} style={{ background: gradientVar }}>
        <span className={styles.thumbEmoji}>{dish.emoji || '🍽️'}</span>
        {dish.image && !imgError && (
          <img
            src={dish.image}
            alt={dish.name}
            decoding="async"
            draggable="false"
            className={styles.thumbImg}
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* 菜品文字信息 */}
      <div className={styles.info}>
        <span className={styles.name}>{dish.name}</span>
        <span className={styles.time}>⏱️ 制作约 {cookingTime} 分钟</span>
      </div>

      {/* 删除按钮 */}
      <button
        type="button"
        className={styles.removeBtn}
        onClick={() => onRemove(dish.id)}
        aria-label={`移除 ${dish.name}`}
        title="移除"
      >
        <span className={styles.removeIcon}>✕</span>
      </button>
    </div>
  )
}
