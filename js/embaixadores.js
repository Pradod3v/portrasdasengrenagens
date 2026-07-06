/**
 * embaixadores.js — Programa Embaixadores
 * Por Trás das Engrenagens | FIRST Robotics
 * -------------------------------------------------------
 * Responsabilidades:
 *  - Formulário de inscrição como embaixador
 *  - Formulário de registro de oficinas
 *  - Renderizar cards de oficinas do LocalStorage
 *  - Validação de campos
 */

(function initEmbaixadores() {

  /* ============================================================
     1. FORMULÁRIO DE INSCRIÇÃO COMO EMBAIXADOR
     ============================================================ */
  const formEmb = document.getElementById('form-emb');
  if (formEmb) {
    function setErr(fieldId, errId, show) {
      document.getElementById(fieldId)?.classList.toggle('error', show);
      document.getElementById(errId)?.classList.toggle('show', show);
    }

    function validateEmb() {
      let valid = true;
      const fields = [
        ['e-equipe',     'err-e-equipe'],
        ['e-categoria',  'err-e-categoria'],
        ['e-cidade',     'err-e-cidade'],
        ['e-estado',     'err-e-estado'],
        ['e-responsavel','err-e-responsavel'],
        ['e-email',      'err-e-email'],
      ];
      fields.forEach(([fid, eid]) => {
        const val = document.getElementById(fid)?.value.trim();
        const isEmpty = !val;
        setErr(fid, eid, isEmpty);
        if (isEmpty) valid = false;
      });

      // Validar email
      const emailVal = document.getElementById('e-email')?.value.trim();
      if (emailVal && !isValidEmail(emailVal)) {
        setErr('e-email', 'err-e-email', true);
        valid = false;
      }

      return valid;
    }

    // Limpa erros ao digitar
    formEmb.querySelectorAll('.form-control').forEach((input) => {
      input.addEventListener('input', () => {
        input.classList.remove('error');
        const errId = input.id.replace('e-', 'err-e-');
        document.getElementById(errId)?.classList.remove('show');
      });
    });

    formEmb.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateEmb()) {
        showToast('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      const embData = {
        id:          Date.now(),
        equipe:      document.getElementById('e-equipe').value.trim(),
        categoria:   document.getElementById('e-categoria').value,
        cidade:      document.getElementById('e-cidade').value.trim(),
        estado:      document.getElementById('e-estado').value,
        responsavel: document.getElementById('e-responsavel').value.trim(),
        email:       document.getElementById('e-email').value.trim(),
        data:        new Date().toISOString(),
      };

      // Salva no LocalStorage
      const embaixadores = loadLS('ptde_embaixadores') || [];
      embaixadores.push(embData);
      saveLS('ptde_embaixadores', embaixadores);

      showToast(`Inscrição da equipe ${embData.equipe} enviada! Em breve entraremos em contato. 🌟`, 'success', 5000);
      formEmb.reset();
    });
  }

  /* ============================================================
     2. FORMULÁRIO DE REGISTRO DE OFICINA
     ============================================================ */
  const formOficina = document.getElementById('form-oficina');
  if (formOficina) {
    function setErrO(fieldId, errId, show) {
      document.getElementById(fieldId)?.classList.toggle('error', show);
      document.getElementById(errId)?.classList.toggle('show', show);
    }

    function validateOficina() {
      let valid = true;
      const fields = [
        ['o-equipe',       'err-o-equipe'],
        ['o-participantes','err-o-participantes'],
        ['o-cidade',       'err-o-cidade'],
        ['o-estado',       'err-o-estado'],
      ];
      fields.forEach(([fid, eid]) => {
        const val = document.getElementById(fid)?.value.trim();
        setErrO(fid, eid, !val);
        if (!val) valid = false;
      });
      return valid;
    }

    formOficina.querySelectorAll('.form-control').forEach((input) => {
      input.addEventListener('input', () => {
        input.classList.remove('error');
        const errId = input.id.replace('o-', 'err-o-');
        document.getElementById(errId)?.classList.remove('show');
      });
    });

    formOficina.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateOficina()) {
        showToast('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      const oficina = {
        id:            Date.now(),
        equipe:        document.getElementById('o-equipe').value.trim(),
        participantes: parseInt(document.getElementById('o-participantes').value, 10),
        cidade:        document.getElementById('o-cidade').value.trim(),
        estado:        document.getElementById('o-estado').value,
        feedback:      document.getElementById('o-feedback')?.value.trim() || '',
        data:          new Date().toISOString(),
      };

      // Salva no LocalStorage
      const oficinas = loadLS('ptde_oficinas') || [];
      oficinas.unshift(oficina);
      saveLS('ptde_oficinas', oficinas);

      showToast('Oficina registrada com sucesso! 🎉', 'success', 4000);
      formOficina.reset();

      renderOficinas();

      // Atualiza o mapa (se disponível)
      if (typeof window.updateMap === 'function') {
        window.updateMap();
      }
    });
  }

  /* ============================================================
     3. RENDERIZAR CARDS DE OFICINAS
     ============================================================ */
  function renderOficinas() {
    const grid  = document.getElementById('oficinas-grid');
    const empty = document.getElementById('oficinas-empty');
    if (!grid) return;

    const oficinas = loadLS('ptde_oficinas') || [];
    grid.querySelectorAll('.oficina-card').forEach((c) => c.remove());

    if (oficinas.length === 0) {
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';

    oficinas.forEach((of) => {
      const card = document.createElement('article');
      card.className = 'oficina-card fade-in';

      const dateStr = of.data ? new Date(of.data).toLocaleDateString('pt-BR') : '';

      card.innerHTML = `
        <h4>${of.equipe}</h4>
        <div class="oficina-meta">
          <span><i class="fa-solid fa-location-dot"></i> ${of.cidade} — ${of.estado}</span>
          <span><i class="fa-solid fa-users"></i> ${of.participantes} participantes</span>
          ${dateStr ? `<span><i class="fa-regular fa-calendar"></i> ${dateStr}</span>` : ''}
        </div>
        ${of.feedback ? `<p class="oficina-feedback">"${of.feedback}"</p>` : ''}
      `;

      grid.appendChild(card);
    });

    // Ativa animações
    requestAnimationFrame(() => {
      grid.querySelectorAll('.fade-in:not(.visible)').forEach((el) => el.classList.add('visible'));
    });
  }

  // Carrega oficinas ao iniciar
  renderOficinas();

})();
