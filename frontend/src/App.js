import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

// Any authenticated user
const AuthRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
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

// role_id 1–6 (anyone who can create content)
const WriterRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (!user || user.role_id > 6) return <Navigate to="/profile" />;
  return children;
};

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/blog" element={<PostsFeed />} />
        <Route path="/blog/new" element={<AuthRoute><UserPostForm /></AuthRoute>} />
        <Route path="/blog/category/:slug" element={<CategoryPosts />} />
        <Route path="/blog/:id" element={<SinglePost />} />
        <Route path="/about" element={<About />} />

        {/* ── Auth ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Profile ── */}
        <Route path="/profile" element={<AuthRoute><UserProfile /></AuthRoute>} />
        <Route path="/profile/:id" element={<UserProfile />} />

        {/* ── Admin only (roles 1–2) ── */}
        <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/settings" element={<AdminRoute><SettingList /></AdminRoute>} />
        <Route path="/newsletter" element={<AdminRoute><NewsletterList /></AdminRoute>} />

        {/* ── Editor+ (roles 1–4) ── */}
        <Route path="/categories" element={<EditorRoute><CategoryList /></EditorRoute>} />
        <Route path="/categories/new" element={<EditorRoute><CategoryForm /></EditorRoute>} />
        <Route path="/categories/edit/:id" element={<EditorRoute><CategoryForm /></EditorRoute>} />
        <Route path="/tags" element={<EditorRoute><TagList /></EditorRoute>} />
        <Route path="/tags/new" element={<EditorRoute><TagForm /></EditorRoute>} />
        <Route path="/tags/edit/:id" element={<EditorRoute><TagForm /></EditorRoute>} />
        <Route path="/comments" element={<EditorRoute><CommentList /></EditorRoute>} />
        <Route path="/pages" element={<EditorRoute><PageList /></EditorRoute>} />
        <Route path="/pages/new" element={<EditorRoute><PageForm /></EditorRoute>} />
        <Route path="/pages/edit/:id" element={<EditorRoute><PageForm /></EditorRoute>} />

        {/* ── Writer+ (roles 1–6) ── */}
        <Route path="/posts" element={<WriterRoute><PostList /></WriterRoute>} />
        <Route path="/posts/new" element={<WriterRoute><PostForm /></WriterRoute>} />
        <Route path="/posts/edit/:id" element={<WriterRoute><PostForm /></WriterRoute>} />
        <Route path="/media" element={<WriterRoute><MediaList /></WriterRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
