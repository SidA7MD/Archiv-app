// API Service Layer
const API_BASE_URL = "https://archiv-app.onrender.com/api/pdfs";

const api = {
  /**
   * Fetch all PDFs from the server
   * @returns {Promise<Array>} Array of PDF objects
   */
  async fetchPdfs() {
    try {
      const response = await fetch(`${API_BASE_URL}/files`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      throw error;
    }
  },

  /**
   * Download a PDF file
   * @param {string} fileId - The ID of the file to download
   * @returns {Promise<Blob>} The PDF file as a Blob
   */
  async downloadPdf(fileId) {
    try {
      const response = await fetch(`${API_BASE_URL}/download/${fileId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  },

  /**
   * Get the URL for viewing a PDF
   * @param {string} fileId - The ID of the file
   * @returns {string} The URL to view the PDF
   */
  getViewUrl(fileId) {
    return `${API_BASE_URL}/download/${fileId}`;
  }
};

export default api;