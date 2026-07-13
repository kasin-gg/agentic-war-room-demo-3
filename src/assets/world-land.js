// Simplified offline world landmass GeoJSON features for dark static basemap
// Zero network requests required.
export const worldLandmassGeoJSON = {
  type: 'FeatureCollection',
  features: [
    // North America
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-168.0, 65.0], [-141.0, 70.0], [-100.0, 75.0], [-60.0, 60.0], [-55.0, 45.0], [-80.0, 25.0], [-105.0, 19.0], [-125.0, 32.0], [-160.0, 55.0], [-168.0, 65.0]]
        ]
      }
    },
    // South America
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-80.0, 10.0], [-60.0, 12.0], [-35.0, -5.0], [-40.0, -22.0], [-65.0, -55.0], [-75.0, -45.0], [-80.0, -2.0], [-80.0, 10.0]]
        ]
      }
    },
    // Europe
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-10.0, 36.0], [0.0, 43.0], [15.0, 38.0], [30.0, 42.0], [30.0, 70.0], [10.0, 70.0], [-10.0, 60.0], [-10.0, 36.0]]
        ]
      }
    },
    // Africa
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-17.0, 15.0], [12.0, 37.0], [33.0, 30.0], [51.0, 11.0], [40.0, -11.0], [30.0, -34.0], [18.0, -34.0], [9.0, 5.0], [-17.0, 15.0]]
        ]
      }
    },
    // Eurasia / Asia
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[30.0, 42.0], [60.0, 40.0], [75.0, 10.0], [90.0, 8.0], [105.0, 10.0], [120.0, 15.0], [140.0, 35.0], [145.0, 60.0], [170.0, 65.0], [180.0, 70.0], [60.0, 75.0], [30.0, 70.0], [30.0, 42.0]]
        ]
      }
    },
    // Southeast Asia & Islands
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[95.0, 20.0], [108.0, 22.0], [109.0, 10.0], [104.0, 1.0], [98.0, 3.0], [95.0, 20.0]]
        ]
      }
    },
    // Australia
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[113.0, -22.0], [130.0, -12.0], [143.0, -11.0], [153.0, -28.0], [140.0, -38.0], [115.0, -35.0], [113.0, -22.0]]
        ]
      }
    },
    // Japan
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[130.0, 31.0], [140.0, 36.0], [142.0, 43.0], [139.0, 42.0], [130.0, 31.0]]
        ]
      }
    },
    // UK & Ireland
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [[-10.0, 50.0], [2.0, 50.0], [0.0, 59.0], [-7.0, 58.0], [-10.0, 50.0]]
        ]
      }
    }
  ]
};
