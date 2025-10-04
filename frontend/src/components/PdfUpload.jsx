import { useState } from "react";
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

      const res = await axios.post(
        "https://archiv-app.onrender.com/api/pdfs/upload-simple",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );

      toast.success(`Upload successful! File ID: ${res.data.fileId}`, {
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

  return (
    <div className="min-h-screen px-4 py-8 bg-base-200">
      <div className="container max-w-3xl mx-auto">
        {/* Header with Back to Home */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-primary">
              📤 Upload PDF
            </h1>
            <p className="text-base-content/70">
              Add new documents to the archive
            </p>
          </div>
          <button onClick={handleBackToHome} className="gap-2 btn btn-outline btn-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Upload Form Card */}
        <div className="shadow-xl card bg-base-100">
          <div className="p-8 card-body">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div className="form-control">
                <label className="label">
                  <span className="text-lg font-semibold label-text">
                    PDF File *
                  </span>
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                    dragActive
                      ? "border-primary bg-primary/10"
                      : "border-base-300 hover:border-primary/50"
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
                    required
                  />
                  <div className="pointer-events-none">
                    <div className="mb-3 text-5xl">📄</div>
                    {pdfFile ? (
                      <div>
                        <p className="mb-1 text-lg font-semibold text-success">
                          ✓ File Selected
                        </p>
                        <p className="text-sm text-base-content/70">
                          {pdfFile.name}
                        </p>
                        <p className="mt-1 text-xs text-base-content/50">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-1 text-lg font-semibold">
                          Drop PDF file here or click to browse
                        </p>
                        <p className="text-sm text-base-content/70">
                          Supports PDF files up to 16MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Two Column Layout for Selects */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Semester Select */}
                <div className="form-control">
                  <label className="label">
                    <span className="font-semibold label-text">Semester *</span>
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full select select-bordered select-primary"
                    required
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

                {/* Type Select */}
                <div className="form-control">
                  <label className="label">
                    <span className="font-semibold label-text">
                      Document Type *
                    </span>
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full select select-bordered select-primary"
                    required
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

              {/* Subject and Year */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Subject Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="font-semibold label-text">Subject *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Mathematics"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full input input-bordered input-primary"
                    required
                  />
                </div>

                {/* Year Input */}
                <div className="form-control">
                  <label className="label">
                    <span className="font-semibold label-text">Year *</span>
                  </label>
                  <input
                    type="number"
                    placeholder={`e.g., ${currentYear}`}
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full input input-bordered input-primary"
                    required
                    min="2000"
                    max="2030"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn btn-primary flex-1 ${loading ? "loading" : ""}`}
                >
                  {loading ? "Uploading..." : "Upload PDF"}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={loading}
                  className="btn btn-outline btn-error"
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="mt-6 shadow-lg card bg-base-100">
          <div className="card-body">
            <h3 className="text-lg card-title">📋 Upload Instructions</h3>
            <ul className="space-y-2 text-sm text-base-content/70">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Only PDF files are accepted</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>All fields marked with * are required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Maximum file size is 16MB (MongoDB limit)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Files can be uploaded via drag & drop or file browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Ensure backend server is running on port 3000</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfUpload;