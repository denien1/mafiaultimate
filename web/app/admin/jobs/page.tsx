
'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export default function Jobs(){
  const [jobs,setJobs]=useState<any[]>([]);
  const [form,setForm]=useState<any>({name:'New Job', tier:1, energy_cost:1, reward_xp:1, reward_cash:10, req_items:'[]'});
  const token = typeof window!=='undefined'?localStorage.getItem('token'):null;
  async function load(){ const r = await fetch(API+'/admin/editor/jobs',{ headers: token?{Authorization:`Bearer ${token}`}:{}}).then(r=>r.json()); setJobs(r||[]); }
  useEffect(()=>{ load(); },[]);
  async function create(){ await fetch(API+'/admin/editor/jobs',{ method:'POST', headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) }, body: JSON.stringify(form)}); load(); }
  return (<main>
    <h2>Jobs Editor</h2>
    <pre style={{background:'#f7f7f7',padding:12}}>{JSON.stringify(jobs,null,2)}</pre>
    <h3>Create</h3>
    <pre>{JSON.stringify(form,null,2)}</pre>
    <button onClick={create}>Create</button>
  </main>);
}
