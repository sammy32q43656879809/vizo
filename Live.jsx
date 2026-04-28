import { useAuth } from '../hooks/useAuth.jsx'
import { Radio } from 'lucide-react'

const LIVE_SUB_REQUIREMENT = 3

export default function Live() {
  const { profile } = useAuth()
  const subs = profile?.subscribers || 0
  const canLive = subs >= LIVE_SUB_REQUIREMENT
  const needed = LIVE_SUB_REQUIREMENT - subs

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:40, height:40, background:'var(--red-bg)', borderRadius:10, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Radio size={20} color="var(--red)" />
          </div>
          <div>
            <h2 style={{ fontWeight:700, fontSize:20 }}>Live Streams</h2>
            <p style={{ color:'var(--text2)', fontSize:13 }}>Watch creators streaming right now</p>
          </div>
        </div>
        {!canLive && (
          <div style={{ color:'var(--text2)', fontSize:13 }}>
            {needed} more subs to unlock live
          </div>
        )}
      </div>

      {/* Empty state */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:12, padding:'80px 20px', color:'var(--text3)', textAlign:'center' }}>
        <div style={{ fontSize:40, opacity:.3 }}>
          <Radio size={52} />
        </div>
        <p style={{ fontSize:15, color:'var(--text2)' }}>No one is live right now</p>
        <p style={{ fontSize:13 }}>Check back later!</p>

        {canLive ? (
          <button style={{ marginTop:12, background:'var(--red)', color:'#fff', padding:'10px 24px', borderRadius:8, fontWeight:600, fontSize:14 }}>
            Go Live
          </button>
        ) : (
          <div style={{ marginTop:12, background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:10, padding:'14px 20px', fontSize:13, color:'var(--text2)', maxWidth:320 }}>
            You need <strong style={{ color:'var(--text)' }}>{needed} more subscriber{needed !== 1 ? 's' : ''}</strong> to unlock live streaming.
          </div>
        )}
      </div>
    </div>
  )
}
