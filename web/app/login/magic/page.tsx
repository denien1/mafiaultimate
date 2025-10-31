'use client';
import { useEffect, useState } from 'react';
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Magic() {
  const [state,setState]=useState('Checking token...');
  useEffect(()=>{
    const token = new URLSearchParams(window.location.search).get('token');
    if(!token){ setState('No token'); return; }
    fetch(API + '/auth/consume-magic',{ method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ token }) })
      .then(r=>r.json()).then(d=>{
        if(d.token){ localStorage.setItem('token', d.token); window.location.href='/' }
        else setState('Invalid or expired');
      }).catch(()=> setState('Error'));
  },[]);
  return <main><h2>{state}</h2></main>;
}
