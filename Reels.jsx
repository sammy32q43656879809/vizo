import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ThumbsUp, MessageSquare, Share2, Volume2, VolumeX, ChevronUp, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Reels() {
  const [reels, setReels] = useState([])
  const [idx, setIdx] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('videos').select('*').eq('is_reel', true).order('created_at', { ascending:false })
      .then(({ data }) => setReels(data || []))
  }, [])

  if (reels.length === 0) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - var(--header) - 48px)', flexDirection:'column', gap:12, color:'var(--text3)' }}>
      <Film size={48} />
      <p style={{ fontSize:15 }}>No reels yet</p>
      <p style={{ fontSize:13 }}>Upload a video and check "Upload as Reel"</p>
    </div>
  )

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - var(--header) - 48px)', position:'relative' }}>
      <ReelPlayer reel={reels[idx]} />
      {/* Nav arrows */}
      <div style={{ position:'absolute', right:-48, top:'50%', transform:'translateY(-50%)', display:'flex', flexDirection:'column', gap:8 }}>
        <button onClick={() => setIdx(i => Math.max(0, i-1))} disabled={idx === 0}
          style={{ width:36, height:36, borderRadius:'50%', background:'var(--bg3)', border:'1px solid var(--border)', color: idx===0?'var(--text3)':'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ChevronUp size={18} />
        </button>
        <button onClick={() => setIdx(i => Math.min(reels.length-1, i+1))} disabled={idx === reels.length-1}
          style={{ width:36, height:36, borderRadius:'50%', background:'var(--bg3)', border:'1px solid var(--border)', color: idx===reels.length-1?'var(--text3)':'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <ChevronDown size={18} />
        </button>
      </div>
    </div>
  )
}

function Film({ size }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
}

function ReelPlayer({ reel }) {
  const videoRef = useRef()
  const [muted, setMuted] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(reel.likes || 0)

  useEffect(() => {
    if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play().catch(() => {}) }
  }, [reel])

  const handleLike = async () => {
    setLiked(l => !l)
    setLikes(n => liked ? n-1 : n+1)
  }

  return (
    <div style={{ position:'relative', width:370, height:660, background:'#000', borderRadius:16, overflow:'hidden' }}>
      {reel.video_url
        ? <video ref={videoRef} src={reel.video_url} style={{ width:'100%', height:'100%', objectFit:'cover' }} loop playsInline muted={muted} autoPlay />
        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#444', fontSize:36 }}>▶</div>}

      {/* Overlay bottom info */}
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'60px 14px 16px', background:'linear-gradient(transparent,rgba(0,0,0,.7))', pointerEvents:'none' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <div style={{ width:28, height:28, borderRadius:'50%', background:'#e53935', color:'#fff', fontWeight:700, fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'all' }}>
            {(reel.display_name || reel.username || 'U')[0].toUpperCase()}
          </div>
          <span style={{ fontWeight:600, fontSize:13, color:'#fff' }}>{reel.display_name || reel.username}</span>
        </div>
        <p style={{ fontSize:13, color:'#fff', lineHeight:1.4 }}>{reel.title}</p>
      </div>

      {/* Right actions */}
      <div style={{ position:'absolute', right:12, bottom:80, display:'flex', flexDirection:'column', alignItems:'center', gap:18 }}>
        <ActionBtn icon={<ThumbsUp size={22} fill={liked?'#fff':'none'} />} count={likes} onClick={handleLike} />
        <ActionBtn icon={<MessageSquare size={22} />} count={reel.comment_count || 0} />
        <ActionBtn icon={<Share2 size={22} />} />
        <button onClick={() => setMuted(m => !m)}
          style={{ color:'#fff', background:'rgba(255,255,255,.15)', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      </div>
    </div>
  )
}

function ActionBtn({ icon, count, onClick }) {
  return (
    <button onClick={onClick} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, color:'#fff', background:'none', border:'none' }}>
      <div style={{ background:'rgba(255,255,255,.15)', borderRadius:'50%', width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center' }}>{icon}</div>
      {count !== undefined && <span style={{ fontSize:12 }}>{count}</span>}
    </button>
  )
}
