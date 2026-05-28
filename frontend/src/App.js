import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public
import HomePage from './pages/public/Home';
import PostsFeed from './pages/public/PostsFeed';
import SinglePost from './pages/public/SinglePost';
import CategoryPosts from './pages/public/CategoryPosts';
import UserPostForm from './pages/public/UserPostForm';
import UserProfile from './pages/public/UserProfile';
import About from './pages/public/About';

// Admin dashboard
import Dashboard from './pages/dashboard/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';

// Admin content
import PostList from './pages/posts/PostList';
import PostForm from './pages/posts/PostForm';
import CategoryList from './pages/categories/CategoryList';
import CategoryForm from './pages/categories/CategoryForm';
import TagList from './pages/tags/TagList';
import TagForm from './pages/tags/TagForm';
import CommentList from './pages/comments/CommentList';
import PageList from './pages/pages/PageList';
import PageForm from './pages/pages/PageForm';
import MediaList from './pages/media/MediaList';
import SettingList from './pages/settings/SettingsList';
import NewsletterList from './pages/newsletter/NewsletterList';

// Any authenticated user (role 1–7)
const AuthRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

// Logged-in users only for blog pages; guests → register with message
const BlogRoute = ({ children }) => {
  const { token } = useAuth();
  if (!token) return <Navigate to="/register" state={{ message: 'Krijo llogari për të lexuar postimet' }} />;
  return children;
};

// role_id 1–2 (super_admin, admin)
const AdminRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (!user || user.role_id > 2) return <Navigate to="/profile" />;
  return children;
};

// role_id 1–4 (super_admin through editor)
const EditorRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (!user || user.role_id > 4) return <Navigate to="/profile" />;
  return children;
};

// role_id 1–3 (super_admin, admin, redaktor)
const RedaktorRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (!user || user.role_id > 3) return <Navigate to="/profile" />;
  return children;
};

// role_id 1–6 (anyone who can create content)
const WriterRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (!user || user.role_id > 6) return <Navigate to="/profile" />;
  return children;
};

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
};

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.key}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          {/* ── Public (no login required) ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── Blog (requires login) ── */}
          <Route path="/blog" element={<BlogRoute><PostsFeed /></BlogRoute>} />
          <Route path="/blog/new" element={<WriterRoute><UserPostForm /></WriterRoute>} />
          <Route path="/blog/category/:slug" element={<BlogRoute><CategoryPosts /></BlogRoute>} />
          <Route path="/blog/:id" element={<BlogRoute><SinglePost /></BlogRoute>} />

          {/* ── Profile (any logged-in user, role 1–7) ── */}
          <Route path="/profile" element={<AuthRoute><UserProfile /></AuthRoute>} />
          <Route path="/profile/:id" element={<UserProfile />} />

          {/* ── Admin only (roles 1–2) ── */}
          <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/settings" element={<AdminRoute><SettingList /></AdminRoute>} />
          <Route path="/newsletter" element={<AdminRoute><NewsletterList /></AdminRoute>} />

          {/* ── Redaktor+ (roles 1–3): can approve posts ── */}
          <Route path="/comments" element={<RedaktorRoute><CommentList /></RedaktorRoute>} />

          {/* ── Editor+ (roles 1–4) ── */}
          <Route path="/categories" element={<EditorRoute><CategoryList /></EditorRoute>} />
          <Route path="/categories/new" element={<EditorRoute><CategoryForm /></EditorRoute>} />
          <Route path="/categories/edit/:id" element={<EditorRoute><CategoryForm /></EditorRoute>} />
          <Route path="/tags" element={<EditorRoute><TagList /></EditorRoute>} />
          <Route path="/tags/new" element={<EditorRoute><TagForm /></EditorRoute>} />
          <Route path="/tags/edit/:id" element={<EditorRoute><TagForm /></EditorRoute>} />
          <Route path="/pages" element={<EditorRoute><PageList /></EditorRoute>} />
          <Route path="/pages/new" element={<EditorRoute><PageForm /></EditorRoute>} />
          <Route path="/pages/edit/:id" element={<EditorRoute><PageForm /></EditorRoute>} />

          {/* ── Writer+ (roles 1–6) ── */}
          <Route path="/posts" element={<WriterRoute><PostList /></WriterRoute>} />
          <Route path="/posts/new" element={<WriterRoute><PostForm /></WriterRoute>} />
          <Route path="/posts/edit/:id" element={<WriterRoute><PostForm /></WriterRoute>} />
          <Route path="/media" element={<WriterRoute><MediaList /></WriterRoute>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
