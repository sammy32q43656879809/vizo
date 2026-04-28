import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, Film } from 'lucide-react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'

const CATS = ['Gaming','Music','Education','Entertainment','Sports','Tech','Vlogs','Other']

export default function UploadPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [thumb, setThumb] = useState(null)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [cat, setCat] = useState('Other')
  const [isReel, setIsReel] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileRef = useRef()
  const thumbRef = useRef()

  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User'

  const inp = { width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:14, outline:'none' }
  const lbl = { display:'block', fontSize:14, fontWeight:500, marginBottom:8 }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) return
    setUploading(true); setProgress(10)

    try {
      const ext = file.name.split('.').pop()
      const path = `videos/${user.id}/${Date.now()}.${ext}`
      setProgress(20)
      const { error: ve } = await supabase.storage.from('videos').upload(path, file)
      if (ve) throw ve
      setProgress(60)
      const { data: { publicUrl: videoUrl } } = supabase.storage.from('videos').getPublicUrl(path)

      let thumbnailUrl = null
      if (thumb) {
        const tPath = `thumbnails/${user.id}/${Date.now()}.${thumb.name.split('.').pop()}`
        await supabase.storage.from('videos').upload(tPath, thumb)
        const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(tPath)
        thumbnailUrl = publicUrl
      }
      setProgress(80)

      await supabase.from('videos').insert({
        user_id: user.id, display_name: displayName, username: displayName,
        title, description: desc, category: cat,
        video_url: videoUrl, thumbnail_url: thumbnailUrl,
        is_reel: isReel, views: 0, likes: 0
      })
      setProgress(100)
      setTimeout(() => navigate('/'), 500)
    } catch (err) {
      console.error(err)
      setUploading(false)
    }
  }

  return (
    <div style={{ maxWidth:680, margin:'0 auto', paddingBottom:40 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:24 }}>
        <div style={{ width:44, height:44, background:'var(--red-bg)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Upload size={22} color="var(--red)" />
        </div>
        <div>
          <h2 style={{ fontWeight:700, fontSize:20 }}>Upload Video</h2>
          <p style={{ color:'var(--text2)', fontSize:13 }}>Share your content with the world</p>
        </div>
      </div>

      <form onSubmit={handleUpload} style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {/* Drop zone */}
        <div onClick={() => fileRef.current.click()}
          style={{ border:`2px dashed ${file ? 'var(--red)' : 'var(--border)'}`, borderRadius:12, padding:'40px 20px', textAlign:'center', cursor:'pointer', background: file ? 'var(--red-bg)' : 'var(--bg2)', transition:'all .15s' }}>
          {file ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
              <Film size={32} color="var(--red)" />
              <div style={{ fontWeight:600, fontSize:14 }}>{file.name}</div>
              <div style={{ color:'var(--text2)', fontSize:13 }}>{(file.size/1024/1024).toFixed(1)} MB</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, color:'var(--text3)' }}>
              <Film size={36} />
              <div style={{ fontSize:15, color:'var(--text2)', fontWeight:500 }}>Click to select a video</div>
              <div style={{ fontSize:13 }}>MP4, WebM, MOV</div>
            </div>
          )}
          <input ref={fileRef} type="file" accept="video/*" hidden onChange={e => setFile(e.target.files[0])} />
        </div>

        {/* Thumbnail */}
        <div>
          <label style={lbl}>Thumbnail (optional)</label>
          <div style={{ display:'flex', alignItems:'center', gap:0 }}>
            <button type="button" onClick={() => thumbRef.current.click()}
              style={{ background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'6px 0 0 6px', padding:'9px 14px', fontSize:13, color:'var(--text2)', fontWeight:500 }}>
              Choose File
            </button>
            <div style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--border)', borderLeft:'none', borderRadius:'0 6px 6px 0', padding:'9px 14px', fontSize:13, color:'var(--text3)' }}>
              {thumb ? thumb.name : 'No file chosen'}
            </div>
            <input ref={thumbRef} type="file" accept="image/*" hidden onChange={e => setThumb(e.target.files[0])} />
          </div>
        </div>

        {/* Title */}
        <div>
          <label style={lbl}>Title</label>
          <input style={inp} placeholder="Give your video a catchy title" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>

        {/* Description */}
        <div>
          <label style={lbl}>Description</label>
          <textarea style={{ ...inp, resize:'vertical', minHeight:120 }} placeholder="Tell viewers about your video" value={desc} onChange={e => setDesc(e.target.value)} />
        </div>

        {/* Category */}
        <div>
          <label style={lbl}>Category</label>
          <select style={{ ...inp, cursor:'pointer' }} value={cat} onChange={e => setCat(e.target.value)}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Upload as Reel toggle */}
        <div onClick={() => setIsReel(r => !r)}
          style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 16px', cursor:'pointer' }}>
          <div>
            <div style={{ fontWeight:500, fontSize:14 }}>Upload as Reel</div>
            <div style={{ fontSize:12, color:'var(--text2)', marginTop:2 }}>Short vertical video (under 60 seconds)</div>
          </div>
          <div style={{ width:40, height:22, borderRadius:11, background: isReel ? 'var(--red)' : 'var(--bg4)', position:'relative', transition:'background .2s', flexShrink:0 }}>
            <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left: isReel ? 20 : 2, transition:'left .2s' }} />
          </div>
        </div>

        {/* Progress */}
        {uploading && (
          <div style={{ background:'var(--bg2)', borderRadius:6, overflow:'hidden', height:4 }}>
            <div style={{ width:`${progress}%`, height:'100%', background:'var(--red)', transition:'width .3s' }} />
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={uploading || !file || !title}
          style={{ background:'var(--red)', color:'#fff', padding:14, borderRadius:8, fontWeight:600, fontSize:15, display:'flex', alignItems:'center', justifyContent:'center', gap:8, opacity: (uploading||!file||!title) ? .5 : 1 }}>
          <Upload size={18} />
          {uploading ? `Uploading... ${progress}%` : 'Upload Video'}
        </button>
      </form>
    </div>
  )
}
