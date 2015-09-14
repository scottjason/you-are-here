### you.are.here
you.are.here integrates the Uber Api, Yelp Api and the Google Maps Api. It also implements oAuth 2.0 and deep-linking into Uber's native iOS app.

Built primarily for mobile/tablet web on iOS, the app will first collect the user's current location followed by a prompt to login to their Uber account. Once logged in, a search box to query for types of places in the area (bars, dinner, dentist, etc) will appear and the search results render details about the places along with the yelp reviews.

When using iOS, a user will also see a 'request uber'​ button next to each listing. When clicked, this will launch the native iOS Uber app and populate the start and end locations.

Once the native Uber app is open and the 'to'​ and 'from'​ fields have been populated, the user will be asked to confirm the ride request (so if you just want to test it out without using it you can .. just don't confirm/complete the ride request once you're in the native app).

All of the features aside from 'request uber'​ are compatible on desktop. (haven't tested on Android)
_____________
 - Angular.js 
 - Node.js
 - Express.js 
 - Gulp.js

###### Responsive design with animated breakpoints written in plain css.

###### [visit site](https://you-are-here-app.herokuapp.com)