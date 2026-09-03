import { useState, useMemo } from 'react'
import PageHeader from '../components/common/PageHeader'
import CategoryTabs from '../components/dish/CategoryTabs'
import DishGrid from '../components/dish/DishGrid'
import FloatingActionBar from '../components/dish/FloatingActionBar'
import RandomRecommendModal from '../components/recommend/RandomRecommendModal'
import Toast from '../components/common/Toast'
import { getAllDishes } from '../services/dishService.js'
import { getCurrentSelection, saveCurrentSelection } from '../services/orderService.js'
import { recommendTonightDishes } from '../utils/recommendAlgorithm.js'
import styles from './HomePage.module.css'

/**
 * 首页 — 今晚想吃什么 ❤️
 */
export default function HomePage({ onNavigate }) {
  const [category, setCategory] = useState('all')

  // 初始化已选菜品 ID 集合（从 localStorage 读取持久化数据）
  const [selectedIds, setSelectedIds] = useState(() => {
    const current = getCurrentSelection()
    return new Set(current?.dishIds || [])
  })

  // 随机推荐弹窗状态
  const [showRecommendModal, setShowRecommendModal] = useState(false)
  const [recommendedDishes, setRecommendedDishes] = useState([])

  // Toast 提示状态
  const [toastInfo, setToastInfo] = useState({
    visible: false,
    emoji: '❤️',
    title: '',
    message: '',
  })

  // 全量菜品（从本地持久化数据同步读取，秒开零延迟）
  const allDishes = useMemo(() => getAllDishes(), [])

  // 打开“今天不知道吃什么”推荐弹窗
  const handleOpenRecommend = () => {
    const picked = recommendTonightDishes(allDishes, 3)
    setRecommendedDishes(picked)
    setShowRecommendModal(true)
  }

  // 弹窗内“再换一组”
  const handleReroll = () => {
    const picked = recommendTonightDishes(allDishes, 3)
    setRecommendedDishes(picked)
  }

  // 弹窗内“就吃这些 ❤️”：直接加入今晚菜单
  const handleAcceptRecommend = (dishesToAccept) => {
    const newIds = new Set(selectedIds)
    dishesToAccept.forEach(d => newIds.add(d.id))

    // 更新当前页面已选状态
    setSelectedIds(newIds)

    // 持久化同步到 localStorage
    const current = getCurrentSelection()
    saveCurrentSelection({
      dishIds: Array.from(newIds),
      note: current?.note || '',
    })

    setShowRecommendModal(false)

    // 弹出温馨提示，随后可平滑导航到今晚菜单确认
    setToastInfo({
      visible: true,
      emoji: '🥳',
      title: '已为你选好啦！',
      message: `「${dishesToAccept.map(d => d.name).join('、')}」已成功加入今晚菜单～`,
    })
  }

  // 当选择发生变化时，持久化同步到 localStorage
  const handleToggleDish = (dishId) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(dishId)) {
        next.delete(dishId)
      } else {
        next.add(dishId)
      }

      // 同步到本地存储
      const current = getCurrentSelection()
      saveCurrentSelection({
        dishIds: Array.from(next),
        note: current?.note || '',
      })

      return next
    })
  }

  const dishes = useMemo(() => {
    if (category === 'all') return allDishes
    return allDishes.filter(d => d.category === category)
  }, [allDishes, category])

  const selectedCount = selectedIds.size

  return (
    <div className={`page ${selectedCount > 0 ? styles.pageWithFloatingBar : ''}`}>
      {/* 顶部标题与副标题 */}
      <PageHeader
        title="今晚想吃什么 ❤️"
        subtitle="看看今天想吃点什么～"
      />

      {/* “今天不知道吃什么” 快捷决策横幅 */}
      <div className={styles.recommendBannerWrapper}>
        <button
          type="button"
          className={styles.recommendBtn}
          onClick={handleOpenRecommend}
        >
          <div className={styles.recommendBtnLeft}>
            <span className={styles.diceIcon}>🎲</span>
            <span className={styles.recommendTitle}>今天不知道吃什么？点我来推荐</span>
          </div>
          <span className={styles.recommendArrow}>帮我挑 ➔</span>
        </button>
      </div>

      {/* 分类横向筛选 */}
      <CategoryTabs
        activeCategory={category}
        onCategoryChange={setCategory}
      />

      {/* 菜品网格展示 */}
      <DishGrid
        dishes={dishes}
        onToggleDish={handleToggleDish}
        isDishSelected={(id) => selectedIds.has(id)}
      />

      {/* 底部已选浮动提示条 */}
      <FloatingActionBar
        selectedCount={selectedCount}
        onViewMenu={() => onNavigate('/tonight')}
      />

      {/* 智能随机推荐弹层 */}
      <RandomRecommendModal
        visible={showRecommendModal}
        recommendedDishes={recommendedDishes}
        onReroll={handleReroll}
        onAccept={handleAcceptRecommend}
        onClose={() => setShowRecommendModal(false)}
      />

      {/* 温馨提示 Toast */}
      <Toast
        visible={toastInfo.visible}
        emoji={toastInfo.emoji}
        title={toastInfo.title}
        message={toastInfo.message}
        onClose={() => setToastInfo(prev => ({ ...prev, visible: false }))}
      />
    </div>
  )
}
