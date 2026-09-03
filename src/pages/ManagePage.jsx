import { useState, useMemo } from 'react'
import PageHeader from '../components/common/PageHeader'
import Toast from '../components/common/Toast'
import {
  getAllDishes,
  addDish,
  updateDish,
  deleteDish,
} from '../services/dishService.js'
import {
  CATEGORIES,
  DIFFICULTIES,
  DIFFICULTY_LABELS,
} from '../utils/constants.js'
import styles from './ManagePage.module.css'

// 默认空白菜品表单结构
const EMPTY_DISH_FORM = {
  name: '',
  category: 'meat',
  image: '',
  cookingTime: 20,
  difficulty: 'easy',
  tagsText: '',
  ingredients: [
    { name: '', amount: '', unit: '' },
    { name: '', amount: '', unit: '' },
  ],
}

/**
 * 菜品管理页面
 * 支持查看、新增、编辑、删除菜品，包含动态食材列表与二次确认
 */
export default function ManagePage({ onNavigate }) {
  // 菜品列表
  const [dishes, setDishes] = useState(() => getAllDishes())

  // 当前分类过滤（方便手机端快速查找）
  const [filterCategory, setFilterCategory] = useState('all')

  // 表单弹窗状态：null (关闭) | { mode: 'create' } | { mode: 'edit', dishId: '...' }
  const [formModal, setFormModal] = useState(null)
  const [formData, setFormData] = useState(EMPTY_DISH_FORM)

  // 二次确认删除弹窗：null | dishItem
  const [deleteConfirmDish, setDeleteConfirmDish] = useState(null)

  // 温馨提示 Toast
  const [toastInfo, setToastInfo] = useState({
    visible: false,
    emoji: '✨',
    title: '',
    message: '',
  })

  // 刷新菜品列表
  const reloadDishes = () => {
    setDishes(getAllDishes())
  }

  // 筛选展示的菜品
  const filteredDishes = useMemo(() => {
    if (filterCategory === 'all') return dishes
    return dishes.filter(d => d.category === filterCategory)
  }, [dishes, filterCategory])

  // 打开“新增菜品”表单
  const handleOpenCreate = () => {
    setFormData(EMPTY_DISH_FORM)
    setFormModal({ mode: 'create' })
  }

  // 打开“编辑菜品”表单
  const handleOpenEdit = (dish) => {
    setFormData({
      name: dish.name || '',
      category: dish.category || 'meat',
      image: dish.image || '',
      cookingTime: dish.cookingTime || dish.cookTime || 15,
      difficulty: dish.difficulty || 'easy',
      tagsText: Array.isArray(dish.tags) ? dish.tags.join(' ') : '',
      ingredients:
        Array.isArray(dish.ingredients) && dish.ingredients.length > 0
          ? dish.ingredients.map(ing => ({
              name: ing.name || '',
              amount: ing.amount !== undefined ? String(ing.amount) : '',
              unit: ing.unit || '',
            }))
          : [{ name: '', amount: '', unit: '' }],
    })
    setFormModal({ mode: 'edit', dishId: dish.id })
  }

  // 表单内动态食材：修改某一行
  const handleIngredientChange = (index, field, value) => {
    setFormData(prev => {
      const nextList = [...prev.ingredients]
      nextList[index] = { ...nextList[index], [field]: value }
      return { ...prev, ingredients: nextList }
    })
  }

  // 表单内动态食材：＋添加食材
  const handleAddIngredientRow = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }],
    }))
  }

  // 表单内动态食材：删除某一行
  const handleRemoveIngredientRow = (index) => {
    setFormData(prev => {
      if (prev.ingredients.length <= 1) {
        return {
          ...prev,
          ingredients: [{ name: '', amount: '', unit: '' }],
        }
      }
      return {
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index),
      }
    })
  }

  // 提交保存菜品（新增或修改）
  const handleSaveDish = async (e) => {
    e.preventDefault()

    const cleanName = formData.name.trim()
    if (!cleanName) {
      alert('请填写菜品名称哦～')
      return
    }

    // 处理标签数组
    const tags = formData.tagsText
      .split(/[,，\s]+/)
      .map(t => t.trim())
      .filter(Boolean)

    // 处理食材列表（过滤完全空白的行）
    const cleanIngredients = formData.ingredients
      .map(ing => {
        const name = ing.name.trim()
        if (!name) return null
        const amountNum = parseFloat(ing.amount)
        return {
          name,
          amount: isNaN(amountNum) ? ing.amount.trim() : amountNum,
          unit: (ing.unit || '').trim(),
        }
      })
      .filter(Boolean)

    const dishPayload = {
      name: cleanName,
      category: formData.category,
      image: formData.image.trim() || null,
      cookingTime: parseInt(formData.cookingTime, 10) || 15,
      cookTime: parseInt(formData.cookingTime, 10) || 15,
      difficulty: formData.difficulty,
      tags: tags.length > 0 ? tags : ['私房招牌'],
      ingredients: cleanIngredients,
    }

    if (formModal?.mode === 'create') {
      await addDish(dishPayload)
      setToastInfo({
        visible: true,
        emoji: '🎉',
        title: '新菜品添加成功！',
        message: `「${cleanName}」已经加入你的拿手菜谱库啦～`,
      })
    } else if (formModal?.mode === 'edit' && formModal.dishId) {
      await updateDish(formModal.dishId, dishPayload)
      setToastInfo({
        visible: true,
        emoji: '✏️',
        title: '菜品修改已保存！',
        message: `「${cleanName}」的资料已成功更新～`,
      })
    }

    setFormModal(null)
    reloadDishes()
  }

  // 确认删除菜品
  const handleConfirmDelete = async () => {
    if (!deleteConfirmDish) return
    const dishName = deleteConfirmDish.name
    await deleteDish(deleteConfirmDish.id)
    setDeleteConfirmDish(null)
    reloadDishes()
    setToastInfo({
      visible: true,
      emoji: '🗑️',
      title: '菜品已删除',
      message: `已从菜谱库中移除「${dishName}」`,
    })
  }

  return (
    <div className="page page--full">
      {/* 顶部标题区 */}
      <PageHeader
        title="⚙️ 菜品管理"
        subtitle={`共 ${dishes.length} 道私房拿手菜`}
        rightAction={
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => onNavigate('/chef')}
          >
            ← 返回做饭
          </button>
        }
      />

      {/* 顶部新增与分类栏 */}
      <div className={styles.topControlArea}>
        {/* 新增菜品大胶囊按钮 */}
        <button
          type="button"
          className={styles.createBtn}
          onClick={handleOpenCreate}
        >
          <span className={styles.plusSign}>＋</span>
          <span>新增拿手菜</span>
        </button>

        {/* 分类快捷筛选 */}
        <div className={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              type="button"
              className={`${styles.catTab} ${filterCategory === cat.key ? styles.catTabActive : ''}`}
              onClick={() => setFilterCategory(cat.key)}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 菜品卡片列表 */}
      <div className={styles.dishList}>
        {filteredDishes.length > 0 ? (
          filteredDishes.map(dish => (
            <div key={dish.id} className={styles.manageCard}>
              {/* 卡片头部与缩略图 */}
              <div className={styles.cardHeader}>
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

                <div className={styles.dishMainInfo}>
                  <div className={styles.nameRow}>
                    <h3 className={styles.dishName}>{dish.name}</h3>
                    <span className={styles.categoryBadge}>
                      {CATEGORIES.find(c => c.key === dish.category)?.label || '其他'}
                    </span>
                  </div>
                  <div className={styles.metaRow}>
                    <span className={styles.difficultyText}>
                      {DIFFICULTY_LABELS[dish.difficulty] || dish.difficulty}
                    </span>
                    <span className={styles.metaDot}>·</span>
                    <span>⏱️ {dish.cookingTime || dish.cookTime || 15}分钟</span>
                  </div>
                </div>
              </div>

              {/* 标签 */}
              {dish.tags && dish.tags.length > 0 && (
                <div className={styles.tagGroup}>
                  {dish.tags.map(tag => (
                    <span key={tag} className={styles.dishTag}>#{tag}</span>
                  ))}
                </div>
              )}

              {/* 食材概览 */}
              {dish.ingredients && dish.ingredients.length > 0 && (
                <div className={styles.ingredientSummary}>
                  <span className={styles.ingredientSummaryLabel}>所需食材：</span>
                  <span className={styles.ingredientSummaryText}>
                    {dish.ingredients.map(ing => {
                      const amountStr = ing.amount !== undefined ? ing.amount : ''
                      const unitStr = ing.unit || ''
                      return `${ing.name}${amountStr ? ` ${amountStr}${unitStr}` : ''}`
                    }).join('、')}
                  </span>
                </div>
              )}

              {/* 卡片底部操作区 */}
              <div className={styles.cardActions}>
                <button
                  type="button"
                  className={styles.editBtn}
                  onClick={() => handleOpenEdit(dish)}
                >
                  ✏️ 编辑菜品
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setDeleteConfirmDish(dish)}
                >
                  🗑️ 删除
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyTip}>
            <p>该分类下暂无菜品，快点击上方“＋ 新增拿手菜”添加吧～</p>
          </div>
        )}
      </div>

      {/* 新增 / 编辑 菜品弹窗 (Modal) */}
      {formModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContainer}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {formModal.mode === 'create' ? '🍳 新增私房菜' : '✏️ 编辑菜品'}
              </h2>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setFormModal(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDish} className={styles.modalForm}>
              {/* 1. 菜名 */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>菜名 *</span>
                </label>
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder="例如：可乐鸡翅、清蒸鲈鱼"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {/* 2. 分类单选 */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>分类</label>
                <div className={styles.radioPills}>
                  {CATEGORIES.filter(c => c.key !== 'all').map(cat => (
                    <button
                      key={cat.key}
                      type="button"
                      className={`${styles.pillBtn} ${formData.category === cat.key ? styles.pillActive : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.key }))}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. 制作时间与难度 */}
              <div className={styles.formRow}>
                <div className={`${styles.formGroup} ${styles.flex1}`}>
                  <label className={styles.formLabel}>制作时间 (分钟)</label>
                  <input
                    type="number"
                    min="1"
                    max="300"
                    className={styles.textInput}
                    value={formData.cookingTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, cookingTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>难度</label>
                <div className={styles.radioPills}>
                  {DIFFICULTIES.map(diff => (
                    <button
                      key={diff.key}
                      type="button"
                      className={`${styles.pillBtn} ${formData.difficulty === diff.key ? styles.pillActive : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, difficulty: diff.key }))}
                    >
                      <span>{diff.emoji}</span>
                      <span>{diff.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. 图片 URL */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>图片 URL</span>
                  <span className={styles.labelHint}>(可选，留空使用专属美食图标)</span>
                </label>
                <input
                  type="url"
                  className={styles.textInput}
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                />
                {formData.image && (
                  <div className={styles.imgPreviewWrapper}>
                    <img
                      src={formData.image}
                      alt="预览"
                      className={styles.imgPreview}
                      onError={(e) => { e.currentTarget.style.display = 'none' }}
                    />
                    <span className={styles.previewHint}>图片预览</span>
                  </div>
                )}
              </div>

              {/* 5. 标签 */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  <span>标签</span>
                  <span className={styles.labelHint}>(以空格分隔，如“酸甜开胃 经典家常”)</span>
                </label>
                <input
                  type="text"
                  className={styles.textInput}
                  placeholder="下饭神器 外酥里嫩"
                  value={formData.tagsText}
                  onChange={(e) => setFormData(prev => ({ ...prev, tagsText: e.target.value }))}
                />
              </div>

              {/* 6. 动态食材列表 */}
              <div className={styles.formGroup}>
                <div className={styles.ingredientHeader}>
                  <label className={styles.formLabel}>
                    <span>所需食材</span>
                    <span className={styles.labelHint}>(生成采购清单的核心依据)</span>
                  </label>
                  <button
                    type="button"
                    className={styles.addIngBtn}
                    onClick={handleAddIngredientRow}
                  >
                    ＋ 添加食材
                  </button>
                </div>

                <div className={styles.ingredientTable}>
                  {formData.ingredients.map((ing, idx) => (
                    <div key={idx} className={styles.ingredientRow}>
                      <input
                        type="text"
                        className={`${styles.textInput} ${styles.ingNameInput}`}
                        placeholder="食材名(如排骨)"
                        value={ing.name}
                        onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                      />
                      <input
                        type="text"
                        className={`${styles.textInput} ${styles.ingAmountInput}`}
                        placeholder="数量(500)"
                        value={ing.amount}
                        onChange={(e) => handleIngredientChange(idx, 'amount', e.target.value)}
                      />
                      <input
                        type="text"
                        className={`${styles.textInput} ${styles.ingUnitInput}`}
                        placeholder="单位(g)"
                        value={ing.unit}
                        onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.removeIngRowBtn}
                        onClick={() => handleRemoveIngredientRow(idx)}
                        title="删除此行"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* 弹窗底部操作按钮 */}
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setFormModal(null)}
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={styles.saveSubmitBtn}
                >
                  保存菜品 ❤️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除二次确认弹窗 */}
      {deleteConfirmDish && (
        <div className={styles.modalOverlay} onClick={() => setDeleteConfirmDish(null)}>
          <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmEmoji}>⚠️</div>
            <h3 className={styles.confirmTitle}>确认删除这道菜吗？</h3>
            <p className={styles.confirmDesc}>
              你确定要从私房菜谱库中移除「<strong>{deleteConfirmDish.name}</strong>」吗？
              删除后女朋友在点菜页面就选不到它了哦～
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmCancelBtn}
                onClick={() => setDeleteConfirmDish(null)}
              >
                先留着
              </button>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={handleConfirmDelete}
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 操作提示 Toast */}
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
