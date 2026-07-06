/**
 * navigation.js — Menu Responsivo
 * Por Trás das Engrenagens | FIRST Robotics
 * -------------------------------------------------------
 * Responsabilidades:
 *  - Toggle do menu hambúrguer
 *  - Fechar menu ao clicar em link
 *  - Fechar menu ao clicar fora
 *  - Marcar link ativo conforme a página atual
 */

(function initNavigation() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  if (!hamburger || !navLinks) return;

  /* ---- Toggle do menu ---- */
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
  });

  /* ---- Fechar ao clicar em um link ---- */
  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---- Fechar ao clicar fora do menu ---- */
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---- Marcar link ativo conforme URL atual ---- */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.querySelectorAll('a').forEach((link) => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPath) {
      link.classList.add('active');
    }
  });
})();
