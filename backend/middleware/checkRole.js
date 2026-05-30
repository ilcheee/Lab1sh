const PERMISSIONS = {
  super_admin: ['*'],
  admin: [
    'posts.create', 'posts.edit_all', 'posts.delete_all', 'posts.publish', 'posts.approve',
    'comments.create', 'comments.edit_own', 'comments.manage_all',
    'users.manage', 'users.change_role',
    'categories.manage', 'settings.manage', 'media.manage', 'media.upload',
    'newsletter.manage', 'dashboard.view',
  ],
  redaktor: [
    'posts.create', 'posts.edit_all', 'posts.delete_all', 'posts.publish', 'posts.approve',
    'comments.create', 'comments.edit_own', 'comments.manage_all',
    'dashboard.view',
  ],
  editor: [
    'posts.create', 'posts.edit_all',
    'comments.create', 'comments.edit_own',
    'categories.manage', 'media.manage', 'media.upload',
    'dashboard.view',
  ],
  author: [
    'posts.create', 'posts.edit_own', 'posts.delete_own',
    'comments.create', 'comments.edit_own', 'media.upload', 'profile.edit',
  ],
  contributor: [
    'posts.create', 'posts.edit_own',
    'comments.create', 'comments.edit_own', 'media.upload', 'profile.edit',
  ],
  member: [
    'posts.read', 'profile.edit',
  ],
  guest: [
    'posts.read',
  ],
};

const ROLE_MAP = {
  1: 'super_admin',
  2: 'admin',
  3: 'redaktor',
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
