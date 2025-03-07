from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import MasterClass, Review


@receiver(post_save, sender=Review)
@receiver(pre_delete, sender=Review)
def update_master_class_rating(sender, instance, **kwargs):
    if instance.master_class:
        instance.master_class.update_rating()
