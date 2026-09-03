import { useState, useMemo } from 'react'
import PageHeader from '../components/common/PageHeader'
import Toast from '../components/common/Toast'
import { getHistory, saveCurrentSelection } from '../services/orderService.js'
import { getDishById } from '../services/dishService.js'
import { formatDateNatural, isToday } from '../utils/date.js'
import styles from './HistoryPage.module.css'

/**
 * 历史菜单页 — 我们吃过的
 * 记录二人一起吃过的每一次美味与温情
 */
export default function HistoryPage({ onNavigate }) {
  const [historyList] = useState(() => getHistory())

  // 当前选中的详情弹层数据 (null | orderItem)
  const [activeDetail, setActiveDetail] = useState(null)

  // 提示 Toast
  const [toastInfo, setToastInfo] = useState({
    visible: false,
    emoji: '❤️',
    title: '',
    message: '',
  })

  // 按日期时间倒序排序
  const sortedHistory = useMemo(() => {
    return [...historyList].sort((a, b) => {
      const timeA = new Date(a.submittedAt || a.date).getTime()
      const timeB = new Date(b.submittedAt || b.date).getTime()
      return timeB - timeA
    })
  }, [historyList])

  // 点击“按这顿再点一次 ❤️”
  const handleReorder = (order) => {
    if (!order || !order.dishes) return
    const dishIds = order.dishes.map(d => d.dishId).filter(Boolean)
    saveCurrentSelection({
      dishIds,
      note: order.note || '',
    })

    setActiveDetail(null)
    setToastInfo({
      visible: true,
      emoji: '🍽️',
      title: '已为你放进今晚菜单！',
      message: '正在带你前往今晚菜单确认～',
    })

    setTimeout(() => {
      onNavigate('/tonight')
    }, 1200)
  }

  return (
    <div className="page">
      {/* 顶部标题区 */}
      <PageHeader
        title="📖 我们吃过的"
        subtitle={
          sortedHistory.length > 0
            ? `一起记录了 ${sortedHistory.length} 次温暖的晚餐时光`
            : '每一餐都是幸福的记忆'
        }
      />

      {/* 历史卡片列表 */}
      {sortedHistory.length > 0 ? (
        <div className={styles.timeline}>
          {sortedHistory.map((item, index) => {
            const dateTitle = formatDateNatural(item.date || item.submittedAt)
            const itemIsToday = isToday(item.date || item.submittedAt)

            return (
              <div
                key={item.id || index}
                className={styles.dayCard}
                onClick={() => setActiveDetail(item)}
                role="button"
                tabIndex={0}
              >
                {/* 日期头部 */}
                <div className={styles.cardHeader}>
                  <div className={styles.dateArea}>
                    <span className={styles.calendarIcon}>🗓️</span>
                    <h3 className={styles.dateText}>{dateTitle}</h3>
                  </div>
                  {itemIsToday && (
                    <span className={styles.todayBadge}>今天</span>
                  )}
                </div>

                {/* 菜品列表 */}
                <div className={styles.dishesList}>
                  {item.dishes && item.dishes.length > 0 ? (
                    item.dishes.map((d, dIdx) => (
                      <div key={dIdx} className={styles.dishRow}>
                        <span className={styles.bulletDot}>·</span>
                        <span className={styles.dishName}>{d.dishName || d.name}</span>
                      </div>
                    ))
                  ) : (
                    <p className={styles.noDishText}>家常便饭</p>
                  )}
                </div>

                {/* 备注区域 */}
                {item.note && (
                  <div className={styles.noteArea}>
                    <span className={styles.noteLabel}>备注：</span>
                    <span className={styles.noteContent}>{item.note}</span>
                  </div>
                )}

                {/* 底部查看详情提示 */}
                <div className={styles.cardFooter}>
                  <span className={styles.dishesTotal}>共 {item.dishes?.length || 0} 道菜</span>
                  <span className={styles.viewDetailHint}>查看详情 ➔</span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* 无历史记录空状态 */
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIllustration}>
            <span className={styles.emptyEmoji}>📖</span>
          </div>
          <h2 className={styles.emptyTitle}>我们的菜单故事还没开始～</h2>
          <p className={styles.emptyDesc}>
            今晚就挑几道想吃的美味，让大厨下厨，写下属于我们的第一篇晚餐日记吧 ❤️
          </p>
          <button
            type="button"
            className={styles.goMenuBtn}
            onClick={() => onNavigate('/')}
          >
            <span>去挑今晚想吃的</span>
            <span className={styles.btnArrow}>➔</span>
          </button>
        </div>
      )}

      {/* 历史详情弹层 Modal */}
      {activeDetail && (
        <div className={styles.modalOverlay} onClick={() => setActiveDetail(null)}>
          <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
            {/* 弹窗头部 */}
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleArea}>
                <span className={styles.modalEmoji}>🍲</span>
                <div>
                  <h3 className={styles.modalTitle}>那天的晚餐回忆</h3>
                  <span className={styles.modalDate}>
                    {formatDateNatural(activeDetail.date || activeDetail.submittedAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setActiveDetail(null)}
              >
                ✕
              </button>
            </div>

            {/* 详细菜品清单 */}
            <div className={styles.modalBody}>
              {activeDetail.note && (
                <div className={styles.detailNoteCard}>
                  <span className={styles.detailNoteIcon}>💌</span>
                  <div className={styles.detailNoteInfo}>
                    <strong className={styles.detailNoteTitle}>那天想说的话：</strong>
                    <p className={styles.detailNoteText}>“{activeDetail.note}”</p>
                  </div>
                </div>
              )}

              <h4 className={styles.detailSectionTitle}>
                🍽️ 那天吃的美味 ({activeDetail.dishes?.length || 0} 道)
              </h4>

              <div className={styles.detailDishList}>
                {activeDetail.dishes?.map((d, idx) => {
                  const fullDish = getDishById(d.dishId)
                  const img = d.image || fullDish?.image
                  const cookingTime = d.cookingTime || fullDish?.cookingTime || fullDish?.cookTime || 15
                  const category = d.category || fullDish?.category || 'meat'
                  const emoji = d.emoji || fullDish?.emoji || '🍽️'

                  return (
                    <div key={idx} className={styles.detailDishItem}>
                      <div
                        className={styles.detailThumb}
                        style={{ background: `var(--color-cat-${category})` }}
                      >
                        <span className={styles.detailEmoji}>{emoji}</span>
                        {img && (
                          <img
                            src={img}
                            alt={d.dishName || d.name}
                            decoding="async"
                            draggable="false"
                            className={styles.detailImg}
                            onError={(e) => { e.currentTarget.style.display = 'none' }}
                          />
                        )}
                      </div>

                      <div className={styles.detailDishInfo}>
                        <span className={styles.detailDishName}>{d.dishName || d.name}</span>
                        <span className={styles.detailDishTime}>⏱️ 制作约 {cookingTime} 分钟</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 弹窗底部操作 */}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.reorderBtn}
                onClick={() => handleReorder(activeDetail)}
              >
                <span>按这顿再点一次 ❤️</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 提示 Toast */}
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
