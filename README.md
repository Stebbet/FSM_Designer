# Finite State Machine Designer and Simulator

### Access the site at [statemachine.live](https://www.statemachine.live)


Alternatively, this README will guide you through the process of setting up and running the application.


## Table of Contents
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Migration](#database-migration)
- [Running the Application](#running-the-application)
- [Additional Commands](#additional-commands)
- [Troubleshooting](#troubleshooting)
- [Contact](#contact)

## Prerequisites

Before running the application, make sure you have the following installed:

- Python (version 3.6 or higher)
- Django (version 4.0 or higher)
- Virtual environment manager (e.g., virtualenv or conda)

## Installation

1. **Clone the repository**:
   ```shell
   git clone https://github.com/Stebbet/FSM_Designer.git
   cd FSM_Designer
   ```
   __not ```cd FSM_Designer/FSM_Designer```__ 
2. **Create a virtual environment**:
   ```shell
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - On Windows:
     ```shell
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```shell
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```shell
   pip install -r requirements.txt
   ```

## Configuration

1. **Configure the application**:
   - Rename the provided `.env.example` file to `.env`.
   - Update the configuration parameters in the `.env` file such as database credentials, secret key, debug mode, and other settings as needed.

2. **Configure Django settings**:
   - Ensure the settings in `settings.py` or your custom settings file are set up according to your application requirements.

3. **Apply database migrations**:
   ```shell
   python manage.py makemigrations
   python manage.py migrate
   ```
4. **Collect the static files**
     ```shell
    python manage.py collectstatic
    ```

## Running the Application

1. **Start the Django development server**:
   ```shell
   python manage.py runserver
   ```

2. The application should now be running at `http://127.0.0.1:8000/`.

## Additional Commands

- **Create a superuser**:
  ```shell
  python manage.py createsuperuser
  ```
- **Run unit tests**:
  ```shell
  python manage.py test
  ```

## Troubleshooting

- If you encounter any issues, check the Django error messages for more information.
- Ensure your environment variables in the `.env` file are correctly set up.
- Confirm your database is running and accessible.

## Contact

If you have any questions or issues, feel free to reach out to the project maintainer at [samtebbet@gmail.com](mailto:samtebbet@gmail.com).

---