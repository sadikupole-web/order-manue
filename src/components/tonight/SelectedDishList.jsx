import styles from './SelectedDishList.module.css'
import SelectedDishItem from './SelectedDishItem'
import EmptyState from '../common/EmptyState'

export default function SelectedDishList({ dishes, onRemoveDish }) {
  if (!dishes || dishes.length === 0) {
    return (
      <EmptyState
        emoji="🤔"
        title="还没有选菜哦"
        description="回到菜单看看有什么想吃的吧"
      />
    )
  }

  return (
    <div className={styles.list}>
      {dishes.map(dish => (
        <SelectedDishItem
          key={dish.id}
          dish={dish}
          onRemove={onRemoveDish}
        />
      ))}
    </div>
  )
}
