# Importar todos los modelos para que SQLAlchemy los registre

from .achievements import Achievement
from .admin import User
from .available_services import AvailableService
from .blog import Blog
from .blog_category import BlogCategory
from .contact_info import ContactInfo
from .experience import Experience
from .frequently_asked_questions import FrequentlyAskedQuestion
from .interests import Interests
from .my_philosophy import MyPhilosophy
from .projects import Projects
from .projects_technologies import ProjectsTechnologies
from .social_networks import SocialNetworks
from .technologies import Technologies


__all__ = [
    "Achievement",
    "User",
    "AvailableService",
    "Blog",
    "BlogCategory",
    "ContactInfo",
    "Experience",
    "FrequentlyAskedQuestion",
    "Interests",
    "MyPhilosophy",
    "Projects",
    "ProjectsTechnologies",
    "SocialNetworks",
    "Technologies",
]