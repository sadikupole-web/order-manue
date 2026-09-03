import styles from './Toast.module.css'

/**
 * 温馨提示弹层组件
 * 替代原生 alert，全屏防误触，符合情侣应用设计规范
 */
export default function Toast({
  visible,
  emoji = '👨‍🍳',
  title = '收到啦，今晚交给我 👨‍🍳',
  message = '心愿菜单已送达大厨，稍后为你开饭～',
  onClose,
}) {
  if (!visible) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.emojiWrapper}>
          <span className={styles.emoji}>{emoji}</span>
        </div>
        <h3 className={styles.title}>{title}</h3>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.decorLine}>
          <span className={styles.heart}>❤️</span>
        </div>
      </div>
    </div>
  )
}
