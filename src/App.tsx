import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";
import { createClient } from "@supabase/supabase-js";

// ── TIPOS ──
interface Party {
  id: string;
  short: string;
  name: string;
  color: string;
  emoji: string;
  spectrumPos: number;
  spectrumLabel: string;
  ideologyTags: string[];
  fundado: string;
  fundador: string;
  dirigente: string;
  militantes: string;
  gobiernos: string;
  descripcion: string;
  curioso: string;
  opinion: string;
}

interface Candidate {
  nombre: string;
  cargo: string;
  fotoUrl: string | null;
  bio: string;
  soloPartido?: boolean;
}

interface Proposal {
  id: string | number;
  emoji: string;
  titulo: string;
  desc: string;
  si: number;
  no: number;
  miVoto: "si" | "no" | null;
  autor: string;
}

interface Comment {
  id: string | number;
  nick: string;
  txt: string;
  ts: number;
  reactions: Record<string, number>;
  myReacted: Record<string, boolean>;
  replies: Comment[];
}

interface UserProfile {
  id: string;
  nickname: string;
  email: string;
  name: string;
}

interface VisitData {
  total: number;
  today: number;
  week: number;
}


// ── SUPABASE ──
// Variables de entorno (.env o Netlify Site settings → Environment variables):
// VITE_SUPABASE_URL=https://irekcyeoumxnwbtonfup.supabase.co
// VITE_SUPABASE_ANON_KEY=<tu_anon_key>
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL ?? "https://irekcyeoumxnwbtonfup.supabase.co";
const SUPABASE_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ?? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZWtjeWVvdW14bndidG9uZnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTczMzAsImV4cCI6MjA5NDc5MzMzMH0.gzmCwhJBeaabl83Q4W6cMhpk0Ofwg0OrHaYou9_ksL0";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── SONIDOS (sin use-sound para el artifact, usamos Audio nativo) ──
const playSound = (type: string): void => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    const freqs = { click: 800, success: 1200, vote: 600, modal: 400 };
    o.frequency.value = freqs[type] || 600;
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.15);
  } catch(e) {}
};

// ── LOGOS DE PARTIDOS ──
// Los logos se cargan desde el Panel Admin (siteLogo por partido).
// Deja estos en null — el admin los sube desde la app.
const PARTY_LOGOS: Record<string, string | null> = {
  pan: null, morena: null, pri: null, mc: null,
  pvem: null, pt: null, somosmx: null, sombrero: null,
};


// ── DATOS ──
const PARTIES = [
  { id:"pan", short:"PAN", name:"Partido Acción Nacional", color:"#1a6fd4", emoji:"🔵", spectrumPos:72, spectrumLabel:"Centro-Derecha", ideologyTags:["derecha","conservador"], fundado:"16 sep 1939", fundador:"Manuel Gómez Morín", dirigente:"Jorge Romero Herrera", militantes:"300,000", gobiernos:"Guanajuato desde 1991", descripcion:"Partido fundado en 1939 con doctrina de humanismo cristiano, libre mercado y valores familiares. Ha gobernado el estado de Guanajuato de manera continua desde 1991.", curioso:"💡 El PAN fue el primer partido en ganar la presidencia al PRI en el año 2000, después de 71 años de alternancia pendiente.", opinion:"El PAN tiene presencia histórica en Guanajuato. Para Silao 2025, los ciudadanos podrán evaluar su propuesta y trayectoria municipal." },
  { id:"morena", short:"MORENA", name:"Mov. Regeneración Nacional", color:"#b91c1c", emoji:"🔴", spectrumPos:26, spectrumLabel:"Centro-Izquierda", ideologyTags:["izquierda","populismo","nacionalismo"], fundado:"2 oct 2011", fundador:"Andrés Manuel López Obrador", dirigente:"Ariadna Montiel Reyes", militantes:"2.3 millones", gobiernos:"Gobierno federal 2018-2030, 21 gobernadores", descripcion:"Partido fundado en 2011 con enfoque en transformación social, reducción de desigualdades y fortalecimiento de programas sociales. Gobierna a nivel federal desde 2018.", curioso:"💡 Morena es uno de los partidos de crecimiento más rápido en la historia de México, pasando de su fundación a ganar la presidencia en 7 años.", opinion:"Morena cuenta con presencia nacional y programas sociales activos. Para Silao 2025, los ciudadanos podrán evaluar su propuesta municipal concreta." },
  { id:"pri", short:"PRI", name:"Partido Revolucionario Institucional", color:"#c2410c", emoji:"🟤", spectrumPos:50, spectrumLabel:"Centro", ideologyTags:["centro","nacionalismo"], fundado:"4 mar 1929", fundador:"Plutarco Elías Calles", dirigente:"Alejandro Moreno Cárdenas", militantes:"Aprox. 4 millones", gobiernos:"Durango y Coahuila a nivel estatal", descripcion:"Partido con más de 90 años de historia en México. Gobernó el país de forma ininterrumpida de 1929 a 2000. Cuenta con estructura organizativa en todo el territorio nacional.", curioso:"💡 El PRI gobernó México durante 71 años consecutivos, siendo uno de los partidos con mayor continuidad en el poder en la historia política mundial.", opinion:"El PRI cuenta con larga trayectoria e infraestructura organizativa. Para Silao 2025, los ciudadanos podrán evaluar su propuesta y candidato." },
  { id:"mc", short:"MOV. CIUDADANO", name:"Movimiento Ciudadano", color:"#ea580c", emoji:"🟠", spectrumPos:38, spectrumLabel:"Centro-Izquierda", ideologyTags:["centro","socialdemocrata","progresismo"], fundado:"1999", fundador:"Dante Delgado Rannauro", dirigente:"Jorge Álvarez Máynez", militantes:"800,000", gobiernos:"Jalisco, Nuevo León", descripcion:"Partido con presencia en todo el país y experiencia de gobierno en estados como Jalisco y Nuevo León. Su plataforma combina desarrollo económico con justicia social.", curioso:"💡 Movimiento Ciudadano postuló candidato presidencial propio en 2024 sin alianzas con otros partidos, algo poco común en la política mexicana.", opinion:"MC tiene experiencia de gobierno estatal reciente. Para Silao 2025, los ciudadanos podrán evaluar su propuesta y candidato local." },
  { id:"pvem", short:"PVEM", name:"Partido Verde Ecologista", color:"#16a34a", emoji:"🌿", spectrumPos:48, spectrumLabel:"Centro", ideologyTags:["centro","populismo"], fundado:"1986", fundador:"Jorge González Torres", dirigente:"Karen Castrejón Trujillo", militantes:"500,000", gobiernos:"Participa en coaliciones a nivel federal y estatal", descripcion:"Partido fundado con enfoque en temas ambientales y ecológicos. Ha participado en diversas coaliciones electorales a lo largo de su historia.", curioso:"💡 El PVEM es uno de los partidos ecologistas más antiguos de México, fundado en 1986 con el objetivo de promover políticas de protección ambiental.", opinion:"El PVEM tiene presencia en varias regiones del país. Para Silao 2025, los ciudadanos podrán evaluar su propuesta local." },
  { id:"pt", short:"PT", name:"Partido del Trabajo", color:"#dc2626", emoji:"✊", spectrumPos:18, spectrumLabel:"Izquierda", ideologyTags:["izquierda","socialdemocrata"], fundado:"13 ene 1992", fundador:"Alberto Anaya Gutiérrez", dirigente:"Alberto Anaya Gutiérrez", militantes:"457,000", gobiernos:"Participa en coaliciones a nivel federal y local", descripcion:"Partido de izquierda fundado en 1992. Su plataforma se centra en derechos laborales, justicia social y fortalecimiento de los trabajadores.", curioso:"💡 El PT ha participado en elecciones presidenciales desde 1994, representando consistentemente a sectores de izquierda en la política mexicana.", opinion:"El PT tiene presencia a nivel nacional. Para Silao 2025, los ciudadanos podrán evaluar su propuesta y candidato en el municipio." },
  { id:"somosmx", short:"SOMOS MX", name:"Somos MX — La Fuerza que nos Une", color:"#db2777", emoji:"🩷", spectrumPos:35, spectrumLabel:"Centro-Izquierda", ideologyTags:["progresismo","centro"], fundado:"2020", fundador:"Por confirmar", dirigente:"Por confirmar", militantes:"Por confirmar", gobiernos:"Movimiento en desarrollo", descripcion:"Movimiento político enfocado en la participación ciudadana, la unidad comunitaria y la representación de sectores no atendidos por partidos tradicionales.", curioso:"💡 Somos MX representa una nueva generación de movimientos políticos que buscan mayor participación directa de la comunidad en las decisiones públicas.", opinion:"Somos MX es una fuerza emergente. Para Silao 2025, los ciudadanos podrán evaluar su propuesta y nivel de organización local." },
  { id:"sombrero", short:"MOV. SOMBRERO", name:"Movimiento Independiente del Sombrero", color:"#a16207", emoji:"🤠", spectrumPos:55, spectrumLabel:"Centro / Independiente", ideologyTags:["centro","nacionalismo"], fundado:"2024", fundador:"Por confirmar", dirigente:"Por confirmar", militantes:"Por confirmar", gobiernos:"Movimiento local independiente", descripcion:"Movimiento político local que recupera la identidad cultural del Bajío como eje de su propuesta. Busca representar a ciudadanos silaoenses desde una perspectiva independiente.", curioso:"💡 El sombrero charro es símbolo histórico del Bajío y de Silao. Este movimiento lo adopta como emblema de identidad regional y cultural.", opinion:"El Movimiento del Sombrero es una opción local independiente. Para Silao 2025, los ciudadanos podrán evaluar su propuesta y organización." },
  { id:"independiente", short:"INDEPENDIENTE", name:"Candidato sin Partido", color:"#7c3aed", emoji:"⚡", spectrumPos:50, spectrumLabel:"Depende del candidato", ideologyTags:["centro"], fundado:"No aplica", fundador:"No aplica", dirigente:"No aplica", militantes:"No aplica", gobiernos:"Varía según el candidato", descripcion:"Una candidatura independiente no está respaldada por ningún partido político. El candidato se postula con base en su trayectoria personal y propuesta ciudadana.", curioso:"💡 En México, las candidaturas independientes fueron reconocidas legalmente en 2012. El primer gobernador independiente fue Jaime Rodríguez en Nuevo León (2015).", opinion:"Una candidatura independiente permite evaluar directamente la trayectoria y propuesta del candidato sin vinculación partidista." },
  { id:"nulo", short:"TODAVÍA NO DECIDO", name:"Escucho propuestas primero", color:"#0891b2", emoji:"🤔", spectrumPos:50, spectrumLabel:"Ciudadano informado", ideologyTags:["centro"], fundado:"No aplica", fundador:"No aplica", dirigente:"No aplica", militantes:"No aplica", gobiernos:"No aplica", descripcion:"Informarse antes de decidir es un derecho ciudadano. Conocer las propuestas, trayectorias y plataformas de cada candidato es fundamental para una votación responsable.", curioso:"💡 El voto informado es una de las herramientas más poderosas de la democracia. Analizar opciones antes de decidir es un ejercicio cívico valioso.", opinion:"Esperar a conocer las propuestas completas antes de decidir es una postura válida y responsable para cualquier ciudadano." },
];

const IDEOLOGIES = [
  { id:"derecha", label:"DERECHA", color:"#1e3a8a", bg:"#dbeafe", desc:"Favorece tradición, libre mercado, propiedad privada y valores familiares." },
  { id:"izquierda", label:"IZQUIERDA", color:"#991b1b", bg:"#fee2e2", desc:"Busca reducir desigualdades sociales, más intervención del Estado." },
  { id:"centro", label:"CENTRO", color:"#374151", bg:"#f3f4f6", desc:"Busca equilibrio entre libre mercado y protección social." },
  { id:"conservador", label:"CONSERVADOR", color:"#7c2d12", bg:"#fff7ed", desc:"Valora la tradición, las instituciones históricas, la familia y la religión." },
  { id:"socialdemocrata", label:"SOCIALDEMOCRACIA", color:"#166534", bg:"#dcfce7", desc:"Acepta el capitalismo pero exige regulación estatal y servicios sociales." },
  { id:"populismo", label:"POPULISMO", color:"#92400e", bg:"#fef3c7", desc:"Divide al mundo entre el pueblo y la élite corrupta." },
  { id:"progresismo", label:"PROGRESISMO", color:"#5b21b6", bg:"#ede9fe", desc:"Busca cambios sociales acelerados: igualdad, derechos, inclusión." },
  { id:"nacionalismo", label:"NACIONALISMO", color:"#065f46", bg:"#d1fae5", desc:"Pone al país y su soberanía por encima de todo." },
];

const INIT_CANDIDATES = {
  pan:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"El PAN aún no ha anunciado candidato oficial para Silao 2025."},
  morena:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"Morena aún no ha anunciado candidato oficial para Silao 2025."},
  pri:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"El PRI aún no ha anunciado candidato oficial para Silao 2025."},
  mc:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"MC aún no ha anunciado candidato oficial para Silao 2025."},
  pvem:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"PVEM aún no ha anunciado candidato oficial para Silao 2025."},
  pt:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"PT aún no ha anunciado candidato oficial para Silao 2025."},
  somosmx:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"Somos MX aún no ha anunciado candidato oficial para Silao 2025."},
  sombrero:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"Movimiento Independiente del Sombrero aún no ha anunciado candidato."},
  independiente:{nombre:"Por definir",cargo:"Candidato Independiente",fotoUrl:null,bio:"Candidatura independiente — se publicará cuando esté registrada."},
  nulo:{nombre:"No aplica",cargo:"",fotoUrl:null,bio:"Esta opción representa a ciudadanos indecisos."},
};

const INIT_PROPOSALS = [];

const CANDIDATE_QUESTIONS = [
  {emoji:"💰",cat:"PRESUPUESTO",q:"¿Cuánto es el presupuesto anual de Silao y en qué lo vas a gastar tú?"},
  {emoji:"🏗️",cat:"OBRA PÚBLICA",q:"¿Cuál es la primera obra que harás en los primeros 90 días?"},
  {emoji:"🔍",cat:"TRANSPARENCIA",q:"¿Publicarás en internet todos los contratos y gastos del municipio?"},
  {emoji:"🚔",cat:"SEGURIDAD",q:"¿Cuántos policías tiene Silao hoy y cuál es tu plan concreto?"},
  {emoji:"💧",cat:"AGUA",q:"¿Cómo resolverás los problemas de abasto de agua en colonias periféricas?"},
  {emoji:"🗑️",cat:"SERVICIOS",q:"¿Cada cuándo pasará la basura en colonias periféricas si tú ganas?"},
  {emoji:"👔",cat:"EQUIPO",q:"¿Quiénes son las 3 personas más importantes de tu equipo?"},
  {emoji:"⚖️",cat:"CORRUPCIÓN",q:"¿Aceptarás auditorías ciudadanas independientes a tu administración?"},
  {emoji:"📊",cat:"RENDIR CUENTAS",q:"¿Cómo te vas a comunicar con los ciudadanos mes a mes?"},
  {emoji:"🏭",cat:"EMPLEO",q:"¿Qué harás para que las empresas del parque industrial beneficien más a los silaoenses?"},
];

const DEMO_COMMENTS=[];
const REACTION_MAP=[{k:"like",e:"👍"},{k:"heart",e:"❤️"},{k:"fire",e:"🔥"},{k:"wow",e:"😮"},{k:"haha",e:"😂"}];
const NICK_ADJ=["Águila","Voz","Guardián","Centinela","Latido","Llama","Pulso","Chispa","Fuerza","Luz","Eco","Espíritu","Raíz","Flama"];
const NICK_NOUN=["Silaoense","del Bajío","Guanajuatense","de Silao","del Centro","de Acero","Valiente","Libre","Rebelde","Citadino"];
function genNickname(seed){let h=5381;for(let i=0;i<seed.length;i++)h=((h<<5)+h)^seed.charCodeAt(i);const n=Math.abs(h>>8)%90+10;return`${NICK_ADJ[Math.abs(h)%NICK_ADJ.length]} ${NICK_NOUN[Math.abs(h>>4)%NICK_NOUN.length]} #${n}`;}
function timeAgo(ts){
  const d=(Date.now()-ts)/1000;
  if(d<60)return"ahora";
  if(d<3600)return`hace ${Math.floor(d/60)} min`;
  if(d<86400){
    const date=new Date(ts);
    const h=date.getHours();
    const m=date.getMinutes().toString().padStart(2,"0");
    const ampm=h>=12?"PM":"AM";
    const h12=h%12||12;
    return`${h12}:${m} ${ampm}`;
  }
  const date=new Date(ts);
  return date.toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"long"});
}
function fullDate(){
  const d=new Date();
  const h=d.getHours(),m=d.getMinutes().toString().padStart(2,"0"),ampm=h>=12?"PM":"AM",h12=h%12||12;
  return{
    fecha:d.toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"}),
    hora:`${h12}:${m} ${ampm}`
  };
}

function LiveCount({value}){
  const[n,setN]=useState(value);const prev=useRef(value);const timer=useRef(null);
  useEffect(()=>{if(value===prev.current)return;if(timer.current)clearInterval(timer.current);const diff=value-prev.current,start=prev.current;const steps=Math.min(Math.abs(diff),20);let s=0;timer.current=setInterval(()=>{s++;setN(Math.round(start+diff*s/steps));if(s>=steps){clearInterval(timer.current);prev.current=value;}},30);return()=>clearInterval(timer.current);},[value]);
  return<>{n.toLocaleString("es-MX")}</>;
}

