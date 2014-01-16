'use strict';

/* Controllers */

function AppCtrl($scope, $http, $rootScope, myservices, angularFire, Firebase, FBURL, $route, angularFireAuth) {
  console.log($route);
  $scope.model = {
    message: "I'm a great app!"
  }
};


AppCtrl.prepData = function($q, $timeout, FBURL, $rootScope, angularFire, angularFireAuth, $location, myservices) {

  $rootScope.currentpage = $location.$$url
  $rootScope.isActive = function (viewLocation) {
    console.log(viewLocation)
    var tf = (viewLocation === $location.$$url)
    console.log("TF: " + tf)
  };


  console.log("URL location:" + $location.$$url)
  var defer = $q.defer();
  if($rootScope.auth && $rootScope.usrArr)
  {

    console.log("Auth and usrArr are already set. resolving defer")
    defer.resolve();
  }
  else
  {
    console.log("Auth or usrArr has not been set")
    //Waiting 1 second before doing all of this so that the auth variable gets set
    $timeout(function() {
      if ($rootScope.auth)
      {
        FB.api($rootScope.auth.id+'?fields=friends.fields(picture,name,id),name,email&access_token='+$rootScope.auth.accessToken, function(response){
          //Setting the fbobject variable
           $rootScope.$apply(function() {
           $rootScope.fbObject =response;
           console.log("applying FB object to rootscope in hearer:")
           console.log($rootScope.fbObject)

           })
          //Running the angularfire promise
          //Don't need to run because when auth is set, we set the usrarr in the app2 controller
          //Check to see if usr exists in the database (see if user is logging in for first time).
          myservices.findId($rootScope.auth.id, function(cb){
            if (!cb){
              console.log("User does not exist--Inserting into DB now");
              var onComplete = function(error) {
                if (error) alert('Synchronization failed.');
                else alert('Synchronization succeeded.');
              };
              myservices.addUser($rootScope.auth.id, $rootScope.auth.email, $rootScope.auth.name, function(error){
                if (!error){
                  console.log("User successfully added to database. Adding to usrArr now")
                  $rootScope.userpromise = angularFire(new Firebase(FBURL+'/users/'+$rootScope.auth.id), $rootScope, 'usrArr');
                  $rootScope.userpromise.then(function(){
                    console.log("user promise completed")
                    console.log("Defer resolved within the 2000 ms limit. usrArr:")
                    console.log($rootScope.usrArr)
                    defer.resolve("Text")
                  })
                  console.log("FB API making connection ot User: " +$rootScope.auth.id + "with Auth: " +$rootScope.auth.accessToken)
                  return(response);
                }
              else{
                  console.log("Error occurred:")
                  console.log(error)
                }
              })
            }
            else{
              console.log("User exists in DB, adding info to usrArr now")
              $rootScope.userpromise = angularFire(new Firebase(FBURL+'/users/'+$rootScope.auth.id), $rootScope, 'usrArr');
              $rootScope.userpromise.then(function(){
                console.log("user promise completed")
                console.log("Defer resolved within the 2000 ms limit. usrArr:")
                console.log($rootScope.usrArr)
                if (!$rootScope.usrArr.email){
                  console.log("Auth is set, but the email address hasn't been set for auth (may be first login for user")
                  //console.log($rootScope.auth.email)
                  myservices.addUser($rootScope.auth.id, $rootScope.auth.email, $rootScope.auth.name);
                }
                defer.resolve("Text")
              })
              console.log("FB API making connection ot User: " +$rootScope.auth.id + "with Auth: " +$rootScope.auth.accessToken)
              return(response);
            }
          })
        })

      }
      else{
        console.log("Auth was not set: resolving defer and redirecting to home")
        $location.path('/home')
        defer.resolve();
      }
    }, 2000);
  }
  return defer.promise
}


AppCtrl.$inject = ['$scope', '$http', '$rootScope', 'myservices', 'angularFire', 'Firebase', 'FBURL', '$route','angularFireAuth', '$location']

