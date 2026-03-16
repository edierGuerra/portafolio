# Importar todos los modelos para que SQLAlchemy los registre

from .achievements import Achievement
from .admin import User
from .available_services import AvailableService
from .blog import Blog
from .blog_category import BlogCategory
from .blog_image import BlogImage
from .blog_post_tags import BlogPostTags
from .blog_tag import BlogTag
from .contact_info import ContactInfo
from .contact_message import ContactMessage
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
    "BlogImage",
    "BlogPostTags",
    "BlogTag",
    "ContactInfo",
    "ContactMessage",
    "Experience",
    "FrequentlyAskedQuestion",
    "Interests",
    "MyPhilosophy",
    "Projects",
    "ProjectsTechnologies",
    "SocialNetworks",
    "Technologies",
]