# Arquivo Intelectual Brasileiro: site

Landing page do Acervo Filosófico Mário Ferreira, hospedada no GitHub Pages.

## Estrutura
- `index.html`: landing page principal (copy, SEO, GTM, popup e formulário de e-mail).
- `assets/style.css`, `assets/app.js`: estilo e comportamento (popup, barra fixa, envio da lista de e-mails, eventos para o GTM).
- `assets/img/`: imagens otimizadas (hero, logo, favicon, imagem de compartilhamento).
- `404.html`, `robots.txt`, `sitemap.xml`.

## Páginas mantidas (URLs que podem estar em uso)
- `bruno/`: página do Acervo Bruno Tolentino.
- `lp-news/lp-news.html`: página de oferta especial.
- `backup-combo.html`: página do Super Combo.
- `backup/index.html`: página da Formação Básica.
- `mediakit.html`: media kit.

## Rastreio
Todos os botões de compra usam `sck=landing`. Os cliques e os cadastros são enviados ao GTM (`cta_click`, `popup_aberto`, `lead`).

## Lista de e-mails
O popup e o formulário do rodapé gravam no Google Form "Lista do Arquivo Intelectual Brasileiro" (campo Origem: `landing-popup` ou `landing-rodape`). Os IDs ficam no topo de `assets/app.js`.
