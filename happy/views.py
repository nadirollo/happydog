from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from .models import Customer, Pet, Appointment, Service
from django.db.models import Q
from datetime import datetime


def index(request):
  context = {
    'services': Service.objects.all().order_by('name')
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
    a['type'] = 'appointment'
    a['title'] = app.pet.name
    a['start'] = app.start
    a['end'] = app.end
    a['description'] = app.notes
    a['pet_id'] = app.pet.pk
    a['pet_long_name'] = app.pet.long_name()
    a['services'] = []
    a['paid'] = app.paid
    a['amount_paid'] = app.amount_paid
    # If its an old appointment and it was not paid, show it in red
    if app.end < datetime.now() and not app.paid:
      a['color'] = '#B40404'
    # If its an old appointment and it was paid, show it in green
    elif app.end < datetime.now() and app.paid:
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
      services = Service.objects.filter(id__in=(services_list))
      app.services = services
      app.save()
    return HttpResponse('Created')
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