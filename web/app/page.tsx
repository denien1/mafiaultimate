'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Home() {
  const [token,setToken]=useState<string|null>(null);
  const [me,setMe]=useState<any>(null);
  const [stats,setStats]=useState<any>(null);
  const [jobs,setJobs]=useState<any[]>([]);

  useEffect(()=>{
    const t = localStorage.getItem('token');
    if (t) { setToken(t); fetchMe(t); fetchStats(t); }
    fetch(`${API}/jobs`).then(r=>r.json()).then(d=>setJobs(d.jobs||[]));
  },[]);

  async function fetchMe(t:string){
    const r = await fetch(`${API}/me`,{ headers: { Authorization: `Bearer ${t}` }});
    setMe(await r.json());
  }
  async function fetchStats(t:string){
    const r = await fetch(`${API}/me/stats`,{ headers: { Authorization: `Bearer ${t}` }});
    setStats(await r.json());
  }
  async function runJob(id:number){
    if(!token) return alert('login first');
    const r = await fetch(`${API}/jobs/${id}/run`,{ method:'POST', headers: { Authorization:`Bearer ${token}` }});
    const d = await r.json();
    alert(JSON.stringify(d));
    fetchMe(token); fetchStats(token);
  }

  return (
    <main>
      <p>Welcome to a clean-room Mafia‑like RPG starter. Login, run a job, watch stats and cash change.</p>
      <section style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <div>
          <h2>Your Profile</h2>
          <pre style={{ background:'#f7f7f7', padding:12 }}>{JSON.stringify(me, null, 2)}</pre>
        </div>
        <div>
          <h2>Your Stats</h2>
          <pre style={{ background:'#f7f7f7', padding:12 }}>{JSON.stringify(stats, null, 2)}</pre>
        </div>
      </section>
      <h2 style={{ marginTop:24 }}>Jobs</h2>
      <ul>
        {jobs.map(j => (
          <li key={j.id} style={{ margin:'8px 0' }}>
            <b>{j.name}</b> — energy {j.energy_cost} → +XP {j.reward_xp}, +$ {j.reward_cash}
            <button onClick={()=>runJob(j.id)} style={{ marginLeft:8 }}>Run</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
