function loadPetData(pet_pk){
    $('#search_results').html('');
    $.ajax({
        url: location.protocol + "//" + location.host + "/get_pet?pet_pk=" + pet_pk,
        type: "GET",
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

$(document).ready(function() {
    $("#service1").click(function(e){
        $("#services_table").append('<tr><td>'+ $("#service1").text() +'</td><td>'+$("#service1")+'</td></tr>');
    });
    // page is now ready, initialize the calendar...
    $('#calendar').fullCalendar({
        defaultView: 'agendaWeek',
        editable: true,
        minTime: '10:00:00',
        maxTime: '22:00:00',
        allDaySlot: false,
        contentHeight: 525,
        timeFormat: 'H(:mm)',
        titleFormat: 'DD MMMM',
        hiddenDays: [0],
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
            $('#appointment_title').html(calEvent.pet_long_name);
            $('#appointment_time').html(moment(calEvent.start).format('HH:mm') + ' - ' + moment(calEvent.end).format('HH:mm'))
            // TODO: Load appointment services from calEvent
            $('#edit_appointment').modal('show')
        },
        select: function(start, end) {
            var eventData;
            var petsTab = $('#pets_tabs');
            eventData = {
                start: start,
                end: end
            };
            if( petsTab.length){
                var active_pet = petsTab.children('.active').children('a');
                var pet_id;
                var pet_name;
                var pet_longname;
                var pet_info;
                var confirm_pet_appointment_btn = $('#confirm_pet_appointment_btn');
                var confirm_new_pet_appointment_btn = $('#confirm_new_pet_appointment_btn');
                var calendar = $('calendar');

                pet_info = active_pet.prop('id');
                pet_info = pet_info.split('$');
                pet_id = pet_info[3];
                pet_name = pet_info[1];
                pet_longname = pet_info[2];
                confirm_pet_appointment_btn.html('<span class="glyphicon glyphicon-ok" aria-hidden="true"></span> ' + pet_name);
                $('#confirm_pet_appointment_title').html("Cita el " + start.format('dddd, D MMMM') + " con ...");
                calendar.fullCalendar('renderEvent', eventData, true); // stick? = true
                addHidden($('#new_appointment_body_div'));
                confirm_pet_appointment_btn.removeClass('hidden');
                confirm_new_pet_appointment_btn.removeClass('hidden');
                addHidden($('#confirm_appointment_btn'));
                $('#confirm_pet_appointment').modal('show');
                $('#pet_selected').html(pet_id);
                calendar.fullCalendar('unselect');
            }else{
                $('#confirm_pet_appointment').modal('show');
                new_pet_appointment();
            }

        },
    })

});

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


function new_pet_appointment(){
    // Reset the form fields
    resetForm($('#new_pet_appointment_form'));
    addHidden($('#confirm_pet_appointment_btn'));
    addHidden($('#confirm_new_pet_appointment_btn'));
    $('#confirm_appointment_btn').removeClass('hidden');
    $('#new_appointment_body_div').removeClass('hidden');
    //$('#confirm_pet_appointment').animate({"height": "200px"}, 600, "linear");
}

function clear_pet_pk(){
    //alert('clearing pet pk');
}

function clear_owner_pk(){
    //alert('clearing owner pk');
}