'use strict';

// importing AWS sdk

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _config = require('./config.json');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk2.default.config.update({
  accessKeyId: _config2.default.aws.accessKeyId,
  secretAccessKey: _config2.default.aws.secretAccessKey,
  region: _config2.default.aws.region
});

// Instatiating the SES from AWS SDK

// importing config file which contains AWS key
// Best practice: to use a config.copy.json when pushing to github
// Coz exposing the AWS keys to public is not good
var ses = new _awsSdk2.default.SES();

// Structure of sendMail params structure:
/*
var params = {
  Destination: {  / required /
    BccAddresses: [
      'STRING_VALUE',
      / more items /
    ],
    CcAddresses: [
      'STRING_VALUE',
      / more items /
    ],
    ToAddresses: [
      'STRING_VALUE',
      / more items /
    ]
  },
  Message: { / required /
    Body: { / required /
      Html: {
        Data: 'STRING_VALUE', / required /
        Charset: 'STRING_VALUE'
      },
      Text: {
        Data: 'STRING_VALUE', / required /
        Charset: 'STRING_VALUE'
      }
    },
    Subject: { / required /
      Data: 'STRING_VALUE', / required /
      Charset: 'STRING_VALUE'
    }
  },
  Source: 'STRING_VALUE', / required /
  ConfigurationSetName: 'STRING_VALUE',
  ReplyToAddresses: [
    'STRING_VALUE',
    / more items /
  ],
  ReturnPath: 'STRING_VALUE',
  ReturnPathArn: 'STRING_VALUE',
  SourceArn: 'STRING_VALUE',
  Tags: [
    {
      Name: 'STRING_VALUE', / required /
      Value: 'STRING_VALUE' / required /
    },
    / more items /
  ]
};

ses.sendEmail(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});

*/

// The function to send SES email message
module.exports.sendMail = function (event, context, callback) {

  var bccEmailAddresses = event.body.bccEmailAddresses;
  var ccEmailAddresses = event.body.ccEmailAddresses;
  var toEmailAddresses = event.body.toEmailAddresses;
  var bodyData = event.body.bodyData;
  var bodyCharset = event.body.bodyCharset;
  var subjectdata = event.body.subjectdata;
  var subjectCharset = event.body.subjectCharset;
  var sourceEmail = event.body.sourceEmail;
  var replyToAddresses = event.body.replyToAddresses;

  // Building the slack message
  var options = {
    text: 'We have got a customer support from ' + replyToAddresses + ' Log into <https://privateemail.com/appsuite/> to answer their query.'

    // The parameters for sending mail using ses.sendEmail()
  };var emailParams = {
    Destination: {
      BccAddresses: bccEmailAddresses,
      CcAddresses: ccEmailAddresses,
      ToAddresses: toEmailAddresses
    },
    Message: {
      Body: {
        Text: {
          Data: bodyData,
          Charset: bodyCharset
        }
      },
      Subject: {
        Data: subjectdata,
        Charset: subjectCharset
      }
    },
    Source: sourceEmail,
    ReplyToAddresses: replyToAddresses
  };

  // the response to send back after email success.
  var response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Mail sent successfully'
    })
  };

  // The sendEmail function taking the emailParams and sends the email requests.
  ses.sendEmail(emailParams, function (err, data) {
    if (err) {
      console.log(err, err.stack);
      callback(err);
    } else {
      console.log("SES successful");
      console.log(data);

      _request2.default.post(_config2.default.slackWebhook, { body: JSON.stringify(options) }, function (err, httpResponse, body) {
        if (err) {
          console.error('Slack webhook failed:', err);
          callback(err);
        }
        console.log('Post to slack bot successful!!');
        console.log(httpResponse);
        console.log('Post to slack bot replied with:', body);
        callback(null, response);
      });
    }
  });
};