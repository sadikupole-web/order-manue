import { useState } from 'react'
import styles from './DishCard.module.css'
import Tag from '../common/Tag'
import { DIFFICULTY_LABELS } from '../../utils/constants'

export default function DishCard({ dish, isSelected, onToggle }) {
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  const gradientVar = `var(--color-cat-${dish.category})`
  const cookingTime = dish.cookingTime || dish.cookTime || 15

  const handleActionClick = (e) => {
    e.stopPropagation()
    onToggle(dish.id)
  }

  return (
    <div
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
      onClick={() => onToggle(dish.id)}
    >
      {/* 菜品图片区 */}
      <div className={styles.imageWrapper} style={{ background: gradientVar }}>
        {/* 底层 Emoji 占位 */}
        <span className={styles.placeholderEmoji}>{dish.emoji || '🍽️'}</span>

        {/* 实际图片 */}
        {dish.image && !imgError && (
          <img
            src={dish.image}
            alt={dish.name}
            loading="lazy"
            decoding="async"
            draggable="false"
            className={`${styles.image} ${imgLoaded ? styles.imageVisible : ''}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {/* 烹饪时间徽章 */}
        <div className={styles.timeBadge}>
          <span>⏱️ {cookingTime}分钟</span>
        </div>
      </div>

      {/* 菜品详情区 */}
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h3 className={styles.name}>{dish.name}</h3>
        </div>

        {/* 难度与时间 */}
        <div className={styles.meta}>
          <span className={styles.difficulty}>
            {DIFFICULTY_LABELS[dish.difficulty] || dish.difficulty}
          </span>
          <span className={styles.dot}>·</span>
          <span>{cookingTime}分钟</span>
        </div>

        {/* 1~2 个温馨标签 */}
        {dish.tags && dish.tags.length > 0 && (
          <div className={styles.tags}>
            {dish.tags.slice(0, 2).map(tag => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        )}

        {/* 底部加入按钮区 */}
        <div className={styles.actionRow}>
          <button
            type="button"
            className={`${styles.actionBtn} ${isSelected ? styles.btnSelected : styles.btnUnselected}`}
            onClick={handleActionClick}
            aria-label={isSelected ? '取消选择' : '加入今晚菜单'}
          >
            {isSelected ? (
              <span className={styles.btnContent}>
                <span className={styles.iconCheck}>✓</span>
                <span className={styles.btnText}>已加入</span>
              </span>
            ) : (
              <span className={styles.btnContent}>
                <span className={styles.iconPlus}>＋</span>
                <span className={styles.btnText}>加入</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
