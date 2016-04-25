import datetime

from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()


@register.filter(name='first_word')
@stringfilter
def first_word(value):
    return value.split(' ', 1)[0]


@register.filter(name='col_width')
def col_width(value, total):
    return int(total)/int(value)


@register.filter(name='years_passed')
def years_passed(value):
    from dateutil.relativedelta import relativedelta
    return relativedelta(datetime.datetime.now(), value).years
