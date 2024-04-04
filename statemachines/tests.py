from django.test import TestCase


# Create your tests here.
class TestModals(TestCase):
    def test_login_modal(self):
        response = self.client.get('/login/')
        self.assertEqual(response.status_code, 200)  # test the status code returned
        self.assertTemplateUsed(response, template_name='login.html')  # test the template used

    def test_registration_modal(self):
        response = self.client.get('/register')
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, template_name='register.html')
