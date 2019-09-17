# Tutorial: Create a Chatbot with AWS Lex, DynamoDB, and Lambda services
This tutorial takes you through the building of a serverless AWS Lex Chatbot that will enable a user to check the current weather  for a given city, and then enter their personal data for a flight reservation to that city.

The user interface is developed through the AWS Lex service.  An AWS DynamoDB is deployed to hold the user's destination city, travel date, and personal data for the reservation request.  AWS Lambda functions (written in Node.js) are employed to retrieve a city's weather forecast from the OpenWeather API, and then route the user's personal data into the Dynamo database for flight reservation to that city.

# What you will learn

  * How to create a NoSQL DynamoDB and use it as a repository for end-user data
  * How to build a Lex Chatbot UI employing custom intents and slots 
  * How to create serverless Lambda functions to pass data into and out of a Lex Chatbot
  * How to upload Lambda Node.js dependency libraries into a Lambda function
  * How to test the functionality of your chatbot within the AWS console  


# Requirements
To follow along with this tutorial you will need an AWS account, freely available here: www.aws.amazon.com, and access to the OpenWeather API, which is available by way of a free subscription here: www.openweathermap.org

While I used the Serverless (www.serverless.com) Framework to build and deploy the versions of the Node.js Lambda functions discussed below, this framework is not covered in this tutorial as is not needed to follow the steps in this tutorial.  You can simply download local copies of the relevant javascript files from this project and use them to follow along with steps of this tutorial, or you can rebuild scripts with editor of your choice. Note,  however, you will need the dependency node files in the nodes module of the WeatherAPICall folder above to deploy and run your script in Lambda.

# Step 1: Create a DynamoDB table 

The first step we will perform is the creation of an AWS DynamoDB database to store our user's flight reservation data.  As a NoSQL database, DynamoDB is particularly well suited for this type of task as we need only define a 'primary key' index parameter to hold our users data.  The rest of the parameters we want to store can be added later dynamically simply by adding objects that possess additional attributes.  

The primary key attribute for a DynamoDB is required for each item it holds.  To create our DynamoDB we need only decide on an attribute each of our items (in our case--users) will have.  In this example I have used 'last-name' for the primary key.

To create our database, log into your AWS console, and select DynamoDB from the services menu.

<details><summary>Engage an AWS Service</summary>
<p>
<img src="Images/DynamoServices.png" width="700" />
</p>
</details>

From there, select the "Tables" submenu option on the right.  Then click on the "Create Table" button on the main screen.

<details><summary>Create Table</summary>
<p>
<img src="Images/CreateDatabase.PNG" width="700" />
</p>
</details>

On the table creation screen, enter names for your table and primary key.  Use "string" for your primary key data type. And use the default settings for your table's creation. 

<details><summary>Set DynamoDB Table Options</summary>
<p>
<img src="Images/TableCreationSettings.PNG" width="700" />
</p>
</details>

Once you have created your table, we have completed everything necessary for the task of building a queryable database repository of user data.  We will need to keep track of our table name and primary key, as they will be used later in building our chat bot and Lambda functions.

# Step 2: Create a Chatbot

Our next step is to create the user interface that will interact with our users and collect the data for their reservation.  To do this will we will use the AWS Lex chatbot service.  This will allow us to quickly create a user interface that we can use for both voice and text interactions with our users.  

In designing this Lex chatbot, I have attempted to demonstrate the ease with which the Lex chatbot interface allows us to both pull information into a Lex chatbot (through an external API call), as well as push data out to DynamoDB. 

To get started, select Lex from the services menu, then on the initial screen select the option to 'Create' under the main screen.  

On the "Create your bot" page, select the "custom bot" option at the top.  To complete your initial bot creation you will need to:

  1. Name your bot
  2. Choose an Output voice for your bot
  3. Choose a session timeout duration (how long the bot waits for input before restarting a session)
  4. Indicate whether the bot is to be subject to the COPPA Act

<details><summary>Set Bot Creation Options</summary>
<p>
<img src="Images/CreateYourBot.png" width="700" />
</p>
</details>

With these options set you can go ahead and create your bot.

# Step 3: Create a bot Intent

After you have created your bot, you should see the 'Editor' tab of the main page for your bot, as shown here.

