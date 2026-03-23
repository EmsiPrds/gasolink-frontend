import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';
import { reportFuelPrice } from '../../services/reportApi';

interface ReportPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  stationId?: string; // Pre-filled if opened from a specific station
  stationName?: string;
}

export const ReportPriceModal: React.FC<ReportPriceModalProps> = ({ isOpen, onClose, stationId, stationName }) => {
  const [fuelType, setFuelType] = useState('Diesel');
  const [price, setPrice] = useState('');
  const [selectedStation, setSelectedStation] = useState(stationId || '');
  const [locationName, setLocationName] = useState('Atimonan'); // Default for the agent context
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation || !price || isNaN(Number(price))) {
      setError('Please fill in all fields correctly.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      await reportFuelPrice({
        stationId: selectedStation,
        fuelType,
        price: Number(price),
        locationName
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          Report Fuel Price
        </h2>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">Price Reported Successfully!</p>
            <p className="text-sm text-gray-500 text-center mt-2">
              Thank you for contributing. Our AI will verify your report shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Station
              </label>
              <input
                type="text"
                placeholder="Station ID (Temporary UI)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                readOnly={!!stationId}
              />
              {stationName && <p className="text-xs text-gray-500 mt-1">Reporting for: {stationName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="City/Municipality (e.g., Atimonan)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fuel Type
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
              >
                <option value="Gasoline">Gasoline</option>
                <option value="Diesel">Diesel</option>
                <option value="Kerosene">Kerosene</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price (₱)
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-2xl font-bold"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Price'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
