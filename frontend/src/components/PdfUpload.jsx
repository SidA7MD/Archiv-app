import { useState } from "react";
import axios from "axios";

const PdfUpload = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [semester, setSemester] = useState("");
  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      setMessage("Please select a PDF file");
      setPdfFile(null);
      e.target.value = ""; // Clear the file input
      return;
    }
    setPdfFile(file);
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pdfFile || !semester || !type || !subject || !year) {
      setMessage("All fields are required!");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("semester", semester);
    formData.append("type", type);
    formData.append("subject", subject);
    formData.append("year", year);

    try {
      setLoading(true);
      setMessage("Uploading...");
      
      const res = await axios.post(
  "http://localhost:3000/api/pdfs/upload-simple", // Use the simpler endpoint
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 30000, // 30 second timeout
  }
);
      
      setMessage(`✅ ${res.data.message} (File ID: ${res.data.fileId})`);
      
      // Reset form
      setPdfFile(null);
      setSemester("");
      setType("");
      setSubject("");
      setYear("");
      
      // Clear file input
      e.target.reset();
      
    } catch (err) {
      console.error("Upload error:", err);
      if (err.response?.data?.message) {
        setMessage(`❌ ${err.response.data.message}`);
      } else if (err.code === "ERR_NETWORK") {
        setMessage("❌ Cannot connect to server. Make sure backend is running.");
      } else {
        setMessage("❌ Upload failed! Please try again.");
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
    setMessage("");
  };

  return (
    <div className="pdf-upload" style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px", color: "#333" }}>
        Upload PDF Document
      </h2>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {/* File Input */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            PDF File *
          </label>
          <input 
            type="file" 
            accept="application/pdf" 
            onChange={handleFileChange}
            required
            style={{ width: "100%", padding: "8px" }}
          />
          {pdfFile && (
            <p style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
              Selected: {pdfFile.name}
            </p>
          )}
        </div>

        {/* Semester Select */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Semester *
          </label>
          <select 
            value={semester} 
            onChange={(e) => setSemester(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
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
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Document Type *
          </label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
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

        {/* Subject Input */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Subject *
          </label>
          <input
            type="text"
            placeholder="Enter subject name"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
        </div>

        {/* Year Input */}
        <div>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Year *
          </label>
          <input
            type="number"
            placeholder="Enter year (e.g., 2024)"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            min="2000"
            max="2030"
            style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <button 
            type="submit" 
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              backgroundColor: loading ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "16px"
            }}
          >
            {loading ? "Uploading..." : "Upload PDF"}
          </button>
          
          <button 
            type="button" 
            onClick={resetForm}
            style={{
              padding: "12px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {/* Message Display */}
      {message && (
        <div 
          style={{
            marginTop: "20px",
            padding: "15px",
            borderRadius: "4px",
            backgroundColor: message.includes("✅") ? "#d4edda" : "#f8d7da",
            border: `1px solid ${message.includes("✅") ? "#c3e6cb" : "#f5c6cb"}`,
            color: message.includes("✅") ? "#155724" : "#721c24"
          }}
        >
          {message}
        </div>
      )}

      {/* Instructions */}
      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
        <h4 style={{ marginBottom: "10px" }}>Instructions:</h4>
        <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "#666" }}>
          <li>Only PDF files are allowed</li>
          <li>All fields marked with * are required</li>
          <li>File size should be reasonable (under 16MB for MongoDB)</li>
          <li>Make sure the backend server is running on port 3000</li>
        </ul>
      </div>
    </div>
  );
};

export default PdfUpload;