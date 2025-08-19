import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// Для серверной обработки можно использовать fluent-ffmpeg
// Но для Vercel лучше использовать клиентскую обработку с ffmpeg.wasm

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const effects = JSON.parse(formData.get("effects") as string);
    const outputFormat = formData.get("outputFormat") as string;

    if (!file) {
      return NextResponse.json({ error: "Файл не найден" }, { status: 400 });
    }

    // Создаем временные файлы
    const tempDir = "/tmp";
    const inputId = uuidv4();
    const outputId = uuidv4();
    const inputPath = join(tempDir, `${inputId}.${file.name.split(".").pop()}`);
    const outputPath = join(tempDir, `${outputId}.${outputFormat}`);

    // Сохраняем входной файл
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(inputPath, buffer);

    // Здесь должна быть логика обработки с ffmpeg
    // Для Vercel рекомендуется использовать клиентскую обработку

    // Очищаем временные файлы
    await unlink(inputPath);

    return NextResponse.json({
      message:
        "Для Vercel рекомендуется использовать клиентскую обработку с ffmpeg.wasm",
    });
  } catch (error) {
    console.error("Ошибка при обработке аудио:", error);
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
