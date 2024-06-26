import datetime

from django.shortcuts import render, redirect, HttpResponse, HttpResponseRedirect
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login, authenticate, logout
from rest_framework.parsers import JSONParser
from .forms import SignupForm

#  Model imports
from django.contrib.auth.models import User
from .models import UserInfo, DiagramsModel
import json


def canvas(request):
    """
    View for canvas
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: render of the template
    """
    return render(request, 'canvas.html', {})


def login_request(request):
    """
    View for '/login': Logs a user in to the website if they have an account
    :param request:
            The Django-supplied web request that contains information about the current request to see this view
    :return render()
            Redirects the user to '/' where they will be able to save their machine
    """

    if request.user.is_authenticated:
        return redirect('canvas')

    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')

            # Login the user
            user = authenticate(username=username, password=password)
            login(request, user)

            request.session['register_failed'] = "false"
            request.session['login_failed'] = "false"
            return redirect('canvas')
        else:
            messages.error(request, 'LoginFailed')
            request.session['register_failed'] = "false"
            request.session['login_failed'] = "true"
            return redirect('canvas')  # Redirect user to the canvas
    else:
        # On a GET Request return the login form
        form = AuthenticationForm()
        return render(request, 'login.html', {"login_form": form})


def register(request):
    """
    View for '/register': Registers a user in to the website, creating an acocunt
    :param request:
            The Django-supplied web request that contains information about the current request to see this view
    :return render()
            Redirects the user to '/' where they will be able to save their machine
    """
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
            request.session['login_failed'] = "false"
            request.session['register_failed'] = "false"
            return redirect('canvas')
        else:
            messages.error(request, 'RegisterFailed')
            request.session['login_failed'] = "false"
            request.session['register_failed'] = "true"
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
    :return redirect()
            Redirects the user to '/' where they will be able to see the spot of the day
    """

    logout(request)
    messages.info(request, "You have successfully logged out")
    return redirect('canvas')


@login_required()
def delete_account(request):
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
        user = request.user.pk
        logout(request)

        user = User.objects.get(id=user)
        user_info = UserInfo.objects.get(user_id=user.id)
        diagram_info = DiagramsModel.objects.filter(user_id=user_info.id)

        diagram_info.delete()
        user_info.delete()
        user.delete()


    except Exception as e:
        messages.error(request, f"Failed to delete user: {e}")

    return redirect('canvas')


def account_error(request):
    """
    View for loading the account error modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: renders the template
    """
    return render(request, 'account_error.html', {})


def save_success(request):
    """
    View for loading the account error modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: renders the template
    """
    return render(request, 'save_success.html', {})


def account_settings(request):
    """
    View for loading the account settings modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: renders the template
    """
    return render(request, 'account_settings.html', {})


def file_already_exists(request):
    """
    View for loading the account settings modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: renders the template
    """
    return render(request, 'file_already_exists.html', {})


def dashboard(request):
    """
    View for loading the dashboard modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: renders the template
    """
    diagrams = []

    if request.method == 'GET':
        try:
            user = request.user.pk
            user_info = UserInfo.objects.filter(user_id=user).values()
            user_id = user_info[0]['id']

            d = DiagramsModel.objects.filter(user_id=user_id).values()
            for diagram in d:
                diagrams.append([diagram['title'], diagram['image'], diagram['id']])
        except:
            pass

    return render(request, 'dashboard.html', {'diagrams': diagrams})


@login_required()
def save(request):
    """
    View for saving the diagrams to the database
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: HttpResponse code 202
    """
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
        content = json_data['content']
        image = json_data['image']
        d = datetime.date

        diagrams = []
        all_diagrams = DiagramsModel.objects.filter(user_id=user_id).values()
        for diagram in all_diagrams:
            diagrams.append(diagram['title'])

        if title in diagrams:
            # Update an existing diagram
            current = DiagramsModel.objects.get(user_id=user_id, title=title)
            current.content = content
            current.image = image
            current.save()
        else:
            # Create a new diagram
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

        return HttpResponse("Saved Successfully", status=202)


@login_required()
def get_diagram(request, diagram):
    """
    View function for getting diagram information from the database
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :param diagram: The diaram id in the database
    :return: HttpResonse 200, 404, or 500 status code
    """
    if request.user.is_authenticated:
        if request.method == 'GET':
            try:
                try:
                    diagram = DiagramsModel.objects.get(id=diagram)
                except:
                    return HttpResponse("Diagram does not exist", status=404)
                return HttpResponse(content=json.dumps({'content': diagram.content, 'title': diagram.title}),
                                    status=200)
            except:
                return HttpResponse("Internal server error", status=500)


def get_user_diagrams(request):
    """
    View function for getting all the diagrams for the user from the database
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: HttpResonse 200, or 500 status codes
    """
    diagrams = []
    if request.user.is_authenticated:
        if request.method == 'GET':
            try:
                user = request.user.pk
                user_info = UserInfo.objects.filter(user_id=user).values()
                user_id = user_info[0]['id']

                d = DiagramsModel.objects.filter(user_id=user_id).values()
                for diagram in d:
                    diagrams.append(diagram['title'])

                return HttpResponse(content=json.dumps({'diagrams': diagrams}), status=200)
            except:
                return HttpResponse("Internal server error", status=500)
        else:
            return HttpResponse("")


@login_required()
def delete(request, diagram):
    """
    View function for deleting a diagram
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :param diagram: The diagram id to delete from the database
    :return: HttpResponse 404, 204, or 500 status codes
    """
    if request.user.is_authenticated:
        if request.method == 'POST':
            try:
                diagram_info = DiagramsModel.objects.filter(id=diagram)
            except:
                return HttpResponse("Diagram does not exist", status=404)

            try:
                diagram_info.delete()
                return HttpResponse("Deleted Successfully", status=204)
            except:
                return HttpResponse("Delete Unsuccessful", status=500)


def imports(request):
    """
    View for loading the account settings modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: render of the template
    """
    return render(request, 'imports.html', {})


def accept_import(request):
    """
    View for accepting the imports
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: redirect to the canvas
    """
    if request.method == 'POST':
        try:
            file = request.FILES["file-import"].read()
            request.session['load_file'] = str(file)
            return redirect('canvas')
        except:
            return redirect('canvas')


def help(request):
    """
    View for help page modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: render of the template
    """
    return render(request, 'help.html', {})


def about(request):
    """
    View for about page modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: render of the template
    """
    return render(request, 'about.html', {})


def privacy_policy(request):
    """
    View for privacy policy modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: render of the template
    """
    return render(request, 'privacy_policy.html', {})


def login_failed(request):
    """
    View for the login failed modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: render of the template with the AuthenticationForm
    """
    return render(request, 'login_failed.html', {"login_form": AuthenticationForm()})


def register_failed(request):
    """
    View for register failed modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: render of the template with the SignupForm
    """
    return render(request, 'register_failed.html', {"register_form": SignupForm()})


def are_you_sure(request):
    """
    View for are you sure modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: render of the template
    """
    return render(request, 'are_you_sure.html', {})


def delete_success(request):
    """
    View for the delete success modal
    :param request: The Django-supplied web request that contains information about the current request to see this view
    :return: render of the template
    """
    return render(request, 'delete_success.html', {})
