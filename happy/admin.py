from django.contrib import admin
from .models import *


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
  list_display = ('__unicode__', )
  search_fields = ['first_name', 'last_name']

@admin.register(Pet)
class PetAdmin(admin.ModelAdmin):
  list_display = ('__unicode__', )


@admin.register(PetPictures)
class PetPicturesAdmin(admin.ModelAdmin):
  list_display = ('__unicode__', )


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
  list_display = ('__unicode__', )


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
  list_display = ('__unicode__', )


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
  list_display = ('__unicode__', )

