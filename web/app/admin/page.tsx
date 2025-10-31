'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Admin() {
  const [events,setEvents] = useState<any[]>([]);
  const [active,setActive] = useState<any[]>([]);
  async function load() {
    const e = await fetch(API + '/admin/liveops/events').then(r=>r.json());
    const a = await fetch(API + '/admin/liveops/active').then(r=>r.json());
    setEvents(e.events||[]); setActive(a.events||[]);
  }
  useEffect(()=>{ load(); },[]);
  async function reload(){ await fetch(API + '/admin/liveops/reload',{ method:'POST'}); load(); }
  return (
    <main>
      <h2>Admin / Live Ops</h2>
      <button onClick={reload}>Reload YAML</button>
      <h3 style={{marginTop:16}}>Active</h3>
      <pre style={{background:'#f7f7f7',padding:12}}>{JSON.stringify(active,null,2)}</pre>
      <h3>All Events</h3>
      <pre style={{background:'#f7f7f7',padding:12}}>{JSON.stringify(events,null,2)}</pre>
    </main>
  );
}
