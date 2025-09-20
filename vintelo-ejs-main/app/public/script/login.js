if (typeof dadosNotificacao !== 'undefined' && dadosNotificacao) { 
        new Notify({
            status: '<%= dadosNotificacao.tipo %>',
            title: '<%= dadosNotificacao.titulo %>',
            text: '<%= dadosNotificacao.mensagem %>',
            effect: 'fade',
            speed: 300,
            customClass: null,
            customIcon: null,
            showIcon: true,
            showCloseButton: true,
            autoclose: true,
            autotimeout: 3000,
            gap: 20,
            distance: 20,
            type: 1,
            position: 'right top'
        })
     } 
    
     if (typeof listaErros !== 'undefined' && listaErros && listaErros.errors) { 
        listaErros.errors.forEach(function(erro) { 
        new Notify({
            status: 'error',
            title: 'Erro de validação',
            text: '<%= erro.msg %>',
            effect: 'fade',
            speed: 300,
            autoclose: true,
            autotimeout: 4000,
            position: 'right top'
        })
     }); 
     }