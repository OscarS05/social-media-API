-- USERS
CREATE TABLE users (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- PROFILES
CREATE TABLE profiles (
  id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  username VARCHAR(50) NOT NULL,
  avatar_url TEXT NULL,
  cover_photo_url TEXT NULL,
  type_privacy ENUM('public','private') NOT NULL DEFAULT 'public',
  bio VARCHAR(255) NULL,
  website_url VARCHAR(255) NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY profiles_username_unique (username, deleted_at),
  INDEX (user_id),
  INDEX (username),
  CONSTRAINT profiles_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- AUTH
CREATE TABLE auth (
  id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  email VARCHAR(255) NULL,
  password VARCHAR(255) NULL,
  provider ENUM('local','google','facebook') NOT NULL DEFAULT 'local',
  provider_user_id VARCHAR(255) NULL,
  reset_token VARCHAR(255) NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY oauth_unique (provider, provider_user_id, deleted_at),
  INDEX (provider_user_id, provider),
  INDEX (email),
  CONSTRAINT auth_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- REFRESH_TOKENS
CREATE TABLE refresh_tokens (
  id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  token_hashed VARCHAR(255) NOT NULL,
  user_agent VARCHAR(255) NULL,
  ip_address VARCHAR(45) NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (user_id),
  INDEX (token_hashed),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- FOLLOWS
CREATE TABLE follows (
  id VARCHAR(36) NOT NULL,
  follower_id VARCHAR(36) NOT NULL,
  following_id VARCHAR(36) NOT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY follows_unique_active (follower_id, following_id, deleted_at),
  CONSTRAINT follows_follower_fk FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT follows_following_fk FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX (following_id),
  INDEX (follower_id),
  INDEX (created_at)
);

-- BLOCKS
CREATE TABLE blocks (
  id VARCHAR(36) NOT NULL,
  blocker_id VARCHAR(36) NOT NULL,
  blocked_id VARCHAR(36) NOT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY blocks_unique_active (blocker_id, blocked_id, deleted_at),
  CONSTRAINT blocks_blocker_fk FOREIGN KEY (blocker_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT blocks_blocked_fk FOREIGN KEY (blocked_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- POSTS
CREATE TABLE posts (
  id VARCHAR(36) NOT NULL,
  profile_id VARCHAR(36) NOT NULL,
  content TEXT NULL,
  media_url TEXT NULL,
  media_type ENUM('image','video') NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (profile_id),
  INDEX (created_at),
  CONSTRAINT posts_profile_fk FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- LIKES_POSTS
CREATE TABLE likes_posts (
  id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  profile_id VARCHAR(36) NOT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY likes_posts_unique_active (post_id, profile_id, deleted_at),
  CONSTRAINT likes_posts_post_fk FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT likes_posts_profile_fk FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX (profile_id),
  INDEX (post_id)
);

-- COMMENTS
CREATE TABLE comments (
  id VARCHAR(36) NOT NULL,
  profile_id VARCHAR(36) NULL,
  post_id VARCHAR(36) NOT NULL,
  parent_comment_id VARCHAR(36) NULL,
  content TEXT NOT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (post_id),
  INDEX (profile_id),
  CONSTRAINT comments_profile_fk FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT comments_post_fk FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT comments_parent_fk FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- LIKES_COMMENTS
CREATE TABLE likes_comments (
  id VARCHAR(36) NOT NULL,
  comment_id VARCHAR(36) NOT NULL,
  profile_id VARCHAR(36) NOT NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY likes_comments_unique_active (comment_id, profile_id, deleted_at),
  CONSTRAINT likes_comments_comment_fk FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
  CONSTRAINT likes_comments_profile_fk FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX (profile_id),
  INDEX (comment_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
  id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  actor_id VARCHAR(36) NULL,
  recipient_id VARCHAR(36) NOT NULL,
  action_type ENUM('like','comment','follow') NOT NULL,
  entity_type ENUM('post','comment','profile') NOT NULL,
  entity_id VARCHAR(36) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (recipient_id),
  CONSTRAINT notifications_actor_fk FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT notifications_recipient_fk FOREIGN KEY (recipient_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- CHATS
CREATE TABLE chats (
  id VARCHAR(36) NOT NULL,
  owner_profile_id VARCHAR(36) NULL,
  description VARCHAR(255) NULL,
  type ENUM('personal','group','broadcasting') NOT NULL DEFAULT 'personal',
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (owner_profile_id),
  CONSTRAINT chats_owner_fk FOREIGN KEY (owner_profile_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- CHATS_MEMBERS
CREATE TABLE chats_members (
  id VARCHAR(36) NOT NULL,
  chat_id VARCHAR(36) NOT NULL,
  profile_id VARCHAR(36) NOT NULL,
  role ENUM('member','admin') NOT NULL DEFAULT 'member',
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY chats_members_unique_active (chat_id, profile_id, deleted_at),
  CONSTRAINT chats_members_chat_fk FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  CONSTRAINT chats_members_profile_fk FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX (chat_id),
  INDEX (profile_id)
);

-- CHATS_MESSAGES
CREATE TABLE chats_messages (
  id VARCHAR(36) NOT NULL,
  chat_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NULL,
  content TEXT NULL,
  resource_url VARCHAR(255) NULL,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (chat_id),
  INDEX (sender_id),
  CONSTRAINT chats_messages_chat_fk FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE,
  CONSTRAINT chats_messages_sender_fk FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE SET NULL
);

-- MESSAGE_READ_RECEIPTS
CREATE TABLE message_read_receipts (
  id VARCHAR(36) NOT NULL,
  message_id VARCHAR(36) NOT NULL,
  profile_id VARCHAR(36) NOT NULL,
  read_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY message_read_receipts_unique_active (message_id, profile_id, deleted_at),
  CONSTRAINT message_read_receipts_message_fk FOREIGN KEY (message_id) REFERENCES chats_messages(id) ON DELETE CASCADE,
  CONSTRAINT message_read_receipts_profile_fk FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  INDEX (message_id),
  INDEX (profile_id)
);
