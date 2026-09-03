# Bovary Club Society — Website

Site oficial da crew **Bovary Club Society** (GTA Online Legacy & FiveM).

Tema escuro cyberpunk — mural informativo + páginas de meets.

## Páginas

- `index.html` — home (mural)
- `meets-legacy.html` — detalhes Legacy Meets
- `meets-fivem.html` — detalhes FiveM Meets
- `videos.html` — vídeos de meets

## Seções (home)

- Hero, Legacy/FiveM preview, Hosts, Crews, Meetings Held, Timezones, About, Rules, CTA

## Como adicionar fotos no mural (Meetings Held)

1. Faça upload da foto no [Imgur](https://imgur.com)
2. Copie o endereço direto da imagem (ex: `https://i.imgur.com/xxxxx.jpeg`)
3. Abra `index.html` e localize a seção **Meetings Held** (procure por `meetings-gallery`)
4. Cole um novo bloco de card, seguindo o padrão dos existentes:

```html
<a href="https://i.imgur.com/SEUCODIGO.jpeg" target="_blank" rel="noopener" class="meeting-card">
  <div class="meeting-card-inner">
    <img src="https://i.imgur.com/SEUCODIGO.jpeg" alt="Meeting held" loading="lazy" />
    <div class="meeting-card-glow"></div>
  </div>
</a>
```

5. Salve e faça o deploy

Assim a foto fica pública para todos os visitantes.

## Hospedar no GitHub Pages

### 1. Criar o repositório
1. Acesse [github.com/new](https://github.com/new)
2. Nome sugerido: `bovary-club` (ou o que preferir)
3. Deixe **público**
4. **Não** marque "Add a README" (já temos um)
5. Clique em **Create repository**

### 2. Enviar os arquivos

**Opção A — Pelo site do GitHub (mais fácil)**
1. No repositório vazio, clique em **uploading an existing file**
2. Arraste **todos** os arquivos desta pasta (index.html, styles.css, script.js, etc.)
3. Commit message: `Initial site`
4. Clique em **Commit changes**

**Opção B — Pelo Git (terminal)**
```bash
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/bovary-club.git
git push -u origin main
```

### 3. Ativar o GitHub Pages
1. No repositório → **Settings** → **Pages** (menu lateral)
2. Em **Source**, escolha:
   - Branch: `main`
   - Folder: `/ (root)`
3. Clique em **Save**
4. Aguarde 1–2 minutos
5. O site ficará em:  
   `https://SEU-USUARIO.github.io/bovary-club/`

### 4. Atualizar o site depois
1. Edite o arquivo no GitHub (ou localmente e faça push)
2. Commit → o Pages atualiza sozinho em alguns segundos/minutos

## Stack

HTML + CSS + JS puro · Orbitron + Inter

## Segurança (site estático)

Práticas obrigatórias:

| Ação | Prioridade |
|------|------------|
| Só quem tem acesso ao GitHub edita o site | Alta |
| Não recolocar admin/senha no front-end | Alta |
| Não colocar tokens, webhooks ou senhas no repositório | Alta |
| Manter commits só de gente de confiança | Alta |
| Revisar links externos de tempos em tempos | Média |
| Configurar headers de segurança no host, se possível | Média |

Já aplicado no código:

- Sem painel admin / autenticação client-side
- Sem `onerror` inline (fallback via `script.js`)
- `videos.html` sem `innerHTML` com concatenação
- Meta **Content-Security-Policy**, `X-Content-Type-Options: nosniff` e referrer policy em todas as páginas
- Links externos com `rel="noopener"`

### Headers no host (opcional)

GitHub Pages não permite headers HTTP customizados nativamente. Se no futuro usar Cloudflare / Netlify / Vercel, configure:

```
Content-Security-Policy: (mesma política das metas no HTML)
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

## Imagens (Imgur + ImageKit)

O site aceita fotos hospedadas em:
- `https://i.imgur.com/...`
- `https://ik.imagekit.io/...` (ImageKit)

Use sempre o **link direto** do arquivo de imagem (`.jpg`, `.png`, `.webp`).
