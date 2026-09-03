import styles from './DishGrid.module.css'
import DishCard from './DishCard'
import EmptyState from '../common/EmptyState'

export default function DishGrid({ dishes, onToggleDish, isDishSelected }) {
  if (!dishes || dishes.length === 0) {
    return <EmptyState emoji="🍳" title="还没有菜品" description="去厨房添加你的拿手菜吧" />
  }

  return (
    <div className={styles.grid}>
      {dishes.map(dish => (
        <DishCard
          key={dish.id}
          dish={dish}
          isSelected={isDishSelected(dish.id)}
          onToggle={onToggleDish}
        />
      ))}
    </div>
  )
}
