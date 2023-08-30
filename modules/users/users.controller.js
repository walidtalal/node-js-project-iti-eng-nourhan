import User from "../../schemas/users.schema.js";
import Task from "../../schemas/tasks.schema.js";
import bcrypt from "bcrypt";
import { createAuthorization } from "../../utils/token.js";
import sendEmail from "../../utils/sendMail.js";

const saltRounds = 10;

/*
1- Logs the error and sends a 500 (Internal Server Error) response.
2- return nothing
*/
const serverError = (error, res) => {
    console.log(error);
    res.status(500).json({
        message:
            "Can't complete your request right now, please try again later",
    });
};

/*
    1- get user details from req.body
    2- Checks if a user with the same email exists
    3- If not, hashes the password and creates a new user entry in the database.
    4- Sends a verification email to the user.
*/
const signUp = async (req, res) => {
    const { name, email, password, age, gender, phone } = req.body;
    try {
        const user = await User.findOne({ email });

        if (user) {
            return res.status(200).json({
                message: "User already exists, please login",
            });
        }

        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const createUser = await User.create({
            name,
            email,
            password: hashedPassword,
            age,
            gender,
            phone,
        });

        sendEmail({ name, email, id: createUser._id });
        res.status(200).json({
            message:
                "User is successfully created. We sent a verification message to your email, please verify your account",
            user: createUser,
        });
    } catch (error) {
        serverError(error, res);
    }
};

/*
    1- Validates the user based on email and password.
    2- Checks if the account is verified.
    3- Compares the hashed password.
    4- If everything is fine, returns a JWT token.
    5- Returns: A JSON response with a message and a JWT token, if successful.
*/

const signIn = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user || user.isDeleted) {
            return res.status(403).json({
                message: user?.isDeleted
                    ? "Your account has been deleted, please contact support"
                    : "Email is not correct, or your account has been deleted",
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({
                message:
                    "You must verify your account, please check your inbox",
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (match) {
            const token = createAuthorization(
                {
                    id: user._id,
                    email: user.email,
                },
                "7d"
            );
            res.status(200).json({
                message: "User is successfully logged in",
                token,
            });
        } else {
            res.status(406).json({
                message: "Password is not correct",
            });
        }
    } catch (error) {
        serverError(error, res);
    }
};

/*
    1- Validates the user ID.
    2- Finds the user in the database and updates the isVerified flag.
    3- Returns: A JSON response with a message and updated user details.
*/

const verifyAccount = async (req, res) => {
    const id = req.params.id;

    if (id.length !== 24) {
        return res.status(404).json({ message: "User id is invalid" });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User id is invalid" });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { isVerified: true },
            { new: true }
        );

        res.status(200).json({
            message: "Account is verified successfully, you can login now",
            updatedUser,
        });
    } catch (error) {
        serverError(error, res);
    }
};

/*
    1- Validates the user.
    2- Hashes the new password.
    3- Updates the password in the database
    * @returns A JSON response with a message and a new JWT token.
*/

const changePassword = async (req, res) => {
    const id = req.userID;

    try {
        const userData = await User.findById(id);

        if (!userData || userData.isDeleted) {
            const expiredToken = createAuthorization(
                { id: userData?._id },
                "1s"
            );
            return res.status(403).json({
                message: userData?.isDeleted
                    ? "Your account has been deleted, please contact support"
                    : "Can't find your account, or your account has been deleted",
                token: expiredToken,
            });
        }

        const salt = bcrypt.genSaltSync(saltRounds);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);
        const user = await User.findByIdAndUpdate(
            id,
            { password: hashedPassword },
            { new: true }
        );

        const token = createAuthorization({ id, email: user.email }, "7d");

        res.status(200).json({
            message: "Password is updated successfully",
            newToken: token,
        });
    } catch (error) {
        serverError(error, res);
    }
};

/**
 * @param {*} req
 * @param {*} res
 *  Validates the user.
 *  Updates user fields like name, age, phone if provided.
 * @returns A JSON response with a message and updated user details.
 */

const updateUser = async (req, res) => {
    const id = req.userID;
    const { name, age, phone } = req.body;

    try {
        const userData = await User.findById(id);

        if (!userData || userData.isDeleted) {
            const expiredToken = createAuthorization(
                { id: userData?._id },
                "1s"
            );

            return res.status(403).json({
                message: userData?.isDeleted
                    ? "Your account has been deleted, please contact support"
                    : "Can't find your account, or your account has been deleted",
                token: expiredToken,
            });
        }

        const updatedData = {};

        if (name) updatedData.name = name;
        if (age) updatedData.age = age;
        if (phone) updatedData.phone = phone;

        const newData = await User.findByIdAndUpdate(
            id,
            { $set: updatedData },
            { new: true }
        );

        res.status(200).json({
            message: "User is updated successfully",
            updatedUser: newData,
        });
    } catch (error) {
        serverError(error, res);
    }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 *  Validates the user.
    Deletes all tasks associated with the user.
    Deletes the user from the database.
 * @returns A JSON response with a message and an expired token.
 */

const deleteUser = async (req, res) => {
    const id = req.userID;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(403).json({
                message: "Can't find your account",
            });
        }

        await Task.deleteMany({ userID: id });
        await User.findByIdAndDelete(id);

        const expiredToken = createAuthorization({ id: user._id }, "1s");
        res.status(200).json({
            message: "Your account has been deleted",
            token: expiredToken,
        });
    } catch (error) {
        serverError(error, res);
    }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 *  Validates the user.
    Sets isDeleted flag to true without deleting the user
 * @returns A JSON response with a message, an expired token, and updated user details.
 */

const softDeleteUser = async (req, res) => {
    const id = req.userID;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(403).json({
                message: "Can't find your account",
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { isDeleted: true },
            { new: true }
        );

        const expiredToken = createAuthorization({ id: updatedUser._id }, "1s");
        res.status(403).json({
            message:
                "Your account has been soft deleted, please contact support",
            token: expiredToken,
            user: updatedUser,
        });
    } catch (error) {
        serverError(error, res);
    }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 *  Validates the user.
    Provides an expired token for logging out.
 * @returns A JSON response with a message and an expired token.
 */

const userLogout = async (req, res) => {
    const id = req.userID;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(403).json({
                message: "Can't find your account",
            });
        }

        const expiredToken = createAuthorization({ id: user._id }, "1s");

        if (user.isDeleted) {
            return res.status(403).json({
                message:
                    "Your account has been deleted, please contact support",
                token: expiredToken,
            });
        }

        res.status(200).json({
            message: "You have successfully logged out",
            token: expiredToken,
        });
    } catch (error) {
        serverError(error, res);
    }
};

export {
    signUp,
    signIn,
    verifyAccount,
    changePassword,
    updateUser,
    deleteUser,
    softDeleteUser,
    userLogout,
};
