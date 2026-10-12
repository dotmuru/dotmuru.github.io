import {createStaticServer} from './pages-server.mjs';
const port=Number(process.env.PORT||4174);
const base='/portfolio-livro/';
const server=await createStaticServer(base);
server.listen(port,'127.0.0.1',()=>console.log('Preview estático em subdiretório: http://127.0.0.1:'+port+base));
