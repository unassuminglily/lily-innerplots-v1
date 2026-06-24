'use client'

import {useRef, useEffect, useState, useCallback} from 'react'
import type {SiteData, Book, Track} from '@/lib/types'

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const PW = 384, PH = 216

const C = {
  cloudW:'#F4ECDA',cloudS:'#D6C7B0',
  distMd:'#5DA85A',distLt:'#72C46E',
  midDk:'#3D8B3D',midLt:'#6CC46A',
  fgDk:'#2A6B2E',fgMd:'#3D9142',fgLt:'#52AA55',fgVlt:'#68C46A',
  stW1:'#4A90D9',stW2:'#6AAEE0',stW3:'#3278B8',stFm:'#A8D8F4',stBnk:'#2A5A2A',stRck:'#6A5A48',stRckL:'#8A7A68',
  pathD:'#8B7355',pathL:'#A89070',
  flPk:'#F2A7C3',flYl:'#F5D56E',flWh:'#FFFFFF',flRd:'#E85A5A',flPp:'#C87ACC',
  treeDk:'#1E5A1E',treeMd:'#2A7A2A',treeLt:'#3D9A3A',
  leafDk:'#1C541C',leafMd:'#2E782A',leafLt:'#45A03C',leafHi:'#63C44E',
  trunk:'#6B4A2A',trunkD:'#46301A',trunkL:'#8A6238',
  wood:'#B5793C',woodD:'#7A4E22',woodL:'#D69A55',rope:'#CBB089',ropeD:'#A98A5E',
  sun:'#FFE566',sunGl:'#FFD700',
}

type TOD = 'day' | 'dusk' | 'night'
type OverlayType = 'reading' | 'listening' | 'project' | null

const BOOK_ICONS = ['📖','📕','📗']
const TRACK_ICONS = ['🎙️','🎶','🌿','🎸']

const stars: [number,number,number][] = []
for(let i=0;i<55;i++) stars.push([(i*61)%PW,(i*37)%56,(i%5===0)?2:1])
const fflies: [number,number,number][] = []
for(let i=0;i<16;i++) fflies.push([150+(i*53)%180,95+(i*41)%95,i])

const flowers: [number,number,string,number][] = [
  [30,150,C.flPp,3],[55,162,C.flYl,4],[78,152,C.flWh,3],[100,166,C.flPk,4],
  [40,178,C.flRd,5],[64,184,C.flYl,3],[90,176,C.flPp,4],[116,172,C.flWh,3],
  [24,192,C.flPk,6],[50,199,C.flYl,4],[76,194,C.flWh,5],[102,201,C.flRd,4],
  [240,150,C.flPk,4],[262,158,C.flYl,3],[280,150,C.flWh,4],[302,162,C.flPk,5],
  [320,152,C.flRd,3],[342,160,C.flYl,4],[360,150,C.flPp,3],[376,158,C.flWh,4],
  [250,174,C.flYl,5],[270,182,C.flPk,4],[288,170,C.flRd,5],[308,180,C.flYl,3],
  [328,172,C.flWh,4],[350,178,C.flPp,5],[366,184,C.flPk,4],[378,174,C.flYl,3],
  [238,196,C.flRd,6],[258,201,C.flPk,5],[276,194,C.flYl,6],[296,202,C.flWh,5],
  [314,196,C.flPk,4],[336,201,C.flYl,5],[356,194,C.flRd,6],[372,201,C.flPp,5],
]

// ── GEOMETRY ─────────────────────────────────────────────────────────────────

function streamX(py: number) {const t=(py-60)/(PH-60);if(t<0)return 146;const mt=1-t;return Math.round(mt*mt*mt*146+3*mt*mt*t*118+3*mt*t*t*150+t*t*t*112);}
function streamW(py: number) {const t=(py-60)/(PH-60);if(t<0)return 3;return Math.round(3+t*16);}
function lerp(a: string,b: string,t: number) {const ah=parseInt(a.slice(1),16),bh=parseInt(b.slice(1),16);const ar=(ah>>16)&255,ag=(ah>>8)&255,ab=ah&255,br=(bh>>16)&255,bg=(bh>>8)&255,bb=bh&255;return '#'+(((Math.round(ar+(br-ar)*t)<<16)|(Math.round(ag+(bg-ag)*t)<<8)|Math.round(ab+(bb-ab)*t))>>>0).toString(16).padStart(6,'0');}

function getMood(tod: TOD) {
  if(tod==='night') return{skyT:'#0E1A3A',skyM:'#26406E',skyH:'#46527A',tint:'rgba(14,22,55,0.46)',cel:'moon',mtn:'#34315A',stars:true,fireflies:true,clouds:false};
  if(tod==='dusk')  return{skyT:'#E8743C',skyM:'#F2A35A',skyH:'#F8CE84',tint:'rgba(255,150,70,0.07)',cel:'dusksun',mtn:'#9F6FA6',stars:false,fireflies:false,clouds:true};
  return{skyT:'#5BB8D4',skyM:'#7ECEE6',skyH:'#A8E0C8',tint:null as null,cel:'sun',mtn:'#8295C2',stars:false,fireflies:false,clouds:true};
}

// ── DRAW FUNCTIONS ───────────────────────────────────────────────────────────

function px(ctx: CanvasRenderingContext2D,x: number,y: number,w: number,h: number,c: string){ctx.fillStyle=c;ctx.fillRect(x,y,w,h);}

function drawSky(ctx: CanvasRenderingContext2D,tick: number,tod: TOD){
  const M=getMood(tod);
  for(let y=0;y<62;y++){ctx.fillStyle=lerp(M.skyT,M.skyM,y/62);ctx.fillRect(0,y,PW,1);}
  for(let y=55;y<68;y++){ctx.fillStyle=lerp(M.skyM,M.skyH,(y-55)/13);ctx.fillRect(0,y,PW,1);}
  if(M.stars) stars.forEach(([x,y,s],i)=>{const tw=(Math.floor(tick*0.7)+i)%7;ctx.fillStyle=tw<5?'rgba(255,255,245,0.9)':'rgba(255,255,245,0.4)';ctx.fillRect(x,y,s,s);});
  drawCelestial(ctx,M);
  if(M.clouds){drawCloud(ctx,96,12,46,12);drawCloud(ctx,286,10,44,14);drawCloud(ctx,330,26,28,9);drawCloud(ctx,150,40,50,12);drawCloud(ctx,248,42,38,11);}
}

