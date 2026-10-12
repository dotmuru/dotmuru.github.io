import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const publicRoot = fileURLToPath(new URL('../dist/', import.meta.url));
export const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.svg':'image/svg+xml'};
export async function publicFiles(dir = publicRoot, prefix = '') {
  const files=[];
  for(const entry of await fs.readdir(dir,{withFileTypes:true})) {
    const rel=prefix+entry.name;
    if(entry.isSymbolicLink()) throw Error('Link simbólico não permitido: '+rel);
    if(entry.isDirectory()) files.push(...await publicFiles(path.join(dir,entry.name),rel+'/'));
    else if(entry.isFile()) files.push(rel);
  }
  return files.sort();
}
export async function createStaticServer(base = '/') {
  if(!base.startsWith('/') || !base.endsWith('/') || !base.split('/').every(part=>!part||/^[-a-zA-Z0-9_]+$/.test(part))) throw Error('Base inválida');
  const files=new Set(await publicFiles());
  return http.createServer(async (req,res)=>{
    try {
      let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if(base!=='/' && pathname===base.slice(0,-1)) {res.writeHead(301,{Location:base}).end();return;}
      if(!pathname.startsWith(base)) {res.writeHead(404).end('Not found');return;}
      const rel=pathname.slice(base.length)||'index.html';
      // Conferência exata: reproduz a distinção entre maiúsculas e minúsculas do Pages.
      if(!files.has(rel)) {res.writeHead(404).end('Not found');return;}
      const content=await fs.readFile(path.join(publicRoot,rel));
      res.writeHead(200,{'Content-Type':mime[path.extname(rel)]||'application/octet-stream','Cache-Control':'no-cache'});
      res.end(req.method==='HEAD'?undefined:content);
    } catch {res.writeHead(500).end('Server error');}
  });
}
