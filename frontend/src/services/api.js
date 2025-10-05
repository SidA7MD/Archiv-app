// API Service Layer
const API_BASE_URL = "https://archiv-app.onrender.com/api/pdfs";

const api = {
  /**
   * 
   * @returns {Promise<Array>} 
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
   * 
   * @param {string} fileId 
   * @returns {Promise<Blob>} 
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
   *
   * @param {string} fileId 
   * @returns {string} 
   */
  getViewUrl(fileId) {
    return `${API_BASE_URL}/download/${fileId}`;
  }
};

export default api;