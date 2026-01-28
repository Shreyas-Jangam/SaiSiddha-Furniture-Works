# Design Document: PDF Layout Fix

## Overview

This design addresses the layout issue in PDF invoice generation where Terms & Conditions text overlaps with the Grand Total summary box. The solution involves calculating proper content widths and positioning to ensure all text elements are clearly visible and properly spaced.

## Architecture

The fix will be implemented within the existing PDF generation system by modifying the layout calculations in the `generateInvoicePDF` function. The architecture maintains the current structure while improving the positioning logic for text elements.

### Current Layout Flow
1. Header section with logo and invoice details
2. Seller and buyer information boxes
3. Product table
4. Summary section with Amount in Words (left) and Grand Total box (right)
5. Bank details and payment info
6. Terms & Conditions (currently using full width - **PROBLEM**)
7. Footer with signatures

### Proposed Layout Flow
1. Header section with logo and invoice details
2. Seller and buyer information boxes  
3. Product table
4. Summary section with Amount in Words (left) and Grand Total box (right)
5. Bank details and payment info
6. Terms & Conditions (constrained to left content area - **SOLUTION**)
7. Footer with signatures

## Components and Interfaces

### Modified Components

#### PDF Generator (`src/lib/pdfGenerator.ts`)
- **Function**: `generateInvoicePDF`
- **Modification**: Update Terms & Conditions section layout calculations
- **Input**: Sale object (unchanged)
- **Output**: PDF blob (unchanged)

#### Layout Calculations
- **Current**: Uses `contentWidth` for Terms & Conditions text wrapping
- **Proposed**: Uses `leftBoxWidth` (same as Amount in Words box) for Terms & Conditions text wrapping

### Layout Constants
```typescript
// Existing constants (no changes needed)
const contentWidth = pageWidth - margin * 2;
const leftBoxWidth = contentWidth * 0.54;
const rightBoxWidth = contentWidth * 0.43;
const rightBoxX = pageWidth - margin - rightBoxWidth;
```

## Data Models

No changes to existing data models are required. The Sale interface and related types remain unchanged.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties have been identified to validate the PDF layout fix:

### Property 1: Terms & Conditions Boundary Constraint
*For any* invoice with Terms & Conditions text, all Terms text elements should remain within the left content area boundary and not overlap with the Summary_Box
**Validates: Requirements 1.1, 1.3, 1.4, 2.3**

### Property 2: Consistent Left Alignment and Width Usage  
*For any* invoice generation, the Terms & Conditions section should use the same left content width as other left-aligned elements and maintain consistent X-coordinate positioning
**Validates: Requirements 1.2, 2.1**

### Property 3: Proper Spacing Maintenance
*For any* invoice, the Terms & Conditions section should maintain minimum required spacing from adjacent elements (payment info above, GST declarations below when present)
**Validates: Requirements 1.5, 2.4**

### Property 4: Dynamic Positioning Adaptation
*For any* invoice with varying Summary_Box heights, the Terms & Conditions positioning should adapt to maintain proper layout without overlapping
**Validates: Requirements 2.2**

## Error Handling

The PDF generation system should handle edge cases gracefully:

1. **Long Terms Text**: When terms text is exceptionally long, it should wrap properly within the left content area
2. **Variable Summary Heights**: When summary boxes have different heights due to varying payment information, Terms positioning should adjust accordingly
3. **Missing Elements**: When optional elements (like GST declarations) are not present, spacing should still be maintained properly

## Testing Strategy

### Unit Testing Approach
- Test specific layout calculations with known input values
- Verify text positioning coordinates for different invoice configurations
- Test edge cases like very long terms text and varying summary box heights

### Property-Based Testing Approach
- Generate random invoice data with varying content lengths and configurations
- Verify spatial relationships and boundary constraints hold across all generated cases
- Test with different GST configurations, payment modes, and customer information lengths
- Use a property-based testing library like fast-check for TypeScript to generate comprehensive test cases
- Configure each property test to run minimum 100 iterations for thorough validation
- Tag each test with format: **Feature: pdf-layout-fix, Property {number}: {property_text}**

### Testing Implementation
- **Unit tests**: Focus on specific coordinate calculations and text wrapping logic
- **Property tests**: Verify universal layout properties across all possible invoice configurations
- Both testing approaches are complementary and necessary for comprehensive coverage
