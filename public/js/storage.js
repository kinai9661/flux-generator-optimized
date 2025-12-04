/**
 * IndexedDB 存儲管理器
 */

class StorageManager {
  constructor() {
    this.dbName = 'FluxGeneratorDB';
    this.storeName = 'images';
    this.db = null;
    this.maxImages = 50;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'id' });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
          objectStore.createIndex('prompt', 'prompt', { unique: false });
        }
      };
    });
  }

  async saveImage(imageData) {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const objectStore = transaction.objectStore(this.storeName);

    const record = {
      id: crypto.randomUUID(),
      ...imageData,
      createdAt: Date.now()
    };

    return new Promise((resolve, reject) => {
      const request = objectStore.add(record);
      request.onsuccess = () => {
        this.cleanupOldImages();
        resolve(record.id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getAllImages() {
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const objectStore = transaction.objectStore(this.storeName);
    const index = objectStore.index('createdAt');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      const results = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getImage(id) {
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const objectStore = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = objectStore.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteImage(id) {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const objectStore = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = objectStore.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async cleanupOldImages() {
    const images = await this.getAllImages();
    if (images.length > this.maxImages) {
      const toDelete = images.slice(this.maxImages);
      for (const img of toDelete) {
        await this.deleteImage(img.id);
      }
    }
  }

  async clearAll() {
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const objectStore = transaction.objectStore(this.storeName);
    return new Promise((resolve, reject) => {
      const request = objectStore.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getStorageInfo() {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage,
        total: estimate.quota,
        percentage: ((estimate.usage / estimate.quota) * 100).toFixed(2)
      };
    }
    return null;
  }

  async exportData() {
    const images = await this.getAllImages();
    const exportData = images.map(img => ({
      id: img.id,
      prompt: img.prompt,
      metadata: img.metadata,
      createdAt: img.createdAt
    }));
    return JSON.stringify(exportData, null, 2);
  }
}

window.storageManager = new StorageManager();