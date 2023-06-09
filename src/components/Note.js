import { MdDeleteForever } from 'react-icons/md';
import { WiDaySunny, WiCloudy, WiRain, WiSnow, WiThunderstorm } from 'react-icons/wi';
import tt from '@tomtom-international/web-sdk-maps';
import React, { useEffect, useRef, useState, useMemo } from 'react';
import moment from 'moment';

const getWeatherData = async (place, apiKey) => {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${apiKey}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (response.ok) {
      const temperature = Math.round(data.main.temp - 273.15); // Umwandlung von Kelvin in Celsius
      const weatherDescription = data.weather[0].description;
      return { temperature, weatherDescription };
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Error fetching weather data:", error.message);
    throw error;
  }
};

const geocodeLocation = async (place, apiKey) => {
  const geocodingUrl = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(
    place
  )}.json?key=${apiKey}`;

  try {
    const response = await fetch(geocodingUrl);
    const data = await response.json();

    if (response.ok) {
      const { lat, lon } = data.results[0].position;
      return { latitude: lat, longitude: lon };
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error("Error geocoding location:", error.message);
    throw error;
  }
};

const getWeatherIcon = (weatherDescription) => {
  switch (weatherDescription) {
    case 'clear sky':
      return <WiDaySunny />;
    case 'few clouds':
    case 'scattered clouds':
    case 'broken clouds':
      return <WiCloudy />;
    case 'shower rain':
    case 'rain':
      return <WiRain />;
    case 'snow':
      return <WiSnow />;
    case 'thunderstorm':
      return <WiThunderstorm />;
    case 'mist':
    case 'smoke':
    case 'haze':
    case 'dust':
    case 'fog':
      return <WiCloudy />; //Cloudy anstatt Fog
    default:
      return null;
  }
};


const Note = ({ id, text, place, date, time, handleDeleteNote }) => {
  const [weather, setWeather] = useState(null);
  const [map, setMap] = useState(null);
  const mapContainerRef = useRef(null);
  const currentDate = useMemo(() => new Date(), []);
  const [isExpired, setIsExpired] = useState(moment().isAfter(moment(date, 'DD/MM/yyyy')));
  const [showExtendedWeather, setShowExtendedWeather] = useState(false);
  const [extendedWeather, setExtendedWeather] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWeatherData = async () => {
      try {
        const apiKey = "cdad07a820ea7f97ae355d448d72a1dc"; // Füge hier deinen OpenWeatherMap-API-Schlüssel ein
        const data = await getWeatherData(place, apiKey);
        if (isMounted) {
          setWeather(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const fetchLocation = async () => {
      try {
        const apiKey = "MS1lsDKQez5pgHglR1dOjZosE8ul6TuB"; // Füge hier deinen TomTom-API-Schlüssel ein
        // Fetch the location coordinates and store them
        const { latitude, longitude } = await geocodeLocation(place, apiKey);
        if (!map) {
          // Initialize the map using the coordinates
          const newMap = initializeMap(parseFloat(latitude), parseFloat(longitude));
          setMap(newMap);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchWeatherData();
    fetchLocation();

    return () => {
      isMounted = false;
    };
  }, [place]);

  useEffect(() => {
    setIsExpired(moment().isAfter(moment(date, 'DD/MM/yyyy')));
  }, [currentDate, date]);

  const initializeMap = (latitude, longitude) => {
    const map = tt.map({
      key: "MS1lsDKQez5pgHglR1dOjZosE8ul6TuB", // Füge hier TomTom-API-Schlüssel ein
      container: mapContainerRef.current,
      center: [longitude, latitude],
      zoom: 12,
    });

    return map;
  };

  const fetchExtendedWeather = async () => {
    const apiKey = "cdad07a820ea7f97ae355d448d72a1dc"; // Füge hier deinen OpenWeatherMap-API-Schlüssel ein
    const currentDatePlus14Days = moment().add(14, 'days');

    if (moment(date, 'DD/MM/yyyy').isAfter(currentDatePlus14Days)) {
      // Trail liegt mehr als 14 Tage in der Zukunft, kein erweitertes Wetter anzeigen
      setExtendedWeather(null);
      return;
    }

    try {
      const extendedWeatherDataBefore = await getWeatherData(place, apiKey);
      setExtendedWeather({ before: extendedWeatherDataBefore });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleExtendedWeather = () => {
    if (showExtendedWeather) {
      setShowExtendedWeather(false);
      setExtendedWeather(null);
    } else {
      setShowExtendedWeather(true);
      fetchExtendedWeather();
    }
  };

  return (
    <div id={id} className={`note ${isExpired ? 'expired' : ''}`}>
      <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{text}</span>
      <span>{date}, {time}</span>
      <span>{place}</span>
      <div className='map-container' ref={mapContainerRef}></div>
      <div className='note-footer'>
        {weather && (
          <div className='weather'>
            <div className='weather-icon' style={{ fontSize: '40px' }}>
              {getWeatherIcon(weather.weatherDescription)}
            </div>
          </div>
        )}
        {showExtendedWeather && extendedWeather && (
          <div className='extended-weather'>
            <div className='weather-icon'>
              <span>{extendedWeather.before.temperature}°C, {extendedWeather.before.weatherDescription}</span>
            </div>
          </div>
        )}
        <div>
          <button className='showMoreWeather' onClick={toggleExtendedWeather}>
            {showExtendedWeather ? 'Show less' : 'Show more'}
          </button>
        </div>
      </div>
      <div className='note-delete-container'>
        <MdDeleteForever
          onClick={() => handleDeleteNote(id)}
          className='note-delete-icon'
        />
      </div>
    </div>
  );
};

export default Note;