function drawCelestial(ctx: CanvasRenderingContext2D,M: ReturnType<typeof getMood>){
  if(M.cel==='sun'){
    px(ctx,22,8,10,10,C.sun);px(ctx,18,11,4,4,C.sunGl);px(ctx,26,9,4,4,C.sunGl);
    [[14,12,3,2],[30,12,3,2],[21,5,2,3],[21,19,2,3],[16,6,2,2],[28,6,2,2],[16,18,2,2],[28,18,2,2]].forEach(([x,y,w,h])=>px(ctx,x,y,w,h,C.sunGl));
  } else if(M.cel==='dusksun'){
    const cx2=212,cy2=46,r=16;
    for(let dy=-r-3;dy<=r+3;dy++) for(let dx=-r-3;dx<=r+3;dx++){const d=Math.sqrt(dx*dx+dy*dy);if(d<=r){ctx.fillStyle=lerp('#FFE9A8','#FF9A4A',(dy+r)/(2*r));ctx.fillRect(cx2+dx,cy2+dy,1,1);}else if(d<=r+3){ctx.fillStyle='rgba(255,210,130,0.22)';ctx.fillRect(cx2+dx,cy2+dy,1,1);}}
  } else {
    const cx2=42,cy2=22,r=9;
    for(let dy=-r;dy<=r;dy++) for(let dx=-r;dx<=r;dx++) if(dx*dx+dy*dy<=r*r){ctx.fillStyle='#EAEFF7';ctx.fillRect(cx2+dx,cy2+dy,1,1);}
    px(ctx,44,19,3,3,'#C7D2E2');px(ctx,38,24,2,2,'#C7D2E2');px(ctx,45,26,2,2,'#C7D2E2');
  }
}

function drawCloud(ctx: CanvasRenderingContext2D,x: number,y: number,w: number,h: number){
  ctx.fillStyle=C.cloudS;ctx.fillRect(x,y+h*0.55,w,h*0.45);ctx.fillRect(x+w*0.15,y+h*0.35,w*0.7,h*0.2);
  ctx.fillStyle=C.cloudW;ctx.fillRect(x+2,y+h*0.3,w-4,h*0.7);ctx.fillRect(x+w*0.12,y+h*0.12,w*0.76,h*0.5);
  ctx.fillRect(x+w*0.28,y,w*0.44,h*0.3);ctx.fillRect(x+w*0.18,y+h*0.05,w*0.3,h*0.2);
}

function drawMountains(ctx: CanvasRenderingContext2D,tod: TOD){
  const col=getMood(tod).mtn;
  [[70,62,52,16],[150,63,44,11],[300,60,64,20],[352,62,46,15],[210,64,40,9]].forEach(([cx2,base,w,h])=>{
    for(let i=0;i<w;i++){const dx=i-w/2,hh=Math.round(h*(1-Math.abs(dx)/(w/2)));if(hh>0){ctx.fillStyle=col;ctx.fillRect(Math.round(cx2+dx),base-hh,1,hh+2);}}
    ctx.fillStyle='rgba(255,255,255,0.10)';
    for(let i=0;i<w/2;i++){const dx=i-w/4,hh=Math.round(h*(1-Math.abs(dx)/(w/2)));if(hh>2)ctx.fillRect(Math.round(cx2+dx),base-hh,1,2);}
  });
}

function drawDistantMeadow(ctx: CanvasRenderingContext2D){
  for(let y=60;y<80;y++){ctx.fillStyle=lerp(C.distLt,C.distMd,(y-60)/20);ctx.fillRect(0,y,PW,1);}
  [[40,70,C.flYl],[80,65,C.flWh],[120,68,C.flPk],[180,66,C.flYl],[240,70,C.flWh],[290,67,C.flPk],[340,65,C.flYl],[360,72,C.flRd]].forEach(([x,y,c])=>{ctx.fillStyle=c as string;ctx.fillRect(x as number,y as number,2,1);ctx.fillRect((x as number)+1,(y as number)-1,1,1);});
}

function drawDistantTrees(ctx: CanvasRenderingContext2D){
  [[300,59,7,15],[330,61,5,12],[350,57,9,18],[370,60,6,13],[260,61,6,12]].forEach(([x,y,w,h])=>{
    px(ctx,x+Math.floor(w/2)-1,y+h-3,2,4,C.trunk);
    px(ctx,x,y,w,h,C.treeDk);px(ctx,x+1,y,w-2,h-2,C.treeMd);px(ctx,x+1,y,w-2,3,C.treeLt);
  });
}

function drawMidMeadow(ctx: CanvasRenderingContext2D){
  for(let y=78;y<130;y++){ctx.fillStyle=lerp(C.midLt,C.midDk,(y-78)/52);ctx.fillRect(0,y,PW,1);}
  for(let y=80;y<128;y+=3) for(let x=0;x<PW;x+=6) if(Math.sin(x*0.3+y*0.7)>0.5){ctx.fillStyle=C.midLt;ctx.fillRect(x,y,1,2);}
}

function drawStream(ctx: CanvasRenderingContext2D,wf: number){
  for(let py=62;py<PH-15;py++){
    const sx=streamX(py),sw=streamW(py);if(sw<2)continue;
    ctx.fillStyle=C.stBnk;ctx.fillRect(sx-3,py,3,1);ctx.fillRect(sx+sw,py,3,1);
    for(let i=0;i<sw;i++){const t=i/sw;ctx.fillStyle=(t<0.12||t>0.88)?C.stW3:(t<0.3||t>0.7)?C.stW1:C.stW2;ctx.fillRect(sx+i,py,1,1);}
    const sparkleY=(py+wf*3)%9;
    if(sparkleY<2&&sw>6){const mid=sx+Math.floor(sw/2);ctx.fillStyle=C.stFm;ctx.fillRect(mid-2,py,3,1);if(sw>12)ctx.fillRect(mid+4,py,2,1);}
    if(py>90&&py%11===0){
      const rwL=2+Math.round(Math.abs(Math.sin(py*0.4))*3);ctx.fillStyle=C.stRck;ctx.fillRect(sx-3,py,rwL,2);ctx.fillStyle=C.stRckL;ctx.fillRect(sx-2,py,rwL-1,1);
      const rwR=2+Math.round(Math.abs(Math.sin(py*0.5+2))*3);ctx.fillStyle=C.stRck;ctx.fillRect(sx+sw+1,py,rwR,2);ctx.fillStyle=C.stRckL;ctx.fillRect(sx+sw+1,py,rwR-1,1);
    }
  }
}

