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
  const [displayedPdfs, setDisplayedPdfs] = useState([]); // PDFs currently shown
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    semester: "",
    type: "",
    year: ""
  });

  // Get 6 random PDFs with different types
  const getRandomSixPdfs = (allPdfs) => {
    const typeGroups = {};
    
    // Group PDFs by type
    allPdfs.forEach(pdf => {
      const type = pdf.metadata?.type;
      if (type) {
        if (!typeGroups[type]) {
          typeGroups[type] = [];
        }
        typeGroups[type].push(pdf);
      }
    });

    // Get one random PDF from each type (max 6 types)
    const types = Object.keys(typeGroups);
    const randomPdfs = [];
    
    // Shuffle types to get random order
    const shuffledTypes = types.sort(() => Math.random() - 0.5).slice(0, 6);
    
    shuffledTypes.forEach(type => {
      const pdfsOfType = typeGroups[type];
      const randomIndex = Math.floor(Math.random() * pdfsOfType.length);
      randomPdfs.push(pdfsOfType[randomIndex]);
    });

    return randomPdfs;
  };

  // Fetch all PDFs from backend
  const fetchAllPdfs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await api.fetchPdfs();
      setPdfs(data);
      
      // Show 6 random PDFs initially
      const randomSix = getRandomSixPdfs(data);
      setDisplayedPdfs(randomSix);
      toast.success(`Loaded ${randomSix.length} featured PDFs!`);
    } catch (err) {
      console.error("Error fetching PDFs:", err);
      setError("Failed to load PDFs. Please check your connection.");
      toast.error("Failed to load PDFs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllPdfs();
  }, []);

  // Check if user is searching or filtering
  const hasActiveFilters = searchTerm || filters.semester || filters.type || filters.year;

  // Update displayed PDFs based on filters
  useEffect(() => {
    if (hasActiveFilters) {
      // Apply filters to all PDFs
      const filtered = pdfs.filter(pdf => {
        const matchesSearch = 
          pdf.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pdf.metadata?.subject?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSemester = !filters.semester || pdf.metadata?.semester === filters.semester;
        const matchesType = !filters.type || pdf.metadata?.type === filters.type;
        const matchesYear = !filters.year || pdf.metadata?.year === filters.year;

        return matchesSearch && matchesSemester && matchesType && matchesYear;
      });
      setDisplayedPdfs(filtered);
    } else {
      // No filters: show 6 random PDFs
      const randomSix = getRandomSixPdfs(pdfs);
      setDisplayedPdfs(randomSix);
    }
  }, [searchTerm, filters, pdfs]);

  const filteredPdfs = displayedPdfs;

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
          totalCount={pdfs.length}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />

        {error && <ErrorMessage message={error} onRetry={fetchAllPdfs} />}

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