from django.contrib.auth.mixins import LoginRequiredMixin, PermissionRequiredMixin
from django.views.generic.base import TemplateView


class VideoStream(LoginRequiredMixin, TemplateView):
    login_url = 'login'
    #template_name = 'videostream.html'
    template_name = 'newvastream.html'


class VAStream(LoginRequiredMixin, TemplateView):
    login_url = 'login'
    #template_name = 'testtmp/vasendserver.html'
    template_name = 'videostream.html'