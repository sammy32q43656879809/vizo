import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Film } from 'lucide-react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (mode === 'signin') await signIn(email, password)
      else await signUp(email, password, displayName || email.split('@')[0])
      navigate('/')
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const inp = { width:'100%', background:'#1e1e1e', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 14px', color:'#f1f1f1', fontSize:14, outline:'none', display:'block' }
  const lbl = { display:'block', fontSize:13, color:'#aaa', marginBottom:6, fontWeight:500 }

  return (
    <div style={{ minHeight:'100vh', background:'#0f0f0f', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#161616', border:'1px solid #2a2a2a', borderRadius:16, padding:'36px 32px', width:'100%', maxWidth:400 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
          <div style={{ width:38, height:38, background:'#e53935', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Film size={20} color="#fff" />
          </div>
          <span style={{ fontWeight:700, fontSize:22 }}>Vizo</span>
        </div>
        <h1 style={{ fontWeight:700, fontSize:22, marginBottom:6 }}>{mode === 'signin' ? 'Welcome back' : 'Create account'}</h1>
        <p style={{ color:'#888', fontSize:13, marginBottom:24 }}>{mode === 'signin' ? 'Sign in to your account' : 'Join the Vizo community'}</p>

        <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {mode === 'signup' && (
            <div><label style={lbl}>Display Name</label><input style={inp} placeholder="Your name" value={displayName} onChange={e => setDisplayName(e.target.value)} /></div>
          )}
          <div><label style={lbl}>Email</label><input style={inp} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><label style={lbl}>Password</label><input style={inp} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} /></div>
          {error && <div style={{ background:'rgba(229,57,53,.1)', border:'1px solid rgba(229,57,53,.3)', borderRadius:8, padding:'10px 14px', color:'#ff6b6b', fontSize:13 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ background:'#e53935', color:'#fff', padding:'12px', borderRadius:8, fontWeight:600, fontSize:15, marginTop:4, opacity: loading ? .6 : 1 }}>
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign:'center', marginTop:20, fontSize:13, color:'#888' }}>
          {mode === 'signin' ? "Don't have an account? " : "Already have an account? "}
          <button style={{ color:'#e53935', fontWeight:600 }} onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError('') }}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
