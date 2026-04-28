import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.jsx'
import { MessageSquare, Plus, Send, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export default function Messages() {
  const { user, profile } = useAuth()
  const [convos, setConvos] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [newModal, setNewModal] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newError, setNewError] = useState('')
  const bottomRef = useRef()
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User'

  useEffect(() => { fetchConvos() }, [])

  useEffect(() => {
    if (active) {
      fetchMessages(active)
      const ch = supabase.channel(`dm-${active.id}`)
        .on('postgres_changes', { event:'INSERT', schema:'public', table:'direct_messages', filter:`conversation_id=eq.${active.id}` }, payload => {
          setMessages(m => [...m, payload.new])
        })
        .subscribe()
      return () => supabase.removeChannel(ch)
    }
  }, [active])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const fetchConvos = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*, direct_messages(content, created_at)')
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .order('updated_at', { ascending:false })
    setConvos(data || [])
  }

  const fetchMessages = async (convo) => {
    const { data } = await supabase.from('direct_messages').select('*').eq('conversation_id', convo.id).order('created_at')
    setMessages(data || [])
  }

  const getOtherName = (convo) => {
    if (!convo) return ''
    return user.id === convo.user1_id ? (convo.user2_name || convo.user2_email) : (convo.user1_name || convo.user1_email)
  }

  const getOtherInitial = (convo) => (getOtherName(convo) || 'U')[0].toUpperCase()

  const send = async (e) => {
    e.preventDefault()
    if (!input.trim() || !active) return
    const content = input.trim()
    setInput('')
    await supabase.from('direct_messages').insert({ conversation_id: active.id, sender_id: user.id, sender_name: displayName, content })
    await supabase.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', active.id)
  }

  const startNewConvo = async () => {
    setNewError('')
    if (!newEmail.trim()) return
    if (newEmail.trim() === user.email) { setNewError("That's you!"); return }
    const { data: target } = await supabase.from('profiles').select('*').eq('email', newEmail.trim()).single()
    if (!target) { setNewError('User not found'); return }
    // Check if convo exists
    const { data: existing } = await supabase.from('conversations')
      .select('*')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${target.id}),and(user1_id.eq.${target.id},user2_id.eq.${user.id})`)
      .single()
    if (existing) { setActive(existing); setNewModal(false); setNewEmail(''); return }
    const { data: convo } = await supabase.from('conversations').insert({
      user1_id: user.id, user1_email: user.email, user1_name: displayName,
      user2_id: target.id, user2_email: target.email, user2_name: target.display_name
    }).select().single()
    if (convo) { setConvos(c => [convo, ...c]); setActive(convo) }
    setNewModal(false); setNewEmail('')
  }

  return (
    <div style={{ display:'flex', height:'calc(100vh - var(--header) - 48px)', gap:0, overflow:'hidden', margin:'-24px', border:'1px solid var(--border)', borderRadius:12 }}>
      {/* Left panel */}
      <div style={{ width:320, background:'var(--bg)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 16px 12px', borderBottom:'1px solid var(--border)' }}>
          <h3 style={{ fontWeight:700, fontSize:16 }}>Messages</h3>
          <button onClick={() => setNewModal(true)} style={{ width:28, height:28, borderRadius:6, background:'var(--bg3)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text2)' }}>
            <Plus size={16} />
          </button>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {convos.length === 0 ? (
            <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--text3)', fontSize:13 }}>No conversations yet. Hit + to start one.</div>
          ) : convos.map(c => (
            <div key={c.id} onClick={() => setActive(c)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', cursor:'pointer', background: active?.id === c.id ? 'var(--bg3)' : 'transparent', borderBottom:'1px solid var(--border)', transition:'background .12s' }}>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'#e53935', color:'#fff', fontWeight:700, fontSize:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {getOtherInitial(c)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{getOtherName(c)}</div>
                <div style={{ fontSize:12, color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{(c.direct_messages?.[0] || {}).content || ''}</div>
              </div>
              <div style={{ fontSize:11, color:'var(--text3)', flexShrink:0 }}>
                {c.updated_at ? formatDistanceToNow(new Date(c.updated_at), { addSuffix:false }).replace(' ago','') : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', background:'var(--bg)', minWidth:0 }}>
        {active ? (
          <>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:'#e53935', color:'#fff', fontWeight:700, fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {getOtherInitial(active)}
              </div>
              <span style={{ fontWeight:600, fontSize:15 }}>{getOtherName(active)}</span>
            </div>
            <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:8 }}>
              {messages.map(m => (
                <div key={m.id} style={{ display:'flex', justifyContent: m.sender_id === user.id ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    background: m.sender_id === user.id ? 'var(--red)' : 'var(--bg3)',
                    color: '#fff', padding:'10px 14px', borderRadius:12,
                    maxWidth:'65%', fontSize:14, lineHeight:1.5
                  }}>
                    {m.content}
                    <div style={{ fontSize:10, color:'rgba(255,255,255,.5)', marginTop:4, textAlign:'right' }}>
                      {m.created_at ? formatDistanceToNow(new Date(m.created_at), { addSuffix:true }) : ''}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={send} style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:8 }}>
              <input
                value={input} onChange={e => setInput(e.target.value)}
                placeholder="Type a message..."
                style={{ flex:1, background:'var(--bg2)', border:'1px solid var(--red)', borderRadius:20, padding:'10px 16px', color:'var(--text)', fontSize:14, outline:'none' }}
              />
              <button type="submit" disabled={!input.trim()} style={{ width:40, height:40, borderRadius:'50%', background:'var(--red)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, opacity: input.trim() ? 1 : .4 }}>
                <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, color:'var(--text3)' }}>
            <MessageSquare size={48} strokeWidth={1} />
            <p style={{ fontSize:15, color:'var(--text2)' }}>Select a conversation</p>
            <p style={{ fontSize:13 }}>or hit + to start one</p>
          </div>
        )}
      </div>

      {/* New conversation modal */}
      {newModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100 }}>
          <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:14, padding:24, width:360 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <h3 style={{ fontWeight:700, fontSize:16 }}>New Message</h3>
              <button onClick={() => { setNewModal(false); setNewEmail(''); setNewError('') }}><X size={18} color="var(--text2)" /></button>
            </div>
            <input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Enter user's email"
              style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:8, padding:'10px 14px', color:'var(--text)', fontSize:14, outline:'none', marginBottom:8 }} />
            {newError && <p style={{ color:'#ff6b6b', fontSize:13, marginBottom:8 }}>{newError}</p>}
            <button onClick={startNewConvo} style={{ width:'100%', background:'var(--red)', color:'#fff', padding:11, borderRadius:8, fontWeight:600, fontSize:14 }}>Start Conversation</button>
          </div>
        </div>
      )}
    </div>
  )
}
