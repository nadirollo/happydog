var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();


// Dynamic search box for main page
$(document).ready(function () {
    $('#search_pet_input').keyup(function () {
        delay(function () {
            q = $('#search_pet_input').val();
            if (q == '') {
                $('#search_results').html('');
            } else {
                $.ajax({
                    url: location.protocol + "//" + location.host + "/get_pets?query=" + q,
                    type: "GET",
                    success: function (data) {
                        $('#search_results').html(data);
                        return true;
                    },
                    error: function (xhr, errmsg, err) {
                        console.log(xhr.status + ": " + xhr.responseText);
                        return false;
                    }
                });
            }
        }, 200);
    });

});



$(document).ready(function (){
    var app_pet_search_input = $('#app_pet_search_input');
    var app_search_owner_input = $('#app_search_owner_input');
    var app_search_phone_input = $('#app_search_phone_input');
    var app_search_email_input = $('#app_search_email_input');

    var pets_engine = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('pet_name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        remote: {
            wildcard: '%QUERY',
            url: '/get_pets?type=appointment&query=%QUERY',
            transform: function(response) {
                return $.map(response, function(pet) {
                    return {
                        pet_name: pet.pet_name,
                        pet_long_name: pet.pet_long_name,
                        pet_id: pet.pet_id,
                        pet_breed: pet.pet_breed,
                        pet_birthday: pet.pet_birthday,
                        pet_description: pet.pet_description,
                        owner_id: pet.owner_id,
                        owner_name: pet.owner_name,
                        owner_phone: pet.owner_phone,
                        owner_email: pet.owner_email,
                        owner_club_happy: pet.owner_club_happy,
                        owner_display_name: pet.owner_name + ' - ' + pet.pet_name,
                        owner_phone_display: pet.owner_phone + ' - ' + pet.owner_name,
                        owner_email_display: pet.owner_email + ' - ' + pet.owner_name
                    }
                });
            }
        }
    });
    // Search pet on new appointments
    app_pet_search_input.typeahead({
            hint: false,
            highlight: true,
            minLength: 1,
            cancelButton: true,
            classNames: {
                input: ''
            }
        },
        {
            display: 'pet_name',
            name: 'Pets',
            source: pets_engine,
            templates: {
                suggestion: Handlebars.compile('<div>{{pet_long_name}}</div>')
            }
        });

    app_pet_search_input.bind('typeahead:select',function(ev, suggestion) {
        pets_engine.clear();
        setPetDataNewAppointment(suggestion);
        checkConfirmNewAppointmentValues();

    });
    app_pet_search_input.bind('typeahead:change',function() {
        checkConfirmNewAppointmentValues();
    });

    // Search owner on new appointments
    app_search_owner_input.typeahead({
            hint: false,
            highlight: true,
            minLength: 1,
            classNames: {
                input: ''
            }
        },
        {
            display: 'owner_name',
            name: 'Pets',
            source: pets_engine,
            templates: {
                suggestion: Handlebars.compile('<div>{{owner_display_name}}</div>')
            }
        });

    app_search_owner_input.bind('typeahead:select',function(ev, suggestion) {
        pets_engine.clear();
        setPetDataNewAppointment(suggestion);
        checkConfirmNewAppointmentValues();
    });

    app_search_owner_input.bind('typeahead:change',function() {
        checkConfirmNewAppointmentValues();
    });

    // Search on phone
    app_search_phone_input.typeahead({
            hint: false,
            highlight: true,
            minLength: 1,
            cancelButton: true,
            classNames: {
                input: ''
            }
        },
        {
            display: 'owner_phone_display',
            name: 'Phones',
            source: pets_engine,
            templates: {
                suggestion: Handlebars.compile('<div>{{owner_phone_display}}</div>')
            }
        });

    app_search_phone_input.bind('typeahead:select',function(ev, suggestion) {
        pets_engine.clear();
        setOwnerDataNewAppointment(suggestion);
        checkConfirmNewAppointmentValues();

    });
    app_search_phone_input.bind('typeahead:change',function() {
        checkConfirmNewAppointmentValues();
    });

    // Search on email
    app_search_email_input.typeahead({
            hint: false,
            highlight: true,
            minLength: 1,
            cancelButton: true,
            classNames: {
                input: ''
            }
        },
        {
            display: 'owner_email_display',
            name: 'Phones',
            source: pets_engine,
            templates: {
                suggestion: Handlebars.compile('<div>{{owner_email_display}}</div>')
            }
        });

    app_search_email_input.bind('typeahead:select',function(ev, suggestion) {
        pets_engine.clear();
        setOwnerDataNewAppointment(suggestion);
        checkConfirmNewAppointmentValues();

    });
    app_search_email_input.bind('typeahead:change',function() {
        checkConfirmNewAppointmentValues();
    });

});

