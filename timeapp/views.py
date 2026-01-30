from django.shortcuts import render
from datetime import datetime
import pytz
import json

def time_display(request):
    # Τοπική ώρα - Θα αντικατασταθεί από JavaScript
    local_time = datetime.now()
    
    # Greenwich (UTC)
    utc_time = datetime.now(pytz.UTC)
    
    # Default λίστα με χώρες και πόλεις
    cities = [
        {'country': 'Ελλάδα', 'city': 'Αθήνα', 'timezone': 'Europe/Athens'},
        {'country': 'Ηνωμένο Βασίλειο', 'city': 'Λονδίνο', 'timezone': 'Europe/London'},
        {'country': 'ΗΠΑ', 'city': 'Νέα Υόρκη', 'timezone': 'America/New_York'},
        {'country': 'ΗΠΑ', 'city': 'Λος Άντζελες', 'timezone': 'America/Los_Angeles'},
        {'country': 'Γαλλία', 'city': 'Παρίσι', 'timezone': 'Europe/Paris'},
        {'country': 'Γερμανία', 'city': 'Βερολίνο', 'timezone': 'Europe/Berlin'},
        {'country': 'Ιαπωνία', 'city': 'Τόκιο', 'timezone': 'Asia/Tokyo'},
        {'country': 'Αυστραλία', 'city': 'Σίδνεϊ', 'timezone': 'Australia/Sydney'},
        {'country': 'Κίνα', 'city': 'Πεκίνο', 'timezone': 'Asia/Shanghai'},
        {'country': 'Ρωσία', 'city': 'Μόσχα', 'timezone': 'Europe/Moscow'},
    ]
    
    # Προσθήκη της ώρας σε κάθε πόλη
    for city in cities:
        tz = pytz.timezone(city['timezone'])
        city['time'] = datetime.now(tz)
    
    # Δημιουργία λίστας με όλες τις διαθέσιμες timezones
    # Ομαδοποίηση ανά ήπειρο/περιοχή
    all_timezones = {}
    for tz_name in pytz.all_timezones:
        # Παράλειψη deprecated και άχρηστων timezones
        if '/' not in tz_name:
            continue
        if tz_name.startswith('Etc/'):
            continue
            
        # Διαχωρισμός σε περιοχή και πόλη
        parts = tz_name.split('/')
        region = parts[0]
        city_name = parts[-1].replace('_', ' ')
        
        # Ομαδοποίηση ανά περιοχή
        if region not in all_timezones:
            all_timezones[region] = []
        
        all_timezones[region].append({
            'timezone': tz_name,
            'city': city_name,
            'display': f"{region} - {city_name}"
        })
    
    # Ταξινόμηση
    for region in all_timezones:
        all_timezones[region].sort(key=lambda x: x['city'])
    
    context = {
        'local_time': local_time,
        'utc_time': utc_time,
        'cities': cities,
        'all_timezones': json.dumps(all_timezones),
        'regions': sorted(all_timezones.keys()),
    }
    
    return render(request, 'timeapp/index.html', context)
