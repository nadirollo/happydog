import datetime

from django.db import models


class Customer(models.Model):
    name = models.CharField(max_length=64)
    email = models.CharField(max_length=256, unique=True)
    cellphone = models.IntegerField(unique=True)
    landphone = models.IntegerField(null=True, blank=True, unique=True)
    club_happy = models.BooleanField(default=False)
    # Add function to get next free appointment
    # This should be checked when giving the appointment?

    def __unicode__(self):
        return self.name


class Pet(models.Model):
    HAIR_TYPES = (
        ('short', 'Corto'),
        ('medium', 'Medio'),
        ('long', 'Largo')
    )
    name = models.CharField(max_length=256)
    owners = models.ManyToManyField(Customer)
    breed = models.CharField(max_length=256, null=True, blank=True)
    hair_type = models.CharField(max_length=100, choices=HAIR_TYPES, null=True, blank=True)
    weight = models.IntegerField(null=True, blank=True)
    annotations = models.CharField(max_length=2048, null=True, blank=True)
    birthday = models.DateField(null=True, blank=True)
    birthday_week = models.IntegerField(null=True, blank=True)

    @property
    def long_name(self):
        str_name = self.name
        for o in self.owners.all():
            str_name += " - ({})".format(o.name)
        return str_name

    def __unicode__(self):
        str = self.name
        for o in self.owners.all():
            str += " - ({})".format(o.name)
        return str

    def save(self, *args, **kwargs):
        if self.birthday is not None and self.birthday != '':
            if type(self.birthday) is unicode or type(self.birthday) is str:
                d = datetime.datetime.strptime(self.birthday, "%d/%m/%Y").date()
                week = d.isocalendar()[1]
                self.birthday = d
            else:
                week =  self.birthday.isocalendar()[1]
            self.birthday_week = week
        super(Pet, self).save(*args, **kwargs)


class PetPictures(models.Model):
    url = models.CharField(max_length=1024)
    description = models.CharField(max_length=2048)
    pet = models.ForeignKey(Pet, on_delete=models.DO_NOTHING)

    def __unicode__(self):
        return self.url


class Service(models.Model):
    name = models.CharField(max_length=128)
    price = models.IntegerField()

    def __unicode__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255)
    brand = models.CharField(max_length=255)
    cost = models.FloatField()
    price = models.FloatField()

    def __unicode__(self):
        return "{} - {}".format(self.name + self.brand)


class Appointment(models.Model):
    pet = models.ForeignKey(Pet)
    services = models.ManyToManyField(Service)
    start = models.DateTimeField()
    end = models.DateTimeField()
    notes = models.CharField(max_length=2048)
    paid = models.BooleanField(default=False)
    amount_paid = models.FloatField(default=0)

    def __unicode__(self):
        return "{} ({} - {})".format(self.pet, self.start, self.end)