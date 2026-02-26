"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Classroom, Pet, Goal } from "@/lib/supabase";
import * as db from "@/lib/db";
import {
  ICONS, PETS, GOAL_LIBRARY, CASEL_COLORS, TUTORIAL_STEPS, LEVEL_REWARDS, REFLECT_ITEMS,
  CHECK_IN_CATEGORIES, EMOTIONS_UI, POINTS_PER_LEVEL, GRADE_OPTIONS, gradeName,
  REFLECT_CATEGORIES, type ReflectTopic,
} from "@/data/config";

const PPL = POINTS_PER_LEVEL;
type CheckInCat = typeof CHECK_IN_CATEGORIES[number];
type Page = "landing"|"login"|"onboarding"|"classes"|"settings"|"newClass"|"petIntro"|"petSelect"|"petName"|"tutorial"|"classroom"|"account";

/* ========= Pet Image ========= */
function PI({size=260,type="standing",pt="pet1",srcOverride}:{size?:number;type?:string;pt?:string;srcOverride?:string|null}){
  const [e,setE]=useState(false);
  const p=PETS[pt]||PETS.pet1;
  const src=srcOverride||(p.images as any)[type]||p.images.standing;
  const isSvg=src?.endsWith?.(".svg");
  if(e)return<svg viewBox="0 0 200 220" width={size} height={size}><ellipse cx="100" cy="145" rx="58" ry="52" fill="#D4A574"/><ellipse cx="100" cy="88" rx="48" ry="43" fill="#D4A574"/><ellipse cx="78" cy="82" rx="18" ry="14" fill="#3B5998"/><circle cx="78" cy="82" r="3.5" fill="#3D2B1F"/><ellipse cx="122" cy="82" rx="18" ry="14" fill="#3B5998"/><circle cx="122" cy="82" r="3.5" fill="#3D2B1F"/><ellipse cx="100" cy="94" rx="3.5" ry="2.5" fill="#8B6F4E"/><path d="M91 100 Q100 110 109 100" stroke="#8B6F4E" strokeWidth="2" fill="none"/></svg>;
  return<img src={src} alt="Pet" width={size} height={size} style={{objectFit:"contain",mixBlendMode:isSvg?undefined:"multiply"}} onError={()=>setE(true)}/>;
}

function MysteryPet({size=120}:{size?:number}){
  return(
    <div style={{width:size,height:size,borderRadius:16,backgroundColor:"#E5E7EB",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg width={size*.5} height={size*.5} viewBox="0 0 100 100"><ellipse cx="50" cy="55" rx="35" ry="30" fill="#C0C0C0" opacity=".5"/><ellipse cx="50" cy="40" rx="25" ry="22" fill="#C0C0C0" opacity=".5"/><text x="50" y="55" textAnchor="middle" fontSize="28" fill="#999">?</text></svg>
    </div>
  );
}

function MoodSelector({current,onChange}:{current:string;onChange:(m:string)=>void}){
  const moods=[{id:"happy",emoji:"\u{1F60A}",color:"#FBBF24"},{id:"excited",emoji:"\u{1F929}",color:"#F59E0B"},{id:"neutral",emoji:"\u{1F610}",color:"#9CA3AF"},{id:"tired",emoji:"\u{1F634}",color:"#60A5FA"},{id:"sad",emoji:"\u{1F622}",color:"#F87171"}];
  return(
    <div style={{display:"flex",gap:6,justifyContent:"center"}}>
      {moods.map(m=>(
        <button key={m.id} onClick={()=>onChange(m.id)} style={{width:32,height:32,borderRadius:16,border:current===m.id?`2px solid ${m.color}`:"2px solid transparent",backgroundColor:current===m.id?m.color+"20":"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16,transition:"all .2s"}}>{m.emoji}</button>
      ))}
    </div>
  );
}

function LogoBar({right,transparent}:{right?:React.ReactNode;transparent?:boolean}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 32px",backgroundColor:transparent?"transparent":"#FFFDF7",borderBottom:transparent?"none":"1px solid #E5E7EB",zIndex:30,position:"sticky",top:0}}>
      <img src={ICONS.logo} alt="ClassBandit" style={{height:40,objectFit:"contain"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
      {right&&<div style={{display:"flex",alignItems:"center",gap:16}}>{right}</div>}
    </div>
  );
}

function ClassHdr({pet,onAcc,onSignOut,onAccount,startDate}:{pet:Pet|null;onAcc:()=>void;onSignOut:()=>void;onAccount:()=>void;startDate?:string}){
  const [showMenu,setShowMenu]=useState(false);
  const lv=pet?.level||1,lp=pet?.level_points||0,tp=pet?.total_points||0;
  const pct=Math.min((lp/PPL)*100,100);
  const streakDays=startDate?Math.max(1,Math.floor((Date.now()-new Date(startDate).getTime())/(1000*60*60*24))):1;
  return(
    <div style={{display:"flex",alignItems:"center",padding:"6px 20px",backgroundColor:"#FFFDF7",backdropFilter:"blur(8px)",borderBottom:"1px solid #F0EDE4",zIndex:20,position:"sticky",top:0}}>
      {/* Logo */}
      <div style={{flexShrink:0,marginRight:16}}>
        <img src={ICONS.logo} alt="CB" style={{height:44,objectFit:"contain",mixBlendMode:"multiply"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
      </div>
      {/* CENTER: Level bar with star + chest overlapping */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:0}}>
        {/* Star level badge */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0,marginRight:6,zIndex:2}}>
          <img src="/icons/star-filled.svg" alt="star" style={{width:28,height:28}}/>
          <span style={{fontSize:9,color:"#888",fontWeight:600,marginTop:1}}>Level {lv}</span>
        </div>
        {/* Progress bar */}
        <div style={{flex:1,maxWidth:520}}>
          <div style={{width:"100%",height:14,borderRadius:7,backgroundColor:"#E5E7EB",overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",borderRadius:7,background:"linear-gradient(90deg,#34D399,#06B6D4)",transition:"width .7s"}}/></div>
          <div style={{textAlign:"center",marginTop:2}}><span style={{fontSize:13,color:"#666",fontWeight:700}}>{lp}/{PPL} points</span></div>
        </div>
        {/* Treasure chest */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0,marginLeft:6,zIndex:2}}>
          <img src="/icons/treasure-chest-new.svg" alt="chest" style={{width:30,height:30}}/>
          <span style={{fontSize:9,color:"#888",fontWeight:600,marginTop:1}}>Level {lv+1}</span>
        </div>
        {/* Star points counter */}
        <div style={{display:"flex",alignItems:"center",gap:3,marginLeft:14}}>
          <img src="/icons/star-filled.svg" alt="star" style={{width:16,height:16}}/>
          <b style={{fontSize:14,color:"#333"}}>{tp}</b>
        </div>
        {/* Hand heart counter */}
        <div style={{display:"flex",alignItems:"center",gap:3,marginLeft:8}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF8B8B"><path d="M16 3.23Q17.065 2 18.7 2c.91 0 1.67.33 2.3 1s.96 1.43 1 2.3c0 .7-.33 1.51-1 2.46s-1.32 1.74-1.97 2.39q-.975.96-3.03 2.85q-2.085-1.89-3.06-2.85c-.975-.96-1.31-1.44-1.97-2.39S10 6 10 5.3c0-.91.32-1.67.97-2.3s1.43-.96 2.34-1c1.07 0 1.96.41 2.69 1.23M22 19v1l-8 2.5l-7-1.94V22H1V11h7.97l6.16 2.3A2.89 2.89 0 0 1 17 16h2c1.66 0 3 1.34 3 3M5 20v-7H3v7zm14.9-1.43c-.16-.33-.51-.57-.9-.57h-5.35c-.54 0-1.07-.08-1.58-.25l-2.38-.79l.63-1.9l2.38.79c.3.1 2.3.15 2.3.15c0-.37-.23-.7-.57-.83L8.61 13H7v5.5l6.97 1.91z"/></svg>
          <b style={{fontSize:14,color:"#FF8B8B"}}>{streakDays}</b>
        </div>
      </div>
      {/* RIGHT: Account icon */}
      <div style={{position:"relative",flexShrink:0,marginLeft:16}}>
        <button onClick={()=>setShowMenu(!showMenu)} className="ch" style={{width:36,height:36,borderRadius:18,backgroundColor:"#FACC15",color:"#1a1a1a",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>
        {showMenu&&<div style={{position:"absolute",top:42,right:0,backgroundColor:"#fff",borderRadius:10,boxShadow:"0 4px 20px rgba(0,0,0,.15)",minWidth:160,zIndex:100,overflow:"hidden"}}>
          <button onClick={()=>{setShowMenu(false);onAcc();}} style={{display:"block",width:"100%",padding:"12px 16px",fontSize:13,fontWeight:500,color:"#333",background:"none",border:"none",borderBottom:"1px solid #F0F0F0",cursor:"pointer",textAlign:"left"}}>My Classes</button>
          <button onClick={()=>{setShowMenu(false);onAccount();}} style={{display:"block",width:"100%",padding:"12px 16px",fontSize:13,fontWeight:500,color:"#333",background:"none",border:"none",borderBottom:"1px solid #F0F0F0",cursor:"pointer",textAlign:"left"}}>My Account</button>
          <button onClick={()=>{setShowMenu(false);onSignOut();}} style={{display:"block",width:"100%",padding:"12px 16px",fontSize:13,fontWeight:500,color:"#EF4444",background:"none",border:"none",cursor:"pointer",textAlign:"left"}}>Sign Out</button>
        </div>}
      </div>
    </div>
  );
}

function StepDots({current,total}:{current:number;total:number}){
  return <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:24}}>{Array.from({length:total}).map((_,i)=>(<div key={i} style={{width:i<=current?28:10,height:8,borderRadius:4,backgroundColor:i<=current?"#FACC15":"#D1D5DB",transition:"all .3s"}}/>))}</div>;
}

function Nav({tab,onTab,hl,disabled}:{tab:string;onTab:(t:string)=>void;hl:string|null;disabled?:boolean}){
  const items=[
    {id:"goals",label:"Goals",icon:"/icons/goals.png"},
    {id:"reflect",label:"Reflect",icon:"/icons/reflect.png"},
    {id:"awards",label:"Rewards",icon:"/icons/rewards.png"},
  ];
  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"8px 6px",gap:6,width:88,backgroundColor:"rgba(255,255,255,.85)",borderRadius:16,border:"1px solid #E0E0E0",position:"absolute",top:16,left:12,zIndex:20,opacity:disabled?.4:1,pointerEvents:disabled?"none":"auto",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}>
      {items.map(i=>{const a=tab===i.id;return(
        <button key={i.id} onClick={()=>onTab(i.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,padding:"8px 2px",borderRadius:12,border:"none",cursor:disabled?"default":"pointer",width:74,backgroundColor:a?"#FEF9C3":"transparent",transition:"background .15s"}}>
          <img src={i.icon} alt={i.label} width="28" height="28" style={{objectFit:"contain"}}/>
          <span style={{fontSize:11,fontWeight:a?600:500,color:a?"#B8860B":"#999"}}>{i.label}</span>
        </button>
      );})}
    </div>
  );
}

function Care({onAct,hl,pet}:{onAct:(t:string)=>void;hl:string|null;pet?:any}){
  const today=new Date().toDateString();
  const fedToday=pet?.last_fed_at&&new Date(pet.last_fed_at).toDateString()===today;
  const wateredToday=pet?.last_watered_at&&new Date(pet.last_watered_at).toDateString()===today;
  const cleanedToday=pet?.last_cleaned_at&&new Date(pet.last_cleaned_at).toDateString()===today;
  const items=[
    {id:"clean",icon:"/icons/care-clean.svg",disabled:cleanedToday},
    {id:"water",icon:"/icons/care-water.svg",disabled:wateredToday},
    {id:"feed",icon:"/icons/care-feed.svg",disabled:fedToday},
  ];
  const S=150;
  /* No overlap: hex height ≈ S*0.866. Vertical step = S*0.866/2 ≈ S*0.43, horizontal step = S*0.75 */
  const positions=[
    {top:0,            left:S*0.75}, /* clean: top-right */
    {top:S*0.43,       left:0},      /* water: mid-left */
    {top:S*0.86,       left:S*0.75}, /* feed: bottom-right */
  ];
  const W=S*0.75+S, H=S*0.86+S;
  return(
    <div style={{position:"relative",width:W,height:H}}>
      {items.map((a,i)=>{
        const pos=positions[i];
        return(
          <button key={a.id} onClick={()=>!a.disabled&&onAct(a.id)} style={{position:"absolute",...pos,background:"none",border:"none",cursor:a.disabled?"default":"pointer",padding:0,filter:a.disabled?"grayscale(1) brightness(0.6)":"none",transition:"filter .2s"}}>
            <img src={a.icon} alt={a.id} width={S} height={S} style={{display:"block"}}/>
          </button>
        );
      })}
    </div>
  );
}

function GoalsP({goals,onAdd,dc}:{goals:Goal[];onAdd:(id:string)=>void;dc:Record<string,number>}){return(
  <div className="fi" style={{padding:16}}>
    <h2 style={{fontSize:18,fontWeight:700,marginBottom:4}}>Daily Goals</h2>
    <button style={{fontSize:11,color:"#B8860B",background:"none",border:"none",cursor:"pointer",fontWeight:500,marginBottom:12}}>{"\uD83D\uDCCA"} Daily Progress</button>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {goals.map(g=>{const c=dc[g.id]||0;return(
        <div key={g.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderRadius:10,backgroundColor:"#fff",border:"1px solid #E5E7EB"}}>
          <div><span style={{fontSize:13,fontWeight:600}}>{g.title}</span>{c>0&&<span style={{fontSize:10,color:"#10B981",marginLeft:6}}>+{c} today</span>}</div>
          <button onClick={()=>onAdd(g.id)} className="hx" style={{fontSize:11,fontWeight:600,color:"#B8860B",background:"none",border:"none",cursor:"pointer"}}>Add Point +1</button>
        </div>);})}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",borderRadius:10,backgroundColor:"#fff",border:"1px solid #E5E7EB"}}>
        <div><span style={{fontSize:13,fontWeight:600}}>General Point</span>{(dc["general"]||0)>0&&<span style={{fontSize:10,color:"#10B981",marginLeft:6}}>+{dc["general"]} today</span>}</div>
        <button onClick={()=>onAdd("general")} className="hx" style={{fontSize:11,fontWeight:600,color:"#B8860B",background:"none",border:"none",cursor:"pointer"}}>Add Point +1</button>
      </div>
    </div>
  </div>
);}

function AwardsP({totalPts,equipped,onEquip,onUnequip}:{totalPts:number;equipped:string|null;onEquip:(id:string)=>void;onUnequip:()=>void}){
  const [detail,setDetail]=useState<string|null>(null);
  const reward=detail?LEVEL_REWARDS.find(r=>r.id===detail):null;
  if(reward){
    const unlocked=totalPts>=reward.pointsRequired;
    const isEquipped=equipped===reward.id;
    return(<div className="fi" style={{padding:16}}>
      <button onClick={()=>setDetail(null)} style={{fontSize:12,color:"#B8860B",background:"none",border:"none",cursor:"pointer",marginBottom:8}}>{"\u2039"} Back</button>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>{reward.title}</h2>
      <p style={{fontSize:12,color:"#999",marginBottom:16}}>Level {reward.level} - {reward.pointsRequired} points</p>
      {reward.icon&&<div style={{display:"flex",justifyContent:"center",marginBottom:16}}><img src={reward.icon} alt={reward.title} width={120} height={120} style={{objectFit:"contain",opacity:unlocked?1:.4}}/></div>}
      {unlocked?(
        isEquipped?(
          <button onClick={()=>onUnequip()} style={{width:"100%",padding:"12px",borderRadius:10,backgroundColor:"#FACC15",color:"#1a1a1a",border:"2px solid #E5A500",fontSize:14,fontWeight:600,cursor:"pointer"}}>Unequip {"\u2715"}</button>
        ):(
          <button onClick={()=>onEquip(reward.id)} style={{width:"100%",padding:"12px",borderRadius:10,backgroundColor:"#FACC15",color:"#1a1a1a",border:"none",fontSize:14,fontWeight:600,cursor:"pointer"}}>Equip</button>
        )
      ):(
        <div style={{textAlign:"center",padding:12,borderRadius:10,backgroundColor:"#F3F4F6",color:"#999",fontSize:13,fontWeight:500}}>{"\uD83D\uDD12"} Earn {reward.pointsRequired} points to unlock</div>
      )}
    </div>);
  }
  return(<div className="fi" style={{padding:16}}>
    <h2 style={{fontSize:20,fontWeight:700,marginBottom:12}}>Rewards</h2>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {LEVEL_REWARDS.map(r=>{const unlocked=totalPts>=r.pointsRequired;return(
        <div key={r.id} onClick={()=>setDetail(r.id)} className="ch" style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:12,border:"1px solid #E5E7EB",backgroundColor:"#fff",cursor:"pointer",opacity:unlocked?1:.6}}>
          <div style={{width:48,height:48,borderRadius:8,backgroundColor:unlocked?"#FEF9C3":"#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,position:"relative"}}>
            {r.icon?<img src={r.icon} alt="" width={32} height={32} style={{objectFit:"contain",opacity:unlocked?1:.35}}/>:<span style={{fontSize:20}}>{"\uD83C\uDF81"}</span>}
            {!unlocked&&<span style={{position:"absolute",fontSize:16}}>{"\uD83D\uDD12"}</span>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:13,fontWeight:600}}>{r.title}</div>
            <div style={{fontSize:11,color:"#999"}}>Level {r.level} - {r.pointsRequired} pts</div>
          </div>
          <span style={{color:"#CCC",fontSize:18}}>{"\u203A"}</span>
          {equipped===r.id&&<span style={{fontSize:10,color:"#10B981",fontWeight:600}}>Equipped</span>}
        </div>
      );})}
    </div>
  </div>);
}

function ReflectP({onStart}:{onStart:(topic:ReflectTopic)=>void}){
  const [selCat,setSelCat]=useState<string|null>(null);
  const cat=selCat?REFLECT_CATEGORIES.find(c=>c.id===selCat):null;
  if(cat)return(<div className="fi" style={{padding:16}}>
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
      <button onClick={()=>setSelCat(null)} style={{fontSize:18,background:"none",border:"none",cursor:"pointer",color:"#333",padding:0}}>{"\u2190"}</button>
      <img src={cat.icon} alt="" width={32} height={32}/>
      <h2 style={{fontSize:18,fontWeight:700}}>{cat.title}</h2>
    </div>
    <p style={{fontSize:12,color:"#999",marginBottom:14,marginLeft:4}}>Select a topic to begin reflection.</p>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {cat.topics.map(t=>(
        <div key={t.id} onClick={()=>onStart(t)} className="ch" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderRadius:12,border:"1px solid #E5E7EB",backgroundColor:"#fff",cursor:"pointer"}}>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:"#1a1a1a"}}>{t.title}</div>
            <div style={{fontSize:11,color:"#999",marginTop:2}}>{t.subtitle}</div>
          </div>
          <span style={{color:"#CCC",fontSize:18,marginLeft:8}}>{"\u203A"}</span>
        </div>
      ))}
    </div>
  </div>);
  return(<div className="fi" style={{padding:16}}>
    <h2 style={{fontSize:22,fontWeight:700,marginBottom:2}}>Reflect</h2>
    <p style={{fontSize:12,color:"#999",marginBottom:14}}>Select a category</p>
    <div style={{borderTop:"1px solid #E5E7EB",paddingTop:12,display:"flex",flexDirection:"column",gap:8}}>
      {REFLECT_CATEGORIES.map(c=>(
        <div key={c.id} onClick={()=>setSelCat(c.id)} className="ch" style={{display:"flex",alignItems:"center",gap:12,padding:"14px 16px",borderRadius:12,border:"1px solid #E5E7EB",backgroundColor:"#fff",cursor:"pointer"}}>
          <img src={c.icon} alt={c.title} width={44} height={44} style={{objectFit:"contain"}}/>
          <span style={{fontSize:14,fontWeight:600,color:"#1a1a1a"}}>{c.title}</span>
        </div>
      ))}
    </div>
  </div>);
}

