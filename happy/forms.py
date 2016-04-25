from django import forms

class PetForm(forms.form):
    name = forms.CharField(label='Nombre del Peludo')