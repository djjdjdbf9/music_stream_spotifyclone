const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { initDB, addTrack, getAllTracks, getTrackById } = require('./database');
const { initializeStorage } = require('./file-storage');

const app = express();
const PORT = 3000;

// Инициализация
const uploadDir = path.join(__dirname, 'public/uploads');
const dbPath = path.join(__dirname, 'data/database.sqlite');

initializeStorage(uploadDir);
initDB(dbPath);

// Конфигурация multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Только аудио файлы!'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(uploadDir));

// Маршруты API

// Получить все треки
app.get('/api/tracks', async (req, res) => {
  try {
    const tracks = await getAllTracks();
    res.json(tracks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить один трек
app.get('/api/tracks/:id', async (req, res) => {
  try {
    const track = await getTrackById(req.params.id);
    if (!track) {
      return res.status(404).json({ error: 'Трек не найден' });
    }
    res.json(track);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Загрузить трек
app.post('/api/upload', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const { title, artist, album } = req.body;
    const filePath = `/uploads/${req.file.filename}`;
    
    const trackId = await addTrack({
      title: title || req.file.originalname,
      artist: artist || 'Unknown Artist',
      album: album || 'Unknown Album',
      filePath,
      duration: 0, // Можно добавить извлечение метаданных
      coverUrl: null
    });

    res.json({ 
      success: true, 
      trackId,
      message: 'Трек успешно загружен!'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить трек
app.delete('/api/tracks/:id', async (req, res) => {
  try {
    const db = require('./database').db;
    const track = await getTrackById(req.params.id);
    
    if (!track) {
      return res.status(404).json({ error: 'Трек не найден' });
    }

    // Удалить файл
    const fullPath = path.join(__dirname, 'public', track.filePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // Удалить из БД
    await db.run('DELETE FROM tracks WHERE id = ?', [req.params.id]);
    
    res.json({ success: true, message: 'Трек удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🎵 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📁 Загрузка треков: ${uploadDir}`);
});