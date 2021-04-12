const express = require('express');
const userController = require('../controllers/userController');
const authController = require("../controllers/authController");

const userRouter = express.Router();

userRouter.post("/signup", authController.signup);
userRouter.get("/logout", authController.logout)
userRouter.post("/login", authController.login);
userRouter.post("/forgotPassword", authController.forgotPass);
userRouter.patch("/resetPassword/:token", authController.resetPass);
userRouter.patch("/confirm/:token", authController.confirmIdentity);
userRouter.patch("/updatePassword", authController.protect,authController.updatePassword);
userRouter.patch("/updateData", authController.protect, userController.uploadUserPhoto, userController.resizeUserPic, userController.updateMe);
userRouter.delete("/killMe", authController.protect, userController.deleteMe);
userRouter.get("/me", authController.protect, userController.getMe, userController.getUser);

userRouter
  .route('/')
  .get(authController.protect,authController.restrict("admin") ,userController.getAllUsers)
  .post(authController.protect,authController.restrict("admin") ,userController.createNewUser);
userRouter
  .route('/:id')
  .get(authController.protect,authController.restrict("admin") ,userController.getUser)
  .patch(authController.protect, authController.restrict("admin"), userController.updateUser)
  .delete(authController.protect, authController.restrict("admin") ,userController.removeUser);

module.exports = userRouter;
