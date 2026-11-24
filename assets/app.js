(function () {
  "use strict";

  // ---- Configuração da lista de e-mails (Google Form "Lista do Arquivo Intelectual Brasileiro") ----
  var FORM = "https://docs.google.com/forms/d/e/1FAIpQLSepGNcGnKCZDG-iwx5NnpH1WcN5v-kynJzi0LeJxapdR3EeHg/formResponse";
  var CAMPOS = { nome: "entry.1981674827", email: "entry.2140110614", origem: "entry.2138080740" };
  var CHAVE = "aib_pop_visto";
  var ATRASO_MS = 15000;        // o popup abre após 15 segundos, ao rolar 50% da página, ou ao tentar sair (computador)
  var ROLAGEM_ABRIR = 0.5;      // fração da página rolada que dispara o popup
  var DIAS_SEM_REABRIR = 14;    // se fechar sem se cadastrar, só volta depois disso
  var CADASTRADO = 9999999999999;
  var CONSENT_VERSAO = "consent-v1"; // sobe a versão sempre que o texto de consentimento mudar

  window.dataLayer = window.dataLayer || [];
  function evento(nome, extra) {
    var e = { event: nome };
    for (var k in extra) e[k] = extra[k];
    window.dataLayer.push(e);
  }

  function lerVisto() { try { return parseInt(localStorage.getItem(CHAVE) || "0", 10); } catch (e) { return 0; } }
  function gravarVisto(v) { try { localStorage.setItem(CHAVE, String(v)); } catch (e) {} }

  // ---- Aviso de cookies (consentimento para a medição) ----
  var banner = document.getElementById("cookies");
  function lerCookies() { try { return localStorage.getItem("aib_cookies") || ""; } catch (e) { return ""; } }
  function aplicarCookies(v) {
    try { localStorage.setItem("aib_cookies", v); } catch (e) {}
    if (typeof gtag === "function") gtag("consent", "update", { analytics_storage: v === "aceito" ? "granted" : "denied" });
    evento("cookies_" + v, {});
    if (banner) banner.hidden = true;
  }
  if (banner) {
    if (!lerCookies()) banner.hidden = false;
    banner.querySelectorAll("[data-cookies]").forEach(function (b) {
      b.addEventListener("click", function () { aplicarCookies(b.getAttribute("data-cookies")); });
    });
    var prefs = document.getElementById("cookies-prefs");
    if (prefs) prefs.addEventListener("click", function () { banner.hidden = false; });
  }

  // ---- Medição de rolagem e tempo na página (enviada ao GTM) ----
  var marcos = [25, 50, 75, 90], marcosFeitos = {};
  window.addEventListener("scroll", function () {
    var alt = document.documentElement.scrollHeight - window.innerHeight;
    if (alt <= 0) return;
    var pct = (window.scrollY / alt) * 100;
    marcos.forEach(function (m) {
      if (pct >= m && !marcosFeitos[m]) { marcosFeitos[m] = true; evento("scroll_depth", { percent: m }); }
    });
  }, { passive: true });
  var segundosVisiveis = 0, tempos = [15, 30, 60, 120, 240];
  setInterval(function () {
    if (document.hidden) return;
    segundosVisiveis += 5;
    if (tempos.indexOf(segundosVisiveis) !== -1) evento("tempo_na_pagina", { segundos: segundosVisiveis });
  }, 5000);

  // ---- Revelar seções ao rolar ----
  var secoes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    secoes.forEach(function (s) { io.observe(s); });
  } else {
    secoes.forEach(function (s) { s.classList.add("on"); });
  }

  // ---- Barra fixa de compra no celular (aparece depois do topo) ----
  var sticky = document.getElementById("sticky");
  var hero = document.querySelector(".hero");
  if (sticky && hero) {
    var ajustar = function () {
      var mostrar = window.scrollY > hero.offsetHeight * 0.8;
      sticky.classList.toggle("on", mostrar);
      sticky.setAttribute("aria-hidden", mostrar ? "false" : "true");
      var l = sticky.querySelector("a"); if (l) l.tabIndex = mostrar ? 0 : -1;
    };
    window.addEventListener("scroll", ajustar, { passive: true });
    ajustar();
  }

  // ---- Cliques nos botões de compra (GTM) e supressão do popup ----
  var clicouCompra = false;
  document.querySelectorAll("[data-cta]").forEach(function (a) {
    a.addEventListener("click", function () {
      clicouCompra = true;
      evento("cta_click", { cta_local: a.getAttribute("data-cta") });
    });
  });

  // ---- Popup ----
  var fundo = document.getElementById("pop-fundo");
  var aberto = false;
  function abrirPopup() {
    if (!fundo || aberto || clicouCompra) return;
    var visto = lerVisto();
    if (visto === CADASTRADO) return;
    if (visto && Date.now() - visto < DIAS_SEM_REABRIR * 86400000) return;
    aberto = true;
    fundo.hidden = false;
    evento("popup_aberto", {});
    var campo = fundo.querySelector("input[type=email]"); if (campo) campo.focus();
  }
  function fecharPopup() {
    if (!fundo) return;
    fundo.hidden = true;
    if (lerVisto() !== CADASTRADO) gravarVisto(Date.now());
  }
  if (fundo) {
    fundo.querySelector(".pop-fechar").addEventListener("click", fecharPopup);
    fundo.addEventListener("click", function (e) { if (e.target === fundo) fecharPopup(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !fundo.hidden) fecharPopup(); });
    setTimeout(abrirPopup, ATRASO_MS);
    window.addEventListener("scroll", function onScroll() {
      var alt = document.documentElement.scrollHeight - window.innerHeight;
      if (alt > 0 && window.scrollY / alt >= ROLAGEM_ABRIR) {
        window.removeEventListener("scroll", onScroll);
        abrirPopup();
      }
    }, { passive: true });
    document.addEventListener("mouseout", function (e) { if (!e.relatedTarget && e.clientY <= 0) abrirPopup(); });
  }

  // ---- Envio dos formulários de e-mail (popup e rodapé) ----
  document.querySelectorAll("form.lead-form").forEach(function (form) {
    var erro = form.querySelector(".form-erro");
    var botao = form.querySelector("button[type=submit]");
    var ok = form.querySelector(".form-ok");
    function mostrarErro(msg) { erro.textContent = msg; erro.hidden = false; }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      erro.hidden = true;
      if (form.elements.site.value) return; // campo escondido preenchido: robô
      var email = form.elements.email.value.trim();
      if (!form.elements.consent.checked) { mostrarErro("Marque a caixa para concordar em receber os e-mails."); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { mostrarErro("Confira o e-mail digitado."); return; }
      botao.disabled = true;
      var origem = form.getAttribute("data-origem") || "landing";
      var d = new URLSearchParams();
      d.append(CAMPOS.nome, form.elements.nome.value.trim());
      d.append(CAMPOS.email, email);
      d.append(CAMPOS.origem, origem + "|" + CONSENT_VERSAO);
      fetch(FORM, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: d.toString() })
        .then(function () {
          gravarVisto(CADASTRADO);
          evento("lead", { lead_origem: origem });
          if (origem === "landing-popup") {
            document.getElementById("pop-form").hidden = true;
            document.getElementById("pop-ok").hidden = false;
            setTimeout(function () { if (fundo) fundo.hidden = true; }, 3500);
          } else {
            form.querySelectorAll("input,button").forEach(function (el) { el.hidden = true; });
            if (ok) ok.hidden = false;
          }
        })
        .catch(function () {
          botao.disabled = false;
          mostrarErro("Não consegui enviar agora. Tente novamente em instantes.");
        });
    });
  });
})();
