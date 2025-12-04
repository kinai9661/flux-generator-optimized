/**
 * 主應用程式
 */

class FluxGeneratorApp {
  constructor() {
    this.selectedRatio = '1:1';
    this.init();
  }

  async init() {
    await window.storageManager.init();
    this.setupEventListeners();
    await this.loadHistory();
    await this.updateStorageInfo();
  }

  setupEventListeners() {
    // 比例選擇
    document.querySelectorAll('.aspect-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.aspect-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.selectedRatio = e.target.dataset.ratio;
      });
    });

    // 滑桿值更新
    document.getElementById('steps').addEventListener('input', (e) => {
      document.getElementById('stepsValue').textContent = e.target.value;
    });
    document.getElementById('guidance').addEventListener('input', (e) => {
      document.getElementById('guidanceValue').textContent = e.target.value;
    });

    // 生成按鈕
    document.getElementById('generateBtn').addEventListener('click', () => this.generate());

    // 雲同步
    document.getElementById('btnSync')?.addEventListener('click', () => this.syncToCloud());

    // 導出
    document.getElementById('btnExport')?.addEventListener('click', () => this.exportData());

    // 清空歷史
    document.getElementById('btnClearHistory')?.addEventListener('click', () => this.clearHistory());
  }

  async generate() {
    const prompt = document.getElementById('prompt').value.trim();
    if (!prompt) {
      UIHelper.toast('請輸入提示詞!', 'warning');
      return;
    }

    const btn = document.getElementById('generateBtn');
    btn.disabled = true;
    btn.textContent = '⏳ 生成中...';
    UIHelper.showLoading(true);

    try {
      const steps = parseInt(document.getElementById('steps').value);
      const guidance = parseFloat(document.getElementById('guidance').value);

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          aspectRatio: this.selectedRatio,
          steps,
          guidance
        })
      });

      const data = await response.json();

      if (data.success) {
        UIHelper.displayImage(data.image, prompt);
        
        // 保存到本地
        await window.storageManager.saveImage({
          prompt: data.prompt,
          image: data.image,
          metadata: data.metadata
        });

        await this.loadHistory();
        await this.updateStorageInfo();
        
        UIHelper.toast('生成成功! ✨', 'success');
      } else {
        UIHelper.displayError(data.error);
        UIHelper.toast('生成失敗: ' + data.error, 'error');
      }
    } catch (error) {
      console.error('Generate error:', error);
      UIHelper.displayError(error.message);
      UIHelper.toast('網路錯誤,請稍後再試', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '🚀 立即生成';
      UIHelper.showLoading(false);
    }
  }

  async loadHistory() {
    const images = await window.storageManager.getAllImages();
    if (images.length === 0) {
      UIHelper.showHistory(false);
      return;
    }

    const grid = document.getElementById('historyGrid');
    grid.innerHTML = images.slice(0, 12).map(img => `
      <div class="history-item" onclick="app.viewImage('${img.id}')">
        <div class="history-thumbnail">🖼️</div>
        <div style="padding: 0.75rem;">
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            ${img.prompt.substring(0, 40)}...
          </p>
        </div>
      </div>
    `).join('');

    UIHelper.showHistory(true);
  }

  async viewImage(id) {
    const image = await window.storageManager.getImage(id);
    if (image) {
      UIHelper.displayImage(image.image, image.prompt);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  downloadImage(src, filename) {
    const link = document.createElement('a');
    link.href = src;
    link.download = `flux-${filename}-${Date.now()}.png`;
    link.click();
    UIHelper.toast('下載成功! 💾', 'success');
  }

  async exportData() {
    try {
      const data = await window.storageManager.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `flux-backup-${Date.now()}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
      UIHelper.toast('導出成功! 📦', 'success');
    } catch (error) {
      UIHelper.toast('導出失敗: ' + error.message, 'error');
    }
  }

  async clearHistory() {
    if (!confirm('確定要清空所有歷史記錄嗎?')) return;
    
    try {
      await window.storageManager.clearAll();
      await this.loadHistory();
      await this.updateStorageInfo();
      UIHelper.toast('已清空歷史記錄', 'success');
    } catch (error) {
      UIHelper.toast('清空失敗: ' + error.message, 'error');
    }
  }

  async syncToCloud() {
    UIHelper.toast('雲同步功能開發中...', 'info');
  }

  async updateStorageInfo() {
    const info = await window.storageManager.getStorageInfo();
    UIHelper.updateStorageInfo(info);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new FluxGeneratorApp();
});