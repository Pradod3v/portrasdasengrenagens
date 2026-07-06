/**
 * quiz.js — Quiz "Conhecendo a FIRST"
 * Por Trás das Engrenagens | FIRST Robotics
 * -------------------------------------------------------
 * Responsabilidades:
 *  - Banco de 10 perguntas com alternativas
 *  - Barra de progresso
 *  - Animações entre perguntas
 *  - Cálculo automático da nota
 *  - Animação de confetes para notas altas
 *  - Salvar resultado no LocalStorage
 */

/* ============================================================
   BANCO DE PERGUNTAS
   Altere os textos, alternativas e índice da resposta correta
   (correctIndex — 0 = primeira opção)
   ============================================================ */
const QUESTIONS = [
  {
    text: 'O que significa a sigla FIRST?',
    options: [
      'For Inspiration and Recognition of Science and Technology',
      'Foundation for International Robotics Science and Technology',
      'Future Innovations in Robotics, Science and Technology',
      'Federation for Inspiring Robotics, Science and Technology',
    ],
    correctIndex: 0,
    explanation: 'FIRST significa "For Inspiration and Recognition of Science and Technology".',
  },
  {
    text: 'Quantas categorias de competição a FIRST possui atualmente?',
    options: ['2', '3', '4', '5'],
    correctIndex: 2,
    explanation: 'A FIRST possui 4 categorias: FLL Jr., FLL, FTC e FRC.',
  },
  {
    text: 'Qual dos seguintes valores NÃO pertence à filosofia da FIRST?',
    options: [
      'Gracious Professionalism',
      'Coopetition',
      'Competição agressiva',
      'Inovação',
    ],
    correctIndex: 2,
    explanation: 'A FIRST valoriza Gracious Professionalism, Coopetition e Inovação. "Competição agressiva" vai contra seus valores.',
  },
  {
    text: 'O que é "Gracious Professionalism"?',
    options: [
      'Uma técnica de programação de robôs',
      'Um valor que combina excelência técnica com respeito e gentileza',
      'O nome de um troféu da FRC',
      'Uma categoria especial da FIRST',
    ],
    correctIndex: 1,
    explanation: 'Gracious Professionalism é um valor central da FIRST que une excelência técnica com respeito, gentileza e trabalho em equipe.',
  },
  {
    text: 'Qual categoria da FIRST utiliza peças de LEGO para construir os robôs?',
    options: ['FRC', 'FTC', 'FLL', 'FLL Jr.'],
    correctIndex: 2,
    explanation: 'A FLL (FIRST LEGO League) utiliza o kit LEGO MINDSTORMS/SPIKE para construção dos robôs.',
  },
  {
    text: 'Qual categoria da FIRST utiliza robôs maiores, de tamanho industrial?',
    options: ['FLL Jr.', 'FLL', 'FTC', 'FRC'],
    correctIndex: 3,
    explanation: 'A FRC (FIRST Robotics Competition) utiliza robôs de grande porte, com até 125 kg.',
  },
  {
    text: 'Qual é a missão principal da FIRST?',
    options: [
      'Vencer competições internacionais de robótica',
      'Inspirar jovens a se tornarem líderes em ciência e tecnologia',
      'Desenvolver robôs para uso industrial',
      'Promover competições esportivas com robôs',
    ],
    correctIndex: 1,
    explanation: 'A missão da FIRST é inspirar jovens a serem líderes em ciência, tecnologia, engenharia e matemática.',
  },
  {
    text: 'A equipe BrontoByte compete em qual categoria da FIRST?',
    options: ['FLL Jr.', 'FLL', 'FTC', 'FRC'],
    correctIndex: 2,
    explanation: 'A BrontoByte é uma equipe de FTC (FIRST Tech Challenge).',
  },
  {
    text: 'O livro "Por Trás das Engrenagens" foi escrito por:',
    options: [
      'Apenas pela equipe BrontoByte',
      'Pela BrontoByte em parceria com equipes brasileiras',
      'Pela organização FIRST Brasil',
      'Por professores universitários',
    ],
    correctIndex: 1,
    explanation: 'O livro foi escrito pela equipe BrontoByte em colaboração com outras equipes brasileiras.',
  },
  {
    text: 'Depois de conhecer a FIRST, você gostaria de participar?',
    options: ['Sim, com certeza!', 'Talvez, quero saber mais', 'Ainda não sei', 'Não por enquanto'],
    correctIndex: -1, // Pergunta subjetiva — todas as respostas são válidas
    explanation: 'Essa é uma pergunta pessoal! Qualquer resposta é válida. 😊',
  },
];

