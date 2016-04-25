from django.shortcuts import render
from django.http import JsonResponse, HttpResponse, HttpResponseNotFound
from models import Customer, Pet, Appointment, Service, PetBreed
from django.db.models import Q
from datetime import datetime
from django.db import IntegrityError


def index(request):
    context = {
        'services': Service.objects.all().order_by('name')
    }
    return render(request, 'happy/main.html', context)


def customers(request):
    customers_list = Customer.objects.select_related().order_by('name')
    breed_list = PetBreed.objects.all().order_by('name')
    context = {
        'customers': customers_list,
        'breeds': breed_list,
        'hair_types': Pet.HAIR_TYPES,
        'pet_sizes': Pet.PET_SIZES
    }
    return render(request, 'happy/customers.html', context)


def get_appointments(request):
    start = request.GET.get('start', '')
    end = request.GET.get('end', '')
    # TODO: Implement a serializer
    appointments = Appointment.objects.filter(start__range=[start, end])
    apps = []
    for app in appointments:
        a = {}
        a['id'] = app.pk
        a['type'] = 'appointment'
        a['title'] = app.pet.name
        a['start'] = app.start
        a['end'] = app.end
        a['description'] = app.notes
        a['pet_id'] = app.pet.pk
        a['pet_long_name'] = app.pet.long_name
        a['services'] = []
        a['paid'] = app.paid
        a['amount_paid'] = app.amount_paid
        # If its an old appointment and it was not paid, show it in red
        if app.end < datetime.now() and not app.paid:
            a['color'] = '#B40404'
        # If its an old appointment and it was paid, show it in green
        elif app.paid:
            a['color'] = '#298A08'
        for s in app.services.all():
            a['services'].append({'id': s.id, 'name': s.name, 'price': s.price})
        apps.append(a)
    start = datetime.strptime(start, '%Y-%m-%d').date()
    birthday_pets = Pet.objects.filter(birthday_week=start.isocalendar()[1])
    bdays = {}
    for pet in birthday_pets:
        day = str(datetime.now().year) + pet.birthday.strftime('-%m-%d')
        p = {}
        p['years'] = datetime.now().year - pet.birthday.year
        p['name'] = pet.name
        p['id'] = pet.id
        if day in bdays:
            bdays[day]['pets'].append(p)
            # Only add first 3 pets in the allday event title
            if len(bdays[day]['pets']) <= 2:
                bdays[day]['title'] += '\n' + pet.name
            elif len(bdays[day]['pets']) == 3:
                bdays[day]['title'] += '\n ...'
        else:
            bdays[day] = {}
            bdays[day]['start'] = day
            bdays[day]['end'] = day
            bdays[day]['pets'] = []
            bdays[day]['pets'].append(p)
            bdays[day]['type'] = 'birthday'
            bdays[day]['title'] = pet.name
    for b, app in bdays.iteritems():
        apps.append(app)
    return JsonResponse(apps, safe=False)


def get_pets(request):
    type = request.GET.get('type', 'main')
    limit = request.GET.get('limit', 15)
    q = request.GET.get('query')
    if q is not None:
        pets = Pet.objects.filter(
            Q(name__contains=q) |
            Q(owners__name__contains=q) |
            Q(owners__cellphone__contains=q) |
            Q(owners__email__contains=q)
        ).order_by('name').distinct()[:limit]
        context = {
            'pets': pets
        }
    else:
        return HttpResponseNotFound('Unknown Search Type')
    # TODO: Serialize the returning objects
    # TODO: Return the same serialized objects always and let JS (typeahead+handlebars) to do the magic
    if type == 'main':
        return render(request, 'happy/pets_search_result.html', context)
    elif type == 'appointment':
        l = []
        for p in pets:
            for a in p.appointment_set.all():
                print(a)
            l.append({
                'pet_long_name': p.long_name,
                'pet_name': p.name,
                'pet_id': p.id,
                'pet_birthday': p.birthday.strftime('%d/%m/%Y'),
                'pet_breed': p.breed,
                'pet_description': p.annotations,
                'owner_name': p.owners.first().name,
                'owner_id': p.owners.first().id,
                'owner_phone': p.owners.first().cellphone,
                'owner_email': p.owners.first().email,
                'owner_club_happy': p.owners.first().club_happy
            })
        return JsonResponse(l, safe=False)
    else:
        return HttpResponseNotFound('Unknown Search Type')


def get_pet(request):
    pet_pk = request.GET.get('pet_pk')
    if pet_pk is not None:
        pet = Pet.objects.get(pk=pet_pk)
        owners = pet.owners.all()
        pets = Pet.objects.filter(
            Q(owners__in=owners)
        ).distinct()
        appointments = Appointment.objects.filter(
            Q(pet__in=pets)
        ).order_by('-start')
        context = {
            'selected_pet_pk': pet.pk,
            'pets': pets,
            'owners': owners,
            'last_appointments': appointments
        }
        return render(request, 'happy/pet_info.html', context)
    return HttpResponseNotFound()


def get_phones(request):
    limit = request.GET.get('limit', 15)
    q = request.GET.get('q')
    if q is not None:
        pets = Pet.objects.filter(
            Q(owners__cellphone__contains=q) |
            Q(owners__landphone__contains=q)
        ).order_by('name').distinct()[:limit]
        context = {
            'pets': pets
        }
        return render(request, 'happy/phone_search_result.html', context)
    return HttpResponse('Nothing to search')


