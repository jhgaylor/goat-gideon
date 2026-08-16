(() => {
const $ = s => document.querySelector(s);
let SEASONS = [], UNITS = [];
const AXIS = () => window.CHART_AXIS || "season";           // "season" | "episode"
const unitOf = e => AXIS()==="episode" ? e.idx : e.s;       // which chart column an episode lives in
const CATS = window.ERA_CATS;
const state = {
  seasons:new Set(), tags:new Set(), eras:[], char:"", q:"", minRating:0, sort:"air",
  hideWatched:false, onlyWatched:false,
};
let EPS=[], CAST={}, CHAR_COUNT={};
const watched = new Set(JSON.parse(localStorage.getItem("spn_watched")||"[]"));
const saveWatched = () => localStorage.setItem("spn_watched", JSON.stringify([...watched]));
const code = e => `S${String(e.s).padStart(2,"0")}E${String(e.e).padStart(2,"0")}`;
const track = (ev,props)=>{ try{ window.posthog && posthog.capture(ev,props); }catch{} };
const esc = s => String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

// ---------- data ----------
async function load(){
  EPS = await (await fetch("data/episodes.json")).json();
  const maxS=Math.max(...EPS.map(e=>e.s)); SEASONS=Array.from({length:maxS},(_,i)=>i+1);
  EPS.forEach((e,i)=>{ e.idx=i+1; });
  UNITS = AXIS()==="episode"
    ? EPS.map(e=>({n:e.idx,label:`${e.s}×${String(e.e).padStart(2,"0")}`,season:e.s,ep:e,title:`S${e.s}E${String(e.e).padStart(2,"0")} · ${e.title}`}))
    : SEASONS.map(s=>({n:s,label:String(s),season:s,title:`Season ${s} (${SEASON_META[s].years})`}));
  document.documentElement.style.setProperty("--ncols",UNITS.length);
  document.documentElement.classList.toggle("axis-episode",AXIS()==="episode");
  try { CAST = (await (await fetch("data/cast.json")).json()); } catch { CAST = {}; }
  const perSeason = {};
  EPS.forEach(e=>{ perSeason[e.s]=Math.max(perSeason[e.s]||0,e.e); });
  EPS.forEach(e=>{
    e.code = code(e);
    e.tags = new Set(window.EP_TAGS[`${e.s}.${e.e}`]||[]);
    if(e.e===1) e.tags.add("premiere");
    if(e.e===perSeason[e.s]) e.tags.add("finale");
    e.guests = (CAST[e.id]||[]);
    e.guests.forEach(([c])=>{ CHAR_COUNT[c]=(CHAR_COUNT[c]||0)+1; });
    e.hay = `${e.code} ${e.title} ${e.summary} ${e.guests.map(g=>g.join(" ")).join(" ")}`.toLowerCase();
  });
  window.TAG_DEFS.premiere={label:"Season premiere"};
  window.TAG_DEFS.finale={label:"Season finale"};
  buildChart(); buildFilters(); readHash(); render();
}
// ---------- URL state ----------
function writeHash(){
  const p=new URLSearchParams();
  if(state.seasons.size)p.set("s",[...state.seasons].join(","));
  if(state.tags.size)p.set("t",[...state.tags].join(","));
  if(state.eras.length)p.set("e",JSON.stringify(state.eras.map(e=>[e.cat,e.name])));
  if(state.char)p.set("c",state.char); if(state.q)p.set("q",state.q);
  if(state.minRating)p.set("r",state.minRating); if(state.sort!=="air")p.set("o",state.sort);
  const h=p.toString(); history.replaceState(null,"",h?"#"+h:location.pathname);
}
function readHash(){
  const p=new URLSearchParams(location.hash.slice(1)); if(![...p.keys()].length)return;
  (p.get("s")||"").split(",").filter(Boolean).forEach(x=>state.seasons.add(+x));
  (p.get("t")||"").split(",").filter(Boolean).forEach(x=>{if(TAG_DEFS[x])state.tags.add(x);});
  try{ (JSON.parse(p.get("e")||"[]")).forEach(([cat,name])=>{ const all=[]; UNITS.forEach(u=>all.push(...unitContext(u.n))); const f=all.find(x=>x.cat===cat&&x.name===name); if(f&&!state.eras.some(x=>eraKey(x)===eraKey(f))) state.eras.push(f); }); }catch{}
  state.char=p.get("c")||""; $("#charSelect").value=state.char;
  state.q=(p.get("q")||"").toLowerCase(); $("#search").value=state.q; $("#searchMobile").value=state.q;
  state.minRating=+(p.get("r")||0); $("#minRating").value=state.minRating; $("#minRatingOut").textContent=state.minRating?state.minRating.toFixed(1)+"+":"any";
  state.sort=p.get("o")||"air"; $("#sort").value=state.sort;
}

// ---------- chart ----------
function buildChart(){
  const el = $("#chart"); el.innerHTML="";
  const add=(cls,html,style="")=>{const d=document.createElement("div");d.className=cls;d.innerHTML=html;if(style)d.style.cssText=style;el.appendChild(d);return d;};
  if(AXIS()==="episode"){
    add("hdr lbl","Season");
    SEASONS.forEach(s=>{const n=UNITS.filter(u=>u.season===s).length; if(!n) return; const h=add("hdr",`Season ${s} <span class="muted">· ${SEASON_META[s].years}</span>`,`grid-column:span ${n}`);h.dataset.season=s;h.title=`Season ${s} — click to filter`;h.onclick=ev=>toggleSeason(s,ev.shiftKey);});
    add("hdr lbl","Episode");
    UNITS.forEach(u=>{const h=add("hdr ep",u.label);h.title=u.title+" — click to open";h.onclick=()=>openModal(u.ep);});
  } else {
    add("hdr lbl","Season");
    UNITS.forEach(u=>{const h=add("hdr",u.label);h.dataset.season=u.season;h.title=u.title;h.onclick=ev=>toggleSeason(u.season,ev.shiftKey);});
  }
  CATS.forEach(([key,label])=>{
    add("grp","");
    const rows = Array.isArray(ERAS[key][0][0]) ? ERAS[key] : [ERAS[key]];
    rows.forEach((row,ri)=>{
      add(ri===0?"rowlbl":"rowlbl sub", ri===0?label:"");
      let col=1;
      row.slice().sort((a,b)=>a[1]-b[1]).forEach(b=>{
        let [name,s1,s2,bg,fg]=b;
        if(s1<col) s1=col; if(s2<s1) return;
        for(;col<s1;col++) add("cell","");
        const d=add("cell bar",esc(name),`grid-column:span ${s2-s1+1};background:${bg};color:${fg||"#000"}`);
        d.dataset.era=JSON.stringify({name,s1,s2,bg,fg,cat:label});
        d.title=AXIS()==="episode" ? `${name} — ${UNITS[s1-1].label}${s1===s2?"":" → "+UNITS[s2-1].label}. Click to filter.` : `${name} — Season${s1===s2?"":"s"} ${s1===s2?s1:s1+"–"+s2}. Click to filter.`;
        d.onclick=ev=>toggleEra({name,s1,s2,bg,fg,cat:label},ev.shiftKey);
        col=s2+1;
      });
      for(;col<=UNITS.length;col++) add("cell","");
    });
  });
  $("#toggleChart").onclick=()=>{el.classList.toggle("collapsed");track("chart_toggled",{collapsed:el.classList.contains("collapsed")});$("#toggleChart").textContent=el.classList.contains("collapsed")?"Expand chart":"Collapse chart";};
  $("#clearEra").onclick=()=>{state.eras=[];render();};
}
function eraKey(e){return `${e.cat}|${e.name}|${e.s1}|${e.s2}`;}
function toggleEra(era,additive){
  const i=state.eras.findIndex(x=>eraKey(x)===eraKey(era));
  if(i<0) track("era_selected",{category:era.cat,era:era.name,season_start:era.s1,season_end:era.s2,additive});
  if(i>=0) state.eras.splice(i,1);
  else if(additive) state.eras.push(era);
  else state.eras=[era];
  render();
}
function toggleSeason(s,additive){
  track("season_selected",{season:s,additive,source:"chart"});
  if(!additive && !(state.seasons.size===1&&state.seasons.has(s))){ state.seasons.clear(); state.seasons.add(s); }
  else if(state.seasons.has(s)) state.seasons.delete(s); else state.seasons.add(s);
  render();
}
function syncChart(){
  const on=new Set(state.eras.map(eraKey));
  document.querySelectorAll("#chart .bar").forEach(b=>{
    const e=JSON.parse(b.dataset.era);
    const k=eraKey(e);
    b.classList.toggle("on",on.has(k));
    b.classList.toggle("dim",on.size>0&&!on.has(k));
  });
  document.querySelectorAll("#chart .hdr[data-season]").forEach(h=>h.classList.toggle("on",state.seasons.has(+h.dataset.season)));
  $("#clearEra").hidden=state.eras.length===0;
}

// ---------- filters UI ----------
function buildFilters(){
  const sc=$("#seasonChips");
  SEASONS.forEach(s=>{const c=document.createElement("button");c.className="chip";c.textContent=s;c.title=`Season ${s} · ${SEASON_META[s].years} · ${SEASON_META[s].showrunner}`;c.onclick=()=>{if(!state.seasons.has(s))track("season_selected",{season:s,source:"sidebar"});state.seasons.has(s)?state.seasons.delete(s):state.seasons.add(s);render();};c.dataset.s=s;sc.appendChild(c);});
  const tc=$("#tagChips");
  Object.entries(TAG_DEFS).forEach(([k,v])=>{const c=document.createElement("button");c.className="chip";c.textContent=v.label;c.title=v.desc||"";c.dataset.t=k;c.onclick=()=>{if(!state.tags.has(k))track("vibe_selected",{vibe:k,label:v.label});state.tags.has(k)?state.tags.delete(k):state.tags.add(k);render();};tc.appendChild(c);});
  const cs=$("#charSelect");
  const GENERIC=/^(unsub|reporter|clerk|medical examiner|dispatcher|police chief|fbi agent|swat|lawyer|judge|prosecutor|attorney|technician|forensic tech|officer|police officer #\d|demon|demons|sheriff|coroner|nurse|bartender|vampire|vampires|unknown|waitress|waiter|doctor|cop|police officer|deputy|angel|angels|reaper|man|woman|girl|boy|guy|bystander|security guard|paramedic|hunter|priest|reporter|receptionist|clerk|detective|teacher|mother|father|husband|wife|kid|jogger|driver|customer|orderly|agent|soldier|witch|ghost|shapeshifter|werewolf|djinn|zombie|leviathan|crossroads demon|hostess|maid|butler|announcer|voice|narrator|young sam|young dean|dean winchester|sam winchester)$/i;
  Object.entries(CHAR_COUNT).filter(([c,n])=>n>=2&&!GENERIC.test(c)&&!/^#\d|#\d+$/.test(c)).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]))
    .forEach(([c,n])=>{const o=document.createElement("option");o.value=c;o.textContent=`${c} (${n})`;cs.appendChild(o);});
  cs.onchange=()=>{state.char=cs.value;if(cs.value)track("character_selected",{character:cs.value});render();};
  let t,ts; $("#search").oninput=e=>{clearTimeout(t);t=setTimeout(()=>{state.q=e.target.value.trim().toLowerCase();render();},120);clearTimeout(ts);ts=setTimeout(()=>{if(state.q)track("searched",{query:state.q,results:filtered().length});},1200);};
  $("#minRating").oninput=e=>{state.minRating=+e.target.value;$("#minRatingOut").textContent=state.minRating?state.minRating.toFixed(1)+"+":"any";render();};
  $("#sort").onchange=e=>{state.sort=e.target.value;track("sort_changed",{sort:state.sort});render();};
  $("#hideWatched").onchange=e=>{state.hideWatched=e.target.checked;if(state.hideWatched){state.onlyWatched=false;$("#onlyWatched").checked=false;}render();};
  $("#onlyWatched").onchange=e=>{state.onlyWatched=e.target.checked;if(state.onlyWatched){state.hideWatched=false;$("#hideWatched").checked=false;}render();};
  $("#resetAll").onclick=()=>{track("filters_reset");state.seasons.clear();state.tags.clear();state.eras=[];state.char="";state.q="";state.minRating=0;state.sort="air";state.hideWatched=false;state.onlyWatched=false;
    $("#search").value="";$("#searchMobile").value="";$("#charSelect").value="";$("#minRating").value=0;$("#minRatingOut").textContent="any";$("#sort").value="air";$("#hideWatched").checked=false;$("#onlyWatched").checked=false;render();};
  $("#surprise").onclick=()=>{const list=filtered();if(!list.length)return;const pick=list[Math.floor(Math.random()*list.length)];track("surprise_me",{pool_size:list.length,episode:pick.code,title:pick.title});openModal(pick);};
  const mob=$("#searchMobile"), desk=$("#search");
  const setQ=v=>{state.q=v.trim().toLowerCase(); if(mob.value!==v)mob.value=v; if(desk.value!==v)desk.value=v; render();};
  let tm; mob.oninput=e=>{clearTimeout(tm);tm=setTimeout(()=>setQ(e.target.value),120);};
  $("#openDrawer").onclick=()=>{document.body.classList.add("drawer-open");track("filters_drawer_opened");};
  $("#closeDrawer").onclick=()=>{document.body.classList.remove("drawer-open");window.scrollTo({top:$("#filters").offsetTop-60>0?document.querySelector(".layout").offsetTop-8:0,behavior:"smooth"});};
  const mq=window.matchMedia("(max-width:900px)");
  if(mq.matches && window.innerWidth<700){ $("#chart").classList.add("collapsed"); $("#toggleChart").textContent="Expand chart"; }
  $("#modalClose").onclick=closeModal; $("#modal").onclick=e=>{if(e.target.id==="modal")closeModal();};
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});
}

// ---------- filtering ----------
function eraUnits(){ // union of chart columns across selected eras (null = no era filter)
  if(!state.eras.length) return null;
  const s=new Set(); state.eras.forEach(e=>{for(let i=e.s1;i<=e.s2;i++)s.add(i);}); return s;
}
function filtered(){
  const es=eraUnits();
  let list=EPS.filter(e=>{
    if(es && !es.has(unitOf(e))) return false;
    if(state.seasons.size && !state.seasons.has(e.s)) return false;
    for(const t of state.tags) if(!e.tags.has(t)) return false;
    if(state.char && !e.guests.some(([c])=>c===state.char)) return false;
    if(state.minRating && !(e.rating>=state.minRating)) return false;
    if(state.hideWatched && watched.has(e.id)) return false;
    if(state.onlyWatched && !watched.has(e.id)) return false;
    if(state.q && !e.hay.includes(state.q)) return false;
    return true;
  });
  if(state.sort==="rating") list=list.slice().sort((a,b)=>(b.rating||0)-(a.rating||0)||a.s-b.s||a.e-b.e);
  else if(state.sort==="airdesc") list=list.slice().reverse();
  return list;
}

// ---------- render ----------
function unitContext(u){ // all bars active in chart column u
  const out=[];
  CATS.forEach(([key,label])=>{
    const rows = Array.isArray(ERAS[key][0][0]) ? ERAS[key] : [ERAS[key]];
    rows.forEach(row=>row.forEach(([name,s1,s2,bg,fg])=>{ if(u>=s1&&u<=s2) out.push({name,s1,s2,bg,fg,cat:label}); }));
  });
  return out;
}
function accentColor(e){const first=ERAS[CATS[0][0]]; const bars=Array.isArray(first[0][0])?first[0]:first; const u=unitOf(e); const b=bars.find(b=>u>=b[1]&&u<=b[2]);return b?b[3]:"#444";}

function render(){
  writeHash(); syncChart();
  document.querySelectorAll("#seasonChips .chip").forEach(c=>c.classList.toggle("on",state.seasons.has(+c.dataset.s)));
  document.querySelectorAll("#tagChips .chip").forEach(c=>c.classList.toggle("on",state.tags.has(c.dataset.t)));
  const list=filtered();
  $("#resultCount").textContent=`${list.length} episode${list.length===1?"":"s"}`;
  $("#drawerCount").textContent=list.length;
  const nf=state.eras.length+state.seasons.size+state.tags.size+(state.char?1:0)+(state.minRating?1:0)+(state.hideWatched||state.onlyWatched?1:0);
  $("#filterCount").textContent=nf; $("#filterCount").hidden=!nf;
  $("#watchedCount").textContent=`${watched.size} / ${EPS.length} watched`;
  // active filter chips
  const af=$("#activeFilters"); af.innerHTML="";
  const chip=(txt,fn)=>{const b=document.createElement("button");b.className="chip";b.innerHTML=`${esc(txt)}<b>✕</b>`;b.onclick=fn;af.appendChild(b);};
  state.eras.forEach(e=>chip(`${e.cat}: ${e.name}`,()=>toggleEra(e,true)));
  if(state.seasons.size) chip(`Seasons ${[...state.seasons].sort((a,b)=>a-b).join(", ")}`,()=>{state.seasons.clear();render();});
  state.tags.forEach(t=>chip(TAG_DEFS[t].label,()=>{state.tags.delete(t);render();}));
  if(state.char) chip(state.char,()=>{state.char="";$("#charSelect").value="";render();});
  if(state.q) chip(`"${state.q}"`,()=>{state.q="";$("#search").value="";$("#searchMobile").value="";render();});

  const grid=$("#grid"); grid.innerHTML="";
  $("#empty").hidden=list.length>0;
  const frag=document.createDocumentFragment();
  list.forEach(e=>{
    const d=document.createElement("article");
    d.className="card"+(watched.has(e.id)?" watched":"");
    const tags=[...e.tags].filter(t=>TAG_DEFS[t]).map(t=>`<span class="tag">${esc(TAG_DEFS[t].label)}</span>`).join("");
    const guests=e.guests.slice().sort((a,b)=>(CHAR_COUNT[b[0]]||0)-(CHAR_COUNT[a[0]]||0)).slice(0,4).map(([c])=>`<span class="tag guest">${esc(c)}</span>`).join("");
    d.innerHTML=`
      <div class="thumb" style="background-image:url('${e.img||""}')">
        <span class="code">${e.code}</span>${e.rating?`<span class="rating">★ ${e.rating}</span>`:""}
        <span class="era" style="background:${accentColor(e)}"></span>
      </div>
      <div class="body">
        <h3>${esc(e.title)}</h3>
        <div class="meta">${e.air||""} · ${SEASON_META[e.s].showrunner} era</div>
        <div class="sum">${esc(e.summary)}</div>
        <div class="tags">${tags}${guests}</div>
        <div class="foot"><span class="muted tiny">click for details</span>
          <button class="watch ${watched.has(e.id)?"on":""}" data-w="${e.id}">${watched.has(e.id)?"✓ watched":"mark watched"}</button></div>
      </div>`;
    d.onclick=ev=>{ if(ev.target.closest(".watch")){toggleWatched(e.id);return;} openModal(e); };
    frag.appendChild(d);
  });
  grid.appendChild(frag);
}
function toggleWatched(id){ const on=!watched.has(id); on?watched.add(id):watched.delete(id); const e=EPS.find(x=>x.id===id); track("watched_toggled",{watched:on,episode:e?.code,title:e?.title,season:e?.s,total_watched:watched.size}); saveWatched(); render(); }

function openModal(e){
  document.body.classList.remove("drawer-open");
  track("episode_opened",{episode:e.code,title:e.title,season:e.s,rating:e.rating,vibes:[...e.tags]});
  const ctx=unitContext(unitOf(e));
  const byCat={}; ctx.forEach(c=>{(byCat[c.cat]=byCat[c.cat]||[]).push(c);});
  const ctxHtml=Object.entries(byCat).map(([cat,items])=>`<div class="section"><h4>${esc(cat)}</h4><div class="ctx">${
    items.map(c=>`<span class="bar" style="background:${c.bg};color:${c.fg||"#000"}" data-era='${esc(JSON.stringify(c))}'>${esc(c.name)}</span>`).join("")}</div></div>`).join("");
  const tags=[...e.tags].filter(t=>TAG_DEFS[t]).map(t=>`<span class="tag">${esc(TAG_DEFS[t].label)}</span>`).join("");
  const cast=e.guests.length?`<div class="section"><h4>Guest cast</h4><div class="cast">${e.guests.map(([c,p])=>`<div><b>${esc(c)}</b> <span class="muted">— ${esc(p)}</span></div>`).join("")}</div></div>`:"";
  const big=(e.img||"").replace("medium_landscape","original_untouched");
  $("#modalBody").innerHTML=`
    <div class="hero-img" style="background-image:url('${big}')"></div>
    <div class="mbody">
      <h2>${e.code} · ${esc(e.title)}</h2>
      <div class="meta">Aired ${e.air||"?"} · Season ${e.s} (${SEASON_META[e.s].years}, ${SEASON_META[e.s].showrunner} era)${e.rating?` · ★ ${e.rating}`:""}</div>
      <p>${esc(e.summary)||"<i>No summary.</i>"}</p>
      <div class="tags">${tags}</div>
      <div class="section" style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn" id="mWatch">${watched.has(e.id)?"✓ Watched — unmark":"Mark as watched"}</button>
        <button class="btn" id="mNext">Next episode →</button>
        <a class="btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent("Supernatural "+e.code+" "+e.title)}">Search the web ↗</a>
      </div>
      <div class="section"><h4>${AXIS()==="episode"?"Where this sits on the chart":"What's going on this season"}</h4><div class="muted tiny" style="margin:0 0 6px">Click any bar to filter to that era.</div>${ctxHtml}</div>
      ${cast}
    </div>`;
  $("#modal").hidden=false;
  $("#mWatch").onclick=()=>{toggleWatched(e.id);openModal(e);};
  const idx=EPS.indexOf(e); $("#mNext").disabled=idx>=EPS.length-1; $("#mNext").onclick=()=>openModal(EPS[idx+1]);
  document.querySelectorAll("#modalBody .ctx .bar").forEach(b=>b.onclick=()=>{toggleEra(JSON.parse(b.dataset.era),false);closeModal();window.scrollTo({top:0,behavior:"smooth"});});
}
function closeModal(){$("#modal").hidden=true;}

load();
})();
