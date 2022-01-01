# Covid19 API [@Nodeflux](http://www.nodeflux.io/) X Kampus Merdeka

## I want to sai Hi to everyone reading this file, especially for Nodeflux's internship selection teams!

### Technologies
- This API was build with Javascript on NodeJS environment with ExpressJS framework

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