function drawForegroundGrass(ctx: CanvasRenderingContext2D){
  for(let y=128;y<PH;y++){ctx.fillStyle=lerp(C.fgMd,C.fgDk,(y-128)/(PH-128));ctx.fillRect(0,y,PW,1);}
  for(let y=130;y<PH-10;y+=4){
    const spacing=Math.max(2,Math.round(4+((y-130)/(PH-140))*3));
    for(let x=0;x<PW;x+=spacing){
      const sx=streamX(y),sw=streamW(y);if(x>sx-6&&x<sx+sw+6)continue;
      const h=1+Math.round(((y-130)/(PH-140))*3);
      ctx.fillStyle=C.fgLt;ctx.fillRect(x,y-h,1,h);
      ctx.fillStyle=C.fgVlt;ctx.fillRect(x+1,y-h-1,1,h+1);
      ctx.fillStyle=C.fgMd;ctx.fillRect(x+2,y-h+1,1,h-1);
    }
  }
}

function drawCottWindow(ctx: CanvasRenderingContext2D,cxW: number,topY: number,night: boolean){
  const w=16,h=18;
  ctx.fillStyle='#6e4a40';ctx.fillRect(cxW-w/2-1,topY-1,w+2,h+2);
  ctx.fillStyle='#F2ECDC';ctx.fillRect(cxW-w/2,topY,w,h);
  ctx.fillStyle=night?'#FFE08A':'#7FB0D2';ctx.fillRect(cxW-w/2+2,topY+2,w-4,h-4);
  ctx.fillStyle='#F2ECDC';ctx.fillRect(cxW-1,topY+2,2,h-4);ctx.fillRect(cxW-w/2+2,topY+Math.floor(h/2)-1,w-4,2);
  ctx.fillStyle=night?'rgba(255,240,170,0.55)':'rgba(255,255,255,0.28)';ctx.fillRect(cxW-w/2+2,topY+2,2,h-4);
}

function drawCottage(ctx: CanvasRenderingContext2D,tod: TOD){
  const cx=205,baseY=168,wallTop=124,wallL=cx-51,wallR=cx+51,wallW=102;
  const night=tod==='night';
  ctx.fillStyle='rgba(0,0,0,0.14)';ctx.fillRect(wallL-3,baseY+1,wallW+10,3);
  for(let y=wallTop;y<baseY;y++){for(let x=wallL;x<wallR;x++){const fx=(x-wallL)/wallW;ctx.fillStyle=fx<0.30?'#ECE0C4':fx>0.72?'#C7B992':'#DDCFAA';ctx.fillRect(x,y,1,1);}if((y-wallTop)%3===0){ctx.fillStyle='#C2B488';ctx.fillRect(wallL,y,wallW,1);}}
  ctx.fillStyle='#B9A878';ctx.fillRect(wallL,wallTop,2,baseY-wallTop);ctx.fillRect(wallR-2,wallTop,2,baseY-wallTop);
  const apexX=cx,apexY=99,eaveY=128,roofHalf=64;
  for(let y=apexY;y<=eaveY;y++){const half=Math.round((y-apexY)/(eaveY-apexY)*roofHalf);for(let x=apexX-half;x<=apexX+half;x++){const r=(y-apexY)%4;let col=r===0?'#7E3F36':r===1?'#C47B6A':'#A85A4C';if(x<apexX-half*0.4)col=r===0?'#A85A4C':'#C47B6A';ctx.fillStyle=col;ctx.fillRect(x,y,1,1);}}
  ctx.fillStyle='#D8927E';ctx.fillRect(apexX-2,apexY,4,4);
  ctx.fillStyle='#7E3F36';ctx.fillRect(apexX-roofHalf,eaveY,roofHalf*2,2);ctx.fillStyle='#5E2E28';ctx.fillRect(apexX-roofHalf,eaveY+2,roofHalf*2,1);
  ctx.fillStyle='#5E2E28';ctx.fillRect(apexX-5,apexY+13,10,9);
  ctx.fillStyle=night?'#FFE08A':'#3a4654';ctx.fillRect(apexX-4,apexY+14,8,7);
  ctx.fillStyle='#caa86e';ctx.fillRect(apexX-1,apexY+14,2,7);ctx.fillRect(apexX-4,apexY+17,8,1);
  ctx.fillStyle='#7a5246';ctx.fillRect(cx+36,apexY+12,8,17);ctx.fillStyle='#9a6a58';ctx.fillRect(cx+36,apexY+12,8,3);
  const sa=night?0.35:0.5;
  ctx.fillStyle=`rgba(225,222,214,${sa})`;ctx.fillRect(cx+38,apexY+6,4,4);ctx.fillRect(cx+37,apexY+1,5,4);ctx.fillRect(cx+39,apexY-3,4,4);
  drawCottWindow(ctx,cx-30,137,night);drawCottWindow(ctx,cx+30,137,night);
  ctx.fillStyle='#8A451E';ctx.fillRect(cx-38,156,18,5);ctx.fillStyle='#B5612C';ctx.fillRect(cx-38,156,18,2);
  [[cx-36,C.flPk],[cx-32,C.flPp],[cx-28,C.flYl],[cx-24,C.flRd],[cx-20,C.flPp]].forEach(([fx,c])=>{ctx.fillStyle='#2E7D2A';ctx.fillRect(fx as number,153,1,3);ctx.fillStyle=c as string;ctx.fillRect((fx as number)-1,152,3,2);});
  const dL=cx-8,dT=139,dW=16,dH=baseY-dT;
  ctx.fillStyle='#7a4a52';ctx.fillRect(dL-2,dT-2,dW+4,dH+2);ctx.fillStyle='#E6A8B8';ctx.fillRect(dL,dT,dW,dH);
  ctx.fillStyle='#D58CA0';ctx.fillRect(dL,dT,2,dH);ctx.fillRect(dL+dW-2,dT,2,dH);
  ctx.fillStyle='#C97C92';ctx.fillRect(dL+3,dT+5,dW-6,7);ctx.fillRect(dL+3,dT+15,dW-6,7);
  ctx.fillStyle='#F0D27A';ctx.fillRect(dL+dW-4,dT+14,2,2);
  ctx.fillStyle='#C08868';ctx.fillRect(cx-12,baseY,24,3);ctx.fillStyle='#9a5e42';ctx.fillRect(cx-12,baseY+3,24,1);
  ctx.fillStyle='#CE9678';ctx.fillRect(cx-17,baseY+4,34,3);ctx.fillStyle='#9a5e42';ctx.fillRect(cx-17,baseY+7,34,1);
  [[wallL+3,127],[wallL+5,134],[wallL+2,143],[wallL+8,151],[wallR-5,129],[wallR-3,138],[wallR-8,147],[cx-15,128],[cx+13,130]].forEach(([x,y],i)=>{ctx.fillStyle='#2E7D2A';ctx.fillRect(x,y,1,3);ctx.fillStyle=i%2?C.flPk:'#E85A8A';ctx.fillRect(x-1,y-1,3,2);ctx.fillRect(x,y-2,1,1);});
  const spx=cx+22,spy=baseY+2;
  ctx.fillStyle='#B5612C';ctx.fillRect(spx-3,spy+5,8,7);ctx.fillStyle='#8A451E';ctx.fillRect(spx-3,spy+5,8,2);
  ctx.fillStyle='#2E7D2A';ctx.fillRect(spx,spy-3,2,9);
  ctx.fillStyle='#E0A82E';for(let a=0;a<8;a++){const ang=a/8*Math.PI*2;ctx.fillRect(spx+1+Math.round(Math.cos(ang)*4),spy-7+Math.round(Math.sin(ang)*4),2,2);}
  ctx.fillStyle='#6B4A18';ctx.fillRect(spx-1,spy-8,4,4);ctx.fillStyle='#8A6020';ctx.fillRect(spx,spy-7,2,2);
}

