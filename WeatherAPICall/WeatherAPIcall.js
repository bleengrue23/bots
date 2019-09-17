'use strict';

const axios = require("axios");

module.exports.getWeather = async (event) => {
  const city = event.currentIntent.slots["city"];
  const url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=e9ae370e1961e718702dd3295e97da23";

  try {
    const response = await axios.get(url);
    const data = response.data;

    const answer = "The temperature is " + data.main.temp + "degrees and Humidity is " + data.main.humidity + "% with " + data.weather[0].description + " expected. Would you like to make a flight reservation to this city?";
    
    return {
      "sessionAttributes": {},
      "dialogAction": {
        "type": "Close",
        "fulfillmentState": "Fulfilled",
        "message": {
          "contentType": "PlainText",
          "content": answer
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};
