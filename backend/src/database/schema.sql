-- =========================
-- DATABASE
-- =========================
CREATE DATABASE lms_ai;

-- After Runing this query the queries bellow must be run
-- =========================
-- ROLES
-- =========================
CREATE TABLE
    roles (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(20) UNIQUE NOT NULL
    );

INSERT INTO
    roles (role_name)
VALUES
    ('student'),
    ('teacher'),
    ('admin'),
    ('super_admin');

-- Setting the super admin acount manuly
UPDATE users
SET
    role_id = (
        SELECT
            id
        FROM
            roles
        where
            role_name = 'super_admin'
    )
WHERE
    id = < user_id >;

-- =========================
-- USERS
-- =========================
CREATE TABLE
    users (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        username VARCHAR(100) UNIQUE,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        profile_photo_url TEXT,
        bio TEXT,
        expertise VARCHAR(255),
        experience VARCHAR(255),
        role_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE RESTRICT
    );

-- =========================
-- COURSES
-- =========================
CREATE TABLE
    courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        level VARCHAR(20) NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
        prerequisite_course_id INTEGER,
        thumbnail_url TEXT,
        teacher_id INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_prerequisite FOREIGN KEY (prerequisite_course_id) REFERENCES courses (id) ON DELETE SET NULL,
        CONSTRAINT fk_teacher FOREIGN KEY (teacher_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- =========================
-- COURSES_SECTION
-- =========================
CREATE TABLE
    course_sections (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        position INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_section_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );

--  ==========================
-- Viedeo Section
-- ==========================
CREATE TABLE
    course_videos (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        section_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        video_type VARCHAR(20) DEFAULT 'url', -- 'url' | 'upload'
        video_path TEXT, -- local file
        video_url TEXT, -- external
        thumbnail_url TEXT,
        duration INTEGER NOT NULL, -- in seconds
        position INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_video_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        CONSTRAINT fk_video_section FOREIGN KEY (section_id) REFERENCES course_sections (id) ON DELETE CASCADE
    );

-- =========================
-- Watch video Section
-- =========================
CREATE TABLE
    video_watches (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        video_id INTEGER NOT NULL,
        progress_seconds INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_watch_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_watch_video FOREIGN KEY (video_id) REFERENCES course_videos (id) ON DELETE CASCADE,
        CONSTRAINT unique_user_video UNIQUE (user_id, video_id)
    );

-- =========================
-- COURSE FILES section
-- =========================
CREATE TABLE
    course_files (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        section_id INTEGER NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        stored_name VARCHAR(255) NOT NULL,
        file_url TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type VARCHAR(100),
        uploaded_by INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_file_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        CONSTRAINT fk_file_section FOREIGN key (section_id) REFERENCES course_sections (id) ON DELETE CASCADE,
        CONSTRAINT fk_file_uploader FOREIGN key (uploaded_by) REFERENCES users (id) ON DELETE SET NULL,
        CONSTRAINT unique_file_per_section UNIQUE (section_id, file_name)
    );

-- =========================
-- file downloads section(downloaded files by students);
-- =========================
CREATE TABLE
    file_downloads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        file_id INTEGER NOT NULL,
        downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_download_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_download_file FOREIGN KEY (file_id) REFERENCES course_files (id) ON DELETE CASCADE,
        CONSTRAINT unique_user_file UNIQUE (user_id, file_id)
    );

-- =========================
-- CERTIFICATES
-- =========================
CREATE TABLE
    certificates (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        certificate_code VARCHAR(100) UNIQUE,
        status VARCHAR(20) DEFAULT 'pending',
        approved_by INTEGER,
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_certificate_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_certificate_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        CONSTRAINT fk_certificate_aprover FOREIGN KEY (approved_by) REFERENCES users (id) ON DELETE SET NULL,
        CONSTRAINT unique_user_course_certificate UNIQUE (user_id, course_id)
    );

CREATE INDEX idx_certificate_code ON certificates (certificate_code);

ALTER TABLE certificates
ADD COLUMN integrity_hash TEXT;

CREATE INDEX idx_integrity_hash ON cretificates (integrity_hash);

-- =========================
-- ENROLLMENTS
-- =========================
CREATE TABLE
    enrollments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active')),
        current_step VARCHAR(30) NOT NULL DEFAULT 'completed',
        learning_goal TEXT,
        interest_topics TEXT,
        experience_level VARCHAR(30),
        learning_motivation TEXT,
        preferred_difficulty VARCHAR(30),
        study_time_per_week VARCHAR(30),
        accepted_terms BOOLEAN NOT NULL DEFAULT true,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activated_at TIMESTAMP,
        CONSTRAINT fk_user_enroll FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_course_enroll FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        CONSTRAINT unique_enrollment UNIQUE (user_id, course_id)
    );

