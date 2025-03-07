from django.db.models.signals import post_save, pre_delete
from django.dispatch import receiver
from .models import Review, Like


@receiver(post_save, sender=Review)
@receiver(pre_delete, sender=Review)
def update_master_class_rating(sender, instance, **kwargs):
    if instance.master_class:
        instance.master_class.update_rating()


@receiver(post_save, sender=Like)
@receiver(pre_delete, sender=Like)
def update_video_likes_count(sender, instance, **kwargs):
    if instance.video:
        instance.video.update_likes_count()
