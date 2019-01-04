$(document).ready(function(){

    $("#add").click(function(e){
    event.preventDefault()
    $("#items").append('<div class="field"><i class="fas fa-users"></i><input class="input" type="text" id="users" name="users" required><label for="lastName">User</label><input type="button" value="-" id ="delete"/> </div>');
    });

    $('body').on('click','#delete',function(e){
        $(this).parent('div').remove();
    });
    });
