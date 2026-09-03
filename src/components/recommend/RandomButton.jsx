import styles from './RandomButton.module.css'

export default function RandomButton({ onClick }) {
  return (
    <button className={styles.button} onClick={onClick}>
      🎲 换一批
    </button>
  )
}
