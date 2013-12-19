if (Meteor.isClient) {
     var fbSdkLoader = function() {
        if(!Session.get("is Facebook JDK loaded?")) { // Load Facebook JDK only once.
          Session.set("is Facebook JDK loaded?", true);
          window.fbAsyncInit = function() { // See Facebook JavaScript JDK docs at: https://developers.facebook.com/docs/reference/javascript/
            // Init the FB JS SDK
            var initConfig = {
              appId: '579646255423746', // App ID from the App Dashboard
              channelUrl: Meteor.absoluteUrl("channel.html"), // channel url for FB
              status: true, // check the login status upon init?
              cookie: true, // set sessions cookies to allow your server to access the session?
              xfbml: false // parse XFBML tags on this page?
            };
            FB.init(initConfig);
          };
     
          (function(d, debug) { // Load the SDK's source Asynchronously
            var js, id = 'facebook-jssdk',
              ref = d.getElementsByTagName('script')[0];
            if(d.getElementById(id)) {
              return;
            }
            js = d.createElement('script');
            js.id = id;
            js.async = true;
            js.src = "//connect.facebook.net/pt_BR/all" + (debug ? "/debug" : "") + ".js";
            ref.parentNode.insertBefore(js, ref);
          }(document, /*debug*/ false));
        }
      };
    fbSdkLoader(); // run the loader 
    
    function getAmigos() {
        FB.api('/me/friends?fields=installed,name', function(response) {
          var amigos = new Array();
          $.each(response.data,function(i, amigo) { 
              if(amigo.installed) {
                  amigo.value = amigo.name;
                  amigos.push(amigo);
              }
          });
          return amigos;
        });
    } window.getAmigos = getAmigos;
}

if (Meteor.isServer) {
    Meteor.startup(function() { // serve channel.html file programmatically
        connect().use(connect.query(function(req, res, next) {
            // Need to create a Fiber since we're using synchronous http
            // calls and nothing else is wrapping this in a fiber
            // automatically
            return Fiber(function() {
              if(req.url === "/channel.html") {
                res.writeHead(200, {
                  'Content-Type': 'text/html'
                });
                return res.end('');
              } else {
                return next(); // if not a channel.html request, pass to next middleware.
              }
            }).run();
        }));
    });
}