function App2Ctrl($scope, $http, $rootScope, myservices, angularFire, Firebase, FBURL) {

  //Don't need this code because we are handling page loading on every view with a resolve
  /*$scope.$on("angularFireAuth:login", function() {
    console.log("$scope.on angularfireauth method triggered");
    console.log($rootScope.auth);
    FB.api($rootScope.auth.id+'?fields=friends.fields(picture,name,id,email),name,email&access_token='+$rootScope.auth.accessToken, function(response){
      //Setting the fbobject variable
      $rootScope.$apply(function() {
        $rootScope.fbObject =response;
        console.log("applying FB object to rootscope in hearer:")
        console.log($rootScope.fbObject)
      })
      })
    $scope.userpromise = angularFire(new Firebase(FBURL+'/users/'+$scope.auth.id), $rootScope, 'usrArr');
    console.log($rootScope.usrArr)
    console.log(".on function finished running")
  })*/
  $rootScope.loadingpage = false;
  $rootScope.$on('$routeChangeError', function() {
    console.log("route change Error")
    $rootScope.loadingpage = true;
  });
  $rootScope.$on('$routeChangeStart', function() {
    console.log("route change start")
    $rootScope.loadingpage = true;
  });
  $rootScope.$on('$routeChangeSuccess', function() {
    console.log("route change finish")
    $rootScope.loadingpage = true;
  });
  console.log("Scope username: ")
  $http({method: 'GET', url: '/api/name'}).
  success(function(data, status, headers, config) {
      console.log(data.name)
    $scope.name = data.name;
  }).
  error(function(data, status, headers, config) {
    $scope.name = 'Error!'
  });
}
App2Ctrl.$inject = ['$scope', '$http', '$rootScope', 'myservices', 'angularFire', 'Firebase', 'FBURL'];

function FbCtrl($scope, $http, $rootScope, myservices, facebookresponse) {
  console.log("Facebook response:")
  console.log(facebookresponse)
  var httpinfo = $http({
    method: 'GET',
    url: '/api/stuff'
  })
  console.log(httpinfo)
}
FbCtrl.$inject = ['$scope', '$http', '$rootScope', 'myservices'];
FbCtrl.resolve = {
  facebookresponse: function($http) {
    return $http({
      method: 'GET',
      url: '/api/stuff'
    })

  }
}

function SigninCtrl($scope, $http, $rootScope, myservices, $location) {
  $scope.signinaction = function()
  {
    console.log("sign in clicked")
    myservices.fblogin('/home');
  }
  $scope.pagelocation = $location.$$url
  $scope.signoutaction = function()
  {
    console.log("logout clicked")
    myservices.logout();
    $location.path('/home')
  }
}
SigninCtrl.$inject = ['$scope', '$http', '$rootScope', 'myservices', '$location'];

function MyCtrl1() {
  console.log("Ctrl 1 ran")
}
MyCtrl1.$inject = [];


