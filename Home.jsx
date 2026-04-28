import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { Eye } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { formatDistanceToNow } from 'date-fns'

const CATS = ['All','Gaming','Music','Education','Entertainment','Sports','Tech','Vlogs']

export default function Home() {
  const { user } = useAuth()
  const { search } = useOutletContext()
  const navigate = useNavigate()
  const [cat, setCat] = useState('All')
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalViews, setTotalViews] = useState(0)
  const [videoCount, setVideoCount] = useState(0)

  useEffect(() => { fetchAll() }, [cat, search])

  const fetchAll = async () => {
    setLoading(true)
    let q = supabase.from('videos').select('*').order('created_at', { ascending: false })
    if (cat !== 'All') q = q.eq('category', cat)
    if (search) q = q.ilike('title', `%${search}%`)
    const { data } = await q
    const vids = data || []
    setVideos(vids)
    setTotalViews(vids.reduce((s, v) => s + (v.views || 0), 0))
    setVideoCount(vids.length)
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      {/* Stats banner */}
      <div style={{ background:'linear-gradient(135deg,rgba(229,57,53,.15) 0%,rgba(229,57,53,.04) 100%)', border:'1px solid rgba(229,57,53,.2)', borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:40, height:40, background:'rgba(229,57,53,.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Eye size={18} color="#e53935" />
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:26, color:'#e53935', lineHeight:1 }}>{totalViews}</div>
            <div style={{ fontSize:13, color:'#aaa', marginTop:2 }}>total views on Vizo</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'#aaa' }}>
          <span style={{ width:8, height:8, background:'#4caf50', borderRadius:'50%', display:'inline-block' }} />
          {videoCount} video{videoCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Category pills */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding:'6px 16px', borderRadius:20, fontSize:13, fontWeight:500, cursor:'pointer', border:'1px solid var(--border)',
            background: cat === c ? '#f1f1f1' : 'var(--bg2)',
            color: cat === c ? '#0f0f0f' : '#aaa',
            transition:'all .15s'
          }}>{c}</button>
        ))}
      </div>

      {/* Videos */}
      {loading ? (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ background:'var(--bg2)', borderRadius:10, overflow:'hidden', border:'1px solid var(--border)' }}>
              <div style={{ aspectRatio:'16/9', background:'#1e1e1e', animation:'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ padding:'10px 12px 12px' }}>
                <div style={{ height:12, background:'#1e1e1e', borderRadius:4, marginBottom:6, width:'80%' }} />
                <div style={{ height:10, background:'#1e1e1e', borderRadius:4, width:'50%' }} />
              </div>
            </div>
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>
        </div>
      ) : videos.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)' }}>
          <p style={{ fontSize:15, marginBottom:8 }}>No videos yet</p>
          <p style={{ fontSize:13 }}>Be the first to upload!</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
          {videos.map(v => <VideoCard key={v.id} v={v} onClick={() => navigate(`/watch/${v.id}`)} onChannel={() => navigate(`/channel/${v.user_id}`)} />)}
        </div>
      )}
    </div>
  )
}

function VideoCard({ v, onClick, onChannel }) {
  return (
    <div style={{ background:'var(--bg)', borderRadius:10, overflow:'hidden', cursor:'pointer' }} onClick={onClick}>
      <div style={{ aspectRatio:'16/9', background:'#1c1c1c', position:'relative', overflow:'hidden' }}>
        {v.thumbnail_url
          ? <img src={v.thumbnail_url} alt={v.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#444', fontSize:28 }}>▶</div>}
      </div>
      <div style={{ display:'flex', gap:10, padding:'10px 0 4px' }}>
        <div onClick={e => { e.stopPropagation(); onChannel() }} style={{ width:32, height:32, borderRadius:'50%', background:'#e53935', color:'#fff', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }}>
          {(v.display_name || v.username || 'U')[0].toUpperCase()}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:600, fontSize:14, lineHeight:1.3, marginBottom:4, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{v.title}</div>
          <div style={{ fontSize:12, color:'var(--text2)' }}>{v.display_name || v.username || 'Unknown'}</div>
          <div style={{ fontSize:12, color:'var(--text2)' }}>{v.views || 0} views · {v.created_at ? formatDistanceToNow(new Date(v.created_at), { addSuffix:true }) : ''}</div>
        </div>
      </div>
    </div>
  )
}
