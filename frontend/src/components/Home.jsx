import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import api from '../services/api';
import Header from './Header';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import SearchBar from './SearchBar';
import FiltersSection from './FiltersSection';
import ResultsInfo from './ResultsInfo';
import NoResults from './NoResults';
import PdfCard from './PdfCard';

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

  // Fetch PDFs
  const fetchPdfs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.fetchPdfs();
      setPdfs(data);
      toast.success(`Loaded ${data.length} PDFs successfully!`);
    } catch (err) {
      console.error("Error fetching PDFs:", err);
      setError("Failed to load PDFs. Please check your connection.");
      toast.error("Failed to load PDFs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPdfs();
  }, []);

  // Filter PDFs
  const filteredPdfs = pdfs.filter(pdf => {
    const matchesSearch = 
      pdf.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf.metadata?.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = !filters.semester || pdf.metadata?.semester === filters.semester;
    const matchesType = !filters.type || pdf.metadata?.type === filters.type;
    const matchesYear = !filters.year || pdf.metadata?.year === filters.year;

    return matchesSearch && matchesSemester && matchesType && matchesYear;
  });

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ semester: "", type: "", year: "" });
    setSearchTerm("");
    toast.success("Filters cleared");
  };

  // Download PDF
  const handleDownload = async (fileId, filename) => {
    const downloadToast = toast.loading('Downloading...');
    try {
      const blob = await api.downloadPdf(fileId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download completed!', { id: downloadToast });
    } catch (err) {
      console.error("Download error:", err);
      toast.error("Failed to download PDF", { id: downloadToast });
    }
  };

  // View PDF
  const handleView = (fileId) => {
    window.open(api.getViewUrl(fileId), '_blank');
    toast.success('Opening PDF in new tab');
  };

  // Get unique years for filter
  const yearOptions = Array.from(
    new Set(pdfs.map(pdf => pdf.metadata?.year).filter(Boolean))
  )
    .sort()
    .map(year => ({ value: year, label: year }));

  // Check if filters are active
  const hasActiveFilters = searchTerm || filters.semester || filters.type || filters.year;

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
       

        {/* Controls */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-8 space-y-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <FiltersSection
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            yearOptions={yearOptions}
          />
        </div>

        {/* Results Info */}
        <ResultsInfo
          filteredCount={filteredPdfs.length}
          totalCount={pdfs.length}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={fetchPdfs} />}

        {/* PDF Grid */}
        {!error && (
          <>
            {filteredPdfs.length === 0 ? (
              <NoResults
                onClearFilters={clearFilters}
                hasFilters={hasActiveFilters}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPdfs.map((pdf) => (
                  <PdfCard
                    key={pdf._id}
                    pdf={pdf}
                    onView={handleView}
                    onDownload={handleDownload}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Home;