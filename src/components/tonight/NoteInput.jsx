import { useRef } from 'react'
import styles from './NoteInput.module.css'

/**
 * 备注输入框
 * 支持 iOS/Android 软键盘弹起居中及收起后的视口安全复位
 */
export default function NoteInput({ value = '', onChange, maxLength = 150 }) {
  const currentLen = (value || '').length
  const textareaRef = useRef(null)

  const handleFocus = () => {
    // 延迟 280ms 等待软键盘完全顶起后，将输入框安全对齐到可视区中部
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 280)
  }

  const handleBlur = () => {
    // 修复 iOS Safari 键盘收起后视口偶尔不回弹导致页面底部大块灰白区域的 bug
    setTimeout(() => {
      window.scrollTo(0, window.scrollY)
    }, 100)
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <label className={styles.label}>
          <span className={styles.icon}>💌</span>
          <span>有什么想跟我说的吗？</span>
        </label>
        <span className={`${styles.counter} ${currentLen >= maxLength ? styles.counterLimit : ''}`}>
          {currentLen}/{maxLength}
        </span>
      </div>

      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="比如：排骨辣一点、今天不想吃太咸～"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={3}
          maxLength={maxLength}
        />
      </div>
    </div>
  )
}
