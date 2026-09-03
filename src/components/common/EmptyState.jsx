import styles from './EmptyState.module.css'

export default function EmptyState({ emoji = '🍽️', title, description }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emoji}>{emoji}</span>
      <p className={styles.title}>{title}</p>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  )
}
