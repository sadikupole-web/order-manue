import styles from './PageHeader.module.css'

export default function PageHeader({ title, subtitle, rightAction }) {
  return (
    <header className={styles.header}>
      <div className={styles.titleArea}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {rightAction && <div className={styles.rightAction}>{rightAction}</div>}
    </header>
  )
}
