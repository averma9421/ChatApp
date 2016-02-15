Messages = new Mongo.Collection('messages');    //Mongo db collection
if (Meteor.isClient) {
  Meteor.subscribe('messages', 5); //subscribing the method

  Template.hello.helpers({
    messages: function () {
      return Messages.find({}, {   //return message from database
        sort: { timestamp: -1 }   //sorting messages in decending order
      });
    }
  });

  Template.hello.events({
    'submit .chat-form': function (evt) {    //submit event
      evt.preventDefault();
      var text = evt.target.message.value;  //value in the text box
      console.log(text);
      Meteor.call('insertMessage', text, function(err, result) {
        if (err) {    //in case of error display the error message
          console.log(err);
          alert(err.reason);
        } else {
          console.log('Message inserted with ID: ', result);
          evt.target.message.value = '';   //clears the textArea
        }
      });
    }
  });

  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL'   //Fields to be filled while siging up
  });
}

if (Meteor.isServer) {
  Meteor.methods({
    insertMessage: function(text) {
      if (!this.userId) {   //if no user is logged in throw error
        throw new Meteor.Error("logged-out",
          "The user must be logged in to post a message.");
      }
      var user = Meteor.users.findOne(this.userId);   //get the user id of the signed user
      return Messages.insert({  //insert the userid,message and timestamp in the database.
        userId: this.userId,
        username: user.username,
        text: text,
        timestamp: Date.now()
      });
    }
  });

  Meteor.publish('messages', function(limit) {
    //publish messages for logged in user
    if (this.userId) {
      return Messages.find({}, {
        limit: limit || 5,  //limiting the number of messages
        sort: { timestamp: -1 }   //sorting in descending order.
      });
    }
    this.ready();
  });
}