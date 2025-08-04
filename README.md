# OpenAgri-UserDashboard
A user-friendly graphical interface that exposes the functionality of the OpenAgri services. 
🇪🇺
*"This service was created in the context of OpenAgri project (https://horizon-openagri.eu/). OpenAgri has received funding from the EU’s Horizon Europe research and innovation programme under Grant Agreement no. 101134083."*


The objective of the OpenAgri Dashboard is to act as a user-friendly graphical interface (GUI) that will serve the needs of the farmers/advisors. The offered functionalities will be based on the combined use of the core OpenAgri services e.g. farm calendar, reporting service, weather service, irrigation service and pest and disease management service.


The OpenAgri Dashboard ensures a quick, seamless, and engaging user experience. In more details, the OpenAgri Dashboard will: 

 - Deliver a smooth UX even in poor network conditions. 
 - Will work offline, load quickly, and feel like native mobile apps
 - Perform faster load times, better user engagement, and no need for users to download an app from the store. 


The technology selected for the development of the GUI complies with [Progressive Web App](https://developer.chrome.com/blog/getting-started-pwa) (PWA) type of web applications that native app-like experience to users, using web technologies. This ensures maximum compatibility with desktop, tablets and smart phones with reduced development effort.  
Progressive web apps are typically built on top of web technologies such as HTML, CSS, JavaScript, and on top of joint open-source projects, such as React Native and Angular Ionic. 
In the case of the OpenAgri project the React open-source front-end JavaScript library will be used. It should be noted that React supports the development of PWA. 

# License
This project code is licensed under the EUPL 1.2 license, see the LICENSE file for more details.
Please note that each service may have different licenses, which can be found their specific source code repository.

# Prerequisites
To run this web application locally, [Node.js](https://nodejs.org/) needs to be installed on your machine, and was generated using [Vite PWA](https://vite-pwa-org.netlify.app/guide/) with Mode version `22.17.0`. Make sure that your Node version is not older than this.

# Running
Simply by cloning this repository and navigating into it, first install the node modules using the `npm install` command. After this the web application can be run via the `npm run dev` command. The application will be available at: [http://localhost:5173/](http://localhost:5173/)

# Installation and Building
To install dependencies run `npm install`

Building the application is also a very simple task, running the `npm run build` command will put all of the static files into the newly generated `dist` folder.

# Docker
To application using docker use the following commnad

```
docker build -t openagri-dashboard .
```

Run

```
docker run --rm -it -p 80:80 openagri-dashboard
```

You can now visit the page [http://127.0.0.1](http://127.0.0.1) to access the WEB Dashboard
