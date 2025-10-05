import { useState, useEffect } from "react";
import toast from 'react-hot-toast';
import api from '../services/api';
import Loading from './Loading';
import ErrorMessage from './ErrorMessage';
import SearchBar from './SearchBar';
import FiltersSection from './FiltersSection';
import ResultsInfo from './ResultsInfo';
import NoResults from './NoResults';
import PdfCard from './PdfCard';

const Home = () => {
  const [pdfs, setPdfs] = useState([]);
  const [allPdfs, setAllPdfs] = useState([]); // Store all PDFs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    semester: "",
    type: "",
    year: ""
  });
  const [hasLoadedAll, setHasLoadedAll] = useState(false); // Track if all PDFs are loaded

  // Fetch initial 6 PDFs (one per type)
  const fetchInitialPdfs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.fetchPdfs();
      
      // Filter to keep only one item per type (max 6)
      const uniqueTypes = new Map();
      data.forEach(pdf => {
        const type = pdf.metadata?.type;
        if (type && !uniqueTypes.has(type)) {
          uniqueTypes.set(type, pdf);
        }
      });
      
      const filteredData = Array.from(uniqueTypes.values());
      setPdfs(filteredData);
      setAllPdfs(data); // Store all PDFs for later use
      toast.success(`Loaded ${filteredData.length} featured PDFs!`);
    } catch (err) {
      console.error("Error fetching PDFs:", err);
      setError("Failed to load PDFs. Please check your connection.");
      toast.error("Failed to load PDFs");
    } finally {
      setLoading(false);
    }
  };

  // Load all PDFs when search or filter is applied
  const loadAllPdfs = () => {
    if (!hasLoadedAll && allPdfs.length > 0) {
      setPdfs(allPdfs);
      setHasLoadedAll(true);
      toast.success(`Loaded all ${allPdfs.length} PDFs!`);
    }
  };

  useEffect(() => {
    fetchInitialPdfs();
  }, []);

  // Check if user is searching or filtering
  const hasActiveFilters = searchTerm || filters.semester || filters.type || filters.year;

  // Load all PDFs when filters are applied
  useEffect(() => {
    if (hasActiveFilters && !hasLoadedAll) {
      loadAllPdfs();
    }
  }, [hasActiveFilters]);

  const filteredPdfs = pdfs.filter(pdf => {
    const matchesSearch = 
      pdf.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pdf.metadata?.subject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSemester = !filters.semester || pdf.metadata?.semester === filters.semester;
    const matchesType = !filters.type || pdf.metadata?.type === filters.type;
    const matchesYear = !filters.year || pdf.metadata?.year === filters.year;

    return matchesSearch && matchesSemester && matchesType && matchesYear;
  });

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const clearFilters = () => {
    setFilters({ semester: "", type: "", year: "" });
    setSearchTerm("");
    toast.success("Filters cleared");
  };

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

  const handleView = (fileId) => {
    window.open(api.getViewUrl(fileId), '_blank');
    toast.success('Opening PDF in new tab');
  };

  const yearOptions = Array.from(
    new Set(pdfs.map(pdf => pdf.metadata?.year).filter(Boolean))
  ).sort().map(year => ({ value: year, label: year }));

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-white">
      <div className="container px-4 py-10 mx-auto max-w-full w-[95%]">
        {/* Controls */}
        <div className="p-6 mb-8 space-y-6 bg-white rounded-lg shadow-lg">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <FiltersSection
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            yearOptions={yearOptions}
          />
        </div>

        <ResultsInfo
          filteredCount={filteredPdfs.length}
          totalCount={hasLoadedAll ? allPdfs.length : pdfs.length}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {error && <ErrorMessage message={error} onRetry={fetchInitialPdfs} />}

        {!error && (
          filteredPdfs.length === 0 ? (
            <NoResults
              onClearFilters={clearFilters}
              hasFilters={hasActiveFilters}
            />
          ) : (
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {filteredPdfs.map((pdf) => (
                <PdfCard
                  key={pdf._id}
                  pdf={pdf}
                  onView={handleView}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;