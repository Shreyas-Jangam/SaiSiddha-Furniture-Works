import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import { Plus, Pencil, Trash2, Search, FileText, CalendarIcon, RotateCcw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Quotation } from '@/types';
import { getQuotations, saveQuotation, updateQuotation, deleteQuotation, resetAllQuotations } from '@/lib/storage';
import { toast } from 'sonner';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  
  const [formData, setFormData] = useState({
    quotationName: '',
    customerName: '',
    dateGiven: undefined as Date | undefined,
    dateOrderReceived: undefined as Date | undefined,
  });

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = () => {
    setQuotations(getQuotations());
  };

  const resetForm = () => {
    setFormData({
      quotationName: '',
      customerName: '',
      dateGiven: undefined,
      dateOrderReceived: undefined,
    });
    setEditingQuotation(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.quotationName || !formData.customerName || !formData.dateGiven) {
      toast.error('Please fill in quotation name, customer name, and date given');
      return;
    }

    if (editingQuotation) {
      updateQuotation(editingQuotation.id, formData);
      toast.success('Quotation updated successfully');
    } else {
      saveQuotation(formData as Omit<Quotation, 'id' | 'createdAt' | 'status'>);
      toast.success('Quotation added successfully');
    }

    loadQuotations();
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setFormData({
      quotationName: quotation.quotationName,
      customerName: quotation.customerName,
      dateGiven: quotation.dateGiven,
      dateOrderReceived: quotation.dateOrderReceived,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteQuotation(id);
    loadQuotations();
    toast.success('Quotation deleted successfully');
  };

  const handleMarkReceived = (quotation: Quotation) => {
    updateQuotation(quotation.id, { dateOrderReceived: new Date() });
    loadQuotations();
    toast.success('Order marked as received');
  };

  const handleResetQuotations = () => {
    resetAllQuotations();
    loadQuotations();
    toast.success('All quotations have been reset');
  };

  const filteredQuotations = quotations.filter(q =>
    q.quotationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout title="Quotations" subtitle="Manage quotations and track order conversions">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search quotations..."
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
              <AlertDialogTitle>Reset All Quotations?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all quotations.
                <br /><br />
                <strong className="text-destructive">Type "RESET" to confirm:</strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Input 
              id="reset-quotations-confirm"
              placeholder="Type RESET to confirm"
              className="mt-2"
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => {
                  const input = document.getElementById('reset-quotations-confirm') as HTMLInputElement;
                  if (input?.value !== 'RESET') {
                    e.preventDefault();
                    toast.error('Please type RESET to confirm');
                    return;
                  }
                  handleResetQuotations();
                }}
                className="bg-destructive hover:bg-destructive/90"
              >
                Reset All Quotations
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
              <Plus className="w-4 h-4 mr-2" /> Add Quotation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingQuotation ? 'Edit Quotation' : 'Add New Quotation'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="quotationName">Quotation Name *</Label>
                <Input
                  id="quotationName"
                  value={formData.quotationName}
                  onChange={(e) => setFormData({ ...formData, quotationName: e.target.value })}
                  placeholder="e.g., QT-2024-001"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Customer or Company name"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Date Quotation Given *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateGiven && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateGiven ? format(formData.dateGiven, "PPP") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dateGiven}
                      onSelect={(date) => setFormData({ ...formData, dateGiven: date })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Date Order Received (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dateOrderReceived && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dateOrderReceived ? format(formData.dateOrderReceived, "PPP") : <span>Select date (if order received)</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.dateOrderReceived}
                      onSelect={(date) => setFormData({ ...formData, dateOrderReceived: date })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-primary">
                  {editingQuotation ? 'Update Quotation' : 'Add Quotation'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filteredQuotations.length === 0 ? (
        <div className="dashboard-card text-center py-12">
          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">No Quotations Yet</h3>
          <p className="text-muted-foreground mb-4">Start by adding your first quotation.</p>
          <Button onClick={() => setIsDialogOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" /> Add First Quotation
          </Button>
        </div>
      ) : (
        <div className="dashboard-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="table-header">
                  <TableHead>Quotation Name</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date Given</TableHead>
                  <TableHead>Order Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotations.map((quotation) => (
                  <TableRow key={quotation.id} className="table-row-hover">
                    <TableCell className="font-medium text-foreground">{quotation.quotationName}</TableCell>
                    <TableCell className="text-muted-foreground">{quotation.customerName}</TableCell>
                    <TableCell className="text-sm">{format(quotation.dateGiven, 'dd MMM yyyy')}</TableCell>
                    <TableCell className="text-sm">
                      {quotation.dateOrderReceived 
                        ? format(quotation.dateOrderReceived, 'dd MMM yyyy')
                        : <span className="text-muted-foreground">-</span>
                      }
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        quotation.status === 'Received' ? 'badge-success' :
                        quotation.status === 'Pending' ? 'badge-warning' : 'badge-error'
                      }`}>
                        {quotation.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {quotation.status === 'Pending' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkReceived(quotation)}
                            className="text-success hover:text-success"
                            title="Mark as Order Received"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(quotation)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(quotation.id)}
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
