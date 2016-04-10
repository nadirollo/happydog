"""happydog URL Configuration
"""
from django.conf.urls import url
from django.contrib import admin
from happy import views

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^inicio$', views.index),
    url(r'^clientes$', views.customers),
    url(r'^get_appointments$', views.get_appointments),
    url(r'^get_pets$', views.get_pets),
    url(r'^get_pet$', views.get_pet),
    url(r'^create_appointment$', views.create_appointment),
    url(r'^delete_appointment$', views.delete_appointment),
    url(r'^update_appointment$', views.update_appointment),
    url(r'^pay_appointment', views.pay_appointment),
    url(r'^create_appointment_new_pet_owner', views.create_appointment_new_pet_owner),
]
