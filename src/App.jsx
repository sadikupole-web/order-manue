import { useRouter } from './hooks/useRouter.js'
import TabBar from './components/common/TabBar.jsx'
import HomePage from './pages/HomePage.jsx'
import TonightPage from './pages/TonightPage.jsx'
import ChefPage from './pages/ChefPage.jsx'
import ManagePage from './pages/ManagePage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import SharePage from './pages/SharePage.jsx'

export default function App() {
  const { route, navigate } = useRouter()

  const renderPage = () => {
    switch (route) {
      case '/tonight':
        return <TonightPage onNavigate={navigate} />
      case '/chef':
        return <ChefPage onNavigate={navigate} />
      case '/manage':
        return <ManagePage onNavigate={navigate} />
      case '/history':
        return <HistoryPage onNavigate={navigate} />
      case '/share':
        return <SharePage onNavigate={navigate} />
      case '/':
      default:
        return <HomePage onNavigate={navigate} />
    }
  }

  // 菜品管理页与分享接收页不显示底部导航
  const hideTabBar = route === '/manage' || route === '/share'

  return (
    <>
      {renderPage()}
      {!hideTabBar && <TabBar currentRoute={route} onNavigate={navigate} />}
    </>
  )
}
