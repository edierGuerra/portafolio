from .achievements_endpoint import router as achievements_router
from .auth_endpoint import router as auth_router
from .available_services_endpoint import router as available_services_router
from .blog_categories_endpoint import router as blog_categories_router
from .blog_endpoint import router as blog_router
from .contact_info_endpoint import router as contact_info_router
from .experience_endpoint import router as experience_router
from .file_storage_endpoint import router as file_storage_router
from .faq_endpoint import router as faq_router
from .interests_endpoint import router as interests_router
from .my_philosophy_endpoint import router as my_philosophy_router
from .projects_endpoint import router as projects_router
from .social_networks_endpoint import router as social_networks_router
from .technologies_endpoint import router as technologies_router

__all__ = [
    "achievements_router",
    "auth_router",
    "available_services_router",
    "blog_categories_router",
    "blog_router",
    "contact_info_router",
    "experience_router",
    "file_storage_router",
    "faq_router",
    "interests_router",
    "my_philosophy_router",
    "projects_router",
    "social_networks_router",
    "technologies_router",
]
