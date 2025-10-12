// src/shared/constants/post.constants.js
export const POST_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  SCHEDULED: "scheduled",
  ARCHIVED: "archived",
};

export const POST_VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
  UNLISTED: "unlisted",
};

export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
};

export const CACHE_PREFIXES = {
  POST: "post",
  POSTS_BY_USER: "posts_by_user",
  POST_BY_USERNAME_AND_ID: "post_by_username_and_id",
  USER: "user",
};
