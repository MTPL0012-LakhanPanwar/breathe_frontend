"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import Header from "@/components/Header";
import Button from "@/components/Button";
import { Toaster, toast } from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function UsersPage() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    fetchUsers,
    updateUserApproval,
    isLoadingUsers,
    usersError,
    users,
    successMessage,
    clearSuccessMessage,
  } = useAuthStore();

  const [showToast, setShowToast] = useState(false);
  const [filter, setFilter] = useState("all"); // all, approved, pending, declined
  const [activeFilter, setActiveFilter] = useState("all"); // all, active, inactive
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    } else if (user?.userType !== "admin") {
      router.push("/dashboard");
    } else {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, router, user]);

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      clearSuccessMessage();
    }
  }, [successMessage, clearSuccessMessage]);

  const handleApprovalToggle = async (userId, currentStatus) => {
    try {
      await updateUserApproval(userId, { isApproved: !currentStatus });
      fetchUsers();
    } catch (err) {
      toast.error("Failed to update approval");
      console.error("Failed to update approval", err);
    }
  };

  const handleDecline = async (userId) => {
    const confirmed = window.confirm(
      "Are you sure you want to decline this user's request?"
    );
    if (!confirmed) return;
    try {
      await updateUserApproval(userId, {
        isApproved: false,
        status: "declined",
      });
      fetchUsers();
      toast.success("User declined successfully");
    } catch (err) {
      toast.error("Failed to decline user");
      console.error("Failed to decline user", err);
    }
  };

  // Derive filtered users with useMemo for performance
  const filteredUsers = useMemo(() => {
    return (users || []).filter((u) => {
      const matchesStatusFilter =
        filter === "all" ||
        (filter === "approved" && u.isApproved) ||
        (filter === "pending" && !u.isApproved && u.status !== "declined") ||
        (filter === "declined" && u.status === "declined");

      const isActive =
        u.lastActive &&
        new Date() - new Date(u.lastActive) < 30 * 24 * 60 * 60 * 1000;
      const matchesActivityFilter =
        activeFilter === "all" ||
        (activeFilter === "active" && isActive) ||
        (activeFilter === "inactive" && !isActive);

      const term = (searchTerm || "").toLowerCase();
      const matchesSearch =
        (u.username || "").toLowerCase().includes(term) ||
        (u.email || "").toLowerCase().includes(term) ||
        (u.name || "").toLowerCase().includes(term) ||
        (u.requestDetails || "").toLowerCase().includes(term);

      return matchesStatusFilter && matchesActivityFilter && matchesSearch;
    });
  }, [users, filter, activeFilter, searchTerm]);

  // Pagination calculations
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / usersPerPage)
  );

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // scroll to top of table when page changes
      const el = document.querySelector("main");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, activeFilter, searchTerm]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (user.userType !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 mb-6">
              You do not have permission to access this page.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Toaster for all toast messages */}
        <Toaster position="top-right" reverseOrder={false} />
        <div className="bg-white/80 rounded-lg shadow-sm overflow-hidden backdrop-blur-sm glass-morphism">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage user accounts and approval status
            </p>
          </div>

          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="relative w-full sm:w-auto">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                  <div className="relative">
                    <select
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                      className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="all">All Activity</option>
                      <option value="active">Active Users</option>
                      <option value="inactive">Inactive Users</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-0">
                <Button
                  onClick={() => fetchUsers()}
                  isLoading={isLoadingUsers}
                  variant="outline"
                >
                  Refresh
                </Button>
              </div>
            </div>
          </div>

          {isLoadingUsers ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : usersError ? (
            <div className="p-6 text-center">
              <p className="text-red-600">{usersError}</p>
              <Button
                onClick={() => fetchUsers()}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        User
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Email
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Request Details
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Last Active
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentUsers.length > 0 ? (
                      currentUsers.map((u) => {
                        const uid = u.id || u._id;
                        return (
                          <tr
                            key={uid}
                            className="hover:bg-gray-50/80 transition-colors"
                          >
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-medium">
                                  {(u.name && u.name.charAt(0)) ||
                                    (u.username && u.username.charAt(0)) ||
                                    "U"}
                                </div>
                                <div className="ml-3 sm:ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {u.name || u.username}
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-500">
                                    @{u.username}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                              {u.email || "No email provided"}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  u.userType === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {u.userType === "admin" ? "Admin" : "User"}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div
                                  className={`h-2.5 w-2.5 rounded-full mr-2 ${
                                    u.isApproved
                                      ? "bg-green-500"
                                      : "bg-yellow-500"
                                  }`}
                                ></div>
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    u.isApproved
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {u.isApproved
                                    ? "Approved"
                                    : u.status === "declined"
                                    ? "Declined"
                                    : "Pending"}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                              <div className="max-w-xs">
                                <p className="truncate">
                                  {u.requestDetails ||
                                    "No request details provided"}
                                </p>
                                {u.requestDetails && (
                                  <button
                                    className="text-green-600 hover:text-green-800 text-xs mt-1 font-medium"
                                    onClick={() =>
                                      window.alert(u.requestDetails)
                                    }
                                  >
                                    View full details
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                              {u.lastActive
                                ? new Date(u.lastActive).toLocaleDateString()
                                : "Never"}
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() =>
                                    handleApprovalToggle(uid, !!u.isApproved)
                                  }
                                  disabled={isLoadingUsers}
                                  variant={u.isApproved ? "outline" : "primary"}
                                  size="sm"
                                  icon={u.isApproved ? XCircle : CheckCircle}
                                >
                                  <span className="hidden sm:inline">
                                    {u.isApproved ? "Revoke" : "Approve"}
                                  </span>
                                </Button>

                                {!u.isApproved && u.status !== "declined" && (
                                  <Button
                                    onClick={() => handleDecline(uid)}
                                    disabled={isLoadingUsers}
                                    variant="outline"
                                    size="sm"
                                    icon={XCircle}
                                  >
                                    <span className="hidden sm:inline">
                                      Decline
                                    </span>
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No users found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredUsers.length > 0 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 bg-white/60 backdrop-blur-sm glass-morphism">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <Button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center px-4">
                      <span className="text-sm text-gray-700">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                    <Button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>

                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing{" "}
                        <span className="font-medium">
                          {filteredUsers.length === 0
                            ? 0
                            : indexOfFirstUser + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(indexOfLastUser, filteredUsers.length)}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {filteredUsers.length}
                        </span>{" "}
                        results
                      </p>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-3 text-sm text-gray-700">
                        Go to page:
                      </span>
                      <select
                        value={currentPage}
                        onChange={(e) => paginate(Number(e.target.value))}
                        className="mr-4 pl-2 pr-8 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        {Array.from(
                          { length: totalPages },
                          (_, i) => i + 1
                        ).map((number) => (
                          <option key={number} value={number}>
                            {number}
                          </option>
                        ))}
                      </select>

                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }
                            // ensure pageNumber is within bounds
                            if (pageNumber < 1 || pageNumber > totalPages)
                              return null;
                            return (
                              <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNumber
                                    ? "z-10 bg-green-50 border-green-500 text-green-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() => paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
