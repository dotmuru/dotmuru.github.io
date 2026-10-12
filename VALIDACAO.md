# Validação do protótipo

Resultado: aprovado nos testes locais e na inspeção visual.

- Origem 2026: 20 páginas PDF, organizadas em 38 páginas do livro, com 18 pares esquerda/direita e duas capas. Todas as 114 imagens verificadas.
- Sequência completa em desktop: capa, 2–3, 4–5, …, 36–37, contracapa. Em celular: uma página por vez, de 1 a 38.
- Desktop 1440 × 1000: capa centralizada, clique para abrir, folhas animadas, arraste com mouse, teclado, navegação anterior/próxima, índice, miniaturas, zoom e tela cheia.
- Viewports 390 × 844 e 360 × 640: página única, sem estouro horizontal, capa inteiramente visível mesmo na tela compacta.
- Toque emulado: abertura por tap rápido, arraste para avançar e voltar, zoom de uma página.
- Console: nenhum erro de JavaScript. Rede: nenhuma resposta HTTP malsucedida nos testes.
- Conversão retomável executada e confirmada. WebP de 1200 px, zoom de 2400 px e miniaturas de 400 px. Aproximadamente 19,9 MiB de imagens no total; cerca de 4,8 MiB para todas as páginas de leitura. Inicialmente somente seis páginas recebem imagem; versões grandes e miniaturas são solicitadas sob demanda.

Evidências: analysis/qa-results.json, analysis/touch-results.json e capturas PNG em analysis/.

Site local em http://127.0.0.1:4173/. Nenhuma publicação realizada. O servidor de desenvolvimento pode ser reiniciado conforme README.md.

## Personalizador de tema
Fontes, pesos, tamanho do cabeçalho e 12 cores testados no painel, incluindo sincronização entre seletor e hexadecimal, preview sem recarregar o livro, salvamento em JSON/CSS, carregamento estático, validação de entrada e restauração. Preview de duas páginas em 1100 × 800 e página única integral em 390 × 844. JavaScript, biblioteca, imagens, conversor e metadados do livro permaneceram idênticos (118 arquivos conferidos por SHA-256), assim como as regras CSS das páginas. Evidências: analysis/customizer-validation.json e analysis/customizer-pronto.jpg.

## Preparação para GitHub Pages — 11/10/2026

- 126 arquivos públicos servidos com sucesso por HTTP na raiz e em `/portfolio-livro/`: 252 respostas com conteúdo idêntico aos arquivos e MIME correto.
- 38 páginas em ordem, 114 imagens com caminhos relativos e capitalização exata.
- `index.html` e `.nojekyll` na raiz de `dist`; personalizador ausente da hospedagem estática.
- Navegador: abertura, duas páginas no desktop, ampliação com imagens de 2400 px, Sobre/Contato, uma página em viewport pequeno (433 × 937 CSS px, override solicitado de 390 × 844), sem overflow horizontal, teclado End até a contracapa. Nenhum erro no console desse preview.
- Os 125 arquivos públicos previamente aprovados e os 118 arquivos protegidos mantêm os hashes anteriores. Tema JSON/CSS validado. Uma expectativa fixa do teste de fonte foi corrigida para testar sans-serif explicitamente sem depender do fallback escolhido pelo usuário.
- Workflow preparado para publicar somente `dist`, com verificação antes do envio. GitHub Actions ainda não executado remotamente; publicação não realizada.
- Relatório: `analysis/pages-validation.json`. Comandos reproduzíveis em `PUBLICACAO.md`.