function AsksCtrl($scope, $http, $rootScope, myservices, $location) {
  $rootScope.usrArr['newanswer']="false"
  $scope.newtag=[];
  $scope.question= null;
  $scope.asktags=[];
  $scope.newanswers = {};
  $scope.askanswerers=[];
  $scope.isViewLoading = true;
  console.log("Is view loading: ")
  console.log($scope.isViewLoading)
  $scope.addAnswer = function(askId, askerId)
  {
    console.log($scope.newanswers);
    console.log("Adding answer: " +$scope.newanswers[askId] + " for user " + $scope.auth.id + "to ask: " +askId);
    var answerId = myservices.addAnswertoAsks(askId, $scope.newanswers[askId], $scope.auth.id, $scope.auth.name);
    console.log("Returned answerId: " + answerId);
    for (var answerers in $rootScope.usrArr.asks[askId].answerers)
    {
      console.log("Adding answer by: " +$scope.auth.id + " to: " + answerers);
      myservices.addAnswertoAnswerers(askId,$scope.newanswers[askId],$scope.auth.id, $scope.auth.name, answerers, answerId);
    }
    console.log("asker ID");
    console.log(askerId);
    myservices.addAnswertoAsker(askId,$scope.newanswers[askId],$scope.auth.id, $scope.auth.name, askerId, answerId);
    $scope.newanswers[askId] = "";
  }
  $scope.addAsk = function(){
    //Need to populate an array with all the users who have the tags associated with them for the insert
    for (var items in $rootScope.usrArr.answerers)
    {
      //Look at tags within answerers
      answererstags:
        for (var usertags in $rootScope.usrArr.answerers[items].tags)
        {
          //Looks at the tags that are in the ask and then see if they equal the tags associated with the answerer
          for (var x = 0; x<$scope.asktags.length; ++x)
          {

            if ($rootScope.usrArr.answerers[items].tags[usertags].tag == $scope.asktags[x].tag)
            {
              console.log("Tag name from ask tags");
              console.log($scope.asktags[x].tag);
              console.log("Answerer matched. Adding " + $rootScope.usrArr.answerers + " to $scope.askanswerers ");
              $scope.askanswerers[items] = $rootScope.usrArr.answerers[items];
              break answererstags;
            }
          }

        }
    }
    console.log("Finished adding all the answerers to the $scope.askanswerers array: ");
    for (var users in $scope.askanswerers)
    {
      console.log(users);
      //array with objects [num].user
      console.log($scope.askanswerers[users])
    }

    console.log("Adding ask: " + $scope.question + " with tags: ");
    console.log($scope.asktags);
    var askId = myservices.addAsktoAsksTable($scope.auth.id, $scope.auth.name, $scope.question, $scope.asktags, $scope.askanswerers);
    myservices.addAsktoUsersTable($scope.auth.id, $scope.auth.name, $scope.question, $scope.asktags,askId, $scope.askanswerers);
    //Do some logic to see if tags match up and if so, insert
    //Look at the answers that match the tags ($scope.askanswerers

    for (var users in $scope.askanswerers)
    {
      console.log("Adding the ask to the answerer: " +users + " table");
      myservices.addAsktoAnswerer($scope.auth.id, $scope.auth.name, $scope.question, $scope.asktags, askId, users, $scope.askanswerers);
    }
    $scope.asktags=[] ;
    $scope.askanswerers=[];
    $scope.question = null;

  }
  $scope.associateTagtoAsk = function() {
    console.log("Adding new id: ");
    console.log($scope.newtag);
    console.log("Adding new tag: ");
    console.log($rootScope.usrArr.tags[$scope.newtag].tag);
    $scope.asktags.push({id: $scope.newtag, tag: $rootScope.usrArr.tags[$scope.newtag].tag});
    console.log("$scope.asktags: ");
    console.log($scope.asktags);
    //Resets the dropdown box
    $scope.newtag = {};
  }
  $scope.disassociateTagtoAsk = function(tagId) {
    Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
    };
    $scope.asktags.remove(tagId);
  }
  $scope.removeAsk = function(askId) {
    console.log("Removing Ask: " + askId);
    //Tries to remove ask tag from each user/answererId/answers/askId
    for (var items in $rootScope.usrArr.answerers)
    {
      myservices.removeAskfromAnswerer(askId, items);
    }
    myservices.removeAskfromAsks(askId);
    myservices.removeAskfromUser(askId, $scope.auth.id);
  }
}
AsksCtrl.$inject = ['$scope', '$http', '$rootScope', 'myservices', '$location'];

function AnswersCtrl($scope, $http, $rootScope, myservices, $location) {
  $rootScope.usrArr['newask']="false"
  console.log("Answers ctl ran")
  $scope.newanswers = {};
  $scope.myAnswersArr = [];

  $scope.addAnswer = function(askId, askerId)
  {
    console.log($scope.newanswers);
    console.log("Adding answer: " +$scope.newanswers[askId] + " for user " + $scope.auth.id + "to ask: " +askId);
    var answerId = myservices.addAnswertoAsks(askId, $scope.newanswers[askId], $scope.auth.id, $scope.auth.name);
    console.log("Returned answerId: " + answerId);
    for (var answerers in $rootScope.usrArr.answers[askId].answerers)
    {
      console.log("Adding answer by: " +$scope.auth.id + " to: " + answerers);
      myservices.addAnswertoAnswerers(askId,$scope.newanswers[askId],$scope.auth.id, $scope.auth.name, answerers, answerId);
    }
    console.log("asker ID");
    console.log(askerId);
    myservices.addAnswertoAsker(askId,$scope.newanswers[askId],$scope.auth.id, $scope.auth.name, askerId, answerId);
    $scope.newanswers[askId] = "";
  }
}
AnswersCtrl.$inject = ['$scope', '$http', '$rootScope', 'myservices', '$location'];