function leafBlob(ctx: CanvasRenderingContext2D,x: number,y: number,w: number,h: number){
  const cx2=x+w/2,cy2=y+h/2,rx=w/2,ry=h/2;
  for(let yy=Math.max(0,y);yy<y+h&&yy<PH;yy++) for(let xx=Math.max(0,x);xx<x+w&&xx<PW;xx++){
    if(xx>=PW||yy>=PH)return;
    const dx=(xx-cx2)/rx,dy=(yy-cy2)/ry;
    if(dx*dx+dy*dy<=1){const mod=(xx+yy)%6;ctx.fillStyle=mod<2?C.leafDk:mod<4?C.leafMd:C.leafLt;ctx.fillRect(xx,yy,1,1);}
    const pxx=Math.max(0,xx-2),pyy=Math.max(0,yy-2);
    if(pxx>=PW||pyy>=PH)return;
    const dx2=(pxx-cx2)/rx,dy2=(pyy-cy2)/ry;
    if(dx2*dx2+dy2*dy2<=0.7&&(xx+yy)%3===0){ctx.fillStyle=C.leafHi;ctx.fillRect(pxx,pyy,1,1);}
  }
}

function drawForegroundTree(ctx: CanvasRenderingContext2D){
  for(let y=54;y<PH;y++){const t=(y-54)/(PH-54),cxT=20-Math.sin(t*1.15)*5+t*3,hw=5+t*t*20;ctx.fillStyle=C.trunk;ctx.fillRect(Math.round(cxT-hw),y,Math.round(hw*2),1);ctx.fillStyle=C.trunkD;ctx.fillRect(Math.round(cxT-hw),y,2,1);ctx.fillStyle=C.trunkL;ctx.fillRect(Math.round(cxT+hw-3),y,2,1);if(y%10===0){ctx.fillStyle=C.trunkD;ctx.fillRect(Math.round(cxT-1),y,2,3);}}
  for(let i=0;i<=72;i++){const t=i/72,bx=26+i,by=Math.round(68-Math.sin(t*Math.PI*0.52)*15-t*2),bw=Math.round(5*(1-t)+1);ctx.fillStyle=C.trunk;ctx.fillRect(bx,by,2,bw);ctx.fillStyle=C.trunkD;ctx.fillRect(bx,by+bw-1,2,1);}
  ;[[-8,-6,80,54],[34,-10,66,46],[66,2,52,38],[6,30,60,34],[80,16,46,30],[-6,30,46,30],[104,6,40,30]].forEach(([x,y,w,h])=>leafBlob(ctx,x,y,w,h));
}

function drawSwing(ctx: CanvasRenderingContext2D){
  const ax=64,bx=92,topY=56,ropLen=92;
  ctx.fillStyle=C.rope;ctx.fillRect(ax,topY,2,ropLen);ctx.fillRect(bx,topY,2,ropLen);
  ctx.fillStyle=C.ropeD;ctx.fillRect(ax,topY,1,ropLen);ctx.fillRect(bx,topY,1,ropLen);
  ctx.fillStyle=C.wood;ctx.fillRect(60,144,36,3);
  for(let i=0;i<6;i++){ctx.fillStyle=i%2?C.wood:C.woodL;ctx.fillRect(61+i*6,146,4,16);}
  ctx.fillStyle=C.woodD;ctx.fillRect(57,162,42,4);ctx.fillStyle=C.wood;ctx.fillRect(57,160,42,3);ctx.fillStyle=C.woodL;ctx.fillRect(57,160,42,1);
  ctx.fillStyle=C.wood;ctx.fillRect(55,156,4,12);ctx.fillRect(97,156,4,12);ctx.fillStyle=C.woodL;ctx.fillRect(55,156,4,2);ctx.fillRect(97,156,4,2);
  ctx.fillStyle=C.woodD;ctx.fillRect(59,166,4,12);ctx.fillRect(93,166,4,12);
  ctx.fillStyle='rgba(0,0,0,0.16)';ctx.fillRect(57,178,44,2);
}

function drawWildflower(ctx: CanvasRenderingContext2D,x: number,y: number,col: string,stemH: number){
  ctx.fillStyle='#3D9142';ctx.fillRect(x+1,y-stemH+2,1,stemH-2);
  ctx.fillStyle=col;ctx.fillRect(x,y-stemH,1,1);ctx.fillRect(x+2,y-stemH,1,1);ctx.fillRect(x+1,y-stemH-1,1,1);ctx.fillRect(x+1,y-stemH+1,1,1);
  ctx.fillStyle='#F5D56E';ctx.fillRect(x+1,y-stemH,1,1);
}

