import styles from './FloatingActionBar.module.css'

/**
 * 首页底部已选菜品浮动栏
 * 浮动在 TabBar 之上，当已选菜品 > 0 时显示
 */
export default function FloatingActionBar({ selectedCount, onViewMenu }) {
  if (selectedCount <= 0) return null

  return (
    <div className={styles.floatingContainer}>
      <div className={styles.bar}>
        {/* 左侧提示文案 */}
        <div className={styles.infoArea}>
          <span className={styles.badgeIcon}>🍽️</span>
          <div className={styles.textWrapper}>
            <span className={styles.countText}>
              今晚已经选了 <strong className={styles.highlight}>{selectedCount}</strong> 道菜
            </span>
          </div>
        </div>

        {/* 右侧动作按钮 */}
        <button
          type="button"
          className={styles.viewBtn}
          onClick={onViewMenu}
          aria-label="看看今晚菜单"
        >
          <span>看看今晚菜单</span>
          <span className={styles.arrow}>➔</span>
        </button>
      </div>
    </div>
  )
}