$(document).ready(function () {
    $('#calendar').fullCalendar({
        slotDuration: '00:30:00',
        slotLabelFormat: 'hh:mm',
        defaultView: 'agendaWeek',
        editable: true,
        minTime: '10:00:00',
        maxTime: '22:00:00',
        allDayText: 'ada',
        allDaySlot: true,
        contentHeight: 575,
        timeFormat: 'H(:mm)',
        titleFormat: 'DD MMMM',
        hiddenDays: [],
        columnFormat: 'dddd D',
        selectable: true,
        selectHelper: true,
        events: {
            url: 'get_appointments'
        },
        eventDrop: function (event, delta, revertFunc) {
            alert(event.title + " was dropped on " + event.start.format());
            if (!confirm("Are you sure about this change?")) {
                revertFunc();
            }
        },
        event: function (event, delta, revertResize) {
            alert(event.title + " end is now " + event.end.format());
            if (!confirm("is this ok?")) {
                revertFunc();
            }
        },
        eventClick: function (calEvent, jsEvent, view) {
            if (calEvent.type == 'birthday') {
                var bdays_row = $('#birthdays_row');
                bdays_row.html('');
                var html_content = '';
                // TODO: Change url for s3 image
                // TODO: Add link to pet details
                calEvent.pets.forEach(function (entry) {
                    //TODO: Replace S3 image
                    html_content = "<div class='col-sm-2 col-md-2'> \
                                        <div class='thumbnail'> \
                                          <img onclick='loadPetData(" + entry.id + ")' style='cursor: pointer;' class='img-rounded' src='/static/happy/img/tux.jpg'/> \
                                          <div class='caption text-center'> \
                                            <h3>" + entry.name + "</h3> \
                                            <p>" + entry.years + " años</p> \
                                          </div> \
                                        </div> \
                                      </div>";
                    bdays_row.append(html_content);
                });
                $('#pets_birthday_modal').modal('show');
            } else {
                resetServices();
                loadPetData(calEvent.pet_id);
                $('#total_paid').html('');
                addHidden($('#conflict_panel'));
                var services_table_body = $('#services_table tbody');
                var new_appointment_div = $('#new_appointment_div');
                $('#pet_appointment_modal_title').html(calEvent.title + " - " + calEvent.start.format('dddd, D MMMM HH:mm'));
                $('#appointment_title').html(calEvent.pet_long_name);
                $('#appointment_time').html(moment(calEvent.start).format('HH:mm') + ' - ' + moment(calEvent.end).format('HH:mm'));
                $.each(calEvent.services, function (i, service) {
                    services_table_body.append('<tr id="srv_' + service.id + '"><td class="service-id" data-service-id="' + service.id + '">' + service.name + '</td><td class="service-price">' + service.price + '</td><td><a class="alert-danger" onclick="deleteService(' + service.id + ')"><span class="glyphicon glyphicon-minus-sign" style="cursor: pointer;"></span></a></td></tr>');
                });
                new_appointment_div.data('app_id', calEvent.id);
                calculateTotal();
                if (calEvent.paid) {
                    hideAllAppointmentButtons();
                    if ($('#total_price').text() != calEvent.amount_paid) {
                        $('#total_paid').append("<br>Total Cobrado: " + calEvent.amount_paid + "€")
                    }
                } else {
                    showEditAppointmentButtons();
                }
                $('#pet_appointment_modal').modal('show');
            }
        },
        select: function (start, end) {
            // Only allow creation of events in the hourly cal
            if (start.hasTime()) {
                var petsTab = $('#pets_tabs');
                resetServices();
                resetForm($('#new_pet_appointment_form'));
                $('#total_paid').html('');
                addHidden($('#conflict_panel'));
                $('#pet_appointment_modal_title').html("Cita el " + start.format('dddd, D MMMM HH:mm') + " con ...");
                if (petsTab.length) {
                    var pet_id;
                    var pet_name;
                    var pet_longname;
                    var pet_info;
                    var confirm_pet_appointment_btn = $('#confirm_pet_appointment_btn');
                    var calendar = $('calendar');

                    pet_info = getSelectedPetInfo();

                    pet_id = pet_info[3];
                    pet_name = pet_info[1];
                    pet_longname = pet_info[2];
                    confirm_pet_appointment_btn.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> Cita con ' + pet_name);
                    confirm_pet_appointment_btn.data('pet_id', pet_id);
                    confirm_pet_appointment_btn.data('pet_name', pet_name);
                    confirm_pet_appointment_btn.data('pet_longname', pet_longname);
                    confirm_pet_appointment_btn.data('start_date', start);
                    confirm_pet_appointment_btn.data('end_date', end);

                    showNewAppointmentButtons();
                    addHidden($('#new_appointment_div'));
                    $('#pet_appointment_modal').modal('show');
                    $('#pet_selected').html(pet_id);
                    calendar.fullCalendar('unselect');
                } else {
                    showNewAppointment();
                    $('#pet_appointment_modal').modal('show');
                    $('#confirm_pet_appointment_btn').data('start_date', start);
                    $('#confirm_pet_appointment_btn').data('end_date', end);
                }

            }
        }
    })
});


