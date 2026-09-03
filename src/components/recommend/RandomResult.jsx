import styles from './RandomResult.module.css'
import DishCard from '../dish/DishCard'

export default function RandomResult({ dishes, onToggleDish, isDishSelected }) {
  if (!dishes || dishes.length === 0) return null

  return (
    <div className={styles.result}>
      <p className={styles.hint}>✨ 今天就吃这些怎么样？</p>
      <div className={styles.cards}>
        {dishes.map(dish => (
          <DishCard
            key={dish.id}
            dish={dish}
            isSelected={isDishSelected(dish.id)}
            onToggle={onToggleDish}
          />
        ))}
      </div>
    </div>
  )
}
