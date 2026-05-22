const PERMISSIONS = {
  super_admin: ['*'],
  admin: [
    'posts.create', 'posts.edit_all', 'posts.delete_all', 'posts.publish',
    'comments.manage_all', 'users.manage', 'users.change_role',
    'categories.manage', 'settings.manage', 'media.manage',
    'newsletter.manage', 'dashboard.view',
  ],
  moderator: [
    'posts.read', 'comments.manage_all', 'users.view', 'users.warn',
    'dashboard.view',
  ],
  editor: [
    'posts.create', 'posts.edit_all', 'posts.publish', 'posts.approve',
    'comments.manage_all', 'categories.manage', 'media.manage',
    'dashboard.view',
  ],
  author: [
    'posts.create', 'posts.edit_own', 'posts.publish_own', 'posts.delete_own',
    'comments.create', 'comments.edit_own', 'media.upload', 'profile.edit',
  ],
  contributor: [
    'posts.create', 'posts.edit_own', 'posts.delete_own',
    'comments.create', 'comments.edit_own', 'media.upload', 'profile.edit',
  ],
  member: [
    'posts.read', 'comments.create', 'comments.edit_own',
    'profile.edit', 'posts.like', 'posts.bookmark',
  ],
  guest: [
    'posts.read', 'comments.read',
  ],
};

const ROLE_MAP = {
  1: 'super_admin',
  2: 'admin',
  3: 'moderator',
  4: 'editor',
  5: 'author',
  6: 'contributor',
  7: 'member',
  8: 'guest',
};

const getRoleName = (role_id) => ROLE_MAP[role_id] || 'guest';

const hasPermission = (role_id, permission) => {
  const roleName = getRoleName(role_id);
  const perms = PERMISSIONS[roleName] || [];
  return perms.includes('*') || perms.includes(permission);
};

const checkRole = (permission) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Jo i autorizuar' });
  if (!hasPermission(req.user.role_id, permission)) {
    return res.status(403).json({ message: 'Nuk ke privilegje për këtë veprim' });
  }
  next();
};

module.exports = { checkRole, hasPermission, getRoleName, PERMISSIONS };