function loadPetData(pet_id) {
    $('#pets_birthday_modal').modal('hide');
    $('#search_results').html('');
    $.ajax({
        url: location.protocol + "//" + location.host + "/get_pet",
        type: "GET",
        data: {pet_pk: pet_id},
        success: function (data) {
            $('#search_results').html('');
            $('#pet_info').html(data);
            return true;
        },
        error: function (xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
            return false;
        }
    });
}

function getSelectedPetInfo() {
    var petsTab = $('#pets_tabs');
    var active_pet = petsTab.children('.active').children('a');
    var pet_info;
    pet_info = active_pet.prop('id');
    pet_info = pet_info.split('$');
    return pet_info;
}

function addHidden($element) {
    if (!$element.hasClass("hidden")) {
        $element.addClass("hidden");
    }
}

function resetForm($form) {
    $form.find('input:text, input:password, input:file, select, textarea').val('');
    $form.find('input:radio, input:checkbox').removeAttr('checked').removeAttr('selected');
}

function resetServices() {
    $('#services_table tbody').empty();
    $('#total_price').html('0');
}

function showNewAppointmentButtons() {
    addHidden($('#save_appointment_btn'));
    addHidden($('#pay_btn'));
    addHidden($('#remove_app_btn'));
    addHidden($('#close_appointment_modal'));
    addHidden($('#confirm_new_pet_appointment_btn'));
    $('#confirm_new_pet_appointment_btn').removeData();
    $('#services_dropdown').removeClass('hidden');
    $('#products_dropdown').removeClass('hidden');
    $('#new_appointment_div').removeClass('hidden');
    $('#confirm_pet_appointment_btn').removeClass('hidden');
    $('#show_new_pet_appointment_btn').removeClass('hidden');
}

