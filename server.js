const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport('smtp://'+process.env.SMTP_LOGIN+':'+process.env.SMTP_PASSWORD+'@' + process.env.SMTP_HOST);
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const titleCase = require('title-case');
const app = express();

app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.post('/send-email', function(req, res) {

  const name = req.body.event.data.new.name;
  const slug = req.body.event.data.new.slug;
  const post = titleCase(slug.replace('-', ' ').substring(1, slug.length));
  const text = req.body.event.data.new.text;
  // setup e-mail data
  const mailOptions = {
      from: process.env.SENDER_ADDRESS, // sender address
      to: process.env.RECEIVER_ADDRESS, // list of receivers
      subject: `New comment on "${post}"`, // Subject line
      text: `{name} has posted: {text}`, // plaintext body
      html: '<p>'+ name + ' has posted: ' + text + '</p>' // html body
  };
  // send mail with defined transport object
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          return console.log(error);
      }
      console.log('Message sent: ' + info.response);
      res.json({'success': true});
  });

});

app.listen(app.get('port'), function() {
  console.log('Server started on: ' + app.get('port'));
});