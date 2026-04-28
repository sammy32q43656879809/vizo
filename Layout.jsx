import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Home, Film, Radio, MessageSquare, Heart, User, Upload, Search, Bell, ChevronDown, Shield } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

const NAV = [
  { to: '/', icon: Home, label: 'Home', end: true },
  { to: '/reels', icon: Film, label: 'Reels' },
  { to: '/live', icon: Radio, label: 'Live' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/subscriptions', icon: Heart, label: 'Subscriptions' },
  { to: '/profile', icon: User, label: 'Profile' },
]

const s = {
  app: { display:'flex', height:'100vh', background:'var(--bg)', overflow:'hidden' },

  // Sidebar
  sidebar: { width:'var(--sidebar)', background:'var(--bg)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', alignItems:'center', padding:'8px 0', flexShrink:0, zIndex:10 },
  logoWrap: { display:'flex', alignItems:'center', justifyContent:'center', padding:'10px 0 14px' },
  logoBox: { width:36, height:36, background:'var(--red)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' },
  nav: { display:'flex', flexDirection:'column', gap:2, flex:1, width:'100%', padding:'0 6px' },
  navItem: (active) => ({
    display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px 8px',
    borderRadius:8, color: active ? 'var(--text)' : 'var(--text3)',
    background: active ? 'var(--bg3)' : 'transparent',
    fontSize:9, fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase', transition:'all .15s', textDecoration:'none'
  }),
  adminLink: { display:'flex', flexDirection:'column', alignItems:'center', gap:4, padding:'10px 4px 8px', borderRadius:8, color:'var(--text3)', fontSize:9, fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase', marginTop:'auto', marginBottom:4 },

  // Main
  main: { flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 },

  // Header
  header: { height:'var(--header)', background:'var(--bg)', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', padding:'0 16px', gap:12, flexShrink:0 },
  headerLogo: { display:'flex', alignItems:'center', gap:8, fontWeight:700, fontSize:16, minWidth:80 },
  headerLogoBox: { width:30, height:30, background:'var(--red)', borderRadius:7, display:'flex', alignItems:'center', justifyContent:'center' },
  searchWrap: { flex:1, maxWidth:480, position:'relative' },
  searchIcon: { position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', pointerEvents:'none' },
  searchInput: { width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:20, padding:'7px 16px 7px 36px', color:'var(--text)', fontSize:14, outline:'none' },
  headerRight: { display:'flex', alignItems:'center', gap:8, marginLeft:'auto' },
  iconBtn: { width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)', background:'transparent', transition:'background .15s' },
  uploadBtn: { width:34, height:34, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)', background:'transparent', transition:'background .15s' },
  avatarBtn: { width:34, height:34, borderRadius:'50%', background:'var(--red)', color:'#fff', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', border:'none' },

  // Dropdown
  dropdown: { position:'absolute', top:'calc(100% + 8px)', right:0, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, width:220, zIndex:100, overflow:'hidden', boxShadow:'0 8px 24px rgba(0,0,0,.4)' },
  dropUser: { padding:'14px 16px', borderBottom:'1px solid var(--border)' },
  dropName: { fontWeight:600, fontSize:14 },
  dropEmail: { color:'var(--text3)', fontSize:12, marginTop:2 },
  dropItem: { display:'flex', alignItems:'center', gap:10, padding:'10px 16px', color:'var(--text2)', fontSize:14, width:'100%', textAlign:'left', transition:'background .12s' },

  content: { flex:1, overflowY:'auto', padding:'24px' },
}

export default function Layout() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef()

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User'
  const initial = displayName[0].toUpperCase()

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSignOut = async () => { await signOut(); navigate('/auth') }

  return (
    <div style={s.app}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.logoWrap}>
          <div style={s.logoBox}>
            <Film size={18} color="#fff" />
          </div>
        </div>
        <nav style={s.nav}>
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} style={({ isActive }) => s.navItem(isActive)}>
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={s.adminLink}>
          <Shield size={18} />
          Admin
        </div>
      </aside>

      {/* Main */}
      <div style={s.main}>
        {/* Header */}
        <header style={s.header}>
          <div style={s.headerLogo} onClick={() => navigate('/')} role="button">
            <div style={s.headerLogoBox}><Film size={16} color="#fff" /></div>
            Vizo
          </div>
          <div style={s.searchWrap}>
            <Search size={15} style={s.searchIcon} />
            <input
              style={s.searchInput}
              placeholder="Search videos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && navigate(`/?q=${search}`)}
            />
          </div>
          <div style={s.headerRight}>
            <button style={s.uploadBtn} onClick={() => navigate('/upload')} title="Upload">
              <Upload size={20} />
            </button>
            <button style={s.iconBtn} onClick={() => navigate('/messages')} title="Messages">
              <MessageSquare size={20} />
            </button>
            <div style={{ position:'relative' }} ref={dropRef}>
              <button style={s.avatarBtn} onClick={() => setDropOpen(v => !v)}>{initial}</button>
              {dropOpen && (
                <div style={s.dropdown}>
                  <div style={s.dropUser}>
                    <div style={s.dropName}>{displayName}</div>
                    <div style={s.dropEmail}>{user?.email}</div>
                  </div>
                  <button style={s.dropItem} onClick={() => { setDropOpen(false); navigate('/profile') }}>
                    <User size={15} /> Your Profile
                  </button>
                  <button style={s.dropItem} onClick={() => { setDropOpen(false); navigate(`/channel/${user?.id}`) }}>
                    <Film size={15} /> Your Channel
                  </button>
                  <button style={{ ...s.dropItem, color:'#ff6b6b', borderTop:'1px solid var(--border)' }} onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main style={s.content}>
          <Outlet context={{ search }} />
        </main>
      </div>
    </div>
  )
}
