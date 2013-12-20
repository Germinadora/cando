    Template.novoCompromisso.tarefas = function() {
        return novasTarefas.find();
    }
    
    Template.novoCompromisso.rendered = function() {
        $( '#frm-add' ).parsley();
        
        $('.editable:not(.editable-click)').editable('destroy').editable({
            success: function(response, newValue) {
                if(newValue.length > 0)
                    novasTarefas.update($(this).attr("data-id"), {$set:{tarefa:newValue}})
                else
                    novasTarefas.remove($(this).attr("data-id"));
        }});
        
        if(!typeof Session.get("fbAmigos") === 'undefined') {
            renderAutoComplete(Session.get("fbAmigos"));
        }
        var usuarioDoo = Meteor.users.findOne(Meteor.userId());
        var token = usuarioDoo.services.facebook.accessToken;
        FB.api('/me/friends?fields=installed,name&access_token='+token, function(response) {
          var amigos = new Array();
          $.each(response.data,function(i, amigo) { 
              amigo.value = amigo.name;
              amigos.push(amigo);
          });
          Session.set("fbAmigos",amigos);
          renderAutoComplete(amigos);
        });
    }
    
    usuarioSelecionado = "";
    function renderAutoComplete(amigos) {
        $( "#frm-para" ).autocomplete({ lookup: amigos, onSelect: function (suggestion) {
            $("#frm-para").attr("data-fbid", suggestion.id);
            var usuarioSelecionado = Meteor.users.findOne({'services.facebook.id':suggestion.id});
            if(usuarioSelecionado) {
                $("#frm-para").attr("data-val", usuarioSelecionado._id);
          
                usuarioSelecionado = Meteor.users.findOne($('#frm-para').attr("data-val"));
                
                if(usuarioSelecionado._id == Meteor.userId())
                    $('#destinatario-pic').fadeOut();
                else
                    $('#destinatario-pic').fadeIn();
                $('#destinatario-pic').attr("src","http://graph.facebook.com/"+usuarioSelecionado.services.facebook.id+"/picture?width=120&height=120");
                $('#destinatario-pic').attr("title", usuarioSelecionado.profile.name);
                $('#destinatario-subtitle').html(usuarioSelecionado.profile.name+" vai entregar");
                selecionarDestinatario();
            } else {
                $.bootstrapGrowl("Usuário não cadastrado no CanDo.", { type: 'warning' });
            }
        } });
    }
    
    function addTarefa() {
        var novaTarefa = $('#frm-requisitos').val();
        if(novaTarefa.length > 0) {
            novasTarefas.insert({tarefa:novaTarefa}, function(error,doc) {
                $('#frm-requisitos').val("");
            });
        }
    }
    
    Template.novoCompromisso.usuarios = function() {
        var usuarios = Meteor.users.find();
        var listaUsuarios = new Array();
        usuarios.forEach(function (usuario) {
            if(usuario._id == Meteor.userId()) {
                usuario.profile.name = "Comigo mesmo";
                usuario.elemesmo = true;
            }
            listaUsuarios.push(usuario);
        });
        return listaUsuarios;
    }
    
    Template.novoCompromisso.usuario = function() {
        return Meteor.user();
    }
    
    function enviarCompromisso() {
    	if($( '#frm-add' ).parsley( 'validate' )) {
			if(typeof Session.get("responsavel") === 'undefined')
				var responsavel = Meteor.userId();
			else
				var responsavel = Session.get("responsavel");
			var vencimento = new Date($('#frm-vencimento').val()+" 00:00:00");
			var requisitos = new Array();
			novasTarefas.find().forEach(function (novaTarefa) {
			  requisitos.push(novaTarefa.tarefa);
			});
			var remetente = Meteor.userId();
			var destinatario = $('#frm-para').attr("data-val");

			// O Destinarios esta em branco, deve ser para ele mesmo
			if (typeof destinatario === 'undefined')
				destinatario = remetente
			
			if(remetente == destinatario)
				aceito = true;
			else
				aceito = false;
		
			Acordos.insert({
				titulo: $('#frm-titulo').val(), 
				vencimento: vencimento, 
				remetente: remetente, 
				destinatario: destinatario, 
				responsavel: responsavel, 
				requisitos: requisitos, 
				obs:$('#frm-obs').val(), 
				aceito: aceito
				}, 
				function(error,doc) {
					if(doc) { 
						$.bootstrapGrowl("Compromisso criado com sucesso.", { type: 'success' });
						Router.go('home');
					}
					else
						$.bootstrapGrowl("Erro ao criar compromisso.", { type: 'error' });
				});
	    }
    }

    function resetarFormularioCompromisso() {
	$('#frm-add').each(function(){
	    this.reset();
	});
	Session.set("responsavel", Meteor.userId());
	$('#usuario-pic').addClass("selected");
	$('#destinatario-pic').removeClass("selected");
	$('#destinatario-pic').fadeOut();
	
	novasTarefas.remove({});
    }
    
    Template.novoCompromisso.events({
        'keypress input#frm-requisitos': function (evt) {
            if (evt.which === 13) {
              event.preventDefault();
              addTarefa();
            }
        },
        
        'click #btn-add-tarefa': function() {
            addTarefa();
        },
        
        'click #btn-enviar': function () {
            event.preventDefault();
            enviarCompromisso();
            resetarFormularioCompromisso();
        },
        'keypress #frm-para': function () {
            if($("#frm-para").val() == "") {
                selecionarUsuario();
            }
        },
        'click #usuario-pic': function() {
            selecionarUsuario()
        },
        'click #destinatario-pic': function() {
            selecionarDestinatario()
        }
    });

function selecionarUsuario() {
    Session.set("responsavel", Meteor.userId());
    $('#usuario-pic').addClass("selected");
    $('#usuario-subtitle').fadeIn();
    $('#destinatario-pic').removeClass("selected");
    $('#destinatario-pic').fadeOut();
    $('#destinatario-subtitle').fadeOut();
}

function selecionarDestinatario() {
    Session.set("responsavel", usuarioSelecionado._id); 
    $('#destinatario-pic').addClass("selected");
    $('#destinatario-subtitle').fadeIn();
    $('#usuario-pic').removeClass("selected");
    $('#usuario-subtitle').fadeOut();
}
