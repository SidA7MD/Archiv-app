import { useState, useEffect } from "react";

const PdfUpload = () => {
  // ========== API CONFIGURATION ==========
  // Automatically detect localhost vs production
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  
  const LOCALHOST_URL = "http://localhost:3000/api/pdfs";
  const PRODUCTION_URL = "https://archiv-app.onrender.com/api/pdfs";
  const API_BASE_URL = isLocalhost ? LOCALHOST_URL : PRODUCTION_URL;
  // =======================================

  const [pdfFile, setPdfFile] = useState(null);
  const [semester, setSemester] = useState("");
  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fetchingFiles, setFetchingFiles] = useState(false);
  const [renameModal, setRenameModal] = useState({ show: false, fileId: null, currentName: "" });
  const [newFileName, setNewFileName] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Remove the old API_BASE_URL line since it's now at the top

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      setFetchingFiles(true);
      const response = await fetch(`${API_BASE_URL}/files`);
      const data = await response.json();
      setUploadedFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
      showToast("Failed to fetch files", "error");
    } finally {
      setFetchingFiles(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      showToast("Please select a PDF file", "error");
      setPdfFile(null);
      e.target.value = "";
      return;
    }
    setPdfFile(file);
    showToast(`File selected: ${file.name}`, "success");
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
        showToast(`File dropped: ${file.name}`, "success");
      } else {
        showToast("Please drop a PDF file", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile || !semester || !type || !subject || !year) {
      showToast("All fields are required!", "error");
      return;
    }

    const formData = new FormData();
    formData.append("file", pdfFile);
    formData.append("semester", semester);
    formData.append("type", type);
    formData.append("subject", subject);
    formData.append("year", year);

    try {
      setLoading(true);
      showToast("Uploading PDF...", "info");

      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(errorData.message || "Upload failed");
      }

      const data = await res.json();
      showToast(`Upload successful! File: ${data.filename}`, "success");

      setPdfFile(null);
      setSemester("");
      setType("");
      setSubject("");
      setYear("");
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      fetchUploadedFiles();
    } catch (err) {
      console.error("Upload error:", err);
      showToast(err.message || "Upload failed! Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId, filename) => {
    if (!confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/delete/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to delete file" }));
        throw new Error(errorData.message || "Failed to delete file");
      }

      showToast("File deleted successfully", "success");
      fetchUploadedFiles();
    } catch (error) {
      console.error("Delete error:", error);
      showToast(error.message || "Failed to delete file", "error");
    }
  };

  const openRenameModal = (fileId, currentName) => {
    setRenameModal({ show: true, fileId, currentName });
    setNewFileName(currentName);
  };

  const closeRenameModal = () => {
    setRenameModal({ show: false, fileId: null, currentName: "" });
    setNewFileName("");
  };

  const handleRename = async () => {
    if (!newFileName.trim()) {
      showToast("Please enter a new filename", "error");
      return;
    }

    try {
      showToast("Renaming file...", "info");
      
      console.log("=== FRONTEND RENAME REQUEST ===");
      console.log("File ID:", renameModal.fileId);
      console.log("New Name:", newFileName);
      console.log("API URL:", `${API_BASE_URL}/rename/${renameModal.fileId}`);
      
      const response = await fetch(`${API_BASE_URL}/rename/${renameModal.fileId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newName: newFileName }),
      });

      const data = await response.json().catch(() => ({}));
      console.log("Response status:", response.status);
      console.log("Response data:", data);

      if (!response.ok) {
        console.error("Rename failed:", response.status, data);
        throw new Error(data.message || `Failed to rename file (${response.status})`);
      }

      showToast("File renamed successfully", "success");
      closeRenameModal();
      
      // Wait a bit before refreshing to ensure DB is updated
      setTimeout(() => {
        fetchUploadedFiles();
      }, 500);
    } catch (error) {
      console.error("Rename error:", error);
      showToast(error.message || "Failed to rename file", "error");
    }
  };

  const handleDownload = (fileId, filename) => {
    const url = `${API_BASE_URL}/download/${fileId}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
  };

  const resetForm = () => {
    setPdfFile(null);
    setSemester("");
    setType("");
    setSubject("");
    setYear("");
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = "";
    showToast("Form cleared", "success");
  };

  const handleBackToHome = () => {
    window.location.hash = "";
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      {toast.show && (
        <div className="fixed z-50 top-4 right-4">
          <div className={`px-6 py-4 rounded-lg shadow-lg ${
            toast.type === "success" ? "bg-green-500" :
            toast.type === "error" ? "bg-red-500" :
            toast.type === "info" ? "bg-blue-500" : "bg-gray-500"
          } text-white`}>
            {toast.message}
          </div>
        </div>
      )}

      {renameModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h3 className="mb-4 text-xl font-bold">Rename File</h3>
            <p className="mb-4 text-sm text-gray-600">
              Current name: <span className="font-semibold">{renameModal.currentName}</span>
            </p>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new filename"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleRename}
                className="flex-1 px-4 py-2 text-white transition bg-blue-500 rounded-lg hover:bg-blue-600"
              >
                Rename
              </button>
              <button
                onClick={closeRenameModal}
                className="flex-1 px-4 py-2 text-gray-700 transition bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container max-w-6xl mx-auto">
        {/* API Status Indicator */}
        <div className="p-3 mb-4 bg-yellow-100 border-l-4 border-yellow-500 rounded">
          <p className="text-sm font-semibold text-yellow-800">
            🔧 API Mode: <span className="font-mono">{isLocalhost ? "LOCALHOST" : "PRODUCTION"}</span>
          </p>
          <p className="mt-1 text-xs text-yellow-700">
            Using: {API_BASE_URL}
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-blue-600">
              📤 Upload PDF
            </h1>
            <p className="text-gray-600">
              Add new documents to the archive
            </p>
          </div>
          <button onClick={handleBackToHome} className="flex items-center gap-2 px-4 py-2 text-blue-500 transition border-2 border-blue-500 rounded-lg hover:bg-blue-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="p-8 bg-white rounded-lg shadow-lg">
            <div className="space-y-6">
              <div>
                <label className="block mb-2 text-lg font-semibold">
                  PDF File *
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-blue-400"
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
                    <div className="mb-3 text-5xl">📄</div>
                    {pdfFile ? (
                      <div>
                        <p className="mb-1 text-lg font-semibold text-green-600">
                          ✓ File Selected
                        </p>
                        <p className="text-sm text-gray-600">
                          {pdfFile.name}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-1 text-lg font-semibold">
                          Drop PDF file here or click to browse
                        </p>
                        <p className="text-sm text-gray-600">
                          Supports PDF files up to 16MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold">Semester *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

                <div>
                  <label className="block mb-2 font-semibold">
                    Document Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold">Subject *</label>
                  <input
                    type="text"
                    placeholder="e.g., Mathematics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold">Year *</label>
                  <input
                    type="number"
                    placeholder={`e.g., ${currentYear}`}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="2000"
                    max="2030"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Uploading..." : "Upload PDF"}
                </button>

                <button
                  onClick={resetForm}
                  disabled={loading}
                  className="px-6 py-3 font-semibold text-red-500 transition border-2 border-red-500 rounded-lg hover:bg-red-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white rounded-lg shadow-lg">
            <h3 className="flex items-center justify-between mb-4 text-xl font-bold">
              <span>📁 Uploaded Files</span>
              <button
                onClick={fetchUploadedFiles}
                disabled={fetchingFiles}
                className="px-3 py-1 text-sm transition bg-gray-100 rounded hover:bg-gray-200"
              >
                {fetchingFiles ? "Loading..." : "Refresh"}
              </button>
            </h3>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {uploadedFiles.length === 0 ? (
                <p className="py-8 text-center text-gray-500">No files uploaded yet</p>
              ) : (
                uploadedFiles.map((file) => (
                  <div
                    key={file._id}
                    className="p-4 transition border border-gray-200 rounded-lg hover:border-blue-300"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">
                          {file.filename}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded">
                            {file.metadata?.semester || "N/A"}
                          </span>
                          <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded">
                            {file.metadata?.type || "N/A"}
                          </span>
                          <span className="px-2 py-1 text-xs text-purple-700 bg-purple-100 rounded">
                            {file.metadata?.subject || "N/A"}
                          </span>
                          <span className="px-2 py-1 text-xs text-orange-700 bg-orange-100 rounded">
                            {file.metadata?.year || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleDownload(file._id, file.filename)}
                        className="flex-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => openRenameModal(file._id, file.filename)}
                        className="flex-1 px-3 py-1.5 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleDelete(file._id, file.filename)}
                        className="flex-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-6 mt-6 bg-white rounded-lg shadow-lg">
          <h3 className="mb-3 text-lg font-bold">📋 Upload Instructions</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Only PDF files are accepted</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>All fields marked with * are required</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Maximum file size is 16MB (MongoDB limit)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Files can be uploaded via drag & drop or file browser</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Click rename to change file names, delete to remove files</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>API automatically switches between localhost and production</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PdfUpload;