import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from './components/ui/card';
import { Line } from 'react-chartjs-2';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import 'chart.js/auto';
import './App.css';

// Solución para iconos de marcador en react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

function App() {
  const [apiData, setApiData] = useState({
    temperature: { times: [], values: [] },
    location: { lat: 40.4168, lng: -3.7038 }, // Default location (Madrid center)
    eta: "30 minutos",
    nfcStatus: "Conectado",
    batteryLevel: 98,
    arduino: "Arduino MKR1000" // Placeholder, update if needed
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        const response = await axios.get('https://cors-anywhere.herokuapp.com/http://34.175.9.11:8000/traces', {
          headers: {
            'Origin': 'http://localhost:3000', // Add the Origin header
          },
        });

        const data = response.data;

        console.log("Data fetched from API:", data);

        // Map the data to the expected structure
        const times = data.map(item => item.timestamp); // Extract timestamps
        const values = data.map(item => item.temperature); // Extract temperatures
        const locations = data.map(item => ({
          latitude: item.latitude,
          longitude: item.longitude,
          temperature: item.temperature,
          nfc: item.nfc
        })); // Extract locations
        const lastLocation = data[data.length - 1]; // Use the last data point for location

        setApiData({
          temperature: {
            times: times || [],
            values: values || []
          },
          location: {
            lat: lastLocation.latitude || 40.4168,
            lng: lastLocation.longitude || -3.7038
          },
          locations: locations || [],
          eta: "30 minutos", // Placeholder, update if needed
          nfcStatus: lastLocation.nfc || "Desconectado",
          batteryLevel: 98, // Placeholder, update if needed
          arduino: "Arduino MKR1000" // Placeholder, update if needed
        });
      } catch (error) {
        console.error("Error fetching data from API:", error);
      } finally {
        setLoading(false);
      }
    };

    // Run fetchData immediately and then every 30 seconds
    fetchData();
    const interval = setInterval(fetchData, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="glass-loading">
        <div className="loading-spinner"></div>
        <p>Cargando datos del dispositivo...</p>
      </div>
    );
  }

  // Datos para el gráfico de temperatura
  const temperatureChartData = {
    labels: apiData.temperature.times.length > 0 
      ? apiData.temperature.times 
      : ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00'],
    datasets: [
      {
        label: 'Temperatura (°C)',
        data: apiData.temperature.values.length > 0 
          ? apiData.temperature.values 
          : [2.5, 3.0, 3.2, 2.8, 2.7, 3.1],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(173, 216, 230, 0.2)',
        fill: true,
        tension: 0.4,
        borderWidth: 2
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white',
          font: {
            size: 14
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.7)' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        ticks: { 
          color: 'rgba(255,255,255,0.7)', 
          stepSize: 1 // Show more numbers on the scale
        },
        grid: { color: 'rgba(255,255,255,0.1)' },
        suggestedMin: 0,
        suggestedMax: 30 // Adjust the maximum value to fit your data
      }
    }
  };

  return (
    <div className="glassmorphism-app">
      <header className="glass-header">
        <h1 className="app-title">Monitorización de Nevera para Transporte de Órganos</h1>
        <p className="app-subtitle">Seguimiento en tiempo real con tecnología IoT</p>
      </header>

      <div className="dashboard-grid">
        {/* Mapa */}
        <div className="full-width-card">
          <Card className="glass-card">
            <CardHeader className="glass-card-header">
              <h2>Localización en Tiempo Real</h2>
              <span className="update-time">Actualizado: {new Date().toLocaleTimeString()}</span>
            </CardHeader>
            <CardContent className="map-content-container">
              <MapContainer 
                center={[apiData.location.lat, apiData.location.lng]} 
                zoom={13} 
                className="responsive-map"
              >
                <TileLayer 
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {/* Add markers for all locations */}
                {apiData.locations.map((location, index) => (
                  <Marker 
                    key={index} 
                    position={[location.latitude, location.longitude]}
                  >
                    <Popup className="glass-popup">
                      <div className="font-bold">Ubicación</div>
                      <div>Lat: {location.latitude.toFixed(4)}</div>
                      <div>Lng: {location.longitude.toFixed(4)}</div>
                      <div>Temperatura: {location.temperature}°C</div>
                      <div>NFC: {location.nfc}</div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Temperatura */}
        <div className="full-width-card"> {/* Change from "half-width-card" to "full-width-card" */}
          <Card className="glass-card large-card"> {/* Add a new class "large-card" */}
            <CardHeader className="glass-card-header">
              <h2>  Temperatura por Hora</h2>
            </CardHeader>
            <CardContent className="chart-content-container">
              <div className="chart-wrapper" style={{ height: '500px', width: '100%' }}> {/* Increase height */}
                <Line 
                  data={temperatureChartData} 
                  options={chartOptions} 
                />
              </div>
              <div className="temperature-status">
                <span>Temperatura actual: </span>
                <span className="temperature-value">
                  {apiData.temperature.values.length > 0 
                    ? apiData.temperature.values[apiData.temperature.values.length - 1] 
                    : '3.1'}°C
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ETA y Estado del Sistema */}
        <div className="half-width-card">
          <Card className="glass-card status-card">
            <CardHeader className="glass-card-header">
              <h2>Estado del Sistema</h2>
            </CardHeader>
            <CardContent>
              <div className="status-grid">
                <div className="status-item">
                  <span>Batería</span>
                  <div className="battery-level">
                    <div 
                      className="battery-fill" 
                      style={{ width: `${apiData.batteryLevel}%` }}
                    ></div>
                    <span>{apiData.batteryLevel}%</span>
                  </div>
                </div>
                <div className="status-item">
                  <span>Conectividad NFC</span>
                  <span className={`nfc-status ${apiData.nfcStatus === "Conectado" ? 'connected' : 'disconnected'}`}>
                    {apiData.nfcStatus}
                  </span>
                </div>
                <div className="status-item">
                  <span>Alarmas</span>
                  <span className="alarm-status">Ninguna</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Arduino Information */}
        <div className="half-width-card">
          <Card className="glass-card arduino-card">
            <CardHeader className="glass-card-header">
              <h2>Información del Arduino</h2>
            </CardHeader>
            <CardContent>
              <div className="arduino-info">
                <div className="info-item">
                  <span>Modelo:</span>
                  <span>{apiData.arduino || "Desconocido"}</span>
                </div>
                <div className="info-item">
                  <span>NFC:</span>
                  <span>{apiData.nfcStatus || "No disponible"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last Update Time */}
        <div className="half-width-card">
          <Card className="glass-card update-card">
            <CardHeader className="glass-card-header">
              <h2>Última Actualización</h2>
            </CardHeader>
            <CardContent>
              <div className="update-info">
                <span>Hora:</span>
                <span>{new Date(apiData.temperature.times[apiData.temperature.times.length - 1] || Date.now()).toLocaleTimeString()}</span>
              </div>
              <div className="update-info">
                <span>Fecha:</span>
                <span>{new Date(apiData.temperature.times[apiData.temperature.times.length - 1] || Date.now()).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;