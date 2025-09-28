"use client"

import { useState, useEffect } from 'react'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Save,
  Grid3X3,
  List,
  ToggleLeft,
  ToggleRight
} from "lucide-react"
import DashboardHeader from '@/components/DashboardHeader'

interface Category {
  _id: string
  name: string
  description: string
  icon?: string
  status: 'active' | 'inactive'
  createdAt: string
  updatedAt: string
}

interface SubCategory {
  _id: string
  mainCategoryId: string | Category
  name: string
  price: number
  basePrice: number
  description: string
  icon?: string
  status: 'active' | 'inactive'
  showInQuickOrder: boolean
  createdAt: string
  updatedAt: string
}

interface CategoryFormData {
  name: string
  description: string
  icon: string
  status: 'active' | 'inactive'
}

interface SubCategoryFormData {
  mainCategoryId: string
  name: string
  price: number
  basePrice: number
  description: string
  icon: string
  status: 'active' | 'inactive'
}

// Default icons for categories and subcategories
const getDefaultIcon = (name: string) => {
  const iconMap: { [key: string]: string } = {
    'Kathiyawadi Bhojan': '🍽️',
    'Sanj Ni Special Vangi': '🌶️',
    'Fixed Sanj': '📅',
    'Beverages': '🥤',
    'Desserts': '🍰',
    'Rotla / Roti': '🫓',
    'Sabji': '🥬',
    'Dal & Kadhi': '🍛',
    'Rice & Sides': '🍚'
  }
  return iconMap[name] || '🍽️'
}

