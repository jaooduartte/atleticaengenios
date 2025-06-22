const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth.middleware');
const eventController = require('../controllers/event.controller');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', eventController.listEvents);
router.post('/', upload.single('image'), authenticate, eventController.createEvent);
router.put('/:id', upload.single('image'), authenticate, eventController.updateEvent);
router.delete('/:id', authenticate, eventController.deleteEvent);
router.get('/:id/views', authenticate, eventController.getEventAnalytics);

module.exports = router;
