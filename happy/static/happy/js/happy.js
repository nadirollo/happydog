var delay = (function(){
    var timer = 0;
    return function(callback, ms){
        clearTimeout (timer);
        timer = setTimeout(callback, ms);
    };
})();


// Dynamic search box for main page
$(document).ready(function() {
    $('#search_pet_box').keyup(function () {
        delay(function () {
            q = $('#search_pet_box').val();
            if (q == '') {
                $('#search_results').html('');
            } else {
                $.ajax({
                    url: location.protocol + "//" + location.host + "/get_pets?query=" + q,
                    type: "GET",
                    success: function(data) {
                        $('#search_results').html(data);
                        return true;
                    },
                    error: function(xhr, errmsg, err) {
                        console.log(xhr.status + ": " + xhr.responseText);
                        return false;
                    }
                });
            }
        }, 200);
    });

});


$(document).ready(function(){
    $('#app_search_pet_box').typeahead({
        onSelect: function(item) {
            console.log('aqui1');
            console.log(item);
        },
        ajax: {
            url: location.protocol + "//" + location.host + "/get_pets?type=appointment&limit5",
            timeout: 200,
            triggerLength: 1,
            displayField: 'model',
            method: 'get',
            preProcess: function (data) {
                if (data.success === false) {
                    // Hide the list, there was some error
                    return false;
                }
                // We good!
                return JSON.parse( data );
            }
        }
    });
});

//// Dynamic search box for pet appointment
//$(document).ready(function() {
//    var app_search_results = $('#app_pet_search_results');
//    var app_search_box = $('#app_search_pet_box');
//
//    app_search_box.keyup(function () {
//        delay(function () {
//            q = app_search_box.val();
//            if (q == '') {
//                app_search_results.html('');
//            } else {
//                $.ajax({
//                    url: location.protocol + "//" + location.host + "/get_pets?limit=5&type=appointment&q=" + q,
//                    type: "GET",
//                    success: function(data) {
//                        app_search_results.removeClass('hidden');
//                        app_search_results.html(data);
//                        return true;
//                    },
//                    error: function(xhr, errmsg, err) {
//                        console.log(xhr.status + ": " + xhr.responseText);
//                        return false;
//                    }
//                });
//            }
//        }, 200);
//    });
//
//});

//$(document).ready(function(){
//    $('#app_search_pet_box').blur(
//        function() {
//            addHidden($('#app_pet_search_results'));
//        }
//    );
//});


// Dynamic search box for owner appointment
$(document).ready(function() {
    $('#app_search_owner_box').keyup(function () {
        delay(function () {
            q = $('#app_search_owner_box').val();
            if (q == '') {
                $('#app_owner_search_results').html('');
            } else {
                $.ajax({
                    url: location.protocol + "//" + location.host + "/get_pets?limit=5&q=" + q,
                    type: "GET",
                    success: function(data) {
                        $('#app_owner_search_results').html(data);
                        return true;
                    },
                    error: function(xhr, errmsg, err) {
                        console.log(xhr.status + ": " + xhr.responseText);
                        return false;
                    }
                });
            }
        }, 200);
    });

});

$(document).ready(function(){
    $('#app_search_owner_box').blur(
        function() {
            addHidden($('#app_owner_search_results'));
        }
    );
});

// Dynamic search box for cellphone
$(document).ready(function() {
    $('#app_search_phone_box').keyup(function () {
        delay(function () {
            q = $('#app_search_phone_box').val();
            if (q == '') {
                $('#app_phone_search_results').html('');
            } else {
                $.ajax({
                    url: location.protocol + "//" + location.host + "/get_phones?limit=5&q=" + q,
                    type: "GET",
                    success: function(data) {
                        $('#app_phone_search_results').html(data);
                        return true;
                    },
                    error: function(xhr, errmsg, err) {
                        console.log(xhr.status + ": " + xhr.responseText);
                        return false;
                    }
                });
            }
        }, 200);
    });

});

$(document).ready(function(){
    $('#app_search_phone_box').blur(
        function() {
            $('#app_phone_search_results').html('');
        }
    );
});




