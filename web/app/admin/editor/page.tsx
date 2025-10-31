
'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Editor() {
  const [files,setFiles]=useState<string[]>([]);
  const [name,setName]=useState('sample-event.yaml');
  const [content,setContent]=useState('');
  const token = typeof window!=='undefined'?localStorage.getItem('token'):null;
  async function loadList(){ const r = await fetch(API+'/admin/liveops/files',{ headers: token?{Authorization:`Bearer ${token}`}:{}}).then(r=>r.json()); setFiles(r.files||[]); }
  async function loadFile(n:string){ setName(n); const r = await fetch(API+'/admin/liveops/files/'+n,{ headers: token?{Authorization:`Bearer ${token}`}:{}}).then(r=>r.json()); setContent(r.content||''); }
  async function save(){ const r = await fetch(API+'/admin/liveops/files/'+name,{ method:'POST', headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) }, body: JSON.stringify({ content, message: 'Update via Admin UI' })}).then(r=>r.json()); alert(JSON.stringify(r)); }
  useEffect(()=>{ loadList(); },[]);
  return (
    <main>
      <h2>Event YAML Editor</h2>
      <div style={{display:'flex', gap:16}}>
        <div style={{minWidth:220}}>
          <b>Files</b>
          <ul>
            {files.map(f=>(<li key={f}><a href="#" onClick={()=>loadFile(f)}>{f}</a></li>))}
          </ul>
        </div>
        <div style={{flex:1}}>
          <div><b>{name}</b></div>
          <textarea value={content} onChange={e=>setContent(e.target.value)} style={{width:'100%', height:400}}/>
          <div><button onClick={save}>Save</button></div>
        </div>
      </div>
    </main>
  );
}
