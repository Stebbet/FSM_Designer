from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, authenticate, logout
from .forms import SignupForm


def canvas(request):
    return render(request, 'canvas.html', {})


def login_request(request):
    """
    View for '/login': Logs a user in to the website if they have an account
    :param request:
            The Django-supplied web request that contains information about the current request to see this view
    :return render()
            Redirects the user to '/' where they will be able to see the spot of the day
    @author: Sam Tebbet
    """
    # Checks if the user is on a desktop instead of mobile and if
    # so renders the QR code page

    # Checks if user is logged in and if they are the user sent back to the home page
    if request.user.is_authenticated:
        return redirect('canvas')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('canvas')
            else:
                messages.error(request, "Invalid username or password")
        else:
            messages.error(request, "Invalid username or password")
    form = AuthenticationForm()
    return render(request, 'login.html', {"login_form": form})


def register(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            form.save()
            account_username = form.cleaned_data.get('username')
            account_email = form.cleaned_data.get('email')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=account_username, password=raw_password)
            login(request, user)
            return redirect('canvas')
    else:
        form = SignupForm()
    return render(request, 'register.html', {"register_form": form})


@login_required()
def logout_request(request):
    """
    View for '/logout': Logs the user out of the website
    :param request:
            The Django-supplied web request that contains information about the current request to see this view
    :return render()
            Redirects the user to '/' where they will be able to see the spot of the day
    @author: Sam Tebbet
    """
    logout(request)
    messages.info(request, "You have successfully logged out")
    return redirect('canvas')


def account_error(request):
    return render(request, 'account_error.html', {})


def account_settings(request):
    return render(request, 'account_settings.html', {})


def dashboard(request):
    return render(request, 'dashboard.html', {})
