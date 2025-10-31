'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Store() {
  const [skus,setSkus]=useState<any[]>([]);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  useEffect(()=>{ fetch(API+'/store').then(r=>r.json()).then(d=>setSkus(d.skus||[])) },[]);
  async function buyHard(itemId:number){
    const r = await fetch(API + '/stripe/create-checkout-session',{ method:'POST', headers:{ 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`}:{}) }, body: JSON.stringify({ itemId }) }).then(r=>r.json());
    if (r.url) window.location.href = r.url; else alert(JSON.stringify(r));
  }
  return (
    <main>
      <h2>Store</h2>
      <ul>
        {skus.map(s => (
          <li key={s.id} style={{margin:'8px 0'}}>
            {s.name} — Hard {s.priceHard}
            <button style={{marginLeft:8}} onClick={()=>buyHard(s.id)}>Buy</button>
          </li>
        ))}
      </ul>
    </main>
  );
}
