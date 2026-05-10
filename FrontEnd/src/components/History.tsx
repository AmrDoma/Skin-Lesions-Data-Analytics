"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Eye, Trash2, HelpCircle } from "lucide-react";
import { deleteHistory, getUserHistory } from "../endpoints/history";
import toast from "react-hot-toast";

// Add lesion definitions for tooltips
const lesionDefinitions: Record<string, string> = {
  AKIEC:
    "Actinic Keratosis / Intraepithelial Carcinoma - A precancerous growth caused by sun damage.",
  BCC: "Basal Cell Carcinoma - The most common type of skin cancer.",
  BKL: "Benign Keratosis-like Lesions - Includes seborrheic keratoses and solar lentigos.",
  DF: "Dermatofibroma - A common benign skin growth.",
  MEL: "Melanoma - A serious form of skin cancer that develops from pigment cells.",
  NV: "Melanocytic Nevi - Commonly known as moles.",
  VASC: "Vascular Lesions - Including angiomas and pyogenic granulomas.",
};

// Create a separate Tooltip component for reusability
const Tooltip: React.FC<{
  content: string;
  isVisible: boolean;
  className?: string;
}> = ({ content, isVisible, className = "" }) => {
  if (!isVisible) return null;

  return (
    <div
      className={`fixed transform -translate-x-1/2 bg-gray-800 text-white rounded py-2 px-3 shadow-lg z-[1000] ${className}`}
      style={{
        maxWidth: "280px",
        pointerEvents: "none", // Allows mouse events to pass through
      }}
    >
      {content}
    </div>
  );
};

interface ImageItem {
  id: number;
  media_link: string;
  uploaded_at: string;
  predicted_class?: string;
  probabilities?: Record<string, number>;
}

const sessionToken = sessionStorage.getItem("token");
const localToken = localStorage.getItem("token");

const token: string = sessionToken
  ? sessionToken
  : localToken
  ? localToken
  : "";

export default function HistoryPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  // Enhanced tooltip state
  const [tooltip, setTooltip] = useState<{
    content: string;
    visible: boolean;
    position: { x: number; y: number };
  }>({
    content: "",
    visible: false,
    position: { x: 0, y: 0 },
  });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await getUserHistory(token);
        console.log(response);
        setImages(response);
        setLoading(false);
      } catch (err) {
        setError("Failed to load images. Please try again.");
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const handleViewDetails = (image: ImageItem) => {
    setSelectedImage(image);
  };

  const handleCloseDetails = () => {
    setSelectedImage(null);
  };

  const handleDeleteImage = async (id: number) => {
    try {
      const result = await deleteHistory(id, token);
      setImages(images.filter((img) => img.id !== id));
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
      // Add a success toast notification
      toast.success("Image deleted successfully!");
    } catch (error) {
      console.error("Failed to delete image:", error);
      // Add an error toast notification
      toast.error("Failed to delete image");
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "bg-gray-200";
    if (confidence >= 0.9) return "bg-green-500";
    if (confidence >= 0.7) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Enhanced tooltip handling
  const handleTooltipShow = (key: string, event: React.MouseEvent) => {
    // Calculate position relative to the viewport
    const x = event.clientX;
    const y = event.clientY - 10; // Position above the cursor

    setTooltip({
      content: lesionDefinitions[key] || key,
      visible: true,
      position: { x, y },
    });
  };

  const handleTooltipHide = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">History</h1>
        <p className="text-gray-600 mt-2">
          This section shows uploaded images and results history.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      ) : images.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No images found in your history.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48 bg-gray-100">
                <img
                  src={image.media_link || "/placeholder.svg"}
                  alt="Skin lesion"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium">
                      {image.predicted_class || "No diagnosis"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(image.uploaded_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {image.probabilities && image.predicted_class && (
                    <div className="flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-1 ${getConfidenceColor(
                          image.probabilities[image.predicted_class]
                        )}`}
                      ></div>
                      <span className="text-sm">
                        {Math.round(
                          image.probabilities[image.predicted_class] * 100
                        )}
                        %
                      </span>
                    </div>
                  )}
                </div>

                {/* Add probabilities section */}
                {image.probabilities && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">
                      Probabilities:
                    </h4>
                    <div className="space-y-1">
                      {Object.entries(image.probabilities)
                        .sort(([, a], [, b]) => b - a)
                        .map(([key, value]) => (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <span className="text-xs">{key}</span>
                              <div className="inline-block ml-1">
                                <HelpCircle
                                  className="w-3 h-3 text-gray-400 cursor-help"
                                  onMouseEnter={(e) =>
                                    handleTooltipShow(key, e)
                                  }
                                  onMouseLeave={handleTooltipHide}
                                />
                              </div>
                            </div>
                            <div className="flex items-center">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full mr-2">
                                <div
                                  className={`h-full rounded-full ${
                                    key === image.predicted_class
                                      ? "bg-teal-500"
                                      : "bg-gray-400"
                                  }`}
                                  style={{ width: `${value * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">
                                {(value * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleViewDetails(image)}
                    className="flex-1 flex justify-center items-center gap-1 py-2 bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="flex justify-center items-center gap-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Details Modal - Enhanced with probabilities display */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Image Details</h2>
                <button
                  onClick={handleCloseDetails}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6 relative h-64 bg-gray-100 rounded-md overflow-hidden">
                <img
                  src={selectedImage.media_link || "/placeholder.svg"}
                  alt="Skin lesion"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Diagnosis
                  </h3>
                  <div className="flex items-center">
                    <p className="text-lg">
                      {selectedImage.predicted_class ||
                        "No diagnosis available"}
                    </p>
                    {selectedImage.predicted_class && (
                      <div className="ml-2">
                        <HelpCircle
                          className="w-4 h-4 text-gray-400 cursor-help"
                          onMouseEnter={(e) =>
                            handleTooltipShow(
                              selectedImage.predicted_class || "",
                              e
                            )
                          }
                          onMouseLeave={handleTooltipHide}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Probabilities section in modal */}
                {selectedImage.probabilities && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      Classification Probabilities
                    </h3>
                    <div className="space-y-3 mt-2">
                      {Object.entries(selectedImage.probabilities)
                        .sort(([, a], [, b]) => b - a)
                        .map(([key, value]) => (
                          <div key={key}>
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center">
                                <span>{key}</span>
                                <div className="ml-1">
                                  <HelpCircle
                                    className="w-4 h-4 text-gray-400 cursor-help"
                                    onMouseEnter={(e) =>
                                      handleTooltipShow(key, e)
                                    }
                                    onMouseLeave={handleTooltipHide}
                                  />
                                </div>
                              </div>
                              <span className="font-medium">
                                {(value * 100).toFixed(2)}%
                              </span>
                            </div>
                            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  key === selectedImage.predicted_class
                                    ? getConfidenceColor(value)
                                    : "bg-gray-400"
                                }`}
                                style={{ width: `${value * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Uploaded
                  </h3>
                  <p>{new Date(selectedImage.uploaded_at).toLocaleString()}</p>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    onClick={handleCloseDetails}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDeleteImage(selectedImage.id)}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global tooltip that follows cursor */}
      <Tooltip
        content={tooltip.content}
        isVisible={tooltip.visible}
        className="text-sm"
      />

      {/* Fixed position version if pointer-following doesn't work well */}
      <style>
        {`
          .tooltip-container {
            position: fixed;
            top: ${tooltip.position.y}px;
            left: ${tooltip.position.x}px;
            transform: translate(-50%, -100%);
          }
        `}
      </style>
    </div>
  );
}
