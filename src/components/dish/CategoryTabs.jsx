import styles from './CategoryTabs.module.css'
import { CATEGORIES } from '../../utils/constants'

export default function CategoryTabs({ activeCategory, onCategoryChange }) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.scrollArea}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`${styles.tab} ${activeCategory === cat.key ? styles.active : ''}`}
            onClick={() => onCategoryChange(cat.key)}
          >
            <span className={styles.emoji}>{cat.emoji}</span>
            <span className={styles.label}>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
