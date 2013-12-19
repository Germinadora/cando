dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
moment.lang('pt-br', {
    calendar : {
        lastDay : '[Ontem]',
        sameDay : '[Hoje]',
        nextDay : '[Amanhã]',
        lastWeek : function(){return 0===this.day()||6===this.day()?"[\xdaltimo] dddd":"[\xdaltima] dddd"},
        nextWeek : function(){return 1===this.date()? 'dddd[, dia 1º]':'dddd[, dia ]'+this.date()},
        sameElse : 'L'
    }
});