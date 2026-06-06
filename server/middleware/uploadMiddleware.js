const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'ems_events',
    allowedFormats: ['jpeg', 'png', 'jpg']
  }
});

// Since dummy keys will fail actual upload, we can fallback to local upload for testing if cloudinary fails.
// For MVP, if no Cloudinary keys, just use memory storage or disk storage.
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: process.env.CLOUDINARY_CLOUD_NAME === 'dummy_cloud' ? diskStorage : storage });

// ensure uploads folder exists
const fs = require('fs');
if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}

module.exports = upload;
