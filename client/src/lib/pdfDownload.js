export const pdfDownload = () => {
    // When using Vite, we need to reference files in the public directory with just a forward slash
    const pdfPath = "/blankpdf-cv.pdf";
    
    // Instead of creating and removing an anchor element, we can use the native fetch API
    // This is more reliable across different environments
    fetch(pdfPath)
        .then(response => response.blob())
        .then(blob => {
            // Create a blob URL for the PDF
            const blobUrl = window.URL.createObjectURL(blob);
            
            // Create and use a temporary link
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = 'emergency.pdf';
            
            // Programmatically click the link
            link.click();
            
            // Clean up by revoking the blob URL
            window.URL.revokeObjectURL(blobUrl);
        })
        .catch(error => {
            console.error('Error downloading the PDF:', error);
        });
}