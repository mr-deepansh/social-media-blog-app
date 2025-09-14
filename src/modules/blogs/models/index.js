// src/modules/blogs/models/index.js

// Post models
export { Post } from "./post/post.model.js";

// Comment models
export { Comment } from "./comment/comment.model.js";

// Engagement models
export { Like, Share, Bookmark, View, Repost } from "./engagement/engagement.model.js";

// Media models
export { Media } from "./media/media.model.js";

// Shared utilities
export { baseSchema, baseOptions, metadataSchema, auditSchema } from "./shared/base.model.js";

// Legacy exports for backward compatibility
export { Post as Blog } from "./post/post.model.js";
