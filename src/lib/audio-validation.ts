export interface AudioValidationResult {
  isValid: boolean;
  error?: string;
  duration?: number;
  fileSize: number;
}

export const validateAudioFile = async (
  file: File
): Promise<AudioValidationResult> => {
  // Проверка размера файла
  if (file.size === 0) {
    return {
      isValid: false,
      error: "Файл пустой (0 байт)",
      fileSize: file.size,
    };
  }

  if (file.size < 1024) {
    // Менее 1KB
    return {
      isValid: false,
      error: "Файл слишком маленький (возможно поврежден)",
      fileSize: file.size,
    };
  }

  // Проверка целостности через Audio API
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.removeEventListener("loadedmetadata", onLoad);
      audio.removeEventListener("error", onError);
    };

    const onLoad = () => {
      cleanup();
      if (audio.duration && audio.duration > 0 && isFinite(audio.duration)) {
        resolve({
          isValid: true,
          duration: audio.duration,
          fileSize: file.size,
        });
      } else {
        resolve({
          isValid: false,
          error:
            "Не удалось определить длительность аудио (файл может быть поврежден)",
          fileSize: file.size,
        });
      }
    };

    const onError = () => {
      cleanup();
      resolve({
        isValid: false,
        error: "Файл поврежден или имеет неподдерживаемый формат",
        fileSize: file.size,
      });
    };

    audio.addEventListener("loadedmetadata", onLoad);
    audio.addEventListener("error", onError);

    // Таймаут для предотвращения зависания
    setTimeout(() => {
      cleanup();
      resolve({
        isValid: false,
        error: "Превышено время ожидания загрузки файла",
        fileSize: file.size,
      });
    }, 10000);

    audio.src = url;
  });
};
