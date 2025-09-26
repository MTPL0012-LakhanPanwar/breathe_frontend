const LoginForm = ({ onSwitchToSignup }) => {
    const [formData, setFormData] = useState({
      username: '',
      password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const { login, isLoading, error } = useAuthStore();
  
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    };
  
    const validateForm = () => {
      const newErrors = {};
      
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async () => {
      if (!validateForm()) return;
      
      await login(formData);
    };
  
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>
  
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
  
        <div className="space-y-4">
          <InputField
            icon={User}
            type="text"
            name="username"
            placeholder="Enter your username or email"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />
  
          <InputField
            icon={Lock}
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            showPasswordToggle={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
  
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="
              w-full bg-gradient-to-r from-green-500 to-green-600 
              hover:from-green-600 hover:to-green-700
              text-white font-medium py-3 px-4 rounded-lg
              transition-all duration-300 ease-in-out
              focus:outline-none focus:ring-4 focus:ring-green-500/20
              disabled:opacity-70 disabled:cursor-not-allowed
              transform hover:scale-[1.02] active:scale-[0.98]
            "
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader className="h-5 w-5 animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
  
        <div className="text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <button
            onClick={onSwitchToSignup}
            className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
          >
            Sign up
          </button>
        </div>
      </div>
    );
  };
  