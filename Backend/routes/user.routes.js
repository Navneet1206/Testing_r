const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const userController = require('../controllers/user.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const authMiddleware = require('../path/to/authMiddleware');

router.post('/register', upload.single('profilePhoto'), [
  body('email').isEmail().withMessage('Invalid Email'),
  body('fullname.firstname').isLength({ min: 3 }).withMessage('First name must be at least 3 characters long'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('mobileNumber').isLength({ min: 10 }).withMessage('Mobile number must be at least 10 characters long')
],
  userController.registerUser
);

router.post('/login', [
    body('email').isEmail().withMessage('Invalid Email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
],
    userController.loginUser
)

router.get('/profile', authMiddleware.authUser, userController.getUserProfile)

router.get('/logout', authMiddleware.authUser, userController.logoutUser)



module.exports = router;