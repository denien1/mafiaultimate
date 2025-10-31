
'use client';
import { useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
export default function Tools(){
  const [loot,setLoot]=useState([{item_id:1, weight:60},{item_id:2,weight:30},{item_id:3,weight:10}]);
  const [runs,setRuns]=useState(1000);
  const [result,setResult]=useState<any>(null);
  const token = typeof window!=='undefined'?localStorage.getItem('token'):null;
  async function sim(){ const r = await fetch(API+'/admin/tools/drop-sim',{ method:'POST', headers:{'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) }, body: JSON.stringify({ loot, runs })}).then(r=>r.json()); setResult(r); }
  return (<main>
    <h2>Drop Rate Simulator</h2>
    <pre style={{background:'#f7f7f7',padding:12}}>{JSON.stringify(loot,null,2)}</pre>
    <input type="number" value={runs} onChange={e=>setRuns(Number(e.target.value)||0)} />
    <button onClick={sim}>Simulate</button>
    <pre style={{background:'#f7f7f7',padding:12}}>{JSON.stringify(result,null,2)}</pre>
  </main>);
}
