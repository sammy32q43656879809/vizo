import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ThumbsUp, Share2, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { formatDistanceToNow } from 'date-fns'

export default function Watch() {
  const { id } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [video, setVideo] = useState(null)
  const [comments, setComments] = useState([])
  const [comment, setComment] = useState('')
  const [liked, setLiked] = useState(false)
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User'

  useEffect(() => {
    fetchVideo(); fetchComments()
  }, [id])

  const fetchVideo = async () => {
    const { data } = await supabase.from('videos').select('*').eq('id', id).single()
    if (data) {
      setVideo(data)
      await supabase.from('videos').update({ views: (data.views || 0) + 1 }).eq('id', id)
    }
  }

  const fetchComments = async () => {
    const { data } = await supabase.from('comments').select('*').eq('video_id', id).order('created_at', { ascending:false })
    setComments(data || [])
  }

  const handleLike = async () => {
    if (liked) return
    setLiked(true)
    setVideo(v => ({ ...v, likes: (v.likes||0)+1 }))
    await supabase.from('videos').update({ likes: (video.likes||0)+1 }).eq('id', id)
  }

  const postComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return
    const { data } = await supabase.from('comments').insert({ video_id: id, user_id: user.id, display_name: displayName, content: comment.trim() }).select().single()
    if (data) setComments(c => [data, ...c])
    setComment('')
  }

  if (!video) return <div style={{ textAlign:'center', padding:60, color:'var(--text3)' }}>Loading...</div>

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16, maxWidth:900 }}>
      <button onClick={() => navigate(-1)} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text2)', fontSize:14, width:'fit-content' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Video player */}
      <div style={{ background:'#000', borderRadius:12, overflow:'hidden', aspectRatio:'16/9' }}>
        {video.video_url
          ? <video src={video.video_url} controls style={{ width:'100%', height:'100%', display:'block' }} />
          : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', color:'#444' }}>No video file</div>}
      </div>

      {/* Title + actions */}
      <div>
        <h1 style={{ fontWeight:700, fontSize:20, marginBottom:12 }}>{video.title}</h1>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div onClick={() => navigate(`/channel/${video.user_id}`)}
              style={{ width:36, height:36, borderRadius:'50%', background:'#e53935', color:'#fff', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              {(video.display_name || video.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:14, cursor:'pointer' }} onClick={() => navigate(`/channel/${video.user_id}`)}>{video.display_name || video.username}</div>
              <div style={{ fontSize:12, color:'var(--text2)' }}>{video.views||0} views · {video.created_at ? formatDistanceToNow(new Date(video.created_at), { addSuffix:true }) : ''}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleLike} style={{ display:'flex', alignItems:'center', gap:6, background: liked ? 'var(--red-bg)' : 'var(--bg2)', border:`1px solid ${liked ? 'rgba(229,57,53,.4)':'var(--border)'}`, borderRadius:8, padding:'8px 14px', fontSize:13, color: liked ? 'var(--red)' : 'var(--text2)' }}>
              <ThumbsUp size={15} fill={liked?'currentColor':'none'} /> {video.likes||0}
            </button>
            <button style={{ display:'flex', alignItems:'center', gap:6, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', fontSize:13, color:'var(--text2)' }}>
              <Share2 size={15} /> Share
            </button>
          </div>
        </div>
        {video.description && <p style={{ marginTop:12, fontSize:14, color:'var(--text2)', lineHeight:1.6, background:'var(--bg2)', borderRadius:8, padding:'12px 14px' }}>{video.description}</p>}
      </div>

      {/* Comments */}
      <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
        <h3 style={{ fontWeight:600, fontSize:15, marginBottom:14 }}>{comments.length} Comments</h3>
        <form onSubmit={postComment} style={{ display:'flex', gap:10, marginBottom:20 }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'#e53935', color:'#fff', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            {displayName[0].toUpperCase()}
          </div>
          <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..."
            style={{ flex:1, background:'transparent', border:'none', borderBottom:'1px solid var(--border)', padding:'6px 0', color:'var(--text)', fontSize:14, outline:'none' }} />
          <button type="submit" disabled={!comment.trim()} style={{ background:'var(--red)', color:'#fff', padding:'6px 14px', borderRadius:6, fontSize:13, fontWeight:600, opacity:comment.trim()?1:.4 }}>Post</button>
        </form>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {comments.map(c => (
            <div key={c.id} style={{ display:'flex', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#555', color:'#fff', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {(c.display_name||'U')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:13, marginBottom:3 }}>{c.display_name}</div>
                <div style={{ fontSize:13, color:'var(--text2)', lineHeight:1.5 }}>{c.content}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
