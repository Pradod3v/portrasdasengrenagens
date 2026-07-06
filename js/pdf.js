/**
 * pdf.js — Utilitários de PDF
 * Por Trás das Engrenagens | FIRST Robotics
 * -------------------------------------------------------
 * Este arquivo centraliza funções relacionadas ao PDF.
 * A lógica principal de geração do certificado está em certificado.js.
 * Aqui ficam utilitários compartilhados e estrutura para expansão futura.
 */

/**
 * Verifica se um arquivo PDF existe no servidor.
 * @param {string} url — Caminho do PDF
 * @returns {Promise<boolean>}
 */
async function checkPDFExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Abre um PDF em nova aba.
 * @param {string} url
 */
function openPDFInNewTab(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Inicia o download de um PDF.
 * @param {string} url
 * @param {string} filename
 */
function downloadPDF(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'documento.pdf';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Expõe globalmente
window.checkPDFExists   = checkPDFExists;
window.openPDFInNewTab  = openPDFInNewTab;
window.downloadPDF      = downloadPDF;
