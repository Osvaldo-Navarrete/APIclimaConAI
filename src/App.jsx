import React, { useState } from 'react';
//Importación del sdk de Google
import { GoogleGenerativeAI } from '@google/generative-ai';

function App() {
  //Estados para hacer busqueda (ciudad), para el clima y para el consejo generado.
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [advice, setAdvice] = useState('');

  //Keys
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_KEY;
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const OPEN_WEATHER_MAP_API_KEY = import.meta.env.VITE_OPEN_WEATHER_KEY;

  //Función para traer el clima con OpenWeather
  const fetchWeather = async () => {
    if (!city) {
      alert('Por favor, ingresa una ciudad. No se permiten números ni caracteres especiales');
      return;
    }


    setWeatherData(null);
    setAdvice(''); //Usamos el useState para quitar el consejo/recomendación anterior en caso de que haya

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPEN_WEATHER_MAP_API_KEY}&units=metric&lang=es`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Ciudad no encontrada. Por favor, verifica el nombre.');
        } else {
          throw new Error('Error al obtener datos del clima.');
        }
      }

      const data = await response.json();
      setWeatherData(data);

      const descriptionClima = data.weather[0].description;
      const newAdvice = await getAdvice(descriptionClima);
      setAdvice(newAdvice);

    } catch (err) {
      setWeatherData(null);
      alert(err.message);
    }
  };

  //Función para generar el consejo/recomendación de acuerdo con el tipo de clima generado en la función fetchWeather
  const getAdvice = async (descriptionClima) => {
    try {
      //Aquí se inicia el modelo
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

      //Se crea el prompt
      const prompt = `Dame un consejo breve para una persona que está en un clima con esta descripción: "${descriptionClima}". El consejo debe ser útil y específico. No más de 10 palabras`;

      //Realizamos la creación del consejo
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const adviceText = response.text();

      return adviceText; //Generamos el consejo

    } catch (error) {
      console.error('Error al generar consejo con Gemini:', error);
      return 'No se pudo generar el consejo.';
    }
  };

  return (
    <>
      <main className="w-full min-h-[100vh] flex flex-col justify-center items-center bg-gradient-to-br from-sky-700 to-orange-50 gap-10 p-5">
        <h1 className="text-2xl sm:text-3xl">Consulta del clima por ciudad</h1>

        <section className="bg-[#4d5dc7] rounded-md w-full lg:w-[30%] flex flex-col justify-center gap-10 py-10 text-xl p-10 text-gray-100 border-1 border-gray-400">
          <label htmlFor="consulta">Busque una ciudad:</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            type="text"
            name="consulta"
            id="consulta"
            required
            placeholder="Ingresar ciudad"
            className="bg-amber-50 rounded-md p-1 text-black"
          />
          <button onClick={fetchWeather} className="bg-orange-200 text-black rounded-md py-2 cursor-pointer active:bg-orange-300 ">
            Buscar
          </button>

          {weatherData && (
            <div>
              <hr className="text-white py-5" />
              <h2 className="text-2xl font-semibold">
                {weatherData.name}, {weatherData.sys.country}
              </h2>
              <ul className='py-5'>
                <li>🌡️Temperatura: {weatherData.main.temp} °C</li>
                <li>⬆️Temperatura máxima: {weatherData.main.temp_max} °C</li>
                <li>⬇️Temperatura mínima: {weatherData.main.temp_min} °C</li>
                <li>☁️Clima: {weatherData.weather[0].description}</li>
              </ul>
            </div>
          )}

          {advice && (
            <p className="mt-4 bg-blue-100 text-black rounded-md p-3">
              🤓 Consejo inteligente: {advice}
            </p>
          )}
        </section>
      </main>
    </>
  );
}

export default App;