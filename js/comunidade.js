/**
 * comunidade.js — Área Comunidade
 * Por Trás das Engrenagens | FIRST Robotics
 * -------------------------------------------------------
 * Responsabilidades:
 *  - Formulário de publicação de histórias
 *  - Upload e preview de fotos (local)
 *  - Renderizar cards de histórias do LocalStorage
 *  - Validação de campos
 */

(function initComunidade() {

  /* ============================================================
     1. UPLOAD DE FOTOS
     ============================================================ */
  const uploadArea    = document.getElementById('photo-upload-area');
  const photoInput    = document.getElementById('photo-input');
  const previewGrid   = document.getElementById('photo-preview-grid');
  let uploadedPhotos  = []; // Array de { name, dataURL }

  if (uploadArea && photoInput) {
    // Clique na área abre o seletor
    uploadArea.addEventListener('click', () => photoInput.click());
    uploadArea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') photoInput.click();
    });

    // Drag & Drop
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = 'var(--primary)';
    });
    uploadArea.addEventListener('dragleave', () => {
      uploadArea.style.borderColor = '';
    });
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '';
      handleFiles(e.dataTransfer.files);
    });

    photoInput.addEventListener('change', () => handleFiles(photoInput.files));
  }

  function handleFiles(files) {
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast(`"${file.name}" é muito grande (máx. 5MB).`, 'warning');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataURL = e.target.result;
        uploadedPhotos.push({ name: file.name, dataURL });
        renderPhotoPreview(dataURL, uploadedPhotos.length - 1);
      };
      reader.readAsDataURL(file);
    });
  }

  function renderPhotoPreview(dataURL, index) {
    if (!previewGrid) return;
    const item = document.createElement('div');
    item.className = 'photo-preview-item';
    item.innerHTML = `
      <img src="${dataURL}" alt="Foto ${index + 1}" loading="lazy" />
      <button class="photo-remove" data-index="${index}" aria-label="Remover foto">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    item.querySelector('.photo-remove').addEventListener('click', () => {
      uploadedPhotos.splice(index, 1);
      item.remove();
    });
    previewGrid.appendChild(item);
  }

  /* ============================================================
     2. FORMULÁRIO DE HISTÓRIA
     ============================================================ */
  const formStory = document.getElementById('form-story');
  if (!formStory) return;

  function setFieldError(fieldId, errorId, show) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(errorId);
    if (field) field.classList.toggle('error', show);
    if (error) error.classList.toggle('show', show);
  }

  function validateStoryForm() {
    let valid = true;

    const nome = document.getElementById('s-nome')?.value.trim();
    setFieldError('s-nome', 'err-s-nome', !nome);
    if (!nome) valid = false;

    const equipe = document.getElementById('s-equipe')?.value.trim();
    setFieldError('s-equipe', 'err-s-equipe', !equipe);
    if (!equipe) valid = false;

    const cidade = document.getElementById('s-cidade')?.value.trim();
    setFieldError('s-cidade', 'err-s-cidade', !cidade);
    if (!cidade) valid = false;

    const texto = document.getElementById('s-texto')?.value.trim();
    setFieldError('s-texto', 'err-s-texto', !texto || texto.length < 20);
    if (!texto || texto.length < 20) valid = false;

    return valid;
  }

  // Limpa erros ao digitar
  formStory.querySelectorAll('.form-control').forEach((input) => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      const errId = input.id.replace('s-', 'err-s-');
      document.getElementById(errId)?.classList.remove('show');
    });
  });

  formStory.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStoryForm()) {
      showToast('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    const story = {
      id:        Date.now(),
      nome:      document.getElementById('s-nome').value.trim(),
      equipe:    document.getElementById('s-equipe').value.trim(),
      cidade:    document.getElementById('s-cidade').value.trim(),
      categoria: document.getElementById('s-categoria')?.value || '',
      texto:     document.getElementById('s-texto').value.trim(),
      foto:      uploadedPhotos.length > 0 ? uploadedPhotos[0].dataURL : null,
      data:      new Date().toISOString(),
    };

    // Salva no LocalStorage
    const stories = loadLS('ptde_stories') || [];
    stories.unshift(story); // mais recente primeiro
    saveLS('ptde_stories', stories);

    showToast('História publicada! Obrigado por compartilhar. 💙', 'success', 4000);

    // Reseta formulário
    formStory.reset();
    uploadedPhotos = [];
    if (previewGrid) previewGrid.innerHTML = '';

    // Re-renderiza os cards
    renderStories();
  });

  /* ============================================================
     3. RENDERIZAR CARDS DE HISTÓRIAS
     ============================================================ */
  function renderStories() {
    const grid  = document.getElementById('stories-grid');
    const empty = document.getElementById('stories-empty');
    if (!grid) return;

    const stories = loadLS('ptde_stories') || [];

    // Remove cards existentes (mantém o empty)
    grid.querySelectorAll('.story-card').forEach((c) => c.remove());

    if (stories.length === 0) {
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';

    stories.forEach((story) => {
      const card = document.createElement('article');
      card.className = 'story-card fade-in';

      const photoHTML = story.foto
        ? `<img src="${story.foto}" alt="Foto de ${story.nome}" loading="lazy" />`
        : `<i class="fa-solid fa-users no-photo"></i>`;

      const dateStr = story.data
        ? new Date(story.data).toLocaleDateString('pt-BR')
        : '';

      const categoryBadge = story.categoria
        ? `<span style="background:rgba(0,87,217,.1);color:var(--primary);padding:.2rem .6rem;border-radius:99px;font-size:.75rem;font-weight:700;">${story.categoria}</span>`
        : '';

      card.innerHTML = `
        <div class="story-card-photo">${photoHTML}</div>
        <div class="story-card-body">
          <div class="story-card-team">${story.equipe} ${categoryBadge}</div>
          <div class="story-card-name">${story.nome}</div>
          <p class="story-card-text">${story.texto.length > 150 ? story.texto.slice(0, 150) + '…' : story.texto}</p>
          <div class="story-card-meta">
            <i class="fa-solid fa-location-dot"></i>
            <span>${story.cidade}</span>
            ${dateStr ? `<span>· ${dateStr}</span>` : ''}
          </div>
        </div>
      `;

      grid.appendChild(card);
    });

    // Ativa animações nos novos cards
    requestAnimationFrame(() => {
      grid.querySelectorAll('.fade-in:not(.visible)').forEach((el) => {
        el.classList.add('visible');
      });
    });
  }

  // Carrega histórias ao iniciar
  renderStories();

})();
