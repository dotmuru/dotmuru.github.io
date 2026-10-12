# Personalização visual local

Na pasta portfolio-livro, execute:

```powershell
npm run customize
```

Requer Node.js 18 ou superior com npm. Nenhuma dependência npm precisa ser instalada. Alternativa: node scripts/customize.mjs.

- Painel: http://127.0.0.1:4180/customizer.html
- Portfólio com atualização ao vivo: http://127.0.0.1:4180/

O comando disponibiliza ambos os endereços; deixe o processo ativo enquanto personaliza. Ctrl+C encerra o servidor. Para escolher outra porta, defina CUSTOMIZER_PORT antes de iniciar.

## Como usar

Escolha as fontes pelo campo com sugestões ou digite o nome de uma família instalada. Escolha também a fallback (com serifa, sem serifa ou monoespaçada). Ajuste pesos e tamanho do nome no cabeçalho. Para cada cor, use o seletor ou o campo hexadecimal: ambos ficam sincronizados. Valores inválidos são indicados e não podem ser salvos.

Os botões Desktop e Celular mostram o livro inteiro em viewports de 1100 × 800 e 390 × 844, ajustados à área disponível. Os botões de salvamento permanecem visíveis enquanto você percorre os campos.

O preview e as abas abertas no endereço 4180 recebem o novo tema por SSE, sem recarregar o livro e sem perder a página atual. O tema em teste fica na memória do servidor. Ao clicar em Salvar alterações, o servidor grava dist/theme.json e gera dist/theme.css. O indicador informa quando há valores ainda não salvos; uma mensagem confirma a gravação.

Restaurar padrão aplica o tema editorial original ao preview. Clique depois em Salvar alterações para persistir a restauração. Se o servidor for encerrado antes de salvar, o site publicado continuará usando o último tema salvo.

## Arquivos

- theme/theme.defaults.json: padrão de restauração, separado das preferências salvas.
- dist/theme.json: fonte do tema final salvo.
- dist/theme.css: CSS gerado, carregado pelo portfólio e pelas páginas Sobre e Contato.
- dist/styles.css: layout da interface, usando as variáveis do tema.
- tools/customizer/: painel, estilos da ferramenta, sincronização do preview e validação/geração do tema.
- scripts/customize.mjs: servidor HTTP local e salvamento.
- scripts/verify-theme.mjs: verificação da geração, validação e isolamento dos arquivos públicos.

As imagens e o JavaScript do livro não são editados pelo personalizador. Não há download de fontes nem alteração da tipografia impressa dentro do PDF. Fontes manuais devem existir no dispositivo de quem visita; a fallback é aplicada quando necessário.

## Site público

Publique somente o conteúdo de dist/. Não publique tools/, theme/, scripts/ ou o arquivo package.json como raiz do site. O site público usa o CSS final salvo; não exige servidor Node, API, SSE ou painel. customizer.html e seus scripts estão fora de dist/, e o script de preview só é injetado em memória pelo servidor local. Não existe link para o personalizador no portfólio.

O servidor escuta somente 127.0.0.1, valida os valores e permite salvar apenas os dois arquivos do tema. Ele não disponibiliza gravação de caminhos arbitrários.

## Validação executada

Foram testados: fonte principal e secundária, tamanho/peso do cabeçalho, peso do texto, todas as 12 cores, sincronização seletor/hexadecimal, preview sem reinício do livro, bloqueio de cor inválida, gravação nos arquivos, carregamento do tema salvo pelo site estático, restauração e nova gravação. A restauração do padrão editorial foi verificada após os testes. Ajustes feitos por você no painel são preservados e só ficam definitivos ao clicar em Salvar alterações.
