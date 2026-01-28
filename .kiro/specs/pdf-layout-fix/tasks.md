# Implementation Plan: PDF Layout Fix

## Overview

Fix the PDF invoice layout by constraining Terms & Conditions text to the left content area to prevent overlap with the Grand Total summary box. The implementation involves modifying the text width calculation and positioning in the PDF generator.

## Tasks

- [ ] 1. Analyze current PDF layout and identify overlap issue
  - Review the existing PDF generation code in `src/lib/pdfGenerator.ts`
  - Identify where Terms & Conditions text width is calculated using `contentWidth`
  - Document the current positioning logic for Terms & Conditions section
  - _Requirements: 1.1, 1.2_

- [ ] 2. Fix Terms & Conditions text width calculation
  - [ ] 2.1 Modify Terms & Conditions text wrapping to use left content width
    - Change `doc.splitTextToSize(terms[0], contentWidth)` to use `leftBoxWidth`
    - Ensure Terms & Conditions text stays within left content boundary
    - _Requirements: 1.2, 1.3, 1.4_

  - [ ] 2.2 Write property test for Terms & Conditions boundary constraint
    - **Property 1: Terms & Conditions Boundary Constraint**
    - **Validates: Requirements 1.1, 1.3, 1.4, 2.3**

  - [ ] 2.3 Write property test for consistent left alignment
    - **Property 2: Consistent Left Alignment and Width Usage**
    - **Validates: Requirements 1.2, 2.1**

- [ ] 3. Verify spacing and positioning
  - [ ] 3.1 Test Terms & Conditions positioning with different invoice configurations
    - Test with GST and non-GST invoices
    - Test with varying summary box heights (different payment information)
    - Verify proper spacing is maintained
    - _Requirements: 1.5, 2.2, 2.4_

  - [ ] 3.2 Write property test for proper spacing maintenance
    - **Property 3: Proper Spacing Maintenance**
    - **Validates: Requirements 1.5, 2.4**

  - [ ] 3.3 Write property test for dynamic positioning adaptation
    - **Property 4: Dynamic Positioning Adaptation**
    - **Validates: Requirements 2.2**

- [ ] 4. Test edge cases and validate fix
  - [ ] 4.1 Test with long Terms & Conditions text
    - Verify text wraps properly within left content area
    - Ensure no overlap with summary box occurs
    - _Requirements: 1.4, 2.3_

  - [ ] 4.2 Write unit tests for edge cases
    - Test very long terms text wrapping
    - Test different summary box configurations
    - Test missing optional elements (GST declarations)
    - _Requirements: 1.4, 1.5, 2.2_

- [ ] 5. Final validation and cleanup
  - [ ] 5.1 Generate test invoices with various configurations
    - Create invoices with different customer information lengths
    - Test both GST and non-GST invoice types
    - Verify Terms & Conditions are completely visible in all cases
    - _Requirements: 1.1, 1.3, 2.3_

  - [ ] 5.2 Write integration tests for complete PDF generation
    - Test end-to-end PDF generation with layout fix
    - Verify all invoice elements are properly positioned
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Checkpoint - Ensure all tests pass and layout is fixed
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Each task references specific requirements for traceability
- The core fix is in task 2.1 - changing the text width calculation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Focus on the single file modification in `src/lib/pdfGenerator.ts`