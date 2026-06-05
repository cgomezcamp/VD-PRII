/* Turismo y bienestar social en Canarias — visualizaciones D3
   Cristina Gómez Campos · Licencia MIT */
(function(){
"use strict";
const tip = d3.select("#tooltip");
const fmt = d3.format(",.0f");
const fmtES = n => fmt(n).replace(/,/g,".");
const COL = {tur:"#0d6e6e",pib:"#e08a2b",arope:"#c8442e"};
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function showTip(html,ev){
  tip.html(html).style("opacity",1);
  moveTip(ev);
}
function moveTip(ev){
  const w=tip.node().offsetWidth, h=tip.node().offsetHeight;
  let x=ev.clientX+16, y=ev.clientY-h-10;
  if(x+w>innerWidth-10) x=ev.clientX-w-16;
  if(y<10) y=ev.clientY+18;
  tip.style("left",x+"px").style("top",y+"px");
}
function hideTip(){tip.style("opacity",0);}

function size(sel,ratio){
  const w=sel.node().clientWidth;
  return {w,h:Math.max(280,Math.round(w*ratio))};
}

/* ============ 1. DESACOPLE (líneas indexadas) ============ */
const series=[
  {key:"tur_idx",label:"Turistas",color:COL.tur},
  {key:"pib_idx",label:"PIB/hab.",color:COL.pib},
  {key:"arope_idx",label:"Pobreza (AROPE)",color:COL.arope},
];
const active=new Set(series.map(s=>s.key));

function drawDesacople(){
  const host=d3.select("#chart-desacople");
  host.selectAll("*").remove();
  const m={t:24,r:64,b:36,l:46}, {w,h}=size(host,0.52);
  const data=DATA.desacople.filter(d=>d.anio>=2018);
  const svg=host.append("svg").attr("width",w).attr("height",h)
     .attr("viewBox",`0 0 ${w} ${h}`);
  const x=d3.scaleLinear().domain([2018,2025]).range([m.l,w-m.r]);
  const y=d3.scaleLinear().domain([25,130]).range([h-m.b,m.t]);

  svg.append("g").attr("class","grid")
     .attr("transform",`translate(${m.l},0)`)
     .call(d3.axisLeft(y).ticks(5).tickSize(-(w-m.l-m.r)).tickFormat(""));
  svg.append("g").attr("class","axis")
     .attr("transform",`translate(0,${h-m.b})`)
     .call(d3.axisBottom(x).ticks(8).tickFormat(d3.format("d")));
  svg.append("g").attr("class","axis")
     .attr("transform",`translate(${m.l},0)`)
     .call(d3.axisLeft(y).ticks(5));
  // baseline 100
  svg.append("line").attr("class","baseline")
     .attr("x1",m.l).attr("x2",w-m.r).attr("y1",y(100)).attr("y2",y(100));
  svg.append("text").attr("x",m.l+4).attr("y",y(100)-6)
     .attr("fill","var(--ink-soft)").attr("font-size",11).text("base 2018 = 100");

  const line=d3.line().defined(d=>d.v!=null)
     .x(d=>x(d.anio)).y(d=>y(d.v))
     .curve(d3.curveMonotoneX);

  series.forEach(s=>{
    if(!active.has(s.key)) return;
    const pts=data.map(d=>({anio:d.anio,v:d[s.key]}));
    const path=svg.append("path").datum(pts)
       .attr("fill","none").attr("stroke",s.color)
       .attr("stroke-width",3).attr("stroke-linecap","round")
       .attr("d",line);
    if(!reduce){
      const L=path.node().getTotalLength();
      path.attr("stroke-dasharray",L).attr("stroke-dashoffset",L)
          .transition().duration(1100).attr("stroke-dashoffset",0);
    }
    const last=pts.filter(p=>p.v!=null).slice(-1)[0];
    svg.append("text").attr("class","serie-label")
       .attr("x",x(last.anio)+8).attr("y",y(last.v))
       .attr("fill",s.color).attr("dominant-baseline","middle")
       .text(s.label);
    svg.selectAll(".dot-"+s.key).data(pts.filter(p=>p.v!=null)).join("circle")
       .attr("class","dot").attr("cx",d=>x(d.anio)).attr("cy",d=>y(d.v))
       .attr("r",4).attr("fill",s.color)
       .on("mouseenter",(ev,d)=>{
          d3.select(ev.currentTarget).attr("r",7);
          showTip(`<strong>${s.label} · ${d.anio}</strong><div class="tt-row"><span>Índice</span><span>${d.v}</span></div>`,ev);
       })
       .on("mousemove",moveTip)
       .on("mouseleave",ev=>{d3.select(ev.currentTarget).attr("r",4);hideTip();});
  });
}
d3.selectAll(".toggle").on("click",function(){
  const k=this.dataset.serie;
  if(active.has(k)){active.delete(k);this.classList.remove("is-on");this.setAttribute("aria-pressed","false");}
  else{active.add(k);this.classList.add("is-on");this.setAttribute("aria-pressed","true");}
  drawDesacople();
});

/* ============ 2a. PRESIÓN (scatter) ============ */
function drawPresion(){
  const host=d3.select("#chart-presion");
  host.selectAll("*").remove();
  const m={t:30,r:30,b:54,l:54}, {w,h}=size(host,0.6);
  const data=DATA.presion;
  const svg=host.append("svg").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`);
  const x=d3.scaleLinear().domain([0,24]).range([m.l,w-m.r]).nice();
  const y=d3.scaleLinear().domain([40,70]).range([h-m.b,m.t]).nice();
  const r=d3.scaleSqrt().domain([0,d3.max(data,d=>d.turistas_2024)]).range([6,38]);

  svg.append("g").attr("class","grid").attr("transform",`translate(${m.l},0)`)
     .call(d3.axisLeft(y).ticks(5).tickSize(-(w-m.l-m.r)).tickFormat(""));
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${h-m.b})`)
     .call(d3.axisBottom(x).ticks(6));
  svg.append("g").attr("class","axis").attr("transform",`translate(${m.l},0)`)
     .call(d3.axisLeft(y).ticks(5).tickFormat(d=>d+"%"));
  svg.append("text").attr("x",(w+m.l-m.r)/2).attr("y",h-12).attr("text-anchor","middle")
     .attr("font-size",12.5).attr("fill","var(--ink-soft)")
     .text("Turistas por residente adulto (2024)");
  svg.append("text").attr("transform","rotate(-90)").attr("x",-(h-m.b)/2-m.t).attr("y",15)
     .attr("text-anchor","middle").attr("font-size",12.5).attr("fill","var(--ink-soft)")
     .text("% que cree que el turismo compensa");

  const g=svg.selectAll(".bub").data(data).join("g");
  g.append("circle").attr("class","dot")
     .attr("cx",d=>x(d.tur_por_adulto)).attr("cy",d=>y(d.pct_acuerdo))
     .attr("r",reduce?(d=>r(d.turistas_2024)):0)
     .attr("fill",COL.tur).attr("fill-opacity",.32)
     .attr("stroke","#0a4f54").attr("stroke-width",2)
     .on("mouseenter",(ev,d)=>showTip(
        `<strong>${d.isla}</strong>`+
        `<div class="tt-row"><span>Turistas/adulto</span><span>${d.tur_por_adulto}</span></div>`+
        `<div class="tt-row"><span>Turistas 2024</span><span>${fmtES(d.turistas_2024)}</span></div>`+
        `<div class="tt-row"><span>Compensa</span><span>${d.pct_acuerdo}%</span></div>`+
        `<div class="tt-row"><span>No compensa</span><span>${d.pct_desacuerdo}%</span></div>`,ev))
     .on("mousemove",moveTip).on("mouseleave",hideTip);
  if(!reduce){
    g.select("circle").transition().duration(900).delay((d,i)=>i*90)
      .attr("r",d=>r(d.turistas_2024));
  }
  g.append("text").attr("x",d=>x(d.tur_por_adulto)).attr("y",d=>y(d.pct_acuerdo)-r(d.turistas_2024)-6)
     .attr("text-anchor","middle").attr("class","serie-label")
     .attr("fill","var(--ink)").text(d=>d.isla);
}

/* ============ 2b. ISLAS por año (barras) ============ */
function drawIslas(year){
  const host=d3.select("#chart-islas");
  host.selectAll("*").remove();
  const m={t:16,r:20,b:36,l:118}, {w,h}=size(host,0.52);
  const islas=["Tenerife","Gran Canaria","Lanzarote","Fuerteventura","La Palma"];
  const data=islas.map(i=>({isla:i,v:DATA.islas_turistas[i][year]||0}))
                  .sort((a,b)=>b.v-a.v);
  const svg=host.append("svg").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`);
  const x=d3.scaleLinear().domain([0,d3.max(islas.map(i=>d3.max(Object.values(DATA.islas_turistas[i]))))]).range([m.l,w-m.r]);
  const y=d3.scaleBand().domain(data.map(d=>d.isla)).range([m.t,h-m.b]).padding(.28);
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${h-m.b})`)
     .call(d3.axisBottom(x).ticks(5).tickFormat(d=>d/1e6+"M"));
  svg.append("g").attr("class","axis").attr("transform",`translate(${m.l},0)`)
     .call(d3.axisLeft(y).tickSize(0)).select(".domain").remove();
  svg.selectAll(".bar").data(data,d=>d.isla).join("rect")
     .attr("class","bar").attr("x",m.l).attr("y",d=>y(d.isla))
     .attr("height",y.bandwidth()).attr("fill",COL.tur).attr("rx",4)
     .attr("width",d=>x(d.v)-m.l)
     .on("mouseenter",(ev,d)=>showTip(`<strong>${d.isla} · ${year}</strong><div class="tt-row"><span>Turistas</span><span>${fmtES(d.v)}</span></div>`,ev))
     .on("mousemove",moveTip).on("mouseleave",hideTip);
  svg.selectAll(".val").data(data).join("text")
     .attr("x",d=>x(d.v)+6).attr("y",d=>y(d.isla)+y.bandwidth()/2)
     .attr("dominant-baseline","middle").attr("font-size",12.5)
     .attr("fill","var(--ink-soft)").text(d=>fmtES(d.v));
}
const slider=document.getElementById("year-slider");
slider.addEventListener("input",e=>{
  document.getElementById("year-label").textContent=e.target.value;
  drawIslas(+e.target.value);
});

