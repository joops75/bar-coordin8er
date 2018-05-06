# bar-coordin8er
An app where users can search for food and drink businesses in a specified location and declare their plan to attend if 
they wish.

This app is built upon the code at https://github.com/johnstonbl01/clementinejs-fcc / http://www.clementinejs.com/tutorials/tutorial-passport.html.

The user is presented with a search toolbar where they can enter a key word such as "bars", "food", "restaurants" or even 
a specific business name such as "Starbucks". They can also enter a town/city and country. After they hit "Go!", the Yelp 
Fusion API is called with this information, and then the results (max 20) are rendered to the screen using react.js. If 
there are more than 20 possible results for the search terms given, then hyperlinks to each available result page are 
displayed at the bottom of the webpage.

A user may opt to declare their attendence to a business for the current day by clicking on the "going" button. A user 
must be logged in via github for this feature to work, and will be prompted to do so if they are not. Each time a user 
clicks on "going", the connected "pubs" database, which stores a list of venues and the users that are attending them, 
is checked to see if they are currently already registered as attending the venue on the current day. If so, their 
details are removed, if not they are added. At the same time, the "users" database, which stores a list of users and the 
venues that they are attending, is updated to reflect this change. The "pubs" database is used to display the number of 
attendees to a venue, while the "users" database is used to display a message to the current logged in user as to whether 
they are recorded as attending a venue on the current day.

Addtionally, browser session storage is used to store the current search information, and loads it when the page is 
refreshed. This means when a user logs in via gihub, the page remains as it was when they are redirected back to the site. 
The session storage is wiped when the user logs out, clearing the screen in the process.

In development mode, files are served via the '/src' directory which features a 'bars.html' file that runs an in-browser
babel transformer to compile jsx and es6 code. A production build is made by running 'npm run compile', which uses the 
babel-compile package and stores files in '/compiled'. The in-browser babel transformer cdn can then be removed from 
'/compiled/public/bars.html and the body's script tag type changed from 'text/babel' to 'text/javascript'. The compiled 
files can then be served by running 'npm run serve' or 'node compiled/server.js'.

Technologies used in this project:
* node
* express
* html
* css
* jquery
* bootstrap
* mongodb
* mongoose
* react
* passport

Addtional packages of note:
* yelp-fusion
* passport-github
* babel-compile
