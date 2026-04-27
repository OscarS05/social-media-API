-- USERS
CREATE TABLE users (
  id VARCHAR(36) NOT NULL,
  name VARCHAR(80) NOT NULL,
  role ENUM('member', 'admin') NOT NULL DEFAULT 'member',

  -- Auth
  email VARCHAR(80) NOT NULL,
  password VARCHAR(255) NULL,
  provider ENUM('local','google','facebook') NOT NULL DEFAULT 'local',
  provider_id VARCHAR(255) NULL,
  reset_token VARCHAR(255) NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,

  PRIMARY KEY (id),
  UNIQUE KEY users_email_unique (email, deleted_at),
  UNIQUE KEY users_oauth_unique (provider, provider_id, deleted_at),
  INDEX (email),
  INDEX (provider_id, provider)
);

-- SESSIONS
CREATE TABLE sessions (
  id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  token_hashed VARCHAR(255) NOT NULL,
  version INT NOT NULL,
  user_agent JSON NOT NULL,
  ip_address VARCHAR(45) NULL,
  revoked BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (user_id),
  INDEX (id, revoked),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- PROFILES
CREATE TABLE profiles (
  user_id VARCHAR(36) NOT NULL,
  username VARCHAR(50) NOT NULL,
  avatar_url TEXT NULL,
  cover_photo_url TEXT NULL,
  type_privacy ENUM('public','private') NOT NULL DEFAULT 'public',
  bio VARCHAR(255) NULL,
  website_url VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (user_id),
  UNIQUE KEY profiles_username_unique (username, deleted_at),
  INDEX (user_id),
  INDEX (username),
  CONSTRAINT profiles_user_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- FOLLOWS
CREATE TABLE follows (
  follower_id VARCHAR(36) NOT NULL,
  following_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY follows_unique (follower_id, following_id),
  INDEX (following_id),
  INDEX (follower_id),
  CONSTRAINT follows_follower_fk FOREIGN KEY (follower_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT follows_following_fk FOREIGN KEY (following_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- BLOCKS
CREATE TABLE blocks (
  blocker_id VARCHAR(36) NOT NULL,
  blocked_id VARCHAR(36) NOT NULL,
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
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  INDEX (profile_id),
  INDEX (created_at),
  CONSTRAINT posts_profile_fk FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- MEDIA_POSTS
CREATE TABLE media_posts (
  id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  url TEXT NOT NULL,
  type ENUM('image','video') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX (post_id),
  CONSTRAINT posts_media_fk FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- LIKES
CREATE TABLE likes (
  id VARCHAR(36) NOT NULL,
  profile_id VARCHAR(36) NOT NULL,
  likeable_type ENUM('post', 'comment') NOT NULL,
  likeable_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY unique_like (profile_id, likeable_type, likeable_id),
  INDEX (likeable_type, likeable_id),
  CONSTRAINT fk_like_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- COMMENTS
CREATE TABLE comments (
  id VARCHAR(36) NOT NULL,
  post_id VARCHAR(36) NOT NULL,
  profile_id VARCHAR(36) NOT NULL,
  parent_id VARCHAR(36) NULL,          -- NULL = comentario raíz, valor = respuesta a otro comentario
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL,

  PRIMARY KEY (id),
  INDEX (post_id),
  INDEX (profile_id),
  INDEX (parent_id),
  CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
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