/* ============================================================
   ESTADO DO QUIZ
   ============================================================ */
let currentQuestion = 0;
let score = 0;
let answered = false;
const userAnswers = [];

/* ============================================================
   ELEMENTOS DO DOM
   ============================================================ */
const questionArea    = document.getElementById('question-area');
const progressFill    = document.getElementById('quiz-progress-fill');
const progressCurrent = document.getElementById('q-current');
const scoreLive       = document.getElementById('q-score-live');
const progressWrap    = document.getElementById('quiz-progress-wrap');

/* ============================================================
   RENDERIZAR PERGUNTA
   ============================================================ */
function renderQuestion(index) {
  if (!questionArea) return;
  answered = false;

  const q = QUESTIONS[index];
  const total = QUESTIONS.length;

  // Atualiza barra de progresso
  const percent = ((index + 1) / total) * 100;
  if (progressFill)    progressFill.style.width    = percent + '%';
  if (progressCurrent) progressCurrent.textContent = `Pergunta ${index + 1} de ${total}`;
  if (scoreLive)       scoreLive.textContent        = `${score} acerto${score !== 1 ? 's' : ''}`;

  // Cria o card da pergunta
  const card = document.createElement('div');
  card.className = 'question-card';
  card.setAttribute('role', 'region');
  card.setAttribute('aria-label', `Pergunta ${index + 1}`);

  const isSubjective = q.correctIndex === -1;

  card.innerHTML = `
    <div class="question-number">Pergunta ${index + 1} / ${total}</div>
    <p class="question-text">${q.text}</p>
    <div class="options-list" role="radiogroup" aria-label="Opções de resposta">
      ${q.options.map((opt, i) => `
        <button class="option-btn" data-index="${i}" aria-label="Opção ${String.fromCharCode(65 + i)}: ${opt}">
          <span class="option-letter">${String.fromCharCode(65 + i)}</span>
          <span>${opt}</span>
        </button>
      `).join('')}
    </div>
    <div class="question-actions">
      <button class="btn btn-primary" id="btn-next" style="display:none;">
        ${index < total - 1 ? '<i class="fa-solid fa-arrow-right"></i> Próxima' : '<i class="fa-solid fa-flag-checkered"></i> Ver Resultado'}
      </button>
    </div>
  `;

  // Remove card anterior com animação
  const existing = questionArea.querySelector('.question-card');
  if (existing) {
    existing.classList.add('leaving');
    existing.addEventListener('animationend', () => {
      existing.remove();
      questionArea.appendChild(card);
      attachOptionListeners(card, q, isSubjective);
    }, { once: true });
  } else {
    questionArea.appendChild(card);
    attachOptionListeners(card, q, isSubjective);
  }
}

/* ============================================================
   LISTENERS DAS OPÇÕES
   ============================================================ */