function drawPath(ctx: CanvasRenderingContext2D){
  for(let y=158;y<PH-4;y++){const t=(y-158)/(PH-162),pw=Math.round(4+t*10),px2=Math.round(192+Math.sin(y*0.08)*3)-Math.floor(pw/2);ctx.fillStyle=y%2===0?C.pathD:C.pathL;ctx.fillRect(px2,y,pw,1);ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(px2,y,1,1);ctx.fillRect(px2+pw-1,y,1,1);}
}

function drawTint(ctx: CanvasRenderingContext2D,tod: TOD){const M=getMood(tod);if(!M.tint)return;ctx.fillStyle=M.tint;ctx.fillRect(0,0,PW,PH);}

function drawFireflies(ctx: CanvasRenderingContext2D,tick: number){
  fflies.forEach(([bx,by,i])=>{const x=bx+Math.round(Math.sin(tick*0.3+i)*5),y=by+Math.round(Math.cos(tick*0.22+i*1.3)*4);if((Math.floor(tick*0.6)+i)%6<4){ctx.fillStyle='rgba(245,255,150,0.85)';ctx.fillRect(x,y,1,1);ctx.fillStyle='rgba(220,255,120,0.25)';ctx.fillRect(x-1,y,1,1);ctx.fillRect(x+1,y,1,1);ctx.fillRect(x,y-1,1,1);ctx.fillRect(x,y+1,1,1);}});
}

function drawVignette(ctx: CanvasRenderingContext2D){
  for(let x=0;x<8;x++){ctx.fillStyle=`rgba(0,0,0,${0.06*(8-x)})`;ctx.fillRect(x,0,1,PH);ctx.fillRect(PW-1-x,0,1,PH);}
  ctx.fillStyle='rgba(0,0,0,0.12)';ctx.fillRect(0,PH-8,PW,8);
}

function draw(ctx: CanvasRenderingContext2D,wf: number,tick: number,tod: TOD){
  ctx.clearRect(0,0,PW,PH);
  drawSky(ctx,tick,tod);drawMountains(ctx,tod);drawDistantMeadow(ctx);drawDistantTrees(ctx);
  drawMidMeadow(ctx);drawStream(ctx,wf);drawForegroundGrass(ctx);drawCottage(ctx,tod);
  flowers.forEach(([x,y,col,h])=>drawWildflower(ctx,x,y,col,h));
  drawForegroundTree(ctx);drawSwing(ctx);drawPath(ctx);drawTint(ctx,tod);
  if(getMood(tod).fireflies)drawFireflies(ctx,tick);
  drawVignette(ctx);
}

// ── SPRITES ──────────────────────────────────────────────────────────────────

const sprites: Record<string,(c: HTMLCanvasElement)=>void> = {
  scroll(c){const x=c.getContext('2d')!;x.imageSmoothingEnabled=false;x.fillStyle='#7A5230';x.fillRect(6,0,4,16);x.fillStyle='#5A3E20';x.fillRect(7,0,2,16);x.fillStyle='#F5E6C8';x.fillRect(0,2,12,9);x.fillStyle='#E0CFA0';x.fillRect(0,2,12,1);x.fillRect(0,10,12,1);x.fillStyle='#7A5230';x.fillRect(2,4,8,1);x.fillRect(2,6,6,1);x.fillRect(2,8,7,1);x.fillStyle='#C8A870';x.fillRect(0,2,2,9);x.fillRect(10,2,2,9);x.fillStyle='#CC3333';x.fillRect(5,1,2,2);},
  lantern(c){const x=c.getContext('2d')!;x.imageSmoothingEnabled=false;x.fillStyle='#888';x.fillRect(6,0,4,2);x.fillRect(5,2,6,2);x.fillStyle='#4A3820';x.fillRect(4,4,8,10);x.fillStyle='rgba(245,213,110,0.85)';x.fillRect(5,5,6,8);x.fillStyle='#FFF5A0';x.fillRect(6,6,4,5);x.fillStyle='#3A2810';x.fillRect(4,4,1,10);x.fillRect(11,4,1,10);x.fillRect(4,9,8,1);x.fillStyle='#888';x.fillRect(5,14,6,2);},
  mailbox(c){c.width=16;c.height=20;const x=c.getContext('2d')!;x.imageSmoothingEnabled=false;x.fillStyle='#888';x.fillRect(6,13,3,7);x.fillStyle='#CC3333';x.fillRect(2,6,12,7);x.fillStyle='#AA2222';x.fillRect(2,3,12,4);x.fillRect(4,1,8,3);x.fillRect(6,0,4,2);x.fillStyle='#881111';x.fillRect(5,9,6,1);x.fillStyle='#FF6644';x.fillRect(14,5,1,5);x.fillRect(14,5,3,2);x.fillStyle='rgba(255,255,255,0.22)';x.fillRect(3,4,3,5);},
  basket(c){const x=c.getContext('2d')!;x.imageSmoothingEnabled=false;x.fillStyle='#8B6347';x.fillRect(4,0,8,2);x.fillRect(3,1,2,3);x.fillRect(11,1,2,3);x.fillStyle='#C8A055';x.fillRect(2,4,12,9);x.fillStyle='#A07840';x.fillRect(2,5,12,1);x.fillRect(2,7,12,1);x.fillRect(2,9,12,1);x.fillRect(2,11,12,1);x.fillStyle='#B08848';for(let i=0;i<12;i+=3)x.fillRect(2+i,4,1,9);x.fillStyle='#2A8B2A';x.fillRect(5,2,2,3);x.fillRect(9,1,2,4);x.fillStyle='#F2A7C3';x.fillRect(7,3,2,2);x.fillStyle='#E85A2A';x.fillRect(3,3,2,2);x.fillStyle='#8B6347';x.fillRect(3,13,10,2);},
  books(c){const x=c.getContext('2d')!;x.imageSmoothingEnabled=false;x.fillStyle='#3A6BC4';x.fillRect(0,11,16,4);x.fillStyle='#2A5BAA';x.fillRect(0,11,2,4);x.fillStyle='#F5E6C8';x.fillRect(2,12,12,1);x.fillStyle='#C05040';x.fillRect(1,7,14,5);x.fillStyle='#A03A2A';x.fillRect(1,7,2,5);x.fillStyle='#F5E6C8';x.fillRect(3,9,9,1);x.fillStyle='#3D9142';x.fillRect(2,4,12,4);x.fillStyle='#2A6B2E';x.fillRect(2,4,2,4);x.fillStyle='#F5E6C8';x.fillRect(4,6,7,1);x.fillStyle='#F5D56E';x.fillRect(10,3,2,4);x.fillStyle='rgba(0,0,0,0.25)';x.fillRect(1,15,15,1);},
  music(c){const x=c.getContext('2d')!;x.imageSmoothingEnabled=false;x.fillStyle='#1A1A1A';x.fillRect(2,2,12,12);[[2,2],[13,2],[2,13],[13,13]].forEach(([rx,ry])=>x.clearRect(rx,ry,2,2));x.fillStyle='#333';x.fillRect(4,4,8,8);x.fillStyle='#1A1A1A';x.fillRect(5,5,6,6);x.fillStyle='#C05040';x.fillRect(6,6,4,4);x.fillStyle='#E06050';x.fillRect(6,6,4,1);x.fillStyle='#F5E6C8';x.fillRect(7,7,2,2);x.fillStyle='#F5D56E';x.fillRect(12,0,2,1);x.fillRect(13,1,1,2);x.fillRect(12,3,2,1);x.fillRect(0,5,1,1);x.fillRect(1,3,1,2);x.fillRect(0,2,2,1);}
}

