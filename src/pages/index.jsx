import { useState, useMemo } from 'react';
import { jsPDF } from 'jspdf';
import { Plus, Trash2 } from 'lucide-react';

const MIN_RATES = { Operativo:125, Administrativo:182, Profesional:254 };
const fmt = n=>n.toLocaleString('es-CO',{style:'currency',currency:'COP',minimumFractionDigits:0});

export default function Home(){
  const [form,setForm]=useState({company:'',project:'',type:'Operativo',max:'',prov:1,hd:'',dw:''});
  const [acts,setActs]=useState([{name:'',dur:''}]);

  const handle=field=>e=>setForm({...form,[field]:e.target.value});
  const handleAct=(i,f)=>e=>{const c=[...acts];c[i][f]=e.target.value;setActs(c);};
  const add=()=>setActs([...acts,{name:'',dur:''}]);
  const del=i=>()=>acts.length>1&&setActs(acts.filter((_,idx)=>idx!==i));

  const rate=MIN_RATES[form.type];
  const res=acts.map(a=>{const m=+a.dur||0; if(!m)return null;const base=m*rate;const com=Math.round(base*0.17);return {...a,m,base,com,tot:base+com};});
  const cycle=res.reduce((s,r)=>s+(r?r.tot:0),0);
  const mins=res.reduce((s,r)=>s+(r?r.m:0),0);
  const g= useMemo(()=>{const {hd,dw}=form; if(!hd||!dw||!mins)return 0; return Math.floor((hd*dw*4.33*60)/mins);},[form,mins]);
  const minMonth=cycle*g; const max=+form.max||0; const final=max>minMonth?Math.round((minMonth+max)/2):minMonth;
  const valid=form.company&&form.project&&acts.every(a=>a.name&&a.dur);

  const pdf=()=>{const d=new jsPDF();d.text('Tarifa Inclunex',14,20);d.text('Empresa: '+form.company,14,28);d.text('Proyecto: '+form.project,14,34);d.text('Tipo: '+form.type,14,40);let y=48;res.forEach((r,i)=>{if(!r)return;d.text(`${i+1}. ${r.name} (${r.m}m) - ${fmt(r.tot)}`,14,y);y+=6;});d.text('Tarifa ciclo: '+fmt(cycle),14,y+4);d.save('tarifa.pdf');};

  return(
   <div className="max-w-5xl mx-auto p-6 space-y-6">
    <img src="/logo.png" alt="Inclunex" className="h-12"/>
    <p className="text-gray-700">Usa esta calculadora para estimar la tarifa mensual justa. Completa los campos y obtén un PDF.</p>

    <div className="grid md:grid-cols-2 gap-4">
     <input placeholder="Empresa *" className="border p-2" value={form.company} onChange={handle('company')}/>
     <input placeholder="Proyecto *" className="border p-2" value={form.project} onChange={handle('project')}/>
     <select className="border p-2" value={form.type} onChange={handle('type')}>
       <option>Operativo</option><option>Administrativo</option><option>Profesional</option>
     </select>
     <input type="number" placeholder="Máx mensual cliente" className="border p-2" value={form.max} onChange={handle('max')}/>
    </div>

    <h3 className="font-semibold">Actividades *</h3>
    {acts.map((a,i)=>
      <div key={i} className="flex gap-2 items-center">
        <input placeholder="Nombre" className="border p-2 flex-1" value={a.name} onChange={handleAct(i,'name')}/>
        <input type="number" placeholder="Min" className="border p-2 w-24" value={a.dur} onChange={handleAct(i,'dur')}/>
        <button onClick={del(i)} disabled={acts.length===1}><Trash2/></button>
        {i===acts.length-1&&<button onClick={add}><Plus/></button>}
      </div>)}

    {valid&&<div className="border p-4">
       <p>Tarifa por ciclo: {fmt(cycle)}</p>
       {g>0&&<p>Tarifa mensual mínima: {fmt(minMonth)} {max>minMonth&&<>| Tarifa final: {fmt(final)}</>}</p>}
       <button className="mt-2 px-4 py-2 bg-primario text-white" onClick={pdf}>Descargar PDF</button>
    </div>}
   </div>);
}