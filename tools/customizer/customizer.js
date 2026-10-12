'use strict';
const $=selector=>document.querySelector(selector);let schema,fonts,saved,current,defaults,token,timer,saving=false,invalid=new Set(),controls=new Map(),previewQueue=Promise.resolve();
const clone=value=>JSON.parse(JSON.stringify(value));const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
async function api(route,theme){const response=await fetch(route,theme?{method:'POST',headers:{'Content-Type':'application/json','X-Customizer-Token':token},body:JSON.stringify(theme)}:{cache:'no-store'});const data=await response.json();if(!response.ok)throw Error(data.error||'Não foi possível falar com o servidor local.');return data;}
function dirty(){return invalid.size>0||!same(current,saved);}
function status(){const changed=dirty();$('#dirty-status').dataset.dirty=String(changed);$('#dirty-status').textContent=invalid.size?'Corrija os valores inválidos para salvar':changed?'● Alterações ainda não salvas':'Sem alterações pendentes';$('#save').disabled=saving||invalid.size>0||!changed;$('#restore').disabled=saving;}
function requestPreview(theme){previewQueue=previewQueue.catch(()=>{}).then(()=>api('/api/preview',theme));return previewQueue;}
function preview(){clearTimeout(timer);if(invalid.size)return;const theme=clone(current);timer=setTimeout(()=>requestPreview(theme).catch(error=>{$('#connection-status').textContent='Servidor desconectado';$('#save-message').textContent=error.message;}),120);}
function change(field,value){const item=controls.get(field.key);let error='';
 if(field.type==='color'){if(/^#?[0-9a-f]{6}$/i.test(value))value='#'+value.replace('#','').toLowerCase();else error='Use seis dígitos, por exemplo #fbfaf8.';}
 if(field.type==='font'){value=value.trim();if(!value||value.length>80||!/^[\p{L}\p{N} .'-]+$/u.test(value))error='Digite somente o nome da fonte, sem aspas ou CSS.';}
 if(field.type==='size'){value=Number(value);if(!Number.isInteger(value)||value<12||value>28)error='Escolha de 12 a 28 px.';}
 if(field.type==='weight')value=Number(value);
 item.row.classList.toggle('invalid',!!error);item.error.textContent=error;item.input.setAttribute('aria-invalid',String(!!error));
 if(error)invalid.add(field.key);else{invalid.delete(field.key);current[field.key]=value;if(item.picker)item.picker.value=value;}
 $('#save-message').textContent='';status();preview();
}
function render(){for(const field of schema){const {input,picker,row,error}=controls.get(field.key);input.value=current[field.key];if(picker)picker.value=current[field.key];row.classList.remove('invalid');input.setAttribute('aria-invalid','false');error.textContent='';}invalid.clear();status();}
function build(){const container=$('#fields');container.textContent='';let group,fieldset;
 for(const field of schema){if(group!==field.group){group=field.group;fieldset=document.createElement('fieldset');const legend=document.createElement('legend');legend.textContent=group;fieldset.append(legend);container.append(fieldset);}
 const row=document.createElement('div');row.className='field';const label=document.createElement('label');label.htmlFor='field-'+field.key;label.textContent=field.label+(field.type==='size'?' (px)':'');row.append(label);
 let input,picker;
 if(field.type==='fallback'||field.type==='weight'){input=document.createElement('select');const choices=field.type==='fallback'?[['sans-serif','Sem serifa'],['serif','Com serifa'],['monospace','Monoespaçada']]:[[300,'Leve · 300'],[400,'Normal · 400'],[500,'Médio · 500'],[600,'Seminegrito · 600'],[700,'Negrito · 700'],[800,'Extra negrito · 800']];for(const [value,text] of choices){const option=document.createElement('option');option.value=value;option.textContent=text;input.append(option);}}
 else{input=document.createElement('input');input.type=field.type==='size'?'number':'text';if(field.type==='size'){input.min=12;input.max=28;input.step=1;}if(field.type==='font'){input.setAttribute('list','font-list');input.autocomplete='off';}if(field.type==='color'){input.maxLength=7;input.spellcheck=false;input.autocomplete='off';}}
 input.id='field-'+field.key;input.dataset.key=field.key;
 if(field.type==='color'){const colors=document.createElement('div');colors.className='color-field';picker=document.createElement('input');picker.type='color';picker.setAttribute('aria-label',field.label+' (seletor de cor)');picker.dataset.picker=field.key;picker.addEventListener('input',()=>{input.value=picker.value;change(field,picker.value);});colors.append(picker,input);row.append(colors);}else row.append(input);
 const error=document.createElement('p');error.className='field-error';error.id='error-'+field.key;input.setAttribute('aria-describedby',error.id);row.append(error);fieldset.append(row);controls.set(field.key,{input,picker,row,error});input.addEventListener('input',()=>change(field,input.value));input.addEventListener('change',()=>change(field,input.value));
 }
 for(const font of fonts){const option=document.createElement('option');option.value=font;$('#font-list').append(option);}render();
}
$('#restore').addEventListener('click',()=>{current=clone(defaults);render();preview();$('#save-message').textContent=dirty()?'Padrão aplicado ao preview. Clique em Salvar alterações para gravar.':'O tema já está no padrão.';});
$('#theme-form').addEventListener('submit',async event=>{event.preventDefault();if(saving||invalid.size||!dirty())return;clearTimeout(timer);const theme=clone(current);saving=true;$('#theme-form').setAttribute('aria-busy','true');for(const fieldset of document.querySelectorAll('fieldset'))fieldset.disabled=true;status();$('#save-message').textContent='Salvando nos arquivos do projeto…';
 try{await previewQueue.catch(()=>{});const result=await api('/api/save',theme);saved=clone(result.theme);current=clone(result.theme);render();$('#save-message').textContent='✓ Alterações salvas em theme.json e theme.css.';}
 catch(error){$('#save-message').textContent='Não foi possível salvar: '+error.message;}
 finally{saving=false;$('#theme-form').removeAttribute('aria-busy');for(const fieldset of document.querySelectorAll('fieldset'))fieldset.disabled=false;status();}
});
window.addEventListener('beforeunload',event=>{if(current&&dirty()){event.preventDefault();event.returnValue='';}});
(async()=>{try{const data=await api('/api/theme');schema=data.fields;fonts=data.fontChoices;saved=clone(data.saved);current=clone(data.draft);defaults=clone(data.defaults);token=data.token;build();const connection=new EventSource('/api/events');connection.onopen=()=>{$('#connection-status').textContent='Ao vivo';};connection.onerror=()=>{$('#connection-status').textContent='Servidor desconectado';};}catch(error){$('#fields').textContent='Não foi possível carregar o personalizador.';$('#save-message').textContent=error.message;$('#save').disabled=true;$('#restore').disabled=true;}})();

// Preview sizing belongs to the development tool, never to the reader.
let previewMode='desktop';const layoutSheet=new CSSStyleSheet();document.adoptedStyleSheets=[...document.adoptedStyleSheets,layoutSheet];
function fitPreview(){const canvas=$('.preview-canvas'),width=previewMode==='mobile'?390:1100,height=previewMode==='mobile'?844:800;const scale=Math.min(canvas.clientWidth/width,canvas.clientHeight/height,1);layoutSheet.replaceSync('.preview-canvas iframe { width:'+width+'px; height:'+height+'px; transform:translate(-'+width*scale/2+'px,-'+height*scale/2+'px) scale('+scale+'); }');}
for(const button of document.querySelectorAll('[data-preview]'))button.addEventListener('click',()=>{previewMode=button.dataset.preview;for(const item of document.querySelectorAll('[data-preview]'))item.setAttribute('aria-pressed',String(item===button));fitPreview();});
new ResizeObserver(fitPreview).observe($('.preview-canvas'));fitPreview();
