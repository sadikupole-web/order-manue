import { useState, useMemo } from 'react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import Toast from '../components/common/Toast'
import { getShareDataFromCurrentUrl } from '../utils/shareUtils.js'
import { getAllDishes } from '../services/dishService.js'
import { saveSharedMenuToHistory } from '../services/orderService.js'
import { getItem, setItem } from '../services/storage.js'
import { mergeIngredients } from '../utils/ingredientMerge.js'
import styles from './SharePage.module.css'

/**
 * 分享菜单接收页面 — ❤️ 今晚她想吃这些
 * 男主点击微信链接打开的专属页面
 */
export default function SharePage({ onNavigate }) {
  // 解析 URL 分享参数
  const shareData = useMemo(() => getShareDataFromCurrentUrl(), [])

  // 本地全量菜品库
  const localDishes = useMemo(() => getAllDishes(), [])

  // 是否已保存到历史
  const [isSaved, setIsSaved] = useState(false)

  // Toast 提示
  const [toastInfo, setToastInfo] = useState({
    visible: false,
    emoji: '❤️',
    title: '',
    message: '',
  })

  // 还原菜品完整数据
  const resolvedDishes = useMemo(() => {
    if (!shareData || !Array.isArray(shareData.dishes)) return []

    return shareData.dishes.map((dishId, idx) => {
      const found = localDishes.find(d => d.id === dishId)
      if (found) return found

      // 若为本地未找到的菜品 ID，做优雅后备展示
      return {
        id: dishId || `custom-${idx}`,
        name: `拿手美味 (${idx + 1})`,
        category: 'meat',
        cookingTime: 20,
        cookTime: 20,
        difficulty: 'easy',
        image: null,
        emoji: '🍽️',
        tags: ['她点的'],
        ingredients: [],
      }
    })
  }, [shareData, localDishes])

  // 生成采购清单唯一缓存 key
  const storageKey = useMemo(() => {
    if (!shareData || !Array.isArray(shareData.dishes)) return 'coupleMenu_share_checked'
    const idKey = shareData.dishes.join('-')
    return `coupleMenu_share_checked_${idKey}`
  }, [shareData])

  // 采购已买勾选集合
  const [checkedMap, setCheckedMap] = useState(() => {
    const saved = getItem(storageKey, [])
    return new Set(Array.isArray(saved) ? saved : [])
  })

  // 自动合并采购清单（复用原有合并逻辑）
  const shoppingList = useMemo(() => {
    if (resolvedDishes.length === 0) return []
    return mergeIngredients(resolvedDishes)
  }, [resolvedDishes])

  // 总烹饪耗时
  const totalCookingTime = useMemo(() => {
    return resolvedDishes.reduce((sum, d) => sum + (d.cookingTime || d.cookTime || 15), 0)
  }, [resolvedDishes])

  // 切换食材已买勾选状态
  const handleToggleIngredient = (name) => {
    setCheckedMap(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      setItem(storageKey, Array.from(next))
      return next
    })
  }

  // 一键买齐
  const handleCheckAll = () => {
    if (shoppingList.length === 0) return
    const allNames = shoppingList.map(item => item.name)
    const next = new Set(allNames)
    setCheckedMap(next)
    setItem(storageKey, allNames)
    setToastInfo({
      visible: true,
      emoji: '🛒',
      title: '食材都买齐啦 🎉',
      message: '今晚按她想吃的大显身手吧～',
    })
  }

  // 保存到“我们吃过的”历史记录
  const handleSaveToHistory = () => {
    if (resolvedDishes.length === 0 || isSaved) return

    const success = saveSharedMenuToHistory({
      dishes: resolvedDishes,
      note: shareData?.note || '',
    })

    setIsSaved(true)

    if (success) {
      setToastInfo({
        visible: true,
        emoji: '📖',
        title: '已保存到我们吃过的 ❤️',
        message: '今晚的美好菜单已收录进你们的美食回忆手账～',
      })
    } else {
      setToastInfo({
        visible: true,
        emoji: '✨',
        title: '今天已经记录过啦',
        message: '这份菜单已经保存在历史手账里了哦～',
      })
    }
  }

  const isAllChecked = shoppingList.length > 0 && shoppingList.every(i => checkedMap.has(i.name))
  const checkedCount = shoppingList.filter(i => checkedMap.has(i.name)).length

  // 异常链接或数据损坏时：温和友好的错误保护界面（绝不白屏）
  if (!shareData || resolvedDishes.length === 0) {
    return (
      <div className="page page--full">
        <PageHeader
          title="今晚想吃什么 ❤️"
          subtitle="情侣点菜分享"
        />
        <div className={styles.errorWrapper}>
          <EmptyState
            emoji="💌"
            title="这份菜单好像走丢了～"
            description="链接可能不小心被微信截断或损坏啦，让女朋友再点一次“发给你”或者去看看菜单吧 ❤️"
          />
          <button
            type="button"
            className={styles.goHomeBtn}
            onClick={() => onNavigate('/')}
          >
            <span>回到菜单首页</span>
            <span className={styles.btnArrow}>➔</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page page--full">
      {/* 顶部标题 */}
      <PageHeader
        title="❤️ 今晚她想吃这些"
        subtitle={`共 ${resolvedDishes.length} 道美味 · 预计准备约 ${totalCookingTime} 分钟`}
        rightAction={
          <button
            type="button"
            className={styles.homeBtn}
            onClick={() => onNavigate('/')}
          >
            去菜单
          </button>
        }
      />

      {/* 她的叮嘱备注卡片 */}
      {shareData.note ? (
        <div className={styles.noteCard}>
          <div className={styles.noteHeader}>
            <span className={styles.noteIcon}>💌</span>
            <span className={styles.noteLabel}>她说：</span>
          </div>
          <p className={styles.noteText}>“{shareData.note}”</p>
        </div>
      ) : null}

      {/* 菜品清单列表 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span>🍽️ 菜品清单</span>
            <span className={styles.countBadge}>{resolvedDishes.length}道菜</span>
          </h2>
        </div>

        <div className={styles.dishList}>
          {resolvedDishes.map((dish, idx) => (
            <div key={dish.id || idx} className={styles.dishCard}>
              <div
                className={styles.dishThumb}
                style={{ background: `var(--color-cat-${dish.category || 'meat'})` }}
              >
                <span className={styles.dishEmoji}>{dish.emoji || '🍽️'}</span>
                {dish.image && (
                  <img
                    src={dish.image}
                    alt={dish.name}
                    decoding="async"
                    draggable="false"
                    className={styles.dishImg}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                )}
              </div>

              <div className={styles.dishInfo}>
                <span className={styles.dishName}>{dish.name}</span>
                <span className={styles.dishTime}>⏱️ 制作约 {dish.cookingTime || dish.cookTime || 15} 分钟</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🛒 今晚要买（智能合并采购清单） */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span>🛒 今晚要买</span>
            <span className={styles.countBadge}>
              {checkedCount}/{shoppingList.length} 已买
            </span>
          </h2>

          <button
            type="button"
            className={`${styles.quickCheckBtn} ${isAllChecked ? styles.quickCheckDone : ''}`}
            onClick={handleCheckAll}
            disabled={isAllChecked || shoppingList.length === 0}
          >
            {isAllChecked ? '食材买齐啦 ✓' : '一键全选买齐'}
          </button>
        </div>

        <div className={styles.checklistCard}>
          {shoppingList.length > 0 ? (
            shoppingList.map((item, idx) => {
              const isChecked = checkedMap.has(item.name)

              return (
                <div
                  key={idx}
                  className={`${styles.checkRow} ${isChecked ? styles.checkRowDone : ''}`}
                  onClick={() => handleToggleIngredient(item.name)}
                >
                  <div className={styles.checkboxWrapper}>
                    <div className={`${styles.box} ${isChecked ? styles.boxChecked : ''}`}>
                      {isChecked ? '✓' : ''}
                    </div>
                  </div>

                  <div className={styles.itemMain}>
                    <div className={styles.itemTitleRow}>
                      <span className={`${styles.itemName} ${isChecked ? styles.nameDone : ''}`}>
                        {item.name}
                      </span>
                      {isChecked && <span className={styles.doneBadge}>已买</span>}
                    </div>
                    {item.fromDishes && item.fromDishes.length > 0 && (
                      <span className={styles.fromDishes}>
                        用于：{item.fromDishes.join('、')}
                      </span>
                    )}
                  </div>

                  <div className={styles.amountArea}>
                    <span className={`${styles.amountText} ${isChecked ? styles.amountDone : ''}`}>
                      {item.displayText}
                    </span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className={styles.noIngredientsTip}>
              所选菜品不需要额外食材，可以直接开火烹饪～
            </div>
          )}
        </div>
      </div>

      {/* 底部动作栏：保存到历史记录 */}
      <div className={styles.bottomBar}>
        <button
          type="button"
          className={`${styles.saveHistoryBtn} ${isSaved ? styles.saveHistoryDone : ''}`}
          onClick={handleSaveToHistory}
          disabled={isSaved}
        >
          {isSaved ? '已保存到我们吃过的 ❤️' : '保存到我们吃过的 📖'}
        </button>
      </div>

      {/* 提示弹窗 */}
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
