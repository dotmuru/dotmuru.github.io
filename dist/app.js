'use strict';
const $ = (selector) => document.querySelector(selector);
let manifest, flip, current = 0, rebuilding = false, resizeTimer;
const stage = $('#stage'), host = $('#book-host');
const indexDialog = $('#index-panel'), zoomDialog = $('#zoom-panel');
function visibleIndices() {
  if (!manifest) return [];
  if (flip?.getOrientation() === 'portrait' || current === 0 || current === manifest.pageCount - 1) return [current];
  const left = current % 2 === 1 ? current : current - 1;
  return [left, left + 1].filter(i => i >= 0 && i < manifest.pageCount);
}
function loadNearby() {
  for (let i = Math.max(0,current-4); i <= Math.min(manifest.pageCount-1,current+5); i++) {
    const img = host.querySelector('[data-index="'+i+'"] img');
    if (img && !img.getAttribute('src')) img.src = manifest.pages[i].src;
  }
}
function updateReader() {
  if (!flip || rebuilding) return;
  current = flip.getCurrentPageIndex();
  const visible = visibleIndices();
  host.dataset.orientation = flip.getOrientation();
  host.dataset.position = current === 0 ? 'front' : current === manifest.pageCount-1 ? 'back' : 'open';
  $('#page-indicator').textContent = current===0 ? 'Capa' : current===manifest.pageCount-1 ? 'Contracapa' : 'Páginas '+visible.map(i=>String(i+1).padStart(2,'0')).join(' — ');
  if(flip.getOrientation()==='portrait' && current>0 && current<manifest.pageCount-1) $('#page-indicator').textContent = 'Página '+String(current+1).padStart(2,'0');
  $('#previous').disabled = current === 0;
  $('#next').disabled = current === manifest.pageCount-1;
  $('#open-book').hidden = current !== 0;
  $('#interaction-hint').textContent = current===0 ? 'Clique na capa para abrir' : flip.getOrientation()==='portrait' ? 'Deslize para folhear' : 'Arraste os cantos ou use ← →';
  loadNearby();
}
function buildBook() {
  const previousOrientation = flip?.getOrientation();
  if(flip) current=flip.getCurrentPageIndex();
  rebuilding = true;
  if(flip) flip.destroy();
  host.innerHTML='<div id="book"></div>';
  const portrait=window.innerWidth<=700;
  const height = Math.max(250,stage.clientHeight-30);
  const width = Math.floor(Math.min(height*manifest.aspectRatio,portrait?stage.clientWidth-52:(stage.clientWidth-120)/2,600));
  const pageHeight = Math.floor(width/manifest.aspectRatio);
  host.style.setProperty('--pw',width+'px');
  host.style.setProperty('--ph',pageHeight+'px');
  host.dataset.orientation=portrait?'portrait':'landscape';
  const book=$('#book');
  const items=manifest.pages.map((page,i)=>{
    const element=document.createElement('div');element.className='page';element.dataset.index=i;
    if(i===0||i===manifest.pageCount-1) element.dataset.density='hard';
    const img=document.createElement('img'); img.alt=(i===0?'Capa':i===manifest.pageCount-1?'Contracapa':'Página '+page.number)+' do portfólio 2026 de Murílio Gonçalves';img.width=page.width;img.height=page.height;img.draggable=false;img.decoding='async';
    if(Math.abs(i-current)<6){img.src=page.src; if(i===current)img.fetchPriority='high';}
    element.append(img);book.append(element);return element;
  });
  flip=new St.PageFlip(book,{width,height:pageHeight,size:'fixed',autoSize:false,usePortrait:true,showCover:true,drawShadow:true,maxShadowOpacity:.22,flippingTime:matchMedia('(prefers-reduced-motion: reduce)').matches?180:850,mobileScrollSupport:false,showPageCorners:true,startPage:current,clickEventForward:true,swipeDistance:35});
  flip.on('flip',updateReader);flip.on('changeOrientation',updateReader);flip.on('init',updateReader);
  flip.loadFromHTML(items);
  rebuilding=false;updateReader();
}
function turn(direction) {if (!flip || flip.getState()!=='read')return; direction>0?flip.flipNext('bottom'):flip.flipPrev('bottom');}
$('#previous').addEventListener('click',()=>turn(-1));$('#next').addEventListener('click',()=>turn(1));$('#open-book').addEventListener('click',()=>turn(1));
$('#index-button').addEventListener('click',()=>{indexDialog.showModal();$('#index-button').setAttribute('aria-expanded','true');});
$('#close-index').addEventListener('click',()=>indexDialog.close());indexDialog.addEventListener('close',()=>$('#index-button').setAttribute('aria-expanded','false'));
indexDialog.addEventListener('click',event=>{
  const button=event.target.closest('[data-page]');if(button && flip){ current=Number(button.dataset.page);loadNearby();flip.turnToPage(current);updateReader();indexDialog.close(); }
  if(event.target===indexDialog){const r=indexDialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)indexDialog.close();}
});
$('#show-thumbnails').addEventListener('click',()=>{
  const container=$('#thumbnails');container.hidden=!container.hidden;$('#show-thumbnails').setAttribute('aria-expanded',String(!container.hidden));
  if(container.childElementCount===0)for(const p of manifest.pages){const button=document.createElement('button');button.dataset.page=p.number-1;button.setAttribute('aria-label','Ir para página '+p.number);const img=document.createElement('img');img.src=p.thumb;img.alt='Miniatura da página '+p.number;img.loading='lazy';button.append(img,document.createTextNode(String(p.number).padStart(2,'0')));container.append(button);}
});
async function toggleFullscreen(){
  try{if(document.fullscreenElement)await document.exitFullscreen();else if($('#reader').requestFullscreen)await $('#reader').requestFullscreen();}
  catch(error){$('#interaction-hint').textContent='Tela cheia indisponível neste navegador';}
}
$('#fullscreen').addEventListener('click',toggleFullscreen);
document.addEventListener('fullscreenchange',()=>{$('#fullscreen').setAttribute('aria-label',document.fullscreenElement?'Sair da tela cheia':'Entrar em tela cheia');});
function setZoom(value){
  value=Math.min(300,Math.max(100,Number(value)));const view=$('#zoom-viewport'),images=$('#zoom-images');const old=parseFloat(images.style.width)||100;
  const x=(view.scrollLeft+view.clientWidth/2)/(view.clientWidth*old/100),y=(view.scrollTop+view.clientHeight/2)/(images.scrollHeight||1);
  images.style.width=value+'%';$('#zoom-range').value=value;$('#zoom-percent').textContent=value+'%';
  view.scrollLeft=x*(view.clientWidth*value/100)-view.clientWidth/2;view.scrollTop=y*images.scrollHeight-view.clientHeight/2;
}
function showZoom(){
  if(!manifest)return;const indices=visibleIndices();const container=$('#zoom-images');container.innerHTML='';container.style.width='100%';
  for(const i of indices){const img=document.createElement('img');img.src=manifest.pages[i].large;img.alt='Ampliação da página '+(i+1);img.draggable=false;container.append(img);}
  $('#zoom-label').textContent=indices.length>1?'Páginas '+indices.map(i=>i+1).join(' — '):'Página '+(indices[0]+1);
  $('#zoom-range').value=100;$('#zoom-percent').textContent='100%';zoomDialog.showModal();$('#zoom-viewport').scrollTo(0,0);
}
$('#zoom-button').addEventListener('click',showZoom);$('#close-zoom').addEventListener('click',()=>zoomDialog.close());$('#zoom-range').addEventListener('input',event=>setZoom(event.target.value));$('#zoom-in').addEventListener('click',()=>setZoom(Number($('#zoom-range').value)+25));$('#zoom-out').addEventListener('click',()=>setZoom(Number($('#zoom-range').value)-25));
let pan=null;const viewport=$('#zoom-viewport');
viewport.addEventListener('pointerdown',event=>{if(event.pointerType!=='mouse')return;pan={x:event.clientX,y:event.clientY,left:viewport.scrollLeft,top:viewport.scrollTop};viewport.setPointerCapture(event.pointerId);viewport.classList.add('dragging');event.preventDefault();});
viewport.addEventListener('pointermove',event=>{if(!pan)return;viewport.scrollLeft=pan.left+pan.x-event.clientX;viewport.scrollTop=pan.top+pan.y-event.clientY;});
for(const event of ['pointerup','pointercancel','lostpointercapture'])viewport.addEventListener(event,()=>{pan=null;viewport.classList.remove('dragging');});
viewport.addEventListener('wheel',event=>{if(event.ctrlKey){event.preventDefault();setZoom(Number($('#zoom-range').value)+(event.deltaY>0?-25:25));}},{passive:false});
// Start touch drags immediately through the library's mouse controller.
// Its default 250 ms delay can select the wrong side during a slow swipe.
let bookTouch=null;
function touchPoint(touch){const rect=flip.getUI().getDistElement().getBoundingClientRect();return {x:touch.clientX-rect.left,y:touch.clientY-rect.top};}
host.addEventListener('touchstart',event=>{
  if(!flip||event.touches.length!==1||flip.getState()!=='read')return;
  event.preventDefault();event.stopPropagation();const touch=event.touches[0];
  bookTouch={x:touch.clientX,y:touch.clientY,page:current,last:touchPoint(touch)};bookTouch.localX=bookTouch.last.x;
  flip.startUserTouch(bookTouch.last);
},{passive:false,capture:true});
host.addEventListener('touchmove',event=>{
  if(!bookTouch||!event.touches.length)return;
  event.preventDefault();event.stopPropagation();bookTouch.last=touchPoint(event.touches[0]);if(flip.getOrientation()==='portrait')bookTouch.last.x=bookTouch.localX+2*(bookTouch.last.x-bookTouch.localX);flip.userMove(bookTouch.last,true);
},{passive:false,capture:true});
host.addEventListener('touchend',event=>{
  if(!bookTouch)return;event.preventDefault();event.stopPropagation();
  const touch=event.changedTouches[0],start=bookTouch;bookTouch=null;
  const tap=touch&&Math.hypot(touch.clientX-start.x,touch.clientY-start.y)<=12;
  if(tap){flip.userStop(start.last,true);const bounds=host.getBoundingClientRect();turn(current===0?1:current===manifest.pageCount-1?-1:touch.clientX<bounds.left+bounds.width/2?-1:1);}
  else flip.userStop(touch?touchPoint(touch):start.last);
},{passive:false,capture:true});
host.addEventListener('touchcancel',event=>{if(bookTouch){event.stopPropagation();flip.userStop(bookTouch.last);bookTouch=null;}},{capture:true});
document.addEventListener('keydown',event=>{
  if(event.target.matches('input,textarea,select')||event.ctrlKey||event.metaKey||event.altKey)return;
  if(indexDialog.open||zoomDialog.open)return;
  if(event.key==='ArrowRight'||event.key==='PageDown'){event.preventDefault();turn(1);}
  if(event.key==='ArrowLeft'||event.key==='PageUp'){event.preventDefault();turn(-1);}
  if(event.key==='Home'){event.preventDefault();flip?.turnToPage(0);}
  if(event.key==='End'){event.preventDefault();current=manifest.pageCount-1;loadNearby();flip?.turnToPage(current);}
  if(event.key.toLowerCase()==='z')showZoom();if(event.key.toLowerCase()==='f')toggleFullscreen();
});
window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(manifest)buildBook();},180);});
(async()=>{
  try{const response=await fetch('book.json');if(!response.ok)throw Error('Metadados indisponíveis');manifest=await response.json();if(!window.St?.PageFlip)throw Error('Biblioteca indisponível');$('#total').textContent=manifest.pageCount;buildBook();await host.querySelector('img').decode();$('#loading').hidden=true;}
  catch(error){console.error(error);$('#loading').textContent='Não foi possível carregar o livro. Recarregue a página ou verifique os arquivos locais.';}
})();
