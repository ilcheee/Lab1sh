export const ROLES = {
  SUPER_ADMIN: 1, ADMIN: 2, MODERATOR: 3, EDITOR: 4,
  AUTHOR: 5, CONTRIBUTOR: 6, MEMBER: 7, GUEST: 8,
};

export const ROLE_NAMES = {
  1: 'Super Admin', 2: 'Admin', 3: 'Moderator',
  4: 'Editor', 5: 'Author', 6: 'Contributor',
  7: 'Member', 8: 'Guest',
};

export const ROLE_ICONS = {
  1: '👑', 2: '⚙️', 3: '🛡️', 4: '📚',
  5: '✍️', 6: '📝', 7: '👤', 8: '👀',
};

export const canAccess = (user, area) => {
  if (!user) return false;
  const id = user.role_id;
  switch (area) {
    case 'admin':     return id <= 2;
    case 'moderator': return id <= 3;
    case 'editor':    return id <= 4;
    case 'write':     return id <= 6;
    case 'comment':   return id <= 7;
    default:          return false;
  }
};

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

const ROLE_SLUG = {
  1: 'super_admin', 2: 'admin', 3: 'moderator', 4: 'editor',
  5: 'author', 6: 'contributor', 7: 'member', 8: 'guest',
};

export const hasPermission = (user, permission) => {
  if (!user) return false;
  const slug = ROLE_SLUG[user.role_id] || 'guest';
  const perms = PERMISSIONS[slug] || [];
  return perms.includes('*') || perms.includes(permission);
};

export const canDo = (user, action) => hasPermission(user, action);

// legacy alias
export const ROLE_IDS = ROLES;
export const ROLE_LABELS = ROLE_NAMES;
