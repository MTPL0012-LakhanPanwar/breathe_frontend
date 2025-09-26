// Enhanced Zustand store with all API calls
const useAuthStore = (() => {
  let listeners = [];
  let state = {
    // Auth state
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,

    // Loading states
    isLoading: false,
    isLoadingUsers: false,
    isLoadingProfile: false,
    isLoadingChat: false,

    // Error states
    error: null,
    usersError: null,
    profileError: null,
    chatError: null,

    // Success states
    successMessage: null,

    // Data states
    users: [],
    currentProfile: null,
    chatMessages: [],

    // UI state
    activeTab: "dashboard",
  };

  const setState = (partial) => {
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener(state));
  };

  const getState = () => state;

  const subscribe = (listener) => {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  };

  // Clear success message after timeout
  const showSuccessMessage = (message) => {
    setState({ successMessage: message });
    setTimeout(() => {
      setState({ successMessage: null });
    }, 3000);
  };

  // Initialize from localStorage
  const initializeAuth = () => {
    try {
      const token = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");
      const user = localStorage.getItem("user");

      if (token && refresh && user) {
        setState({
          accessToken: token,
          refreshToken: refresh,
          user: JSON.parse(user),
          isAuthenticated: true,
        });
      }
    } catch (error) {
      console.error("Error initializing auth:", error);
    }
  };

  // Auth actions
  const login = async (credentials) => {
    setState({ isLoading: true, error: null });

    try {
      const data = await apiService.login(credentials);

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      setState({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      showSuccessMessage("Login successful!");
      return { success: true, data };
    } catch (error) {
      setState({
        isLoading: false,
        error: error.message || "Login failed",
      });
      return { success: false, error };
    }
  };
  
  // Social login implementation
  const socialLogin = async ({ provider }) => {
    setState({ isLoading: true, error: null });
    
    try {
      // For OAuth providers, we would typically redirect to their auth page
      // This is a simplified implementation
      const authWindow = window.open(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`,
        '_blank',
        'width=600,height=600'
      );
      
      // Listen for messages from the popup window
      const handleMessage = async (event) => {
        // Verify origin for security
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === 'social_auth_success') {
          window.removeEventListener('message', handleMessage);
          
          const { access_token, refresh_token, user } = event.data.payload;
          
          localStorage.setItem("access_token", access_token);
          localStorage.setItem("refresh_token", refresh_token);
          localStorage.setItem("user", JSON.stringify(user));
          
          setState({
            accessToken: access_token,
            refreshToken: refresh_token,
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          showSuccessMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login successful!`);
          return { success: true, data: { access_token, refresh_token, user } };
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // For demo purposes, simulate a successful login after a delay
      setTimeout(() => {
        const mockUser = {
          id: `${provider}_user_123`,
          name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
          email: `user@${provider}.com`,
          isApproved: true,
          role: 'user',
        };
        
        const mockTokens = {
          access_token: `mock_${provider}_access_token_${Date.now()}`,
          refresh_token: `mock_${provider}_refresh_token_${Date.now()}`,
        };
        
        localStorage.setItem("access_token", mockTokens.access_token);
        localStorage.setItem("refresh_token", mockTokens.refresh_token);
        localStorage.setItem("user", JSON.stringify(mockUser));
        
        setState({
          accessToken: mockTokens.access_token,
          refreshToken: mockTokens.refresh_token,
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        if (authWindow) authWindow.close();
        
        showSuccessMessage(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login successful!`);
      }, 1500);
      
      return { success: true };
    } catch (error) {
      setState({
        isLoading: false,
        error: error.message || `${provider} login failed`,
        isAuthenticated: false,
      });
      return { success: false, error };
    }
  };

  const signup = async (userData) => {
    setState({ isLoading: true, error: null });

    try {
      const data = await apiService.signup(userData);

      localStorage.setItem("user", JSON.stringify(data));

      setState({
        user: data,
        isLoading: false,
        error: null,
      });

      showSuccessMessage("Account created successfully!");
      return { success: true, data };
    } catch (error) {
      setState({
        isLoading: false,
        error: error.message || "Signup failed",
      });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      error: null,
      users: [],
      currentProfile: null,
      chatMessages: [],
      activeTab: "dashboard",
    });

    showSuccessMessage("Logged out successfully!");
  };

  // Admin actions
  const fetchUsers = async () => {
    const { accessToken } = getState();
    if (!accessToken) return { success: false, error: "No access token" };

    setState({ isLoadingUsers: true, usersError: null });

    try {
      const data = await apiService.getUsers(accessToken);

      setState({
        users: data,
        isLoadingUsers: false,
        usersError: null,
      });

      return { success: true, data };
    } catch (error) {
      setState({
        isLoadingUsers: false,
        usersError: error.message || "Failed to fetch users",
      });
      return { success: false, error: error.message };
    }
  };

  const updateUserApproval = async (userId, isApproved) => {
    const { accessToken } = getState();
    if (!accessToken) return { success: false, error: "No access token" };

    setState({ isLoading: true, error: null });

    try {
      const data = await apiService.updateUserApproval(
        userId,
        isApproved,
        accessToken
      );

      // Update users list locally
      const updatedUsers = state.users.map((user) =>
        user.id === userId ? { ...user, isApproved } : user
      );

      setState({
        users: updatedUsers,
        isLoading: false,
        error: null,
      });

      showSuccessMessage(
        `User ${isApproved ? "approved" : "unapproved"} successfully!`
      );
      return { success: true, data };
    } catch (error) {
      setState({
        isLoading: false,
        error: error.message || "Failed to update user approval",
      });
      return { success: false, error: error.message };
    }
  };

  // User actions
  const fetchUserProfile = async (userId) => {
    const { accessToken } = getState();
    if (!accessToken) return { success: false, error: "No access token" };

    setState({ isLoadingProfile: true, profileError: null });

    try {
      const data = await apiService.getUserById(userId, accessToken);

      setState({
        currentProfile: data,
        isLoadingProfile: false,
        profileError: null,
      });

      return { success: true, data };
    } catch (error) {
      setState({
        isLoadingProfile: false,
        profileError: error.message || "Failed to fetch profile",
      });
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    const { accessToken } = getState();
    if (!accessToken) return { success: false, error: "No access token" };

    setState({ isLoadingProfile: true, profileError: null });

    try {
      const data = await apiService.updateProfile(profileData, accessToken);

      setState({
        currentProfile: data,
        user: data, // Update current user if editing own profile
        isLoadingProfile: false,
        profileError: null,
      });

      // Update localStorage
      localStorage.setItem("user", JSON.stringify(data));

      showSuccessMessage("Profile updated successfully!");
      return { success: true, data };
    } catch (error) {
      setState({
        isLoadingProfile: false,
        profileError: error.message || "Failed to update profile",
      });
      return { success: false, error: error.message };
    }
  };

  // Chat actions
  const sendChatMessage = async (input) => {
    const { accessToken, chatMessages } = getState();
    if (!accessToken) return { success: false, error: "No access token" };

    setState({ isLoadingChat: true, chatError: null });

    // Add user message immediately
    const userMessage = { type: "user", content: input, timestamp: new Date() };
    const updatedMessages = [...chatMessages, userMessage];
    setState({ chatMessages: updatedMessages });

    try {
      const data = await apiService.sendMessage(input, accessToken);

      // Add bot response
      const botMessage = {
        type: "bot",
        content: data.response,
        timestamp: new Date(),
      };

      setState({
        chatMessages: [...updatedMessages, botMessage],
        isLoadingChat: false,
        chatError: null,
      });

      return { success: true, data };
    } catch (error) {
      setState({
        isLoadingChat: false,
        chatError: error.message || "Failed to send message",
      });
      return { success: false, error: error.message };
    }
  };

  const setActiveTab = (tab) => {
    setState({ activeTab: tab });
  };

  return {
    getState,
    setState,
    subscribe,
    login,
    signup,
    socialLogin, // Add this
    logout,
    initializeAuth,
    fetchUsers,
    updateUserApproval,
    fetchUserProfile,
    updateProfile,
    sendChatMessage,
    setActiveTab,
  };
})();

// Custom hook to use the store
const useAuth = () => {
    const [state, setState] = useState(useAuthStore.getState());
    
    useEffect(() => {
      const unsubscribe = useAuthStore.subscribe(setState);
      return unsubscribe;
    }, []);
  
    return {
      ...state,
      login: useAuthStore.login,
      signup: useAuthStore.signup,
      logout: useAuthStore.logout,
      fetchUsers: useAuthStore.fetchUsers,
      updateUserApproval: useAuthStore.updateUserApproval,
      fetchUserProfile: useAuthStore.fetchUserProfile,
      updateProfile: useAuthStore.updateProfile,
      sendChatMessage: useAuthStore.sendChatMessage,
      setActiveTab: useAuthStore.setActiveTab
    };
  };