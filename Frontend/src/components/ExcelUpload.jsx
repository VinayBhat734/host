import React, { useState } from 'react';
import axios from 'axios';

function ExcelUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://localhost:5500/excel/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploadSuccess();
    } catch (error) {
      console.error('Error uploading file', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="file">
            Upload Excel File
          </label>
          <input 
            type="file"
            id="file"
            onChange={handleFileChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <button 
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Upload
        </button>
      </form>
    </div>
  );
}

export default ExcelUpload;
