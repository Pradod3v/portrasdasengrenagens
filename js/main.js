/**
 * main.js — Funções Globais
 * Por Trás das Engrenagens | FIRST Robotics
 * -------------------------------------------------------
 * Responsabilidades:
 *  - Loading screen
 *  - Scroll suave e botão "voltar ao topo"
 *  - Navbar sticky
 *  - Intersection Observer (animações de entrada)
 *  - Contadores animados
 *  - Sistema de Toasts
 *  - Barra de progresso da jornada
 *  - Lazy loading de imagens
 */

/* ============================================================
   1. LOADING SCREEN
   ============================================================ */
(function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  // Esconde a tela de loading após o carregamento completo
  window.addEventListener('load', () => {
    setTimeout(() => {
      screen.classList.add('hidden');
    }, 1600); // tempo mínimo para a animação da barra completar
  });
})();


/* ============================================================
   2. NAVBAR — sticky + scroll
   ============================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
})();


/* ============================================================
   3. BOTÃO VOLTAR AO TOPO
   ============================================================ */
(function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   4. INTERSECTION OBSERVER — animações de entrada
   ============================================================ */
(function initAnimations() {
  const elements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // anima apenas uma vez
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => observer.observe(el));
})();


/* ============================================================
   5. CONTADORES ANIMADOS
   ============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.impact-number[data-target]');
  if (!counters.length) return;

  const animateCounter = (el) => {
    const target  = parseInt(el.dataset.target, 10);
    const suffix  = el.dataset.suffix  || '';
    const text    = el.dataset.text    || '';   // substitui o número por texto (ex: "Brasil")
    const duration = 1800; // ms
    const steps    = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      el.textContent = text && current === target ? text : current + suffix;

      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((el) => observer.observe(el));
})();


/* ============================================================
   6. SISTEMA DE TOASTS
   ============================================================ */

/**
 * Exibe uma notificação toast.
 * @param {string} message  — Texto da mensagem
 * @param {'success'|'error'|'warning'|''} type — Tipo visual
 * @param {number} duration — Duração em ms (padrão 3500)
 */
function showToast(message, type = '', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: 'fa-circle-check',
    error:   'fa-circle-xmark',
    warning: 'fa-triangle-exclamation',
    '':      'fa-bell',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `<i class="fa-solid ${icons[type] || icons['']}"></i> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

// Expõe globalmente
window.showToast = showToast;


/* ============================================================
   7. BARRA DE PROGRESSO DA JORNADA (scroll da página)
   ============================================================ */
(function initJourneyProgress() {
  const fill = document.getElementById('journey-fill');
  if (!fill) return;

  window.addEventListener('scroll', () => {
    const scrollTop    = window.scrollY;
    const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
    const percent      = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    fill.style.width   = percent.toFixed(1) + '%';
  }, { passive: true });
})();


/* ============================================================
   8. LAZY LOADING DE IMAGENS
   ============================================================ */
(function initLazyLoad() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach((img) => observer.observe(img));
})();


/* ============================================================
   9. UTILITÁRIOS COMPARTILHADOS
   ============================================================ */

/**
 * Valida um endereço de e-mail.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Formata uma data no padrão brasileiro.
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateBR(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Salva um objeto no LocalStorage.
 * @param {string} key
 * @param {*} value
 */
function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('LocalStorage indisponível:', e);
  }
}

/**
 * Lê um objeto do LocalStorage.
 * @param {string} key
 * @returns {*|null}
 */
function loadLS(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

// Expõe utilitários globalmente
window.isValidEmail = isValidEmail;
window.formatDateBR = formatDateBR;
window.saveLS       = saveLS;
window.loadLS       = loadLS;
