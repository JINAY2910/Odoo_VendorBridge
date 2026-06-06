import { api } from '../context/AuthContext.jsx';

/**
 * Downloads a file from a protected URL by fetching it as a blob
 * using the authorized axios instance.
 * 
 * @param {string} url - The URL to download from
 * @param {string} filename - The name to save the file as
 */
export const downloadPDF = async (url, filename = 'document.pdf') => {
  try {
    const response = await api.get(url, {
      responseType: 'blob',
    });

    // Create a blob URL
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download PDF. Please try again.');
  }
};