function paintSprites() {
  document.querySelectorAll<HTMLCanvasElement>('.pp-sprite').forEach(c => {
    const n = c.dataset.sprite
    if(n && sprites[n]) sprites[n](c)
  })
}

// ── LAYOUT ───────────────────────────────────────────────────────────────────

const plotPos: Record<string,{b:number,l:number,sc:number}> = {
  'pp-github':{b:56,l:13,sc:1},'pp-substack':{b:50,l:27,sc:1},
  'pp-cooking':{b:50,l:67,sc:1.28},'pp-reading':{b:55,l:79,sc:1.28},
  'pp-music':{b:46,l:89,sc:1.28},'pp-mailbox':{b:18,l:66,sc:1.35},
}
// Shifted left for portrait mobile — same vertical positions, tightened horizontal spread
const plotPosMobile: Record<string,{b:number,l:number,sc:number}> = {
  'pp-github':{b:56,l:7,sc:1},'pp-substack':{b:50,l:20,sc:1},
  'pp-cooking':{b:50,l:58,sc:1.28},'pp-reading':{b:55,l:70,sc:1.28},
  'pp-music':{b:46,l:81,sc:1.28},'pp-mailbox':{b:18,l:57,sc:1.35},
}

const plotPosMobile: Record<string,{b:number,l:number,sc:number}> = {
  'pp-github':{b:56,l:9,sc:1},'pp-substack':{b:50,l:19,sc:1},
  'pp-cooking':{b:50,l:55,sc:1.1},'pp-reading':{b:55,l:66,sc:1.1},
  'pp-music':{b:46,l:77,sc:1.1},'pp-mailbox':{b:18,l:54,sc:1.15},
}
const spotPos: Record<string,{cx:number,cyB:number,w:number,h:number}> = {
  'ss-chair':{cx:19.5,cyB:24,w:13,h:17},'ss-door':{cx:53.4,cyB:29,w:8,h:15}
}

function positionAll() {
  const W=window.innerWidth,H=window.innerHeight
  const spriteScale=W<480?1.8:W<768?2.2:2.7
  const positions=W<600?plotPosMobile:plotPos
  Object.entries(positions).forEach(([id,p])=>{
    const el=document.getElementById(id) as HTMLElement|null;if(!el)return;
    el.style.bottom=(p.b*H/100)+'px';el.style.left=(p.l*W/100)+'px';
    const sp=el.querySelector<HTMLCanvasElement>('.pp-sprite');
    if(sp){sp.style.width=(+sp.getAttribute('width')!*spriteScale*p.sc)+'px';sp.style.height=(+sp.getAttribute('height')!*spriteScale*p.sc)+'px';}
  })
  Object.entries(spotPos).forEach(([id,s])=>{
    const el=document.getElementById(id) as HTMLElement|null;if(!el)return;
    el.style.left=s.cx+'%';el.style.bottom=s.cyB+'%';el.style.width=s.w+'%';el.style.height=s.h+'%';
  })
}

// ── COMPONENT ────────────────────────────────────────────────────────────────

interface Props {data: SiteData}

