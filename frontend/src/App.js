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

// Requires any authenticated user
const AuthRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

// Requires role_id === 1 (Super Admin)
const AdminRoute = ({ children }) => {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (user?.role_id !== 1) return <Navigate to="/profile" />;
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

        {/* ── Admin ── */}
        <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/posts" element={<AdminRoute><PostList /></AdminRoute>} />
        <Route path="/posts/new" element={<AdminRoute><PostForm /></AdminRoute>} />
        <Route path="/posts/edit/:id" element={<AdminRoute><PostForm /></AdminRoute>} />
        <Route path="/categories" element={<AdminRoute><CategoryList /></AdminRoute>} />
        <Route path="/categories/new" element={<AdminRoute><CategoryForm /></AdminRoute>} />
        <Route path="/categories/edit/:id" element={<AdminRoute><CategoryForm /></AdminRoute>} />
        <Route path="/tags" element={<AdminRoute><TagList /></AdminRoute>} />
        <Route path="/tags/new" element={<AdminRoute><TagForm /></AdminRoute>} />
        <Route path="/tags/edit/:id" element={<AdminRoute><TagForm /></AdminRoute>} />
        <Route path="/comments" element={<AdminRoute><CommentList /></AdminRoute>} />
        <Route path="/pages" element={<AdminRoute><PageList /></AdminRoute>} />
        <Route path="/pages/new" element={<AdminRoute><PageForm /></AdminRoute>} />
        <Route path="/pages/edit/:id" element={<AdminRoute><PageForm /></AdminRoute>} />
        <Route path="/media" element={<AdminRoute><MediaList /></AdminRoute>} />
        <Route path="/settings" element={<AdminRoute><SettingList /></AdminRoute>} />
        <Route path="/newsletter" element={<AdminRoute><NewsletterList /></AdminRoute>} />
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