function showEditAppointmentButtons() {
    addHidden($('#confirm_pet_appointment_btn'));
    addHidden($('#show_new_pet_appointment_btn'));
    addHidden($('#confirm_new_pet_appointment_btn'));
    $('#confirm_new_pet_appointment_btn').removeData();
    addHidden($('#new_appointment_div'));
    addHidden($('#close_appointment_modal'));
    $('#services_dropdown').removeClass('hidden');
    $('#products_dropdown').removeClass('hidden');
    $('#save_appointment_btn').removeClass('hidden');
    $('#save_appointment_btn').prop('disabled', true);
    $('#pay_btn').prop('disabled', false);
    $('#pay_btn').removeClass('hidden');
    $('#remove_app_btn').removeClass('hidden');
}

function hideAllAppointmentButtons() {
    addHidden($('#confirm_pet_appointment_btn'));
    addHidden($('#show_new_pet_appointment_btn'));
    addHidden($('#new_appointment_div'));
    addHidden($('#save_appointment_btn'));
    addHidden($('#pay_btn'));
    addHidden($('#remove_app_btn'));
    addHidden($('#services_dropdown'));
    addHidden($('#products_dropdown'));
    addHidden($('#confirm_new_pet_appointment_btn'));
    $('#confirm_new_pet_appointment_btn').removeData();
    $('#close_appointment_modal').removeClass('hidden');

}

function showNewAppointment() {
    showNewAppointmentButtons();
    $("#pet_birthday_input").datepicker("setDate", new Date());
    addHidden($('#show_new_pet_appointment_btn'));
    addHidden($('#confirm_pet_appointment_btn'));
    resetForm($('#new_pet_appointment_form'));
    $('#app_pet_search_results').html('');
    $('#app_owner_search_results').html('');
    $('#app_img').attr('src', '');
    $('#new_appointment_div').removeClass('hidden');
    $('#confirm_new_pet_appointment_btn').removeClass('hidden');
    $('#confirm_new_pet_appointment_btn').prop('disabled', true);
    $('#confirm_new_pet_appointment_btn').removeData();
}


function confirmSelectedPetAppointment() {
    var cpa_btn = $('#confirm_pet_appointment_btn');
    var pet_id = cpa_btn.data('pet_id');
    var start_date = cpa_btn.data('start_date');
    var end_date = cpa_btn.data('end_date');
    var pet_longname = cpa_btn.data('pet_longname');
    var pet_name = cpa_btn.data('pet_name');
    var service_ids = [];
    $('.service-id').each(function () {
        service_ids.push($(this).data('service-id'));
    });

    var appointment_data = {
        pet_pk: pet_id,
        start: start_date.format(),
        end: end_date.format(),
        services: service_ids.join(',')
    };
    $.ajax({
        url: location.protocol + "//" + location.host + "/create_appointment",
        type: "GET",
        data: appointment_data,
        success: function (data) {
            loadPetData(data['pet_id']);
            $('#calendar').fullCalendar('refetchEvents');
            addHidden($('#conflict_panel'));
            $('#pet_appointment_modal').modal('hide');
            return true;
        },
        error: function (xhr, errmsg, err) {
            $('#conflict_panel_text').html(xhr.status + ": " + xhr.responseText);
            $('#conflict_panel').removeClass('hidden');
            console.log(xhr.status + ": " + xhr.responseText);
            return false;
        }
    });
}

