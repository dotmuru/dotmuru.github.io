# Publicar gratuitamente no GitHub Pages

O site está preparado; nenhum repositório foi criado ou alterado remotamente e nenhuma publicação foi realizada.

## Opção recomendada: projeto completo + GitHub Actions

Envie o CONTEÚDO de portfolio-livro para a raiz do repositório (não coloque outra pasta portfolio-livro em volta). O workflow publica somente dist; as ferramentas de personalização permanecem fora do site público.

Arquivos/pastas para enviar:

- .github/workflows/pages.yml
- dist/ inteiro, incluindo .nojekyll, assets/2026/ e vendor/
- scripts/, theme/ e tools/ (ferramentas locais e verificações)
- package.json e .gitignore
- README.md, ANALISE.md, VALIDACAO.md, PERSONALIZACAO.md e PUBLICACAO.md

O pacote release/portfolio-github.zip contém exatamente essa estrutura, sem analysis/, caches, PDFs originais ou arquivos de outros projetos. Extraia o ZIP antes de enviar; subir somente o ZIP não publica o site.

1. No GitHub, crie um repositório PUBLIC chamado portfolio-livro na conta murilio-ui. Para seguir os comandos abaixo, deixe o repositório vazio (sem README, licença ou .gitignore gerados pelo GitHub).
2. Envie os arquivos usando GitHub Desktop ou Git. Com Git instalado, execute na pasta do projeto:

~~~powershell
cd "D:\01. MURÍLIO - ARQUITETURA\portfolio-livro"
git init -b main
git add .
git commit -m "Preparar portfolio 2026 para GitHub Pages"
git remote add origin https://github.com/murilio-ui/portfolio-livro.git
git push -u origin main
~~~

Esses comandos são para o primeiro envio a um repositório novo; não os repita sobre um projeto que já possui remote configurado. O .gitignore exclui analysis/, release/, caches e node_modules/. Não envie a pasta D:\01. MURÍLIO - ARQUITETURA inteira.

3. No repositório, abra Settings → Pages → Build and deployment → Source e escolha GitHub Actions.
4. Abra Actions → Publicar portfólio no GitHub Pages → Run workflow → main → Run workflow. Se um envio inicial falhar antes de configurar Pages, execute novamente após o passo 3.
5. Aguarde o workflow concluir. O endereço esperado é https://murilio-ui.github.io/portfolio-livro/; a URL definitiva aparece em Settings → Pages e na execução do workflow.

Não há npm install, compilação ou conversão do PDF na publicação. As imagens já estão prontas. O workflow verifica os arquivos, envia dist e publica usando as ações oficiais. Envios futuros para main republicam o site.

## Alternativa: somente o site pronto, sem workflow

Extraia release/portfolio-site.zip e envie SEU CONTEÚDO à raiz de um repositório público. Nesse caso, o index.html fica diretamente na raiz do repositório, junto com:

~~~text
.nojekyll
index.html
sobre.html
contato.html
app.js
book.json
styles.css
theme.css
theme.json
favicon.svg
assets/2026/           todas as 114 imagens WebP
vendor/               biblioteca e licença
~~~

Não envie a pasta dist como uma subpasta nessa alternativa. Não envie customizer.html, tools, scripts ou o ZIP como substituto dos arquivos extraídos. Para muitos arquivos, GitHub Desktop/Git simplifica o envio e preserva as pastas e arquivos iniciados com ponto.

Em Settings → Pages, escolha Source: Deploy from a branch, Branch: main, Folder: /(root), e Save. Essa alternativa não usa .github/workflows/pages.yml. Não misture as duas opções.

## Conferir ou atualizar antes de enviar

~~~powershell
npm run check:pages
npm run preview:pages
~~~

Preview: http://127.0.0.1:4174/portfolio-livro/. O servidor reproduz hospedagem estática em subdiretório e respeita a capitalização exata dos nomes. Ctrl+C encerra o servidor.

O teste HTTP confere todos os 126 arquivos tanto em / quanto em /portfolio-livro/, suas respostas e tipos de conteúdo, links internos, caminho dos metadados, a ordem de 38 páginas e os 114 arquivos de imagem. Confirma também que o personalizador não está em dist.

Para gerar novamente os dois ZIPs após alterações, use Python 3:

~~~powershell
python scripts/package_pages.py
~~~

Para mudar o tema, use npm run customize e clique em Salvar alterações antes de enviar. Somente o tema gravado em dist/theme.css é publicado; mudanças de preview ainda não salvas não entram no pacote. Depois salve/envie os arquivos alterados pelo Git ou gere novamente o pacote do site.

## Fontes e arquivos preservados

O tema salvo atualmente usa Georgia com os fallbacks já escolhidos. A preparação não modifica fontes, cores, CSS, HTML, imagens ou a lógica do leitor. A aparência das fontes continua dependendo das fontes disponíveis no computador do visitante conforme a configuração aprovada; não foram incorporadas fontes novas.

.nojekyll foi incluído na raiz de dist para manter os arquivos estáticos sem processamento pelo Jekyll, inclusive na alternativa por branch. A versão publicada não precisa de Node, Python, PDF original, servidor do personalizador ou backend.

## Referências oficiais

- https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
