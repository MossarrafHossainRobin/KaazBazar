"use client";
import { useState, useEffect, useRef } from "react";
import { 
  Search, 
  UserCheck, 
  UserX, 
  Shield, 
  Eye, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Loader2,
  ShieldCheck,
  Mail,
  Calendar,
  MapPin,
  Phone,
  X
} from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy, limit, startAfter } from "firebase/firestore";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastDoc, setLastDoc] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInfoCard, setShowInfoCard] = useState(false);
  const infoCardRef = useRef(null);
  const USERS_PER_PAGE = 10;

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Close info card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (infoCardRef.current && !infoCardRef.current.contains(event.target)) {
        setShowInfoCard(false);
        setSelectedUser(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(USERS_PER_PAGE));
      
      if (currentPage > 1 && lastDoc) {
        usersQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(USERS_PER_PAGE));
      }
      
      const snapshot = await getDocs(usersQuery);
      const usersData = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        role: doc.data().role || "user",
        isActive: doc.data().isActive !== undefined ? doc.data().isActive : true
      }));
      setUsers(usersData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      
      const totalSnapshot = await getDocs(collection(db, "users"));
      setTotalPages(Math.ceil(totalSnapshot.size / USERS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    setUpdating(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, role: newRole }));
      }
      
      setSuccessMessage(`User role changed to ${newRole}`);
    } catch (error) {
      console.error("Error updating user role:", error);
      setErrorMessage("Failed to update role");
    } finally {
      setUpdating(false);
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    setUpdating(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { isActive });
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, isActive } : user
        )
      );
      
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, isActive }));
      }
      
      setSuccessMessage(`User ${isActive ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error("Error updating user status:", error);
      setErrorMessage("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("⚠️ Delete this user? This cannot be undone.")) return;
    
    setUpdating(true);
    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setSuccessMessage("User deleted");
      setShowInfoCard(false);
      setSelectedUser(null);
    } catch (error) {
      setErrorMessage("Failed to delete");
    } finally {
      setUpdating(false);
    }
  };

  const openInfoCard = (user) => {
    setSelectedUser(user);
    setShowInfoCard(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && user.isActive !== false) ||
      (filterStatus === "inactive" && user.isActive === false);
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
        <p className="text-gray-500 mt-1">Manage all users on your platform</p>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-600 text-sm text-center">{successMessage}</p>
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm text-center">{errorMessage}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-bold">{user.name?.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <button
                            onClick={() => openInfoCard(user)}
                            className="font-medium text-gray-800 hover:text-green-600 hover:underline text-left"
                          >
                            {user.name || "Unknown"}
                          </button>
                          <p className="text-xs text-gray-400">ID: {user.id?.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateUserRole(user.id, user.role === "admin" ? "user" : "admin")}
                        disabled={updating}
                        className={`px-3 py-1 text-xs rounded-full transition flex items-center gap-1 ${
                          user.role === "admin" 
                            ? "bg-purple-100 text-purple-700 hover:bg-purple-200" 
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        <Shield className="w-3 h-3" />
                        {user.role === "admin" ? "Admin" : "Make Admin"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateUserStatus(user.id, user.isActive === false)}
                        disabled={updating}
                        className={`px-3 py-1 text-xs rounded-full transition flex items-center gap-1 ${
                          user.isActive !== false 
                            ? "bg-green-100 text-green-700 hover:bg-green-200" 
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {user.isActive !== false ? (
                          <><UserCheck className="w-3 h-3" /> Active</>
                        ) : (
                          <><UserX className="w-3 h-3" /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={updating}
                        className="p-1 text-gray-400 hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Info Card Modal - Stable, Non-blinking */}
      {showInfoCard && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div ref={infoCardRef} className="bg-white rounded-lg shadow-xl w-96 max-w-full">
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">User Information</h3>
              <button 
                onClick={() => {
                  setShowInfoCard(false);
                  setSelectedUser(null);
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b">
                {selectedUser.photoURL ? (
                  <img src={selectedUser.photoURL} alt={selectedUser.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-2xl">{selectedUser.name?.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800 text-lg">{selectedUser.name}</h3>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 w-24">Role:</span>
                  <span className={`font-medium ${selectedUser.role === "admin" ? "text-purple-600" : "text-gray-600"}`}>
                    {selectedUser.role === "admin" ? "Administrator" : "Regular User"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedUser.isActive !== false ? (
                    <UserCheck className="w-4 h-4 text-green-500" />
                  ) : (
                    <UserX className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-gray-600 w-24">Status:</span>
                  <span className={`font-medium ${selectedUser.isActive !== false ? "text-green-600" : "text-red-600"}`}>
                    {selectedUser.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 w-24">Email:</span>
                  <span className="text-gray-600">{selectedUser.email}</span>
                </div>
                
                {selectedUser.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 w-24">Phone:</span>
                    <span className="text-gray-600">{selectedUser.phone}</span>
                  </div>
                )}
                
                {selectedUser.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 w-24">City:</span>
                    <span className="text-gray-600">{selectedUser.city}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 w-24">Joined:</span>
                  <span className="text-gray-600">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => updateUserRole(selectedUser.id, selectedUser.role === "admin" ? "user" : "admin")}
                disabled={updating}
                className="flex-1 px-3 py-2 text-sm bg-gray-800 text-white rounded-md hover:bg-gray-700 transition disabled:opacity-50"
              >
                {selectedUser.role === "admin" ? "Remove Admin" : "Make Admin"}
              </button>
              <button
                onClick={() => updateUserStatus(selectedUser.id, selectedUser.isActive === false)}
                disabled={updating}
                className={`flex-1 px-3 py-2 text-sm rounded-md transition disabled:opacity-50 ${
                  selectedUser.isActive !== false
                    ? "bg-red-100 text-red-600 hover:bg-red-200"
                    : "bg-green-100 text-green-600 hover:bg-green-200"
                }`}
              >
                {selectedUser.isActive !== false ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={() => deleteUser(selectedUser.id)}
                disabled={updating}
                className="px-3 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
