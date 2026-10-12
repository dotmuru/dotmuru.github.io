import http from 'node:http';
import fs from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {validateTheme,toCSS,fields,fontChoices} from '../tools/customizer/theme-core.mjs';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dist=path.join(project,'dist'),tools=path.join(project,'tools/customizer');
const port=Number(process.env.CUSTOMIZER_PORT||4180);
const token=crypto.randomBytes(32).toString('hex');
const defaults=validateTheme(JSON.parse(await fs.readFile(path.join(project,'theme/theme.defaults.json'),'utf8')));
let saved=validateTheme(JSON.parse(await fs.readFile(path.join(dist,'theme.json'),'utf8'))),draft=saved;
const clients=new Set();let writes=Promise.resolve();
async function atomicWrite(file,value){const temp=file+'.'+crypto.randomBytes(8).toString('hex')+'.tmp';try{await fs.writeFile(temp,value,'utf8');await fs.rename(temp,file);}finally{await fs.rm(temp,{force:true});}}
await atomicWrite(path.join(dist,'theme.css'),toCSS(saved));
function broadcast(){const data='data: '+JSON.stringify({css:toCSS(draft)})+'\n\n';for(const client of clients)client.write(data);}
function json(res,status,value){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));}
async function readBody(req){let chunks=[],length=0;for await(const chunk of req){length+=chunk.length;if(length>32768)throw Error('Requisição muito grande.');chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString('utf8'));}
async function persist(theme){const previousJSON=await fs.readFile(path.join(dist,'theme.json'),'utf8'),previousCSS=await fs.readFile(path.join(dist,'theme.css'),'utf8');try{await atomicWrite(path.join(dist,'theme.json'),JSON.stringify(theme,null,2)+'\n');await atomicWrite(path.join(dist,'theme.css'),toCSS(theme));}catch(error){await atomicWrite(path.join(dist,'theme.json'),previousJSON);await atomicWrite(path.join(dist,'theme.css'),previousCSS);throw error;}saved=theme;draft=theme;broadcast();}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml'};
const localFiles={'/customizer.html':'customizer.html','/__customizer/customizer.css':'customizer.css','/__customizer/customizer.js':'customizer.js','/__customizer/live.js':'live.js'};
const server=http.createServer(async(req,res)=>{
 try{
  const host=req.headers.host;if(!['127.0.0.1:'+port,'localhost:'+port].includes(host)){json(res,403,{error:'Acesso permitido somente pelo endereço local.'});return;}
  const origin=req.headers.origin;if(origin&&!['http://127.0.0.1:'+port,'http://localhost:'+port].includes(origin)){json(res,403,{error:'Origem não autorizada.'});return;}
  const url=new URL(req.url,'http://'+host),pathname=decodeURIComponent(url.pathname);
  if(pathname==='/api/theme'&&req.method==='GET'){json(res,200,{saved,draft,defaults,fields,fontChoices,token});return;}
  if(pathname==='/api/events'&&req.method==='GET'){
   res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'});clients.add(res);res.write('data: '+JSON.stringify({css:toCSS(draft)})+'\n\n');const pulse=setInterval(()=>res.write(': keep-alive\n\n'),20000);req.on('close',()=>{clients.delete(res);clearInterval(pulse);});return;
  }
  if(['/api/preview','/api/save'].includes(pathname)&&req.method==='POST'){
   if(req.headers['x-customizer-token']!==token){json(res,403,{error:'Sessão local expirada. Reabra o painel.'});return;}
   const theme=validateTheme(await readBody(req));
   if(pathname==='/api/preview'){draft=theme;broadcast();json(res,200,{ok:true});return;}
   const operation=writes.then(()=>persist(theme));writes=operation.catch(()=>{});await operation;json(res,200,{ok:true,theme:saved,message:'Tema salvo em dist/theme.json e dist/theme.css.'});return;
  }
  if(pathname.startsWith('/api/')){json(res,404,{error:'Endpoint inexistente.'});return;}
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  let file;if(localFiles[pathname])file=path.join(tools,localFiles[pathname]);else{file=path.resolve(dist,'.'+pathname);if(file!==dist&&!file.startsWith(dist+path.sep)){res.writeHead(403).end();return;}if(file===dist)file=path.join(dist,'index.html');}
  const stat=await fs.stat(file);if(!stat.isFile()){res.writeHead(404).end();return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD'){res.end();return;}
  if(file.startsWith(dist+path.sep)&&path.extname(file)==='.html'){let html=await fs.readFile(file,'utf8');html=html.replace('</head>','<script defer src="/__customizer/live.js"></script></head>');res.end(html);}
  else createReadStream(file).pipe(res);
 }catch(error){if(!res.headersSent)json(res,error.code==='ENOENT'?404:400,{error:error.code==='ENOENT'?'Arquivo não encontrado.':error.message});else res.end();}
});
server.listen(port,'127.0.0.1',()=>{console.log('Personalizador: http://127.0.0.1:'+port+'/customizer.html');console.log('Portfólio com preview ao vivo: http://127.0.0.1:'+port+'/');console.log('Somente local. Publicar apenas a pasta dist/. Ctrl+C para encerrar.');});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?'Porta '+port+' já está em uso. Abra o painel existente ou escolha CUSTOMIZER_PORT.':error.message);process.exitCode=1;});
