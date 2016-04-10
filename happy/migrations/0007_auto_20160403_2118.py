# -*- coding: utf-8 -*-
# Generated by Django 1.9.2 on 2016-04-03 21:18
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('happy', '0006_pet_birthday_week'),
    ]

    operations = [
        migrations.AddField(
            model_name='appointment',
            name='amount_paid',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='appointment',
            name='paid',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='pet',
            name='birthday_week',
            field=models.IntegerField(blank=True, null=True),
        ),
    ]