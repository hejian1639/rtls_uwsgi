# -*- coding: utf-8 -*-

#from django.http import HttpResponse
from django.shortcuts import render

def index(request):
    	context= {}
    	context['hello'] = 'Hello Django!'
    	return render(request, 'index.html', context)
