# Requirements Document

## Introduction

Fix the PDF invoice layout issue where Terms & Conditions text overlaps with the Grand Total summary box, ensuring proper text positioning and readability.

## Glossary

- **PDF_Generator**: The system component responsible for generating invoice PDFs
- **Terms_Section**: The section containing terms and conditions text in the invoice
- **Summary_Box**: The right-aligned box containing Grand Total and payment summary
- **Content_Width**: The full available width for content on the PDF page
- **Left_Content_Width**: The available width for left-aligned content that doesn't overlap with right-side elements

## Requirements

### Requirement 1: Terms & Conditions Layout

**User Story:** As a user generating PDF invoices, I want the Terms & Conditions text to be completely visible without overlapping other elements, so that all invoice information is clearly readable.

#### Acceptance Criteria

1. WHEN Terms & Conditions are rendered, THE PDF_Generator SHALL position them to avoid overlapping with the Summary_Box
2. WHEN calculating text width for Terms & Conditions, THE PDF_Generator SHALL use Left_Content_Width instead of full Content_Width
3. WHEN the Summary_Box is present on the right side, THE Terms_Section SHALL be constrained to the left portion of the page
4. WHEN Terms & Conditions text is split into multiple lines, THE PDF_Generator SHALL ensure all lines remain within the left content area
5. THE PDF_Generator SHALL maintain proper spacing between Terms & Conditions and other invoice elements

### Requirement 2: Layout Consistency

**User Story:** As a user, I want consistent spacing and alignment in PDF invoices, so that the document appears professional and well-formatted.

#### Acceptance Criteria

1. WHEN positioning Terms & Conditions, THE PDF_Generator SHALL maintain consistent margins with other left-aligned content
2. WHEN the Summary_Box height varies, THE Terms_Section SHALL adapt its positioning accordingly
3. THE PDF_Generator SHALL ensure Terms & Conditions do not extend beyond the left content boundary
4. WHEN GST declarations are present, THE PDF_Generator SHALL position them below Terms & Conditions with proper spacing