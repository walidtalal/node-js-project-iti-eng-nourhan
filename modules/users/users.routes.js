/**
 * import all middlewares
 * import all function of cotroling
 */

import express from "express";
import {
    validateSignIn,
    validateSignUp,
    validateUpdate,
    validateChangePass,
} from "./usersValidation.js";
import {
    signUp,
    signIn,
    verifyAccount,
    changePassword,
    updateUser,
    deleteUser,
    softDeleteUser,
    userLogout,
} from "./users.controller.js";
import { verifyAuthorization } from "../../utils/token.js";

const userRouter = express.Router();

userRouter.post("/users/signup", validateSignUp, signUp);
userRouter.post("/users/signin", validateSignIn, signIn);
userRouter.get("/users/verify/:id", verifyAccount);
userRouter.patch(
    "/users/changepass",
    verifyAuthorization,
    validateChangePass,
    changePassword
);
userRouter.patch(
    "/users/update",
    verifyAuthorization,
    validateUpdate,
    updateUser
);
userRouter.get("/users/delete", verifyAuthorization, deleteUser);
userRouter.get("/users/softdelete", verifyAuthorization, softDeleteUser);
userRouter.get("/users/logout", verifyAuthorization, userLogout);

export default userRouter;