function confirmNewPetAppointment(){
    var pet_info = $('#confirm_new_pet_appointment_btn').data('pet_info');
    var owner_info = $('#confirm_new_pet_appointment_btn').data('owner_info');
    var data = {
        owner_name: $('#app_search_owner_input').val(),
        owner_email: $('#app_search_email_input').val(),
        owner_phone: $('#app_search_phone_input').val(),
        owner_club_happy: $('#app_is_club_happy').prop('checked'),
        pet_name: $('#app_pet_search_input').val(),
        pet_breed: $('#pet_breed_input').val(),
        pet_bday: $('#pet_birthday_input').val(),
        pet_desc: $('#pet_description_input').val()
    };
    if(owner_info !== undefined && owner_info.owner_name == $('#app_search_owner_input').val()){
        data['owner_id'] = owner_info.owner_id;
    }
    if(pet_info !== undefined && pet_info.pet_name == $('#app_pet_search_input').val()) {
        data['pet_id'] = pet_info.pet_id;
    }
    var service_ids = [];
    $('.service-id').each(function () {
        service_ids.push($(this).data('service-id'));
    });
    data['start_date'] = $('#confirm_pet_appointment_btn').data('start_date').format();
    data['end_date'] = $('#confirm_pet_appointment_btn').data('end_date').format();
    data['services'] = service_ids.join(',');
    $.ajax({
        url: location.protocol + "//" + location.host + "/create_appointment_new_pet_owner",
        type: "GET",
        data: data,
        success: function (data) {
            $('#pet_appointment_modal').modal('hide');
            $('#calendar').fullCalendar('refetchEvents');
            loadPetData(data['pet_id']);
            return true;
        },
        error: function (xhr, errmsg, err) {
            var rdata = JSON.parse(xhr.responseText);
            var msg = '';
            if('email_conflict' in rdata){
                msg += "El email <strong>" + rdata.email_conflict +"</strong> pertenece a <strong>" + rdata.email_conflict_owner + "</strong>";
            }
            if('phone_conflict' in rdata){
                msg += "</br>El telefono <strong>" + rdata.phone_conflict + "</strong> pertenece a <strong>" + rdata.phone_conflict_owner  + "</strong>";
            }
            $('#conflict_panel_text').html(msg);
            console.log(xhr.status + ": " + xhr.responseText);
            console.log(rdata);
            $('#conflict_panel').show();
            $('#conflict_panel').removeClass('hidden');
            return false;
        }
    });
}

function updateOwner(owner_data){
    $.ajax({
        url: location.protocol + "//" + location.host + "/update_owner",
        type: "GET",
        data: owner_data,
        success: function (data) {
            var rdata = JSON.parse(xhr.responseText);
            addHidden($('#conflict_panel'));
            return rdata.owner_id;
        },
        error: function (xhr, errmsg, err) {
            var rdata = JSON.parse(xhr.responseText);
            var msg = '';
            if('email_conflict' in rdata){
                msg += "El email <strong>" + rdata.email_conflict +"</strong> pertenece a <strong>" + rdata.email_conflict_owner + "</strong>";
            }
            if('phone_conflict' in rdata){
                msg += "</br>El telefono <strong>" + rdata.phone_conflict + "</strong> pertenece a <strong>" + rdata.phone_conflict_owner  + "</strong>";
            }
            $('#conflict_panel_text').html(msg);
            console.log(xhr.status + ": " + xhr.responseText);
            console.log(rdata);
            $('#conflict_panel').show();
            $('#conflict_panel').removeClass('hidden');
            return false;
        }
    });
}

function updatePet(pet_data){
    $.ajax({
        url: location.protocol + "//" + location.host + "/update_pet",
        type: "GET",
        data: pet_data,
        success: function (data) {
            var rdata = JSON.parse(xhr.responseText);
            addHidden($('#conflict_panel'));
            return rdata.pet_id;
        },
        error: function (xhr, errmsg, err) {
            var rdata = JSON.parse(xhr.responseText);
            $('#conflict_panel_text').html(rdata);
            console.log(xhr.status + ": " + xhr.responseText);
            console.log(rdata);
            $('#conflict_panel').removeClass('hidden');
            return false;
        }
    });
}

function updateAppointment(obj) {
    var service_ids = [];
    var app_id = $('#new_appointment_div').data('app_id');
    $('.service-id').each(function () {
        service_ids.push($(this).data('service-id'));
    });
    $.ajax({
        url: location.protocol + "//" + location.host + "/update_appointment",
        type: "GET",
        data: {app_pk: app_id, service_pks: service_ids.join(',')},
        success: function (data) {
            $('#calendar').fullCalendar('refetchEvents');
            $('#save_appointment_btn').prop('disabled', true);
            $('#pay_btn').prop('disabled', false);
        },
        error: function (xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
            return false;
        }
    });

}

