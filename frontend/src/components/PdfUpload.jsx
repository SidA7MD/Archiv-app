import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const PdfUpload = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [semester, setSemester] = useState("");
  const [type, setType] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [editingFile, setEditingFile] = useState(null);
  const [newFilename, setNewFilename] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const API_URL = "https://archiv-app.onrender.com/api/pdfs";
  const currentYear = new Date().getFullYear();

  const semesters = ["S1", "S2", "S3", "S4", "S5", "S6"];
  const types = ["Cours", "TD", "TP", "Devoirs", "Compositions", "Rattrapage"];

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
      toast.error("Veuillez sélectionner un fichier PDF");
      e.target.value = "";
      return;
    }
    setPdfFile(file);
    toast.success(`Fichier sélectionné : ${file.name}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile || !semester || !type || !subject || !year) {
      toast.error("Tous les champs sont obligatoires !");
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
        toast.success(`Fichier téléversé: ${data.filename}`);
        setPdfFile(null);
        setSemester("");
        setType("");
        setSubject("");
        setYear("");
        fetchFiles();
      } else {
        toast.error(data.message || "Échec du téléversement");
      }
    } catch (err) {
      console.error("Erreur upload:", err);
      toast.error("Échec du téléversement, réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce fichier ?")) return;

    try {
      const res = await fetch(`${API_URL}/files/${fileId}`, { method: "DELETE" });

      if (res.ok) {
        toast.success("Fichier supprimé");
        fetchFiles();
      } else {
        const data = await res.json();
        toast.error(data.message || "Échec de la suppression");
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      toast.error("Échec de la suppression");
    }
  };

  const handleRename = async (fileId) => {
    if (!newFilename.trim()) {
      toast.error("Le nom ne peut pas être vide");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/files/${fileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newFilename }),
      });

      if (res.ok) {
        toast.success("Fichier renommé");
        setEditingFile(null);
        setNewFilename("");
        fetchFiles();
      } else {
        const data = await res.json();
        toast.error(data.message || "Échec du renommage");
      }
    } catch (err) {
      console.error("Error renaming file:", err);
      toast.error("Échec du renommage");
    }
  };

  const handleDownload = (fileId) => {
    window.open(`${API_URL}/download/${fileId}`, "_blank");
  };

  const filteredFiles = files.filter((f) => {
    const matchSemester = selectedSemester === "all" || f.metadata?.semester === selectedSemester;
    const matchType = selectedType === "all" || f.metadata?.type === selectedType;
    return matchSemester && matchType;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 md:p-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-3 py-8">
          <div className="inline-block">
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Gestion des PDF
              </h1>
            </div>
            <p className="text-lg text-gray-600 font-medium">
              Téléverser, filtrer et gérer vos documents facilement
            </p>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-800">Téléverser un PDF</h2>
              </div>
              <div className="space-y-5">
                <div className="relative">
                  <input
                    type="file"
                    accept="application/pdf"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-medium hover:file:bg-emerald-100 cursor-pointer"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white text-gray-800 font-medium cursor-pointer"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    <option value="">Semestre</option>
                    {semesters.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  <select
                    className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all bg-white text-gray-800 font-medium cursor-pointer"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="">Type</option>
                    {types.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Matière"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all text-gray-800 font-medium"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />

                <input
                  type="number"
                  placeholder={currentYear.toString()}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition-all text-gray-800 font-medium"
                  value={year}
                  min="2000"
                  max="2030"
                  onChange={(e) => setYear(e.target.value)}
                />

                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold py-3.5 px-6 rounded-xl hover:from-emerald-700 hover:to-teal-700 active:scale-98 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Téléversement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Téléverser
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  <h2 className="text-2xl font-bold text-gray-800">Fichiers</h2>
                </div>
                <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full text-sm">
                  {filteredFiles.length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <select
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-sm font-medium text-gray-700 cursor-pointer"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                >
                  <option value="all">Tous les semestres</option>
                  {semesters.map((s) => <option key={s}>{s}</option>)}
                </select>

                <select
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all bg-white text-sm font-medium text-gray-700 cursor-pointer"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  <option value="all">Tous les types</option>
                  {types.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="overflow-y-auto max-h-[500px] space-y-3 pr-2">
                {filteredFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 font-medium">Aucun fichier trouvé</p>
                  </div>
                ) : (
                  filteredFiles.map((file) => (
                    <div key={file._id} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row justify-between gap-3">
                        <div className="flex-1">
                          {editingFile === file._id ? (
                            <input
                              type="text"
                              value={newFilename}
                              onChange={(e) => setNewFilename(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-emerald-500 rounded-lg focus:ring-2 focus:ring-emerald-200 font-medium"
                            />
                          ) : (
                            <h3 className="font-bold text-gray-800 mb-1">{file.filename}</h3>
                          )}
                          <p className="text-sm text-gray-600 font-medium">
                            <span className="inline-block bg-white px-2 py-1 rounded mr-1">{file.metadata?.semester}</span>
                            <span className="inline-block bg-white px-2 py-1 rounded mr-1">{file.metadata?.type}</span>
                            <span className="inline-block bg-white px-2 py-1 rounded mr-1">{file.metadata?.subject}</span>
                            <span className="inline-block bg-white px-2 py-1 rounded">{file.metadata?.year}</span>
                          </p>
                        </div>

                        <div className="flex gap-1 justify-end flex-wrap">
                          {editingFile === file._id ? (
                            <>
                              <button
                                onClick={() => handleRename(file._id)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 active:scale-95 font-medium text-xs transition-all shadow-sm hover:shadow flex items-center gap-0.5"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Sauver
                              </button>
                              <button
                                onClick={() => setEditingFile(null)}
                                className="px-2 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 active:scale-95 font-medium text-xs transition-all shadow-sm hover:shadow flex items-center gap-0.5"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Annuler
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleDownload(file._id)}
                                className="px-2 py-1 bg-sky-600 text-white rounded hover:bg-sky-700 active:scale-95 font-medium text-xs transition-all shadow-sm hover:shadow flex items-center gap-0.5"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Télécharger
                              </button>
                              <button
                                onClick={() => {
                                  setEditingFile(file._id);
                                  setNewFilename(file.filename);
                                }}
                                className="px-2 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 active:scale-95 font-medium text-xs transition-all shadow-sm hover:shadow flex items-center gap-0.5"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Renommer
                              </button>
                              <button
                                onClick={() => handleDelete(file._id)}
                                className="px-2 py-1 bg-rose-600 text-white rounded hover:bg-rose-700 active:scale-95 font-medium text-xs transition-all shadow-sm hover:shadow flex items-center gap-0.5"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PdfUpload;
