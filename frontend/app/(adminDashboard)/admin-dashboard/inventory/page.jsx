"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  PackagePlus,
} from "lucide-react"
import { toast } from "sonner"

// Fixed: Move form component outside to prevent recreation
const InventoryForm = ({ onSubmit, submitText, formData, handleInputChange, submitting, categories }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name *</Label>
        <Input
          id="name"
          value={formData.name || ""}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Enter item name"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="itemCode">Item Code *</Label>
        <Input
          id="itemCode"
          value={formData.itemCode || ""}
          onChange={(e) => handleInputChange("itemCode", e.target.value)}
          placeholder="Enter unique item code"
          required
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <Select value={formData.categoryId || ""} onValueChange={(value) => handleInputChange("categoryId", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="supplier">Supplier</Label>
        <Input
          id="supplier"
          value={formData.supplier || ""}
          onChange={(e) => handleInputChange("supplier", e.target.value)}
          placeholder="Enter supplier name"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea
        id="description"
        value={formData.description || ""}
        onChange={(e) => handleInputChange("description", e.target.value)}
        placeholder="Enter item description"
        rows={3}
      />
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor="quantity">Current Quantity *</Label>
        <Input
          id="quantity"
          type="number"
          min="0"
          value={formData.quantity || ""}
          onChange={(e) => handleInputChange("quantity", e.target.value)}
          placeholder="0"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="minimumQuantity">Minimum Quantity *</Label>
        <Input
          id="minimumQuantity"
          type="number"
          min="0"
          value={formData.minimumQuantity || ""}
          onChange={(e) => handleInputChange("minimumQuantity", e.target.value)}
          placeholder="0"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="unitPrice">Unit Price ($)</Label>
        <Input
          id="unitPrice"
          type="number"
          step="0.01"
          min="0"
          value={formData.unitPrice || ""}
          onChange={(e) => handleInputChange("unitPrice", e.target.value)}
          placeholder="0.00"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="location">Storage Location</Label>
      <Input
        id="location"
        value={formData.location || ""}
        onChange={(e) => handleInputChange("location", e.target.value)}
        placeholder="e.g., Warehouse A, Room 101"
      />
    </div>

    <DialogFooter>
      <Button type="submit" disabled={submitting}>
        {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
        {submitText}
      </Button>
    </DialogFooter>
  </form>
)

export default function InventoryPage() {
  const [inventory, setInventory] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedItem, setSelectedItem] = useState(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    itemCode: "",
    name: "",
    description: "",
    categoryId: "",
    quantity: "",
    minimumQuantity: "",
    unitPrice: "",
    location: "",
    supplier: "",
  })
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    description: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [filterType, setFilterType] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    fetchInventory()
    fetchCategories()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/inventory/items", {
        credentials: "include",
      })
      const result = await response.json()

      if (result.success) {
        setInventory(result.data)
      } else {
        toast.error("Failed to fetch inventory")
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
      toast.error("Error loading inventory")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/inventory/categories", {
        credentials: "include",
      })
      const result = await response.json()

      if (result.success) {
        setCategories(result.data)
      } else {
        console.error("Failed to fetch categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  // Fixed: Use useCallback to prevent function recreation
  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleCategoryInputChange = useCallback((field, value) => {
    setCategoryFormData((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleAddItem = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/inventory/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          itemCode: formData.itemCode,
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId ? Number.parseInt(formData.categoryId) : null,
          quantity: Number.parseInt(formData.quantity) || 0,
          minimumQuantity: Number.parseInt(formData.minimumQuantity) || 0,
          unitPrice: Number.parseFloat(formData.unitPrice) || 0,
          location: formData.location,
          supplier: formData.supplier,
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Inventory item added successfully")
        setIsAddDialogOpen(false)
        resetForm()
        fetchInventory()
      } else {
        toast.error(result.message || "Failed to add inventory item")
      }
    } catch (error) {
      console.error("Error adding inventory item:", error)
      toast.error("Error adding inventory item")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditItem = async (e) => {
    e.preventDefault()
    if (!selectedItem) return
    setSubmitting(true)

    try {
      const response = await fetch(`/api/inventory/items/${selectedItem.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          categoryId: formData.categoryId ? Number.parseInt(formData.categoryId) : null,
          quantity: Number.parseInt(formData.quantity) || 0,
          minimumQuantity: Number.parseInt(formData.minimumQuantity) || 0,
          unitPrice: Number.parseFloat(formData.unitPrice) || 0,
          location: formData.location,
          supplier: formData.supplier,
          status: "active",
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Inventory item updated successfully")
        setIsEditDialogOpen(false)
        resetForm()
        fetchInventory()
      } else {
        toast.error(result.message || "Failed to update inventory item")
      }
    } catch (error) {
      console.error("Error updating inventory item:", error)
      toast.error("Error updating inventory item")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteItem = async () => {
    if (!selectedItem) return
    setSubmitting(true)

    try {
      const response = await fetch(`/api/inventory/items/${selectedItem.id}`, {
        method: "DELETE",
        credentials: "include",
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Inventory item deleted successfully")
        setIsDeleteDialogOpen(false)
        setSelectedItem(null)
        fetchInventory()
      } else {
        toast.error(result.message || "Failed to delete inventory item")
      }
    } catch (error) {
      console.error("Error deleting inventory item:", error)
      toast.error("Error deleting inventory item")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/inventory/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(categoryFormData),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("Category added successfully")
        setIsCategoryDialogOpen(false)
        setCategoryFormData({ name: "", description: "" })
        fetchCategories()
      } else {
        toast.error(result.message || "Failed to add category")
      }
    } catch (error) {
      console.error("Error adding category:", error)
      toast.error("Error adding category")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      itemCode: "",
      name: "",
      description: "",
      categoryId: "",
      quantity: "",
      minimumQuantity: "",
      unitPrice: "",
      location: "",
      supplier: "",
    })
    setSelectedItem(null)
  }

  const openEditDialog = (item) => {
    setSelectedItem(item)
    setFormData({
      itemCode: item.item_code || "",
      name: item.name || "",
      description: item.description || "",
      categoryId: item.category_id?.toString() || "",
      quantity: item.quantity?.toString() || "",
      minimumQuantity: item.minimum_quantity?.toString() || "",
      unitPrice: item.unit_price?.toString() || "",
      location: item.location || "",
      supplier: item.supplier || "",
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (item) => {
    setSelectedItem(item)
    setIsViewDialogOpen(true)
  }

  const openDeleteDialog = (item) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }

  const getStockStatus = (item) => {
    if (item.quantity === 0) return "out-of-stock"
    if (item.quantity <= item.minimum_quantity) return "low-stock"
    return "in-stock"
  }

  const getStockBadge = (item) => {
    const status = getStockStatus(item)
    switch (status) {
      case "out-of-stock":
        return <Badge variant="destructive">Out of Stock</Badge>
      case "low-stock":
        return (
          <Badge variant="secondary" className="bg-yellow-600 text-yellow-100">
            Low Stock
          </Badge>
        )
      default:
        return (
          <Badge variant="default" className="bg-green-600">
            In Stock
          </Badge>
        )
    }
  }

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || item.category_id?.toString() === categoryFilter

    let matchesFilter = true
    if (filterType === "low-stock") {
      matchesFilter = item.quantity <= item.minimum_quantity && item.quantity > 0
    } else if (filterType === "out-of-stock") {
      matchesFilter = item.quantity === 0
    }

    return matchesSearch && matchesCategory && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Inventory Management
          </h1>
          <p className="text-gray-400 mt-1">Track and manage school inventory items</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={fetchInventory} variant="outline" className="border-gray-600 text-gray-300">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <PackagePlus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Add New Category</DialogTitle>
                <DialogDescription className="text-gray-400">Create a new inventory category</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name *</Label>
                  <Input
                    id="categoryName"
                    value={categoryFormData.name}
                    onChange={(e) => handleCategoryInputChange("name", e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Textarea
                    id="categoryDescription"
                    value={categoryFormData.description}
                    onChange={(e) => handleCategoryInputChange("description", e.target.value)}
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Add Category
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-gray-100">Add New Inventory Item</DialogTitle>
                <DialogDescription className="text-gray-400">Add a new item to the inventory system</DialogDescription>
              </DialogHeader>
              <InventoryForm
                onSubmit={handleAddItem}
                submitText="Add Item"
                formData={formData}
                handleInputChange={handleInputChange}
                submitting={submitting}
                categories={categories}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Total Items</CardTitle>
            <Package className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300">{inventory.length}</div>
            <p className="text-xs text-blue-400/70">Inventory items</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">In Stock</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">
              {inventory.filter((item) => getStockStatus(item) === "in-stock").length}
            </div>
            <p className="text-xs text-green-400/70">Available items</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-300">
              {inventory.filter((item) => getStockStatus(item) === "low-stock").length}
            </div>
            <p className="text-xs text-yellow-400/70">Need restocking</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/10 border-red-500/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-400">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-300">
              {inventory.filter((item) => getStockStatus(item) === "out-of-stock").length}
            </div>
            <p className="text-xs text-red-400/70">Urgent restocking</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 bg-gray-800/50 border-gray-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search inventory by name, code, category, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700/50 border-gray-600 text-gray-100"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48 bg-gray-700/50 border-gray-600 text-gray-100">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  {filterType === "all" ? "All Items" : filterType === "low-stock" ? "Low Stock" : "Out of Stock"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700">
                <DropdownMenuItem onClick={() => setFilterType("all")} className="text-gray-300">
                  All Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("low-stock")} className="text-gray-300">
                  Low Stock
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterType("out-of-stock")} className="text-gray-300">
                  Out of Stock
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" className="border-gray-600 text-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center">
            <Package className="h-5 w-5 mr-2 text-purple-400" />
            Inventory Items ({filteredInventory.length})
          </CardTitle>
          <CardDescription className="text-gray-400">Manage all inventory items and stock levels</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="text-gray-300">Item Code</TableHead>
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Category</TableHead>
                  <TableHead className="text-gray-300">Quantity</TableHead>
                  <TableHead className="text-gray-300">Min. Qty</TableHead>
                  <TableHead className="text-gray-300">Unit Price</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id} className="border-gray-700 hover:bg-gray-700/30">
                    <TableCell className="text-gray-300 font-medium">{item.item_code}</TableCell>
                    <TableCell className="text-gray-300">{item.name}</TableCell>
                    <TableCell className="text-gray-300">{item.category_name || "Uncategorized"}</TableCell>
                    <TableCell className="text-gray-300">{item.quantity}</TableCell>
                    <TableCell className="text-gray-300">{item.minimum_quantity}</TableCell>
                    <TableCell className="text-gray-300">
                      ${(Number.parseFloat(item.unit_price) || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>{getStockBadge(item)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                          <DropdownMenuLabel className="text-gray-300">Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openViewDialog(item)} className="text-gray-300">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(item)} className="text-gray-300">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-gray-700" />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(item)}
                            className="text-red-400 focus:text-red-300"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredInventory.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No inventory items found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Edit Inventory Item</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update inventory item information and stock levels
            </DialogDescription>
          </DialogHeader>
          <InventoryForm
            onSubmit={handleEditItem}
            submitText="Update Item"
            formData={formData}
            handleInputChange={handleInputChange}
            submitting={submitting}
            categories={categories}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">Inventory Item Details</DialogTitle>
            <DialogDescription className="text-gray-400">View complete inventory item information</DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Item Code</Label>
                  <p className="text-gray-100 mt-1">{selectedItem.item_code}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Item Name</Label>
                  <p className="text-gray-100 mt-1">{selectedItem.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Category</Label>
                  <p className="text-gray-100 mt-1">{selectedItem.category_name || "Uncategorized"}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Supplier</Label>
                  <p className="text-gray-100 mt-1">{selectedItem.supplier || "N/A"}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-300">Description</Label>
                <p className="text-gray-100 mt-1">{selectedItem.description || "N/A"}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Current Quantity</Label>
                  <p className="text-gray-100 mt-1">{selectedItem.quantity}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Minimum Quantity</Label>
                  <p className="text-gray-100 mt-1">{selectedItem.minimum_quantity}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Unit Price</Label>
                  <p className="text-gray-100 mt-1">${(Number.parseFloat(selectedItem.unit_price) || 0).toFixed(2)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Storage Location</Label>
                  <p className="text-gray-100 mt-1">{selectedItem.location || "N/A"}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Stock Status</Label>
                  <div className="mt-1">{getStockBadge(selectedItem)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Created By</Label>
                  <p className="text-gray-100 mt-1">{selectedItem.created_by_name || "System"}</p>
                </div>
                <div>
                  <Label className="text-gray-300">Created At</Label>
                  <p className="text-gray-100 mt-1">{new Date(selectedItem.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-100">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the inventory item{" "}
              <span className="font-semibold text-gray-300">{selectedItem?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} disabled={submitting} className="bg-red-600 hover:bg-red-700">
              {submitting ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
