To Run:
	• Make sure you have Node.js installed on your machine
	• npm install
	• npm start
	• Navigate to localhost:1337 in your browser
	• It will take a few seconds for the page to load (addressed in this document)

First of all, thank you for giving me the opportunity to work on this project. It was a unique challenge that presented an excellent opportunity to explore some deeply interesting things.

I chose to focus mostly on the backend with a scaffolding of the front-end to give you an idea of the direction I would take the application were I to complete the build out.

There were many challenges that this task posed, perhaps the most systemic was that data had to be pulled, normalized, and combined from many different sources. The choices I made in the backend were meant to optimize the performance of the application given that I was working with only free APIs. In a true production environment there are steps that could be taken to vastly improve performance; I will discuss these optimization in this readme.

The basic flow of the web application is a user visits the site, which displays a map of the United States. There is a border around each state to demark its shape. If a state is not a soybean producing state, then it is grayed-out; if it is a soybean producer, then the state is filled with a shade of blue which represents the amount of rain that has fallen in the state during the past three hours – the darker the blue, the more rain. These states are clickable. Once the users clicks on a particular state, the map is zoomed to focus on that state and its counties appear. The same method of shading used to represent the rainfall in the states is applied to the counties.

To accomplish this, I had to pull data from four different APIs. The process for getting state data and county data was nearly identical. In fact, there are ways to DRY up my code, but I chose not to for the sake of readability and modularity.
These are the steps in the route to get the state and county data (for the sake of clarity I will just write “states” when referring to getting a set data points but the same logical can nearly identically be applied to counties).

	• Get all of the states that produced a lot of soybeans with the quickstats.nass.usda.gov API
	• Take the returned data and create an array of all the states that produce soybeans
	• Use the geo coding Google API to get the latitude and longitude for each state in the array. This data is stored in an array of objects
	• For each latitude and longitude in the array, make a request to openweathermap.org to get the total rainfall for those coordinates (openweathermap.org provides rainfall data for the past three hours)
	• Finally we get the GeoJSON data for each state (or for each county in a particular state) from eric.clst.org
	• The rainfall totals for each state is attached to the GeoJSON object via its properties object
	• This array of objects is then sent to the front end

The front-end uses the data in this fashion. Please keep in mind that the front-end is not fully featured. Its intention is to demonstrate how a production app might behave.

	• The GeoJSON data is populated on a leaflet map. I used leaflet because of its flexibility and mostly straightforward implementation
	• Depending on the rainfall property on each GeoJSON object, the state will be conditionally filled with a shade of blue
	• Only the soybean producing states are clickable. When a user clicks on one of these states, the application makes a request to get the county data for that state
	• The application then zooms to show the state in greater detail and the counties’ boundaries are displayed
	• The counties are filled with blue in the same fashion as the states

I think there are many ways in which this application could be improved.The biggest deficiency in the application is that it is very slow. There is a tremendous amount of data that needs to be processed; the bulk of which is the GeoJSON. There are several ways to counteract the slow nature of the current application. Immediately I would use a tool like Redis to cache some of the rarely changing data. Some things that I might store in the Redis data structure might include:

	• State GeoJSON boundaries
	• The latitude and longitude for states
	• Daily rainfall for states
	• Which states grow soybeans
	• Daily rainfall for states
	• County GeoJSON boundaries
	• The latitude and longitude for counties
	• Daily rainfall for counties

Another thing that I would improve upon is the accuracy of the data. Because the data comes from so many sources, the routes become more complicated and there is much higher likelihood that the data becomes corrupted in some way. Were this to be a production application, I would look for more encompassing sources of data. (I believe I found some options that would be very well suited for this task, however they required a fee to use)

Lastly, I would finish off the front end and apply some additional tools. A feature that might be useful is search bar for example. I would most likely implement this with a trie data structure for fast searches. Additionally I might use a tool like https://www.amcharts.com/javascript-maps/ for the mapping feature instead of leaflet to give a cleaner, more professional look.

NB If you get an error, it is likely that API call limit for Google geo coding has been exceeded. Please let me know and I will update the key.
