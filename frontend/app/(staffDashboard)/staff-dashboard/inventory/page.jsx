"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Plus, Edit, Trash2, Search, Filter, AlertTriangle, MoreHorizontal, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

const InventoryPage = () => {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [statusFilter, setStatusFilter] = useState("active")
  const [refreshing, setRefreshing] = useState(false)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isStockModalOpen, setIsStockModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // Form states
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

  const [stockData, setStockData] = useState({
    quantity: "",
    operation: "add",
    reason: "",
  })

  useEffect(() => {
    fetchInventoryData()
    fetchCategories()
  }, [])

  const fetchInventoryData = async () => {
    try {
      setRefreshing(true)
      const params = new URLSearchParams()
      if (selectedCategory) params.append("category", selectedCategory)
      if (statusFilter) params.append("status", statusFilter)
      if (searchTerm) params.append("search", searchTerm)

      const response = await fetch(`/api/inventory/items?${params}`, {
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to fetch inventory")

      const data = await response.json()
      if (data.success) {
        setItems(data.data)
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to load inventory data")
      console.error("Inventory error:", err)
      toast.error("Failed to load inventory data")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/inventory/categories", {
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to fetch categories")

      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (err) {
      console.error("Categories error:", err)
    }
  }

  const handleRefresh = () => {
    fetchInventoryData()
    toast.success("Inventory refreshed")
  }

  const handleAddItem = async () => {
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
          categoryId: Number.parseInt(formData.categoryId),
          quantity: Number.parseInt(formData.quantity),
          minimumQuantity: Number.parseInt(formData.minimumQuantity),
          unitPrice: Number.parseFloat(formData.unitPrice) || 0,
          location: formData.location,
          supplier: formData.supplier,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setIsAddModalOpen(false)
        resetForm()
        fetchInventoryData()
        toast.success("Item added successfully")
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to add item")
      console.error("Add item error:", err)
      toast.error("Failed to add item")
    }
  }

  const handleEditItem = async () => {
    if (!selectedItem) return

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
          categoryId: Number.parseInt(formData.categoryId),
          quantity: Number.parseInt(formData.quantity),
          minimumQuantity: Number.parseInt(formData.minimumQuantity),
          unitPrice: Number.parseFloat(formData.unitPrice) || 0,
          location: formData.location,
          supplier: formData.supplier,
          status: selectedItem.status,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setIsEditModalOpen(false)
        setSelectedItem(null)
        resetForm()
        fetchInventoryData()
        toast.success("Item updated successfully")
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to update item")
      console.error("Edit item error:", err)
      toast.error("Failed to update item")
    }
  }

  const handleDeleteItem = async (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      const response = await fetch(`/api/inventory/items/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json()
      if (data.success) {
        fetchInventoryData()
        toast.success("Item deleted successfully")
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to delete item")
      console.error("Delete item error:", err)
      toast.error("Failed to delete item")
    }
  }

  const handleStockUpdate = async () => {
    if (!selectedItem) return

    try {
      const response = await fetch(`/api/inventory/items/${selectedItem.id}/stock`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          quantity: Number.parseInt(stockData.quantity),
          operation: stockData.operation,
          reason: stockData.reason,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setIsStockModalOpen(false)
        setSelectedItem(null)
        setStockData({ quantity: "", operation: "add", reason: "" })
        fetchInventoryData()
        toast.success("Stock updated successfully")
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError("Failed to update stock")
      console.error("Stock update error:", err)
      toast.error("Failed to update stock")
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
  }

  const openEditModal = (item) => {
    setSelectedItem(item)
    setFormData({
      itemCode: item.item_code,
      name: item.name,
      description: item.description || "",
      categoryId: item.category_id.toString(),
      quantity: item.quantity.toString(),
      minimumQuantity: item.minimum_quantity.toString(),
      unitPrice: (item.unit_price || 0).toString(),
      location: item.location || "",
      supplier: item.supplier || "",
    })
    setIsEditModalOpen(true)
  }

  const openStockModal = (item) => {
    setSelectedItem(item)
    setIsStockModalOpen(true)
  }

  const getStockStatus = (item) => {
    if (item.quantity === 0) return { status: "Out of Stock", color: "bg-red-600/20 text-red-300 border-red-500/30" }
    if (item.quantity <= item.minimum_quantity)
      return { status: "Low Stock", color: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30" }
    return { status: "In Stock", color: "bg-green-600/20 text-green-300 border-green-500/30" }
  }

  const formatPrice = (price) => {
    const numPrice = Number(price)
    return isNaN(numPrice) ? "0.00" : numPrice.toFixed(2)
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || item.category_id.toString() === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-64 mb-6"></div>
            <div className="h-96 bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-gray-400 mt-1">Manage your inventory items and stock levels</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search" className="text-gray-300">
                  Search
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="category" className="text-gray-300">
                  Category
                </Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="text-gray-300">
                  Status
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="all">All</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={fetchInventoryData}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Inventory Items ({filteredItems.length})</CardTitle>
            <CardDescription className="text-gray-400">Manage your inventory items and stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Item Code</TableHead>
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-300">Stock</TableHead>
                    <TableHead className="text-gray-300">Min Stock</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Unit Price</TableHead>
                    <TableHead className="text-gray-300">Location</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const stockStatus = getStockStatus(item)
                    return (
                      <TableRow key={item.id} className="border-gray-700 hover:bg-gray-700/30">
                        <TableCell className="font-medium text-gray-200">{item.item_code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-200">{item.name}</div>
                            {item.description && <div className="text-sm text-gray-400">{item.description}</div>}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{item.category_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-200">{item.quantity}</span>
                            {item.quantity <= item.minimum_quantity && (
                              <AlertTriangle className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{item.minimum_quantity}</TableCell>
                        <TableCell>
                          <Badge className={stockStatus.color}>{stockStatus.status}</Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">${formatPrice(item.unit_price)}</TableCell>
                        <TableCell className="text-gray-300">{item.location || "N/A"}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-700">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-600">
                              <DropdownMenuItem
                                onClick={() => openEditModal(item)}
                                className="text-gray-300 hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openStockModal(item)}
                                className="text-gray-300 hover:bg-gray-700"
                              >
                                <Package className="h-4 w-4 mr-2" />
                                Update Stock
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-red-400 hover:bg-gray-700"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {filteredItems.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No inventory items found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Item Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-100">Add New Item</DialogTitle>
              <DialogDescription className="text-gray-400">Add a new item to your inventory</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemCode" className="text-gray-300">
                  Item Code *
                </Label>
                <Input
                  id="itemCode"
                  value={formData.itemCode}
                  onChange={(e) => setFormData({ ...formData, itemCode: e.target.value })}
                  placeholder="Enter item code"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="name" className="text-gray-300">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter item description"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="categoryId" className="text-gray-300">
                  Category *
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="quantity" className="text-gray-300">
                  Quantity *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="minimumQuantity" className="text-gray-300">
                  Minimum Quantity *
                </Label>
                <Input
                  id="minimumQuantity"
                  type="number"
                  value={formData.minimumQuantity}
                  onChange={(e) => setFormData({ ...formData, minimumQuantity: e.target.value })}
                  placeholder="Enter minimum quantity"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="unitPrice" className="text-gray-300">
                  Unit Price
                </Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="Enter unit price"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-gray-300">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="supplier" className="text-gray-300">
                  Supplier
                </Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Enter supplier"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleAddItem} className="bg-blue-600 hover:bg-blue-700">
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Item Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-100">Edit Item</DialogTitle>
              <DialogDescription className="text-gray-400">Update item information</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editItemCode" className="text-gray-300">
                  Item Code
                </Label>
                <Input
                  id="editItemCode"
                  value={formData.itemCode}
                  disabled
                  className="bg-gray-600 border-gray-500 text-gray-300"
                />
              </div>
              <div>
                <Label htmlFor="editName" className="text-gray-300">
                  Name *
                </Label>
                <Input
                  id="editName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="editDescription" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="editDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter item description"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editCategoryId" className="text-gray-300">
                  Category *
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editQuantity" className="text-gray-300">
                  Quantity *
                </Label>
                <Input
                  id="editQuantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editMinimumQuantity" className="text-gray-300">
                  Minimum Quantity *
                </Label>
                <Input
                  id="editMinimumQuantity"
                  type="number"
                  value={formData.minimumQuantity}
                  onChange={(e) => setFormData({ ...formData, minimumQuantity: e.target.value })}
                  placeholder="Enter minimum quantity"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editUnitPrice" className="text-gray-300">
                  Unit Price
                </Label>
                <Input
                  id="editUnitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="Enter unit price"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editLocation" className="text-gray-300">
                  Location
                </Label>
                <Input
                  id="editLocation"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Enter location"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="editSupplier" className="text-gray-300">
                  Supplier
                </Label>
                <Input
                  id="editSupplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="Enter supplier"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleEditItem} className="bg-blue-600 hover:bg-blue-700">
                Update Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stock Update Modal */}
        <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-gray-100">Update Stock</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update stock for {selectedItem?.name} (Current: {selectedItem?.quantity})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stockOperation" className="text-gray-300">
                  Operation
                </Label>
                <Select
                  value={stockData.operation}
                  onValueChange={(value) => setStockData({ ...stockData, operation: value })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-gray-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="add">Add Stock</SelectItem>
                    <SelectItem value="subtract">Remove Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="stockQuantity" className="text-gray-300">
                  Quantity
                </Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={stockData.quantity}
                  onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="stockReason" className="text-gray-300">
                  Reason *
                </Label>
                <Textarea
                  id="stockReason"
                  value={stockData.reason}
                  onChange={(e) => setStockData({ ...stockData, reason: e.target.value })}
                  placeholder="Enter reason for stock update"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsStockModalOpen(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button onClick={handleStockUpdate} className="bg-blue-600 hover:bg-blue-700">
                Update Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default InventoryPage
