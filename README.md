# EMMA Backend - ASEAN Emergency Management System

A Laravel-based backend API for the USJR Emergency Management and Mutual Assistance (EMMA) system, designed to support disaster response and emergency management across ASEAN regions.

## Project Overview

This backend service provides comprehensive APIs for:
- User authentication and management (via Laravel Sanctum)
- Family registration and member tracking
- Evacuation center management
- Assistance request handling
- Disaster relief donation management
- Emergency training coordination
- QR code generation for identification

## Requirements

- PHP 8.2 or higher
- Composer
- Node.js and npm
- Laravel 12.x
- MySQL/MariaDB (or configured database)

## Installation

1. Navigate to the Laravel directory:
   ```
   cd laravel
   ```

2. Install PHP dependencies:
   ```
   composer install
   ```

3. Install Node.js dependencies:
   ```
   npm install
   ```

4. Copy environment file:
   ```
   cp .env.example .env
   ```

5. Generate application key:
   ```
   php artisan key:generate
   ```

6. Configure your database in the `.env` file:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=your_database
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

7. Run migrations:
   ```
   php artisan migrate
   ```

8. Seed the database (optional):
   ```
   php artisan db:seed
   ```

## Development Setup

### Running the Application

Start the development server:
```
php artisan serve
```

In another terminal, start the Vite development server for frontend assets:
```
npm run dev
```

### Code Quality & Testing

Run tests using Pest:
```
./vendor/bin/pest
```

Format code with Pint:
```
./vendor/bin/pint
```

### View Application Logs

Use Laravel Pail to stream logs in real-time:
```
php artisan pail
```

## Project Structure

### Core Models

- **User** - System users with authentication, profile fields, and verification status
- **Family** - Household/family group information
- **FamilyMember** - Individual family member records
- **EvacuationCenter** - Registered evacuation facilities
- **AssistanceRequest** - Requests for emergency aid or support
- **Donation** - Disaster relief donations and contribution tracking
- **Training** - Emergency preparedness training programs

### Key Directories

- `app/Models/` - Eloquent ORM models
- `app/Http/Controllers/` - API controllers
- `app/Http/Middleware/` - Middleware for request handling
- `database/migrations/` - Database schema definitions
- `database/seeders/` - Database seed data
- `database/factories/` - Model factories for testing
- `routes/api.php` - API route definitions
- `resources/` - Frontend assets and views
- `tests/` - Feature and unit tests

## Database Schema Highlights

### Key Tables

- `users` - User accounts with authentication and profile details
- `families` - Family groupings for disaster management
- `family_members` - Individual family member records
- `evacuation_centers` - Registered evacuation locations
- `assistance_requests` - Tracked aid requests
- `donations` - Relief donation records
- `trainings` - Emergency training programs
- `personal_access_tokens` - API authentication tokens (Sanctum)

## Key Features

### Authentication

The system uses Laravel Sanctum for API authentication:
- Generate personal access tokens for API clients
- Secure token-based authentication
- User verification status tracking

### QR Code Support

Integration with:
- `endroid/qr-code` - QR code generation
- `khanamiryan/qrcode-detector-decoder` - QR code scanning/decoding

Useful for:
- Family identification
- Evacuation center check-in
- Donation tracking

### Data Integrity

- User consent tracking (data sharing, alerts)
- Location-based services (latitude/longitude)
- Emergency contact information storage
- Special needs documentation

## API Routes

All API routes are defined in `routes/api.php`. The API uses:
- JSON request/response format
- Token-based authentication via Sanctum
- Standard REST conventions

For specific endpoint documentation, refer to controller files in `app/Http/Controllers/`.

## Environment Configuration

Key environment variables in `.env`:

- `APP_NAME` - Application name
- `APP_ENV` - Environment (local, production, etc.)
- `APP_DEBUG` - Debug mode (enable in development only)
- `DB_*` - Database credentials
- `MAIL_*` - Email configuration
- `CACHE_DRIVER` - Cache driver selection
- `SESSION_DRIVER` - Session management

## Development Tools

### Included Tools

- **Laravel Sail** - Docker development environment
- **Laravel Tinker** - Interactive shell for testing code
- **Laravel Pail** - Real-time log monitoring
- **Pest** - Testing framework
- **Pint** - Code style formatter
- **Vite** - Frontend asset bundler
- **Tailwind CSS** - Utility-first CSS framework

### Asset Building

Development:
```
npm run dev
```

Production build:
```
npm run build
```

## Commands Reference

Common Artisan commands:

```
php artisan migrate              # Run database migrations
php artisan db:seed             # Seed the database
php artisan tinker              # Open interactive shell
php artisan pail                # Stream application logs
php artisan sanctum:prune-expired  # Clean expired tokens
./vendor/bin/pest               # Run test suite
./vendor/bin/pint               # Format code with Pint
```

## Deployment

For production deployment:

1. Set `.env` to production mode
2. Set `APP_DEBUG=false`
3. Run migrations: `php artisan migrate --force`
4. Cache configuration: `php artisan config:cache`
5. Cache routes: `php artisan route:cache`
6. Build frontend assets: `npm run build`
7. Use a production-grade web server (Nginx/Apache)
8. Set up proper logging and monitoring

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or contributions, please contact the EMMA project team or refer to project documentation.