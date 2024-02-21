import axios from 'axios';
import WKT from 'ol/format/WKT';
import Point from 'ol/geom/Point';

// PostgreSQL tablosuna koordinatları kaydetmek için bir işlev
export const saveCoordinatesToPostgres = async (coordinates) => {
  try {
    // Koordinatları WKT formatına dönüştür
    const wktFormat = new WKT();
    const wktGeometry = wktFormat.writeGeometry(new Point(coordinates));

    // Axios ile POST isteği yaparak koordinatları PostgreSQL'e kaydet
    const response = await axios.post('https://localhost:7196/api/SpatialData', { wkt: wktGeometry });

    // İşlem başarılı olduysa geri dönen veriyi konsola yazdır
    console.log(response.data);
    
    return response.data; // İsteğin döndürdüğü veriyi geri döndür
  } catch (error) {
    console.error('Error saving coordinates to PostgreSQL:', error);
    throw error;
  }
};
