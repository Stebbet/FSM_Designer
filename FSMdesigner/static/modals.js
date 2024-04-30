let first = true;
$(document).on('click', '.login_button', function () {
    // Clicking the login button
    $.ajax({
        type: 'GET',
        url: 'login',
        success: function (output) {
            $('#modalcontainer').html(output).modal('show');//now its working
        },
        error: function (output) {
            alert("fail");
        }
    });
});

$(document).on('click', '.register_button', function () {
    // Clicking the register button
    $.ajax({
        type: 'GET',
        url: 'register',
        success: function (output) {
            $('#modalcontainer').html(output).modal('show');//now its working
        },
        error: function (output) {
            alert("fail");
        }
    });
});


$(document).on('click', '.account_button', function () {
    // Clicking the account settings button
    $.ajax({
        type: 'GET',
        url: 'account_settings',
        success: function (output) {
            $('#modalcontainer').html(output).modal('show');//now its working
        },
        error: function (output) {
            alert("fail");
        }
    });
});

$(document).on('click', '.about-btn', function () {
    // Clicking the about page button
    $.ajax({
        type: 'GET',
        url: 'about',
        success: function (output) {
            $('#modalcontainer').html(output).modal('show');//now its working
        },
        error: function (output) {
            alert("fail");
        }
    });
});


function checkLogin() {
    // Function to check if the user has successfully logged in
    if (sessionStorage.getItem('loggingin') !== 'false' && sessionStorage.getItem('loggingin') !== null && document.getElementById('login_failed').value === "true") {
        // The login failed
        $.ajax({
            type: 'GET',
            url: 'login_failed',
            success: function (output) {
                $('#modalcontainer').html(output).modal('show');//now its working
                sessionStorage.setItem('login_failed', 'false');
            },
            error: function (output) {
                alert("fail");
            }
        });
    } else if (sessionStorage.getItem('pass-reset') === 'true') {
        // After the password reset, automatically direct to the login page
        $.ajax({
            type: 'GET',
            url: 'login',
            success: function (output) {
                $('#modalcontainer').html(output).modal('show');//now its working
                sessionStorage.setItem('pass-reset', 'false');
            },
            error: function (output) {
                alert("fail");
            }
        });
    }


}

function checkRegister() {
    // Checking if the user successfully registered
    if (sessionStorage.getItem('loggingin') !== 'false' && sessionStorage.getItem('loggingin') !== null && document.getElementById('register_failed').value === "true") {
        // Registration failed
        $.ajax({
            type: 'GET',
            url: 'register_failed',
            success: function (output) {
                $('#modalcontainer').html(output).modal('show');//now its working
            },
            error: function (output) {
                alert("fail");
            }
        });
    }
}

function updateLogin() {
    // Keeping a record of the machine the user made as a guest before logging in or registering
    sessionStorage.setItem('loggingin', JSON.stringify({'transitions': transitionDict, 'states': stateDict}));
}

let current_file = "";

function toDash() {
    // Clicking the dashboad buttons
    $.ajax({
        type: 'GET',
        url: 'dashboard',
        success: function (output) {
            $('#modalcontainer').html(output).modal('show');//now its working
        },
        error: function (output) {
            alert("fail");
        }
    });
}

$(document).on('click', '.help-btn', function () {
    // Clicking the help button
    $.ajax({
        type: 'GET',
        url: 'help',
        success: function (output) {
            $('#modalcontainer').html(output).modal('show');//now its working
        },
        error: function (output) {
            alert("fail");
        }
    });
});


function save() {
    // Funciton for saving a machine

    // Getting the required data
    let title = document.getElementsByName('diagram-title').item(0).value;
    if (title === "") {
        title = "Untitled";
    }
    let image = layer.toDataURL({
        pixelRatio: 0.2
    })
    let content = {'transitions': transitionDict, 'states': stateDict};
    let json_data = `{"title": "${title}", "content": ${JSON.stringify(content)}, "image": "${image}"}`;

    // Sending a post request with the data
    $.ajax({
        type: 'POST',
        url: 'save/',
        data: json_data,
        success: function (e) {
            // The save was successful
            $.ajax({
                type: 'GET',
                url: 'save_success',
                success: function (output) {
                    $('#modalcontainer').html(output).modal('show');//now its working
                    current_file = title;
                },
                error: function (output) {
                    alert("fail");
                }
            });
        },

        error: function (e) {
            // The save cannot be done as the user is not logged in
            $.ajax({
                type: 'GET',
                url: 'account_error',
                success: function (output) {
                    $('#modalcontainer').html(output).modal('show');//now its working
                },
                error: function (output) {
                    alert("fail");
                }
            });
        }
    });
}