/* ============ 3. PERCEPCIÓN (barras divergentes apiladas) ============ */
const RESP=[
  {k:"Muy en desacuerdo",c:"#8a2515",side:-1},
  {k:"En desacuerdo",c:"#c8442e",side:-1},
  {k:"Ni de acuerdo ni en desacuerdo",c:"#ccbfa6",side:0},
  {k:"De acuerdo",c:"#3a9d8c",side:1},
  {k:"Muy de acuerdo",c:"#0a4f54",side:1},
];
function drawPercepcion(afirm){
  const host=d3.select("#chart-percepcion");
  host.selectAll("*").remove();
  const islas=["Lanzarote","Fuerteventura","Gran Canaria","Tenerife","La Palma","Canarias"];
  const m={t:16,r:20,b:40,l:118}, {w,h}=size(host,0.62);
  const svg=host.append("svg").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`);
  const rows=islas.map(isla=>{
    const p=DATA.percepcion[afirm][isla]||{};
    let neg=0; RESP.filter(r=>r.side<0).forEach(r=>neg+=(p[r.k]||0));
    const neu=(p["Ni de acuerdo ni en desacuerdo"]||0);
    let acc=-neg-neu/2; const segs=[];
    RESP.forEach(r=>{const v=p[r.k]||0; segs.push({...r,v,x0:acc,x1:acc+v}); acc+=v;});
    return {isla,segs};
  });
  const x=d3.scaleLinear().domain([-80,80]).range([m.l,w-m.r]);
  const y=d3.scaleBand().domain(islas).range([m.t,h-m.b]).padding(.3);
  svg.append("line").attr("x1",x(0)).attr("x2",x(0)).attr("y1",m.t).attr("y2",h-m.b)
     .attr("stroke","var(--ink-soft)").attr("stroke-width",1);
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${h-m.b})`)
     .call(d3.axisBottom(x).ticks(7).tickFormat(d=>Math.abs(d)+"%"));
  svg.append("g").attr("class","axis").attr("transform",`translate(${m.l},0)`)
     .call(d3.axisLeft(y).tickSize(0)).select(".domain").remove();
  const g=svg.selectAll(".row").data(rows).join("g");
  g.selectAll("rect").data(d=>d.segs.map(s=>({...s,isla:d.isla}))).join("rect")
     .attr("class","bar").attr("y",d=>y(d.isla)).attr("height",y.bandwidth())
     .attr("x",d=>x(Math.min(d.x0,d.x1))).attr("fill",d=>d.c)
     .attr("width",d=>Math.abs(x(d.x1)-x(d.x0)))
     .on("mouseenter",(ev,d)=>showTip(`<strong>${d.isla}</strong><div class="tt-row"><span>${d.k}</span><span>${d.v.toFixed(1)}%</span></div>`,ev))
     .on("mousemove",moveTip).on("mouseleave",hideTip);
  if(!reduce){
    g.selectAll("rect").attr("opacity",0).transition().duration(500).delay((d,i)=>i*20).attr("opacity",1);
  }
  // leyenda
  const lg=d3.select("#legend-percepcion").html("");
  RESP.forEach(r=>lg.append("span").html(`<i style="background:${r.c}"></i>${r.k}`));
}
const sel=document.getElementById("afirm-select");
const afirmActual=document.getElementById("afirm-actual");
DATA.afirmaciones.forEach((a,i)=>{
  const o=document.createElement("option");o.value=a;
  o.textContent="“"+a+"”";sel.appendChild(o);
});
function setAfirm(a){ afirmActual.textContent="“"+a+"”"; drawPercepcion(a); }
sel.addEventListener("change",e=>setAfirm(e.target.value));

