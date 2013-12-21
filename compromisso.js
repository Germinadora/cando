if (Meteor.isClient) {
    Template.blocoNotas.notas = function() {
        return Notas.find({acordo_id:compromisso._id, user_id:Meteor.userId()});
    };
    
    Template.blocoNotas.rendered = function() {
        $('.editable:not(.editable-click)').editable('destroy').editable({
            success: function(response, newValue) {
                if(newValue.length > 0)
                    Notas.update($(this).attr("data-id"), {$set:{nota:newValue}})
                else
                    Notas.remove($(this).attr("data-id"));
        }});
    };
    
    Template.blocoNotas.events ({
       'keypress input#frm-nota': function (evt) {
            if (evt.which === 13) {
              addNota();
            }
        },
        'click #btn-add-nota': function() {
            addNota();
        }
    });
    
    Template.compromissoInfo.avisos = function() {
        var mongoAvisos = Avisos.find({acordo_id:compromisso._id}).fetch();
        var avisos = new Array();
        mongoAvisos.forEach(function (aviso) {
            if(aviso.timestamp) aviso.timestamp = moment(aviso.timestamp).fromNow();
            
            if(aviso.user_id == Meteor.userId())
                aviso.avisoProprio = true;
            else {
                var outroUsuario = new Array();
                outroUsuario.nome = (Meteor.users.findOne(aviso.user_id).profile.name).toString();
                outroUsuario.idFacebook = (Meteor.users.findOne(aviso.user_id).services.facebook.id).toString();
                aviso.outroUsuario = outroUsuario;
            }
            
            avisos.push(aviso)
        });
        
        return avisos;
    };
    
    Template.compromissoInfo.mensagens = function() {
        var mongoMensagens = Mensagens.find({acordo_id:compromisso._id}).fetch();
        var mensagens = new Array();
        mongoMensagens.forEach(function (mensagem) {
            mensagem.timestamp = moment(mensagem.timestamp).fromNow();
            
            if(mensagem.user_id == Meteor.userId())
                mensagem.mensagemPropria = true;

            var usuario = new Array();
            usuario.nome = (Meteor.users.findOne(mensagem.user_id).profile.name).toString();
            usuario.idFacebook = (Meteor.users.findOne(mensagem.user_id).services.facebook.id).toString();
            mensagem.usuario = usuario;
            
            mensagens.push(mensagem)
        });
        
        return mensagens;
    };
    
    Template.compromissoInfo.events ({ 
        'keypress input#frm-aviso': function (evt) {
            if (evt.which === 13) {
              addAviso();
            }
        },
        'click #btn-add-aviso': function() {
            addAviso();
        },
        'keypress input#frm-mensagem': function (evt) {
            if (evt.which === 13) {
              enviarMensagem();
            }
        },
        'click #btn-add-mensagem': function() {
            enviarMensagem();
        }
    });
    
    Template.quadrinho.events ({
        'click .close': function() {
            removerAviso($(this)[0]._id);
        }
    });
    
    function addNota() {
        var nota = $('#frm-nota').val();
            if(nota.length > 0) {
                Notas.insert({acordo_id:compromisso._id, user_id:Meteor.userId(), nota:nota, timestamp:new Date()}, function(error,doc) {
                    $('#frm-nota').val("");
                });
            }
    }
    
    function addAviso() {
        var aviso = $('#frm-aviso').val();
            if(aviso.length > 0) {
                Avisos.insert({acordo_id:compromisso._id, user_id:Meteor.userId(), aviso:aviso, timestamp:new Date()}, function(error,doc) {
                    $('#frm-aviso').val("");
                });
            }
    }
    
    function removerAviso(aviso_id) {
        aviso = Avisos.find(aviso_id).fetch()[0];
        if(aviso.user_id == Meteor.userId()) {
            Avisos.remove(aviso._id);
        } else {
            $.bootstrapGrowl("Somente quem criou o aviso pode deletá-lo.", { type: 'info' });
        }
    }
    
    function enviarMensagem() {
        var mensagem = $('#frm-mensagem').val();
            if(mensagem.length > 0) {
                Mensagens.insert({acordo_id:compromisso._id, user_id:Meteor.userId(), mensagem:mensagem, timestamp:new Date()}, function(error,doc) {
                    $('#frm-mensagem').val("");
                });
            }
    }
}