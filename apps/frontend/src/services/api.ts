export interface ApiResponse {
  message: string;
  timestamp: string;
  status: string;
}

export const fetchHello = async (): Promise<ApiResponse> => {
  try {
    const response = await fetch("http://localhost:4000/api/hello");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
