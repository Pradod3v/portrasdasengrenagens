/**
 * form.js — Modal de Início de Jornada
 * Por Trás das Engrenagens | FIRST Robotics
 * -------------------------------------------------------
 * Responsabilidades:
 *  - Abrir/fechar o modal de cadastro
 *  - Validar todos os campos
 *  - Salvar dados no LocalStorage
 *  - Feedback visual de erros
 */

(function initJornadaForm() {
  /* ---- Elementos ---- */
  const modal       = document.getElementById('modal-jornada');
  const btnOpen1    = document.getElementById('btn-start-journey');
  const btnOpen2    = document.getElementById('btn-start-journey-2');
  const btnClose    = document.getElementById('modal-close');
  const form        = document.getElementById('form-jornada');

  if (!modal || !form) return;

  /* ---- Abrir modal ---- */
  function openModal() {
    // Se o usuário já cadastrou, redireciona direto para o livro
    const userData = loadLS('ptde_user');
    if (userData && userData.nome) {
      showToast(`Bem-vindo de volta, ${userData.nome}! 👋`, 'success');
      setTimeout(() => {
        window.location.href = 'pages/livro.html';
      }, 1200);
      return;
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Foca no primeiro campo
    setTimeout(() => {
      document.getElementById('j-nome')?.focus();
    }, 300);
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (btnOpen1) btnOpen1.addEventListener('click', openModal);
  if (btnOpen2) btnOpen2.addEventListener('click', openModal);
  if (btnClose) btnClose.addEventListener('click', closeModal);

  // Fechar ao clicar no overlay
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Fechar com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  /* ---- Validação ---- */
  function setError(fieldId, errorId, show) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (!field || !error) return;

    if (show) {
      field.classList.add('error');
      error.classList.add('show');
    } else {
      field.classList.remove('error');
      error.classList.remove('show');
    }
  }

  function validateForm() {
    let valid = true;

    // Nome
    const nome = document.getElementById('j-nome')?.value.trim();
    if (!nome || nome.length < 2) {
      setError('j-nome', 'err-nome', true);
      valid = false;
    } else {
      setError('j-nome', 'err-nome', false);
    }

    // Email
    const email = document.getElementById('j-email')?.value.trim();
    if (!email || !isValidEmail(email)) {
      setError('j-email', 'err-email', true);
      valid = false;
    } else {
      setError('j-email', 'err-email', false);
    }

    // Cidade
    const cidade = document.getElementById('j-cidade')?.value.trim();
    if (!cidade) {
      setError('j-cidade', 'err-cidade', true);
      valid = false;
    } else {
      setError('j-cidade', 'err-cidade', false);
    }

    // Estado
    const estado = document.getElementById('j-estado')?.value;
    if (!estado) {
      setError('j-estado', 'err-estado', true);
      valid = false;
    } else {
      setError('j-estado', 'err-estado', false);
    }

    // Perfil
    const perfil = document.getElementById('j-perfil')?.value;
    if (!perfil) {
      setError('j-perfil', 'err-perfil', true);
      valid = false;
    } else {
      setError('j-perfil', 'err-perfil', false);
    }

    // Conhecia a FIRST?
    const conhecia = form.querySelector('input[name="conhecia"]:checked');
    const errConhecia = document.getElementById('err-conhecia');
    if (!conhecia) {
      if (errConhecia) errConhecia.classList.add('show');
      valid = false;
    } else {
      if (errConhecia) errConhecia.classList.remove('show');
    }

    return valid;
  }

  /* ---- Limpar erro ao digitar ---- */
  form.querySelectorAll('.form-control').forEach((input) => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errId = input.id.replace('j-', 'err-');
      const errEl = document.getElementById(errId);
      if (errEl) errEl.classList.remove('show');
    });
  });

  /* ---- Submit ---- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    // Coleta os dados
    const userData = {
      nome:     document.getElementById('j-nome').value.trim(),
      email:    document.getElementById('j-email').value.trim(),
      cidade:   document.getElementById('j-cidade').value.trim(),
      estado:   document.getElementById('j-estado').value,
      perfil:   document.getElementById('j-perfil').value,
      conhecia: form.querySelector('input[name="conhecia"]:checked').value,
      dataInicio: new Date().toISOString(),
    };

    // Salva no LocalStorage
    saveLS('ptde_user', userData);

    // Feedback e redirecionamento
    closeModal();
    showToast(`Bem-vindo, ${userData.nome}! Sua jornada começou! 🚀`, 'success', 4000);

    setTimeout(() => {
      window.location.href = 'pages/livro.html';
    }, 1500);
  });
})();
