function checkPrivKey() {
    if (!$('#_privkey:checked').val())
        return true;
    auth = $('#auth');
    key = $('#privkey');
    p = key.val().replace(/\n/g,'');
    auth.val(p.split('-----')[1].split(' ')[1]);
    key.val(p.split('-----')[2]);
    if (auth.val()!='EC' && auth.val()!='RSA' && auth.val()!='RSA') {
        alert("Invalid key type: " + auth.val());
        return false;
    }
    if (key.val().length < 16) {
        alert("Key is invalid");
        return false;
    }
    if (auth.val()=="EC")
        auth.val("ECDSA");
}

$(function () {
    $('.inputs, .buttons').show();
    $('.sourceadd').click(function(){
        if (!$('#new_name').val()) {
                alert("Enter the input name");
                return false;
        }
        ok = 1;
        $('#input_table tr').each(function(){
                if (this.className == $('#new_name').val()) {
                        alert("This input already exists");
                        ok = 0;
                        return false;
                }
        });
        if (ok)
                $('#ssh_add').submit();
    });
    $('#ssh_form').submit(checkPrivKey);
});
