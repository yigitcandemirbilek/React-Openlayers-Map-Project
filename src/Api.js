import axios from 'axios';
import WKT from 'ol/format/WKT';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import LineString from 'ol/geom/LineString';

// PostgreSQL tablosuna koordinatları kaydetmek için bir işlev
export const saveCoordinatesToPostgres = async (pointCoordinates, lineCoordinates, polygonCoordinates) => {
  try {
    const wktFormat = new WKT();

    // Nokta koordinatlarını WKT formatına dönüştür
    const pointWKTGeometry = pointCoordinates.map(coord => new Point(coord)).map(point => wktFormat.writeGeometry(point));
    
    // Çizgi koordinatlarını WKT formatına dönüştür
    const lineWKTGeometry = lineCoordinates.map(coords => new LineString(coords)).map(line => wktFormat.writeGeometry(line));
    
    // Poligon koordinatlarını WKT formatına dönüştür
    const polygonWKTGeometry = polygonCoordinates.map(coords => new Polygon([coords])).map(polygon => wktFormat.writeGeometry(polygon));

    // Axios ile POST isteği yaparak koordinatları PostgreSQL'e kaydet
    const responses = await Promise.all([
      ...pointWKTGeometry.map(wkt => axios.post('https://localhost:7196/api/SpatialData', { wkt })),
      ...lineWKTGeometry.map(wkt => axios.post('https://localhost:7196/api/SpatialData', { wkt })),
      ...polygonWKTGeometry.map(wkt => axios.post('https://localhost:7196/api/SpatialData', { wkt }))
    ]);

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
    
    // Veriyi dönüştürerek her bir öğenin içinde latitude ve longitude alanları olan bir nesne dizisi oluştur
    const formattedData = response.data.map(item => {
      // WKT dizesini ayrıştırarak geometri tipini ve koordinatları al
      const [, wktType, wktCoordinates] = item.wkt.match(/(\w+)\s*\(\(([^)]+)/);
    
      // WKT tipine göre koordinatları uygun şekilde işle
      let coordinates;
      switch (wktType.toUpperCase()) {
        case 'POINT':
          coordinates = wktCoordinates.split(' ').map(Number);
          console.log(`ID: ${item.id}, Geometry Type: Point, Coordinates: ${coordinates}`);
          return {
            id: item.id,
            type: 'Point',
            coordinates: {
              latitude: coordinates[1],
              longitude: coordinates[0]
            }
          };
        case 'LINESTRING':
          coordinates = wktCoordinates.split(',').map(coord => coord.trim().split(' ').map(Number));
          console.log(`ID: ${item.id}, Geometry Type: LineString, Coordinates: ${coordinates}`);
          return {
            id: item.id,
            type: 'LineString',
            coordinates: coordinates.map(coord => ({
              latitude: coord[1],
              longitude: coord[0]
            }))
          };
        case 'POLYGON':
          // Polygon'un içindeki çizgileri ayrıştır ve koordinatları işle
          coordinates = wktCoordinates.split('),(').map(coords => coords.trim().split(',').map(coord => coord.trim().split(' ').map(Number)));
          console.log(`ID: ${item.id}, Geometry Type: Polygon, Coordinates: ${coordinates}`);
          return {
            id: item.id,
            type: 'Polygon',
            coordinates: coordinates.map(polyCoords => polyCoords.map(coord => ({
              latitude: coord[1],
              longitude: coord[0]
            })))
          };
        default:
          console.log(`ID: ${item.id}, Geometry Type: Unknown, Coordinates: Unknown`);
          return null; // Bilinmeyen geometri tipleri için null döndür
      }
    }).filter(Boolean); // Boş değerleri filtrele
    
    
    return formattedData; // İsteğin döndürdüğü veriyi geri döndür
  } catch (error) {
    console.error('Error getting coordinates from PostgreSQL:', error);
    throw error;
  }
};

