
$(document).on('click', '.login_button', function () {
    $.ajax({
        type: 'GET',
        url: 'login',
        success: function (output) {
        $('#modalcontainer').html(output).modal('show');//now its working
        },
        error: function(output){
        alert("fail");
        }
    });
});

$(document).on('click', '.register_button', function () {
    $.ajax({
        type: 'GET',
        url: 'register',
        success: function (output) {
        $('#modalcontainer').html(output).modal('show');//now its working
        },
        error: function(output){
        alert("fail");
        }
    });
});

$(document).on('click', '.account_button', function () {
    $.ajax({
        type: 'GET',
        url: 'account_settings',
        success: function (output) {
        $('#modalcontainer').html(output).modal('show');//now its working
        },
        error: function(output){
        alert("fail");
        }
    });
});

$(document).on('click', '.dashboard-button', function () {
    $.ajax({
        type: 'GET',
        url: 'dashboard',
        success: function (output) {
        $('#modalcontainer').html(output).modal('show');//now its working
        },
        error: function(output){
        alert("fail");
        }
    });
});