function RefFull({cat,onDone,onPoint}:{cat:ReflectTopic;onDone:()=>void;onPoint:()=>void}){
  const [step,setStep]=useState(0);const [sel,setSel]=useState<Set<string>>(new Set());

  const toggleEmo=(label:string)=>{setSel(prev=>{const next=new Set(prev);if(next.has(label))next.delete(label);else next.add(label);return next;});};

  // Step 1: Follow-up question + Complete button (no emotions)
  if(step===1)return(
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:32,zIndex:15}}>
      <p style={{fontSize:14,color:"#B8860B",fontWeight:500,marginBottom:6}}>{cat.title}</p>
      <h2 style={{fontSize:26,fontWeight:700,maxWidth:560,lineHeight:1.35,marginBottom:28}}>{cat.followUp}</h2>
      <button onClick={()=>{onPoint();onDone();}} style={{padding:"14px 36px",borderRadius:10,backgroundColor:"#FACC15",color:"#1a1a1a",fontSize:14,fontWeight:600,border:"none",cursor:"pointer"}}>Complete</button>
    </div>
  );

  // Step 0: Prompt + emotions (multi-select) + Continue
  const hasSel=sel.size>0;
  return(
    <div className="fi" style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:32,zIndex:15}}>
      <p style={{fontSize:14,color:"#B8860B",fontWeight:500,marginBottom:6}}>{cat.title}</p>
      <h2 style={{fontSize:26,fontWeight:700,maxWidth:560,lineHeight:1.35,marginBottom:28}}>{cat.prompt}</h2>
      <div style={{display:"flex",gap:16,marginBottom:28}}>
        {EMOTIONS_UI.map(e=>{const active=sel.has(e.label);return(
          <button key={e.label} onClick={()=>toggleEmo(e.label)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,cursor:"pointer",background:"none",border:"none"}}>
            <div style={{width:72,height:80,borderRadius:12,backgroundColor:active?e.color:"#E5E7EB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,border:active?`3px solid ${e.color}`:"3px solid transparent",opacity:hasSel&&!active?.5:1}}>{e.emoji}</div>
            <span style={{fontSize:12,fontWeight:active?700:500,color:active?e.color:"#666"}}>{e.label}</span>
          </button>
        );})}
      </div>
      <button onClick={()=>{if(hasSel)setStep(1);}} style={{padding:"14px 36px",borderRadius:10,backgroundColor:hasSel?"#FACC15":"#D1D5DB",color:hasSel?"#1a1a1a":"#fff",fontSize:14,fontWeight:600,border:"none",cursor:hasSel?"pointer":"not-allowed"}}>{`Continue \u2192`}</button>
    </div>
  );
}

