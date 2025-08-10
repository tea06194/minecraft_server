#!/usr/bin/env node
// update_mods_manifest.js
// Поддерживает mods-manifest.json: удаляет отсутствующие и добавляет новые моды в common

const fs = require("fs");
const path = require("path");

// Параметры (можно переопределить через переменные окружения)
const SERVER_ROOT = process.cwd();
const MODS_DIR = process.env.MODS_DIR || path.join(SERVER_ROOT, "mods");
const OUTPUT_FILE =
    process.env.OUTPUT_FILE || path.join(SERVER_ROOT, "mods-manifest.json");

// Определение версий Minecraft и Forge из имени инсталлятора
let MC_VERSION = "unknown";
let FORGE_VERSION = "unknown";
try {
    const installer = fs
        .readdirSync(SERVER_ROOT)
        .find((f) => /^forge-.+-installer\.jar$/.test(f));
    if (installer) {
        const [, ver] = installer.match(/^forge-(.+)-installer\.jar$/);
        const parts = ver.split("-");
        MC_VERSION = parts[0] || MC_VERSION;
        FORGE_VERSION = parts.slice(1).join("-") || FORGE_VERSION;
    }
} catch (e) {
    console.warn("Не удалось определить версии Minecraft/Forge:", e.message);
}

// Чтение существующего манифеста
let existing = { mods: {} };
if (fs.existsSync(OUTPUT_FILE)) {
    try {
        existing = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
        console.log("✔ Загружен существующий манифест");
    } catch (e) {
        console.warn(
            "⚠ Не удалось прочитать существующий манифест, будет создан новый",
        );
    }
}

// Функция для списка .jar в директории
function listJars(dir) {
    try {
        return fs
            .readdirSync(dir)
            .filter((f) => f.toLowerCase().endsWith(".jar"))
            .filter((f) => fs.statSync(path.join(dir, f)).isFile())
            .sort();
    } catch {
        return [];
    }
}

// Получаем текущий список модов в папке
const files = listJars(MODS_DIR);
const filesSet = new Set(files);

// Подготовка нового манифеста
const manifest = {
    minecraft_version: MC_VERSION,
    modloader: process.env.MODLOADER || existing.modloader || "forge",
    forge_version: FORGE_VERSION,
    pack_type: process.env.PACK_TYPE || existing.pack_type || "Custom",
    mods: {},
};

// Удаляем отсутствующие и переносим существующие категории
const allAssigned = new Set();
Object.entries(existing.mods).forEach(([category, entries]) => {
    // Выявляем удалённые в категории
    const deleted = entries.filter((e) => !filesSet.has(e.file));
    deleted.forEach((e) => console.log(`Удалён мод из ${category}: ${e.file}`));

    // Фильтруем только существующие файлы
    const kept = entries.filter((e) => filesSet.has(e.file));
    // Собираем метаданные присвоенных файлов
    kept.forEach((e) => allAssigned.add(e.file));
    manifest.mods[category] = kept;
});

// Добавляем новые файлы в категорию common
const newFiles = files.filter((f) => !allAssigned.has(f));
if (!manifest.mods.common) manifest.mods.common = [];
newFiles.forEach((f) => {
    manifest.mods.common.push({
        file: f,
        added: new Date().toISOString().split("T")[0],
    });
    console.log(`Добавлен новый мод в common: ${f}`);
});

// Запись итогового манифеста
try {
    fs.writeFileSync(
        OUTPUT_FILE,
        JSON.stringify(manifest, null, 2) + "\n",
        "utf-8",
    );
    console.log(`✓ Манифест обновлён: ${OUTPUT_FILE}`);
} catch (e) {
    console.error(`Ошибка записи ${OUTPUT_FILE}:`, e.message);
    process.exit(1);
}
