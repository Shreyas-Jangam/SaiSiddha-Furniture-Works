import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Package, RotateCcw } from 'lucide-react';
import { Product, PRODUCT_CATEGORIES, WOOD_TYPES } from '@/types';
import { getProducts, saveProduct, updateProduct, deleteProduct, calculateCFT, resetAllProducts } from '@/lib/storage';
import { toast } from 'sonner';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { logActivity } = useAdminAuth();
  
  const [formData, setFormData] = useState<{
    name: string;
    category: string;
    woodType: 'Jungle Wood' | 'Pine Wood' | 'Custom';
    length: number;
    width: number;
    height: number;
    pricePerCft: number;
    quantity: number;
    minOrderQuantity: number;
    notes: string;
  }>({
    name: '',
    category: '',
    woodType: 'Jungle Wood',
    length: 0,
    width: 0,
    height: 0,
    pricePerCft: 0,
    quantity: 0,
    minOrderQuantity: 1,
    notes: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setProducts(getProducts());
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      woodType: 'Jungle Wood',
      length: 0,
      width: 0,
      height: 0,
      pricePerCft: 0,
      quantity: 0,
      minOrderQuantity: 1,
      notes: '',
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || formData.length <= 0 || formData.width <= 0 || formData.height <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
      await logActivity('product_updated', { productId: editingProduct.id, name: formData.name });
      toast.success('Product updated successfully');
    } else {
      saveProduct(formData);
      await logActivity('product_created', { name: formData.name, category: formData.category });
      toast.success('Product added successfully');
    }

    loadProducts();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      woodType: product.woodType as 'Jungle Wood' | 'Pine Wood' | 'Custom',
      length: product.length,
      width: product.width,
      height: product.height,
      pricePerCft: product.pricePerCft,
      quantity: product.quantity,
      minOrderQuantity: product.minOrderQuantity,
      notes: product.notes,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string, productName: string) => {
    deleteProduct(id);
    await logActivity('product_deleted', { productId: id, name: productName });
    loadProducts();
    toast.success('Product deleted successfully');
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cftPreview = calculateCFT(formData.length, formData.width, formData.height);
  const pricePreview = formData.pricePerCft * 4;

  const handleResetProducts = () => {
    resetAllProducts();
    loadProducts();
    toast.success('All products have been reset');
  };

  return (
    <AdminLayout title="Products" subtitle="Manage your inventory and product catalog">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <RotateCcw className="w-4 h-4 mr-2" /> Reset All
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset All Products?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all products from your inventory.
                <br /><br />
                <strong className="text-destructive">Type "RESET" to confirm:</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input 
              id="reset-confirm-input"
              placeholder="Type RESET to confirm"
              className="mt-2"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  const input = document.getElementById('reset-confirm-input') as HTMLInputElement;
                  if (input?.value !== 'RESET') {
                    e.preventDefault();
                    toast.error('Please type RESET to confirm');
                    return;
                  }
                  handleResetProducts();
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                Reset All Products
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., EURO 4-Way Pallet"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="woodType">Wood Type *</Label>
                  <Select
                    value={formData.woodType}
                    onValueChange={(value: typeof formData.woodType) => setFormData({ ...formData, woodType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WOOD_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pricePerCft">Price per CFT (₹) *</Label>
                  <Input
                    id="pricePerCft"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.pricePerCft || ''}
                    onChange={(e) => setFormData({ ...formData, pricePerCft: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-semibold text-sm mb-3">Dimensions (in mm)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="length">Length *</Label>
                    <Input
                      id="length"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.length || ''}
                      onChange={(e) => setFormData({ ...formData, length: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="width">Width *</Label>
                    <Input
                      id="width"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.width || ''}
                      onChange={(e) => setFormData({ ...formData, width: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height *</Label>
                    <Input
                      id="height"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.height || ''}
                      onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                
                {cftPreview > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">CFT per piece:</span>
                      <span className="font-semibold text-foreground">{cftPreview.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-muted-foreground">Price per piece:</span>
                      <span className="font-bold text-primary">₹{pricePreview.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Available Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minOrderQuantity">Minimum Order Qty</Label>
                  <Input
                    id="minOrderQuantity"
                    type="number"
                    min="1"
                    value={formData.minOrderQuantity || ''}
                    onChange={(e) => setFormData({ ...formData, minOrderQuantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes / Custom Requirements</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special notes or requirements..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-primary">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">No Products Yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first product to the inventory.</p>
          <Button onClick={() => setIsDialogOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" /> Add First Product
          </Button>
        </div>
      ) : (
        <div className="dashboard-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Dimensions</TableHead>
                  <TableHead className="text-right">CFT</TableHead>
                  <TableHead className="text-right">Price/Pc</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="table-row-hover">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.woodType}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.category}</TableCell>
                    <TableCell className="text-sm">
                      {product.length} × {product.width} × {product.height} mm
                    </TableCell>
                    <TableCell className="text-right text-sm">{product.cftPerPiece.toFixed(3)}</TableCell>
                    <TableCell className="text-right font-medium">₹{product.pricePerPiece.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{product.quantity}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        product.status === 'In Stock' ? 'badge-success' :
                        product.status === 'Low Stock' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {product.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
