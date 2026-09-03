import { useState, useMemo, useEffect, useCallback } from 'react'
import PageHeader from '../components/common/PageHeader'
import EmptyState from '../components/common/EmptyState'
import Toast from '../components/common/Toast'
import {
  getTonightOrder,
  clearTonightOrder,
  updateCheckedIngredients,
  updateOrderStatus,
} from '../services/orderService.js'
import { getItem } from '../services/storage.js'
import { mergeIngredients } from '../utils/ingredientMerge.js'
import { formatTime } from '../utils/date.js'
import styles from './ChefPage.module.css'

/**
 * 做饭页面 — 👨‍🍳 今晚任务
 * 支持两台手机 Realtime 实时同步、采购勾选同步与离线降级
 */
export default function ChefPage({ onNavigate }) {
  const [order, setOrder] = useState(() => getTonightOrder())

  // 做饭状态：'ready' (准备中) | 'cooking' (烹饪中)
  const [cookingStatus, setCookingStatus] = useState(() => {
    return order?.status === 'cooking' ? 'cooking' : 'ready'
  })

  // 已经勾选为“已买”的食材名称集合
  const [checkedMap, setCheckedMap] = useState(() => {
    if (order?.checkedIngredients && Array.isArray(order.checkedIngredients)) {
      return new Set(order.checkedIngredients)
    }
    const storageKey = order?.id ? `coupleMenu_shopping_checked_${order.id}` : 'coupleMenu_shopping_checked'
    const saved = getItem(storageKey, [])
    return new Set(Array.isArray(saved) ? saved : [])
  })

  // Toast 弹窗
  const [toastInfo, setToastInfo] = useState({
    visible: false,
    emoji: '👨‍🍳',
    title: '',
    message: '',
  })

  // 从本地加载今晚最新菜单
  const loadLocalOrder = useCallback(() => {
    const latest = getTonightOrder()
    setOrder(latest)
    if (latest?.status === 'cooking') setCookingStatus('cooking')
    if (Array.isArray(latest?.checkedIngredients)) {
      setCheckedMap(new Set(latest.checkedIngredients))
    }
  }, [])

  // 页面加载与前后台切回时刷新
  useEffect(() => {
    loadLocalOrder()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadLocalOrder()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [loadLocalOrder])

  // 当 order.id 改变时更新勾选状态
  useEffect(() => {
    if (order) {
      if (Array.isArray(order.checkedIngredients) && order.checkedIngredients.length > 0) {
        setCheckedMap(new Set(order.checkedIngredients))
      } else {
        const storageKey = `coupleMenu_shopping_checked_${order.id}`
        const saved = getItem(storageKey, [])
        setCheckedMap(new Set(Array.isArray(saved) ? saved : []))
      }
      setCookingStatus(order.status === 'cooking' ? 'cooking' : 'ready')
    }
  }, [order?.id])

  // 勾选单个食材（乐观更新 + 云端同步）
  const handleToggleItem = (ingredientName) => {
    setCheckedMap(prev => {
      const next = new Set(prev)
      if (next.has(ingredientName)) {
        next.delete(ingredientName)
      } else {
        next.add(ingredientName)
      }
      const list = Array.from(next)
      if (order?.id) {
        updateCheckedIngredients(order.id, list)
      }
      return next
    })
  }

  // 采购清单数据汇总
  const shoppingList = useMemo(() => {
    if (!order || !order.dishes) return []
    return mergeIngredients(order.dishes)
  }, [order])

  // 一键“食材买齐啦 ✓”
  const handleCheckAll = () => {
    if (shoppingList.length === 0) return
    const allNames = shoppingList.map(item => item.name)
    const next = new Set(allNames)
    setCheckedMap(next)
    if (order?.id) {
      updateCheckedIngredients(order.id, allNames)
    }
    setToastInfo({
      visible: true,
      emoji: '🛒',
      title: '食材都买齐啦 🎉',
      message: '装备齐全！今晚大厨要大显身手啦～',
    })
  }

  // 点击“开始做饭 👨‍🍳”
  const handleStartCooking = () => {
    setCookingStatus('cooking')
    if (order?.id) {
      updateOrderStatus(order.id, 'cooking')
    }
    setToastInfo({
      visible: true,
      emoji: '🔥',
      title: '大厨正式开工！',
      message: '正在热火朝天烹饪中，香气很快就飘出来啦～',
    })
  }

  // 清除任务
  const handleResetOrder = () => {
    if (window.confirm('确定要清除当前的今晚任务吗？')) {
      clearTonightOrder()
      setOrder(null)
      setCheckedMap(new Set())
      setCookingStatus('ready')
    }
  }

  // 计算采购完成度
  const isAllChecked = shoppingList.length > 0 && shoppingList.every(i => checkedMap.has(i.name))
  const checkedCount = shoppingList.filter(i => checkedMap.has(i.name)).length

  // 无订单时的友好空状态
  if (!order || !order.dishes || order.dishes.length === 0) {
    return (
      <div className="page">
        <PageHeader
          title="👨‍🍳 今晚任务"
          subtitle="今晚做饭与采购清单"
          rightAction={
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.subtleManageBtn}
                onClick={loadLocalOrder}
                title="刷新状态"
              >
                🔄 刷新
              </button>
              <button
                type="button"
                className={styles.topManageBtn}
                onClick={() => onNavigate('/manage')}
              >
                ⚙️ 菜谱管理
              </button>
            </div>
          }
        />
        <div className={styles.emptyWrap}>
          <EmptyState
            emoji="🛋️"
            title="今晚暂时还没有点菜呢～"
            description="等她在手机上选好想吃的菜并提交，采购任务和做饭清单就会立刻同步出现在这里啦！"
          />
          <button
            type="button"
            className={styles.emptyGoBtn}
            onClick={() => onNavigate('/')}
          >
            去看看菜品库
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      {/* 顶部标题 */}
      <PageHeader
        title="👨‍🍳 今晚任务"
        subtitle={`提交时间：${formatTime(order.submittedAt)} · 共 ${order.dishes.length} 道菜`}
        rightAction={
          <div className={styles.headerActions}>
            <button
              type="button"
              className={styles.subtleManageBtn}
              onClick={loadLocalOrder}
              title="刷新最新菜单"
            >
              🔄
            </button>
            <button
              type="button"
              className={styles.subtleManageBtn}
              onClick={() => onNavigate('/manage')}
              title="管理菜品库"
            >
              ⚙️ 菜谱
            </button>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleResetOrder}
              title="清除当前任务"
            >
              重新点
            </button>
          </div>
        }
      />

      {/* 做饭进行中横幅 */}
      {cookingStatus === 'cooking' && (
        <div className={styles.cookingBanner}>
          <span className={styles.cookingEmoji}>🔥</span>
          <div className={styles.cookingInfo}>
            <strong className={styles.cookingTitle}>正在热火朝天烹饪中...</strong>
            <span className={styles.cookingSub}>香气很快就要溢出厨房啦～</span>
          </div>
        </div>
      )}

      {/* 她的备注特别叮嘱 */}
      {order.note && (
        <div className={styles.noteCard}>
          <div className={styles.noteHeader}>
            <span className={styles.noteIcon}>💌</span>
            <span className={styles.noteLabel}>她的特别叮嘱：</span>
          </div>
          <p className={styles.noteText}>“{order.note}”</p>
        </div>
      )}

      {/* 今晚她想吃菜品列表 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <span>❤️ 今晚她想吃</span>
            <span className={styles.countBadge}>{order.dishes.length}道菜</span>
          </h2>
        </div>

        <div className={styles.dishGrid}>
          {order.dishes.map((dish, idx) => (
            <div key={idx} className={styles.dishItem}>
              <div
                className={styles.dishThumb}
                style={{ background: `var(--color-cat-${dish.category || 'meat'})` }}
              >
                <span className={styles.dishEmoji}>{dish.emoji || '🍽️'}</span>
                {dish.image && (
                  <img
                    src={dish.image}
                    alt={dish.dishName || dish.name}
                    decoding="async"
                    draggable="false"
                    className={styles.dishImg}
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                )}
              </div>
              <div className={styles.dishInfo}>
                <span className={styles.dishName}>{dish.dishName || dish.name}</span>
                <span className={styles.dishMeta}>
                  ⏱️ 耗时约 {dish.cookingTime || dish.cookTime || 15} 分钟
                </span>
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
            {isAllChecked ? '已全部买齐 ✓' : '食材买齐啦 ✓'}
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
                  onClick={() => handleToggleItem(item.name)}
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
              所选菜品未录入食材明细，可直接烹饪～
            </div>
          )}
        </div>
      </div>

      {/* 底部固定操作栏 */}
      <div className={styles.bottomBar}>
        <button
          type="button"
          className={`${styles.actionPrimaryBtn} ${cookingStatus === 'cooking' ? styles.cookingBtnActive : ''}`}
          onClick={handleStartCooking}
        >
          {cookingStatus === 'cooking' ? '👨‍🍳 正在热火朝天烹饪中 ❤️' : '开始做饭 👨‍🍳'}
        </button>
      </div>

      {/* 温馨提示弹窗 */}
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
