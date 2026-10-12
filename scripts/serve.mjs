import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.PORT||4173);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
 let filename;
 try{filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));}catch{res.writeHead(400).end();return;}
 if(filename!==root&&!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if(filename===root)filename=path.join(root,'index.html');
 fs.stat(filename,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404).end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':filename.endsWith('.webp')?'public,max-age=86400':'no-cache'});fs.createReadStream(filename).pipe(res);});
}).listen(port,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:'+port));
