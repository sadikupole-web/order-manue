import styles from './FloatingCartBadge.module.css'

export default function FloatingCartBadge({ count, onClick }) {
  if (count === 0) return null

  return (
    <button className={styles.badge} onClick={onClick}>
      <span className={styles.icon}>🍽️</span>
      <span className={styles.count}>{count}</span>
    </button>
  )
}
