import django.db.models.deletion
from django.db import migrations, models


def transfer_chef_relations(apps, schema_editor):
    MasterClass = apps.get_model("workshops", "MasterClass")
    Chef = apps.get_model("workshops", "Chef")
    MasterClassChef = apps.get_model("workshops", "MasterClassChef")

    for master_class in MasterClass.objects.all():
        if hasattr(master_class, 'chefs'):
            for chef in master_class.chefs.all():
                MasterClassChef.objects.create(
                    master_class=master_class,
                    chef=chef,
                    role=""
                )


def reverse_transfer_chef_relations(apps, schema_editor):
    MasterClassChef = apps.get_model("workshops", "MasterClassChef")
    MasterClassChef.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('workshops', '0007_rename_cuisine_id_masterclass_cuisine_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='MasterClassChef',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(blank=True, help_text='Например, ведущий, помощник и т.д.', max_length=100, verbose_name='Роль')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата добавления')),
                ('chef', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='workshops.chef', verbose_name='Шеф-повар')),
                ('master_class', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='workshops.masterclass', verbose_name='Мастер-класс')),
            ],
            options={
                'verbose_name': 'Связь Мастер-класс - Шеф-повар',
                'verbose_name_plural': 'Связи Мастер-класс - Шеф-повар',
                'unique_together': {('master_class', 'chef')},
            },
        ),
        migrations.RunPython(transfer_chef_relations, reverse_transfer_chef_relations),
        migrations.RemoveField(
            model_name='masterclass',
            name='chefs',
        ),
        migrations.AddField(
            model_name='masterclass',
            name='chefs',
            field=models.ManyToManyField(
                related_name='master_classes',
                through='workshops.MasterClassChef',
                to='workshops.chef',
                verbose_name='Шеф-повар'
            ),
        ),
    ]