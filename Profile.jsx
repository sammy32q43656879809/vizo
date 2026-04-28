import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Edit2, Film, Save } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { formatDistanceToNow } from 'date-fns'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('videos')
  const [videos, setVideos] = useState([])
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (profile) setDisplayName(profile.display_name || '')
    supabase.from('videos').select('*').eq('user_id', user.id).order('created_at', { ascending:false })
      .then(({ data }) => setVideos(data || []))
  }, [profile])

  const saveProfile = async () => {
    setSaving(true)
    await supabase.from('profiles').update({ display_name: displayName }).eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const deleteVideo = async (id) => {
    if (!confirm('Delete this video?')) return
    await supabase.from('videos').delete().eq('id', id)
    setVideos(v => v.filter(x => x.id !== id))
  }

  const initial = (profile?.display_name || user?.email || 'U')[0].toUpperCase()

  const tabBtn = (t, label, Icon) => (
    <button onClick={() => setTab(t)} style={{
      display:'flex', alignItems:'center', gap:7, padding:'8px 16px', borderRadius:8, fontSize:13, fontWeight:500,
      background: tab === t ? 'var(--bg3)' : 'transparent',
      color: tab === t ? 'var(--text)' : 'var(--text2)',
      border: '1px solid', borderColor: tab === t ? 'var(--border2)' : 'transparent'
    }}>
      <Icon size={15} /> {label}
    </button>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      {/* Tabs */}
      <div style={{ display:'flex', gap:8 }}>
        {tabBtn('edit', 'Edit Profile', Edit2)}
        {tabBtn('videos', 'My Videos', Film)}
      </div>

      {tab === 'edit' && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, paddingTop:20 }}>
          {/* Avatar */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, cursor:'pointer' }}>
            <div style={{ width:96, height:96, borderRadius:'50%', background:'rgba(229,57,53,.3)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, fontWeight:700, color:'#e53935', border:'2px solid rgba(229,57,53,.3)' }}>
              {initial}
            </div>
            <span style={{ fontSize:12, color:'var(--text3)' }}>Click to change avatar</span>
          </div>

          <div style={{ width:'100%', maxWidth:400 }}>
            <label style={{ display:'block', fontSize:13, color:'var(--text2)', marginBottom:8, fontWeight:500 }}>Display Name</label>
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={{ width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:14, outline:'none', marginBottom:14 }}
            />
            <button onClick={saveProfile} disabled={saving} style={{ width:'100%', background:'var(--red)', color:'#fff', padding:12, borderRadius:8, fontWeight:600, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <Save size={16} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {tab === 'videos' && (
        <div>
          {videos.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
              <Film size={40} strokeWidth={1} style={{ display:'block', margin:'0 auto 12px' }} />
              <p style={{ fontSize:15 }}>No videos yet</p>
              <button onClick={() => navigate('/upload')} style={{ marginTop:12, background:'var(--red)', color:'#fff', padding:'9px 20px', borderRadius:8, fontSize:14, fontWeight:600 }}>Upload a Video</button>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:16 }}>
              {videos.map(v => (
                <div key={v.id} style={{ background:'var(--bg)', border:'1px solid var(--border)', borderRadius:10, overflow:'hidden' }}>
                  <div onClick={() => navigate(`/watch/${v.id}`)} style={{ aspectRatio:'16/9', background:'#1c1c1c', cursor:'pointer', position:'relative', overflow:'hidden' }}>
                    {v.thumbnail_url
                      ? <img src={v.thumbnail_url} alt={v.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                      : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#444', fontSize:28 }}>▶</div>}
                  </div>
                  <div style={{ padding:10 }}>
                    <div onClick={() => navigate(`/watch/${v.id}`)} style={{ fontWeight:600, fontSize:13, marginBottom:4, cursor:'pointer', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.title}</div>
                    <div style={{ fontSize:12, color:'var(--text2)', marginBottom:8 }}>{v.views||0} views · {v.created_at ? formatDistanceToNow(new Date(v.created_at), { addSuffix:true }) : ''}</div>
                    <button onClick={() => deleteVideo(v.id)} style={{ fontSize:12, color:'#ff6b6b', background:'rgba(229,57,53,.1)', border:'1px solid rgba(229,57,53,.2)', borderRadius:6, padding:'4px 10px' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
