import axiosInstance from "./axiosInstance";

interface ClassificationResponse {
  predicted_class: string;
  probabilities: {
    AKIEC: number;
    BCC: number;
    BKL: number;
    DF: number;
    MEL: number;
    NV: number;
    VASC: number;
  };
}

export async function classifyImage(
  base64Image: string,
): Promise<ClassificationResponse> {
  const token = sessionStorage.getItem("token") || localStorage.getItem("token");
  try {
    const response = await axiosInstance.post<ClassificationResponse>(
      "/api/classify-image/",
      { image: base64Image },
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("Error classifying image:", error.response?.data || error.message);
    throw error;
  }
}
