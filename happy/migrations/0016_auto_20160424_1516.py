# -*- coding: utf-8 -*-
# Generated by Django 1.9.4 on 2016-04-24 15:16
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('happy', '0015_auto_20160424_1515'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pet',
            name='size',
            field=models.CharField(blank=True, choices=[(b'small', b'Pequeno'), (b'medium', b'Mediano'), (b'big', b'Grande')], max_length=30, null=True),
        ),
    ]
