const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const authenticate = require('../middleware/auth.middleware');
const eventController = require('../controllers/event.controller');

router.get('/', eventController.listEvents);
router.post('/', authenticate, upload.single('image'), eventController.createEvent);
router.put('/:id', authenticate, upload.single('image'), (req, res, next) => {
  console.log(req.method, req.body);
  eventController.updateEvent(req, res, next);
});
router.patch('/:id', authenticate, (req, res, next) => {
  console.log(req.method, req.body);
  eventController.updateEvent(req, res, next);
});
router.delete('/:id', authenticate, eventController.deleteEvent);
router.get('/:id/views', authenticate, eventController.getEventAnalytics);

module.exports = router;
