'use client';
import { useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Login() {
  const [email,setEmail]=useState('demo@local.test');
  const [name,setName]=useState('Demo');

  async function devLogin(e:any){
    e.preventDefault();
    const r = await fetch(`${API}/auth/dev-login`,{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email, displayName: name }) });
    const d = await r.json();
    if (d.token) { localStorage.setItem('token', d.token); window.location.href = '/'; }
    else alert(JSON.stringify(d));
  }

  return (
    <main>
      <h2>Dev Login</h2>
      <form onSubmit={devLogin}>
        <label>Email&nbsp;<input value={email} onChange={e=>setEmail(e.target.value)} /></label><br/>
        <label>Display Name&nbsp;<input value={name} onChange={e=>setName(e.target.value)} /></label><br/>
        <button type="submit">Sign in (Dev)</button>
      </form>
    </main>
  );
}
