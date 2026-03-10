const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const config = require('../config.js');
const RealAPKGenerator = require('../real-apk-generator');

const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// VERCEL: Folder /tmp adalah satu-satunya tempat yang bisa ditulis
const uploadsDir = '/tmp/uploads';
const buildsDir = '/tmp/builds';
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(buildsDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${uuidv4()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const activeBuilds = new Map();

app.post('/api/build', upload.single('icon'), async (req, res) => {
    const buildId = uuidv4();
    const { appName, packageName, url } = req.body;
    
    const buildData = {
        id: buildId,
        status: 'building',
        progress: 10,
        appName,
        packageName,
        startTime: Date.now(),
        logs: ['[System] Build started on Vercel Serverless...']
    };
    
    activeBuilds.set(buildId, buildData);
    res.json({ success: true, buildId });

    try {
        const generator = new RealAPKGenerator();
        const apkPath = path.join(buildsDir, `${buildId}.apk`);
        
        // Proses build APK
        await generator.createMinimalAndroidProject('/tmp/' + buildId, packageName, appName, url);
        // PENTING: Limit size di Vercel agar tidak error 502
        await generator.generateSimpleAPK(apkPath, packageName, appName);
        
        buildData.status = 'completed';
        buildData.progress = 100;
        buildData.downloadUrl = `/api/download/${buildId}`;
    } catch (error) {
        buildData.status = 'failed';
        console.error(error);
    }
});

app.get('/api/status/:id', (req, res) => {
    res.json(activeBuilds.get(req.params.id) || { status: 'not_found' });
});

app.get('/api/download/:id', (req, res) => {
    const filePath = path.join(buildsDir, `${req.params.id}.apk`);
    if (fs.existsSync(filePath)) {
        res.download(filePath, 'app-release.apk');
    } else {
        res.status(404).send('File expired or not found');
    }
});

module.exports = app;
