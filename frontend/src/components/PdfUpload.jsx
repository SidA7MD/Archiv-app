import { useState, useEffect } from "react";

const PdfUpload = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [semester, setSemester] = useState("");
  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [newFilename, setNewFilename] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const API_URL = "https://archiv-app.onrender.com/api/pdfs";

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3000);
  };

  const fetchFiles = async () => {
    try {
      const res = await fetch(`${API_URL}/files`);
      const data = await res.json();
      setFiles(data);
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      showToast("Veuillez sélectionner un fichier PDF", "error");
      setPdfFile(null);
      e.target.value = "";
      return;
    }
    setPdfFile(file);
    showToast(`Fichier sélectionné : ${file.name}`);
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
        showToast(`Fichier déposé : ${file.name}`);
      } else {
        showToast("Veuillez déposer uniquement un PDF", "error");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile || !semester || !type || !subject || !year) {
      showToast("Tous les champs sont obligatoires !", "error");
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
      const res = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Succès ! Fichier: ${data.filename}`);
        setPdfFile(null);
        setSemester("");
        setType("");
        setSubject("");
        setYear("");
        e.target.reset();
        fetchFiles();
      } else {
        showToast(data.message || "Échec du téléversement", "error");
      }
    } catch (err) {
      console.error("Erreur upload:", err);
      showToast("Échec du téléversement, réessayez.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm("Voulez-vous vraiment supprimer ce fichier ?")) return;

    try {
      const res = await fetch(`${API_URL}/files/${fileId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Fichier supprimé avec succès");
        fetchFiles();
      } else {
        const data = await res.json();
        showToast(data.message || "Échec de la suppression", "error");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      showToast("Échec de la suppression", "error");
    }
  };

  const handleRename = async (fileId) => {
    if (!newFilename.trim()) {
      showToast("Le nom du fichier ne peut pas être vide", "error");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/files/${fileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newFilename }),
      });

      if (res.ok) {
        showToast("Fichier renommé avec succès");
        setEditingFile(null);
        setNewFilename("");
        fetchFiles();
      } else {
        const data = await res.json();
        showToast(data.message || "Échec du renommage", "error");
      }
    } catch (err) {
      console.error("Error renaming file:", err);
      showToast("Échec du renommage", "error");
    }
  };

  const handleDownload = (fileId, filename) => {
    window.open(`${API_URL}/download/${fileId}`, "_blank");
  };

  const resetForm = () => {
    setPdfFile(null);
    setSemester("");
    setType("");
    setSubject("");
    setYear("");
    showToast("Formulaire réinitialisé");
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {toast.show && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 ${
          toast.type === "error" ? "bg-red-500" : "bg-green-500"
        } text-white`}>
          {toast.message}
        </div>
      )}

      <div className="container max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-blue-700">Gestion des PDF</h1>
            <p className="text-gray-500">Téléverser et gérer vos documents</p>
          </div>
          <button
            onClick={() => window.location.hash = ""}
            className="px-4 py-2 text-blue-600 transition border border-blue-500 rounded-lg hover:bg-blue-50"
          >
            Retour
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="p-8 border border-gray-200 shadow-lg bg-white/80 backdrop-blur-md rounded-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Téléverser un PDF</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 font-semibold text-gray-700">Fichier PDF *</label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                    dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400"
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
                  {pdfFile ? (
                    <div>
                      <p className="font-semibold text-green-600">✓ {pdfFile.name}</p>
                      <p className="text-xs text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">Glissez-déposez un PDF</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium text-gray-700">Semestre *</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Choisir</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                    <option value="S4">S4</option>
                    <option value="S5">S5</option>
                    <option value="S6">S6</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="">Choisir</option>
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
                  <label className="block mb-1 font-medium text-gray-700">Matière *</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Mathématiques"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-medium text-gray-700">Année *</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    placeholder={currentYear.toString()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    required
                    min="2000"
                    max="2030"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-lg text-white font-semibold transition ${
                    loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {loading ? "Téléversement..." : "Téléverser"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 text-red-500 transition border border-red-400 rounded-lg hover:bg-red-50"
                >
                  Effacer
                </button>
              </div>
            </form>
          </div>

          {/* Files List Section */}
          <div className="p-8 border border-gray-200 shadow-lg bg-white/80 backdrop-blur-md rounded-2xl">
            <h2 className="mb-6 text-2xl font-bold text-gray-800">Fichiers ({files.length})</h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {files.length === 0 ? (
                <p className="text-center text-gray-500">Aucun fichier</p>
              ) : (
                files.map((file) => (
                  <div key={file._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                    {editingFile === file._id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newFilename}
                          onChange={(e) => setNewFilename(e.target.value)}
                          placeholder="Nouveau nom"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRename(file._id)}
                            className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                          >
                            Sauvegarder
                          </button>
                          <button
                            onClick={() => {
                              setEditingFile(null);
                              setNewFilename("");
                            }}
                            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-800 mb-2">{file.filename}</h3>
                        <div className="text-sm text-gray-600 mb-3">
                          <p>Semestre: {file.metadata?.semester} | Type: {file.metadata?.type}</p>
                          <p>Matière: {file.metadata?.subject} | Année: {file.metadata?.year}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(file._id, file.filename)}
                            className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
                          >
                            Télécharger
                          </button>
                          <button
                            onClick={() => {
                              setEditingFile(file._id);
                              setNewFilename(file.filename);
                            }}
                            className="px-3 py-1 text-sm text-white bg-yellow-500 rounded hover:bg-yellow-600"
                          >
                            Renommer
                          </button>
                          <button
                            onClick={() => handleDelete(file._id)}
                            className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                          >
                            Supprimer
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfUpload;
