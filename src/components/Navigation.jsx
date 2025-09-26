const Navigation = ({ activeTab, onTabChange, onLogout, user }) => {
    const navItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'chat', label: 'Chat', icon: MessageCircle },
      { id: 'profile', label: 'Profile', icon: Settings },
      ...(user?.userType === 'admin' ? [{ id: 'users', label: 'Users', icon: Shield }] : [])
    ];
  
    return (
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
              
              <nav className="flex space-x-4">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`
                        flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                        ${activeTab === item.id
                          ? 'bg-green-100 text-green-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.username}
              </span>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };