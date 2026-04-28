import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import Layout from './components/Layout.jsx'
import Auth from './pages/Auth.jsx'
import Home from './pages/Home.jsx'
import Reels from './pages/Reels.jsx'
import Live from './pages/Live.jsx'
import Messages from './pages/Messages.jsx'
import Subscriptions from './pages/Subscriptions.jsx'
import Profile from './pages/Profile.jsx'
import Channel from './pages/Channel.jsx'
import Upload from './pages/Upload.jsx'
import Watch from './pages/Watch.jsx'

const Spinner = () => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0f0f0f'}}>
    <div style={{width:36,height:36,border:'3px solid #2a2a2a',borderTop:'3px solid #e53935',borderRadius:'50%',animation:'spin .7s linear infinite'}}/>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
)

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/auth" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Guard><Layout /></Guard>}>
            <Route index element={<Home />} />
            <Route path="reels" element={<Reels />} />
            <Route path="live" element={<Live />} />
            <Route path="messages" element={<Messages />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="profile" element={<Profile />} />
            <Route path="channel/:userId" element={<Channel />} />
            <Route path="upload" element={<Upload />} />
            <Route path="watch/:id" element={<Watch />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
