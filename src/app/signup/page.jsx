const SignupForm = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      dob: '',
      gender: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [success, setSuccess] = useState(false);
    const { signup, isLoading, error } = useAuthStore();
  
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
      } else if (!validateUsername(formData.username)) {
        newErrors.username = 'Username must be at least 3 characters and contain only letters, numbers, and underscores';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (!validatePassword(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters with uppercase, number, and special character';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.dob) {
        newErrors.dob = 'Date of birth is required';
      }
      
      if (!formData.gender) {
        newErrors.gender = 'Please select your gender';
      }
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async () => {
      if (!validateForm()) return;
      
      const { confirmPassword, ...signupData } = formData;
      const result = await signup(signupData);
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSwitchToLogin();
        }, 3000);
      }
    };
  
    if (success) {
      return (
        <div className="text-center space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
            <p className="text-gray-600">Your account has been successfully created and is pending approval. You'll be redirected to login shortly.</p>
          </div>
        </div>
      );
    }
  
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600">Join us and start your journey</p>
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
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />
  
          <InputField
            icon={Mail}
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
  
          <InputField
            icon={Lock}
            type="password"
            name="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            showPasswordToggle={true}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
          />
  
          <InputField
            icon={Lock}
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            showPasswordToggle={true}
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
          />
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className={`
                    w-full pl-10 pr-4 py-3 
                    border-2 rounded-lg transition-all duration-300 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-green-500/20
                    ${errors.dob 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : 'border-gray-200 bg-white focus:border-green-500 hover:border-gray-300'
                    }
                  `}
                />
              </div>
              {errors.dob && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.dob}</span>
                </div>
              )}
            </div>
  
            <div className="space-y-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`
                    w-full pl-10 pr-4 py-3 
                    border-2 rounded-lg transition-all duration-300 ease-in-out
                    focus:outline-none focus:ring-2 focus:ring-green-500/20
                    ${errors.gender 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : 'border-gray-200 bg-white focus:border-green-500 hover:border-gray-300'
                    }
                  `}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {errors.gender && (
                <div className="flex items-center space-x-1 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errors.gender}</span>
                </div>
              )}
            </div>
          </div>
  
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
                <span>Creating account...</span>
              </div>
            ) : (
              'Create Account'
            )}
          </button>
        </div>
  
        <div className="text-center">
          <span className="text-gray-600">Already have an account? </span>
          <button
            onClick={onSwitchToLogin}
            className="text-green-600 hover:text-green-700 font-medium transition-colors duration-200"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  };
  