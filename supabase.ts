// ── SUPABASE ──
const SUPABASE_URL = "https://irekcyeoumxnwbtonfup.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZWtjeWVvdW14bndidG9uZnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyMTczMzAsImV4cCI6MjA5NDc5MzMzMH0.gzmCwhJBeaabl83Q4W6cMhpk0Ofwg0OrHaYou9_ksL0";
const H: Record<string,string> = {"apikey":SUPABASE_KEY,"Authorization":`Bearer ${SUPABASE_KEY}`,"Content-Type":"application/json"};

function sbQuery(table: string, params: any={}): any {
  const q = {...params};
  const run = () => {
    let url = `${SUPABASE_URL}/rest/v1/${table}?select=${q.select||"*"}`;
    if(q.filters) q.filters.forEach((f:any)=>{ url+=`&${f.col}=${f.op}.${encodeURIComponent(f.val)}`; });
    if(q.order)  url+=`&order=${q.order.col}.${q.order.asc?"asc":"desc"}`;
    if(q.limit)  url+=`&limit=${q.limit}`;
    return fetch(url,{headers:H}).then(r=>r.json()).then((d:any)=>Array.isArray(d)?d:[]).catch(()=>[]);
  };
  return {
    then: (res:any,rej:any) => run().then(res,rej),
    catch: (fn:any) => run().catch(fn),
    select: (cols:string) => sbQuery(table,{...q,select:cols}),
    eq:     (col:string,val:any) => sbQuery(table,{...q,filters:[...(q.filters||[]),{col,op:"eq",val}]}),
    order:  (col:string,opts:any={}) => sbQuery(table,{...q,order:{col,asc:!!opts.ascending}}),
    limit:  (n:number) => sbQuery(table,{...q,limit:n}),
  };
}

export const sb = {
  from: (table: string) => ({
    select: (cols="*") => sbQuery(table,{select:cols}),
    insert: (data:any) => fetch(`${SUPABASE_URL}/rest/v1/${table}`,{
      method:"POST",
      headers:{...H,"Prefer":"return=minimal"},
      body:JSON.stringify(data)
    }).then(r=>r.ok?{}:r.json()).catch(()=>({})),
    delete: () => ({
      eq: (col:string,val:any) => fetch(`${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${encodeURIComponent(val)}`,{
        method:"DELETE", headers:H
      }).then(r=>r.ok?{}:r.json()).catch(()=>({}))
    }),
  }),
};
