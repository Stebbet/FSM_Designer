import datetime

from django.shortcuts import render, redirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import login, authenticate, logout
from django.db.models import Q
from rest_framework.parsers import JSONParser
from .forms import SignupForm

#  Model imports
from django.contrib.auth.models import User
from .models import UserInfo, DiagramsModel


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
                messages.error(request, "Invalid Username or Password")
                return redirect('canvas')

        else:
            messages.error(request, "Invalid Username or Password")
            return redirect('canvas')
    else:

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

            try:
                user_info = UserInfo.objects.create(
                    user=User.objects.get(username=account_username),
                    class_id=0,
                    is_teacher=False
                )
                user_info.save()
            except:
                pass

            user = authenticate(username=account_username, password=raw_password)
            login(request, user)
            return redirect('canvas')
        else:
            messages.error(request, "Registration Failed")
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
    """
    logout(request)
    messages.info(request, "You have successfully logged out")
    return redirect('canvas')


@login_required()
def delete_request(request, username):
    """
        View for '/delete/<username>': Deletes a user in the django.contrib.auth user table
        The model will cascade and also delete the user in UserInfo
    :param request:
            The Django-supplied web request that contains information about the current request to see this view
    :param username:
            Username of the user deleting their account
    :return redirect()
            Redirects the user to the canvas page
    """
    try:
        user = User.objects.get(username=username)
        user.delete()
    except Exception as e:
        messages.error(request, f"Failed to delete user: {e}")
    return redirect('canvas')


def account_error(request):
    """
    View for loading the account error modal
    :param request:
    :return:
    """
    return render(request, 'account_error.html', {})


def account_settings(request):
    """
    View for loading the account settings modal
    :param request:
    :return:
    """
    return render(request, 'account_settings.html', {})


def dashboard(request):

    diagrams = []
    featured_diagrams = []

    if request.method == 'GET':
        try:
            user = request.user.pk
            user_info = UserInfo.objects.filter(user_id=user).values()
            user_id = user_info[0]['id']

            d = DiagramsModel.objects.filter(user_id=user_id).values()
            for diagram in d:
                diagrams.append([diagram['title'], diagram['image']])
        except:
            pass


        d = DiagramsModel.objects.filter(user_id=2).values()
        for diagram in d:
            featured_diagrams.append([diagram['title'], diagram['image']])




    return render(request, 'dashboard.html', {'diagrams': diagrams, 'featured_diagrams': featured_diagrams})


@login_required()
def save(request):
    if request.method == 'POST':
        """
        Saving the diagram to the database
        """
        json_data = JSONParser().parse(request)

        user = request.user.pk

        user_info = UserInfo.objects.filter(user_id=user).values()
        user_id = user_info[0]['id']

        print(user)
        title = json_data['title']
        content = json_data['frame']
        image = json_data['image']

        d = datetime.date

        print(title)
        print(content)

        diagram_info = DiagramsModel.objects.create(
            user_id=user_id,
            title=title,
            content=content,
            description="",
            image=image,
            date_created=d,
            date_modified=d,
        )
        diagram_info.save()

        return redirect('canvas')
