require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
const models = require('./models');
var indexRouter = require('./routes/index');
const { errorMiddleware } = require('./middleware/errorMiddleware');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
// app.use(function (err, req, res, next) {

//   models.errorLogger.create({
//     message: JSON.stringify(err.stack),
//     url: req.url,
//     method: req.method,
//     host: req.hostname,
//     body: JSON.stringify(req.body)
//   })
 
//  return res.status(500).send({ message: "something went wrong" });
// });

app.use(errorMiddleware)




module.exports = app;
