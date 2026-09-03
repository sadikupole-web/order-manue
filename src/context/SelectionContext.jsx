/**
 * 选菜状态管理 Context
 * 管理当前未提交的菜品选择，自动同步到 localStorage
 */
import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { getCurrentSelection, saveCurrentSelection } from '../services/orderService'

const SelectionContext = createContext(null)

export function SelectionProvider({ children }) {
  const [selection, setSelection] = useState(() => getCurrentSelection())

  // 更新选择并同步到 localStorage
  const updateSelection = useCallback((updater) => {
    setSelection(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveCurrentSelection(next)
      return next
    })
  }, [])

  // 添加菜品
  const addDish = useCallback((dishId) => {
    updateSelection(prev => {
      if (prev.dishIds.includes(dishId)) return prev
      return { ...prev, dishIds: [...prev.dishIds, dishId] }
    })
  }, [updateSelection])

  // 移除菜品
  const removeDish = useCallback((dishId) => {
    updateSelection(prev => ({
      ...prev,
      dishIds: prev.dishIds.filter(id => id !== dishId),
    }))
  }, [updateSelection])

  // 切换菜品选中状态
  const toggleDish = useCallback((dishId) => {
    updateSelection(prev => {
      if (prev.dishIds.includes(dishId)) {
        return { ...prev, dishIds: prev.dishIds.filter(id => id !== dishId) }
      }
      return { ...prev, dishIds: [...prev.dishIds, dishId] }
    })
  }, [updateSelection])

  // 设置备注
  const setNote = useCallback((note) => {
    updateSelection(prev => ({ ...prev, note }))
  }, [updateSelection])

  // 清空选择
  const clearSelection = useCallback(() => {
    updateSelection({ dishIds: [], note: '' })
  }, [updateSelection])

  // 判断某道菜是否已选
  const isDishSelected = useCallback((dishId) => {
    return selection.dishIds.includes(dishId)
  }, [selection.dishIds])

  const value = useMemo(() => ({
    selectedDishIds: selection.dishIds,
    note: selection.note,
    selectedCount: selection.dishIds.length,
    addDish,
    removeDish,
    toggleDish,
    setNote,
    clearSelection,
    isDishSelected,
  }), [selection, addDish, removeDish, toggleDish, setNote, clearSelection, isDishSelected])

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  )
}

export function useSelection() {
  const context = useContext(SelectionContext)
  if (!context) {
    throw new Error('useSelection must be used within SelectionProvider')
  }
  return context
}
