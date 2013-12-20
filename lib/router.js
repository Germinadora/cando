Router.configure({
    autoRender: false,
    layoutTemplate: 'routerLayout'
});

Router.map(function () {
    this.route('home', {
        path: '/'
    }); 
    
    this.route('compromisso', {
        path: '/compromisso',
        
        before: function () {
            Router.go('home');
        }
    });
    
    this.route('compromisso', {
        path: '/compromisso/:_id',
        
        waitOn: function () {
          return [Meteor.subscribe('acordos'), Meteor.subscribe('notas',{acordo_id:this.params._id}), Meteor.subscribe('avisos',{acordo_id:this.params._id})];
        },
        
        data: function () {
            compromisso = Acordos.findOne(this.params._id);
            if (typeof compromisso === 'undefined')
              return null;
          
            if((compromisso.remetente == Meteor.userId()) && (!compromisso.aceito) && (!compromisso.cancelado)) compromisso.esperandoResposta = true;
            compromisso.vencimento = moment((compromisso.vencimento).toString()).calendar();
            compromisso.outroUsuario = getOutroUsuario(compromisso);
            return {compromissoInfo: compromisso};
        }
    });
    
    this.route('novoCompromisso', {
        path: '/criarcompromisso',
        
        waitOn: function () {
          return Meteor.subscribe('users');
        },
        
        data: function() {
            novasTarefas = new Meteor.Collection('novastarefas', {connection: null});
        }
    });
});