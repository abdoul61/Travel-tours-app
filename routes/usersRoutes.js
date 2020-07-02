const express = require('express');
const usersController = require('../controller/usersController');
const authController = require('../controller/authController');

const router = express.Router();

// ROUTE FOR SIGNING UP AND LOGIN
router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.get('/logout', authController.logOut);

// ROUTE FOR RESETTING YOUR PASSWORD
router.post('/forgotPassword', authController.forgetPass);
router.patch('/resetPassword/:token', authController.resetPass);

// this route protect all the user

router.use(authController.protect);

router.patch('/updateMypassword', authController.updatePassword);
router.get('/me', usersController.getMe, usersController.getUser);
router.patch(
  '/updateMe',
  usersController.uploadUserPhoto,
  usersController.resizeUserPhoto,
  usersController.updateMe
);
router.delete('/deleteMe', usersController.deleteMe);

// this route is onlu allow admin user to acces to
router.use(authController.RestrictTo('admin'));
router
  .route('/')
  .get(usersController.gettAllUsers)
  .patch(usersController.createUser);

router
  .route('/:id')
  .get(usersController.getUser)
  .delete(usersController.deleteUser)
  .patch(usersController.updateUser);

module.exports = router;
