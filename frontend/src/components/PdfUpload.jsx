import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const PdfUpload = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [semester, setSemester] = useState("");
  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  // For manage section
  const [showManageSection, setShowManageSection] = useState(false);
  const [allPdfs, setAllPdfs] = useState([]);
  const [loadingPdfs, setLoadingPdfs] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [newFilename, setNewFilename] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const API_BASE = "https://archiv-app.onrender.com/api/pdfs";

  // Fetch all PDFs for manage section
  const fetchAllPdfs = async () => {
    try {
      setLoadingPdfs(true);
      const res = await axios.get(`${API_BASE}/files`);
      setAllPdfs(res.data);
    } catch (err) {
      console.error("Error fetching PDFs:", err);
      toast.error("Failed to load PDFs");
    } finally {
      setLoadingPdfs(false);
    }
  };

  useEffect(() => {
    if (showManageSection) {
      fetchAllPdfs();
    }
  }, [showManageSection]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      toast.error("Please select a PDF file");
      setPdfFile(null);
      e.target.value = "";
      return;
    }
    setPdfFile(file);
    toast.success(`File selected: ${file.name}`);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setPdfFile(file);
        toast.success(`File dropped: ${file.name}`);
      } else {
        toast.error("Please drop a PDF file");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile || !semester || !type || !subject || !year) {
      toast.error("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("semester", semester);
    formData.append("type", type);
    formData.append("subject", subject);
    formData.append("year", year);

    const uploadToast = toast.loading("Uploading PDF...");

    try {
      setLoading(true);

      const res = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      toast.success(`Upload successful!`, {
        id: uploadToast,
        duration: 4000,
      });

      // Reset form
      setPdfFile(null);
      setSemester("");
      setType("");
      setSubject("");
      setYear("");
      e.target.reset();
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.data?.message) {
        toast.error(err.response.data.message, { id: uploadToast });
      } else if (err.code === "ERR_NETWORK") {
        toast.error("Cannot connect to server. Check backend connection.", {
          id: uploadToast,
        });
      } else {
        toast.error("Upload failed! Please try again.", { id: uploadToast });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPdf = (pdf) => {
    setSelectedPdf(pdf);
    setNewFilename(pdf.filename);
  };

  const handleDelete = async (pdfId, filename) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`);
    if (!confirmed) return;

    const deleteToast = toast.loading("Deleting PDF...");

    try {
      await axios.delete(`${API_BASE}/delete/${pdfId}`);
      toast.success(`Deleted: ${filename}`, { id: deleteToast });
      fetchAllPdfs();
      if (selectedPdf?._id === pdfId) {
        setSelectedPdf(null);
        setNewFilename("");
      }
    } catch (err) {
      console.error("Delete error:", err);
      if (err.response?.status === 404) {
        toast.error("PDF not found", { id: deleteToast });
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message, { id: deleteToast });
      } else {
        toast.error("Delete failed", { id: deleteToast });
      }
    }
  };

  const handleRename = async () => {
    if (!selectedPdf || !newFilename.trim()) {
      toast.error("Please select a PDF and enter a new filename");
      return;
    }

    const renameToast = toast.loading("Renaming PDF...");

    try {
      const res = await axios.put(`${API_BASE}/rename/${selectedPdf._id}`, {
        newFilename: newFilename,
      });

      toast.success(`Renamed to "${res.data.newFilename}"`, {
        id: renameToast,
        duration: 4000,
      });
      
      fetchAllPdfs();
      setSelectedPdf(null);
      setNewFilename("");
    } catch (err) {
      console.error("Rename error:", err);
      if (err.response?.status === 404) {
        toast.error("PDF not found", { id: renameToast });
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message, { id: renameToast });
      } else {
        toast.error("Rename failed", { id: renameToast });
      }
    }
  };

  const resetForm = () => {
    setPdfFile(null);
    setSemester("");
    setType("");
    setSubject("");
    setYear("");
    toast.success("Form cleared");
  };

  const handleBackToHome = () => {
    window.location.hash = '';
  };

  const currentYear = new Date().getFullYear();

  // Filter PDFs based on search
  const filteredPdfs = allPdfs.filter(pdf => 
    pdf.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdf.metadata?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pdf.metadata?.semester?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-base-200 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">
              📤 Upload & Manage PDFs
            </h1>
            <p className="text-base-content/70">
              Add, delete, or rename documents in the archive
            </p>
          </div>
          <button onClick={handleBackToHome} className="btn btn-outline btn-primary gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="tabs tabs-boxed mb-6 bg-base-100 shadow-lg p-2">
          <button 
            className={`tab tab-lg flex-1 ${!showManageSection ? 'tab-active' : ''}`}
            onClick={() => setShowManageSection(false)}
          >
            📤 Upload PDF
          </button>
          <button 
            className={`tab tab-lg flex-1 ${showManageSection ? 'tab-active' : ''}`}
            onClick={() => setShowManageSection(true)}
          >
            🔧 Manage PDFs
          </button>
        </div>

        {!showManageSection ? (
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body p-8">
              <div className="space-y-6">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-lg">PDF File *</span>
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                      dragActive ? "border-primary bg-primary/10" : "border-base-300 hover:border-primary/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="pointer-events-none">
                      <div className="text-5xl mb-3">📄</div>
                      {pdfFile ? (
                        <div>
                          <p className="text-lg font-semibold text-success mb-1">✓ File Selected</p>
                          <p className="text-sm text-base-content/70">{pdfFile.name}</p>
                          <p className="text-xs text-base-content/50 mt-1">
                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-lg font-semibold mb-1">Drop PDF file here or click to browse</p>
                          <p className="text-sm text-base-content/70">Supports PDF files up to 16MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Semester *</span>
                    </label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="select select-bordered select-primary w-full"
                    >
                      <option value="">Select Semester</option>
                      <option value="S1">S1</option>
                      <option value="S2">S2</option>
                      <option value="S3">S3</option>
                      <option value="S4">S4</option>
                      <option value="S5">S5</option>
                      <option value="S6">S6</option>
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Document Type *</span>
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="select select-bordered select-primary w-full"
                    >
                      <option value="">Select Type</option>
                      <option value="Cours">Cours</option>
                      <option value="TD">TD</option>
                      <option value="TP">TP</option>
                      <option value="Devoirs">Devoirs</option>
                      <option value="Compositions">Compositions</option>
                      <option value="Rattrapage">Rattrapage</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Subject *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Mathematics"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="input input-bordered input-primary w-full"
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Year *</span>
                    </label>
                    <input
                      type="number"
                      placeholder={`e.g., ${currentYear}`}
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="input input-bordered input-primary w-full"
                      min="2000"
                      max="2030"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`btn btn-primary flex-1 ${loading ? "loading" : ""}`}
                  >
                    {loading ? "Uploading..." : "Upload PDF"}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={loading}
                    className="btn btn-outline btn-error"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* PDF List */}
            <div className="lg:col-span-2 card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl mb-4">📚 All PDFs</h2>
                
                {/* Search */}
                <div className="form-control mb-4">
                  <input
                    type="text"
                    placeholder="Search by filename, subject, or semester..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input input-bordered w-full"
                  />
                </div>

                {/* PDF List */}
                {loadingPdfs ? (
                  <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                  </div>
                ) : filteredPdfs.length === 0 ? (
                  <div className="text-center py-12 text-base-content/70">
                    <p className="text-lg">No PDFs found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {filteredPdfs.map((pdf) => (
                      <div
                        key={pdf._id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                          selectedPdf?._id === pdf._id
                            ? "border-primary bg-primary/5"
                            : "border-base-300 hover:border-primary/50"
                        }`}
                        onClick={() => handleSelectPdf(pdf)}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{pdf.filename}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="badge badge-sm badge-primary">{pdf.metadata?.semester}</span>
                              <span className="badge badge-sm badge-secondary">{pdf.metadata?.type}</span>
                              <span className="badge badge-sm badge-accent">{pdf.metadata?.subject}</span>
                              <span className="badge badge-sm">{pdf.metadata?.year}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(pdf._id, pdf.filename);
                            }}
                            className="btn btn-error btn-sm btn-circle"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rename Panel */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl mb-4">✏️ Rename PDF</h2>
                
                {selectedPdf ? (
                  <div className="space-y-4">
                    <div className="alert alert-info text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Selected: {selectedPdf.filename}</span>
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">New Filename</span>
                      </label>
                      <input
                        type="text"
                        value={newFilename}
                        onChange={(e) => setNewFilename(e.target.value)}
                        className="input input-bordered w-full"
                        placeholder="Enter new filename"
                      />
                    </div>

                    <button
                      onClick={handleRename}
                      className="btn btn-info w-full gap-2"
                      disabled={!newFilename.trim() || newFilename === selectedPdf.filename}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Rename PDF
                    </button>

                    <button
                      onClick={() => {
                        setSelectedPdf(null);
                        setNewFilename("");
                      }}
                      className="btn btn-ghost w-full"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-base-content/60">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    <p className="text-sm">Select a PDF from the list to rename it</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PdfUpload;