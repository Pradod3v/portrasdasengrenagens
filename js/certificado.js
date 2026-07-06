/**
 * certificado.js — Página do Certificado
 * Por Trás das Engrenagens | FIRST Robotics
 * -------------------------------------------------------
 * Responsabilidades:
 *  - Verificar se o usuário completou a jornada
 *  - Preencher nome e data automaticamente
 *  - Botão de download do certificado em PDF (jsPDF)
 *  - Botão de impressão
 */

(function initCertificado() {

  /* ---- Elementos ---- */
  const certContent  = document.getElementById('cert-content');
  const certLocked   = document.getElementById('cert-locked');
  const certName     = document.getElementById('cert-name');
  const certDate     = document.getElementById('cert-date');
  const certQuizNote = document.getElementById('cert-quiz-note');
  const btnDownload  = document.getElementById('btn-download-cert');
  const btnPrint     = document.getElementById('btn-print-cert');

  /* ---- Verificar dados do usuário ---- */
  const userData   = loadLS('ptde_user');
  const quizResult = loadLS('ptde_quiz_result');
  const bookDone   = loadLS('ptde_book_finished');

  // Condição para liberar o certificado:
  // Usuário cadastrado + (livro finalizado OU quiz realizado)
  const isEligible = userData && userData.nome && (bookDone || quizResult);

  if (!isEligible) {
    // Mostra tela de bloqueio
    if (certLocked)  certLocked.style.display  = 'block';
    if (certContent) certContent.style.display = 'none';
    return;
  }

  /* ---- Preenche o certificado ---- */
  if (certLocked)  certLocked.style.display  = 'none';
  if (certContent) certContent.style.display = 'block';

  // Nome
  if (certName) certName.textContent = userData.nome;

  // Data (hoje)
  const today = new Date();
  if (certDate) certDate.textContent = formatDateBR(today);

  // Nota do quiz (se disponível)
  if (certQuizNote && quizResult) {
    certQuizNote.innerHTML = `
      <i class="fa-solid fa-star" style="color:#F59E0B;"></i>
      Nota no Quiz: <strong>${quizResult.score}/${quizResult.total}</strong>
      (${quizResult.percent}%)
    `;
  }

  /* ---- Download em PDF (jsPDF) ---- */
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      generatePDF(userData.nome, today);
    });
  }

  /* ---- Impressão ---- */
  if (btnPrint) {
    btnPrint.addEventListener('click', () => {
      window.print();
    });
  }

  /* ============================================================
     GERAÇÃO DO PDF COM jsPDF
     ============================================================ */
  function generatePDF(nome, date) {
    // Verifica se jsPDF está disponível
    if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
      showToast('Biblioteca de PDF não carregada. Tente imprimir a página.', 'error');
      return;
    }

    showToast('Gerando seu certificado...', '', 2000);

    const { jsPDF } = window.jspdf || { jsPDF };

    // Orientação paisagem (A4)
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    const W = doc.internal.pageSize.getWidth();   // 297
    const H = doc.internal.pageSize.getHeight();  // 210

    /* ---- Fundo ---- */
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, W, H, 'F');

    /* ---- Borda externa ---- */
    doc.setDrawColor(0, 87, 217);
    doc.setLineWidth(3);
    doc.rect(8, 8, W - 16, H - 16);

    /* ---- Borda interna ---- */
    doc.setDrawColor(0, 87, 217, 0.3);
    doc.setLineWidth(0.5);
    doc.rect(14, 14, W - 28, H - 28);

    /* ---- Cabeçalho — Logo ---- */
    doc.setFontSize(10);
    doc.setTextColor(0, 87, 217);
    doc.setFont('helvetica', 'bold');
    doc.text('⚙ Por Trás das Engrenagens', W / 2, 30, { align: 'center' });

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Equipe BrontoByte — FIRST Robotics', W / 2, 36, { align: 'center' });

    /* ---- Linha divisória ---- */
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(40, 42, W - 40, 42);

    /* ---- Certificado de Conclusão ---- */
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO DE CONCLUSÃO', W / 2, 55, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('Certificamos que', W / 2, 68, { align: 'center' });

    /* ---- Nome do participante ---- */
    doc.setFontSize(32);
    doc.setTextColor(0, 87, 217);
    doc.setFont('helvetica', 'bold');
    doc.text(nome, W / 2, 90, { align: 'center' });

    /* ---- Linha sob o nome ---- */
    const nameWidth = doc.getTextWidth(nome);
    const lineStart = (W - Math.min(nameWidth + 20, 200)) / 2;
    const lineEnd   = W - lineStart;
    doc.setDrawColor(0, 87, 217, 0.3);
    doc.setLineWidth(0.5);
    doc.line(lineStart, 94, lineEnd, 94);

    /* ---- Texto de conclusão ---- */
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text('concluiu com êxito a jornada educacional', W / 2, 106, { align: 'center' });

    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('Por Trás das Engrenagens', W / 2, 120, { align: 'center' });

    /* ---- Nota do quiz ---- */
    if (quizResult) {
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Nota no Quiz: ${quizResult.score}/${quizResult.total} (${quizResult.percent}%)`,
        W / 2, 132, { align: 'center' }
      );
    }

    /* ---- Rodapé ---- */
    const footerY = H - 30;

    // Assinatura esquerda
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(40, footerY, 110, footerY);
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.text('Equipe BrontoByte', 75, footerY + 5, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('FIRST Robotics — Brasil', 75, footerY + 10, { align: 'center' });

    // Data direita
    const dateStr = formatDateBR(date);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('DATA DE CONCLUSÃO', W - 75, footerY - 5, { align: 'center' });
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'bold');
    doc.text(dateStr, W - 75, footerY + 2, { align: 'center' });

    /* ---- Salva o PDF ---- */
    const filename = `certificado-por-tras-das-engrenagens-${nome.toLowerCase().replace(/\s+/g, '-')}.pdf`;
    doc.save(filename);

    showToast('Certificado baixado com sucesso! 🎓', 'success', 4000);
  }

})();
