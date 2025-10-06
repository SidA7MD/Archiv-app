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
      toast.error("Veuillez sélectionner un fichier PDF");
      setPdfFile(null);
      e.target.value = "";
      return;
    }
    setPdfFile(file);
    toast.success(`Fichier sélectionné : ${file.name}`);
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
        toast.success(`Fichier déposé : ${file.name}`);
      } else {
        toast.error("Veuillez déposer uniquement un PDF");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile || !semester || !type || !subject || !year) {
      toast.error("Tous les champs sont obligatoires !");
      return;
    }

    const formData = new FormData();
    formData.append("pdf", pdfFile);
    formData.append("semester", semester);
    formData.append("type", type);
    formData.append("subject", subject);
    formData.append("year", year);

    const uploadToast = toast.loading("Téléversement en cours...");

    try {
      setLoading(true);

      const res = await axios.post(
        "https://archiv-app.onrender.com/api/pdfs/upload-simple",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 30000,
        }
      );

      toast.success(`Succès ! ID: ${res.data.fileId}`, {
        id: uploadToast,
        duration: 4000,
      });

      setPdfFile(null);
      setSemester("");
      setType("");
      setSubject("");
      setYear("");
      e.target.reset();
    } catch (err) {
      console.error("Erreur upload:", err);
      toast.error("Échec du téléversement, réessayez.", { id: uploadToast });
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
    toast.success("Formulaire réinitialisé");
  };

  const handleBackToHome = () => {
    window.location.hash = "";
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="container max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-blue-700">
              Upload PDF
            </h1>
            <p className="text-gray-500">Ajoutez un nouveau document</p>
          </div>
          <button
            onClick={handleBackToHome}
            className="px-4 py-2 text-blue-600 transition border border-blue-500 rounded-lg hover:bg-blue-50"
          >
            Retour
          </button>
        </div>

        <div className="p-8 border border-gray-200 shadow-lg bg-white/80 backdrop-blur-md rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">
                Fichier PDF *
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
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
                  required
                />
                {pdfFile ? (
                  <div>
                    <p className="font-semibold text-green-600">
                      ✓ {pdfFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    Glissez-déposez un PDF ou cliquez pour sélectionner
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Semestre *
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
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
                <label className="block mb-1 font-medium text-gray-700">
                  Type *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Matière *
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Mathématiques"
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  required
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Année *
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder={currentYear}
                  className="w-full border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                  required
                  min="2000"
                  max="2030"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 rounded-lg text-white font-semibold transition ${
                  loading
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 shadow-md"
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

        <div className="p-6 mt-6 bg-white border border-gray-200 shadow-md rounded-xl">
          <h3 className="mb-3 text-lg font-bold text-gray-800">Instructions</h3>
          <ul className="space-y-1 text-gray-600 list-disc list-inside">
            <li>Uniquement fichiers PDF acceptés</li>
            <li>Tous les champs marqués * sont obligatoires</li>
            <li>Taille maximale 16MB</li>
            <li>Glisser-déposer ou sélection manuelle</li>
            <li>Assurez-vous que le backend est en ligne</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PdfUpload;
