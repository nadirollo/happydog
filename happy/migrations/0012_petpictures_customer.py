# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-04-17 21:57
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('happy', '0011_auto_20160416_2301'),
    ]

    operations = [
        migrations.AddField(
            model_name='petpictures',
            name='customer',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to='happy.Customer'),
            preserve_default=False,
        ),
    ]