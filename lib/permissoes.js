Acordos = new Meteor.Collection("acordos");
Notas = new Meteor.Collection("notas");
Avisos = new Meteor.Collection("avisos");

if (Meteor.isClient) {
    Meteor.subscribe("userData");
    Meteor.subscribe("allUserData");
    
	Meteor.subscribe("acordos");
    
} else {
	Acordos.allow({
	  insert: function (userId, doc) {
		  return (userId && ((doc.remetente === userId) || (doc.destinatario === userId)));
	  },
	  update: function (userId, doc, fields, modifier) {
		  return (userId && ((doc.remetente === userId) || (doc.destinatario === userId)));
	  }
	});
		
	Avisos.allow({
	  insert: function (userId, doc) {
	  	  acordo = Acordos.findOne(doc.acordo_id);
		  return (userId && ((acordo.remetente === userId) || (acordo.destinatario === userId)));
	  },
	  update: function (userId, doc, fields, modifier) {
		  return (userId && (doc.user_id === userId));
	  },
	  remove: function (userId, doc, fields, modifier) {
		  return (userId && (doc.user_id === userId));
	  }
	});

	Notas.allow({
	  insert: function (userId, doc) {
	  	  acordo = Acordos.findOne(doc.acordo_id);
		  return (userId && ((acordo.remetente === userId) || (acordo.destinatario === userId)));
	  },
	  update: function (userId, doc, fields, modifier) {
		  return (userId && (doc.user_id === userId));
	  },
	  remove: function (userId, doc, fields, modifier) {
		  return (userId && (doc.user_id === userId));
	  }
	});
    
    Meteor.publish("userData", function () {
        return Meteor.users.find({_id: this.userId}, {fields: {
            _id: true, 
			"profile.name": true,
			"services": true                                             
        }});
    });

	Meteor.publish("allUserData", function () {
		return Meteor.users.find({}, {fields: {
			_id: true, 
			"profile.name": true,
			"services.facebook.id": true
		}});
	});
	
	Meteor.publish("acordos", function () {
		return Acordos.find({$or:[{destinatario:this.userId}, {remetente:this.userId}]});
	});

	// Publica avisos dos Acordos onde o usuario 
	// é destinatario ou remetente
	Meteor.publish("avisos", function () {
		acordos = Acordos.find({$or: [{destinario: this.userId}, {remetente:this.userId}]}, {fields: { _id: 1}}).fetch();
		acordos = _.map(acordos, function(o){ return o._id});
		return Avisos.find({acordo_id: {$in: acordos }});
	});
	
	// Publica notas do usuario
	Meteor.publish("notas", function () {
		return Notas.find({user_id: this.userId});
	});
}


