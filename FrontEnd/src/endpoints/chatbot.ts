import axiosInstance from "../services/axiosInstance";

export const chatWithAI = async (
  payload: { message: string },
  token: string
): Promise<{
  user_message: { text: string; timestamp: number; sender_type: string };
  ai_response: { text: string; timestamp: number; sender_type: string };
}> => {
  try {
    const response = await axiosInstance.post(`api/chat/`, payload, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