export default function MeadowCanvas({data}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const todRef    = useRef<TOD>('dusk')
  const tickRef   = useRef(0)
  const rafRef    = useRef<number | null>(null)

  const mailboxBtnRef = useRef<HTMLButtonElement>(null)
  const mailboxPopupRef = useRef<HTMLDivElement>(null)
  const mpCloseRef = useRef<HTMLButtonElement>(null)
  const chairBtnRef = useRef<HTMLButtonElement>(null)
  const cpCloseRef = useRef<HTMLButtonElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const overlayCloseRef = useRef<HTMLButtonElement>(null)
  const overlayTriggerRef = useRef<HTMLElement | null>(null)

  const [timeOfDay, setTimeOfDay] = useState<TOD>('dusk')
  const [mailboxOpen, setMailboxOpen] = useState(false)
  const [chairOpen, setChairOpen] = useState(false)
  const [overlayType, setOverlayType] = useState<OverlayType>(null)

  // Keep todRef in sync with state so the RAF loop always sees the latest value
  useEffect(() => { todRef.current = timeOfDay }, [timeOfDay])

  // Auto-set time of day from system clock on mount
  useEffect(() => {
    const h = new Date().getHours()
    const tod: TOD = (h>=20||h<6)?'night':h>=18?'dusk':'day'
    setTimeOfDay(tod)
    todRef.current = tod
  }, [])

  // Canvas setup + animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

    function loop() {
      tickRef.current += 0.16
      const t = tickRef.current
      draw(ctx!, Math.floor(t)%6, t, todRef.current)
      rafRef.current = requestAnimationFrame(loop)
    }

    function startLoop() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (reduced) { draw(ctx!, 0, 0, todRef.current); return }
      loop()
    }

    startLoop()

    const onVisibility = () => {
      if (document.hidden) { if(rafRef.current) cancelAnimationFrame(rafRef.current) }
      else startLoop()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  // Sprites + layout after DOM is ready
  useEffect(() => {
    paintSprites()
    positionAll()
  }, [])

  // Re-position on resize
  useEffect(() => {
    const onResize = () => {
      positionAll()
      if (mailboxOpen) positionMailboxPopup()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [mailboxOpen])

  // ── Popup positioning ──────────────────────────────────────────────────────

  const positionMailboxPopup = useCallback(() => {
    const btn = mailboxBtnRef.current
    const popup = mailboxPopupRef.current
    if (!btn || !popup) return
    const r = btn.getBoundingClientRect()
    const W = window.innerWidth
    const popW = Math.min(210, W-20)
    let left = r.left + r.width/2
    left = Math.max(popW/2+5, Math.min(W-popW/2-5, left))
    popup.style.left = left+'px'
    popup.style.bottom = (window.innerHeight - r.top + 10)+'px'
    popup.style.top = 'auto'
    popup.style.maxWidth = popW+'px'
  }, [])

  // ── Mailbox handlers ───────────────────────────────────────────────────────

  const openMailbox = useCallback(() => {
    setOverlayType(null)
    setChairOpen(false)
    setMailboxOpen(true)
    setTimeout(() => {
      positionMailboxPopup()
      mpCloseRef.current?.focus()
    }, 0)
  }, [positionMailboxPopup])

  const closeMailbox = useCallback(() => { setMailboxOpen(false) }, [])
  const closeMailboxFocus = useCallback(() => { setMailboxOpen(false); mailboxBtnRef.current?.focus() }, [])

  const handleMailboxToggle = useCallback(() => {
    if (mailboxOpen) closeMailboxFocus()
    else openMailbox()
  }, [mailboxOpen, closeMailboxFocus, openMailbox])

  // ── Chair handlers ─────────────────────────────────────────────────────────

  const openChair = useCallback(() => {
    setOverlayType(null)
    setMailboxOpen(false)
    setChairOpen(true)
    setTimeout(() => cpCloseRef.current?.focus(), 0)
  }, [])

  const closeChair = useCallback(() => { setChairOpen(false) }, [])
  const closeChairFocus = useCallback(() => { setChairOpen(false); chairBtnRef.current?.focus() }, [])

  const handleChairToggle = useCallback(() => {
    if (chairOpen) closeChairFocus()
    else openChair()
  }, [chairOpen, closeChairFocus, openChair])

  // ── Overlay handlers ───────────────────────────────────────────────────────

  const openOverlay = useCallback((type: OverlayType, trigger: HTMLElement) => {
    setMailboxOpen(false)
    setChairOpen(false)
    overlayTriggerRef.current = trigger
    setOverlayType(type)
    setTimeout(() => overlayCloseRef.current?.focus(), 0)
  }, [])

  const closeOverlay = useCallback(() => {
    setOverlayType(null)
    overlayTriggerRef.current?.focus()
    overlayTriggerRef.current = null
  }, [])

  // ── Focus trap for overlay ─────────────────────────────────────────────────

  const handleOverlayKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return
    const el = overlayRef.current
    if (!el) return
    const focusable = [...el.querySelectorAll<HTMLElement>('button,a[href],[tabindex]:not([tabindex="-1"])')].filter(el => !el.ariaDisabled && el.offsetParent !== null)
    if (!focusable.length) return
    const first = focusable[0], last = focusable[focusable.length-1]
    if (e.shiftKey) { if (document.activeElement===first){e.preventDefault();last.focus()} }
    else { if (document.activeElement===last){e.preventDefault();first.focus()} }
  }, [])

  // ── Global Escape key ──────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (overlayType) { closeOverlay(); return }
      if (mailboxOpen) { closeMailboxFocus(); return }
      if (chairOpen)   { closeChairFocus() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [overlayType, mailboxOpen, chairOpen, closeOverlay, closeMailboxFocus, closeChairFocus])

  // ── Outside-click close ────────────────────────────────────────────────────

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      if (mailboxOpen && !mailboxBtnRef.current?.contains(t) && !mailboxPopupRef.current?.contains(t)) closeMailbox()
      if (chairOpen && !chairBtnRef.current?.contains(t) && !document.getElementById('chair-popup')?.contains(t)) closeChair()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [mailboxOpen, chairOpen, closeMailbox, closeChair])

  // ── TOD ───────────────────────────────────────────────────────────────────

  const handleTOD = useCallback((tod: TOD) => {
    todRef.current = tod
    setTimeOfDay(tod)
  }, [])

  // ── Overlay content rendering ─────────────────────────────────────────────

  function renderOverlayContent() {
    if (overlayType === 'reading') {
      const books: Book[] = data.readingList?.books ?? []
      return books.map((book, i) => (
        <div className="list-item" key={i}>
          <span className="li-icon">{BOOK_ICONS[i % BOOK_ICONS.length]}</span>
          <div className="li-body">
            <div className="li-title">{book.title}</div>
            <div className="li-sub">{book.author}</div>
            <div className="progress-bar">
              {[1,2,3,4,5].map(n => <div key={n} className={`pb-seg${n<=book.progress?' filled':''}`}/>)}
            </div>
            {book.note && <div className="li-note">{book.note}</div>}
          </div>
        </div>
      ))
    }
    if (overlayType === 'listening') {
      const tracks: Track[] = data.listeningList?.tracks ?? []
      return tracks.map((track, i) => (
        <div className="list-item" key={i}>
          <span className="li-icon">{TRACK_ICONS[i % TRACK_ICONS.length]}</span>
          <div className="li-body">
            <div className="li-title">{track.title}</div>
            <div className="li-sub">{track.source}</div>
            {track.note && <div className="li-note">{track.note}</div>}
          </div>
        </div>
      ))
    }
    if (overlayType === 'project') {
      const proj = data.currentProject
      if (!proj) return null
      const year = new Date().getFullYear()
      const techLine = proj.techStack?.join(' · ') ?? ''
      const nextLine = proj.nextSteps ?? ''
      return (
        <>
          <div className="project-card">
            <div className="project-tag">{proj.status} · {year}</div>
            <div className="project-title">{proj.title}</div>
            <div className="project-desc">
              {proj.description}
              {techLine && <><br/><br/>tech: {techLine}</>}
              {nextLine && <><br/>next: {nextLine}</>}
            </div>
            {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noopener" className="project-link">view on github →</a>}
          </div>
          <div className="project-footer">more projects incoming — this is just the one i&apos;m most proud of right now 🌱</div>
        </>
      )
    }
    return null
  }

  function overlayTitle() {
    if (overlayType==='reading') return '▶ reading list'
    if (overlayType==='listening') return '▶ listening list'
    if (overlayType==='project') return '▶ current project'
    return ''
  }

  // ── Mailbox body ───────────────────────────────────────────────────────────

  function renderMailboxBody() {
    const msg = data.statusMessage?.message
    if (!msg) return <span>come back soon 🌿</span>
    return (
      <>
        {msg.split('\n').filter(Boolean).map((line, i) => (
          <span key={i}>&#9656; {line}<br/></span>
        ))}
        <br/>come back soon 🌿
      </>
    )
  }

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div id="scene" aria-label="Lily's Inner Plots meadow">
      <canvas ref={canvasRef} id="meadow" width={PW} height={PH} aria-hidden="true"/>

      <div id="title">
        <h1>lily&apos;s inner plots</h1>
        <p>· because she just be doing stuff ·</p>
      </div>

      {/* Plot points */}
      <a id="pp-github" className="plot-point" href="https://github.com/unassuminglily" target="_blank" rel="noopener" aria-label="Open GitHub portfolio">
        <canvas className="pp-sprite" width={16} height={16} data-sprite="lantern"/>
        <span className="pp-label">github · portfolio</span>
      </a>
      <a id="pp-substack" className="plot-point" href="https://substack.com/@innerplots" target="_blank" rel="noopener" aria-label="Open Inner Plots Substack">
        <canvas className="pp-sprite" width={16} height={16} data-sprite="scroll"/>
        <span className="pp-label">inner plots · substack</span>
      </a>
      <a id="pp-cooking" className="plot-point" href="https://www.instagram.com/lilybecooking/" target="_blank" rel="noopener" aria-label="Open lilybecooking on Instagram">
        <canvas className="pp-sprite" width={16} height={16} data-sprite="basket"/>
        <span className="pp-label">lilybecooking · ig</span>
      </a>
      <button id="pp-reading" className="plot-point" aria-label="Open reading list" onClick={e => openOverlay('reading', e.currentTarget)}>
        <canvas className="pp-sprite" width={16} height={16} data-sprite="books"/>
        <span className="pp-label">reading list</span>
      </button>
      <button id="pp-music" className="plot-point" aria-label="Open listening list" onClick={e => openOverlay('listening', e.currentTarget)}>
        <canvas className="pp-sprite" width={16} height={16} data-sprite="music"/>
        <span className="pp-label">listening list</span>
      </button>
      <button
        id="pp-mailbox" ref={mailboxBtnRef}
        className="plot-point"
        aria-label="Read what Lily is working on"
        aria-expanded={mailboxOpen}
        aria-controls="mailbox-popup"
        onClick={handleMailboxToggle}
      >
        <canvas className="pp-sprite" width={16} height={20} data-sprite="mailbox"/>
        <span className="pp-label">what i&apos;m working on</span>
      </button>

      {/* Scene spots */}
      <button
        id="ss-chair" ref={chairBtnRef}
        className="scene-spot"
        aria-label="Read an encouraging note"
        aria-expanded={chairOpen}
        aria-controls="chair-popup"
        onClick={handleChairToggle}
      >
        <span className="ss-marker"/>
        <span className="ss-label">sit a while</span>
      </button>
      <button id="ss-door" className="scene-spot" aria-label="See the current project" onClick={e => openOverlay('project', e.currentTarget)}>
        <span className="ss-marker"/>
        <span className="ss-label">current project</span>
      </button>

      {/* Mailbox popup */}
      <div
        id="mailbox-popup" ref={mailboxPopupRef}
        className={mailboxOpen ? 'open' : ''}
        role="dialog" aria-modal="true" aria-label="What Lily is working on"
      >
        <button ref={mpCloseRef} className="mp-close" aria-label="Close what I'm working on" onClick={closeMailboxFocus}>[ x ]</button>
        <div className="mp-header">&#9658; what i&apos;m working on</div>
        <div className="mp-body">{renderMailboxBody()}</div>
      </div>

      {/* Chair popup */}
      <div
        id="chair-popup"
        className={chairOpen ? 'open' : ''}
        role="dialog" aria-modal="true" aria-label="A note from the chair"
      >
        <button ref={cpCloseRef} className="cp-close" aria-label="Close the note from the chair" onClick={closeChairFocus}>[ x ]</button>
        <div className="cp-header">&#10022; sit a while</div>
        <div className="cp-body">
          {data.chairNote?.message
            ? data.chairNote.message.split('\n').map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br/>}</span>
              ))
            : <>whatever you&apos;re carrying, you can set it down here.<br/><br/>you&apos;re doing better than you think — keep going. 🌿</>
          }
        </div>
      </div>

      {/* Content overlay */}
      <div
        id="overlay" ref={overlayRef}
        className={overlayType ? 'open' : ''}
        role="dialog" aria-modal="true" aria-labelledby="overlay-title"
        onKeyDown={handleOverlayKeyDown}
      >
        <div id="overlay-header">
          <div id="overlay-title">{overlayTitle()}</div>
          <button ref={overlayCloseRef} id="overlay-close" aria-label="Close overlay" onClick={closeOverlay}>[ close ]</button>
        </div>
        <div id="overlay-content" aria-live="polite">{renderOverlayContent()}</div>
      </div>

      {/* Time of day toggle */}
      <div id="tod-toggle" role="group" aria-label="Time of day">
        {(['day','dusk','night'] as TOD[]).map(tod => (
          <button
            key={tod}
            className={`tod-btn${timeOfDay===tod?' active':''}`}
            data-tod={tod}
            aria-pressed={timeOfDay===tod}
            aria-label={`Set time of day to ${tod}`}
            onClick={() => handleTOD(tod)}
          >
            <span className="tod-icon" aria-hidden="true">
              {tod==='day'?'☀':tod==='dusk'?'🌅':'🌙'}
            </span>
            <span className="tod-text">{tod}</span>
          </button>
        ))}
      </div>

      <div id="footer">🌿 tended by lily</div>
    </div>
  )
}
