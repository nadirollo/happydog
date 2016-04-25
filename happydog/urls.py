"""happydog URL Configuration
"""
from django.conf.urls import url
from django.contrib import admin
from happy import views

urlpatterns = [
    url(r'^admin/', admin.site.urls, name='admin'),
    url(r'^inicio$', views.index, name='main'),
    url(r'^clientes$', views.customers, name='customers'),
    url(r'^get_appointments$', views.get_appointments),
    url(r'^get_pets$', views.get_pets),
    url(r'^get_pet$', views.get_pet),
    url(r'^create_appointment$', views.create_appointment),
    url(r'^delete_appointment$', views.delete_appointment),
    url(r'^update_appointment$', views.update_appointment),
    url(r'^pay_appointment', views.pay_appointment),
    url(r'^create_appointment_new_pet_owner', views.create_appointment_new_pet_owner),
    url(r'^create_pet', views.create_pet),
    url(r'^update_pet', views.update_pet),
    url(r'^get_breeds', views.get_breeds),
    url(r'^get_hairs', views.get_hair_types),
    url(r'^get_sizes', views.get_sizes),
]