function Tut({step,pn,pt,onNext}:{step:number;pn:string;pt?:string;onNext:()=>void}){
  const s=TUTORIAL_STEPS[step];if(!s)return null;
  const t=(x:string)=>x.replace(/\[Name\]/g,pn);
  const dp=(s as any).dialogPos||"center";
  const pp=(s as any).petPos||"center";

  // Dialog positioning
  const dialogStyle:React.CSSProperties={position:"absolute",zIndex:100,maxWidth:440,backgroundColor:"#fff",borderRadius:16,padding:28,boxShadow:"0 12px 48px rgba(0,0,0,.18)"};
  if(dp==="center"){dialogStyle.top="50%";dialogStyle.left="50%";dialogStyle.transform="translate(-50%,-50%)";}
  else if(dp==="centerLeft"){dialogStyle.top="50%";dialogStyle.left="15%";dialogStyle.transform="translateY(-50%)";}
  else if(dp==="topLeft"){dialogStyle.top="10%";dialogStyle.left="10%";dialogStyle.maxWidth=420;}
  else if(dp==="midRight"){dialogStyle.top="30%";dialogStyle.right="15%";dialogStyle.maxWidth=420;}
  else if(dp==="bottomRight"){dialogStyle.bottom="20%";dialogStyle.right="15%";}
  else if(dp==="topRight"){dialogStyle.top="15%";dialogStyle.right="15%";}

  // Pet positioning
  const petStyle:React.CSSProperties={position:"absolute",zIndex:95};
  if(pp==="center"){petStyle.top="40%";petStyle.left="50%";petStyle.transform="translate(-50%,-50%)";}
  else if(pp==="centerBottom"){petStyle.bottom="5%";petStyle.left="50%";petStyle.transform="translateX(-50%)";}
  else if(pp==="bottomRight"){petStyle.bottom="5%";petStyle.right="12%";}
  else if(pp==="bottomLeft"){petStyle.bottom="5%";petStyle.left="5%";}
  else if(pp==="midLeft"){petStyle.top="35%";petStyle.left="12%";}
  else if(pp==="midRight"){petStyle.bottom="10%";petStyle.right="15%";}
  else if(pp==="bottomCenter"){petStyle.bottom="5%";petStyle.left="35%";}
  else if(pp==="centerInDialog"){/* pet goes inside dialog */}

  const showPetOutside=pp!=="centerInDialog";

  return(<>
    {showPetOutside&&<div className="fl" style={petStyle}><PI size={220} pt={pt||"pet1"}/><div style={{textAlign:"center",fontSize:15,fontWeight:700,marginTop:2}}>{pn}</div></div>}
    <div className="fi" style={dialogStyle}>
      <h3 style={{fontSize:20,fontWeight:700,marginBottom:8,lineHeight:1.3,whiteSpace:"pre-line"}}>{t(s.title)}</h3>
      {pp==="centerInDialog"&&<div style={{display:"flex",justifyContent:"center",margin:"16px 0"}}><PI size={180} pt={pt||"pet1"}/></div>}
      {s.body&&<p style={{fontSize:13,color:"#555",lineHeight:1.6,whiteSpace:"pre-line",marginBottom:8}}>{t(s.body)}</p>}
      {s.bullets&&<ul style={{listStyle:"none",padding:0,margin:"8px 0"}}>{s.bullets.map((b,i)=><li key={i} style={{fontSize:13,color:"#555",marginBottom:4}}>{b}</li>)}</ul>}
      <button onClick={onNext} style={{marginTop:10,padding:"11px 26px",borderRadius:10,backgroundColor:"#FACC15",color:"#1a1a1a",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>{s.buttonText}</button>
    </div>
  </>);
}

function CageBg(){return(<>
  <div style={{position:"fixed",inset:0,background:"linear-gradient(180deg,#F5F0E0 0%,#EDE8D0 60%,#DDD8C0 100%)",zIndex:0}}/>
  <div style={{position:"fixed",inset:0,backgroundImage:`url(${ICONS.cageBg})`,backgroundSize:"cover",backgroundPosition:"center bottom",opacity:.35,pointerEvents:"none",zIndex:0}}/>
</>);}

/* ========= Goal Add Modal ========= */
function GoalAddModal({existingTitles,onAdd,onClose}:{existingTitles:Set<string>;onAdd:(title:string,casel:string)=>void;onClose:()=>void}){
  const [customTitle,setCustomTitle]=useState("");
  const [customCasel,setCustomCasel]=useState("Self-Management");
  const [showCustom,setShowCustom]=useState(false);
  const categories=Array.from(new Set(GOAL_LIBRARY.map(g=>g.casel)));
  const available=GOAL_LIBRARY.filter(g=>!existingTitles.has(g.title));
  return(
    <div style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,.4)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{backgroundColor:"#fff",borderRadius:16,padding:28,maxWidth:560,width:"90%",maxHeight:"80vh",overflowY:"auto",boxShadow:"0 12px 48px rgba(0,0,0,.2)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <h2 style={{fontSize:18,fontWeight:700}}>Add Goals</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:"#999"}}>{"\u2715"}</button>
        </div>
        {!showCustom?(<>
          <p style={{fontSize:13,color:"#666",marginBottom:16}}>Select from CASEL-aligned goals or add a custom one</p>
          {categories.map(cat=>{const color=(CASEL_COLORS as any)[cat]||"#FACC15";const catGoals=available.filter(g=>g.casel===cat);if(catGoals.length===0)return null;return(<div key={cat} style={{marginBottom:14}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><div style={{width:8,height:8,borderRadius:4,backgroundColor:color}}/><span style={{fontSize:11,fontWeight:700,color}}>{cat}</span></div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{catGoals.map(g=>(<button key={g.id} onClick={()=>onAdd(g.title,g.casel)} className="ch" style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${color}40`,backgroundColor:color+"10",color,fontSize:12,fontWeight:600,cursor:"pointer"}}>{g.title} +</button>))}</div></div>);})}
          <button onClick={()=>setShowCustom(true)} style={{marginTop:8,fontSize:13,color:"#B8860B",background:"none",border:"1px dashed #B8860B",borderRadius:8,padding:"8px 16px",cursor:"pointer",width:"100%"}}>+ Add Custom Goal</button>
        </>):(<>
          <button onClick={()=>setShowCustom(false)} style={{fontSize:12,color:"#B8860B",background:"none",border:"none",cursor:"pointer",marginBottom:12}}>{"\u2190"} Back to library</button>
          <div style={{marginBottom:12}}><label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:4}}>Goal Title</label><input value={customTitle} onChange={e=>setCustomTitle(e.target.value)} placeholder="e.g., Raising hand before speaking" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #D1D5DB",fontSize:13,outline:"none"}}/></div>
          <div style={{marginBottom:16}}><label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:4}}>CASEL Category</label><select value={customCasel} onChange={e=>setCustomCasel(e.target.value)} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #D1D5DB",fontSize:13,outline:"none",backgroundColor:"#fff"}}>{categories.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
          <button onClick={()=>{if(customTitle.trim()){onAdd(customTitle.trim(),customCasel);setCustomTitle("");setShowCustom(false);}}} disabled={!customTitle.trim()} style={{padding:"10px 24px",borderRadius:8,backgroundColor:customTitle.trim()?"#FACC15":"#D1D5DB",color:customTitle.trim()?"#1a1a1a":"#fff",border:"none",fontSize:13,fontWeight:600,cursor:customTitle.trim()?"pointer":"not-allowed"}}>Add Goal</button>
        </>)}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN APP
   ================================================================ */
export default function App(){
  const [session,setSession]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);

  // Bulletproof: never stay on loading screen more than 6 seconds
  useEffect(()=>{
    const t=setTimeout(()=>{if(loading){console.warn("Force exit loading screen");setLoading(false);}},6000);
    return()=>clearTimeout(t);
  },[loading]);
  const [useSB,setUseSB]=useState(false);
  const [cls,setCls]=useState<Classroom[]>([]);
  const [aCls,setACls]=useState<Classroom|null>(null);
  const [pet,setPet]=useState<Pet|null>(null);
  const [goals,setGoals]=useState<Goal[]>([]);
  const [dc,setDc]=useState<Record<string,number>>({});
  const [page,setPage]=useState<Page>("landing");
  const [tab,setTab]=useState("goals");
  const [po,setPo]=useState(false);
  const [pop,setPop]=useState(false);
  const [toast,setToast]=useState<{icon:string;title:string;sub:string}|null>(null);
  const toastTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const pointSound=useRef<HTMLAudioElement|null>(null);
  useEffect(()=>{pointSound.current=new Audio("/sounds/point-added.mp3");},[]);
  const showToast=(t:{icon:string;title:string;sub:string})=>{if(toastTimer.current)clearTimeout(toastTimer.current);setToast(t);setPop(true);try{if(pointSound.current){pointSound.current.currentTime=0;pointSound.current.play();}}catch{}toastTimer.current=setTimeout(()=>{setPop(false);setToast(null);toastTimer.current=null;},10000);};
  const [vw,setVw]=useState<"teacher"|"student">("teacher");
  const [rCat,setRCat]=useState<ReflectTopic|null>(null);
  const [ts,setTs]=useState(0);
  const [err,setErr]=useState<string|null>(null);
  const [showSignIn,setShowSignIn]=useState(false);
  const [equipped,setEquipped]=useState<string|null>(null);
  const [justEquipped,setJustEquipped]=useState(false);
  const [levelUpReward,setLevelUpReward]=useState<typeof LEVEL_REWARDS[number]|null>(null);

  const equipItem=(id:string)=>{setEquipped(id);setJustEquipped(true);setTimeout(()=>setJustEquipped(false),10000);if(aCls&&useSB&&session){db.updatePet(aCls.id,{equipped_accessory:id}).catch(()=>{});}};
  const unequipItem=()=>{setEquipped(null);setJustEquipped(false);if(aCls&&useSB&&session){db.updatePet(aCls.id,{equipped_accessory:null}).catch(()=>{});}};
  const prevPtsRef=useRef<number>(0);

  // Detect reward unlock when total_points crosses a threshold
  useEffect(()=>{
    if(!pet)return;
    const newPts=pet.total_points;
    const oldPts=prevPtsRef.current;
    if(newPts>oldPts&&oldPts>0){
      // Find any reward that was just unlocked (old pts < threshold <= new pts)
      const justUnlocked=LEVEL_REWARDS.find(r=>oldPts<r.pointsRequired&&newPts>=r.pointsRequired);
      if(justUnlocked)setLevelUpReward(justUnlocked);
    }
    prevPtsRef.current=newPts;
  },[pet?.total_points]);

  const [obStep,setObStep]=useState(0);
  const [obName,setObName]=useState("");
  const [obTeacher,setObTeacher]=useState("");
  const [obGrades,setObGrades]=useState<string[]>([]);
  const [obClassName,setObClassName]=useState("");
  const [obGrade,setObGrade]=useState("");
  const [obClassSize,setObClassSize]=useState("1");
  const [obSelectedGoals,setObSelectedGoals]=useState<Set<string>>(new Set());

  const [acctName,setAcctName]=useState("");
  const [acctTeacher,setAcctTeacher]=useState("");
  const [acctGrades,setAcctGrades]=useState<string[]>([]);
  const [acctEditing,setAcctEditing]=useState(false);

  const [setF,setSetF]=useState<any>(null);
  const [setId,setSetId]=useState<string|null>(null);
  const [settingsGoals,setSettingsGoals]=useState<Goal[]>([]);
  const [settingsPet,setSettingsPet]=useState<Pet|null>(null);
  const [settingsPetName,setSettingsPetName]=useState("");
  const [showGoalModal,setShowGoalModal]=useState(false);

  const [selPetType,setSelPetType]=useState<string|null>(null);
  const [petNameInput,setPetNameInput]=useState("");

  const d=new Date();
  const dayN=d.toLocaleDateString("en-US",{weekday:"long"});
  const dateS=d.toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});

  useEffect(()=>{
    // Suppress AbortError from Supabase auth lock during page reload
    const handleUnhandledRejection=(e:PromiseRejectionEvent)=>{
      if(e.reason?.name==='AbortError'||e.reason?.message?.includes('signal is aborted')){
        e.preventDefault();
        console.warn('Suppressed AbortError from auth lock (page reload)');
      }
    };
    window.addEventListener('unhandledrejection',handleUnhandledRejection);

    const cfg=isSupabaseConfigured();setUseSB(cfg);
    let initDone=false;
    if(cfg){
      // Set up auth state listener FIRST
      const{data:{subscription}}=supabase.auth.onAuthStateChange(async(event,sess)=>{
        // After initial load, only update session — never navigate
        if(initDone){
          if(sess?.user)setSession(sess);
          else if(event==="SIGNED_OUT"){setSession(null);setPage("landing");setLoading(false);}
          return;
        }
        if(event==="SIGNED_IN"&&sess?.user){
          if(window.location.hash)window.history.replaceState(null,"",window.location.pathname);
          setSession(sess);setLoading(false);initDone=true;
          try{
            const u=await db.getUser(sess.user.id);
            if(u?.onboarding_complete){await loadCls(sess.user.id);setPage("classes");}
            else{setObName(u?.name||"");setPage("onboarding");}
          }catch(e:any){console.warn("Auth change error:",e);setPage("classes");}
        }else if(event==="SIGNED_OUT"){setSession(null);setPage("landing");setLoading(false);}
        else if(event==="INITIAL_SESSION"){
          initDone=true;
          if(sess?.user){
            setSession(sess);
            if(window.location.hash)window.history.replaceState(null,"",window.location.pathname);
            try{
              const u=await db.getUser(sess.user.id);
              if(u?.onboarding_complete){await loadCls(sess.user.id);setPage("classes");}
              else{setObName(u?.name||"");setPage("onboarding");}
            }catch(e:any){console.warn("User load error:",e);setPage("classes");}
          }else{setPage("landing");}
          setLoading(false);
        }
      });

      // Fallback timeout handled by separate useEffect (6s hard kill on loading)
      return()=>{subscription.unsubscribe();window.removeEventListener('unhandledrejection',handleUnhandledRejection);};
    }else{setLoading(false);return()=>window.removeEventListener('unhandledrejection',handleUnhandledRejection);}
  },[]);

  async function loadCls(tid:string){try{setCls(await db.getClassrooms(tid));}catch(e:any){console.error(e);}}

  async function loadCD(c:Classroom){
    try{
      setACls(c);
      const[p,g,ch]=await Promise.all([db.getPet(c.id),db.getGoals(c.id),db.getCheckinsToday(c.id)]);
      setPet(p);setGoals(g);if(p){prevPtsRef.current=p.total_points;
        // Validate equipped accessory is actually unlocked
        const eqId=p.equipped_accessory||null;
        const eqReward=eqId?LEVEL_REWARDS.find(r=>r.id===eqId):null;
        setEquipped(eqReward&&p.total_points>=eqReward.pointsRequired?eqId:null);
      }
      const counts:Record<string,number>={};ch.forEach(x=>{const k=x.goal_id||"general";counts[k]=(counts[k]||0)+x.points;});setDc(counts);
    }catch(e:any){setErr(e.message);}
  }

  async function enterClass(c:Classroom){
    setSaving(true);
    const timeout=setTimeout(()=>{setSaving(false);setErr("Loading timed out. Please try again.");},15000);
    try{await loadCD(c);
    const p=await db.getPet(c.id);
    if(!p){setACls(c);setPage("petIntro");}
    else{setPet(p);setPage("classroom");}}
    catch(e:any){setErr(e.message);}
    finally{clearTimeout(timeout);setSaving(false);}
  }

  async function selectPetAndName(){
    let pt=selPetType==="mystery"?Object.keys(PETS)[Math.floor(Math.random()*Object.keys(PETS).length)]:selPetType;
    if(!pt)pt="pet1"; // default to pet1 if somehow null
    if(!petNameInput.trim())return;
    const classroom=aCls||cls[0]||null;
    if(!classroom){console.log("No classroom");return;}
    if(!aCls)setACls(classroom);
    setSaving(true);
    const timeout=setTimeout(()=>{setSaving(false);setErr("Save timed out. Please try again.");},15000);
    try{
      if(useSB&&session){const p=await db.createPet(classroom.id,petNameInput.trim(),pt);setPet(p);}
      else{setPet({id:"dev-pet",classroom_id:classroom.id,name:petNameInput.trim(),pet_type:pt,mood:"happy",total_points:0,level:1,level_points:0,hearts:5,streak_days:0,last_fed_at:null,last_watered_at:null,last_cleaned_at:null,equipped_accessory:null});}
      if(!useSB&&goals.length===0){
        const stored=cls.find(x=>x.id===classroom.id);if(stored)setACls(stored);
      }
      setPage("tutorial");setTs(0);
    }catch(e:any){setErr(e.message);}
    finally{clearTimeout(timeout);setSaving(false);}
  }

  const addPt=async(gid:string)=>{
    if(!aCls)return;
    const careMap:{[k:string]:string}={feed:"last_fed_at",water:"last_watered_at",clean:"last_cleaned_at"};
    // Always update local state first for instant feedback
    setPet(p=>{if(!p)return p;let lp=p.level_points+1,lv=p.level;if(lp>=PPL){lv++;lp=0;}const updates:any={...p,total_points:p.total_points+1,level:lv,level_points:lp};if(careMap[gid])updates[careMap[gid]]=new Date().toISOString();return updates;});
    setDc(p=>({...p,[gid]:(p[gid]||0)+1}));
    // Toast banner
    const careLabels:{[k:string]:{icon:string;title:string}}={feed:{icon:"/icons/toast-feed.svg",title:`${pet?.name||"Bandit"} has been fed!`},water:{icon:"/icons/toast-water.svg",title:`${pet?.name||"Bandit"} has been watered!`},clean:{icon:"/icons/toast-clean.svg",title:`${pet?.name||"Bandit"}'s cage is clean!`}};
    const care=careLabels[gid];
    if(care){showToast({icon:care.icon,title:care.title,sub:"+1 Point"});}
    else{const gObj=goals.find(g=>g.id===gid);showToast({icon:"/icons/goals.png",title:gObj?gObj.title:"General Point",sub:"+1 Point"});}
    // Sync to DB in background
    if(useSB&&session){try{const isG=goals.some(g=>g.id===gid);const up=await db.addPoints(aCls.id,isG?gid:null,isG?"goal":gid==="general"?"general":gid,1);if(careMap[gid]){(up as any)[careMap[gid]]=new Date().toISOString();}if(!up.equipped_accessory&&equipped)up.equipped_accessory=equipped;setPet(up);}catch(e:any){console.error("addPt DB error:",e);}}
  };

  const tutN=()=>{ts>=TUTORIAL_STEPS.length-1?setPage("classroom"):setTs(s=>s+1);};

  function devLogin(skip=false){
    const mc:Classroom={id:"dev-cls",teacher_id:"dev-u",name:"2nd Grade Math",grade_level:2,class_size:16,display_code:"BND123",start_date:d.toISOString().split("T")[0],end_date:null,is_active:true};
    const mp:Pet={id:"dev-pet",classroom_id:"dev-cls",name:"Bandit",pet_type:"pet1",mood:"happy",total_points:0,level:1,level_points:0,hearts:5,streak_days:0,last_fed_at:null,last_watered_at:null,last_cleaned_at:null,equipped_accessory:null};
    const mg:Goal[]=[{id:"dg1",classroom_id:"dev-cls",title:"Staying On Task",casel_category:"Self-Management",is_active:true,sort_order:0},{id:"dg2",classroom_id:"dev-cls",title:"Helping Others",casel_category:"Relationship Skills",is_active:true,sort_order:1},{id:"dg3",classroom_id:"dev-cls",title:"Working Together",casel_category:"Relationship Skills",is_active:true,sort_order:2}];
    setCls([mc]);setACls(mc);setPet(mp);setGoals(mg);setDc({});
    if(skip)setPage("classroom");else{setPage("tutorial");setTs(0);}
  }

  async function finishOnboarding(){
    setErr(null);setSaving(true);
    if(window.location.hash||window.location.search)window.history.replaceState(null,"",window.location.pathname);
    // Safety timeout - if saving takes >15s, force reset
    const timeout=setTimeout(()=>{setSaving(false);setErr("Save timed out. Please try again.");},15000);
    try{
    if(useSB&&session){
        const{error:ue}=await supabase.from("users").upsert({id:session.user.id,email:session.user.email||"",name:obName||session.user.user_metadata?.full_name||"Teacher",teacher_name:obTeacher||"",grade_levels:obGrades.map(g=>g==="K"?0:g==="PreK"?-1:parseInt(g)),onboarding_complete:true,updated_at:new Date().toISOString()},{onConflict:"id"});
        if(ue)throw ue;
        const classroom=await db.createClassroom(session.user.id,obClassName||"My Class",parseInt(obGrade)||2,parseInt(obClassSize)||23);
        const selectedGoals=GOAL_LIBRARY.filter(g=>obSelectedGoals.has(g.id));
        // Create goals in parallel instead of sequentially
        await Promise.all(selectedGoals.map(g=>db.createGoal(classroom.id,g.title,g.casel)));
        setCls([classroom]);setPage("classes");
    }else{
      const sel=GOAL_LIBRARY.filter(g=>obSelectedGoals.has(g.id));
      const mc:Classroom={id:"dev-cls",teacher_id:"dev-u",name:obClassName||"My Class",grade_level:parseInt(obGrade)||2,class_size:parseInt(obClassSize)||23,display_code:"BND123",start_date:d.toISOString().split("T")[0],end_date:null,is_active:true};
      const mg:Goal[]=sel.map((g,i)=>({id:`dg${i}`,classroom_id:"dev-cls",title:g.title,casel_category:g.casel,is_active:true,sort_order:i}));
      setCls([mc]);setGoals(mg.length>0?mg:[{id:"dg0",classroom_id:"dev-cls",title:"General Point",casel_category:"Self-Management",is_active:true,sort_order:0}]);
      setACls(mc);setPage("classes");
    }
    }catch(e:any){console.error("finishOnboarding error:",e);setErr(e.message||"Something went wrong");}
    finally{clearTimeout(timeout);setSaving(false);}
  }

  async function openSettings(c:Classroom){
    setACls(c);setSetId(c.id);
    setSetF({name:c.name,grade_level:String(c.grade_level),class_size:String(c.class_size),start_date:c.start_date||d.toISOString().split("T")[0],end_date:c.end_date||""});
    try{
      const[g,p]=await Promise.all([db.getGoals(c.id),db.getPet(c.id)]);
      setSettingsGoals(g);setSettingsPet(p);setSettingsPetName(p?.name||"");
    }catch{setSettingsGoals([]);setSettingsPet(null);setSettingsPetName("");}
    setPage("settings");
  }

  function openNewClass(){
    setSetId(null);setACls(null);
    setSetF({name:"",grade_level:"2",class_size:"",start_date:d.toISOString().split("T")[0],end_date:""});
    setSettingsGoals([]);setSettingsPet(null);setSettingsPetName("");
    setPage("newClass");
  }

  async function saveSettings(){
    if(!setF)return;setSaving(true);setErr(null);
    try{
      if(page==="newClass"){
        if(useSB&&session){
          const classroom=await db.createClassroom(session.user.id,setF.name||"My Class",parseInt(setF.grade_level)||2,parseInt(setF.class_size)||23);
          for(const g of settingsGoals)await db.createGoal(classroom.id,g.title,g.casel_category);
          await loadCls(session.user.id);
        }else{
          const nc:Classroom={id:`dev-cls-${Date.now()}`,teacher_id:"dev-u",name:setF.name||"My Class",grade_level:parseInt(setF.grade_level)||2,class_size:parseInt(setF.class_size)||23,display_code:"NEW"+Math.random().toString(36).slice(2,5).toUpperCase(),start_date:setF.start_date,end_date:setF.end_date||null,is_active:true};
          setCls(p=>[...p,nc]);
        }
      }else{
        if(!setId)return;
        if(useSB&&session){
          await db.updateClassroom(setId,{name:setF.name,grade_level:parseInt(setF.grade_level)||2,class_size:parseInt(setF.class_size)||23,start_date:setF.start_date,end_date:setF.end_date||null});
          if(settingsPet&&settingsPetName&&settingsPetName!==settingsPet.name)await db.updatePet(setId,{name:settingsPetName});
          if(session?.user?.id)await loadCls(session.user.id);
        }else{
          setCls(p=>p.map(c=>c.id===setId?{...c,name:setF.name,grade_level:parseInt(setF.grade_level)||2,class_size:parseInt(setF.class_size)||23}:c));
          if(pet&&settingsPetName)setPet({...pet,name:settingsPetName});
        }
      }
      setPage("classes");
    }catch(e:any){setErr(e.message);}finally{setSaving(false);}
  }

  async function removeGoalFromSettings(goalId:string){
    if(useSB&&session&&setId){try{await db.deleteGoal(goalId);}catch(e:any){setErr(e.message);}}
    setSettingsGoals(p=>p.filter(g=>g.id!==goalId));
  }

  async function addGoalToSettings(title:string,caselCategory:string){
    if(useSB&&session&&setId){
      try{const g=await db.createGoal(setId,title,caselCategory);setSettingsGoals(p=>[...p,g]);}
      catch(e:any){setErr(e.message);}
    }else{
      const newG:Goal={id:`sg-${Date.now()}`,classroom_id:setId||"dev-cls",title,casel_category:caselCategory,is_active:true,sort_order:settingsGoals.length};
      setSettingsGoals(p=>[...p,newG]);
    }
    setShowGoalModal(false);
  }

  async function signOut(){if(useSB)await db.signOut();setSession(null);setCls([]);setACls(null);setPet(null);setGoals([]);setEquipped(null);setPage("landing");setShowSignIn(false);}

  async function openAccount(){
    if(useSB&&session){
      const u=await db.getUser(session.user.id);
      if(u){setAcctName(u.name||"");setAcctTeacher(u.teacher_name||"");setAcctGrades((u.grade_levels||[]).map(n=>n===-1?"PreK":n===0?"K":String(n)));}
    }else{setAcctName(obName);setAcctTeacher(obTeacher);setAcctGrades(obGrades);}
    setAcctEditing(false);setPage("account");
  }

  async function saveAccount(){
    setSaving(true);
    try{
      if(useSB&&session){
        await db.updateUser(session.user.id,{name:acctName,teacher_name:acctTeacher,email:session.user.email||"",grade_levels:acctGrades.map(g=>g==="K"?0:g==="PreK"?-1:parseInt(g))});
      }else{setObName(acctName);setObTeacher(acctTeacher);setObGrades(acctGrades);}
      setAcctEditing(false);
    }catch(e:any){setErr(e.message);}
    setSaving(false);
  }

  async function deleteAccount(){
    if(!confirm("Are you sure you want to delete your account? This action cannot be undone."))return;
    if(!confirm("This will permanently delete all your classes, pets, and data. Continue?"))return;
    setSaving(true);
    try{
      if(useSB&&session){
        const uid=session.user.id;
        const{data:classrooms}=await supabase.from("classrooms").select("id").eq("teacher_id",uid);
        if(classrooms){
          for(const c of classrooms){
            await supabase.from("checkins").delete().eq("classroom_id",c.id);
            await supabase.from("goals").delete().eq("classroom_id",c.id);
            await supabase.from("pets").delete().eq("classroom_id",c.id);
          }
          await supabase.from("classrooms").delete().eq("teacher_id",uid);
        }
        await supabase.from("users").delete().eq("id",uid);
        await db.signOut();
      }
      setSaving(false);
      setSession(null);setCls([]);setACls(null);setPet(null);setGoals([]);setPage("landing");setShowSignIn(false);
    }catch(e:any){setSaving(false);setErr(e.message);}
  }

  const toggleGoal=(id:string)=>{setObSelectedGoals(prev=>{const n=new Set(prev);if(n.has(id))n.delete(id);else n.add(id);return n;});};
  const isTut=page==="tutorial";const hlTab=isTut?TUTORIAL_STEPS[ts]?.highlight||null:null;const isRef=!!rCat;

  if(loading)return(<div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}><LogoBar/><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"#F0F0F0"}}><div style={{textAlign:"center"}}><div className="pulse"><PI size={140}/></div><p style={{marginTop:16,fontSize:15,color:"#999"}}>Loading...</p></div></div></div>);


  /* ===== LOGIN ===== */
  // Global saving overlay
  const savingEl=saving?<div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",backgroundColor:"rgba(255,255,255,.7)",backdropFilter:"blur(2px)"}}><div style={{textAlign:"center",padding:32,borderRadius:16,backgroundColor:"#fff",boxShadow:"0 8px 32px rgba(0,0,0,.12)"}}><div className="pulse" style={{display:"inline-block"}}><PI size={80}/></div><p style={{marginTop:12,fontSize:14,color:"#666",fontWeight:500}}>Saving...</p><button onClick={()=>setSaving(false)} style={{marginTop:16,fontSize:12,color:"#999",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Dismiss</button></div></div>:null;

  /* ===== LANDING PAGE (Figma Frame_163) ===== */
  if(page==="landing")return(<>
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",backgroundColor:"#FFFDF7"}}>
      {/* NAV */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 32px",backgroundColor:"#FFFDF7",borderBottom:"1px solid #F0EDE4"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <img src={ICONS.logo} alt="ClassBandit" style={{height:40,objectFit:"contain"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
        </div>
        <button onClick={()=>{setPage("login");setShowSignIn(true);}} style={{fontSize:14,fontWeight:600,color:"#333",background:"none",border:"none",cursor:"pointer"}}>Sign in</button>
      </nav>

      {/* HERO */}
      <section style={{padding:"64px 48px 48px",display:"flex",alignItems:"center",justifyContent:"center",gap:40,maxWidth:1100,margin:"0 auto",width:"100%"}}>
        <div style={{flex:1,maxWidth:520}}>
          <h1 style={{fontSize:44,fontWeight:800,lineHeight:1.15,marginBottom:16,color:"#1a1a1a"}}>
            Classroom Management That Builds <span style={{color:"#F59E0B"}}>Community</span>
          </h1>
          <p style={{fontSize:16,color:"#666",lineHeight:1.6,marginBottom:32}}>
            No individual tracking. No leaderboards. Just a class that grows together.
          </p>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <button onClick={()=>{setPage("login");setShowSignIn(true);}} style={{padding:"14px 28px",borderRadius:24,backgroundColor:"#FBBF24",color:"#1a1a1a",border:"none",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:"0 2px 8px rgba(251,191,36,.3)"}}>
              Create a Class Pet <span style={{fontSize:18}}>{"\u2192"}</span>
            </button>
            <button style={{padding:"14px 28px",borderRadius:24,backgroundColor:"transparent",color:"#333",border:"1.5px solid #D1D5DB",fontSize:15,fontWeight:600,cursor:"pointer"}}>
              Watch Demo
            </button>
          </div>
        </div>
        <div style={{flexShrink:0}}>
          <img src="/pets/pet-hero.png" alt="ClassBandit pet" style={{width:300,height:300,objectFit:"contain"}}/>
        </div>
      </section>

      {/* VALUE PROPS */}
      <section style={{padding:"80px 48px",textAlign:"center",maxWidth:1000,margin:"0 auto",width:"100%"}}>
        <h2 style={{fontSize:32,fontWeight:800,marginBottom:8,color:"#1a1a1a"}}>
          {"It\u2019s not just about behavior."}
        </h2>
        <h2 style={{fontSize:32,fontWeight:800,marginBottom:56,color:"#1a1a1a"}}>
          {"It\u2019s about "}<em>belonging.</em>
        </h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:40,textAlign:"left"}}>
          {[
            {title:"No Individual Tracking",desc:"No leaderboards. No public charts. No system that tells one child they\u2019re falling behind. Just a class working together."},
            {title:"Embedded Social and Emotional Learning",desc:"Social-emotional learning works best inside actual situations \u2014 transitions, conflicts, off days. ClassBandit\u2019s guided check-ins live there."},
            {title:"Low Lift For Teachers",desc:"One-click point awards. Always visible. No student logins. No data entry. If you can project it, you can use it."},
          ].map((f,i)=>(
            <div key={i}>
              <div style={{width:56,height:56,borderRadius:28,backgroundColor:"#E5E7EB",marginBottom:16}}/>
              <h3 style={{fontSize:16,fontWeight:700,marginBottom:8,color:"#1a1a1a"}}>{f.title}</h3>
              <p style={{fontSize:14,color:"#666",lineHeight:1.7}}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CASEL SECTION */}
      <section style={{padding:"80px 48px",maxWidth:1000,margin:"0 auto",width:"100%",display:"flex",alignItems:"center",gap:56}}>
        <div style={{flex:1}}>
          <h2 style={{fontSize:32,fontWeight:800,lineHeight:1.2,marginBottom:16,color:"#1a1a1a"}}>
            CASEL-aligned,<br/>Classroom ready.
          </h2>
          <p style={{fontSize:14,color:"#666",lineHeight:1.8}}>
            ClassBandit supports Tier 1 classroom SEL initiatives by reinforcing the five CASEL competencies through daily practice. Rather than delivering separate lessons, ClassBandit embeds skill development into classroom routines, making social-emotional growth visible, repeatable, and sustainable.
          </p>
        </div>
        <div style={{flexShrink:0}}>
          <img src="/images/casel-wheel.png" alt="CASEL Framework" style={{width:320,height:320,objectFit:"contain"}}/>
        </div>
      </section>

      {/* CTA FOOTER with cage background */}
      <section style={{margin:"48px 0 0",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"url(/images/cage-bg-landing.png)",backgroundSize:"cover",backgroundPosition:"center",filter:"saturate(0.3) brightness(1.05)",opacity:0.7}}/>
        <div style={{position:"absolute",inset:0,backgroundColor:"rgba(230,225,215,0.45)"}}/>
        <div style={{position:"relative",zIndex:1,padding:"80px 48px 0"}}>
          <h2 style={{fontSize:32,fontWeight:800,marginBottom:12,color:"#1a1a1a"}}>
            Ready to build a stronger classroom community?
          </h2>
          <p style={{fontSize:15,color:"#666",marginBottom:32}}>
            Adopt your class pet today and start building cooperation, one point at a time.
          </p>
          <button onClick={()=>{setPage("login");setShowSignIn(true);}} style={{padding:"14px 32px",borderRadius:24,backgroundColor:"#FBBF24",color:"#1a1a1a",border:"none",fontSize:15,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8,boxShadow:"0 2px 8px rgba(251,191,36,.3)",marginBottom:40}}>
            Get Started <span style={{fontSize:18}}>{"\u2192"}</span>
          </button>
          <div style={{display:"flex",justifyContent:"center",position:"relative",height:200}}>
            <img src="/images/hero-bottom-pet.png" alt="ClassBandit pet" style={{width:220,objectFit:"contain"}}/>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{padding:"24px 32px",display:"flex",justifyContent:"center",alignItems:"center",backgroundColor:"#FFFDF7",borderTop:"1px solid #F0EDE4"}}>
        <img src={ICONS.logo} alt="ClassBandit" style={{height:36,objectFit:"contain"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
      </footer>
    </div>
  </>);

  if(page==="login")return(<>{savingEl}
    <div style={{minHeight:"100vh",backgroundColor:"#FFFAF3",fontFamily:"'Inter',-apple-system,system-ui,sans-serif"}}>

      {/* NAV */}
      <nav style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 32px",borderBottom:"1px solid #F3F4F6"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <img src="/images/logo.png" alt="ClassBandit" style={{height:40,objectFit:"contain"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
        </div>
        <button onClick={()=>setShowSignIn(true)} style={{fontSize:14,fontWeight:500,color:"#333",background:"none",border:"none",cursor:"pointer"}}>Sign in</button>
      </nav>

      {/* HERO */}
      <section style={{padding:"64px 48px 80px",maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:48}}>
        <div style={{flex:1}}>
          <h1 style={{fontSize:36,fontWeight:800,lineHeight:1.18,color:"#1a1a1a",marginBottom:16,letterSpacing:"-.01em"}}>
            Classroom<br/>Management That<br/>Builds <span style={{color:"#D97706"}}>Community</span>
          </h1>
          <p style={{fontSize:13,color:"#6B7280",lineHeight:1.6,marginBottom:24,maxWidth:340}}>
            No individual tracking. No leaderboards. Just a class that grows together.
          </p>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            <button onClick={()=>setShowSignIn(true)} style={{padding:"10px 20px",borderRadius:20,backgroundColor:"#FBBF24",color:"#1a1a1a",border:"none",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6}}>Create a Class Pet <span>→</span></button>
            <button style={{padding:"10px 20px",borderRadius:20,backgroundColor:"#fff",color:"#333",border:"1px solid #D1D5DB",fontSize:13,fontWeight:600,cursor:"pointer"}}>Watch Demo</button>
          </div>
        </div>
        <div style={{flexShrink:0}}><img src="/pets/pet-hero.png" alt="ClassBandit pet" style={{width:220,height:220,objectFit:"contain"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/></div>
      </section>

      {/* VALUE PROPS */}
      <section style={{padding:"64px 48px",maxWidth:1100,margin:"0 auto",textAlign:"center"}}>
        <h2 style={{fontSize:24,fontWeight:700,color:"#1a1a1a",marginBottom:4}}>{"It\u2019s not just about behavior."}</h2>
        <h2 style={{fontSize:24,fontWeight:700,color:"#1a1a1a",marginBottom:48}}>{"It\u2019s about "}<em>belonging.</em></h2>
        <div style={{display:"flex",gap:40}}>
          {([
            {t:"No Individual Tracking",d:"No leaderboards. No public charts. No system that tells one child they\u2019re falling behind. Just a class working together."},
            {t:"Embedded Social and Emotional Learning",d:"Social-emotional learning works best inside actual situations \u2014 transitions, conflicts, off days. ClassBandit\u2019s guided check-ins live there."},
            {t:"Low Lift For Teachers",d:"One-click point awards. Always visible. No student logins. No data entry. If you can project it, you can use it."},
          ] as const).map((v,i)=>(
            <div key={i} style={{flex:1,textAlign:"left"}}>
              <div style={{width:48,height:48,borderRadius:24,backgroundColor:"#E5E7EB",marginBottom:14}}/>
              <h3 style={{fontSize:14,fontWeight:700,color:"#1a1a1a",marginBottom:6}}>{v.t}</h3>
              <p style={{fontSize:12,color:"#6B7280",lineHeight:1.6}}>{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CASEL */}
      <section style={{padding:"64px 48px",maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",gap:60}}>
        <div style={{flex:1}}>
          <h2 style={{fontSize:28,fontWeight:800,color:"#1a1a1a",lineHeight:1.2,marginBottom:16}}>CASEL-aligned,<br/>Classroom ready.</h2>
          <p style={{fontSize:12,color:"#6B7280",lineHeight:1.7,maxWidth:380}}>ClassBandit supports Tier 1 classroom SEL initiatives by reinforcing the five CASEL competencies through daily practice. Rather than delivering separate lessons, ClassBandit embeds skill development into classroom routines, making social-emotional growth visible, repeatable, and sustainable.</p>
        </div>
        <div style={{flexShrink:0}}><img src="/images/casel-wheel.png" alt="CASEL Framework" style={{width:300,height:300,objectFit:"contain"}}/></div>
      </section>

      {/* BOTTOM CTA with cage background */}
      <section style={{textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"url(/images/cage-bg-landing.png)",backgroundSize:"cover",backgroundPosition:"center"}}/>
        <div style={{position:"relative",zIndex:1,padding:"64px 48px 0"}}>
          <h2 style={{fontSize:28,fontWeight:800,color:"#1a1a1a",marginBottom:10}}>Ready to build a stronger classroom<br/>community?</h2>
          <p style={{fontSize:13,color:"#6B7280",marginBottom:20}}>Adopt your class pet today and start building cooperation,<br/>one point at a time.</p>
          <button onClick={()=>setShowSignIn(true)} style={{padding:"10px 24px",borderRadius:20,backgroundColor:"#FBBF24",color:"#1a1a1a",border:"none",fontSize:13,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:6}}>Get Started <span>→</span></button>
          <div style={{marginTop:32,display:"flex",justifyContent:"center"}}><img src="/images/hero-bottom-pet.png" alt="" style={{width:200,objectFit:"contain"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/></div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{padding:"36px 48px",textAlign:"center",backgroundColor:"#FFFAF3"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <img src="/images/logo.png" alt="ClassBandit" style={{height:28,objectFit:"contain"}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
        </div>
      </footer>

      {/* SIGN-IN PANEL */}
      {showSignIn&&(<div style={{position:"fixed",inset:0,zIndex:100}}>
        <div onClick={()=>setShowSignIn(false)} style={{position:"absolute",inset:0,backgroundColor:"rgba(0,0,0,.3)"}}/>
        <div className="fi" style={{position:"absolute",top:0,right:0,width:400,height:"100%",backgroundColor:"#fff",boxShadow:"-4px 0 24px rgba(0,0,0,.12)",padding:48,display:"flex",flexDirection:"column",justifyContent:"center",zIndex:101}}>
          <button onClick={()=>setShowSignIn(false)} style={{position:"absolute",top:20,right:20,background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#999"}}>{"\u2715"}</button>
          <div style={{textAlign:"center",marginBottom:32}}>
            <img src={ICONS.logo} alt="ClassBandit" style={{height:48,marginBottom:16}} onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
            <h2 style={{fontSize:24,fontWeight:800,color:"#1a1a1a"}}>Welcome!</h2>
            <p style={{fontSize:13,color:"#8E8E93",marginTop:6}}>Sign in with your school account</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <button onClick={()=>{if(useSB)db.signInWithGoogle();else{setPage("onboarding");setObStep(0);setShowSignIn(false);}}} className="ch" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"14px 20px",borderRadius:12,backgroundColor:"#fff",border:"1px solid #D1D5DB",fontSize:14,fontWeight:600,cursor:"pointer"}}><svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>Continue with Google</button>
            <button onClick={()=>{if(useSB)db.signInWithMicrosoft();else{setPage("onboarding");setObStep(0);setShowSignIn(false);}}} className="ch" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,padding:"14px 20px",borderRadius:12,backgroundColor:"#fff",border:"1px solid #D1D5DB",fontSize:14,fontWeight:600,cursor:"pointer"}}><svg width="20" height="20" viewBox="0 0 23 23"><rect width="10" height="10" fill="#F25022"/><rect x="12" width="10" height="10" fill="#7FBA00"/><rect y="12" width="10" height="10" fill="#00A4EF"/><rect x="12" y="12" width="10" height="10" fill="#FFB900"/></svg>Continue with Microsoft</button>
          </div>
        </div>
      </div>)}
      {err&&<div style={{position:"fixed",bottom:16,left:"50%",transform:"translateX(-50%)",padding:"8px 20px",borderRadius:8,backgroundColor:"#FEE2E2",color:"#DC2626",fontSize:12,zIndex:200}}>{err}</div>}
    </div>
  </>
  );

  /* ===== ONBOARDING ===== */
  if(page==="onboarding"){
    const card:React.CSSProperties={backgroundColor:"#fff",borderRadius:16,padding:32,maxWidth:520,width:"100%",boxShadow:"0 4px 20px rgba(0,0,0,.06)"};
    const inp:React.CSSProperties={width:"100%",padding:"12px 14px",borderRadius:10,border:"1px solid #D1D5DB",fontSize:14,outline:"none"};
    const lbl:React.CSSProperties={display:"block",fontSize:13,fontWeight:600,marginBottom:6};

    if(obStep===0)return(<>{savingEl}<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",backgroundColor:"#F5F5F5"}}><LogoBar right={<button onClick={signOut} style={{fontSize:12,color:"#8E8E93",background:"none",border:"none",cursor:"pointer"}}>Sign out</button>}/><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><div style={card}><StepDots current={0} total={3}/><h1 style={{fontSize:24,fontWeight:800,marginBottom:16}}>Setup your profile</h1><div style={{marginBottom:18}}><label style={lbl}>Name</label><input value={obName} onChange={e=>setObName(e.target.value)} placeholder="Jane Smith" style={inp}/></div><div style={{marginBottom:18}}><label style={lbl}>Teacher Name</label><input value={obTeacher} onChange={e=>setObTeacher(e.target.value)} placeholder="e.g. Ms. Smith, Mr. D" style={inp}/><span style={{fontSize:11,color:"#8E8E93",marginTop:2,display:"block"}}>What do your students call you?</span></div><div style={{marginBottom:18}}><label style={lbl}>Grade Level(s)</label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{GRADE_OPTIONS.map(g=>{const sel=obGrades.includes(g);return(<button key={g} onClick={()=>setObGrades(p=>sel?p.filter(x=>x!==g):[...p,g])} style={{width:52,height:44,borderRadius:22,border:sel?"2px solid #FACC15":"1.5px solid #D1D5DB",backgroundColor:sel?"#FACC15":"#fff",color:sel?"#1a1a1a":"#333",fontSize:14,fontWeight:600,cursor:"pointer"}}>{g}</button>);})}</div><span style={{fontSize:11,color:"#B8860B",marginTop:4,display:"block"}}>Select all that apply</span></div><div style={{display:"flex",justifyContent:"flex-end"}}><button onClick={()=>setObStep(1)} style={{padding:"12px 32px",borderRadius:10,backgroundColor:"#FACC15",color:"#1a1a1a",border:"none",fontSize:14,fontWeight:600,cursor:"pointer"}}>Continue</button></div></div></div></div></>);

    if(obStep===1)return(<>{savingEl}<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",backgroundColor:"#F5F5F5"}}><LogoBar/><div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}><div style={card}><StepDots current={1} total={3}/><h1 style={{fontSize:24,fontWeight:800,lineHeight:1.3,marginBottom:20}}>Welcome {obTeacher||obName},<br/>{"Let's set up your first class!"}</h1><div style={{marginBottom:18}}><label style={lbl}>Class Name <span style={{color:"#EF4444"}}>*</span></label><input value={obClassName} onChange={e=>setObClassName(e.target.value)} placeholder="e.g., Morning Homeroom, 3rd Grade Math" style={inp}/></div><div style={{marginBottom:18}}><label style={lbl}>What grade(s) are you getting a pet for? <span style={{color:"#EF4444"}}>*</span></label><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{GRADE_OPTIONS.map(g=>{const sel=obGrade===g;return(<button key={g} onClick={()=>setObGrade(g)} style={{width:52,height:44,borderRadius:22,border:sel?"2px solid #FACC15":"1.5px solid #D1D5DB",backgroundColor:sel?"#FACC15":"#fff",color:sel?"#1a1a1a":"#333",fontSize:14,fontWeight:600,cursor:"pointer"}}>{g}</button>);})}</div></div><div style={{marginBottom:18}}><label style={lbl}>Class size (optional)</label><div style={{display:"flex",alignItems:"center",gap:0}}><button onClick={()=>setObClassSize(p=>{const v=parseInt(p)||1;return String(Math.max(1,v-1))})} style={{width:44,height:44,borderRadius:"8px 0 0 8px",border:"1.5px solid #D1D5DB",borderRight:"none",backgroundColor:"#F9FAFB",fontSize:20,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>−</button><input type="number" value={obClassSize} onChange={e=>{const v=parseInt(e.target.value);if(!isNaN(v)&&v>=1)setObClassSize(String(v));else if(e.target.value==="")setObClassSize("")}} min={1} style={{width:60,height:44,textAlign:"center",border:"1.5px solid #D1D5DB",fontSize:14,fontWeight:600,outline:"none"}} /><button onClick={()=>setObClassSize(p=>{const v=parseInt(p)||0;return String(v+1)})} style={{width:44,height:44,borderRadius:"0 8px 8px 0",border:"1.5px solid #D1D5DB",borderLeft:"none",backgroundColor:"#F9FAFB",fontSize:20,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button></div></div><div style={{display:"flex",justifyContent:"flex-end",gap:10}}><button onClick={()=>setObStep(0)} style={{padding:"12px 24px",borderRadius:10,backgroundColor:"#fff",color:"#333",border:"1px solid #D1D5DB",fontSize:14,fontWeight:600,cursor:"pointer"}}>Back</button><button onClick={()=>setObStep(2)} style={{padding:"12px 32px",borderRadius:10,backgroundColor:"#FACC15",color:"#1a1a1a",border:"none",fontSize:14,fontWeight:600,cursor:"pointer"}}>Continue</button></div></div></div></div></>);

    if(obStep===2){const selGoals=GOAL_LIBRARY.filter(g=>obSelectedGoals.has(g.id));const categories=Array.from(new Set(GOAL_LIBRARY.map(g=>g.casel)));return(<>{savingEl}<div style={{minHeight:"100vh",display:"flex",flexDirection:"column",backgroundColor:"#F5F5F5"}}><LogoBar/><div style={{flex:1,display:"flex",alignItems:"flex-start",justifyContent:"center",padding:24,paddingTop:32}}><div style={{...card,maxWidth:700}}><StepDots current={2} total={3}/><h1 style={{fontSize:24,fontWeight:800,marginBottom:6}}>Set your class goals</h1><p style={{fontSize:13,color:"#8E8E93",marginBottom:12,lineHeight:1.5}}>Select goals inspired by the CASEL framework (minimum 5)</p><div style={{padding:"10px 16px",borderRadius:10,backgroundColor:obSelectedGoals.size>=5?"#DCFCE7":"#FEF9C3",marginBottom:12,fontSize:13,fontWeight:600,color:obSelectedGoals.size>=5?"#16A34A":"#CA8A04"}}>{obSelectedGoals.size} of 5 goals selected</div>{selGoals.length>0&&(<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14,padding:"10px 12px",borderRadius:10,backgroundColor:"#F0F9FF",border:"1px solid #BAE6FD"}}>{selGoals.map(g=>{const color=(CASEL_COLORS as any)[g.casel]||"#FACC15";return(<span key={g.id} onClick={()=>toggleGoal(g.id)} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:16,backgroundColor:color+"20",color:color,fontSize:11,fontWeight:600,cursor:"pointer",border:`1px solid ${color}40`}}>{g.title} {"\u00D7"}</span>);})}</div>)}<div style={{maxHeight:380,overflowY:"auto",display:"flex",flexDirection:"column",gap:16,marginBottom:16}}>{categories.map(cat=>{const color=(CASEL_COLORS as any)[cat]||"#FACC15";return(<div key={cat}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}><div style={{width:10,height:10,borderRadius:5,backgroundColor:color}}/><span style={{fontSize:12,fontWeight:700,color}}>{cat}</span></div><div style={{display:"flex",flexDirection:"column",gap:6}}>{GOAL_LIBRARY.filter(g=>g.casel===cat).map(g=>{const sel=obSelectedGoals.has(g.id);return(<div key={g.id} onClick={()=>toggleGoal(g.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,border:sel?`2px solid ${color}`:"1px solid #E5E7EB",backgroundColor:sel?color+"08":"#fff",cursor:"pointer"}}><div style={{width:20,height:20,borderRadius:4,border:sel?`2px solid ${color}`:"1.5px solid #D1D5DB",backgroundColor:sel?color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{sel&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>}</div><span style={{fontSize:13,fontWeight:600}}>{g.title}</span></div>);})}</div></div>);})}</div><div style={{display:"flex",justifyContent:"flex-end",gap:10}}><button onClick={()=>setObStep(1)} style={{padding:"12px 24px",borderRadius:10,backgroundColor:"#fff",color:"#333",border:"1px solid #D1D5DB",fontSize:14,fontWeight:600,cursor:"pointer"}}>Back</button><button onClick={finishOnboarding} disabled={obSelectedGoals.size<5} style={{padding:"12px 32px",borderRadius:10,backgroundColor:obSelectedGoals.size>=5?"#FACC15":"#D1D5DB",color:obSelectedGoals.size>=5?"#1a1a1a":"#fff",border:"none",fontSize:14,fontWeight:600,cursor:obSelectedGoals.size>=5?"pointer":"not-allowed"}}>Continue</button></div>{err&&<p style={{fontSize:12,color:"#EF4444",marginTop:8}}>{err}</p>}</div></div></div></>);}
  }

  /* ===== PET INTRO (Figma D25) ===== */
  if(page==="petIntro")return(<>{savingEl}
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}><CageBg/>
      <ClassHdr pet={null} onAcc={()=>setPage("classes")} onAccount={openAccount} onSignOut={signOut} startDate={aCls?.start_date||undefined}/>
      <div style={{display:"flex",flex:1,position:"relative",zIndex:1}}>
        <Nav tab="" onTab={()=>{}} hl={null} disabled/>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:32}}>
          <div style={{maxWidth:700,backgroundColor:"rgba(255,255,255,.95)",borderRadius:16,padding:48,boxShadow:"0 8px 32px rgba(0,0,0,.1)",display:"flex",alignItems:"center",gap:40}}>
            <div style={{flex:1}}>
              <h1 style={{fontSize:28,fontWeight:800,marginBottom:16,lineHeight:1.3}}>{"It\u2019s time to meet your class pet!"}</h1>
              <p style={{fontSize:14,color:"#555",lineHeight:1.7,marginBottom:12}}>He (or she) needs your help to grow, play, and stay happy.</p>
              <p style={{fontSize:14,color:"#555",lineHeight:1.7,marginBottom:12}}>{"When your class works together, you\u2019ll earn points to unlock fun surprises, accessories, and new things for his home!"}</p>
              <p style={{fontSize:14,color:"#555",lineHeight:1.7,marginBottom:24}}>Are you ready to adopt your class pet?</p>
              <button onClick={()=>setPage("petSelect")} style={{padding:"14px 28px",borderRadius:10,backgroundColor:"#FACC15",color:"#1a1a1a",border:"none",fontSize:14,fontWeight:600,cursor:"pointer"}}>Adopt your class pet!</button>
            </div>
            <div style={{flexShrink:0}}>
              <div style={{position:"relative"}}>
                <svg width="260" height="280" viewBox="0 0 260 280">
                  <ellipse cx="130" cy="160" rx="85" ry="75" fill="#C8D0DC" opacity=".4"/>
                  <ellipse cx="130" cy="120" rx="65" ry="58" fill="#C8D0DC" opacity=".4"/>
                  <text x="130" y="155" textAnchor="middle" fontSize="64" fill="#9CA3AF" fontWeight="700">?</text>
                  {/* Sparkles */}
                  <text x="60" y="180" fontSize="20" fill="#D1D5DB">{"\u2728"}</text>
                  <text x="200" y="80" fontSize="16" fill="#D1D5DB">{"\u2728"}</text>
                  <text x="190" y="200" fontSize="14" fill="#D1D5DB">{"\u2728"}</text>
                  <text x="80" y="70" fontSize="18" fill="#D1D5DB">{"\u2728"}</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div style={{width:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",zIndex:1}}></div>
      </div>
    </div>
  </>
  );

  /* ===== PET SELECTION ===== */
  if(page==="petSelect")return(<>{savingEl}
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}><CageBg/>
      <ClassHdr pet={null} onAcc={()=>setPage("classes")} onAccount={openAccount} onSignOut={signOut} startDate={aCls?.start_date||undefined}/>
      <div style={{display:"flex",flex:1,position:"relative",zIndex:1}}>
        <Nav tab="" onTab={()=>{}} hl={null} disabled/>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{maxWidth:700,backgroundColor:"rgba(255,255,255,.95)",borderRadius:16,padding:36,boxShadow:"0 8px 32px rgba(0,0,0,.1)",textAlign:"center"}}>
            <h1 style={{fontSize:28,fontWeight:800,marginBottom:8}}>Who will join our class?</h1>
            <p style={{fontSize:14,color:"#666",marginBottom:6}}>Every class pet needs a caring classroom.</p>
            <p style={{fontSize:13,color:"#888",marginBottom:28}}>Choose the pet to join you in your classroom or pick a mystery box and be surprised!</p>
            <div style={{display:"flex",gap:20,justifyContent:"center",marginBottom:24}}>
              {Object.entries(PETS).map(([k])=>(<div key={k} onClick={()=>setSelPetType(k)} style={{width:180,padding:16,borderRadius:14,border:selPetType===k?"3px solid #FACC15":"2px solid #E5E7EB",backgroundColor:"#fff",cursor:"pointer",textAlign:"center"}}><PI size={140} pt={k}/><div style={{marginTop:8}}><input type="radio" checked={selPetType===k} readOnly style={{accentColor:"#FACC15"}}/></div></div>))}
              <div onClick={()=>setSelPetType("mystery")} style={{width:180,padding:16,borderRadius:14,border:selPetType==="mystery"?"3px solid #FACC15":"2px solid #E5E7EB",backgroundColor:"#fff",cursor:"pointer",textAlign:"center"}}><MysteryPet size={140}/><div style={{marginTop:8}}><input type="radio" checked={selPetType==="mystery"} readOnly style={{accentColor:"#FACC15"}}/></div></div>
            </div>
            <button onClick={()=>{if(!selPetType)return;if(selPetType==="mystery")setSelPetType(Object.keys(PETS)[Math.floor(Math.random()*Object.keys(PETS).length)]);setPage("petName");}} disabled={!selPetType} style={{padding:"12px 32px",borderRadius:10,backgroundColor:selPetType?"#FACC15":"#D1D5DB",color:selPetType?"#1a1a1a":"#fff",border:"none",fontSize:14,fontWeight:600,cursor:selPetType?"pointer":"not-allowed"}}>Continue</button>
          </div>
        </div>
        <div style={{width:80}}/>
      </div>
    </div>
  </>
  );

  /* ===== PET NAMING ===== */
  if(page==="petName")return(<>{savingEl}
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}><CageBg/>
      <ClassHdr pet={null} onAcc={()=>setPage("classes")} onAccount={openAccount} onSignOut={signOut} startDate={aCls?.start_date||undefined}/>
      <div style={{display:"flex",flex:1,position:"relative",zIndex:1}}>
        <Nav tab="" onTab={()=>{}} hl={null} disabled/>
        <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{maxWidth:560,backgroundColor:"rgba(255,255,255,.95)",borderRadius:16,padding:36,boxShadow:"0 8px 32px rgba(0,0,0,.1)",textAlign:"center"}}>
            <h1 style={{fontSize:28,fontWeight:800,marginBottom:8}}>{"Let's name our class pet!"}</h1>
            <p style={{fontSize:14,color:"#666",marginBottom:4}}>This pet belongs to everyone in our class.</p>
            <p style={{fontSize:13,color:"#888",marginBottom:24}}>{"Let's choose a name together!"}</p>
            <div className="fl" style={{marginBottom:20,display:"flex",justifyContent:"center"}}><PI size={200} pt={selPetType||"pet1"}/></div>
            <input value={petNameInput} onChange={e=>setPetNameInput(e.target.value)} placeholder="Enter name" style={{width:280,padding:"14px 18px",borderRadius:10,border:"1px solid #D1D5DB",fontSize:16,textAlign:"center",outline:"none",marginBottom:20}}/>
            <div><button onClick={selectPetAndName} disabled={!petNameInput.trim()} style={{padding:"12px 32px",borderRadius:10,backgroundColor:petNameInput.trim()?"#FACC15":"#D1D5DB",color:petNameInput.trim()?"#1a1a1a":"#fff",border:"none",fontSize:14,fontWeight:600,cursor:petNameInput.trim()?"pointer":"not-allowed"}}>Continue</button></div>
          </div>
        </div>
        <div style={{width:80,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",zIndex:1}}></div>
      </div>
    </div>
  </>
  );

  /* ===== MY ACCOUNT ===== */
  if(page==="account")return(<>{savingEl}
    <div style={{minHeight:"100vh",backgroundColor:"#FAFAFA"}}>
      <LogoBar right={<button onClick={signOut} style={{fontSize:13,color:"#8E8E93",background:"none",border:"none",cursor:"pointer"}}>Sign out</button>}/>
      <div style={{display:"flex"}}>
        <div style={{width:200,padding:"24px 14px",borderRight:"1px solid #F0F0F0",backgroundColor:"#fff",minHeight:"calc(100vh - 68px)"}}>
          <div style={{padding:"8px 10px",fontSize:12,fontWeight:600,color:"#B8860B",backgroundColor:"#FEF9C3",borderLeft:"3px solid #FACC15",borderRadius:5}}>My Account</div>
          <div onClick={()=>setPage("classes")} style={{padding:"8px 10px",fontSize:12,color:"#555",cursor:"pointer",borderRadius:5,marginBottom:2}}>My Classes</div>
        </div>
        <div style={{flex:1,padding:28}}>
          <div style={{borderRadius:14,padding:28,backgroundColor:"#fff",border:"1px solid #E5E7EB",maxWidth:700}}>
            <h1 style={{fontSize:22,fontWeight:800,marginBottom:24}}>My Account</h1>

            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:4}}>Profile Picture</label>
              <div style={{width:56,height:56,borderRadius:28,backgroundColor:"#FACC15",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
            </div>

            <div style={{marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:4}}>
                <label style={{display:"block",fontSize:12,fontWeight:600}}>Full Name</label>
                {!acctEditing&&<button onClick={()=>setAcctEditing(true)} style={{fontSize:12,color:"#3B82F6",background:"none",border:"none",cursor:"pointer",fontWeight:500}}>Edit</button>}
              </div>
              {acctEditing?(<input value={acctName} onChange={e=>setAcctName(e.target.value)} style={{width:"100%",maxWidth:400,padding:"10px 12px",borderRadius:8,border:"1px solid #D1D5DB",fontSize:13,outline:"none"}}/>):(<div style={{fontSize:14,color:"#333"}}>{acctName||"—"}</div>)}
            </div>

            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:4}}>Teacher Name</label>
              {acctEditing?(<><input value={acctTeacher} onChange={e=>setAcctTeacher(e.target.value)} placeholder="Ms. Smith (edit state)" style={{width:"100%",maxWidth:400,padding:"10px 12px",borderRadius:8,border:"1px solid #D1D5DB",fontSize:13,outline:"none"}}/><span style={{fontSize:11,color:"#8E8E93",marginTop:2,display:"block"}}>What do your students call you?</span></>):(<div style={{fontSize:14,color:"#333"}}>{acctTeacher||"—"}</div>)}
            </div>

            <div style={{marginBottom:24}}>
              <label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:8}}>Grade Level(s)</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {GRADE_OPTIONS.map(g=>{const sel=acctGrades.includes(g);return(
                  <button key={g} onClick={()=>{if(acctEditing)setAcctGrades(p=>sel?p.filter(x=>x!==g):[...p,g]);}} style={{width:52,height:44,borderRadius:22,border:sel?"2px solid #FACC15":"1.5px solid #D1D5DB",backgroundColor:sel?"#FACC15":"#fff",color:sel?"#1a1a1a":"#333",fontSize:14,fontWeight:600,cursor:acctEditing?"pointer":"default",opacity:acctEditing?1:.8}}>{g}</button>
                );})}
              </div>
              {acctEditing&&<span style={{fontSize:11,color:"#B8860B",marginTop:4,display:"block"}}>Select all that apply</span>}
            </div>

            {acctEditing&&<button onClick={saveAccount} disabled={saving} style={{padding:"10px 24px",borderRadius:8,backgroundColor:"#FACC15",color:"#1a1a1a",border:"none",fontSize:13,fontWeight:600,cursor:saving?"not-allowed":"pointer",marginBottom:24}}>{saving?"Saving...":"Save Changes"}</button>}

            <div style={{borderTop:"1px solid #E5E7EB",paddingTop:20,marginTop:8}}>
              <button onClick={deleteAccount} style={{fontSize:13,color:"#EF4444",background:"none",border:"none",cursor:"pointer",fontWeight:500,display:"flex",alignItems:"center",gap:6}}>{"\uD83D\uDDD1\uFE0F"} Delete Account</button>
            </div>

            {err&&<p style={{fontSize:12,color:"#EF4444",marginTop:12}}>{err}</p>}
          </div>
        </div>
      </div>
    </div>
  </>);

  /* ===== MY CLASSES ===== */
  if(page==="classes")return(<>{savingEl}
    <div style={{minHeight:"100vh",backgroundColor:"#FAFAFA"}}>
      <LogoBar right={<button onClick={signOut} style={{fontSize:13,color:"#8E8E93",background:"none",border:"none",cursor:"pointer"}}>Sign out</button>}/>
      <div style={{display:"flex"}}>
        <div style={{width:200,padding:"24px 14px",borderRight:"1px solid #F0F0F0",backgroundColor:"#fff",minHeight:"calc(100vh - 68px)"}}>
          <div onClick={openAccount} style={{padding:"8px 10px",fontSize:12,color:"#555",cursor:"pointer",borderRadius:5,marginBottom:2}}>My Account</div>
          <div style={{padding:"8px 10px",fontSize:12,fontWeight:600,color:"#B8860B",backgroundColor:"#FEF9C3",borderLeft:"3px solid #FACC15",borderRadius:5}}>My Classes</div>
        </div>
        <div style={{flex:1,padding:28}}>
          <div style={{borderRadius:14,padding:28,backgroundColor:"#fff",border:"1px solid #E5E7EB"}}>
            <h1 style={{fontSize:22,fontWeight:800,marginBottom:20}}>My Classes</h1>
            <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
              {cls.map(c=>(
                <div key={c.id} className="ch" onClick={()=>{if(useSB)enterClass(c);else{setACls(c);const hasPet=!!pet&&pet.classroom_id===c.id;if(hasPet)setPage("classroom");else setPage("petIntro");}}} style={{width:200,padding:18,borderRadius:14,textAlign:"center",cursor:"pointer",backgroundColor:"#DBEAFE",border:"1px solid #93C5FD",position:"relative"}}>
                  <div style={{display:"flex",justifyContent:"center"}}><PI size={80} pt="pet1" type="standing"/></div>
                  <div style={{fontWeight:700,fontSize:14,marginTop:8}}>{c.name}</div>
                  <div style={{fontSize:12,color:"#6B7280"}}>{gradeName(c.grade_level)}</div>
                  <div style={{fontSize:11,color:"#9CA3AF"}}>{c.class_size} students</div>
                  <button onClick={e=>{e.stopPropagation();openSettings(c);}} style={{position:"absolute",top:8,right:8,background:"none",border:"none",cursor:"pointer",fontSize:16}}>{"\u2699\uFE0F"}</button>
                </div>
              ))}
              <div className="ch" onClick={openNewClass} style={{width:200,padding:18,borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:"2px dashed #D1D5DB",cursor:"pointer",minHeight:180}}>
                <span style={{fontSize:30,color:"#D1D5DB"}}>+</span><span style={{fontSize:12,color:"#AEAEB2",marginTop:4}}>Add new class</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );

  /* ===== SETTINGS / NEW CLASS ===== */
  if((page==="settings"||page==="newClass")&&setF){
    const isNew=page==="newClass";
    const existingGoalTitles=new Set(settingsGoals.map(g=>g.title));
    const currentMood=settingsPet?.mood||"neutral";
    return(<>{savingEl}
    <div style={{minHeight:"100vh",backgroundColor:"#FAFAFA"}}>
      <LogoBar/>
      <div style={{display:"flex"}}>
        <div style={{width:200,padding:"24px 14px",borderRight:"1px solid #F0F0F0",backgroundColor:"#fff",minHeight:"calc(100vh - 68px)"}}>
          <div onClick={openAccount} style={{padding:"8px 10px",fontSize:12,color:"#555",cursor:"pointer",borderRadius:5,marginBottom:2}}>My Account</div>
          <div onClick={()=>setPage("classes")} style={{padding:"8px 10px",fontSize:12,color:"#555",cursor:"pointer",borderRadius:5,marginBottom:2}}>My Classes</div>
          <div style={{paddingLeft:16,marginBottom:2}}>
            <div style={{padding:"8px 10px",fontSize:12,fontWeight:600,color:"#B8860B",backgroundColor:"#FEF9C3",borderLeft:"3px solid #FACC15",borderRadius:5}}>{isNew?"New Class":"Class Settings"}</div>
          </div>
        </div>
        <div style={{flex:1,padding:28}}>
          <div style={{borderRadius:14,padding:28,backgroundColor:"#fff",border:"1px solid #E5E7EB"}}>
            <button onClick={()=>setPage("classes")} style={{fontSize:12,color:"#8E8E93",background:"none",border:"none",cursor:"pointer",marginBottom:16}}>{"\u2190"} Back to My Classes</button>
            <h1 style={{fontSize:22,fontWeight:800,marginBottom:4}}>{isNew?"Create New Class":(settingsPet?.name||"Class Pet")}</h1>
            <p style={{fontSize:13,color:"#8E8E93",marginBottom:24}}>{isNew?"Set up a new classroom":gradeName(parseInt(setF.grade_level)||2)+" Homeroom"}</p>
            <div style={{display:"flex",gap:40}}>
              <div style={{flex:1,maxWidth:480}}>
                <div style={{marginBottom:16}}><label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:4}}>Class name</label><input value={setF.name} onChange={e=>setSetF((p:any)=>({...p,name:e.target.value}))} placeholder="e.g., 2nd Grade Math" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #D1D5DB",fontSize:13,outline:"none"}}/></div>
                {!isNew&&<div style={{marginBottom:16}}><label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:4}}>Pet name</label><input value={settingsPetName} onChange={e=>setSettingsPetName(e.target.value)} placeholder={settingsPet?"Edit pet name":"No pet selected yet"} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #D1D5DB",fontSize:13,outline:"none",backgroundColor:settingsPet?"#fff":"#F9FAFB"}} readOnly={!settingsPet}/></div>}
                <div style={{display:"flex",gap:12,marginBottom:16}}>
                  <div style={{flex:1}}><label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:4}}>Grade level</label><select value={setF.grade_level} onChange={e=>setSetF((p:any)=>({...p,grade_level:e.target.value}))} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #D1D5DB",fontSize:13,outline:"none",backgroundColor:"#fff"}}>{GRADE_OPTIONS.map(g=><option key={g} value={g}>{g==="K"?"Kindergarten":g==="PreK"?"Pre-K":`Grade ${g}`}</option>)}</select></div>
                  <div style={{flex:1}}><label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:4}}>Class size</label><input type="number" value={setF.class_size} onChange={e=>setSetF((p:any)=>({...p,class_size:e.target.value}))} placeholder="16" style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #D1D5DB",fontSize:13,outline:"none"}}/></div>
                </div>
                <h2 style={{fontSize:16,fontWeight:700,marginTop:20,marginBottom:12}}>Goals</h2>
                {settingsGoals.length>0?(<div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:8}}>{settingsGoals.map(g=>{const color=(CASEL_COLORS as any)[g.casel_category]||"#FACC15";return(<div key={g.id} style={{padding:"10px 12px",borderRadius:8,backgroundColor:"#FAFAFA",border:"1px solid #E5E7EB",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:600,color}}>{g.title}</div><div style={{fontSize:10,color:"#AEAEB2"}}>{g.casel_category}</div></div><button onClick={()=>removeGoalFromSettings(g.id)} style={{fontSize:14,color:"#EF4444",background:"none",border:"none",cursor:"pointer",padding:"4px 8px"}}>{"\u2715"}</button></div>);})}</div>):(<p style={{fontSize:12,color:"#AEAEB2",marginBottom:8}}>No goals added yet</p>)}
                <button onClick={()=>setShowGoalModal(true)} style={{fontSize:12,fontWeight:600,color:"#B8860B",background:"none",border:"none",cursor:"pointer",marginTop:4,marginBottom:20}}>+ Add New Goal</button>
                <div style={{display:"flex",gap:12,marginBottom:16}}>
                  <div style={{flex:1}}><label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:4}}>Start date</label><input type="date" value={setF.start_date} onChange={e=>setSetF((p:any)=>({...p,start_date:e.target.value}))} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #D1D5DB",fontSize:13,outline:"none"}}/></div>
                  <div style={{flex:1}}><label style={{display:"block",fontSize:12,fontWeight:600,marginBottom:4}}>End date</label><input type="date" value={setF.end_date} onChange={e=>setSetF((p:any)=>({...p,end_date:e.target.value}))} style={{width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid #D1D5DB",fontSize:13,outline:"none"}}/></div>
                </div>
                {!isNew&&<div style={{borderTop:"1px solid #E5E7EB",paddingTop:18,marginTop:12}}><h3 style={{fontSize:14,fontWeight:600,marginBottom:10,color:"#666"}}>Admin Tools</h3><button style={{display:"block",fontSize:12,color:"#EF4444",background:"none",border:"none",cursor:"pointer",marginBottom:8}}>{"\uD83D\uDDD1"} Manually delete points</button><button style={{display:"block",fontSize:12,color:"#666",background:"none",border:"none",cursor:"pointer",marginBottom:8}}>{"\uD83D\uDCCB"} Change log</button><button style={{display:"block",fontSize:12,color:"#666",background:"none",border:"none",cursor:"pointer"}}>{"\uD83D\uDCAD"} Set reflection questions</button></div>}
                <button onClick={saveSettings} disabled={saving||!setF.name?.trim()} style={{marginTop:24,padding:"12px 32px",borderRadius:10,backgroundColor:(saving||!setF.name?.trim())?"#D1D5DB":"#FACC15",color:(saving||!setF.name?.trim())?"#fff":"#1a1a1a",border:"none",fontSize:14,fontWeight:600,cursor:(saving||!setF.name?.trim())?"not-allowed":"pointer"}}>{saving?"Saving...":isNew?"Create Class":"Save Changes"}</button>
                {err&&<p style={{fontSize:12,color:"#EF4444",marginTop:8}}>{err}</p>}
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{borderRadius:14,border:"2px solid #D1D5DB",overflow:"hidden",maxWidth:400}}>
                  <img src="/images/class-settings-preview.svg" alt="Class View Preview" style={{width:"100%",height:"auto",objectFit:"contain",display:"block"}}/>
                </div>
                {!isNew&&<button onClick={()=>{if(useSB&&aCls)loadCD(aCls).then(()=>setPage("classroom"));else setPage("classroom");}} style={{marginTop:14,padding:"10px 24px",borderRadius:8,backgroundColor:"#FACC15",color:"#1a1a1a",border:"none",fontSize:13,fontWeight:600,cursor:"pointer"}}>{`Go to class view \u2192`}</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showGoalModal&&<GoalAddModal existingTitles={existingGoalTitles} onAdd={addGoalToSettings} onClose={()=>setShowGoalModal(false)}/>}
    </div>
  </>);}

  /* ===== TUTORIAL + CLASSROOM ===== */
  if(page==="classroom"||page==="tutorial"){
    const pn=pet?.name||"Bandit";const gn=aCls?.name||"class";
    // Compute pet mood image based on fed/watered status
    const today=new Date().toDateString();
    const fedToday=!!pet?.last_fed_at&&new Date(pet.last_fed_at).toDateString()===today;
    const wateredToday=!!pet?.last_watered_at&&new Date(pet.last_watered_at).toDateString()===today;
    const baseMood=fedToday&&wateredToday?"standing":fedToday||wateredToday?"happyOne":"neutral";
    // If an accessory is equipped and has pet images, use those instead
    const equippedReward=equipped?LEVEL_REWARDS.find(r=>r.id===equipped):null;
    const petMoodType=baseMood;
    const petMoodSrc=equippedReward?.petImages?(equippedReward.petImages as any)[baseMood]||equippedReward.petImages.happyOne:null;
    return(
      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column"}}><CageBg/>{savingEl}
        <ClassHdr pet={pet} onAcc={()=>setPage("classes")} onAccount={openAccount} onSignOut={signOut} startDate={aCls?.start_date||undefined}/>
        <div style={{display:"flex",flex:1,position:"relative",zIndex:1}}>
          {!isTut&&<Nav tab={tab} onTab={t=>{if(tab===t&&po){setPo(false);}else{setTab(t);setPo(true);}setRCat(null);}} hl={hlTab}/>}
          {isTut&&<Nav tab="" onTab={()=>{}} hl={null} disabled/>}
          {po&&!isTut&&!isRef&&(
            <div style={{width:320,maxHeight:"calc(100vh - 120px)",backgroundColor:"rgba(255,255,255,.92)",backdropFilter:"blur(6px)",borderRadius:16,border:"1px solid #E5E7EB",overflowY:"auto",position:"absolute",top:16,left:108,zIndex:10,boxShadow:"0 4px 20px rgba(0,0,0,.08)"}}>
              <button onClick={()=>setPo(false)} style={{position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",color:"#CCC",fontSize:16}}>{"\u2039"}</button>
              {tab==="goals"&&<GoalsP goals={goals} onAdd={addPt} dc={dc}/>}
              {tab==="awards"&&<AwardsP totalPts={pet?.total_points||0} equipped={equipped} onEquip={equipItem} onUnequip={unequipItem}/>}
              {tab==="reflect"&&<ReflectP onStart={t=>{setRCat(t);setPo(false);}}/>}
            </div>
          )}
          <div style={{flex:1,position:"relative",display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {isRef?(
              <><RefFull cat={rCat!} onDone={()=>{setRCat(null);setPo(false);}} onPoint={()=>{
                // Add point silently (without the normal addPt toast)
                if(aCls){
                  if(useSB&&session){db.addPoints(aCls.id,null,"general",1).then(up=>{if(!up.equipped_accessory&&equipped)up.equipped_accessory=equipped;setPet(up);}).catch(()=>{});}
                  else{setPet(p=>{if(!p)return p;let lp=p.level_points+1,lv=p.level;if(lp>=PPL){lv++;lp=0;}return{...p,total_points:p.total_points+1,level:lv,level_points:lp};});}
                  setDc(p=>({...p,general:(p.general||0)+1}));
                }
                showToast({icon:"/icons/reflect.png",title:"Reflection Complete!",sub:"+1 Point"});
              }}/><div style={{position:"absolute",bottom:24,left:24,zIndex:5}}><div className="fl"><PI size={280} pt={pet?.pet_type} type={petMoodType} srcOverride={petMoodSrc}/></div><div style={{fontSize:15,fontWeight:700,textAlign:"center",marginTop:2}}>{pn}</div></div></>
            ):(
              <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:5}}>
                {!isTut&&<div style={{textAlign:"center",marginBottom:16}}>
                  <p style={{fontSize:32,color:"#717171",fontWeight:600,fontFamily:"Figtree, sans-serif",marginBottom:8}}>{dayN}, {dateS}.</p>
                  <h1 style={{fontSize:40,fontWeight:600,lineHeight:1,color:"#000",fontFamily:"Bricolage Grotesque, sans-serif"}}>
                    {justEquipped&&equippedReward?`Thank you for the ${equippedReward.title}!`:`Good morning, ${gn}!`}
                    {!(justEquipped&&equippedReward)&&<><br/>{"Let's work hard and have a great day!"}</>}
                  </h1>
                </div>}
                {!isTut&&<><div style={{position:"relative"}} className="fl"><PI size={280} pt={pet?.pet_type} type={petMoodType} srcOverride={petMoodSrc}/></div>
                <div style={{fontSize:40,fontWeight:600,marginTop:4,color:"#000",fontFamily:"Bricolage Grotesque, sans-serif",zIndex:5}}>{pn}</div></>}
                {/* Level-up reward popup */}
                {levelUpReward&&(
                  <div style={{position:"fixed",inset:0,backgroundColor:"rgba(0,0,0,.4)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setLevelUpReward(null)}>
                    <div onClick={e=>e.stopPropagation()} className="fi" style={{backgroundColor:"#fff",borderRadius:20,padding:32,maxWidth:440,width:"90%",textAlign:"center",boxShadow:"0 16px 64px rgba(0,0,0,.2)"}}>
                      <div style={{fontSize:24,marginBottom:4}}>{"✨"}</div>
                      <h2 style={{fontSize:22,fontWeight:700,marginBottom:8}}>{levelUpReward.pointsRequired} Points — Reward Unlocked!</h2>
                      <p style={{fontSize:14,color:"#555",marginBottom:4}}>For your excellent teamwork, you've earned {pn} the <b>{levelUpReward.title}</b>!</p>
                      <p style={{fontSize:13,color:"#888",marginBottom:16}}>You can equip it now and see {pn}'s new look or save it under Rewards.</p>
                      {levelUpReward.icon&&<div style={{display:"flex",justifyContent:"center",marginBottom:20}}><img src={levelUpReward.icon} alt={levelUpReward.title} width={100} height={100} style={{objectFit:"contain"}}/></div>}
                      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
                        <button onClick={()=>setLevelUpReward(null)} style={{padding:"12px 28px",borderRadius:10,backgroundColor:"#fff",color:"#333",border:"1px solid #D1D5DB",fontSize:14,fontWeight:600,cursor:"pointer"}}>Maybe Later</button>
                        <button onClick={()=>{equipItem(levelUpReward.id);setLevelUpReward(null);}} style={{padding:"12px 28px",borderRadius:10,backgroundColor:"#FACC15",color:"#1a1a1a",border:"none",fontSize:14,fontWeight:600,cursor:"pointer"}}>Equip</button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Toast banner */}
                {pop&&toast&&(
                  <div className="toast-in" style={{position:"fixed",bottom:32,left:32,zIndex:100,display:"flex",alignItems:"center",gap:14,padding:"14px 24px",borderRadius:16,backgroundColor:"#EDF5FF",border:"3px solid #0077FF",boxShadow:"0 4px 0 0 #0077FF",minWidth:280,maxWidth:420}}>
                    <div style={{width:56,height:56,borderRadius:14,backgroundColor:"#F0F4FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <img src={toast.icon} alt="" width={44} height={44} style={{objectFit:"contain"}}/>
                    </div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:"#1a1a1a"}}>{toast.title}</div>
                      <div style={{fontSize:13,fontWeight:600,color:"#10B981"}}>{toast.sub}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {isTut&&<><div style={{position:"absolute",inset:0,backgroundColor:"rgba(0,0,0,.08)",zIndex:50,pointerEvents:"none"}}/><Tut step={ts} pn={pn} pt={pet?.pet_type} onNext={tutN}/></>}

          </div>
          {!isRef&&<div style={{position:"absolute",bottom:24,right:40,zIndex:isTut?8:10,pointerEvents:isTut?"none":"auto",opacity:isTut?.5:1}}>
            <Care onAct={t=>addPt(t)} hl={hlTab} pet={pet}/>
          </div>}
        </div>
      </div>
    );
  }

  return null;
}
