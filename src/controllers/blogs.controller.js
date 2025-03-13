import { Blog } from "../models/blogs.model.js";
import { asyncHandler } from "../utility/AsyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";

// tested

const getAllBlogs = asyncHandler(async (req, res) => {
	try {
		const blogs = await Blog.find();

		if (!blogs || blogs.length === 0) {
			throw new ApiError(404, "Blogs not found");
		}

		res
			.status(200)
			.json(
				new ApiResponse(200, { blogs }, "Blogs retrieved successfully", true),
			);
	} catch (error) {
		res
			.status(error instanceof ApiError ? error.statusCode : 500)
			.json(
				new ApiResponse(
					error instanceof ApiError ? error.statusCode : 500,
					null,
					error.message || "Internal Server Error",
					false,
				),
			);
	}
});

// tested

const getBlogById = asyncHandler(async (req, res) => {
	try {
		const blog = await Blog.findById(req.params.id);

		if (!blog) {
			throw new ApiError(404, "Blog not found");
		}

		res
			.status(200)
			.json(
				new ApiResponse(200, { blog }, "Blog retrieved successfully", true),
			);
	} catch (error) {
		res
			.status(error instanceof ApiError ? error.statusCode : 500)
			.json(
				new ApiResponse(
					error instanceof ApiError ? error.statusCode : 500,
					null,
					error.message || "Internal Server Error",
					false,
				),
			);
	}
});

//  tested

const createBlog = asyncHandler(async (req, res) => {
	try {
		const { title, content, isPublic, image } = req.body;
		const userId = req.user._id;

		if (![title, content].every((field) => field?.trim())) {
			throw new ApiError(400, "Title and content are required");
		}

		const newBlog = await Blog.create({
			title,
			content,
			isPublic,
			image,
			user: userId,
		});

		res
			.status(201)
			.json(
				new ApiResponse(
					201,
					{ blog: newBlog },
					"Blog created successfully",
					true,
				),
			);
	} catch (error) {
		res
			.status(error instanceof ApiError ? error.statusCode : 500)
			.json(
				new ApiResponse(
					error instanceof ApiError ? error.statusCode : 500,
					null,
					error.message || "Internal Server Error",
					false,
				),
			);
	}
});

// tested

const updateBlog = asyncHandler(async (req, res) => {
	try {
		const blogId = req.params.id;
		const userId = req.user._id;

		const existingBlog = await Blog.findById(blogId);

		if (!existingBlog) {
			throw new ApiError(404, "Blog not found");
		}

		// if (String(existingBlog.user) !== String(userId)) {
		//   throw new ApiError(
		//     403,
		//     "Unauthorized - You do not have permission to edit this blog"
		//   );
		// }

		const updatedBlog = await Blog.findByIdAndUpdate(blogId, req.body, {
			new: true,
		});

		res
			.status(200)
			.json(
				new ApiResponse(
					200,
					{ blog: updatedBlog },
					"Blog updated successfully",
					true,
				),
			);
	} catch (error) {
		console.error("Error in updateBlog:", error.message);
		res
			.status(error instanceof ApiError ? error.statusCode : 500)
			.json(
				new ApiResponse(
					error instanceof ApiError ? error.statusCode : 500,
					null,
					error.message || "Internal Server Error",
					false,
				),
			);
	}
});

//  tested

const deleteBlog = asyncHandler(async (req, res) => {
	try {
		const blogId = req.params.id;
		const userId = req.user._id;

		const existingBlog = await Blog.findById(blogId);

		if (!existingBlog) {
			throw new ApiError(404, "Blog not found");
		}

		const deletedBlog = await Blog.findByIdAndDelete(blogId);

		if (!deletedBlog) {
			throw new ApiError(404, "Blog not found");
		}

		res
			.status(200)
			.json(new ApiResponse(200, {}, "Blog deleted successfully", true));
	} catch (error) {
		console.error("Error in deleteBlog:", error.message);
		res
			.status(error instanceof ApiError ? error.statusCode : 500)
			.json(
				new ApiResponse(
					error instanceof ApiError ? error.statusCode : 500,
					null,
					error.message || "Internal Server Error",
					false,
				),
			);
	}
});

export { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog };
