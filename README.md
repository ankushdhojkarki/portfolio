# Ankush Dhoj Karki — Personal Portfolio

A personal portfolio website built with Django, showcasing projects, skills, and a rotating quote section. Fully deployed on Vercel with PostgreSQL, Cloudinary, and WhiteNoise.

🌐 **Live Site:** [ankushdhojkarki-portfolio.vercel.app](https://ankushdhojkarki-portfolio.vercel.app)

---

## Features

- **Hero Section** — Introduction with profile image
- **Projects Section** — Dynamically loaded from database with GitHub and live links
- **Skills Section** — Icon grid loaded from database
- **Quote Rotator** — Fetches a random quote from the database every 8 seconds with a smooth fade transition
- **Blog Section** — Teaser section linking to the upcoming *Still Growing* blog
- **Contact Form** — Sends email via Gmail SMTP and saves messages to the database
- **Resume Download** — Downloadable CV served as a static file
- **Django Admin** — Full admin panel to manage projects, skills, quotes, and contact messages
- **Preloader Animation** — Minimalist letter-based preloader on page load

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django 5.2 |
| Database | PostgreSQL (Neon) |
| Media Storage | Cloudinary |
| Static Files | WhiteNoise |
| Hosting | Vercel |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Email | Gmail SMTP |

---

## Project Structure

```
portfolio/
├── core/                   # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── portfolio/              # Main app
│   ├── models.py           # Project, Skill, ContactMessage, Quote
│   ├── views.py            # home, contact, random_quote
│   ├── urls.py
│   └── admin.py
├── static/
│   ├── css/style.css
│   ├── js/script.js
│   ├── images/
│   └── docs/               # Resume PDF
├── staticfiles/            # Collected static files (auto-generated)
├── templates/
│   └── index.html
├── vercel.json
├── requirements.txt
└── manage.py
```

---

## Models

**Project** — title, description, technology, image (Cloudinary), github_link, live_link, in_progress, date_created

**Skill** — name, icon_url, order

**Quote** — text, author, is_active

**ContactMessage** — name, email, message, created_at, is_read

---

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/ankushdhojkarki/portfolio.git
cd portfolio
```

### 2. Create and activate virtual environment
```bash
python -m venv env
# Windows
env\Scripts\activate
# Mac/Linux
source env/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Create a `.env` file in the root directory
```env
SECRET_KEY=your_django_secret_key
DEBUG=True
DATABASE_URL=your_postgresql_connection_string

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

EMAIL_HOST_USER=your_gmail@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password
```

### 5. Run migrations
```bash
python manage.py migrate
```

### 6. Create superuser
```bash
python manage.py createsuperuser
```

### 7. Collect static files
```bash
python manage.py collectstatic
```

### 8. Run the development server
```bash
python manage.py runserver
```

Visit `http://127.0.0.1:8000` for the site and `http://127.0.0.1:8000/admin` for the admin panel.

---

## Deployment (Vercel)

### Environment Variables
Add these in Vercel Dashboard → Settings → Environment Variables:

```
SECRET_KEY
DEBUG=False
DATABASE_URL
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
EMAIL_HOST_USER
EMAIL_HOST_PASSWORD
```

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "core/wsgi.py",
      "use": "@vercel/python",
      "config": { "maxLambdaSize": "15mb", "runtime": "python3.11" }
    }
  ],
  "routes": [
    { "src": "/(.*)", "dest": "core/wsgi.py" }
  ]
}
```

### Deploy
```bash
vercel --prod
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Home page |
| POST | `/contact/` | Submit contact form (JSON) |
| GET | `/api/quote/` | Returns a random active quote as JSON |

---

## Admin Panel

Manage all content at `/admin`:

- **Projects** — Add/edit portfolio projects with images, links, and status
- **Skills** — Add tech stack icons with display order
- **Quotes** — Add rotating quotes with author and active toggle
- **Contact Messages** — View and mark messages as read

---

## Notes

- Media files (project images) are hosted on **Cloudinary**
- Static files (CSS, JS, PDF) are served via **WhiteNoise**
- `staticfiles/` must be committed to git for Vercel to serve static assets
- Gmail SMTP requires an **App Password** (not your regular Gmail password)

---

## Author

**Ankush Dhoj Karki**
Junior Django Developer | Python & Backend Development | System Administration Background

- 🔗 [LinkedIn](https://www.linkedin.com/in/ankush-dhoj-karki-59b0742ab/)
- 🐙 [GitHub](https://github.com/ankushdhojkarki)

---

## License

This project is open source and available under the [MIT License](LICENSE).
