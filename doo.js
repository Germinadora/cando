if (Meteor.isClient) {
    Meteor.subscribe("acordos");
    Meteor.subscribe("notas");
    Meteor.subscribe("avisos");
    
	Template.hoje.data = function() {
        var hoje = new Date();
        hoje.setHours(0,0,0,0);
        return dias[hoje.getDay()]+', '+hoje.getDate()+' de '+meses[hoje.getMonth()]+' de '+hoje.getFullYear();
    };

	Template.hoje.blocos = function() {
		var hoje = new Date();
        hoje.setHours(0,0,0,0);
		return criarBlocos(Acordos.find({aceito:true, feito:{$ne:true}, cancelado:{$ne:true}, vencimento:hoje, $or:[{destinatario:Meteor.userId()}, {remetente:Meteor.userId()}]},{sort: {vencimento: 1}}).fetch());
	};
    
    Template.pendentes.pendentes = function() {
		var acordosPendentes = Acordos.find({feito:{$ne:true}, cancelado:{$ne:true}, aceito:{$ne:true}, $or:[{destinatario:Meteor.userId()}, {remetente:Meteor.userId()}]},{sort: {vencimento: 1}}).fetch(); //acordos que nao foram aceitos/recusados ainda por um dos lados
        var acordos = new Array();
        acordosPendentes.forEach(function (acordo) {
            if((!acordo.recusado) || (acordo.remetente == Meteor.userId())) {
                acordo.outroUsuario = getOutroUsuario(acordo);
                acordo.vencimento = moment((acordo.vencimento).toString()).calendar();
                if(acordo.remetente == Meteor.userId()) acordo.esperandoResposta = true;
                
                acordos.push(acordo);
            }
        });
        return acordos;
	};
    
	Template.atrasado.blocos = function() {
        var hoje = new Date();
        hoje.setHours(0,0,0,0);
        var acordosAtrasados = Acordos.find({aceito:true, feito:{$ne:true}, cancelado:{$ne:true}, vencimento:{$lt:hoje}, $or:[{destinatario:Meteor.userId()}, {remetente:Meteor.userId()}]},{sort: {vencimento: -1}}); //acordos com vencimento anterior a hoje
        return criarBlocos(acordosAtrasados);
    };
    
    Template.historico.blocos = function() {
        var hoje = new Date();
        hoje.setHours(0,0,0,0);
        var acordosAtrasados = Acordos.find({aceito:true, feito:true, $or:[{destinatario:Meteor.userId()}, {remetente:Meteor.userId()}]},{sort: {vencimento: -1}, limit:5}); //acordos antigos ja finalizados
        return criarBlocos(acordosAtrasados);
    };
    
    Template.proximosAcordos.acordos = function() {
		var acordo;
        var acordos = new Array();
        var inicio, fim;
        
        //acordos com vencimento nessa semana
        inicio = moment();
        fim = moment().endOf("week");
        acordo = new Array()
        acordo['periodo'] = "Durante essa semana";
        acordo['blocos'] = criarBlocos(getAcordos(inicio,fim));
        if(acordo['blocos'].length > 0) acordos.push(acordo);
        
        //acordos com vencimento na semana seguinte
        inicio = fim;
        fim = moment(moment(fim).add("days",1)).endOf("week");
        acordo = new Array()
        acordo['periodo'] = "Próxima semana";
        acordo['blocos'] = criarBlocos(getAcordos(inicio,fim));
        if(acordo['blocos'].length > 0) acordos.push(acordo);
        
        //acordos com vencimento nas semanas restantes do mes
        inicio = fim;
        fim = moment(moment(fim).add("days",1)).endOf("month");
        acordo = new Array()
        acordo['periodo'] = "Até o fim do mês";
        acordo['blocos'] = criarBlocos(getAcordos(inicio,fim));
        if(acordo['blocos'].length > 0) acordos.push(acordo);
        
        //acordos com vencimento no proximo mes
        inicio = fim;
        fim = moment(moment(fim).add("days",1)).endOf("month");
        acordo = new Array()
        acordo['periodo'] = "Mês que vem";
        acordo['blocos'] = criarBlocos(getAcordos(inicio,fim));
        if(acordo['blocos'].length > 0) acordos.push(acordo);
        
        //acordos com vencimento no meses seguintes
        inicio = moment(fim).add("days",1);
        fim = 0;
        acordo = new Array()
        acordo['periodo'] = "Próximos meses";
        acordo['blocos'] = criarBlocos(getAcordos(inicio,fim));
        if(acordo['blocos'].length > 0) acordos.push(acordo);
        
        return acordos;
    };
    
    function getAcordos(inicio, fim) {
		inicio.hour(0);
		inicio.minute(0);
		inicio.second(0);
		inicio = inicio.toDate();
        var acordos = new Array();
		if(fim) {
			fim = fim.toDate();
            return Acordos.find({aceito:true, feito:{$ne:true}, cancelado:{$ne:true}, vencimento:{$gt:inicio, $lte:fim}, $or:[{destinatario:Meteor.userId()}, {remetente:Meteor.userId()}]},{sort: {vencimento: 1}}).fetch();
		} else {
			return Acordos.find({aceito:true, feito:{$ne:true}, cancelado:{$ne:true}, vencimento:{$gte:inicio}, $or:[{destinatario:Meteor.userId()}, {remetente:Meteor.userId()}]},{sort: {vencimento: 1}}).fetch();
		}
	}

	function criarBlocos(acordos) {
		var bloco = new Array();
		var blocos = new Array();
		var ultimaData = "";
		var entregasArray = new Array();
		var recebimentosArray = new Array();
        var count = acordos.length;
			
		acordos.forEach(function (acordo) {
            acordo.outroUsuario = getOutroUsuario(acordo);
            
			if((acordo.vencimento).toString() == (ultimaData).toString()) { //mesmo periodo
				if(acordo.responsavel == Meteor.userId())
					entregasArray.push(acordo);
				else
					recebimentosArray.push(acordo);
			} else { //inicia um novo bloco de periodo (ex.: ontem, amanha, sabado, 30/10/2013)
				if(ultimaData != "") { //insere o bloco anterior caso esse nao seja o primeiro
					bloco['entregas'] = entregasArray;
					bloco['recebimentos'] = recebimentosArray;
					blocos.push(bloco);
				}
				//novo bloco
				bloco = new Array();
				entregasArray = new Array();
				recebimentosArray = new Array();
				bloco['data'] = moment((acordo.vencimento).toString()).calendar();
				if(acordo.responsavel == Meteor.userId())
					entregasArray.push(acordo);
				else
					recebimentosArray.push(acordo);
					
			}
			ultimaData = acordo.vencimento;
		});
        //insere o ultimo/unico bloco existente
        if(count > 0) {
            bloco['entregas'] = entregasArray;
            bloco['recebimentos'] = recebimentosArray;
            blocos.push(bloco);
        }
		return blocos;
	}
    
    function getOutroUsuario(acordo) {
        var outroUsuario;
        if(acordo.remetente == Meteor.userId()) {
            try {
                outroUsuario = (Meteor.users.findOne(acordo.destinatario).profile.name).toString();
            } catch(err) {
                outroUsuario = "ERROR1";
            }
        } else {
            try {
                outroUsuario = (Meteor.users.findOne(acordo.remetente).profile.name).toString();
            } catch(err) {
                outroUsuario = "ERROR2";
            }
        }
        
        return outroUsuario;
    } window.getOutroUsuario = getOutroUsuario;
    
    function compromissoFeito(compromisso, feito) {
        Acordos.update(compromisso, {$set: {feito: feito}}, function(error,doc) {
                    if(doc) {
                        if(feito)
                            $.bootstrapGrowl("Compromisso marcado como feito.", { type: 'success' });
                        else
                            $.bootstrapGrowl("Compromisso marcado como NÃO feito.", { type: 'success' });
                        
                    }
                });
    } window.compromissoFeito = compromissoFeito;
    
    function compromissoCancelado(compromisso, cancelado) {
        Acordos.update(compromisso, {$set: {cancelado: cancelado}}, function(error,doc) {
                if(doc) $.bootstrapGrowl("Compromisso cancelado com sucesso.", { type: 'info' });
        });
    } window.compromissoCancelado = compromissoCancelado;
    
    function compromissoAceito(compromisso, aceito) {
        Acordos.update(compromisso, {$set: {aceito: aceito}}, function(error,doc) {
                if(doc) $.bootstrapGrowl("Compromisso aceito.", { type: 'success' });
        });
    } window.compromissoAceito = compromissoAceito;
    
    function compromissoRecusado(compromisso, recusado) {
        Acordos.update(compromisso, {$set: {recusado: recusado}}, function(error,doc) {
                if(doc) $.bootstrapGrowl("Compromisso recusado.", { type: 'info' });
        });
    } window.compromissoRecusado = compromissoRecusado;

}

if (Meteor.isServer) {
//    Acordos.allow({
//      insert: function (userId, doc) {
//          return (userId && ((doc.remetente === userId) || (doc.destinatario === userId)));
//      },
//      update: function (userId, doc, fields, modifier) {
//          return (userId && ((doc.remetente === userId) || (doc.destinatario === userId)));
//      },
//      fetch: ['responsavel']
//    });
//    
    
//    Meteor.publish(function () {
//        return Meteor.users.find({},{fields: {'_id': 1, 'name': 1}});
//    });
//    
//    Meteor.publish("acordos",function () {
//        return Acordos.find({$or:[{destinatario:this.userId}, {remetente:this.userId}]});
//    });
}
