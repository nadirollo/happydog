from django.shortcuts import render
from django.http import JsonResponse
from .models import Customer, Pet, Appointment, Service
from django.db.models import Q


def index(request):
    context = {
        'services': Service.objects.all()
    }
    return render(request, 'happy/main.html', context)


def customers(request):
    customers_list = Customer.objects.order_by('last_name')
    context = {
        'customers': customers_list
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
        a['title'] = app.pet.name
        a['start'] = app.start
        a['end'] = app.end
        a['description'] = app.notes
        a['pet_id'] = app.pet.pk
        a['pet_long_name'] = app.pet.long_name()
        a['services'] = {}
        for s in app.services.all():
            a['services'].update({'name': s.name, 'price': s.price})
        apps.append(a)
    return JsonResponse(apps, safe=False)


def get_pets(request):
    q = request.GET.get('q')
    if q is not None:
        pets = Pet.objects.filter(
            Q( name__contains = q) |
            Q( owners__first_name__contains = q)
        ).order_by('name').distinct()[:15]
    context = {
        'pets': pets
    }
    return render(request, 'happy/pets_search_result.html', context)


def get_pet(request):
    pet_pk = request.GET.get('pet_pk')
    pets = []
    owners = []
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
