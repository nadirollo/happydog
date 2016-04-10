from django import template
from django.template.defaultfilters import stringfilter

register = template.Library()


@register.filter(name='first_word')
@stringfilter
def first_word(value):
    return value.split(' ', 1)[0]