function removeAppointment() {
    var new_appointment_div = $('#new_appointment_div');
    var app_id = new_appointment_div.data('app_id');
    $.ajax({
        url: location.protocol + "//" + location.host + "/delete_appointment",
        type: "GET",
        data: {app_pk: app_id},
        success: function (data) {
            $('#calendar').fullCalendar('removeEvents', app_id);
            $('#pet_appointment_modal').modal('hide');
            $('#confirm_delete_appointment_modal').modal('hide');
        },
        error: function (xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
            return false;
        }
    });
}

function updateServices(obj) {
    $('#services_table tbody').append('<tr id="srv_' + obj.dataset.serviceId + '"><td class="service-id" data-service-id="' + obj.dataset.serviceId + '">' + obj.dataset.serviceName + '</td><td class="service-price">' + obj.dataset.servicePrice + '</td><td><a class="alert-danger" onclick="deleteService(' + obj.dataset.serviceId + ')" style="cursor: pointer;"><span class="glyphicon glyphicon-minus-sign"></span></a></td></tr>');
    $('#save_appointment_btn').prop('disabled', false);
    $('#pay_btn').prop('disabled', true);
    calculateTotal();
}

function deleteService(srv_id) {
    $('#srv_' + srv_id).remove();
    $('#save_appointment_btn').prop('disabled', false);
    $('#pay_btn').prop('disabled', true);
    calculateTotal();
}

function calculateTotal() {
    var sum = 0;
    $('.service-price').each(function () {

        var value = $(this).text();
        if (!isNaN(value) && value.length != 0) {
            sum += parseFloat(value);
        }
    });
    $('#total_price').html(sum);
}

function showPayment() {
    $('#payment_input').val($('#total_price').text());
    $('#confirm_payment_modal').modal('show');
}

function payAppointment() {
    var app_id = $('#new_appointment_div').data('app_id');
    var total_paid = $('#payment_input').val();
    $.ajax({
        url: location.protocol + "//" + location.host + "/pay_appointment",
        type: "GET",
        data: {app_pk: app_id, total_paid: total_paid},
        success: function (data) {
            $('#calendar').fullCalendar('refetchEvents');
            $('#pet_appointment_modal').modal('hide');
            $('#confirm_payment_modal').modal('hide');
        },
        error: function (xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
            return false;
        }
    });
}

function clearPetPK() {
    //alert('clearing pet pk');
}

function clearOwnerPK() {
    //alert('clearing owner pk');
}

function setPetDataNewAppointment(obj){
    $('#confirm_new_pet_appointment_btn').data('pet_info', obj);
    $('#app_pet_search_input').val(obj.pet_name);
    $('#pet_breed_input').val(obj.pet_breed);
    $('#pet_birthday_input').datepicker('update', obj.pet_birthday);
    $('#pet_description_input').val(obj.pet_description);
    setOwnerDataNewAppointment(obj);
}

function setOwnerDataNewAppointment(obj){
    $('#confirm_new_pet_appointment_btn').data('owner_info', obj);
    $('#app_search_owner_input').val(obj.owner_name);
    $('#app_search_email_input').val(obj.owner_email);
    $('#app_search_phone_input').val(obj.owner_phone);
    $('#app_is_club_happy').prop('checked', obj.owner_club_happy);
}

function checkConfirmNewAppointmentValues() {
    if ($('#app_pet_search_input').val() && $('#app_search_owner_input').val() && $('#app_search_phone_input').val()) {
        $('#confirm_new_pet_appointment_btn').prop('disabled', false);
    } else {
        $('#confirm_new_pet_appointment_btn').prop('disabled', true);
    }
}