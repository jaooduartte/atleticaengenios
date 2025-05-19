const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/auth.middleware');

router.post('/inativar-inativos', adminController.inativarInativos);
router.post('/gestao', authenticate, adminController.createBoardTerm);
router.get('/gestao', authenticate, adminController.listBoardTerms);
router.get('/gestao/:termId/membros', authenticate, adminController.getBoardMembers);
router.put('/gestao/:termId/membro', authenticate, adminController.upsertBoardMember);
router.delete('/gestao/:termId/membro/:role', authenticate, adminController.removeBoardMember);


module.exports = router;