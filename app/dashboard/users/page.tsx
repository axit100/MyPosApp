"use client"

import { useState, useEffect } from 'react'
import {
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  Search,
  Plus
} from "lucide-react"
import DashboardHeader from '@/components/DashboardHeader'
import ProtectedRoute from '@/components/ProtectedRoute'

interface User {
  _id: string
  name: string
  email: string
  role: 'admin' | 'manager' | 'staff'
  phone?: string
  isSuper?: boolean
  isActive: boolean
  lastLogin?: string
  createdAt: string
  permissions: string[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [usingDemoData, setUsingDemoData] = useState(false)
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff' as 'admin' | 'manager' | 'staff',
    phone: '',
    isActive: true
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch users from API')
      }
      
      const data = await response.json()
      
      if (data.success) {
        // Filter out superadmin from default view
        const filteredUsers = data.data.filter((user: User) => 
          user.email !== 'superadmin@dhabha.com'
        )
        setUsers(filteredUsers)
        setUsingDemoData(false)
      } else {
        throw new Error(data.error || 'Failed to fetch users')
      }
    } catch (error: any) {
      console.error('Users fetch error:', error)
      setError(`API Error: ${error?.message || 'Failed to connect to server'}.`)
      setUsingDemoData(false)
    } finally {
      setLoading(false)
    }
  }



  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      phone: '',
      isActive: true
    })
  }

  // Handle Add User (Demo mode compatible)
  const handleAddUser = async () => {
    if (usingDemoData) {
      const newUser: User = {
        _id: `demo-${Date.now()}`,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        isActive: formData.isActive,
        lastLogin: undefined,
        createdAt: new Date().toISOString(),
        permissions: formData.role === 'admin' ? ['all'] : ['basic']
      }
      
      setUsers(prev => [newUser, ...prev])
      setShowAddModal(false)
      resetForm()
      return
    }

    try {
      setActionLoading(true)
      setError('')
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setUsers(prev => [data.data, ...prev])
        setShowAddModal(false)
        resetForm()
      } else {
        setError(data.message || 'Failed to create user')
      }
    } catch (error: any) {
      setError('Network error. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Edit User
  const handleEditUser = async () => {
    if (!selectedUser) return
    
    if (usingDemoData) {
      const updatedUser: User = {
        ...selectedUser,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        isActive: formData.isActive
      }
      
      setUsers(prev => prev.map(user => 
        user._id === selectedUser._id ? updatedUser : user
      ))
      setShowEditModal(false)
      setSelectedUser(null)
      resetForm()
      return
    }
    
    try {
      setActionLoading(true)
      const updateData: any = { ...formData }
      if (!updateData.password) {
        const { password, ...dataWithoutPassword } = updateData
        Object.assign(updateData, dataWithoutPassword)
        delete updateData.password
      }
      
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setUsers(prev => prev.map(user => 
          user._id === selectedUser._id ? data.data : user
        ))
        setShowEditModal(false)
        setSelectedUser(null)
        resetForm()
      } else {
        setError(data.message || 'Failed to update user')
      }
    } catch (error: any) {
      setError('Network error. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // Handle Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return
    
    if (usingDemoData) {
      if (selectedUser.isSuper) {
        setError('Cannot delete super admin user')
        return
      }
      
      setUsers(prev => prev.filter(user => user._id !== selectedUser._id))
      setShowDeleteModal(false)
      setSelectedUser(null)
      return
    }
    
    try {
      setActionLoading(true)
      
      const response = await fetch(`/api/users/${selectedUser._id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setUsers(prev => prev.filter(user => user._id !== selectedUser._id))
        setShowDeleteModal(false)
        setSelectedUser(null)
      } else {
        setError(data.message || 'Failed to delete user')
      }
    } catch (error: any) {
      setError('Network error. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }

  // Open Edit Modal
  const openEditModal = (user: User) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      phone: user.phone || '',
      isActive: user.isActive
    })
    setShowEditModal(true)
  }

  // Open Delete Modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'staff': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="w-4 h-4" />
      case 'manager': return <User className="w-4 h-4" />
      case 'staff': return <User className="w-4 h-4" />
      default: return <User className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchUsers}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <DashboardHeader
        title="User Management"
        subtitle="Manage restaurant staff and permissions"
        showBackButton={true}
        onRefresh={fetchUsers}
      />

      {/* Action Buttons */}
      <div className="px-4 flex flex-col sm:flex-row gap-4 justify-end items-center mt-4">
        {usingDemoData && (
          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm rounded-full">
            Demo Mode Active
          </span>
        )}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="staff">Staff</option>
        </select>
        <button
          onClick={() => {
            resetForm()
            setShowAddModal(true)
          }}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          style={{ minWidth: 120 }}
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">

      {/* Filter/Action Row moved above */}

      {/* Users List */}
            {/* Users List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Add demo data notice when no users */}
        {!loading && users.length === 0 && !error && (
          <div className="p-6 text-center">
            <div className="text-gray-400 mb-4">
              <User className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Users Found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">No users exist in the database yet.</p>
              <button
                onClick={() => {
                  resetForm()
                  setShowAddModal(true)
                }}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
              >
                Add First User
              </button>
            </div>
          </div>
        )}
        
        {(users.length > 0 || loading) && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            {user.name}
                            {user.isSuper && (
                              <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded">
                                SUPER
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span className="ml-1">{user.role}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center mb-1">
                          <Mail className="w-3 h-3 mr-1 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center">
                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {user.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(user)}
                          disabled={user.isSuper}
                          className={`${
                            user.isSuper 
                              ? 'text-gray-400 cursor-not-allowed' 
                              : 'text-red-600 hover:text-red-900'
                          }`}
                          title={user.isSuper ? 'Super admin cannot be deleted' : 'Delete user'}
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
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-gray-900">
            {users.length}
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(user => user.isActive).length}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(user => user.role === 'admin').length}
          </div>
          <div className="text-sm text-gray-600">Admins</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">
            {users.filter(user => user.role === 'staff').length}
          </div>
          <div className="text-sm text-gray-600">Staff Members</div>
        </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New User</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'manager' | 'staff' }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    resetForm()
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  {actionLoading ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Edit User</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'manager' | 'staff' }))}
                    disabled={selectedUser?.isSuper}
                    className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      selectedUser?.isSuper ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="staff">Staff</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                  {selectedUser?.isSuper && (
                    <p className="mt-1 text-xs text-red-600">Super admin role cannot be changed</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedUser(null)
                    resetForm()
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUser}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 disabled:opacity-50"
                >
                  {actionLoading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Confirm Delete</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Are you sure you want to delete user "{selectedUser.name}"? This action cannot be undone.
                {selectedUser.isSuper && (
                  <span className="block mt-2 text-red-600 font-semibold">
                    Cannot delete Super Admin user!
                  </span>
                )}
              </p>
              
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedUser(null)
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                {!selectedUser.isSuper && (
                  <button
                    onClick={handleDeleteUser}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  )
}
