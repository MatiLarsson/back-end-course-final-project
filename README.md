# Final Project for Coderhouse's Back-End course

The project consists of an **ecommerce** for a Beer Store.

## Deployed in Railway

(URL to deploy)
## Project Description

It allows users to:

1. Register using their email or their Github account. They are asked to choose between multiple avatars offered by the store. If none is selected, the server will automatically assign a default avatar to the registered user. After the registering process has succeded, the server will automatically dispatch an e-mail to the store's admin providing a full detail of the new user.
2. Login using their pre-registered email and password or their Github account. The server will set a new session for the logging user.
3. Navigate through the store and pop up modals to get detailed information on every product.
4. Add to cart the desired products at any time.
5. View a summary of what is in cart by clicking on the cart widget located at the navbar.
6. Edit the desired quantities, delete any product, or empty the cart completely, directly inside the cart widget's modal.
7. When ready to submit the order, do so by clicking on the confirm order button located in the cart widget modal.
8. After confirmation, an email gets automatically dispatched to the user's pre-registered address with a small summary of the order submitted.
9. At any time, the user's session can be terminated by clicking on the logout button.

It allows admins to:

1. Register using their email in the same register view as normal users. As a way to ease the process of navigating and testing out this demo, a check box has been implemented to allow visitors to register as an admin.
2. Upon login the server will automatically redirect the user to the admin's control panel view after the proper email and password have been authenticated and a new session as been created for the admin.
3. Once in the admin's control panel view, the user might be able to:
  - Get a detailed view of all the products displayed by the store to normal users.
  - Add a new product to the store.
  - Delete an existing product.
  - Edit any properties the product might have; like thumbnail, title, description, price or stock.

## Technologies and Dependencies Used

The project was build using Node JS, Express, Mongo and Mongoose on the back-end side along with other multiple dependencies.

On the front-end, Handlebars has been implemented to render all the view to the client from the server-side.

Dependencies used in the project:

- express
- express-handlebars
- experss-session
- mongoose
- apollo-server-express
- graphql
- multer
- bcrypt
- compression
- connect-mongo
- nodemailer
- normalizr
- passport
- passport-github2
- passport-local
- pino
- socket.io
- swagger-jsdoc
- swagger-ui-express

Dev Dependencies used:

- @faker-js/faker
- chai
- mocha
- supertest

## Additional Features

- The server uses socket.io on top of express in order to provide immediate updates to all on-line users on modified products properties, such as changes in price, stocks refills or even products removed from store.
- A logger has been implemented with pino library in order to keep a register of every api error and all the routes that are not implemented.
- Unitary tests have been implemented on the main api endpoints using chai, mocha, supertest and faker-js.
- The database runs on a DBAAS (Mongo Atlas).
- Authentications are done using passport, and sessions are managed using express-session.
- Passwords stored are encripted using bcrypt.
- Data from server is compressed using compression module.
- A first cut has been implemented on documenting the products' api using swagger.
- A first cut on graphql has been implemented with apollo.

