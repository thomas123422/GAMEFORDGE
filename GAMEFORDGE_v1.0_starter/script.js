const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
ctx.imageSmoothingEnabled=false;
const $=id=>document.getElementById(id);
let world='meadow',difficulty='normal',gameType='platformer',running=false,score=0,frame=0;
const keys={};
let player={x:65,y:250,vx:0,vy:0,w:22,h:27,onGround:false};
let gems=[],platforms=[],particles=[];
const palettes={
 meadow:{sky:'#8bd8e8',far:'#68b9a0',hill:'#3f947a',ground:'#34765a',top:'#74c96c',accent:'#ffe27a'},
 forest:{sky:'#172d3a',far:'#244b4b',hill:'#28634e',ground:'#244735',top:'#68a86b',accent:'#c3ff85'},
 lava:{sky:'#351d36',far:'#71334a',hill:'#9a3f36',ground:'#512b37',top:'#dc6643',accent:'#ffcf66'},
 night:{sky:'#101a3b',far:'#263a70',hill:'#344b86',ground:'#242e5a',top:'#637bd1',accent:'#8fffea'}
};
function buildLevel(){
 const gap=difficulty==='hard'?112:145;
 platforms=[{x:0,y:310,w:640,h:50},{x:155,y:260,w:75,h:12},{x:285,y:220,w:82,h:12},{x:430,y:260,w:80,h:12}];
 if(difficulty==='hard')platforms.push({x:540,y:210,w:60,h:12});
 gems=Array.from({length:7},(_,i)=>({x:110+i*75,y: i%2?225:280,got:false}));
 player={x:55,y:270,vx:0,vy:0,w:22,h:27,onGround:false};score=0;$('score').textContent='GEMS: 0';
}
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function draw(){
 const p=palettes[world];ctx.clearRect(0,0,640,360);rect(0,0,640,360,p.sky);
 // pixel stars / clouds
 for(let i=0;i<22;i++){let x=(i*83-frame*.12)%680;rect(x,35+(i*29)%110,3,3,world==='night'?'#d6e5ff':'#ffffff77')}
 for(let i=0;i<5;i++){let x=(i*155-frame*.25)%720-30;rect(x,155,70,18,p.far);rect(x+12,140,35,15,p.far)}
 for(let i=0;i<4;i++){let x=i*190-(frame*.35%190);rect(x,235,100,75,p.hill);rect(x+20,210,65,35,p.hill)}
 // ground and platforms
 platforms.forEach((pl,i)=>{rect(pl.x,pl.y,pl.w,pl.h,p.ground);rect(pl.x,pl.y,pl.w,5,p.top);for(let x=pl.x+8;x<pl.x+pl.w-4;x+=16)rect(x,pl.y+13,4,4,'#ffffff16')});
 gems.forEach(g=>{if(g.got)return;rect(g.x-5,g.y-5,10,10,p.accent);rect(g.x-2,g.y-8,4,16,'#fff1a0');rect(g.x-8,g.y-2,16,4,'#fff1a0')});
 // player pixel character
 rect(player.x+5,player.y,12,7,'#f5c99b');rect(player.x+3,player.y+7,16,11,'#6e64d9');rect(player.x+4,player.y+18,6,8,'#252b48');rect(player.x+13,player.y+18,6,8,'#252b48');rect(player.x+13,player.y+3,3,3,'#172039');
 rect(player.x+2,player.y+10,3,7,'#f5c99b');rect(player.x+18,player.y+10,3,7,'#f5c99b');
 // HUD
 rect(12,12,125,25,'#101a2bd9');ctx.fillStyle='#f4f7ff';ctx.font='12px monospace';ctx.fillText('PIXEL QUEST',22,29);
}
function update(){
 if(!running)return;
 frame++;
 const speed=difficulty==='hard'?3.7:3.2;
 if(keys.ArrowLeft||keys.a)player.vx=-speed;else if(keys.ArrowRight||keys.d)player.vx=speed;else player.vx*=.72;
 if((keys.Space||keys[' ']||keys.ArrowUp||keys.w)&&player.onGround){player.vy=-10.5;player.onGround=false}
 player.vy+=.48;player.x=Math.max(0,Math.min(618,player.x+player.vx));player.y+=player.vy;player.onGround=false;
 platforms.forEach(pl=>{if(player.x+player.w>pl.x&&player.x<pl.x+pl.w&&player.y+player.h>=pl.y&&player.y+player.h<=pl.y+13&&player.vy>=0){player.y=pl.y-player.h;player.vy=0;player.onGround=true}});
 gems.forEach(g=>{if(!g.got&&Math.abs((player.x+11)-g.x)<16&&Math.abs((player.y+13)-g.y)<18){g.got=true;score++;$('score').textContent='GEMS: '+score}});
 if(player.y>390){player.x=55;player.y=250;player.vy=0}
 draw();requestAnimationFrame(update);
}
function start(){if(running)return;running=true;$('startOverlay').style.display='none';requestAnimationFrame(update)}
function reset(){running=false;buildLevel();draw();$('startOverlay').style.display='grid'}
function addMessage(user,reply){
 const log=$('chatLog'),m=document.createElement('div');m.className='message '+(user?'user':'bot');
 const avatar=document.createElement('span');avatar.className='avatar';avatar.textContent=user?'Y':'G';
 const body=document.createElement('div');const b=document.createElement('b');b.textContent=user?'YOU':'GAMEFORDGE';const p=document.createElement('p');p.textContent=reply;
 body.append(b,p);m.append(avatar,body);log.append(m);log.scrollTop=log.scrollHeight;
}
function applyPrompt(raw){
 const t=raw.toLowerCase();let replies=[];
 if(t.includes('forest')||t.includes('woods')){world='forest';$('worldSelect').value=world;replies.push('Mystic Forest selected. The world palette has changed.')}
 if(t.includes('lava')||t.includes('volcano')){world='lava';$('worldSelect').value=world;replies.push('Lava Caverns selected. Watch your step!')}
 if(t.includes('night')||t.includes('neon')||t.includes('space')){world='night';$('worldSelect').value=world;replies.push('Neon Night selected.')}
 if(t.includes('meadow')||t.includes('grass')){world='meadow';$('worldSelect').value=world;replies.push('Pixel Meadow selected.')}
 if(t.includes('hard')||t.includes('difficult')){difficulty='hard';$('difficulty').value='hard';replies.push('Difficulty increased. Platforms are trickier now.')}
 if(t.includes('easy')||t.includes('chill')){difficulty='easy';$('difficulty').value='easy';replies.push('Chill mode selected.')}
 if(t.includes('gem')||t.includes('coin')){gems.forEach(g=>g.got=false);replies.push('Gem hunt refreshed. Collect them all!')}
 if(t.includes('runner')){gameType='runner';$('gameType').value='runner';replies.push('Runner style selected. This demo keeps the platform controls for now.')}
 if(t.includes('collector')){gameType='collector';$('gameType').value='collector';replies.push('Gem collector selected.')}
 if(t.includes('platform')){gameType='platformer';$('gameType').value='platformer';replies.push('Platformer selected.')}
 if(t.includes('restart')||t.includes('reset')){reset();replies.push('Game restarted.')}
 if(!replies.length)replies.push('Cool idea! This offline starter can change worlds, difficulty and game type. Try “spooky forest”, “make it harder”, or “add more gems”.');
 return replies.join(' ');
}
$('promptForm').addEventListener('submit',e=>{e.preventDefault();const input=$('promptInput'),v=input.value.trim();if(!v)return;addMessage(true,v);const reply=applyPrompt(v);addMessage(false,reply);input.value='';draw()});
document.querySelectorAll('.suggestion').forEach(b=>b.addEventListener('click',()=>{$('promptInput').value=b.textContent;$('promptForm').requestSubmit()}));
$('worldSelect').addEventListener('change',e=>{world=e.target.value;draw()});
$('difficulty').addEventListener('change',e=>{difficulty=e.target.value;buildLevel();draw()});
$('gameType').addEventListener('change',e=>{gameType=e.target.value;addMessage(false,gameType+' mode selected.');});
$('playBtn').addEventListener('click',start);$('restartBtn').addEventListener('click',reset);
$('newGameBtn').addEventListener('click',()=>{reset();world='meadow';difficulty='normal';$('worldSelect').value=world;$('difficulty').value=difficulty;$('projectName').textContent='New Pixel Project';addMessage(false,'Fresh project started. Describe your next game idea!')});
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' '].includes(e.key)&&e.target.tagName!=='TEXTAREA')e.preventDefault();keys[e.key]=true;if(e.key===' '&&e.target.tagName!=='TEXTAREA'&&!running)start()});
window.addEventListener('keyup',e=>keys[e.key]=false);
function save(){const data={world,difficulty,gameType,projectName:$('projectName').textContent};localStorage.setItem('gameforge-save',JSON.stringify(data));addMessage(false,'Project settings saved in this browser.')}
function load(){const raw=localStorage.getItem('gameforge-save');if(!raw){addMessage(false,'No local save found yet.');return}const d=JSON.parse(raw);world=d.world||'meadow';difficulty=d.difficulty||'normal';gameType=d.gameType||'platformer';$('worldSelect').value=world;$('difficulty').value=difficulty;$('gameType').value=gameType;$('projectName').textContent=d.projectName||'Pixel Quest';buildLevel();draw();addMessage(false,'Your saved project has been loaded.')}
$('saveBtn').addEventListener('click',save);$('loadBtn').addEventListener('click',load);
buildLevel();draw();
