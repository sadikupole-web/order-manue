import styles from './SubmitButton.module.css'

/**
 * 今晚菜单页面底部提交主按钮
 */
export default function SubmitButton({
  onClick,
  disabled = false,
  isSubmitting = false,
  children = '就吃这些 ❤️',
}) {
  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.button} ${isSubmitting ? styles.buttonSubmitting : ''}`}
        onClick={onClick}
        disabled={disabled || isSubmitting}
      >
        {isSubmitting ? (
          <span className={styles.submittingContent}>
            <span className={styles.spinner} />
            <span>正在发送心愿...</span>
          </span>
        ) : (
          children
        )}
      </button>
    </div>
  )
}
