const fs = require('fs');
const path = require('path');

// Инициализация папки для загрузок
function initializeStorage(uploadDir) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`📁 Создана папка для загрузок: ${uploadDir}`);
  } else {
    console.log(`📁 Папка для загрузок: ${uploadDir}`);
  }
}

module.exports = { initializeStorage };