function HomeCtrl() {
  console.log("Home ctrl ran")
}
HomeCtrl.$inject = [];

function MyFriendpertsCtrl($scope, $http, $rootScope, myservices, $location) {
  console.log("FP ran")
  $scope.newtags = {};
  $scope.addAnswerer = function(answererId, answererName){
    console.log("Running addanswerer in controller level: " + answererId + ", "  + answererName)
    myservices.findId(answererId, function(cb){
      if (!cb){
        console.log("Answerer is a new user. Adding to users table and answerers")
        myservices.FireRef().users().child('/'+answererId+'/name').set(answererName);
      }
      if ($rootScope.usrArr["answerers"]){
        console.log("adding an answerer to the answerers table")
        $rootScope.usrArr["answerers"][answererId]= {name: answererName}
        //Answerers is set, we just need to add an answererId and name property
      }
      else{
        //Edge case answerers is empty. We need to insert the entire object
        console.log("User currently has no answerers. Creating new answerer object")
        var ob = {};
        ob[answererId] = {name: answererName};
        console.log(ob);
        console.log($rootScope.usrArr)
        $rootScope.usrArr["answerers"] = ob;
      }
      $rootScope.$apply();
    })
    //myservices.addAnswerer($scope.auth.id, answererId, answererName)
  }
  $scope.removeAnswerer = function (answererId){

    console.log($rootScope.usrArr["answerers"])
    console.log("Removing (controller level) answerer: " + answererId)
    delete $rootScope.usrArr["answerers"][answererId]
  }
  $scope.addMyTag = function (){
    console.log("Adding my tag: " + $scope.mynewtag +" on controller level")
    console.log($rootScope.usrArr["tags"])
    var tagId = myservices.addMyTag($scope.auth.id, $scope.mynewtag, function(cb){
      //This callback function is executed once the insert has been completed successfully
      if (cb){
        console.log("error has occured on callback")
      }
      else{
        console.log("Tag insert completed successfully")
        $scope.mynewtag=""
        $scope.$apply();
      }

    })
  }
  $scope.removeMyTag = function(tagId) {
    console.log("Removing tag: ");
    console.log(tagId);
    delete $rootScope.usrArr["tags"][tagId]
  }
  $scope.associateTagtoUser = function(answererId) {
    $scope.newtags[answererId]= ({id: $scope.newtags[answererId], tag: $rootScope.usrArr.tags[$scope.newtags[answererId]].tag});
    console.log($scope.newtags[answererId]);
    myservices.associateTagtoUser($scope.auth.id,answererId, $scope.newtags[answererId], function(err) {
    });
  }
  $scope.disassociateTagtoUser = function(tagId, answererId) {
    console.log("Auth ID: " +$scope.auth.id + "Answerer ID: " +answererId + "Tag ID:" + tagId);
    myservices.disassociateTagtoUser($scope.auth.id, answererId, tagId);
  }

  //Need to "findAnswerers". Perhaps remove from this page and have the add work on the "Friendslist" page.
  //My Friendperts will only list those who have been added.
}
MyFriendpertsCtrl.$inject = ['$scope', '$http', '$rootScope', 'myservices', '$location'];

function DbeditCtrl($scope, $http, $rootScope, myservices, $location, FBURL, angularFire) {

  console.log("Running dbedit ctrl")
  $rootScope.usersp = angularFire(new Firebase(FBURL+'/users'), $rootScope, 'usersArr');
  $rootScope.usersp.then(function(){
    console.log("users promise completed")
    console.log($rootScope.usersArr)
  })
  $rootScope.asksp = angularFire(new Firebase(FBURL+'/asks'), $rootScope, 'asksArr');
  $rootScope.asksp.then(function(){
    console.log("asks promise completed")
    console.log($rootScope.asksArr)
    console.log("Testing push to rootscope value")
    $rootScope.asksArr['asksVal']="The value for asks";

  })

}

DbeditCtrl.$inject = ['$scope', '$http', '$rootScope', 'myservices', '$location', 'FBURL', 'angularFire'];



