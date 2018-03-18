This project was a try to create a nice looking [NativeScript](https://www.nativescript.org/) with 
[firebase](https://firebase.google.com/) as a backend. (only tested with android)

I used the great [nativescript-plugin-firebase](https://github.com/EddyVerbruggen/nativescript-plugin-firebase) plugin and 
the app uses firebase storage, realtime database, authentication and cloud functions.


<img src="https://raw.githubusercontent.com/h43z/nativescript-firebase-app/master/showcase.gif" height="500"/>

In order to run this app. Create a firebase project at the [firebase console](https://console.firebase.google.com). Follow the steps to include firebase to Android and download and place the google-services.json into app/App_Resources/Android. Next Activate storage, anonymous authentication and the realtime database in the firebase console. Import the rules for the database from the file [database.rules.json](https://github.com/h43z/nativescript-firebase-app/blob/master/database.rules.json). Provide the database with data from the [database.import.json](https://github.com/h43z/nativescript-firebase-app/blob/master/database.import.json).

I used node version `v6.11.3` for nativescript.
If you have [nvm](https://github.com/creationix/nvm) run `nvm use`.

To build the app make sure you have NativeScript installed and a connected 
Phone and execute 
```bash
tns run android
```
from the root directory of the project.

The app uses push notifications (fcm) and firebase functions to relay these to the phone.
To install the firebase tools and deploy the [function](https://github.com/h43z/nativescript-firebase-app/blob/master/functions/index.js) run the following commands.

```bash
npm install -g firebase-tools
firebase login
cd $root_of_project
firebase init (choose to NOT overwrite files from the functions directory)
firebase deploy --only functions
```

You may have to go to 
```
https://console.developers.google.com/apis/library/fcm.googleapis.com/?project=$YOUR_PROJECT_ID
```
and enable the FCM api. (I got that link from the functions log output)
