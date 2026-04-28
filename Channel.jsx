import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Radio } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { formatDistanceToNow } from 'date-fns'

const LIVE_REQUIREMENT = 3

export default function Channel() {
  const { userId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [channelProfile, setChannelProfile] = useState(null)
  const [videos, setVideos] = useState([])
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subCount, setSubCount] = useState(0)
  const isOwn = user?.id === userId

  useEffect(() => {
    fetchChannel()
    if (!isOwn) checkSub()
  }, [userId])

  const fetchChannel = async () => {
    const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setChannelProfile(p)
    setSubCount(p?.subscribers || 0)
    const { data: vids } = await supabase.from('videos').select('*').eq('user_id', userId).order('created_at', { ascending:false })
    setVideos(vids || [])
  }

  const checkSub = async () => {
    const { data } = await supabase.from('subscriptions').select('id').eq('subscriber_id', user.id).eq('channel_id', userId).single()
    setIsSubscribed(!!data)
  }

  const toggleSub = async () => {
    if (isOwn) return
    if (isSubscribed) {
      await supabase.from('subscriptions').delete().eq('subscriber_id', user.id).eq('channel_id', userId)
      await supabase.from('profiles').update({ subscribers: Math.max(0, subCount - 1) }).eq('id', userId)
      setSubCount(s => Math.max(0, s-1))
      setIsSubscribed(false)
    } else {
      await supabase.from('subscriptions').insert({ subscriber_id: user.id, channel_id: userId })
      await supabase.from('profiles').update({ subscribers: subCount + 1 }).eq('id', userId)
      setSubCount(s => s+1)
      setIsSubscribed(true)
    }
  }

  if (!channelProfile) return null

  const initial = (channelProfile.display_name || channelProfile.email || 'U')[0].toUpperCase()
  const needed = LIVE_REQUIREMENT - subCount
  const canLive = subCount >= LIVE_REQUIREMENT

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {/* Banner */}
      <div style={{ height:180, background:'linear-gradient(135deg,rgba(229,57,53,.25) 0%,rgba(100,0,0,.15) 50%,#1a1a1a 100%)', borderRadius:12, marginBottom:0, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(circle at 30% 50%,rgba(229,57,53,.15) 0%,transparent 60%)' }} />
      </div>

      {/* Profile info */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:16, padding:'0 16px', marginTop:-40, marginBottom:16, position:'relative', zIndex:1 }}>
        <div style={{ width:80, height:80, borderRadius:'50%', background:'#e53935', color:'#fff', fontWeight:700, fontSize:30, display:'flex', alignItems:'center', justifyContent:'center', border:'4px solid #0f0f0f', flexShrink:0 }}>
          {initial}
        </div>
        <div style={{ flex:1, paddingBottom:8 }}>
          <h2 style={{ fontWeight:700, fontSize:20, marginBottom:4 }}>{channelProfile.display_name || channelProfile.email}</h2>
          <p style={{ color:'var(--text2)', fontSize:13 }}>{subCount} subscriber{subCount !== 1 ? 's' : ''} · {videos.length} video{videos.length !== 1 ? 's' : ''}</p>
        </div>
        {!isOwn && (
          <button onClick={toggleSub} style={{
            background: isSubscribed ? 'var(--bg3)' : 'var(--red)', color: isSubscribed ? 'var(--text2)' : '#fff',
            border: '1px solid', borderColor: isSubscribed ? 'var(--border)' : 'var(--red)',
            padding:'9px 20px', borderRadius:8, fontWeight:600, fontSize:14, marginBottom:8
          }}>
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        )}
      </div>

      {/* Live unlock badge */}
      {!canLive && (
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:20, padding:'7px 14px', fontSize:13, color:'var(--text2)', marginBottom:20, width:'fit-content' }}>
          <Radio size={14} color="var(--text3)" />
          {needed} more subscriber{needed !== 1 ? 's' : ''} to unlock live streaming
        </div>
      )}

      {/* Videos grid */}
      {videos.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text3)', fontSize:14 }}>No videos yet</div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
          {videos.map(v => (
            <div key={v.id} style={{ cursor:'pointer' }} onClick={() => navigate(`/watch/${v.id}`)}>
              <div style={{ aspectRatio:'16/9', background:'#1c1c1c', borderRadius:10, overflow:'hidden', marginBottom:10 }}>
                {v.thumbnail_url
                  ? <img src={v.thumbnail_url} alt={v.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#444', fontSize:28 }}>▶</div>}
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:'#e53935', color:'#fff', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{initial}</div>
                <div>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:2 }}>{v.title}</div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>{channelProfile.display_name || channelProfile.email}</div>
                  <div style={{ fontSize:12, color:'var(--text2)' }}>{v.views||0} views · {v.created_at ? formatDistanceToNow(new Date(v.created_at), { addSuffix:true }) : ''}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
