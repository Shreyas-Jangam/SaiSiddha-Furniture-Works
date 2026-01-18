import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, RefreshCw } from 'lucide-react';
import { calculateCFT } from '@/lib/storage';

export default function CFTCalculatorPage() {
  const [dimensions, setDimensions] = useState({
    length: 0,
    width: 0,
    height: 0,
  });
  const [quantity, setQuantity] = useState(1);
  const [pricePerCft, setPricePerCft] = useState(0);

  const cftPerPiece = calculateCFT(dimensions.length, dimensions.width, dimensions.height);
  const totalCft = cftPerPiece * quantity;
  const pricePerPiece = cftPerPiece * pricePerCft;
  const totalAmount = pricePerPiece * quantity;

  const handleReset = () => {
    setDimensions({ length: 0, width: 0, height: 0 });
    setQuantity(1);
    setPricePerCft(0);
  };

  return (
    <AdminLayout title="CFT Calculator" subtitle="Calculate cubic feet and pricing for wooden products">
      <div className="max-w-2xl mx-auto">
        <div className="dashboard-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-lg bg-primary/10">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">CFT Calculator</h2>
              <p className="text-sm text-muted-foreground">Formula: CFT = (L × W × H) ÷ 1728</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Dimensions */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Dimensions (in inches)</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">Length</Label>
                  <Input
                    id="length"
                    type="number"
                    min="0"
                    step="0.1"
                    value={dimensions.length || ''}
                    onChange={(e) => setDimensions({ ...dimensions, length: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="text-center text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    type="number"
                    min="0"
                    step="0.1"
                    value={dimensions.width || ''}
                    onChange={(e) => setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="text-center text-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    type="number"
                    min="0"
                    step="0.1"
                    value={dimensions.height || ''}
                    onChange={(e) => setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="text-center text-lg"
                  />
                </div>
              </div>
            </div>

            {/* Quantity and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity (pieces)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  placeholder="1"
                  className="text-center text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerCft">Price per CFT (₹)</Label>
                <Input
                  id="pricePerCft"
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricePerCft || ''}
                  onChange={(e) => setPricePerCft(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="text-center text-lg"
                />
              </div>
            </div>

            {/* Results */}
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-4 text-center">Calculation Results</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-card text-center">
                  <p className="text-sm text-muted-foreground mb-1">CFT per Piece</p>
                  <p className="text-2xl font-bold text-foreground">{cftPerPiece.toFixed(4)}</p>
                </div>
                <div className="p-4 rounded-lg bg-card text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total CFT</p>
                  <p className="text-2xl font-bold text-foreground">{totalCft.toFixed(4)}</p>
                </div>
                <div className="p-4 rounded-lg bg-card text-center">
                  <p className="text-sm text-muted-foreground mb-1">Price per Piece</p>
                  <p className="text-2xl font-bold text-primary">₹{pricePerPiece.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg bg-card text-center">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-2xl font-bold text-accent">₹{totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Reset Calculator
            </Button>
          </div>
        </div>

        {/* Info Card */}
        <div className="dashboard-card mt-6">
          <h3 className="font-semibold text-foreground mb-3">What is CFT?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            CFT (Cubic Feet) is a unit of volume measurement commonly used in the timber and wood industry. 
            It helps in calculating the volume of wooden products for pricing and shipping purposes.
          </p>
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <p className="font-medium text-foreground mb-2">Formula:</p>
            <code className="text-primary">CFT = (Length × Width × Height) ÷ 1728</code>
            <p className="text-muted-foreground mt-2">Where dimensions are in inches and 1728 = 12³ (converts cubic inches to cubic feet)</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
