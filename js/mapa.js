/**
 * mapa.js — Mapa Interativo do Brasil
 * Por Trás das Engrenagens | FIRST Robotics
 * -------------------------------------------------------
 * Responsabilidades:
 *  - Colorir estados que possuem oficinas registradas
 *  - Tooltip ao passar o mouse sobre o estado
 *  - Clique no estado exibe detalhes das oficinas
 *  - Estrutura preparada para receber dados via JSON ou API
 */

(function initMapa() {

  const map     = document.getElementById('brazil-map');
  const tooltip = document.getElementById('map-tooltip');
  if (!map) return;

  /* ============================================================
     CARREGAR DADOS
     Estrutura preparada para futura integração com JSON/API.
     Por enquanto, lê do LocalStorage.
     ============================================================ */
  function getOficinasData() {
    const oficinas = loadLS('ptde_oficinas') || [];

    // Agrupa por estado
    const byState = {};
    oficinas.forEach((of) => {
      const uf = of.estado;
      if (!byState[uf]) {
        byState[uf] = {
          estado: uf,
          oficinas: [],
          totalParticipantes: 0,
        };
      }
      byState[uf].oficinas.push(of);
      byState[uf].totalParticipantes += of.participantes || 0;
    });

    return byState;
  }

  /* ============================================================
     ATUALIZAR MAPA
     Exposto globalmente para ser chamado após novo registro.
     ============================================================ */
  function updateMap() {
    const data   = getOficinasData();
    const states = map.querySelectorAll('.state');

    states.forEach((state) => {
      const uf = state.dataset.state;
      if (data[uf]) {
        state.classList.add('has-data');
        state.setAttribute('aria-label', `${state.dataset.name} — ${data[uf].oficinas.length} oficina(s)`);
      } else {
        state.classList.remove('has-data');
        state.setAttribute('aria-label', state.dataset.name);
      }
    });
  }

  window.updateMap = updateMap;
  updateMap(); // Executa ao carregar

  /* ============================================================
     TOOLTIP
     ============================================================ */
  function showTooltip(state, x, y) {
    if (!tooltip) return;
    const data    = getOficinasData();
    const uf      = state.dataset.state;
    const name    = state.dataset.name;
    const stateData = data[uf];

    if (stateData) {
      tooltip.innerHTML = `
        <h4>${name} (${uf})</h4>
        <p><i class="fa-solid fa-chalkboard-teacher"></i> ${stateData.oficinas.length} oficina(s)</p>
        <p><i class="fa-solid fa-users"></i> ${stateData.totalParticipantes} participantes</p>
        <p style="margin-top:.25rem;font-size:.75rem;opacity:.7;">Clique para ver detalhes</p>
      `;
    } else {
      tooltip.innerHTML = `
        <h4>${name} (${uf})</h4>
        <p style="opacity:.7;">Nenhuma oficina registrada</p>
      `;
    }

    tooltip.style.left = (x + 16) + 'px';
    tooltip.style.top  = (y - 10) + 'px';
    tooltip.classList.add('visible');
    tooltip.setAttribute('aria-hidden', 'false');
  }

  function hideTooltip() {
    if (!tooltip) return;
    tooltip.classList.remove('visible');
    tooltip.setAttribute('aria-hidden', 'true');
  }

  /* ============================================================
     EVENTOS DOS ESTADOS
     ============================================================ */
  map.querySelectorAll('.state').forEach((state) => {
    // Mouse enter — mostra tooltip
    state.addEventListener('mouseenter', (e) => {
      showTooltip(state, e.clientX, e.clientY);
    });

    // Mouse move — acompanha o cursor
    state.addEventListener('mousemove', (e) => {
      if (!tooltip) return;
      tooltip.style.left = (e.clientX + 16) + 'px';
      tooltip.style.top  = (e.clientY - 10) + 'px';
    });

    // Mouse leave — esconde tooltip
    state.addEventListener('mouseleave', hideTooltip);

    // Clique — exibe detalhes em toast
    state.addEventListener('click', () => {
      const data      = getOficinasData();
      const uf        = state.dataset.state;
      const name      = state.dataset.name;
      const stateData = data[uf];

      if (stateData) {
        const equipes = stateData.oficinas.map((o) => o.equipe).join(', ');
        showToast(
          `${name}: ${stateData.oficinas.length} oficina(s) — ${stateData.totalParticipantes} participantes (${equipes})`,
          'success',
          5000
        );
      } else {
        showToast(`${name}: Nenhuma oficina registrada ainda.`, '', 3000);
      }
    });

    // Teclado
    state.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        state.dispatchEvent(new MouseEvent('click'));
      }
    });
    state.setAttribute('tabindex', '0');
    state.setAttribute('role', 'button');
  });

  /* ============================================================
     FUTURA INTEGRAÇÃO COM JSON/API
     Descomente e adapte conforme necessário:

     async function loadDataFromAPI() {
       try {
         const response = await fetch('/api/oficinas');
         const json = await response.json();
         // Processar json e atualizar o mapa
         updateMapWithData(json);
       } catch (err) {
         console.warn('API indisponível, usando LocalStorage.');
         updateMap();
       }
     }
     loadDataFromAPI();
     ============================================================ */

})();