export default function MenuPage() {
  // State management
  const [categories, setCategories] = useState<Category[]>([])
  const [subCategories, setSubCategories] = useState<SubCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showSubCategoryModal, setShowSubCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editingSubCategory, setEditingSubCategory] = useState<SubCategory | null>(null)
  
  // Form data
  const [categoryFormData, setCategoryFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: '',
    status: 'active'
  })
  
  const [subCategoryFormData, setSubCategoryFormData] = useState<SubCategoryFormData>({
    mainCategoryId: '',
    name: '',
    price: 0,
    basePrice: 0,
    description: '',
    icon: '',
    status: 'active'
  })

  useEffect(() => {
    fetchCategories()
    fetchSubCategories()
  }, [])

  useEffect(() => {
    // Refetch whenever selectedCategoryId changes (including resetting to '')
    fetchSubCategories()
  }, [selectedCategoryId])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/categories')
      const result = await response.json()

      if (response.ok) {
        setCategories(result.data)
        setError('')
      } else {
        setError(result.error || 'Failed to fetch categories')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubCategories = async () => {
    try {
      let url = '/api/subcategories'
      if (selectedCategoryId) {
        url += `?categoryId=${selectedCategoryId}`
      }
      
      const response = await fetch(url)
      const result = await response.json()

      if (response.ok) {
        setSubCategories(result.data)
        setError('')
      } else {
        setError(result.error || 'Failed to fetch subcategories')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  // Category CRUD functions
  const handleAddCategory = () => {
    setEditingCategory(null)
    setCategoryFormData({
      name: '',
      description: '',
      icon: '',
      status: 'active'
    })
    setShowCategoryModal(true)
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      description: category.description,
      icon: category.icon || '',
      status: category.status
    })
    setShowCategoryModal(true)
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also delete all its subcategories.')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess('Category deleted successfully!')
        setTimeout(() => setSuccess(''), 3000)
        fetchCategories()
        fetchSubCategories()
      } else {
        setError(result.error || 'Failed to delete category')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories'
      const method = editingCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryFormData)
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(editingCategory ? 'Category updated successfully!' : 'Category created successfully!')
        setTimeout(() => setSuccess(''), 3000)
        setShowCategoryModal(false)
        fetchCategories()
      } else {
        setError(result.error || 'Failed to save category')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  // SubCategory CRUD functions
  const handleAddSubCategory = () => {
    setEditingSubCategory(null)
    setSubCategoryFormData({
      mainCategoryId: selectedCategoryId || (categories[0]?._id || ''),
      name: '',
      price: 0,
      basePrice: 0,
      description: '',
      icon: '',
      status: 'active'
    })
    setShowSubCategoryModal(true)
  }

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setEditingSubCategory(subCategory)
    setSubCategoryFormData({
      mainCategoryId: typeof subCategory.mainCategoryId === 'string' 
        ? subCategory.mainCategoryId 
        : subCategory.mainCategoryId._id,
      name: subCategory.name,
      price: subCategory.price,
      basePrice: subCategory.basePrice,
      description: subCategory.description,
      icon: subCategory.icon || '',
      status: subCategory.status
    })
    setShowSubCategoryModal(true)
  }

  const handleDeleteSubCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return

    try {
      const response = await fetch(`/api/subcategories/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess('Subcategory deleted successfully!')
        setTimeout(() => setSuccess(''), 3000)
        fetchSubCategories()
      } else {
        setError(result.error || 'Failed to delete subcategory')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  const handleSubCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingSubCategory ? `/api/subcategories/${editingSubCategory._id}` : '/api/subcategories'
      const method = editingSubCategory ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(subCategoryFormData)
      })

      const result = await response.json()

      if (response.ok) {
        setSuccess(editingSubCategory ? 'Subcategory updated successfully!' : 'Subcategory created successfully!')
        setTimeout(() => setSuccess(''), 3000)
        setShowSubCategoryModal(false)
        fetchSubCategories()
      } else {
        setError(result.error || 'Failed to save subcategory')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    }
  }

  // Filter functions
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSubCategories = subCategories.filter(subCategory => {
    const matchesSearch = subCategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subCategory.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategoryId || 
      (typeof subCategory.mainCategoryId === 'string' 
        ? subCategory.mainCategoryId === selectedCategoryId
        : subCategory.mainCategoryId._id === selectedCategoryId)
    return matchesSearch && matchesCategory
  })

  const getCategoryName = (categoryId: string | Category) => {
    if (typeof categoryId === 'string') {
      const category = categories.find(cat => cat._id === categoryId)
      return category?.name || 'Unknown Category'
    }
    return categoryId.name
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader title="Menu Management" showBackButton={true} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 rounded-lg">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Organize your menu with categories and items</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Category
            </button>
            <button
              onClick={handleAddSubCategory}
              className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories and items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>

            <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Categories</h2>

          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No categories found</p>
              <button
                onClick={handleAddCategory}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Category
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredCategories.map(category => (
                <div key={category._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon || getDefaultIcon(category.name)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{category.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{category.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      category.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                    }`}>
                      {category.status}
                    </span>

                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {subCategories.filter(sub =>
                        (typeof sub.mainCategoryId === 'string' ? sub.mainCategoryId : sub.mainCategoryId._id) === category._id
                      ).length} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subcategories Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Menu Items {selectedCategoryId && `- ${getCategoryName(selectedCategoryId)}`}
            </h2>
            {selectedCategoryId && (
              <button
                onClick={() => setSelectedCategoryId('')}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Show All Items
              </button>
            )}
          </div>

          {filteredSubCategories.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {selectedCategoryId ? 'No items found in this category' : 'No menu items found'}
              </p>
              <button
                onClick={handleAddSubCategory}
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add First Item
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredSubCategories.map(subCategory => (
                <div key={subCategory._id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{subCategory.icon || getDefaultIcon(subCategory.name)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{subCategory.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{subCategory.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Category: {getCategoryName(subCategory.mainCategoryId)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditSubCategory(subCategory)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Edit item"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubCategory(subCategory._id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Price:</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">₹{subCategory.price.toLocaleString('en-IN')}</span>
                    </div>

                    {subCategory.basePrice !== subCategory.price && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Base Price:</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 line-through">₹{subCategory.basePrice.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        subCategory.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
                      }`}>
                        {subCategory.status}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Add in Quick Order</span>
                        <button
                          onClick={async () => {
                            // Toggle quick order flag
                            const newFlag = !subCategory.showInQuickOrder
                            const res = await fetch(`/api/subcategories/${subCategory._id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ showInQuickOrder: newFlag })
                            })
                            if (res.ok) {
                              setSubCategories(prev =>
                                prev.map(s =>
                                  s._id === subCategory._id ? { ...s, showInQuickOrder: newFlag } : s
                                )
                              )
                              setSuccess(
                                `${subCategory.name} ${newFlag ? 'added to' : 'removed from'} Quick Order`
                              )
                              setTimeout(() => setSuccess(''), 3000)
                            }
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title={subCategory.showInQuickOrder ? 'Remove from Quick Order' : 'Add to Quick Order'}
                        >
                          {subCategory.showInQuickOrder ? (
                            <ToggleRight className="w-5 h-5 text-blue-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        {/* Active/Inactive Toggle */}
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                        <button
                          onClick={async () => {
                            const newStatus = subCategory.status === 'active' ? 'inactive' : 'active'
                            const res = await fetch(`/api/subcategories/${subCategory._id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: newStatus })
                            })
                            if (res.ok) {
                              setSubCategories(prev =>
                                prev.map(s =>
                                  s._id === subCategory._id ? { ...s, status: newStatus } : s
                                )
                              )
                              setSuccess(
                                `${subCategory.name} ${newStatus === 'active' ? 'activated' : 'deactivated'}`
                              )
                              setTimeout(() => setSuccess(''), 3000)
                            }
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title={subCategory.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          {subCategory.status === 'active' ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-red-500" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category Name *
                </label>
                <input
                  id="categoryName"
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="categoryDescription"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label htmlFor="categoryIcon" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Icon (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    id="categoryIcon"
                    type="text"
                    value={categoryFormData.icon}
                    onChange={(e) => setCategoryFormData({...categoryFormData, icon: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="🍽️ or emoji/icon"
                  />
                  <div className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                    <span className="text-lg">{categoryFormData.icon || getDefaultIcon(categoryFormData.name)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="categoryStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  id="categoryStatus"
                  value={categoryFormData.status}
                  onChange={(e) => setCategoryFormData({...categoryFormData, status: e.target.value as 'active' | 'inactive'})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SubCategory Modal */}
      {showSubCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingSubCategory ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={() => setShowSubCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  required
                  value={subCategoryFormData.mainCategoryId}
                  onChange={(e) => setSubCategoryFormData({...subCategoryFormData, mainCategoryId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select Category</option>
                  {categories.filter(cat => cat.status === 'active').map(category => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={subCategoryFormData.name}
                  onChange={(e) => setSubCategoryFormData({...subCategoryFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter item name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={subCategoryFormData.price}
                    onChange={(e) => setSubCategoryFormData({...subCategoryFormData, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Base Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={subCategoryFormData.basePrice}
                    onChange={(e) => setSubCategoryFormData({...subCategoryFormData, basePrice: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={subCategoryFormData.description}
                  onChange={(e) => setSubCategoryFormData({...subCategoryFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter item description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Icon (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={subCategoryFormData.icon}
                    onChange={(e) => setSubCategoryFormData({...subCategoryFormData, icon: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="🍽️ or emoji/icon or SVG"
                  />
                  <div className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                    <span className="text-lg">{subCategoryFormData.icon || getDefaultIcon(subCategoryFormData.name)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={subCategoryFormData.status}
                  onChange={(e) => setSubCategoryFormData({...subCategoryFormData, status: e.target.value as 'active' | 'inactive'})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubCategoryModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingSubCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
