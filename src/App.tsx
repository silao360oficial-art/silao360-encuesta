import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from "recharts";

// ── SUPABASE ──
const SUPABASE_URL = "https://irekcyeoumxnwbtonfup.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZWtjeWVvdW14bndidG9uZnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTczMzAsImV4cCI6MjA5NDc5MzMzMH0.gzmCwhJBeaabl83Q4W6cMhpk0Ofwg0OrHaYou9_ksL0";

const H = {"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json"};

// Builder que acumula filtros/orden/limit antes de ejecutar
function sbQuery(table, params={}) {
  const q = {...params};
  const run = () => {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=${q.select||"*"}`;
    if(q.filters) q.filters.forEach(f=>{ url+=`&${f.col}=${f.op}.${encodeURIComponent(f.val)}`; });
    if(q.order)  url+=`&order=${q.order.col}.${q.order.asc?"asc":"desc"}`;
    if(q.limit)  url+=`&limit=${q.limit}`;
    return fetch(url,{headers:H}).then(r=>r.json()).then(d=>Array.isArray(d)?d:[]).catch(()=>[]);
  };
  return {
    then: (res,rej) => run().then(res,rej),    // thenable — permite await y .then()
    catch: (fn) => run().catch(fn),
    select: (cols) => sbQuery(table,{...q,select:cols}),
    eq:     (col,val) => sbQuery(table,{...q,filters:[...(q.filters||[]),{col,op:"eq",val}]}),
    order:  (col,opts={}) => sbQuery(table,{...q,order:{col,asc:!!opts.ascending}}),
    limit:  (n) => sbQuery(table,{...q,limit:n}),
  };
}

const sb = {
  from: (table) => ({
    select: (cols="*") => sbQuery(table,{select:cols}),
    insert: (data) => fetch(`${SUPABASE_URL}/rest/v1/${table}`,{
      method:"POST",
      headers:{...H,"Prefer":"return=minimal"},
      body:JSON.stringify(data)
    }).then(r=>r.ok?{}:r.json()).catch(()=>({})),
    delete: () => ({
      eq: (col,val) => fetch(`${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${encodeURIComponent(val)}`,{
        method:"DELETE", headers:H
      }).then(r=>r.ok?{}:r.json()).catch(()=>({}))
    }),
  }),
};

// ── PREGUNTAS POR CATEGORÍA ──
const PREGUNTAS = {
  "🔒 Seguridad": [
    "¿Cuál es tu plan real para mejorar la seguridad en Silao?",
    "¿Cómo vas a mejorar la seguridad sin solo prometer más patrullas?",
    "¿Qué harás para que la policía realmente responda rápido?",
    "¿Cómo mejorarás la atención de policías y tránsito?",
    "¿Qué harás para proteger a mujeres y niños?",
  ],
  "🏗️ Infraestructura": [
    "¿Cómo vas a reparar el problema de baches y calles dañadas?",
    "¿Qué harás para evitar más socavones y problemas de drenaje?",
    "¿Cuándo dejarán de arreglar las mismas calles una y otra vez?",
    "¿Qué harás para que no vuelva a pasar lo del socavón de la federal 45?",
    "¿Cuál es tu propuesta para mejorar la iluminación en calles?",
    "¿Por qué tantas calles siguen oscuras por las noches?",
    "¿Cómo vas a mejorar el transporte y las vialidades?",
    "¿Cómo planeas mejorar el transporte público?",
    "¿Qué harás para el servicio de agua?",
    "¿Qué harás para limpiar Silao y reducir la basura en calles y lotes?",
    "¿Qué harás para reducir la contaminación?",
  ],
  "💰 Economía y Empleos": [
    "¿Cómo generarás más empleos bien pagados en Silao?",
    "¿Qué harás para atraer inversión sin afectar a las colonias?",
    "¿Qué harás para apoyar a la gente que trabaja y gana poco?",
    "¿Cómo apoyarás a comerciantes y pequeños negocios?",
  ],
  "🏥 Servicios Sociales": [
    "¿Qué apoyo darás a jóvenes y estudiantes?",
    "¿Cómo ayudarás a los jóvenes que no encuentran oportunidades?",
    "¿Qué harás para mejorar hospitales y centros de salud?",
    "¿Cómo piensas recuperar espacios públicos y parques?",
    "¿Qué harás para que los parques y espacios públicos vuelvan a servir?",
    "¿Cómo apoyarás a las comunidades rurales de Silao?",
    "¿Qué harás para que las comunidades rurales no sigan abandonadas?",
  ],
  "🧾 Transparencia": [
    "¿Cómo combatirás la corrupción en el municipio?",
    "¿Publicarás en qué se gasta cada peso del presupuesto?",
    "¿Cómo vas a evitar que el presupuesto termine en obras mal hechas?",
    "¿Por qué en Silao las obras tardan tanto y afectan a todos?",
    "¿Por qué hay colonias olvidadas mientras otras siempre reciben apoyo?",
  ],
  "🔥 Virales": [
    "¿Qué es lo primero que arreglarías en Silao si mañana fueras alcalde?",
    "¿Qué colonia necesita atención urgente y por qué?",
    "¿Qué obra consideras un desperdicio de dinero?",
    "¿Qué le responderías a la gente que ya no cree en los políticos?",
    "¿Qué problema de Silao te da vergüenza que siga igual?",
    "¿Qué cambiará realmente contigo y no solo en campaña?",
    "¿Cuál es el problema más grave de Silao y cómo lo resolverías?",
    "¿Si ganas, qué resultado concreto verá la gente en tu primer año?",
    "¿Por qué la ciudadanía debería confiar en ti?",
  ],
};


const playSound = (type) => {
  const map = {
    click: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA",
    success: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAA",
  };
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

// ── LOGOS ──
const LOGO_PAN = null;
const LOGO_MORENA = null;
const LOGO_PRI = null;
const LOGO_MC = null;
const LOGO_PVEM = null;
const LOGO_PT = null;
const LOGO_SOMOSMX = null;
const LOGO_SOMBRERO = null;
const LOGO_SILAO360 = null;

const PARTY_LOGOS = {
  pan: LOGO_PAN, morena: LOGO_MORENA, pri: LOGO_PRI, mc: LOGO_MC,
  pvem: LOGO_PVEM, pt: LOGO_PT, somosmx: LOGO_SOMOSMX, sombrero: LOGO_SOMBRERO,
};

// ── DATOS ──
const PARTIES = [
  { id:"pan", short:"PAN", name:"Partido Acción Nacional", color:"#1a6fd4", emoji:"🔵", spectrumPos:72, spectrumLabel:"Centro-Derecha", ideologyTags:["derecha","conservador"], fundado:"16 sep 1939", fundador:"Manuel Gómez Morín", dirigente:"Jorge Romero Herrera", militantes:"300,000", gobiernos:"Guanajuato desde 1991", descripcion:"Partido fundado en 1939 con doctrina de humanismo cristiano, libre mercado y valores familiares. Ha gobernado el estado de Guanajuato de manera continua desde 1991.", curioso:"💡 El PAN fue el primer partido en ganar la presidencia al PRI en el año 2000, después de 71 años de alternancia pendiente.", opinion:"El PAN tiene presencia histórica en Guanajuato. Para la Encuesta Silao, los ciudadanos podrán evaluar su propuesta y trayectoria municipal." },
  { id:"morena", short:"MORENA", name:"Mov. Regeneración Nacional", color:"#b91c1c", emoji:"🔴", spectrumPos:26, spectrumLabel:"Centro-Izquierda", ideologyTags:["izquierda","populismo","nacionalismo"], fundado:"2 oct 2011", fundador:"Andrés Manuel López Obrador", dirigente:"Ariadna Montiel Reyes", militantes:"2.3 millones", gobiernos:"Gobierno federal 2018-2030, 21 gobernadores", descripcion:"Partido fundado en 2011 con enfoque en transformación social, reducción de desigualdades y fortalecimiento de programas sociales. Gobierna a nivel federal desde 2018.", curioso:"💡 Morena es uno de los partidos de crecimiento más rápido en la historia de México, pasando de su fundación a ganar la presidencia en 7 años.", opinion:"Morena cuenta con presencia nacional y programas sociales activos. Para la Encuesta Silao, los ciudadanos podrán evaluar su propuesta municipal concreta." },
  { id:"pri", short:"PRI", name:"Partido Revolucionario Institucional", color:"#c2410c", emoji:"🟤", spectrumPos:50, spectrumLabel:"Centro", ideologyTags:["centro","nacionalismo"], fundado:"4 mar 1929", fundador:"Plutarco Elías Calles", dirigente:"Alejandro Moreno Cárdenas", militantes:"Aprox. 4 millones", gobiernos:"Durango y Coahuila a nivel estatal", descripcion:"Partido con más de 90 años de historia en México. Gobernó el país de forma ininterrumpida de 1929 a 2000. Cuenta con estructura organizativa en todo el territorio nacional.", curioso:"💡 El PRI gobernó México durante 71 años consecutivos, siendo uno de los partidos con mayor continuidad en el poder en la historia política mundial.", opinion:"El PRI cuenta con larga trayectoria e infraestructura organizativa. Para la Encuesta Silao, los ciudadanos podrán evaluar su propuesta y candidato." },
  { id:"mc", short:"MOV. CIUDADANO", name:"Movimiento Ciudadano", color:"#ea580c", emoji:"🟠", spectrumPos:38, spectrumLabel:"Centro-Izquierda", ideologyTags:["centro","socialdemocrata","progresismo"], fundado:"1999", fundador:"Dante Delgado Rannauro", dirigente:"Jorge Álvarez Máynez", militantes:"800,000", gobiernos:"Jalisco, Nuevo León", descripcion:"Partido con presencia en todo el país y experiencia de gobierno en estados como Jalisco y Nuevo León. Su plataforma combina desarrollo económico con justicia social.", curioso:"💡 Movimiento Ciudadano postuló candidato presidencial propio en 2024 sin alianzas con otros partidos, algo poco común en la política mexicana.", opinion:"MC tiene experiencia de gobierno estatal reciente. Para la Encuesta Silao, los ciudadanos podrán evaluar su propuesta y candidato local." },
  { id:"pvem", short:"PVEM", name:"Partido Verde Ecologista", color:"#16a34a", emoji:"🌿", spectrumPos:48, spectrumLabel:"Centro", ideologyTags:["centro","populismo"], fundado:"1986", fundador:"Jorge González Torres", dirigente:"Karen Castrejón Trujillo", militantes:"500,000", gobiernos:"Participa en coaliciones a nivel federal y estatal", descripcion:"Partido fundado con enfoque en temas ambientales y ecológicos. Ha participado en diversas coaliciones electorales a lo largo de su historia.", curioso:"💡 El PVEM es uno de los partidos ecologistas más antiguos de México, fundado en 1986 con el objetivo de promover políticas de protección ambiental.", opinion:"El PVEM tiene presencia en varias regiones del país. Para la Encuesta Silao, los ciudadanos podrán evaluar su propuesta local." },
  { id:"pt", short:"PT", name:"Partido del Trabajo", color:"#dc2626", emoji:"✊", spectrumPos:18, spectrumLabel:"Izquierda", ideologyTags:["izquierda","socialdemocrata"], fundado:"13 ene 1992", fundador:"Alberto Anaya Gutiérrez", dirigente:"Alberto Anaya Gutiérrez", militantes:"457,000", gobiernos:"Participa en coaliciones a nivel federal y local", descripcion:"Partido de izquierda fundado en 1992. Su plataforma se centra en derechos laborales, justicia social y fortalecimiento de los trabajadores.", curioso:"💡 El PT ha participado en elecciones presidenciales desde 1994, representando consistentemente a sectores de izquierda en la política mexicana.", opinion:"El PT tiene presencia a nivel nacional. Para la Encuesta Silao, los ciudadanos podrán evaluar su propuesta y candidato en el municipio." },
  { id:"somosmx", short:"SOMOS MX", name:"Somos MX — La Fuerza que nos Une", color:"#db2777", emoji:"🩷", spectrumPos:35, spectrumLabel:"Centro-Izquierda", ideologyTags:["progresismo","centro"], fundado:"2020", fundador:"Por confirmar", dirigente:"Por confirmar", militantes:"Por confirmar", gobiernos:"Movimiento en desarrollo", descripcion:"Movimiento político enfocado en la participación ciudadana, la unidad comunitaria y la representación de sectores no atendidos por partidos tradicionales.", curioso:"💡 Somos MX representa una nueva generación de movimientos políticos que buscan mayor participación directa de la comunidad en las decisiones públicas.", opinion:"Somos MX es una fuerza emergente. Para la Encuesta Silao, los ciudadanos podrán evaluar su propuesta y nivel de organización local." },
  { id:"sombrero", short:"MOV. SOMBRERO", name:"Movimiento Independiente del Sombrero", color:"#a16207", emoji:"🤠", spectrumPos:55, spectrumLabel:"Centro / Independiente", ideologyTags:["centro","nacionalismo"], fundado:"2024", fundador:"Por confirmar", dirigente:"Por confirmar", militantes:"Por confirmar", gobiernos:"Movimiento local independiente", descripcion:"Movimiento político local que recupera la identidad cultural del Bajío como eje de su propuesta. Busca representar a ciudadanos silaoenses desde una perspectiva independiente.", curioso:"💡 El sombrero charro es símbolo histórico del Bajío y de Silao. Este movimiento lo adopta como emblema de identidad regional y cultural.", opinion:"El Movimiento del Sombrero es una opción local independiente. Para la Encuesta Silao, los ciudadanos podrán evaluar su propuesta y organización." },
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
  pan:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"El PAN aún no ha anunciado candidato oficial para el municipio."},
  morena:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"Morena aún no ha anunciado candidato oficial para el municipio."},
  pri:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"El PRI aún no ha anunciado candidato oficial para el municipio."},
  mc:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"MC aún no ha anunciado candidato oficial para el municipio."},
  pvem:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"PVEM aún no ha anunciado candidato oficial para el municipio."},
  pt:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"PT aún no ha anunciado candidato oficial para el municipio."},
  somosmx:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"Somos MX aún no ha anunciado candidato oficial para el municipio."},
  sombrero:{nombre:"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"Movimiento Independiente del Sombrero aún no ha anunciado candidato."},
  independiente:{nombre:"Por definir",cargo:"Candidato Independiente",fotoUrl:null,bio:"Candidatura independiente — se publicará cuando esté registrada."},
  nulo:{nombre:"No aplica",cargo:"",fotoUrl:null,bio:"Esta opción representa a ciudadanos indecisos."},
};

const INIT_PROPOSALS = [
  {id:"p1",emoji:"🚔",titulo:"Cámaras corporales para policías",desc:"Mayor transparencia y protección ciudadana en cada operativo",si:842,no:91,miVoto:null,autor:"Encuesta Silao"},
  {id:"p2",emoji:"💡",titulo:"Alumbrado LED en colonias periféricas",desc:"Reducir zonas oscuras para aumentar seguridad en las noches",si:631,no:44,miVoto:null,autor:"Encuesta Silao"},
  {id:"p3",emoji:"🛣️",titulo:"Bacheo prioritario en colonias populares",desc:"Priorizar reparación de calles en colonias con más deterioro",si:912,no:18,miVoto:null,autor:"Encuesta Silao"},
  {id:"p4",emoji:"🌳",titulo:"Parques en cada colonia sin área verde",desc:"Espacios de convivencia seguros para familias silaoenses",si:524,no:63,miVoto:null,autor:"Encuesta Silao"},
  {id:"p5",emoji:"📢",titulo:"Cabildo abierto mensual transmitido en vivo",desc:"Que cualquier ciudadano pueda ver cómo se toman las decisiones",si:778,no:102,miVoto:null,autor:"Encuesta Silao"},
];

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

const DEMO_COMMENTS = []
const REACTION_MAP=[{k:"like",e:"👍"},{k:"heart",e:"❤️"},{k:"fire",e:"🔥"},{k:"wow",e:"😮"},{k:"haha",e:"😂"}];
const NICK_ADJ=["Águila","Voz","Guardián","Centinela","Latido","Llama","Pulso","Chispa","Fuerza","Luz","Eco","Espíritu","Raíz","Flama"];
const NICK_NOUN=["Silaoense","del Bajío","Guanajuatense","de Silao","del Centro","de Acero","Valiente","Libre","Rebelde","Citadino"];
function genNickname(seed){let h=5381;for(let i=0;i<seed.length;i++)h=((h<<5)+h)^seed.charCodeAt(i);const n=Math.abs(h>>8)%90+10;return`${NICK_ADJ[Math.abs(h)%NICK_ADJ.length]} ${NICK_NOUN[Math.abs(h>>4)%NICK_NOUN.length]} #${n}`;}
function timeAgo(ts){const d=(Date.now()-ts)/1000;if(d<60)return"ahora";if(d<3600)return`hace ${Math.floor(d/60)}m`;if(d<86400)return`hace ${Math.floor(d/3600)}h`;return`hace ${Math.floor(d/86400)}d`;}

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
  const ballots=Array.from({length:16},(_,i)=>({x:`${4+(i*5.8)%92}%`,delay:i*0.22,dur:6+i%3}));
  useEffect(()=>{playSound("modal");},[]);
  const FRASES=[
    {icon:"🚫💰",titulo:"TU VOTO NO ESTÁ EN VENTA",color:"#e01010",frase:"\"Tu voto no tiene precio. Que nadie compre tu decisión, porque después el costo lo paga todo el pueblo.\""},
    {icon:"⚖️",titulo:"LA CORRUPCIÓN TIENE PRECIO",color:"#f97316",frase:"\"El que reparte dinero en campaña, luego recupera todo cuando llega al poder. Con intereses.\""},
    {icon:"🗳️",titulo:"TU SILENCIO ES SU ARMA",color:"#7c3aed",frase:"\"El silencio electoral es el arma favorita de quienes quieren que nada cambie.\""},
    {icon:"🔥",titulo:"SILAO MERECE MÁS",color:"#ca8a04",frase:"\"Una sola persona informada que vota vale más que cien que se venden por una despensa.\""},
  ];
  return(
    <AnimatePresence>
      <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
        style={{position:"fixed",inset:0,zIndex:400,background:"rgba(0,0,0,0.95)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflow:"hidden"}}>
        {/* Papeletas cayendo */}
        {ballots.map((b,i)=>(
          <motion.div key={i} initial={{y:-100,x:b.x,rotate:-20,opacity:0.8}} animate={{y:"110vh",rotate:380,opacity:0}}
            transition={{duration:b.dur,delay:b.delay,repeat:Infinity,ease:"linear"}}
            style={{position:"fixed",top:0,left:b.x,pointerEvents:"none",zIndex:401}}>
            <div style={{background:"#fff",border:"2px solid #e01010",borderRadius:8,padding:"5px 7px",textAlign:"center",fontSize:8,fontWeight:900,color:"#e01010",lineHeight:1.3,width:52}}>
              <div style={{color:"#6b7280",fontSize:6,marginBottom:1}}>SILAO {new Date().getFullYear()}</div>
              VOTO LIBRE
            </div>
          </motion.div>
        ))}

        <motion.div initial={{scale:0.75,opacity:0,y:50}} animate={{scale:1,opacity:1,y:0}}
          transition={{type:"spring",stiffness:300,damping:24}}
          style={{position:"relative",maxWidth:380,width:"100%",zIndex:402}}>
          {/* LED border giratorio en la tarjeta */}
          <div style={{position:"absolute",inset:-3,borderRadius:27,background:"conic-gradient(from 0deg,#e01010,#f97316,#fbbf24,#7c3aed,#e01010)",animation:"ledSpin 2.5s linear infinite",opacity:0.9}}/>
          <div style={{position:"relative",background:"#0d0a1e",borderRadius:24,padding:"24px 18px",border:"3px solid transparent"}}>

            {/* Título con efecto */}
            <div style={{textAlign:"center",marginBottom:18}}>
              <motion.div animate={{scale:[1,1.08,1]}} transition={{duration:1.5,repeat:Infinity}} style={{fontSize:52,marginBottom:8}}>🚫💰</motion.div>
              <div style={{position:"relative",display:"inline-block"}}>
                <div style={{position:"absolute",inset:-2,borderRadius:10,background:"conic-gradient(from 0deg,#e01010,transparent,#e01010)",animation:"ledSpin 1.8s linear infinite",filter:"blur(1px)"}}/>
                <div style={{position:"relative",background:"#0d0a1e",borderRadius:8,padding:"6px 16px"}}>
                  <div style={{fontSize:20,fontWeight:900,color:"#e01010",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2,textShadow:"0 0 20px rgba(224,16,16,0.8)"}}>TU VOTO NO ESTÁ EN VENTA</div>
                </div>
              </div>
            </div>

            {/* Frases con LED de color */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
              {FRASES.map((f,i)=>(
                <motion.div key={i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.12}}
                  style={{position:"relative",borderRadius:14,overflow:"hidden"}}>
                  <div style={{position:"absolute",inset:0,background:`conic-gradient(from ${i*90}deg,${f.color}33,transparent,${f.color}22,transparent)`,animation:`ledSpin ${2.5+i*0.3}s linear infinite`}}/>
                  <div style={{position:"relative",background:"rgba(255,255,255,0.04)",border:`1.5px solid ${f.color}44`,borderRadius:14,padding:"13px 14px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                      <span style={{fontSize:18}}>{f.icon}</span>
                      <div style={{fontSize:10,fontWeight:900,color:f.color,letterSpacing:1.5,fontFamily:"Barlow Condensed,sans-serif"}}>{f.titulo}</div>
                    </div>
                    <div style={{fontSize:13,color:"rgba(255,255,255,0.85)",lineHeight:1.7,fontStyle:"italic",fontFamily:"Barlow Condensed,sans-serif",fontWeight:600}}>{f.frase}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Botón cerrar con LED */}
            <motion.button whileTap={{scale:0.95}} onClick={()=>{playSound("click");onClose();}}
              style={{position:"relative",width:"100%",overflow:"hidden",background:"transparent",border:"none",borderRadius:14,padding:0,cursor:"pointer"}}>
              <div style={{position:"absolute",inset:0,background:"conic-gradient(from 0deg,#e01010,#8a0000,#e01010)",animation:"ledSpin 1.5s linear infinite",borderRadius:14}}/>
              <div style={{position:"relative",margin:2,background:"#e01010",borderRadius:12,padding:"14px",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{fontSize:16}}>🗳️</span>
                <span style={{fontSize:15,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2}}>VOY A VOTAR INFORMADO</span>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── ONBOARDING ──
function OnboardingModal({onComplete,onSkip}){
  const[step,setStep]=useState(1);const[name,setName]=useState("");const[nickname,setNickname]=useState("");const[loading,setLoading]=useState(false);const[authErr,setAuthErr]=useState("");

  // ── Cargar FB SDK ──
  useEffect(()=>{
    if(window.FB)return;
    window.fbAsyncInit=()=>{window.FB.init({appId:"922258007510427",cookie:true,xfbml:false,version:"v19.0"});};
    const s=document.createElement("script");s.id="facebook-jssdk";s.src="https://connect.facebook.net/es_LA/sdk.js";s.async=true;s.defer=true;
    document.head.appendChild(s);
  },[]);

  // ── Cargar Google GSI ──
  useEffect(()=>{
    if(document.getElementById("gsi-script"))return;
    const s=document.createElement("script");s.id="gsi-script";s.src="https://accounts.google.com/gsi/client";s.async=true;s.defer=true;
    document.head.appendChild(s);
  },[]);

  const loginFB=()=>{
    setLoading(true);setAuthErr("");
    if(!window.FB){setAuthErr("SDK de Facebook no cargó. Intenta de nuevo.");setLoading(false);return;}
    window.FB.login(res=>{
      if(res.authResponse){
        window.FB.api("/me",{fields:"name"},me=>{
          const nm=me.name||"Usuario Facebook";
          setName(nm);const nick=genNickname(nm+Date.now());setNickname(nick);setLoading(false);setStep(3);
        });
      }else{setAuthErr("Cancelaste el inicio de sesión con Facebook.");setLoading(false);}
    },{scope:"public_profile"});
  };

  const loginGoogle=()=>{
    setLoading(true);setAuthErr("");
    const tryLogin=()=>{
      if(!window.google?.accounts?.id){setAuthErr("Google no cargó. Intenta de nuevo.");setLoading(false);return;}
      window.google.accounts.id.initialize({
        client_id:"667429705913-hfa6fedb68l5g14g8ri03vigkf4ccvtg.apps.googleusercontent.com",
        callback:(resp)=>{
          try{
            const payload=JSON.parse(atob(resp.credential.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));
            const nm=payload.name||payload.email?.split("@")[0]||"Usuario Google";
            setName(nm);const nick=genNickname(nm+Date.now());setNickname(nick);setLoading(false);setStep(3);
          }catch(e){setAuthErr("Error al leer respuesta de Google.");setLoading(false);}
        },
        ux_mode:"popup",
        cancel_on_tap_outside:true,
      });
      window.google.accounts.id.prompt(notification=>{
        if(notification.isNotDisplayed()||notification.isSkippedMoment()){
          // fallback: render button en div oculto
          const div=document.createElement("div");div.id="g_id_btn";div.style.cssText="position:fixed;bottom:-200px;left:0;opacity:0;pointer-events:none;";
          document.body.appendChild(div);
          window.google.accounts.id.renderButton(div,{type:"standard",theme:"outline",size:"large"});
          setTimeout(()=>div.querySelector("div[role=button]")?.click(),200);
        }
      });
    };
    // wait for GSI if not ready
    if(window.google?.accounts?.id)tryLogin();
    else{let t=0;const iv=setInterval(()=>{t++;if(window.google?.accounts?.id){clearInterval(iv);tryLogin();}else if(t>30){clearInterval(iv);setAuthErr("Google tardó en cargar. Refresca la página.");setLoading(false);}},200);}
  };

  const go=()=>{if(!name.trim())return;setLoading(true);setTimeout(()=>{setNickname(genNickname(name.trim()+Date.now()));setLoading(false);setStep(3);},900);};
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{position:"fixed",inset:0,zIndex:500,background:"linear-gradient(160deg,#0f172a,#1e1b4b,#0f172a)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <button onClick={onSkip} style={{position:"fixed",top:16,right:16,zIndex:600,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:"6px 14px",color:"rgba(255,255,255,0.4)",fontSize:10,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>SALTAR →</button>
      <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} transition={{type:"spring",stiffness:260,damping:20}}
        style={{background:"rgba(255,255,255,0.05)",backdropFilter:"blur(20px)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:24,padding:"28px 22px",maxWidth:360,width:"100%"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,background:"rgba(255,255,255,0.07)",padding:"8px 14px",borderRadius:30,border:"1px solid rgba(255,255,255,0.12)"}}>
            <div style={{width:36,height:36,borderRadius:"50%",overflow:"hidden",border:"2px solid rgba(255,100,100,0.5)"}}>
              <img src="" alt="Encuesta Silao" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            </div>
            <div><div style={{fontSize:20,fontWeight:900,color:"#fff",letterSpacing:3,lineHeight:1,fontFamily:"Barlow Condensed,sans-serif"}}>ENCUESTA</div><div style={{fontSize:7,color:"#e01010",letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>SILAO · LA VOZ CIUDADANA</div></div>
          </div>
        </div>
        <AnimatePresence mode="wait">
          {step===1&&<motion.div key="s1" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <div style={{textAlign:"center",marginBottom:4}}>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif",marginBottom:10}}>{new Date().toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase()}</div>
              <div style={{fontSize:48,marginBottom:8}}>🗳️</div>
              <div style={{fontSize:22,fontWeight:900,color:"#fff",lineHeight:1.2,fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}>BIENVENIDO A<br/>ENCUESTA SILAO</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",lineHeight:1.7,marginBottom:16}}>La encuesta ciudadana más transparente de Silao.<br/>Tu nombre real <strong style={{color:"#fff"}}>NUNCA</strong> se publica.</div>
            </div>
            {loading&&<div style={{textAlign:"center",padding:"14px 0"}}><div style={{width:30,height:30,border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"#1877f2",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 8px"}}/><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>Conectando...</div></div>}
            {!loading&&<>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{playSound("click");loginFB();}} style={{width:"100%",background:"#1877f2",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{fontFamily:"Georgia,serif",fontWeight:900,fontSize:18}}>f</span> ENTRAR CON FACEBOOK
              </motion.button>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{playSound("click");loginGoogle();}} style={{width:"100%",background:"#fff",border:"2px solid #e5e7eb",borderRadius:12,padding:"13px",color:"#374151",fontSize:14,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{fontSize:18}}>🔵</span> ENTRAR CON GOOGLE
              </motion.button>
              {authErr&&<div style={{fontSize:10,color:"#fca5a5",textAlign:"center",marginBottom:8,padding:"6px 10px",background:"rgba(220,38,38,0.15)",borderRadius:8}}>{authErr}</div>}
              <motion.button whileTap={{scale:0.95}} onClick={onSkip}
                style={{width:"100%",position:"relative",overflow:"hidden",background:"transparent",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"10px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <div style={{position:"absolute",inset:0,background:"conic-gradient(from 0deg,rgba(100,200,255,0.15),rgba(200,100,255,0.15),rgba(100,200,255,0.15))",animation:"ledSpin 3s linear infinite",borderRadius:10}}/>
                <span style={{fontSize:14,position:"relative",zIndex:1}}>👁️</span>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.5)",fontWeight:700,letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif",position:"relative",zIndex:1}}>SOLO QUIERO VER — sin votar</span>
              </motion.button>
            </>}
          </motion.div>}
          {step===2&&<motion.div key="s2" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
            <div style={{textAlign:"center",padding:"24px 0"}}><div style={{width:32,height:32,border:"3px solid rgba(255,255,255,0.1)",borderTopColor:"#1877f2",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 12px"}}/><div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>Conectando con Facebook...</div></div>
          </motion.div>}
          {step===3&&<motion.div key="s3" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <motion.div animate={{rotate:[0,10,-10,0]}} transition={{duration:0.6,delay:0.2}} style={{fontSize:48,marginBottom:8}}>🎭</motion.div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:2,marginBottom:5,fontFamily:"Barlow Condensed,sans-serif"}}>TU APODO EN ENCUESTA SILAO SERÁ</div>
              <div style={{fontSize:20,fontWeight:900,color:"#fff",background:"rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 16px",marginBottom:6,fontFamily:"Barlow Condensed,sans-serif"}}>{nickname}</div>
            </div>
            <motion.button whileTap={{scale:0.96}} onClick={()=>{playSound("success");onComplete({name:name.trim(),nickname,id:"u_"+Math.random().toString(36).slice(2)});}}
              style={{width:"100%",background:"linear-gradient(135deg,#e01010,#8a0000)",border:"none",borderRadius:12,padding:"13px",color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2}}>
              🗳️ ENTRAR Y PARTICIPAR
            </motion.button>
          </motion.div>}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ── LOGIN MODAL ──
function LoginModal({onLogin,onClose}){
  const[name,setName]=useState("");const[loading,setLoading]=useState(false);const[step,setStep]=useState(1);const[nickname,setNickname]=useState("");
  const go=()=>{if(!name.trim())return;setLoading(true);setTimeout(()=>{setNickname(genNickname(name.trim()+Date.now()));setLoading(false);setStep(2);},900);};
  return(
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} style={{background:"#fff",borderRadius:18,padding:"24px 20px",maxWidth:340,width:"100%"}}>
        {step===1?(<>
          <div style={{textAlign:"center",marginBottom:12}}><div style={{width:44,height:44,borderRadius:"50%",background:"#1877f2",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:22,fontFamily:"Georgia,serif",fontWeight:900,color:"#fff",marginBottom:7}}>f</div><div style={{fontSize:15,fontWeight:800}}>Entra con Facebook</div></div>
          {loading?<div style={{textAlign:"center",padding:"14px 0"}}><div style={{width:28,height:28,border:"3px solid #e8e8e8",borderTopColor:"#1877f2",borderRadius:"50%",animation:"spin .7s linear infinite",margin:"0 auto 8px"}}/></div>:<>
            <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&name.trim()&&go()} placeholder="Tu nombre completo" style={{width:"100%",background:"#f5f5f5",border:"1.5px solid #e0e0e0",borderRadius:9,padding:"10px 12px",fontSize:13,outline:"none",marginBottom:8}}/>
            <motion.button whileTap={{scale:0.96}} onClick={go} disabled={!name.trim()} style={{width:"100%",background:name.trim()?"#1877f2":"#e0e0e0",border:"none",borderRadius:9,padding:"11px",color:name.trim()?"#fff":"#aaa",fontSize:13,fontWeight:700,cursor:name.trim()?"pointer":"default"}}>GENERAR MI APODO →</motion.button>
          </>}
          <button onClick={onClose} style={{width:"100%",background:"transparent",border:"none",marginTop:6,color:"#ccc",fontSize:10,cursor:"pointer"}}>CANCELAR</button>
        </>):(<>
          <div style={{textAlign:"center",marginBottom:12}}><div style={{fontSize:34,marginBottom:6}}>🎭</div><div style={{fontSize:8,color:"#9ca3af",letterSpacing:2,marginBottom:5}}>TU APODO SERÁ</div><div style={{fontSize:17,fontWeight:900,background:"#f3f4f6",borderRadius:10,padding:"10px 12px",marginBottom:6,fontFamily:"Barlow Condensed,sans-serif"}}>{nickname}</div></div>
          <motion.button whileTap={{scale:0.96}} onClick={()=>{playSound("success");onLogin({name:name.trim(),nickname,id:"u_"+Math.random().toString(36).slice(2)});}} style={{width:"100%",background:"linear-gradient(135deg,#e01010,#8a0000)",border:"none",borderRadius:9,padding:"11px",color:"#fff",fontSize:13,fontWeight:800,cursor:"pointer"}}>🗳️ ENTRAR Y PARTICIPAR</motion.button>
          <button onClick={onClose} style={{width:"100%",background:"transparent",border:"none",marginTop:6,color:"#ccc",fontSize:10,cursor:"pointer"}}>CANCELAR</button>
        </>)}
      </motion.div>
    </motion.div>
  );
}

// ── HEADER ──
// ── FLOATING VOTE BUBBLE ──
function FloatingBubble({myVote,candidates}){
  const party=myVote?PARTIES.find(p=>p.id===myVote):null;
  const[pos,setPos]=useState({x:window.innerWidth-80,y:window.innerHeight/2});
  const[vel,setVel]=useState({x:-1.5,y:-1.2});
  const[exploded,setExploded]=useState(false);
  const[pieces,setPieces]=useState([]);
  const rafRef=useRef();

  useEffect(()=>{
    if(!party||exploded)return;
    const animate=()=>{
      setPos(p=>{
        let nx=p.x+vel.x,ny=p.y+vel.y;
        if(nx<20||nx>window.innerWidth-60){vel.x*=-1;nx=p.x+vel.x;}
        if(ny<60||ny>window.innerHeight-100){vel.y*=-1;ny=p.y+vel.y;}
        return{x:nx,y:ny};
      });
      rafRef.current=requestAnimationFrame(animate);
    };
    rafRef.current=requestAnimationFrame(animate);
    return()=>cancelAnimationFrame(rafRef.current);
  },[party,exploded,vel]);

  const handleTap=()=>{
    if(exploded)return;
    setExploded(true);
    const ps=Array.from({length:8},(_,i)=>({id:i,angle:(i/8)*Math.PI*2,dist:60+Math.random()*40}));
    setPieces(ps);
    setTimeout(()=>{setExploded(false);setPieces([]);},3000);
    playSound("success");
  };

  if(!party)return null;
  const logo=PARTY_LOGOS[party.id];

  return(
    <div style={{position:"fixed",zIndex:500,pointerEvents:"none"}}>
      {/* Main bubble */}
      {!exploded&&(
        <motion.div animate={{x:pos.x,y:pos.y}} transition={{type:"tween",duration:0}}
          style={{position:"fixed",left:0,top:0,pointerEvents:"auto",cursor:"pointer"}}
          onClick={handleTap}>
          <div style={{position:"relative",width:52,height:52}}>
            <div style={{position:"absolute",inset:-3,borderRadius:"50%",background:`conic-gradient(from 0deg,${party.color},#fff,${party.color})`,animation:"ledSpin 1.5s linear infinite"}}/>
            <div style={{position:"absolute",inset:2,borderRadius:"50%",background:"#fff",overflow:"hidden",border:`2px solid ${party.color}`,boxShadow:`0 0 16px ${party.color}80`}}>
              {logo?<img src={logo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{party.emoji}</span>}
            </div>
          </div>
        </motion.div>
      )}
      {/* Explosion pieces */}
      {exploded&&pieces.map(p=>(
        <motion.div key={p.id}
          initial={{x:pos.x+20,y:pos.y+20,scale:1,opacity:1}}
          animate={{x:pos.x+20+Math.cos(p.angle)*p.dist,y:pos.y+20+Math.sin(p.angle)*p.dist,scale:0,opacity:0}}
          transition={{duration:0.8,ease:"easeOut"}}
          style={{position:"fixed",left:0,top:0,width:28,height:28,borderRadius:"50%",overflow:"hidden",border:`2px solid ${party.color}`,background:"#fff"}}>
          {logo?<img src={logo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{party.emoji}</span>}
        </motion.div>
      ))}
    </div>
  );
}

function LiveClock(){
  const[now,setNow]=useState(new Date());
  useEffect(()=>{const iv=setInterval(()=>setNow(new Date()),1000);return()=>clearInterval(iv);},[]);
  return(
    <div style={{textAlign:"center",lineHeight:1.1}}>
      <div style={{fontSize:13,fontWeight:900,color:"#1d4ed8",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>{now.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</div>
      <div style={{fontSize:8,color:"#6b7280",letterSpacing:1,fontFamily:"Barlow Condensed,sans-serif"}}>{now.toLocaleDateString("es-MX",{day:"numeric",month:"short"}).toUpperCase()}</div>
    </div>
  );
}

function AnonFlipBtn(){
  const[flipped,setFlipped]=useState(false);
  const flip=()=>{setFlipped(true);playSound("click");setTimeout(()=>setFlipped(false),5000);};
  return(
    <motion.button onClick={flip} whileTap={{scale:0.95}}
      animate={{rotateY:flipped?180:0}} transition={{duration:0.5}}
      style={{background:flipped?"#fff":"linear-gradient(135deg,#1d4ed8,#7c3aed)",border:flipped?"2px solid #1d4ed8":"none",borderRadius:10,padding:"5px 10px",cursor:"pointer",minWidth:80,boxShadow:"0 2px 10px rgba(29,78,216,0.3)"}}>
      {flipped
        ?<span style={{fontSize:9,color:"#111",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:0.5}}>🎭 VOTO<br/>ANÓNIMO</span>
        :<span style={{fontSize:9,color:"#fff",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>👁️ ANÓNIMO</span>}
    </motion.button>
  );
}

function Header({total,user,onLoginClick,onLogoClick,onLogout,siteLogo}){
  return(
    <>
    <style>{`::-webkit-scrollbar{width:8px;height:8px}::-webkit-scrollbar-track{background:#f1f1f1}::-webkit-scrollbar-thumb{background:#e01010;border-radius:4px}::-webkit-scrollbar-thumb:hover{background:#b91c1c}`}</style>
    <div style={{position:"sticky",top:0,zIndex:20,background:"rgba(255,255,255,0.97)",backdropFilter:"blur(14px)",borderBottom:"3px solid #e01010",padding:"6px 10px"}}>
      <div style={{maxWidth:580,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>

        {/* LEFT: logo + title */}
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <motion.button whileTap={{scale:0.9}} onClick={onLogoClick} style={{background:"none",border:"none",cursor:"pointer",padding:0}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:38,height:38,borderRadius:10,overflow:"hidden",border:"2px solid rgba(224,16,16,0.4)",boxShadow:"0 0 14px rgba(224,16,16,0.4)",animation:"logoPulse 2s ease-in-out infinite"}}>
                <img src={siteLogo||""} alt="Encuesta Silao" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
              <div style={{lineHeight:1}}>
                <div style={{fontSize:11,fontWeight:900,color:"#e01010",letterSpacing:2,lineHeight:1,fontFamily:"Barlow Condensed,sans-serif",textShadow:"0 0 12px rgba(224,16,16,0.5)"}}>ENCUESTA</div>
                <div style={{fontSize:14,fontWeight:900,color:"#1d4ed8",letterSpacing:3,lineHeight:1,marginTop:1,fontFamily:"Barlow Condensed,sans-serif",textShadow:"0 0 10px rgba(29,78,216,0.5)",animation:"glow360 2s ease-in-out infinite"}}>SILAO</div>
              </div>
            </div>
          </motion.button>

          {/* Facebook circle */}
          <a href="https://www.facebook.com/share/1CCfvKYYK1/?mibextid=wwXIfr" target="_blank" rel="noreferrer"
            style={{width:28,height:28,background:"#1877f2",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",boxShadow:"0 2px 8px rgba(24,119,242,0.4)",flexShrink:0}}>
            <span style={{fontFamily:"Georgia,serif",fontWeight:900,fontSize:14,color:"#fff",lineHeight:1}}>f</span>
          </a>

          {/* Clock between F and apodo */}
          <LiveClock/>
        </div>

        {/* CENTER: apodo with LED ring OR login */}
        {user?(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,flex:1}}>
            <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{position:"absolute",inset:-3,borderRadius:30,background:"conic-gradient(from 0deg,#e01010,#ff6b6b,#1877f2,#4ade80,#fbbf24,#e01010)",animation:"ledSpin 2s linear infinite",filter:"blur(1px)"}}/>
              <div style={{position:"relative",background:"#eff6ff",border:"2px solid transparent",borderRadius:30,padding:"4px 12px 4px 6px",display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"#1877f2",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>🎭</div>
                <span style={{fontSize:13,fontWeight:900,color:"#1d4ed8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:90,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:0.5}}>{user.nickname}</span>
              </div>
            </div>
            <button onClick={onLogout} style={{background:"none",border:"none",fontSize:8,color:"#9ca3af",cursor:"pointer",letterSpacing:1,fontFamily:"Barlow Condensed,sans-serif"}}>← SALIR</button>
          </div>
        ):(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,flex:1}}>
            <AnonFlipBtn/>
            <motion.button whileTap={{scale:0.94}} onClick={()=>{playSound("click");onLoginClick();}}
              style={{background:"#1877f2",border:"none",borderRadius:8,padding:"5px 10px",color:"#fff",fontSize:9,fontWeight:700,cursor:"pointer",letterSpacing:1}}>f ENTRAR</motion.button>
          </div>
        )}

        {/* RIGHT: EN VIVO */}
        <div style={{background:"#fff0f0",border:"2px solid #e01010",borderRadius:10,padding:"4px 8px",textAlign:"center",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:1}}><div style={{width:4,height:4,borderRadius:"50%",background:"#e01010",animation:"pd 1.8s infinite"}}/><span style={{fontSize:7,color:"#e01010",letterSpacing:1.5,fontWeight:700}}>EN VIVO</span></div>
          <div style={{fontSize:19,fontWeight:900,color:"#e01010",lineHeight:1,letterSpacing:-1,fontFamily:"Barlow Condensed,sans-serif"}}><LiveCount value={total}/></div>
          <div style={{fontSize:7,color:"#6b7280",letterSpacing:1.5,fontFamily:"Barlow Condensed,sans-serif"}}>VOTOS</div>
        </div>

      </div>
    </div>
    </>
  );
}


// ── PELOTA FLOTANTE ──
function BouncingBall({siteLogo,onLogoClick,votes,total}){
  const leader=[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0))[0];
  const[exploding,setExploding]=useState(false);
  const[pos,setPos]=useState({x:80,y:60});
  const[vel,setVel]=useState({x:1.4,y:1.8});
  const[dragging,setDragging]=useState(false);
  const rafRef=useRef(null);
  const velRef=useRef({x:1.4,y:1.8});
  const posRef=useRef({x:80,y:60});
  const SIZE=56;

  useEffect(()=>{
    let last=null;
    const loop=(ts)=>{
      if(!dragging){
        const dt=last?Math.min((ts-last)/16,3):1;
        last=ts;
        let{x,y}=posRef.current;
        let{x:vx,y:vy}=velRef.current;
        x+=vx*dt;y+=vy*dt;
        const mw=window.innerWidth-SIZE-8,mh=window.innerHeight-SIZE-80;
        if(x<=4){x=4;vx=Math.abs(vx);}if(x>=mw){x=mw;vx=-Math.abs(vx);}
        if(y<=48){y=48;vy=Math.abs(vy);}if(y>=mh){y=mh;vy=-Math.abs(vy);}
        posRef.current={x,y};velRef.current={x:vx,y:vy};
        setPos({x,y});
      }
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(rafRef.current);
  },[dragging]);

  const explode=()=>{
    setExploding(true);
    setTimeout(()=>setExploding(false),900);
  };

  return(
    <>
      {/* partículas explosión — logos de todos los partidos */}
      <AnimatePresence>
        {exploding&&PARTIES.map((party,i)=>{
          const angle=(i/PARTIES.length)*Math.PI*2;
          const dist=80+Math.random()*40;
          const logo=PARTY_LOGOS[party.id];
          return(
          <motion.div key={party.id}
            initial={{x:pos.x+SIZE/2-14,y:pos.y+SIZE/2-14,opacity:1,scale:1}}
            animate={{x:pos.x+SIZE/2-14+(Math.cos(angle)*dist),y:pos.y+SIZE/2-14+(Math.sin(angle)*dist),opacity:0,scale:0.3}}
            transition={{duration:0.9,ease:"easeOut"}}
            style={{position:"fixed",zIndex:399,width:28,height:28,borderRadius:"50%",overflow:"hidden",
              border:`2px solid ${party.color}`,background:"#fff",pointerEvents:"none"}}>
            {logo?<img src={logo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{party.emoji}</span>}
          </motion.div>
          );
        })}
      </AnimatePresence>

      <motion.div
        drag dragMomentum={false}
        onDragStart={()=>setDragging(true)}
        onDragEnd={(e,info)=>{
          posRef.current={x:info.point.x-SIZE/2,y:info.point.y-SIZE/2};
          setPos(posRef.current);
          velRef.current={x:(Math.random()*2-1)*2,y:(Math.random()*2-1)*2};
          setDragging(false);
        }}
        onClick={()=>{explode();onLogoClick&&onLogoClick();}}
        whileTap={{scale:0.88}}
        style={{position:"fixed",left:pos.x,top:pos.y,zIndex:400,cursor:"pointer",
          width:SIZE,height:SIZE,borderRadius:"50%",
          background:"linear-gradient(135deg,#fff,#f0f0f0)",
          border:`3px solid ${leader?.color||"#e01010"}`,
          boxShadow:`0 0 18px ${leader?.color||"#e01010"}88, 0 6px 20px rgba(0,0,0,0.25)`,
          overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center",
          userSelect:"none",WebkitUserSelect:"none",touchAction:"none"}}>
        {siteLogo
          ?<img src={siteLogo} alt="Encuesta Silao" style={{width:"90%",height:"90%",objectFit:"contain",borderRadius:"50%"}}/>
          :<div style={{fontSize:24,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",color:leader?.color||"#e01010",lineHeight:1,textAlign:"center"}}>
            <div style={{fontSize:9,letterSpacing:1,color:"#6b7280"}}>ENCUESTA</div>
            <div>SILAO</div>
          </div>}
        {/* anillo LED giratorio */}
        <div style={{position:"absolute",inset:-2,borderRadius:"50%",
          background:`conic-gradient(from 0deg,${leader?.color||"#e01010"},transparent,${leader?.color||"#e01010"})`,
          animation:"ledSpin 1.5s linear infinite",opacity:0.6,zIndex:-1}}/>
      </motion.div>
    </>
  );
}

// ── NAVBAR ──
function NavBar({screen,setScreen}){
  const tabs=[
    {id:"results",icon:null,label:"INICIO",color:"#e01010",is3d:true,isInicio:true},
    {id:"vote",icon:"🗳️",label:"VOTAR",color:"#16a34a",is3d:false},
    {id:"proposals",icon:"💡",label:"PROPUESTAS",color:"#ca8a04",is3d:false},
    {id:"articles",icon:"📰",label:"PARTIDOS",color:"#1d4ed8",is3d:true},
    {id:"preguntale",icon:"❓",label:"RETARLE",color:"#e01010",is3d:false},
    {id:"comments",icon:"💬",label:"COMENTAR",color:"#7c3aed",is3d:false},
  ];
  return(
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50}}>
      <div style={{height:3,background:"linear-gradient(90deg,#e01010,#ff6b6b,#16a34a,#4ade80,#ca8a04,#fbbf24,#1d4ed8,#60a5fa,#7c3aed,#c084fc)",animation:"barraShine 3s linear infinite",backgroundSize:"200% 100%"}}/>
      <div style={{background:"rgba(10,10,20,0.97)",backdropFilter:"blur(20px)",display:"flex",maxWidth:640,margin:"0 auto"}}>
        {tabs.map(t=>{const active=screen===t.id;return(
          <motion.button key={t.id} whileTap={{scale:0.88,y:2}} onClick={()=>{playSound("click");setScreen(t.id);}}
            style={{flex:1,background:active?`${t.color}18`:"transparent",border:"none",padding:"7px 1px 9px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative",overflow:"hidden"}}>
            {active&&<div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 100%,${t.color}60,transparent 70%)`,pointerEvents:"none"}}/>}
            {t.isInicio?(
              <div style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center",height:36}}>
                {active&&<div style={{position:"absolute",inset:-6,borderRadius:12,background:`radial-gradient(circle,${t.color}60,transparent 70%)`,filter:"blur(6px)",animation:"logoPulse 2s ease-in-out infinite"}}/>}
                <span style={{fontSize:active?20:17,fontWeight:900,color:active?"#fff":"rgba(255,255,255,0.5)",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2,textShadow:active?`0 0 12px ${t.color},0 0 24px ${t.color}88`:"none",position:"relative",transition:"all .2s",lineHeight:1}}>INICIO</span>
              </div>
            ):t.is3d?(
              <div style={{
                width:36,height:36,borderRadius:10,
                background:active?`linear-gradient(145deg,${t.color},${t.color}cc)`:`linear-gradient(145deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))`,
                boxShadow:active?`0 4px 0 ${t.color}80, 0 6px 12px ${t.color}40, inset 0 1px 0 rgba(255,255,255,0.3)`:`0 3px 0 rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
                display:"flex",alignItems:"center",justifyContent:"center",
                transform:active?"translateY(1px)":"translateY(0)",
                transition:"all .15s",
                border:active?`1px solid ${t.color}`:"1px solid rgba(255,255,255,0.08)"
              }}>
                <span style={{fontSize:18,lineHeight:1,filter:active?`drop-shadow(0 0 6px ${t.color})`:"none"}}>{t.icon}</span>
              </div>
            ):(
              <span style={{fontSize:22,lineHeight:1,display:"block",filter:active?`drop-shadow(0 0 8px ${t.color})`:"none",transform:active?"scale(1.15)":"scale(0.9)",transition:"transform .2s"}}>{t.icon}</span>
            )}
            {!t.isInicio&&<span style={{fontSize:7,letterSpacing:1.5,color:active?t.color:"rgba(255,255,255,0.35)",fontWeight:active?900:500,position:"relative",zIndex:1,fontFamily:"Barlow Condensed,sans-serif"}}>{t.label}</span>}
            {active&&!t.isInicio&&<div style={{width:18,height:2,borderRadius:2,background:t.color,position:"relative",zIndex:1,boxShadow:`0 0 8px ${t.color}`}}/>}
            {active&&t.isInicio&&<div style={{width:28,height:2,borderRadius:2,background:t.color,position:"relative",zIndex:1,boxShadow:`0 0 10px ${t.color},0 0 20px ${t.color}88`}}/>}
          </motion.button>
        );})}
      </div>
    </div>
  );
}

// ── RESULTS SCREEN ──
// ── SHARE MODAL ──
function ShareModal({votes,total,sorted,pct}){
  const[open,setOpen]=useState(false);

  const buildMsg=()=>{
    const fecha=new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"});
    const hora=new Date().toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit"});
    const tot=Object.values(votes).reduce((a,b)=>a+b,0);
    const allParties=[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0));
    const allRows=allParties.map((p,i)=>{
      const pc=pct(p.id).toFixed(1);
      const bar="█".repeat(Math.round(parseFloat(pc)/10))+"░".repeat(10-Math.round(parseFloat(pc)/10));
      return `${i===0?"🏆":i===1?"🥈":i===2?"🥉":"  "} ${p.short.padEnd(12)} ${bar} ${pc}%`;
    }).join("\n");
    return `🗳️ ENCUESTA SILAO — CIUDADANA\n📅 ${fecha} · 🕐 ${hora}\n━━━━━━━━━━━━━━━━━━━\n${allRows}\n━━━━━━━━━━━━━━━━━━━\n📊 Total de votos: ${tot}\n\n📱 ¡Vota aquí!\n👉 encuestasilao.mx\n\n#Silao #Guanajuato #EncuestaSilao`;
  };

  const shareWA=()=>{window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(buildMsg()),"_blank");};
  const shareFB=()=>{window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://encuestasilao.mx")+"&quote="+encodeURIComponent(buildMsg()),"_blank");};

  return(
    <>
      <motion.button whileTap={{scale:0.96}} onClick={()=>{playSound("click");setOpen(true);}}
        style={{flex:1,background:"linear-gradient(135deg,#0f172a,#1e3a8a)",border:"2px solid rgba(59,130,246,0.5)",borderRadius:12,padding:"12px",color:"#fff",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 20px rgba(59,130,246,0.3)"}}>
        <span style={{fontSize:18}}>📤</span> COMPARTIR DATOS
      </motion.button>

      <AnimatePresence>
        {open&&(
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center",padding:"0 0 20px"}}
            onClick={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
            <motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}} transition={{type:"spring",stiffness:300,damping:30}}
              style={{background:"#fff",borderRadius:"20px 20px 16px 16px",padding:"20px 18px 24px",width:"100%",maxWidth:480}}>

              {/* Handle */}
              <div style={{width:36,height:4,background:"#e5e7eb",borderRadius:2,margin:"0 auto 16px"}}/>

              <div style={{fontSize:11,fontWeight:900,color:"#111",letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif",marginBottom:4}}>📤 COMPARTIR RESULTADOS</div>
              <div style={{fontSize:10,color:"#6b7280",marginBottom:14}}>Se compartirán los datos actuales de la encuesta</div>

              {/* Preview del mensaje */}
              <div style={{background:"#f8fafc",border:"1.5px solid #e2e8f0",borderRadius:12,padding:"12px 14px",marginBottom:14,fontSize:11,color:"#374151",lineHeight:1.7,fontFamily:"monospace",whiteSpace:"pre-wrap"}}>
                {buildMsg()}
              </div>

              {/* Botones */}
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <motion.button whileTap={{scale:0.97}} onClick={shareWA}
                  style={{width:"100%",background:"linear-gradient(135deg,#25d366,#128c4e)",border:"none",borderRadius:12,padding:"14px",color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                  <span style={{fontSize:20}}>📱</span> COMPARTIR POR WHATSAPP
                </motion.button>
                <motion.button whileTap={{scale:0.97}} onClick={shareFB}
                  style={{width:"100%",background:"linear-gradient(135deg,#1877f2,#0d5cc7)",border:"none",borderRadius:12,padding:"14px",color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                  <span style={{fontFamily:"Georgia,serif",fontWeight:900,fontSize:18}}>f</span> COMPARTIR EN FACEBOOK
                </motion.button>
                <div style={{display:"flex",gap:8}}>
                  <motion.button whileTap={{scale:0.97}} onClick={()=>window.open("https://encuestasilao.mx","_blank")}
                    style={{flex:1,background:"#f1f5f9",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"10px",color:"#1d4ed8",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>
                    📱 encuestasilao.mx
                  </motion.button>
                  <button onClick={()=>setOpen(false)} style={{flex:1,background:"#f1f5f9",border:"1.5px solid #e2e8f0",borderRadius:10,padding:"10px",color:"#374151",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>Cancelar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ResultsScreen({votes,total,myVote,setScreen,user,onLoginClick,onLogoClick,onLogout,siteLogo}){
  const[activeStat,setActiveStat]=useState(null);
  const[bars,setBars]=useState(false);const[showMoney,setShowMoney]=useState(false);
  useEffect(()=>{setTimeout(()=>setBars(true),300);},[]);
  const sorted=[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0));
  const pct=id=>total===0?0:(votes[id]||0)/total*100;
  const pieData=PARTIES.filter(p=>(votes[p.id]||0)>0).map(p=>({name:p.short,value:votes[p.id]||0,color:p.color}));
  const barData=sorted.filter(p=>(votes[p.id]||0)>0).map(p=>({name:p.short,votos:votes[p.id]||0,pct:pct(p.id).toFixed(1),color:p.color}));
  return(
    <div style={{paddingBottom:88,background:"#f8faff",minHeight:"100vh"}}>
      <AnimatePresence>{showMoney&&<MoneyModal onClose={()=>setShowMoney(false)}/>}</AnimatePresence>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} onLogout={onLogout} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <div style={{padding:"10px 0",display:"flex",gap:8}}>
          <motion.button whileTap={{scale:0.96}} onClick={()=>{playSound("click");setScreen("vote");}}
            style={{flex:1,background:"linear-gradient(135deg,#e01010,#8a0000)",border:"none",borderRadius:12,padding:"14px",color:"#fff",fontSize:20,fontWeight:900,letterSpacing:3,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",
              boxShadow:"0 0 0 0 rgba(224,16,16,0.4), 0 4px 20px rgba(220,0,0,0.5)",
              animation:"voteGlow 1.5s ease-in-out infinite",
              display:"flex",alignItems:"center",justifyContent:"center",gap:7,position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)",animation:"ledShimmer 2s ease-in-out infinite",pointerEvents:"none"}}/>
            <span>🗳️</span> VOTAR
          </motion.button>
          <ShareModal votes={votes} total={total} sorted={sorted} pct={pct}/>
        </div>
        {/* ── 4 BOTONES RÁPIDOS ── */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
          <motion.button whileTap={{scale:0.96}} onClick={()=>{
          if(navigator.share){navigator.share({title:"Encuesta Silao",text:"¡Vota en la encuesta ciudadana!",url:"https://encuestasilao.mx"});}
            else{const t=document.createElement("input");t.value="https://encuestasilao.mx";document.body.appendChild(t);t.select();document.execCommand("copy");document.body.removeChild(t);alert("Enlace copiado: encuestasilao.mx");}
          }} style={{background:"linear-gradient(135deg,#25d366,#128c4e)",border:"none",borderRadius:14,padding:"16px 10px",color:"#fff",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 16px rgba(37,211,102,0.35)"}}>
            <span style={{fontSize:26}}>📱</span>
            <span style={{fontSize:13,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,textAlign:"center"}}>COMPARTIR<br/>WHATSAPP</span>
          </motion.button>
          <motion.button whileTap={{scale:0.96}} onClick={()=>window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://encuestasilao.mx"),"_blank")}
            style={{background:"linear-gradient(135deg,#1877f2,#0d5cc7)",border:"none",borderRadius:14,padding:"16px 10px",color:"#fff",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 16px rgba(24,119,242,0.35)"}}>
            <span style={{fontSize:26,fontFamily:"Georgia,serif",fontWeight:900}}>f</span>
            <span style={{fontSize:13,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,textAlign:"center"}}>COMPARTIR<br/>FACEBOOK</span>
          </motion.button>
          <motion.button whileTap={{scale:0.96}} onClick={()=>window.open("https://encuestasilao.mx","_blank")}
            style={{background:"linear-gradient(135deg,#e01010,#8a0000)",border:"none",borderRadius:14,padding:"16px 10px",color:"#fff",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 16px rgba(224,16,16,0.3)"}}>
            <span style={{fontSize:26}}>🌐</span>
            <span style={{fontSize:13,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,textAlign:"center"}}>ENCUESTA<br/>SILAO</span>
          </motion.button>
          <motion.button whileTap={{scale:0.96}} onClick={()=>{
            if(/iphone|ipad|ipod/i.test(navigator.userAgent)){alert("iPhone: toca el botón Compartir ⬆️ → 'Agregar a pantalla de inicio'");}
            else if(/android/i.test(navigator.userAgent)){alert("Android: toca el menú ⋮ → 'Agregar a pantalla de inicio'");}
            else if(window.deferredInstallPrompt){window.deferredInstallPrompt.prompt();}
            else{alert("Abre la app desde tu navegador móvil para instalarla");}
          }} style={{background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:14,padding:"16px 10px",color:"#fff",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,boxShadow:"0 4px 16px rgba(124,58,237,0.35)"}}>
            <span style={{fontSize:26}}>📲</span>
            <span style={{fontSize:13,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,textAlign:"center"}}>INSTALAR<br/>APP</span>
          </motion.button>
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
        {/* ── BOTONES ESTADÍSTICAS PÚBLICAS ── */}
        {(()=>{
          const vv=PARTIES.map(p=>votes[p.id]||0);
          const mean=total>0?total/PARTIES.length:0;
          const sorted_vv=[...vv].sort((a,b)=>a-b);
          const median=sorted_vv.length%2===0?(sorted_vv[sorted_vv.length/2-1]+sorted_vv[sorted_vv.length/2])/2:sorted_vv[Math.floor(sorted_vv.length/2)];
          const variance=vv.reduce((a,v)=>a+Math.pow(v-mean,2),0)/vv.length;
          const sigma=Math.sqrt(variance);
          const leader=[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0))[0];
          const leaderPct=total>0?(votes[leader.id]||0)/total:0;
          const me=total>1?1.96*Math.sqrt(leaderPct*(1-leaderPct)/total)*100:0;
          const STATS=[
            {id:"pct",sym:"%",label:"PORCENTAJE",color:"#e01010",val:`${(leaderPct*100).toFixed(1)}%`,sub:`Líder: ${leader.short}`,exp:`Del total de ${total} votos, ${leader.short} tiene ${(leaderPct*100).toFixed(1)}%. Se calcula dividiendo sus votos entre el total × 100.`},
            {id:"mean",sym:"x̄",label:"PROMEDIO",color:"#7c3aed",val:mean.toFixed(1),sub:"votos/partido",exp:`Promedio de votos por partido: ${total} ÷ ${PARTIES.length} partidos = ${mean.toFixed(2)} votos en promedio.`},
            {id:"med",sym:"Md",label:"MEDIANA",color:"#0891b2",val:median.toFixed(0),sub:"valor central",exp:`Ordenando los votos: [${sorted_vv.join(", ")}]. El valor central es ${median.toFixed(0)}.`},
            {id:"std",sym:"σ",label:"DESV. STD",color:"#ca8a04",val:sigma.toFixed(1),sub:"dispersión",exp:`σ=${sigma.toFixed(2)} indica qué tan disparejos están los votos. Mayor σ = más concentración en un partido.`},
            {id:"me",sym:"±",label:"MARGEN",color:"#059669",val:total>9?`±${me.toFixed(1)}%`:"n<10",sub:"95% confianza",exp:total>9?`Con n=${total} votos, el líder tiene rango 95% de [${Math.max(0,leaderPct*100-me).toFixed(1)}% – ${Math.min(100,leaderPct*100+me).toFixed(1)}%].`:"Necesitas al menos 10 votos para calcular el margen de error."},
            {id:"n",sym:"n",label:"MUESTRA",color:"#1d4ed8",val:String(total),sub:"votos totales",exp:total<30?"⚠️ Muestra muy pequeña — resultados preliminares.":total<100?"📈 Muestra en crecimiento.":"✅ Muestra estadísticamente relevante."},
          ];
          return(
            <div style={{marginBottom:16}}>
              <div style={{fontSize:9,color:"#6b7280",letterSpacing:3,textAlign:"center",marginBottom:10,fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>◉ ESTADÍSTICAS DE LA ENCUESTA</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:activeStat?0:0}}>
                {STATS.map(s=>{
                  const isAct=activeStat===s.id;
                  return(
                    <motion.button key={s.id} whileTap={{scale:0.93}}
                      onClick={()=>{playSound("click");setActiveStat(isAct?null:s.id);}}
                      style={{background:isAct?s.color:"#fff",
                        border:`2px solid ${isAct?s.color:s.color+"55"}`,
                        borderRadius:14,padding:"14px 8px",cursor:"pointer",
                        boxShadow:isAct?`0 6px 20px ${s.color}50`:"0 2px 8px rgba(0,0,0,0.06)",
                        transition:"all .15s"}}>
                      <div style={{fontSize:22,fontWeight:900,color:isAct?"#fff":s.color,fontFamily:"Barlow Condensed,sans-serif",lineHeight:1,marginBottom:5}}>{s.sym}</div>
                      <div style={{fontSize:20,fontWeight:900,color:isAct?"#fff":s.color,fontFamily:"Barlow Condensed,sans-serif",lineHeight:1,marginBottom:4}}>{s.val}</div>
                      <div style={{fontSize:8,color:isAct?"rgba(255,255,255,0.75)":"#9ca3af",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>{s.label}</div>
                    </motion.button>
                  );
                })}
              </div>
              <AnimatePresence>
                {activeStat&&(()=>{
                  const s=STATS.find(x=>x.id===activeStat);
                  return s?(
                    <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}
                      style={{background:`${s.color}12`,border:`2px solid ${s.color}50`,borderRadius:14,padding:"16px",marginTop:8,marginBottom:8}}>
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                        <div style={{width:44,height:44,borderRadius:12,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",flexShrink:0}}>{s.sym}</div>
                        <div>
                          <div style={{fontSize:12,fontWeight:900,color:s.color,letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif"}}>{s.label}</div>
                          <div style={{fontSize:26,fontWeight:900,color:"#111",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{s.val} <span style={{fontSize:11,color:"#9ca3af"}}>{s.sub}</span></div>
                        </div>
                      </div>
                      <div style={{fontSize:13,color:"#374151",lineHeight:1.8,fontFamily:"Barlow Condensed,sans-serif",fontWeight:600}}>{s.exp}</div>
                    </motion.div>
                  ):null;
                })()}
              </AnimatePresence>
            </div>
          );
        })()}

        <div style={{fontSize:9,color:"#6b7280",letterSpacing:3,textAlign:"center",marginBottom:10,fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>▼ RESULTADOS POR PARTIDO</div>
        {/* BOTONES GRANDES DE PARTIDOS */}
        <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:16}}> 
          {sorted.map((p,rank)=>{
            const count=votes[p.id]||0,pc=pct(p.id),isMe=myVote===p.id,isTop=rank===0&&count>0;
            const[open,setOpen]=useState(false);
            const cand=null; // candidates no está en scope aquí, se mostrará info del partido
            return(
            <motion.div key={p.id} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:rank*0.05}}>
              {/* BOTÓN PRINCIPAL */}
              <motion.button whileTap={{scale:0.98}} onClick={()=>{playSound("click");setOpen(o=>!o);}}
                style={{width:"100%",background:isTop?"linear-gradient(135deg,#fffbeb,#fff)":isMe?`${p.color}06`:"#fff",
                  border:`2.5px solid ${isTop?"#f59e0b":isMe?p.color:"#e5e7eb"}`,
                  borderRadius:open?"16px 16px 0 0":"16px",padding:"14px 16px",cursor:"pointer",
                  boxShadow:isTop?"0 6px 24px rgba(245,158,11,0.2)":isMe?`0 4px 16px ${p.color}25`:"0 2px 8px rgba(0,0,0,0.06)",
                  position:"relative",overflow:"hidden",display:"block",textAlign:"left",transition:"border-radius .2s"}}>
                {/* Fondo fill */}
                <div style={{position:"absolute",left:0,top:0,bottom:0,width:bars?`${pc}%`:"0%",background:`${p.color}09`,transition:"width 1.6s cubic-bezier(.16,1,.3,1)",pointerEvents:"none"}}/>
                <div style={{display:"flex",alignItems:"center",gap:12,position:"relative"}}>
                  {/* Rank */}
                  <div style={{width:28,height:28,borderRadius:"50%",background:isTop?"#fef3c7":`${p.color}15`,border:`2px solid ${isTop?"#f59e0b":p.color+"40"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:isTop?"#d97706":p.color,flexShrink:0}}>
                    {isTop&&count>0?"🏆":rank+1}
                  </div>
                  {/* Logo */}
                  <div style={{width:56,height:56,borderRadius:12,overflow:"hidden",flexShrink:0,background:`${p.color}12`,border:`2.5px solid ${p.color}50`,boxShadow:`0 3px 10px ${p.color}35`}}>
                    {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:28,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.emoji}</span>}
                  </div>
                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:16,fontWeight:900,color:"#111",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:0.5,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      {p.short}
                      {isMe&&<span style={{fontSize:8,color:"#1877f2",background:"#dbeafe",padding:"2px 6px",borderRadius:4,fontWeight:800,letterSpacing:1}}>✓ TU VOTO</span>}
                      {isTop&&count>0&&<span style={{fontSize:8,color:"#d97706",background:"#fef3c7",padding:"2px 6px",borderRadius:4,fontWeight:800}}>LÍDER</span>}
                    </div>
                    <div style={{fontSize:11,color:"#6b7280",fontFamily:"Barlow Condensed,sans-serif",marginBottom:4}}>{p.spectrumLabel}</div>
                    {/* Barra */}
                    <div style={{height:7,background:"#f3f4f6",borderRadius:6,overflow:"hidden"}}>
                      <motion.div initial={{width:0}} animate={{width:bars?`${pc}%`:"0%"}} transition={{duration:1.4,ease:[.16,1,.3,1]}}
                        style={{height:"100%",borderRadius:6,background:isTop?`linear-gradient(90deg,${p.color},#f59e0b)`:p.color,boxShadow:`0 0 8px ${p.color}60`}}/>
                    </div>
                  </div>
                  {/* % grande */}
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:30,fontWeight:900,color:isTop&&count>0?"#d97706":p.color,lineHeight:1,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:-1}}>{pc.toFixed(1)}<span style={{fontSize:14}}>%</span></div>
                    <div style={{fontSize:13,fontWeight:800,color:"#374151",fontFamily:"Barlow Condensed,sans-serif"}}>{count} votos</div>
                    <div style={{fontSize:10,color:"#9ca3af",marginTop:2}}>{open?"▲ CERRAR":"▼ VER MÁS"}</div>
                  </div>
                </div>
              </motion.button>

              {/* PANEL EXPANDIDO — explicación 5× más grande */}
              <AnimatePresence>
                {open&&(
                  <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:0.3}}
                    style={{background:`linear-gradient(135deg,${p.color}08,${p.color}03)`,border:`2.5px solid ${isTop?"#f59e0b":p.color}`,borderTop:"none",borderRadius:"0 0 16px 16px",overflow:"hidden"}}>
                    <div style={{padding:"16px 16px 20px"}}>
                      {/* Estadísticas mini */}
                      <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                        {[{l:"POSICIÓN",v:`#${rank+1}`,c:p.color},{l:"VOTOS",v:count,c:"#374151"},{l:"PORCENTAJE",v:`${pc.toFixed(1)}%`,c:p.color},{l:"ESPECTRO",v:p.spectrumLabel,c:"#6b7280"}].map(({l,v,c})=>(
                          <div key={l} style={{background:"rgba(255,255,255,0.8)",border:`1px solid ${p.color}30`,borderRadius:10,padding:"8px 12px",flex:1,minWidth:70,textAlign:"center"}}>
                            <div style={{fontSize:8,color:"#9ca3af",letterSpacing:1,fontFamily:"Barlow Condensed,sans-serif",marginBottom:3}}>{l}</div>
                            <div style={{fontSize:15,fontWeight:900,color:c,fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{v}</div>
                          </div>
                        ))}
                      </div>
                      {/* DESCRIPCIÓN GRANDE */}
                      <div style={{background:"rgba(255,255,255,0.85)",borderRadius:12,padding:"14px",marginBottom:12,border:`1px solid ${p.color}25`}}>
                        <div style={{fontSize:9,color:p.color,letterSpacing:2,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}>📋 DESCRIPCIÓN DEL PARTIDO</div>
                        <div style={{fontSize:14,color:"#1a1a1a",lineHeight:1.8,fontFamily:"Barlow Condensed,sans-serif",fontWeight:600}}>{p.descripcion}</div>
                      </div>
                      {/* DATO CURIOSO */}
                      <div style={{background:`${p.color}12`,borderRadius:12,padding:"14px",marginBottom:12,border:`1px solid ${p.color}30`}}>
                        <div style={{fontSize:9,color:p.color,letterSpacing:2,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}>💡 DATO CURIOSO</div>
                        <div style={{fontSize:14,color:"#1a1a1a",lineHeight:1.8,fontFamily:"Barlow Condensed,sans-serif",fontWeight:600}}>{p.curioso}</div>
                      </div>
                      {/* FICHA TÉCNICA */}
                      <div style={{background:"rgba(0,0,0,0.03)",borderRadius:12,padding:"12px",border:"1px solid rgba(0,0,0,0.06)"}}>
                        <div style={{fontSize:9,color:"#9ca3af",letterSpacing:2,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}>🗂️ FICHA TÉCNICA</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                          {[{l:"Fundado",v:p.fundado},{l:"Fundador",v:p.fundador},{l:"Dirigente",v:p.dirigente},{l:"Militantes",v:p.militantes}].map(({l,v})=>(
                            <div key={l} style={{background:"rgba(255,255,255,0.7)",borderRadius:8,padding:"7px 10px"}}>
                              <div style={{fontSize:8,color:"#9ca3af",letterSpacing:1,fontFamily:"Barlow Condensed,sans-serif",marginBottom:2}}>{l.toUpperCase()}</div>
                              <div style={{fontSize:12,fontWeight:700,color:"#374151",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1.3}}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Tags ideología */}
                      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12}}>
                        {p.ideologyTags.map(tag=>{const ideo=IDEOLOGIES.find(i=>i.id===tag);return ideo?(<div key={tag} style={{background:ideo.bg,color:ideo.color,padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:0.5}}>{ideo.label}</div>):null;})}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
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
  useEffect(()=>{
    try{if(localStorage.getItem("encuestasilao_install_dismissed"))return;}catch(e){}
    const handler=(e)=>{e.preventDefault();setDeferredPrompt(e);setShow(true);};
    window.addEventListener("beforeinstallprompt",handler);
    // Show for iOS after 3 seconds if not installed
    const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone=window.matchMedia("(display-mode: standalone)").matches;
    if(isIOS&&!isStandalone){setTimeout(()=>setShow(true),3000);}
    return()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);
  const install=async()=>{
    if(deferredPrompt){deferredPrompt.prompt();const r=await deferredPrompt.userChoice;setShow(false);}
    else{alert("Para instalar:\niPhone: toca Compartir → Agregar a pantalla de inicio\nAndroid: toca el menú ⋮ → Agregar a pantalla de inicio");}
    try{localStorage.setItem("encuestasilao_install_dismissed","1");}catch(e){}
  };
  const dismiss=()=>{setShow(false);try{localStorage.setItem("encuestasilao_install_dismissed","1");}catch(e){}};
  if(!show)return null;
  return(
    <motion.div initial={{y:100,opacity:0}} animate={{y:0,opacity:1}} exit={{y:100,opacity:0}}
      style={{position:"fixed",bottom:70,left:0,right:0,zIndex:200,padding:"0 13px",maxWidth:580,margin:"0 auto"}}>
      <div style={{background:"linear-gradient(135deg,#1a0a2e,#2d1b69)",border:"2px solid #7c3aed",borderRadius:16,padding:"14px 16px",boxShadow:"0 8px 32px rgba(124,58,237,0.4)",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:44,height:44,borderRadius:10,overflow:"hidden",flexShrink:0,border:"2px solid #7c3aed"}}>
          <img src="" alt="Encuesta Silao" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:12,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",marginBottom:2}}>📲 Instala Encuesta Silao</div>
          <div style={{fontSize:9,color:"rgba(196,181,253,0.7)",fontFamily:"Barlow Condensed,sans-serif"}}>Acceso rápido desde tu celular, gratis</div>
        </div>
        <motion.button whileTap={{scale:0.95}} onClick={install}
          style={{background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:9,padding:"8px 14px",color:"#fff",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",flexShrink:0}}>
          INSTALAR
        </motion.button>
        <button onClick={dismiss} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontSize:16,cursor:"pointer",flexShrink:0,padding:"4px"}}>✕</button>
      </div>
    </motion.div>
  );
}
function VoteScreen({votes,total,myVote,onVote,user,onLoginClick,onLogoClick,onLogout,siteLogo,candidates,setScreen}){
  const[justVoted,setJustVoted]=useState(null);
  const[showMoney,setShowMoney]=useState(false);
  const[showBallots,setShowBallots]=useState(false);
  const[showConfirmExit,setShowConfirmExit]=useState(null); // partido id
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
    // Guardar en localStorage
    try{localStorage.setItem("encuestasilao_mivoto",id);}catch(e){}
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

      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} onLogout={onLogout} siteLogo={siteLogo}/>

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
          style={{width:"100%",background:"#1877f2",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginBottom:10,fontFamily:"Barlow Condensed,sans-serif"}}>
          <span style={{fontFamily:"Georgia,serif",fontWeight:900,fontSize:14}}>f</span> ENTRA CON FACEBOOK PARA VOTAR
        </motion.button>}

        <AnimatePresence>{justVoted&&myVote&&(
          <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0}}
            style={{background:"#f0fdf4",border:"2px solid #86efac",borderRadius:14,padding:"14px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontSize:28}}>✅</span>
            <div>
              <div style={{fontSize:14,fontWeight:900,color:"#15803d",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>¡VOTASTE POR {PARTIES.find(p=>p.id===myVote)?.short||myVote.toUpperCase()}!</div>
              <div style={{fontSize:10,color:"#16a34a",marginTop:2}}>Tu voto queda guardado. Puedes cambiarlo cuando quieras.</div>
            </div>
          </motion.div>
        )}</AnimatePresence>

        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {PARTIES.map((p,i)=>{
            const count=votes[p.id]||0,isMe=myVote===p.id;
            const cand=candidates?.[p.id];
            return(
              <motion.button key={p.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
                whileTap={{scale:0.97}}
                onClick={()=>doVote(p.id)}
                style={{display:"flex",gap:10,alignItems:"center",background:isMe?`${p.color}0d`:"#fff",border:`2px solid ${isMe?p.color:"#e5e7eb"}`,borderRadius:14,padding:"12px",cursor:"pointer",width:"100%",textAlign:"left",
                  boxShadow:isMe?`0 0 0 1px ${p.color}, 0 4px 20px ${p.color}40`:"0 1px 4px rgba(0,0,0,0.04)",
                  position:"relative",overflow:"hidden"}}>
                {/* LED shimmer cuando es mi voto */}
                {isMe&&<div style={{position:"absolute",inset:0,background:`linear-gradient(90deg,transparent,${p.color}15,transparent)`,animation:"ledShimmer 1.5s ease-in-out infinite",pointerEvents:"none"}}/>}
                {/* Logo partido */}
                <div style={{width:54,height:54,borderRadius:10,overflow:"hidden",flexShrink:0,border:`2.5px solid ${isMe?p.color:`${p.color}40`}`,boxShadow:isMe?`0 0 14px ${p.color}60`:"none",background:`${p.color}10`}}>
                  {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.emoji}</span>}
                </div>
                {/* Info */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:900,color:isMe?p.color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif",display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
                    {p.short}
                    {isMe&&<span style={{fontSize:8,color:"#fff",background:p.color,padding:"2px 7px",borderRadius:10,fontWeight:800,letterSpacing:.5}}>✓ TU VOTO</span>}
                  </div>
                  <div style={{fontSize:8,color:p.color,fontWeight:700,marginTop:2,fontFamily:"Barlow Condensed,sans-serif"}}>{p.spectrumLabel}</div>
                  <div style={{fontSize:18,fontWeight:900,color:isMe?p.color:count>0?"#1a1a1a":"#d1d5db",fontFamily:"Barlow Condensed,sans-serif",marginTop:3,lineHeight:1}}>
                    <LiveCount value={count}/> <span style={{fontSize:9,fontWeight:500,color:"#9ca3af"}}>votos</span>
                  </div>
                </div>
                {/* Foto candidato con LED */}
                <CandidateBox candidate={cand} color={p.color} size={54} radius={10}/>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── PROPOSALS SCREEN ──
function ProposalsScreen({user,onLoginClick,onLogoClick,onLogout,total,proposals,setProposals,siteLogo,isAdmin}){
  const[confirmVote,setConfirmVote]=useState(null);const[newProp,setNewProp]=useState("");const[showForm,setShowForm]=useState(false);
  const doVote=(pid,tipo)=>{if(!user){playSound("click");onLoginClick();return;}const p=proposals.find(x=>x.id===pid);if(p?.miVoto===tipo)return;if(p?.miVoto){setProposals(prev=>prev.map(x=>{if(x.id!==pid)return x;return{...x,[tipo]:x[tipo]+1,[x.miVoto]:x[x.miVoto]-1,miVoto:tipo};}));}else{playSound("vote");setConfirmVote({pid,tipo});}};
  const confirmAndVote=()=>{if(!confirmVote)return;const{pid,tipo}=confirmVote;setProposals(prev=>prev.map(x=>{if(x.id!==pid)return x;return{...x,[tipo]:x[tipo]+1,miVoto:tipo};}));playSound("success");setConfirmVote(null);};
  const addProp=()=>{if(!newProp.trim())return;setProposals(prev=>[{id:"p"+Date.now(),emoji:"💬",titulo:newProp.trim(),desc:`Propuesta de ${user?.nickname||"ciudadano"}`,si:1,no:0,miVoto:"si",autor:user?.nickname||"Ciudadano"},...prev]);setNewProp("");setShowForm(false);playSound("success");};
  const deleteProp=(pid)=>setProposals(prev=>prev.filter(x=>x.id!==pid));
  const pending=confirmVote?proposals.find(x=>x.id===confirmVote.pid):null;
  const THEMES=[{bg:"linear-gradient(135deg,#0d0221,#2d1b69)",border:"#7c3aed",glow:"rgba(124,58,237,0.5)"},{bg:"linear-gradient(135deg,#012312,#064e3b)",border:"#10b981",glow:"rgba(16,185,129,0.5)"},{bg:"linear-gradient(135deg,#1a0600,#7c2d12)",border:"#f97316",glow:"rgba(249,115,22,0.5)"},{bg:"linear-gradient(135deg,#020617,#1e3a8a)",border:"#3b82f6",glow:"rgba(59,130,246,0.5)"},{bg:"linear-gradient(135deg,#1a0020,#701a75)",border:"#e879f9",glow:"rgba(232,121,249,0.5)"}];
  return(
    <div style={{paddingBottom:96,background:"#f8faff",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} onLogout={onLogout} siteLogo={siteLogo}/>
      <AnimatePresence>{confirmVote&&pending&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{position:"fixed",inset:0,zIndex:800,background:"rgba(0,0,0,0.9)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <motion.div initial={{scale:0.8,y:30}} animate={{scale:1,y:0}} style={{background:confirmVote.tipo==="si"?"linear-gradient(135deg,#022c22,#14532d)":"linear-gradient(135deg,#3b0a0a,#7f1d1d)",border:`2px solid ${confirmVote.tipo==="si"?"#4ade80":"#f87171"}`,borderRadius:22,padding:"26px 22px",maxWidth:340,width:"100%",textAlign:"center"}}>
            <div style={{fontSize:54,marginBottom:8}}>{confirmVote.tipo==="si"?"👍":"👎"}</div>
            <div style={{fontSize:17,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2,marginBottom:7}}>{confirmVote.tipo==="si"?"¡VAS A APOYAR ESTO!":"NO APOYAS ESTA PROPUESTA"}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.65)",marginBottom:18,fontStyle:"italic"}}>"{pending.titulo}"</div>
            <div style={{display:"flex",gap:9}}>
              <button onClick={()=>setConfirmVote(null)} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:"10px",color:"rgba(255,255,255,0.7)",fontSize:12,fontWeight:700,cursor:"pointer"}}>CANCELAR</button>
              <motion.button whileTap={{scale:0.96}} onClick={confirmAndVote} style={{flex:2,background:confirmVote.tipo==="si"?"linear-gradient(135deg,#16a34a,#15803d)":"linear-gradient(135deg,#dc2626,#b91c1c)",border:"none",borderRadius:12,padding:"10px",color:"#fff",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>✅ CONFIRMAR</motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <div style={{padding:"12px 2px 10px",borderBottom:"2px solid #7c3aed",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div><div style={{fontSize:17,fontWeight:900,color:"#a78bfa",fontFamily:"Barlow Condensed,sans-serif"}}>💡 Propuestas Ciudadanas</div><div style={{fontSize:9,color:"rgba(167,139,250,0.6)",marginTop:2}}>Vota qué quieres que haga el próximo gobierno</div></div>
          {user&&<motion.button whileTap={{scale:0.95}} onClick={()=>{playSound("click");setShowForm(s=>!s);}} style={{background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:9,padding:"8px 12px",color:"#fff",fontSize:10,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:.5}}>+ PROPONER</motion.button>}
        </div>
        <AnimatePresence>{showForm&&(
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
            style={{background:"rgba(124,58,237,0.15)",border:"2px solid #7c3aed",borderRadius:14,padding:"14px",marginBottom:14,overflow:"hidden"}}>
            <div style={{fontSize:10,color:"#c4b5fd",marginBottom:8,fontWeight:800,letterSpacing:1,fontFamily:"Barlow Condensed,sans-serif"}}>TU PROPUESTA PARA SILAO</div>
            <input value={newProp} onChange={e=>setNewProp(e.target.value.slice(0,120))} placeholder="¿Qué necesita Silao? Ej: Más iluminación en..." style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"1.5px solid rgba(124,58,237,0.5)",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"Barlow Condensed,sans-serif",marginBottom:8}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:9,color:"rgba(196,181,253,0.5)",fontFamily:"Barlow Condensed,sans-serif"}}>{newProp.length}/120</span>
              <div style={{display:"flex",gap:7}}>
                <button onClick={()=>setShowForm(false)} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:8,padding:"7px 12px",color:"rgba(255,255,255,0.5)",fontSize:10,cursor:"pointer"}}>CANCELAR</button>
                <motion.button whileTap={{scale:0.96}} onClick={addProp} disabled={!newProp.trim()} style={{background:newProp.trim()?"#7c3aed":"rgba(255,255,255,0.1)",border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",fontSize:10,fontWeight:800,cursor:newProp.trim()?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif"}}>✅ ENVIAR</motion.button>
              </div>
            </div>
          </motion.div>
        )}</AnimatePresence>
        {!user&&<div style={{background:"rgba(255,255,255,0.04)",border:"1px dashed rgba(124,58,237,0.4)",borderRadius:12,padding:"12px",marginBottom:14,textAlign:"center"}}><div style={{fontSize:11,color:"rgba(196,181,253,0.6)",marginBottom:8}}>Entra para agregar tu propia propuesta</div><button onClick={()=>{playSound("click");onLoginClick();}} style={{background:"#7c3aed",border:"none",borderRadius:8,padding:"8px 16px",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>f ENTRAR Y PROPONER</button></div>}
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
// ── PREGÚNTALE A TU CANDIDATO ──
function PreguntaleScreen({user,onLoginClick,onLogoClick,onLogout,total,siteLogo,candidates}){
  const cats=Object.keys(PREGUNTAS);
  const[cat,setCat]=useState(cats[0]);
  const[idx,setIdx]=useState(0);
  const[dir,setDir]=useState(1);
  const[showSuggest,setShowSuggest]=useState(null); // partido id o null
  const[suggText,setSuggText]=useState("");
  const[suggSent,setSuggSent]=useState(false);
  const questions=PREGUNTAS[cat];
  const q=questions[idx%questions.length];

  const nextQ=()=>{setDir(1);setIdx(i=>(i+1)%questions.length);};
  const prevQ=()=>{setDir(-1);setIdx(i=>(i-1+questions.length)%questions.length);};

  const retarle=(partido)=>{
    const fecha=new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"}).toUpperCase();
    const msg=`❓ Le pregunto a ${partido.name}:\n\n"${q}"\n\n📅 ${fecha}\n📱 Encuesta Silao — Voz Ciudadana\n👉 encuestasilao.mx\n\n#Silao #PreguntaleAlCandidato`;
    window.open("https://api.whatsapp.com/send?text="+encodeURIComponent(msg),"_blank");
  };
  const retarleFB=(partido)=>{
    const msg=`❓ "${q}" — Le pregunto a ${partido.name}. Encuesta Silao`;
    window.open("https://www.facebook.com/sharer/sharer.php?u="+encodeURIComponent("https://encuestasilao.mx")+"&quote="+encodeURIComponent(msg),"_blank");
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
        {/* Título */}
        <div style={{textAlign:"center",marginBottom:14}}>
          <div style={{fontSize:30,fontWeight:900,color:"#1a1a1a",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:2}}>PREGÚNTALE</div>
          <div style={{fontSize:15,color:"#6b7280",marginTop:2,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>A TU CANDIDATO</div>
        </div>

        {/* Categorías */}
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:8,marginBottom:14}}>
          {cats.map(c=>(
            <motion.button key={c} whileTap={{scale:0.95}} onClick={()=>{setCat(c);setIdx(0);}}
              style={{flexShrink:0,background:cat===c?"linear-gradient(135deg,#e01010,#7c3aed)":"#fff",border:`2px solid ${cat===c?"transparent":"#e5e7eb"}`,borderRadius:20,padding:"6px 12px",color:cat===c?"#fff":"#374151",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",whiteSpace:"nowrap",boxShadow:cat===c?"0 4px 12px rgba(224,16,16,0.3)":"none"}}>
              {c}
            </motion.button>
          ))}
        </div>

        {/* Pregunta del día con animación */}
        <AnimatePresence mode="wait">
          <motion.div key={cat+idx}
            initial={{opacity:0,x:dir>0?60:-60}}
            animate={{opacity:1,x:0}}
            exit={{opacity:0,x:dir>0?-60:60}}
            transition={{duration:0.28,ease:"easeOut"}}
            style={{background:"linear-gradient(135deg,#0f172a,#1e3a8a)",borderRadius:20,padding:"24px 20px",marginBottom:14,boxShadow:"0 8px 32px rgba(14,30,115,0.3)",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",inset:0,opacity:0.05,backgroundImage:"radial-gradient(circle,#fff 1px,transparent 1px)",backgroundSize:"20px 20px"}}/>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",letterSpacing:3,marginBottom:10,fontFamily:"Barlow Condensed,sans-serif"}}>{cat} — {idx+1}/{questions.length}</div>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.5)",marginBottom:6,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>¿Ya le preguntaste a tu candidato?</div>
            <div style={{fontSize:20,fontWeight:900,color:"#fff",lineHeight:1.4,fontFamily:"Barlow Condensed,sans-serif",marginBottom:18,position:"relative"}}>"{q}"</div>
            <div style={{display:"flex",gap:8}}>
              <motion.button whileTap={{scale:0.96}} onClick={prevQ}
                style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>
                ← ANTERIOR
              </motion.button>
              <motion.button whileTap={{scale:0.96}} onClick={nextQ}
                style={{flex:1,background:"rgba(255,255,255,0.15)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:10,padding:"8px 16px",color:"#fff",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
                SIGUIENTE →
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Retarle — con foto de candidato */}
        <div style={{fontSize:13,fontWeight:900,color:"#374151",letterSpacing:2,marginBottom:10,fontFamily:"Barlow Condensed,sans-serif"}}>🎯 RETARLE — MÁNDALE LA PREGUNTA</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
          {PARTIES.filter(p=>p.id!=="nulo").map(p=>{
            const logo=PARTY_LOGOS[p.id];
            const cand=candidates?.[p.id];
            const isSugOpen=showSuggest===p.id;
            return(
              <div key={p.id} style={{background:"#fff",border:`2px solid ${p.color}25`,borderRadius:16,overflow:"hidden"}}>
                <div style={{padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                  {/* Logo partido */}
                  <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",border:`2px solid ${p.color}`,flexShrink:0}}>
                    {logo?<img src={logo} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.emoji}</span>}
                  </div>
                  {/* Info */}
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:900,color:p.color,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</div>
                    {cand&&cand.nombre!=="Por definir"&&cand.nombre!=="No aplica"&&<div style={{fontSize:11,color:"#374151",fontFamily:"Barlow Condensed,sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cand.nombre}</div>}
                  </div>
                  {/* Foto candidato */}
                  {cand&&cand.fotoUrl&&(
                    <div style={{width:44,height:44,borderRadius:8,overflow:"hidden",border:`2px solid ${p.color}`,flexShrink:0,boxShadow:`0 0 10px ${p.color}40`}}>
                      <img src={cand.fotoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    </div>
                  )}
                  {/* Botones compartir */}
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
                {/* Botón sugerir pregunta */}
                <div style={{padding:"0 14px 10px"}}>
                  <motion.button whileTap={{scale:0.97}} onClick={()=>{setShowSuggest(isSugOpen?null:p.id);setSuggText("");setSuggSent(false);}}
                    style={{width:"100%",background:isSugOpen?`${p.color}12`:"#f8faff",border:`1.5px solid ${isSugOpen?p.color:"#e5e7eb"}`,borderRadius:10,padding:"8px 12px",color:isSugOpen?p.color:"#6b7280",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:0.5,display:"flex",alignItems:"center",gap:6,justifyContent:"center"}}>
                    💬 SUGERIR PREGUNTA AL ADMIN
                  </motion.button>
                </div>
                {/* Form sugiere pregunta */}
                <AnimatePresence>
                  {isSugOpen&&(
                    <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}}
                      style={{background:`${p.color}06`,borderTop:`1px solid ${p.color}20`,padding:"12px 14px",overflow:"hidden"}}>
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

function ArticlesScreen({user,onLoginClick,votes,total,onLogoClick,onLogout,candidates,siteLogo}){
  const[open,setOpen]=useState(null);const[ideologyOpen,setIdeologyOpen]=useState(null);
  const art=open!==null?PARTIES[open]:null;const ideo=ideologyOpen!==null?IDEOLOGIES[ideologyOpen]:null;
  if(ideo){return(
    <div style={{paddingBottom:88,background:"#f8faff",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} onLogout={onLogout} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <motion.button whileTap={{scale:0.96}} onClick={()=>setIdeologyOpen(null)} style={{background:"#e01010",border:"none",borderRadius:8,padding:"7px 14px",color:"#fff",fontSize:11,cursor:"pointer",margin:"12px 0",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>← VOLVER</motion.button>
        <div style={{background:ideo.bg,border:`2px solid ${ideo.color}`,borderRadius:16,padding:"18px",marginBottom:12}}><div style={{fontSize:18,fontWeight:900,color:ideo.color,marginBottom:8,fontFamily:"Barlow Condensed,sans-serif"}}>{ideo.label}</div><div style={{fontSize:13,color:"#374151",lineHeight:1.75}}>{ideo.desc}</div></div>
        <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{PARTIES.filter(p=>p.ideologyTags.includes(ideo.id)).map(p=>(<div key={p.id} style={{display:"flex",alignItems:"center",gap:5,background:`${p.color}12`,border:`1.5px solid ${p.color}40`,borderRadius:20,padding:"4px 10px"}}>{PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]} alt="" style={{width:18,height:18,borderRadius:3,objectFit:"cover"}}/>:<span>{p.emoji}</span>}<span style={{fontSize:11,fontWeight:800,color:p.color,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</span></div>))}</div>
      </div>
    </div>
  );}
  if(art){const artCand=candidates[art.id];return(
    <div style={{paddingBottom:88,background:"#f8faff",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} onLogout={onLogout} siteLogo={siteLogo}/>
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
          <div style={{padding:"12px 16px",background:"#fffbeb",borderBottom:`1px solid ${art.color}15`}}><div style={{fontSize:9,color:"#d97706",letterSpacing:2,marginBottom:5,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>💡 DATO CURIOSO</div><div style={{fontSize:14,color:"#92400e",lineHeight:1.6}}>{art.curioso}</div></div>
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

function CommentsScreen({user,onLoginClick,total,onLogoClick,onLogout,isAdmin,comments,setComments,blockedNicks,pinnedMsg,siteLogo}){
  const[text,setText]=useState("");const[replyOpen,setReplyOpen]=useState({});const[replyText,setReplyText]=useState({});const[sending,setSending]=useState(false);
  const post=async()=>{
    if(!text.trim()||sending)return;
    playSound("success");
    const newC={id:Date.now(),nick:user?user.nickname:"Visitante",txt:text.trim(),ts:Date.now(),reactions:{like:0,heart:0,fire:0,wow:0,haha:0},myReacted:{},replies:[]};
    setComments(prev=>[newC,...prev]);setText("");setSending(true);
    try{await sb.from("comentarios").insert({nick:newC.nick,txt:newC.txt,ts:newC.ts});}
    catch(e){console.warn("Foro offline",e);}
    finally{setSending(false);}
  };
  const react=(cid,key)=>setComments(prev=>prev.map(c=>{if(c.id!==cid)return c;const already=c.myReacted[key];return{...c,reactions:{...c.reactions,[key]:Math.max(0,(c.reactions[key]||0)+(already?-1:1))},myReacted:{...c.myReacted,[key]:!already}};}));
  const deleteC=async(cid)=>{setComments(prev=>prev.filter(c=>c.id!==cid));try{await sb.from("comentarios").delete().eq("id",String(cid));}catch(e){}};
  const postReply=(cid)=>{if(!replyText[cid]?.trim()||!user)return;setComments(prev=>prev.map(c=>{if(c.id!==cid)return c;return{...c,replies:[...(c.replies||[]),{nick:user.nickname,txt:replyText[cid].trim(),ts:Date.now()}]};}));setReplyText(r=>({...r,[cid]:""}));};
  const visible=(comments||[]).filter(c=>!(blockedNicks||[]).includes(c.nick));
  return(
    <div style={{paddingBottom:100,background:"#f8faff",minHeight:"100vh"}}>
      <Header total={total} user={user} onLoginClick={onLoginClick} onLogoClick={onLogoClick} onLogout={onLogout} siteLogo={siteLogo}/>
      <div style={{maxWidth:580,margin:"0 auto",padding:"0 13px"}}>
        <div style={{padding:"12px 2px 10px",borderBottom:"2px solid #7c3aed",marginBottom:12}}><div style={{fontSize:17,fontWeight:900,color:"#c4b5fd",fontFamily:"Barlow Condensed,sans-serif"}}>💬 Foro Ciudadano de Silao</div></div>
        {user?(<div style={{background:"linear-gradient(135deg,#1a0a2e,#2d1b69)",border:"2px solid #7c3aed",borderRadius:14,padding:"12px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}><div style={{width:26,height:26,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>🎭</div><span style={{fontSize:11,fontWeight:800,color:"#c4b5fd",fontFamily:"Barlow Condensed,sans-serif"}}>{user.nickname}</span></div>
          <textarea value={text} onChange={e=>setText(e.target.value.slice(0,280))} placeholder="¿Qué te falta ver en Silao? Opina sin miedo, tu apodo te protege..." style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(124,58,237,0.4)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12,outline:"none",resize:"none",height:70,lineHeight:1.5,fontFamily:"Barlow Condensed,sans-serif"}}/>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:7}}>
            <span style={{fontSize:8,color:"rgba(196,181,253,0.5)",fontFamily:"Barlow Condensed,sans-serif"}}>{text.length}/280</span>
            <motion.button whileTap={{scale:0.95}} onClick={post} disabled={!text.trim()} style={{background:text.trim()&&!sending?"linear-gradient(135deg,#7c3aed,#5b21b6)":"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:"7px 16px",color:text.trim()&&!sending?"#fff":"rgba(255,255,255,0.25)",fontSize:11,fontWeight:800,cursor:text.trim()&&!sending?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif"}}>{sending?"⏳ ENVIANDO...":"💬 PUBLICAR"}</motion.button>
          </div>
        </div>):(<motion.button whileTap={{scale:0.97}} onClick={()=>{playSound("click");onLoginClick();}} style={{width:"100%",background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:14,padding:"13px",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,marginBottom:12,fontWeight:800}}>💬 ENTRA CON FACEBOOK PARA COMENTAR</motion.button>)}
        <div style={{background:"linear-gradient(135deg,#0f1e5c,#1e3a8a)",border:"2px solid #3b82f6",borderRadius:14,padding:"12px",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}><div style={{width:28,height:28,borderRadius:"50%",overflow:"hidden",border:"2px solid #3b82f6"}}><img src="" alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div><div><div style={{fontSize:12,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>ENCUESTA SILAO</div><div style={{fontSize:7,color:"#93c5fd",letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif",fontWeight:700}}>CUENTA OFICIAL · 📌 FIJADO</div></div></div>
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

// ── ADMIN SUGERENCIAS COMPONENT ──
function AdminSugerencias({votes,comments}){
  const[sugs,setSugs]=useState([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{
    sb.from("sugerencias_preguntas").select("*").order("ts",{ascending:false})
      .then(res=>{setSugs(Array.isArray(res)?res:(res?.data||[]));setLoading(false);})
      .catch(()=>{setSugs([]);setLoading(false);});
  },[]);
  const deleteSug=async(id)=>{
    await sb.from("sugerencias_preguntas").delete().eq("id",id).catch(()=>{});
    setSugs(s=>s.filter(x=>x.id!==id));
  };
  return(
    <div>
      <div style={{fontSize:10,color:"#a78bfa",letterSpacing:2,marginBottom:14,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>❓ PREGUNTAS SUGERIDAS POR CIUDADANOS</div>
      {loading&&<div style={{color:"rgba(255,255,255,0.4)",textAlign:"center",padding:20}}>Cargando...</div>}
      {!loading&&sugs.length===0&&<div style={{color:"rgba(255,255,255,0.3)",textAlign:"center",padding:20,fontSize:13,fontFamily:"Barlow Condensed,sans-serif"}}>Ninguna sugerencia aún.</div>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {sugs.map(s=>(
          <div key={s.id} style={{background:"rgba(255,255,255,0.05)",border:"1.5px solid rgba(167,139,250,0.3)",borderRadius:12,padding:"14px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:"#a78bfa",letterSpacing:2,marginBottom:4,fontFamily:"Barlow Condensed,sans-serif",fontWeight:800}}>{s.partido||"SIN PARTIDO"} · {s.nick||"Anónimo"}</div>
                <div style={{fontSize:14,color:"#f1f5f9",fontFamily:"Barlow Condensed,sans-serif",fontWeight:700,lineHeight:1.5}}>{s.pregunta}</div>
                <div style={{fontSize:8,color:"rgba(255,255,255,0.25)",marginTop:4,fontFamily:"Barlow Condensed,sans-serif"}}>{s.ts?new Date(s.ts).toLocaleString("es-MX"):""}</div>
              </div>
              <button onClick={()=>deleteSug(s.id)} style={{background:"rgba(220,38,38,0.2)",border:"1px solid #dc2626",borderRadius:8,padding:"6px 10px",color:"#f87171",fontSize:10,cursor:"pointer",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif",flexShrink:0}}>🗑</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function AdminPanel({candidates,setCandidates,siteLogo,setSiteLogo,onClose,votes,setVotes,proposals,setProposals,comments,encuestaActiva,setEncuestaActiva,alertaMsg,setAlertaMsg,alertaActiva,setAlertaActiva,blockedNicks}){
  const[tab,setTab]=useState("stats");
  const[editId,setEditId]=useState(null);const[editData,setEditData]=useState({});
  const[newPropEmoji,setNewPropEmoji]=useState("💡");const[newPropTitle,setNewPropTitle]=useState("");const[newPropDesc,setNewPropDesc]=useState("");
  const[alertInput,setAlertInput]=useState(alertaMsg||"");
  const[resetConfirm,setResetConfirm]=useState(false);
  const[appDomain,setAppDomain]=useState("encuestasilao.mx");
  const[publishDelay,setPublishDelay]=useState(0);
  const[newPartyName,setNewPartyName]=useState("");const[newPartyShort,setNewPartyShort]=useState("");const[newPartyColor,setNewPartyColor]=useState("#6b7280");const[newPartyCand,setNewPartyCand]=useState("");
  const[exportFrom,setExportFrom]=useState("");const[exportTo,setExportTo]=useState("");
  const[visitCount,setVisitCount]=useState(null);
  // Cargar conteo real de entradas desde Supabase
  useEffect(()=>{
    sb.from("visitas").select("id").then(res=>{
      const data=Array.isArray(res)?res:(res?.data||[]);
      setVisitCount(data.length);
    }).catch(()=>{
      // Fallback: contar por votos si no hay tabla visitas
      setVisitCount(null);
    });
  },[]);
  const uploadLogo=(pid,e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{PARTY_LOGOS[pid]=ev.target.result;setCandidates(p=>({...p}));};r.readAsDataURL(f);};
  const uploadSiteLogo=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setSiteLogo(ev.target.result);r.readAsDataURL(f);};
  const uploadCandPhoto=(pid,e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>setCandidates(p=>({...p,[pid]:{...p[pid],fotoUrl:ev.target.result}}));r.readAsDataURL(f);};
  const saveCand=()=>{setCandidates(p=>({...p,[editId]:editData}));setEditId(null);playSound("success");};
  const addProp=()=>{if(!newPropTitle.trim())return;setProposals(prev=>[{id:"ap"+Date.now(),emoji:newPropEmoji,titulo:newPropTitle.trim(),desc:newPropDesc.trim()||"Propuesta del administrador",si:0,no:0,miVoto:null,autor:"Admin"},...prev]);setNewPropTitle("");setNewPropDesc("");playSound("success");};
  const deleteProp=(pid)=>setProposals(prev=>prev.filter(x=>x.id!==pid));
  const resetVotes=()=>{setVotes(Object.fromEntries(PARTIES.map(p=>[p.id,0])));setResetConfirm(false);playSound("success");};
  const total=Object.values(votes).reduce((a,b)=>a+b,0);
  const TABS=[{id:"stats",label:"📊 STATS"},{id:"alertas",label:"🔔 ALERTAS"},{id:"encuesta",label:"🗳️ ENCUESTA"},{id:"candidatos",label:"👤 CANDIDATOS"},{id:"propuestas",label:"💡 PROPUESTAS"},{id:"sugerencias",label:"❓ PREGUNTAS"},{id:"partidos",label:"🏛️ PARTIDOS"},{id:"exportar",label:"📥 EXPORTAR"},{id:"config",label:"⚙️ CONFIG"}];
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
                  <span style={{fontSize:8,color:"#22c55e",fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>ACTIVA</span>
                </div>
              </div>
              <div style={{fontSize:9,color:"rgba(196,181,253,0.5)",marginTop:2,fontFamily:"Barlow Condensed,sans-serif"}}>{new Date().toLocaleDateString("es-MX",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
            </div>
            <motion.button whileTap={{scale:0.95}} onClick={onClose} style={{background:"linear-gradient(135deg,#dc2626,#7f1d1d)",border:"2px solid #f87171",borderRadius:10,padding:"12px 24px",color:"#fff",fontSize:16,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,boxShadow:"0 4px 14px rgba(220,38,38,0.5)"}}>🚪 SALIR</motion.button>
          </div>
          {/* Sin bloque de apodo — más espacio y salida libre */}
          {/* Tabs */}
          <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2}}>
            {TABS.map(t=>(<motion.button key={t.id} whileTap={{scale:0.95}} onClick={()=>setTab(t.id)}
              style={{background:tab===t.id?"linear-gradient(135deg,#7c3aed,#5b21b6)":"rgba(255,255,255,0.07)",border:tab===t.id?"none":"1px solid rgba(255,255,255,0.12)",borderRadius:20,padding:"6px 12px",color:tab===t.id?"#fff":"rgba(255,255,255,0.5)",fontSize:9,fontWeight:800,cursor:"pointer",whiteSpace:"nowrap",fontFamily:"Barlow Condensed,sans-serif",flexShrink:0}}>{t.label}</motion.button>))}
          </div>
        </div>

        <div style={{padding:"14px 16px"}}>

        {/* ── STATS ── */}
        {tab==="stats"&&(()=>{
          const leader=[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0))[0];
          const vv=PARTIES.map(p=>votes[p.id]||0);
          const mean=total>0?total/PARTIES.length:0;
          const sorted_vv=[...vv].sort((a,b)=>a-b);
          const median=sorted_vv.length%2===0?(sorted_vv[sorted_vv.length/2-1]+sorted_vv[sorted_vv.length/2])/2:sorted_vv[Math.floor(sorted_vv.length/2)];
          const variance=vv.reduce((a,v)=>a+Math.pow(v-mean,2),0)/vv.length;
          const sigma=Math.sqrt(variance);
          const leaderPct=total>0?(votes[leader.id]||0)/total:0;
          const me=total>1?1.96*Math.sqrt(leaderPct*(1-leaderPct)/total)*100:0;
                    const STATS=[
            {id:"pct",sym:"%",label:"PORCENTAJE",color:"#e01010",val:`${(leaderPct*100).toFixed(1)}%`,sub:`Líder: ${leader.short}`,exp:`Del total de ${total} votos, ${leader.short} tiene ${(leaderPct*100).toFixed(1)}%. Se calcula dividiendo sus votos entre el total × 100.`},
            {id:"mean",sym:"x̄",label:"PROMEDIO",color:"#7c3aed",val:mean.toFixed(1),sub:"votos/partido",exp:`Promedio de votos por partido: ${total} ÷ ${PARTIES.length} partidos = ${mean.toFixed(2)} votos en promedio.`},
            {id:"med",sym:"Md",label:"MEDIANA",color:"#0891b2",val:median.toFixed(0),sub:"valor central",exp:`Ordenando los votos: [${sorted_vv.join(", ")}]. El valor central es ${median.toFixed(0)}.`},
            {id:"std",sym:"σ",label:"DESV. ESTÁNDAR",color:"#ca8a04",val:sigma.toFixed(1),sub:"dispersión",exp:`σ=${sigma.toFixed(2)} indica qué tan disparejos están los votos. Mayor σ = más concentración en un partido.`},
            {id:"me",sym:"±",label:"MARGEN ERROR",color:"#059669",val:total>9?`±${me.toFixed(2)}%`:"n<10",sub:"95% confianza",exp:total>9?`Con n=${total} votos, el líder tiene IC 95% de [${Math.max(0,leaderPct*100-me).toFixed(1)}% – ${Math.min(100,leaderPct*100+me).toFixed(1)}%].`:"Necesitas al menos 10 votos para calcular el margen de error."},
            {id:"n",sym:"n",label:"MUESTRA",color:"#1d4ed8",val:String(total),sub:"votos totales",exp:total<30?"⚠️ Muestra muy pequeña — resultados preliminares.":total<100?"📈 Muestra en crecimiento.":"✅ Muestra estadísticamente relevante."},
          ];
          return(
          <div>
            {/* KPI cards */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {[{icon:"🗳️",val:total,label:"TOTAL VOTOS",color:"#e01010",sub:`Líder: ${leader.short}`},{icon:"💬",val:comments?.length||0,label:"COMENTARIOS",color:"#7c3aed",sub:"En el foro"},{icon:"👁️",val:visitCount!==null?visitCount:"...",label:"ENTRADAS",color:"#0891b2",sub:"Visitas reales"},{icon:"🏆",val:total>0?`${(leaderPct*100).toFixed(1)}%`:"—",label:"LÍDER",color:"#f59e0b",sub:leader.short}].map(({icon,val,label,color,sub})=>(
                <div key={label} style={{background:`linear-gradient(135deg,${color}15,${color}05)`,border:`1.5px solid ${color}35`,borderRadius:14,padding:"14px 12px",position:"relative",overflow:"hidden"}}>
                  <div style={{position:"absolute",top:-6,right:-6,fontSize:44,opacity:0.06}}>{icon}</div>
                  <div style={{fontSize:24,marginBottom:2}}>{icon}</div>
                  <div style={{fontSize:28,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{typeof val==="number"?val.toLocaleString("es-MX"):val}</div>
                  <div style={{fontSize:7,color,letterSpacing:2,marginTop:3,fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>{label}</div>
                  <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",fontFamily:"Barlow Condensed,sans-serif"}}>{sub}</div>
                </div>
              ))}
            </div>

            {/* ── LOGOS GRANDES 5× ── */}
            <div style={{fontSize:9,color:"rgba(167,139,250,0.6)",letterSpacing:3,marginBottom:10,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>◉ PARTIDOS — FOTOS Y POSICIONES</div>
            <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",marginBottom:16}}>
              <div style={{display:"flex",gap:10,width:"max-content",padding:"4px 2px 8px"}}>
                {[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0)).map((p,i)=>{
                  const cnt=votes[p.id]||0;
                  const pc=total>0?cnt/total*100:0;
                  const isTop=i===0&&cnt>0;
                  return(
                    <div key={p.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,minWidth:110}}>
                      {/* Logo 110px = 5× de 22px */}
                      <div style={{position:"relative",width:110,height:110,borderRadius:18,overflow:"hidden",
                        border:`3px solid ${isTop?"#f59e0b":p.color+"66"}`,
                        background:`${p.color}12`,
                        boxShadow:isTop?`0 0 22px ${p.color}66,0 6px 20px rgba(0,0,0,0.4)`:`0 3px 10px rgba(0,0,0,0.3)`,
                        flexShrink:0}}>
                        {PARTY_LOGOS[p.id]
                          ?<img src={PARTY_LOGOS[p.id]} alt={p.short} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          :<div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3}}>
                            <span style={{fontSize:42}}>{p.emoji}</span>
                            <span style={{fontSize:9,fontWeight:900,color:p.color,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>{p.short}</span>
                          </div>}
                        {isTop&&<div style={{position:"absolute",top:5,right:5,fontSize:18}}>🏆</div>}
                        {/* barra % animada */}
                        <div style={{position:"absolute",bottom:0,left:0,right:0,height:6,background:"rgba(0,0,0,0.2)"}}>
                          <motion.div initial={{width:"0%"}} animate={{width:`${pc}%`}} transition={{duration:1.4,ease:"easeOut"}}
                            style={{height:"100%",background:isTop?"#f59e0b":p.color}}/>
                        </div>
                      </div>
                      <div style={{fontSize:9,fontWeight:900,color:isTop?"#f59e0b":p.color,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>{p.short}</div>
                      <div style={{fontSize:16,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{pc.toFixed(1)}<span style={{fontSize:9,opacity:.6}}>%</span></div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",fontFamily:"Barlow Condensed,sans-serif"}}>{cnt} votos</div>
                      {/* subir logo desde aquí */}
                      <label style={{background:`${p.color}20`,border:`1px solid ${p.color}60`,borderRadius:8,padding:"5px 10px",color:p.color,fontSize:8,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:0.5}}>
                        📷 LOGO<input type="file" accept="image/*" onChange={(e)=>uploadLogo(p.id,e)} style={{display:"none"}}/>
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── BOTONES ESTADÍSTICAS ── */}
            <div style={{fontSize:9,color:"rgba(167,139,250,0.6)",letterSpacing:3,marginBottom:10,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>◉ ESTADÍSTICAS AVANZADAS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:7,marginBottom:activeStat?12:0}}>
              {STATS.map(s=>{
                const isAct=activeStat===s.id;
                return(
                  <motion.button key={s.id} whileTap={{scale:0.93}}
                    onClick={()=>{playSound("click");setActiveStat(isAct?null:s.id);}}
                    style={{background:isAct?s.color:"rgba(255,255,255,0.05)",
                      border:`1.5px solid ${isAct?s.color:s.color+"44"}`,
                      borderRadius:12,padding:"12px 8px",cursor:"pointer",
                      boxShadow:isAct?`0 4px 16px ${s.color}44`:"none",transition:"all .15s"}}>
                    <div style={{fontSize:18,fontWeight:900,color:isAct?"#fff":s.color,fontFamily:"Barlow Condensed,sans-serif",lineHeight:1,marginBottom:4}}>{s.sym}</div>
                    <div style={{fontSize:15,fontWeight:900,color:isAct?"#fff":s.color,fontFamily:"Barlow Condensed,sans-serif",lineHeight:1,marginBottom:2}}>{s.val}</div>
                    <div style={{fontSize:7,color:isAct?"rgba(255,255,255,0.65)":"rgba(255,255,255,0.3)",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>{s.label}</div>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {activeStat&&(()=>{const s=STATS.find(x=>x.id===activeStat);return s?(
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
                  style={{background:`${s.color}14`,border:`1.5px solid ${s.color}44`,borderRadius:14,padding:"14px",overflow:"hidden",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{width:38,height:38,borderRadius:10,background:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",flexShrink:0}}>{s.sym}</div>
                    <div>
                      <div style={{fontSize:11,fontWeight:900,color:s.color,letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif"}}>{s.label}</div>
                      <div style={{fontSize:22,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",lineHeight:1}}>{s.val} <span style={{fontSize:10,opacity:.5}}>{s.sub}</span></div>
                    </div>
                  </div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.7,fontFamily:"Barlow Condensed,sans-serif"}}>{s.exp}</div>
                </motion.div>
              ):null;})()}
            </AnimatePresence>
          </div>
          );
        })()}

        {/* ── ALERTAS ── */}
        {tab==="alertas"&&(<div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.5)",marginBottom:14,fontFamily:"Barlow Condensed,sans-serif"}}>🔔 ALERTAS Y REPORTES ({0})</div>
          <div style={{textAlign:"center",padding:"50px 20px",color:"rgba(255,255,255,0.2)"}}>
            <div style={{fontSize:54,marginBottom:12}}>🔔</div>
            <div style={{fontSize:12,fontFamily:"Barlow Condensed,sans-serif"}}>Sin alertas por ahora. Aquí aparecerán propuestas, reportes y bugs de usuarios.</div>
          </div>
        </div>)}

        {/* ── ENCUESTA ── */}
        {tab==="encuesta"&&(<div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"16px",marginBottom:14}}>
            <div style={{fontSize:10,color:"#a78bfa",letterSpacing:2,marginBottom:12,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>🗳️ CONTROL DE ENCUESTA</div>
            <div style={{display:"flex",gap:10,marginBottom:10}}>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{setEncuestaActiva(true);playSound("success");}}
                style={{flex:1,background:encuestaActiva?"#16a34a":"rgba(22,163,74,0.2)",border:`2px solid ${encuestaActiva?"#16a34a":"rgba(22,163,74,0.4)"}`,borderRadius:10,padding:"12px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                ✅ ACTIVAR ENCUESTA
              </motion.button>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{setEncuestaActiva(false);playSound("click");}}
                style={{flex:1,background:!encuestaActiva?"#dc2626":"rgba(220,38,38,0.2)",border:`2px solid ${!encuestaActiva?"#dc2626":"rgba(220,38,38,0.4)"}`,borderRadius:10,padding:"12px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                ⏸ PAUSAR
              </motion.button>
            </div>
            {resetConfirm?(
              <div style={{background:"rgba(220,38,38,0.15)",border:"2px solid #dc2626",borderRadius:10,padding:"12px",textAlign:"center"}}>
                <div style={{fontSize:11,color:"#f87171",marginBottom:10,fontFamily:"Barlow Condensed,sans-serif"}}>¿Seguro? Esto borrará TODOS los votos.</div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>setResetConfirm(false)} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"9px",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:700}}>CANCELAR</button>
                  <motion.button whileTap={{scale:0.96}} onClick={resetVotes} style={{flex:1,background:"#dc2626",border:"none",borderRadius:8,padding:"9px",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>SÍ, RESETEAR</motion.button>
                </div>
              </div>
            ):(
              <motion.button whileTap={{scale:0.96}} onClick={()=>setResetConfirm(true)}
                style={{width:"100%",background:"rgba(220,38,38,0.1)",border:"2px solid #dc2626",borderRadius:10,padding:"12px",color:"#f87171",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
                🔄 RESETEAR TODOS LOS VOTOS A CERO
              </motion.button>
            )}
          </div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"16px"}}>
            <div style={{fontSize:10,color:"#a78bfa",letterSpacing:2,marginBottom:12,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>🔢 EDITAR VOTOS MANUALMENTE</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:10,fontFamily:"Barlow Condensed,sans-serif"}}>Toca el número para editarlo directamente</div>
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
        </div>)}

        {/* ── PROPUESTAS ── */}
        {tab==="propuestas"&&(<div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(124,58,237,0.3)",borderRadius:14,padding:"16px",marginBottom:14}}>
            <div style={{fontSize:10,color:"#a78bfa",letterSpacing:2,marginBottom:12,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>+ NUEVA PROPUESTA</div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input value={newPropEmoji} onChange={e=>setNewPropEmoji(e.target.value)} placeholder="💡" style={{width:52,background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(124,58,237,0.4)",borderRadius:8,padding:"10px",color:"#fff",fontSize:18,textAlign:"center",outline:"none"}}/>
              <input value={newPropTitle} onChange={e=>setNewPropTitle(e.target.value.slice(0,100))} placeholder="Título de la propuesta" style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(124,58,237,0.4)",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"Barlow Condensed,sans-serif"}}/>
            </div>
            <input value={newPropDesc} onChange={e=>setNewPropDesc(e.target.value.slice(0,150))} placeholder="Descripción breve (opcional)" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(124,58,237,0.4)",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:12,outline:"none",fontFamily:"Barlow Condensed,sans-serif",marginBottom:10}}/>
            <motion.button whileTap={{scale:0.96}} onClick={addProp} disabled={!newPropTitle.trim()}
              style={{width:"100%",background:newPropTitle.trim()?"linear-gradient(135deg,#7c3aed,#5b21b6)":"rgba(255,255,255,0.06)",border:"none",borderRadius:10,padding:"12px",color:newPropTitle.trim()?"#fff":"rgba(255,255,255,0.25)",fontSize:13,fontWeight:900,cursor:newPropTitle.trim()?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
              💡 AGREGAR PROPUESTA
            </motion.button>
          </div>
          <div style={{fontSize:10,color:"#a78bfa",letterSpacing:2,marginBottom:10,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>PROPUESTAS ACTIVAS ({proposals.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            {proposals.map(p=>{const siPct=p.si+p.no>0?Math.round((p.si/(p.si+p.no))*100):0;return(
              <div key={p.id} style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"12px"}}>
                <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:8}}>
                  <span style={{fontSize:22,flexShrink:0}}>{p.emoji}</span>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:900,color:"#fff",fontFamily:"Barlow Condensed,sans-serif",marginBottom:2}}>{p.titulo}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{p.desc}</div></div>
                  <motion.button whileTap={{scale:0.95}} onClick={()=>deleteProp(p.id)} style={{background:"rgba(220,38,38,0.3)",border:"1px solid #dc2626",borderRadius:7,padding:"5px 9px",color:"#f87171",fontSize:11,cursor:"pointer",flexShrink:0}}>🗑</motion.button>
                </div>
                <div style={{height:4,background:"rgba(255,255,255,0.08)",borderRadius:4,overflow:"hidden",marginBottom:5}}>
                  <div style={{height:"100%",width:`${siPct}%`,background:"#16a34a",borderRadius:4}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:9,fontFamily:"Barlow Condensed,sans-serif"}}>
                  <span style={{color:"#4ade80",fontWeight:800}}>👍 {p.si} ({siPct}%)</span>
                  <span style={{color:"#f87171",fontWeight:800}}>👎 {p.no} ({100-siPct}%)</span>
                </div>
              </div>
            );})}
          </div>
        </div>)}

        {/* ── CANDIDATOS ── */}
        {tab==="candidatos"&&(<div>
          {editId&&(<motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"14px",marginBottom:12,border:"1px solid rgba(255,255,255,0.15)"}}>
            <div style={{fontSize:12,fontWeight:900,color:"#fff",marginBottom:10,fontFamily:"Barlow Condensed,sans-serif"}}>✏️ {PARTIES.find(p=>p.id===editId)?.short}</div>
            {[{k:"nombre",label:"Nombre del candidato"},{k:"cargo",label:"Cargo"},{k:"bio",label:"Bio / descripción"}].map(({k,label})=>(<div key={k} style={{marginBottom:10}}><div style={{fontSize:9,color:"#9ca3af",letterSpacing:1,marginBottom:3,fontFamily:"Barlow Condensed,sans-serif"}}>{label.toUpperCase()}</div><input value={editData[k]||""} onChange={e=>setEditData(d=>({...d,[k]:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:7,padding:"10px 12px",color:"#fff",fontSize:12,outline:"none",fontFamily:"Barlow Condensed,sans-serif"}}/></div>))}
            <div style={{display:"flex",gap:8,marginTop:10}}>
              <button onClick={()=>setEditId(null)} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",borderRadius:8,padding:"10px",color:"#fff",fontSize:11,cursor:"pointer",fontWeight:700}}>CANCELAR</button>
              <motion.button whileTap={{scale:0.96}} onClick={saveCand} style={{flex:2,background:"#16a34a",border:"none",borderRadius:8,padding:"10px",color:"#fff",fontSize:12,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>✅ GUARDAR CANDIDATO</motion.button>
            </div>
          </motion.div>)}
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {PARTIES.filter(p=>p.id!=="nulo").map(p=>{const cand=candidates[p.id];return(
              <div key={p.id} style={{background:"rgba(255,255,255,0.04)",border:`2px solid ${p.color}30`,borderRadius:14,padding:"14px"}}>
                <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
                  <div style={{width:60,height:60,borderRadius:10,overflow:"hidden",border:`2.5px solid ${p.color}`,flexShrink:0,boxShadow:`0 0 14px ${p.color}40`}}>
                    {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:28,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.emoji}</span>}
                  </div>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:900,color:p.color,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{cand?.nombre||"Por definir"}</div></div>
                  <div style={{position:"relative",width:60,height:60,flexShrink:0}}>
                    <div style={{position:"absolute",inset:-2,borderRadius:12,background:`conic-gradient(from 0deg,${p.color},#fff,${p.color}88,#fff,${p.color})`,animation:"ledSpin 2.5s linear infinite",zIndex:0}}/>
                    <div style={{position:"absolute",inset:0,borderRadius:10,overflow:"hidden",background:cand?.fotoUrl?"#000":`${p.color}08`,display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>
                      {cand?.fotoUrl?<img src={cand.fotoUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:26}}>👤</span>}
                    </div>
                  </div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <label style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",background:`${p.color}20`,border:`2px solid ${p.color}`,borderRadius:10,padding:"10px",color:p.color,fontSize:10,cursor:"pointer",fontWeight:900,gap:4,fontFamily:"Barlow Condensed,sans-serif"}}>
                    📸 SUBIR FOTO CANDIDATO<input type="file" accept="image/*" onChange={e=>uploadCandPhoto(p.id,e)} style={{display:"none"}}/>
                  </label>
                  <button onClick={()=>{setEditId(p.id);setEditData({...cand});}} style={{flex:1,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.25)",borderRadius:10,padding:"10px",color:"#fff",fontSize:10,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif"}}>✏️ EDITAR INFO</button>
                  <button onClick={()=>setCandidates(prev=>({...prev,[p.id]:{...prev[p.id],soloPartido:!prev[p.id]?.soloPartido}}))} style={{flex:1,background:cand?.soloPartido?"rgba(245,158,11,0.3)":"rgba(255,255,255,0.05)",border:`1px solid ${cand?.soloPartido?"#f59e0b":"rgba(255,255,255,0.15)"}`,borderRadius:10,padding:"10px",color:cand?.soloPartido?"#fbbf24":"rgba(255,255,255,0.4)",fontSize:9,cursor:"pointer",fontWeight:900,fontFamily:"Barlow Condensed,sans-serif",textAlign:"center",lineHeight:1.2}}>
                    {cand?.soloPartido?"✅ SOLO":"🔄 SOLO"}<br/>PARTIDO
                  </button>
                </div>
              </div>
            );})}
          </div>
        </div>)}

        {/* ── PARTIDOS ── */}
        {tab==="partidos"&&(<div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(59,130,246,0.4)",borderRadius:14,padding:"16px",marginBottom:14}}>
            <div style={{fontSize:10,color:"#60a5fa",letterSpacing:2,marginBottom:12,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>+ AGREGAR NUEVO PARTIDO / CANDIDATO</div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <div style={{width:52,height:52,borderRadius:8,background:newPartyColor,border:"2px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🏛️</div>
              <input value={newPartyName} onChange={e=>setNewPartyName(e.target.value.slice(0,50))} placeholder="Nombre del partido" style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(59,130,246,0.4)",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"Barlow Condensed,sans-serif"}}/>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <input value={newPartyShort} onChange={e=>setNewPartyShort(e.target.value.slice(0,20))} placeholder="Siglas / nombre corto" style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(59,130,246,0.4)",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"Barlow Condensed,sans-serif"}}/>
              <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(59,130,246,0.4)",borderRadius:8,padding:"8px 10px"}}>
                <span style={{fontSize:10,color:"#9ca3af",fontFamily:"Barlow Condensed,sans-serif"}}>COLOR</span>
                <input type="color" value={newPartyColor} onChange={e=>setNewPartyColor(e.target.value)} style={{width:28,height:28,borderRadius:4,border:"none",background:"transparent",cursor:"pointer"}}/>
              </div>
            </div>
            <input value={newPartyCand} onChange={e=>setNewPartyCand(e.target.value.slice(0,60))} placeholder="Nombre del candidato (opcional)" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(59,130,246,0.4)",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"Barlow Condensed,sans-serif",marginBottom:10}}/>
            <motion.button whileTap={{scale:0.96}} disabled={!newPartyName.trim()||!newPartyShort.trim()}
              onClick={()=>{
                if(!newPartyName.trim()||!newPartyShort.trim())return;
                const id="p_"+Date.now();
                PARTIES.push({id,short:newPartyShort.trim().toUpperCase(),name:newPartyName.trim(),color:newPartyColor,emoji:"🏛️",spectrumPos:50,spectrumLabel:"Centro",ideologyTags:["centro"],fundado:"Por confirmar",fundador:"Por confirmar",dirigente:"Por confirmar",militantes:"Por confirmar",gobiernos:"Por confirmar",descripcion:newPartyName.trim()+" — partido agregado desde admin.",curioso:"Partido agregado manualmente.",opinion:"Pendiente de evaluación."});
                PARTY_LOGOS[id]=null;
                setCandidates(prev=>({...prev,[id]:{nombre:newPartyCand.trim()||"Por definir",cargo:"Candidato a Presidente Municipal",fotoUrl:null,bio:"Candidato de "+newPartyShort.trim()+"."}}));
                setVotes(prev=>({...prev,[id]:0}));
                setNewPartyName("");setNewPartyShort("");setNewPartyColor("#6b7280");setNewPartyCand("");
                playSound("success");
              }}
              style={{width:"100%",background:newPartyName.trim()&&newPartyShort.trim()?"linear-gradient(135deg,#1d4ed8,#1e40af)":"rgba(255,255,255,0.06)",border:"none",borderRadius:10,padding:"12px",color:newPartyName.trim()&&newPartyShort.trim()?"#fff":"rgba(255,255,255,0.25)",fontSize:13,fontWeight:900,cursor:newPartyName.trim()&&newPartyShort.trim()?"pointer":"default",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>
              + AGREGAR PARTIDO A LA ENCUESTA
            </motion.button>
          </div>
          <div style={{fontSize:10,color:"#60a5fa",letterSpacing:2,marginBottom:10,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>PARTIDOS ACTUALES ({PARTIES.length})</div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {PARTIES.map(p=><div key={p.id} style={{background:"rgba(255,255,255,0.04)",border:`2px solid ${p.color}30`,borderRadius:12,padding:"12px",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:40,height:40,borderRadius:8,overflow:"hidden",border:`2px solid ${p.color}`,flexShrink:0,background:`${p.color}20`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {PARTY_LOGOS[p.id]?<img src={PARTY_LOGOS[p.id]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<span style={{fontSize:18}}>{p.emoji}</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:900,color:p.color,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{votes[p.id]||0} votos · {p.spectrumLabel}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                <label style={{background:`${p.color}20`,border:`1px solid ${p.color}`,borderRadius:8,padding:"6px 10px",color:p.color,fontSize:9,cursor:"pointer",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif",textAlign:"center"}}>
                  🖼️ LOGO<input type="file" accept="image/*" onChange={e=>uploadLogo(p.id,e)} style={{display:"none"}}/>
                </label>
                {p.id.startsWith("p_")&&(
                  <button onClick={()=>{
                    if(!window.confirm(`¿Eliminar ${p.short} de la encuesta?`))return;
                    const idx=PARTIES.findIndex(x=>x.id===p.id);
                    if(idx>-1)PARTIES.splice(idx,1);
                    setVotes(prev=>{const n={...prev};delete n[p.id];return n;});
                    setCandidates(prev=>{const n={...prev};delete n[p.id];return n;});
                    playSound("click");
                  }} style={{background:"rgba(220,38,38,0.2)",border:"1px solid #dc2626",borderRadius:8,padding:"5px 10px",color:"#f87171",fontSize:9,cursor:"pointer",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>
                    🗑 BORRAR
                  </button>
                )}
              </div>
            </div>)}
          </div>
        </div>)}

        {/* ── SUGERENCIAS DE PREGUNTAS ── */}
        {tab==="sugerencias"&&<AdminSugerencias/>}

        {/* ── EXPORTAR ── */}
        {tab==="exportar"&&(<div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(16,185,129,0.4)",borderRadius:14,padding:"16px",marginBottom:14}}>
            <div style={{fontSize:10,color:"#34d399",letterSpacing:2,marginBottom:12,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>📥 EXPORTAR DATOS</div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:"#9ca3af",marginBottom:4,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>DESDE</div>
                <input type="date" value={exportFrom} onChange={e=>setExportFrom(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(16,185,129,0.3)",borderRadius:8,padding:"10px",color:"#fff",fontSize:12,outline:"none"}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:"#9ca3af",marginBottom:4,fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>HASTA</div>
                <input type="date" value={exportTo} onChange={e=>setExportTo(e.target.value)} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(16,185,129,0.3)",borderRadius:8,padding:"10px",color:"#fff",fontSize:12,outline:"none"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:8,marginBottom:10}}>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{
                const total2=Object.values(votes).reduce((a,b)=>a+b,0);
                const csv=`Reporte Encuesta Silao\nFecha:,${new Date().toLocaleDateString("es-MX")}\nTotal votos:,${total2}\n\nPartido,Votos,Porcentaje\n${PARTIES.map(p=>`${p.short},${votes[p.id]||0},${total2>0?((votes[p.id]||0)/total2*100).toFixed(1)+"%" : "0%"}`).join("\n")}`;
                const blob=new Blob([csv],{type:"text/csv;charset=utf-8;"});
                const url=URL.createObjectURL(blob);
                const a=document.createElement("a");a.href=url;a.download=`encuestasilao_votos_${new Date().toISOString().slice(0,10)}.csv`;a.click();
                URL.revokeObjectURL(url);playSound("success");
              }} style={{flex:1,background:"linear-gradient(135deg,#059669,#047857)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>📊 VOTOS CSV</motion.button>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{
                const rows=["Nick,Comentario,Fecha",...(comments||[]).map(c=>`"${c.nick}","${(c.txt||"").replace(/"/g,"'")}","${new Date(c.ts).toLocaleDateString("es-MX")}"`)];
                const blob=new Blob([rows.join("\n")],{type:"text/csv;charset=utf-8;"});
                const url=URL.createObjectURL(blob);
                const a=document.createElement("a");a.href=url;a.download=`encuestasilao_comentarios_${new Date().toISOString().slice(0,10)}.csv`;a.click();
                URL.revokeObjectURL(url);playSound("success");
              }} style={{flex:1,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1}}>💬 COMENTARIOS</motion.button>
            </div>
            <motion.button whileTap={{scale:0.96}} onClick={()=>{
              const total2=Object.values(votes).reduce((a,b)=>a+b,0);
              const sorted2=[...PARTIES].sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0)).filter(p=>(votes[p.id]||0)>0).slice(0,8);
              const h=Math.max(520,120+sorted2.length*72+80);
              const canvas=document.createElement("canvas");canvas.width=800;canvas.height=h;
              const ctx=canvas.getContext("2d");
              ctx.fillStyle="#0d0a1e";ctx.fillRect(0,0,800,h);
              ctx.fillStyle="#e01010";ctx.font="bold 34px Arial";ctx.textAlign="center";
              ctx.fillText("ENCUESTA SILAO — VOZ CIUDADANA",400,50);
              ctx.fillStyle="#a78bfa";ctx.font="14px Arial";
              ctx.fillText(new Date().toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase()+" · "+total2+" VOTOS",400,78);
              sorted2.forEach((p,i)=>{
                const pct2=total2>0?(votes[p.id]||0)/total2:0;
                const y=106+i*72;
                ctx.fillStyle="rgba(255,255,255,0.06)";ctx.beginPath();
                if(ctx.roundRect)ctx.roundRect(28,y,744,54,10);else ctx.rect(28,y,744,54);ctx.fill();
                ctx.fillStyle=p.color;ctx.beginPath();
                if(ctx.roundRect)ctx.roundRect(28,y,744*pct2,54,10);else ctx.rect(28,y,744*pct2,54);ctx.fill();
                ctx.fillStyle="#fff";ctx.font="bold 20px Arial";ctx.textAlign="left";
                ctx.fillText(`${i+1}. ${p.short}`,42,y+34);
                ctx.textAlign="right";ctx.fillText(`${(pct2*100).toFixed(1)}% — ${votes[p.id]||0} votos`,764,y+34);
              });
              ctx.fillStyle="rgba(255,255,255,0.3)";ctx.font="13px Arial";ctx.textAlign="center";
              ctx.fillText("encuestasilao.mx — #Silao #Guanajuato",400,h-20);
              canvas.toBlob(blob=>{
                if(!blob)return;
                if(navigator.share&&navigator.canShare){
                  const file=new File([blob],"encuestasilao.png",{type:"image/png"});
                  try{if(navigator.canShare({files:[file]})){navigator.share({files:[file],title:"Encuesta Silao Resultados"}).catch(()=>{});return;}}catch(e){}
                }
                const url=URL.createObjectURL(blob);
                const a=document.createElement("a");a.href=url;a.download="encuestasilao_resultados.png";a.click();
                URL.revokeObjectURL(url);
              },"image/png");
              playSound("success");
            }} style={{width:"100%",background:"linear-gradient(135deg,#1d4ed8,#7c3aed)",border:"none",borderRadius:12,padding:"14px",color:"#fff",fontSize:14,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",letterSpacing:1,marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 4px 20px rgba(124,58,237,0.4)"}}>
              <span style={{fontSize:22}}>🖼️</span> COMPARTIR COMO IMAGEN PNG
            </motion.button>
            {/* Mini chart */}
            {/* Mini chart */}
            <div style={{background:"rgba(0,0,0,0.3)",borderRadius:12,padding:"14px"}}>
              <div style={{fontSize:9,color:"#34d399",letterSpacing:2,marginBottom:10,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>DISTRIBUCIÓN ACTUAL</div>
              {PARTIES.filter(p=>(votes[p.id]||0)>0).sort((a,b)=>(votes[b.id]||0)-(votes[a.id]||0)).map(p=>{
                const tot=Object.values(votes).reduce((a,b)=>a+b,0);
                const pct=tot>0?((votes[p.id]||0)/tot*100):0;
                return(<div key={p.id} style={{marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:10,color:p.color,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>{p.short}</span>
                    <span style={{fontSize:10,color:"#fff",fontWeight:700,fontFamily:"Barlow Condensed,sans-serif"}}>{votes[p.id]||0} ({pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{height:6,background:"rgba(255,255,255,0.08)",borderRadius:4}}>
                    <div style={{height:"100%",width:`${pct}%`,background:p.color,borderRadius:4,transition:"width .6s"}}/>
                  </div>
                </div>);
              })}
              {Object.values(votes).reduce((a,b)=>a+b,0)===0&&<div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textAlign:"center"}}>Sin votos aún</div>}
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(245,158,11,0.4)",borderRadius:14,padding:"16px"}}>
            <div style={{fontSize:10,color:"#fbbf24",letterSpacing:2,marginBottom:10,fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>⏱️ CONTROL DE PUBLICACIÓN</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:10}}>Comentarios y propuestas se publican después de:</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              {[{v:0,l:"Inmediato"},{v:5,l:"5 min"},{v:15,l:"15 min"},{v:60,l:"1 hora"}].map(o=>(
                <motion.button key={o.v} whileTap={{scale:0.95}} onClick={()=>{setPublishDelay(o.v);playSound("click");}}
                  style={{flex:1,minWidth:70,background:publishDelay===o.v?"#d97706":"rgba(255,255,255,0.06)",border:`2px solid ${publishDelay===o.v?"#f59e0b":"rgba(255,255,255,0.12)"}`,borderRadius:10,padding:"10px",color:publishDelay===o.v?"#fff":"rgba(255,255,255,0.5)",fontSize:11,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif"}}>
                  {o.l}
                </motion.button>
              ))}
            </div>
            {publishDelay>0&&<div style={{marginTop:10,fontSize:10,color:"#fbbf24",textAlign:"center"}}>⚠️ Los nuevos comentarios esperarán {publishDelay} min antes de aparecer</div>}
          </div>
        </div>)}

        {/* ── CONFIG ── */}
        {tab==="config"&&(<div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(224,16,16,0.3)",borderRadius:14,padding:"16px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:20}}>📢</span>
              <div style={{fontSize:11,fontWeight:900,color:"#f87171",letterSpacing:2,fontFamily:"Barlow Condensed,sans-serif"}}>ALERTA GLOBAL</div>
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:10}}>Muestra un banner de alerta a todos los usuarios</div>
            <textarea value={alertInput} onChange={e=>setAlertInput(e.target.value.slice(0,200))} placeholder="Escribe el mensaje de alerta (ej: Resultados finales publicados)"
              style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(220,38,38,0.4)",borderRadius:10,padding:"12px",color:"#fff",fontSize:12,outline:"none",resize:"none",height:80,fontFamily:"Barlow Condensed,sans-serif",lineHeight:1.5,marginBottom:10}}/>
            <div style={{display:"flex",gap:8}}>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{setAlertaMsg(alertInput);setAlertaActiva(true);playSound("success");}}
                style={{flex:1,background:"#dc2626",border:"none",borderRadius:10,padding:"11px",color:"#fff",fontSize:12,fontWeight:900,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                📢 ACTIVAR ALERTA
              </motion.button>
              <motion.button whileTap={{scale:0.96}} onClick={()=>{setAlertaActiva(false);setAlertaMsg("");setAlertInput("");playSound("click");}}
                style={{flex:1,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"11px",color:"rgba(255,255,255,0.6)",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Barlow Condensed,sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                ✕ DESACTIVAR
              </motion.button>
            </div>
          </div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"16px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:900,color:"#a78bfa",letterSpacing:2,marginBottom:12,fontFamily:"Barlow Condensed,sans-serif"}}>🏙️ LOGO DE LA APP</div>
            <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:12}}>
              <div style={{width:80,height:54,borderRadius:10,overflow:"hidden",border:"1.5px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.05)"}}>
                <img src={siteLogo||""} alt="logo" style={{width:"100%",height:"100%",objectFit:"contain"}}/>
              </div>
              <label style={{display:"inline-flex",alignItems:"center",gap:6,background:"#7c3aed",border:"none",borderRadius:8,padding:"9px 14px",color:"#fff",fontSize:10,cursor:"pointer",fontWeight:800,fontFamily:"Barlow Condensed,sans-serif"}}>
                📤 SUBIR LOGO<input type="file" accept="image/*" onChange={uploadSiteLogo} style={{display:"none"}}/>
              </label>
            </div>
            {siteLogo&&<button onClick={()=>setSiteLogo(null)} style={{background:"rgba(220,38,38,0.2)",border:"1px solid #dc2626",borderRadius:8,padding:"6px 12px",color:"#f87171",fontSize:10,cursor:"pointer",fontWeight:700}}>🗑 ELIMINAR</button>}
          </div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"16px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:900,color:"#a78bfa",letterSpacing:2,marginBottom:10,fontFamily:"Barlow Condensed,sans-serif"}}>🌐 DOMINIO / URL DE LA APP</div>
            <input value={appDomain} onChange={e=>setAppDomain(e.target.value)} placeholder="ej: encuestasilao.mx" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"1.5px solid rgba(124,58,237,0.4)",borderRadius:8,padding:"10px 12px",color:"#fff",fontSize:14,outline:"none",fontFamily:"Barlow Condensed,sans-serif",marginBottom:6}}/>
            <div style={{fontSize:9,color:"rgba(255,255,255,0.3)"}}>Este campo es informativo para el panel de admin</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1.5px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"16px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:900,color:"#a78bfa",letterSpacing:2,marginBottom:12,fontFamily:"Barlow Condensed,sans-serif"}}>ℹ️ INFORMACIÓN DEL SISTEMA</div>
            {[{label:"Contraseña admin",val:"Silao360# (cámbiala en el código)"},{label:"Activar admin",val:"Tocar logo 5 veces → contraseña"},{label:"Versión",val:"Encuesta Silao v4.1"}].map(({label,val})=>(
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
        </div>)}

        </div>
      </div>
    </motion.div>
  );
}

// ── APP PRINCIPAL ──
export default function App(){
  const[screen,setScreen]=useState("results");
  const[votes,setVotes]=useState(()=>Object.fromEntries(PARTIES.map(p=>[p.id,0])));
  const[myVote,setMyVote]=useState(()=>{try{return localStorage.getItem("encuestasilao_mivoto")||null;}catch(e){return null;}});
  const[user,setUser]=useState(()=>{try{const u=localStorage.getItem("encuestasilao_user");return u?JSON.parse(u):null;}catch(e){return null;}});
  const[confirmVoteParty,setConfirmVoteParty]=useState(null);
  const[showLogin,setShowLogin]=useState(false);
  const[showOnboarding,setShowOnboarding]=useState(()=>{try{return !localStorage.getItem("encuestasilao_user");}catch(e){return true;}});
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
  const handleVote=(id)=>{setVotes(prev=>{const next={...prev};if(myVote&&next[myVote]>0)next[myVote]--;next[id]=(next[id]||0)+1;return next;});setMyVote(id);try{localStorage.setItem("encuestasilao_mivoto",id);}catch(e){};const uid=(user?.nickname||"anon_"+Math.random().toString(36).slice(2,8));sb.from("votos").insert({partido_id:id,user_id:uid}).catch(()=>{});};
  const saveUser=(u)=>{setUser(u);try{localStorage.setItem("encuestasilao_user",JSON.stringify(u));}catch(e){}};
  const doLogout=()=>{setUser(null);setMyVote(null);try{localStorage.removeItem("encuestasilao_user");localStorage.removeItem("encuestasilao_mivoto");}catch(e){}};

  // ── Supabase: registrar entrada ──
  useEffect(()=>{
    const sid=Math.random().toString(36).slice(2,10)+Date.now().toString(36);
    sb.from("visitas").insert({sid,ts:new Date().toISOString(),ua:navigator.userAgent.slice(0,80)}).catch(()=>{});
  },[]);

  // ── Supabase: cargar votos (reemplaza estado completo) ──
  useEffect(()=>{
    sb.from("votos").select("partido_id").then(res=>{
      const rows=Array.isArray(res)?res:(res?.data||[]);
      if(!rows.length) return;
      const counts={};
      rows.forEach(r=>{if(r.partido_id) counts[r.partido_id]=(counts[r.partido_id]||0)+1;});
      // Reemplazar votos con los reales de Supabase
      setVotes(Object.fromEntries(PARTIES.map(p=>[p.id, counts[p.id]||0])));
    }).catch(()=>{});
  },[]);

  // ── Supabase: cargar comentarios ──
  useEffect(()=>{
    sb.from("comentarios").select("*").then(({data})=>{
      if(Array.isArray(data)&&data.length>0)setComments(data.map(r=>({...r,ts:new Date(r.ts).getTime()})));
    }).catch(()=>{});
  },[]);

  // ── Supabase: cargar propuestas ──
  useEffect(()=>{
    sb.from("propuestas").select("*").then(({data})=>{
      if(Array.isArray(data)&&data.length>0)setProposals(data.map(r=>({...r,desc:r.descripcion})));
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
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes logoPulse{0%,100%{box-shadow:0 3px 14px rgba(224,16,16,0.45)}50%{box-shadow:0 3px 26px rgba(224,16,16,0.8),0 0 40px rgba(224,16,16,0.3)}}
        @keyframes barraShine{0%{background-position:0% 50%}100%{background-position:200% 50%}}
        @keyframes glow360{0%,100%{text-shadow:0 0 8px rgba(255,107,107,0.5)}50%{text-shadow:0 0 16px rgba(255,107,107,1)}}
        @keyframes ledSpin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes ledShimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
        @keyframes voteGlow{0%,100%{box-shadow:0 0 0 0 rgba(224,16,16,0.4),0 4px 20px rgba(220,0,0,0.5)}50%{box-shadow:0 0 0 8px rgba(224,16,16,0),0 4px 28px rgba(220,0,0,0.7)}}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#c4b5fd}
        input::placeholder{color:#9ca3af}
        textarea::placeholder{color:#6b7280}
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
          {screen==="articles"&&<ArticlesScreen {...sp} candidates={candidates}/>}
          {screen==="preguntale"&&<PreguntaleScreen {...sp} candidates={candidates}/>}
          {screen==="comments"&&<CommentsScreen {...sp} isAdmin={isAdmin} comments={comments} setComments={setComments} blockedNicks={blockedNicks} pinnedMsg={pinnedMsg}/>}
        </div>
        <BouncingBall siteLogo={siteLogo} onLogoClick={()=>setScreen("results")} votes={votes} total={total}/>
        <InstallBanner/>
        <FloatingBubble myVote={myVote} candidates={candidates}/>
        <NavBar screen={screen} setScreen={setScreen}/>
      </>)}
    </div>
  );
}
