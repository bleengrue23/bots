# Create a Chatbot with AWS Lex, DynamoDB, and Lambda services
This tutorial takes you through the process of building a serverless AWS Lex Chatbot that will enable the user to check the current weather conditions for a given city, and then give them the option of entering their personal data for a flight reservation to that city.

The user interface is developed through the AWS Lex service.  An AWS DynamoDB is employed to hold the user's destination city and personal data.  AWS Lambda functions (written in Node.js 
