import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';

const clamped = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const LA = {x: 330, y: 505};
const NY = {x: 940, y: 415};
const PARIS = {x: 1450, y: 360};
const progress = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {...clamped, easing: Easing.inOut(Easing.cubic)});
const mix = (a: number, b: number, p: number) => a + (b - a) * p;

const Land = () => <g fill="#183449" stroke="#2d5a6c" strokeWidth="2">
  <path d="M80 235 L135 190 225 174 274 198 310 250 356 270 388 320 365 365 329 385 308 430 275 444 258 487 225 507 209 472 183 450 173 405 140 373 127 331 92 296Z"/>
  <path d="M310 535 L356 550 386 589 398 642 374 698 357 760 330 812 309 783 294 723 276 677 281 621Z"/>
  <path d="M785 185 L835 163 883 174 912 205 958 210 985 246 1018 252 1040 292 1018 328 984 333 968 365 939 371 913 346 878 337 862 309 828 294 811 257 778 229Z"/>
  <path d="M870 389 L918 401 949 435 959 486 944 531 917 574 894 621 871 608 858 566 833 531 824 482 839 438Z"/>
  <path d="M1080 210 L1130 182 1200 189 1235 215 1282 214 1312 241 1365 236 1402 260 1446 250 1488 279 1534 273 1578 302 1614 334 1588 361 1553 353 1525 381 1492 369 1468 395 1432 389 1409 368 1375 372 1350 344 1317 345 1294 316 1262 322 1238 291 1207 300 1176 274 1141 272 1120 242 1091 241Z"/>
  <path d="M1480 450 L1522 435 1564 454 1588 489 1576 529 1545 548 1516 527 1495 496Z"/>
</g>;

const Grid = () => <g stroke="#163346" strokeWidth="1" opacity=".8">
  {Array.from({length:21},(_,i)=><line key={'v'+i} x1={i*96} y1="0" x2={i*96} y2="1080"/>)}
  {Array.from({length:13},(_,i)=><line key={'h'+i} x1="0" y1={i*90} x2="1920" y2={i*90}/>)}
</g>;

const City = ({x,y,name,code,active}:{x:number;y:number;name:string;code:string;active:boolean}) => <g>
  <circle cx={x} cy={y} r={active?23:13} fill="#52e7ff" opacity=".13"/>
  <circle cx={x} cy={y} r={active?8:5} fill={active?'#70f2ff':'#c0e7f0'}/>
  <circle cx={x} cy={y} r={active?15:9} fill="none" stroke="#70f2ff" strokeWidth="2" opacity={active?.9:.45}/>
  <text x={x+21} y={y-10} fill="#f2fbff" fontSize="24" fontWeight="700" letterSpacing="1.5">{code}</text>
  <text x={x+21} y={y+18} fill="#8fb7c7" fontSize="17" letterSpacing="1">{name.toUpperCase()}</text>
</g>;

const EiffelTower = () => {
  const frame = useCurrentFrame();
  const rotation = interpolate(frame,[0,899],[-.3,Math.PI*2+.3]);
  const metal = new THREE.MeshStandardMaterial({color:'#c9954d',metalness:.72,roughness:.3});
  const lit = new THREE.MeshStandardMaterial({color:'#ffe3a1',emissive:'#c9872c',emissiveIntensity:.8+Math.sin(frame/10)*.25,metalness:.6,roughness:.25});
  const dark = new THREE.MeshStandardMaterial({color:'#8d5d2d',metalness:.65,roughness:.36});
  const pieces: React.ReactNode[] = [];
  const rod = (a:THREE.Vector3,b:THREE.Vector3,r:number,mat:THREE.Material,key:string) => {
    const d=new THREE.Vector3().subVectors(b,a);
    const p=new THREE.Vector3().addVectors(a,b).multiplyScalar(.5);
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());
    pieces.push(<mesh key={key} position={p.toArray()} quaternion={q.toArray()} material={mat}><cylinderGeometry args={[r,r,d.length(),6]}/></mesh>);
  };
  const square=(y:number,r:number,key:string) => {
    const pts=[0,1,2,3].map(i=>{const a=Math.PI/4+i*Math.PI/2;return new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);});
    pts.forEach((p,i)=>rod(p,pts[(i+1)%4],.032,lit,key+'r'+i));
    return pts;
  };
  const base=square(.08,1.32,'base'), deck1=square(1.18,.75,'deck1'), deck2=square(2.05,.4,'deck2');
  const tip=new THREE.Vector3(0,3.35,0);
  for(let i=0;i<4;i++){
    rod(base[i],deck1[i],.052,dark,'legA'+i); rod(deck1[i],deck2[i],.04,metal,'legB'+i); rod(deck2[i],tip,.03,lit,'legC'+i);
    rod(base[i],deck1[(i+1)%4],.022,metal,'braceA'+i); rod(base[(i+1)%4],deck1[i],.022,metal,'braceB'+i);
    rod(deck1[i],deck2[(i+1)%4],.018,metal,'braceC'+i); rod(deck1[(i+1)%4],deck2[i],.018,metal,'braceD'+i);
  }
  rod(new THREE.Vector3(0,3.3,0),tip,.022,lit,'antenna');
  return <group rotation={[0,rotation,0]} position={[0,-1.55,0]}>
    <mesh position={[0,.04,0]} material={dark}><cylinderGeometry args={[1.42,1.42,.08,48]}/></mesh>{pieces}
  </group>;
};

