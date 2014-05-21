Router.configure({
    autoRender: true,
    layoutTemplate: 'routerLayout'
});

Router.map(function () {
    this.route('home', {
        path: '/'
    }); 
    
    this.route('compromisso', {
        path: '/compromisso',
        
        onBeforeAction: function () {
            Router.go('home');
        }
    });
    
    this.route('compromisso', {
        path: '/compromisso/:_id',
        
        waitOn: function () {
          return [Meteor.subscribe('acordos'), Meteor.subscribe('notas',{acordo_id:this.params._id}), Meteor.subscribe('avisos',{acordo_id:this.params._id}), Meteor.subscribe('mensagens',{acordo_id:this.params._id})];
        },
        
        onBeforeAction: function() {
			compromisso = Acordos.findOne(this.params._id);
		},
        
        data: function () {
            if (typeof compromisso === 'undefined')
              return null;
          
            if((compromisso.remetente == Meteor.userId()) && (!compromisso.aceito) && (!compromisso.cancelado)) compromisso.esperandoResposta = true;
            compromisso.vencimento = moment((compromisso.vencimento).toString()).calendar();
            compromisso.outroUsuario = getOutroUsuario(compromisso);
            if(compromisso.timestamp) compromisso.timestamp = moment(compromisso.timestamp).fromNow();
            return {compromissoInfo: compromisso};
        }
    });
    
    this.route('novoCompromisso', {
        path: '/criarcompromisso',
        
        waitOn: function () {
          return Meteor.subscribe('users');
        },
        
        onBeforeAction: function() {
            novasTarefas = new Meteor.Collection('novastarefas', {connection: null});
        }
    });
});
