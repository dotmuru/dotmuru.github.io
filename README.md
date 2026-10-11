# Portfólio como livro — edição 2026

Protótipo estático, sem backend, preservando as páginas do PDF. Consulte ANALISE.md para a análise editorial.

## Estrutura
- dist/: site pronto para servir e, futuramente, publicar no GitHub Pages.
- dist/assets/2026/: páginas WebP, miniaturas e versões para ampliação.
- dist/vendor/: StPageFlip 2.0.7, distribuído localmente sob licença MIT.
- dist/book.json: sequência e rastreabilidade das 38 páginas.
- scripts/convert_pdf.py: conversor automático.
- scripts/serve.mjs: servidor estático de desenvolvimento.
- analysis/: contato visual e evidências de verificação (não publicar).

## Converter novamente
Requer Python 3.10 ou superior.

```powershell
python -m pip install -r scripts/requirements.txt
python scripts/convert_pdf.py "../PORTFÓLIO_2026_MURÍLIO GONCALVES.pdf"
```

Opções: --output, --width (1200), --zoom-width (2400). A conversão é retomável: reaproveita spreads concluídos quando a origem e as resoluções permanecem iguais; se o PDF muda, regenera as imagens. Cada imagem é salva primeiro em arquivo temporário para evitar saídas incompletas. Capa e contracapa ficam inteiras; cada spread é cortado exatamente no centro e lido da esquerda para a direita. O PDF original não é alterado. A renderização preserva o conteúdo e converte as cores em RGB para a web; compressão WebP e rasterização podem causar pequenas diferenças em relação ao vetor original. Para maior detalhe, aumente --zoom-width.

## Executar localmente
```powershell
node scripts/serve.mjs
```
Abra http://127.0.0.1:4173. Alternativa: python -m http.server 4173 --directory dist. Não abra index.html por file://, pois o navegador bloqueia o carregamento dos metadados.

## Controles
Clique na capa ou em Abrir o livro. Clique nas bordas, arraste os cantos, use as setas na tela ou ←/→ e PageUp/PageDown. Home abre a capa; End abre a contracapa. Z amplia a página/spread atual. No visor ampliado, use +/−, controle deslizante, arraste com mouse ou role/deslize no celular. Ctrl+roda ajusta a ampliação. F alterna tela cheia nos navegadores compatíveis. Esc fecha os diálogos. Índice oferece seções e miniaturas.

## Carregamento
Somente as páginas próximas recebem src inicialmente; vizinhas são antecipadas para evitar atrasos no folheamento. Arquivos de 2400 px são carregados somente quando a ampliação é aberta; miniaturas são carregadas ao solicitar todas as páginas. A biblioteca e todas as imagens ficam locais, sem CDN em tempo de execução.

## Publicação no GitHub Pages
Projeto preparado para publicação gratuita. Siga [PUBLICACAO.md](PUBLICACAO.md) para enviar o projeto completo com o workflow que publica somente `dist/`, ou somente os arquivos públicos na raiz de um repositório. Execute `npm run check:pages` para verificar e `npm run preview:pages` para testar em subdiretório. Os pacotes ficam em `release/`; regenere com `python scripts/package_pages.py`. Nenhuma publicação foi feita. Edição 2020 fora do escopo atual.

Limites: textos do PDF estão rasterizados e não são selecionáveis; a versão inicial prioriza fidelidade visual. Tela cheia depende do navegador, especialmente no iOS. O zoom alcança 300%, com imagem de 2400 px por página.

## Verificação do protótipo
Testado no Microsoft Edge em desktop (1440 × 1000) e viewports de celular (390 × 844 e 360 × 640). Sequência completa das 38 páginas verificada em ambos os modos; abertura, arraste com mouse, teclado, índice, miniaturas, ampliação e tela cheia verificados. Sem erros de JavaScript ou respostas HTTP malsucedidas durante esses testes. Capturas e resultados ficam em analysis/. O viewport compacto mostra a capa inteira. Testes de toque usam emulação de dispositivo, não um aparelho físico.

Também foram aprovados abertura por toque rápido, arraste para avançar/voltar no celular e clique direto na capa no desktop. Resumo completo em VALIDACAO.md.

## Personalizador visual local
Execute `npm run customize` nesta pasta e abra http://127.0.0.1:4180/customizer.html. O painel altera o preview sem recarregar o livro e salva diretamente `dist/theme.json` e `dist/theme.css`. Instruções completas em PERSONALIZACAO.md. Publique somente `dist/`; a ferramenta local não faz parte dos arquivos públicos.
