import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface ReportPricePayload {
  stationId: string;
  fuelType: string;
  price: number;
  userId?: string;
  locationName?: string;
}

export const reportFuelPrice = async (payload: ReportPricePayload) => {
  const response = await axios.post(`${API_URL}/prices/report`, payload);
  return response.data;
};
