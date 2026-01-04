const sqlite3 = require('sqlite3').verbose();
const path = require('path');
let db = null;

// Инициализация базы данных
function initDB(dbPath) {
  const dir = path.dirname(dbPath);
  if (!require('fs').existsSync(dir)) {
    require('fs').mkdirSync(dir, { recursive: true });
  }

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('❌ Ошибка подключения к БД:', err);
    } else {
      console.log('✅ База данных подключена');
      createTables();
    }
  });
}

// Создание таблиц
function createTables() {
  db.run(`
    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT NOT NULL,
      filePath TEXT NOT NULL UNIQUE,
      duration INTEGER DEFAULT 0,
      coverUrl TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('❌ Ошибка создания таблицы:', err);
    } else {
      console.log('✅ Таблица tracks готова');
    }
  });
}

// Добавить трек
function addTrack(trackData) {
  return new Promise((resolve, reject) => {
    const { title, artist, album, filePath, duration, coverUrl } = trackData;
    
    db.run(
      `INSERT INTO tracks (title, artist, album, filePath, duration, coverUrl) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, artist, album, filePath, duration, coverUrl],
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );
  });
}

// Получить все треки
function getAllTracks() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM tracks ORDER BY createdAt DESC', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Получить трек по ID
function getTrackById(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM tracks WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

module.exports = { initDB, addTrack, getAllTracks, getTrackById, db: () => db };