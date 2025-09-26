// Users Management Component (Admin only)
const UsersManagement = () => {
    const { 
      users, 
      isLoadingUsers, 
      usersError, 
      fetchUsers, 
      updateUserApproval, 
      isLoading 
    } = useAuth();
  
    useEffect(() => {
      fetchUsers();
    }, []);
  
    const handleApprovalToggle = async (userId, currentStatus) => {
      await updateUserApproval(userId, !currentStatus);
    };
  
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };
  
    if (isLoadingUsers) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader className="h-8 w-8 animate-spin text-green-600" />
        </div>
      );
    }
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <button
            onClick={fetchUsers}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
  
        {usersError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{usersError}</span>
          </div>
        )}
  
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-full w-10 h-10 flex items-center justify-center">
                          <span className="text-green-700 font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.userType}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        {user.gender} • {formatDate(user.dob)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>Created: {formatDate(user.createdAt)}</div>
                      <div>Updated: {formatDate(user.updatedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`
                          inline-flex px-2 py-1 text-xs font-semibold rounded-full
                          ${user.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                          }
                        `}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`
                          inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-2
                          ${user.isApproved 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }
                        `}>
                          {user.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleApprovalToggle(user.id, user.isApproved)}
                        disabled={isLoading}
                        className={`
                          flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-colors duration-200
                          ${user.isApproved
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        <UserCheck className="h-3 w-3" />
                        <span>
                          {user.isApproved ? 'Revoke' : 'Approve'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };