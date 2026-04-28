import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { formatDistanceToNow } from 'date-fns'

export default function Subscriptions() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      // Get channels user subscribes to
      const { data: subs } = await supabase.from('subscriptions').select('channel_id').eq('subscriber_id', user.id)
      if (!subs || subs.length === 0) { setLoading(false); return }
      const channelIds = subs.map(s => s.channel_id)
      const { data } = await supabase.from('videos').select('*').in('user_id', channelIds).order('created_at', { ascending:false })
      setVideos(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:40, height:40, background:'var(--red-bg)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Heart size={20} color="var(--red)" fill="var(--red)" />
        </div>
        <div>
          <h2 style={{ fontWeight:700, fontSize:20 }}>Subscriptions</h2>
          <p style={{ color:'var(--text2)', fontSize:13 }}>Latest from channels you follow</p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:'40px', color:'var(--text3)' }}>Loading...</div>
      ) : videos.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'var(--text3)', fontSize:14 }}>
          No videos from your subscriptions
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {videos.map(v => (
            <div key={v.id} style={{ cursor:'pointer' }} onClick={() => navigate(`/watch/${v.id}`)}>
              <div style={{ aspectRatio:'16/9', background:'#1c1c1c', borderRadius:10, overflow:'hidden', maxWidth:380, marginBottom:10 }}>
                {v.thumbnail_url
                  ? <img src={v.thumbnail_url} alt={v.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#444', fontSize:28 }}>▶</div>}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <div onClick={e => { e.stopPropagation(); navigate(`/channel/${v.user_id}`) }}
                  style={{ width:32, height:32, borderRadius:'50%', background:'#e53935', color:'#fff', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer' }}>
                  {(v.display_name || v.username || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:3 }}>{v.title}</div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>{v.display_name || v.username}</div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>{v.views || 0} views · {v.created_at ? formatDistanceToNow(new Date(v.created_at), { addSuffix:true }) : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
