const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getJobsFeed,
  updateWorkerStatus,
  acceptJob,
  uploadInvoice,
  updateJobStatus,
  getWorkerEarnings,
} = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, 'receipt-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png, webp) are allowed'));
  },
});

// Protect all worker routes
router.use(protect);
router.use(authorizeRoles('WORKER'));

router.get('/jobs', getJobsFeed);
router.put('/status', updateWorkerStatus);
router.post('/accept', acceptJob);
router.put('/job-status', updateJobStatus);
router.get('/earnings', getWorkerEarnings);

// Upload invoice (stores purchase receipt)
router.post('/order/:id/invoice', upload.single('billImage'), uploadInvoice);

module.exports = router;
