// api.js

import axios from 'axios';



// PostgreSQL tablosuna koordinatları kaydetmek için bir işlev
export const saveCoordinatesToPostgres = async (coordinates) => {
  try {
    // Koordinatları geoJSON formatına dönüştür
    const geoJsonData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coordinates,
          },
          properties: {},
        },
      ],
    };

    // Axios ile POST isteği yaparak koordinatları PostgreSQL'e kaydet
    const response = await axios.post('https://localhost:7196/api/SpatialData', geoJsonData);

    // İşlem başarılı olduysa geri dönen veriyi konsola yazdır
    console.log(response.data);
    
    return response.data; // İsteğin döndürdüğü veriyi geri döndür
  } catch (error) {
    console.error('Error saving coordinates to PostgreSQL:', error);
    throw error;
  }
};