function save_frame() {
    // Function ensuring the user can actually save their machine
    let title = document.getElementsByName('diagram-title').item(0).value;
    if (title === "") {
        title = "Untitled";
    }

    // Get all the users diagrams
    $.ajax({
        type: 'GET',
        url: `get_user_diagrams`,
        success: function (output) {
            // If a user already has a diagram with the title they gave it
            let user_diagrams = JSON.parse(output)['diagrams'];
            if (user_diagrams.includes(title) && title !== current_file) {
                $.ajax({
                    type: 'GET',
                    url: `file_already_exists`,
                    success: function (output) {
                        $('#modalcontainer').html(output).modal('show');
                    },
                    error: function (output) {
                        alert("fail");
                    },
                });
            } else {
                // Otherwise try saving
                save();
            }

        },
        error: function (output) {
            // Cannot save the machine
            $.ajax({
                type: 'GET',
                url: `account_error`,
                success: function (output) {
                    $('#modalcontainer').html(output).modal('show');
                },
                error: function (output) {
                    alert("fail");
                },
            });
        },
    });

}

function privacy_policy() {
    // Get the privacy policy
    $.ajax({
        type: 'GET',
        url: `privacy_policy`,
        success: function (output) {
            $('#modalcontainer').html(output).modal('show');
        },
        error: function (output) {
            alert("fail");
        },
    });
}

function toRegister() {
    // Clicking the register button
    $('#modalcontainer').hide();
    $.ajax({
        type: 'GET',
        url: `register`,
        success: function (output) {
            $('#modalcontainer').html(output).show();
        },
        error: function (output) {
            alert("fail");
        },
    });
}

function load_pass_reset() {
    // Loading the password reset forms
    $.ajax({
        type: 'GET',
        url: `password-reset`,
        success: function (output) {
            $('#modalcontainer').html(output).show();
        },
        error: function (output) {
            alert("fail");
        },
    });
}

function pass_reset_to_login() {
    window.location.href('/');
    $.ajax({
        type: 'GET',
        url: `login`,
        success: function (output) {
            $('#modalcontainer').html(output).show();
        },
        error: function (output) {
            alert("fail");
        },
    });
}

function toLogin() {
    // To the login page
    $('#modalcontainer').hide();
    $.ajax({
        type: 'GET',
        url: `login`,
        success: function (output) {
            $('#modalcontainer').html(output).show();
        },
        error: function (output) {
            alert("fail");
        },
    });
}

function delete_account() {
    // User clicks the delete account button
    $.ajax({
        type: 'POST',
        url: 'delete_account',
        success: function (e) {
            // Successful deletion
            $.ajax({
                type: 'GET',
                url: 'delete_success',
                success: function (output) {
                    window.location.reload();
                    $('#modalcontainer').html(output).modal('show');
                },
                error: function (output) {
                    alert("fail");
                }
            });
        },

        error: function (e) {
            alert('fail');
        }
    });
}

function imports() {
    // Click the import button
    $.ajax({
        type: 'GET',
        url: `imports`,
        success: function (output) {
            $('#modalcontainer').html(output).modal('show');
        },
        error: function (output) {
            alert("fail");
        },
    });
}


$(document).on('click', '#delete-user', function () {
    // After clicking the delete account button
    $.ajax({
        type: 'GET',
        url: `are_you_sure`,
        success: function (output) {
            $('#modalcontainer').html(output).modal('show');
        },
        error: function () {
            alert("fail");
        },
    });
});

let deleting = false;

function deleteDiagram(card) {
    // Function to delete the diagram when a user clicks the button on their dashboard
    $.ajax({
        type: 'POST',
        url: `delete/${card.id}`,
        success: function (e) {
            // Reload the dashboard after a successful deletion
            $.ajax({
                type: 'GET',
                url: 'dashboard',
                success: function (output) {
                    $('#modalcontainer').html(output);
                    deleting = true;
                },
                error: function (output) {
                    alert("fail");
                }
            });
        },

        error: function (e) {
            alert("Failed to Delete");
        }
    });
}

function openMachine(card) {
    // Function to open a machine from the dashboard
    if (!deleting) {
        // Get the diagram data
        $.ajax({
            type: 'GET',
            url: `get_diagram/${card.id}`,
            success: function (output) {
                $(function () {
                    $('#modalcontainer').modal('toggle');
                });
                let o = JSON.parse(output);
                current_file = o['title'];
                clearHistory();

                // Load the machine to the screen
                regenerate(o['content'], o['title']);
                update_history();
            },
            error: function (output) {
                alert("fail");
            }
        });
    }
    deleting = false;


}


$(document).ready(function () {
    function getCookie(c_name) {
        // Function to get a cookie
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = document.cookie.length;
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    }

    $(function () {
        $.ajaxSetup({
            // Get the CSRF token for a successful POST request
            headers: {
                "X-CSRFToken": getCookie("csrftoken")
            }
        });
    });

});

