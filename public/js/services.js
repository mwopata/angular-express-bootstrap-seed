'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
/*angular.module('myApp.services', []).
  value('version', '0.1');*/

angular.module('myApp.services', ['ngResource', 'firebase']).
  factory('States', function(data){
    return $resource('data/states.json', {},{
      get: {method: 'GET', isArray:true}
    });
  })
  .factory('FaceData', ['FBURL', 'Firebase', 'angularFire',
    function(FBURL, Firebase) {
      return {
        users: function() {
          return new Firebase(FBURL+'/users');
        },
        asks: function() {
          return new Firebase(FBURL+'/asks');
        }
      }
    }])
  .factory('myservices', ['FBURL', 'Firebase','angularFireAuth', '$location', 'angularFire',
  function(FBURL, Firebase, angularFireAuth, $location, angularFire){
    return {
      FBookData: function(AuthID, FBUserID)
      {

        FB.api(FBUserID+'?fields=friends.fields(picture,name,id),name,email&access_token='+AuthID, function(response){

          /*$rootScope.$apply(function() {
            $rootScope.fbObject =response;
            console.log("applying FB object to rootscope in hearer:")
            console.log($rootScope.fbObject)

          })*/
          console.log("FB API making connection ot User: " +FBUserID + "with Auth: " +AuthID)
          console.log(response);
          return(response);
        })
      }
      ,FireRef: function()
      {
        console.log("running fireref")
        return {
          users: function() {
            return new Firebase(FBURL+'/users');
          },
          asks: function() {
            return new Firebase(FBURL+'/asks');
          }
        }
      }
      ,fblogin: function(redirect,create,callback) {
        //Could use "findEmail" to see if user has logged in for the first time but already has outstanding questions
        //from other friends
        //returns promise from angularfireauth
        console.log("facebook login service running")
        var p = angularFireAuth.login('facebook',
          {
            rememberMe:false,
            scope: 'email'
          });
        p.then(function(user) {
          if( redirect ) {
            $location.path(redirect);
          }

          callback && callback(null, user);
        }, callback)

      }
      ,logout: function(redirectPath) {
        console.log("logging out");
        angularFireAuth.logout();

        if(redirectPath) {
          $location.path(redirectPath);
        }
      }
      ,addAnswererToUsers: function(userId, answererId, answererName){
        console.log("Adding answerer: " + answererName + " to My Friendperts for: " +userId)
        console.log("Checking to see is user already exists")


      }
      ,addAnswerer: function(userId, answererId, answererName){
        var localRef = this.FireRef();
        this.findId(answererId, function(cb){
          //check to see if user is already a member of friendperts
          console.log("Callback indicated:")
          console.log(cb)
          if (cb){
            console.log("Answerer already has a friendperts account. Adding as answerer")
            localRef.users().child('/'+userId+'/answerers/'+answererId+'/name').set(answererName);
          }
          else
          {
            console.log("Answerer is a new user. Adding to users table and answerers")
            localRef.users().child('/'+answererId+'/name').set(answererName);
            localRef.users().child('/'+userId+'/answerers/'+answererId+'/name').set(answererName);
          }
        })

      }

      ,removeAnswerer: function(userId, answererId){
        console.log("removing answerer: " +answererId + " from user: " + userId)
        this.FireRef().users().child('/'+userId+'/answerers/'+answererId).remove();
        return;
      }
      ,addMyTag: function(userId,tag,cb){
        console.log("pushed tag to tags")
        return this.FireRef().users().child('/'+userId+'/tags').push({
          tag:tag}, cb).name();
      }
      ,removeMyTag: function(userId, tagId, cb) {
        console.log("attempting remove of user: " + userId + "'s tag: " +tagId);
        return this.FireRef().users().child('/'+userId+'/tags/'+tagId).remove();

      }
      ,associateTagtoUser: function(userId, answererId, tag, cb) {
        console.log("Adding tag for myfriendpertID: " +answererId + " From user: " + userId + " with tag id: " + tag.id);
        this.FireRef().users().child('/'+userId+'/answerers/'+answererId+'/tags/'+tag.id).set({
          tag: tag.tag}, cb);
      }
      ,disassociateTagtoUser: function(userId, answererId, tagId, cb) {
        console.log("attempting disassociate tag: " + tagId + "for answerer: " +userId + " of user: " +userId);
        this.FireRef().users().child('/'+userId+'/answerers/'+answererId+'/tags/'+tagId).remove();
        return;
      }
      ,findId: function(FBID, callback)
      {
        console.log("finding id for:")
        console.log(FBID)
        this.FireRef().users().child(FBID).once('value', function(snap) {
          callback( snap.val() !== null);

        });
      }
      ,findEmail: function(FBID, callback)
      {
        console.log("Checking if email exists for:")
        console.log(FBID)
        this.FireRef().users().child(FBID+'/email').once('value', function(snap) {
          callback( snap.val() !== null);

        });
      }
      ,addAsktoAsksTable: function(userId, userName, question, asktags, askanswerers, cb)
      {
        //var AsksRef = new Firebase(FBURL).child('asks/');
        var askId = this.FireRef().asks().push({ask: question, user: userId, name: userName},cb).name();
        console.log("returned ask id:")
        console.log(askId);
        for (var x = 0; x<asktags.length; x++)
        {
          console.log("Tag being added: " + asktags[x].tag);
          console.log(asktags[x].id);
          this.FireRef().asks().child('/'+askId+'/tags/'+asktags[x].id+'/tag').set(asktags[x].tag)
        }
        for (var users in askanswerers)
        {
          console.log("Adding the User ID: " + users + " as an answerer to the ask");
          //array with objects [num].user
          this.FireRef().asks().child('/'+askId+'/answerers/'+users).set("true")
        }

        return askId;
      }
      ,addAsktoUsersTable: function(userId, userName, question, asktags, askId, askanswerers, cb){
        this.FireRef().users().child('/'+userId+'/asks/'+askId).set({user:userId, ask:question, name: userName});
        for (var x = 0; x<asktags.length; x++)
        {
          console.log("Tag being added: " + asktags[x].id + " length = " + asktags.length);
          this.FireRef().users().child('/'+userId+'/asks/'+askId+'/tags/'+asktags[x].id+'/tag').set(asktags[x].tag, function(error){
          if (error){
            console.log("error occurred on set")
          }
          else {
            console.log("no error occurred")
          }
        })
        }
        for (var users in askanswerers)
        {
          console.log("Adding the User ID: " + users + " as an answerer to the ask");
          //array with objects [num].user
          this.FireRef().users().child('/'+userId+'/asks/'+askId+'/answerers/'+users).set("true")
        }
      }
      ,addAsktoAnswerer: function(userId, userName, question, asktags, askId, answererId, askanswerers, cb){
        console.log("Answers ID: " +answererId);
        var AsksRef = this.FireRef().users().child('/'+answererId+"/answers/");
        console.log("Setting the newask for " +answererId + "to true");
        this.FireRef().users().child('/'+answererId+'/newask').set(true);
        //AsksRef.child('/newval').set(true);
        AsksRef.child(askId+'/user').set(userId);
        AsksRef.child(askId+'/ask').set(question);
        AsksRef.child(askId+'/name').set(userName);
        for (var x = 0; x<asktags.length; x++)
        {
          console.log("Tag being added: " + asktags[x].id);
          AsksRef.child(askId+'/tags/'+asktags[x].id+'/tag').set(asktags[x].tag)
        }
        for (var users in askanswerers)
        {
          console.log("Adding the User ID: " + users + " as an answerer to the ask");
          //array with objects [num].user
          AsksRef.child('/'+askId+'/answerers/'+users).set("true")
        }
      }
      ,removeAskfromAnswerer: function(askId, answererId)
      {
        var AskRef = this.FireRef().users().child('/'+answererId+'/answers/'+askId);
        var onComplete = function(error) {
          if (error)
            console.log('Delete failed.');
          else
            console.log('Delete succeeded of users/asnwererid/answers/askid : ' + askId + " on : " +answererId);
        };
        AskRef.remove(onComplete);
      }
      ,removeAskfromUser: function(askId, userId)
      {
        var AskRef = this.FireRef().users().child('/'+userId+'/asks/'+askId);
        var onComplete = function(error) {
          if (error)
            console.log('Delete failed.');
          else
            console.log('Delete succeeded from users/userid/asks/askid of : ' + askId + " on " + userId);
        };
        AskRef.remove(onComplete);
      }
      ,removeAskfromAsks: function(askId)
      {
        var AskRef = new Firebase(FBURL).child('asks/'+askId);
        var onComplete = function(error) {
          if (error)
            console.log('Delete failed.');
          else
            console.log('Delete succeeded of : ' + askId + " from Asks/askid  ");
        };
        AskRef.remove(onComplete);
      }
      ,addAnswertoAsks: function(askId, answer, answererId, answererName, cb)
      {
        //Answerers to add to
        console.log("Adding answer: " +answer + "to asks table");
        var answerId = this.FireRef().asks().child('/'+askId+"/answers/").push({
          answer: answer,
          user: answererId,
          name: answererName},cb).name();
        return answerId;
      }
      //Needs to find the user who asked the question, find all the users that have the tags,
      ,addAnswertoAnswerers: function(askId, answer, answererId, answererName, userId, answerId, cb)
      {
        console.log("Adding answer: " +answer + " to answerers table");
          this.FireRef().users().child('/'+userId+"/answers/"+askId+"/answers/"+answerId).set({
          answer: answer,
          user: answererId,
          name: answererName});
      }
      ,addAnswertoAsker: function(askId, answer, answererId, answererName, askerId, answerId, cb)
      {
        console.log("Adding answer: " +answer + " to asks table for asker: " +askerId);
        this.FireRef().users().child('/'+askerId+"/asks/"+askId+"/answers/"+answerId).set({
          answer: answer,
          user: answererId,
          name: answererName});
        console.log("Setting the newanswer for " +askerId + "to true");
        this.FireRef().users().child('/'+askerId+'/newanswer').set("true");
        //this.FireRef().users().child('/'+askerId+"/asks/newval").set(true);
      }
      ,addUser: function(userId, email, userName, cb)
      {
        console.log("Adding info to user: " +userId + " email: " +email + " name: " + userName);
        this.FireRef().users().child('/'+userId).set({
          email: email,
          name: userName}, cb);
      }
      ,addField: function(cb){
        this.FireRef().asks
      }
    }
  }])

  .value('version', '0.21')
  .value('fieldval', 'Value of field');
