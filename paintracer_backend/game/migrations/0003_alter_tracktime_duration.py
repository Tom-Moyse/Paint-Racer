# Generated by Django 5.1 on 2024-10-13 13:59

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0002_rename_checkpoints_track_trackdata'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tracktime',
            name='duration',
            field=models.PositiveIntegerField(),
        ),
    ]
