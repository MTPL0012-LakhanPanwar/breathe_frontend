// Profile Component
const Profile = () => {
    const { user, updateProfile, isLoadingProfile, profileError } = useAuth();
    const [formData, setFormData] = useState({
      username: user?.username || '',
      gender: user?.gender || '',
      dob: user?.dob || ''
    });
    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
  
    useEffect(() => {
      if (user) {
        setFormData({
          username: user.username || '',
          gender: user.gender || '',
          dob: user.dob || ''
        });
      }
    }, [user]);
  
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
      
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
      }
    };
  
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };
  
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Edit3 className="h-4 w-4" />
            <span>{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>
  
        {profileError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{profileError}</span>
          </div>
        )}
  
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center">
                <span className="text-green-700 font-bold text-xl">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{user?.username}</h3>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
  
            {isEditing ? (
              <div className="space-y-4">
                <InputField
                  icon={User}
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
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
                  onClick={handleSubmit}
                  disabled={isLoadingProfile}
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
                  {isLoadingProfile ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader className="h-5 w-5 animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    'Update Profile'
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      User Type
                    </label>
                    <p className="text-gray-900 capitalize">{user?.userType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <p className="text-gray-900">{formatDate(user?.dob)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <p className="text-gray-900 capitalize">{user?.gender}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Status
                    </label>
                    <div className="flex space-x-2">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${user?.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }
                      `}>
                        {user?.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${user?.isApproved 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                        }
                      `}>
                        {user?.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Member Since
                    </label>
                    <p className="text-gray-900">{formatDate(user?.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  