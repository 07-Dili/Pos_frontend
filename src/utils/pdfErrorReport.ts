import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ErrorEntry {
    barcode: string;
    error: string;
}


export function parseUploadErrors(errorMessage: string): ErrorEntry[] {
    const errors: ErrorEntry[] = [];

    console.log('Parsing error message:', errorMessage);

    const cleanedMessage = errorMessage.replace(/^(Product|Inventory) upload failed for:\s*/i, '');
    console.log('Cleaned message:', cleanedMessage);

    const entries = cleanedMessage.split(/,\s*(?=line\s+\d+)/);
    console.log('Split entries:', entries);

    entries.forEach((entry, index) => {
        console.log(`Processing entry ${index}:`, entry);

        const barcodeMatch = entry.match(/\(barcode:\s*([^)]+)\)/);

        const errorMatch = entry.match(/\)\s*-\s*(.+)$/);
        const errorMessage = errorMatch ? errorMatch[1].trim() : 'Validation failed';

        console.log('Barcode match:', barcodeMatch);
        console.log('Error message:', errorMessage);

        if (barcodeMatch) {
            errors.push({
                barcode: barcodeMatch[1].trim(),
                error: errorMessage
            });
        }
    });

    console.log('Final parsed errors:', errors);
    return errors;
}


export function generateErrorPDF(errors: ErrorEntry[], type: 'Product' | 'Inventory'): void {
    console.log('Starting PDF generation...');

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`${type} Upload Error Report`, 14, 20);

    doc.setFontSize(10);
    const timestamp = new Date().toLocaleString();
    doc.text(`Generated: ${timestamp}`, 14, 28);

    doc.setFontSize(12);
    doc.text(`Total Errors: ${errors.length}`, 14, 36);

    autoTable(doc, {
        startY: 45,
        head: [['Barcode', 'Error Message']],
        body: errors.map(err => [err.barcode, err.error]),
        theme: 'grid',
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
            halign: 'center'
        },
        columnStyles: {
            0: { cellWidth: 40, halign: 'center' },
            1: { cellWidth: 'auto' }
        },
        styles: {
            fontSize: 10,
            cellPadding: 5
        }
    });

    const filename = `${type.toLowerCase()}_upload_errors_${Date.now()}.pdf`;
    console.log('Saving PDF as:', filename);
    doc.save(filename);
    console.log('PDF saved successfully');
}


export function handleUploadError(errorMessage: string, type: 'Product' | 'Inventory'): void {
    try {
        console.log('=== PDF Error Report Debug ===');
        console.log('Error message received:', errorMessage);
        console.log('Type:', type);

        const errors = parseUploadErrors(errorMessage);
        console.log('Number of errors parsed:', errors.length);

        if (errors.length > 0) {
            console.log('Generating PDF...');
            generateErrorPDF(errors, type);
            console.log('PDF generation completed');
        } else {
            console.warn('No errors parsed from message. Check error message format.');
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}