$(document).ready(function() {
    $('#calendar').fullCalendar({
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
        eventDrop: function(event, delta, revertFunc) {
            alert(event.title + " was dropped on " + event.start.format());
            if (!confirm("Are you sure about this change?")) {
                revertFunc();
            }
        },
        event: function(event, delta, revertResize) {
            alert(event.title + " end is now " + event.end.format());
            if (!confirm("is this ok?")) {
                revertFunc();
            }
        },
        eventClick: function(calEvent, jsEvent, view) {
            if(calEvent.type == 'birthday'){
                var bdays_row = $('#birthdays_row');
                bdays_row.html('');
                var html_content = '';
                // TODO: Change url for s3 image
                // TODO: Add link to pet details
                calEvent.pets.forEach(function(entry){
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
            }else{
                resetServices();
                var services_table_body = $('#services_table tbody');
                var new_appointment_div = $('#new_appointment_div');
                $('#pet_appointment_modal_title').html(calEvent.title + " - " + calEvent.start.format('dddd, D MMMM HH:mm'));
                $('#appointment_title').html(calEvent.pet_long_name);
                $('#appointment_time').html(moment(calEvent.start).format('HH:mm') + ' - ' + moment(calEvent.end).format('HH:mm'));
                $.each(calEvent.services, function(i, service) {
                    services_table_body.append('<tr id="srv_' + service.id + '"><td class="service-id" data-service-id="' + service.id + '">' + service.name + '</td><td class="service-price">' + service.price + '</td><td><a class="alert-danger" onclick="deleteService(' + service.id + ')"><span class="glyphicon glyphicon-minus-sign" style="cursor: pointer;"></span></a></td></tr>');
                });
                new_appointment_div.data('app_id', calEvent.id);
                calculateTotal();
                if(calEvent.paid){
                    hideAllAppointmentButtons();
                    if($('#total_price').text() != calEvent.amount_paid){
                        $('#total_paid').append("<br>Total Cobrado: " + calEvent.amount_paid + "€")
                    }
                }else{
                    $('#total_paid').html('');
                    showEditAppointmentButtons();
                }
                $('#pet_appointment_modal').modal('show');
            }
        },
        select: function(start, end) {
            // Only allow creation of events in the hourly cal
            if(start.hasTime()){
                var petsTab = $('#pets_tabs');
                resetServices();
                resetForm($('#new_pet_appointment_form'));
                $('#pet_appointment_modal_title').html("Cita el " + start.format('dddd, D MMMM HH:mm') + " con ...");
                if( petsTab.length){
                    var pet_id;
                    var pet_name;
                    var pet_longname;
                    var pet_info;
                    var confirm_pet_appointment_btn = $('#confirm_pet_appointment_btn');
                    var confirm_new_pet_appointment_btn = $('#confirm_new_pet_appointment_btn');
                    var calendar = $('calendar');

                    pet_info = getSelectedPetInfo();

                    pet_id = pet_info[3];
                    pet_name = pet_info[1];
                    pet_longname = pet_info[2];
                    confirm_pet_appointment_btn.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ' + pet_name);
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
                }else{
                    showNewAppointment();
                    $('#pet_appointment_modal').modal('show');
                }

            }
        }
    })
});


function loadPetData(pet_id){
    $('#pets_birthday_modal').modal('hide');
    $('#search_results').html('');
    $.ajax({
        url: location.protocol + "//" + location.host + "/get_pet",
        type: "GET",
        data: { pet_pk: pet_id },
        success: function(data) {
            $('#search_results').html('');
            $('#pet_info').html(data);
            return true;
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
            return false;
        }
    });
}

function loadAppPetData(pet_id){
    console.log(pet_id);
    $('#app_pet_search_results').html('');
    $.ajax({
        url: location.protocol + "//" + location.host + "/get_pet",
        type: "GET",
        data: { pet_pk: pet_id },
        success: function(data) {
            console.log('TODO!');
            return true;
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
            return false;
        }
    });
}

function getSelectedPetInfo(){
    var petsTab = $('#pets_tabs');
    var active_pet = petsTab.children('.active').children('a');
    var pet_info;
    pet_info = active_pet.prop('id');
    pet_info = pet_info.split('$');
    return pet_info;
}

function addHidden($element){
    if(!$element.hasClass("hidden")){
        $element.addClass("hidden");
    }
}

function resetForm($form) {
    $form.find('input:text, input:password, input:file, select, textarea').val('');
    $form.find('input:radio, input:checkbox')
        .removeAttr('checked').removeAttr('selected');
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
    $('#services_dropdown').removeClass('hidden');
    $('#products_dropdown').removeClass('hidden');
    $('#new_appointment_div').removeClass('hidden');
    $('#confirm_new_pet_appointment_btn').removeClass('hidden');
    $('#confirm_pet_appointment_btn').removeClass('hidden');
}

function showEditAppointmentButtons() {
    addHidden($('#confirm_pet_appointment_btn'));
    addHidden($('#confirm_new_pet_appointment_btn'));
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
    addHidden($('#confirm_new_pet_appointment_btn'));
    addHidden($('#new_appointment_div'));
    addHidden($('#save_appointment_btn'));
    addHidden($('#pay_btn'));
    addHidden($('#remove_app_btn'));
    addHidden($('#services_dropdown'));
    addHidden($('#products_dropdown'));
    $('#close_appointment_modal').removeClass('hidden');

}

function showNewAppointment(){
    showNewAppointmentButtons();
    addHidden($('#confirm_pet_appointment_btn'));
    resetForm($('#new_pet_appointment_form'));
    $('#app_pet_search_results').html('');
    $('#app_owner_search_results').html('');
    $('#app_img').attr('src', '');
    //TODO: clear attributes with pet/owner info
    $('#new_appointment_div').removeClass('hidden');
}



function confirmSelectedPetAppointment(){
    var cpa_btn = $('#confirm_pet_appointment_btn');
    var pet_id = cpa_btn.data('pet_id');
    var start_date = cpa_btn.data('start_date');
    var end_date = cpa_btn.data('end_date');
    var pet_longname = cpa_btn.data('pet_longname');
    var pet_name = cpa_btn.data('pet_name');
    var service_ids = [];
    $('.service-id').each(function() {
        service_ids.push($(this).data('service-id'));
    });

    $.ajax({
        url: location.protocol + "//" + location.host + "/create_appointment",
        type: "GET",
        data: {
            pet_pk: pet_id,
            start: start_date.format(),
            end: end_date.format(),
            services: service_ids.join(',')
        },
        success: function(data) {
            $('#calendar').fullCalendar('refetchEvents');
            return true;
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
            return false;
        }
    });
    $('#pet_appointment_modal').modal('toggle');
}

function updateAppointment(obj){
    var service_ids = [];
    var app_id = $('#new_appointment_div').data('app_id');
    $('.service-id').each(function() {
        service_ids.push($(this).data('service-id'));
    });
    $.ajax({
        url: location.protocol + "//" + location.host + "/update_appointment",
        type: "GET",
        data: { app_pk: app_id, service_pks: service_ids.join(',') },
        success: function(data) {
            $('#calendar').fullCalendar('refetchEvents');
            $('#save_appointment_btn').prop('disabled', true);
            $('#pay_btn').prop('disabled', false);
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
            return false;
        }
    });

}

function removeAppointment(){
    var new_appointment_div = $('#new_appointment_div');
    var app_id = new_appointment_div.data('app_id');
    $.ajax({
        url: location.protocol + "//" + location.host + "/delete_appointment",
        type: "GET",
        data: { app_pk: app_id },
        success: function(data) {
            $('#calendar').fullCalendar('removeEvents', app_id);
            $('#pet_appointment_modal').modal('hide');
            $('#confirm_delete_appointment_modal').modal('hide');
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
            return false;
        }
    });
}

function updateServices(obj){
    $('#services_table tbody').append('<tr id="srv_' + obj.dataset.serviceId + '"><td class="service-id" data-service-id="' + obj.dataset.serviceId  + '">' + obj.dataset.serviceName + '</td><td class="service-price">' + obj.dataset.servicePrice + '</td><td><a class="alert-danger" onclick="deleteService(' + obj.dataset.serviceId + ')" style="cursor: pointer;"><span class="glyphicon glyphicon-minus-sign"></span></a></td></tr>');
    $('#save_appointment_btn').prop('disabled', false);
    $('#pay_btn').prop('disabled', true);
    calculateTotal();
}

function deleteService(srv_id){
    $('#srv_'+srv_id).remove();
    $('#save_appointment_btn').prop('disabled', false);
    $('#pay_btn').prop('disabled', true);
    calculateTotal();
}

function calculateTotal(){
    var sum = 0;
    $('.service-price').each(function() {

        var value = $(this).text();
        if(!isNaN(value) && value.length != 0) {
            sum += parseFloat(value);
        }
    });
    $('#total_price').html(sum);
}

function showPayment(){
    $('#payment_input').val($('#total_price').text());
    $('#confirm_payment_modal').modal('show');
}

function payAppointment(){
    var app_id = $('#new_appointment_div').data('app_id');
    var total_paid = $('#payment_input').val();
    $.ajax({
        url: location.protocol + "//" + location.host + "/pay_appointment",
        type: "GET",
        data: { app_pk: app_id, total_paid: total_paid },
        success: function(data) {
            $('#calendar').fullCalendar('refetchEvents');
            $('#pet_appointment_modal').modal('hide');
            $('#confirm_payment_modal').modal('hide');
        },
        error: function(xhr, errmsg, err) {
            console.log(xhr.status + ": " + xhr.responseText);
            return false;
        }
    });
}

function clearPetPK(){
    //alert('clearing pet pk');
}

function clearOwnerPK(){
    //alert('clearing owner pk');
}
