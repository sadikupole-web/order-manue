import { useState, useCallback } from 'react'
import PageHeader from '../components/common/PageHeader'
import RandomResult from '../components/recommend/RandomResult'
import RandomButton from '../components/recommend/RandomButton'
import EmptyState from '../components/common/EmptyState'
import { useSelection } from '../context/SelectionContext'
import { getRandomDishes } from '../services/dishService'

export default function RandomPage() {
  const [randomDishes, setRandomDishes] = useState([])
  const { toggleDish, isDishSelected } = useSelection()
  const [hasRolled, setHasRolled] = useState(false)

  const handleRoll = useCallback(() => {
    const dishes = getRandomDishes(3)
    setRandomDishes(dishes)
    setHasRolled(true)
  }, [])

  return (
    <div className="page">
      <PageHeader
        title="🎲 今天吃什么"
        subtitle="选择困难症救星"
      />
      {!hasRolled ? (
        <EmptyState
          emoji="🤷♀️"
          title="不知道吃什么？"
          description="让我来帮你选！"
        />
      ) : (
        <RandomResult
          dishes={randomDishes}
          onToggleDish={toggleDish}
          isDishSelected={isDishSelected}
        />
      )}
      <RandomButton onClick={handleRoll} />
    </div>
  )
}
