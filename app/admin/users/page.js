// app/admin/users/page.js
"use client";
import { useState, useEffect } from "react";
import { Search, Edit2, Trash2, UserCheck, UserX, Shield, MoreVertical, Eye } from "lucide-react";
import { db } from "@/lib/firebaseClient";
import { collection, getDocs, updateDoc, doc, deleteDoc, query, where, orderBy } from "firebase/firestore";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, isActive) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { isActive });
      setUsers(users.map(user => user.id === userId ? { ...user, isActive } : user));
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const updateUserRole = async (userId, role) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role });
      setUsers(users.map(user => user.id === userId ? { ...user, role } : user));
    } catch (error) {
      console.error("Error updating user role:", error);
    }
  };

  const deleteUser = async (userId) => {
    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
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
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="all">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Joined</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center">
                    <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 font-bold">{user.name?.charAt(0)}</span>
                          </div>
                        )}
                        <span className="text-sm text-gray-800">{user.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role || "user"}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => updateUserStatus(user.id, user.isActive === false)}
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                          user.isActive !== false 
                            ? "bg-green-100 text-green-600" 
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {user.isActive !== false ? (
                          <><UserCheck className="w-3 h-3" /> Active</>
                        ) : (
                          <><UserX className="w-3 h-3" /> Inactive</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">User Details</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedUser.photoURL ? (
                  <img src={selectedUser.photoURL} alt={selectedUser.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-green-600 font-bold">{selectedUser.name?.charAt(0)}</span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-800">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm"><strong>UID:</strong> {selectedUser.id}</p>
                <p className="text-sm mt-2"><strong>Role:</strong> {selectedUser.role || "user"}</p>
                <p className="text-sm mt-2"><strong>Status:</strong> {selectedUser.isActive !== false ? "Active" : "Inactive"}</p>
                <p className="text-sm mt-2"><strong>Joined:</strong> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "N/A"}</p>
                <p className="text-sm mt-2"><strong>Last Login:</strong> {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}