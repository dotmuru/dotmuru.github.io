// This file is injected only by the development customizer server.
// It is never part of dist/ or the public portfolio.
(()=>{
 let sheet,style;
 if('adoptedStyleSheets' in document){sheet=new CSSStyleSheet();document.adoptedStyleSheets=[...document.adoptedStyleSheets,sheet];}
 else{style=document.createElement('style');style.id='local-theme-preview';document.head.append(style);}
 let events;
 function connect(){if(events)events.close();events=new EventSource('/api/events');events.addEventListener('message',event=>{try{const {css}=JSON.parse(event.data);if(sheet)sheet.replaceSync(css);else style.textContent=css;}catch(error){console.error('Preview de tema inválido:',error);}});}
 connect();window.addEventListener('pageshow',event=>{if(event.persisted)connect();});
 window.addEventListener('pagehide',()=>events.close());
})();