// ── COMPONENTES VISUALES ──
function PartyLogoBox({partyId,emoji,color,size=64,radius=10}){
  const logo=PARTY_LOGOS[partyId];
  return(
    <div style={{width:size,height:size,borderRadius:radius,overflow:"hidden",border:`3px solid ${color}60`,flexShrink:0,background:`${color}12`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 0 14px ${color}40`}}>
      {logo?<img src={logo} alt={partyId} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:size*0.42}}>{emoji}</span>}
    </div>
  );
}

function CandidateBox({candidate,color,size=64,radius=10}){
  if(candidate?.soloPartido)return null;
  const has=!!candidate?.fotoUrl;
  return(
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <div style={{position:"absolute",inset:-3,borderRadius:radius+3,background:`conic-gradient(from 0deg,${color},#fff,${color}88,#fff,${color})`,animation:"ledSpin 2.5s linear infinite",zIndex:0}}/>
      <div style={{position:"absolute",inset:0,borderRadius:radius,overflow:"hidden",background:has?"#000":`${color}08`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:1,gap:2}}>
        {has?<img src={candidate.fotoUrl} alt="candidato" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<>
          <span style={{fontSize:size*0.34,lineHeight:1}}>👤</span>
          <span style={{fontSize:Math.max(6,size*0.1),color,fontFamily:"Barlow Condensed,sans-serif",fontWeight:900,letterSpacing:.5,textAlign:"center",lineHeight:1.2,padding:"0 2px"}}>PRÓXIMO</span>
          <span style={{fontSize:Math.max(6,size*0.1),color,fontFamily:"Barlow Condensed,sans-serif",fontWeight:900,letterSpacing:.5,textAlign:"center",lineHeight:1.2,padding:"0 2px"}}>CANDIDATO</span>
        </>}
      </div>
    </div>
  );
}

// ── MONEY MODAL con Framer Motion ──
function MoneyModal({onClose}){
  const[qIdx,setQIdx]=useState(0);
  const ballots=Array.from({length:14},(_,i)=>({x:`${5+i*7}%`,delay:i*0.28,dur:7+i%3*1}));
  useEffect(()=>{playSound("modal");},[]);
  return(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.92)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflow:"hidden"}}>
        {ballots.map((b,i)=>(
          <motion.div key={i} initial={{y:-120,x:b.x,rotate:-15}} animate={{y:"110vh",rotate:360}}
            transition={{duration:b.dur,delay:b.delay,repeat:Infinity,ease:"linear"}}
            style={{position:"fixed",top:0,left:b.x,pointerEvents:"none",zIndex:401}}>
            <div style={{background:"#fff",border:"2px solid #e01010",borderRadius:8,padding:"6px 8px",textAlign:"center",fontSize:9,fontWeight:900,color:"#e01010",lineHeight:1.3,width:56}}>
              <div style={{color:"#6b7280",fontSize:7,marginBottom:2}}>SILAO {new Date().getFullYear()}</div>
              TU VOTO ES LIBRE
            </div>
          </motion.div>
        ))}
        <motion.div initial={{scale:0.7,opacity:0,y:40}} animate={{scale:1,opacity:1,y:0}}
          transition={{type:"spring",stiffness:280,damping:22}}
          style={{background:"#fff",borderRadius:24,padding:"22px 18px",maxWidth:370,width:"100%",zIndex:402,position:"relative",border:"3px solid #e01010",boxShadow:"0 24px 80px rgba(0,0,0,0.6)"}}>
          <div style={{textAlign:"center",fontSize:44,marginBottom:6}}>🚫💰</div>
          <div style={{fontSize:20,fontWeight:900,color:"#e01010",textAlign:"center",marginBottom:12,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>TU VOTO NO ESTÁ EN VENTA</div>
          <div style={{marginBottom:14}}>
            <div style={{background:"linear-gradient(135deg,#1a0a2e,#2d1b69)",border:"2px solid #7c3aed",borderRadius:14,padding:"16px",marginBottom:10,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-10,right:-10,fontSize:60,opacity:.06}}>🗳️</div>
              <div style={{fontSize:9,color:"#a78bfa",letterSpacing:2,marginBottom:8,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>💬 REFLEXIÓN CIUDADANA</div>
              <div style={{fontSize:14,color:"#fff",lineHeight:1.8,fontStyle:"italic",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>"Tu voto no tiene precio. Que nadie compre tu decisión, porque después el costo lo paga todo el pueblo."</div>
            </div>
            <div style={{background:"linear-gradient(135deg,#1a0600,#7c2d12)",border:"2px solid #f97316",borderRadius:14,padding:"16px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-10,right:-10,fontSize:60,opacity:.06}}>⚠️</div>
              <div style={{fontSize:9,color:"#fb923c",letterSpacing:2,marginBottom:8,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>🔎 RECUERDA</div>
              <div style={{fontSize:14,color:"#fff",lineHeight:1.8,fontStyle:"italic",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>"El que reparte dinero en campaña, luego recupera todo cuando llega al poder."</div>
            </div>
          </div>
          <div style={{background:"#f0f7ff",border:"1.5px solid #bfdbfe",borderRadius:12,padding:"12px",marginBottom:14}}>
            <div style={{fontSize:9,color:"#1d4ed8",letterSpacing:2,marginBottom:8,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>🎯 PREGÚNTALE ESTO AL CANDIDATO</div>
            <div style={{background:"#fff",borderRadius:10,padding:"10px",border:"1px solid #e5e7eb",marginBottom:8}}>
              <div style={{fontSize:9,color:"#1a6fd4",letterSpacing:1.5,marginBottom:4,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>{CANDIDATE_QUESTIONS[qIdx].cat} {CANDIDATE_QUESTIONS[qIdx].emoji}</div>
              <div style={{fontSize:12,color:"#1a1a1a",fontWeight:700,lineHeight:1.5}}>"{CANDIDATE_QUESTIONS[qIdx].q}"</div>
            </div>
            <div style={{display:"flex",gap:6,justifyContent:"center"}}>
              <button onClick={()=>setQIdx(i=>Math.max(0,i-1))} disabled={qIdx===0} style={{background:qIdx===0?"#f3f4f6":"#1d4ed8",border:"none",borderRadius:8,padding:"6px 12px",color:qIdx===0?"#9ca3af":"#fff",fontSize:12,fontWeight:800,cursor:qIdx===0?"default":"pointer"}}>←</button>
              <span style={{fontSize:10,color:"#6b7280",alignSelf:"center"}}>{qIdx+1}/{CANDIDATE_QUESTIONS.length}</span>
              <button onClick={()=>setQIdx(i=>Math.min(CANDIDATE_QUESTIONS.length-1,i+1))} disabled={qIdx===CANDIDATE_QUESTIONS.length-1} style={{background:qIdx===CANDIDATE_QUESTIONS.length-1?"#f3f4f6":"#1d4ed8",border:"none",borderRadius:8,padding:"6px 12px",color:qIdx===CANDIDATE_QUESTIONS.length-1?"#9ca3af":"#fff",fontSize:12,fontWeight:800,cursor:qIdx===CANDIDATE_QUESTIONS.length-1?"default":"pointer"}}>→</button>
            </div>
          </div>
          <motion.button whileTap={{scale:0.96}} onClick={()=>{playSound("click");onClose();}}
            style={{width:"100%",background:"linear-gradient(135deg,#e01010,#8a0000)",border:"none",borderRadius:10,padding:"13px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2}}>
            ENTENDIDO — VOY A VOTAR INFORMADO
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── ONBOARDING ──
function OnboardingModal({onSkip}){
  const[loading,setLoading]=useState(null);
  const loginWith=async(provider)=>{
    setLoading(provider);
    try{
      await supabase.auth.signInWithOAuth({provider,options:{redirectTo:"https://www.silao360.com.mx"}});
    }catch(e){setLoading(null);}
  };
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{position:"fixed",inset:0,zIndex:500,background:"linear-gradient(160deg,#0f172a,#1e1b4b,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <button onClick={onSkip} style={{position:"fixed",top:16,right:16,zIndex:600,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"8px 16px",color:"rgba(255,255,255,0.5)",fontSize:13,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>SALTAR →</button>
      <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} transition={{type:"spring",stiffness:260,damping:20}}
        style={{background:"rgba(255,255,255,0.04)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:24,padding:"28px 22px",maxWidth:360,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:50,marginBottom:10}}>🗳️</div>
          <div style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>SILAO 360</div>
          <div style={{fontSize:14,color:"rgba(255,255,255,0.5)",marginTop:6,fontFamily:"Barlow Condensed,sans-serif"}}>Encuesta ciudadana de Silao, Gto.</div>
        </div>
        <motion.button whileTap={{scale:0.96}} onClick={()=>loginWith("google")} disabled={!!loading}
          style={{width:"100%",background:"#fff",border:"2px solid #e5e7eb",borderRadius:14,padding:"14px",color:"#374151",fontSize:15,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:loading?"0.7":"1"}}>
          {loading==="google"?<div style={{width:22,height:22,border:"3px solid #e0e0e0",borderTopColor:"#4285f4",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>:<span style={{fontSize:20}}>🔵</span>}
          {loading==="google"?"Abriendo Google...":"ENTRAR CON GOOGLE"}
        </motion.button>
        <motion.button whileTap={{scale:0.96}} onClick={()=>loginWith("facebook")} disabled={!!loading}
          style={{width:"100%",background:"#1877f2",border:"none",borderRadius:14,padding:"14px",color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:loading?"0.7":"1"}}>
          {loading==="facebook"?<div style={{width:22,height:22,border:"3px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>:<span style={{fontFamily:"Georgia,serif",fontWeight:900,fontSize:20}}>f</span>}
          {loading==="facebook"?"Abriendo Facebook...":"ENTRAR CON FACEBOOK"}
        </motion.button>
        <motion.button whileTap={{scale:0.95}} onClick={onSkip}
          style={{width:"100%",background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"12px",cursor:"pointer",color:"rgba(255,255,255,0.4)",fontSize:13,fontWeight:700,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
          👁️ SOLO VER SIN VOTAR
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
// ── LOGIN MODAL ──
function LoginModal({onClose}){
  const[loading,setLoading]=useState(null);
  const loginWith=async(provider)=>{
    setLoading(provider);
    try{
      await supabase.auth.signInWithOAuth({provider,options:{redirectTo:"https://www.silao360.com.mx"}});
    }catch(e){setLoading(null);}
  };
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} style={{background:"#fff",borderRadius:20,padding:"28px 22px",maxWidth:340,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:8}}>🔐</div>
          <div style={{fontSize:18,fontWeight:900,color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif"}}>ENTRA PARA PARTICIPAR</div>
          <div style={{fontSize:12,color:"#6b7280",marginTop:6}}>Necesitas cuenta para votar y comentar</div>
        </div>
        <motion.button whileTap={{scale:0.96}} onClick={()=>loginWith("google")} disabled={!!loading}
          style={{width:"100%",background:"#fff",border:"2px solid #e5e7eb",borderRadius:12,padding:"14px",color:"#374151",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:loading?"0.7":"1"}}>
          {loading==="google"?<div style={{width:22,height:22,border:"3px solid #e0e0e0",borderTopColor:"#4285f4",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>:<span style={{fontSize:18}}>🔵</span>}
          {loading==="google"?"Cargando...":"ENTRAR CON GOOGLE"}
        </motion.button>
        <motion.button whileTap={{scale:0.96}} onClick={()=>loginWith("facebook")} disabled={!!loading}
          style={{width:"100%",background:"#1877f2",border:"none",borderRadius:12,padding:"14px",color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:loading?"0.7":"1"}}>
          {loading==="facebook"?<div style={{width:22,height:22,border:"3px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite"}}/>:<span style={{fontFamily:"Georgia,serif",fontWeight:900,fontSize:18}}>f</span>}
          {loading==="facebook"?"Cargando...":"ENTRAR CON FACEBOOK"}
        </motion.button>
        <button onClick={onClose} style={{width:"100%",background:"transparent",border:"none",color:"#9ca3af",fontSize:13,cursor:"pointer",padding:"8px",fontFamily:"Barlow Condensed,sans-serif"}}>CANCELAR</button>
      </motion.div>
    </motion.div>
  );
}

// ── HEADER ──
function Header({total,user,onLoginClick,onLogout,onLogoClick,siteLogo}){
  return(
    <div style={{position:"sticky",top:0,zIndex:20,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(14px)",borderBottom:"2px solid #e01010",padding:"8px 14px"}}>
      <div style={{maxWidth:580,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <motion.button whileTap={{scale:0.9}} onClick={onLogoClick} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:42,height:42,borderRadius:10,overflow:"hidden",border:"2px solid rgba(224,16,16,0.4)",boxShadow:"0 0 14px rgba(224,16,16,0.4)",animation:"logoPulse 2s ease-in-out infinite"}}>
                {siteLogo ? <img src={siteLogo} alt="Silao360" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🗳️</div>}
              </div>
              <div style={{lineHeight:1}}>
                <div style={{fontSize:20,fontWeight:900,color:"#e01010",letterSpacing:3,lineHeight:1,fontFamily:"Barlow Condensed,sans-serif"}}>SILAO</div>
                <div style={{fontSize:11,fontWeight:900,color:"#ff4444",letterSpacing:5,lineHeight:1,marginTop:1,fontFamily:"Barlow Condensed,sans-serif",animation:"glow360 2s ease-in-out infinite"}}>360</div>
              </div>
            </div>
          </motion.button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          {user?(
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{display:"flex",alignItems:"center",gap:5,background:"#eff6ff",border:"1.5px solid #3b82f6",borderRadius:30,padding:"5px 12px 5px 6px",flexShrink:0,maxWidth:130}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"#1877f2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>🎭</div>
                <span style={{fontSize:11,fontWeight:700,color:"#1d4ed8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.nickname||user.email?.split("@")[0]}</span>
              </div>
              <motion.button whileTap={{scale:0.94}} onClick={onLogout}
                style={{background:"#fee2e2",border:"1.5px solid #fca5a5",borderRadius:8,padding:"6px 10px",color:"#dc2626",fontSize:11,fontWeight:700,cursor:"pointer",letterSpacing:1,flexShrink:0,fontFamily:"Barlow Condensed,sans-serif"}}>
                SALIR
              </motion.button>
            </div>
          ):(
            <motion.button whileTap={{scale:0.94}} onClick={()=>{playSound("click");onLoginClick();}}
              style={{background:"#1877f2",border:"none",borderRadius:8,padding:"7px 12px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:1,flexShrink:0,fontFamily:"Barlow Condensed,sans-serif"}}>
              ENTRAR
            </motion.button>
          )}
          <div style={{background:"#fff0f0",border:"2px solid #e01010",borderRadius:10,padding:"4px 9px",textAlign:"center",flexShrink:0}}>
            <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:1}}><div style={{width:4,height:4,borderRadius:"50%",background:"#e01010",animation:"pd 1.8s infinite"}}/><span style={{fontSize:8,color:"#e01010",letterSpacing:1.5,fontWeight:700}}>EN VIVO</span></div>
            <div style={{fontSize:20,fontWeight:900,color:"#e01010",lineHeight:1,letterSpacing:-1,fontFamily:"Barlow Condensed,sans-serif"}}><LiveCount value={total}/></div>
            <div style={{fontSize:8,color:"#6b7280",letterSpacing:1.5,fontFamily:"Barlow Condensed,sans-serif"}}>VOTOS</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NAVBAR ──
function NavBar({screen,setScreen}){
  const tabs=[
    {id:"results",  label:"INICIO",   led:"#e01010", icon:"📊"},
    {id:"vote",     label:"VOTAR",    led:"#b91c1c", icon:"🗳️"},
    {id:"proposals",label:"IDEAS",    led:"#7c3aed", icon:"💡"},
    {id:"articles", label:"PARTIDOS", led:"#1d4ed8", icon:"📰"},
    {id:"comments", label:"FORO",     led:"#0891b2", icon:"💬"},
    {id:"perfil",   label:"PERFIL",   led:"#ca8a04", icon:"👤"},
  ];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50}}>
      <div style={{height:3,background:"linear-gradient(90deg,#e01010,#b91c1c,#7c3aed,#1d4ed8,#0891b2,#ca8a04)"}}/>
      <div style={{background:"rgba(5,5,15,0.98)",backdropFilter:"blur(20px)",display:"flex",maxWidth:640,margin:"0 auto",padding:"5px 3px calc(5px + env(safe-area-inset-bottom,0px)) 3px",gap:3}}>
        {tabs.map(t=>{
          const active=screen===t.id;
          return(
            <motion.button key={t.id} whileTap={{scale:0.88,y:2}} onClick={()=>{playSound("click");setScreen(t.id);}}
              style={{flex:1,background:"transparent",border:"none",padding:0,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:0}}>
              {/* LED BORDER BUTTON — efecto conic-gradient como trivia */}
              <div style={{
                position:"relative",
                width:"100%",
                borderRadius:11,
                overflow:"hidden",
                background:"rgba(10,10,22,0.95)",
                padding:"7px 2px 6px",
              }}>
                {/* Conic LED spinning border */}
                <div style={{
                  position:"absolute",
                  width:"200%",height:"200%",
                  top:"-50%",left:"-50%",
                  background:`conic-gradient(from 0deg, ${t.led} 0deg, transparent ${active?50:30}deg, transparent ${active?160:180}deg, ${t.led} ${active?200:210}deg, transparent ${active?240:250}deg)`,
                  animation:`spinLedBorder ${active?"1.4s":"3s"} linear infinite`,
                  opacity:active?1:0.55,
                  pointerEvents:"none",
                  filter:active?`brightness(1.5) drop-shadow(0 0 4px ${t.led})`:"none",
                }}/>
                {/* Inner mask */}
                <div style={{
                  position:"absolute",
                  inset:2,
                  background:"rgba(5,5,15,0.97)",
                  borderRadius:9,
                  pointerEvents:"none",
                }}/>
                {/* Content */}
                <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                  <span style={{fontSize:18,lineHeight:1}}>{t.icon}</span>
                  <span style={{
                    fontSize:9,
                    fontWeight:900,
                    letterSpacing:1,
                    fontFamily:"Barlow Condensed,sans-serif",
                    color:active?"#fff":"rgba(255,255,255,0.38)",
                    textShadow:active?`0 0 10px ${t.led},0 0 18px ${t.led}`:"none",
                    lineHeight:1,
                  }}>{t.label}</span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── STATISTICS SECTION ──
function StatisticsSection({votes,total}:{votes:Record<string,number>,total:number}){
  const[active,setActive]=useState<string|null>(null);

  // ── Tendencia: guarda snapshot cada carga ──
  const getTrend=()=>{
    try{
      const KEY="silao360_trend";
      const now=Date.now();
      let snaps:Array<{ts:number,votes:Record<string,number>}>=JSON.parse(localStorage.getItem(KEY)||"[]");
      // guardar snapshot actual
      snaps.push({ts:now,votes:{...votes}});
      // conservar solo ultimos 50
      if(snaps.length>50)snaps=snaps.slice(-50);
      localStorage.setItem(KEY,JSON.stringify(snaps));
      // comparar con snapshot de hace >30 min
      const old=snaps.find(s=>now-s.ts>30*60*1000);
      if(!old||total===0)return null;
      const oldTotal=Object.values(old.votes).reduce((a,b)=>a+b,0);
      const results:Record<string,{dir:string,delta:number}>={}; 
      PARTIES.forEach(p=>{
        const curPct=total>0?(votes[p.id]||0)/total*100:0;
        const oldPct=oldTotal>0?(old.votes[p.id]||0)/oldTotal*100:0;
        const delta=+(curPct-oldPct).toFixed(2);
        results[p.id]={dir:delta>0.5?"↑":delta<-0.5?"↓":"→",delta};
      });
      return results;
    }catch(e){return null;}
  };

  const trend=getTrend();
  const vv=PARTIES.map(p=>votes[p.id]||0);
  const leader=PARTIES.reduce((a,b)=>(votes[b.id]||0)>(votes[a.id]||0)?b:a);
  const sortedVV=[...vv].sort((a,b)=>a-b);
  const mean=total>0?total/PARTIES.length:0;
  const median=sortedVV.length%2===0
    ?(sortedVV[sortedVV.length/2-1]+sortedVV[sortedVV.length/2])/2
    :sortedVV[Math.floor(sortedVV.length/2)];
  const modeParty=[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0))[0];
  const variance=vv.reduce((a,v)=>a+Math.pow(v-mean,2),0)/vv.length;
  const stdDev=Math.sqrt(variance);
  const leaderPct=total>0?(votes[leader.id]||0)/total:0;
  const me=total>1?1.96*Math.sqrt(leaderPct*(1-leaderPct)/total)*100:0;
  const ci_lo=Math.max(0,leaderPct*100-me);
  const ci_hi=Math.min(100,leaderPct*100+me);

  const STATS=[
    {
      id:"pct",sym:"%",label:"PORCENTAJE",color:"#1d4ed8",
      valor:`${leaderPct===0?"—":(leaderPct*100).toFixed(1)+"%"}`,
      subtitulo:`Líder: ${leader.short}`,
      explicacion:"El porcentaje muestra qué fracción del total de votos tiene cada partido. Se calcula dividiendo los votos del partido entre el total y multiplicando por 100. El partido líder aparece destacado.",
      detalle:PARTIES.filter(p=>(votes[p.id]||0)>0).sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0)).map(p=>`${p.short}: ${total>0?((votes[p.id]||0)/total*100).toFixed(1):0}%`).join(" · "),
    },
    {
      id:"mean",sym:"x̄",label:"PROMEDIO",color:"#7c3aed",
      valor:mean===0?"—":mean.toFixed(1),
      subtitulo:"votos por partido",
      explicacion:"El promedio (media aritmética) se obtiene dividiendo el total de votos entre el número de partidos. Sirve para saber cuántos votos en promedio tiene cada opción.",
      detalle:`${total} votos ÷ ${PARTIES.length} partidos = ${mean.toFixed(2)} votos/partido`,
    },
    {
      id:"median",sym:"Md",label:"MEDIANA",color:"#0891b2",
      valor:median===0?"—":median.toFixed(0),
      subtitulo:"votos (valor central)",
      explicacion:"La mediana es el valor que divide al conjunto ordenado en dos mitades iguales. A diferencia del promedio, no se ve afectada por partidos con muchos o muy pocos votos extremos.",
      detalle:`Valores ordenados: ${sortedVV.join(", ")} → mediana = ${median}`,
    },
    {
      id:"moda",sym:"Mo",label:"MODA",color:"#b91c1c",
      valor:total===0?"—":modeParty.short,
      subtitulo:"partido más votado",
      explicacion:"La moda es el valor que más se repite. En esta encuesta, es el partido con más votos — el que más ciudadanos eligieron hasta ahora.",
      detalle:`${modeParty.short}: ${votes[modeParty.id]||0} votos (${leaderPct===0?"0":( leaderPct*100).toFixed(1)}%)`,
    },
    {
      id:"std",sym:"σ",label:"DESV. ESTÁNDAR",color:"#ca8a04",
      valor:stdDev===0?"—":stdDev.toFixed(1),
      subtitulo:"dispersión entre partidos",
      explicacion:"La desviación estándar mide qué tan dispersos están los votos entre todos los partidos. Un σ alto significa que hay un partido muy dominante y el resto muy rezagado. Un σ bajo indica competencia más pareja.",
      detalle:`σ = ${stdDev.toFixed(2)} votos. Media = ${mean.toFixed(1)}. Rango: ${Math.min(...vv)}–${Math.max(...vv)} votos`,
    },
    {
      id:"me",sym:"±",label:"MARGEN DE ERROR",color:"#059669",
      valor:total<10?"n insuf.":me===0?"—":`±${me.toFixed(2)}%`,
      subtitulo:"del partido líder",
      explicacion:"El margen de error (±ME) indica el rango dentro del cual podría estar el resultado real si se encuestara a toda la población. Se usa un nivel de confianza del 95% (z=1.96). Requiere al menos 10 votos para ser significativo.",
      detalle:total<10?`Necesitas al menos 10 votos (n=${total})`:`ME = ±1.96 × √(${leaderPct.toFixed(3)}×${(1-leaderPct).toFixed(3)}/${total}) = ±${me.toFixed(2)}%`,
    },
    {
      id:"ic",sym:"IC",label:"INTERVALO DE CONFIANZA",color:"#6d28d9",
      valor:total<10?"n insuf.":`${ci_lo.toFixed(1)}% – ${ci_hi.toFixed(1)}%`,
      subtitulo:"95% para el líder",
      explicacion:"El intervalo de confianza al 95% dice: 'si repitiéramos esta encuesta 100 veces, en 95 de ellas el porcentaje real del líder caería dentro de este rango'. Un intervalo más amplio significa menos certeza.",
      detalle:`${leader.short}: IC 95% = [${ci_lo.toFixed(2)}%, ${ci_hi.toFixed(2)}%] con n=${total}`,
    },
    {
      id:"n",sym:"n",label:"TAMAÑO DE MUESTRA",color:"#0e7490",
      valor:total.toString(),
      subtitulo:"votos registrados",
      explicacion:"El tamaño de muestra (n) es el número total de personas que han votado. Más votos = más confiabilidad estadística. Con n<30 los resultados son muy preliminares. Con n>100 empiezan a ser representativos.",
      detalle:total<30?`⚠️ n=${total} — muestra muy pequeña, resultados preliminares`:total<100?`ℹ️ n=${total} — muestra en crecimiento`:`✅ n=${total} — muestra estadísticamente relevante`,
    },
    {
      id:"delta",sym:"Δ",label:"VARIACIÓN",color:"#dc2626",
      valor:trend?Object.values(trend).reduce((a,b)=>a+(b.delta>0?1:b.delta<0?-1:0),0)>0?"↑ Subiendo":"↓ Bajando":"Sin datos prev.",
      subtitulo:"vs. hace 30 min",
      explicacion:"Δ (delta) mide el cambio en los porcentajes respecto a una medición anterior. Si el líder sube 2 puntos, Δ=+2%. Esta app guarda snapshots cada vez que abres la pantalla de resultados para calcular el cambio.",
      detalle:trend?PARTIES.filter(p=>(votes[p.id]||0)>0).map(p=>`${p.short} ${trend[p.id]?.dir||"→"} ${trend[p.id]?.delta!==0?`(${trend[p.id]?.delta>0?"+":""}${trend[p.id]?.delta}%)`:"sin cambio"}`).join(" · "):"Abre la app en dos momentos distintos para ver el cambio.",
    },
    {
      id:"trend",sym:"↑↓",label:"TENDENCIA",color:"#16a34a",
      valor:trend?`${leader.short} ${trend[leader.id]?.dir||"→"}`:"Sin historial",
      subtitulo:"partido líder",
      explicacion:"La tendencia muestra si el partido líder está ganando o perdiendo apoyo con el tiempo. Se compara el porcentaje actual con mediciones anteriores guardadas localmente. '↑' sube, '↓' baja, '→' estable.",
      detalle:trend?PARTIES.filter(p=>(votes[p.id]||0)>0).sort((a,b)=>(trend[b.id]?.delta||0)-(trend[a.id]?.delta||0)).map(p=>`${p.short}: ${trend[p.id]?.dir||"→"}`).join(" · "):"Necesitas al menos dos sesiones en momentos distintos.",
    },
  ];

  const sel=STATS.find(s=>s.id===active);

  return(
    <div style={{marginBottom:16}}>
      {/* ── ENCABEZADO ── */}
      <div style={{fontSize:9,color:"#6b7280",letterSpacing:3,textAlign:"center",marginBottom:10,fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>◉ ESTADÍSTICAS ELECTORALES</div>

      {/* ── LOGOS 5× (scroll horizontal) ── */}
      <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:12,paddingBottom:4}}>
        <div style={{display:"flex",gap:10,width:"max-content",padding:"4px 2px"}}>
          {PARTIES.filter(p=>(votes[p.id]||0)>0).sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0)).map((p,i)=>{
            const cnt=votes[p.id]||0;
            const pc=total>0?cnt/total*100:0;
            const isTop=i===0;
            return(
              <motion.div key={p.id} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:96}}>
                {/* Logo grande — 5× del tamaño en lista (22px × 5 = 110px) */}
                <div style={{position:"relative",width:110,height:110,borderRadius:18,overflow:"hidden",
                  border:`3px solid ${isTop?"#f59e0b":p.color+"88"}`,
                  background:`${p.color}10`,
                  boxShadow:isTop?`0 0 18px ${p.color}66,0 4px 16px rgba(0,0,0,0.18)`:`0 2px 8px rgba(0,0,0,0.1)`,
                  flexShrink:0}}>
                  {PARTY_LOGOS[p.id]
                    ?<img src={PARTY_LOGOS[p.id]!} alt={p.short} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:46}}>{p.emoji}</div>}
                  {isTop&&<div style={{position:"absolute",top:4,right:4,fontSize:14}}>🏆</div>}
                  {/* barra de porcentaje abajo */}
                  <div style={{position:"absolute",bottom:0,left:0,right:0,height:5,background:"rgba(0,0,0,0.15)"}}>
                    <motion.div initial={{width:"0%"}} animate={{width:`${pc}%`}} transition={{duration:1.2,ease:"easeOut"}}
                      style={{height:"100%",background:isTop?"#f59e0b":p.color}}/>
                  </div>
                </div>
                <div style={{fontSize:9,fontWeight:900,color:isTop?"#d97706":p.color,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,textAlign:"center"}}>{p.short}</div>
                <div style={{fontSize:14,fontWeight:900,color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{pc.toFixed(1)}<span style={{fontSize:9}}>%</span></div>
                <div style={{fontSize:10,color:"#6b7280",fontFamily:"Barlow Condensed,sans-serif"}}>{cnt} votos</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── BOTONES DE ESTADÍSTICAS ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:active?10:0}}>
        {STATS.map(s=>{
          const isAct=active===s.id;
          return(
            <motion.button key={s.id} whileTap={{scale:0.93}}
              onClick={()=>{playSound("click");setActive(isAct?null:s.id);}}
              style={{background:isAct?s.color:"#fff",border:`1.5px solid ${isAct?s.color:s.color+"44"}`,
                borderRadius:12,padding:"10px 8px",cursor:"pointer",textAlign:"left",
                boxShadow:isAct?`0 4px 16px ${s.color}40`:"none",transition:"all .18s"}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}>
                <span style={{fontSize:16,fontWeight:900,color:isAct?"#fff":s.color,fontFamily:"Barlow Condensed,sans-serif",minWidth:20}}>{s.sym}</span>
                <span style={{fontSize:8,fontWeight:900,letterSpacing:1.5,color:isAct?"rgba(255,255,255,0.7)":"#6b7280",fontFamily:"Barlow Condensed,sans-serif"}}>{s.label}</span>
              </div>
              <div style={{fontSize:15,fontWeight:900,color:isAct?"#fff":s.color,fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{s.valor}</div>
              <div style={{fontSize:8,color:isAct?"rgba(255,255,255,0.6)":"#9ca3af",fontFamily:"Barlow Condensed,sans-serif",marginTop:1}}>{s.subtitulo}</div>
            </motion.button>
          );
        })}
      </div>

      {/* ── PANEL DETALLE DEL STAT SELECCIONADO ── */}
      <AnimatePresence>
        {sel&&(
          <motion.div key={sel.id}
            initial={{opacity:0,y:-8,height:0}} animate={{opacity:1,y:0,height:"auto"}} exit={{opacity:0,y:-8,height:0}}
            transition={{duration:0.22}}
            style={{background:`linear-gradient(135deg,${sel.color}18,${sel.color}08)`,
              border:`1.5px solid ${sel.color}44`,borderRadius:14,padding:"14px",overflow:"hidden"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:10,background:sel.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",flexShrink:0}}>{sel.sym}</div>
              <div>
                <div style={{fontSize:13,fontWeight:900,color:sel.color,letterSpacing:1.5,fontFamily:"Barlow Condensed,sans-serif"}}>{sel.label}</div>
                <div style={{fontSize:18,fontWeight:900,color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{sel.valor}</div>
              </div>
            </div>
            <div style={{fontSize:12,color:"#374151",lineHeight:1.7,marginBottom:10}}>{sel.explicacion}</div>
            <div style={{background:"rgba(255,255,255,0.7)",borderRadius:10,padding:"10px",fontSize:10,color:"#4b5563",lineHeight:1.6,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,letterSpacing:0.5}}>
              <span style={{color:sel.color,fontWeight:900}}>DATOS REALES → </span>{sel.detalle}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── RESULTS SCREEN ──
function ResultsScreen({votes,total,myVote,setScreen,user,onLoginClick,onLogout,onLogoClick,siteLogo}){
  const[bars,setBars]=useState(false);const[showMoney,setShowMoney]=useState(false);
  const[visits,setVisits]=useState({total:0,today:0,week:0});
  useEffect(()=>{setTimeout(()=>setBars(true),300);},[]);
  useEffect(()=>{
    try{
      const now=Date.now();
      const todayKey=new Date().toISOString().slice(0,10);
      const weekAgo=now-7*24*60*60*1000;
      let data=JSON.parse(localStorage.getItem("silao360_visits")||'{"total":0,"days":{}}');
      data.total=(data.total||0)+1;
      data.days=data.days||{};
      data.days[todayKey]=(data.days[todayKey]||0)+1;
      // Clean old days
      Object.keys(data.days).forEach(k=>{if(new Date(k).getTime()<weekAgo)delete data.days[k];});
      localStorage.setItem("silao360_visits",JSON.stringify(data));
      const todayCount=data.days[todayKey]||0;
      const weekCount=Object.values(data.days).reduce((a,b)=>a+b,0);
      setVisits({total:data.total,today:todayCount,week:weekCount});
    }catch(e){}
  },[]);
  const sorted=[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0));
  const pct=id=>total===0?0:(votes[id]||0)/total*100;
  const pieData=PARTIES.filter(p=>(votes[p.id]||0)>0).map(p=>({name:p.short,value:votes[p.id]||0,color:p.color}));
  const barData=sorted.filter(p=>(votes[p.id]||0)>0).map(p=>({name:p.short,votos:votes[p.id]||0,pct:pct(p.id).toFixed(1),color:p.color}));
  return(
    <div style={{paddingBottom:88,background:"#f8faff",minHeight:"100vh"}}>
      <AnimatePresence>{showMoney&&<MoneyModal onClose={()=>setShowMoney(false)}/>}</AnimatePresence>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogout={onLogout} onLogoClick={onLogoClick} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <div style={{padding:"10px 0",display:"flex",gap:8}}>
          <motion.button whileTap={{scale:0.96}} onClick={()=>{playSound("click");setScreen("vote");}}
            style={{flex:1,background:"linear-gradient(135deg,#e01010,#8a0000)",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:17,fontWeight:900,letterSpacing:3,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",boxShadow:"0 4px 20px rgba(220,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            <span>🗳️</span> VOTAR {myVote&&<span style={{fontSize:8,background:"rgba(255,255,255,0.2)",padding:"2px 6px",borderRadius:20}}>CAMBIAR</span>}
          </motion.button>
          <motion.button whileTap={{scale:0.96}} onClick={()=>{playSound("modal");setShowMoney(true);}}
            style={{background:"linear-gradient(135deg,#ca8a04,#854d0e)",border:"none",borderRadius:12,padding:"13px",color:"#fff",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:1,minWidth:55}}>
            <span style={{fontSize:20}}>💰</span><span style={{fontSize:7,fontWeight:800,whiteSpace:"nowrap",fontFamily:"Barlow Condensed,sans-serif"}}>NO TE VENDEN</span>
          </motion.button>
        </div>

        {/* COMPARTIR + CONTADOR VISITAS */}
        <div style={{display:"flex",gap:6,marginBottom:12,alignItems:"stretch"}}>
          <button onClick={()=>window.open("https://api.whatsapp.com/send?text="+encodeURIComponent("🗳️ ENCUESTA SILAO 360\n\nParticipa en silao360.com\n#Silao #Guanajuato"),"_blank")} style={{flex:1,background:"linear-gradient(135deg,#25d366,#128c4e)",border:"none",borderRadius:10,padding:"10px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>📱 WA</button>
          <button onClick={()=>window.open("https://www.facebook.com/share/1CCfvKYYK1/?mibextid=wwXIfr","_blank")} style={{flex:1,background:"linear-gradient(135deg,#1877f2,#0d5cc7)",border:"none",borderRadius:10,padding:"10px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:4,fontFamily:"Barlow Condensed,sans-serif"}}><span style={{fontFamily:"Georgia,serif",fontWeight:900,fontSize:13}}>f</span> FB</button>
          <button onClick={()=>window.open("https://silao360.com","_blank")} style={{flex:1,background:"linear-gradient(135deg,#e01010,#8a0000)",border:"none",borderRadius:10,padding:"10px",color:"#fff",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>🌐 WEB</button>
          {/* CONTADOR VISITAS */}
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
            style={{background:"linear-gradient(135deg,#0f172a,#1e1b4b)",border:"1.5px solid rgba(124,58,237,0.5)",borderRadius:10,padding:"7px 10px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minWidth:64,flexShrink:0}}>
            <div style={{fontSize:8,color:"#a78bfa",letterSpacing:1.5,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif",marginBottom:2}}>👁️ VISITAS</div>
            <div style={{fontSize:18,fontWeight:900,color:"#fff",lineHeight:1,fontFamily:"Barlow Condensed,sans-serif"}}>{visits.total>999?`${(visits.total/1000).toFixed(1)}k`:visits.total}</div>
            <div style={{display:"flex",gap:4,marginTop:3}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,fontWeight:900,color:"#34d399",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{visits.today}</div>
                <div style={{fontSize:6,color:"rgba(255,255,255,0.3)",letterSpacing:1,fontFamily:"Barlow Condensed,sans-serif"}}>HOY</div>
              </div>
              <div style={{width:1,background:"rgba(255,255,255,0.1)"}}/>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:9,fontWeight:900,color:"#60a5fa",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{visits.week}</div>
                <div style={{fontSize:6,color:"rgba(255,255,255,0.3)",letterSpacing:1,fontFamily:"Barlow Condensed,sans-serif"}}>7 DÍAS</div>
              </div>
            </div>
          </motion.div>
        </div>
        {total>0?(<>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px 12px",marginBottom:12}}>
            <div style={{fontSize:9,color:"#6b7280",letterSpacing:3,textAlign:"center",marginBottom:10,fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>◉ DISTRIBUCIÓN</div>
            <ResponsiveContainer width="100%" height={170}><PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={72} paddingAngle={2} dataKey="value" stroke="none">{pieData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie><Tooltip contentStyle={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,fontSize:11}} formatter={v=>[`${v} votos (${(v/total*100).toFixed(1)}%)`]}/></PieChart></ResponsiveContainer>
          </motion.div>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"14px 12px",marginBottom:12}}>
            <ResponsiveContainer width="100%" height={200}><BarChart data={barData} margin={{top:14,right:8,left:-20,bottom:40}}><XAxis dataKey="name" tick={{fill:"#6b7280",fontSize:8,fontFamily:"Barlow Condensed,sans-serif"}} angle={-38} textAnchor="end" interval={0} tickLine={false} axisLine={{stroke:"#e5e7eb"}}/><YAxis tick={{fill:"#9ca3af",fontSize:8}} tickLine={false} axisLine={false}/><Tooltip cursor={{fill:"rgba(0,0,0,0.03)"}} contentStyle={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:8,fontSize:11}} formatter={(v,n,p)=>[`${v} votos — ${p.payload.pct}%`]}/><Bar dataKey="votos" radius={[4,4,0,0]}>{barData.map((e,i)=><Cell key={i} fill={e.color}/>)}<LabelList dataKey="pct" position="top" style={{fill:"#374151",fontSize:8,fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}} formatter={v=>`${v}%`}/></Bar></BarChart></ResponsiveContainer>
          </motion.div>
        </>):(<motion.div initial={{opacity:0}} animate={{opacity:1}} style={{background:"#fff",border:"2px dashed #e5e7eb",borderRadius:14,padding:"28px 20px",textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:44,marginBottom:8}}>🗳️</div><div style={{fontSize:13,fontWeight:900,color:"#d1d5db",letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif",marginBottom:4}}>SIN VOTOS AÚN</div><div style={{fontSize:10,color:"#9ca3af"}}>Sé el primero en participar</div>
        </motion.div>)}
        {/* ── SECCIÓN ESTADÍSTICAS ── */}
        <StatisticsSection votes={votes} total={total}/>

        <div style={{fontSize:9,color:"#6b7280",letterSpacing:3,textAlign:"center",marginBottom:8,fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>▼ POSICIONES EN TIEMPO REAL</div>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:16}}>
          {sorted.map((p,rank)=>{const count=votes[p.id]||0,pc=pct(p.id),isMe=myVote===p.id,isTop=rank===0&&count>0;return(
            <motion.div key={p.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:rank*0.04}}
              style={{background:isMe?`${p.color}0a`:"#fff",border:`1.5px solid ${isMe?p.color+"50":"#e5e7eb"}`,borderRadius:10,padding:"8px 12px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:bars?`${pc}%`:"0%",background:`${p.color}07`,transition:"width 1.4s cubic-bezier(.16,1,.3,1)",pointerEvents:"none"}}/>
              <div style={{display:"flex",alignItems:"center",gap:7,position:"relative"}}>
                <div style={{width:18,height:18,borderRadius:"50%",background:isTop?"#fef3c7":`${p.color}18`,border:`1.5px solid ${isTop?"#f59e0b":`${p.color}40`}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:isTop?"#d97706":p.color,flexShrink:0}}>{rank+1}</div>
                <div style={{width:22,height:22,borderRadius:4,overflow:"hidden",flexShrink:0,background:`${p.color}12`,border:`1px solid ${p.color}30`}}>
                  {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.emoji}</span>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#1a1a1a",display:"flex",alignItems:"center",gap:4,flexWrap:"wrap",fontFamily:"Barlow Condensed,sans-serif"}}>
                    {p.short}{isMe&&<span style={{fontSize:7,color:"#1877f2",background:"#eff6ff",padding:"1px 5px",borderRadius:3,fontWeight:800}}>TU VOTO</span>}
                    {isTop&&count>0&&<span style={{fontSize:7,color:"#d97706",background:"#fef3c7",padding:"1px 5px",borderRadius:3,fontWeight:800}}>🏆</span>}
                  </div>
                  <div style={{height:3,background:"#f3f4f6",borderRadius:4,marginTop:3}}><div style={{height:"100%",borderRadius:4,width:bars?`${pc}%`:"0%",background:isTop?`linear-gradient(90deg,${p.color},#f59e0b)`:p.color,transition:"width 1.5s cubic-bezier(.16,1,.3,1)"}}/></div>
                </div>
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontSize:15,fontWeight:900,color:isTop&&count>0?"#d97706":p.color,lineHeight:1,fontFamily:"Barlow Condensed,sans-serif"}}>{pc.toFixed(1)}%</div>
                  <div style={{fontSize:11,fontWeight:800,color:p.color,fontFamily:"Barlow Condensed,sans-serif"}}><LiveCount value={count}/></div>
                </div>
              </div>
            </motion.div>
          );})}
        </div>
      </div>
    </div>
  );
}

// ── SUPABASE CONFIG (agregar credenciales aquí) ──
// const SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
// const SUPABASE_ANON_KEY = "eyJ...tu-anon-key...";

// ── BANNER INSTALAR APP ──
function InstallBanner(){
  const[show,setShow]=useState(false);
  const[deferredPrompt,setDeferredPrompt]=useState(null);
  const[isIOS,setIsIOS]=useState(false);
  useEffect(()=>{
    try{if(localStorage.getItem("silao360_install_dismissed"))return;}catch(e){}
    const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone=window.matchMedia("(display-mode: standalone)").matches;
    setIsIOS(ios);
    if(isStandalone)return;
    const handler=(e)=>{e.preventDefault();setDeferredPrompt(e);setShow(true);};
    window.addEventListener("beforeinstallprompt",handler);
    if(ios){setTimeout(()=>setShow(true),4000);}
    return()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);
  const install=async()=>{
    if(deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;}
    dismiss();
  };
  const dismiss=()=>{setShow(false);try{localStorage.setItem("silao360_install_dismissed","1");}catch(e){}};
  if(!show)return null;
  return(
    <motion.div initial={{y:120,opacity:0}} animate={{y:0,opacity:1}} exit={{y:120,opacity:0}}
      style={{position:"fixed",bottom:76,left:0,right:0,zIndex:200,padding:"0 12px",maxWidth:580,margin:"0 auto"}}>
      <div style={{background:"linear-gradient(135deg,#1a0a2e,#2d1b69)",border:"2px solid #7c3aed",borderRadius:18,padding:"16px",boxShadow:"0 8px 32px rgba(124,58,237,0.5)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:isIOS?12:0}}>
          <div style={{width:48,height:48,borderRadius:12,overflow:"hidden",flexShrink:0,border:"2px solid #7c3aed"}}>
            <img src={LOGO_SILAO360} alt="Silao360" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:15,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif"}}>📲 Instala Silao 360</div>
            <div style={{fontSize:11,color:"rgba(196,181,253,0.8)",fontFamily:"Barlow Condensed,sans-serif"}}>Acceso directo desde tu celular, gratis</div>
          </div>
          {!isIOS&&<motion.button whileTap={{scale:0.95}} onClick={install}
            style={{background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:10,padding:"10px 16px",color:"#fff",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",flexShrink:0}}>
            INSTALAR
          </motion.button>}
        </div>
        {isIOS&&<div style={{background:"rgba(255,255,255,0.06)",borderRadius:12,padding:"12px"}}>
          <div style={{fontSize:11,color:"#c4b5fd",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}>📱 PASOS PARA INSTALAR EN iPHONE:</div>
          {[
            {n:1,txt:"Toca el botón Compartir (cuadro con flecha ↑) en Safari"},
            {n:2,txt:"Baja y toca 'Agregar a pantalla de inicio'"},
            {n:3,txt:"Toca 'Agregar' arriba a la derecha"},
          ].map(s=>(
            <div key={s.n} style={{display:"flex",gap:8,alignItems:"flex-start",marginBottom:6}}>
              <div style={{width:22,height:22,borderRadius:"50%",background:"#7c3aed",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff",flexShrink:0}}>{s.n}</div>
              <div style={{fontSize:12,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1.4}}>{s.txt}</div>
            </div>
          ))}
        </div>}
        <button onClick={dismiss} style={{width:"100%",background:"transparent",border:"none",marginTop:10,color:"rgba(196,181,253,0.4)",fontSize:11,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>Ahora no →</button>
      </div>
    </motion.div>
  );
}
function VoteScreen({votes,total,myVote,onVote,user,onLoginClick,onLogoClick,siteLogo,candidates,setScreen}){
  const[justVoted,setJustVoted]=useState(null);
  const[showMoney,setShowMoney]=useState(false);
  const[showBallots,setShowBallots]=useState(false);
  const[showConfirmExit,setShowConfirmExit]=useState(null);
  const[showChangeVote,setShowChangeVote]=useState(false);
  const[myVoteForced,setMyVoteForced]=useState(false);
  const[ledParty,setLedParty]=useState(myVote);

  // Boletas que caen al votar
  const BALLOT_MSGS=["NO VENDAS TU VOTO","TU VOTO ES LIBRE","VOTO SECRETO","SILAO DECIDE","NO TE COMPRAN","TÚ ELIGES"];
  const ballots=Array.from({length:16},(_,i)=>({x:`${4+(i*5.8)%92}%`,delay:`${i*0.22}s`,dur:`${5+i%3*1}s`,msg:BALLOT_MSGS[i%BALLOT_MSGS.length]}));

  const doVote=(id)=>{
    if(!user){playSound("click");onLoginClick();return;}
    playSound("vote");
    onVote(id);
    setJustVoted(id);
    setLedParty(id);
    setShowBallots(true);
    setMyVoteForced(false);
    try{localStorage.setItem("silao360_mivoto",id);}catch(e){}
    setTimeout(()=>setShowBallots(false),3500);
  };

  const handleNavAway=(targetScreen)=>{
    if(myVote){setShowConfirmExit(targetScreen);}
    else{setScreen(targetScreen);}
  };

  const p=ledParty?PARTIES.find(x=>x.id===ledParty):null;

  return(
    <div style={{paddingBottom:88,background:p?`linear-gradient(160deg,${p.color}08,#f8faff,${p.color}05)`:"#f8faff",minHeight:"100vh",position:"relative",overflow:"hidden"}}>
      <AnimatePresence>{showMoney&&<MoneyModal onClose={()=>setShowMoney(false)}/>}</AnimatePresence>

      {/* BOLETAS CAYENDO */}
      <AnimatePresence>{showBallots&&ballots.map((b,i)=>(
        <motion.div key={i} initial={{y:-120,x:b.x,rotate:-10,opacity:1}} animate={{y:"105vh",rotate:20}} exit={{opacity:0}}
          transition={{duration:parseFloat(b.dur),delay:parseFloat(b.delay),ease:"linear"}}
          style={{position:"fixed",top:0,left:b.x,zIndex:300,pointerEvents:"none"}}>
          <div style={{background:"#fff",border:`2px solid ${p?.color||"#e01010"}`,borderRadius:10,padding:"6px 9px",textAlign:"center",fontSize:8,fontWeight:900,color:p?.color||"#e01010",lineHeight:1.3,width:70,boxShadow:`0 4px 12px ${p?.color||"#e01010"}40`}}>
            <div style={{color:"#6b7280",fontSize:6,marginBottom:2}}>SILAO {new Date().getFullYear()}</div>
            {b.msg}
          </div>
        </motion.div>
      ))}</AnimatePresence>

      {/* MODAL CONFIRMAR SALIDA */}
      <AnimatePresence>{showConfirmExit&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{position:"fixed",inset:0,zIndex:500,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <motion.div initial={{scale:0.85,y:20}} animate={{scale:1,y:0}}
            style={{background:"#fff",borderRadius:20,padding:"24px 20px",maxWidth:320,width:"100%",textAlign:"center"}}>
            <div style={{fontSize:40,marginBottom:10}}>🗳️</div>
            <div style={{fontSize:16,fontWeight:900,color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif",marginBottom:6}}>¿ESTÁS SALIENDO DE LA VOTACIÓN?</div>
            <div style={{fontSize:12,color:"#6b7280",marginBottom:6}}>Tu voto está confirmado por:</div>
            {myVote&&(()=>{const vp=PARTIES.find(x=>x.id===myVote);return(
              <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,background:`${vp?.color}10`,border:`2px solid ${vp?.color}30`,borderRadius:12,padding:"10px 14px",marginBottom:16}}>
                <div style={{width:40,height:40,borderRadius:8,overflow:"hidden",border:`2px solid ${vp?.color}`}}>
                  {PARTY_LOGOS[myVote]?<img src={PARTY_LOGOS[myVote]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:22}}>{vp?.emoji}</span>}
                </div>
                <div style={{fontSize:16,fontWeight:900,color:vp?.color,fontFamily:"Barlow Condensed,sans-serif"}}>{vp?.short}</div>
              </div>
            );})()} 
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowConfirmExit(null)} style={{flex:1,background:"#f3f4f6",border:"none",borderRadius:10,padding:"11px",color:"#374151",fontSize:12,fontWeight:700,cursor:"pointer"}}>QUEDARME</button>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{setShowConfirmExit(null);setScreen(showConfirmExit);}}
                style={{flex:1,background:"linear-gradient(135deg,#e01010,#8a0000)",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>CONFIRMAR ✓</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} siteLogo={siteLogo}/>

      {/* LED border top si ya votó */}
      {ledParty&&p&&<div style={{height:4,background:`conic-gradient(${p.color},#fff,${p.color}88,#fff,${p.color})`,animation:"ledSpin 2s linear infinite",backgroundSize:"200% 100%"}}/>}

      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <div style={{padding:"12px 2px 10px",borderBottom:"1.5px solid #e5e7eb",marginBottom:10}}>
          <div style={{fontSize:8,color:"#9ca3af",letterSpacing:3,marginBottom:2,fontFamily:"Barlow Condensed,sans-serif"}}>SILAO, GTO. · {new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"}).toUpperCase()}</div>
          <div style={{fontSize:17,fontWeight:900,color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif"}}>¿A quién votarías para <span style={{color:"#e01010"}}>Presidente Municipal?</span></div>
        </div>

        {/* Mi voto actual banner */}
        {myVote&&p&&(
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}}
            style={{background:`linear-gradient(135deg,${p.color}15,${p.color}08)`,border:`2px solid ${p.color}`,borderRadius:12,padding:"10px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:10,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:`conic-gradient(from 0deg,${p.color}20,transparent,${p.color}10,transparent)`,animation:"ledSpin 3s linear infinite"}}/>
            <div style={{width:36,height:36,borderRadius:8,overflow:"hidden",border:`2px solid ${p.color}`,flexShrink:0,position:"relative",zIndex:1}}>
              {PARTY_LOGOS[myVote]?<img src={PARTY_LOGOS[myVote]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:20}}>{p.emoji}</span>}
            </div>
            <div style={{flex:1,position:"relative",zIndex:1}}>
              <div style={{fontSize:8,color:p.color,letterSpacing:2,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>TU VOTO ACTUAL</div>
              <div style={{fontSize:15,fontWeight:900,color:p.color,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short} ✓</div>
            </div>
            <div style={{fontSize:9,color:p.color,fontWeight:700,fontFamily:"Barlow Condensed,sans-serif",position:"relative",zIndex:1}}>CAMBIAR →</div>
          </motion.div>
        )}

        <motion.button whileTap={{scale:0.97}} onClick={()=>{playSound("modal");setShowMoney(true);}}
          style={{width:"100%",background:"linear-gradient(135deg,#fef3c7,#fde68a)",border:"2px solid #f59e0b",borderRadius:12,padding:"10px 12px",cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
          <div style={{fontSize:22}}>💰</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:900,color:"#92400e",letterSpacing:1,fontFamily:"Barlow Condensed,sans-serif"}}>TÚ DECIDES — NO TE COMPRAN</div><div style={{fontSize:9,color:"#b45309",marginTop:1}}>Preguntas para analizar a tu candidato 👆</div></div>
        </motion.button>

        {!user&&<motion.button whileTap={{scale:0.97}} onClick={()=>{playSound("click");onLoginClick();}}
          style={{width:"100%",background:"#e01010",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:10,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
          🔐 ENTRA PARA VOTAR
        </motion.button>}

        <AnimatePresence>{justVoted&&(
          <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            style={{background:"#f0fdf4",border:"1.5px solid #86efac",borderRadius:10,padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:22}}>✅</span>
            <div style={{fontSize:13,fontWeight:700,color:"#16a34a",fontFamily:"Barlow Condensed,sans-serif"}}>¡Voto registrado!</div>
          </motion.div>
        )}</AnimatePresence>

        {/* CAMBIAR DE OPINIÓN */}
        {myVote&&<motion.button whileTap={{scale:0.96}} onClick={()=>setShowChangeVote(true)}
          style={{width:"100%",background:"#e01010",border:"none",borderRadius:12,padding:"12px",color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          🔄 CAMBIAR MI VOTO
        </motion.button>}

        {/* MODAL CONFIRMAR CAMBIO DE VOTO */}
        <AnimatePresence>{showChangeVote&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:600,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <motion.div initial={{scale:0.85,y:20}} animate={{scale:1,y:0}}
              style={{background:"#fff",borderRadius:20,padding:"24px 20px",maxWidth:320,width:"100%",textAlign:"center"}}>
              <div style={{fontSize:44,marginBottom:10}}>⚠️</div>
              <div style={{fontSize:18,fontWeight:900,color:"#e01010",fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}>¿CAMBIAR TU VOTO?</div>
              <div style={{fontSize:13,color:"#374151",lineHeight:1.6,marginBottom:16}}>Si cambias de candidato, <strong>las estadísticas y el conteo del partido anterior cambiarán.</strong> ¿Estás seguro?</div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setShowChangeVote(false)} style={{flex:1,background:"#f3f4f6",border:"none",borderRadius:10,padding:"13px",color:"#374151",fontSize:13,fontWeight:700,cursor:"pointer"}}>NO, ME QUEDO</button>
                <motion.button whileTap={{scale:0.96}} onClick={()=>{setShowChangeVote(false);setMyVoteForced(true);}}
                  style={{flex:1,background:"#e01010",border:"none",borderRadius:10,padding:"13px",color:"#fff",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>SÍ, CAMBIAR ✓</motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}</AnimatePresence>

        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {PARTIES.map((p,i)=>{
            const count=votes[p.id]||0,isMe=myVote===p.id;
            const cand=candidates?.[p.id];
            const canVote=!myVote||myVoteForced;
            const totalV=Object.values(votes).reduce((a,b)=>a+b,0);
            const pct=totalV>0?((count/totalV)*100).toFixed(1):"0.0";
            return(
              <motion.button key={p.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                whileTap={canVote?{scale:0.97}:{}}
                onClick={()=>canVote&&doVote(p.id)}
                style={{display:"flex",flexDirection:"column",background:isMe?`${p.color}0d`:"#fff",border:`2.5px solid ${isMe?p.color:"#e5e7eb"}`,borderRadius:18,cursor:canVote?"pointer":"default",width:"100%",textAlign:"left",
                  boxShadow:isMe?`0 0 0 1px ${p.color}, 0 6px 24px ${p.color}40`:"0 2px 8px rgba(0,0,0,0.06)",
                  opacity:myVote&&!isMe&&!myVoteForced?0.55:1,
                  overflow:"hidden"}}>
                {/* BARRA SUPERIOR COLOR PARTIDO */}
                <div style={{height:5,background:`linear-gradient(90deg,${p.color},${p.color}88)`,width:"100%"}}/>
                <div style={{display:"flex",gap:0,padding:"14px 14px 10px",alignItems:"stretch"}}>
                  {/* LOGO PARTIDO GRANDE */}
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0}}>
                    <div style={{width:80,height:80,borderRadius:14,overflow:"hidden",border:`3px solid ${isMe?p.color:`${p.color}50`}`,boxShadow:isMe?`0 0 18px ${p.color}70`:"none",background:`${p.color}10`}}>
                      {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:46,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.emoji}</span>}
                    </div>
                    <div style={{fontSize:13,fontWeight:900,color:p.color,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:.5,textAlign:"center",lineHeight:1.1}}>{p.short}</div>
                    {isMe&&<div style={{background:p.color,borderRadius:8,padding:"3px 8px",fontSize:11,color:"#fff",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>✓ TU VOTO</div>}
                  </div>

                  {/* LED KITT STRIP */}
                  <div style={{width:18,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",padding:"0 2px"}}>
                    <div style={{width:4,height:"80%",borderRadius:3,background:`linear-gradient(180deg,${p.color}00,${p.color},${p.color}cc,${p.color}44,${p.color}00)`,boxShadow:isMe?`0 0 10px ${p.color}`:"none",animation:isMe?"ledScan 1.5s ease-in-out infinite":"none"}}/>
                  </div>

                  {/* CANDIDATO GRANDE */}
                  <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                    <div style={{position:"relative",width:80,height:80,flexShrink:0}}>
                      <div style={{position:"absolute",inset:-3,borderRadius:17,background:`conic-gradient(from 0deg,${p.color},#fff,${p.color}88,#fff,${p.color})`,animation:"ledSpin 2.5s linear infinite"}}/>
                      <div style={{position:"absolute",inset:0,borderRadius:14,overflow:"hidden",background:cand?.fotoUrl?"#000":`${p.color}08`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2}}>
                        {cand?.fotoUrl?<img src={cand.fotoUrl} alt="candidato" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<><span style={{fontSize:30}}>👤</span><span style={{fontSize:8,color:p.color,fontFamily:"Barlow Condensed,sans-serif",fontWeight:900}}>PRÓXIMO</span></>}
                      </div>
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:12,fontWeight:900,color:cand?.nombre==="Por definir"?"#9ca3af":"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1.2}}>{cand?.nombre||"Por definir"}</div>
                      {cand?.cargo&&<div style={{fontSize:10,color:p.color,fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>{cand.cargo}</div>}
                    </div>
                  </div>

                  {/* VOTOS + PORCENTAJE */}
                  <div style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",justifyContent:"center",gap:4,paddingLeft:10}}>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:32,fontWeight:900,color:isMe?p.color:"#1a1a1a",lineHeight:1,fontFamily:"Barlow Condensed,sans-serif"}}><LiveCount value={count}/></div>
                      <div style={{fontSize:11,color:"#9ca3af",fontFamily:"Barlow Condensed,sans-serif"}}>votos</div>
                    </div>
                    <div style={{background:isMe?p.color:"#f3f4f6",borderRadius:10,padding:"4px 10px",textAlign:"center"}}>
                      <div style={{fontSize:20,fontWeight:900,color:isMe?"#fff":p.color,fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{pct}%</div>
                      <div style={{fontSize:9,color:isMe?"rgba(255,255,255,0.7)":"#9ca3af",fontFamily:"Barlow Condensed,sans-serif"}}>del total</div>
                    </div>
                  </div>
                </div>
                {/* BARRA DE PROGRESO */}
                <div style={{height:6,background:"#f3f4f6",margin:"0 14px 12px"}}>
                  <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1,ease:"easeOut"}}
                    style={{height:"100%",background:`linear-gradient(90deg,${p.color},${p.color}88)`,borderRadius:3}}/>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── PROPOSALS SCREEN ──
function ProposalsScreen({user,onLoginClick,onLogout,onLogoClick,total,proposals,setProposals,siteLogo,isAdmin}){
  const[confirmVote,setConfirmVote]=useState(null);const[newProp,setNewProp]=useState("");const[showForm,setShowForm]=useState(false);
  const[selEmoji,setSelEmoji]=useState("💡");
  const EMOJI_CATS=[
    {e:"💡",label:"IDEA"},    {e:"🚔",label:"SEGURIDAD"},{e:"🛣️",label:"CALLES"},
    {e:"💧",label:"AGUA"},    {e:"🌳",label:"PARQUES"},  {e:"💡",label:"LUZ"},
    {e:"🏫",label:"EDUCACIÓN"},{e:"🏥",label:"SALUD"},   {e:"💰",label:"PRESUPUESTO"},
    {e:"🚮",label:"BASURA"},  {e:"📢",label:"GOBIERNO"}, {e:"🏗️",label:"OBRA"},
  ];
  const doVote=(pid,tipo)=>{if(!user){playSound("click");onLoginClick();return;}const p=proposals.find(x=>x.id===pid);if(p?.miVoto===tipo)return;if(p?.miVoto){setProposals(prev=>prev.map(x=>{if(x.id!==pid)return x;return{...x,[tipo]:x[tipo]+1,[x.miVoto]:x[x.miVoto]-1,miVoto:tipo};}));}else{playSound("vote");setConfirmVote({pid,tipo});}};
  const confirmAndVote=()=>{if(!confirmVote)return;const{pid,tipo}=confirmVote;setProposals(prev=>prev.map(x=>{if(x.id!==pid)return x;return{...x,[tipo]:x[tipo]+1,miVoto:tipo};}));playSound("success");setConfirmVote(null);};
  const addProp=()=>{if(!newProp.trim())return;setProposals(prev=>[{id:"p"+Date.now(),emoji:selEmoji,titulo:newProp.trim(),desc:`Propuesta de ${user?.nickname||"ciudadano"}`,si:1,no:0,miVoto:"si",autor:user?.nickname||"Ciudadano"},...prev]);setNewProp("");setShowForm(false);setSelEmoji("💡");playSound("success");};
  const deleteProp=(pid)=>setProposals(prev=>prev.filter(x=>x.id!==pid));
  const pending=confirmVote?proposals.find(x=>x.id===confirmVote.pid):null;
  const THEMES=[{bg:"linear-gradient(135deg,#0d0221,#2d1b69)",border:"#7c3aed",glow:"rgba(124,58,237,0.5)"},{bg:"linear-gradient(135deg,#012312,#064e3b)",border:"#10b981",glow:"rgba(16,185,129,0.5)"},{bg:"linear-gradient(135deg,#1a0600,#7c2d12)",border:"#f97316",glow:"rgba(249,115,22,0.5)"},{bg:"linear-gradient(135deg,#020617,#1e3a8a)",border:"#3b82f6",glow:"rgba(59,130,246,0.5)"},{bg:"linear-gradient(135deg,#1a0020,#701a75)",border:"#e879f9",glow:"rgba(232,121,249,0.5)"}];
  return(
    <div style={{paddingBottom:96,background:"linear-gradient(160deg,#050010,#0a0a1a)",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogout={onLogout} onLogoClick={onLogoClick} siteLogo={siteLogo}/>
      <AnimatePresence>{confirmVote&&pending&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,0.9)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <motion.div initial={{scale:0.8,y:30}} animate={{scale:1,y:0}} style={{background:confirmVote.tipo==="si"?"linear-gradient(135deg,#022c22,#14532d)":"linear-gradient(135deg,#3b0a0a,#7f1d1d)",border:`2px solid ${confirmVote.tipo==="si"?"#4ade80":"#f87171"}`,borderRadius:22,padding:"26px 22px",maxWidth:340,width:"100%",textAlign:"center"}}>
            <div style={{fontSize:54,marginBottom:8}}>{confirmVote.tipo==="si"?"👍":"👎"}</div>
            <div style={{fontSize:20,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2,marginBottom:7}}>{confirmVote.tipo==="si"?"¡VAS A APOYAR ESTO!":"NO APOYAS ESTA PROPUESTA"}</div>
            <div style={{fontSize:14,color:"rgba(255,255,255,0.75)",marginBottom:18,fontStyle:"italic"}}>"{pending.titulo}"</div>
            <div style={{display:"flex",gap:9}}>
              <button onClick={()=>setConfirmVote(null)} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:"12px",color:"rgba(255,255,255,0.7)",fontSize:14,fontWeight:700,cursor:"pointer"}}>CANCELAR</button>
              <motion.button whileTap={{scale:0.96}} onClick={confirmAndVote} style={{flex:2,background:confirmVote.tipo==="si"?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#dc2626,#b91c1c)",border:"none",borderRadius:12,padding:"12px",color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>✅ CONFIRMAR</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <div style={{padding:"14px 2px 12px",borderBottom:"2px solid #7c3aed",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <div style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,textShadow:"0 0 14px rgba(167,139,250,0.8)"}}>💡 PROPUESTAS CIUDADANAS</div>
            <div style={{fontSize:13,color:"rgba(167,139,250,0.8)",marginTop:3,fontFamily:"Barlow Condensed,sans-serif"}}>Vota qué quieres que haga el próximo gobierno</div>
          </div>
          {user&&<motion.button whileTap={{scale:0.95}} onClick={()=>{playSound("click");setShowForm(s=>!s);}} style={{background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:10,padding:"10px 14px",color:"#fff",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:.5}}>+ PROPONER</motion.button>}
        </div>
        <AnimatePresence>{showForm&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
            style={{background:"rgba(124,58,237,0.15)",border:"2px solid #7c3aed",borderRadius:16,padding:"16px",marginBottom:16,overflow:"hidden"}}>
            <div style={{fontSize:14,color:"#c4b5fd",marginBottom:10,fontWeight:900,letterSpacing:1,fontFamily:"Barlow Condensed,sans-serif"}}>TU PROPUESTA PARA SILAO</div>
            {/* EMOJI PICKER */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,color:"rgba(196,181,253,0.7)",marginBottom:6,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>ELIGE UNA CATEGORÍA:</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {EMOJI_CATS.map(ec=>(
                  <motion.button key={ec.e+ec.label} whileTap={{scale:0.92}} onClick={()=>setSelEmoji(ec.e)}
                    style={{background:selEmoji===ec.e?"#7c3aed":"rgba(255,255,255,0.07)",border:`2px solid ${selEmoji===ec.e?"#a78bfa":"rgba(255,255,255,0.1)"}`,borderRadius:10,padding:"6px 10px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <span style={{fontSize:18}}>{ec.e}</span>
                    <span style={{fontSize:8,color:selEmoji===ec.e?"#fff":"rgba(196,181,253,0.6)",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>{ec.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            <input value={newProp} onChange={e=>setNewProp(e.target.value.slice(0,120))} placeholder="¿Qué necesita Silao? Ej: Más iluminación en..." style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1.5px solid rgba(124,58,237,0.5)",borderRadius:10,padding:"12px 14px",color:"#fff",fontSize:15,outline:"none",fontFamily:"Barlow Condensed,sans-serif",marginBottom:10}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"rgba(196,181,253,0.5)",fontFamily:"Barlow Condensed,sans-serif"}}>{newProp.length}/120</span>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>setShowForm(false)} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:8,padding:"9px 14px",color:"rgba(255,255,255,0.5)",fontSize:13,cursor:"pointer"}}>CANCELAR</button>
                <motion.button whileTap={{scale:0.96}} onClick={addProp} disabled={!newProp.trim()} style={{background:newProp.trim()?"#7c3aed":"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"9px 16px",color:"#fff",fontSize:13,fontWeight:900,cursor:newProp.trim()?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif"}}>✅ ENVIAR</motion.button>
              </div>
            </div>
          </motion.div>
        )}</AnimatePresence>
        {!user&&<div style={{background:"rgba(255,255,255,0.04)",border:"1px dashed rgba(124,58,237,0.4)",borderRadius:14,padding:"14px",marginBottom:16,textAlign:"center"}}><div style={{fontSize:14,color:"rgba(196,181,253,0.8)",marginBottom:10,fontFamily:"Barlow Condensed,sans-serif"}}>Entra para agregar tu propia propuesta</div><button onClick={()=>{playSound("click");onLoginClick();}} style={{background:"#7c3aed",border:"none",borderRadius:10,padding:"10px 20px",color:"#fff",fontSize:14,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>ENTRAR Y PROPONER</button></div>}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {proposals.map((p,i)=>{const t=THEMES[i%THEMES.length];const siPct=p.si+p.no>0?Math.round((p.si/(p.si+p.no))*100):0;return(
            <motion.div key={p.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
              style={{background:t.bg,border:`1.5px solid ${t.border}40`,borderRadius:18,padding:"16px",boxShadow:`0 4px 24px ${t.glow}`}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:10}}>
                <div style={{fontSize:28,flexShrink:0}}>{p.emoji}</div>
                <div style={{flex:1}}><div style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1.3,marginBottom:3}}>{p.titulo}</div><div style={{fontSize:16,color:"rgba(255,255,255,0.5)",lineHeight:1.5}}>{p.desc}</div>{p.autor&&<div style={{fontSize:8,color:"rgba(255,255,255,0.3)",marginTop:3,fontFamily:"Barlow Condensed,sans-serif"}}>por {p.autor}</div>}</div>
                {isAdmin&&<button onClick={()=>deleteProp(p.id)} style={{background:"rgba(220,38,38,0.3)",border:"none",borderRadius:6,padding:"3px 7px",color:"#f87171",fontSize:9,cursor:"pointer",flexShrink:0}}>🗑</button>}
              </div>
              <div style={{height:5,background:"rgba(255,255,255,0.08)",borderRadius:5,marginBottom:8,overflow:"hidden"}}><div style={{height:"100%",width:`${siPct}%`,background:`linear-gradient(90deg,${t.border},${t.border}bb)`,borderRadius:5,transition:"width .8s"}}/></div>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div style={{fontSize:10,color:t.border,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>{siPct}% A FAVOR</div><div style={{fontSize:9,color:"rgba(255,255,255,0.35)",fontFamily:"Barlow Condensed,sans-serif"}}>{p.si+p.no} votos</div></div>
              <div style={{display:"flex",gap:7}}>
                <motion.button whileTap={{scale:0.96}} onClick={()=>doVote(p.id,"si")} style={{flex:1,background:p.miVoto==="si"?"#16a34a":"rgba(22,163,74,0.15)",border:`1.5px solid ${p.miVoto==="si"?"#4ade80":"rgba(74,222,128,0.3)"}`,borderRadius:10,padding:"9px",color:p.miVoto==="si"?"#fff":"#4ade80",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>👍 A FAVOR <span style={{fontSize:10,opacity:.7}}>{p.si}</span></motion.button>
                <motion.button whileTap={{scale:0.96}} onClick={()=>doVote(p.id,"no")} style={{flex:1,background:p.miVoto==="no"?"#dc2626":"rgba(220,38,38,0.15)",border:`1.5px solid ${p.miVoto==="no"?"#f87171":"rgba(248,113,113,0.3)"}`,borderRadius:10,padding:"9px",color:p.miVoto==="no"?"#fff":"#f87171",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>👎 EN CONTRA <span style={{fontSize:10,opacity:.7}}>{p.no}</span></motion.button>
              </div>
            </motion.div>
          );})}
        </div>
      </div>
    </div>
  );
}

// ── ARTICLES SCREEN ──
function ArticlesScreen({user,onLoginClick,votes,total,onLogoClick,candidates,siteLogo}){
  const[open,setOpen]=useState(null);const[ideologyOpen,setIdeologyOpen]=useState(null);
  const art=open!==null?PARTIES[open]:null;const ideo=ideologyOpen!==null?IDEOLOGIES[ideologyOpen]:null;
  if(ideo){return(
    <div style={{paddingBottom:88,background:"#f8faff",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <motion.button whileTap={{scale:0.96}} onClick={()=>setIdeologyOpen(null)} style={{background:"#e01010",border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",fontSize:11,cursor:"pointer",margin:"12px 0",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>← VOLVER</motion.button>
        <div style={{background:ideo.bg,border:`2px solid ${ideo.color}`,borderRadius:16,padding:"18px",marginBottom:12}}><div style={{fontSize:18,fontWeight:900,color:ideo.color,marginBottom:8,fontFamily:"Barlow Condensed,sans-serif"}}>{ideo.label}</div><div style={{fontSize:13,color:"#374151",lineHeight:1.75}}>{ideo.desc}</div></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{PARTIES.filter(p=>p.ideologyTags.includes(ideo.id)).map(p=>(<div key={p.id} style={{display:"flex",alignItems:"center",gap:5,background:`${p.color}12`,border:`1.5px solid ${p.color}40`,borderRadius:20,padding:"4px 10px"}}>{PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]} alt="" style={{width:18,height:18,borderRadius:3,objectFit:"cover"}}/>:<span>{p.emoji}</span>}<span style={{fontSize:11,fontWeight:800,color:p.color,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</span></div>))}</div>
      </div>
    </div>
  );}
  if(art){const artCand=candidates[art.id];return(
    <div style={{paddingBottom:88,background:"#f8faff",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <motion.button whileTap={{scale:0.96}} onClick={()=>setOpen(null)} style={{background:"#e01010",border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",fontSize:11,cursor:"pointer",margin:"12px 0",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>← VOLVER</motion.button>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{background:"#fff",border:`2px solid ${art.color}`,borderRadius:16,overflow:"hidden",marginBottom:14}}>
          <div style={{background:`linear-gradient(135deg,${art.color}15,${art.color}05)`,padding:"16px",borderBottom:`2px solid ${art.color}20`}}>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
              <PartyLogoBox partyId={art.id} emoji={art.emoji} color={art.color} size={100} radius={16}/>
              <div style={{flex:1}}><div style={{fontSize:8,color:art.color,letterSpacing:3,fontWeight:900,marginBottom:2,fontFamily:"Barlow Condensed,sans-serif"}}>{art.spectrumLabel.toUpperCase()}</div><div style={{fontSize:22,fontWeight:900,color:"#1a1a1a",lineHeight:1.1,fontFamily:"Barlow Condensed,sans-serif"}}>{art.short}</div><div style={{fontSize:10,color:"#6b7280"}}>{art.name}</div></div>
              <CandidateBox candidate={artCand} color={art.color} size={100} radius={16}/>
            </div>
            <div style={{position:"relative",height:7,background:"linear-gradient(90deg,#dc2626,#ea580c,#6b7280,#1a6fd4,#1e3a8a)",borderRadius:5,marginBottom:3}}><div style={{position:"absolute",top:"50%",left:`${art.spectrumPos}%`,transform:"translate(-50%,-50%)",width:13,height:13,borderRadius:"50%",background:art.color,border:"2px solid #fff"}}/></div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:7,fontWeight:700}}><span style={{color:"#dc2626"}}>← IZQ.</span><span style={{color:"#1e3a8a"}}>DER. →</span></div>
          </div>
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${art.color}15`}}>
            <div style={{fontSize:9,color:art.color,letterSpacing:2,marginBottom:8,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>📋 DATOS OFICIALES</div>
            {[{label:"📅 FUNDADO",val:art.fundado},{label:"👤 FUNDADOR",val:art.fundador},{label:"🏛️ DIRIGENTE",val:art.dirigente},{label:"👥 MILITANTES",val:art.militantes},{label:"🗺️ GOBIERNOS",val:art.gobiernos}].map(({label,val})=>(<div key={label} style={{background:"#f8faff",borderRadius:7,padding:"7px 10px",border:`1px solid ${art.color}15`,marginBottom:5}}><div style={{fontSize:7,color:art.color,letterSpacing:1.5,fontWeight:800,marginBottom:1,fontFamily:"Barlow Condensed,sans-serif"}}>{label}</div><div style={{fontSize:11,color:"#1a1a1a",lineHeight:1.4}}>{val}</div></div>))}
          </div>
          {artCand&&artCand.nombre!=="No aplica"&&(<div style={{padding:"14px 16px",borderBottom:`1px solid ${art.color}15`,background:`${art.color}04`}}>
            <div style={{fontSize:9,color:art.color,letterSpacing:2,marginBottom:8,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>👤 CANDIDATO/A PARA SILAO</div>
            <div style={{background:"#fff",border:`2px solid ${art.color}25`,borderRadius:10,padding:"12px",display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",border:`2px solid ${art.color}`,flexShrink:0,background:`${art.color}12`}}>
                {artCand.fotoUrl?<img src={artCand.fotoUrl} alt="candidato" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>👤</span>}
              </div>
              <div style={{flex:1}}><div style={{fontSize:14,fontWeight:900,color:artCand.nombre==="Por definir"?"#9ca3af":"#1a1a1a",marginBottom:2,fontFamily:"Barlow Condensed,sans-serif"}}>{artCand.nombre}</div>{artCand.cargo&&<div style={{fontSize:9,color:art.color,fontWeight:700,marginBottom:4}}>{artCand.cargo}</div>}<div style={{fontSize:11,color:"#4b5563",lineHeight:1.5}}>{artCand.bio}</div></div>
            </div>
          </div>)}
          <div style={{padding:"12px 16px",borderBottom:`1px solid ${art.color}15`}}><div style={{fontSize:13,color:"#374151",lineHeight:1.75}}>{art.descripcion}</div></div>
          <div style={{padding:"12px 16px",background:"#fffbeb",borderBottom:`1px solid ${art.color}15`}}><div style={{fontSize:9,color:"#d97706",letterSpacing:2,marginBottom:5,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>DATO CURIOSO</div><div style={{fontSize:12,color:"#92400e",lineHeight:1.6}}>{art.curioso}</div></div>
          <div style={{padding:"12px 16px",background:"#f0f7ff"}}><div style={{fontSize:8,color:"#1d4ed8",letterSpacing:2,marginBottom:5,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>🏙️ DATOS — SILAO 360</div><div style={{fontSize:12,color:"#374151",lineHeight:1.65,fontStyle:"italic",borderLeft:`3px solid ${art.color}`,paddingLeft:10}}>{art.opinion}</div></div>
        </motion.div>
      </div>
    </div>
  );}
  return(
    <div style={{paddingBottom:88,background:"#f8faff",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <div style={{padding:"12px 2px 10px"}}><div style={{fontSize:8,color:"#9ca3af",letterSpacing:3,marginBottom:2,fontFamily:"Barlow Condensed,sans-serif"}}>SILAO 360</div><div style={{fontSize:17,fontWeight:900,color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif"}}>Partidos e Ideologías</div></div>
        <div style={{background:"#fff",border:"1.5px solid #e5e7eb",borderRadius:14,padding:"12px",marginBottom:12}}>
          <div style={{fontSize:9,color:"#374151",letterSpacing:2,marginBottom:8,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>🧭 ¿QUÉ SIGNIFICA CADA TÉRMINO?</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{IDEOLOGIES.map((ideo,i)=>(<motion.button key={ideo.id} whileTap={{scale:0.95}} onClick={()=>{playSound("click");setIdeologyOpen(i);}} style={{background:ideo.bg,border:`2px solid ${ideo.color}`,borderRadius:20,padding:"5px 11px",cursor:"pointer"}}><span style={{fontSize:10,fontWeight:900,color:ideo.color,fontFamily:"Barlow Condensed,sans-serif"}}>{ideo.label}</span></motion.button>))}</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {PARTIES.map((a,i)=>{const count=votes[a.id]||0;const pctVal=total>0?((count/total)*100).toFixed(1):"0.0";return(
            <motion.button key={a.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
              whileHover={{y:-3,boxShadow:`0 8px 24px ${a.color}20`}} whileTap={{scale:0.97}}
              onClick={()=>{playSound("click");setOpen(i);}}
              style={{background:"#fff",border:`2px solid ${a.color}30`,borderRadius:16,padding:"14px",cursor:"pointer",width:"100%",textAlign:"left",boxShadow:`0 2px 10px ${a.color}10`}}>
              {/* Nombre + tags arriba */}
              <div style={{marginBottom:12}}>
                <div style={{fontSize:16,fontWeight:900,color:a.color,fontFamily:"Barlow Condensed,sans-serif",marginBottom:3}}>{a.short}</div>
                <div style={{fontSize:9,color:"#9ca3af",marginBottom:5}}>{a.name} · {a.fundado}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>{a.ideologyTags.slice(0,2).map(tag=>{const ideo=IDEOLOGIES.find(x=>x.id===tag);if(!ideo)return null;return<span key={tag} style={{fontSize:7,color:ideo.color,background:ideo.bg,border:`1px solid ${ideo.color}40`,borderRadius:8,padding:"2px 7px",fontWeight:700}}>{ideo.label}</span>;})}</div>
              </div>
              {/* Dos tarjetas separadas: logo | candidato */}
              <div style={{display:"flex",gap:10}}>
                {/* TARJETA LOGO PARTIDO */}
                <div style={{flex:1,background:`${a.color}08`,border:`2px solid ${a.color}30`,borderRadius:12,padding:"12px",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{fontSize:8,color:a.color,letterSpacing:2,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>PARTIDO</div>
                  <div style={{width:72,height:72,borderRadius:12,overflow:"hidden",border:`3px solid ${a.color}`,boxShadow:`0 0 16px ${a.color}40`}}>
                    {PARTY_LOGOS[a.id]?<img src={PARTY_LOGOS[a.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:36,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{a.emoji}</span>}
                  </div>
                  {count>0&&<div style={{background:a.color,borderRadius:8,padding:"3px 10px"}}><span style={{fontSize:12,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif"}}>{pctVal}%</span></div>}
                </div>
                {/* TARJETA CANDIDATO */}
                <div style={{flex:1,background:"rgba(0,0,0,0.03)",border:`2px dashed ${a.color}40`,borderRadius:12,padding:"12px",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                  <div style={{fontSize:8,color:a.color,letterSpacing:2,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>CANDIDATO</div>
                  <CandidateBox candidate={candidates[a.id]} color={a.color} size={72} radius={12}/>
                  <div style={{fontSize:10,fontWeight:700,color:candidates[a.id]?.nombre==="Por definir"?"#9ca3af":a.color,fontFamily:"Barlow Condensed,sans-serif",textAlign:"center",lineHeight:1.2}}>
                    {candidates[a.id]?.nombre||"Por definir"}
                  </div>
                </div>
              </div>
              {/* Ver más */}
              <div style={{marginTop:10,textAlign:"right"}}><span style={{fontSize:10,color:a.color,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>VER MÁS →</span></div>
            </motion.button>
          );})}
        </div>
      </div>
    </div>
  );
}

// ── COMMENTS SCREEN ──
function ReactionBtn({emoji,count,onReact,reacted}){
  const[pop,setPop]=useState(false);
  return(<motion.button whileTap={{scale:1.3}} onClick={()=>{playSound("click");onReact();setPop(true);setTimeout(()=>setPop(false),300);}} style={{background:reacted?"#eff6ff":"#f3f4f6",border:`1.5px solid ${reacted?"#3b82f6":"#e5e7eb"}`,borderRadius:20,padding:"3px 8px",cursor:"pointer",display:"flex",alignItems:"center",gap:3}}><span style={{fontSize:13}}>{emoji}</span>{count>0&&<span style={{fontSize:9,fontWeight:700,color:reacted?"#1877f2":"#6b7280"}}>{count}</span>}</motion.button>);
}

function CommentsScreen({user,onLoginClick,total,onLogoClick,isAdmin,comments,setComments,blockedNicks,pinnedMsg,siteLogo}){
  const[text,setText]=useState("");const[replyOpen,setReplyOpen]=useState({});const[replyText,setReplyText]=useState({});
  const post=()=>{if(!text.trim())return;playSound("success");setComments(prev=>[{id:Date.now(),nick:user?user.nickname:"Visitante",txt:text.trim(),ts:Date.now(),reactions:{like:0,heart:0,fire:0,wow:0,haha:0},myReacted:{},replies:[]},...prev]);setText("");};
  const react=(cid,key)=>setComments(prev=>prev.map(c=>{if(c.id!==cid)return c;const already=c.myReacted[key];return{...c,reactions:{...c.reactions,[key]:Math.max(0,(c.reactions[key]||0)+(already?-1:1))},myReacted:{...c.myReacted,[key]:!already}};}));
  const deleteC=(cid)=>setComments(prev=>prev.filter(c=>c.id!==cid));
  const postReply=(cid)=>{if(!replyText[cid]?.trim()||!user)return;setComments(prev=>prev.map(c=>{if(c.id!==cid)return c;return{...c,replies:[...(c.replies||[]),{nick:user.nickname,txt:replyText[cid].trim(),ts:Date.now()}]};}));setReplyText(r=>({...r,[cid]:""}));};
  const visible=(comments||[]).filter(c=>!(blockedNicks||[]).includes(c.nick));
  return(
    <div style={{paddingBottom:100,background:"linear-gradient(180deg,#0d0d1a,#1a0a2e,#0a0d1a)",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <div style={{padding:"14px 2px 12px",borderBottom:"2px solid #7c3aed",marginBottom:14}}>
          <div style={{fontSize:26,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2,textShadow:"0 0 20px rgba(196,181,253,0.9)"}}>💬 FORO CIUDADANO</div>
          <div style={{fontSize:13,color:"rgba(196,181,253,0.8)",marginTop:3,fontFamily:"Barlow Condensed,sans-serif"}}>Opina sobre las elecciones en Silao</div>
        </div>
        {user?(<div style={{background:"linear-gradient(135deg,#1a0a2e,#2d1b69)",border:"2px solid #7c3aed",borderRadius:14,padding:"12px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}><div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🎭</div><span style={{fontSize:11,fontWeight:800,color:"#c4b5fd",fontFamily:"Barlow Condensed,sans-serif"}}>{user.nickname}</span></div>
          <textarea value={text} onChange={e=>setText(e.target.value.slice(0,280))} placeholder="¿Qué opinas sobre las elecciones en Silao?" style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(124,58,237,0.4)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12,outline:"none",resize:"none",height:70,lineHeight:1.5,fontFamily:"Barlow Condensed,sans-serif"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:7}}>
            <span style={{fontSize:8,color:"rgba(196,181,253,0.5)",fontFamily:"Barlow Condensed,sans-serif"}}>{text.length}/280</span>
            <motion.button whileTap={{scale:0.95}} onClick={post} disabled={!text.trim()} style={{background:text.trim()?"linear-gradient(135deg,#7c3aed,#5b21b6)":"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:"7px 16px",color:text.trim()?"#fff":"rgba(255,255,255,0.25)",fontSize:11,fontWeight:800,cursor:text.trim()?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif"}}>💬 PUBLICAR</motion.button>
          </div>
        </div>):(<motion.button whileTap={{scale:0.97}} onClick={()=>{playSound("click");onLoginClick();}} style={{width:"100%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:14,padding:"13px",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,marginBottom:12,fontWeight:800}}>💬 ENTRA CON FACEBOOK PARA COMENTAR</motion.button>)}
        <div style={{background:"linear-gradient(135deg,#0f1e5c,#1e3a8a)",border:"2px solid #3b82f6",borderRadius:14,padding:"12px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}><div style={{width:28,height:28,borderRadius:"50%",overflow:"hidden",border:"2px solid #3b82f6"}}><img src={LOGO_SILAO360} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div><div><div style={{fontSize:12,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>SILAO 360</div><div style={{fontSize:7,color:"#93c5fd",letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>CUENTA OFICIAL · 📌 FIJADO</div></div></div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.85)",lineHeight:1.7,fontStyle:"italic",borderLeft:"3px solid #60a5fa",paddingLeft:10}}>&ldquo;{pinnedMsg}&rdquo;</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {visible.map((c,i)=>(
            <motion.div key={c.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
              style={{background:"linear-gradient(135deg,#1a0a2e,#2d1b69)",border:"1.5px solid rgba(124,58,237,0.4)",borderRadius:14,padding:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}><div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>🎭</div><span style={{fontSize:11,fontWeight:800,color:"#c4b5fd",fontFamily:"Barlow Condensed,sans-serif"}}>{c.nick}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:5}}><span style={{fontSize:8,color:"rgba(196,181,253,0.5)",fontFamily:"Barlow Condensed,sans-serif"}}>{timeAgo(c.ts)}</span>{isAdmin&&<button onClick={()=>deleteC(c.id)} style={{background:"rgba(107,114,128,0.5)",border:"none",borderRadius:5,padding:"2px 6px",color:"#fff",fontSize:9,cursor:"pointer"}}>🗑</button>}</div>
              </div>
              <div style={{fontSize:20,color:"rgba(255,255,255,0.85)",lineHeight:1.6,marginBottom:8}}>{c.txt}</div>
              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:7}}>{REACTION_MAP.map(({k,e})=><ReactionBtn key={k} emoji={e} count={c.reactions[k]||0} reacted={!!c.myReacted[k]} onReact={()=>react(c.id,k)}/>)}</div>
              <button onClick={()=>setReplyOpen(r=>({...r,[c.id]:!r[c.id]}))} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(124,58,237,0.3)",borderRadius:7,padding:"4px 9px",color:"rgba(196,181,253,0.6)",fontSize:8,cursor:"pointer",fontWeight:700}}>💬 {(c.replies||[]).length>0?`${(c.replies||[]).length} réplicas`:"RESPONDER"}</button>
              {replyOpen[c.id]&&(<div style={{marginTop:7,paddingLeft:9,borderLeft:"2px solid rgba(124,58,237,0.3)"}}>
                {(c.replies||[]).map((r,i)=>(<div key={i} style={{background:"rgba(255,255,255,0.04)",borderRadius:7,padding:"6px 9px",marginBottom:4}}><div style={{fontSize:8,color:"rgba(196,181,253,0.5)",marginBottom:2}}>🎭 {r.nick} · {timeAgo(r.ts)}</div><div style={{fontSize:18,color:"rgba(255,255,255,0.75)"}}>{r.txt}</div></div>))}
                {user?(<div style={{display:"flex",gap:5,marginTop:5}}><input value={replyText[c.id]||""} onChange={e=>setReplyText(r=>({...r,[c.id]:e.target.value.slice(0,150)}))} onKeyDown={e=>e.key==="Enter"&&postReply(c.id)} placeholder="Tu réplica..." style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(124,58,237,0.3)",borderRadius:7,padding:"6px 9px",color:"#fff",fontSize:11,outline:"none"}}/><button onClick={()=>postReply(c.id)} disabled={!replyText[c.id]?.trim()} style={{background:replyText[c.id]?.trim()?"#7c3aed":"rgba(255,255,255,0.05)",border:"none",borderRadius:7,padding:"6px 11px",color:"#fff",fontSize:10,fontWeight:800,cursor:replyText[c.id]?.trim()?"pointer":"default"}}>↑</button></div>):(<button onClick={()=>{playSound("click");onLoginClick();}} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px dashed rgba(124,58,237,0.3)",borderRadius:7,padding:"6px",color:"rgba(196,181,253,0.4)",fontSize:9,cursor:"pointer",marginTop:5}}>Entra para responder</button>)}
              </div>)}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ADMIN ──
const ADMIN_PASSWORD="Silao360#";

function AdminLogin({onSuccess,onCancel}:{onSuccess:()=>void,onCancel:()=>void}){
  const[pass,setPass]=useState("");
  const[show,setShow]=useState(false);
  const[error,setError]=useState(false);
  const[attempts,setAttempts]=useState(0);
  const inputRef=useRef<HTMLInputElement>(null);
  useEffect(()=>{setTimeout(()=>inputRef.current?.focus(),300);},[]);
  const tryLogin=()=>{
    if(pass===ADMIN_PASSWORD){playSound("success");onSuccess();}
    else{
      setError(true);setAttempts(a=>a+1);
      setTimeout(()=>{setError(false);setPass("");},1600);
    }
  };
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{position:"fixed",inset:0,zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:20,overflow:"hidden"}}>
      {/* Fondo animado */}
      <div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#020408,#0a0418,#010610)",zIndex:0}}/>
      {[...Array(6)].map((_,i)=>(
        <motion.div key={i}
          animate={{x:[0,30,-30,0],y:[0,-40,20,0],scale:[1,1.3,0.8,1],opacity:[0.15,0.35,0.1,0.15]}}
          transition={{duration:6+i*2,repeat:Infinity,delay:i*1.2,ease:"easeInOut"}}
          style={{position:"absolute",
            left:`${10+i*15}%`,top:`${5+i*12}%`,
            width:200+i*80,height:200+i*80,
            borderRadius:"50%",
            background:`radial-gradient(circle,${["#7c3aed","#e01010","#1d4ed8","#059669","#b91c1c","#6d28d9"][i]}40,transparent 70%)`,
            filter:"blur(40px)",pointerEvents:"none",zIndex:0}}/>
      ))}
      <motion.div initial={{scale:0.85,y:30,opacity:0}} animate={{scale:1,y:0,opacity:1}}
        transition={{type:"spring",stiffness:260,damping:22,delay:0.1}}
        style={{position:"relative",zIndex:1,width:"100%",maxWidth:360}}>
        {/* Card */}
        <div style={{background:"rgba(8,6,22,0.92)",backdropFilter:"blur(24px)",border:"1px solid rgba(124,58,237,0.5)",borderRadius:24,padding:"32px 24px",boxShadow:"0 32px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.04),inset 0 1px 0 rgba(255,255,255,0.06)"}}>
          {/* Logo / ícono */}
          <div style={{textAlign:"center",marginBottom:28}}>
            <motion.div animate={{boxShadow:["0 0 20px rgba(124,58,237,0.5)","0 0 40px rgba(124,58,237,0.9)","0 0 20px rgba(124,58,237,0.5)"]}} transition={{duration:2,repeat:Infinity}}
              style={{width:72,height:72,borderRadius:20,background:"linear-gradient(135deg,#4c1d95,#7c3aed)",margin:"0 auto 14px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32}}>
              ⚙️
            </motion.div>
            <div style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:3}}>PANEL ADMIN</div>
            <div style={{fontSize:11,color:"rgba(167,139,250,0.6)",marginTop:4,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2}}>SILAO 360 — ACCESO RESTRINGIDO</div>
          </div>
          {/* Input */}
          <div style={{position:"relative",marginBottom:14}}>
            <motion.div animate={error?{x:[-6,6,-6,6,-4,4,0]}:{}} transition={{duration:0.4}}>
              <input ref={inputRef} type={show?"text":"password"} value={pass}
                onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&tryLogin()}
                placeholder="Contraseña de acceso"
                style={{width:"100%",background:error?"rgba(220,38,38,0.12)":"rgba(255,255,255,0.06)",
                  border:`1.5px solid ${error?"#ef4444":"rgba(124,58,237,0.4)"}`,
                  borderRadius:12,padding:"14px 44px 14px 16px",color:"#fff",fontSize:15,
                  outline:"none",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,
                  transition:"border-color .2s",boxSizing:"border-box"}}/>
            </motion.div>
            <button onClick={()=>setShow(s=>!s)}
              style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,color:"rgba(255,255,255,0.35)",padding:4}}>
              {show?"🙈":"👁️"}
            </button>
          </div>
          {/* Error msg */}
          <AnimatePresence>
            {error&&<motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}} exit={{opacity:0}}
              style={{fontSize:11,color:"#f87171",textAlign:"center",marginBottom:12,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>
              ⛔ Contraseña incorrecta{attempts>1?` (intento ${attempts})`:""}
            </motion.div>}
          </AnimatePresence>
          {/* Botón entrar */}
          <motion.button whileTap={{scale:0.96}} onClick={tryLogin}
            style={{width:"100%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:12,
              padding:"14px",color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",
              fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2,marginBottom:10,
              boxShadow:"0 4px 20px rgba(124,58,237,0.5)"}}>
            🔓 ENTRAR
          </motion.button>
          <button onClick={onCancel}
            style={{width:"100%",background:"transparent",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"11px",color:"rgba(255,255,255,0.3)",fontSize:11,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
            CANCELAR
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── ADMIN PANEL ──
function AdminPanel({candidates,setCandidates,siteLogo,setSiteLogo,onClose,votes,setVotes,proposals,setProposals,comments,encuestaActiva,setEncuestaActiva,alertaMsg,setAlertaMsg,alertaActiva,setAlertaActiva,blockedNicks}:any){
  const[tab,setTab]=useState("stats");
  const[editId,setEditId]=useState<string|null>(null);
  const[editData,setEditData]=useState<any>({});
  const[newPropEmoji,setNewPropEmoji]=useState("💡");
  const[newPropTitle,setNewPropTitle]=useState("");
  const[newPropDesc,setNewPropDesc]=useState("");
  const[alertInput,setAlertInput]=useState(alertaMsg||"");
  const[resetConfirm,setResetConfirm]=useState(false);
  const[newPartyName,setNewPartyName]=useState("");
  const[newPartyShort,setNewPartyShort]=useState("");
  const[newPartyColor,setNewPartyColor]=useState("#6b7280");
  const[newPartyCand,setNewPartyCand]=useState("");
  const[exportFrom,setExportFrom]=useState("");
  const[exportTo,setExportTo]=useState("");
  const[saved,setSaved]=useState(false);

  const total=Object.values(votes as Record<string,number>).reduce((a,b)=>a+b,0);
  const leader=[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0))[0];

  const uploadLogo=(pid:string,e:any)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=(ev:any)=>{PARTY_LOGOS[pid]=ev.target.result;setCandidates((p:any)=>({...p}));};r.readAsDataURL(f);};
  const uploadSiteLogo=(e:any)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=(ev:any)=>setSiteLogo(ev.target.result);r.readAsDataURL(f);};
  const uploadCandPhoto=(pid:string,e:any)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=(ev:any)=>setCandidates((p:any)=>({...p,[pid]:{...p[pid],fotoUrl:ev.target.result}}));r.readAsDataURL(f);};
  const saveCand=()=>{setCandidates((p:any)=>({...p,[editId!]:editData}));setEditId(null);setSaved(true);setTimeout(()=>setSaved(false),2000);playSound("success");};
  const addProp=()=>{if(!newPropTitle.trim())return;setProposals((prev:any[])=>[{id:"ap"+Date.now(),emoji:newPropEmoji,titulo:newPropTitle.trim(),desc:newPropDesc.trim()||"Propuesta del administrador",si:0,no:0,miVoto:null,autor:"Admin"},...prev]);setNewPropTitle("");setNewPropDesc("");playSound("success");};
  const deleteProp=(pid:any)=>setProposals((prev:any[])=>prev.filter((x:any)=>x.id!==pid));
  const resetVotes=()=>{setVotes(Object.fromEntries(PARTIES.map(p=>[p.id,0])));setResetConfirm(false);playSound("success");};

  const TABS=[
    {id:"stats",   icon:"📊", label:"STATS"},
    {id:"alertas", icon:"🔔", label:"ALERTAS"},
    {id:"encuesta",icon:"🗳️", label:"ENCUESTA"},
    {id:"candidatos",icon:"👤",label:"CANDIDATOS"},
    {id:"propuestas",icon:"💡",label:"PROPUESTAS"},
    {id:"partidos",icon:"🏛️", label:"PARTIDOS"},
    {id:"exportar",icon:"📥", label:"EXPORTAR"},
    {id:"config",  icon:"⚙️", label:"CONFIG"},
  ];

  const TAB_COLORS:Record<string,string>={stats:"#e01010",alertas:"#f59e0b",encuesta:"#22c55e",candidatos:"#3b82f6",propuestas:"#a78bfa",partidos:"#f97316",exportar:"#34d399",config:"#94a3b8"};
  const ac=TAB_COLORS[tab]||"#7c3aed";

  // ── Estilos reutilizables ──
  const card=(borderColor:string="rgba(255,255,255,0.08)")=>({background:"rgba(255,255,255,0.03)",backdropFilter:"blur(8px)",border:`1.5px solid ${borderColor}`,borderRadius:16,padding:"18px 16px",marginBottom:14} as const);
  const sectionTitle=(color:string,icon:string,text:string)=>(
    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
      <div style={{width:32,height:32,borderRadius:9,background:`${color}22`,border:`1.5px solid ${color}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{icon}</div>
      <div style={{fontSize:12,fontWeight:900,color,letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif"}}>{text}</div>
    </div>
  );
  const input=(value:any,onChange:any,placeholder:string,extra?:any)=>(
    <input value={value} onChange={onChange} placeholder={placeholder}
      style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"12px 14px",color:"#fff",fontSize:13,outline:"none",fontFamily:"Barlow Condensed,sans-serif",marginBottom:10,boxSizing:"border-box",...extra}}/>
  );
  const btn=(label:string,onClick:any,color:string="#7c3aed",extra?:any)=>(
    <motion.button whileTap={{scale:0.96}} onClick={onClick}
      style={{background:`linear-gradient(135deg,${color},${color}cc)`,border:"none",borderRadius:10,padding:"12px 16px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,...extra}}>
      {label}
    </motion.button>
  );

  return(
    <div style={{position:"fixed",inset:0,zIndex:900,background:"#06040f",overflowY:"auto"}}>
      <div style={{maxWidth:600,margin:"0 auto",paddingBottom:80}}>

        {/* ━━ HEADER ━━ */}
        <div style={{background:"linear-gradient(180deg,#0d0820 0%,#100c24 100%)",borderBottom:`2px solid ${ac}44`,position:"sticky",top:0,zIndex:10,backdropFilter:"blur(20px)"}}>
          <div style={{padding:"12px 16px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:40,height:40,borderRadius:11,background:`linear-gradient(135deg,${ac},${ac}88)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,boxShadow:`0 0 16px ${ac}66`}}>
                  {TABS.find(t=>t.id===tab)?.icon||"⚙️"}
                </div>
                <div>
                  <div style={{fontSize:16,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2}}>PANEL ADMIN</div>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
                    {new Date().toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short",year:"numeric"}).toUpperCase()}
                    {" · "}{total} VOTOS TOTALES
                  </div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{display:"flex",alignItems:"center",gap:4,background:"rgba(34,197,94,0.12)",border:"1px solid rgba(34,197,94,0.4)",borderRadius:20,padding:"4px 10px"}}>
                  <div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",animation:"pd 1.5s infinite"}}/>
                  <span style={{fontSize:8,color:"#22c55e",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>LIVE</span>
                </div>
                <motion.button whileTap={{scale:0.93}} onClick={onClose}
                  style={{background:"rgba(220,38,38,0.15)",border:"1.5px solid rgba(220,38,38,0.5)",borderRadius:8,padding:"7px 12px",color:"#f87171",fontSize:10,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
                  ✕ SALIR
                </motion.button>
              </div>
            </div>

            {/* Tab pills */}
            <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:12,scrollbarWidth:"none"}}>
              {TABS.map(t=>{
                const isAct=tab===t.id;
                const tc=TAB_COLORS[t.id];
                return(
                  <motion.button key={t.id} whileTap={{scale:0.93}} onClick={()=>setTab(t.id)}
                    style={{display:"flex",alignItems:"center",gap:5,
                      background:isAct?`${tc}22`:"rgba(255,255,255,0.04)",
                      border:`1.5px solid ${isAct?tc:"rgba(255,255,255,0.08)"}`,
                      borderRadius:20,padding:"6px 12px",
                      color:isAct?tc:"rgba(255,255,255,0.35)",
                      fontSize:9,fontWeight:900,cursor:"pointer",whiteSpace:"nowrap",
                      fontFamily:"Barlow Condensed,sans-serif",flexShrink:0,
                      boxShadow:isAct?`0 0 10px ${tc}44`:"none",transition:"all .15s"}}>
                    <span style={{fontSize:11}}>{t.icon}</span>
                    <span style={{letterSpacing:1}}>{t.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ━━ CONTENT ━━ */}
        <div style={{padding:"16px"}}>

        {/* ── STATS ── */}
        {tab==="stats"&&(<div>
          {/* KPI cards */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
            {[
              {icon:"🗳️",val:total,label:"TOTAL VOTOS",color:"#e01010",sub:`Líder: ${leader.short}`},
              {icon:"💬",val:comments?.length||0,label:"COMENTARIOS",color:"#7c3aed",sub:"En el foro"},
              {icon:"🏆",val:total>0?`${((votes[leader.id]||0)/total*100).toFixed(1)}%`:"—",label:"LÍDER ACTUAL",color:"#f59e0b",sub:leader.short},
              {icon:"💡",val:proposals?.length||0,label:"PROPUESTAS",color:"#22c55e",sub:"Ciudadanas"},
            ].map(({icon,val,label,color,sub})=>(
              <div key={label} style={{background:`linear-gradient(135deg,${color}12,${color}06)`,border:`1.5px solid ${color}30`,borderRadius:16,padding:"16px 14px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:-8,right:-8,fontSize:44,opacity:0.07}}>{icon}</div>
                <div style={{fontSize:26,marginBottom:2}}>{icon}</div>
                <div style={{fontSize:28,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{typeof val==="number"?val.toLocaleString("es-MX"):val}</div>
                <div style={{fontSize:7,color,letterSpacing:2,marginTop:4,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>{label}</div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.35)",marginTop:2,fontFamily:"Barlow Condensed,sans-serif"}}>{sub}</div>
              </div>
            ))}
          </div>
          {/* Barras de votos */}
          <div style={card(`${ac}30`)}>
            {sectionTitle(ac,"📊","DISTRIBUCIÓN DE VOTOS")}
            {PARTIES.map(p=>{
              const count=votes[p.id]||0;
              const pct=total>0?count/total*100:0;
              const isTop=p.id===leader.id&&count>0;
              return(
                <div key={p.id} style={{marginBottom:12}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                    <div style={{display:"flex",alignItems:"center",gap:7}}>
                      <div style={{width:24,height:24,borderRadius:6,overflow:"hidden",background:`${p.color}20`,border:`1px solid ${p.color}50`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]!} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:13}}>{p.emoji}</span>}
                      </div>
                      <span style={{fontSize:12,fontWeight:800,color:isTop?"#f59e0b":"#fff",fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</span>
                      {isTop&&<span style={{fontSize:8,background:"rgba(245,158,11,0.2)",border:"1px solid #f59e0b",color:"#fbbf24",borderRadius:4,padding:"1px 5px",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>🏆 LÍDER</span>}
                    </div>
                    <span style={{fontSize:13,fontWeight:900,color:p.color,fontFamily:"Barlow Condensed,sans-serif"}}>{count} <span style={{fontSize:9,opacity:.6}}>({pct.toFixed(1)}%)</span></span>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:5,overflow:"hidden"}}>
                    <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:.8,ease:"easeOut"}}
                      style={{height:"100%",background:isTop?`linear-gradient(90deg,${p.color},#f59e0b)`:p.color,borderRadius:5}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>)}

        {/* ── ALERTAS ── */}
        {tab==="alertas"&&(<div>
          <div style={card("rgba(245,158,11,0.3)")}>
            {sectionTitle("#f59e0b","📢","BANNER DE ALERTA GLOBAL")}
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:12,lineHeight:1.6}}>Muestra un banner rojo en la parte superior para todos los usuarios.</div>
            <textarea value={alertInput} onChange={(e:any)=>setAlertInput(e.target.value.slice(0,200))}
              placeholder="Escribe el mensaje de alerta..."
              style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(245,158,11,0.3)",borderRadius:10,padding:"12px",color:"#fff",fontSize:12,outline:"none",resize:"none",height:72,fontFamily:"Barlow Condensed,sans-serif",lineHeight:1.6,marginBottom:4,boxSizing:"border-box"}}/>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.2)",textAlign:"right",marginBottom:12,fontFamily:"Barlow Condensed,sans-serif"}}>{alertInput.length}/200</div>
            <div style={{display:"flex",gap:8}}>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{setAlertaMsg(alertInput);setAlertaActiva(true);playSound("success");}}
                style={{flex:1,background:alertaActiva?"linear-gradient(135deg,#dc2626,#7f1d1d)":"linear-gradient(135deg,#f59e0b,#d97706)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                {alertaActiva?"📢 ACTUALIZAR ALERTA":"📢 ACTIVAR ALERTA"}
              </motion.button>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{setAlertaActiva(false);setAlertaMsg("");setAlertInput("");playSound("click");}}
                disabled={!alertaActiva}
                style={{flex:1,background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"12px",color:alertaActiva?"#f87171":"rgba(255,255,255,0.2)",fontSize:11,fontWeight:900,cursor:alertaActiva?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif"}}>
                ✕ DESACTIVAR
              </motion.button>
            </div>
            {alertaActiva&&alertaMsg&&<div style={{marginTop:10,background:"rgba(220,38,38,0.15)",border:"1px solid rgba(220,38,38,0.4)",borderRadius:8,padding:"10px",fontSize:10,color:"#f87171",fontFamily:"Barlow Condensed,sans-serif"}}>
              📢 ACTIVA: "{alertaMsg}"
            </div>}
          </div>
          <div style={card("rgba(255,255,255,0.06)")}>
            {sectionTitle("#94a3b8","🔕","REPORTES DE USUARIOS")}
            <div style={{textAlign:"center",padding:"28px 0",color:"rgba(255,255,255,0.2)"}}>
              <div style={{fontSize:40,marginBottom:8}}>🔔</div>
              <div style={{fontSize:11,fontFamily:"Barlow Condensed,sans-serif"}}>Sin reportes pendientes</div>
            </div>
          </div>
        </div>)}

        {/* ── ENCUESTA ── */}
        {tab==="encuesta"&&(<div>
          <div style={card("rgba(34,197,94,0.3)")}>
            {sectionTitle("#22c55e","🗳️","CONTROL DE ENCUESTA")}
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{setEncuestaActiva(true);playSound("success");}}
                style={{flex:1,background:encuestaActiva?"linear-gradient(135deg,#16a34a,#14532d)":"rgba(22,163,74,0.1)",border:`2px solid ${encuestaActiva?"#22c55e":"rgba(34,197,94,0.3)"}`,borderRadius:11,padding:"13px",color:encuestaActiva?"#fff":"rgba(255,255,255,0.4)",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                ✅ ACTIVA
              </motion.button>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{setEncuestaActiva(false);playSound("click");}}
                style={{flex:1,background:!encuestaActiva?"linear-gradient(135deg,#dc2626,#7f1d1d)":"rgba(220,38,38,0.1)",border:`2px solid ${!encuestaActiva?"#ef4444":"rgba(220,38,38,0.3)"}`,borderRadius:11,padding:"13px",color:!encuestaActiva?"#fff":"rgba(255,255,255,0.4)",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                ⏸ PAUSADA
              </motion.button>
            </div>
            {resetConfirm?(
              <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}}
                style={{background:"rgba(220,38,38,0.12)",border:"2px solid #dc2626",borderRadius:12,padding:"16px",textAlign:"center"}}>
                <div style={{fontSize:28,marginBottom:8}}>⚠️</div>
                <div style={{fontSize:13,color:"#f87171",marginBottom:4,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>¿RESETEAR TODOS LOS VOTOS?</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:14,fontFamily:"Barlow Condensed,sans-serif"}}>Esta acción no se puede deshacer.</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setResetConfirm(false)} style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:9,padding:"11px",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>CANCELAR</button>
                  <motion.button whileTap={{scale:0.96}} onClick={resetVotes} style={{flex:1,background:"linear-gradient(135deg,#dc2626,#7f1d1d)",border:"none",borderRadius:9,padding:"11px",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>SÍ, RESETEAR</motion.button>
                </div>
              </motion.div>
            ):(
              <motion.button whileTap={{scale:0.96}} onClick={()=>setResetConfirm(true)}
                style={{width:"100%",background:"rgba(220,38,38,0.08)",border:"1.5px dashed rgba(220,38,38,0.5)",borderRadius:11,padding:"13px",color:"#f87171",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
                🔄 RESETEAR TODOS LOS VOTOS
              </motion.button>
            )}
          </div>
          <div style={card("rgba(255,255,255,0.08)")}>
            {sectionTitle("#60a5fa","🔢","EDITAR VOTOS MANUALMENTE")}
            {PARTIES.map(p=>(
              <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,background:"rgba(255,255,255,0.03)",borderRadius:11,padding:"10px 12px",border:`1px solid ${p.color}18`}}>
                <div style={{width:28,height:28,borderRadius:7,overflow:"hidden",background:`${p.color}18`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",border:`1px solid ${p.color}40`}}>
                  {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]!} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:14}}>{p.emoji}</span>}
                </div>
                <span style={{flex:1,fontSize:13,fontWeight:800,color:"#fff",fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</span>
                <input type="number" min="0" value={votes[p.id]||0}
                  onChange={(e:any)=>setVotes((prev:any)=>({...prev,[p.id]:Math.max(0,parseInt(e.target.value)||0)}))}
                  style={{width:72,background:`${p.color}12`,border:`1.5px solid ${p.color}50`,borderRadius:9,padding:"8px 10px",color:p.color,fontSize:15,fontWeight:900,textAlign:"center",outline:"none",fontFamily:"Barlow Condensed,sans-serif"}}/>
              </div>
            ))}
          </div>
        </div>)}

        {/* ── CANDIDATOS ── */}
        {tab==="candidatos"&&(<div>
          <div style={card("rgba(59,130,246,0.3)")}>
            {sectionTitle("#3b82f6","🏙️","LOGO DE LA APP")}
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:10}}>
              <div style={{width:72,height:72,borderRadius:14,overflow:"hidden",border:"2px solid rgba(255,255,255,0.15)",background:"rgba(255,255,255,0.04)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>
                {siteLogo?<img src={siteLogo} alt="logo" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:"🗳️"}
              </div>
              <div style={{flex:1}}>
                <label style={{display:"inline-flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:9,padding:"10px 14px",color:"#fff",fontSize:10,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,marginBottom:6}}>
                  📤 SUBIR LOGO SILAO 360<input type="file" accept="image/*" onChange={uploadSiteLogo} style={{display:"none"}}/>
                </label>
                {siteLogo&&<div><button onClick={()=>setSiteLogo(null)} style={{background:"rgba(220,38,38,0.15)",border:"1px solid rgba(220,38,38,0.4)",borderRadius:7,padding:"5px 10px",color:"#f87171",fontSize:9,cursor:"pointer",fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>🗑 ELIMINAR</button></div>}
              </div>
            </div>
          </div>
          {/* Lista candidatos */}
          {PARTIES.map(p=>{
            const cand=candidates[p.id]||{nombre:"Por definir",cargo:"Candidato",fotoUrl:null,bio:""};
            const isEditing=editId===p.id;
            return(
              <div key={p.id} style={card(`${p.color}30`)}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:isEditing?14:0}}>
                  <div style={{width:48,height:48,borderRadius:12,overflow:"hidden",border:`2px solid ${p.color}60`,flexShrink:0,background:`${p.color}10`,position:"relative"}}>
                    {cand.fotoUrl?<img src={cand.fotoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{p.emoji}</div>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:900,color:p.color,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>{p.short}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",fontFamily:"Barlow Condensed,sans-serif"}}>{cand.nombre}</div>
                    <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",fontFamily:"Barlow Condensed,sans-serif"}}>{cand.cargo}</div>
                  </div>
                  <motion.button whileTap={{scale:0.93}} onClick={()=>{setEditId(isEditing?null:p.id);setEditData({...cand});}}
                    style={{background:isEditing?`${p.color}30`:"rgba(255,255,255,0.07)",border:`1.5px solid ${isEditing?p.color:"rgba(255,255,255,0.15)"}`,borderRadius:8,padding:"7px 12px",color:isEditing?p.color:"rgba(255,255,255,0.6)",fontSize:10,cursor:"pointer",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>
                    {isEditing?"✕ CERRAR":"✏️ EDITAR"}
                  </motion.button>
                </div>
                {isEditing&&(
                  <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} style={{borderTop:`1px solid ${p.color}30`,paddingTop:14}}>
                    {[{key:"nombre",ph:"Nombre del candidato",label:"NOMBRE"},{key:"cargo",ph:"Cargo o posición",label:"CARGO"},{key:"bio",ph:"Biografía breve...",label:"BIOGRAFÍA",multi:true}].map(f=>(
                      <div key={f.key} style={{marginBottom:10}}>
                        <div style={{fontSize:8,color:"rgba(255,255,255,0.4)",letterSpacing:2,marginBottom:4,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>{f.label}</div>
                        {f.multi
                          ?<textarea value={editData[f.key]||""} onChange={(e:any)=>setEditData((d:any)=>({...d,[f.key]:e.target.value}))} placeholder={f.ph} rows={3}
                            style={{width:"100%",background:"rgba(255,255,255,0.06)",border:`1.5px solid ${p.color}40`,borderRadius:9,padding:"10px 12px",color:"#fff",fontSize:12,outline:"none",resize:"none",fontFamily:"Barlow Condensed,sans-serif",boxSizing:"border-box"}}/>
                          :<input value={editData[f.key]||""} onChange={(e:any)=>setEditData((d:any)=>({...d,[f.key]:e.target.value}))} placeholder={f.ph}
                            style={{width:"100%",background:"rgba(255,255,255,0.06)",border:`1.5px solid ${p.color}40`,borderRadius:9,padding:"10px 12px",color:"#fff",fontSize:12,outline:"none",fontFamily:"Barlow Condensed,sans-serif",boxSizing:"border-box"}}/>}
                      </div>
                    ))}
                    <div style={{display:"flex",gap:8,marginTop:4}}>
                      <label style={{flex:1,background:`${p.color}18`,border:`1px solid ${p.color}50`,borderRadius:9,padding:"10px",color:p.color,fontSize:10,cursor:"pointer",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif",textAlign:"center"}}>
                        📸 FOTO<input type="file" accept="image/*" onChange={(e:any)=>uploadCandPhoto(p.id,e)} style={{display:"none"}}/>
                      </label>
                      <label style={{flex:1,background:`${p.color}18`,border:`1px solid ${p.color}50`,borderRadius:9,padding:"10px",color:p.color,fontSize:10,cursor:"pointer",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif",textAlign:"center"}}>
                        🖼️ LOGO<input type="file" accept="image/*" onChange={(e:any)=>uploadLogo(p.id,e)} style={{display:"none"}}/>
                      </label>
                      <motion.button whileTap={{scale:0.96}} onClick={saveCand}
                        style={{flex:2,background:`linear-gradient(135deg,${p.color},${p.color}aa)`,border:"none",borderRadius:9,padding:"10px",color:"#fff",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
                        💾 GUARDAR
                      </motion.button>
                    </div>
                    {saved&&<div style={{marginTop:8,fontSize:10,color:"#22c55e",textAlign:"center",fontFamily:"Barlow Condensed,sans-serif"}}>✅ Guardado correctamente</div>}
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>)}

        {/* ── PROPUESTAS ── */}
        {tab==="propuestas"&&(<div>
          <div style={card("rgba(167,139,250,0.3)")}>
            {sectionTitle("#a78bfa","➕","NUEVA PROPUESTA CIUDADANA")}
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input value={newPropEmoji} onChange={(e:any)=>setNewPropEmoji(e.target.value)} placeholder="💡"
                style={{width:52,background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(167,139,250,0.3)",borderRadius:10,padding:"11px 8px",color:"#fff",fontSize:20,textAlign:"center",outline:"none"}}/>
              <input value={newPropTitle} onChange={(e:any)=>setNewPropTitle(e.target.value)} placeholder="Título de la propuesta..."
                style={{flex:1,background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(167,139,250,0.3)",borderRadius:10,padding:"11px 13px",color:"#fff",fontSize:13,outline:"none",fontFamily:"Barlow Condensed,sans-serif"}}/>
            </div>
            <textarea value={newPropDesc} onChange={(e:any)=>setNewPropDesc(e.target.value)} placeholder="Descripción (opcional)..." rows={2}
              style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(167,139,250,0.2)",borderRadius:10,padding:"11px 13px",color:"#fff",fontSize:12,outline:"none",resize:"none",fontFamily:"Barlow Condensed,sans-serif",marginBottom:10,boxSizing:"border-box"}}/>
            <motion.button whileTap={{scale:0.96}} onClick={addProp} disabled={!newPropTitle.trim()}
              style={{width:"100%",background:newPropTitle.trim()?"linear-gradient(135deg,#7c3aed,#5b21b6)":"rgba(255,255,255,0.05)",border:"none",borderRadius:10,padding:"13px",color:newPropTitle.trim()?"#fff":"rgba(255,255,255,0.25)",fontSize:13,fontWeight:900,cursor:newPropTitle.trim()?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
              + PUBLICAR PROPUESTA
            </motion.button>
          </div>
          {(proposals||[]).length===0
            ?<div style={{textAlign:"center",padding:"32px",color:"rgba(255,255,255,0.2)",fontFamily:"Barlow Condensed,sans-serif",fontSize:12}}>Sin propuestas todavía</div>
            :(proposals||[]).map((pr:any)=>(
              <div key={pr.id} style={{...card("rgba(167,139,250,0.2)"),display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{width:40,height:40,borderRadius:11,background:"rgba(167,139,250,0.15)",border:"1px solid rgba(167,139,250,0.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{pr.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",marginBottom:3}}>{pr.titulo}</div>
                  {pr.desc&&<div style={{fontSize:10,color:"rgba(255,255,255,0.4)",fontFamily:"Barlow Condensed,sans-serif",marginBottom:6}}>{pr.desc}</div>}
                  <div style={{display:"flex",gap:10,fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:"Barlow Condensed,sans-serif"}}>
                    <span style={{color:"#22c55e"}}>✅ {pr.si}</span>
                    <span style={{color:"#f87171"}}>❌ {pr.no}</span>
                    <span>por {pr.autor}</span>
                  </div>
                </div>
                <motion.button whileTap={{scale:0.9}} onClick={()=>deleteProp(pr.id)}
                  style={{background:"rgba(220,38,38,0.12)",border:"1px solid rgba(220,38,38,0.3)",borderRadius:8,padding:"6px 9px",color:"#f87171",fontSize:9,cursor:"pointer",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif",flexShrink:0}}>
                  🗑
                </motion.button>
              </div>
            ))}
        </div>)}

        {/* ── PARTIDOS ── */}
        {tab==="partidos"&&(<div>
          <div style={card("rgba(249,115,22,0.3)")}>
            {sectionTitle("#f97316","🏛️","AGREGAR PARTIDO O MOVIMIENTO")}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:4,fontFamily:"Barlow Condensed,sans-serif"}}>NOMBRE COMPLETO</div>
                <input value={newPartyName} onChange={(e:any)=>setNewPartyName(e.target.value)} placeholder="ej. Partido Verde Silao"
                  style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(249,115,22,0.3)",borderRadius:9,padding:"10px 12px",color:"#fff",fontSize:12,outline:"none",fontFamily:"Barlow Condensed,sans-serif",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:4,fontFamily:"Barlow Condensed,sans-serif"}}>SIGLAS</div>
                <input value={newPartyShort} onChange={(e:any)=>setNewPartyShort(e.target.value)} placeholder="ej. PV"
                  style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(249,115,22,0.3)",borderRadius:9,padding:"10px 12px",color:"#fff",fontSize:12,outline:"none",fontFamily:"Barlow Condensed,sans-serif",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:8,alignItems:"center"}}>
              <div style={{flex:1}}>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:4,fontFamily:"Barlow Condensed,sans-serif"}}>CANDIDATO (OPCIONAL)</div>
                <input value={newPartyCand} onChange={(e:any)=>setNewPartyCand(e.target.value)} placeholder="Nombre del candidato"
                  style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(249,115,22,0.3)",borderRadius:9,padding:"10px 12px",color:"#fff",fontSize:12,outline:"none",fontFamily:"Barlow Condensed,sans-serif",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:4,fontFamily:"Barlow Condensed,sans-serif"}}>COLOR</div>
                <input type="color" value={newPartyColor} onChange={(e:any)=>setNewPartyColor(e.target.value)}
                  style={{width:48,height:40,background:"none",border:"none",cursor:"pointer",borderRadius:9}}/>
              </div>
            </div>
            <motion.button whileTap={{scale:0.96}} disabled={!newPartyName.trim()||!newPartyShort.trim()}
              onClick={()=>{
                if(!newPartyName.trim()||!newPartyShort.trim())return;
                const id="p_"+Date.now();
                PARTIES.push({id,short:newPartyShort.trim().toUpperCase(),name:newPartyName.trim(),color:newPartyColor,emoji:"🏛️",spectrumPos:50,spectrumLabel:"Centro",ideologyTags:["centro"],fundado:"Por confirmar",fundador:"Por confirmar",dirigente:"Por confirmar",militantes:"Por confirmar",gobiernos:"Por confirmar",descripcion:newPartyName.trim()+" — agregado desde admin.",curioso:"Partido agregado manualmente.",opinion:"Pendiente."});
                PARTY_LOGOS[id]=null;
                setCandidates((prev:any)=>({...prev,[id]:{nombre:newPartyCand.trim()||"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"Candidato de "+newPartyShort.trim()+"."}}));
                setVotes((prev:any)=>({...prev,[id]:0}));
                setNewPartyName("");setNewPartyShort("");setNewPartyColor("#6b7280");setNewPartyCand("");
                playSound("success");
              }}
              style={{width:"100%",background:newPartyName.trim()&&newPartyShort.trim()?"linear-gradient(135deg,#f97316,#ea580c)":"rgba(255,255,255,0.05)",border:"none",borderRadius:10,padding:"13px",color:newPartyName.trim()&&newPartyShort.trim()?"#fff":"rgba(255,255,255,0.2)",fontSize:13,fontWeight:900,cursor:newPartyName.trim()&&newPartyShort.trim()?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
              + AGREGAR A LA ENCUESTA
            </motion.button>
          </div>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:2,marginBottom:10,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>PARTIDOS REGISTRADOS ({PARTIES.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {PARTIES.map(p=>(
              <div key={p.id} style={{background:`linear-gradient(135deg,${p.color}0a,rgba(255,255,255,0.02))`,border:`1.5px solid ${p.color}30`,borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:44,height:44,borderRadius:11,overflow:"hidden",border:`2px solid ${p.color}60`,flexShrink:0,background:`${p.color}18`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]!} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:20}}>{p.emoji}</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:900,color:p.color,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>{p.short}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",fontFamily:"Barlow Condensed,sans-serif"}}>{votes[p.id]||0} votos · {p.spectrumLabel}</div>
                </div>
                <label style={{background:`${p.color}18`,border:`1.5px solid ${p.color}50`,borderRadius:9,padding:"8px 12px",color:p.color,fontSize:9,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,flexShrink:0}}>
                  🖼️ LOGO<input type="file" accept="image/*" onChange={(e:any)=>uploadLogo(p.id,e)} style={{display:"none"}}/>
                </label>
              </div>
            ))}
          </div>
        </div>)}

        {/* ── EXPORTAR ── */}
        {tab==="exportar"&&(<div>
          <div style={card("rgba(52,211,153,0.3)")}>
            {sectionTitle("#34d399","📥","EXPORTAR DATOS")}
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:4,fontFamily:"Barlow Condensed,sans-serif"}}>DESDE</div>
                <input type="date" value={exportFrom} onChange={(e:any)=>setExportFrom(e.target.value)}
                  style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(52,211,153,0.3)",borderRadius:9,padding:"10px",color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",letterSpacing:2,marginBottom:4,fontFamily:"Barlow Condensed,sans-serif"}}>HASTA</div>
                <input type="date" value={exportTo} onChange={(e:any)=>setExportTo(e.target.value)}
                  style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1.5px solid rgba(52,211,153,0.3)",borderRadius:9,padding:"10px",color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {[
                {label:"📊 EXPORTAR VOTOS CSV",color:"#059669",onClick:()=>{
                  const tot=Object.values(votes as Record<string,number>).reduce((a,b)=>a+b,0);
                  const csv=`Reporte Silao 360\nFecha:,${new Date().toLocaleDateString("es-MX")}\nTotal votos:,${tot}\n\nPartido,Votos,Porcentaje\n${PARTIES.map(p=>`${p.short},${votes[p.id]||0},${tot>0?((votes[p.id]||0)/tot*100).toFixed(1)+"%":"0%"}`).join("\n")}`;
                  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));a.download=`silao360_votos_${new Date().toISOString().slice(0,10)}.csv`;a.click();playSound("success");
                }},
                {label:"💬 EXPORTAR COMENTARIOS",color:"#7c3aed",onClick:()=>{
                  const csv=["Nick,Comentario,Fecha",...(comments||[]).map((c:any)=>`"${c.nick}","${c.txt.replace(/"/g,"'")}","${new Date(c.ts).toLocaleDateString("es-MX")}`)].join("\n");
                  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));a.download=`silao360_comentarios_${new Date().toISOString().slice(0,10)}.csv`;a.click();playSound("success");
                }},
              ].map(ex=>(
                <motion.button key={ex.label} whileTap={{scale:0.96}} onClick={ex.onClick}
                  style={{width:"100%",background:`linear-gradient(135deg,${ex.color},${ex.color}cc)`,border:"none",borderRadius:11,padding:"14px",color:"#fff",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
                  {ex.label}
                </motion.button>
              ))}
            </div>
          </div>
          {/* Mini preview */}
          <div style={card("rgba(255,255,255,0.06)")}>
            {sectionTitle("#94a3b8","👁️","PREVIEW ACTUAL")}
            {PARTIES.filter(p=>(votes[p.id]||0)>0).sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0)).map(p=>{
              const tot=Object.values(votes as Record<string,number>).reduce((a,b)=>a+b,0);
              const pct=tot>0?(votes[p.id]||0)/tot*100:0;
              return(
                <div key={p.id} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,color:p.color,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</span>
                    <span style={{fontSize:11,color:"#fff",fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>{votes[p.id]||0} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{height:5,background:"rgba(255,255,255,0.06)",borderRadius:5}}>
                    <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:.8}}
                      style={{height:"100%",background:p.color,borderRadius:5}}/>
                  </div>
                </div>
              );
            })}
            {total===0&&<div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,0.2)",fontFamily:"Barlow Condensed,sans-serif",padding:"16px 0"}}>Sin votos aún</div>}
          </div>
        </div>)}

        {/* ── CONFIG ── */}
        {tab==="config"&&(<div>
          <div style={card("rgba(148,163,184,0.2)")}>
            {sectionTitle("#94a3b8","🌐","DOMINIO / URL DE LA APP")}
            <input value="silao360.mx" readOnly
              style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"11px 14px",color:"rgba(255,255,255,0.5)",fontSize:13,outline:"none",fontFamily:"Barlow Condensed,sans-serif",marginBottom:6,boxSizing:"border-box"}}/>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.2)",fontFamily:"Barlow Condensed,sans-serif"}}>Solo informativo — cámbialo en el código fuente</div>
          </div>
          <div style={card("rgba(255,255,255,0.06)")}>
            {sectionTitle("#a78bfa","ℹ️","INFORMACIÓN DEL SISTEMA")}
            {[
              {label:"Versión",val:"Silao 360 v4.0"},
              {label:"Activar admin",val:"Toca el logo 5 veces"},
              {label:"Contraseña",val:"Configurada en código"},
              {label:"Realtime",val:"Supabase WebSocket ✅"},
              {label:"Auth",val:"Google + Facebook OAuth"},
            ].map(({label,val})=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.6)",fontFamily:"Barlow Condensed,sans-serif"}}>{label}</span>
                <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:"Barlow Condensed,sans-serif",textAlign:"right"}}>{val}</span>
              </div>
            ))}
          </div>
          <motion.button whileTap={{scale:0.96}} onClick={onClose}
            style={{width:"100%",background:"linear-gradient(135deg,#7f1d1d,#dc2626)",border:"none",borderRadius:13,padding:"16px",color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 20px rgba(220,38,38,0.3)"}}>
            🔒 CERRAR SESIÓN ADMIN
          </motion.button>
        </div>)}

        </div>
      </div>
    </div>
  );
}

// ── PERFIL SCREEN ──
function PerfilScreen({user,onLoginClick,onLogout,total,myVote,siteLogo,onLogoClick}){
  const party=PARTIES.find(p=>p.id===myVote);
  const{fecha,hora}=fullDate();
  const[isIOS]=useState(()=>/iphone|ipad|ipod/i.test(navigator.userAgent));
  const[isAndroid]=useState(()=>/android/i.test(navigator.userAgent));
  return(
    <div style={{paddingBottom:96,background:"linear-gradient(160deg,#0a0012,#1a0a2e,#0a0012)",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogout={onLogout} onLogoClick={onLogoClick} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        {/* FECHA Y HORA */}
        <div style={{textAlign:"center",padding:"16px 0 8px"}}>
          <div style={{fontSize:28,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",textTransform:"capitalize",textShadow:"0 0 16px rgba(167,139,250,0.7)"}}>{fecha}</div>
          <div style={{fontSize:40,fontWeight:900,color:"#ca8a04",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:4,textShadow:"0 0 20px rgba(202,138,4,0.7)"}}>{hora}</div>
        </div>

        {/* USUARIO */}
        {user?(
          <div style={{background:"rgba(255,255,255,0.05)",border:"2px solid rgba(255,255,255,0.12)",borderRadius:16,padding:"18px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:"0 0 20px rgba(124,58,237,0.6)"}}>🎭</div>
              <div>
                <div style={{fontSize:18,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif"}}>{user.nickname}</div>
                <div style={{fontSize:12,color:"rgba(196,181,253,0.6)",fontFamily:"Barlow Condensed,sans-serif"}}>{user.email}</div>
              </div>
            </div>
            {party&&<div style={{background:`${party.color}15`,border:`2px solid ${party.color}40`,borderRadius:12,padding:"12px",display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",border:`2px solid ${party.color}`}}>
                {PARTY_LOGOS[myVote]?<img src={PARTY_LOGOS[myVote]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:24,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{party.emoji}</span>}
              </div>
              <div><div style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontFamily:"Barlow Condensed,sans-serif"}}>TU VOTO ACTUAL</div><div style={{fontSize:18,fontWeight:900,color:party.color,fontFamily:"Barlow Condensed,sans-serif"}}>{party.short}</div></div>
            </div>}
            <motion.button whileTap={{scale:0.96}} onClick={onLogout}
              style={{width:"100%",background:"#e01010",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
              🚪 CERRAR SESIÓN
            </motion.button>
          </div>
        ):(
          <div style={{background:"rgba(255,255,255,0.04)",border:"2px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"20px",marginBottom:14,textAlign:"center"}}>
            <div style={{fontSize:44,marginBottom:10}}>🔐</div>
            <div style={{fontSize:18,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}>NO HAS INICIADO SESIÓN</div>
            <motion.button whileTap={{scale:0.96}} onClick={onLoginClick}
              style={{background:"#1877f2",border:"none",borderRadius:12,padding:"13px 24px",color:"#fff",fontSize:15,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>
              ENTRAR PARA VOTAR
            </motion.button>
          </div>
        )}

        {/* COMPARTIR */}
        <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:16,padding:"16px",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",marginBottom:12,letterSpacing:1}}>📣 COMPARTIR SILAO 360</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>window.open("https://api.whatsapp.com/send?text="+encodeURIComponent("🗳️ ENCUESTA SILAO 360\nParticipa: https://silao360.com.mx\n#Silao #Guanajuato"),"_blank")} style={{flex:1,background:"linear-gradient(135deg,#25d366,#128c4e)",border:"none",borderRadius:12,padding:"12px",color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>WA</button>
            <button onClick={()=>window.open("https://www.facebook.com/share/1CCfvKYYK1/?mibextid=wwXIfr","_blank")} style={{flex:1,background:"linear-gradient(135deg,#1877f2,#0d5cc7)",border:"none",borderRadius:12,padding:"12px",color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>FB</button>
            <button onClick={()=>window.open("https://www.silao360.com.mx","_blank")} style={{flex:1,background:"linear-gradient(135deg,#e01010,#8a0000)",border:"none",borderRadius:12,padding:"12px",color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>WEB</button>
          </div>
        </div>

        {/* INSTALAR APP */}
        <div style={{background:"linear-gradient(135deg,#1a0a2e,#2d1b69)",border:"2px solid #7c3aed",borderRadius:16,padding:"16px",marginBottom:14}}>
          <div style={{fontSize:16,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",marginBottom:14,letterSpacing:1}}>📲 INSTALAR ESTA APP</div>

          {/* iOS */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:900,color:"#60a5fa",fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}>🍎 IPHONE / IPAD (Safari)</div>
            {[
              "Abre esta página en Safari (no Chrome)",
              "Toca el botón Compartir (cuadro con flecha ↑ abajo)",
              "Baja y toca \"Agregar a pantalla de inicio\"",
              "Toca \"Agregar\" en la esquina superior derecha",
              "La app aparece como ícono en tu pantalla",
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:7}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"#1d4ed8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff",flexShrink:0}}>{i+1}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.85)",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1.5}}>{s}</div>
              </div>
            ))}
          </div>

          {/* Android */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:14,fontWeight:900,color:"#4ade80",fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}>🤖 ANDROID (Chrome)</div>
            {[
              "Abre esta página en Chrome",
              "Toca el menú ⋮ (tres puntos arriba a la derecha)",
              "Toca \"Agregar a pantalla de inicio\" o \"Instalar app\"",
              "Toca \"Agregar\" o \"Instalar\" en el diálogo",
              "La app aparece en tu pantalla de inicio",
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:7}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff",flexShrink:0}}>{i+1}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.85)",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1.5}}>{s}</div>
              </div>
            ))}
          </div>

          {/* Desktop */}
          <div>
            <div style={{fontSize:14,fontWeight:900,color:"#fbbf24",fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}>💻 COMPUTADORA (Chrome/Edge)</div>
            {[
              "Abre esta página en Chrome o Edge",
              "Busca el ícono de instalación (⊕) en la barra de dirección",
              "Si no aparece: menú ⋮ → \"Instalar Silao 360\"",
              "Haz clic en \"Instalar\" en el diálogo",
              "La app se abre como ventana independiente",
            ].map((s,i)=>(
              <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:7}}>
                <div style={{width:24,height:24,borderRadius:"50%",background:"#ca8a04",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:"#fff",flexShrink:0}}>{i+1}</div>
                <div style={{fontSize:13,color:"rgba(255,255,255,0.85)",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1.5}}>{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PELOTA REBOTANDO GLOBAL ──
// ── BOUNCING BALL — Voto estático con cambio de voto ──
function BouncingBall({myVote,onVote}){
  const party=PARTIES.find(p=>p.id===myVote);
  const logo=myVote?PARTY_LOGOS[myVote]:null;
  const[pos]=useState(()=>({
    x:Math.max(24,Math.min(window.innerWidth-90,window.innerWidth/2-30)),
    y:Math.max(80,window.innerHeight-240),
  }));
  const[exploded,setExploded]=useState(false);
  const[shards,setShards]=useState([]);
  const[countdown,setCountdown]=useState(null);
  const[showChangeMenu,setShowChangeMenu]=useState(false);
  const explodedRef=useRef(false);
  const SIZE=62;

  if(!myVote||!party)return null;

  const cx=pos.x+SIZE/2;
  const cy=pos.y+SIZE/2;

  const handleTap=()=>{
    if(explodedRef.current||showChangeMenu)return;
    explodedRef.current=true;
    setExploded(true);
    setShowChangeMenu(false);
    const pieces=Array.from({length:10},(_,i)=>{
      const angle=(i/10)*Math.PI*2;
      const speed=70+Math.random()*70;
      return{id:i,tx:Math.cos(angle)*speed,ty:Math.sin(angle)*speed,
        rot:Math.random()*720-360,size:10+Math.random()*16,
        color:party.color,shape:i%3};
    });
    setShards(pieces);
    let c=4; setCountdown(c);
    const tick=setInterval(()=>{c--;if(c<=0){clearInterval(tick);setCountdown(null);}else setCountdown(c);},1000);
    setTimeout(()=>{setExploded(false);explodedRef.current=false;setShards([]);},4000);
  };

  const handleChangeVote=(pid)=>{
    if(pid===myVote){setShowChangeMenu(false);return;}
    onVote(pid);
    setShowChangeMenu(false);
  };

  return(
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:250}}>
      {/* PEDAZOS */}
      <AnimatePresence>
        {exploded&&shards.map(s=>(
          <motion.div key={s.id}
            initial={{x:cx-s.size/2,y:cy-s.size/2,scale:1,opacity:1,rotate:0}}
            animate={{x:cx-s.size/2+s.tx,y:cy-s.size/2+s.ty,scale:0,opacity:0,rotate:s.rot}}
            exit={{opacity:0}}
            transition={{duration:0.65,ease:"easeOut"}}
            style={{position:"absolute",width:s.size,height:s.size,
              background:s.shape===0?`radial-gradient(circle,#fff,${party.color})`:party.color,
              borderRadius:s.shape===0?"50%":s.shape===1?"3px":"50% 0 50% 50%",
              boxShadow:`0 0 8px ${party.color}`,pointerEvents:"none"}}
          />
        ))}
      </AnimatePresence>

      {/* CUENTA REGRESIVA */}
      <AnimatePresence>
        {countdown!==null&&(
          <motion.div key={countdown}
            initial={{scale:1.8,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:0.5,opacity:0}}
            transition={{duration:0.3}}
            style={{position:"absolute",left:cx-30,top:cy-30,width:60,height:60,borderRadius:"50%",
              background:"rgba(0,0,0,0.82)",border:`3px solid ${party.color}`,
              display:"flex",alignItems:"center",justifyContent:"center",
              boxShadow:`0 0 22px ${party.color}`,pointerEvents:"none"}}>
            <span style={{fontSize:26,fontWeight:900,color:party.color,fontFamily:"Barlow Condensed,sans-serif"}}>{countdown}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MENÚ CAMBIAR VOTO */}
      <AnimatePresence>
        {showChangeMenu&&(
          <motion.div
            initial={{opacity:0,scale:0.85,y:10}}
            animate={{opacity:1,scale:1,y:0}}
            exit={{opacity:0,scale:0.85,y:10}}
            transition={{duration:0.2}}
            style={{
              position:"absolute",
              left:Math.min(pos.x-60,window.innerWidth-230),
              top:pos.y-200,
              width:220,
              background:"rgba(8,8,20,0.97)",
              border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:14,
              padding:"10px 8px",
              boxShadow:"0 8px 32px rgba(0,0,0,0.7)",
              pointerEvents:"auto",
              zIndex:260,
            }}>
            <div style={{fontSize:10,fontWeight:900,color:"rgba(255,255,255,0.4)",letterSpacing:2,textAlign:"center",marginBottom:8,fontFamily:"Barlow Condensed,sans-serif"}}>CAMBIAR VOTO</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
              {PARTIES.map(p=>{
                const isSelected=p.id===myVote;
                return(
                  <motion.button key={p.id} whileTap={{scale:0.93}}
                    onClick={()=>handleChangeVote(p.id)}
                    style={{
                      background:isSelected?`${p.color}22`:"rgba(255,255,255,0.04)",
                      border:`1.5px solid ${isSelected?p.color:"rgba(255,255,255,0.08)"}`,
                      borderRadius:9,padding:"6px 4px",cursor:"pointer",
                      display:"flex",flexDirection:"column",alignItems:"center",gap:3,
                      pointerEvents:"auto",
                    }}>
                    <div style={{width:28,height:28,borderRadius:"50%",overflow:"hidden",background:"#fff",border:`2px solid ${p.color}`,flexShrink:0}}>
                      {PARTY_LOGOS[p.id]
                        ?<img src={PARTY_LOGOS[p.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        :<span style={{fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.emoji}</span>}
                    </div>
                    <span style={{fontSize:8,fontWeight:900,color:isSelected?p.color:"rgba(255,255,255,0.5)",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:0.5,textAlign:"center",lineHeight:1.1}}>{p.short}</span>
                  </motion.button>
                );
              })}
            </div>
            <button onClick={()=>setShowChangeMenu(false)}
              style={{marginTop:8,width:"100%",background:"transparent",border:"none",color:"rgba(255,255,255,0.3)",fontSize:10,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,pointerEvents:"auto"}}>
              CANCELAR
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PELOTA PRINCIPAL */}
      <AnimatePresence>
        {!exploded&&(
          <motion.div key="ball"
            initial={{scale:0,opacity:0}} animate={{scale:1,opacity:1}}
            exit={{scale:[1,1.4,0],opacity:[1,1,0],transition:{duration:0.28}}}
            style={{position:"absolute",left:pos.x,top:pos.y,width:SIZE+60,pointerEvents:"auto",
              display:"flex",flexDirection:"column",alignItems:"center",gap:4,zIndex:251}}>

            {/* BOTÓN CAMBIAR VOTO — encima de la pelota */}
            <motion.button whileTap={{scale:0.93}}
              onClick={(e)=>{e.stopPropagation();setShowChangeMenu(v=>!v);}}
              style={{
                background:"linear-gradient(135deg,rgba(30,30,50,0.95),rgba(20,20,40,0.95))",
                border:`1.5px solid ${party.color}55`,
                borderRadius:20,
                padding:"4px 10px",
                color:party.color,
                fontSize:9,fontWeight:900,
                fontFamily:"Barlow Condensed,sans-serif",
                letterSpacing:1,
                cursor:"pointer",
                boxShadow:`0 2px 10px ${party.color}40`,
                whiteSpace:"nowrap",
                pointerEvents:"auto",
              }}>
              🔄 CAMBIAR VOTO
            </motion.button>

            {/* PELOTA */}
            <div style={{position:"relative",width:SIZE,height:SIZE,cursor:"pointer"}} onClick={handleTap}>
              {/* LED ring */}
              <div style={{
                position:"absolute",inset:-4,borderRadius:"50%",
                background:`conic-gradient(from 0deg,${party.color} 0deg,transparent 55deg,transparent 175deg,${party.color} 205deg,transparent 255deg)`,
                animation:"spinLedBorder 2s linear infinite",opacity:0.9,
              }}/>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",background:"rgba(5,5,15,0.92)",margin:3}}/>
              <div style={{position:"absolute",inset:4,borderRadius:"50%",background:"#fff",overflow:"hidden",
                boxShadow:`0 0 18px ${party.color}99,0 4px 14px rgba(0,0,0,0.5)`}}>
                {logo
                  ?<img src={logo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  :<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{party.emoji}</div>}
              </div>
            </div>

            {/* Label Tu voto cuenta */}
            <div style={{
              background:"rgba(0,0,0,0.7)",
              border:`1px solid ${party.color}44`,
              borderRadius:10,
              padding:"3px 8px",
              fontSize:8,fontWeight:900,
              fontFamily:"Barlow Condensed,sans-serif",
              color:"rgba(255,255,255,0.7)",
              letterSpacing:0.8,
              whiteSpace:"nowrap",
            }}>🗳️ Tu voto cuenta</div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── APP PRINCIPAL ──
export default function App(){
  const[screen,setScreen]=useState("results");
  const[votes,setVotes]=useState(()=>Object.fromEntries(PARTIES.map(p=>[p.id,0])));
  const[myVote,setMyVote]=useState(()=>{try{return localStorage.getItem("silao360_mivoto")||null;}catch(e){return null;}});
  const[user,setUser]=useState(null);
  const[showLogin,setShowLogin]=useState(false);
  const[showOnboarding,setShowOnboarding]=useState(false);
  const[authLoading,setAuthLoading]=useState(true);
  const[isAdmin,setIsAdmin]=useState(false);
  const[showAdminLogin,setShowAdminLogin]=useState(false);
  const[showAdminPanel,setShowAdminPanel]=useState(false);
  const adminTaps=useRef(0);const adminTimer=useRef(null);
  const[comments,setComments]=useState(DEMO_COMMENTS);
  const[blockedNicks]=useState([]);
  const[pinnedMsg]=useState("El silencio electoral es el arma favorita de quienes quieren que nada cambie. Aquí puedes opinar sin miedo. Tu apodo te protege.");
  const[candidates,setCandidates]=useState({...INIT_CANDIDATES});
  const[proposals,setProposals]=useState([...INIT_PROPOSALS]);
  const[siteLogo,setSiteLogo]=useState(null);
  const[encuestaActiva,setEncuestaActiva]=useState(true);
  const[alertaMsg,setAlertaMsg]=useState("");
  const[alertaActiva,setAlertaActiva]=useState(false);

  // ── Cargar votos desde Supabase ──
  const loadVotes=async()=>{
    try{
      const{data}=await supabase.from("votos").select("party_id");
      if(data){
        const counts=Object.fromEntries(PARTIES.map(p=>[p.id,0]));
        data.forEach(r=>{if(counts[r.party_id]!==undefined)counts[r.party_id]++;});
        setVotes(counts);
      }
    }catch(e){console.error("loadVotes:",e);}
  };
  const loadUserVote=async(uid)=>{
    try{
      const{data}=await supabase.from("votos").select("party_id").eq("user_id",uid).single();
      if(data?.party_id){setMyVote(data.party_id);try{localStorage.setItem("silao360_mivoto",data.party_id);}catch(e){}}
    }catch(e){}
  };
  const loadComments=async()=>{
    try{
      const{data}=await supabase.from("comentarios").select("*").order("created_at",{ascending:false}).limit(100);
      if(data){setComments(data.map(c=>({id:c.id,nick:c.nick,txt:c.txt,ts:new Date(c.created_at).getTime(),reactions:c.reactions||{like:0,heart:0,fire:0,wow:0,haha:0},myReacted:{},replies:[]})));}
    }catch(e){console.error("loadComments:",e);}
  };
  const loadProposals=async()=>{
    try{
      const{data}=await supabase.from("propuestas").select("*").order("created_at",{ascending:false}).limit(50);
      if(data){setProposals(data.map(p=>({id:p.id,emoji:p.emoji||"💡",titulo:p.titulo,desc:p.descripcion||"",si:p.si||0,no:p.no||0,miVoto:null,autor:p.autor||"Ciudadano"})));}
    }catch(e){console.error("loadProposals:",e);}
  };

  // ── Supabase auth session ──
  useEffect(()=>{
    loadVotes();
    loadComments();
    loadProposals();
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){
        const u=session.user;
        const nick=genNickname(u.id);
        setUser({id:u.id,nickname:nick,email:u.email,name:u.user_metadata?.full_name||u.email});
        loadUserVote(u.id);
      } else {
        setShowOnboarding(true);
      }
      setAuthLoading(false);
    });
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      if(session?.user){
        const u=session.user;
        const nick=genNickname(u.id);
        setUser({id:u.id,nickname:nick,email:u.email,name:u.user_metadata?.full_name||u.email});
        setShowOnboarding(false);
        loadUserVote(u.id);
      } else {
        setUser(null);
        setShowOnboarding(true);
      }
    });
    // Realtime
    const ch1=supabase.channel("votos-rt").on("postgres_changes",{event:"*",schema:"public",table:"votos"},()=>loadVotes()).subscribe();
    const ch2=supabase.channel("comments-rt").on("postgres_changes",{event:"*",schema:"public",table:"comentarios"},()=>loadComments()).subscribe();
    const ch3=supabase.channel("proposals-rt").on("postgres_changes",{event:"*",schema:"public",table:"propuestas"},()=>loadProposals()).subscribe();
    return()=>{subscription.unsubscribe();supabase.removeChannel(ch1);supabase.removeChannel(ch2);supabase.removeChannel(ch3);};
  },[]);

  const handleLogout=async()=>{
    await supabase.auth.signOut();
    setUser(null);setMyVote(null);
    try{localStorage.removeItem("silao360_mivoto");}catch(e){}
    setShowOnboarding(true);setScreen("results");
  };

  const total=Object.values(votes).reduce((a,b)=>a+b,0);

  // ── Votar real en Supabase ──
  const handleVote=async(id)=>{
    if(!user)return;
    setVotes(prev=>{const next={...prev};if(myVote&&next[myVote]>0)next[myVote]--;next[id]=(next[id]||0)+1;return next;});
    setMyVote(id);
    try{localStorage.setItem("silao360_mivoto",id);}catch(e){}
    try{
      await supabase.from("votos").upsert({user_id:user.id,party_id:id,nickname:user.nickname,updated_at:new Date().toISOString()},{onConflict:"user_id"});
    }catch(e){console.error("saveVote:",e);}
  };
  const handleLogoClick=()=>{
    setScreen("results");
    adminTaps.current+=1;
    if(adminTimer.current)clearTimeout(adminTimer.current);
    adminTimer.current=setTimeout(()=>{adminTaps.current=0;},2500);
    if(adminTaps.current>=5){adminTaps.current=0;if(isAdmin){setIsAdmin(false);setShowAdminPanel(false);}else{setShowAdminLogin(true);}}
  };
  const sp={votes,total,user,onLoginClick:()=>setShowLogin(true),onLogout:handleLogout,onLogoClick:handleLogoClick,siteLogo};

  if(authLoading)return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",background:"linear-gradient(160deg,#0f172a,#1e1b4b)",flexDirection:"column",gap:16}}>
      <div style={{width:48,height:48,border:"4px solid rgba(255,255,255,0.1)",borderTopColor:"#e01010",borderRadius:"50%",animation:"spin .8s linear infinite"}}/>
      <div style={{fontSize:16,color:"rgba(255,255,255,0.5)",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2}}>SILAO 360</div>
    </div>
  );

  return(
    <div style={{background:"#f8faff",minHeight:"100vh",color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes pd{0%,100%{opacity:1}50%{opacity:.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes logoPulse{0%,100%{box-shadow:0 3px 14px rgba(224,16,16,0.45)}50%{box-shadow:0 3px 26px rgba(224,16,16,0.8),0 0 40px rgba(224,16,16,0.3)}}
        @keyframes barraShine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes glow360{0%,100%{text-shadow:0 0 8px rgba(255,107,107,0.5)}50%{text-shadow:0 0 16px rgba(255,107,107,1)}}
        @keyframes ledSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes ledShimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes ledScan{0%,100%{opacity:0.3;transform:scaleY(0.4)}50%{opacity:1;transform:scaleY(1)}}
        @keyframes ballSpin{0%,100%{box-shadow:0 0 12px #e01010,0 4px 12px rgba(0,0,0,0.3)}50%{box-shadow:0 0 28px #e01010,0 4px 20px rgba(0,0,0,0.4)}}
        @keyframes spinLedBorder{to{transform:rotate(360deg)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#c4b5fd}
        input::placeholder{color:#9ca3af}
        textarea::placeholder{color:#6b7280}
      `}</style>
      {isAdmin&&<div onClick={()=>setShowAdminPanel(true)} style={{position:"fixed",top:0,left:0,right:0,zIndex:999,background:"linear-gradient(90deg,#5b21b6,#7c3aed)",padding:"4px 16px",textAlign:"center",fontSize:11,color:"#fff",fontWeight:800,letterSpacing:2,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>⚙️ ADMIN ACTIVO — TOCA PARA ABRIR PANEL</div>}
      {alertaActiva&&alertaMsg&&<div style={{position:"fixed",top:isAdmin?22:0,left:0,right:0,zIndex:998,background:"linear-gradient(90deg,#dc2626,#b91c1c)",padding:"6px 16px",textAlign:"center",fontSize:12,color:"#fff",fontWeight:800,letterSpacing:1,fontFamily:"Barlow Condensed,sans-serif"}}>📢 {alertaMsg}</div>}
      <AnimatePresence>{showAdminLogin&&<AdminLogin onSuccess={()=>{setIsAdmin(true);setShowAdminLogin(false);setShowAdminPanel(true);}} onCancel={()=>setShowAdminLogin(false)}/>}</AnimatePresence>
      {showAdminPanel&&isAdmin&&<AdminPanel candidates={candidates} setCandidates={setCandidates} siteLogo={siteLogo} setSiteLogo={setSiteLogo} onClose={()=>setShowAdminPanel(false)} votes={votes} setVotes={setVotes} proposals={proposals} setProposals={setProposals} comments={comments} encuestaActiva={encuestaActiva} setEncuestaActiva={setEncuestaActiva} alertaMsg={alertaMsg} setAlertaMsg={setAlertaMsg} alertaActiva={alertaActiva} setAlertaActiva={setAlertaActiva} blockedNicks={blockedNicks}/>}
      <AnimatePresence>{showOnboarding&&<OnboardingModal onSkip={()=>setShowOnboarding(false)}/>}</AnimatePresence>
      {!showOnboarding&&(<>
        <AnimatePresence>{showLogin&&<LoginModal onClose={()=>setShowLogin(false)}/>}</AnimatePresence>
        <div style={{paddingTop:isAdmin&&alertaActiva?46:isAdmin||alertaActiva?22:0}}>
          {screen==="results"&&<ResultsScreen {...sp} myVote={myVote} setScreen={setScreen}/>}
          {screen==="vote"&&<VoteScreen {...sp} myVote={myVote} onVote={handleVote} candidates={candidates} setScreen={setScreen}/>}
          {screen==="proposals"&&<ProposalsScreen {...sp} proposals={proposals} setProposals={setProposals} isAdmin={isAdmin}/>}
          {screen==="articles"&&<ArticlesScreen {...sp} candidates={candidates}/>}
          {screen==="comments"&&<CommentsScreen {...sp} isAdmin={isAdmin} comments={comments} setComments={setComments} blockedNicks={blockedNicks} pinnedMsg={pinnedMsg}/>}
          {screen==="perfil"&&<PerfilScreen {...sp} myVote={myVote}/>}
        </div>
        <InstallBanner/>
        <BouncingBall myVote={myVote} onVote={handleVote}/>
        <NavBar screen={screen} setScreen={setScreen}/>
      </>)}
    </div>
  );
}