def create_appointment(request):
    try:
        pet = Pet.objects.get(id=request.GET.get('pet_pk'))
        start = request.GET.get('start')
        end = request.GET.get('end')
        services_list = request.GET.get('services')
        app = Appointment()
        app.pet = pet
        app.start = start
        app.end = end
        app.save()
        if services_list is not None and services_list != '':
            services_list = services_list.split(',')
            services = Service.objects.filter(id__in=services_list)
            app.services = services
            app.save()
        return JsonResponse({'pet_id': pet.id})
    except Exception as e:
        return HttpResponse(e.message, status=500)


def delete_appointment(request):
    try:
        appointment = Appointment.objects.get(id=request.GET.get('app_pk'))
        appointment.delete()
        return HttpResponse('Deleted')
    except Exception as e:
        return HttpResponse(e.message, status=500)


def update_appointment(request):
    try:
        appointment = Appointment.objects.get(id=request.GET.get('app_pk'))
        services_list = request.GET.get('service_pks').split(',')
        services = Service.objects.filter(id__in=(services_list))
        appointment.services = services
        appointment.save()
        return HttpResponse('Updated')
    except Exception as e:
        return HttpResponse(e.message, status=500)


def pay_appointment(request):
    try:
        appointment = Appointment.objects.get(id=request.GET.get('app_pk'))
        appointment.paid = True
        appointment.amount_paid = request.GET.get('total_paid')
        appointment.save()
        return HttpResponse('Paid')
    except Exception as e:
        return HttpResponse(e.message, status=500)


def create_appointment_new_pet_owner(request):
    try:
        owner_id = request.GET.get('owner_id', False)
        owner_email = request.GET.get('owner_email')
        owner_phone = request.GET.get('owner_phone')
        if owner_id:
            owner = Customer.objects.get(id=owner_id)
        else:
            owner = Customer()
        owner.name = request.GET.get('owner_name')
        owner.email = owner_email
        owner.cellphone = owner_phone
        owner.club_happy = request.GET.get('owner_club_happy')
        owner.save()

        pet_id = request.GET.get('pet_id', False)
        if pet_id:
            pet = Pet.objects.get(id=pet_id)
        else:
            pet = Pet()
        pet.name = request.GET.get('pet_name')
        pet.breed = request.GET.get('pet_breed', None)
        pet.birthday = request.GET.get('pet_bday', None)
        pet.annotations = request.GET.get('pet_desc', None)
        pet.save()
        pet.owners.add(owner)
        pet.save()
        start = request.GET.get('start_date')
        end = request.GET.get('end_date')
        services_list = request.GET.get('services')
        app = Appointment()
        app.pet = pet
        app.start = start
        app.end = end
        app.save()
        if services_list is not None and services_list != '':
            services_list = services_list.split(',')
            services = Service.objects.filter(id__in=services_list)
            app.services = services
            app.save()
        return JsonResponse({'pet_id': pet.id})
    except IntegrityError as e:
        msg = {'msg': 'Integrity Error'}
        try:
            conflict_email_owner = Customer.objects.get(email=owner_email)
            msg['email_conflict'] = owner_email
            msg['email_conflict_owner'] = conflict_email_owner.name
        except Customer.DoesNotExist:
            pass
        try:
            conflict_phone_owner = Customer.objects.get(cellphone=owner_phone)
            msg['phone_conflict'] = owner_phone
            msg['phone_conflict_owner'] = conflict_phone_owner.name
        except Customer.DoesNotExist:
            pass
        return JsonResponse(msg, status=400)
    except Exception as e:
        return HttpResponse(e.message, status=500)


def create_pet(request):
    try:
        owner_id = request.GET.get('owner_id')
        owner = Customer.objects.get(id=owner_id)
        pet = Pet()
        pet.name = request.GET.get('name')
        breed_id = request.GET.get('breed_id', None)
        if breed_id:
            pet.breed = PetBreed.objects.get(id=breed_id)
        pet.birthday = request.GET.get('bday', None)
        pet.annotations = request.GET.get('desc', None)
        pet.hair_type = request.GET.get('hair', None)
        pet.size = request.GET.get('size', None)
        pet.save()
        pet.owners.add(owner)
        pet.save()
        return JsonResponse({'pet_id': pet.id})
    except Exception as e:
        return HttpResponse(e.message, status=500)


def update_pet(request):
    try:
        pet_id = request.GET.get('pk')
        pet = Pet.objects.get(id=pet_id)
        field = request.GET.get('name')
        value = request.GET.get('value')
        if field in pet._meta.get_all_field_names():
            if field == 'breed':
                breed = PetBreed.objects.get(id=value)
                setattr(pet, field, breed)
            else:
                setattr(pet, field, value)
        else:
            return HttpResponse('Field does not exist on model', status=500)
        pet.save()
        return JsonResponse({'pet_id': pet.id, 'field': field, 'value': value})
    except Exception as e:
        return HttpResponse(e.message, status=500)


def get_breeds(request):
    breeds = PetBreed.objects.all().order_by('name')
    breed_list = []
    for b in breeds:
        breed_list.append({b.id: b.name})
    return JsonResponse(breed_list, safe=False)


def get_sizes(request):
    size_list = []
    for s in Pet.PET_SIZES:
        size_list.append({s[0]: s[1]})
    return JsonResponse(size_list, safe=False)


def get_hair_types(request):
    hair_list = []
    for h in Pet.HAIR_TYPES:
        hair_list.append({h[0]: h[1]})
    return JsonResponse(hair_list, safe=False)
