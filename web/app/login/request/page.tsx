'use client';
import { useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function RequestMagic() {
  const [email,setEmail]=useState('demo@local.test');
  const [msg,setMsg]=useState('');
  async function submit(e:any){ e.preventDefault(); setMsg('Sending...');
    const r = await fetch(API + '/auth/request-magic',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email })});
    const d = await r.json(); setMsg(d.ok ? 'Check your email.' : JSON.stringify(d));
  }
  return (
    <main>
      <h2>Email Magic Link</h2>
      <form onSubmit={submit}>
        <input value={email} onChange={e=>setEmail(e.target.value)} />{' '}
        <button>Send link</button>
      </form>
      <p>{msg}</p>
    </main>
  );
}
