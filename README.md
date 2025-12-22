# Agnes Benites - Consultoria Jurídica Online

Site profissional para consultoria jurídica especializada em Contratos, Compliance e LGPD.

## 🎨 Paleta de Cores

- **Coral Suave**: #FF6F61 - Tom principal, vibrante e acolhedor
- **Azul-Marinho Profundo**: #002147 - Base sólida e elegante
- **Branco Gelo**: #F8F9FA - Contraste e leveza
- **Cinza Neutro**: #B0B3B8 - Tom intermediário
- **Dourado Claro**: #FFD580 - Detalhe de destaque

## 📋 Estrutura do Site

```
agnes-benites-site/
├── index.html          # Página principal
├── blog.html           # Página do blog (estrutura pronta)
├── styles.css          # Estilos principais
├── blog-styles.css     # Estilos específicos do blog
├── script.js           # Funcionalidades e animações
└── README.md           # Este arquivo
```

## 🚀 Como Hospedar no Netlify (GRATUITO)

### Opção 1: Arrastar e Soltar (Mais Fácil)

1. Acesse [Netlify](https://app.netlify.com/)
2. Crie uma conta gratuita (pode usar Google/GitHub)
3. Clique em "Add new site" → "Deploy manually"
4. Arraste a pasta `agnes-benites-site` completa
5. Pronto! Seu site estará no ar em segundos

### Opção 2: Via GitHub (Recomendado)

1. Crie uma conta no [GitHub](https://github.com)
2. Crie um novo repositório público
3. Faça upload dos arquivos do site
4. No Netlify, clique em "Add new site" → "Import from Git"
5. Conecte seu repositório do GitHub
6. Deploy automático!

## 🔧 Configurações Necessárias

### 1. Configurar Calendly

No arquivo `script.js`, linha 137, substitua:

```javascript
const YOUR_CALENDLY_URL = 'https://calendly.com/seu-usuario/consultoria-juridica';
```

Por seu link real do Calendly:

```javascript
const YOUR_CALENDLY_URL = 'https://calendly.com/agnesbenites/consultoria';
```

### 2. Configurar Domínio Personalizado (Opcional)

No Netlify:
1. Vá em "Domain settings"
2. Clique em "Add custom domain"
3. Digite seu domínio (ex: agnesbenites.com.br)
4. Siga as instruções para configurar DNS

### 3. Adicionar Links de Redes Sociais

No arquivo `index.html` e `blog.html`, procure por:

```html
<div class="footer__social">
    <a href="#" class="social-link" aria-label="LinkedIn">
```

E substitua `#` pelos seus links reais:

```html
<a href="https://linkedin.com/in/seu-perfil" class="social-link">
```

## 📱 Funcionalidades Implementadas

✅ Design responsivo (mobile, tablet, desktop)
✅ Animações suaves ao scroll
✅ Menu mobile funcional
✅ Botão WhatsApp flutuante
✅ Formulário de contato (via mailto)
✅ Botão "voltar ao topo"
✅ Integração com Calendly
✅ Estrutura de blog pronta
✅ SEO otimizado
✅ Performance otimizada

## 🎯 Seções do Site

1. **Hero** - Apresentação principal
2. **Serviços** - 4 cards com detalhes dos serviços
3. **Por que Online** - Estatísticas e benefícios
4. **Como Funciona** - Processo em 4 passos
5. **Diferenciais** - 6 cards com diferenciais
6. **Sobre** - Biografia e experiência
7. **Contato** - Formulário e informações
8. **Blog** - Estrutura pronta para artigos

## 📝 Como Adicionar Posts no Blog

Quando quiser publicar artigos:

1. Crie arquivos HTML para cada post (ex: `post-1.html`)
2. No arquivo `blog.html`, remova `style="display: none;"` da linha 109
3. Adicione cards de posts dentro da `.blog-grid`
4. Use a estrutura de exemplo já presente no código

## 🔐 Recursos de Privacidade

- Links para Tabela OAB SP
- Menção à LGPD
- Compromisso com confidencialidade
- Sistema de contato seguro

## 💡 Dicas de Uso

### Cores Personalizadas

Se quiser ajustar cores, edite o arquivo `styles.css` nas variáveis CSS (linhas 2-6):

```css
:root {
    --color-coral: #FF6F61;
    --color-navy: #002147;
    /* etc */
}
```

### Adicionar Fotos

1. Crie uma pasta `images` na raiz
2. Adicione suas fotos
3. No HTML, atualize os caminhos das imagens

### Google Analytics (Opcional)

Adicione antes do `</head>` em todos os HTMLs:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=SEU-ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'SEU-ID');
</script>
```

## 📊 Performance

- Fonts otimizadas (Google Fonts)
- CSS minificado para produção
- Imagens lazy-load prontas
- Animações CSS (sem JavaScript pesado)

## 🆘 Suporte

Se tiver dúvidas sobre o site:

1. Verifique este README
2. Consulte a documentação do Netlify
3. Entre em contato comigo pelo WhatsApp

## 📄 Licença

Site desenvolvido exclusivamente para Agnes Benites - Consultoria Jurídica.
Todos os direitos reservados © 2025.

---

**Desenvolvido com dedicação** 💼⚖️

Para atualizações ou modificações, basta editar os arquivos HTML/CSS/JS e fazer novo deploy no Netlify.