-- =========================
-- PROGRESS
-- =========================
CREATE TABLE
    progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        progress_percent INTEGER NOT NULL CHECK (progress_percent BETWEEN 0 AND 100),
        manual_percent INTEGER DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_progress FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_course_progress FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        CONSTRAINT unique_progress UNIQUE (user_id, course_id)
    );

ALTER TABLE progress
ADD COLUMN manual_percent INTEGER DEFAULT 0;

ALTER TABLE progress ADD CONSTRAINT unique_user_course_progress UNIQUE (user_id, course_id);

-- =========================
-- RULES (Rule-Based AI)
-- =========================
CREATE TABLE
    rules (
        id SERIAL PRIMARY KEY,
        condition_type VARCHAR(50) NOT NULL,
        condition_value VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        priority INTEGER NOT NULL
    );

-- =========================
-- Comments Section
-- =========================
CREATE TABLE
    comments (
        id SERIAL PRIMARY KEY,
        comment TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user_comment FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT fk_course_comment FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
    );

-- =========================
-- like Comments section
-- =========================
CREATE TABLE
    like_comments (
        id SERIAL PRIMARY KEY,
        comment_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_comment_liked FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_liked FOREIGN key (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT unique_user_comment UNIQUE (user_id, comment_id)
    );

CREATE INDEX idx_comment_likes_comment_id ON comment_likes (comment_id);

CREATE INDEX idx_comment_likes_user_id ON comment_likes (user_id);

-- =========================
-- like courses section
-- =========================
CREATE TABLE
    like_courses (
        id SERIAL PRIMARY KEY,
        course_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_course_liked FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        CONSTRAINT fk_user_liked FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        CONSTRAINT unique_user_course UNIQUE (user_id, course_id)
    );

CREATE INDEX idx_like_courses_course_id ON like_courses (course_id);

CREATE INDEX idx_like_courses_user_id ON like_courses (user_id);




-- ===================================================================================================
-- Aditional codes
-- ===================================================================================================

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- NEW - PROFILE PHOTO FEATURE: profile management columns for existing databases.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(100);

-- ===== PROFILE PHOTO FEATURE START =====
ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users'
    AND column_name = 'avatar_url'
  ) THEN
    UPDATE users
    SET profile_photo_url = avatar_url
    WHERE profile_photo_url IS NULL
    AND avatar_url IS NOT NULL;
  END IF;
END $$;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS expertise VARCHAR(255);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS experience VARCHAR(255);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_username_unique'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_username_unique UNIQUE (username);
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'courses'
    AND column_name = 'image_url'
  ) THEN
    UPDATE courses
    SET thumbnail_url = image_url
    WHERE thumbnail_url IS NULL
    AND image_url IS NOT NULL;
  END IF;
END $$;

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS current_step VARCHAR(30) NOT NULL DEFAULT 'completed';

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS learning_goal TEXT;

-- NEW FEATURE: learner intake data collected during enrollment for personalization.
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS interest_topics TEXT;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(30);

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS learning_motivation TEXT;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS preferred_difficulty VARCHAR(30);

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS study_time_per_week VARCHAR(30);

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;

UPDATE enrollments
SET activated_at = enrolled_at
WHERE activated_at IS NULL
AND status = 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_status_check'
  ) THEN
    ALTER TABLE enrollments
    ADD CONSTRAINT enrollments_status_check
    CHECK (status IN ('pending', 'active'));
  END IF;
END $$;




-- ===================================================================================================
-- Aditional codes (part 2)
-- ===================================================================================================

-- =====================================================
-- BAMIKA LMS FIX / UPDATE QUERIES
-- Course thumbnails + profile system + enrollment steps
-- =====================================================


-- 1. COURSE THUMBNAIL SUPPORT
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- If your old database had image_url, copy it into thumbnail_url
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'courses'
    AND column_name = 'image_url'
  ) THEN
    UPDATE courses
    SET thumbnail_url = image_url
    WHERE thumbnail_url IS NULL
    AND image_url IS NOT NULL;
  END IF;
END $$;


-- 2. USER PROFILE SYSTEM
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS expertise VARCHAR(255);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS experience VARCHAR(255);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

-- Fill username for old users
UPDATE users
SET username = LOWER(
  REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9_]+', '_', 'g')
) || '_' || id
WHERE username IS NULL OR username = '';

-- Add unique username constraint safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'users_username_unique'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_username_unique UNIQUE (username);
  END IF;
END $$;