const TowerScene = () => <ThreeCanvas width={760} height={780} camera={{position:[0,1.05,7.5],fov:38}}>
  <ambientLight intensity={1.4}/><directionalLight position={[4,6,5]} intensity={3}/>
  <pointLight position={[-3,2,2]} intensity={2} color="#54dfff"/><EiffelTower/>
</ThreeCanvas>;

export const TripFilm: React.FC = () => {
  const f=useCurrentFrame();
  const zoomOut=progress(f,0,105), toNY=progress(f,180,380), toParis=progress(f,500,700), arrival=progress(f,700,755);
  const focusX=f<180?LA.x:f<500?mix(LA.x,NY.x,toNY):f<700?mix(NY.x,PARIS.x,toParis):PARIS.x;
  const focusY=f<180?LA.y:f<500?mix(LA.y,NY.y,toNY):f<700?mix(NY.y,PARIS.y,toParis):PARIS.y;
  const zoom=f<110?mix(2.55,1,zoomOut):f<700?1:mix(1,1.22,arrival);
  const tx=960-focusX*zoom, ty=540-focusY*zoom;
  const routeLA=progress(f,170,330), routeParis=progress(f,490,660);
  const title=interpolate(f,[8,30,110,140],[0,1,1,0],clamped);
  const mapFade=interpolate(f,[0,16],[0,1],clamped);
  const towerFade=interpolate(f,[695,735],[0,1],clamped);
  const subtitle=f<160?'ONE PLANET. THREE ICONIC CITIES.':f<470?'WEST COAST TO EAST COAST':f<700?'ACROSS THE ATLANTIC':'BONJOUR, PARIS.';
  return <AbsoluteFill style={{backgroundColor:'#07131f',color:'#f4fbff',fontFamily:'Arial,Helvetica,sans-serif',overflow:'hidden'}}>
    <AbsoluteFill style={{opacity:mapFade}}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0}}>
        <defs><radialGradient id="ocean"><stop offset="0%" stopColor="#102d40"/><stop offset="100%" stopColor="#07131f"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <rect width="1920" height="1080" fill="url(#ocean)"/>
        <g transform={`translate(${tx},${ty}) scale(${zoom})`}>
          <Grid/><Land/>
          <path d={`M ${LA.x} ${LA.y} Q 620 330 ${NY.x} ${NY.y}`} fill="none" stroke="#55eaff" strokeWidth="5" strokeLinecap="round" strokeDasharray="900" strokeDashoffset={900*(1-routeLA)} filter="url(#glow)" opacity={f<170?0:.95}/>
          <path d={`M ${NY.x} ${NY.y} Q 1180 280 ${PARIS.x} ${PARIS.y}`} fill="none" stroke="#f5c66b" strokeWidth="5" strokeLinecap="round" strokeDasharray="760" strokeDashoffset={760*(1-routeParis)} filter="url(#glow)" opacity={f<490?0:.95}/>
          <City x={LA.x} y={LA.y} name="Los Angeles" code="LAX" active={f<180}/>
          <City x={NY.x} y={NY.y} name="New York" code="NYC" active={f>=300&&f<570}/>
          <City x={PARIS.x} y={PARIS.y} name="Paris" code="PAR" active={f>=650}/>
        </g>
        <g opacity={title}><text x="110" y="130" fill="#70efff" fontSize="20" letterSpacing="8" fontWeight="700">THE LONG WAY AROUND</text><text x="108" y="205" fill="#f4fbff" fontSize="62" fontWeight="700">A JOURNEY IN THREE ACTS</text></g>
      </svg>
    </AbsoluteFill>
    <div style={{position:'absolute',left:100,top:70,opacity:f>120?1:0}}>
      <div style={{fontSize:17,letterSpacing:7,color:'#6feaff',fontWeight:700}}>FLIGHT PATH / 001</div>
      <div style={{fontSize:42,letterSpacing:1,fontWeight:700,marginTop:10}}>{subtitle}</div>
    </div>
    <div style={{position:'absolute',left:100,bottom:70,display:'flex',gap:18,alignItems:'center',opacity:.9}}>
      <div style={{width:52,height:3,background:'#65eaff'}}/><div style={{fontSize:16,letterSpacing:4,color:'#a7c9d5'}}>LOS ANGELES <span style={{color:'#477384'}}>—</span> NEW YORK <span style={{color:'#477384'}}>—</span> PARIS</div>
    </div>
    <div style={{position:'absolute',right:0,top:0,width:800,height:1080,opacity:towerFade,transform:`translateY(${(1-arrival)*40}px)`,background:'linear-gradient(90deg,rgba(7,19,31,0),rgba(7,19,31,.94) 19%,rgba(7,19,31,.97))'}}>
      <div style={{position:'absolute',right:75,top:170,fontSize:17,letterSpacing:7,color:'#f4c46b',fontWeight:700}}>FINAL DESTINATION</div>
      <div style={{position:'absolute',right:72,top:210,fontSize:62,fontWeight:700,letterSpacing:2}}>PARIS</div>
      <div style={{position:'absolute',right:78,top:292,fontSize:19,color:'#a8c8d6',letterSpacing:2}}>48.8584° N / 2.2945° E</div>
      <div style={{position:'absolute',right:18,top:330,width:760,height:780}}><TowerScene/></div>
      <div style={{position:'absolute',right:80,bottom:105,fontSize:16,letterSpacing:5,color:'#f4c46b'}}>EIFFEL TOWER · 3D STUDY</div>
    </div>
    <div style={{position:'absolute',right:92,top:78,fontSize:13,letterSpacing:4,color:'#7b9eac'}}>30 SEC FILM / 30 FPS</div>
  </AbsoluteFill>;
};