/* ============ 4. GÉNERO (barras agrupadas) ============ */
function drawGenero(){
  const host=d3.select("#chart-genero");
  host.selectAll("*").remove();
  const m={t:20,r:20,b:40,l:46}, {w,h}=size(host,0.5);
  const resp=DATA.genero_resp;
  const sexes=["Hombres","Mujeres"];
  const colS={"Hombres":"#0d6e6e","Mujeres":"#e08a2b"};
  const svg=host.append("svg").attr("width",w).attr("height",h).attr("viewBox",`0 0 ${w} ${h}`);
  const x0=d3.scaleBand().domain(resp).range([m.l,w-m.r]).padding(.25);
  const x1=d3.scaleBand().domain(sexes).range([0,x0.bandwidth()]).padding(.12);
  const y=d3.scaleLinear().domain([0,50]).range([h-m.b,m.t]);
  svg.append("g").attr("class","grid").attr("transform",`translate(${m.l},0)`)
     .call(d3.axisLeft(y).ticks(5).tickSize(-(w-m.l-m.r)).tickFormat(""));
  svg.append("g").attr("class","axis").attr("transform",`translate(0,${h-m.b})`)
     .call(d3.axisBottom(x0));
  svg.append("g").attr("class","axis").attr("transform",`translate(${m.l},0)`)
     .call(d3.axisLeft(y).ticks(5).tickFormat(d=>d+"%"));
  resp.forEach(rp=>{
    sexes.forEach(s=>{
      const v=DATA.genero[s][rp];
      svg.append("rect").attr("class","bar")
         .attr("x",x0(rp)+x1(s)).attr("width",x1.bandwidth())
         .attr("y",reduce?y(v):y(0)).attr("height",reduce?(y(0)-y(v)):0)
         .attr("fill",colS[s]).attr("rx",3)
         .on("mouseenter",(ev)=>showTip(`<strong>${s} · ${rp}</strong><div class="tt-row"><span>Población</span><span>${v}%</span></div>`,ev))
         .on("mousemove",moveTip).on("mouseleave",hideTip)
         .transition().duration(reduce?0:700).attr("y",y(v)).attr("height",y(0)-y(v));
    });
  });
  const lg=svg.append("g").attr("transform",`translate(${w-m.r-150},${m.t})`);
  sexes.forEach((s,i)=>{
    const row=lg.append("g").attr("transform",`translate(0,${i*20})`);
    row.append("rect").attr("width",13).attr("height",13).attr("rx",3).attr("fill",colS[s]);
    row.append("text").attr("x",18).attr("y",11).attr("font-size",12.5).attr("fill","var(--ink)").text(s);
  });
}

/* ============ INIT + resize ============ */
function renderAll(){
  drawDesacople();
  drawPresion();
  drawIslas(+slider.value);
  drawPercepcion(DATA.afirmaciones[0]);
  afirmActual.textContent="“"+DATA.afirmaciones[0]+"”";
  drawGenero();
}
renderAll();
let rt;
window.addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(renderAll,200);});
})();
