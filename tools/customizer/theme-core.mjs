export const fontChoices=['Arial','Helvetica','Georgia','Times New Roman','Verdana','Tahoma','Trebuchet MS','Segoe UI','Garamond','Palatino Linotype','Courier New','system-ui'];
export const fields=[
 {key:'fontPrimary',label:'Fonte principal',type:'font',group:'Tipografia'},
 {key:'fontPrimaryFallback',label:'Fallback da fonte principal',type:'fallback',group:'Tipografia'},
 {key:'fontSecondary',label:'Fonte secundária',type:'font',group:'Tipografia'},
 {key:'fontSecondaryFallback',label:'Fallback da fonte secundária',type:'fallback',group:'Tipografia'},
 {key:'fontWeight',label:'Peso da fonte principal',type:'weight',group:'Tipografia'},
 {key:'fontSecondaryWeight',label:'Peso da fonte secundária',type:'weight',group:'Tipografia'},
 {key:'headerFontSize',label:'Tamanho do nome no cabeçalho',type:'size',group:'Tipografia'},
 {key:'headerFontWeight',label:'Peso do nome no cabeçalho',type:'weight',group:'Tipografia'},
 {key:'colorBackground',label:'Fundo geral',type:'color',group:'Cores'},
 {key:'colorText',label:'Texto principal',type:'color',group:'Cores'},
 {key:'colorMuted',label:'Texto secundário',type:'color',group:'Cores'},
 {key:'colorHeader',label:'Nome no cabeçalho',type:'color',group:'Cores'},
 {key:'colorNavigation',label:'Links do cabeçalho',type:'color',group:'Cores'},
 {key:'colorControls',label:'Controles do livro',type:'color',group:'Cores'},
 {key:'colorControlBackground',label:'Fundo dos controles',type:'color',group:'Cores'},
 {key:'colorBorder',label:'Bordas e linhas',type:'color',group:'Cores'},
 {key:'colorPanelBackground',label:'Fundo dos painéis do leitor',type:'color',group:'Cores'},
 {key:'colorZoomBackground',label:'Fundo da ampliação',type:'color',group:'Cores'},
 {key:'colorFocus',label:'Contorno de foco e slider',type:'color',group:'Cores'},
 {key:'colorShadow',label:'Sombras dos painéis',type:'color',group:'Cores'}
];
const keys=['version',...fields.map(f=>f.key)];
export function validateTheme(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length!==keys.length||Object.keys(input).some(k=>!keys.includes(k))||input.version!==1)throw Error('Estrutura de tema inválida.');
 const theme={version:1};
 for(const f of fields){const value=input[f.key];
  if(f.type==='color'){if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw Error(f.label+': informe um hexadecimal de seis dígitos.');theme[f.key]=value.toLowerCase();}
  if(f.type==='font'){if(typeof value!=='string'||value.length>80||!value.trim()||!/^[\p{L}\p{N} .'-]+$/u.test(value))throw Error(f.label+': informe somente o nome da família tipográfica.');theme[f.key]=value.trim();}
  if(f.type==='fallback'){if(!['sans-serif','serif','monospace'].includes(value))throw Error('Fallback inválida.');theme[f.key]=value;}
  if(f.type==='weight'){if(![300,400,500,600,700,800].includes(value))throw Error('Peso de fonte inválido.');theme[f.key]=value;}
  if(f.type==='size'){if(!Number.isInteger(value)||value<12||value>28)throw Error('Tamanho do cabeçalho deve ficar entre 12 e 28 px.');theme[f.key]=value;}
 }
 return theme;
}
const colorNames={colorBackground:'background',colorText:'text',colorMuted:'muted',colorHeader:'header',colorNavigation:'navigation',colorControls:'controls',colorControlBackground:'control-background',colorBorder:'border',colorPanelBackground:'panel-background',colorZoomBackground:'zoom-background',colorFocus:'focus',colorShadow:'shadow'};
export function toCSS(input){const t=validateTheme(input);const css=['/* Tema salvo pelo personalizador local. Fonte: theme.json. */',':root {',
 '  --font-primary: '+(['system-ui','serif','sans-serif','monospace'].includes(t.fontPrimary)?t.fontPrimary:JSON.stringify(t.fontPrimary))+', '+t.fontPrimaryFallback+';',
 '  --font-secondary: '+(['system-ui','serif','sans-serif','monospace'].includes(t.fontSecondary)?t.fontSecondary:JSON.stringify(t.fontSecondary))+', '+t.fontSecondaryFallback+';',
 '  --font-primary-weight: '+t.fontWeight+';',
 '  --font-secondary-weight: '+t.fontSecondaryWeight+';',
 '  --header-font-size: '+t.headerFontSize+'px;',
 '  --header-font-weight: '+t.headerFontWeight+';'];
 for(const [key,name] of Object.entries(colorNames))css.push('  --color-'+name+': '+t[key]+';');css.push('}','');return css.join('\n');}
