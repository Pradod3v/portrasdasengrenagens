/**
 * livro.js — Página do Livro Digital
 * Por Trás das Engrenagens | FIRST Robotics
 * -------------------------------------------------------
 * Responsabilidades:
 *  - Verificar e carregar o PDF no iframe
 *  - Índice navegável (clique → abre página do PDF)
 *  - Barra de progresso de leitura (simulada por scroll)
 *  - Botão "Finalizar Leitura"
 *  - Formulário de avaliação pós-leitura com estrelas
 *  - Salvar progresso e avaliação no LocalStorage
 */

(function initLivro() {

  /* ============================================================
     1. VERIFICAR SE O PDF EXISTE E CARREGAR
     ============================================================ */
  const pdfPath    = '../assets/pdf/livro.pdf';
  const iframe     = document.getElementById('pdf-iframe');
  const placeholder = document.getElementById('pdf-placeholder');

  // Tenta carregar o PDF; se falhar, mantém o placeholder
  if (iframe) {
    fetch(pdfPath, { method: 'HEAD' })
      .then((res) => {
        if (res.ok) {
          iframe.src = pdfPath + '#page=1';
          iframe.style.display = 'block';
          if (placeholder) placeholder.style.display = 'none';
        }
      })
      .catch(() => {
        // PDF não encontrado — placeholder já visível
      });
  }

  /* ============================================================
     2. ÍNDICE NAVEGÁVEL
     ============================================================ */
  const chapterItems = document.querySelectorAll('.chapter-item');

  chapterItems.forEach((item) => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;

      // Atualiza classe ativa
      chapterItems.forEach((i) => i.classList.remove('active'));
      item.classList.add('active');

      // Navega para a página no PDF (se o iframe estiver carregado)
      if (iframe && iframe.src && iframe.src !== '') {
        const baseUrl = pdfPath;
        iframe.src = `${baseUrl}#page=${page}`;
      }

      // Atualiza progresso simulado baseado no capítulo
      const totalChapters = chapterItems.length;
      const index = Array.from(chapterItems).indexOf(item) + 1;
      const percent = Math.round((index / totalChapters) * 100);
      updateProgress(percent);
    });

    // Suporte a teclado (Enter/Space)
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  /* ============================================================
     3. BARRA DE PROGRESSO DE LEITURA (baseada no scroll)
     ============================================================ */
  const readingFill   = document.getElementById('reading-fill');
  const sidebarFill   = document.getElementById('sidebar-progress-fill');
  const readingPercent = document.getElementById('reading-percent');
  const sidebarPercent = document.getElementById('sidebar-percent');

  function updateProgress(percent) {
    const p = Math.min(100, Math.max(0, percent));
    if (readingFill)    readingFill.style.width    = p + '%';
    if (sidebarFill)    sidebarFill.style.width    = p + '%';
    if (readingPercent) readingPercent.textContent = p + '% lido';
    if (sidebarPercent) sidebarPercent.textContent = p + '%';

    // Salva progresso
    saveLS('ptde_reading_progress', p);
  }

  // Restaura progresso salvo
  const savedProgress = loadLS('ptde_reading_progress') || 0;
  updateProgress(savedProgress);

  // Atualiza progresso conforme o scroll da página
  window.addEventListener('scroll', () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const percent    = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
    updateProgress(percent);
  }, { passive: true });

  /* ============================================================
     4. BOTÃO "FINALIZAR LEITURA"
     ============================================================ */
  const btnFinish    = document.getElementById('btn-finish-reading');
  const avalSection  = document.getElementById('avaliacao');

  if (btnFinish) {
    btnFinish.addEventListener('click', () => {
      // Marca como lido
      updateProgress(100);
      saveLS('ptde_book_finished', true);

      // Exibe seção de avaliação
      if (avalSection) {
        avalSection.style.display = 'block';
        avalSection.scrollIntoView({ behavior: 'smooth' });
      }

      showToast('Parabéns por concluir a leitura! 🎉', 'success', 4000);
    });
  }

  /* ============================================================
     5. AVALIAÇÃO POR ESTRELAS
     ============================================================ */
  const starBtns   = document.querySelectorAll('.star-btn');
  const starsInput = document.getElementById('aval-stars');

  starBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const value = parseInt(btn.dataset.star, 10);
      if (starsInput) starsInput.value = value;

      // Atualiza visual das estrelas
      starBtns.forEach((s, i) => {
        s.classList.toggle('active', i < value);
      });
    });

    // Hover preview
    btn.addEventListener('mouseenter', () => {
      const value = parseInt(btn.dataset.star, 10);
      starBtns.forEach((s, i) => {
        s.style.color = i < value ? '#F59E0B' : '';
      });
    });

    btn.addEventListener('mouseleave', () => {
      const current = parseInt(starsInput?.value || 0, 10);
      starBtns.forEach((s, i) => {
        s.style.color = '';
        s.classList.toggle('active', i < current);
      });
    });
  });

  /* ============================================================
     6. FORMULÁRIO DE AVALIAÇÃO
     ============================================================ */
  const formAval = document.getElementById('form-avaliacao');
  if (!formAval) return;

  formAval.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    // Validar estrelas
    const stars = parseInt(starsInput?.value || 0, 10);
    const errStars = document.getElementById('err-stars');
    if (stars === 0) {
      if (errStars) errStars.classList.add('show');
      valid = false;
    } else {
      if (errStars) errStars.classList.remove('show');
    }

    // Validar "ajudou"
    const ajudou = formAval.querySelector('input[name="ajudou"]:checked');
    const errAjudou = document.getElementById('err-ajudou');
    if (!ajudou) {
      if (errAjudou) errAjudou.classList.add('show');
      valid = false;
    } else {
      if (errAjudou) errAjudou.classList.remove('show');
    }

    // Validar "indicaria"
    const indicaria = formAval.querySelector('input[name="indicaria"]:checked');
    const errIndicaria = document.getElementById('err-indicaria');
    if (!indicaria) {
      if (errIndicaria) errIndicaria.classList.add('show');
      valid = false;
    } else {
      if (errIndicaria) errIndicaria.classList.remove('show');
    }

    if (!valid) {
      showToast('Preencha os campos obrigatórios da avaliação.', 'error');
      return;
    }

    // Salva avaliação
    const avalData = {
      stars:     stars,
      ajudou:    ajudou.value,
      capitulo:  document.getElementById('aval-capitulo')?.value.trim(),
      falta:     document.getElementById('aval-falta')?.value.trim(),
      indicaria: indicaria.value,
      data:      new Date().toISOString(),
    };
    saveLS('ptde_book_review', avalData);

    showToast('Avaliação enviada! Obrigado pelo feedback. 💙', 'success', 4000);

    // Desabilita o formulário
    formAval.querySelectorAll('input, textarea, button').forEach((el) => {
      el.disabled = true;
    });

    // Botão para ir ao quiz
    const goQuiz = document.createElement('a');
    goQuiz.href = 'quiz.html';
    goQuiz.className = 'btn btn-primary mt-3';
    goQuiz.innerHTML = '<i class="fa-solid fa-question-circle"></i> Fazer o Quiz Agora';
    formAval.appendChild(goQuiz);
  });

})();
