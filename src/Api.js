import axios from 'axios';
import WKT from 'ol/format/WKT';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import LineString from 'ol/geom/LineString';

// PostgreSQL tablosuna koordinatları kaydetmek için bir işlev
export const saveCoordinatesToPostgres = async (coordinatesArray) => {
  try {
    // Axios ile koordinatları PostgreSQL'e tek tek kaydet
    const responses = await Promise.all(coordinatesArray.map(async (coordinates) => {
      let wktGeometry;
      // Koordinat türüne göre WKT geometrisini oluştur
      if (coordinates.length === 2) {
        // Nokta
        wktGeometry = new WKT().writeGeometry(new Point(coordinates));
      } else if (coordinates[0].length === 2) {
        // Çizgi
        wktGeometry = new WKT().writeGeometry(new LineString(coordinates));
      } else {
        // Poligon
        wktGeometry = new WKT().writeGeometry(new Polygon([coordinates]));
      }
      
      // Axios ile POST isteği yaparak koordinatları PostgreSQL'e kaydet
      return axios.post('https://localhost:7196/api/SpatialData', { wkt: wktGeometry });
    }));

    // İşlem başarılı olduysa geri dönen veriyi konsola yazdır
    responses.forEach(response => console.log(response.data));

    return responses.map(response => response.data); // İsteğin döndürdüğü veriyi geri döndür
  } catch (error) {
    console.error('Error saving coordinates to PostgreSQL:', error);
    throw error;
  }
};

// PostgreSQL'den koordinatları almak için bir işlev
export const getCoordinatesFromPostgres = async () => {
  try {
    // Axios ile GET isteği yaparak PostgreSQL'den koordinatları al
    const response = await axios.get('https://localhost:7196/api/SpatialData');

    // İşlem başarılı olduysa geri dönen veriyi konsola yazdır
    console.log(response.data);
    
    return response.data; // İsteğin döndürdüğü veriyi geri döndür
  } catch (error) {
    console.error('Error getting coordinates from PostgreSQL:', error);
    throw error;
  }
};
