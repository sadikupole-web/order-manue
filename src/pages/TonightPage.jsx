import { useState, useMemo } from 'react'
import PageHeader from '../components/common/PageHeader'
import SelectedDishList from '../components/tonight/SelectedDishList'
import NoteInput from '../components/tonight/NoteInput'
import Toast from '../components/common/Toast'
import {
  getCurrentSelection,
  saveCurrentSelection,
  submitTonightOrder,
} from '../services/orderService.js'
import { getAllDishes } from '../services/dishService.js'
import {
  generateShareUrl,
  generateWechatShareText,
  copyToClipboard,
  shareViaSystem,
} from '../utils/shareUtils.js'
import { mergeIngredients } from '../utils/ingredientMerge.js'
import styles from './TonightPage.module.css'

/**
 * 今晚菜单页面
 * 女朋友选好菜后，可直接点击“发给你 ❤️”生成分享链接，或“复制今晚菜单”发在微信中
 */
export default function TonightPage({ onNavigate }) {
  // 从本地缓存获取当前选中的菜品 ID 和备注
  const currentSelection = useMemo(() => getCurrentSelection(), [])

  const [selectedIds, setSelectedIds] = useState(
    () => currentSelection?.dishIds || []
  )
  const [note, setNote] = useState(() => currentSelection?.note || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 温馨提示弹窗
  const [toastInfo, setToastInfo] = useState({
    visible: false,
    emoji: '❤️',
    title: '',
    message: '',
  })

  // 获取所有菜品以匹配详情
  const allDishes = useMemo(() => getAllDishes(), [])

  // 映射还原已选菜品的完整对象列表
  const selectedDishes = useMemo(() => {
    return selectedIds
      .map(id => allDishes.find(d => d.id === id))
      .filter(Boolean)
  }, [selectedIds, allDishes])

  // 计算食材合并清单（用于复制到微信）
  const shoppingList = useMemo(() => {
    if (selectedDishes.length === 0) return []
    return mergeIngredients(selectedDishes)
  }, [selectedDishes])

  // 移除单个菜品
  const handleRemoveDish = (dishId) => {
    const nextIds = selectedIds.filter(id => id !== dishId)
    setSelectedIds(nextIds)
    saveCurrentSelection({
      dishIds: nextIds,
      note,
    })
  }

  // 备注变更
  const handleNoteChange = (newNote) => {
    setNote(newNote)
    saveCurrentSelection({
      dishIds: selectedIds,
      note: newNote,
    })
  }

  // 点击主要操作：“发给你 ❤️”
  const handleShareToPartner = async () => {
    if (isSubmitting || selectedDishes.length === 0) return

    setIsSubmitting(true)

    try {
      // 1. 本地同时保存一份当前菜单记录
      await submitTonightOrder(selectedDishes, note)

      // 2. 生成紧凑安全的分享 URL
      const shareUrl = generateShareUrl({
        dishes: selectedDishes,
        note,
      })

      // 3. 尝试调用系统原生分享 (Web Share API)
      const dishesSummary = selectedDishes.map(d => d.name).join('、')
      const sharedSuccessfully = await shareViaSystem({
        title: '今晚想吃这些 ❤️',
        text: `今晚想吃：${dishesSummary}～`,
        url: shareUrl,
      })

      // 4. 若不支持系统分享或需复制兜底，自动复制链接并弹窗反馈
      if (!sharedSuccessfully) {
        await copyToClipboard(shareUrl)
        setToastInfo({
          visible: true,
          emoji: '💌',
          title: '链接已经复制好啦 ❤️',
          message: '发给我就可以啦，我打开就能看到你想吃的菜和买菜清单～',
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // 点击辅助操作：“复制今晚菜单”（排版好的微信文本）
  const handleCopyText = async () => {
    if (selectedDishes.length === 0) return

    const text = generateWechatShareText({
      dishes: selectedDishes,
      note,
      shoppingList,
    })

    const copied = await copyToClipboard(text)
    if (copied) {
      setToastInfo({
        visible: true,
        emoji: '📋',
        title: '菜单文字已复制 ❤️',
        message: '已经整理好食材和备注，可以直接粘贴发在微信里啦～',
      })
    }
  }

  const hasDishes = selectedDishes.length > 0

  return (
    <div className="page">
      {/* 顶部导航 */}
      <PageHeader
        title="今晚就吃这些 ❤️"
        subtitle={
          hasDishes
            ? `已经挑选了 ${selectedDishes.length} 道美味，随时发给他～`
            : '挑选今晚想吃的菜品'
        }
        rightAction={
          hasDishes ? (
            <button
              type="button"
              className={styles.topAddBtn}
              onClick={() => onNavigate('/')}
            >
              ＋ 继续加菜
            </button>
          ) : null
        }
      />

      {/* 核心内容区 */}
      {hasDishes ? (
        <>
          {/* 已选菜品列表 */}
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>🍽️ 已选菜品 ({selectedDishes.length})</span>
          </div>
          <SelectedDishList
            dishes={selectedDishes}
            onRemoveDish={handleRemoveDish}
          />

          {/* 备注输入框 */}
          <NoteInput
            value={note}
            onChange={handleNoteChange}
            maxLength={150}
          />

          {/* 底部主要操作区 */}
          <div className={styles.actionArea}>
            <button
              type="button"
              className={styles.mainShareBtn}
              onClick={handleShareToPartner}
              disabled={!hasDishes || isSubmitting}
            >
              <span>发给你 ❤️</span>
            </button>

            <button
              type="button"
              className={styles.copyTextBtn}
              onClick={handleCopyText}
              disabled={!hasDishes}
            >
              <span>📋 复制今晚菜单（微信文本）</span>
            </button>
          </div>
        </>
      ) : (
        /* 友好的空状态 */
        <div className={styles.emptyContainer}>
          <div className={styles.emptyIllustration}>
            <span className={styles.emptyEmoji}>🥣</span>
          </div>
          <h2 className={styles.emptyTitle}>还没想好吃什么呢～</h2>
          <p className={styles.emptyDesc}>
            大厨的拿手菜都已经准备好啦，快去挑几道今晚想吃的美味吧！
          </p>
          <button
            type="button"
            className={styles.goMenuBtn}
            onClick={() => onNavigate('/')}
          >
            <span>去看看菜单</span>
            <span className={styles.btnArrow}>➔</span>
          </button>
        </div>
      )}

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
