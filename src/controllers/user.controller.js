import { User } from "../models/User.models.js";
import { asyncHandler } from "../utility/AsyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const users = await User.find();

    if (!users) {
      throw new ApiError(404, "Users not founded");
    }
  } catch (error) {
    console.log(error);
  }
});

const signup = asyncHandler(async (req, res) => {
  try {
    const { username, email, name, password } = req.body;

    if (
      [name, password, username, email].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All field are required");
    }

    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      throw new ApiError(400, "User Already Existed !! Connection Instance ");
    }

    const user = User.create({
      name,
      email,
      password,
      username: username.toLowerCase(),
    });

    const registeredUser = await User.findById(user?._id).select("-password");

    if (!registeredUser) {
      throw new ApiError(400, "User not Created !! ");
    }

    return res
      .status(2001)
      .json(
        new ApiResponse(200, { registeredUser }, "User Registered Successfully")
      );
  } catch (error) {
    console.log(error);
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!username && !email) {
      throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!user) {
      throw new ApiError(404, "user not found");
    }

    const isPassValid = await user.isPasswordCorrect(password);

    if (!isPassValid) {
      throw new ApiError(400, "Incorrect Password ");
    }

    const loggedInUser = await User.findById(user?._id).select("-password");

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
        },
        "Login successfully "
      )
    );
  } catch (error) {
    console.log(error);
  }
});

const logout = asyncHandler(async (req, res) => {
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
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully "));
});

export { getAllUsers, signup, login, logout };
