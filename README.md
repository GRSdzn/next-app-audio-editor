# Audio Processor - Аудио Редактор

_Профессиональная обработка аудио с эффектами прямо в браузере_

## Описание / Description

### Русский

**Audio Processor** — это современное веб-приложение для обработки аудиофайлов, построенное на Next.js и использующее мощь FFmpeg для применения различных звуковых эффектов. Приложение работает полностью в браузере, обеспечивая конфиденциальность ваших файлов.

#### Основные возможности:

- **Slowed + Reverb** - замедленная версия с реверберацией
- **Nightcore** - ускоренная версия с повышенным тоном
- **Deep Slowed** - сильно замедленная версия с басом
- **Chipmunk** - высокий голос как у бурундука
- **Deep Voice** - глубокий низкий голос
- **Студийное качество** - максимальное качество без эффектов

#### Особенности:

- Работает полностью в браузере (без загрузки на сервер)
- Современный адаптивный интерфейс с темной/светлой темой
- Поддержка мобильных устройств
- Встроенный аудиоплеер для прослушивания результатов
- Поддержка форматов: MP3, WAV, FLAC, OGG, M4A
- Отображение прогресса обработки в реальном времени
- Быстрая обработка с использованием WebAssembly

### English

**Audio Processor** is a modern web application for audio file processing, built with Next.js and powered by FFmpeg for applying various sound effects. The application runs entirely in the browser, ensuring the privacy of your files.

#### Key Features:

- **Slowed + Reverb** - slowed version with reverberation
- **Nightcore** - accelerated version with higher pitch
- **Deep Slowed** - heavily slowed version with bass boost
- **Chipmunk** - high-pitched chipmunk voice effect
- **Deep Voice** - deep low voice effect
- **Studio Quality** - maximum quality without effects

#### Features:

- Runs entirely in browser (no server upload required)
- Modern responsive interface with dark/light theme
- Mobile device support
- Built-in audio player for result preview
- Supported formats: MP3, WAV, FLAC, OGG, M4A
- Real-time processing progress display
- Fast processing using WebAssembly

## Быстрый старт / Quick Start

### Установка / Installation

```bash
# Клонировать репозиторий / Clone repository
git clone https://github.com/yourusername/next-app-audio-editor.git
cd next-app-audio-editor

# Установить зависимости / Install dependencies
npm install
# или / or
yarn install
# или / or
pnpm install
```

### Запуск / Running

```bash
# Запустить сервер разработки / Start development server
npm run dev
# или / or
yarn dev
# или / or
pnpm dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Технологии / Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Audio Processing**: FFmpeg WebAssembly
- **State Management**: React Hooks, Context API
- **File Handling**: React Dropzone
- **Notifications**: Sonner
- **Icons**: Lucide React

## Использование / Usage

### Русский

1. **Загрузите файл**: Перетащите аудиофайл в область загрузки или нажмите для выбора
2. **Выберите эффект**: Выберите один из предустановленных эффектов
3. **Выберите формат**: MP3 или WAV
4. **Обработайте**: Нажмите кнопку "Обработать"
5. **Прослушайте**: Используйте встроенный плеер для прослушивания
6. **Скачайте**: Скачайте обработанный файл

### English

1. **Upload file**: Drag and drop an audio file or click to select
2. **Choose effect**: Select one of the preset effects
3. **Select format**: MP3 or WAV
4. **Process**: Click the "Process" button
5. **Listen**: Use the built-in player to preview
6. **Download**: Download the processed file

## Сборка / Build

```bash
# Создать production сборку / Create production build
npm run build

# Запустить production сервер / Start production server
npm run start
```

## Лицензия / License

MIT License - см. файл [LICENSE](LICENSE) для деталей.

MIT License - see [LICENSE](LICENSE) file for details.

## Вклад в проект / Contributing

Приветствуются любые предложения и улучшения! Создайте issue или pull request.

Contributions are welcome! Please feel free to submit issues and pull requests.
