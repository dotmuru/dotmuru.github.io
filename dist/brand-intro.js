/* Animação independente do page flip, do zoom e dos controles do livro. */
(()=>{
 const intro=document.querySelector('#brand-intro');
 if(!intro)return;
 const reader=document.querySelector('#reader');
 const wordNode=intro.querySelector('#brand-intro-word');
 const skip=intro.querySelector('.brand-intro-skip');
 const finalHoldMs=5000;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const replay=new URL(location.href).searchParams.get('abertura')==='1';
 let seen=false;
 try{seen=sessionStorage.getItem('muru-opening-seen')==='1';}catch{}
 if(seen&&!replay)return;
 const previousInert=reader?.inert;
 const previousFocus=document.activeElement;
 const controller=new AbortController();
 const waits=new Set();
 const animations=new Set();
 let stopped=false;
 let word='muru';
 const history=['[.muru]'];
 intro.dataset.sequence=history.join(' → ');
 intro.dataset.phase='initial';
 intro.hidden=false;
 document.body.classList.add('brand-intro-active');
 if(reader)reader.inert=true;
 intro.focus({preventScroll:true});
 function pause(milliseconds){return new Promise(resolve=>{const task={resolve,id:setTimeout(()=>{waits.delete(task);resolve();},milliseconds)};waits.add(task);});}
 async function animate(element,frames,options){const animation=element.animate(frames,options);animations.add(animation);try{await animation.finished;}catch{}finally{animations.delete(animation);}}
 function finish(reason){
  if(stopped)return;stopped=true;
  for(const task of waits){clearTimeout(task.id);task.resolve();}waits.clear();
  for(const animation of animations)animation.cancel();animations.clear();
  wordNode.textContent='[.m]';intro.dataset.phase=reason;intro.hidden=true;
  document.body.classList.remove('brand-intro-active');
  if(reader)reader.inert=previousInert;
  controller.abort();
  try{sessionStorage.setItem('muru-opening-seen','1');}catch{}
  if(previousFocus instanceof HTMLElement&&previousFocus!==document.body&&previousFocus.isConnected)previousFocus.focus({preventScroll:true});
  else document.querySelector('#stage')?.focus({preventScroll:true});
 }
 skip.addEventListener('click',()=>finish('skipped'),{signal:controller.signal});
 document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();finish('skipped');}
  else if(['ArrowLeft','ArrowRight','PageUp','PageDown','Home','End','z','Z','f','F','+','-'].includes(event.key)&&!event.ctrlKey&&!event.metaKey){event.preventDefault();event.stopImmediatePropagation();}
 },{capture:true,signal:controller.signal});
 function tspan(value){const span=document.createElementNS('http://www.w3.org/2000/svg','tspan');span.textContent=value;return span;}
 async function eraseLast(){
  const prefix=tspan('[.'+word.slice(0,-1));
  const letter=tspan(word.slice(-1));
  const bracket=tspan(']');
  wordNode.replaceChildren(prefix,letter,bracket);
  const oldWidth=wordNode.getComputedTextLength();
  await animate(letter,[{opacity:1},{opacity:0}],{duration:130,easing:'linear',fill:'forwards'});
  if(stopped)return;
  word=word.slice(0,-1);wordNode.textContent='[.'+word+']';
  history.push(wordNode.textContent);intro.dataset.sequence=history.join(' → ');intro.dataset.phase=word;
  const offset=(oldWidth-wordNode.getComputedTextLength())/2;
  await animate(wordNode,[{transform:'translateX('+(-offset)+'px)'},{transform:'translateX(0px)'}],{duration:170,easing:'ease-out'});
 }
 async function holdFinal(){
  intro.dataset.phase='holding';intro.dataset.holdMs=String(finalHoldMs);
  const started=Date.now();await pause(finalHoldMs);
  intro.dataset.heldMs=String(Date.now()-started);
 }
 async function run(){
  if(reduced){wordNode.textContent='[.m]';intro.dataset.sequence='[.m]';await holdFinal();finish('reduced-motion');return;}
  await pause(650);
  while(word.length>1&&!stopped){await eraseLast();if(stopped)return;if(word.length>1)await pause(130);}
  if(stopped)return;
  await holdFinal();if(stopped)return;
  intro.dataset.phase='leaving';
  await animate(intro,[{opacity:1},{opacity:0}],{duration:340,easing:'ease-out',fill:'forwards'});
  finish('complete');
 }
 run().catch(()=>finish('fallback'));
})();