<img src="Images/BotEditor.PNG" width="700" />

As indicated by this screen, the primary thing we now need to do to set up our bot is to create its *intents*.  As you can also tell from this screen, *intents* are the things that user can do with our bot.  Becaue I want to demonstrate the ease with which we can both pull information into, as well as push information out of, our bot it will be userful to define two different things that our users will be able to with our bot.  Namely:


  * Intent 1: Check the weather for a given city
  * Intent 2: Enter their information for flight reservation to a city

We can start off creating these intents by clicking on the "Create Intent" button on the editor tab, and then selecting "create intent" again on the following pop-up menu, and then giving our first intent a name.  Once we have named our intent, we are automatically taken to the editor for the intent.

<img src="Images/IntentsEditor.png" width="700" />

For this tutorial, we will not be using an initialization Lambda function. We will assume the user engages our application as an authorized user knowing its purpose, namely allowing them to check weather and make flight reservations.  However we do need to specify some initial *utterances.

A Lex utterance is the verbal or typed input that lets our bot know which of our intents (the things our bot can do) the user wants to engage with.  To activate the intent for checking the weather, we need to specify what kinds of input a typical user would use to let someone know they want a weather forecast, such as "Check weather"  

Additionally, we should keep in mind when creating our bot that a given user will typically want to start off their interaction with our application by checking the weather for a given city first, before they book a flight there.  Because of this, in addition specifying utterances like "Check the weather", and "Get forecast", we also may wish to include some simple introductory phrases, such as "Hello". Each of these utterances should be entered as a seperate line, and then added to the list of intent activators by clicking on the "+" mark.

<details><summary>Add Utterance to an Intent</summary>
<p>
<img src="Images/AddUtterance.png" width="700" />
</p>
</details>
 
Now that we have specified the utterances that let's our bot know which of our two intents that our user wants to use (namely to get a weather forecast for a particular city, we need to define precisely what information the user needs to give us to fulfill this intent. **Slots** define the information that is needed from the user to fulfill the intent.  For our current intent, the necessary information we need to gather from the user is the *city* they are interested in.  Once we have that information, we can return to the user the weather forecast for the city they are interested in traveling to.  You create slots by naming them, defining their data type, and associating them with a specific information request in Intents editor's slot section, shown here:

<img src="Images/Slots.PNG" width="700" />

The slot name can be of your choosing, for this I simply use "city".  For the type, there is a pre-populated pull-down menu of options defined by Amazon. This aids with potential formatting issues that might arise when passing the value into other applications and data sources. For this example, you should simply choose the "US_CITY" type.  The question prompt is also a matter of choice, as it need only be something that is reasonably certain to get an appropriate response from the user.  In our case something along the line of "What city are you interested in?" should suffice to get an appropriate respones. 

After filling in these three fields, click on the "+" symbol to add the slot to the intent.
 
<details><summary>Add Slot to an Intent</summary>
<p>
<img src="Images/AddSlot.png" width="700" />
</p>
</details>

# Step 4: Build and test your chat bot

After you have added your slot to the intent and saved the intent, you are ready to create the initial test build of your chat bot and test its functionality.  The test build is created by selecting the build button at the top editor.  Once the build is completed, you should test your bot by typing some text into the test dialog box to see how it will respond to sample user input.

<details><summary>Create a Test bot build</summary>
<p>
<img src="Images/TestBuild.png" width="700" />
</p>
</details>

You should test your bot using utterances close to your defined utterances, but with small variations.  The built-in AI capabilities of the Lex bot builder should be able to detect utterances similar enough to the specified ones to that small variations shouldn't matter. 

The response that you want to elicity with input similar to your initially specified utterances is the question defined in your slot.  The slot question response should assure your bot will get the information needed to fulfill the intent.  Given that we have not yet specified how the bot should fulfill this intent, at this stage a successful test should return a notification that the intent is **ready for fulfillment**.  A successful test should look something like the following.

<img src="Images/TestCheck.PNG" width="700" />

If your initial text submission does not elicit your slot question, you should add it to your list of utterances.

Before moving to the fulfillment of our intent through a Lambda function, test your bot with the following input: *Want a vacation to Las Vegas*

