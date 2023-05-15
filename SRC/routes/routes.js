const express = require('express');
const router = express.Router();
const userController = require('../controllers/controller');

router.get('/', userController.index);
router.get('/login', userController.login);
router.post('/login', userController.loginPost);
router.get('/welcome', userController.welcome);
router.get('/adduser', userController.adduser);
router.get('/admin', userController.admin);
router.get('/logout', userController.logout);
router.post('/adduser', userController.adduserPost);
router.get('/edituser/:ID', userController.edituser);
router.post('/edituser/:ID', userController.edituserPost);
router.get('/:ID', userController.delete);
router.post('/admin', userController.find);


module.exports = router;