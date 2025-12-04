/**
 * UI 輔助函數
 */

class UIHelper {
  static showLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = show ? 'flex' : 'none';
  }

  static showResult(show = true) {
    const card = document.getElementById('resultCard');
    card.style.display = show ? 'block' : 'none';
  }

  static showHistory(show = true) {
    const section = document.getElementById('historySection');
    section.style.display = show ? 'block' : 'none';
  }

  static displayImage(imageBase64, prompt) {
    const resultArea = document.getElementById('resultArea');
    const imgSrc = `data:image/png;base64,${imageBase64}`;
    
    resultArea.innerHTML = `
      <img src="${imgSrc}" alt="Generated image" style="max-width: 100%; border-radius: 12px;">
      <div style="margin-top: 1rem; display: flex; gap: 1rem; justify-content: center;">
        <button class="btn-tool" onclick="app.downloadImage('${imgSrc}', '${prompt.substring(0, 30)}')">
          💾 下載
        </button>
        <button class="btn-tool" onclick="app.generate()">
          🔄 重新生成
        </button>
      </div>
    `;
    
    this.showResult(true);
  }

  static displayError(message) {
    const resultArea = document.getElementById('resultArea');
    resultArea.innerHTML = `
      <div class="placeholder" style="color: var(--danger);">
        <h3>❌ 錯誤</h3>
        <p>${message}</p>
      </div>
    `;
    this.showResult(true);
  }

  static updateStorageInfo(info) {
    if (!info) return;
    const elem = document.getElementById('storageInfo');
    const usedMB = (info.used / 1024 / 1024).toFixed(2);
    const totalMB = (info.total / 1024 / 1024).toFixed(0);
    elem.textContent = `💾 ${usedMB}MB / ${totalMB}MB (${info.percentage}%)`;
  }

  static toast(message, type = 'info') {
    const colors = {
      info: 'var(--primary)',
      success: 'var(--success)',
      error: 'var(--danger)',
      warning: 'var(--warning)'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

window.UIHelper = UIHelper;