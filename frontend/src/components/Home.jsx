import { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";

const Home = () => {
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    semester: "",
    type: "",
    year: ""
  });

  // Fetch all PDFs
  const fetchPdfs = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://archiv-app.onrender.com/api/pdfs/files");
      setPdfs(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching PDFs:", err);
      setError("Failed to load PDFs. Make sure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  // Filter PDFs based on search and filters
  const filteredPdfs = pdfs.filter(pdf => {
    const matchesSearch = pdf.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pdf.metadata?.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = !filters.semester || pdf.metadata?.semester === filters.semester;
    const matchesType = !filters.type || pdf.metadata?.type === filters.type;
    const matchesYear = !filters.year || pdf.metadata?.year === filters.year;

    return matchesSearch && matchesSemester && matchesType && matchesYear;
  });

  // Download PDF
  const handleDownload = async (fileId, filename) => {
    try {
      const response = await axios.get(
        `https://archiv-app.onrender.com/api/pdfs/download/${fileId}`,
        { responseType: 'blob' }
      );
      
      // Create blob link and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download PDF");
    }
  };

  // View PDF in new tab
  const handleView = (fileId) => {
    window.open(`https://archiv-app.onrender.com/api/pdfs/download/${fileId}`, '_blank');
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({ semester: "", type: "", year: "" });
    setSearchTerm("");
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading PDFs...</p>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Header */}
      <div className="header">
        <h1>PDF Archive</h1>
        <p>Browse and download study materials</p>
      </div>

      {/* Search and Filters */}
      <div className="controls">
        {/* Search */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by filename or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        {/* Filters */}
        <div className="filters">
          <select
            value={filters.semester}
            onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
          >
            <option value="">All Semesters</option>
            <option value="S1">S1</option>
            <option value="S2">S2</option>
            <option value="S3">S3</option>
            <option value="S4">S4</option>
            <option value="S5">S5</option>
            <option value="S6">S6</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="Cours">Cours</option>
            <option value="TD">TD</option>
            <option value="TP">TP</option>
            <option value="Devoirs">Devoirs</option>
            <option value="Compositions">Compositions</option>
            <option value="Rattrapage">Rattrapage</option>
          </select>

          <select
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          >
            <option value="">All Years</option>
            {Array.from(new Set(pdfs.map(pdf => pdf.metadata?.year))).filter(Boolean).sort().map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button onClick={clearFilters} className="clear-btn">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-info">
        <p>
          Showing {filteredPdfs.length} of {pdfs.length} PDFs
          {(searchTerm || filters.semester || filters.type || filters.year) && (
            <button onClick={clearFilters} className="clear-filters-small">
              Clear all
            </button>
          )}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPdfs} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* PDF Cards Grid */}
      {!error && (
        <div className="pdf-grid">
          {filteredPdfs.length === 0 ? (
            <div className="no-results">
              <p>No PDFs found matching your criteria.</p>
              {pdfs.length > 0 && (
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear filters to see all PDFs
                </button>
              )}
            </div>
          ) : (
            filteredPdfs.map((pdf) => (
              <div key={pdf._id} className="pdf-card">
                <div className="card-header">
                  <div className="file-icon">📄</div>
                  <h3 className="filename">
                    {pdf.filename?.length > 30 
                      ? pdf.filename.substring(0, 30) + '...' 
                      : pdf.filename}
                  </h3>
                </div>
                
                <div className="card-content">
                  <div className="metadata">
                    <div className="meta-item">
                      <span className="meta-label">Subject:</span>
                      <span className="meta-value">{pdf.metadata?.subject || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Semester:</span>
                      <span className="meta-value">{pdf.metadata?.semester || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Type:</span>
                      <span className="meta-value">{pdf.metadata?.type || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Year:</span>
                      <span className="meta-value">{pdf.metadata?.year || 'N/A'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Uploaded:</span>
                      <span className="meta-value">
                        {pdf.uploadDate ? new Date(pdf.uploadDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  <button 
                    onClick={() => handleView(pdf._id)}
                    className="view-btn"
                  >
                    👁️ View
                  </button>
                  <button 
                    onClick={() => handleDownload(pdf._id, pdf.filename)}
                    className="download-btn"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Home;