# Tutorial: Create a Chatbot with AWS Lex, DynamoDB, and Lambda services
This tutorial takes you through the process of building a serverless AWS Lex Chatbot that will enable the user to check the current weather conditions and forecast for a given city, and then give them the option of entering their personal data for a flight reservation to that city.

The user interface is developed through the AWS Lex service.  An AWS DynamoDB is employed to hold the user's destination city, travel date, and personal data for the reservation request.  AWS Lambda functions (written in Node.js) are employed to retrieve the weather date from the OpenWeather API, and route the user's personal data into the Dynamo database.

# What you will learn
How to build a Lex Chatbot UI employing custom intents and slots 
How to create a NoSQL DynamoDB to store and retrieve end-user data
How to create and assign 

# Requirements
To follow along with this tutorial all that is required is an AWS account, freely available here: www.aws.amazon.com and access to the OpenWeather API, which is available through a free subscription here: www.openweathermap.org

While the Serverless (www.serverless.com) Framework was employed to build and deploy the version of the Node.js Lambda function that handle's the API call to the OpenWeather API, you can simply download local copies of the relevant files from this project to follow along with steps of this tutorial.  
