import axiosInstance from "../services/axiosInstance";

export const getUserHistory = async (
  token: string
): Promise<
  {
    id: number;
    media_link: string;
    uploaded_at: string;
  }[]
> => {
  try {
    const response = await axiosInstance.get(`api/my-images/`, {
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

export const deleteHistory = async (
  id: number,
  token: string
): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`api/delete-image/${id}/`, {
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
