"use client";
import { useState } from "react";
import { Upload, History, LogOut } from "lucide-react";
import { runLocalPrediction } from "../services/localModel";
import HistoryPage from "../components/History";
import { classifyImage } from "../services/imageClassify";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("upload");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const token =
    sessionStorage.getItem("token") || localStorage.getItem("token");
  if (!token) {
    window.location.href = "/signin";
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null); // reset result
    }
  };

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Don't strip the prefix - return the full base64 string including the data URL prefix
        resolve(reader.result as string);
      };
      reader.onerror = (error) => reject(error);
    });

  const handleAnalyzeImage = async () => {
    if (!image) {
      alert("No image selected.");
      return;
    }

    try {
      setLoading(true);
      const base64 = await convertToBase64(image);
      console.log("Base64:", base64);
      const res = await classifyImage(base64);  
      setResult(res);
    } catch (err) {
      alert("Analysis failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const lesionDescriptions: Record<string, string> = {
    AKIEC:
      "Actinic Keratosis / Intraepithelial Carcinoma - a precancerous growth caused by sun damage",
    BCC: "Basal Cell Carcinoma - the most common type of skin cancer",
    BKL: "Benign Keratosis-like Lesions - includes seborrheic keratoses and solar lentigos",
    DF: "Dermatofibroma - a common benign skin growth",
    MEL: "Melanoma - a serious form of skin cancer",
    NV: "Melanocytic Nevi - commonly known as moles",
    VASC: "Vascular Lesions - including angiomas, angiokeratomas, etc.",
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary text-text p-6 space-y-4">
        <h1 className="text-xl font-bold mb-4">Skin Lesion CDSS</h1>
        <nav className="space-y-2">
          <button
            className={`w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 ${
              activeTab === "upload" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActiveTab("upload")}
          >
            <Upload className="inline-block mr-2" size={18} />
            Upload
          </button>
          <button
            className={`w-full text-left py-2 px-4 rounded-md hover:bg-gray-700 ${
              activeTab === "history" ? "bg-gray-700" : ""
            }`}
            onClick={() => setActiveTab("history")}
          >
            <History className="inline-block mr-2" size={18} />
            History
          </button>

          <button
            className="w-full text-left py-2 px-4 rounded-md hover:bg-gray-700"
            onClick={() => {
              sessionStorage.clear();
              localStorage.clear();
              window.location.href = "/signin";
            }}
          >
            <LogOut className="inline-block mr-2" size={18} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-gray-50">
        {activeTab === "upload" && (
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-1">
              Upload Skin Lesion Image
            </h2>
            <p className="text-gray-600 mb-4">
              Upload an image of the skin lesion for analysis. You can use your
              camera or upload a file.
            </p>

            {/* File Upload */}
            <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center text-center mb-4">
              <Upload className="text-gray-400 mb-2" size={36} />
              <p className="text-gray-500 mb-2">
                Drag and drop or click to upload
              </p>
              <label className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-sm font-medium bg-secondary">
                Browse Files
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Preview Image */}
            {previewUrl && (
              <div className="mb-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="rounded-md max-h-64 mx-auto"
                />
              </div>
            )}

            {/* Analyze Button */}
            <button
              onClick={handleAnalyzeImage}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-md flex justify-center items-center gap-2 text-sm font-medium"
            >
              {loading ? (
                "Analyzing..."
              ) : (
                <>
                  <Upload size={18} /> Analyze Image
                </>
              )}
            </button>

            {/* Result Display */}
            {result && (
              <div className="mt-6 bg-white p-4 rounded shadow">
                <h3 className="font-semibold text-lg mb-2">
                  Prediction Result
                </h3>
                <p>
                  <strong>Predicted Class:</strong> {result.predicted_class}
                </p>

                {/* Lesion Descriptions */}
                <div className="mt-4">
                  <h4 className="font-medium">Lesion Classifications:</h4>
                  <ul className="text-sm text-gray-700 list-disc pl-5">
                    {Object.entries(lesionDescriptions).map(
                      ([key, description]) => (
                        <li key={key}>
                          <strong>{key}:</strong> {description}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {/* Probabilities */}
                <div className="mt-4">
                  <h4 className="font-medium">Probabilities:</h4>
                  <ul className="text-sm text-gray-700 list-disc pl-5">
                    {Object.entries(result.probabilities)
                      .sort(([, valueA], [, valueB]) => {
                        const probA = typeof valueA === "number" ? valueA : 0;
                        const probB = typeof valueB === "number" ? valueB : 0;
                        return probB - probA; // Sort in descending order
                      })
                      .map(([key, value]) => {
                        const prob = typeof value === "number" ? value : 0;
                        return (
                          <li key={key}>
                            <strong>{key}:</strong> {(prob * 100).toFixed(2)}%
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && <HistoryPage />}
      </main>
    </div>
  );
}
