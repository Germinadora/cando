function divScroll(seletor) {
    $(seletor).animate({scrollTop: $(seletor).prop("scrollHeight")}, 500);
}

function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            (strMatchedDelimiter != strDelimiter)
            ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );

        }


        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
                );

        } else {

            // We found a non-quoted value.
            var strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}

if (Meteor.isClient) {
    window.CSVToArray = CSVToArray;
    window.divScroll = divScroll;
} else {
    Meteor.methods({
        notificarEmail: function (compromisso_id) {
            // Let other method calls from the same client start running,
            // without waiting for the email sending to complete.
            this.unblock();
            
            compromisso = Acordos.findOne(compromisso_id);
            
            remetente = Meteor.users.findOne(compromisso.remetente);
            destinatario = Meteor.users.findOne(compromisso.destinatario);
            
            to = destinatario.services.facebook.email;
            from = remetente.services.facebook.email;
            subject = "CanDo - Novo Compromisso: "+compromisso.titulo;
            text = remetente.profile.name+" criou um novo compromisso com você. Para aceitá-lo ou recusá-lo acesse: "+Meteor.absoluteUrl("compromisso")+"/"+compromisso_id;
            
            sendEmail(to, from, subject, text);
        }
    });
    
    function sendEmail(to, from, subject, text) {
        check([to, from, subject, text], [String]);

        Email.send({
          to: to,
          from: from,
          subject: subject,
          text: text
        });
    }
}