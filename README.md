# Covid19 API [@Nodeflux](http://www.nodeflux.io/) X Kampus Merdeka

## I want to sai Hi to everyone reading this file, especially for Nodeflux's internship selection teams!

### Technologies
- This API was build with Javascript on NodeJS environment with ExpressJS framework
- If you want to access the deployed version of this app, i already deployed this and you can access it direcly on this IP: **http://3.21.232.9:5000/**

### HOW TO BUILD, RUN, and USE
This guideline will focusly aim to Linux based operating systems. Any command / step described below might be unsupported / need to be 'translated' to your respective operating system. You can search the equivalent step needed here for your operating system from google search.

1. Install Docker
  - visit: [docker-install](https://docs.docker.com/engine/install/ubuntu/)
  - do every step written there, it's fairly straighforward and so easy to follow
2. Clone this repo
  - run: cd /your/prefered/dir/to/save/this/repo
  - run: git clone https://github.com/luckyAkbar/covid19-API.git
3. Build the image
  - run: docker build -t covid-api .
4. Run the image
  - run: docker run -p 3000:3000 -d --name covid-api covid-api
5. Access the API server
  - open web browser / postman
  - send request defined on API CONTRACTS below to: localhost:3000

### API CONTRACTS
1. **Endpoint: '/'**
  - method: **GET**
  - params: *none*
  - query: *none*
  - response type: **application/json**
  - desc: Returning general information about covid19 case in Indonesia
  - example request: **curl --location --request GET *'server_url:port/'***
  - example response: ![Image](https://i.ibb.co/pbFP5Yr/image.png)
  - extra note: -

2. **Endpoint: '/yearly**
  - method: **GET**
  - params: *none*
  - query: since, upto
  - response type: **application/json**
  - desc: Returning yearly Covid19 case in Indonesia from year value given in *since* query until *upto* query.
  - example request: **curl --location --request GET 'server_url:port/yearly?since=2020&upto=2023**
  - example response: ![Image](https://i.ibb.co/h8dGs2n/image.png)
  - extra note: You can put any year in query, both in *since* or *upto*. But, since Covid19 in Indonesia first detected in 2020, any request with *since* value lower than 2020, the server will response as if you was requesting for year 2020. The same applied if you request with value in *upto* higher than current year, the server will adjust the response to only returning the result upto that current year.<br>
  If You request like this: **curl --location --request GET 'server_url:port//yearly?since=2018&upto=2021'**, as mention before server fill adjust the response, and give you extra reponse in *message* to warn you. The sample response will be like this: ![Image](https://i.ibb.co/GTFRfhn/image.png)
  
3. **Endpoint: '/yearly/:year**
  - method: **GET**
  - params: year
  - query: *none*
  - response type: **application/json**
  - desc: Get accumulative information in the given year (specified from params)
  - example request: **curl --location --request GET 'server_url:port/yearly/2020'**
  - example response: ![Image](https://i.ibb.co/JK12JxL/image.png)
  - extra note: since covid come to Indonesia on 2020, any request with *year* in params less than 2020 will be treated as if *year* was 2020. The same will happen if *year* was more than current year. In that case, result will be accumulative case up to that current year.

4. **Endpoint: '/monthly'**
  - method: **GET**
  - params: *none*
  - query: since, upto
  - response type: **application/json**
  - desc: Get monthly accumulative Covid19 case in Indonesia from value given in *since* and *upto* query
  - example request: **curl --location --request GET 'server_url:port/monthly?since=2020.8&upto=2020.9'**
  - example response: ![Image](https://i.ibb.co/zNnB3vk/image.png)
  - extra note: Value supplied in both query must represent year and month date. For example, a valid one will be: *?since=2020.08&upto=2020.12*. The format for both query is *year.month*. However, if you supply invalid query, wheter the since year value less than 2020, or the year upto more than this current year, the server will response you back with default query value, for since -> *2020.03*, for upto: *current_year.current_month*

5. **Endpoint: '/monthly/:year'**
  - method: **GET**
  - params: *year*
  - query: since, upto
  - response type: **application/json**
  - desc: Get monthly data from range given in query, but if there is something wrong in either your query or URL params, the year choosen will be the one supplied in URL params.
  - example request: **curl --location --request GET 'server_url:port/monthly/2020?since=2020.4&upto=2020.5'**
  - example response: ![Image](https://i.ibb.co/MVHS3Ms/image.png)

6. **Endpoint: '/monthly/:year/:month'**
  - method: **GET**
  - params: *year*, *month*
  - query: *none*
  - response type: **application/json**
  - desc: Get monthly data from date given from *year* and *month*
  - example request: **curl --location --request GET 'server_url:port/monthly/2020/5'**
  - example response: ![Image](https://i.ibb.co/5Y0MrQc/image.png)
  - extra note: if value given in *year* and / or *month* is invalid, we will give the default value of *year* is 2020, and the *month* is 12.

7. **Endpoint: '/daily'**
  - method: **GET**
  - params: *none*
  - query: since, upto,
  - response type: **application/json**
  - desc: Get daily data about covid case in Indonesia from date value given from *since*, and *upto* query.
  - example request: **curl --location --request GET 'server_url:port/daily'**
  - example response: ![Image](https://i.ibb.co/rMNwY3X/image.png)
  - extra note: If no value or invalid value supplied on *since* and *upto*, the server will return daily covid case from first detected up until the last data.

8. **Endpoint: '/daily/:year'**
  - method: **GET**
  - params: year
  - query: since, upto,
  - response type: **application/json**
  - desc: Get daily data about covid case in Indonesia from *year* value and the value given from *since*, and *upto* query.
  - example request: **curl --location --request GET 'server_url:port/daily/2020'**
  - example response: ![Image](https://i.ibb.co/1Gdxtqq/image.png)
  - extra note: If no value or invalid value supplied on *year*, *since* and *upto*, the server will return daily covid case from first day of the *year* until the last day of the *year* data.

9. **Endpoint: '/daily/:year/:month'**
  - method: **GET**
  - params: year, month
  - query: since, upto,
  - response type: **application/json**
  - desc: Get daily data about covid case in Indonesia from *year* and *month* value and the value given from *since*, and *upto* query.
  - example request: **curl --location --request GET 'server_url:port/daily/2020/5'**
  - example response: ![Image](https://i.ibb.co/CB4HJWX/image.png)
  - extra note: If no value or invalid value supplied on *year*, *since* and *upto*, the server will return daily covid case from first day of the *year* and *month* until the last day of the *year* and *month* data.

10. **Endpoint: '/daily/:year/:month/:date'**
  - method: **GET**
  - params: year, month, date
  - query: *none*
  - response type: **application/json**
  - desc: Get daily data about covid case in Indonesia from the exact date supplied on *year*, *month*, *date*
  - example request: **curl --location --request GET 'server_url:port/daily/2020/5/7'**
  - example response: ![Image](https://i.ibb.co/Qrd8y9H/image.png)