import styles from './TabBar.module.css'
import { TABS } from '../../utils/constants'

export default function TabBar({ currentRoute, onNavigate }) {
  return (
    <nav className={styles.tabBar}>
      {TABS.map(tab => (
        <button
          key={tab.key}
          className={`${styles.tab} ${currentRoute === tab.key ? styles.active : ''}`}
          onClick={() => onNavigate(tab.key)}
        >
          <span className={styles.emoji}>{tab.emoji}</span>
          <span className={styles.label}>{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}
