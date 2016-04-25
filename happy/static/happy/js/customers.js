$.fn.editable.defaults.mode = 'inline';
$.fn.editable.defaults.ajaxOptions = {type: "GET"};
$(document).ready(function() {
    $('.xeditable-pet').editable({
        placement: 'right',
        defaultValue: 'Vacio',
        success: processPetUpdates
    });

    $('.xeditable-pet-required').editable({
        placement: 'right',
        defaultValue: 'Vacio',
        validate: function(value) {
            if($.trim(value) == '') {
                return 'Campo obligatorio';
            }
        },
        success: processPetUpdates
    });

    $('.xeditable-pet-breed').editable({
        placement: 'right',
        defaultValue: 'Vacio',
        success: processPetUpdates,
        sourceCache: true,
        source: '/get_breeds'
    });

    $('.xeditable-pet-size').editable({
        placement: 'right',
        defaultValue: 'Vacio',
        success: processPetUpdates,
        sourceCache: true,
        source: '/get_sizes'
    });

    $('.xeditable-pet-hair').editable({
        placement: 'right',
        defaultValue: 'Vacio',
        success: processPetUpdates,
        sourceCache: true,
        source: '/get_hairs'
    });


    $('.xeditable-owner').editable({
        placement: 'right',
        defaultValue: 'Vacio',
        success: processOwnerUpdates
    });

    $('.xeditable-owner-required').editable({
        placement: 'right',
        defaultValue: 'Vacio',
        validate: function(value) {
            if($.trim(value) == '') {
                return 'Campo obligatorio';
            }
        },
        success: processOwnerUpdates
    });
});

function processPetUpdates(data, config){
    // update row if name or breed
    // update tab if name
    if('name' in data){
        console.log('Update tab + row');
    }else if('breed' in data){
        console.log('Update row');
    }
    console.log(data);
    console.log(config);
}

function processOwnerUpdates(data, config){
    // update row if name or breed
    // update tab if name
    if('name' in data){
        console.log('Update tab + row');
    }else if('breed' in data){
        console.log('Update row');
    }
    console.log(data);
    console.log(config);
}

function resetForm($form) {
    $form.find('input:text, input:password, input:file, select, textarea').val('');
    $form.find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');
}

function cleanNewPetTab(owner_id){
    resetForm($('#new_pet_'+owner_id+'_form'));
    console.log('cleaned')
}

function createNewPet(owner_id){
    var data = {
        owner_id: owner_id
    };
    var inputs = [{'input': '#pet_tab_name_input_'+owner_id, 'field': 'name'},
        {'input': '#pet_tab_breed_input_'+owner_id, 'field': 'breed_id'},
        {'input': '#pet_tab_bday_input_'+owner_id, 'field': 'bday'},
        {'input': '#pet_tab_desc_input_'+owner_id, 'field': 'desc'},
        {'input': '#pet_tab_hair_input_'+owner_id, 'field': 'hair'},
        {'input': '#pet_tab_size_input_'+owner_id, 'field': 'size'}];
    inputs.forEach(function(entry){
        console.log(entry['input'] + ': ' +$(entry['input']).val());
        if($(entry['input']).val() != null && $(entry['input']).val() != ''){
            data[entry['field']] = $(entry['input']).val();
        }
    });
    $.ajax({
        url: location.protocol + "//" + location.host + "/create_pet",
        type: "GET",
        data: data,
        success: function (data) {
            console.log('fuck yeah');
            return true;
        },
        error: function (xhr, errmsg, err) {
            var rdata = JSON.parse(xhr.responseText);
            console.log(xhr.status + ": " + xhr.responseText);
            console.log(rdata);
            $('#pet_tab_errors_'+owner_id).html(rdata);
            return false;
        }
    });
}

