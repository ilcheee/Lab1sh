-- ── RBAC Migration: Replace 3-role system with 8-role system ──────────────────

-- Step 1: Temporarily allow NULL on role_id so we can delete roles safely
ALTER TABLE users MODIFY COLUMN role_id INT DEFAULT NULL;

-- Step 2: Replace roles
DELETE FROM roles;
INSERT INTO roles (id, emertimi) VALUES
  (1, 'super_admin'),
  (2, 'admin'),
  (3, 'moderator'),
  (4, 'editor'),
  (5, 'author'),
  (6, 'contributor'),
  (7, 'member'),
  (8, 'guest');

-- Step 3: Map old role IDs to new ones
-- Old: 1=Super Admin, 2=Editor, 3=Author
-- New: 1=super_admin, 2=admin, 3=moderator, 4=editor, 5=author, 6=contributor, 7=member, 8=guest
UPDATE users SET role_id = 5 WHERE role_id = 3; -- old Author  → new Author (5)
UPDATE users SET role_id = 4 WHERE role_id = 2; -- old Editor  → new Editor (4)
-- role_id = 1 stays as super_admin (1) ✓

-- Step 4: Set any remaining NULL / unknown roles to member (7)
UPDATE users SET role_id = 7 WHERE role_id IS NULL OR role_id NOT IN (1,2,3,4,5,6,7,8);

-- Step 5: Restore NOT NULL constraint
ALTER TABLE users MODIFY COLUMN role_id INT NOT NULL DEFAULT 7;

-- Step 6: Promote your admin account to super_admin (role_id = 1)
UPDATE users SET role_id = 1 WHERE email = 'admin@blog.com';

-- ── Verify ─────────────────────────────────────────────────────────────────────
SELECT id, emri, email, role_id FROM users ORDER BY role_id;
