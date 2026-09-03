import React from 'react'

/**
 * 全局错误边界组件
 * 拦截 React 渲染树异常，杜绝页面出现空白现象
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] 捕获到界面渲染错误:', error, errorInfo)
  }

  handleReload = () => {
    window.location.hash = '#/'
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          background: '#FAF8F5',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
          }}>
            🥣
          </div>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#2C2825',
            marginBottom: '8px',
          }}>
            小厨房正在准备美味中～
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#7A756E',
            maxWidth: '280px',
            lineHeight: 1.5,
            marginBottom: '24px',
          }}>
            刚才有点小拥挤，点击下方按钮重新回到点菜主页吧 ❤️
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              background: '#CE656F',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(206, 101, 111, 0.25)',
            }}
          >
            回到首页 ➔
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
