e",lineHeight:1.6}}>{art.curioso}</div></div>
        </motion.div>
      </div>
    </div>
  );}
  return(
    <div style={{paddingBottom:88,background:"#f8faff",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} onLogout={onLogout} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <div style={{padding:"12px 2px 10px"}}><div style={{fontSize:8,color:"#9ca3af",letterSpacing:3,marginBottom:2,fontFamily:"Barlow Condensed,sans-serif"}}>ENCUESTA SILAO</div><div style={{fontSize:17,fontWeight:900,color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif"}}>Partidos e Ideologías</div></div>
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"12px",marginBottom:12}}>
          <div style={{fontSize:9,color:"#374151",letterSpacing:2,marginBottom:8,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>🧭 ¿QUÉ SIGNIFICA CADA TÉRMINO?</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{IDEOLOGIES.map((ideo,i)=>(<motion.button key={ideo.id} whileTap={{scale:0.95}} onClick={()=>{playSound("click");setIdeologyOpen(i);}} style={{background:ideo.bg,border:`2px solid ${ideo.color}`,borderRadius:20,padding:"5px 11px",cursor:"pointer"}}><span style={{fontSize:10,fontWeight:900,color:ideo.color,fontFamily:"Barlow Condensed,sans-serif"}}>{ideo.label}</span></motion.button>))}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {PARTIES.map((a,i)=>{const count=votes[a.id]||0;const pctVal=total>0?((count/total)*100).toFixed(1):"0.0";return(
            <motion.button key={a.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              whileTap={{scale:0.97}}
              onClick={()=>{playSound("click");setOpen(i);}}
              style={{background:"#fff",border:`2px solid ${a.color}30`,borderRadius:16,padding:"14px",cursor:"pointer",width:"100%",textAlign:"left",boxShadow:`0 2px 10px ${a.color}10`}}>
              <div style={{marginBottom:12}}>
                <div style={{fontSize:16,fontWeight:900,color:a.color,fontFamily:"Barlow Condensed,sans-serif",marginBottom:3}}>{a.short}</div>
                <div style={{fontSize:9,color:"#9ca3af",marginBottom:5}}>{a.name} · {a.fundado}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{a.ideologyTags.slice(0,2).map(tag=>{const ideo=IDEOLOGIES.find(x=>x.id===tag);if(!ideo)return null;return<span key={tag} style={{fontSize:7,color:ideo.color,background:ideo.bg,border:`1px solid ${ideo.color}40`,borderRadius:8,padding:"2px 7px",fontWeight:700}}>{ideo.label}</span>;})}</div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <div style={{flex:1,background:`${a.color}08`,border:`2px solid ${a.color}30`,borderRadius:12,padding:"12px",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{fontSize:8,color:a.color,letterSpacing:2,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>PARTIDO</div>
                  <div style={{width:72,height:72,borderRadius:12,overflow:"hidden",border:`3px solid ${a.color}`,boxShadow:`0 0 16px ${a.color}40`}}>
                    {PARTY_LOGOS[a.id]?<img src={PARTY_LOGOS[a.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:36,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{a.emoji}</span>}
                  </div>
                  {count>0&&<div style={{background:a.color,borderRadius:8,padding:"3px 10px"}}><span style={{fontSize:12,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif"}}>{pctVal}%</span></div>}
                </div>
                <div style={{flex:1,background:"rgba(0,0,0,0.02)",border:`2px dashed ${a.color}40`,borderRadius:12,padding:"12px",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{fontSize:8,color:a.color,letterSpacing:2,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>CANDIDATO</div>
                  <CandidateBox candidate={candidates[a.id]} color={a.color} size={72} radius={12}/>
                  <div style={{fontSize:10,fontWeight:700,color:candidates[a.id]?.nombre==="Por definir"?"#9ca3af":a.color,fontFamily:"Barlow Condensed,sans-serif",textAlign:"center",lineHeight:1.2}}>{candidates[a.id]?.nombre||"Por definir"}</div>
                </div>
              </div>
              <div style={{marginTop:10,textAlign:"right"}}><span style={{fontSize:10,color:a.color,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>VER MÁS →</span></div>
            </motion.button>
          );})}
        </div>
      </div>
    </div>
  );
}

// ── PREGÚNTALE SCREEN ──
function PreguntaleScreen({user,onLoginClick,onLogoClick,onLogout,total,siteLogo,candidates}){
  const cats=Object.keys(PREGUNTAS);
  const[cat,setCat]=useState(cats[0]);
  const[idx,setIdx]=useState(0);
  const[dir,setDir]=useState(1);
  const[showSuggest,setShowSuggest]=useState(null);
  const[suggText,setSuggText]=useState("");
  const[suggSent,setSuggSent]=useState(false);
  const questions=PREGUNTAS[cat];
  const q=questions[idx%questions.length];

  const nextQ=()=>{setDir(1);setIdx(i=>(i+1)%questions.length);};
  const prevQ=()=>{setDir(-1);setIdx(i=>(i-1+questions.length)%questions.length);};

  const retarle=(partido)=>{
    const fecha=new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"}).toUpperCase();
    const msg=`❓ Le pregunto a ${partido.name}:\n\n"${q}"\n\n📅 ${fecha}\n📱 Encuesta Silao — Voz Ciudadana\n👉 silao360.com.mx\n\n#Silao #PreguntaleAlCandidato`;
    window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(msg),"_blank");
  };
  const retarleFB=(partido)=>{
    const msg=`❓ "${q}" — Le pregunto a ${partido.name}. Encuesta Silao`;
    window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://silao360.com.mx")+"&quote="+encodeURIComponent(msg),"_blank");
  };
  const sendSuggestion=async(partido)=>{
    if(!suggText.trim())return;
    const payload={pregunta:suggText.trim(),partido:partido.short,nick:user?.nickname||"Anónimo",ts:new Date().toISOString()};
    try{await sb.from("sugerencias_preguntas").insert(payload);}catch(e){}
    setSuggSent(true);
    setTimeout(()=>{setSuggSent(false);setSuggText("");setShowSuggest(null);},2500);
  };

  return(
    <div style={{minHeight:"100vh",background:"#f8faff",paddingBottom:100}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} onLogout={onLogout} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"14px 12px"}}>
        <div style={{textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:30,fontWeight:900,color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2}}>PREGÚNTALE</div>
          <div style={{fontSize:15,color:"#6b7280",marginTop:2,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>A TU CANDIDATO</div>
        </div>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:14}}>
          {cats.map(c=>(
            <motion.button key={c} whileTap={{scale:0.95}} onClick={()=>{setCat(c);setIdx(0);}}
              style={{flexShrink:0,background:cat===c?"linear-gradient(135deg,#e01010,#7c3aed)":"#fff",border:`2px solid ${cat===c?"transparent":"#e5e7eb"}`,borderRadius:20,padding:"6px 12px",color:cat===c?"#fff":"#374151",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",whiteSpace:"nowrap",boxShadow:cat===c?"0 4px 12px rgba(224,16,16,0.3)":"none"}}>
              {c}
            </motion.button>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={cat+"-"+idx}
            initial={{opacity:0,x:dir>0?80:-80}}
            animate={{opacity:1,x:0}}
            exit={{opacity:0,x:dir>0?-80:80}}
            transition={{duration:0.22,ease:[0.22,1,0.36,1]}}
            style={{background:"linear-gradient(135deg,#0f172a,#1e3a8a)",borderRadius:20,padding:"24px 20px",marginBottom:14,boxShadow:"0 8px 32px rgba(14,30,115,0.3)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,transparent,#e01010,transparent)`,opacity:0.8}}/>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:3,marginBottom:10,fontFamily:"Barlow Condensed,sans-serif"}}>{cat} — {idx+1}/{questions.length}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",marginBottom:6,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>¿Ya le preguntaste a tu candidato?</div>
            <div style={{fontSize:20,fontWeight:900,color:"#fff",lineHeight:1.4,fontFamily:"Barlow Condensed,sans-serif",marginBottom:18,position:"relative"}}>"{q}"</div>
            <div style={{display:"flex",gap:8}}>
              <motion.button whileTap={{scale:0.96}} onClick={prevQ}
                style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"9px 14px",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>
                ← ANTERIOR
              </motion.button>
              <motion.button whileTap={{scale:0.96}} onClick={nextQ}
                style={{flex:1,background:"linear-gradient(135deg,#e01010,#8a0000)",border:"none",borderRadius:10,padding:"9px 16px",color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,boxShadow:"0 4px 16px rgba(224,16,16,0.4)"}}>
                SIGUIENTE →
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
        <div style={{fontSize:13,fontWeight:900,color:"#374151",letterSpacing:2,marginBottom:10,fontFamily:"Barlow Condensed,sans-serif"}}>🎯 RETARLE — MÁNDALE LA PREGUNTA</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {PARTIES.filter(p=>p.id!=="nulo").map(p=>{
            const logo=PARTY_LOGOS[p.id];
            const cand=candidates?.[p.id];
            const isSugOpen=showSuggest===p.id;
            return(
              <div key={p.id} style={{background:"#fff",border:`2px solid ${p.color}25`,borderRadius:16,overflow:"hidden"}}>
                <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",border:`2px solid ${p.color}`,flexShrink:0}}>
                    {logo?<img src={logo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.emoji}</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:900,color:p.color,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</div>
                    {cand&&cand.nombre!=="Por definir"&&cand.nombre!=="No aplica"&&<div style={{fontSize:11,color:"#374151",fontFamily:"Barlow Condensed,sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cand.nombre}</div>}
                  </div>
                  {cand&&cand.fotoUrl&&(
                    <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",border:`2px solid ${p.color}`,flexShrink:0}}>
                      <img src={cand.fotoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                  )}
                  <div style={{display:"flex",gap:5,flexShrink:0}}>
                    <motion.button whileTap={{scale:0.95}} onClick={()=>retarle(p)}
                      style={{background:"linear-gradient(135deg,#25d366,#128c4e)",border:"none",borderRadius:8,padding:"8px 10px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>
                      📱 WA
                    </motion.button>
                    <motion.button whileTap={{scale:0.95}} onClick={()=>retarleFB(p)}
                      style={{background:"linear-gradient(135deg,#1877f2,#0d5cc7)",border:"none",borderRadius:8,padding:"8px 10px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>
                      f FB
                    </motion.button>
                  </div>
                </div>
                <div style={{padding:"0 14px 10px"}}>
                  <motion.button whileTap={{scale:0.97}} onClick={()=>{setShowSuggest(isSugOpen?null:p.id);setSuggText("");setSuggSent(false);}}
                    style={{width:"100%",background:isSugOpen?`${p.color}10`:"#f8faff",border:`1.5px solid ${isSugOpen?p.color:"#e5e7eb"}`,borderRadius:10,padding:"8px 12px",color:isSugOpen?p.color:"#6b7280",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:0.5,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
                    💬 SUGERIR PREGUNTA AL ADMIN
                  </motion.button>
                </div>
                <AnimatePresence>
                  {isSugOpen&&(
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                      style={{background:`${p.color}05`,borderTop:`1px solid ${p.color}20`,padding:"12px 14px",overflow:"hidden"}}>
                      {suggSent?(
                        <div style={{textAlign:"center",padding:"8px",color:p.color,fontWeight:800,fontSize:13,fontFamily:"Barlow Condensed,sans-serif"}}>✅ ¡Pregunta enviada al admin!</div>
                      ):(
                        <>
                          <div style={{fontSize:10,color:p.color,fontWeight:800,marginBottom:8,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>¿QUÉ LE PREGUNTARÍAS A {p.short}?</div>
                          <textarea value={suggText} onChange={e=>setSuggText(e.target.value.slice(0,200))} placeholder="Escribe tu pregunta aquí..."
                            style={{width:"100%",background:"#fff",border:`1.5px solid ${p.color}40`,borderRadius:8,padding:"10px",color:"#1a1a1a",fontSize:13,outline:"none",resize:"none",height:72,lineHeight:1.5,fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}/>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}>
                            <span style={{fontSize:9,color:"#9ca3af"}}>{suggText.length}/200</span>
                            <motion.button whileTap={{scale:0.96}} onClick={()=>sendSuggestion(p)} disabled={!suggText.trim()}
                              style={{flex:1,background:suggText.trim()?`linear-gradient(135deg,${p.color},${p.color}cc)`:"#e5e7eb",border:"none",borderRadius:8,padding:"9px",color:"#fff",fontSize:12,fontWeight:900,cursor:suggText.trim()?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:0.5}}>
                              📤 ENVIAR AL ADMIN
                            </motion.button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── COMMENTS SCREEN — FONDO BLANCO, EMOJIS, PATRULLA ──
function ReactionBtn({emoji,count,onReact,reacted}){
  return(<motion.button whileTap={{scale:1.3}} onClick={()=>{playSound("click");onReact();}} style={{background:reacted?"#eff6ff":"#f3f4f6",border:`1.5px solid ${reacted?"#3b82f6":"#e5e7eb"}`,borderRadius:20,padding:"3px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:13}}>{emoji}</span>{count>0&&<span style={{fontSize:9,fontWeight:700,color:reacted?"#1877f2":"#6b7280"}}>{count}</span>}</motion.button>);
}
const REACTION_MAP=[{k:"like",e:"👍"},{k:"heart",e:"❤️"},{k:"fire",e:"🔥"},{k:"wow",e:"😮"},{k:"haha",e:"😂"}];

function CommentsScreen({user,onLoginClick,total,onLogoClick,onLogout,isAdmin,comments,setComments,blockedNicks,pinnedMsg,siteLogo}){
  const[text,setText]=useState("");
  const[replyOpen,setReplyOpen]=useState({});
  const[replyText,setReplyText]=useState({});
  const[sending,setSending]=useState(false);
  const[selectedEmoji,setSelectedEmoji]=useState("");
  const[showEmojiBar,setShowEmojiBar]=useState(false);

  const post=async()=>{
    if(!text.trim()&&!selectedEmoji||sending)return;
    const fullText=(selectedEmoji?selectedEmoji+" ":"")+text.trim();
    if(!fullText.trim())return;
    playSound("success");
    const newC={id:Date.now(),nick:user?user.nickname:"Visitante",txt:fullText,ts:Date.now(),reactions:{like:0,heart:0,fire:0,wow:0,haha:0},myReacted:{},replies:[]};
    setComments(prev=>[newC,...prev]);setText("");setSelectedEmoji("");setSending(true);
    try{await sb.from("comentarios").insert({nick:newC.nick,txt:newC.txt,ts:new Date().toISOString()});}
    catch(e){console.warn("Foro offline",e);}
    finally{setSending(false);}
  };
  const react=(cid,key)=>setComments(prev=>prev.map(c=>{if(c.id!==cid)return c;const already=c.myReacted[key];return{...c,reactions:{...c.reactions,[key]:Math.max(0,(c.reactions[key]||0)+(already?-1:1))},myReacted:{...c.myReacted,[key]:!already}};}));
  const deleteC=async(cid)=>{setComments(prev=>prev.filter(c=>c.id!==cid));try{await sb.from("comentarios").delete().eq("id",String(cid));}catch(e){}};
  const postReply=(cid)=>{if(!replyText[cid]?.trim()||!user)return;setComments(prev=>prev.map(c=>{if(c.id!==cid)return c;return{...c,replies:[...(c.replies||[]),{nick:user.nickname,txt:replyText[cid].trim(),ts:Date.now()}]};}));setReplyText(r=>({...r,[cid]:""}));};
  const visible=(comments||[]).filter(c=>!(blockedNicks||[]).includes(c.nick));

  return(
    // FONDO BLANCO
    <div style={{paddingBottom:100,background:"#ffffff",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} onLogout={onLogout} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <div style={{padding:"12px 2px 10px",borderBottom:"2px solid #7c3aed",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:20}}>🚔</span>{/* ÍCONO PATRULLA DE SEGURIDAD */}
          <div style={{fontSize:17,fontWeight:900,color:"#5b21b6",fontFamily:"Barlow Condensed,sans-serif"}}>Foro Ciudadano de Silao</div>
        </div>

        {user?(
          <div style={{background:"#f5f3ff",border:"2px solid #7c3aed",borderRadius:14,padding:"12px",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
              <div style={{width:26,height:26,borderRadius:"50%",background:"#7c3aed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🎭</div>
              <span style={{fontSize:11,fontWeight:800,color:"#5b21b6",fontFamily:"Barlow Condensed,sans-serif"}}>{user.nickname}</span>
            </div>

            {/* SELECTOR DE EMOJIS */}
            <div style={{marginBottom:8}}>
              <button onClick={()=>setShowEmojiBar(s=>!s)} style={{background:"#fff",border:"1.5px solid #7c3aed",borderRadius:20,padding:"4px 10px",fontSize:11,color:"#5b21b6",cursor:"pointer",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>
                {selectedEmoji?selectedEmoji:"😊 + EMOJI"} {showEmojiBar?"▲":"▼"}
              </button>
              {showEmojiBar&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6,background:"#fff",borderRadius:10,padding:"8px",border:"1px solid #e5e7eb"}}>
                  {FORUM_EMOJIS.map(em=>(
                    <button key={em} onClick={()=>{setSelectedEmoji(em===selectedEmoji?"":em);setShowEmojiBar(false);}}
                      style={{background:selectedEmoji===em?"#7c3aed":"transparent",border:"none",borderRadius:6,padding:"4px",fontSize:18,cursor:"pointer"}}>
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <textarea value={text} onChange={e=>setText(e.target.value.slice(0,280))} placeholder="¿Qué te falta ver en Silao? Opina sin miedo, tu apodo te protege..." style={{width:"100%",background:"#fff",border:"1.5px solid rgba(124,58,237,0.4)",borderRadius:8,padding:"9px 10px",color:"#1a1a1a",fontSize:12,outline:"none",resize:"none",height:70,lineHeight:1.5,fontFamily:"Barlow Condensed,sans-serif"}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:7}}>
              <span style={{fontSize:8,color:"#6b7280",fontFamily:"Barlow Condensed,sans-serif"}}>{text.length}/280</span>
              <motion.button whileTap={{scale:0.95}} onClick={post} disabled={(!text.trim()&&!selectedEmoji)||sending} style={{background:(text.trim()||selectedEmoji)&&!sending?"linear-gradient(135deg,#7c3aed,#5b21b6)":"#e5e7eb",border:"none",borderRadius:8,padding:"7px 16px",color:(text.trim()||selectedEmoji)&&!sending?"#fff":"#aaa",fontSize:11,fontWeight:800,cursor:(text.trim()||selectedEmoji)&&!sending?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif"}}>{sending?"⏳ ENVIANDO...":"💬 PUBLICAR"}</motion.button>
            </div>
          </div>
        ):(
          <motion.button whileTap={{scale:0.97}} onClick={()=>{playSound("click");onLoginClick();}} style={{width:"100%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:14,padding:"13px",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,marginBottom:12,fontWeight:800}}>💬 ENTRA CON FACEBOOK PARA COMENTAR</motion.button>
        )}

        {/* Mensaje fijado */}
        <div style={{background:"#eff6ff",border:"2px solid #1d4ed8",borderRadius:14,padding:"12px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
            <div style={{width:28,height:28,borderRadius:"50%",overflow:"hidden",border:"2px solid #1d4ed8"}}>
              <img src={LOGO_SILAO360} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
            <div>
              <div style={{fontSize:12,fontWeight:900,color:"#1d4ed8",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>ENCUESTA SILAO</div>
              <div style={{fontSize:7,color:"#3b82f6",letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>CUENTA OFICIAL · 📌 FIJADO</div>
            </div>
          </div>
          <div style={{fontSize:12,color:"#1e3a8a",lineHeight:1.7,fontStyle:"italic",borderLeft:"3px solid #3b82f6",paddingLeft:10}}>&ldquo;{pinnedMsg}&rdquo;</div>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {visible.map((c,i)=>(
            <motion.div key={c.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
              style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"12px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🎭</div>
                  {/* LETRAS NEGRAS BRILLANTES en el nick */}
                  <span style={{fontSize:11,fontWeight:800,color:"#111",fontFamily:"Barlow Condensed,sans-serif",textShadow:"0 0 6px rgba(0,0,0,0.2)"}}>{c.nick}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:8,color:"#9ca3af",fontFamily:"Barlow Condensed,sans-serif"}}>{timeAgo(c.ts)}</span>
                  {isAdmin&&<button onClick={()=>deleteC(c.id)} style={{background:"rgba(220,38,38,0.1)",border:"1px solid #dc2626",borderRadius:5,padding:"2px 6px",color:"#dc2626",fontSize:9,cursor:"pointer"}}>🗑</button>}
                </div>
              </div>
              <div style={{fontSize:20,color:"#1a1a1a",lineHeight:1.6,marginBottom:8}}>{c.txt}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:7}}>
                {REACTION_MAP.map(({k,e})=><ReactionBtn key={k} emoji={e} count={c.reactions[k]||0} reacted={!!c.myReacted[k]} onReact={()=>react(c.id,k)}/>)}
              </div>
              <button onClick={()=>setReplyOpen(r=>({...r,[c.id]:!r[c.id]}))} style={{background:"#f5f3ff",border:"1px solid #7c3aed30",borderRadius:7,padding:"4px 9px",color:"#7c3aed",fontSize:8,cursor:"pointer",fontWeight:700}}>💬 {(c.replies||[]).length>0?`${(c.replies||[]).length} réplicas`:"RESPONDER"}</button>
              {replyOpen[c.id]&&(
                <div style={{marginTop:7,paddingLeft:9,borderLeft:"2px solid #7c3aed30"}}>
                  {(c.replies||[]).map((r,i)=>(<div key={i} style={{background:"#f8faff",borderRadius:7,padding:"6px 9px",marginBottom:4,border:"1px solid #e5e7eb"}}><div style={{fontSize:8,color:"#9ca3af",marginBottom:2}}>🎭 <span style={{color:"#111",fontWeight:800}}>{r.nick}</span> · {timeAgo(r.ts)}</div><div style={{fontSize:18,color:"#1a1a1a"}}>{r.txt}</div></div>))}
                  {user?(
                    <div style={{display:"flex",gap:5,marginTop:5}}>
                      <input value={replyText[c.id]||""} onChange={e=>setReplyText(r=>({...r,[c.id]:e.target.value.slice(0,150)}))} onKeyDown={e=>e.key==="Enter"&&postReply(c.id)} placeholder="Tu réplica..." style={{flex:1,background:"#fff",border:"1px solid #e5e7eb",borderRadius:7,padding:"6px 9px",color:"#1a1a1a",fontSize:11,outline:"none"}}/>
                      <button onClick={()=>postReply(c.id)} disabled={!replyText[c.id]?.trim()} style={{background:replyText[c.id]?.trim()?"#7c3aed":"#e5e7eb",border:"none",borderRadius:7,padding:"6px 11px",color:replyText[c.id]?.trim()?"#fff":"#aaa",fontSize:10,fontWeight:800,cursor:replyText[c.id]?.trim()?"pointer":"default"}}>↑</button>
                    </div>
                  ):(
                    <button onClick={()=>{playSound("click");onLoginClick();}} style={{width:"100%",background:"#f5f3ff",border:"1px dashed #7c3aed",borderRadius:7,padding:"6px",color:"#7c3aed",fontSize:9,cursor:"pointer",marginTop:5}}>Entra para responder</button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ADMIN ──
const ADMIN_PASSWORD="Silao360#";
function AdminLogin({onSuccess,onCancel}){
  const[pass,setPass]=useState("");const[error,setError]=useState(false);
  const try_=()=>{if(pass===ADMIN_PASSWORD){playSound("success");onSuccess();}else{setError(true);setTimeout(()=>setError(false),1500);}};
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,0.9)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} style={{background:"linear-gradient(135deg,#0f1e5c,#1e3a8a)",border:"2px solid #3b82f6",borderRadius:18,padding:"26px 22px",maxWidth:320,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:16}}><div style={{fontSize:34,marginBottom:8}}>🔐</div><div style={{fontSize:17,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2}}>ACCESO ADMIN</div></div>
        <motion.input animate={error?{x:[-5,5,-5,5,0]}:{}} type="password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&try_()} placeholder="Contraseña"
          style={{width:"100%",background:error?"rgba(220,38,38,0.2)":"rgba(255,255,255,0.1)",border:`1.5px solid ${error?"#dc2626":"rgba(255,255,255,0.2)"}`,borderRadius:9,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",fontFamily:"Barlow Condensed,sans-serif",marginBottom:10,transition:"border-color .2s"}}/>
        {error&&<div style={{fontSize:10,color:"#f87171",textAlign:"center",marginBottom:8,fontFamily:"Barlow Condensed,sans-serif"}}>Contraseña incorrecta</div>}
        <motion.button whileTap={{scale:0.96}} onClick={try_} style={{width:"100%",background:"linear-gradient(135deg,#1d4ed8,#1e40af)",border:"none",borderRadius:9,padding:"12px",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer",marginBottom:8,fontFamily:"Barlow Condensed,sans-serif"}}>ENTRAR</motion.button>
        <button onClick={onCancel} style={{width:"100%",background:"transparent",border:"none",color:"rgba(255,255,255,0.3)",fontSize:10,cursor:"pointer"}}>CANCELAR</button>
      </motion.div>
    </motion.div>
  );
}

function AdminPanel({candidates,setCandidates,siteLogo,setSiteLogo,onClose,votes,setVotes,proposals,setProposals,comments,encuestaActiva,setEncuestaActiva,alertaMsg,setAlertaMsg,alertaActiva,setAlertaActiva,blockedNicks}){
  const[tab,setTab]=useState("stats");
  const[editId,setEditId]=useState(null);const[editData,setEditData]=useState({});
  const[newPropEmoji,setNewPropEmoji]=useState("💡");const[newPropTitle,setNewPropTitle]=useState("");const[newPropDesc,setNewPropDesc]=useState("");
  const[alertInput,setAlertInput]=useState(alertaMsg||"");
  const[resetConfirm,setResetConfirm]=useState(false);
  const[visitCount,setVisitCount]=useState(null);
  const[sbRealTotal,setSbRealTotal]=useState(null);

  useEffect(()=>{
    sb.from("visitas").select("id").then(res=>{
      const data=Array.isArray(res)?res:(res?.data||[]);
      setVisitCount(data.length);
    }).catch(()=>{setVisitCount(null);});
    sb.from("votos").select("partido_id").then(rows=>{
      if(Array.isArray(rows)) setSbRealTotal(rows.length);
    }).catch(()=>{});
  },[]);

  const uploadLogo=(pid,e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{PARTY_LOGOS[pid]=ev.target.result;setCandidates(p=>({...p}));};r.readAsDataURL(f);};
  const uploadSiteLogo=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setSiteLogo(ev.target.result);r.readAsDataURL(f);};
  const uploadCandPhoto=(pid,e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setCandidates(p=>({...p,[pid]:{...p[pid],fotoUrl:ev.target.result}}));r.readAsDataURL(f);};
  const saveCand=()=>{setCandidates(p=>({...p,[editId]:editData}));setEditId(null);playSound("success");};
  const addProp=()=>{if(!newPropTitle.trim())return;setProposals(prev=>[{id:"ap"+Date.now(),emoji:newPropEmoji,titulo:newPropTitle.trim(),desc:newPropDesc.trim()||"Propuesta del administrador",si:0,no:0,miVoto:null,autor:"Admin"},...prev]);setNewPropTitle("");setNewPropDesc("");playSound("success");};
  const deleteProp=(pid)=>setProposals(prev=>prev.filter(x=>x.id!==pid));
  const resetVotes=()=>{setVotes(Object.fromEntries(PARTIES.map(p=>[p.id,0])));setResetConfirm(false);playSound("success");};
  const total=Object.values(votes).reduce((a,b)=>a+b,0);
  const realTotal=sbRealTotal!==null?sbRealTotal:total;

  const TABS=[{id:"stats",label:"📊 STATS"},{id:"encuesta",label:"🗳️ ENCUESTA"},{id:"candidatos",label:"👤 CANDIDATOS"},{id:"propuestas",label:"💡 PROPUESTAS"},{id:"sugerencias",label:"❓ PREGUNTAS"},{id:"exportar",label:"📥 EXPORTAR"},{id:"config",label:"⚙️ CONFIG"}];

  return(
    <div style={{position:"fixed",inset:0,zIndex:900,background:"#0d0a1e",overflowY:"auto"}}>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 0 100px"}}>
        {/* Header */}
        <div style={{background:"linear-gradient(135deg,#1a0a2e,#2d1b69)",padding:"14px 16px",borderBottom:"2px solid #7c3aed",position:"sticky",top:0,zIndex:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:20}}>⚙️</span>
                <div style={{fontSize:16,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2}}>PANEL ADMIN</div>
                <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(34,197,94,0.2)",border:"1px solid #22c55e",borderRadius:20,padding:"2px 8px"}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",animation:"pd 1.5s infinite"}}/>
                  <span style={{fontSize:8,color:"#22c55e",fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>SUPABASE</span>
                </div>
              </div>
              <div style={{fontSize:9,color:"rgba(196,181,253,0.5)",marginTop:2,fontFamily:"Barlow Condensed,sans-serif"}}>{new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
            </div>
            {/* SALIDA LIMPIA — sin pedir apodo */}
            <motion.button whileTap={{scale:0.95}} onClick={onClose} style={{background:"linear-gradient(135deg,#dc2626,#7f1d1d)",border:"2px solid #f87171",borderRadius:10,padding:"10px 20px",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,boxShadow:"0 4px 14px rgba(220,38,38,0.5)"}}>🚪 SALIR</motion.button>
          </div>
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
            {TABS.map(t=>(<motion.button key={t.id} whileTap={{scale:0.95}} onClick={()=>setTab(t.id)}
              style={{background:tab===t.id?"linear-gradient(135deg,#7c3aed,#5b21b6)":"rgba(255,255,255,0.07)",border:tab===t.id?"none":"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"6px 12px",color:tab===t.id?"#fff":"rgba(255,255,255,0.5)",fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"Barlow Condensed,sans-serif",flexShrink:0}}>{t.label}</motion.button>))}
          </div>
        </div>

        <div style={{padding:"14px 16px"}}>

        {/* ── STATS ── */}
        {tab==="stats"&&(()=>{
          const leader=[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0))[0];
          const leaderPct=realTotal>0?(votes[leader.id]||0)/realTotal:0;
          return(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {[{icon:"🗳️",val:realTotal,label:"TOTAL VOTOS",color:"#e01010",sub:`Líder: ${leader.short}`},{icon:"💬",val:comments?.length||0,label:"COMENTARIOS",color:"#7c3aed",sub:"En el foro"},{icon:"👁️",val:visitCount!==null?visitCount:"...",label:"VISITAS",color:"#0891b2",sub:"Entradas reales"},{icon:"🏆",val:realTotal>0?`${(leaderPct*100).toFixed(1)}%`:"—",label:"LÍDER",color:"#f59e0b",sub:leader.short}].map(({icon,val,label,color,sub})=>(
                <div key={label} style={{background:`linear-gradient(135deg,${color}15,${color}05)`,border:`1.5px solid ${color}35`,borderRadius:14,padding:"14px 12px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-6,right:-6,fontSize:44,opacity:0.06}}>{icon}</div>
                  <div style={{fontSize:24,marginBottom:2}}>{icon}</div>
                  <div style={{fontSize:28,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{typeof val==="number"?val.toLocaleString("es-MX"):val}</div>
                  <div style={{fontSize:7,color,letterSpacing:2,marginTop:3,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>{label}</div>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",fontFamily:"Barlow Condensed,sans-serif"}}>{sub}</div>
                </div>
              ))}
            </div>
            {/* Logos con % real */}
            <div style={{fontSize:9,color:"rgba(167,139,250,0.6)",letterSpacing:3,marginBottom:10,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>◉ PARTIDOS — RESULTADOS REALES</div>
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:16}}>
              <div style={{display:"flex",gap:10,width:"max-content",padding:"4px 2px 8px"}}>
                {[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0)).map((p,i)=>{
                  const cnt=votes[p.id]||0;
                  const pc=realTotal>0?cnt/realTotal*100:0;
                  const isTop=i===0&&cnt>0;
                  return(
                    <div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,minWidth:90}}>
                      <div style={{position:"relative",width:90,height:90,borderRadius:14,overflow:"hidden",border:`3px solid ${isTop?"#f59e0b":p.color+"66"}`,background:`${p.color}12`,flexShrink:0,boxShadow:isTop?`0 0 22px ${p.color}66`:`0 3px 10px rgba(0,0,0,0.3)`}}>
                        {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]} alt={p.short} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          :<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}><span style={{fontSize:36}}>{p.emoji}</span></div>}
                        {isTop&&<div style={{position:"absolute",top:4,right:4,fontSize:16}}>🏆</div>}
                        <div style={{position:"absolute",bottom:0,left:0,right:0,height:5,background:"rgba(0,0,0,0.2)"}}>
                          <motion.div initial={{width:"0%"}} animate={{width:`${pc}%`}} transition={{duration:1.4,ease:"easeOut"}} style={{height:"100%",background:isTop?"#f59e0b":p.color}}/>
                        </div>
                      </div>
                      <div style={{fontSize:9,fontWeight:900,color:isTop?"#f59e0b":p.color,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</div>
                      <div style={{fontSize:15,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif"}}>{pc.toFixed(1)}<span style={{fontSize:8,opacity:.6}}>%</span></div>
                      <label style={{background:`${p.color}20`,border:`1px solid ${p.color}60`,borderRadius:6,padding:"4px 8px",color:p.color,fontSize:8,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>
                        📷<input type="file" accept="image/*" onChange={(e)=>uploadLogo(p.id,e)} style={{display:"none"}}/>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          );
        })()}

        {/* ── ENCUESTA ── */}
        {tab==="encuesta"&&(
          <div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"16px",marginBottom:14}}>
              <div style={{fontSize:10,color:"#a78bfa",letterSpacing:2,marginBottom:12,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>🗳️ CONTROL DE ENCUESTA</div>
              <div style={{display:"flex",gap:10,marginBottom:10}}>
                <motion.button whileTap={{scale:0.96}} onClick={()=>{setEncuestaActiva(true);playSound("success");}}
                  style={{flex:1,background:encuestaActiva?"#16a34a":"rgba(22,163,74,0.2)",border:`2px solid ${encuestaActiva?"#16a34a":"rgba(22,163,74,0.4)"}`,borderRadius:10,padding:"12px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>
                  ✅ ACTIVAR
                </motion.button>
                <motion.button whileTap={{scale:0.96}} onClick={()=>{setEncuestaActiva(false);playSound("click");}}
                  style={{flex:1,background:!encuestaActiva?"#dc2626":"rgba(220,38,38,0.2)",border:`2px solid ${!encuestaActiva?"#dc2626":"rgba(220,38,38,0.4)"}`,borderRadius:10,padding:"12px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>
                  ⏸ PAUSAR
                </motion.button>
              </div>
              {resetConfirm?(
                <div style={{background:"rgba(220,38,38,0.15)",border:"2px solid #dc2626",borderRadius:10,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:11,color:"#f87171",marginBottom:10}}>¿Seguro? Esto borrará TODOS los votos.</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setResetConfirm(false)} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"9px",color:"#fff",fontSize:11,cursor:"pointer"}}>CANCELAR</button>
                    <motion.button whileTap={{scale:0.96}} onClick={resetVotes} style={{flex:1,background:"#dc2626",border:"none",borderRadius:8,padding:"9px",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>SÍ, RESETEAR</motion.button>
                  </div>
                </div>
              ):(
                <motion.button whileTap={{scale:0.96}} onClick={()=>setResetConfirm(true)}
                  style={{width:"100%",background:"rgba(220,38,38,0.1)",border:"2px solid #dc2626",borderRadius:10,padding:"12px",color:"#f87171",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
                  🔄 RESETEAR TODOS LOS VOTOS
                </motion.button>
              )}
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"16px"}}>
              <div style={{fontSize:10,color:"#a78bfa",letterSpacing:2,marginBottom:12,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>🔢 EDITAR VOTOS MANUALMENTE</div>
              {PARTIES.map(p=>(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,background:"rgba(255,255,255,0.03)",borderRadius:10,padding:"10px"}}>
                  <div style={{width:28,height:28,borderRadius:6,overflow:"hidden",background:`${p.color}20`,flexShrink:0}}>
                    {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.emoji}</span>}
                  </div>
                  <span style={{flex:1,fontSize:13,fontWeight:700,color:"#fff",fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</span>
                  <input type="number" min="0" value={votes[p.id]||0}
                    onChange={e=>setVotes(prev=>({...prev,[p.id]:Math.max(0,parseInt(e.target.value)||0)}))}
                    style={{width:70,background:"rgba(255,255,255,0.08)",border:`1.5px solid ${p.color}50`,borderRadius:8,padding:"7px 10px",color:p.color,fontSize:14,fontWeight:900,textAlign:"center",outline:"none",fontFamily:"Barlow Condensed,sans-serif"}}/>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CANDIDATOS ── */}
        {tab==="candidatos"&&(
          <div>
            {editId&&(
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"14px",marginBottom:12,border:"1px solid rgba(255,255,255,0.15)"}}>
                <div style={{fontSize:12,fontWeight:900,color:"#fff",marginBottom:10,fontFamily:"Barlow Condensed,sans-serif"}}>✏️ {PARTIES.find(p=>p.id===editId)?.short}</div>
                {[{k:"nombre",label:"Nombre"},{k:"cargo",label:"Cargo"},{k:"bio",label:"Bio"}].map(({k,label})=>(
                  <div key={k} style={{marginBottom:10}}><div style={{fontSize:9,color:"#9ca3af",letterSpacing:1,marginBottom:3,fontFamily:"Barlow Condensed,sans-serif"}}>{label.toUpperCase()}</div>
                  <input value={editData[k]||""} onChange={e=>setEditData(d=>({...d,[k]:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:7,padding:"10px 12px",color:"#fff",fontSize:12,outline:"none",fontFamily:"Barlow Condensed,sans-serif"}}/></div>
                ))}
                <div style={{display:"flex",gap:8,marginTop:10}}>
                  <button onClick={()=>setEditId(null)} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"10px",color:"#fff",fontSize:11,cursor:"pointer"}}>CANCELAR</button>
                  <motion.button whileTap={{scale:0.96}} onClick={saveCand} style={{flex:2,background:"#16a34a",border:"none",borderRadius:8,padding:"10px",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>✅ GUARDAR</motion.button>
                </div>
              </motion.div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {PARTIES.filter(p=>p.id!=="nulo").map(p=>{const cand=candidates[p.id];return(
                <div key={p.id} style={{background:"rgba(255,255,255,0.04)",border:`2px solid ${p.color}30`,borderRadius:14,padding:"14px"}}>
                  <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:10}}>
                    <div style={{width:54,height:54,borderRadius:10,overflow:"hidden",border:`2px solid ${p.color}`,flexShrink:0}}>
                      {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.emoji}</span>}
                    </div>
                    <div style={{flex:1}}><div style={{fontSize:14,fontWeight:900,color:p.color,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{cand?.nombre||"Por definir"}</div></div>
                    <div style={{position:"relative",width:54,height:54,flexShrink:0}}>
                      <div style={{position:"absolute",inset:-2,borderRadius:12,background:`conic-gradient(from 0deg,${p.color},#fff,${p.color}88)`,animation:"ledSpin 2.5s linear infinite"}}/>
                      <div style={{position:"absolute",inset:0,borderRadius:10,overflow:"hidden",background:`${p.color}08`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {cand?.fotoUrl?<img src={cand.fotoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:24}}>👤</span>}
                      </div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <label style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:`${p.color}20`,border:`2px solid ${p.color}`,borderRadius:10,padding:"9px",color:p.color,fontSize:10,cursor:"pointer",fontWeight:900,gap:4,fontFamily:"Barlow Condensed,sans-serif"}}>
                      📸 FOTO<input type="file" accept="image/*" onChange={e=>uploadCandPhoto(p.id,e)} style={{display:"none"}}/>
                    </label>
                    <button onClick={()=>{setEditId(p.id);setEditData({...cand});}} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:10,padding:"9px",color:"#fff",fontSize:10,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>✏️ EDITAR</button>
                  </div>
                </div>
              );})}
            </div>
          </div>
        )}

        {/* ── PROPUESTAS ADMIN ── */}
        {tab==="propuestas"&&(
          <div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(124,58,237,0.3)",borderRadius:14,padding:"16px",marginBottom:14}}>
              <div style={{fontSize:10,color:"#a78bfa",letterSpacing:2,marginBottom:12,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>+ NUEVA PROPUESTA</div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <input value={newPropEmoji} onChange={e=>setNewPropEmoji(e.target.value)} placeholder="💡" style={{width:52,background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(124,58,237,0.4)",borderRadius:8,padding:"10px",color:"#fff",fontSize:18,textAlign:"center",outline:"none"}}/>
                <input value={newPropTitle} onChange={e=>setNewPropTitle(e.target.value.slice(0,100))} placeholder="Título de la propuesta" style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(124,58,237,0.4)",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"Barlow Condensed,sans-serif"}}/>
              </div>
              <input value={newPropDesc} onChange={e=>setNewPropDesc(e.target.value.slice(0,150))} placeholder="Descripción breve" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(124,58,237,0.4)",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:12,outline:"none",fontFamily:"Barlow Condensed,sans-serif",marginBottom:10}}/>
              <motion.button whileTap={{scale:0.96}} onClick={addProp} disabled={!newPropTitle.trim()}
                style={{width:"100%",background:newPropTitle.trim()?"linear-gradient(135deg,#7c3aed,#5b21b6)":"rgba(255,255,255,0.06)",border:"none",borderRadius:10,padding:"12px",color:newPropTitle.trim()?"#fff":"rgba(255,255,255,0.25)",fontSize:13,fontWeight:900,cursor:newPropTitle.trim()?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif"}}>
                💡 AGREGAR
              </motion.button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {proposals.map(p=>{const siPct=p.si+p.no>0?Math.round((p.si/(p.si+p.no))*100):0;return(
                <div key={p.id} style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"12px"}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
                    <span style={{fontSize:20,flexShrink:0}}>{p.emoji}</span>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",marginBottom:2}}>{p.titulo}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{p.desc||p.descripcion}</div></div>
                    <motion.button whileTap={{scale:0.95}} onClick={()=>deleteProp(p.id)} style={{background:"rgba(220,38,38,0.3)",border:"1px solid #dc2626",borderRadius:7,padding:"5px 9px",color:"#f87171",fontSize:11,cursor:"pointer",flexShrink:0}}>🗑</motion.button>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:9,fontFamily:"Barlow Condensed,sans-serif"}}>
                    <span style={{color:"#4ade80",fontWeight:800}}>👍 {p.si} ({siPct}%)</span>
                    <span style={{color:"#f87171",fontWeight:800}}>👎 {p.no} ({100-siPct}%)</span>
                  </div>
                </div>
              );})}
            </div>
          </div>
        )}

        {/* ── SUGERENCIAS ── */}
        {tab==="sugerencias"&&(()=>{
          const[sugs,setSugs]=useState([]);const[loading,setLoading]=useState(true);
          useEffect(()=>{sb.from("sugerencias_preguntas").select("*").order("ts",{ascending:false}).then(res=>{setSugs(Array.isArray(res)?res:[]);setLoading(false);}).catch(()=>{setSugs([]);setLoading(false);});;},[]);
          const deleteSug=async(id)=>{await sb.from("sugerencias_preguntas").delete().eq("id",id).catch(()=>{});setSugs(s=>s.filter(x=>x.id!==id));};
          return(
            <div>
              <div style={{fontSize:10,color:"#a78bfa",letterSpacing:2,marginBottom:14,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>❓ PREGUNTAS SUGERIDAS POR CIUDADANOS</div>
              {loading&&<div style={{color:"rgba(255,255,255,0.4)",textAlign:"center",padding:20}}>Cargando...</div>}
              {!loading&&sugs.length===0&&<div style={{color:"rgba(255,255,255,0.3)",textAlign:"center",padding:20,fontSize:13}}>Ninguna sugerencia aún.</div>}
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {sugs.map(s=>(
                  <div key={s.id} style={{background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(167,139,250,0.3)",borderRadius:12,padding:"14px 16px"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:9,color:"#a78bfa",letterSpacing:2,marginBottom:4,fontFamily:"Barlow Condensed,sans-serif",fontWeight:800}}>{s.partido||"SIN PARTIDO"} · {s.nick||"Anónimo"}</div>
                        <div style={{fontSize:14,color:"#f1f5f9",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,lineHeight:1.5}}>{s.pregunta}</div>
                      </div>
                      <button onClick={()=>deleteSug(s.id)} style={{background:"rgba(220,38,38,0.2)",border:"1px solid #dc2626",borderRadius:8,padding:"6px 10px",color:"#f87171",fontSize:10,cursor:"pointer",fontWeight:800,flexShrink:0}}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── EXPORTAR ── */}
        {tab==="exportar"&&(
          <div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(16,185,129,0.4)",borderRadius:14,padding:"16px",marginBottom:14}}>
              <div style={{fontSize:10,color:"#34d399",letterSpacing:2,marginBottom:12,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>📥 EXPORTAR DATOS</div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <motion.button whileTap={{scale:0.96}} onClick={()=>{
                  const csv=`Reporte Encuesta Silao\nFecha:,${new Date().toLocaleDateString("es-MX")}\nTotal votos:,${realTotal}\n\nPartido,Votos,Porcentaje\n${PARTIES.map(p=>`${p.short},${votes[p.id]||0},${realTotal>0?((votes[p.id]||0)/realTotal*100).toFixed(1)+"%" : "0%"}`).join("\n")}`;
                  const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
                  const url=URL.createObjectURL(blob);
                  const a=document.createElement("a");a.href=url;a.download=`encuestasilao_votos_${new Date().toISOString().slice(0,10)}.csv`;a.click();
                  URL.revokeObjectURL(url);playSound("success");
                }} style={{flex:1,background:"linear-gradient(135deg,#059669,#047857)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>📊 VOTOS CSV</motion.button>
                <motion.button whileTap={{scale:0.96}} onClick={()=>{
                  const rows=["Nick,Comentario,Fecha",...(comments||[]).map(c=>`"${c.nick}","${(c.txt||"").replace(/"/g,"'")}","${new Date(c.ts).toLocaleDateString("es-MX")}"`)];
                  const blob=new Blob([rows.join("\n")],{type:"text/csv;charset=utf-8;"});
                  const url=URL.createObjectURL(blob);
                  const a=document.createElement("a");a.href=url;a.download=`encuestasilao_comentarios_${new Date().toISOString().slice(0,10)}.csv`;a.click();
                  URL.revokeObjectURL(url);playSound("success");
                }} style={{flex:1,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>💬 COMENTARIOS</motion.button>
              </div>
              {/* Mini chart */}
              <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:"14px"}}>
                <div style={{fontSize:9,color:"#34d399",letterSpacing:2,marginBottom:10,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>DISTRIBUCIÓN ACTUAL (SUPABASE)</div>
                {PARTIES.filter(p=>(votes[p.id]||0)>0).sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0)).map(p=>{
                  const pc=realTotal>0?((votes[p.id]||0)/realTotal*100):0;
                  return(<div key={p.id} style={{marginBottom:7}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:10,color:p.color,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</span><span style={{fontSize:10,color:"#fff",fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>{votes[p.id]||0} ({pc.toFixed(1)}%)</span></div>
                    <div style={{height:6,background:"rgba(255,255,255,0.08)",borderRadius:4}}><div style={{height:"100%",width:`${pc}%`,background:p.color,borderRadius:4,transition:"width .6s"}}/></div>
                  </div>);
                })}
                {realTotal===0&&<div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textAlign:"center"}}>Sin votos aún</div>}
              </div>
            </div>
          </div>
        )}

        {/* ── CONFIG ── */}
        {tab==="config"&&(
          <div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(224,16,16,0.3)",borderRadius:14,padding:"16px",marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:900,color:"#f87171",letterSpacing:2,marginBottom:12,fontFamily:"Barlow Condensed,sans-serif"}}>📢 ALERTA GLOBAL</div>
              <textarea value={alertInput} onChange={e=>setAlertInput(e.target.value.slice(0,200))} placeholder="Mensaje de alerta para todos los usuarios"
                style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(220,38,38,0.4)",borderRadius:10,padding:"12px",color:"#fff",fontSize:12,outline:"none",resize:"none",height:80,fontFamily:"Barlow Condensed,sans-serif",lineHeight:1.5,marginBottom:10}}/>
              <div style={{display:"flex",gap:8}}>
                <motion.button whileTap={{scale:0.96}} onClick={()=>{setAlertaMsg(alertInput);setAlertaActiva(true);playSound("success");}}
                  style={{flex:1,background:"#dc2626",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>
                  📢 ACTIVAR
                </motion.button>
                <motion.button whileTap={{scale:0.96}} onClick={()=>{setAlertaActiva(false);setAlertaMsg("");setAlertInput("");playSound("click");}}
                  style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"11px",color:"rgba(255,255,255,0.6)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>
                  ✕ DESACTIVAR
                </motion.button>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"16px",marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:900,color:"#a78bfa",letterSpacing:2,marginBottom:12,fontFamily:"Barlow Condensed,sans-serif"}}>🏙️ LOGO DE LA APP</div>
              <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                <div style={{width:80,height:54,borderRadius:10,overflow:"hidden",border:"1.5px solid rgba(255,255,255,0.2)"}}>
                  <img src={siteLogo||LOGO_SILAO360} alt="logo" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
                </div>
                <label style={{display:"inline-flex",alignItems:"center",gap:6,background:"#7c3aed",border:"none",borderRadius:8,padding:"9px 14px",color:"#fff",fontSize:10,cursor:"pointer",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>
                  📤 SUBIR<input type="file" accept="image/*" onChange={uploadSiteLogo} style={{display:"none"}}/>
                </label>
              </div>
            </div>
            <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"16px",marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:900,color:"#a78bfa",letterSpacing:2,marginBottom:12,fontFamily:"Barlow Condensed,sans-serif"}}>ℹ️ INFO DEL SISTEMA</div>
              {[{label:"Contraseña admin",val:"Silao360#"},{label:"Activar admin",val:"Toca logo 5 veces"},{label:"Versión",val:"v5.0 — Todas las conexiones reales a Supabase"},{label:"Dominio",val:"silao360.com.mx"}].map(({label,val})=>(
                <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
                  <span style={{fontSize:11,fontWeight:700,color:"#fff",fontFamily:"Barlow Condensed,sans-serif"}}>{label}</span>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontFamily:"Barlow Condensed,sans-serif",textAlign:"right",maxWidth:"55%"}}>{val}</span>
                </div>
              ))}
            </div>
            <motion.button whileTap={{scale:0.96}} onClick={onClose}
              style={{width:"100%",background:"linear-gradient(135deg,#dc2626,#7f1d1d)",border:"none",borderRadius:12,padding:"15px",color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              🔒 CERRAR SESIÓN ADMIN
            </motion.button>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

// ── APP PRINCIPAL ──
export default function App(){
  const[screen,setScreen]=useState("results");
  const[votes,setVotes]=useState(()=>Object.fromEntries(PARTIES.map(p=>[p.id,0])));
  const[myVote,setMyVote]=useState(()=>{try{return localStorage.getItem("silao360_mivoto")||null;}catch(e){return null;}});
  const[user,setUser]=useState(()=>{try{const u=localStorage.getItem("silao360_user");return u?JSON.parse(u):null;}catch(e){return null;}});
  const[showLogin,setShowLogin]=useState(false);
  const[showOnboarding,setShowOnboarding]=useState(()=>{try{return !localStorage.getItem("silao360_user");}catch(e){return true;}});
  const[isAdmin,setIsAdmin]=useState(false);
  const[showAdminLogin,setShowAdminLogin]=useState(false);
  const[showAdminPanel,setShowAdminPanel]=useState(false);
  const adminTaps=useRef(0);const adminTimer=useRef(null);
  const[comments,setComments]=useState([]);
  const[blockedNicks]=useState([]);
  const[pinnedMsg]=useState("El silencio electoral es el arma favorita de quienes quieren que nada cambie. Aquí puedes opinar sin miedo. Tu apodo te protege.");
  const[candidates,setCandidates]=useState({...INIT_CANDIDATES});
  const[proposals,setProposals]=useState([...INIT_PROPOSALS]);
  const[siteLogo,setSiteLogo]=useState(null);
  const[encuestaActiva,setEncuestaActiva]=useState(true);
  const[alertaMsg,setAlertaMsg]=useState("");
  const[alertaActiva,setAlertaActiva]=useState(false);
  const total=Object.values(votes).reduce((a,b)=>a+b,0);

  const handleVote=(id)=>{
    setVotes(prev=>{const next={...prev};if(myVote&&next[myVote]>0)next[myVote]--;next[id]=(next[id]||0)+1;return next;});
    setMyVote(id);
    try{localStorage.setItem("silao360_mivoto",id);}catch(e){}
    const uid=(user?.nickname||"anon_"+Math.random().toString(36).slice(2,8));
    sb.from("votos").insert({partido_id:id,user_id:uid}).catch(()=>{});
  };
  const saveUser=(u)=>{setUser(u);try{localStorage.setItem("silao360_user",JSON.stringify(u));}catch(e){}};
  const doLogout=()=>{setUser(null);setMyVote(null);try{localStorage.removeItem("silao360_user");localStorage.removeItem("silao360_mivoto");}catch(e){}};

  // ── Supabase: registrar entrada ──
  useEffect(()=>{
    const sid=Math.random().toString(36).slice(2,10)+Date.now().toString(36);
    sb.from("visitas").insert({sid,ts:new Date().toISOString(),ua:navigator.userAgent.slice(0,80)}).catch(()=>{});
  },[]);

  // ── Supabase: cargar votos reales ──
  useEffect(()=>{
    sb.from("votos").select("partido_id").then(rows=>{
      if(!Array.isArray(rows)||rows.length===0) return;
      const counts={};
      rows.forEach(r=>{if(r.partido_id) counts[r.partido_id]=(counts[r.partido_id]||0)+1;});
      setVotes(Object.fromEntries(PARTIES.map(p=>[p.id,counts[p.id]||0])));
    }).catch(()=>{});
  },[]);

  // ── Supabase: cargar comentarios reales ──
  useEffect(()=>{
    sb.from("comentarios").select("*").order("ts",{ascending:false}).limit(50).then(rows=>{
      if(Array.isArray(rows)&&rows.length>0){
        setComments(rows.map(r=>({...r,ts:r.ts?new Date(r.ts).getTime():Date.now(),reactions:{like:0,heart:0,fire:0,wow:0,haha:0},myReacted:{},replies:[]})));
      }
    }).catch(()=>{});
  },[]);

  // ── Supabase: cargar propuestas reales ──
  useEffect(()=>{
    sb.from("propuestas").select("*").then(rows=>{
      if(Array.isArray(rows)&&rows.length>0){
        setProposals(rows.map(r=>({...r,desc:r.descripcion||r.desc||"",miVoto:null})));
      }
    }).catch(()=>{});
  },[]);

  const handleLogoClick=()=>{
    setScreen("results");
    adminTaps.current+=1;
    if(adminTimer.current)clearTimeout(adminTimer.current);
    adminTimer.current=setTimeout(()=>{adminTaps.current=0;},2500);
    if(adminTaps.current>=5){adminTaps.current=0;if(isAdmin){setIsAdmin(false);setShowAdminPanel(false);}else{setShowAdminLogin(true);}}
  };

  const sp={votes,total,user,onLoginClick:()=>setShowLogin(true),onLogoClick:handleLogoClick,onLogout:doLogout,siteLogo};

  return(
    <div style={{background:"#f8faff",minHeight:"100vh",color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes pd{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes blk{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes logoPulse{0%,100%{box-shadow:0 3px 14px rgba(224,16,16,0.45)}50%{box-shadow:0 3px 26px rgba(224,16,16,0.8),0 0 40px rgba(224,16,16,0.3)}}
        @keyframes glow360{0%,100%{text-shadow:0 0 8px rgba(255,107,107,0.5)}50%{text-shadow:0 0 16px rgba(255,107,107,1)}}
        @keyframes ledSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes ledShimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes voteGlow{0%,100%{box-shadow:0 0 0 0 rgba(224,16,16,0.4),0 4px 20px rgba(220,0,0,0.5)}50%{box-shadow:0 0 0 8px rgba(224,16,16,0),0 4px 28px rgba(220,0,0,0.7)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#c4b5fd}
        input::placeholder{color:#9ca3af}
        textarea::placeholder{color:#6b7280}
        html,body{overflow-x:hidden}
      `}</style>

      {isAdmin&&<div onClick={()=>setShowAdminPanel(true)} style={{position:"fixed",top:0,left:0,right:0,zIndex:999,background:"linear-gradient(90deg,#5b21b6,#7c3aed)",padding:"4px 16px",textAlign:"center",fontSize:9,color:"#fff",fontWeight:800,letterSpacing:2,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>⚙️ ADMIN ACTIVO — TOCA PARA ABRIR PANEL</div>}
      {alertaActiva&&alertaMsg&&<motion.div initial={{y:80,opacity:0}} animate={{y:0,opacity:1}} style={{position:"fixed",bottom:90,left:12,right:12,zIndex:998,background:"linear-gradient(135deg,#dc2626,#b91c1c)",padding:"10px 14px",borderRadius:14,fontSize:11,color:"#fff",fontWeight:800,letterSpacing:1,fontFamily:"Barlow Condensed,sans-serif",boxShadow:"0 4px 20px rgba(220,38,38,0.5)",display:"flex",alignItems:"center",gap:8,maxWidth:500,margin:"0 auto"}}><span style={{fontSize:16}}>📢</span><span style={{flex:1,lineHeight:1.4}}>{alertaMsg}</span></motion.div>}

      <AnimatePresence>{showAdminLogin&&<AdminLogin onSuccess={()=>{setIsAdmin(true);setShowAdminLogin(false);setShowAdminPanel(true);}} onCancel={()=>setShowAdminLogin(false)}/>}</AnimatePresence>
      {showAdminPanel&&isAdmin&&<AdminPanel candidates={candidates} setCandidates={setCandidates} siteLogo={siteLogo} setSiteLogo={setSiteLogo} onClose={()=>setShowAdminPanel(false)} votes={votes} setVotes={setVotes} proposals={proposals} setProposals={setProposals} comments={comments} encuestaActiva={encuestaActiva} setEncuestaActiva={setEncuestaActiva} alertaMsg={alertaMsg} setAlertaMsg={setAlertaMsg} alertaActiva={alertaActiva} setAlertaActiva={setAlertaActiva} blockedNicks={blockedNicks}/>}
      <AnimatePresence>{showOnboarding&&<OnboardingModal onComplete={u=>{saveUser(u);setShowOnboarding(false);}} onSkip={()=>setShowOnboarding(false)}/>}</AnimatePresence>

      {!showOnboarding&&(<>
        <AnimatePresence>{showLogin&&<LoginModal onLogin={u=>{saveUser(u);setShowLogin(false);}} onClose={()=>setShowLogin(false)}/>}</AnimatePresence>
        <div style={{paddingTop:isAdmin&&alertaActiva?46:isAdmin||alertaActiva?22:0}}>
          {screen==="results"&&<ResultsScreen {...sp} myVote={myVote} setScreen={setScreen}/>}
          {screen==="vote"&&<VoteScreen {...sp} myVote={myVote} onVote={handleVote} candidates={candidates} setScreen={setScreen}/>}
          {screen==="proposals"&&<ProposalsScreen {...sp} proposals={proposals} setProposals={setProposals} isAdmin={isAdmin}/>}
          {screen==="articles"&&<ArticlesScreen {...sp} votes={votes} candidates={candidates}/>}
          {screen==="preguntale"&&<PreguntaleScreen {...sp} candidates={candidates}/>}
          {screen==="comments"&&<CommentsScreen {...sp} isAdmin={isAdmin} comments={comments} setComments={setComments} blockedNicks={blockedNicks} pinnedMsg={pinnedMsg}/>}
        </div>
        <BouncingBall siteLogo={siteLogo} onLogoClick={()=>setScreen("results")} votes={votes} total={total}/>
        <NavBar screen={screen} setScreen={setScreen}/>
      </>)}
    </div>
  );
}
