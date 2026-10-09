const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/apiController');
const { requireApiAuth } = require('../middleware/apiAuth');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();
const auth = require('../controllers/apiAuthController');

const apiAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Terlalu banyak percobaan. Coba lagi setelah 15 menit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/auth/register', apiAuthLimiter, asyncHandler(auth.register));
router.post('/auth/login', apiAuthLimiter, asyncHandler(auth.login));
router.post('/auth/refresh', apiAuthLimiter, asyncHandler(auth.refresh));
router.post('/auth/logout', asyncHandler(auth.logout));
router.use(requireApiAuth);
router.get('/me', controller.me);
router.patch('/me', asyncHandler(controller.updateProfile));
router.patch('/me/playlist', asyncHandler(controller.updatePlaylist));
router.get('/results', controller.listResults);
router.get('/results/latest', controller.latestResult);
router.get('/questions', controller.listQuestions);
module.exports = router;