-- 3. ENROLLMENT STEP SYSTEM
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS current_step VARCHAR(30) NOT NULL DEFAULT 'completed';

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS learning_goal TEXT;

-- NEW FEATURE: learner intake data collected during enrollment for personalization.
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS interest_topics TEXT;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(30);

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS learning_motivation TEXT;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS preferred_difficulty VARCHAR(30);

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS study_time_per_week VARCHAR(30);

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;

UPDATE enrollments
SET activated_at = enrolled_at
WHERE activated_at IS NULL
AND status = 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'enrollments_status_check'
  ) THEN
    ALTER TABLE enrollments
    ADD CONSTRAINT enrollments_status_check
    CHECK (status IN ('pending', 'active'));
  END IF;
END $$;


-- 4. PROGRESS FIXES
ALTER TABLE progress
ADD COLUMN IF NOT EXISTS manual_percent INTEGER DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'unique_user_course_progress'
  ) THEN
    ALTER TABLE progress
    ADD CONSTRAINT unique_user_course_progress UNIQUE (user_id, course_id);
  END IF;
END $$;
-- ===== PROFILE PHOTO FEATURE END =====





-- ===================================================================================================
-- Aditional codes (part 3)
-- ===================================================================================================


BEGIN;

-- USER PROFILE / PROFILE PHOTO
ALTER TABLE users
ADD COLUMN IF NOT EXISTS username VARCHAR(100);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS expertise VARCHAR(255);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS experience VARCHAR(255);

ALTER TABLE users
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_username_unique'
  ) THEN
    ALTER TABLE users
    ADD CONSTRAINT users_username_unique UNIQUE (username);
  END IF;
END $$;

-- COURSE THUMBNAILS
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

ALTER TABLE courses
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses'
    AND column_name = 'image_url'
  ) THEN
    UPDATE courses
    SET thumbnail_url = image_url
    WHERE thumbnail_url IS NULL
    AND image_url IS NOT NULL;
  END IF;
END $$;

-- ENROLLMENT FLOW / LEARNER INTAKE
ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS current_step VARCHAR(30) NOT NULL DEFAULT 'completed';

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS learning_goal TEXT;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS interest_topics TEXT;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(30);

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS learning_motivation TEXT;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS preferred_difficulty VARCHAR(30);

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS study_time_per_week VARCHAR(30);

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE enrollments
ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;

UPDATE enrollments
SET activated_at = COALESCE(activated_at, enrolled_at)
WHERE status = 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_status_check'
  ) THEN
    ALTER TABLE enrollments
    ADD CONSTRAINT enrollments_status_check
    CHECK (status IN ('pending', 'active'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_enrollment'
  ) THEN
    ALTER TABLE enrollments
    ADD CONSTRAINT unique_enrollment UNIQUE (user_id, course_id);
  END IF;
END $$;

-- PROGRESS SUPPORT
ALTER TABLE progress
ADD COLUMN IF NOT EXISTS manual_percent INTEGER DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_course_progress'
  ) THEN
    ALTER TABLE progress
    ADD CONSTRAINT unique_user_course_progress UNIQUE (user_id, course_id);
  END IF;
END $$;

COMMIT;




====================================================================

-- ===================================================================================================


BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS expertise VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS experience VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_username_unique') THEN
    ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);
  END IF;
END $$;

ALTER TABLE courses ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'courses' AND column_name = 'image_url'
  ) THEN
    UPDATE courses
    SET thumbnail_url = image_url
    WHERE thumbnail_url IS NULL AND image_url IS NOT NULL;
  END IF;
END $$;

ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS current_step VARCHAR(30) NOT NULL DEFAULT 'completed';
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS learning_goal TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS interest_topics TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS experience_level VARCHAR(30);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS learning_motivation TEXT;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS preferred_difficulty VARCHAR(30);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS study_time_per_week VARCHAR(30);
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS accepted_terms BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP;

UPDATE enrollments
SET activated_at = COALESCE(activated_at, enrolled_at)
WHERE status = 'active';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'enrollments_status_check') THEN
    ALTER TABLE enrollments
    ADD CONSTRAINT enrollments_status_check CHECK (status IN ('pending', 'active'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_enrollment') THEN
    ALTER TABLE enrollments
    ADD CONSTRAINT unique_enrollment UNIQUE (user_id, course_id);
  END IF;
END $$;

ALTER TABLE progress ADD COLUMN IF NOT EXISTS manual_percent INTEGER DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_course_progress') THEN
    ALTER TABLE progress
    ADD CONSTRAINT unique_user_course_progress UNIQUE (user_id, course_id);
  END IF;
END $$;

COMMIT;