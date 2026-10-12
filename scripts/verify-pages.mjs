import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createStaticServer,publicFiles,publicRoot,mime} from './pages-server.mjs';
const files=await publicFiles();
const fileSet=new Set(files);
assert(fileSet.has('index.html'),'index.html precisa estar na raiz publicada');
assert(fileSet.has('.nojekyll'),'Falta .nojekyll');
assert(!files.some(f=>/customizer|(^|\/)tools\/|(^|\/)scripts\//i.test(f)),'Ferramenta local no site público');
const manifest=JSON.parse(await fs.readFile(path.join(publicRoot,'book.json'),'utf8'));
assert.equal(manifest.pageCount,38);
assert.equal(manifest.pages.length,38);
const assets=[];
for(const [i,page] of manifest.pages.entries()) {
  assert.equal(page.number,i+1,'Sequência inválida');
  assert.equal(page.pdfPage,i===0?1:i===37?20:Math.floor((i-1)/2)+2);
  assert.equal(page.side,i===0||i===37?'single':i%2===1?'left':'right');
  for(const key of ['src','large','thumb']) assets.push(page[key]);
}
assert.equal(new Set(assets).size,114);
function checkReference(ref,source) {
  if(!ref || ref.startsWith('#') || /^(https?:|mailto:|tel:|data:)/i.test(ref))return;
  assert(!ref.startsWith('/') && !ref.includes('\\') && !/^[a-z]+:/i.test(ref),'Caminho absoluto em '+source+': '+ref);
  const url=new URL(ref,new URL(source,'https://example.test/portfolio-livro/'));
  assert(url.pathname.startsWith('/portfolio-livro/'),'Referência saiu do subdiretório: '+ref);
  let rel=decodeURIComponent(url.pathname.slice('/portfolio-livro/'.length));
  if(!rel || rel.endsWith('/'))rel+='index.html';
  assert(fileSet.has(rel),'Arquivo ausente ou capitalização incorreta: '+source+' → '+rel);
}
for(const f of files.filter(f=>/\.(html|css)$/.test(f))) {
  const text=await fs.readFile(path.join(publicRoot,f),'utf8');
  assert(!/127\.0\.0\.1|localhost|__customizer|api\/preview|api\/events/i.test(text),'Código de desenvolvimento no site: '+f);
  for(const match of text.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)) checkReference(match[1],f);
  for(const match of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi))checkReference(match[1].trim(),f);
}
const app=await fs.readFile(path.join(publicRoot,'app.js'),'utf8');
for(const match of app.matchAll(/fetch\(\s*["']([^"']+)["']/g))checkReference(match[1],'index.html');
for(const ref of assets)checkReference(ref,'index.html');
const summary={files:files.length,pages:38,images:assets.length,bases:[],errors:[]};
for(const base of ['/','/portfolio-livro/']) {
  const server=await createStaticServer(base);
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const origin='http://127.0.0.1:'+server.address().port;
  try {
    for(let i=0;i<files.length;i+=8)await Promise.all(files.slice(i,i+8).map(async f=>{
      const response=await fetch(origin+base+f);
      assert.equal(response.status,200,f+' em '+base);
      assert.equal(response.headers.get('content-type'),mime[path.extname(f)]||'application/octet-stream');
      assert.deepEqual(Buffer.from(await response.arrayBuffer()),await fs.readFile(path.join(publicRoot,f)),'Conteúdo HTTP divergiu: '+f);
    }));
    const response=await fetch(origin+base);
    assert.equal(response.status,200);
    assert.equal(await response.text(),await fs.readFile(path.join(publicRoot,'index.html'),'utf8'));
    for(const excluded of ['customizer.html','__customizer/live.js','tools/customizer/customizer.html','api/theme','assets/2026/PAGE-01.webp'])assert.equal((await fetch(origin+base+excluded)).status,404,excluded);
    if(base!=='/') {
      assert.equal((await fetch(origin+'/book.json')).status,404,'Teste mascarando caminho absoluto');
      const redirect=await fetch(origin+base.slice(0,-1),{redirect:'manual'});
      assert.equal(redirect.status,301);
      assert.equal(redirect.headers.get('location'),base);
    }
    summary.bases.push({base,successfulFiles:files.length});
  } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
}
console.log(JSON.stringify(summary,null,2));
console.log('OK: caminhos relativos, sequência, 114 imagens e respostas HTTP idênticas na raiz e em subdiretório.');
