# MVP - Plan Run - Aplikacja do Planowania Treningów Biegowych

## 🎯 Cel MVP

Stworzenie aplikacji webowej umożliwiającej aktywnym biegaczom planowanie treningów biegowych oraz zarządzanie nimi w kalendarzu.

## 👥 Grupa docelowa

- **Główni użytkownicy**: Aktywni biegacze (indywidualni użytkownicy)
- **Poziom zaawansowania**: Od początkujących do zaawansowanych biegaczy
- **Cel użytkowania**: Planowanie i organizacja treningów biegowych

## 🚀 Kluczowe funkcjonalności MVP

### 1. System Autoryzacji

- **Rejestracja/logowanie przez Google OAuth**
- **Profil użytkownika** z podstawowymi informacjami
- **Bezpieczne sesje** użytkownika

### 2. Landing Page

- **Atrakcyjna strona główna** z opisem funkcjonalności
- **Call-to-action** do rejestracji
- **Responsywny design** (mobile-first)

### 3. Kalendarz (SERCE APLIKACJI)

- **Widok kalendarza** z możliwością dodawania treningów, widok miesięczny
- **Drag & drop** treningów między datami
- **Kolorowe oznaczenia** typów treningów

### 4. Zarządzanie Treningami

- **Tworzenie nowych treningów** z parametrami:
  - Nazwa treningu
  - Data i czas
  - Typ treningu (bieg, interwał, regeneracja, etc.)
  - Dystans/czas trwania i tempo
  - Notatki/opis
- **Edycja istniejących treningów**
- **Usuwanie treningów**
- **Szablony treningów** do szybkiego dodawania
- **Liczenie intensywności** w skali tygodnia (trening polaryzacyjny lub piramida)

### 5. Biblioteka Treningów

- **Zapisywanie treningów** jako szablony
- **Katalog popularnych treningów** (dla początkujących)
- **Własne szablony** użytkownika
- **Kategoryzacja** treningów (dystans, czas, tempo)

### 6. Podstawowe Statystyki

- **Przegląd aktywności** (treningi w tygodniu/miesiącu)
- **Progres** - podstawowe metryki
- **Historia treningów**

## 🎨 UI/UX Design

### Technologie UI:

- **Shadcn/ui** - komponenty
- **React** - frontend
- **Tailwind CSS** - stylowanie
- **Responsywny design** - mobile-first approach

### Style i kolorystyka:

- **Czysty, minimalistyczny design**
- **Kolory związane z bieganiem** (zielony, niebieski, pomarańczowy)
- **Intuicyjna nawigacja**
- **Szybkie akcje** (dodawanie treningów w 1-2 kliknięcia)

## 🛠 Stack Technologiczny

### Frontend:

- **React** + TypeScript
- **Vite** - bundler
- **Shadcn/ui** - komponenty
- **Tailwind CSS** - styling

### Backend:

- **Convex** - backend-as-a-service

### Deployment:

- **Vercel** - hosting
- **Convex Cloud** - backend

## 📊 Kryteria Sukcesu

### Metryki:

- **75% aktywnych użytkowników** (zarejestrowani użytkownicy, którzy wrócili w ciągu 7 dni)
- **Minimum 50 zarejestrowanych użytkowników** w pierwszym miesiącu
- **Średni czas sesji** > 5 minut
- **Konwersja** z landing page > 15%

### Funkcjonalne:

- **Stabilna aplikacja** bez krytycznych błędów
- **Szybkie ładowanie** (< 3s)
- **Responsywność** na wszystkich urządzeniach
- **Intuicyjność** - użytkownicy potrafią dodać trening w < 30 sekund

## 🗓 Plan Realizacji

### Faza 1: Podstawy (2-3 tygodnie)

- [ ] Setup projektu (React + Convex)
- [ ] Landing page
- [ ] Google OAuth
- [ ] Podstawowy kalendarz

### Faza 2: Core Features (3-4 tygodnie)

- [ ] Tworzenie/edycja treningów
- [ ] Drag & drop w kalendarzu
- [ ] Biblioteka szablonów
- [ ] Podstawowe statystyki

### Faza 3: Polish & Launch (1-2 tygodnie)

- [ ] UI/UX improvements
- [ ] Testing
- [ ] Deployment
- [ ] Soft launch

## 🔄 Następne Kroki (Post-MVP)

### Funkcjonalności do rozważenia:

- **Integracja z urządzeniami** (Garmin, Strava)
- **Planowanie treningów** (plany tygodniowe/miesięczne)
- **Społeczność** - dzielenie się treningami
- **Analytics** - szczegółowe statystyki
- **Powiadomienia** - przypomnienia o treningach
- **Mobilna aplikacja** (React Native)
- **Integracja z AI** (generowanie treningów)
