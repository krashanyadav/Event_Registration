const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectDb = require("./config/db.js");
const authRoute = require('./routes/authRoute.js')
const eventRoute = require('./routes/eventRoute.js');
const RegistrationRoute = require("./routes/registration.js");



const app = express();

app.use(express.json());
app.use(cookieParser());

const path = require('path');
// app.use(express.static(path.join(__dirname, '../../Frontend/index.html')));
 app.use(express.static(path.join(__dirname, '../../Frontend')));

app.use('/api/auth', authRoute);

app.use('/api/events', eventRoute);   // ← ye line add karo
app.use('/api/registrations', RegistrationRoute); 


const PORT = process.env.PORT;
app.listen(PORT, () => {
  connectDb();
  console.log(`server are listning at ${PORT}`);
});