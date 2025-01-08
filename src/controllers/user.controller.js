<<<<<<< HEAD
import { User } from "../models/user.model.js";
=======
import { User } from "../models/user.models.js";
>>>>>>> b8abeda72761f46764038761221c3c28e6d7683e
import { asyncHandler } from "../utility/AsyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    // Fetch user from the database
    const user = await User.findById(userId);

    // Check if user exists
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token to the user record
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Return the generated tokens
    return { accessToken, refreshToken };
  } catch (error) {
    // Re-throw custom errors or wrap unexpected ones
    if (error instanceof ApiError) {
      throw error;
    } else {
      throw new ApiError(
        500,
        "Something went wrong while generating access and refresh tokens"
      );
    }
  }
};

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      throw new ApiError(404, "Users not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, { users }, "Users retrieved successfully"));
  } catch (error) {
    console.error(error);

    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message, false));
    } else {
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Internal Server Error", false));
    }
  }
});

const signup = asyncHandler(async (req, res) => {
  try {
    const { username, email, name, password } = req.body;

    if ([name, password, username, email].some((field) => !field?.trim())) {
      throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existedUser) {
      throw new ApiError(400, "User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      username: username.toLowerCase(),
    });

    const registeredUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!registeredUser) {
      throw new ApiError(500, "User not created");
    }

    const response = new ApiResponse(
      201,
      { user: registeredUser },
      "User registered successfully",
      true
    );
    res.status(201).json(response);
  } catch (error) {
    console.error("Error in signup:", error.message);
    if (error instanceof ApiError) {
      res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message, false));
    } else {
      res
        .status(500)
        .json(new ApiResponse(500, null, "Internal Server Error", false));
    }
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!username && !email) {
      throw new ApiError(400, "Username or email is required");
    }

    const user = await User.findOne({ $or: [{ username }, { email }] });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPassValid = await user.isPasswordCorrect(password);

    if (!isPassValid) {
      throw new ApiError(400, "Incorrect Password");
    }

    const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "Login successfully"
        )
      );
  } catch (error) {
    // console.error(error);

    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message, false));
    } else {
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Internal Server Error", false));
    }
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: {
          refreshToken: 1,
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("refreshToken", options)
      .clearCookie("accessToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    if (error instanceof ApiError) {
      return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, null, error.message, false));
    } else {
      return res
        .status(500)
        .json(new ApiResponse(500, null, "Internal Server Error", false));
    }
  }
});

export { getAllUsers, signup, login, logout };