function attachOptionListeners(card, q, isSubjective) {
  const options = card.querySelectorAll('.option-btn');
  const btnNext = card.querySelector('#btn-next');

  options.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;

      const selectedIndex = parseInt(btn.dataset.index, 10);
      userAnswers.push(selectedIndex);

      if (!isSubjective) {
        // Mostra correto/errado
        options.forEach((b, i) => {
          b.disabled = true;
          if (i === q.correctIndex) b.classList.add('correct');
          else if (i === selectedIndex && selectedIndex !== q.correctIndex) b.classList.add('wrong');
        });

        if (selectedIndex === q.correctIndex) {
          score++;
          if (scoreLive) scoreLive.textContent = `${score} acerto${score !== 1 ? 's' : ''}`;
        }
      } else {
        // Pergunta subjetiva — apenas marca a selecionada
        options.forEach((b) => { b.disabled = true; });
        btn.classList.add('correct');
        score++; // conta como acerto
      }

      // Exibe botão "Próxima"
      if (btnNext) btnNext.style.display = 'inline-flex';
    });
  });

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      currentQuestion++;
      if (currentQuestion < QUESTIONS.length) {
        renderQuestion(currentQuestion);
      } else {
        showResult();
      }
    });
  }
}

/* ============================================================
   RESULTADO FINAL
   ============================================================ */
function showResult() {
  if (!questionArea) return;
  if (progressWrap) progressWrap.style.display = 'none';

  const total = QUESTIONS.length;
  const percent = Math.round((score / total) * 100);

  // Mensagem baseada na nota
  let emoji, message, sub;
  if (percent >= 90) {
    emoji = '🏆'; message = 'Excelente!'; sub = 'Você é um verdadeiro especialista em FIRST!';
  } else if (percent >= 70) {
    emoji = '🎉'; message = 'Muito bem!'; sub = 'Você conhece bem a FIRST Robotics!';
  } else if (percent >= 50) {
    emoji = '👍'; message = 'Bom trabalho!'; sub = 'Continue aprendendo sobre a FIRST!';
  } else {
    emoji = '📚'; message = 'Continue estudando!'; sub = 'Leia o livro e tente novamente!';
  }

  const resultCard = document.createElement('div');
  resultCard.className = 'quiz-result';
  resultCard.innerHTML = `
    <div class="result-emoji">${emoji}</div>
    <div class="result-score">${score}/${total}</div>
    <div class="result-message">${message}</div>
    <p class="result-sub">${sub}</p>
    <div class="result-actions">
      <a href="certificado.html" class="btn btn-primary btn-lg">
        <i class="fa-solid fa-certificate"></i> Ver Certificado
      </a>
      <button class="btn btn-outline" onclick="location.reload()">
        <i class="fa-solid fa-rotate"></i> Tentar Novamente
      </button>
      <a href="../index.html" class="btn btn-outline">
        <i class="fa-solid fa-home"></i> Início
      </a>
    </div>
  `;

  // Remove card anterior
  const existing = questionArea.querySelector('.question-card');
  if (existing) {
    existing.classList.add('leaving');
    existing.addEventListener('animationend', () => {
      existing.remove();
      questionArea.appendChild(resultCard);
    }, { once: true });
  } else {
    questionArea.appendChild(resultCard);
  }

  // Salva resultado no LocalStorage
  saveLS('ptde_quiz_result', {
    score,
    total,
    percent,
    answers: userAnswers,
    date: new Date().toISOString(),
  });

  // Confetes para notas altas (≥ 70%)
  if (percent >= 70) {
    launchConfetti();
  }
}

/* ============================================================
   ANIMAÇÃO DE CONFETES
   ============================================================ */
function launchConfetti() {
  const colors = ['#0057D9', '#00C6FF', '#F59E0B', '#22C55E', '#EF4444', '#A855F7', '#EC4899'];
  const count  = 120;

  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left     = Math.random() * 100 + 'vw';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width    = (Math.random() * 8 + 6) + 'px';
      piece.style.height   = (Math.random() * 8 + 6) + 'px';
      piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      piece.style.animationDuration = (Math.random() * 2 + 2) + 's';
      piece.style.animationDelay   = Math.random() * 0.5 + 's';
      document.body.appendChild(piece);
      piece.addEventListener('animationend', () => piece.remove(), { once: true });
    }, i * 15);
  }
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
if (questionArea) {
  renderQuestion(0);
}