Here our initial utterance already provides the information needed to fulfill the intent, but our bot doesn't realize it.  This is because the bot has not yet learned to look for slot value in an initial triggering utterance.  It is only primed to look for the slot value in response to the slot question. 

To handle this situation we need to create sample utterances that reference our slot, which tells our bot that the intent may already already have the information it requires in the initial utterance, without the prompt defined in our slot definition. To let Lex know how our slot value may occur in an utterance, we can simply create a sample utterance with the slot name ("city" in our example) in "{}" in the utterance--for example: "Need a vacation to {city}".

<details><summary>Referance a slot in an utterance</summary>
<p>
<img src="Images/SlotUtter.PNG" width="700" />
</p>
</details>

Once you have added some utterances that reference your slot to your intent, you should save your intent again, rebuild your bot, and then test it again with "Want a vacation to Las Vegas".  This time you should see the response "Ready for fulfillment" returned.  This tells you that the slot value will be immediately passed to our Lambda function without the need for a response to question put in out slot question.

# Step 5: Fulfill your Intent with a Lambda function

Below the slot definition of the intent, you will find the "Fulfillment" section for our intent, and the radio button option for the option of calling a Lambda function to fulfill the intent.  

<img src="Images/Fulfill.png" width="700" />

By selecting the Lambda function option, we ensure that the a Lambda function will be called by the "Ready for Fulfillment" condition returned when our intent has the information it needs.  However, we can't select this option yet.  We first need to create the function. To do this, we will be using Node.js, though it is worth noting that a variety of other languages can be used.  I am using Node.js simply because the function is a little cleaner in its implementation regarding what is actually going on.  But before we move to our functions construction, it is furth worth noting what is being passed onto in terms of the JSON name/value pairs:

```python

{
  "messageVersion": "1.0",
  "invocationSource": "DialogCodeHook",
  "userId": "myUserId",
  "sessionAttributes": {},
  "bot": {
    "name": "myBotName",
    "alias": "$LATEST",
    "version": "$LATEST"
  },
  "outputDialogMode": "Text",
  "currentIntent": {
    "name": "myIntentName",
    "slots": {
      "mySlotName": "mySlotValue"
    },
    "confirmationStatus": "None"
  }
}
```
Aside from being able to use this to construct test events for our Lambda function, examining the format of what is being passed into our function tells us how we can pull the value of interest to us (the slot value) out of it. Namely, by way of reference to:

 **currentIntent.slots.mySlotName**  
 
Recall, also, that for us, the slot value of interest is a city name.  Once we have the city name, we can actually just pass that into an API call that will return will return the weather conditions and forecast for our city of interest.  We then construct a repository for the data in the API response.  Finally we construct a statement to return to our Lex bot that is built out of the data in our API response repository.  

We can achieve all of this in Node.js with the following:
 
```javascript

  const city = event.currentIntent.slots["city"];
  const url = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=e9ae370e1961e718702dd3295e97da23";

  try {
    const response = await axios.get(url);
    const data = response.data;

    const answer = "The temperature is " + data.main.temp + "degrees and Humidity is " + data.main.humidity + "% with " + data.weather[0].description + " expected. Would you like to make a flight reservation to this city?";
    
```
We are not done with our function yet, we still need to package our "answer" in a form that will be accessible to Lex.  But before constructing our Lex response, there are a immediately a couple of things worth noting about our function so far. 

First, to implement this tutorial on your **you will need to replace the APPID above with your own** (freely available OpenWeather as noted at the beginning of this tutorial).

Second, the above code relies on the *axios* node addition to the standard javascript library.  This entails some additional work will be needed on our part when implementing this code in AWS Lambda, which we will detail below.

Now to complete our function we need to construct the response we will return to Lex.  This can be accomplished with the following code:

```javascript

return {
      "sessionAttributes": {},
      "dialogAction": {
        "type": "Close",
        "fulfillmentState": "Fulfilled",
        "message": {
          "contentType": "PlainText",
          "content": answer
        }
```
The "type" and "fulfillmentState" parameters here are simply telling Lex that with this data our intent has become fulfilled and can move to a closed state.  The bulk of the work being done here is by way of simply passing the 'answer' constructed in the first part of our function into Lex by way of the 'content' parameter.

The only remaining bits our function now requires
