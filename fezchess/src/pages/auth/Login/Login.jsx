import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../../services/authService';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.login({ username, password });
      
      // Redirect based on role
      if (user.role === 'Admin') {
        navigate('/dashboard');
      } else if (user.role === 'Teacher') {
        navigate('/teacher/dashboard');
      } else if (user.role === 'Parent') {
        navigate('/parent/schedule');
      } else if (user.role === 'Student') {
        navigate('/student/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error("Login failed", err);
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-border overflow-hidden"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center mx-auto text-2xl shadow-lg shadow-primary/20">
                ♔
              </div>
            </Link>
            <h1 className="font-display text-2xl font-bold text-gray-900">Đăng Nhập</h1>
            <p className="text-sm text-gray-500 mt-2">Truy cập hệ thống quản lý Z Chess</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="admin"
                  required
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="••••••"
                  required
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng nhập
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
             <Link to="/" className="text-sm text-gray-500 hover:text-primary transition-colors">
               ← Quay lại trang chủ
             </Link>
          </div>
        </div>
        
        {/* Decorative bottom bar */}
        <div className="h-1.5 bg-gradient-to-r from-primary via-blue-400 to-indigo-500 w-full"></div>
      </motion.div>
    </div>
  );
};

export default Login;
